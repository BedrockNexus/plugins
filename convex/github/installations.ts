import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";

import { internal } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";
import {
  internalMutation,
  internalQuery,
  type MutationCtx,
  type QueryCtx,
} from "../_generated/server";
import { authenticatedQuery } from "../lib/authorization";
import { githubInstallationValidator, repositoryValidator } from "../schema";
import { githubInstallationInputValidator, githubRepositoryInputValidator } from "./validators";

async function getUserByTokenIdentifier(ctx: QueryCtx | MutationCtx, tokenIdentifier: string) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_auth_token_identifier", (query) =>
      query.eq("authTokenIdentifier", tokenIdentifier),
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

export const createInstallIntent = internalMutation({
  args: {
    tokenIdentifier: v.string(),
    stateHash: v.string(),
    expiresAt: v.number(),
  },
  returns: v.id("githubInstallIntents"),
  handler: async (ctx, args) => {
    const user = await getUserByTokenIdentifier(ctx, args.tokenIdentifier);
    const now = Date.now();

    return await ctx.db.insert("githubInstallIntents", {
      stateHash: args.stateHash,
      userId: user._id,
      status: "pending",
      expiresAt: args.expiresAt,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const validateInstallIntent = internalQuery({
  args: {
    tokenIdentifier: v.string(),
    stateHash: v.string(),
    now: v.number(),
  },
  returns: v.object({
    intentId: v.id("githubInstallIntents"),
    userId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    installationId: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    const user = await getUserByTokenIdentifier(ctx, args.tokenIdentifier);
    const intent = await ctx.db
      .query("githubInstallIntents")
      .withIndex("by_state_hash", (query) => query.eq("stateHash", args.stateHash))
      .unique();

    if (!intent || intent.userId !== user._id || intent.expiresAt < args.now) {
      throw new ConvexError({
        code: "INVALID_INSTALL_STATE",
        message: "The GitHub App installation state is invalid or expired.",
      });
    }

    return {
      intentId: intent._id,
      userId: user._id,
      status: intent.status,
      ...(intent.installationId ? { installationId: intent.installationId } : {}),
    };
  },
});

export const beginInstallIntent = internalMutation({
  args: {
    tokenIdentifier: v.string(),
    stateHash: v.string(),
  },
  returns: v.object({
    intentId: v.id("githubInstallIntents"),
  }),
  handler: async (ctx, args) => {
    const user = await getUserByTokenIdentifier(ctx, args.tokenIdentifier);
    const intent = await ctx.db
      .query("githubInstallIntents")
      .withIndex("by_state_hash", (query) => query.eq("stateHash", args.stateHash))
      .unique();
    const now = Date.now();

    if (
      !intent ||
      intent.userId !== user._id ||
      intent.expiresAt < now ||
      intent.status !== "pending"
    ) {
      throw new ConvexError({
        code: "INVALID_INSTALL_STATE",
        message: "The GitHub App installation state is invalid, expired, or already used.",
      });
    }

    await ctx.db.patch("githubInstallIntents", intent._id, {
      status: "processing",
      updatedAt: now,
    });

    return { intentId: intent._id };
  },
});

export const claimInstallationFromCallback = internalMutation({
  args: {
    tokenIdentifier: v.string(),
    stateHash: v.string(),
    installation: githubInstallationInputValidator,
    syncStartedAt: v.number(),
  },
  returns: v.object({
    installationDocumentId: v.id("githubInstallations"),
    intentId: v.id("githubInstallIntents"),
  }),
  handler: async (ctx, args) => {
    const user = await getUserByTokenIdentifier(ctx, args.tokenIdentifier);
    const intent = await ctx.db
      .query("githubInstallIntents")
      .withIndex("by_state_hash", (query) => query.eq("stateHash", args.stateHash))
      .unique();
    const now = Date.now();

    if (
      !intent ||
      intent.userId !== user._id ||
      intent.expiresAt < now ||
      intent.status !== "processing"
    ) {
      throw new ConvexError({
        code: "INVALID_INSTALL_STATE",
        message: "The GitHub App installation state is invalid, expired, or already used.",
      });
    }

    const existing = await ctx.db
      .query("githubInstallations")
      .withIndex("by_installation_id", (query) =>
        query.eq("installationId", args.installation.installationId),
      )
      .unique();

    if (existing?.ownerUserId && existing.ownerUserId !== user._id) {
      throw new ConvexError({
        code: "INSTALLATION_ALREADY_CLAIMED",
        message: "This GitHub App installation is already connected.",
      });
    }

    const installationValues = {
      accountId: args.installation.account.id,
      accountLogin: args.installation.account.login,
      accountType: args.installation.account.type,
      accountAvatarUrl: args.installation.account.avatarUrl,
      ownerUserId: user._id,
      repositorySelection: args.installation.repositorySelection,
      status: args.installation.status,
      suspendedAt: args.installation.suspendedAt,
      syncStartedAt: args.syncStartedAt,
      updatedAt: now,
    };

    const installationDocumentId = existing
      ? existing._id
      : await ctx.db.insert("githubInstallations", {
          installationId: args.installation.installationId,
          ...installationValues,
          createdAt: now,
        });

    if (existing) {
      await ctx.db.patch("githubInstallations", installationDocumentId, installationValues);
    }

    await ctx.db.patch("githubInstallIntents", intent._id, {
      status: "processing",
      installationId: args.installation.installationId,
      lastError: undefined,
      updatedAt: now,
    });

    return { installationDocumentId, intentId: intent._id };
  },
});

export const upsertInstallationFromWebhook = internalMutation({
  args: {
    installation: githubInstallationInputValidator,
    syncStartedAt: v.number(),
  },
  returns: v.id("githubInstallations"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("githubInstallations")
      .withIndex("by_installation_id", (query) =>
        query.eq("installationId", args.installation.installationId),
      )
      .unique();
    const now = Date.now();
    const values = {
      accountId: args.installation.account.id,
      accountLogin: args.installation.account.login,
      accountType: args.installation.account.type,
      accountAvatarUrl: args.installation.account.avatarUrl,
      repositorySelection: args.installation.repositorySelection,
      status: args.installation.status,
      suspendedAt: args.installation.suspendedAt,
      syncStartedAt: args.syncStartedAt,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch("githubInstallations", existing._id, values);
      return existing._id;
    }

    return await ctx.db.insert("githubInstallations", {
      installationId: args.installation.installationId,
      ...values,
      createdAt: now,
    });
  },
});

export const syncRepositoryBatch = internalMutation({
  args: {
    installationDocumentId: v.id("githubInstallations"),
    syncStartedAt: v.number(),
    repositories: v.array(githubRepositoryInputValidator),
  },
  returns: v.object({
    granted: v.number(),
    ineligible: v.number(),
  }),
  handler: async (ctx, args) => {
    let granted = 0;
    let ineligible = 0;

    for (const repository of args.repositories) {
      const existing = await ctx.db
        .query("repositories")
        .withIndex("by_github_repository_id", (query) =>
          query.eq("githubRepositoryId", repository.githubRepositoryId),
        )
        .unique();
      const now = Date.now();
      const accessStatus = repository.isPrivate ? "ineligible" : "granted";

      if (repository.isPrivate && !existing) {
        ineligible += 1;
        continue;
      }

      const values = {
        installationId: args.installationDocumentId,
        ownerLogin: repository.ownerLogin,
        name: repository.name,
        fullName: repository.fullName,
        description: repository.description,
        htmlUrl: repository.htmlUrl,
        defaultBranch: repository.defaultBranch,
        primaryLanguage: repository.primaryLanguage,
        isPrivate: repository.isPrivate,
        isArchived: repository.isArchived,
        accessStatus,
        githubUpdatedAt: repository.githubUpdatedAt,
        pushedAt: repository.pushedAt,
        lastSeenAt: args.syncStartedAt,
        updatedAt: now,
      } as const;

      if (existing) {
        await ctx.db.patch("repositories", existing._id, values);
      } else {
        await ctx.db.insert("repositories", {
          githubRepositoryId: repository.githubRepositoryId,
          ...values,
          createdAt: now,
        });
      }

      if (accessStatus === "granted") {
        granted += 1;
      } else {
        ineligible += 1;
      }
    }

    return { granted, ineligible };
  },
});

export const markMissingRepositoriesRemoved = internalMutation({
  args: {
    installationDocumentId: v.id("githubInstallations"),
    syncStartedAt: v.number(),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    continueCursor: v.string(),
    isDone: v.boolean(),
    updated: v.number(),
  }),
  handler: async (ctx, args) => {
    const page = await ctx.db
      .query("repositories")
      .withIndex("by_installation_id", (query) =>
        query.eq("installationId", args.installationDocumentId),
      )
      .paginate(args.paginationOpts);
    let updated = 0;

    for (const repository of page.page) {
      if (repository.lastSeenAt !== args.syncStartedAt && repository.accessStatus !== "removed") {
        await ctx.db.patch("repositories", repository._id, {
          accessStatus: "removed",
          updatedAt: Date.now(),
        });
        updated += 1;
      }
    }

    return {
      continueCursor: page.continueCursor,
      isDone: page.isDone,
      updated,
    };
  },
});

export const markAllRepositoriesRemoved = internalMutation({
  args: {
    installationDocumentId: v.id("githubInstallations"),
    accessStatus: v.optional(v.union(v.literal("granted"), v.literal("ineligible"))),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const accessStatus = args.accessStatus ?? "granted";
    const repositories = await ctx.db
      .query("repositories")
      .withIndex("by_installation_id_and_access_status", (query) =>
        query.eq("installationId", args.installationDocumentId).eq("accessStatus", accessStatus),
      )
      .take(100);

    for (const repository of repositories) {
      await ctx.db.patch("repositories", repository._id, {
        accessStatus: "removed",
        updatedAt: Date.now(),
      });
    }

    if (repositories.length === 100) {
      await ctx.scheduler.runAfter(0, internal.github.installations.markAllRepositoriesRemoved, {
        installationDocumentId: args.installationDocumentId,
        accessStatus,
      });
    } else if (accessStatus === "granted") {
      await ctx.scheduler.runAfter(0, internal.github.installations.markAllRepositoriesRemoved, {
        installationDocumentId: args.installationDocumentId,
        accessStatus: "ineligible",
      });
    }

    return null;
  },
});

export const finishInstallationSync = internalMutation({
  args: {
    installationDocumentId: v.id("githubInstallations"),
    intentId: v.optional(v.id("githubInstallIntents")),
    syncStartedAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch("githubInstallations", args.installationDocumentId, {
      lastSyncAt: args.syncStartedAt,
      updatedAt: now,
    });

    if (args.intentId) {
      await ctx.db.patch("githubInstallIntents", args.intentId, {
        status: "completed",
        lastError: undefined,
        updatedAt: now,
      });
    }

    return null;
  },
});

export const failInstallIntent = internalMutation({
  args: {
    intentId: v.id("githubInstallIntents"),
    error: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch("githubInstallIntents", args.intentId, {
      status: "failed",
      lastError: args.error,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const getInstallationAccess = internalQuery({
  args: {
    tokenIdentifier: v.string(),
    installationDocumentId: v.id("githubInstallations"),
  },
  returns: v.object({
    installationId: v.number(),
  }),
  handler: async (ctx, args) => {
    const user = await getUserByTokenIdentifier(ctx, args.tokenIdentifier);
    const installation = await ctx.db.get("githubInstallations", args.installationDocumentId);

    if (!installation || installation.ownerUserId !== user._id) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "You do not manage this GitHub App installation.",
      });
    }

    return { installationId: installation.installationId };
  },
});

export const getRepositoryAccess = internalQuery({
  args: {
    tokenIdentifier: v.string(),
    repositoryId: v.id("repositories"),
  },
  returns: v.object({
    installationId: v.number(),
    repositoryId: v.id("repositories"),
    ownerLogin: v.string(),
    name: v.string(),
    fullName: v.string(),
    defaultBranch: v.string(),
  }),
  handler: async (ctx, args) => {
    const user = await getUserByTokenIdentifier(ctx, args.tokenIdentifier);
    const repository = await ctx.db.get("repositories", args.repositoryId);

    if (!repository || repository.isPrivate || repository.accessStatus !== "granted") {
      throw new ConvexError({
        code: "REPOSITORY_INELIGIBLE",
        message: "Only granted public repositories can be inspected.",
      });
    }

    const installation = await ctx.db.get("githubInstallations", repository.installationId);

    if (!installation || installation.ownerUserId !== user._id) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "You do not manage this GitHub repository.",
      });
    }

    return {
      installationId: installation.installationId,
      repositoryId: repository._id,
      ownerLogin: repository.ownerLogin,
      name: repository.name,
      fullName: repository.fullName,
      defaultBranch: repository.defaultBranch,
    };
  },
});

const installationWithRepositoriesValidator = v.object({
  installation: githubInstallationValidator,
  repositories: v.array(repositoryValidator),
});

export const listMine = authenticatedQuery({
  args: {},
  returns: v.array(installationWithRepositoriesValidator),
  handler: async (ctx) => {
    const installations = await ctx.db
      .query("githubInstallations")
      .withIndex("by_owner_user_id", (query) => query.eq("ownerUserId", ctx.user._id))
      .take(20);
    const result: Array<{
      installation: Doc<"githubInstallations">;
      repositories: Array<Doc<"repositories">>;
    }> = [];

    for (const installation of installations) {
      const repositories = await ctx.db
        .query("repositories")
        .withIndex("by_installation_id_and_access_status", (query) =>
          query.eq("installationId", installation._id).eq("accessStatus", "granted"),
        )
        .take(100);

      result.push({
        installation,
        repositories: repositories.filter((repository) => !repository.isPrivate),
      });
    }

    return result;
  },
});
