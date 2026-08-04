import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
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

type GitHubSocialAccount = {
  provider: string;
  url: string;
};

function normalizeGitHubWebsite(value: string | null | undefined) {
  const website = value?.trim();
  if (!website) return null;

  try {
    const url = new URL(website.includes("://") ? website : `https://${website}`);
    return ["http:", "https:"].includes(url.protocol) && url.hostname ? url.toString() : null;
  } catch {
    return null;
  }
}

async function fetchGitHubSocialAccounts(
  username: string,
): Promise<GitHubSocialAccount[] | undefined> {
  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/social_accounts`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "BedrockNexus-Plugins",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );
    if (!response.ok) return undefined;

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) return undefined;

    return payload
      .flatMap((account): GitHubSocialAccount[] => {
        if (!account || typeof account !== "object") return [];
        const provider = "provider" in account ? account.provider : undefined;
        const urlValue = "url" in account ? account.url : undefined;
        if (typeof provider !== "string" || typeof urlValue !== "string") return [];
        try {
          const url = new URL(urlValue);
          if (url.protocol !== "https:" || !url.hostname) return [];
          return [{ provider: provider.trim(), url: url.toString() }];
        } catch {
          return [];
        }
      })
      .filter((account) => account.provider.length > 0)
      .slice(0, 4);
  } catch {
    // A secondary GitHub endpoint should never prevent a user from signing in.
    return undefined;
  }
}

export const createAuthOptions = (ctx: GenericCtx<DataModel>) =>
  ({
    appName: "BedrockNexus Plugins",
    baseURL: process.env.SITE_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: false,
    },
    hooks: {
      before: createAuthMiddleware(async (request) => {
        if (request.path === "/update-user") {
          throw new APIError("BAD_REQUEST", {
            message: "Profile fields are managed by the linked GitHub account.",
          });
        }
      }),
    },
    user: {
      additionalFields: {
        githubUsername: {
          type: "string",
          required: false,
          input: true,
          returned: true,
        },
        githubBio: {
          type: "string",
          required: false,
          input: true,
          returned: true,
        },
        githubLocation: {
          type: "string",
          required: false,
          input: true,
          returned: true,
        },
        githubWebsite: {
          type: "string",
          required: false,
          input: true,
          returned: true,
        },
        githubSocialAccounts: {
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
              mapProfileToUser: async (profile) => {
                const socialAccounts = await fetchGitHubSocialAccounts(profile.login);
                return {
                  githubUsername: profile.login,
                  githubBio: profile.bio?.trim() || null,
                  githubLocation: profile.location?.trim() || null,
                  githubWebsite: normalizeGitHubWebsite(profile.blog),
                  ...(socialAccounts
                    ? { githubSocialAccounts: JSON.stringify(socialAccounts) }
                    : {}),
                  image: profile.avatar_url,
                };
              },
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
