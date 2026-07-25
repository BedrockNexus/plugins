import { ConvexError } from "convex/values";
import { customCtx, customMutation, customQuery } from "convex-helpers/server/customFunctions";

import type { Doc } from "../_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "../_generated/server";

export type AppRole = Doc<"users">["role"];
export type AppUser = Doc<"users">;
type AuthCtx = QueryCtx | MutationCtx;

const roleRank: Record<AppRole, number> = {
  developer: 0,
  verifiedCreator: 1,
  moderator: 2,
  admin: 3,
};

export function hasMinimumRole(role: AppRole, minimumRole: AppRole) {
  return roleRank[role] >= roleRank[minimumRole];
}

export function assertMinimumRole(user: AppUser, minimumRole: AppRole) {
  if (!hasMinimumRole(user.role, minimumRole)) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: `${minimumRole} access is required.`,
    });
  }

  return user;
}

export async function getCurrentUserOrNull(ctx: AuthCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    return null;
  }

  return await ctx.db
    .query("users")
    .withIndex("by_auth_token_identifier", (query) =>
      query.eq("authTokenIdentifier", identity.tokenIdentifier),
    )
    .unique();
}

export async function requireCurrentUser(ctx: AuthCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError({
      code: "UNAUTHENTICATED",
      message: "Sign in is required.",
    });
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_auth_token_identifier", (query) =>
      query.eq("authTokenIdentifier", identity.tokenIdentifier),
    )
    .unique();

  if (!user) {
    throw new ConvexError({
      code: "USER_NOT_SYNCED",
      message: "The signed-in user has not been synchronized yet.",
    });
  }

  return user;
}

export async function requireModerator(ctx: AuthCtx) {
  return assertMinimumRole(await requireCurrentUser(ctx), "moderator");
}

export async function requireAdmin(ctx: AuthCtx) {
  return assertMinimumRole(await requireCurrentUser(ctx), "admin");
}

export const authenticatedQuery = customQuery(
  query,
  customCtx(async (ctx) => ({
    user: await requireCurrentUser(ctx),
  })),
);

export const authenticatedMutation = customMutation(
  mutation,
  customCtx(async (ctx) => ({
    user: await requireCurrentUser(ctx),
  })),
);

export const moderatorQuery = customQuery(
  query,
  customCtx(async (ctx) => ({
    user: await requireModerator(ctx),
  })),
);

export const moderatorMutation = customMutation(
  mutation,
  customCtx(async (ctx) => ({
    user: await requireModerator(ctx),
  })),
);

export const adminQuery = customQuery(
  query,
  customCtx(async (ctx) => ({
    user: await requireAdmin(ctx),
  })),
);

export const adminMutation = customMutation(
  mutation,
  customCtx(async (ctx) => ({
    user: await requireAdmin(ctx),
  })),
);
