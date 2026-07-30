/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as functions_admin_workflows from "../functions/admin/workflows.js";
import type * as functions_github_actions from "../functions/github/actions.js";
import type * as functions_github_installations from "../functions/github/installations.js";
import type * as functions_github_lib_app from "../functions/github/lib/app.js";
import type * as functions_github_validators from "../functions/github/validators.js";
import type * as functions_github_webhookHttp from "../functions/github/webhookHttp.js";
import type * as functions_github_webhookPayload from "../functions/github/webhookPayload.js";
import type * as functions_github_webhookSignature from "../functions/github/webhookSignature.js";
import type * as functions_github_webhooks from "../functions/github/webhooks.js";
import type * as functions_projects_downloads from "../functions/projects/downloads.js";
import type * as functions_projects_projects from "../functions/projects/projects.js";
import type * as functions_projects_publishing_actions from "../functions/projects/publishing/actions.js";
import type * as functions_projects_publishing_model from "../functions/projects/publishing/model.js";
import type * as functions_site_accountDeletion from "../functions/site/accountDeletion.js";
import type * as functions_site_admin from "../functions/site/admin.js";
import type * as functions_site_catalog from "../functions/site/catalog.js";
import type * as functions_site_moderation from "../functions/site/moderation.js";
import type * as functions_site_organizations from "../functions/site/organizations.js";
import type * as functions_site_serverSoftware from "../functions/site/serverSoftware.js";
import type * as functions_site_users from "../functions/site/users.js";
import type * as http from "../http.js";
import type * as lib_authorization from "../lib/authorization.js";
import type * as lib_domainAuthorization from "../lib/domainAuthorization.js";
import type * as lib_downloadCounts from "../lib/downloadCounts.js";
import type * as lib_projectAggregates from "../lib/projectAggregates.js";
import type * as lib_slugs from "../lib/slugs.js";
import type * as lib_usernames from "../lib/usernames.js";
import type * as lib_workflowTemplates from "../lib/workflowTemplates.js";
import type * as schemas_domain from "../schemas/domain.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "functions/admin/workflows": typeof functions_admin_workflows;
  "functions/github/actions": typeof functions_github_actions;
  "functions/github/installations": typeof functions_github_installations;
  "functions/github/lib/app": typeof functions_github_lib_app;
  "functions/github/validators": typeof functions_github_validators;
  "functions/github/webhookHttp": typeof functions_github_webhookHttp;
  "functions/github/webhookPayload": typeof functions_github_webhookPayload;
  "functions/github/webhookSignature": typeof functions_github_webhookSignature;
  "functions/github/webhooks": typeof functions_github_webhooks;
  "functions/projects/downloads": typeof functions_projects_downloads;
  "functions/projects/projects": typeof functions_projects_projects;
  "functions/projects/publishing/actions": typeof functions_projects_publishing_actions;
  "functions/projects/publishing/model": typeof functions_projects_publishing_model;
  "functions/site/accountDeletion": typeof functions_site_accountDeletion;
  "functions/site/admin": typeof functions_site_admin;
  "functions/site/catalog": typeof functions_site_catalog;
  "functions/site/moderation": typeof functions_site_moderation;
  "functions/site/organizations": typeof functions_site_organizations;
  "functions/site/serverSoftware": typeof functions_site_serverSoftware;
  "functions/site/users": typeof functions_site_users;
  http: typeof http;
  "lib/authorization": typeof lib_authorization;
  "lib/domainAuthorization": typeof lib_domainAuthorization;
  "lib/downloadCounts": typeof lib_downloadCounts;
  "lib/projectAggregates": typeof lib_projectAggregates;
  "lib/slugs": typeof lib_slugs;
  "lib/usernames": typeof lib_usernames;
  "lib/workflowTemplates": typeof lib_workflowTemplates;
  "schemas/domain": typeof schemas_domain;
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
  betterAuth: import("../betterAuth/_generated/component.js").ComponentApi<"betterAuth">;
  projectsBySoftware: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"projectsBySoftware">;
  projectsByOwner: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"projectsByOwner">;
  migrations: import("@convex-dev/migrations/_generated/component.js").ComponentApi<"migrations">;
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
  projectDownloadCounts: import("@convex-dev/sharded-counter/_generated/component.js").ComponentApi<"projectDownloadCounts">;
  ownerDownloadCounts: import("@convex-dev/sharded-counter/_generated/component.js").ComponentApi<"ownerDownloadCounts">;
};
