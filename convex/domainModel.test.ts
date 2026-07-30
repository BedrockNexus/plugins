/// <reference types="vite/client" />

import aggregate from "@convex-dev/aggregate/test";
import shardedCounter from "@convex-dev/sharded-counter/test";
import type { WithoutSystemFields } from "convex/server";
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { api, components, internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import betterAuthSchema from "./betterAuth/schema";
import type { AppRole } from "./lib/authorization";
import { insertProjectAggregates } from "./lib/projectAggregates";
import { assertNormalizedSlug, normalizeSlug } from "./lib/slugs";
import { assertUsername, normalizeUsername } from "./lib/usernames";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
const betterAuthModules = import.meta.glob("./betterAuth/**/*.ts");

type TestClient = ReturnType<typeof convexTest>;

function createTestClient() {
  const t = convexTest(schema, modules);
  t.registerComponent("betterAuth", betterAuthSchema, betterAuthModules);
  aggregate.register(t, "projectsBySoftware");
  aggregate.register(t, "projectsByOwner");
  shardedCounter.register(t, "ownerDownloadCounts");
  return t;
}

async function insertUser(
  t: TestClient,
  label: string,
  role: AppRole = "developer",
  githubUsername?: string,
) {
  const now = Date.now();
  const user = await t.mutation(components.betterAuth.adapter.create, {
    input: {
      model: "user",
      data: {
        name: label,
        email: `${label}@example.com`,
        emailVerified: true,
        role,
        ...(githubUsername ? { githubUsername } : {}),
        createdAt: now,
        updatedAt: now,
      },
    },
  });
  const authUserId = user._id as string;
  const session = await t.mutation(components.betterAuth.adapter.create, {
    input: {
      model: "session",
      data: {
        token: `session-${label}`,
        userId: authUserId,
        expiresAt: now + 60_000,
        createdAt: now,
        updatedAt: now,
      },
    },
  });
  const tokenIdentifier = `https://convex.test|${authUserId}`;

  return {
    authUserId,
    client: t.withIdentity({
      subject: authUserId,
      sessionId: session._id as string,
      tokenIdentifier,
    }),
  };
}

async function insertProjectFoundation(t: TestClient, ownerUserId: string) {
  return await t.run(async (ctx) => {
    const now = Date.now();
    const installationId = await ctx.db.insert("githubInstallations", {
      installationId: 1234,
      accountId: 5678,
      accountLogin: "bedrocknexus",
      accountType: "Organization",
      ownerType: "user",
      ownerId: ownerUserId,
      connectedBy: ownerUserId,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
    const repositoryId = await ctx.db.insert("repositories", {
      installationId,
      githubRepositoryId: 9876,
      ownerLogin: "BedrockNexus",
      name: "plugins",
      fullName: "BedrockNexus/plugins",
      htmlUrl: "https://github.com/BedrockNexus/plugins",
      defaultBranch: "main",
      isPrivate: false,
      isArchived: false,
      accessStatus: "granted",
      createdAt: now,
      updatedAt: now,
    });
    const softwareId = await ctx.db.insert("serverSoftware", {
      slug: "powernukkitx",
      name: "PowerNukkitX",
      description: "Test software",
      adapterId: "powernukkitx",
      websiteUrl: "https://powernukkitx.org/",
      enabled: true,
      sortOrder: 20,
      createdAt: now,
      updatedAt: now,
    });

    return { repositoryId, softwareId };
  });
}

async function insertProject(
  t: TestClient,
  foundation: Awaited<ReturnType<typeof insertProjectFoundation>>,
  options: {
    slug: string;
    ownerType: "user" | "organization";
    ownerId: string;
    createdBy: string;
    visibility: Doc<"projects">["visibility"];
    status: Doc<"projects">["status"];
  },
) {
  return await t.run(async (ctx) => {
    const now = Date.now();
    const projectId = await ctx.db.insert("projects", {
      ...options,
      repositoryId: foundation.repositoryId,
      softwareId: foundation.softwareId,
      name: options.slug,
      summary: "A representative project.",
      searchText: `${options.slug} representative project`,
      downloadCount: 0,
      ratingAverage: 0,
      ratingCount: 0,
      createdAt: now,
      updatedAt: now,
    });
    const project = await ctx.db.get("projects", projectId);
    if (!project) throw new Error("Project fixture was not readable after insertion.");
    await insertProjectAggregates(ctx, project);
    return projectId;
  });
}

describe("canonical slugs", () => {
  it("normalizes user-facing names and rejects non-canonical stored values", () => {
    expect(normalizeSlug("  PocketMine MP++  ")).toBe("pocketmine-mp");
    expect(normalizeSlug("Crème Brûlée")).toBe("creme-brulee");
    expect(assertNormalizedSlug("powernukkitx")).toBe("powernukkitx");
    expect(() => assertNormalizedSlug("PowerNukkitX")).toThrow("Slugs must be normalized");
    expect(normalizeUsername(" Jean_TKG ")).toBe("jean-tkg");
    expect(assertUsername("jeantkg")).toBe("jeantkg");
    expect(() => assertUsername("-jeantkg")).toThrow("Usernames must be");
  });
});

describe("creator profile settings", () => {
  it("updates only the authenticated creator's public profile fields", async () => {
    const t = createTestClient();
    const creator = await insertUser(t, "profile-creator");

    await creator.client.mutation(api.functions.site.users.syncCurrentUser, {});
    await expect(
      Promise.all([
        creator.client.mutation(api.functions.site.users.syncCurrentUser, {}),
        creator.client.mutation(api.functions.site.users.syncCurrentUser, {}),
      ]),
    ).resolves.toHaveLength(2);

    await expect(
      creator.client.mutation(api.functions.site.users.updateMyCreatorProfile, {
        username: "profile-creator",
        bio: "Builds publishing tools.",
        websiteUrl: "https://example.com/plugins",
      }),
    ).resolves.toMatchObject({
      displayName: "profile-creator",
      bio: "Builds publishing tools.",
      websiteUrl: "https://example.com/plugins",
    });

    await expect(
      creator.client.query(api.functions.site.users.getMyCreatorProfile, {}),
    ).resolves.toMatchObject({
      bio: "Builds publishing tools.",
      websiteUrl: "https://example.com/plugins",
    });

    await expect(
      creator.client.mutation(api.functions.site.users.updateMyCreatorProfile, {
        username: "profile-creator",
        websiteUrl: "ftp://example.com/plugins",
      }),
    ).rejects.toThrow("Website URLs must use HTTP or HTTPS");
  });

  it("seeds usernames from GitHub and preserves aliases after a rename", async () => {
    const t = createTestClient();
    const creator = await insertUser(t, "Jean Claude", "developer", "jeantkg");
    const otherCreator = await insertUser(t, "Other Creator", "developer", "other-creator");

    await expect(
      creator.client.mutation(api.functions.site.users.syncCurrentUser, {}),
    ).resolves.toMatchObject({
      creatorProfile: {
        username: "jeantkg",
        githubUsername: "jeantkg",
        slug: "jeantkg",
        displayName: "Jean Claude",
      },
    });
    await otherCreator.client.mutation(api.functions.site.users.syncCurrentUser, {});

    await expect(
      creator.client.mutation(api.functions.site.users.updateMyCreatorProfile, {
        username: "nexus-jean",
      }),
    ).resolves.toMatchObject({
      username: "nexus-jean",
      githubUsername: "jeantkg",
      slug: "nexus-jean",
    });

    await expect(
      t.query(api.functions.site.catalog.getCreator, { slug: "jeantkg" }),
    ).resolves.toMatchObject({
      creator: {
        username: "nexus-jean",
        githubUsername: "jeantkg",
      },
    });

    await expect(
      otherCreator.client.mutation(api.functions.site.users.updateMyCreatorProfile, {
        username: "jeantkg",
      }),
    ).rejects.toThrow("already in use");
  });

  it("migrates an automatic legacy handle when GitHub metadata first arrives", async () => {
    const t = createTestClient();
    const creator = await insertUser(t, "Jean Claude");

    await expect(
      creator.client.mutation(api.functions.site.users.syncCurrentUser, {}),
    ).resolves.toMatchObject({
      creatorProfile: {
        username: "jean-claude",
      },
    });

    await t.mutation(components.betterAuth.adapter.updateOne, {
      input: {
        model: "user",
        where: [{ field: "_id", value: creator.authUserId }],
        update: {
          githubUsername: "jeantkg",
          updatedAt: Date.now(),
        },
      },
    });

    await expect(
      creator.client.mutation(api.functions.site.users.syncCurrentUser, {}),
    ).resolves.toMatchObject({
      creatorProfile: {
        username: "jeantkg",
        githubUsername: "jeantkg",
      },
    });
    await expect(
      t.query(api.functions.site.catalog.getCreator, { slug: "jean-claude" }),
    ).resolves.toMatchObject({
      creator: {
        username: "jeantkg",
      },
    });
  });
});

describe("server software seeds", () => {
  it("creates PMMP and PowerNukkitX exactly once", async () => {
    const t = createTestClient();

    await t.mutation(internal.functions.site.serverSoftware.seedDefaults, {});
    await t.mutation(internal.functions.site.serverSoftware.seedDefaults, {});

    const software = await t.run(async (ctx) =>
      ctx.db.query("serverSoftware").withIndex("by_slug").take(10),
    );

    expect(software.map((record) => record.slug)).toEqual(["pocketmine-mp", "powernukkitx"]);
  });
});

describe("project ownership and visibility", () => {
  it("allows owners to manage drafts while rejecting unrelated users", async () => {
    const t = createTestClient();
    const owner = await insertUser(t, "owner");
    const outsider = await insertUser(t, "outsider");
    const foundation = await insertProjectFoundation(t, owner.authUserId);
    const projectId = await insertProject(t, foundation, {
      slug: "private-draft",
      ownerType: "user",
      ownerId: owner.authUserId,
      createdBy: owner.authUserId,
      visibility: "draft",
      status: "draft",
    });

    await expect(
      owner.client.query(api.functions.projects.projects.getManagementAccess, { projectId }),
    ).resolves.toEqual({ authorized: true, kind: "owner" });
    await expect(
      outsider.client.query(api.functions.projects.projects.getManagementAccess, { projectId }),
    ).rejects.toThrow("Project owner or organization manager access is required");
    await expect(
      t.query(api.functions.projects.projects.getBySlug, { slug: "private-draft" }),
    ).resolves.toBeNull();
    await expect(
      owner.client.query(api.functions.projects.projects.getBySlug, { slug: "private-draft" }),
    ).resolves.toMatchObject({ _id: projectId });
  });

  it("shows published projects publicly and restricts moderated projects to staff", async () => {
    const t = createTestClient();
    const owner = await insertUser(t, "owner");
    const moderator = await insertUser(t, "moderator", "moderator");
    const foundation = await insertProjectFoundation(t, owner.authUserId);
    const publicProjectId = await insertProject(t, foundation, {
      slug: "public-project",
      ownerType: "user",
      ownerId: owner.authUserId,
      createdBy: owner.authUserId,
      visibility: "public",
      status: "published",
    });
    const hiddenProjectId = await insertProject(t, foundation, {
      slug: "hidden-project",
      ownerType: "user",
      ownerId: owner.authUserId,
      createdBy: owner.authUserId,
      visibility: "hidden",
      status: "published",
    });

    await expect(
      t.query(api.functions.projects.projects.getBySlug, { slug: "public-project" }),
    ).resolves.toMatchObject({ _id: publicProjectId });
    await expect(
      owner.client.query(api.functions.projects.projects.getBySlug, { slug: "hidden-project" }),
    ).resolves.toBeNull();
    await expect(
      moderator.client.query(api.functions.projects.projects.getBySlug, {
        slug: "hidden-project",
      }),
    ).resolves.toMatchObject({ _id: hiddenProjectId });
  });
});

describe("organization membership", () => {
  it("separates active membership from organization management", async () => {
    const t = createTestClient();
    const owner = await insertUser(t, "owner");
    const member = await insertUser(t, "member");
    const manager = await insertUser(t, "manager");
    const removed = await insertUser(t, "removed");
    const foundation = await insertProjectFoundation(t, owner.authUserId);

    const now = Date.now();
    const organization = await t.mutation(components.betterAuth.adapter.create, {
      input: {
        model: "organization",
        data: {
          name: "BedrockNexus Labs",
          slug: "bedrocknexus-labs",
          createdAt: now,
        },
      },
    });
    const organizationId = organization._id as string;
    for (const [authUserId, role] of [
      [owner.authUserId, "owner"],
      [member.authUserId, "member"],
      [manager.authUserId, "admin"],
    ] as const) {
      await t.mutation(components.betterAuth.adapter.create, {
        input: {
          model: "member",
          data: { organizationId, userId: authUserId, role, createdAt: now },
        },
      });
    }

    const projectId = await insertProject(t, foundation, {
      slug: "organization-draft",
      ownerType: "organization",
      ownerId: organizationId,
      createdBy: owner.authUserId,
      visibility: "draft",
      status: "draft",
    });

    await expect(
      member.client.query(api.functions.site.organizations.getMembershipAccess, {
        organizationId,
      }),
    ).resolves.toMatchObject({ role: "member", status: "active" });
    await expect(
      member.client.query(api.functions.projects.projects.getBySlug, {
        slug: "organization-draft",
      }),
    ).resolves.toMatchObject({ _id: projectId });
    await expect(
      member.client.query(api.functions.projects.projects.getManagementAccess, { projectId }),
    ).rejects.toThrow("Organization owner or admin access is required");
    await expect(
      manager.client.query(api.functions.projects.projects.getManagementAccess, { projectId }),
    ).resolves.toEqual({ authorized: true, kind: "organization" });
    await expect(
      removed.client.query(api.functions.site.organizations.getMembershipAccess, {
        organizationId,
      }),
    ).rejects.toThrow("Active organization membership is required");
    await expect(
      removed.client.query(api.functions.projects.projects.getBySlug, {
        slug: "organization-draft",
      }),
    ).resolves.toBeNull();
    await expect(
      manager.client.query(api.functions.projects.projects.listMine, {}),
    ).resolves.toEqual([
      expect.objectContaining({
        projectId,
        slug: "organization-draft",
        owner: {
          kind: "organization",
          name: "BedrockNexus Labs",
          slug: "bedrocknexus-labs",
        },
      }),
    ]);
    await expect(
      member.client.query(api.functions.site.organizations.listMine, {}),
    ).resolves.toEqual([
      expect.objectContaining({
        organizationId,
        slug: "bedrocknexus-labs",
        role: "member",
        memberCount: 3,
        projectCount: 1,
        totalDownloads: 0,
      }),
    ]);
    await expect(
      owner.client.query(api.functions.site.organizations.getMineBySlug, {
        slug: "bedrocknexus-labs",
      }),
    ).resolves.toMatchObject({
      organization: {
        organizationId,
        role: "owner",
        memberCount: 3,
        projectCount: 1,
        totalDownloads: 0,
      },
      projects: [{ projectId, slug: "organization-draft" }],
    });
    await expect(
      removed.client.query(api.functions.site.organizations.listMine, {}),
    ).resolves.toEqual([]);
  });
});

describe("polymorphic domain records", () => {
  it("requires exactly one typed target for support links and moderation reports", async () => {
    const t = createTestClient();
    const owner = await insertUser(t, "polymorphic-owner");
    const foundation = await insertProjectFoundation(t, owner.authUserId);
    const projectId = await insertProject(t, foundation, {
      slug: "polymorphic-project",
      ownerType: "user",
      ownerId: owner.authUserId,
      createdBy: owner.authUserId,
      visibility: "public",
      status: "published",
    });
    const creatorProfileId = await t.run(async (ctx) => {
      const now = Date.now();
      return await ctx.db.insert("creatorProfiles", {
        userId: owner.authUserId,
        slug: "polymorphic-owner",
        displayName: "Polymorphic Owner",
        createdAt: now,
        updatedAt: now,
      });
    });

    await expect(
      t.run(async (ctx) => {
        const now = Date.now();
        return await ctx.db.insert("supportLinks", {
          targetType: "creator",
          creatorProfileId,
          type: "documentation",
          label: "Documentation",
          url: "https://example.com/docs",
          sortOrder: 10,
          status: "active",
          createdAt: now,
          updatedAt: now,
        });
      }),
    ).resolves.toEqual(expect.any(String));
    await expect(
      t.run(async (ctx) => {
        const now = Date.now();
        return await ctx.db.insert("moderationReports", {
          reporterUserId: owner.authUserId,
          targetType: "project",
          projectId,
          reason: "spam",
          details: "Representative report.",
          priority: "normal",
          status: "open",
          createdAt: now,
          updatedAt: now,
        });
      }),
    ).resolves.toEqual(expect.any(String));

    const invalidSupportLink = {
      targetType: "creator",
      creatorProfileId,
      projectId,
      type: "website",
      label: "Invalid mixed target",
      url: "https://example.com",
      sortOrder: 20,
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as unknown as WithoutSystemFields<Doc<"supportLinks">>;
    const invalidReport = {
      targetType: "review",
      projectId,
      reason: "spam",
      details: "Invalid mixed target.",
      priority: "normal",
      status: "open",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as unknown as WithoutSystemFields<Doc<"moderationReports">>;

    await expect(
      t.run(async (ctx) => await ctx.db.insert("supportLinks", invalidSupportLink)),
    ).rejects.toThrow();
    await expect(
      t.run(async (ctx) => await ctx.db.insert("moderationReports", invalidReport)),
    ).rejects.toThrow();
  });
});
