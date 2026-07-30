import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { admin, organization } from "better-auth/plugins";
import { adminAc, userAc } from "better-auth/plugins/admin/access";

import { components, internal } from "./_generated/api";
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
    user: {
      additionalFields: {
        githubUsername: {
          type: "string",
          required: false,
          input: true,
          returned: true,
        },
      },
      deleteUser: {
        enabled: true,
        beforeDelete: async (user) => {
          if (!("runMutation" in ctx)) {
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: "Account deletion is unavailable in this context.",
            });
          }

          const blocker = await ctx.runMutation(internal.functions.site.accountDeletion.prepare, {
            userId: user.id,
          });

          if (blocker) {
            throw new APIError("BAD_REQUEST", {
              message: blocker,
            });
          }
        },
      },
    },
    socialProviders:
      githubClientId && githubClientSecret
        ? {
            github: {
              clientId: githubClientId,
              clientSecret: githubClientSecret,
              scope: ["read:user", "user:email"],
              overrideUserInfoOnSignIn: true,
              mapProfileToUser: (profile) => ({
                githubUsername: profile.login,
              }),
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
