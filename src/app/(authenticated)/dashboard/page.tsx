import {
  Add01Icon,
  Analytics01Icon,
  ArrowRight01Icon,
  Building03Icon,
  CheckmarkCircle02Icon,
  Package01Icon,
  RepositoryIcon,
  Rocket01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import type { Metadata, Route } from "next";
import Link from "next/link";

import { api } from "@/../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchAuthQuery } from "@/lib/auth-server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Developer dashboard",
  robots: { index: false, follow: false },
};

function KpiCard({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: IconSvgElement;
  tone: "primary" | "amber" | "emerald";
}) {
  const iconClassName = {
    primary: "bg-primary text-primary-foreground",
    amber: "bg-amber-500 text-white",
    emerald: "bg-emerald-600 text-white",
  }[tone];

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-sm">{label}</p>
          <p className="font-bold text-3xl tabular-nums tracking-tight">{value}</p>
          <p className="text-muted-foreground text-xs">{hint}</p>
        </div>
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-lg shadow-xs",
            iconClassName,
          )}
        >
          <HugeiconsIcon className="size-5" icon={icon} />
        </span>
      </CardContent>
    </Card>
  );
}

const quickActions = [
  {
    label: "Organizations",
    description: "Manage team workspaces and members",
    href: "/dashboard/organizations",
    icon: Building03Icon,
  },
  {
    label: "Publish plugin",
    description: "Start the repository publishing flow",
    href: "/dashboard/projects/new",
    icon: Rocket01Icon,
  },
  {
    label: "Manage projects",
    description: "Review public project records",
    href: "/dashboard/projects",
    icon: Package01Icon,
  },
  {
    label: "Account settings",
    description: "Manage your profile and security",
    href: "/settings/account",
    icon: Settings01Icon,
  },
] as const;

export default async function DashboardPage() {
  const [currentUser, installations] = await Promise.all([
    fetchAuthQuery(api.functions.site.users.getCurrentUser, {}),
    fetchAuthQuery(api.functions.github.installations.listMine, {}),
  ]);
  const repositories = installations.flatMap((item) => item.repositories);
  const activeInstallations = installations.filter(
    (item) => item.installation.status === "active",
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden border-border/60">
        <CardContent className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 site-grid opacity-50" />
          <div className="relative flex flex-col gap-2">
            <p className="text-muted-foreground text-sm">Welcome back,</p>
            <h1 className="font-bold text-3xl tracking-tight">
              {currentUser?.name ?? "Developer"}
            </h1>
            <p className="max-w-lg text-muted-foreground text-sm leading-6">
              Connect repositories, publish verified releases, and manage your Bedrock plugin
              catalog from one workspace.
            </p>
          </div>
          <div className="relative flex flex-wrap gap-2">
            <Link className={buttonVariants()} href={"/dashboard/projects/new" as Route}>
              <HugeiconsIcon className="size-4" icon={Add01Icon} />
              Publish plugin
            </Link>
            <Link
              className={buttonVariants({ variant: "outline" })}
              href={"/dashboard/projects" as Route}
            >
              Manage repositories
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          hint="GitHub App installations"
          icon={CheckmarkCircle02Icon}
          label="Active connections"
          tone="primary"
          value={activeInstallations}
        />
        <KpiCard
          hint="Eligible public repositories"
          icon={RepositoryIcon}
          label="Connected repositories"
          tone="amber"
          value={repositories.length}
        />
        <KpiCard
          hint="Across published projects"
          icon={Analytics01Icon}
          label="Recorded downloads"
          tone="emerald"
          value="—"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between gap-3 border-b p-5">
            <div>
              <h2 className="font-semibold text-base">Your repositories</h2>
              <p className="text-muted-foreground text-sm">
                Public repositories currently granted to the GitHub App
              </p>
            </div>
            <Link
              className={buttonVariants({ size: "sm", variant: "ghost" })}
              href={"/dashboard/projects" as Route}
            >
              View all
              <HugeiconsIcon className="size-4" icon={ArrowRight01Icon} />
            </Link>
          </div>
          {repositories.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
                <HugeiconsIcon className="size-6" icon={RepositoryIcon} />
              </span>
              <div>
                <h3 className="font-semibold">No repositories connected</h3>
                <p className="mt-1 text-muted-foreground text-sm">
                  Install the GitHub App to begin publishing.
                </p>
              </div>
              <a className={buttonVariants({ size: "sm" })} href="/api/github/install">
                <HugeiconsIcon className="size-4" icon={Add01Icon} />
                Connect repository
              </a>
            </div>
          ) : (
            <div className="divide-y">
              {repositories.slice(0, 5).map((repository) => (
                <a
                  className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted"
                  href={repository.htmlUrl}
                  key={repository._id}
                  rel="noreferrer"
                  target="_blank"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                      <HugeiconsIcon className="size-4" icon={RepositoryIcon} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-sm">{repository.fullName}</p>
                      <p className="truncate text-muted-foreground text-xs">
                        Default branch: {repository.defaultBranch}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">Public</Badge>
                </a>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="border-b p-5">
            <h2 className="font-semibold text-base">Quick actions</h2>
            <p className="text-muted-foreground text-sm">Common tasks at a glance</p>
          </div>
          <div className="grid gap-1 p-3">
            {quickActions.map((action) => (
              <Link
                className="group flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted"
                href={action.href as Route}
                key={action.href}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg border bg-background text-muted-foreground group-hover:text-foreground">
                  <HugeiconsIcon className="size-4" icon={action.icon} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-sm">{action.label}</span>
                  <span className="block truncate text-muted-foreground text-xs">
                    {action.description}
                  </span>
                </span>
                <HugeiconsIcon className="size-4 text-muted-foreground" icon={ArrowRight01Icon} />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
