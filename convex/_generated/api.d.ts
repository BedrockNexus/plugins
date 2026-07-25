/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as github_actions from "../github/actions.js";
import type * as github_installations from "../github/installations.js";
import type * as github_lib_app from "../github/lib/app.js";
import type * as github_validators from "../github/validators.js";
import type * as github_webhookHttp from "../github/webhookHttp.js";
import type * as github_webhookPayload from "../github/webhookPayload.js";
import type * as github_webhookSignature from "../github/webhookSignature.js";
import type * as github_webhooks from "../github/webhooks.js";
import type * as http from "../http.js";
import type * as lib_authorization from "../lib/authorization.js";
import type * as lib_domainAuthorization from "../lib/domainAuthorization.js";
import type * as lib_slugs from "../lib/slugs.js";
import type * as moderation from "../moderation.js";
import type * as organizations from "../organizations.js";
import type * as projects from "../projects.js";
import type * as serverSoftware from "../serverSoftware.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  "github/actions": typeof github_actions;
  "github/installations": typeof github_installations;
  "github/lib/app": typeof github_lib_app;
  "github/validators": typeof github_validators;
  "github/webhookHttp": typeof github_webhookHttp;
  "github/webhookPayload": typeof github_webhookPayload;
  "github/webhookSignature": typeof github_webhookSignature;
  "github/webhooks": typeof github_webhooks;
  http: typeof http;
  "lib/authorization": typeof lib_authorization;
  "lib/domainAuthorization": typeof lib_domainAuthorization;
  "lib/slugs": typeof lib_slugs;
  moderation: typeof moderation;
  organizations: typeof organizations;
  projects: typeof projects;
  serverSoftware: typeof serverSoftware;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
};
