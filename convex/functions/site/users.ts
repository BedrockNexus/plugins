import { v } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import { type MutationCtx, mutation, query } from "../../_generated/server";
import { authComponent } from "../../auth";
import { normalizeAppRole } from "../../lib/authorization";
import { assertUsername, normalizeUsername } from "../../lib/usernames";
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

async function usernameOwner(ctx: MutationCtx, username: string) {
  const [profile, legacyProfile, alias] = await Promise.all([
    ctx.db
      .query("creatorProfiles")
      .withIndex("by_username", (query) => query.eq("username", username))
      .unique(),
    ctx.db
      .query("creatorProfiles")
      .withIndex("by_slug", (query) => query.eq("slug", username))
      .unique(),
    ctx.db
      .query("creatorUsernameAliases")
      .withIndex("by_username", (query) => query.eq("username", username))
      .unique(),
  ]);

  return profile?._id ?? legacyProfile?._id ?? alias?.creatorProfileId ?? null;
}

async function usernameIsAvailable(
  ctx: MutationCtx,
  username: string,
  profile: Doc<"creatorProfiles"> | null,
) {
  const ownerId = await usernameOwner(ctx, username);
  return ownerId === null || ownerId === profile?._id;
}

async function resolveCreatorUsername(
  ctx: MutationCtx,
  userId: string,
  profile: Doc<"creatorProfiles"> | null,
  displayName: string,
  githubUsername?: string,
) {
  if (
    profile?.username &&
    (profile.usernameCustomizedAt || profile.githubUsername || !githubUsername)
  ) {
    return profile.username;
  }

  const baseUsername =
    normalizeUsername(githubUsername ?? "") ||
    normalizeUsername(profile?.slug ?? "") ||
    normalizeUsername(displayName) ||
    "creator";

  if (await usernameIsAvailable(ctx, baseUsername, profile)) {
    return baseUsername;
  }

  const suffix = normalizeUsername(userId).slice(-8) || "profile";
  const suffixedBase = baseUsername.slice(0, Math.max(1, 38 - suffix.length)).replace(/-+$/g, "");

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const suffixWithAttempt = attempt === 0 ? suffix : `${suffix}-${attempt + 1}`;
    const username = normalizeUsername(
      `${suffixedBase.slice(0, Math.max(1, 38 - suffixWithAttempt.length))}-${suffixWithAttempt}`,
    );
    if (await usernameIsAvailable(ctx, username, profile)) {
      return username;
    }
  }

  throw new Error("A unique creator username could not be generated.");
}

async function preserveUsernameAlias(
  ctx: MutationCtx,
  profile: Doc<"creatorProfiles">,
  username: string,
  now: number,
) {
  const existingAlias = await ctx.db
    .query("creatorUsernameAliases")
    .withIndex("by_username", (query) => query.eq("username", username))
    .unique();

  if (!existingAlias) {
    await ctx.db.insert("creatorUsernameAliases", {
      username,
      creatorProfileId: profile._id,
      createdAt: now,
    });
  }
}

export const syncCurrentUser = mutation({
  args: {},
  returns: syncedUserValidator,
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    const now = Date.now();
    const image = authUser.image ?? undefined;
    const githubUsername = authUser.githubUsername ?? undefined;
    const existingProfile = await ctx.db
      .query("creatorProfiles")
      .withIndex("by_user_id", (query) => query.eq("userId", authUser._id))
      .unique();
    const creatorUsername = await resolveCreatorUsername(
      ctx,
      authUser._id,
      existingProfile,
      authUser.name,
      githubUsername,
    );

    const creatorProfileId = existingProfile
      ? existingProfile._id
      : await ctx.db.insert("creatorProfiles", {
          userId: authUser._id,
          username: creatorUsername,
          githubUsername,
          slug: creatorUsername,
          displayName: authUser.name,
          ...(image ? { avatarUrl: image } : {}),
          createdAt: now,
          updatedAt: now,
        });

    if (
      existingProfile &&
      (existingProfile.username !== creatorUsername ||
        existingProfile.slug !== creatorUsername ||
        existingProfile.githubUsername !== githubUsername ||
        existingProfile.displayName !== authUser.name ||
        existingProfile.avatarUrl !== image)
    ) {
      if (existingProfile.slug && existingProfile.slug !== creatorUsername) {
        await preserveUsernameAlias(ctx, existingProfile, existingProfile.slug, now);
      }

      await ctx.db.patch("creatorProfiles", existingProfile._id, {
        username: creatorUsername,
        githubUsername,
        slug: creatorUsername,
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

export const getMyCreatorProfile = query({
  args: {},
  returns: creatorProfileValidator,
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    const profile = await ctx.db
      .query("creatorProfiles")
      .withIndex("by_user_id", (query) => query.eq("userId", authUser._id))
      .unique();

    if (!profile) {
      throw new Error("The creator profile could not be found.");
    }

    return profile;
  },
});

export const updateMyCreatorProfile = mutation({
  args: {
    username: v.string(),
    bio: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
  },
  returns: creatorProfileValidator,
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    const profile = await ctx.db
      .query("creatorProfiles")
      .withIndex("by_user_id", (query) => query.eq("userId", authUser._id))
      .unique();

    if (!profile) {
      throw new Error("The creator profile could not be found.");
    }

    const username = assertUsername(args.username.trim());
    const usernameClaim = await usernameOwner(ctx, username);
    if (usernameClaim && usernameClaim !== profile._id) {
      throw new Error("That username is already in use.");
    }

    const bio = args.bio?.trim();
    if (bio && bio.length > 1_000) {
      throw new Error("Creator bios must be 1,000 characters or fewer.");
    }

    const websiteUrl = args.websiteUrl?.trim();
    if (websiteUrl && websiteUrl.length > 500) {
      throw new Error("Website URLs must be 500 characters or fewer.");
    }
    if (websiteUrl) {
      const url = new URL(websiteUrl);
      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("Website URLs must use HTTP or HTTPS.");
      }
    }

    const previousUsername = profile.username ?? profile.slug;
    if (previousUsername && previousUsername !== username) {
      const aliases = await ctx.db
        .query("creatorUsernameAliases")
        .withIndex("by_creator_profile_id", (query) => query.eq("creatorProfileId", profile._id))
        .take(26);
      if (aliases.length >= 25) {
        throw new Error("This profile has reached the username-change limit.");
      }
      await preserveUsernameAlias(ctx, profile, previousUsername, Date.now());
    }

    const reclaimedAlias = await ctx.db
      .query("creatorUsernameAliases")
      .withIndex("by_username", (query) => query.eq("username", username))
      .unique();
    if (reclaimedAlias?.creatorProfileId === profile._id) {
      await ctx.db.delete(reclaimedAlias._id);
    }

    await ctx.db.patch("creatorProfiles", profile._id, {
      username,
      usernameCustomizedAt: Date.now(),
      slug: username,
      bio: bio || undefined,
      websiteUrl: websiteUrl || undefined,
      updatedAt: Date.now(),
    });

    const updated = await ctx.db.get("creatorProfiles", profile._id);
    if (!updated) {
      throw new Error("The creator profile could not be updated.");
    }

    return updated;
  },
});
