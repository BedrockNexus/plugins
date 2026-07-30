import { v } from "convex/values";

import { components } from "../../_generated/api";
import { internalMutation, type MutationCtx } from "../../_generated/server";

type OrganizationMembership = {
  role: string;
};

type AdapterPage<T> = {
  continueCursor: string;
  isDone: boolean;
  page: T[];
};

async function ownsOrganization(ctx: MutationCtx, userId: string) {
  let cursor: string | null = null;

  while (true) {
    const result: AdapterPage<OrganizationMembership> = await ctx.runQuery(
      components.betterAuth.adapter.findMany,
      {
        model: "member",
        where: [{ field: "userId", value: userId }],
        paginationOpts: { cursor, numItems: 100 },
      },
    );

    if (
      result.page.some((membership) => membership.role.split(",").some((role) => role === "owner"))
    ) {
      return true;
    }

    if (result.isDone) {
      return false;
    }

    cursor = result.continueCursor;
  }
}

async function removeOrganizationMemberships(ctx: MutationCtx, userId: string) {
  while (true) {
    const result = await ctx.runMutation(components.betterAuth.adapter.deleteMany, {
      input: {
        model: "member",
        where: [{ field: "userId", value: userId }],
      },
      paginationOpts: { cursor: null, numItems: 100 },
    });

    if (result.count === 0 || result.isDone) {
      return;
    }
  }
}

export const prepare = internalMutation({
  args: {
    userId: v.string(),
  },
  returns: v.union(v.null(), v.string()),
  handler: async (ctx, args) => {
    const [ownedProject, ownedDraft, ownedInstallation, creatorProfile, organizationOwner] =
      await Promise.all([
        ctx.db
          .query("projects")
          .withIndex("by_owner_type_and_owner_id", (query) =>
            query.eq("ownerType", "user").eq("ownerId", args.userId),
          )
          .first(),
        ctx.db
          .query("publishingDrafts")
          .withIndex("by_owner_type_and_owner_id", (query) =>
            query.eq("ownerType", "user").eq("ownerId", args.userId),
          )
          .first(),
        ctx.db
          .query("githubInstallations")
          .withIndex("by_owner_type_and_owner_id", (query) =>
            query.eq("ownerType", "user").eq("ownerId", args.userId),
          )
          .first(),
        ctx.db
          .query("creatorProfiles")
          .withIndex("by_user_id", (query) => query.eq("userId", args.userId))
          .unique(),
        ownsOrganization(ctx, args.userId),
      ]);

    if (organizationOwner) {
      return "Transfer or delete every organization you own before deleting your account.";
    }

    if (ownedProject || ownedDraft) {
      return "Transfer or remove your personal projects before deleting your account.";
    }

    if (ownedInstallation) {
      return "Disconnect your personal GitHub App installation before deleting your account.";
    }

    if (creatorProfile) {
      const attributedProject = await ctx.db
        .query("projects")
        .withIndex("by_creator_profile_id", (query) =>
          query.eq("creatorProfileId", creatorProfile._id),
        )
        .first();

      if (attributedProject) {
        return "Transfer projects attributed to your creator profile before deleting your account.";
      }
    }

    await removeOrganizationMemberships(ctx, args.userId);

    if (creatorProfile) {
      const usernameAliases = await ctx.db
        .query("creatorUsernameAliases")
        .withIndex("by_creator_profile_id", (query) =>
          query.eq("creatorProfileId", creatorProfile._id),
        )
        .take(26);
      for (const alias of usernameAliases) {
        await ctx.db.delete(alias._id);
      }
      await ctx.db.delete(creatorProfile._id);
    }

    return null;
  },
});
