import { HOUR, MINUTE, RateLimiter } from "@convex-dev/rate-limiter";
import { ConvexError } from "convex/values";

import { components } from "../_generated/api";

/**
 * Every application rate limit in one place. Keys are per user (Better Auth
 * user ID or Convex token identifier) unless noted.
 */
export const rateLimiter = new RateLimiter(components.rateLimiter, {
  // Per hashed client address and project (see functions/projects/downloads.ts).
  downloads: { kind: "token bucket", rate: 30, period: MINUTE, capacity: 10 },
  // GitHub App installation URLs and callbacks.
  githubInstall: { kind: "token bucket", rate: 10, period: HOUR, capacity: 5 },
  // Read-heavy GitHub API work: repository analysis and state refreshes.
  githubRead: { kind: "token bucket", rate: 120, period: HOUR, capacity: 20 },
  // Commits the managed workflow to a repository.
  workflowInstall: { kind: "token bucket", rate: 10, period: HOUR, capacity: 3 },
  // Draft metadata, workflow, and release selection edits.
  publishingEdit: { kind: "token bucket", rate: 120, period: HOUR, capacity: 30 },
  publishingSubmit: { kind: "token bucket", rate: 20, period: 24 * HOUR, capacity: 5 },
  moderationDecision: { kind: "token bucket", rate: 300, period: HOUR, capacity: 60 },
  userSync: { kind: "token bucket", rate: 60, period: HOUR, capacity: 20 },
  // Global: requests to the webhook endpoint that fail signature checks.
  invalidWebhook: { kind: "token bucket", rate: 60, period: MINUTE, capacity: 60 },
});

export type RateLimitName =
  | "githubInstall"
  | "githubRead"
  | "workflowInstall"
  | "publishingEdit"
  | "publishingSubmit"
  | "moderationDecision"
  | "userSync";

type LimiterCtx = Parameters<typeof rateLimiter.limit>[0];

export async function enforceRateLimit(ctx: LimiterCtx, name: RateLimitName, key: string) {
  const result = await rateLimiter.limit(ctx, name, { key });
  if (!result.ok) {
    throw new ConvexError({
      code: "RATE_LIMITED",
      message: "Too many requests. Please wait a moment and try again.",
      retryAfterMs: result.retryAfter ?? 0,
    });
  }
}
