import { v } from "convex/values";

import { components } from "../../_generated/api";
import { authenticatedQuery } from "../../lib/authorization";
import {
  type BetterAuthMember,
  getOrganizationBySlug,
  listOrganizationMembers,
  listOrganizationMemberships,
  normalizeOrganizationRole,
  requireOrganizationManager,
  requireOrganizationMember,
} from "../../lib/domainAuthorization";
import { getOwnerDownloadCount, getProjectDownloadCount } from "../../lib/downloadCounts";
import { countProjectsForOwner } from "../../lib/projectAggregates";
import {
  organizationRoleValidator,
  projectStatusValidator,
  projectVisibilityValidator,
} from "../../schema";

const membershipAccessValidator = v.object({
  authorized: v.literal(true),
  role: organizationRoleValidator,
  status: v.literal("active"),
});

const dashboardOrganizationValidator = v.object({
  organizationId: v.string(),
  slug: v.string(),
  name: v.string(),
  summary: v.optional(v.string()),
  avatarUrl: v.optional(v.string()),
  websiteUrl: v.optional(v.string()),
  role: organizationRoleValidator,
  memberCount: v.number(),
  projectCount: v.number(),
  totalDownloads: v.number(),
  updatedAt: v.number(),
});

const dashboardOrganizationProjectValidator = v.object({
  projectId: v.id("projects"),
  slug: v.string(),
  name: v.string(),
  summary: v.string(),
  visibility: projectVisibilityValidator,
  status: projectStatusValidator,
  downloadCount: v.number(),
});

const dashboardOrganizationMemberValidator = v.object({
  membershipId: v.string(),
  userId: v.string(),
  name: v.string(),
  image: v.optional(v.string()),
  role: organizationRoleValidator,
});

export const getMembershipAccess = authenticatedQuery({
  args: { organizationId: v.string() },
  returns: membershipAccessValidator,
  handler: async (ctx, args) => {
    const membership = await requireOrganizationMember(ctx, args.organizationId, ctx.user);
    return {
      authorized: true as const,
      role: membership.role,
      status: "active" as const,
    };
  },
});

export const getManagementAccess = authenticatedQuery({
  args: { organizationId: v.string() },
  returns: membershipAccessValidator,
  handler: async (ctx, args) => {
    const membership = await requireOrganizationManager(ctx, args.organizationId, ctx.user);
    return {
      authorized: true as const,
      role: membership.role,
      status: "active" as const,
    };
  },
});

export const listMine = authenticatedQuery({
  args: {},
  returns: v.array(dashboardOrganizationValidator),
  handler: async (ctx) => {
    const memberships = await listOrganizationMemberships(ctx, ctx.user._id);
    const organizations = await Promise.all(
      memberships.map(async (membership) => {
        const organization = (await ctx.runQuery(components.betterAuth.adapter.findOne, {
          model: "organization",
          where: [{ field: "_id", value: membership.organizationId }],
        })) as {
          _id: string;
          name: string;
          slug: string;
          logo?: string | null;
          createdAt: number;
        } | null;
        if (!organization) return null;

        const [members, profile, projectCount, totalDownloads] = await Promise.all([
          listOrganizationMembers(ctx, organization._id),
          ctx.db
            .query("organizationProfiles")
            .withIndex("by_organization_id", (index) =>
              index.eq("organizationId", organization._id),
            )
            .unique(),
          countProjectsForOwner(ctx, "organization", organization._id),
          getOwnerDownloadCount(ctx, "organization", organization._id),
        ]);

        return {
          organizationId: organization._id,
          slug: organization.slug,
          name: organization.name,
          summary: profile?.summary,
          avatarUrl: organization.logo ?? undefined,
          websiteUrl: profile?.websiteUrl,
          role: normalizeOrganizationRole(membership.role),
          memberCount: members.length,
          projectCount,
          totalDownloads,
          updatedAt: profile?.updatedAt ?? organization.createdAt,
        };
      }),
    );

    return organizations
      .filter((organization): organization is NonNullable<typeof organization> =>
        Boolean(organization),
      )
      .sort((left, right) => left.name.localeCompare(right.name));
  },
});

export const getMineBySlug = authenticatedQuery({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      organization: dashboardOrganizationValidator,
      members: v.array(dashboardOrganizationMemberValidator),
      projects: v.array(dashboardOrganizationProjectValidator),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const organization = await getOrganizationBySlug(ctx, args.slug);
    if (!organization) return null;

    const membership = await requireOrganizationMember(ctx, organization._id, ctx.user).catch(
      () => null,
    );
    if (!membership) return null;

    const [memberRecords, projects, profile, projectCount, totalDownloads] = await Promise.all([
      listOrganizationMembers(ctx, organization._id),
      ctx.db
        .query("projects")
        .withIndex("by_owner_type_and_owner_id", (index) =>
          index.eq("ownerType", "organization").eq("ownerId", organization._id),
        )
        .order("desc")
        .take(250),
      ctx.db
        .query("organizationProfiles")
        .withIndex("by_organization_id", (index) => index.eq("organizationId", organization._id))
        .unique(),
      countProjectsForOwner(ctx, "organization", organization._id),
      getOwnerDownloadCount(ctx, "organization", organization._id),
    ]);
    const users = await Promise.all(
      memberRecords.map(
        async (member) =>
          (await ctx.runQuery(components.betterAuth.adapter.findOne, {
            model: "user",
            where: [{ field: "_id", value: member.userId }],
          })) as {
            _id: string;
            name: string;
            image?: string | null;
          } | null,
      ),
    );
    const usersById = new Map(users.flatMap((user) => (user ? [[user._id, user] as const] : [])));

    const projectDownloadCounts = await Promise.all(
      projects.map((project) => getProjectDownloadCount(ctx, project)),
    );

    return {
      organization: {
        organizationId: organization._id,
        slug: organization.slug,
        name: organization.name,
        summary: profile?.summary,
        avatarUrl: organization.logo ?? undefined,
        websiteUrl: profile?.websiteUrl,
        role: membership.role,
        memberCount: memberRecords.length,
        projectCount,
        totalDownloads,
        updatedAt: profile?.updatedAt ?? organization.createdAt,
      },
      members: memberRecords.map((member: BetterAuthMember) => {
        const user = usersById.get(member.userId);
        return {
          membershipId: member._id,
          userId: member.userId,
          name: user?.name ?? "Unknown user",
          image: user?.image ?? undefined,
          role: normalizeOrganizationRole(member.role),
        };
      }),
      projects: projects.map((project, index) => ({
        projectId: project._id,
        slug: project.slug,
        name: project.name,
        summary: project.summary,
        visibility: project.visibility,
        status: project.status,
        downloadCount: projectDownloadCounts[index] ?? project.downloadCount,
      })),
    };
  },
});
