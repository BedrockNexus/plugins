import { v } from "convex/values";

import { authenticatedQuery } from "./lib/authorization";
import { requireOrganizationManager, requireOrganizationMember } from "./lib/domainAuthorization";
import { membershipStatusValidator, organizationRoleValidator } from "./schema";

const membershipAccessValidator = v.object({
  authorized: v.literal(true),
  role: organizationRoleValidator,
  status: membershipStatusValidator,
});

export const getMembershipAccess = authenticatedQuery({
  args: { organizationId: v.id("organizations") },
  returns: membershipAccessValidator,
  handler: async (ctx, args) => {
    const membership = await requireOrganizationMember(ctx, args.organizationId, ctx.user._id);

    return {
      authorized: true as const,
      role: membership.role,
      status: membership.status,
    };
  },
});

export const getManagementAccess = authenticatedQuery({
  args: { organizationId: v.id("organizations") },
  returns: membershipAccessValidator,
  handler: async (ctx, args) => {
    const membership = await requireOrganizationManager(ctx, args.organizationId, ctx.user._id);

    return {
      authorized: true as const,
      role: membership.role,
      status: membership.status,
    };
  },
});
