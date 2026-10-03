import { ConvexError, v } from "convex/values";

import { internal } from "../../_generated/api";
import type { Id } from "../../_generated/dataModel";
import { internalMutation, type MutationCtx } from "../../_generated/server";
import { authenticatedMutation, hasMinimumRole } from "../../lib/authorization";
import { requireOrganizationManager, requireProjectManager } from "../../lib/domainAuthorization";
import { ownerDownloadCounts, projectDownloadCounts } from "../../lib/downloadCounts";
import { projectOwnerKey, projectsByOwner, projectsBySoftware } from "../../lib/projectAggregates";
import { enforceRateLimit } from "../../lib/rateLimits";

const PURGE_BATCH_SIZE = 100;

const PURGE_STAGES = [
  "versions",
  "builds",
  "releases",
  "downloads",
  "projectCategories",
  "projectTags",
  "reviews",
  "ratings",
  "supportLinks",
  "moderationReports",
] as const;

type PurgeStage = (typeof PURGE_STAGES)[number];

const purgeStageValidator = v.union(...PURGE_STAGES.map((stage) => v.literal(stage)));

/**
 * Permanently deletes a publishing draft and, when it has one, its project.
 *
 * Allowed for the owning user, an owner or admin of the owning organization,
 * and site admins. The caller must type the project slug to confirm. The
 * project disappears from the catalog and download redirects immediately;
 * versions, releases, download records, and other rows are removed in the
 * background by `purgeProjectData`. Plugin files live in the creator's GitHub
 * repository and are not touched. The moderation audit log is kept.
 */
export const deleteProject = authenticatedMutation({
  args: {
    draftId: v.id("publishingDrafts"),
    confirmSlug: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await enforceRateLimit(ctx, "publishingEdit", ctx.user._id);
    const draft = await ctx.db.get("publishingDrafts", args.draftId);
    if (!draft) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Project not found." });
    }
    const project = draft.projectId ? await ctx.db.get("projects", draft.projectId) : null;
    const isAdmin = hasMinimumRole(ctx.user.role, "admin");

    if (project) {
      const access = await requireProjectManager(ctx, project, ctx.user);
      if (access.kind === "staff" && !isAdmin) {
        throw new ConvexError({
          code: "FORBIDDEN",
          message: "Only the owner, an organization manager, or an admin can delete a project.",
        });
      }
    } else if (!isAdmin) {
      if (draft.ownerType === "organization") {
        await requireOrganizationManager(ctx, draft.ownerId, ctx.user);
      } else if (draft.ownerId !== ctx.user._id) {
        throw new ConvexError({ code: "NOT_FOUND", message: "Project not found." });
      }
    }

    // The draft slug can change before re-approval, so accept either one.
    const confirmSlug = args.confirmSlug.trim();
    if (confirmSlug !== draft.slug && confirmSlug !== project?.slug) {
      throw new ConvexError({
        code: "CONFIRMATION_MISMATCH",
        message: `Type ${draft.slug} to confirm deletion.`,
      });
    }

    const now = Date.now();
    if (!project) {
      await ctx.db.delete("publishingDrafts", draft._id);
      return null;
    }

    // Lifetime owner totals no longer include this project's downloads.
    const downloadCount = project.downloadCounterReadyAt
      ? Math.round(await projectDownloadCounts.count(ctx, project._id))
      : project.downloadCount;
    if (downloadCount > 0) {
      await ownerDownloadCounts.subtract(
        ctx,
        projectOwnerKey(project.ownerType, project.ownerId),
        downloadCount,
      );
    }
    await projectDownloadCounts.reset(ctx, project._id);
    await projectsBySoftware.deleteIfExists(ctx, project);
    await projectsByOwner.deleteIfExists(ctx, project);

    const drafts = await ctx.db
      .query("publishingDrafts")
      .withIndex("by_project_id", (query) => query.eq("projectId", project._id))
      .take(50);
    for (const projectDraft of drafts) {
      await ctx.db.delete("publishingDrafts", projectDraft._id);
    }
    if (!drafts.some((projectDraft) => projectDraft._id === draft._id)) {
      await ctx.db.delete("publishingDrafts", draft._id);
    }
    await ctx.db.delete("projects", project._id);

    await ctx.db.insert("adminActions", {
      actorUserId: ctx.user._id,
      action: "project.delete",
      targetType: "project",
      targetKey: project._id,
      reason:
        isAdmin && project.createdBy !== ctx.user._id ? "Deleted by admin." : "Deleted by owner.",
      previousState: `${project.visibility}:${project.status}`,
      resultingState: "deleted",
      createdAt: now,
    });
    await ctx.scheduler.runAfter(0, internal.functions.projects.deletion.purgeProjectData, {
      projectId: project._id,
      stage: PURGE_STAGES[0],
    });
    return null;
  },
});

/** Removes a deleted project's dependent rows in batches, one table at a time. */
export const purgeProjectData = internalMutation({
  args: {
    projectId: v.id("projects"),
    stage: purgeStageValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const projectId = args.projectId as Id<"projects">;
    const deleted = await purgeStage(ctx, projectId, args.stage);

    if (deleted === PURGE_BATCH_SIZE) {
      await ctx.scheduler.runAfter(0, internal.functions.projects.deletion.purgeProjectData, args);
      return null;
    }
    const next = PURGE_STAGES[PURGE_STAGES.indexOf(args.stage) + 1];
    if (next) {
      await ctx.scheduler.runAfter(0, internal.functions.projects.deletion.purgeProjectData, {
        projectId,
        stage: next,
      });
    }
    return null;
  },
});

async function purgeStage(
  ctx: MutationCtx,
  projectId: Id<"projects">,
  stage: PurgeStage,
): Promise<number> {
  switch (stage) {
    case "versions": {
      const rows = await ctx.db
        .query("versions")
        .withIndex("by_project_id", (q) => q.eq("projectId", projectId))
        .take(PURGE_BATCH_SIZE);
      for (const row of rows) await ctx.db.delete("versions", row._id);
      return rows.length;
    }
    case "builds": {
      const rows = await ctx.db
        .query("builds")
        .withIndex("by_project_id", (q) => q.eq("projectId", projectId))
        .take(PURGE_BATCH_SIZE);
      for (const row of rows) await ctx.db.delete("builds", row._id);
      return rows.length;
    }
    case "releases": {
      const rows = await ctx.db
        .query("releases")
        .withIndex("by_project_id", (q) => q.eq("projectId", projectId))
        .take(PURGE_BATCH_SIZE);
      for (const row of rows) {
        const assets = await ctx.db
          .query("releaseAssets")
          .withIndex("by_release_id", (q) => q.eq("releaseId", row._id))
          .take(50);
        for (const asset of assets) await ctx.db.delete("releaseAssets", asset._id);
        await ctx.db.delete("releases", row._id);
      }
      return rows.length;
    }
    case "downloads": {
      const rows = await ctx.db
        .query("downloads")
        .withIndex("by_project_id_and_created_at", (q) => q.eq("projectId", projectId))
        .take(PURGE_BATCH_SIZE);
      for (const row of rows) await ctx.db.delete("downloads", row._id);
      return rows.length;
    }
    case "projectCategories": {
      const rows = await ctx.db
        .query("projectCategories")
        .withIndex("by_project_id", (q) => q.eq("projectId", projectId))
        .take(PURGE_BATCH_SIZE);
      for (const row of rows) await ctx.db.delete("projectCategories", row._id);
      return rows.length;
    }
    case "projectTags": {
      const rows = await ctx.db
        .query("projectTags")
        .withIndex("by_project_id", (q) => q.eq("projectId", projectId))
        .take(PURGE_BATCH_SIZE);
      for (const row of rows) await ctx.db.delete("projectTags", row._id);
      return rows.length;
    }
    case "reviews": {
      const rows = await ctx.db
        .query("reviews")
        .withIndex("by_project_id", (q) => q.eq("projectId", projectId))
        .take(PURGE_BATCH_SIZE);
      for (const row of rows) await ctx.db.delete("reviews", row._id);
      return rows.length;
    }
    case "ratings": {
      const rows = await ctx.db
        .query("ratings")
        .withIndex("by_project_id", (q) => q.eq("projectId", projectId))
        .take(PURGE_BATCH_SIZE);
      for (const row of rows) await ctx.db.delete("ratings", row._id);
      return rows.length;
    }
    case "supportLinks": {
      const rows = await ctx.db
        .query("supportLinks")
        .withIndex("by_project_id_and_status_and_sort_order", (q) => q.eq("projectId", projectId))
        .take(PURGE_BATCH_SIZE);
      for (const row of rows) await ctx.db.delete("supportLinks", row._id);
      return rows.length;
    }
    case "moderationReports": {
      const rows = await ctx.db
        .query("moderationReports")
        .withIndex("by_project_id", (q) => q.eq("projectId", projectId))
        .take(PURGE_BATCH_SIZE);
      for (const row of rows) await ctx.db.delete("moderationReports", row._id);
      return rows.length;
    }
  }
}
