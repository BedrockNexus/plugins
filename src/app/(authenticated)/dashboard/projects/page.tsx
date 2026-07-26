import {
  Add01Icon,
  CheckmarkCircle02Icon,
  GithubIcon,
  Package01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata, Route } from "next";
import Link from "next/link";

import { api } from "@/../convex/_generated/api";
import { DashboardPageShell } from "@/components/dashboard/dashboard-page-shell";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchAuthQuery } from "@/lib/auth-server";
import { formatCompactNumber, formatRegistryDate } from "@/lib/format-registry";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Projects",
  robots: { index: false, follow: false },
};

const statusMessages = {
  connected: "The GitHub App is connected and its public repositories are synchronized.",
  "configuration-error": "The GitHub App credentials are not configured yet.",
  "invalid-callback": "GitHub returned an incomplete installation callback.",
  "connection-failed": "The installation could not be verified. Start the GitHub flow again.",
} as const;

function displayStatus(status: string) {
  return status.replace(/([a-z])([A-Z])/g, "$1 $2");
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ github?: string; account?: string }>;
}) {
  const params = await searchParams;
  const [projects, drafts, installations] = await Promise.all([
    fetchAuthQuery(api.functions.projects.projects.listMine, {}),
    fetchAuthQuery(api.functions.projects.publishing.model.listMine, {}),
    fetchAuthQuery(api.functions.github.installations.listMine, {}),
  ]);
  const draftByProjectId = new Map(
    drafts
      .filter(({ draft }) => draft.projectId)
      .map(({ draft }) => [draft.projectId as string, draft]),
  );
  const projectIds = new Set(projects.map((project) => project.projectId as string));
  const rows = [
    ...projects.map((project) => ({
      key: project.projectId as string,
      project,
      draft: draftByProjectId.get(project.projectId as string),
    })),
    ...drafts
      .filter(({ draft }) => !draft.projectId || !projectIds.has(draft.projectId as string))
      .map(({ draft, repository }) => ({
        key: draft._id as string,
        project: null,
        draft,
        repository,
      })),
  ].sort(
    (left, right) =>
      (right.project?.updatedAt ?? right.draft?.updatedAt ?? 0) -
      (left.project?.updatedAt ?? left.draft?.updatedAt ?? 0),
  );
  const connectedRepositories = installations.reduce(
    (total, installation) => total + installation.repositories.length,
    0,
  );
  const publishedProjects = projects.filter((project) => project.status === "published");
  const totalDownloads = projects.reduce((total, project) => total + project.downloadCount, 0);
  const status =
    params.github && params.github in statusMessages
      ? statusMessages[params.github as keyof typeof statusMessages]
      : null;

  return (
    <DashboardPageShell
      eyebrow="GitHub-native publishing"
      title="Projects"
      description="Connect repositories, edit plugin metadata, verify GitHub releases, and submit them for moderator review from one workspace."
      actions={
        <Link className={buttonVariants()} href={"/dashboard/projects/new" as Route}>
          <HugeiconsIcon className="size-4" icon={Add01Icon} />
          Add project
        </Link>
      }
    >
      {status ? (
        <div className="flex items-start gap-3 rounded-xl border bg-card p-4 text-sm">
          <HugeiconsIcon
            className="mt-0.5 size-5 shrink-0 text-primary"
            icon={CheckmarkCircle02Icon}
          />
          <p>
            {status}
            {params.account ? ` Connected account: ${params.account}.` : ""}
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Projects",
            value: rows.length.toString(),
            detail: "Drafts and published plugins",
          },
          {
            label: "Connected repositories",
            value: connectedRepositories.toString(),
            detail: "Public repositories available",
          },
          {
            label: "Published",
            value: publishedProjects.length.toString(),
            detail: "Approved in the public catalog",
          },
          {
            label: "Downloads",
            value: formatCompactNumber(totalDownloads),
            detail: "Across published projects",
          },
        ].map((metric) => (
          <Card className="shadow-none" key={metric.label}>
            <CardContent className="p-5">
              <p className="text-muted-foreground text-sm">{metric.label}</p>
              <p className="mt-2 font-bold text-3xl tracking-tight">{metric.value}</p>
              <p className="mt-1 text-muted-foreground text-xs">{metric.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {rows.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
            <span className="grid size-14 place-items-center rounded-xl bg-primary text-primary-foreground">
              <HugeiconsIcon className="size-6" icon={Package01Icon} />
            </span>
            <h2 className="mt-5 font-semibold text-lg">Add your first project</h2>
            <p className="mt-2 max-w-md text-muted-foreground text-sm leading-6">
              Choose a repository already granted to the GitHub App, or install the App during
              setup. Nothing becomes public until a moderator approves the verified release.
            </p>
            <Link
              className={cn(buttonVariants(), "mt-5")}
              href={"/dashboard/projects/new" as Route}
            >
              <HugeiconsIcon className="size-4" icon={Add01Icon} />
              Add project
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="border-b bg-muted text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Project</th>
                  <th className="px-5 py-3 font-medium">Repository</th>
                  <th className="px-5 py-3 font-medium">Release</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Updated</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => {
                  const name = row.project?.name ?? row.draft?.name ?? "Detected project";
                  const summary = row.project?.summary ?? row.draft?.summary;
                  const repository =
                    row.project?.repository ??
                    ("repository" in row
                      ? {
                          fullName: row.repository.fullName,
                          htmlUrl: row.repository.htmlUrl,
                        }
                      : null);
                  const statusValue = row.draft?.status ?? row.project?.status ?? "draft";
                  const manageHref = row.draft
                    ? (`/dashboard/projects/${row.draft._id}` as Route)
                    : null;
                  return (
                    <tr className="align-middle" key={row.key}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                            <HugeiconsIcon className="size-4" icon={Package01Icon} />
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium">{name}</p>
                            <p className="max-w-72 truncate text-muted-foreground text-xs">
                              {summary}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {repository ? (
                          <a
                            className="hover:text-primary hover:underline"
                            href={repository.htmlUrl}
                            rel="noreferrer"
                            target="_blank"
                          >
                            {repository.fullName}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">Not connected</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {row.draft?.latestTag ??
                          (row.project?.latestVersion
                            ? `v${row.project.latestVersion.version}`
                            : "No release detected")}
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          variant={
                            statusValue === "published"
                              ? "accent"
                              : statusValue === "rejected"
                                ? "destructive"
                                : "outline"
                          }
                        >
                          {displayStatus(statusValue)}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {formatRegistryDate(
                          row.project?.updatedAt ?? row.draft?.updatedAt ?? Date.now(),
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {manageHref ? (
                            <Link
                              className={buttonVariants({ variant: "outline", size: "sm" })}
                              href={manageHref}
                            >
                              Manage
                            </Link>
                          ) : null}
                          {row.project?.status === "published" &&
                          row.project.visibility === "public" ? (
                            <Link
                              aria-label={`View ${row.project.name}`}
                              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                              href={`/projects/${row.project.slug}` as Route}
                            >
                              <HugeiconsIcon icon={ViewIcon} />
                            </Link>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t px-5 py-3 text-muted-foreground text-xs">
            <span>{rows.length} projects</span>
            <a
              className="inline-flex items-center gap-1.5 hover:text-foreground"
              href="/api/github/install"
            >
              <HugeiconsIcon className="size-4" icon={GithubIcon} />
              Configure GitHub App
            </a>
          </div>
        </Card>
      )}
    </DashboardPageShell>
  );
}
