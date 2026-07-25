import { ConvexError, v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { authComponent } from "./auth";
import { normalizeSlug } from "./lib/slugs";
import { creatorProfileValidator, userValidator } from "./schema";

const syncedUserValidator = v.object({
  user: userValidator,
  creatorProfile: creatorProfileValidator,
});

async function resolveCreatorSlug(
  ctx: MutationCtx,
  userId: Id<"users">,
  profile: Doc<"creatorProfiles"> | null,
  displayName: string,
) {
  if (profile?.slug) {
    return profile.slug;
  }

  const baseSlug = normalizeSlug(displayName) || "creator";
  const existing = await ctx.db
    .query("creatorProfiles")
    .withIndex("by_slug", (query) => query.eq("slug", baseSlug))
    .unique();

  if (!existing || existing._id === profile?._id) {
    return baseSlug;
  }

  return `${baseSlug}-${userId}`;
}

export const syncCurrentUser = mutation({
  args: {},
  returns: syncedUserValidator,
  handler: async (ctx) => {
    const [identity, authUser] = await Promise.all([
      ctx.auth.getUserIdentity(),
      authComponent.getAuthUser(ctx),
    ]);

    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "Sign in is required.",
      });
    }

    const now = Date.now();
    const image = authUser.image ?? undefined;
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_auth_token_identifier", (query) =>
        query.eq("authTokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    const userId = existingUser
      ? existingUser._id
      : await ctx.db.insert("users", {
          authUserId: authUser._id,
          authTokenIdentifier: identity.tokenIdentifier,
          name: authUser.name,
          email: authUser.email,
          ...(image ? { image } : {}),
          role: "developer",
          createdAt: now,
          updatedAt: now,
        });

    if (existingUser) {
      await ctx.db.patch("users", existingUser._id, {
        authUserId: authUser._id,
        name: authUser.name,
        email: authUser.email,
        image,
        updatedAt: now,
      });
    }

    const existingProfile = await ctx.db
      .query("creatorProfiles")
      .withIndex("by_user_id", (query) => query.eq("userId", userId))
      .unique();
    const creatorSlug = await resolveCreatorSlug(ctx, userId, existingProfile, authUser.name);

    const creatorProfileId = existingProfile
      ? existingProfile._id
      : await ctx.db.insert("creatorProfiles", {
          userId,
          slug: creatorSlug,
          displayName: authUser.name,
          ...(image ? { avatarUrl: image } : {}),
          createdAt: now,
          updatedAt: now,
        });

    if (existingProfile) {
      await ctx.db.patch("creatorProfiles", existingProfile._id, {
        slug: creatorSlug,
        displayName: authUser.name,
        avatarUrl: image,
        updatedAt: now,
      });
    }

    const [user, creatorProfile] = await Promise.all([
      ctx.db.get("users", userId),
      ctx.db.get("creatorProfiles", creatorProfileId),
    ]);

    if (!user || !creatorProfile) {
      throw new ConvexError({
        code: "SYNC_FAILED",
        message: "The application profile could not be synchronized.",
      });
    }

    return { user, creatorProfile };
  },
});

export const getCurrentUser = query({
  args: {},
  returns: v.union(userValidator, v.null()),
  handler: async (ctx) => {
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
  },
});
