import { v } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import { type MutationCtx, mutation, query } from "../../_generated/server";
import { authComponent } from "../../auth";
import { normalizeAppRole } from "../../lib/authorization";
import { normalizeSlug } from "../../lib/slugs";
import { creatorProfileValidator, roleValidator } from "../../schema";

const currentUserValidator = v.object({
  id: v.string(),
  name: v.string(),
  email: v.string(),
  image: v.optional(v.string()),
  role: roleValidator,
});

const syncedUserValidator = v.object({
  user: currentUserValidator,
  creatorProfile: creatorProfileValidator,
});

function publicCurrentUser(user: Awaited<ReturnType<typeof authComponent.getAuthUser>>) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    image: user.image ?? undefined,
    role: normalizeAppRole(user.role),
  };
}

async function resolveCreatorSlug(
  ctx: MutationCtx,
  userId: string,
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
    const authUser = await authComponent.getAuthUser(ctx);
    const now = Date.now();
    const image = authUser.image ?? undefined;
    const existingProfile = await ctx.db
      .query("creatorProfiles")
      .withIndex("by_user_id", (query) => query.eq("userId", authUser._id))
      .unique();
    const creatorSlug = await resolveCreatorSlug(ctx, authUser._id, existingProfile, authUser.name);

    const creatorProfileId = existingProfile
      ? existingProfile._id
      : await ctx.db.insert("creatorProfiles", {
          userId: authUser._id,
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

    const creatorProfile = await ctx.db.get("creatorProfiles", creatorProfileId);
    if (!creatorProfile) {
      throw new Error("The creator profile could not be synchronized.");
    }

    return {
      user: publicCurrentUser(authUser),
      creatorProfile,
    };
  },
});

export const getCurrentUser = query({
  args: {},
  returns: v.union(currentUserValidator, v.null()),
  handler: async (ctx) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    return authUser ? publicCurrentUser(authUser) : null;
  },
});
