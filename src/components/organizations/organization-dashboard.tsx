"use client";

import { type OrganizationAuthClient, useActiveOrganization } from "@better-auth-ui/react";
import { GithubIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Route } from "next";
import Link from "next/link";

import { Organization } from "@/components/auth/organization/organization";
import { OrganizationsSettings } from "@/components/auth/organization/organizations-settings";
import { DashboardPageShell } from "@/components/dashboard/dashboard-page-shell";
import { buttonVariants } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function OrganizationsDashboard() {
  return (
    <DashboardPageShell
      eyebrow="Shared ownership"
      title="Organizations"
      description="Create a BedrockNexus team, respond to invitations, and manage every workspace you belong to. GitHub repository access is connected separately."
    >
      <OrganizationsSettings />
    </DashboardPageShell>
  );
}

export function OrganizationWorkspace({ slug, path }: { slug: string; path: string }) {
  const { data: organization } = useActiveOrganization(
    authClient as unknown as OrganizationAuthClient,
  );
  const organizationName = organization?.name ?? "Organization";

  return (
    <DashboardPageShell
      eyebrow="Organization workspace"
      title={organizationName}
      description={`Manage the profile, members, invitations, and publishing connections for /${slug}.`}
      actions={
        <div className="flex flex-wrap gap-2">
          <a
            className={cn(buttonVariants(), "gap-2")}
            href={`/api/github/install?organization=${encodeURIComponent(slug)}`}
          >
            <HugeiconsIcon className="size-4" icon={GithubIcon} />
            Connect GitHub App
          </a>
          <Link
            className={buttonVariants({ variant: "outline" })}
            href={`/organizations/${slug}` as Route}
          >
            Public profile
          </Link>
        </div>
      }
    >
      <Organization path={path} />
    </DashboardPageShell>
  );
}
