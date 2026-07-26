import { ConvexError } from "convex/values";
import { customCtx, customMutation, customQuery } from "convex-helpers/server/customFunctions";

import { type MutationCtx, mutation, type QueryCtx, query } from "../_generated/server";
import { authComponent } from "../auth";

export type AppRole = "developer" | "verifiedCreator" | "moderator" | "admin";
type BetterAuthUser = Awaited<ReturnType<typeof authComponent.getAuthUser>>;
export type AppUser = Omit<BetterAuthUser, "role"> & { role: AppRole };
type AuthCtx = QueryCtx | MutationCtx;

const roleRank: Record<AppRole, number> = {
  developer: 0,
  verifiedCreator: 1,
  moderator: 2,
  admin: 3,
};

export function normalizeAppRole(role: string | null | undefined): AppRole {
  if (
    role === "developer" ||
    role === "verifiedCreator" ||
    role === "moderator" ||
    role === "admin"
  ) {
    return role;
  }
  return "developer";
}

export function normalizeAppUser(user: BetterAuthUser): AppUser {
  return {
    ...user,
    role: normalizeAppRole(user.role),
  };
}

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
  const user = await authComponent.safeGetAuthUser(ctx);
  return user ? normalizeAppUser(user) : null;
}

export async function requireCurrentUser(ctx: AuthCtx) {
  const user = await getCurrentUserOrNull(ctx);
  if (!user) {
    throw new ConvexError({
      code: "UNAUTHENTICATED",
      message: "Sign in is required.",
    });
  }
  return user;
}

export async function getUserByTokenIdentifier(ctx: AuthCtx, tokenIdentifier: string) {
  const separator = tokenIdentifier.lastIndexOf("|");
  const authUserId = separator >= 0 ? tokenIdentifier.slice(separator + 1) : "";
  const user = authUserId ? await authComponent.getAnyUserById(ctx, authUserId) : null;
  if (!user) {
    throw new ConvexError({
      code: "UNAUTHENTICATED",
      message: "The authenticated Better Auth user could not be resolved.",
    });
  }
  return normalizeAppUser(user);
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
