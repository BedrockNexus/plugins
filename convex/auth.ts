import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { admin, organization } from "better-auth/plugins";
import { adminAc, userAc } from "better-auth/plugins/admin/access";

import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import authConfig from "./auth.config";
import authSchema from "./betterAuth/schema";

export const authComponent = createClient<DataModel, typeof authSchema>(components.betterAuth, {
  local: {
    schema: authSchema,
  },
});

const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

export const createAuthOptions = (ctx: GenericCtx<DataModel>) =>
  ({
    appName: "BedrockNexus Plugins",
    baseURL: process.env.SITE_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: false,
    },
    socialProviders:
      githubClientId && githubClientSecret
        ? {
            github: {
              clientId: githubClientId,
              clientSecret: githubClientSecret,
              scope: ["read:user", "user:email"],
            },
          }
        : {},
    plugins: [
      convex({ authConfig }),
      organization(),
      admin({
        defaultRole: "developer",
        adminRoles: ["admin"],
        roles: {
          developer: userAc,
          verifiedCreator: userAc,
          moderator: userAc,
          admin: adminAc,
        },
      }),
    ],
  }) satisfies BetterAuthOptions;

export const createAuth = (ctx: GenericCtx<DataModel>) => betterAuth(createAuthOptions(ctx));

export const { getAuthUser } = authComponent.clientApi();
