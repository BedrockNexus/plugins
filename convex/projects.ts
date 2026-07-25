import { ConvexError, v } from "convex/values";

import { query } from "./_generated/server";
import { authenticatedQuery, getCurrentUserOrNull } from "./lib/authorization";
import { canViewProject, requireProjectManager } from "./lib/domainAuthorization";
import { projectValidator } from "./schema";

export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(projectValidator, v.null()),
  handler: async (ctx, args) => {
    const project = await ctx.db
      .query("projects")
      .withIndex("by_slug", (index) => index.eq("slug", args.slug))
      .unique();

    if (!project) {
      return null;
    }

    const user = await getCurrentUserOrNull(ctx);
    return (await canViewProject(ctx, project, user)) ? project : null;
  },
});

export const getManagementAccess = authenticatedQuery({
  args: { projectId: v.id("projects") },
  returns: v.object({
    authorized: v.literal(true),
    kind: v.union(v.literal("owner"), v.literal("organization"), v.literal("staff")),
  }),
  handler: async (ctx, args) => {
    const project = await ctx.db.get("projects", args.projectId);

    if (!project) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Project not found.",
      });
    }

    const access = await requireProjectManager(ctx, project, ctx.user);

    return {
      authorized: true as const,
      kind: access.kind,
    };
  },
});
