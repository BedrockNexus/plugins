import betterAuth from "@convex-dev/better-auth/convex.config";
import { defineApp } from "convex/server";
import { v } from "convex/values";

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
  },
});

app.use(betterAuth);

export default app;
