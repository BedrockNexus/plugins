/// <reference types="vite/client" />

import aggregate from "@convex-dev/aggregate/test";
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { api, components, internal } from "./_generated/api";
import betterAuthSchema from "./betterAuth/schema";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
const betterAuthModules = import.meta.glob("./betterAuth/**/*.ts");

type TestClient = ReturnType<typeof convexTest>;

function createTest() {
  const t = convexTest(schema, modules);
  t.registerComponent("betterAuth", betterAuthSchema, betterAuthModules);
  aggregate.register(t, "projectsBySoftware");
  aggregate.register(t, "projectsByOwner");
  return t;
}

async function insertUser(t: TestClient, label: string, role: "developer" | "moderator") {
  const now = Date.now();
  const user = await t.mutation(components.betterAuth.adapter.create, {
    input: {
      model: "user",
      data: {
        name: label,
        email: `${label}@example.com`,
        emailVerified: true,
        role,
        createdAt: now,
        updatedAt: now,
      },
    },
  });
  const userId = user._id as string;
  const session = await t.mutation(components.betterAuth.adapter.create, {
    input: {
      model: "session",
      data: {
        token: `session-${label}`,
        userId,
        expiresAt: now + 60_000,
        createdAt: now,
        updatedAt: now,
      },
    },
  });
  return { userId, sessionId: session._id as string };
}

async function createPublishingFoundation(
  t: TestClient,
  adapterId: "pocketmine-mp" | "powernukkitx",
) {
  const user = await insertUser(t, adapterId, "developer");
  const moderatorUser = await insertUser(t, `${adapterId}-moderator`, "moderator");
  const authUserId = user.userId;
  const moderatorUserId = moderatorUser.userId;
  const tokenIdentifier = `https://convex.test|${authUserId}`;
  const created = await t.run(async (ctx) => {
    const now = Date.now();
    const installationDocumentId = await ctx.db.insert("githubInstallations", {
      installationId: adapterId === "pocketmine-mp" ? 4001 : 4002,
      accountId: 41,
      accountLogin: "BedrockNexus",
      accountType: "Organization",
      ownerType: "user",
      ownerId: authUserId,
      connectedBy: authUserId,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
    const repositoryId = await ctx.db.insert("repositories", {
      installationId: installationDocumentId,
      githubRepositoryId: adapterId === "pocketmine-mp" ? 5001 : 5002,
      ownerLogin: "BedrockNexus",
      name: `${adapterId}-fixture`,
      fullName: `BedrockNexus/${adapterId}-fixture`,
      htmlUrl: `https://github.com/BedrockNexus/${adapterId}-fixture`,
      defaultBranch: "main",
      isPrivate: false,
      isArchived: false,
      accessStatus: "granted",
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("serverSoftware", {
      slug: adapterId,
      name: adapterId,
      description: "Publishing fixture software",
      adapterId,
      websiteUrl: "https://example.com",
      enabled: true,
      sortOrder: 1,
      createdAt: now,
      updatedAt: now,
    });
    return { repositoryId };
  });

  const draftId = await t.mutation(internal.functions.projects.publishing.model.upsertAnalysis, {
    tokenIdentifier,
    analysis: {
      repositoryId: created.repositoryId,
      adapterId,
      detectionScore: 96,
      detectionSummary: "Fixture matched with high confidence.",
      name: `${adapterId} Fixture`,
      slug: `${adapterId}-fixture`,
      summary: "A complete publishing workflow fixture.",
      license: "MIT",
    },
  });
  const client = t.withIdentity({
    subject: authUserId,
    sessionId: user.sessionId,
    tokenIdentifier,
  });
  await client.mutation(api.functions.projects.publishing.model.saveMetadata, {
    draftId,
    name: `${adapterId} Fixture`,
    slug: `${adapterId}-fixture`,
    summary: "A complete publishing workflow fixture.",
    adapterId,
    projectType: "plugin",
  });
  await client.mutation(api.functions.projects.publishing.model.selectWorkflow, {
    draftId,
    key: adapterId === "pocketmine-mp" ? "pocketmine-mp:composer" : "powernukkitx:gradle",
  });
  await t.mutation(internal.functions.projects.publishing.model.recordWorkflowCommit, {
    tokenIdentifier,
    draftId,
    branch: "main",
    commitSha: "workflow-commit",
    templateKey: adapterId === "pocketmine-mp" ? "pocketmine-mp:composer" : "powernukkitx:gradle",
    templateVersion: 1,
  });
  const moderator = t.withIdentity({
    subject: moderatorUserId,
    sessionId: moderatorUser.sessionId,
    tokenIdentifier: `https://convex.test|${moderatorUserId}`,
  });
  return { client, moderator, draftId, tokenIdentifier };
}

describe.each([
  ["pocketmine-mp", "fixture.phar"],
  ["powernukkitx", "fixture.jar"],
] as const)("publishing workflow for %s", (adapterId, assetName) => {
  it("correlates a successful tag run and publishes only after moderator approval", async () => {
    const t = createTest();
    const foundation = await createPublishingFoundation(t, adapterId);
    const now = Date.now();

    await t.mutation(internal.functions.projects.publishing.model.recordGitHubState, {
      tokenIdentifier: foundation.tokenIdentifier,
      draftId: foundation.draftId,
      pullRequestState: "merged",
      workflowInstalled: true,
      run: {
        id: adapterId === "pocketmine-mp" ? 6001 : 6002,
        url: "https://github.com/BedrockNexus/fixture/actions/runs/6001",
        status: "completed",
        conclusion: "success",
        commitSha: "matching-commit",
        tag: "v1.0.0",
        createdAt: now,
        completedAt: now,
      },
      release: {
        id: adapterId === "pocketmine-mp" ? 7001 : 7002,
        url: "https://github.com/BedrockNexus/fixture/releases/tag/v1.0.0",
        tag: "v1.0.0",
        commitSha: "matching-commit",
        version: "1.0.0",
        publishedAt: now,
        asset: {
          id: adapterId === "pocketmine-mp" ? 8001 : 8002,
          name: assetName,
          url: `https://github.com/BedrockNexus/fixture/releases/download/v1.0.0/${assetName}`,
          size: 1024,
        },
      },
    });

    const projectId = await foundation.client.mutation(
      api.functions.projects.publishing.model.submitForReview,
      { draftId: foundation.draftId },
    );
    const pending = await t.run(async (ctx) => ({
      draft: await ctx.db.get("publishingDrafts", foundation.draftId),
      project: await ctx.db.get("projects", projectId),
    }));
    expect(pending.draft?.status).toBe("inReview");
    expect(pending.project).toMatchObject({ visibility: "draft", status: "review" });
    await expect(
      foundation.client.mutation(api.functions.projects.publishing.model.approveReview, {
        draftId: foundation.draftId,
      }),
    ).rejects.toThrow("moderator access is required");

    await foundation.moderator.mutation(api.functions.projects.publishing.model.approveReview, {
      draftId: foundation.draftId,
      note: "Metadata, workflow, commit, and release asset verified.",
    });
    const stored = await t.run(async (ctx) => {
      const draft = await ctx.db.get("publishingDrafts", foundation.draftId);
      const project = await ctx.db.get("projects", projectId);
      const releases = await ctx.db
        .query("releases")
        .withIndex("by_project_id", (query) => query.eq("projectId", projectId))
        .take(2);
      return { draft, project, release: releases[0] };
    });

    expect(stored.draft).toMatchObject({
      verifiedBuild: true,
      status: "published",
      latestTag: "v1.0.0",
      latestReleaseCommitSha: "matching-commit",
      primaryAssetName: assetName,
    });
    expect(stored.project).toMatchObject({
      license: "MIT",
      visibility: "public",
      status: "published",
    });
    expect(stored.release).toMatchObject({ verifiedBuild: true, status: "published" });
    const actions = await t.run(async (ctx) =>
      ctx.db
        .query("adminActions")
        .withIndex("by_target_key_and_created_at", (query) =>
          query.eq("targetKey", foundation.draftId),
        )
        .collect(),
    );
    expect(actions).toHaveLength(1);
    expect(actions[0]).toMatchObject({
      action: "publishing.approve",
      previousState: "inReview",
      resultingState: "published",
    });
  });
});

describe("publishing verification boundaries", () => {
  it("requires the owner to choose a workflow compatible with the detected project", async () => {
    const t = createTest();
    const foundation = await createPublishingFoundation(t, "pocketmine-mp");

    await expect(
      foundation.client.mutation(api.functions.projects.publishing.model.selectWorkflow, {
        draftId: foundation.draftId,
        key: "powernukkitx:gradle",
      }),
    ).rejects.toThrow("not available for this project");

    const project = await foundation.client.query(api.functions.projects.publishing.model.getMine, {
      draftId: foundation.draftId,
    });
    expect(project.draft.workflowTemplateKey).toBe("pocketmine-mp:composer");
  });

  it("lets an owner choose a verified release and resubmit after requested changes", async () => {
    const t = createTest();
    const foundation = await createPublishingFoundation(t, "pocketmine-mp");
    const now = Date.now();

    for (const [version, releaseId, runId, assetId] of [
      ["1.0.0", 7301, 6301, 8301],
      ["2.0.0", 7302, 6302, 8302],
    ] as const) {
      await t.mutation(internal.functions.projects.publishing.model.recordGitHubState, {
        tokenIdentifier: foundation.tokenIdentifier,
        draftId: foundation.draftId,
        pullRequestState: "merged",
        workflowInstalled: true,
        run: {
          id: runId,
          url: `https://github.com/BedrockNexus/fixture/actions/runs/${runId}`,
          status: "completed",
          conclusion: "success",
          commitSha: `commit-${version}`,
          tag: `v${version}`,
          createdAt: now,
          completedAt: now,
        },
        release: {
          id: releaseId,
          url: `https://github.com/BedrockNexus/fixture/releases/tag/v${version}`,
          tag: `v${version}`,
          commitSha: `commit-${version}`,
          version,
          asset: {
            id: assetId,
            name: `fixture-${version}.phar`,
            url: `https://github.com/BedrockNexus/fixture/releases/download/v${version}/fixture.phar`,
            size: 1024,
          },
        },
      });
    }

    const releases = await foundation.client.query(
      api.functions.projects.publishing.model.listDetectedReleases,
      { draftId: foundation.draftId },
    );
    expect(releases).toHaveLength(2);
    const firstRelease = releases.find((release) => release.tagName === "v1.0.0");
    if (!firstRelease) {
      throw new Error("Expected the first verified release.");
    }
    await foundation.client.mutation(
      api.functions.projects.publishing.model.selectDetectedRelease,
      {
        draftId: foundation.draftId,
        releaseId: firstRelease.releaseId,
      },
    );
    await foundation.client.mutation(api.functions.projects.publishing.model.submitForReview, {
      draftId: foundation.draftId,
    });
    await foundation.moderator.mutation(
      api.functions.projects.publishing.model.requestReviewChanges,
      {
        draftId: foundation.draftId,
        reason: "Clarify the compatibility range.",
      },
    );

    const changedDraft = await t.run((ctx) => ctx.db.get("publishingDrafts", foundation.draftId));
    expect(changedDraft).toMatchObject({
      status: "changesRequested",
      reviewNotes: "Clarify the compatibility range.",
    });

    const secondRelease = releases.find((release) => release.tagName === "v2.0.0");
    if (!secondRelease) {
      throw new Error("Expected the second verified release.");
    }
    await foundation.client.mutation(
      api.functions.projects.publishing.model.selectDetectedRelease,
      {
        draftId: foundation.draftId,
        releaseId: secondRelease.releaseId,
      },
    );
    await foundation.client.mutation(api.functions.projects.publishing.model.submitForReview, {
      draftId: foundation.draftId,
    });
    await foundation.moderator.mutation(api.functions.projects.publishing.model.approveReview, {
      draftId: foundation.draftId,
    });

    const publishedDraft = await t.run((ctx) => ctx.db.get("publishingDrafts", foundation.draftId));
    expect(publishedDraft).toMatchObject({ status: "published", latestTag: "v2.0.0" });
  });

  it("never treats a normal default-branch run as a releasable build", async () => {
    const t = createTest();
    const foundation = await createPublishingFoundation(t, "powernukkitx");

    const result = await t.mutation(
      internal.functions.projects.publishing.model.recordGitHubState,
      {
        tokenIdentifier: foundation.tokenIdentifier,
        draftId: foundation.draftId,
        pullRequestState: "merged",
        workflowInstalled: true,
        run: {
          id: 6100,
          url: "https://github.com/BedrockNexus/fixture/actions/runs/6100",
          status: "completed",
          conclusion: "success",
          commitSha: "main-branch-commit",
          createdAt: Date.now(),
        },
      },
    );

    expect(result).toEqual({ verifiedBuild: false, readyToPublish: false });
    await expect(
      foundation.client.mutation(api.functions.projects.publishing.model.submitForReview, {
        draftId: foundation.draftId,
      }),
    ).rejects.toThrow("Publication requires");
  });

  it("rejects a release whose commit does not match the successful tag run", async () => {
    const t = createTest();
    const foundation = await createPublishingFoundation(t, "pocketmine-mp");
    const now = Date.now();

    const result = await t.mutation(
      internal.functions.projects.publishing.model.recordGitHubState,
      {
        tokenIdentifier: foundation.tokenIdentifier,
        draftId: foundation.draftId,
        workflowInstalled: true,
        run: {
          id: 6200,
          url: "https://github.com/BedrockNexus/fixture/actions/runs/6200",
          status: "completed",
          conclusion: "success",
          commitSha: "build-commit",
          tag: "v2.0.0",
          createdAt: now,
        },
        release: {
          id: 7200,
          url: "https://github.com/BedrockNexus/fixture/releases/tag/v2.0.0",
          tag: "v2.0.0",
          commitSha: "different-commit",
          version: "2.0.0",
          asset: {
            id: 8200,
            name: "fixture.phar",
            url: "https://github.com/BedrockNexus/fixture/releases/download/v2.0.0/fixture.phar",
            size: 1024,
          },
        },
      },
    );

    expect(result.verifiedBuild).toBe(false);
  });
});
