import { ConvexError, v } from "convex/values";
import { parseProjectDashboardId } from "../../../../src/lib/project-dashboard-id";
import {
  type ProjectMetadataInput,
  projectMetadataSchema,
} from "../../../../src/lib/publishing/metadata";
import type { Doc, Id } from "../../../_generated/dataModel";
import {
  internalMutation,
  internalQuery,
  type MutationCtx,
  type QueryCtx,
} from "../../../_generated/server";
import {
  type AppUser,
  authenticatedMutation,
  authenticatedQuery,
  getUserByTokenIdentifier,
  moderatorMutation,
  moderatorQuery,
} from "../../../lib/authorization";
import {
  listOrganizationMemberships,
  requireOrganizationManager,
} from "../../../lib/domainAuthorization";
import { insertProjectAggregates, replaceProjectAggregates } from "../../../lib/projectAggregates";
import {
  listResolvedWorkflowTemplates,
  resolveWorkflowTemplate,
} from "../../../lib/workflowTemplates";
import {
  publishingDraftValidator,
  repositoryValidator,
  workflowTemplateKeyValidator,
} from "../../../schema";

const adapterIdValidator = v.union(v.literal("pocketmine-mp"), v.literal("powernukkitx"));

async function requireOwnedDraft(
  ctx: QueryCtx | MutationCtx,
  draftId: Id<"publishingDrafts">,
  user: AppUser,
) {
  const draft = await ctx.db.get("publishingDrafts", draftId);
  if (!draft) {
    throw new ConvexError({
      code: "PUBLISHING_DRAFT_NOT_FOUND",
      message: "The publishing draft was not found.",
    });
  }
  if (draft.ownerType === "organization") {
    await requireOrganizationManager(ctx, draft.ownerId, user);
  } else if (draft.ownerId !== user._id) {
    throw new ConvexError({
      code: "PUBLISHING_DRAFT_NOT_FOUND",
      message: "The publishing draft was not found.",
    });
  }
  return draft;
}

const analysisInputValidator = v.object({
  repositoryId: v.id("repositories"),
  adapterId: adapterIdValidator,
  detectionScore: v.number(),
  detectionSummary: v.string(),
  name: v.string(),
  slug: v.string(),
  summary: v.string(),
  description: v.optional(v.string()),
  license: v.optional(v.string()),
  readmeExcerpt: v.optional(v.string()),
});

export const upsertAnalysis = internalMutation({
  args: {
    tokenIdentifier: v.string(),
    analysis: analysisInputValidator,
  },
  returns: v.id("publishingDrafts"),
  handler: async (ctx, args) => {
    const user = await getUserByTokenIdentifier(ctx, args.tokenIdentifier);
    const repository = await ctx.db.get("repositories", args.analysis.repositoryId);
    if (!repository || repository.isPrivate || repository.accessStatus !== "granted") {
      throw new ConvexError({
        code: "REPOSITORY_INELIGIBLE",
        message: "Only an installed public repository can be published.",
      });
    }

    const installation = await ctx.db.get("githubInstallations", repository.installationId);
    if (!installation) {
      throw new ConvexError({ code: "FORBIDDEN", message: "You do not manage this repository." });
    }
    if (installation.ownerType === "organization") {
      await requireOrganizationManager(ctx, installation.ownerId, user);
    } else if (installation.ownerId !== user._id) {
      throw new ConvexError({ code: "FORBIDDEN", message: "You do not manage this repository." });
    }

    const existing = await ctx.db
      .query("publishingDrafts")
      .withIndex("by_repository_id", (query) =>
        query.eq("repositoryId", args.analysis.repositoryId),
      )
      .unique();
    const now = Date.now();
    const values = {
      ownerType: installation.ownerType,
      ownerId: installation.ownerId,
      createdBy: user._id,
      ...args.analysis,
      projectType: "plugin" as const,
      workflowPath: ".github/workflows/bedrocknexus-publish.yml",
      workflowInstalled: existing?.workflowInstalled ?? false,
      verifiedBuild: existing?.verifiedBuild ?? false,
      moderationReady: existing?.moderationReady ?? false,
      status: existing?.status ?? ("detected" as const),
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch("publishingDrafts", existing._id, values);
      return existing._id;
    }

    return await ctx.db.insert("publishingDrafts", {
      ...values,
      createdAt: now,
    });
  },
});

const metadataArgs = {
  draftId: v.id("publishingDrafts"),
  name: v.string(),
  slug: v.string(),
  summary: v.string(),
  description: v.optional(v.string()),
  adapterId: adapterIdValidator,
  projectType: v.literal("plugin"),
};

export const saveMetadata = authenticatedMutation({
  args: metadataArgs,
  returns: v.object({
    draftId: v.id("publishingDrafts"),
    projectId: v.id("projects"),
  }),
  handler: async (ctx, args) => {
    const draft = await requireOwnedDraft(ctx, args.draftId, ctx.user);
    if (draft.status === "inReview") {
      throw new ConvexError({
        code: "PUBLISHING_DRAFT_LOCKED",
        message: "Metadata is locked while this release is under review.",
      });
    }
    const metadataResult = projectMetadataSchema.safeParse({
      name: args.name,
      slug: args.slug,
      summary: args.summary,
      description: args.description,
      adapterId: args.adapterId,
      projectType: args.projectType,
    });
    if (!metadataResult.success) {
      throw new ConvexError({
        code: "INVALID_PROJECT_METADATA",
        message: metadataResult.error.issues[0]?.message ?? "Project metadata is invalid.",
      });
    }
    const metadata: ProjectMetadataInput = metadataResult.data;
    const software = await ctx.db
      .query("serverSoftware")
      .withIndex("by_adapter_id", (query) => query.eq("adapterId", metadata.adapterId))
      .unique();
    if (!software?.enabled) {
      throw new ConvexError({
        code: "ADAPTER_DISABLED",
        message: "The selected adapter is not currently enabled.",
      });
    }

    const slugOwner = await ctx.db
      .query("projects")
      .withIndex("by_slug", (query) => query.eq("slug", metadata.slug))
      .unique();
    if (slugOwner && slugOwner._id !== draft.projectId) {
      throw new ConvexError({
        code: "PROJECT_SLUG_TAKEN",
        message: "That project slug is already in use.",
      });
    }

    const now = Date.now();
    const creatorProfile = await ctx.db
      .query("creatorProfiles")
      .withIndex("by_user_id", (query) => query.eq("userId", ctx.user._id))
      .unique();
    const projectValues = {
      ownerType: draft.ownerType,
      ownerId: draft.ownerId,
      createdBy: draft.createdBy,
      creatorProfileId: draft.ownerType === "organization" ? undefined : creatorProfile?._id,
      repositoryId: draft.repositoryId,
      softwareId: software._id,
      slug: metadata.slug,
      name: metadata.name,
      summary: metadata.summary,
      description: metadata.description,
      searchText: `${metadata.name} ${metadata.summary} ${metadata.description ?? ""}`.trim(),
      license: draft.license,
      visibility: "draft" as const,
      status: "draft" as const,
      updatedAt: now,
    };
    let projectId: Id<"projects">;
    if (draft.projectId) {
      const oldProject = await ctx.db.get("projects", draft.projectId);
      if (!oldProject) {
        throw new ConvexError({
          code: "PROJECT_NOT_FOUND",
          message: "The project linked to this publishing draft no longer exists.",
        });
      }
      if (oldProject.status !== "published") {
        await ctx.db.patch("projects", draft.projectId, projectValues);
        const newProject = await ctx.db.get("projects", draft.projectId);
        if (!newProject) {
          throw new Error("Project disappeared while saving metadata.");
        }
        await replaceProjectAggregates(ctx, oldProject, newProject);
      }
      projectId = draft.projectId;
    } else {
      projectId = await ctx.db.insert("projects", {
        ...projectValues,
        downloadCount: 0,
        downloadCounterReadyAt: now,
        ratingAverage: 0,
        ratingCount: 0,
        createdAt: now,
      });
      const project = await ctx.db.get("projects", projectId);
      if (!project) {
        throw new Error("Project was not readable after creation.");
      }
      await insertProjectAggregates(ctx, project);
    }
    await ctx.db.patch("publishingDrafts", draft._id, {
      projectId,
      ...metadata,
      moderationReady: true,
      status: draft.workflowInstalled ? draft.status : "metadataReady",
      reviewedAt: undefined,
      reviewedBy: undefined,
      reviewNotes: undefined,
      updatedAt: now,
    });

    return { draftId: draft._id, projectId };
  },
});

export const listAvailableWorkflows = authenticatedQuery({
  args: { draftId: v.id("publishingDrafts") },
  returns: v.array(
    v.object({
      key: workflowTemplateKeyValidator,
      adapterId: adapterIdValidator,
      buildSystem: v.union(v.literal("composer"), v.literal("gradle"), v.literal("maven")),
      label: v.string(),
      source: v.union(v.literal("default"), v.literal("override"), v.literal("custom")),
      version: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const draft = await requireOwnedDraft(ctx, args.draftId, ctx.user);
    const templates = await listResolvedWorkflowTemplates(ctx, draft.adapterId);
    return templates.map(({ key, adapterId, buildSystem, label, source, version }) => ({
      key,
      adapterId,
      buildSystem,
      label,
      source,
      version,
    }));
  },
});

export const selectWorkflow = authenticatedMutation({
  args: {
    draftId: v.id("publishingDrafts"),
    key: workflowTemplateKeyValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const draft = await requireOwnedDraft(ctx, args.draftId, ctx.user);
    if (draft.status === "inReview") {
      throw new ConvexError({
        code: "PUBLISHING_DRAFT_LOCKED",
        message: "The workflow is locked while this release is under review.",
      });
    }
    const template = await resolveWorkflowTemplate(ctx, args.key);
    if (!template || template.adapterId !== draft.adapterId) {
      throw new ConvexError({
        code: "WORKFLOW_TEMPLATE_INCOMPATIBLE",
        message: "The selected workflow is not available for this project.",
      });
    }
    if (draft.workflowTemplateKey === template.key) {
      return null;
    }
    await ctx.db.patch("publishingDrafts", draft._id, {
      workflowTemplateKey: template.key,
      workflowTemplateVersion: undefined,
      workflowInstalledAt: undefined,
      workflowInstalled: false,
      verifiedBuild: false,
      status: draft.projectId ? "metadataReady" : "detected",
      reviewedAt: undefined,
      reviewedBy: undefined,
      reviewNotes: undefined,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const getActionContext = internalQuery({
  args: {
    tokenIdentifier: v.string(),
    draftId: v.id("publishingDrafts"),
  },
  returns: v.object({
    draft: publishingDraftValidator,
    repository: repositoryValidator,
    installationId: v.number(),
  }),
  handler: async (ctx, args) => {
    const user = await getUserByTokenIdentifier(ctx, args.tokenIdentifier);
    const draft = await requireOwnedDraft(ctx, args.draftId, user);
    const repository = await ctx.db.get("repositories", draft.repositoryId);
    if (!repository || repository.isPrivate || repository.accessStatus !== "granted") {
      throw new ConvexError({
        code: "REPOSITORY_INELIGIBLE",
        message: "The repository is no longer eligible for publishing.",
      });
    }
    const installation = await ctx.db.get("githubInstallations", repository.installationId);
    if (!installation) {
      throw new ConvexError({ code: "FORBIDDEN", message: "You do not manage this repository." });
    }
    if (installation.ownerType === "organization") {
      await requireOrganizationManager(ctx, installation.ownerId, user);
    } else if (installation.ownerId !== user._id) {
      throw new ConvexError({ code: "FORBIDDEN", message: "You do not manage this repository." });
    }
    return { draft, repository, installationId: installation.installationId };
  },
});

export const recordWorkflowCommit = internalMutation({
  args: {
    tokenIdentifier: v.string(),
    draftId: v.id("publishingDrafts"),
    branch: v.string(),
    commitSha: v.string(),
    templateKey: workflowTemplateKeyValidator,
    templateVersion: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getUserByTokenIdentifier(ctx, args.tokenIdentifier);
    const draft = await requireOwnedDraft(ctx, args.draftId, user);
    if (draft.workflowTemplateKey !== args.templateKey) {
      throw new ConvexError({
        code: "WORKFLOW_SELECTION_CHANGED",
        message: "The selected workflow changed while it was being installed. Try again.",
      });
    }
    await ctx.db.patch("publishingDrafts", draft._id, {
      workflowBranch: args.branch,
      workflowPullRequestNumber: undefined,
      workflowPullRequestUrl: undefined,
      workflowPullRequestState: undefined,
      workflowCommitSha: args.commitSha,
      workflowTemplateVersion: args.templateVersion,
      workflowInstalledAt: Date.now(),
      workflowInstalled: true,
      verifiedBuild: false,
      status: draft.status === "published" ? "published" : "workflowInstalled",
      updatedAt: Date.now(),
    });
    return null;
  },
});

const workflowRunValidator = v.object({
  id: v.number(),
  url: v.string(),
  status: v.string(),
  conclusion: v.optional(v.string()),
  commitSha: v.string(),
  tag: v.optional(v.string()),
  createdAt: v.number(),
  completedAt: v.optional(v.number()),
});

const releaseStateValidator = v.object({
  id: v.number(),
  url: v.string(),
  tag: v.string(),
  commitSha: v.string(),
  version: v.string(),
  publishedAt: v.optional(v.number()),
  asset: v.object({
    id: v.number(),
    name: v.string(),
    url: v.string(),
    size: v.number(),
    contentType: v.optional(v.string()),
  }),
});

export const recordGitHubState = internalMutation({
  args: {
    tokenIdentifier: v.string(),
    draftId: v.id("publishingDrafts"),
    pullRequestState: v.optional(
      v.union(v.literal("open"), v.literal("closed"), v.literal("merged")),
    ),
    workflowInstalled: v.boolean(),
    run: v.optional(workflowRunValidator),
    release: v.optional(releaseStateValidator),
  },
  returns: v.object({
    verifiedBuild: v.boolean(),
    readyToPublish: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const user = await getUserByTokenIdentifier(ctx, args.tokenIdentifier);
    const draft = await requireOwnedDraft(ctx, args.draftId, user);
    if (draft.status === "inReview") {
      return { verifiedBuild: draft.verifiedBuild, readyToPublish: true };
    }
    const preserveReviewStatus =
      draft.status === "published" && (!args.release || draft.latestReleaseId === args.release.id)
        ? draft.status
        : undefined;
    const repository = await ctx.db.get("repositories", draft.repositoryId);
    const run = args.run;
    const release = args.release;
    const selectedTemplate = draft.workflowTemplateKey
      ? await resolveWorkflowTemplate(ctx, draft.workflowTemplateKey)
      : null;
    const verifiedBuild = Boolean(
      repository &&
        !repository.isPrivate &&
        repository.accessStatus === "granted" &&
        selectedTemplate &&
        selectedTemplate.adapterId === draft.adapterId &&
        selectedTemplate.version === draft.workflowTemplateVersion &&
        args.workflowInstalled &&
        run &&
        run.status === "completed" &&
        run.conclusion === "success" &&
        run.tag === release?.tag &&
        run.commitSha === release?.commitSha &&
        release.asset.size > 0,
    );
    const readyToPublish = verifiedBuild && draft.moderationReady && Boolean(draft.projectId);
    const now = Date.now();

    if (draft.projectId && run) {
      const buildConclusion: Doc<"builds">["conclusion"] =
        run.conclusion === "success" ||
        run.conclusion === "failure" ||
        run.conclusion === "cancelled" ||
        run.conclusion === "skipped"
          ? run.conclusion
          : undefined;
      const existingBuild = await ctx.db
        .query("builds")
        .withIndex("by_workflow_run_id", (query) => query.eq("workflowRunId", run.id))
        .unique();
      const buildValues: Omit<
        Doc<"builds">,
        "_id" | "_creationTime" | "createdAt" | "versionId" | "branch"
      > = {
        projectId: draft.projectId,
        repositoryId: draft.repositoryId,
        workflowRunId: run.id,
        workflowName: "BedrockNexus Publish",
        commitSha: run.commitSha,
        tag: run.tag,
        status:
          run.status === "completed"
            ? ("completed" as const)
            : run.status === "in_progress"
              ? ("inProgress" as const)
              : ("queued" as const),
        conclusion: buildConclusion,
        logsUrl: run.url,
        completedAt: run.completedAt,
        updatedAt: now,
      };
      if (existingBuild) {
        await ctx.db.patch("builds", existingBuild._id, buildValues);
      } else {
        await ctx.db.insert("builds", { ...buildValues, createdAt: run.createdAt });
      }
    }

    if (draft.projectId && run && release) {
      let version = await ctx.db
        .query("versions")
        .withIndex("by_project_id_and_normalized_version", (query) =>
          query
            .eq("projectId", draft.projectId as Id<"projects">)
            .eq("normalizedVersion", release.version),
        )
        .unique();
      if (!version) {
        const versionId = await ctx.db.insert("versions", {
          projectId: draft.projectId,
          version: release.version,
          normalizedVersion: release.version,
          status: "draft",
          createdAt: now,
          updatedAt: now,
        });
        version = await ctx.db.get("versions", versionId);
      }
      const build = await ctx.db
        .query("builds")
        .withIndex("by_workflow_run_id", (query) => query.eq("workflowRunId", run.id))
        .unique();
      if (version && build) {
        await ctx.db.patch("builds", build._id, { versionId: version._id, updatedAt: now });
        let releaseDocument = await ctx.db
          .query("releases")
          .withIndex("by_github_release_id", (query) => query.eq("githubReleaseId", release.id))
          .unique();
        const releaseValues = {
          projectId: draft.projectId,
          versionId: version._id,
          buildId: build._id,
          repositoryId: draft.repositoryId,
          githubReleaseId: release.id,
          tagName: release.tag,
          releaseUrl: release.url,
          commitSha: release.commitSha,
          status:
            releaseDocument?.status === "published"
              ? ("published" as const)
              : verifiedBuild
                ? ("verified" as const)
                : ("detected" as const),
          verifiedBuild,
          updatedAt: now,
        };
        if (releaseDocument) {
          await ctx.db.patch("releases", releaseDocument._id, releaseValues);
        } else {
          const releaseId = await ctx.db.insert("releases", {
            ...releaseValues,
            createdAt: release.publishedAt ?? now,
          });
          releaseDocument = await ctx.db.get("releases", releaseId);
        }
        if (releaseDocument) {
          const existingAsset = await ctx.db
            .query("releaseAssets")
            .withIndex("by_github_asset_id", (query) => query.eq("githubAssetId", release.asset.id))
            .unique();
          const assetValues = {
            releaseId: releaseDocument._id,
            githubAssetId: release.asset.id,
            name: release.asset.name,
            downloadUrl: release.asset.url,
            size: release.asset.size,
            contentType: release.asset.contentType,
            isPrimary: true,
            status: "accepted" as const,
            updatedAt: now,
          };
          if (existingAsset) {
            await ctx.db.patch("releaseAssets", existingAsset._id, assetValues);
          } else {
            await ctx.db.insert("releaseAssets", { ...assetValues, createdAt: now });
          }
        }
      }
    }

    await ctx.db.patch("publishingDrafts", draft._id, {
      workflowPullRequestState: args.pullRequestState,
      workflowInstalled: args.workflowInstalled,
      latestWorkflowRunId: run?.id,
      latestWorkflowRunUrl: run?.url,
      latestWorkflowRunStatus: run?.status,
      latestWorkflowRunConclusion: run?.conclusion,
      ...(release
        ? {
            latestTag: release.tag,
            latestReleaseId: release.id,
            latestReleaseUrl: release.url,
            latestReleaseCommitSha: release.commitSha,
            primaryAssetId: release.asset.id,
            primaryAssetName: release.asset.name,
            primaryAssetUrl: release.asset.url,
          }
        : {}),
      verifiedBuild,
      status:
        preserveReviewStatus ??
        (readyToPublish
          ? "readyToPublish"
          : release
            ? "releaseDetected"
            : args.workflowInstalled
              ? "workflowInstalled"
              : draft.status),
      updatedAt: now,
    });

    return { verifiedBuild, readyToPublish };
  },
});

async function requirePublishableRelease(ctx: MutationCtx, draft: Doc<"publishingDrafts">) {
  const selectedTemplate = draft.workflowTemplateKey
    ? await resolveWorkflowTemplate(ctx, draft.workflowTemplateKey)
    : null;
  if (
    !draft.projectId ||
    !draft.workflowTemplateKey ||
    !selectedTemplate ||
    selectedTemplate.adapterId !== draft.adapterId ||
    selectedTemplate.version !== draft.workflowTemplateVersion ||
    !draft.workflowInstalled ||
    !draft.primaryAssetId ||
    !draft.latestReleaseId ||
    !draft.verifiedBuild ||
    !draft.moderationReady
  ) {
    throw new ConvexError({
      code: "PUBLICATION_NOT_READY",
      message:
        "Publication requires the current selected workflow, a verified release asset, and moderation-ready metadata.",
    });
  }
  const project = await ctx.db.get("projects", draft.projectId);
  if (!project || project.visibility === "hidden" || project.visibility === "suspended") {
    throw new ConvexError({
      code: "PUBLICATION_BLOCKED",
      message: "This project cannot currently be published.",
    });
  }
  const release = await ctx.db
    .query("releases")
    .withIndex("by_github_release_id", (query) =>
      query.eq("githubReleaseId", draft.latestReleaseId as number),
    )
    .unique();
  if (!release?.verifiedBuild || release.status === "rejected") {
    throw new ConvexError({
      code: "RELEASE_NOT_VERIFIED",
      message: "The correlated release is not a verified build.",
    });
  }
  const asset = await ctx.db
    .query("releaseAssets")
    .withIndex("by_github_asset_id", (query) =>
      query.eq("githubAssetId", draft.primaryAssetId as number),
    )
    .unique();
  if (
    !asset ||
    asset.releaseId !== release._id ||
    !asset.isPrimary ||
    asset.status !== "accepted"
  ) {
    throw new ConvexError({
      code: "RELEASE_ASSET_NOT_ACCEPTED",
      message: "The correlated primary release asset is no longer accepted.",
    });
  }
  const repository = await ctx.db.get("repositories", draft.repositoryId);
  if (!repository || repository.isPrivate || repository.accessStatus !== "granted") {
    throw new ConvexError({
      code: "REPOSITORY_INELIGIBLE",
      message: "The repository is no longer eligible for publishing.",
    });
  }
  return { project, release };
}

export const submitForReview = authenticatedMutation({
  args: { draftId: v.id("publishingDrafts") },
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    const draft = await requireOwnedDraft(ctx, args.draftId, ctx.user);
    if (draft.status === "published") {
      throw new ConvexError({
        code: "ALREADY_PUBLISHED",
        message: "This release is already published.",
      });
    }
    if (draft.status === "inReview") {
      throw new ConvexError({
        code: "ALREADY_IN_REVIEW",
        message: "This release is already waiting for moderator review.",
      });
    }
    const { project } = await requirePublishableRelease(ctx, draft);
    const now = Date.now();
    if (project.status !== "published") {
      await ctx.db.patch("projects", project._id, {
        visibility: "draft",
        status: "review",
        updatedAt: now,
      });
      const reviewProject = await ctx.db.get("projects", project._id);
      if (!reviewProject) {
        throw new Error("Project disappeared while submitting for review.");
      }
      await replaceProjectAggregates(ctx, project, reviewProject);
    }
    await ctx.db.patch("publishingDrafts", draft._id, {
      status: "inReview",
      submittedAt: now,
      reviewedAt: undefined,
      reviewedBy: undefined,
      reviewNotes: undefined,
      updatedAt: now,
    });
    return project._id;
  },
});

export const listDetectedReleases = authenticatedQuery({
  args: { draftId: v.id("publishingDrafts") },
  returns: v.array(
    v.object({
      releaseId: v.id("releases"),
      githubReleaseId: v.number(),
      tagName: v.string(),
      releaseUrl: v.string(),
      commitSha: v.string(),
      status: v.union(
        v.literal("detected"),
        v.literal("verified"),
        v.literal("published"),
        v.literal("rejected"),
      ),
      verifiedBuild: v.boolean(),
      assetName: v.optional(v.string()),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const draft = await requireOwnedDraft(ctx, args.draftId, ctx.user);
    if (!draft.projectId) {
      return [];
    }
    const releases = await ctx.db
      .query("releases")
      .withIndex("by_project_id", (query) =>
        query.eq("projectId", draft.projectId as Id<"projects">),
      )
      .order("desc")
      .take(50);
    return await Promise.all(
      releases.map(async (release) => {
        const asset = await ctx.db
          .query("releaseAssets")
          .withIndex("by_release_id_and_is_primary", (query) =>
            query.eq("releaseId", release._id).eq("isPrimary", true),
          )
          .unique();
        return {
          releaseId: release._id,
          githubReleaseId: release.githubReleaseId,
          tagName: release.tagName,
          releaseUrl: release.releaseUrl,
          commitSha: release.commitSha,
          status: release.status,
          verifiedBuild: release.verifiedBuild,
          assetName: asset?.name,
          createdAt: release.createdAt,
        };
      }),
    );
  },
});

export const selectDetectedRelease = authenticatedMutation({
  args: {
    draftId: v.id("publishingDrafts"),
    releaseId: v.id("releases"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const draft = await requireOwnedDraft(ctx, args.draftId, ctx.user);
    if (draft.status === "inReview") {
      throw new ConvexError({
        code: "PUBLISHING_DRAFT_LOCKED",
        message: "The selected release is locked while it is under review.",
      });
    }
    const release = await ctx.db.get("releases", args.releaseId);
    if (
      !draft.projectId ||
      !release ||
      release.projectId !== draft.projectId ||
      release.repositoryId !== draft.repositoryId ||
      !release.verifiedBuild ||
      release.status !== "verified"
    ) {
      throw new ConvexError({
        code: "RELEASE_NOT_SELECTABLE",
        message: "Choose a verified, unpublished release from this project.",
      });
    }
    const asset = await ctx.db
      .query("releaseAssets")
      .withIndex("by_release_id_and_is_primary", (query) =>
        query.eq("releaseId", release._id).eq("isPrimary", true),
      )
      .unique();
    if (asset?.status !== "accepted") {
      throw new ConvexError({
        code: "RELEASE_ASSET_NOT_ACCEPTED",
        message: "The selected release does not have an accepted primary asset.",
      });
    }
    await ctx.db.patch("publishingDrafts", draft._id, {
      latestTag: release.tagName,
      latestReleaseId: release.githubReleaseId,
      latestReleaseUrl: release.releaseUrl,
      latestReleaseCommitSha: release.commitSha,
      primaryAssetId: asset.githubAssetId,
      primaryAssetName: asset.name,
      primaryAssetUrl: asset.downloadUrl,
      verifiedBuild: true,
      status: "readyToPublish",
      reviewedAt: undefined,
      reviewedBy: undefined,
      reviewNotes: undefined,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const listReviewQueue = moderatorQuery({
  args: {},
  returns: v.array(
    v.object({
      draft: publishingDraftValidator,
      repository: repositoryValidator,
      projectName: v.string(),
    }),
  ),
  handler: async (ctx) => {
    const drafts = await ctx.db
      .query("publishingDrafts")
      .withIndex("by_status", (query) => query.eq("status", "inReview"))
      .order("asc")
      .take(100);
    const result: Array<{
      draft: Doc<"publishingDrafts">;
      repository: Doc<"repositories">;
      projectName: string;
    }> = [];
    for (const draft of drafts) {
      if (!draft.projectId) {
        continue;
      }
      const [project, repository] = await Promise.all([
        ctx.db.get("projects", draft.projectId),
        ctx.db.get("repositories", draft.repositoryId),
      ]);
      if (project && repository) {
        result.push({ draft, repository, projectName: project.name });
      }
    }
    return result;
  },
});

export const approveReview = moderatorMutation({
  args: {
    draftId: v.id("publishingDrafts"),
    note: v.optional(v.string()),
  },
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    const draft = await ctx.db.get("publishingDrafts", args.draftId);
    if (draft?.status !== "inReview") {
      throw new ConvexError({
        code: "REVIEW_NOT_PENDING",
        message: "This publishing draft is not waiting for review.",
      });
    }
    const { project, release } = await requirePublishableRelease(ctx, draft);
    const now = Date.now();
    await ctx.db.patch("versions", release.versionId, {
      status: "published",
      publishedAt: now,
      updatedAt: now,
    });
    await ctx.db.patch("releases", release._id, {
      status: "published",
      publishedAt: now,
      updatedAt: now,
    });
    await ctx.db.patch("projects", project._id, {
      latestVersionId: release.versionId,
      slug: draft.slug,
      name: draft.name,
      summary: draft.summary,
      description: draft.description,
      searchText: `${draft.name} ${draft.summary} ${draft.description ?? ""}`.trim(),
      license: draft.license,
      visibility: "public",
      status: "published",
      publishedAt: project.publishedAt ?? now,
      updatedAt: now,
    });
    const publishedProject = await ctx.db.get("projects", project._id);
    if (!publishedProject) {
      throw new Error("Project disappeared while publishing.");
    }
    await replaceProjectAggregates(ctx, project, publishedProject);
    await ctx.db.patch("publishingDrafts", draft._id, {
      status: "published",
      reviewedAt: now,
      reviewedBy: ctx.user._id,
      reviewNotes: args.note,
      updatedAt: now,
    });
    await ctx.db.insert("adminActions", {
      actorUserId: ctx.user._id,
      action: "publishing.approve",
      targetType: "publishingDraft",
      targetKey: draft._id,
      reason: args.note?.trim() || "Verified release approved for publication.",
      previousState: "inReview",
      resultingState: "published",
      createdAt: now,
    });
    return project._id;
  },
});

const reviewDecisionArgs = {
  draftId: v.id("publishingDrafts"),
  reason: v.string(),
};

async function recordReviewDecision(
  ctx: MutationCtx & { user: AppUser },
  args: { draftId: Id<"publishingDrafts">; reason: string },
  status: "changesRequested" | "rejected",
) {
  const reason = args.reason.trim();
  if (!reason) {
    throw new ConvexError({ code: "REASON_REQUIRED", message: "A review reason is required." });
  }
  const draft = await ctx.db.get("publishingDrafts", args.draftId);
  if (draft?.status !== "inReview" || !draft.projectId) {
    throw new ConvexError({
      code: "REVIEW_NOT_PENDING",
      message: "This publishing draft is not waiting for review.",
    });
  }
  const project = await ctx.db.get("projects", draft.projectId);
  if (!project) {
    throw new ConvexError({ code: "PROJECT_NOT_FOUND", message: "Project not found." });
  }
  const now = Date.now();
  if (project.status !== "published") {
    await ctx.db.patch("projects", project._id, {
      visibility: "draft",
      status: "draft",
      updatedAt: now,
    });
    const draftProject = await ctx.db.get("projects", project._id);
    if (!draftProject) {
      throw new Error("Project disappeared while recording the review decision.");
    }
    await replaceProjectAggregates(ctx, project, draftProject);
  }
  await ctx.db.patch("publishingDrafts", draft._id, {
    status,
    reviewedAt: now,
    reviewedBy: ctx.user._id,
    reviewNotes: reason,
    updatedAt: now,
  });
  await ctx.db.insert("adminActions", {
    actorUserId: ctx.user._id,
    action: status === "rejected" ? "publishing.reject" : "publishing.requestChanges",
    targetType: "publishingDraft",
    targetKey: draft._id,
    reason,
    previousState: "inReview",
    resultingState: status,
    createdAt: now,
  });
  return project._id;
}

export const requestReviewChanges = moderatorMutation({
  args: reviewDecisionArgs,
  returns: v.id("projects"),
  handler: async (ctx, args) => await recordReviewDecision(ctx, args, "changesRequested"),
});

export const rejectReview = moderatorMutation({
  args: reviewDecisionArgs,
  returns: v.id("projects"),
  handler: async (ctx, args) => await recordReviewDecision(ctx, args, "rejected"),
});

export const listMine = authenticatedQuery({
  args: {},
  returns: v.array(
    v.object({
      draft: publishingDraftValidator,
      repository: repositoryValidator,
    }),
  ),
  handler: async (ctx) => {
    const personalDrafts = await ctx.db
      .query("publishingDrafts")
      .withIndex("by_owner_type_and_owner_id", (query) =>
        query.eq("ownerType", "user").eq("ownerId", ctx.user._id),
      )
      .order("desc")
      .take(20);
    const memberships = await listOrganizationMemberships(ctx, ctx.user._id);
    const organizationDrafts = (
      await Promise.all(
        memberships.map((membership) =>
          ctx.db
            .query("publishingDrafts")
            .withIndex("by_owner_type_and_owner_id", (query) =>
              query.eq("ownerType", "organization").eq("ownerId", membership.organizationId),
            )
            .order("desc")
            .take(20),
        ),
      )
    ).flat();
    const drafts = [
      ...new Map(
        [...personalDrafts, ...organizationDrafts].map((draft) => [draft._id, draft]),
      ).values(),
    ];
    const result: Array<{
      draft: Doc<"publishingDrafts">;
      repository: Doc<"repositories">;
    }> = [];
    for (const draft of drafts) {
      const repository = await ctx.db.get("repositories", draft.repositoryId);
      if (repository) {
        result.push({ draft, repository });
      }
    }
    return result;
  },
});

export const getMine = authenticatedQuery({
  args: { draftId: v.id("publishingDrafts") },
  returns: v.object({
    draft: publishingDraftValidator,
    repository: repositoryValidator,
  }),
  handler: async (ctx, args) => {
    const draft = await requireOwnedDraft(ctx, args.draftId, ctx.user);
    const repository = await ctx.db.get("repositories", draft.repositoryId);
    if (!repository) {
      throw new ConvexError({
        code: "REPOSITORY_NOT_FOUND",
        message: "The project repository no longer exists.",
      });
    }
    return { draft, repository };
  },
});

export const resolveMine = authenticatedQuery({
  args: { reference: v.string() },
  returns: v.union(v.id("publishingDrafts"), v.null()),
  handler: async (ctx, args) => {
    const githubRepositoryId = parseProjectDashboardId(args.reference);
    let draftId: Id<"publishingDrafts"> | null = null;

    if (githubRepositoryId !== null) {
      const repository = await ctx.db
        .query("repositories")
        .withIndex("by_github_repository_id", (query) =>
          query.eq("githubRepositoryId", githubRepositoryId),
        )
        .unique();
      if (repository) {
        const draft = await ctx.db
          .query("publishingDrafts")
          .withIndex("by_repository_id", (query) => query.eq("repositoryId", repository._id))
          .unique();
        draftId = draft?._id ?? null;
      }
    } else {
      draftId = ctx.db.normalizeId("publishingDrafts", args.reference);
    }

    if (!draftId) {
      return null;
    }
    await requireOwnedDraft(ctx, draftId, ctx.user);
    return draftId;
  },
});
