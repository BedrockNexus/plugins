import { ConvexError, v } from "convex/values";

import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { internalMutation, type MutationCtx } from "../_generated/server";
import { moderatorQuery } from "../lib/authorization";
import { githubInstallationInputValidator, githubRepositoryInputValidator } from "./validators";

const normalizedWebhookValidator = v.object({
  event: v.string(),
  action: v.optional(v.string()),
  installation: v.optional(githubInstallationInputValidator),
  repository: v.optional(githubRepositoryInputValidator),
  repositoriesAdded: v.array(githubRepositoryInputValidator),
  repositoryIdsRemoved: v.array(v.number()),
});

const terminalAttemptStatusValidator = v.union(
  v.literal("processed"),
  v.literal("failed"),
  v.literal("ignored"),
  v.literal("duplicate"),
);

async function completeAttempt(
  ctx: MutationCtx,
  webhookDeliveryId: Id<"webhookDeliveries">,
  attemptNumber: number,
  status: "processed" | "failed" | "ignored" | "duplicate",
  error?: string,
) {
  const attempt = await ctx.db
    .query("webhookDeliveryAttempts")
    .withIndex("by_webhook_delivery_id_and_attempt_number", (query) =>
      query.eq("webhookDeliveryId", webhookDeliveryId).eq("attemptNumber", attemptNumber),
    )
    .unique();

  if (!attempt) {
    throw new ConvexError({
      code: "DELIVERY_ATTEMPT_NOT_FOUND",
      message: "The webhook delivery attempt was not found.",
    });
  }

  await ctx.db.patch("webhookDeliveryAttempts", attempt._id, {
    status,
    error,
    completedAt: Date.now(),
  });
}

export const claimDelivery = internalMutation({
  args: {
    deliveryId: v.string(),
    event: v.string(),
    action: v.optional(v.string()),
    payloadDigest: v.string(),
    receivedAt: v.number(),
  },
  returns: v.object({
    webhookDeliveryId: v.id("webhookDeliveries"),
    attemptNumber: v.number(),
    shouldProcess: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("webhookDeliveries")
      .withIndex("by_delivery_id", (query) => query.eq("deliveryId", args.deliveryId))
      .unique();
    const now = Date.now();

    if (existing) {
      if (existing.payloadDigest && existing.payloadDigest !== args.payloadDigest) {
        throw new ConvexError({
          code: "DELIVERY_PAYLOAD_MISMATCH",
          message: "A GitHub delivery ID was reused with a different payload.",
        });
      }

      const attemptNumber = existing.attemptCount + 1;
      const shouldProcess = existing.status === "failed";

      await ctx.db.patch("webhookDeliveries", existing._id, {
        attemptCount: attemptNumber,
        ...(shouldProcess
          ? {
              status: "processing" as const,
              lastError: undefined,
              claimedAt: now,
              updatedAt: now,
            }
          : { updatedAt: now }),
      });
      await ctx.db.insert("webhookDeliveryAttempts", {
        webhookDeliveryId: existing._id,
        attemptNumber,
        status: shouldProcess ? "processing" : "duplicate",
        startedAt: now,
        ...(shouldProcess ? {} : { completedAt: now }),
        createdAt: now,
      });

      return {
        webhookDeliveryId: existing._id,
        attemptNumber,
        shouldProcess,
      };
    }

    const webhookDeliveryId = await ctx.db.insert("webhookDeliveries", {
      deliveryId: args.deliveryId,
      event: args.event,
      action: args.action,
      status: "processing",
      attemptCount: 1,
      payloadDigest: args.payloadDigest,
      claimedAt: now,
      receivedAt: args.receivedAt,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("webhookDeliveryAttempts", {
      webhookDeliveryId,
      attemptNumber: 1,
      status: "processing",
      startedAt: now,
      createdAt: now,
    });

    return {
      webhookDeliveryId,
      attemptNumber: 1,
      shouldProcess: true,
    };
  },
});

export const processDelivery = internalMutation({
  args: {
    webhookDeliveryId: v.id("webhookDeliveries"),
    attemptNumber: v.number(),
    payload: normalizedWebhookValidator,
  },
  returns: v.object({
    status: v.union(v.literal("processed"), v.literal("ignored")),
  }),
  handler: async (ctx, args) => {
    const delivery = await ctx.db.get("webhookDeliveries", args.webhookDeliveryId);

    if (delivery?.status !== "processing") {
      throw new ConvexError({
        code: "DELIVERY_NOT_PROCESSING",
        message: "The webhook delivery is not available for processing.",
      });
    }

    const supported =
      args.payload.event === "installation" ||
      args.payload.event === "installation_repositories" ||
      args.payload.event === "repository" ||
      args.payload.event === "push" ||
      args.payload.event === "workflow_run" ||
      args.payload.event === "release";

    if (!supported) {
      const now = Date.now();
      await completeAttempt(ctx, args.webhookDeliveryId, args.attemptNumber, "ignored");
      await ctx.db.patch("webhookDeliveries", args.webhookDeliveryId, {
        status: "ignored",
        processedAt: now,
        completedAt: now,
        updatedAt: now,
      });
      return { status: "ignored" as const };
    }

    let installationDocumentId = delivery.installationId;

    if (args.payload.installation) {
      installationDocumentId = await ctx.runMutation(
        internal.github.installations.upsertInstallationFromWebhook,
        {
          installation: args.payload.installation,
          syncStartedAt: Date.now(),
        },
      );
      await ctx.db.patch("webhookDeliveries", args.webhookDeliveryId, {
        installationId: installationDocumentId,
      });
    }

    if (
      args.payload.event === "installation" &&
      args.payload.action === "deleted" &&
      installationDocumentId
    ) {
      await ctx.scheduler.runAfter(0, internal.github.installations.markAllRepositoriesRemoved, {
        installationDocumentId,
      });
    }

    if (installationDocumentId && args.payload.repositoriesAdded.length > 0) {
      await ctx.runMutation(internal.github.installations.syncRepositoryBatch, {
        installationDocumentId,
        syncStartedAt: Date.now(),
        repositories: args.payload.repositoriesAdded,
      });
    }

    const payloadRepository = args.payload.repository;

    for (const githubRepositoryId of args.payload.repositoryIdsRemoved) {
      const repository = await ctx.db
        .query("repositories")
        .withIndex("by_github_repository_id", (query) =>
          query.eq("githubRepositoryId", githubRepositoryId),
        )
        .unique();

      if (repository) {
        await ctx.db.patch("repositories", repository._id, {
          accessStatus: "removed",
          updatedAt: Date.now(),
        });
      }
    }

    if (payloadRepository && installationDocumentId) {
      if (args.payload.action === "deleted" || args.payload.action === "transferred") {
        const repository = await ctx.db
          .query("repositories")
          .withIndex("by_github_repository_id", (query) =>
            query.eq("githubRepositoryId", payloadRepository.githubRepositoryId),
          )
          .unique();
        if (repository) {
          await ctx.db.patch("repositories", repository._id, {
            accessStatus: "removed",
            updatedAt: Date.now(),
          });
        }
      } else {
        await ctx.runMutation(internal.github.installations.syncRepositoryBatch, {
          installationDocumentId,
          syncStartedAt: Date.now(),
          repositories: [payloadRepository],
        });
      }
    }

    const repository = payloadRepository
      ? await ctx.db
          .query("repositories")
          .withIndex("by_github_repository_id", (query) =>
            query.eq("githubRepositoryId", payloadRepository.githubRepositoryId),
          )
          .unique()
      : null;
    const now = Date.now();

    await completeAttempt(ctx, args.webhookDeliveryId, args.attemptNumber, "processed");
    await ctx.db.patch("webhookDeliveries", args.webhookDeliveryId, {
      ...(repository ? { repositoryId: repository._id } : {}),
      status: "processed",
      processedAt: now,
      completedAt: now,
      lastError: undefined,
      updatedAt: now,
    });

    return { status: "processed" as const };
  },
});

export const failDelivery = internalMutation({
  args: {
    webhookDeliveryId: v.id("webhookDeliveries"),
    attemptNumber: v.number(),
    error: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    await completeAttempt(ctx, args.webhookDeliveryId, args.attemptNumber, "failed", args.error);
    await ctx.db.patch("webhookDeliveries", args.webhookDeliveryId, {
      status: "failed",
      lastError: args.error,
      updatedAt: now,
    });
    return null;
  },
});

const deliveryAttemptValidator = v.object({
  _id: v.id("webhookDeliveryAttempts"),
  _creationTime: v.number(),
  webhookDeliveryId: v.id("webhookDeliveries"),
  attemptNumber: v.number(),
  status: v.union(v.literal("processing"), terminalAttemptStatusValidator),
  error: v.optional(v.string()),
  startedAt: v.number(),
  completedAt: v.optional(v.number()),
  createdAt: v.number(),
});

const deliverySummaryValidator = v.object({
  _id: v.id("webhookDeliveries"),
  deliveryId: v.string(),
  event: v.string(),
  action: v.optional(v.string()),
  status: v.union(
    v.literal("received"),
    v.literal("processing"),
    v.literal("processed"),
    v.literal("failed"),
    v.literal("ignored"),
  ),
  attemptCount: v.number(),
  lastError: v.optional(v.string()),
  receivedAt: v.number(),
  processedAt: v.optional(v.number()),
  attempts: v.array(deliveryAttemptValidator),
});

export const listRecent = moderatorQuery({
  args: {},
  returns: v.array(deliverySummaryValidator),
  handler: async (ctx) => {
    const deliveries = await ctx.db.query("webhookDeliveries").order("desc").take(50);
    const result = [];

    for (const delivery of deliveries) {
      const attempts = await ctx.db
        .query("webhookDeliveryAttempts")
        .withIndex("by_webhook_delivery_id", (query) => query.eq("webhookDeliveryId", delivery._id))
        .order("desc")
        .take(10);
      result.push({
        _id: delivery._id,
        deliveryId: delivery.deliveryId,
        event: delivery.event,
        action: delivery.action,
        status: delivery.status,
        attemptCount: delivery.attemptCount,
        lastError: delivery.lastError,
        receivedAt: delivery.receivedAt,
        processedAt: delivery.processedAt,
        attempts,
      });
    }

    return result;
  },
});
