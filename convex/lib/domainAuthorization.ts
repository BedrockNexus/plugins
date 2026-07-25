import { ConvexError } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { hasMinimumRole } from "./authorization";

type DatabaseCtx = QueryCtx | MutationCtx;

export async function getActiveOrganizationMembership(
  ctx: DatabaseCtx,
  organizationId: Id<"organizations">,
  userId: Id<"users">,
) {
  const membership = await ctx.db
    .query("organizationMembers")
    .withIndex("by_organization_id_and_user_id", (query) =>
      query.eq("organizationId", organizationId).eq("userId", userId),
    )
    .unique();

  return membership?.status === "active" ? membership : null;
}

export async function requireOrganizationMember(
  ctx: DatabaseCtx,
  organizationId: Id<"organizations">,
  userId: Id<"users">,
) {
  const membership = await getActiveOrganizationMembership(ctx, organizationId, userId);

  if (!membership) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "Active organization membership is required.",
    });
  }

  return membership;
}

export async function requireOrganizationManager(
  ctx: DatabaseCtx,
  organizationId: Id<"organizations">,
  userId: Id<"users">,
) {
  const membership = await requireOrganizationMember(ctx, organizationId, userId);

  if (membership.role === "member") {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "Organization owner or admin access is required.",
    });
  }

  return membership;
}

export async function canViewProject(
  ctx: DatabaseCtx,
  project: Doc<"projects">,
  user: Doc<"users"> | null,
) {
  if (
    project.status === "published" &&
    (project.visibility === "public" || project.visibility === "unlisted")
  ) {
    return true;
  }

  if (!user) {
    return false;
  }

  if (hasMinimumRole(user.role, "moderator")) {
    return true;
  }

  if (project.visibility === "hidden" || project.visibility === "suspended") {
    return false;
  }

  if (project.ownerUserId === user._id) {
    return true;
  }

  if (!project.ownerOrganizationId) {
    return false;
  }

  return Boolean(await getActiveOrganizationMembership(ctx, project.ownerOrganizationId, user._id));
}

export async function requireProjectManager(
  ctx: DatabaseCtx,
  project: Doc<"projects">,
  user: Doc<"users">,
) {
  if (hasMinimumRole(user.role, "moderator")) {
    return { kind: "staff" as const, user };
  }

  if (project.ownerUserId === user._id) {
    return { kind: "owner" as const, user };
  }

  if (project.ownerOrganizationId) {
    const membership = await requireOrganizationManager(ctx, project.ownerOrganizationId, user._id);
    return { kind: "organization" as const, user, membership };
  }

  throw new ConvexError({
    code: "FORBIDDEN",
    message: "Project owner or organization manager access is required.",
  });
}
