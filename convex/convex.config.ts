import aggregate from "@convex-dev/aggregate/convex.config.js";
import migrations from "@convex-dev/migrations/convex.config.js";
import rateLimiter from "@convex-dev/rate-limiter/convex.config.js";
import shardedCounter from "@convex-dev/sharded-counter/convex.config.js";
import { defineApp } from "convex/server";
import { v } from "convex/values";
import betterAuth from "./betterAuth/convex.config";

const app = defineApp({
  env: {
    SITE_URL: v.string(),
    BETTER_AUTH_SECRET: v.string(),
    GITHUB_CLIENT_ID: v.optional(v.string()),
    GITHUB_CLIENT_SECRET: v.optional(v.string()),
    GITHUB_APP_ID: v.optional(v.string()),
    GITHUB_APP_CLIENT_ID: v.optional(v.string()),
    GITHUB_APP_CLIENT_SECRET: v.optional(v.string()),
    GITHUB_APP_PRIVATE_KEY: v.optional(v.string()),
    GITHUB_APP_WEBHOOK_SECRET: v.optional(v.string()),
    GITHUB_APP_SLUG: v.optional(v.string()),
    DOWNLOAD_REDIRECT_SECRET: v.optional(v.string()),
  },
});

app.use(betterAuth);
app.use(aggregate, { name: "projectsBySoftware" });
app.use(aggregate, { name: "projectsByOwner" });
app.use(migrations);
app.use(rateLimiter);
app.use(shardedCounter, { name: "projectDownloadCounts" });
app.use(shardedCounter, { name: "ownerDownloadCounts" });

export default app;
