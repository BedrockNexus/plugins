import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  GitBranchIcon,
  GithubIcon,
  LockIcon,
  RepositoryIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";

import { api } from "@/../convex/_generated/api";
import { PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAuthQuery } from "@/lib/auth-server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Repository connections",
  robots: { index: false, follow: false },
};

const statusMessages = {
  connected: {
    icon: CheckmarkCircle02Icon,
    text: "The GitHub App installation is connected and its public repositories are synchronized.",
  },
  "configuration-error": {
    icon: Alert02Icon,
    text: "The GitHub App credentials are not configured yet.",
  },
  "invalid-callback": {
    icon: Alert02Icon,
    text: "GitHub returned an incomplete installation callback.",
  },
  "connection-failed": {
    icon: Alert02Icon,
    text: "The installation could not be verified. Start the GitHub flow again.",
  },
} as const;

export default async function RepositoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ github?: string; account?: string }>;
}) {
  const params = await searchParams;
  const installations = await fetchAuthQuery(api.github.installations.listMine, {});
  const status =
    params.github && params.github in statusMessages
      ? statusMessages[params.github as keyof typeof statusMessages]
      : null;

  return (
    <PageShell
      eyebrow="GitHub App"
      title="Repository connections"
      description="Install the BedrockNexus Plugins GitHub App and grant only the public repositories you want to publish."
      actions={
        <a className={cn(buttonVariants({ size: "lg" }), "gap-2")} href="/api/github/install">
          <HugeiconsIcon className="size-4" icon={GithubIcon} />
          Install GitHub App
        </a>
      }
    >
      {status ? (
        <div className="flex items-start gap-3 rounded-xl border bg-card p-4 text-sm">
          <HugeiconsIcon className="mt-0.5 size-5 shrink-0 text-primary" icon={status.icon} />
          <p>
            {status.text}
            {params.account ? ` Connected account: ${params.account}.` : ""}
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="shadow-none">
          <CardHeader>
            <span className="mb-4 grid size-12 place-items-center rounded-lg bg-primary text-primary-foreground">
              <HugeiconsIcon className="size-5" icon={GithubIcon} />
            </span>
            <CardTitle>Minimum repository access</CardTitle>
            <CardDescription className="leading-6">
              The App uses repository contents, pull requests, workflows, Actions, checks, statuses,
              and releases only for the GitHub-native publishing flow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <HugeiconsIcon className="mt-0.5 size-4 text-primary" icon={LockIcon} />
              <p className="text-muted-foreground leading-6">
                New private repositories are rejected without being persisted and are never returned
                to this workspace.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <HugeiconsIcon className="mt-0.5 size-4 text-primary" icon={CheckmarkCircle02Icon} />
              <p className="text-muted-foreground leading-6">
                Installation ownership is verified through GitHub user authorization, not from the
                callback ID alone.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          {installations.length === 0 ? (
            <Card className="border-dashed shadow-none">
              <CardContent className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
                <span className="grid size-14 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <HugeiconsIcon className="size-6" icon={RepositoryIcon} />
                </span>
                <h2 className="mt-5 font-semibold text-lg">No repositories connected</h2>
                <p className="mt-2 max-w-md text-muted-foreground text-sm leading-6">
                  Install the GitHub App, select public repositories, and they will appear here
                  after GitHub verifies the installation.
                </p>
              </CardContent>
            </Card>
          ) : (
            installations.map(({ installation, repositories }) => (
              <Card className="shadow-none" key={installation._id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle>{installation.accountLogin}</CardTitle>
                      <CardDescription>
                        {installation.accountType} installation ·{" "}
                        {installation.repositorySelection ?? "selected"} access
                      </CardDescription>
                    </div>
                    <Badge variant={installation.status === "active" ? "accent" : "outline"}>
                      {installation.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {repositories.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-5 text-muted-foreground text-sm">
                      This installation has no eligible public repositories.
                    </div>
                  ) : (
                    repositories.map((repository) => (
                      <div
                        className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center"
                        key={repository._id}
                      >
                        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                          <HugeiconsIcon className="size-4" icon={RepositoryIcon} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-medium">{repository.fullName}</p>
                            <Badge variant="outline">Public</Badge>
                            {repository.isArchived ? (
                              <Badge variant="outline">Archived</Badge>
                            ) : null}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-muted-foreground text-xs">
                            <span className="inline-flex items-center gap-1">
                              <HugeiconsIcon className="size-3.5" icon={GitBranchIcon} />
                              {repository.defaultBranch}
                            </span>
                            {repository.primaryLanguage ? (
                              <span>{repository.primaryLanguage}</span>
                            ) : null}
                          </div>
                        </div>
                        <a
                          className={buttonVariants({ variant: "outline" })}
                          href={repository.htmlUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          View on GitHub
                        </a>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </PageShell>
  );
}
