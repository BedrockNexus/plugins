import { paginationOptsValidator, paginationResultValidator } from "convex/server";
import { v } from "convex/values";

import { sanitizeRegistryText } from "../../../src/lib/registry-content";
import type { Doc } from "../../_generated/dataModel";
import { type QueryCtx, query } from "../../_generated/server";
import { getOrganizationById, getOrganizationBySlug } from "../../lib/domainAuthorization";
import { getOwnerDownloadCount, getProjectDownloadCount } from "../../lib/downloadCounts";
import {
  countPublishedProjectsForSoftware,
  countPublishedProjectsForSoftwareBatch,
} from "../../lib/projectAggregates";
import { supportLinkTypeValidator } from "../../schema";

const publicCreatorValidator = v.object({
  slug: v.string(),
  username: v.string(),
  githubUsername: v.optional(v.string()),
  displayName: v.string(),
  avatarUrl: v.optional(v.string()),
});

const publicOrganizationValidator = v.object({
  slug: v.string(),
  name: v.string(),
  avatarUrl: v.optional(v.string()),
});

const publicSoftwareValidator = v.object({
  slug: v.string(),
  name: v.string(),
});

const latestVersionSummaryValidator = v.object({
  version: v.string(),
  publishedAt: v.optional(v.number()),
  verifiedBuild: v.boolean(),
});

export const projectCardValidator = v.object({
  projectId: v.id("projects"),
  slug: v.string(),
  name: v.string(),
  summary: v.string(),
  license: v.optional(v.string()),
  downloadCount: v.number(),
  ratingAverage: v.number(),
  ratingCount: v.number(),
  publishedAt: v.optional(v.number()),
  updatedAt: v.number(),
  software: publicSoftwareValidator,
  creator: v.union(publicCreatorValidator, v.null()),
  organization: v.union(publicOrganizationValidator, v.null()),
  latestVersion: v.union(latestVersionSummaryValidator, v.null()),
});

type ProjectCard = typeof projectCardValidator.type;

async function hydrateProjectCard(
  ctx: QueryCtx,
  project: Doc<"projects">,
): Promise<ProjectCard | null> {
  const [software, creator, organization, latestVersion, downloadCount] = await Promise.all([
    ctx.db.get("serverSoftware", project.softwareId),
    project.creatorProfileId ? ctx.db.get("creatorProfiles", project.creatorProfileId) : null,
    project.ownerType === "organization" ? getOrganizationById(ctx, project.ownerId) : null,
    project.latestVersionId ? ctx.db.get("versions", project.latestVersionId) : null,
    getProjectDownloadCount(ctx, project),
  ]);

  if (!software) {
    return null;
  }

  let latestVersionSummary: ProjectCard["latestVersion"] = null;
  if (latestVersion?.status === "published") {
    const release = await ctx.db
      .query("releases")
      .withIndex("by_version_id", (index) => index.eq("versionId", latestVersion._id))
      .order("desc")
      .take(5);
    const publishedRelease = release.find((item) => item.status === "published");
    latestVersionSummary = {
      version: latestVersion.version,
      publishedAt: latestVersion.publishedAt,
      verifiedBuild: publishedRelease?.verifiedBuild === true,
    };
  }

  return {
    projectId: project._id,
    slug: project.slug,
    name: project.name,
    summary: project.summary,
    license: project.license,
    downloadCount,
    ratingAverage: project.ratingAverage,
    ratingCount: project.ratingCount,
    publishedAt: project.publishedAt,
    updatedAt: project.updatedAt,
    software: { slug: software.slug, name: software.name },
    creator:
      creator?.username || creator?.slug
        ? {
            slug: creator.username ?? (creator.slug as string),
            username: creator.username ?? (creator.slug as string),
            githubUsername: creator.githubUsername,
            displayName: creator.displayName,
            avatarUrl: creator.avatarUrl,
          }
        : null,
    organization: organization
      ? {
          slug: organization.slug,
          name: organization.name,
          avatarUrl: organization.logo ?? undefined,
        }
      : null,
    latestVersion: latestVersionSummary,
  };
}

async function hydrateProjectPage(ctx: QueryCtx, projects: Array<Doc<"projects">>) {
  const cards = await Promise.all(projects.map((project) => hydrateProjectCard(ctx, project)));
  return cards.filter((card): card is ProjectCard => card !== null);
}

const sortValidator = v.union(
  v.literal("relevance"),
  v.literal("latest"),
  v.literal("downloads"),
  v.literal("rating"),
);

export const explore = query({
  args: {
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
    softwareSlug: v.optional(v.string()),
    sort: sortValidator,
  },
  returns: paginationResultValidator(projectCardValidator),
  handler: async (ctx, args) => {
    const search = args.search?.trim().slice(0, 100);
    const software = args.softwareSlug
      ? await ctx.db
          .query("serverSoftware")
          .withIndex("by_slug", (index) => index.eq("slug", args.softwareSlug as string))
          .unique()
      : null;

    if (args.softwareSlug && !software) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      };
    }

    if (search) {
      const result = software
        ? await ctx.db
            .query("projects")
            .withSearchIndex("search_search_text", (index) =>
              index
                .search("searchText", search)
                .eq("visibility", "public")
                .eq("status", "published")
                .eq("softwareId", software._id),
            )
            .paginate(args.paginationOpts)
        : await ctx.db
            .query("projects")
            .withSearchIndex("search_search_text", (index) =>
              index
                .search("searchText", search)
                .eq("visibility", "public")
                .eq("status", "published"),
            )
            .paginate(args.paginationOpts);

      return { ...result, page: await hydrateProjectPage(ctx, result.page) };
    }

    if (software) {
      if (args.sort === "downloads") {
        const result = await ctx.db
          .query("projects")
          .withIndex("by_visibility_and_status_and_software_id_and_download_count", (index) =>
            index
              .eq("visibility", "public")
              .eq("status", "published")
              .eq("softwareId", software._id),
          )
          .order("desc")
          .paginate(args.paginationOpts);
        return { ...result, page: await hydrateProjectPage(ctx, result.page) };
      }
      if (args.sort === "rating") {
        const result = await ctx.db
          .query("projects")
          .withIndex("by_visibility_and_status_and_software_id_and_rating_average", (index) =>
            index
              .eq("visibility", "public")
              .eq("status", "published")
              .eq("softwareId", software._id),
          )
          .order("desc")
          .paginate(args.paginationOpts);
        return { ...result, page: await hydrateProjectPage(ctx, result.page) };
      }
      const result = await ctx.db
        .query("projects")
        .withIndex("by_visibility_and_status_and_software_id_and_updated_at", (index) =>
          index.eq("visibility", "public").eq("status", "published").eq("softwareId", software._id),
        )
        .order("desc")
        .paginate(args.paginationOpts);
      return { ...result, page: await hydrateProjectPage(ctx, result.page) };
    }

    if (args.sort === "downloads") {
      const result = await ctx.db
        .query("projects")
        .withIndex("by_visibility_and_status_and_download_count", (index) =>
          index.eq("visibility", "public").eq("status", "published"),
        )
        .order("desc")
        .paginate(args.paginationOpts);
      return { ...result, page: await hydrateProjectPage(ctx, result.page) };
    }
    if (args.sort === "rating") {
      const result = await ctx.db
        .query("projects")
        .withIndex("by_visibility_and_status_and_rating_average", (index) =>
          index.eq("visibility", "public").eq("status", "published"),
        )
        .order("desc")
        .paginate(args.paginationOpts);
      return { ...result, page: await hydrateProjectPage(ctx, result.page) };
    }
    const result = await ctx.db
      .query("projects")
      .withIndex("by_visibility_and_status_and_updated_at", (index) =>
        index.eq("visibility", "public").eq("status", "published"),
      )
      .order("desc")
      .paginate(args.paginationOpts);
    return { ...result, page: await hydrateProjectPage(ctx, result.page) };
  },
});

const softwareDirectoryItemValidator = v.object({
  slug: v.string(),
  name: v.string(),
  description: v.string(),
  adapterId: v.string(),
  websiteUrl: v.string(),
  repositoryUrl: v.optional(v.string()),
  projectCount: v.number(),
});

export const listSoftware = query({
  args: {},
  returns: v.array(softwareDirectoryItemValidator),
  handler: async (ctx) => {
    const software = await ctx.db
      .query("serverSoftware")
      .withIndex("by_enabled_and_sort_order", (index) => index.eq("enabled", true))
      .take(20);

    const projectCounts = await countPublishedProjectsForSoftwareBatch(
      ctx,
      software.map((item) => item._id),
    );
    return software.map((item, index) => ({
      slug: item.slug,
      name: item.name,
      description: item.description,
      adapterId: item.adapterId,
      websiteUrl: item.websiteUrl,
      repositoryUrl: item.repositoryUrl,
      projectCount: projectCounts[index] ?? 0,
    }));
  },
});

export const getSoftware = query({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      software: softwareDirectoryItemValidator,
      projects: v.array(projectCardValidator),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const software = await ctx.db
      .query("serverSoftware")
      .withIndex("by_slug", (index) => index.eq("slug", args.slug))
      .unique();
    if (!software?.enabled) {
      return null;
    }
    const [projects, projectCount] = await Promise.all([
      ctx.db
        .query("projects")
        .withIndex("by_visibility_and_status_and_software_id_and_updated_at", (index) =>
          index.eq("visibility", "public").eq("status", "published").eq("softwareId", software._id),
        )
        .order("desc")
        .take(24),
      countPublishedProjectsForSoftware(ctx, software._id),
    ]);
    return {
      software: {
        slug: software.slug,
        name: software.name,
        description: software.description,
        adapterId: software.adapterId,
        websiteUrl: software.websiteUrl,
        repositoryUrl: software.repositoryUrl,
        projectCount,
      },
      projects: await hydrateProjectPage(ctx, projects),
    };
  },
});

const publicAssetValidator = v.object({
  name: v.string(),
  size: v.number(),
});

const publicBuildValidator = v.object({
  workflowRunId: v.number(),
  logsUrl: v.string(),
  commitSha: v.string(),
  tag: v.optional(v.string()),
  conclusion: v.optional(v.string()),
});

const publicReleaseValidator = v.object({
  tagName: v.string(),
  releaseUrl: v.string(),
  commitSha: v.string(),
  verifiedBuild: v.boolean(),
  asset: v.union(publicAssetValidator, v.null()),
  build: v.union(publicBuildValidator, v.null()),
});

const publicVersionValidator = v.object({
  version: v.string(),
  normalizedVersion: v.string(),
  changelog: v.optional(v.string()),
  minecraftVersion: v.optional(v.string()),
  publishedAt: v.optional(v.number()),
  release: v.union(publicReleaseValidator, v.null()),
});

export const getProject = query({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      project: projectCardValidator,
      description: v.optional(v.string()),
      repository: v.object({
        fullName: v.string(),
        htmlUrl: v.string(),
        defaultBranch: v.string(),
      }),
      versions: v.array(publicVersionValidator),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const project = await ctx.db
      .query("projects")
      .withIndex("by_slug", (index) => index.eq("slug", args.slug))
      .unique();
    if (project?.visibility !== "public" || project.status !== "published") {
      return null;
    }
    const [card, repository, versions] = await Promise.all([
      hydrateProjectCard(ctx, project),
      ctx.db.get("repositories", project.repositoryId),
      ctx.db
        .query("versions")
        .withIndex("by_project_id_and_status", (index) =>
          index.eq("projectId", project._id).eq("status", "published"),
        )
        .order("desc")
        .take(50),
    ]);
    if (!card || !repository || repository.isPrivate || repository.accessStatus !== "granted") {
      return null;
    }

    const publicVersions = await Promise.all(
      versions.map(async (version) => {
        const releases = await ctx.db
          .query("releases")
          .withIndex("by_version_id", (index) => index.eq("versionId", version._id))
          .order("desc")
          .take(5);
        const release = releases.find((item) => item.status === "published") ?? null;
        const [build, asset] = release
          ? await Promise.all([
              release.buildId ? ctx.db.get("builds", release.buildId) : null,
              ctx.db
                .query("releaseAssets")
                .withIndex("by_release_id_and_is_primary", (index) =>
                  index.eq("releaseId", release._id).eq("isPrimary", true),
                )
                .unique(),
            ])
          : [null, null];
        return {
          version: version.version,
          normalizedVersion: version.normalizedVersion,
          changelog: sanitizeRegistryText(version.changelog),
          minecraftVersion: version.minecraftVersion,
          publishedAt: version.publishedAt,
          release: release
            ? {
                tagName: release.tagName,
                releaseUrl: release.releaseUrl,
                commitSha: release.commitSha,
                verifiedBuild: release.verifiedBuild,
                asset:
                  asset?.status === "accepted"
                    ? {
                        name: asset.name,
                        size: asset.size,
                      }
                    : null,
                build: build
                  ? {
                      workflowRunId: build.workflowRunId,
                      logsUrl: build.logsUrl,
                      commitSha: build.commitSha,
                      tag: build.tag,
                      conclusion: build.conclusion,
                    }
                  : null,
              }
            : null,
        };
      }),
    );

    return {
      project: card,
      description: sanitizeRegistryText(project.description),
      repository: {
        fullName: repository.fullName,
        htmlUrl: repository.htmlUrl,
        defaultBranch: repository.defaultBranch,
      },
      versions: publicVersions,
    };
  },
});

const supportLinkValidator = v.object({
  type: supportLinkTypeValidator,
  label: v.string(),
  url: v.string(),
});

export const getCreator = query({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      creator: publicCreatorValidator.extend({
        bio: v.optional(v.string()),
        location: v.optional(v.string()),
        websiteUrl: v.optional(v.string()),
        socialAccounts: v.array(v.object({ provider: v.string(), url: v.string() })),
      }),
      projects: v.array(projectCardValidator),
      supportLinks: v.array(supportLinkValidator),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const directCreator = await ctx.db
      .query("creatorProfiles")
      .withIndex("by_username", (index) => index.eq("username", args.slug))
      .unique();
    const legacyCreator = directCreator
      ? null
      : await ctx.db
          .query("creatorProfiles")
          .withIndex("by_slug", (index) => index.eq("slug", args.slug))
          .unique();
    const usernameAlias =
      directCreator || legacyCreator
        ? null
        : await ctx.db
            .query("creatorUsernameAliases")
            .withIndex("by_username", (index) => index.eq("username", args.slug))
            .unique();
    const creator =
      directCreator ??
      legacyCreator ??
      (usernameAlias ? await ctx.db.get("creatorProfiles", usernameAlias.creatorProfileId) : null);
    const username = creator?.username ?? creator?.slug;
    if (!creator || !username) {
      return null;
    }
    const [projects, supportLinks] = await Promise.all([
      ctx.db
        .query("projects")
        .withIndex("by_creator_profile_id_and_visibility_and_status", (index) =>
          index
            .eq("creatorProfileId", creator._id)
            .eq("visibility", "public")
            .eq("status", "published"),
        )
        .order("desc")
        .take(100),
      ctx.db
        .query("supportLinks")
        .withIndex("by_creator_profile_id_and_status_and_sort_order", (index) =>
          index.eq("creatorProfileId", creator._id).eq("status", "active"),
        )
        .order("asc")
        .take(50),
    ]);
    return {
      creator: {
        slug: username,
        username,
        githubUsername: creator.githubUsername,
        displayName: creator.displayName,
        avatarUrl: creator.avatarUrl,
        bio: sanitizeRegistryText(creator.bio, 1_000),
        location: creator.location,
        websiteUrl: creator.websiteUrl,
        socialAccounts: creator.socialAccounts ?? [],
      },
      projects: await hydrateProjectPage(ctx, projects),
      supportLinks: supportLinks.map((link) => ({
        type: link.type,
        label: link.label,
        url: link.url,
      })),
    };
  },
});

export const getOrganization = query({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      organization: publicOrganizationValidator.extend({
        summary: v.optional(v.string()),
        websiteUrl: v.optional(v.string()),
      }),
      projects: v.array(projectCardValidator),
      totalDownloads: v.number(),
      supportLinks: v.array(supportLinkValidator),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const organization = await getOrganizationBySlug(ctx, args.slug);
    if (!organization) return null;
    const [projects, supportLinks, profile, totalDownloads] = await Promise.all([
      ctx.db
        .query("projects")
        .withIndex("by_owner_type_and_owner_id_and_visibility_and_status", (index) =>
          index
            .eq("ownerType", "organization")
            .eq("ownerId", organization._id)
            .eq("visibility", "public")
            .eq("status", "published"),
        )
        .order("desc")
        .take(100),
      ctx.db
        .query("supportLinks")
        .withIndex("by_organization_id_and_status_and_sort_order", (index) =>
          index.eq("organizationId", organization._id).eq("status", "active"),
        )
        .order("asc")
        .take(50),
      ctx.db
        .query("organizationProfiles")
        .withIndex("by_organization_id", (index) => index.eq("organizationId", organization._id))
        .unique(),
      getOwnerDownloadCount(ctx, "organization", organization._id),
    ]);
    const cards = await hydrateProjectPage(ctx, projects);
    return {
      organization: {
        slug: organization.slug,
        name: organization.name,
        avatarUrl: organization.logo ?? undefined,
        summary: sanitizeRegistryText(profile?.summary, 1_000),
        websiteUrl: profile?.websiteUrl,
      },
      projects: cards,
      totalDownloads,
      supportLinks: supportLinks.map((link) => ({
        type: link.type,
        label: link.label,
        url: link.url,
      })),
    };
  },
});

export const featured = query({
  args: { limit: v.number() },
  returns: v.array(projectCardValidator),
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_visibility_and_status_and_download_count", (index) =>
        index.eq("visibility", "public").eq("status", "published"),
      )
      .order("desc")
      .take(Math.min(Math.max(Math.floor(args.limit), 1), 12));
    return await hydrateProjectPage(ctx, projects);
  },
});

export const sitemapEntries = query({
  args: {},
  returns: v.object({
    projects: v.array(v.object({ slug: v.string(), updatedAt: v.number() })),
    creators: v.array(v.object({ slug: v.string(), updatedAt: v.number() })),
    organizations: v.array(v.object({ slug: v.string(), updatedAt: v.number() })),
    software: v.array(v.object({ slug: v.string(), updatedAt: v.number() })),
  }),
  handler: async (ctx) => {
    const [projects, creators, software] = await Promise.all([
      ctx.db
        .query("projects")
        .withIndex("by_visibility_and_status", (index) =>
          index.eq("visibility", "public").eq("status", "published"),
        )
        .take(1_000),
      ctx.db.query("creatorProfiles").withIndex("by_username").take(1_000),
      ctx.db
        .query("serverSoftware")
        .withIndex("by_enabled_and_sort_order", (index) => index.eq("enabled", true))
        .take(100),
    ]);
    const organizationIds = [
      ...new Set(
        projects.flatMap((project) =>
          project.ownerType === "organization" ? [project.ownerId] : [],
        ),
      ),
    ];
    const organizations = (
      await Promise.all(
        organizationIds.map((organizationId) => getOrganizationById(ctx, organizationId)),
      )
    ).filter((organization): organization is NonNullable<typeof organization> =>
      Boolean(organization),
    );
    return {
      projects: projects.map((item) => ({ slug: item.slug, updatedAt: item.updatedAt })),
      creators: creators.flatMap((item) =>
        item.username || item.slug
          ? [{ slug: item.username ?? (item.slug as string), updatedAt: item.updatedAt }]
          : [],
      ),
      organizations: organizations.map((item) => ({
        slug: item.slug,
        updatedAt: item.createdAt,
      })),
      software: software.map((item) => ({ slug: item.slug, updatedAt: item.updatedAt })),
    };
  },
});
