import { v } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import { type MutationCtx, mutation, query } from "../../_generated/server";
import { authComponent } from "../../auth";
import { normalizeAppRole } from "../../lib/authorization";
import { normalizeUsername } from "../../lib/usernames";
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

type SocialAccount = {
  provider: string;
  url: string;
};

function optionalTrimmed(value: string | null | undefined, maxLength: number) {
  const normalized = value?.trim();
  return normalized ? normalized.slice(0, maxLength) : undefined;
}

function parseSocialAccounts(value: string | null | undefined): SocialAccount[] | undefined {
  if (!value) return undefined;

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return undefined;

    const accounts = parsed.flatMap((account): SocialAccount[] => {
      if (!account || typeof account !== "object") return [];
      const provider = "provider" in account ? account.provider : undefined;
      const urlValue = "url" in account ? account.url : undefined;
      if (typeof provider !== "string" || typeof urlValue !== "string") return [];
      try {
        const url = new URL(urlValue);
        if (url.protocol !== "https:" || !url.hostname) return [];
        const normalizedProvider = provider.trim().slice(0, 50);
        return normalizedProvider ? [{ provider: normalizedProvider, url: url.toString() }] : [];
      } catch {
        return [];
      }
    });

    return accounts.length > 0 ? accounts.slice(0, 4) : undefined;
  } catch {
    return undefined;
  }
}

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
    (!githubUsername ||
      (!profile.usernameCustomizedAt && profile.githubUsername === githubUsername))
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
    const bio = optionalTrimmed(authUser.githubBio, 1_000);
    const location = optionalTrimmed(authUser.githubLocation, 200);
    const websiteUrl = optionalTrimmed(authUser.githubWebsite, 500);
    const socialAccounts = parseSocialAccounts(authUser.githubSocialAccounts);
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
          bio,
          location,
          ...(image ? { avatarUrl: image } : {}),
          websiteUrl,
          socialAccounts,
          createdAt: now,
          updatedAt: now,
        });

    if (
      existingProfile &&
      (existingProfile.username !== creatorUsername ||
        existingProfile.slug !== creatorUsername ||
        existingProfile.githubUsername !== githubUsername ||
        existingProfile.displayName !== authUser.name ||
        existingProfile.avatarUrl !== image ||
        existingProfile.bio !== bio ||
        existingProfile.location !== location ||
        existingProfile.websiteUrl !== websiteUrl ||
        JSON.stringify(existingProfile.socialAccounts) !== JSON.stringify(socialAccounts))
    ) {
      if (existingProfile.slug && existingProfile.slug !== creatorUsername) {
        await preserveUsernameAlias(ctx, existingProfile, existingProfile.slug, now);
      }

      const reclaimedAlias = await ctx.db
        .query("creatorUsernameAliases")
        .withIndex("by_username", (query) => query.eq("username", creatorUsername))
        .unique();
      if (reclaimedAlias?.creatorProfileId === existingProfile._id) {
        await ctx.db.delete(reclaimedAlias._id);
      }

      await ctx.db.patch("creatorProfiles", existingProfile._id, {
        username: creatorUsername,
        usernameCustomizedAt: undefined,
        githubUsername,
        slug: creatorUsername,
        displayName: authUser.name,
        avatarUrl: image,
        bio,
        location,
        websiteUrl,
        socialAccounts,
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
