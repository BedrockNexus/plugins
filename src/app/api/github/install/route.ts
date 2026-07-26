import type { Route } from "next";
import { NextResponse } from "next/server";

import { api } from "@/../convex/_generated/api";
import {
  fetchAuthAction,
  fetchAuthMutation,
  fetchAuthQuery,
  isAuthenticated,
} from "@/lib/auth-server";

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.redirect(
      new URL("/auth/sign-in?redirectTo=/dashboard/projects/new" as Route, request.url),
    );
  }

  try {
    await fetchAuthMutation(api.functions.site.users.syncCurrentUser, {});
    const organizationSlug = new URL(request.url).searchParams.get("organization");
    let organizationId: string | undefined;
    if (organizationSlug) {
      const workspace = await fetchAuthQuery(api.functions.site.organizations.getMineBySlug, {
        slug: organizationSlug,
      });
      if (!workspace) {
        return NextResponse.redirect(
          new URL("/dashboard/organizations?github=organization-not-found", request.url),
        );
      }
      await fetchAuthQuery(api.functions.site.organizations.getManagementAccess, {
        organizationId: workspace.organization.organizationId,
      });
      organizationId = workspace.organization.organizationId;
    }
    const { url } = await fetchAuthAction(api.functions.github.actions.createInstallUrl, {
      ...(organizationId ? { organizationId } : {}),
    });
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.redirect(
      new URL("/dashboard/projects?github=configuration-error", request.url),
    );
  }
}
