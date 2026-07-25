/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { api, internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { assertNormalizedSlug, normalizeSlug } from "./lib/slugs";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

type TestClient = ReturnType<typeof convexTest>;

async function insertUser(t: TestClient, label: string, role: Doc<"users">["role"] = "developer") {
  const tokenIdentifier = `https://convex.test|${label}`;
  const userId = await t.run(async (ctx) => {
    const now = Date.now();
    return await ctx.db.insert("users", {
      authUserId: `auth-${label}`,
      authTokenIdentifier: tokenIdentifier,
      name: label,
      email: `${label}@example.com`,
      role,
      createdAt: now,
      updatedAt: now,
    });
  });

  return {
    userId,
    client: t.withIdentity({ tokenIdentifier }),
  };
}

async function insertProjectFoundation(t: TestClient, ownerUserId: Id<"users">) {
  return await t.run(async (ctx) => {
    const now = Date.now();
    const installationId = await ctx.db.insert("githubInstallations", {
      installationId: 1234,
      accountId: 5678,
      accountLogin: "bedrocknexus",
      accountType: "Organization",
      ownerUserId,
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
    ownerUserId?: Id<"users">;
    ownerOrganizationId?: Id<"organizations">;
    visibility: Doc<"projects">["visibility"];
    status: Doc<"projects">["status"];
  },
) {
  return await t.run(async (ctx) => {
    const now = Date.now();
    return await ctx.db.insert("projects", {
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
  });
}

describe("canonical slugs", () => {
  it("normalizes user-facing names and rejects non-canonical stored values", () => {
    expect(normalizeSlug("  PocketMine MP++  ")).toBe("pocketmine-mp");
    expect(normalizeSlug("Crème Brûlée")).toBe("creme-brulee");
    expect(assertNormalizedSlug("powernukkitx")).toBe("powernukkitx");
    expect(() => assertNormalizedSlug("PowerNukkitX")).toThrow("Slugs must be normalized");
  });
});

describe("server software seeds", () => {
  it("creates PMMP and PowerNukkitX exactly once", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(internal.serverSoftware.seedDefaults, {});
    await t.mutation(internal.serverSoftware.seedDefaults, {});

    const software = await t.run(async (ctx) =>
      ctx.db.query("serverSoftware").withIndex("by_slug").take(10),
    );

    expect(software.map((record) => record.slug)).toEqual(["pocketmine-mp", "powernukkitx"]);
  });
});

describe("project ownership and visibility", () => {
  it("allows owners to manage drafts while rejecting unrelated users", async () => {
    const t = convexTest(schema, modules);
    const owner = await insertUser(t, "owner");
    const outsider = await insertUser(t, "outsider");
    const foundation = await insertProjectFoundation(t, owner.userId);
    const projectId = await insertProject(t, foundation, {
      slug: "private-draft",
      ownerUserId: owner.userId,
      visibility: "draft",
      status: "draft",
    });

    await expect(
      owner.client.query(api.projects.getManagementAccess, { projectId }),
    ).resolves.toEqual({ authorized: true, kind: "owner" });
    await expect(
      outsider.client.query(api.projects.getManagementAccess, { projectId }),
    ).rejects.toThrow("Project owner or organization manager access is required");
    await expect(t.query(api.projects.getBySlug, { slug: "private-draft" })).resolves.toBeNull();
    await expect(
      owner.client.query(api.projects.getBySlug, { slug: "private-draft" }),
    ).resolves.toMatchObject({ _id: projectId });
  });

  it("shows published projects publicly and restricts moderated projects to staff", async () => {
    const t = convexTest(schema, modules);
    const owner = await insertUser(t, "owner");
    const moderator = await insertUser(t, "moderator", "moderator");
    const foundation = await insertProjectFoundation(t, owner.userId);
    const publicProjectId = await insertProject(t, foundation, {
      slug: "public-project",
      ownerUserId: owner.userId,
      visibility: "public",
      status: "published",
    });
    const hiddenProjectId = await insertProject(t, foundation, {
      slug: "hidden-project",
      ownerUserId: owner.userId,
      visibility: "hidden",
      status: "published",
    });

    await expect(
      t.query(api.projects.getBySlug, { slug: "public-project" }),
    ).resolves.toMatchObject({ _id: publicProjectId });
    await expect(
      owner.client.query(api.projects.getBySlug, { slug: "hidden-project" }),
    ).resolves.toBeNull();
    await expect(
      moderator.client.query(api.projects.getBySlug, {
        slug: "hidden-project",
      }),
    ).resolves.toMatchObject({ _id: hiddenProjectId });
  });
});

describe("organization membership", () => {
  it("separates active membership from organization management", async () => {
    const t = convexTest(schema, modules);
    const owner = await insertUser(t, "owner");
    const member = await insertUser(t, "member");
    const manager = await insertUser(t, "manager");
    const removed = await insertUser(t, "removed");
    const foundation = await insertProjectFoundation(t, owner.userId);

    const organizationId = await t.run(async (ctx) => {
      const now = Date.now();
      const id = await ctx.db.insert("organizations", {
        ownerUserId: owner.userId,
        slug: "bedrocknexus-labs",
        name: "BedrockNexus Labs",
        status: "active",
        createdAt: now,
        updatedAt: now,
      });

      await Promise.all([
        ctx.db.insert("organizationMembers", {
          organizationId: id,
          userId: owner.userId,
          role: "owner",
          status: "active",
          createdAt: now,
          updatedAt: now,
        }),
        ctx.db.insert("organizationMembers", {
          organizationId: id,
          userId: member.userId,
          role: "member",
          status: "active",
          createdAt: now,
          updatedAt: now,
        }),
        ctx.db.insert("organizationMembers", {
          organizationId: id,
          userId: manager.userId,
          role: "admin",
          status: "active",
          createdAt: now,
          updatedAt: now,
        }),
        ctx.db.insert("organizationMembers", {
          organizationId: id,
          userId: removed.userId,
          role: "admin",
          status: "removed",
          createdAt: now,
          updatedAt: now,
        }),
      ]);

      return id;
    });

    const projectId = await insertProject(t, foundation, {
      slug: "organization-draft",
      ownerOrganizationId: organizationId,
      visibility: "draft",
      status: "draft",
    });

    await expect(
      member.client.query(api.organizations.getMembershipAccess, {
        organizationId,
      }),
    ).resolves.toMatchObject({ role: "member", status: "active" });
    await expect(
      member.client.query(api.projects.getBySlug, {
        slug: "organization-draft",
      }),
    ).resolves.toMatchObject({ _id: projectId });
    await expect(
      member.client.query(api.projects.getManagementAccess, { projectId }),
    ).rejects.toThrow("Organization owner or admin access is required");
    await expect(
      manager.client.query(api.projects.getManagementAccess, { projectId }),
    ).resolves.toEqual({ authorized: true, kind: "organization" });
    await expect(
      removed.client.query(api.organizations.getMembershipAccess, {
        organizationId,
      }),
    ).rejects.toThrow("Active organization membership is required");
    await expect(
      removed.client.query(api.projects.getBySlug, {
        slug: "organization-draft",
      }),
    ).resolves.toBeNull();
  });
});
