import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const roleValidator = v.union(
  v.literal("developer"),
  v.literal("verifiedCreator"),
  v.literal("moderator"),
  v.literal("admin"),
);

export const organizationRoleValidator = v.union(
  v.literal("owner"),
  v.literal("admin"),
  v.literal("member"),
);

export const membershipStatusValidator = v.union(
  v.literal("invited"),
  v.literal("active"),
  v.literal("removed"),
);

export const projectVisibilityValidator = v.union(
  v.literal("draft"),
  v.literal("unlisted"),
  v.literal("public"),
  v.literal("hidden"),
  v.literal("suspended"),
);

export const projectStatusValidator = v.union(
  v.literal("draft"),
  v.literal("review"),
  v.literal("published"),
  v.literal("archived"),
);

export const userValidator = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  authUserId: v.string(),
  authTokenIdentifier: v.string(),
  name: v.string(),
  email: v.string(),
  image: v.optional(v.string()),
  role: roleValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const creatorProfileValidator = v.object({
  _id: v.id("creatorProfiles"),
  _creationTime: v.number(),
  userId: v.id("users"),
  slug: v.optional(v.string()),
  displayName: v.string(),
  bio: v.optional(v.string()),
  avatarUrl: v.optional(v.string()),
  websiteUrl: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const serverSoftwareValidator = v.object({
  _id: v.id("serverSoftware"),
  _creationTime: v.number(),
  slug: v.string(),
  name: v.string(),
  description: v.string(),
  adapterId: v.string(),
  websiteUrl: v.string(),
  repositoryUrl: v.optional(v.string()),
  enabled: v.boolean(),
  sortOrder: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const githubInstallationValidator = v.object({
  _id: v.id("githubInstallations"),
  _creationTime: v.number(),
  installationId: v.number(),
  accountId: v.number(),
  accountLogin: v.string(),
  accountType: v.union(v.literal("User"), v.literal("Organization")),
  accountAvatarUrl: v.optional(v.string()),
  ownerUserId: v.optional(v.id("users")),
  organizationId: v.optional(v.id("organizations")),
  repositorySelection: v.optional(v.union(v.literal("all"), v.literal("selected"))),
  status: v.union(v.literal("active"), v.literal("suspended"), v.literal("deleted")),
  suspendedAt: v.optional(v.number()),
  syncStartedAt: v.optional(v.number()),
  lastSyncAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const repositoryValidator = v.object({
  _id: v.id("repositories"),
  _creationTime: v.number(),
  installationId: v.id("githubInstallations"),
  githubRepositoryId: v.number(),
  ownerLogin: v.string(),
  name: v.string(),
  fullName: v.string(),
  description: v.optional(v.string()),
  htmlUrl: v.string(),
  defaultBranch: v.string(),
  primaryLanguage: v.optional(v.string()),
  isPrivate: v.boolean(),
  isArchived: v.boolean(),
  accessStatus: v.union(v.literal("granted"), v.literal("removed"), v.literal("ineligible")),
  githubUpdatedAt: v.optional(v.number()),
  pushedAt: v.optional(v.number()),
  lastSeenAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const projectValidator = v.object({
  _id: v.id("projects"),
  _creationTime: v.number(),
  ownerUserId: v.optional(v.id("users")),
  ownerOrganizationId: v.optional(v.id("organizations")),
  creatorProfileId: v.optional(v.id("creatorProfiles")),
  repositoryId: v.id("repositories"),
  softwareId: v.id("serverSoftware"),
  slug: v.string(),
  name: v.string(),
  summary: v.string(),
  description: v.optional(v.string()),
  searchText: v.string(),
  license: v.optional(v.string()),
  language: v.optional(v.string()),
  visibility: projectVisibilityValidator,
  status: projectStatusValidator,
  latestVersionId: v.optional(v.id("versions")),
  downloadCount: v.number(),
  ratingAverage: v.number(),
  ratingCount: v.number(),
  publishedAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export default defineSchema({
  users: defineTable({
    authUserId: v.string(),
    authTokenIdentifier: v.string(),
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    role: roleValidator,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_auth_user_id", ["authUserId"])
    .index("by_auth_token_identifier", ["authTokenIdentifier"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  creatorProfiles: defineTable({
    userId: v.id("users"),
    slug: v.optional(v.string()),
    displayName: v.string(),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_slug", ["slug"]),

  organizations: defineTable({
    ownerUserId: v.id("users"),
    slug: v.string(),
    name: v.string(),
    summary: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("suspended")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner_user_id", ["ownerUserId"])
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),

  organizationMembers: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    role: organizationRoleValidator,
    status: membershipStatusValidator,
    invitedByUserId: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_user_id", ["userId"])
    .index("by_organization_id_and_user_id", ["organizationId", "userId"])
    .index("by_user_id_and_status", ["userId", "status"]),

  githubInstallations: defineTable({
    installationId: v.number(),
    accountId: v.number(),
    accountLogin: v.string(),
    accountType: v.union(v.literal("User"), v.literal("Organization")),
    accountAvatarUrl: v.optional(v.string()),
    ownerUserId: v.optional(v.id("users")),
    organizationId: v.optional(v.id("organizations")),
    repositorySelection: v.optional(v.union(v.literal("all"), v.literal("selected"))),
    status: v.union(v.literal("active"), v.literal("suspended"), v.literal("deleted")),
    suspendedAt: v.optional(v.number()),
    syncStartedAt: v.optional(v.number()),
    lastSyncAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_installation_id", ["installationId"])
    .index("by_owner_user_id", ["ownerUserId"])
    .index("by_organization_id", ["organizationId"])
    .index("by_account_id", ["accountId"]),

  repositories: defineTable({
    installationId: v.id("githubInstallations"),
    githubRepositoryId: v.number(),
    ownerLogin: v.string(),
    name: v.string(),
    fullName: v.string(),
    description: v.optional(v.string()),
    htmlUrl: v.string(),
    defaultBranch: v.string(),
    primaryLanguage: v.optional(v.string()),
    isPrivate: v.boolean(),
    isArchived: v.boolean(),
    accessStatus: v.union(v.literal("granted"), v.literal("removed"), v.literal("ineligible")),
    githubUpdatedAt: v.optional(v.number()),
    pushedAt: v.optional(v.number()),
    lastSeenAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_github_repository_id", ["githubRepositoryId"])
    .index("by_installation_id", ["installationId"])
    .index("by_installation_id_and_access_status", ["installationId", "accessStatus"])
    .index("by_full_name", ["fullName"]),

  githubInstallIntents: defineTable({
    stateHash: v.string(),
    userId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    installationId: v.optional(v.number()),
    expiresAt: v.number(),
    lastError: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_state_hash", ["stateHash"])
    .index("by_user_id_and_status", ["userId", "status"]),

  serverSoftware: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    adapterId: v.string(),
    websiteUrl: v.string(),
    repositoryUrl: v.optional(v.string()),
    enabled: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_adapter_id", ["adapterId"])
    .index("by_enabled_and_sort_order", ["enabled", "sortOrder"]),

  projects: defineTable({
    ownerUserId: v.optional(v.id("users")),
    ownerOrganizationId: v.optional(v.id("organizations")),
    creatorProfileId: v.optional(v.id("creatorProfiles")),
    repositoryId: v.id("repositories"),
    softwareId: v.id("serverSoftware"),
    slug: v.string(),
    name: v.string(),
    summary: v.string(),
    description: v.optional(v.string()),
    searchText: v.string(),
    license: v.optional(v.string()),
    language: v.optional(v.string()),
    visibility: projectVisibilityValidator,
    status: projectStatusValidator,
    latestVersionId: v.optional(v.id("versions")),
    downloadCount: v.number(),
    ratingAverage: v.number(),
    ratingCount: v.number(),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_repository_id", ["repositoryId"])
    .index("by_owner_user_id", ["ownerUserId"])
    .index("by_owner_organization_id", ["ownerOrganizationId"])
    .index("by_creator_profile_id", ["creatorProfileId"])
    .index("by_software_id", ["softwareId"])
    .index("by_visibility_and_status", ["visibility", "status"])
    .index("by_visibility_and_status_and_software_id", ["visibility", "status", "softwareId"])
    .index("by_visibility_and_updated_at", ["visibility", "updatedAt"])
    .searchIndex("search_search_text", {
      searchField: "searchText",
      filterFields: ["visibility", "status", "softwareId"],
    }),

  versions: defineTable({
    projectId: v.id("projects"),
    version: v.string(),
    normalizedVersion: v.string(),
    changelog: v.optional(v.string()),
    minecraftVersion: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project_id", ["projectId"])
    .index("by_project_id_and_normalized_version", ["projectId", "normalizedVersion"])
    .index("by_project_id_and_status", ["projectId", "status"]),

  builds: defineTable({
    projectId: v.id("projects"),
    repositoryId: v.id("repositories"),
    versionId: v.optional(v.id("versions")),
    workflowRunId: v.number(),
    workflowName: v.string(),
    commitSha: v.string(),
    branch: v.optional(v.string()),
    tag: v.optional(v.string()),
    status: v.union(v.literal("queued"), v.literal("inProgress"), v.literal("completed")),
    conclusion: v.optional(
      v.union(
        v.literal("success"),
        v.literal("failure"),
        v.literal("cancelled"),
        v.literal("skipped"),
        v.literal("timedOut"),
        v.literal("actionRequired"),
      ),
    ),
    logsUrl: v.string(),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workflow_run_id", ["workflowRunId"])
    .index("by_project_id", ["projectId"])
    .index("by_project_id_and_status", ["projectId", "status"])
    .index("by_version_id", ["versionId"])
    .index("by_repository_id_and_commit_sha", ["repositoryId", "commitSha"]),

  releases: defineTable({
    projectId: v.id("projects"),
    versionId: v.id("versions"),
    buildId: v.optional(v.id("builds")),
    repositoryId: v.id("repositories"),
    githubReleaseId: v.number(),
    tagName: v.string(),
    releaseUrl: v.string(),
    commitSha: v.string(),
    status: v.union(
      v.literal("detected"),
      v.literal("verified"),
      v.literal("published"),
      v.literal("rejected"),
    ),
    verifiedBuild: v.boolean(),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_github_release_id", ["githubReleaseId"])
    .index("by_project_id", ["projectId"])
    .index("by_project_id_and_status", ["projectId", "status"])
    .index("by_version_id", ["versionId"])
    .index("by_build_id", ["buildId"])
    .index("by_repository_id", ["repositoryId"]),

  releaseAssets: defineTable({
    releaseId: v.id("releases"),
    githubAssetId: v.number(),
    name: v.string(),
    downloadUrl: v.string(),
    size: v.number(),
    contentType: v.optional(v.string()),
    sha256: v.optional(v.string()),
    isPrimary: v.boolean(),
    status: v.union(v.literal("accepted"), v.literal("rejected")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_github_asset_id", ["githubAssetId"])
    .index("by_release_id", ["releaseId"])
    .index("by_release_id_and_is_primary", ["releaseId", "isPrimary"]),

  downloads: defineTable({
    projectId: v.id("projects"),
    versionId: v.id("versions"),
    releaseAssetId: v.id("releaseAssets"),
    userId: v.optional(v.id("users")),
    anonymousIdHash: v.optional(v.string()),
    userAgentHash: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_project_id_and_created_at", ["projectId", "createdAt"])
    .index("by_version_id_and_created_at", ["versionId", "createdAt"])
    .index("by_release_asset_id_and_created_at", ["releaseAssetId", "createdAt"])
    .index("by_user_id_and_created_at", ["userId", "createdAt"])
    .index("by_anonymous_id_hash_and_created_at", ["anonymousIdHash", "createdAt"]),

  categories: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_sort_order", ["sortOrder"]),

  projectCategories: defineTable({
    projectId: v.id("projects"),
    categoryId: v.id("categories"),
    createdAt: v.number(),
  })
    .index("by_project_id", ["projectId"])
    .index("by_category_id", ["categoryId"])
    .index("by_project_id_and_category_id", ["projectId", "categoryId"]),

  tags: defineTable({
    slug: v.string(),
    name: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_slug", ["slug"]),

  projectTags: defineTable({
    projectId: v.id("projects"),
    tagId: v.id("tags"),
    createdAt: v.number(),
  })
    .index("by_project_id", ["projectId"])
    .index("by_tag_id", ["tagId"])
    .index("by_project_id_and_tag_id", ["projectId", "tagId"]),

  reviews: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    title: v.optional(v.string()),
    body: v.string(),
    status: v.union(v.literal("pending"), v.literal("published"), v.literal("hidden")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project_id", ["projectId"])
    .index("by_project_id_and_status", ["projectId", "status"])
    .index("by_user_id_and_project_id", ["userId", "projectId"]),

  ratings: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    value: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project_id", ["projectId"])
    .index("by_project_id_and_user_id", ["projectId", "userId"])
    .index("by_user_id", ["userId"]),

  supportLinks: defineTable({
    creatorProfileId: v.optional(v.id("creatorProfiles")),
    organizationId: v.optional(v.id("organizations")),
    projectId: v.optional(v.id("projects")),
    type: v.union(
      v.literal("website"),
      v.literal("documentation"),
      v.literal("issues"),
      v.literal("discord"),
      v.literal("donation"),
      v.literal("other"),
    ),
    label: v.string(),
    url: v.string(),
    sortOrder: v.number(),
    status: v.union(v.literal("active"), v.literal("hidden")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_creator_profile_id", ["creatorProfileId"])
    .index("by_organization_id", ["organizationId"])
    .index("by_project_id", ["projectId"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    provider: v.literal("polar"),
    plan: v.literal("pro"),
    providerCustomerId: v.string(),
    providerSubscriptionId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("trialing"),
      v.literal("pastDue"),
      v.literal("cancelled"),
      v.literal("expired"),
    ),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_provider_subscription_id", ["providerSubscriptionId"])
    .index("by_user_id_and_status", ["userId", "status"]),

  moderationReports: defineTable({
    reporterUserId: v.optional(v.id("users")),
    targetType: v.union(
      v.literal("project"),
      v.literal("review"),
      v.literal("creator"),
      v.literal("organization"),
    ),
    targetKey: v.string(),
    projectId: v.optional(v.id("projects")),
    reviewId: v.optional(v.id("reviews")),
    creatorProfileId: v.optional(v.id("creatorProfiles")),
    organizationId: v.optional(v.id("organizations")),
    reason: v.union(
      v.literal("malware"),
      v.literal("spam"),
      v.literal("impersonation"),
      v.literal("copyright"),
      v.literal("abuse"),
      v.literal("other"),
    ),
    details: v.string(),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent"),
    ),
    status: v.union(
      v.literal("open"),
      v.literal("investigating"),
      v.literal("resolved"),
      v.literal("dismissed"),
    ),
    assignedToUserId: v.optional(v.id("users")),
    resolution: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_reporter_user_id", ["reporterUserId"])
    .index("by_status", ["status"])
    .index("by_status_and_priority", ["status", "priority"])
    .index("by_target_key", ["targetKey"])
    .index("by_project_id", ["projectId"])
    .index("by_review_id", ["reviewId"])
    .index("by_creator_profile_id", ["creatorProfileId"])
    .index("by_organization_id", ["organizationId"])
    .index("by_assigned_to_user_id_and_status", ["assignedToUserId", "status"]),

  adminActions: defineTable({
    actorUserId: v.id("users"),
    action: v.string(),
    targetType: v.string(),
    targetKey: v.string(),
    reason: v.string(),
    previousState: v.optional(v.string()),
    resultingState: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_actor_user_id_and_created_at", ["actorUserId", "createdAt"])
    .index("by_target_key_and_created_at", ["targetKey", "createdAt"])
    .index("by_action_and_created_at", ["action", "createdAt"]),

  webhookDeliveries: defineTable({
    deliveryId: v.string(),
    event: v.string(),
    action: v.optional(v.string()),
    installationId: v.optional(v.id("githubInstallations")),
    repositoryId: v.optional(v.id("repositories")),
    status: v.union(
      v.literal("received"),
      v.literal("processing"),
      v.literal("processed"),
      v.literal("failed"),
      v.literal("ignored"),
    ),
    attemptCount: v.number(),
    lastError: v.optional(v.string()),
    payloadDigest: v.optional(v.string()),
    claimedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    receivedAt: v.number(),
    processedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_delivery_id", ["deliveryId"])
    .index("by_status_and_updated_at", ["status", "updatedAt"])
    .index("by_event_and_created_at", ["event", "createdAt"])
    .index("by_installation_id_and_created_at", ["installationId", "createdAt"])
    .index("by_repository_id_and_created_at", ["repositoryId", "createdAt"]),

  webhookDeliveryAttempts: defineTable({
    webhookDeliveryId: v.id("webhookDeliveries"),
    attemptNumber: v.number(),
    status: v.union(
      v.literal("processing"),
      v.literal("processed"),
      v.literal("failed"),
      v.literal("ignored"),
      v.literal("duplicate"),
    ),
    error: v.optional(v.string()),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_webhook_delivery_id", ["webhookDeliveryId"])
    .index("by_webhook_delivery_id_and_attempt_number", ["webhookDeliveryId", "attemptNumber"]),
});
