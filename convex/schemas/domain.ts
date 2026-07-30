import { defineTable } from "convex/server";
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

export const ownerTypeValidator = v.union(v.literal("user"), v.literal("organization"));

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

export const supportLinkTypeValidator = v.union(
  v.literal("website"),
  v.literal("documentation"),
  v.literal("issues"),
  v.literal("discord"),
  v.literal("donation"),
  v.literal("other"),
);

const supportLinkCommonValidator = v.object({
  type: supportLinkTypeValidator,
  label: v.string(),
  url: v.string(),
  sortOrder: v.number(),
  status: v.union(v.literal("active"), v.literal("hidden")),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const supportLinkValidator = v.union(
  supportLinkCommonValidator.extend({
    targetType: v.literal("creator"),
    creatorProfileId: v.id("creatorProfiles"),
  }),
  supportLinkCommonValidator.extend({
    targetType: v.literal("organization"),
    organizationId: v.string(),
  }),
  supportLinkCommonValidator.extend({
    targetType: v.literal("project"),
    projectId: v.id("projects"),
  }),
);

const moderationReportCommonValidator = v.object({
  reporterUserId: v.optional(v.string()),
  reason: v.union(
    v.literal("malware"),
    v.literal("spam"),
    v.literal("impersonation"),
    v.literal("copyright"),
    v.literal("abuse"),
    v.literal("other"),
  ),
  details: v.string(),
  priority: v.union(v.literal("low"), v.literal("normal"), v.literal("high"), v.literal("urgent")),
  status: v.union(
    v.literal("open"),
    v.literal("investigating"),
    v.literal("resolved"),
    v.literal("dismissed"),
  ),
  assignedToUserId: v.optional(v.string()),
  resolution: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const moderationReportValidator = v.union(
  moderationReportCommonValidator.extend({
    targetType: v.literal("project"),
    projectId: v.id("projects"),
  }),
  moderationReportCommonValidator.extend({
    targetType: v.literal("review"),
    reviewId: v.id("reviews"),
  }),
  moderationReportCommonValidator.extend({
    targetType: v.literal("creator"),
    creatorProfileId: v.id("creatorProfiles"),
  }),
  moderationReportCommonValidator.extend({
    targetType: v.literal("organization"),
    organizationId: v.string(),
  }),
);

const webhookDeliveryCommonValidator = v.object({
  deliveryId: v.string(),
  event: v.string(),
  action: v.optional(v.string()),
  installationId: v.optional(v.id("githubInstallations")),
  repositoryId: v.optional(v.id("repositories")),
  attemptCount: v.number(),
  payloadDigest: v.string(),
  receivedAt: v.number(),
});

export const webhookDeliveryValidator = v.union(
  webhookDeliveryCommonValidator.extend({
    status: v.literal("processing"),
  }),
  webhookDeliveryCommonValidator.extend({
    status: v.literal("processed"),
    completedAt: v.number(),
  }),
  webhookDeliveryCommonValidator.extend({
    status: v.literal("ignored"),
    completedAt: v.number(),
  }),
  webhookDeliveryCommonValidator.extend({
    status: v.literal("failed"),
    lastError: v.string(),
    completedAt: v.number(),
  }),
);

const webhookDeliveryAttemptCommonValidator = v.object({
  webhookDeliveryId: v.id("webhookDeliveries"),
  attemptNumber: v.number(),
  startedAt: v.number(),
});

export const webhookDeliveryAttemptValidator = v.union(
  webhookDeliveryAttemptCommonValidator.extend({
    status: v.literal("processing"),
  }),
  webhookDeliveryAttemptCommonValidator.extend({
    status: v.literal("processed"),
    completedAt: v.number(),
  }),
  webhookDeliveryAttemptCommonValidator.extend({
    status: v.literal("ignored"),
    completedAt: v.number(),
  }),
  webhookDeliveryAttemptCommonValidator.extend({
    status: v.literal("duplicate"),
    completedAt: v.number(),
  }),
  webhookDeliveryAttemptCommonValidator.extend({
    status: v.literal("failed"),
    error: v.string(),
    completedAt: v.number(),
  }),
);

export const publishingDraftStatusValidator = v.union(
  v.literal("detected"),
  v.literal("metadataReady"),
  v.literal("workflowPullRequestOpen"),
  v.literal("workflowInstalled"),
  v.literal("releaseDetected"),
  v.literal("readyToPublish"),
  v.literal("inReview"),
  v.literal("changesRequested"),
  v.literal("rejected"),
  v.literal("published"),
);

export const workflowTemplateKeyValidator = v.string();

export const publishingDraftValidator = v.object({
  _id: v.id("publishingDrafts"),
  _creationTime: v.number(),
  ownerType: ownerTypeValidator,
  ownerId: v.string(),
  createdBy: v.string(),
  repositoryId: v.id("repositories"),
  projectId: v.optional(v.id("projects")),
  adapterId: v.union(v.literal("pocketmine-mp"), v.literal("powernukkitx")),
  projectType: v.literal("plugin"),
  detectionScore: v.number(),
  detectionSummary: v.string(),
  name: v.string(),
  slug: v.string(),
  summary: v.string(),
  description: v.optional(v.string()),
  license: v.optional(v.string()),
  readmeExcerpt: v.optional(v.string()),
  workflowPath: v.string(),
  workflowBranch: v.optional(v.string()),
  workflowPullRequestNumber: v.optional(v.number()),
  workflowPullRequestUrl: v.optional(v.string()),
  workflowPullRequestState: v.optional(
    v.union(v.literal("open"), v.literal("closed"), v.literal("merged")),
  ),
  workflowCommitSha: v.optional(v.string()),
  workflowTemplateKey: v.optional(v.string()),
  workflowTemplateVersion: v.optional(v.number()),
  workflowInstalledAt: v.optional(v.number()),
  workflowInstalled: v.boolean(),
  latestWorkflowRunId: v.optional(v.number()),
  latestWorkflowRunUrl: v.optional(v.string()),
  latestWorkflowRunStatus: v.optional(v.string()),
  latestWorkflowRunConclusion: v.optional(v.string()),
  latestTag: v.optional(v.string()),
  latestReleaseId: v.optional(v.number()),
  latestReleaseUrl: v.optional(v.string()),
  latestReleaseCommitSha: v.optional(v.string()),
  primaryAssetId: v.optional(v.number()),
  primaryAssetName: v.optional(v.string()),
  primaryAssetUrl: v.optional(v.string()),
  verifiedBuild: v.boolean(),
  moderationReady: v.boolean(),
  status: publishingDraftStatusValidator,
  submittedAt: v.optional(v.number()),
  reviewedAt: v.optional(v.number()),
  reviewedBy: v.optional(v.string()),
  reviewNotes: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const creatorProfileValidator = v.object({
  _id: v.id("creatorProfiles"),
  _creationTime: v.number(),
  userId: v.string(),
  username: v.optional(v.string()),
  usernameCustomizedAt: v.optional(v.number()),
  githubUsername: v.optional(v.string()),
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
  ownerType: ownerTypeValidator,
  ownerId: v.string(),
  connectedBy: v.string(),
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
  ownerType: ownerTypeValidator,
  ownerId: v.string(),
  createdBy: v.string(),
  creatorProfileId: v.optional(v.id("creatorProfiles")),
  repositoryId: v.id("repositories"),
  softwareId: v.id("serverSoftware"),
  slug: v.string(),
  name: v.string(),
  summary: v.string(),
  description: v.optional(v.string()),
  searchText: v.string(),
  license: v.optional(v.string()),
  visibility: projectVisibilityValidator,
  status: projectStatusValidator,
  latestVersionId: v.optional(v.id("versions")),
  downloadCount: v.number(),
  downloadCounterReadyAt: v.optional(v.number()),
  downloadCountRefreshScheduledAt: v.optional(v.number()),
  ratingAverage: v.number(),
  ratingCount: v.number(),
  publishedAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const tables = {
  creatorProfiles: defineTable({
    userId: v.string(),
    username: v.optional(v.string()),
    usernameCustomizedAt: v.optional(v.number()),
    githubUsername: v.optional(v.string()),
    slug: v.optional(v.string()),
    displayName: v.string(),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_username", ["username"])
    .index("by_github_username", ["githubUsername"])
    .index("by_slug", ["slug"]),

  creatorUsernameAliases: defineTable({
    username: v.string(),
    creatorProfileId: v.id("creatorProfiles"),
    createdAt: v.number(),
  })
    .index("by_username", ["username"])
    .index("by_creator_profile_id", ["creatorProfileId"]),

  organizationProfiles: defineTable({
    organizationId: v.string(),
    summary: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    updatedAt: v.number(),
    updatedBy: v.string(),
  }).index("by_organization_id", ["organizationId"]),

  githubInstallations: defineTable({
    installationId: v.number(),
    accountId: v.number(),
    accountLogin: v.string(),
    accountType: v.union(v.literal("User"), v.literal("Organization")),
    accountAvatarUrl: v.optional(v.string()),
    ownerType: ownerTypeValidator,
    ownerId: v.string(),
    connectedBy: v.string(),
    repositorySelection: v.optional(v.union(v.literal("all"), v.literal("selected"))),
    status: v.union(v.literal("active"), v.literal("suspended"), v.literal("deleted")),
    suspendedAt: v.optional(v.number()),
    syncStartedAt: v.optional(v.number()),
    lastSyncAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_installation_id", ["installationId"])
    .index("by_owner_type_and_owner_id", ["ownerType", "ownerId"])
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

  publishingDrafts: defineTable({
    ownerType: ownerTypeValidator,
    ownerId: v.string(),
    createdBy: v.string(),
    repositoryId: v.id("repositories"),
    projectId: v.optional(v.id("projects")),
    adapterId: v.union(v.literal("pocketmine-mp"), v.literal("powernukkitx")),
    projectType: v.literal("plugin"),
    detectionScore: v.number(),
    detectionSummary: v.string(),
    name: v.string(),
    slug: v.string(),
    summary: v.string(),
    description: v.optional(v.string()),
    license: v.optional(v.string()),
    readmeExcerpt: v.optional(v.string()),
    workflowPath: v.string(),
    workflowBranch: v.optional(v.string()),
    workflowPullRequestNumber: v.optional(v.number()),
    workflowPullRequestUrl: v.optional(v.string()),
    workflowPullRequestState: v.optional(
      v.union(v.literal("open"), v.literal("closed"), v.literal("merged")),
    ),
    workflowCommitSha: v.optional(v.string()),
    workflowTemplateKey: v.optional(v.string()),
    workflowTemplateVersion: v.optional(v.number()),
    workflowInstalledAt: v.optional(v.number()),
    workflowInstalled: v.boolean(),
    latestWorkflowRunId: v.optional(v.number()),
    latestWorkflowRunUrl: v.optional(v.string()),
    latestWorkflowRunStatus: v.optional(v.string()),
    latestWorkflowRunConclusion: v.optional(v.string()),
    latestTag: v.optional(v.string()),
    latestReleaseId: v.optional(v.number()),
    latestReleaseUrl: v.optional(v.string()),
    latestReleaseCommitSha: v.optional(v.string()),
    primaryAssetId: v.optional(v.number()),
    primaryAssetName: v.optional(v.string()),
    primaryAssetUrl: v.optional(v.string()),
    verifiedBuild: v.boolean(),
    moderationReady: v.boolean(),
    status: publishingDraftStatusValidator,
    submittedAt: v.optional(v.number()),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.string()),
    reviewNotes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner_type_and_owner_id", ["ownerType", "ownerId"])
    .index("by_status", ["status"])
    .index("by_repository_id", ["repositoryId"])
    .index("by_project_id", ["projectId"])
    .index("by_workflow_template_key", ["workflowTemplateKey"])
    .index("by_repository_id_and_status", ["repositoryId", "status"]),

  workflowTemplates: defineTable({
    key: workflowTemplateKeyValidator,
    adapterId: v.union(v.literal("pocketmine-mp"), v.literal("powernukkitx")),
    buildSystem: v.union(v.literal("composer"), v.literal("gradle"), v.literal("maven")),
    label: v.optional(v.string()),
    content: v.string(),
    version: v.number(),
    updatedBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  githubInstallIntents: defineTable({
    stateHash: v.string(),
    ownerType: ownerTypeValidator,
    ownerId: v.string(),
    createdBy: v.string(),
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
    .index("by_created_by_and_status", ["createdBy", "status"]),

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
    ownerType: ownerTypeValidator,
    ownerId: v.string(),
    createdBy: v.string(),
    creatorProfileId: v.optional(v.id("creatorProfiles")),
    repositoryId: v.id("repositories"),
    softwareId: v.id("serverSoftware"),
    slug: v.string(),
    name: v.string(),
    summary: v.string(),
    description: v.optional(v.string()),
    searchText: v.string(),
    license: v.optional(v.string()),
    visibility: projectVisibilityValidator,
    status: projectStatusValidator,
    latestVersionId: v.optional(v.id("versions")),
    downloadCount: v.number(),
    downloadCounterReadyAt: v.optional(v.number()),
    downloadCountRefreshScheduledAt: v.optional(v.number()),
    ratingAverage: v.number(),
    ratingCount: v.number(),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_repository_id", ["repositoryId"])
    .index("by_owner_type_and_owner_id", ["ownerType", "ownerId"])
    .index("by_creator_profile_id", ["creatorProfileId"])
    .index("by_software_id", ["softwareId"])
    .index("by_visibility_and_status", ["visibility", "status"])
    .index("by_visibility_and_status_and_software_id", ["visibility", "status", "softwareId"])
    .index("by_visibility_and_status_and_updated_at", ["visibility", "status", "updatedAt"])
    .index("by_visibility_and_status_and_software_id_and_updated_at", [
      "visibility",
      "status",
      "softwareId",
      "updatedAt",
    ])
    .index("by_visibility_and_status_and_download_count", ["visibility", "status", "downloadCount"])
    .index("by_visibility_and_status_and_rating_average", ["visibility", "status", "ratingAverage"])
    .index("by_visibility_and_status_and_software_id_and_download_count", [
      "visibility",
      "status",
      "softwareId",
      "downloadCount",
    ])
    .index("by_visibility_and_status_and_software_id_and_rating_average", [
      "visibility",
      "status",
      "softwareId",
      "ratingAverage",
    ])
    .index("by_creator_profile_id_and_visibility_and_status", [
      "creatorProfileId",
      "visibility",
      "status",
    ])
    .index("by_owner_type_and_owner_id_and_visibility_and_status", [
      "ownerType",
      "ownerId",
      "visibility",
      "status",
    ])
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
    userId: v.optional(v.string()),
    anonymousIdHash: v.optional(v.string()),
    userAgentHash: v.optional(v.string()),
    ownerCountedAt: v.number(),
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
    userId: v.string(),
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
    userId: v.string(),
    value: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project_id", ["projectId"])
    .index("by_project_id_and_user_id", ["projectId", "userId"])
    .index("by_user_id", ["userId"]),

  supportLinks: defineTable(supportLinkValidator)
    .index("by_creator_profile_id_and_status_and_sort_order", [
      "creatorProfileId",
      "status",
      "sortOrder",
    ])
    .index("by_organization_id_and_status_and_sort_order", [
      "organizationId",
      "status",
      "sortOrder",
    ])
    .index("by_project_id_and_status_and_sort_order", ["projectId", "status", "sortOrder"]),

  moderationReports: defineTable(moderationReportValidator)
    .index("by_reporter_user_id", ["reporterUserId"])
    .index("by_status", ["status"])
    .index("by_status_and_priority", ["status", "priority"])
    .index("by_project_id", ["projectId"])
    .index("by_review_id", ["reviewId"])
    .index("by_creator_profile_id", ["creatorProfileId"])
    .index("by_organization_id", ["organizationId"])
    .index("by_assigned_to_user_id_and_status", ["assignedToUserId", "status"]),

  adminActions: defineTable({
    actorUserId: v.string(),
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

  webhookDeliveries: defineTable(webhookDeliveryValidator)
    .index("by_delivery_id", ["deliveryId"])
    .index("by_status_and_completed_at", ["status", "completedAt"])
    .index("by_event_and_received_at", ["event", "receivedAt"])
    .index("by_installation_id_and_received_at", ["installationId", "receivedAt"])
    .index("by_repository_id_and_received_at", ["repositoryId", "receivedAt"]),

  webhookDeliveryAttempts: defineTable(webhookDeliveryAttemptValidator)
    .index("by_webhook_delivery_id", ["webhookDeliveryId"])
    .index("by_webhook_delivery_id_and_attempt_number", ["webhookDeliveryId", "attemptNumber"]),
};
