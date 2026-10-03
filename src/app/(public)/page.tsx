import {
  ArrowRight01Icon,
  CheckmarkBadge01Icon,
  GitBranchIcon,
  Search01Icon,
  SearchMinusIcon,
  Shield01Icon,
  WorkflowCircle01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { fetchQuery } from "convex/nextjs";
import type { Route } from "next";
import Link from "next/link";

import { api } from "@/../convex/_generated/api";
import { EmptyState } from "@/components/empty-state";
import { ProjectList } from "@/components/registry/project-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCompactNumber } from "@/lib/format-registry";
import { cn } from "@/lib/utils";

const publishingSteps = [
  {
    icon: GitBranchIcon,
    title: "Connect a public repository",
    description: "Install the GitHub App and pick the plugin repository.",
  },
  {
    icon: WorkflowCircle01Icon,
    title: "Tag a release",
    description: "A managed GitHub Actions workflow builds the artifact.",
  },
  {
    icon: Shield01Icon,
    title: "Pass review",
    description: "A moderator approves the verified release for the catalog.",
  },
] as const;

export default async function HomePage() {
  const [featuredResult, softwareResult] = await Promise.allSettled([
    fetchQuery(api.functions.site.catalog.featured, { limit: 8 }),
    fetchQuery(api.functions.site.catalog.listSoftware, {}),
  ]);
  const featuredProjects = featuredResult.status === "fulfilled" ? featuredResult.value : [];
  const softwareCatalog = softwareResult.status === "fulfilled" ? softwareResult.value : [];
  const featuredAvailable = featuredResult.status === "fulfilled";
  const publishedProjectCount = softwareCatalog.reduce(
    (total, software) => total + software.projectCount,
    0,
  );

  return (
    <main className="flex-1">
      <section className="border-b">
        <div className="container mx-auto px-4 py-12 md:px-6 lg:py-14">
          <h1 className="max-w-3xl text-balance font-bold text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.05]">
            Bedrock server plugins, built from source.
          </h1>
          <p className="mt-4 max-w-xl text-[17px] text-muted-foreground">
            Every release is built by GitHub Actions from a public repository and reviewed before it
            is listed.
          </p>

          <search className="mt-7 block max-w-2xl">
            <form
              action="/explore"
              className="flex flex-wrap gap-2.5 rounded-sm border border-input bg-card p-2.5"
            >
              <label className="relative min-w-0 flex-1" htmlFor="home-registry-search">
                <HugeiconsIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                  icon={Search01Icon}
                />
                <span className="sr-only">Search plugins</span>
                <Input
                  className="h-12 bg-background pl-10 text-base"
                  id="home-registry-search"
                  name="q"
                  placeholder="Search plugins"
                  type="search"
                />
              </label>
              <Button className="max-sm:w-full" size="xl" type="submit" variant="brand">
                Search
              </Button>
            </form>
          </search>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Browse:</span>
            {softwareCatalog.map((software) => (
              <Link
                className="inline-flex min-h-10 items-center gap-2 rounded-sm border border-input bg-card px-3.5 font-medium text-muted-foreground transition-colors hover:border-ember hover:text-foreground"
                href={`/explore?software=${software.slug}` as Route}
                key={software.slug}
              >
                {software.name}
                <span className="font-mono text-xs opacity-70">
                  {formatCompactNumber(software.projectCount)}
                </span>
              </Link>
            ))}
            <Link
              className="inline-flex min-h-10 items-center gap-1 px-2 font-semibold text-ember-text transition-colors hover:text-foreground"
              href="/explore"
            >
              {publishedProjectCount > 0
                ? `All ${formatCompactNumber(publishedProjectCount)} plugins`
                : "All plugins"}
              <HugeiconsIcon aria-hidden="true" className="size-3.5" icon={ArrowRight01Icon} />
            </Link>
          </div>
        </div>
      </section>
      <div aria-hidden="true" className="strata h-12 border-ember border-b-[3px]" />

      <div className="container mx-auto grid gap-10 px-4 py-10 md:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:py-14">
        <section aria-labelledby="popular-heading">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-bold text-2xl" id="popular-heading">
                Popular plugins
              </h2>
              <p className="mt-1 text-muted-foreground text-sm">Most downloaded in the catalog</p>
            </div>
            <Link
              className="inline-flex min-h-11 items-center gap-1 font-semibold text-ember-text hover:text-foreground"
              href="/explore?sort=downloads"
            >
              View all
              <HugeiconsIcon className="size-4" icon={ArrowRight01Icon} />
            </Link>
          </div>

          {featuredProjects.length > 0 ? (
            <ProjectList projects={featuredProjects} />
          ) : (
            <EmptyState
              action={
                <Link className={buttonVariants()} href="/dashboard/projects/new">
                  Publish the first plugin
                </Link>
              }
              description={
                featuredAvailable
                  ? "Reviewed releases appear here as soon as they are approved."
                  : "We could not reach the catalog service. The rest of the site remains available while it reconnects."
              }
              icon={SearchMinusIcon}
              title={
                featuredAvailable
                  ? "No plugins published yet"
                  : "The catalog is temporarily unavailable"
              }
            />
          )}
        </section>

        <aside className="space-y-6">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Server software</CardTitle>
              <CardDescription>Platforms accepting plugins</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {softwareCatalog.length > 0 ? (
                softwareCatalog.map((software) => (
                  <Link
                    className="group -mx-2 flex min-h-11 items-center justify-between gap-4 rounded-sm px-2 transition-colors hover:bg-muted"
                    href={`/software/${software.slug}`}
                    key={software.slug}
                  >
                    <span className="truncate font-medium text-sm">{software.name}</span>
                    <span className="flex items-center gap-2 text-muted-foreground text-xs">
                      {formatCompactNumber(software.projectCount)}
                      <HugeiconsIcon
                        className="size-4 transition-transform group-hover:translate-x-0.5"
                        icon={ArrowRight01Icon}
                      />
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  The software list is temporarily unavailable.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Publish your plugin</CardTitle>
              <CardDescription>From GitHub release to catalog listing</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {publishingSteps.map((step, index) => (
                  <li className="flex gap-3" key={step.title}>
                    <span className="extrude grid size-8 shrink-0 place-items-center rounded-sm border-2 border-edge bg-primary text-primary-foreground">
                      <HugeiconsIcon className="size-4" icon={step.icon} />
                    </span>
                    <div>
                      <p className="font-medium text-sm">
                        <span className="sr-only">Step {index + 1}: </span>
                        {step.title}
                      </p>
                      <p className="mt-0.5 text-muted-foreground text-xs leading-5">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              <Link
                className={cn(
                  buttonVariants({ variant: "brand", size: "lg" }),
                  "mt-6 w-full gap-1.5",
                )}
                href="/dashboard/projects/new"
              >
                Start publishing
                <HugeiconsIcon className="size-4" icon={ArrowRight01Icon} />
              </Link>
            </CardContent>
          </Card>

          <p className="flex gap-2 px-1 text-muted-foreground text-xs leading-5">
            <HugeiconsIcon className="mt-0.5 size-4 shrink-0" icon={CheckmarkBadge01Icon} />
            "Traceable build" describes build provenance: tag, commit, workflow run and asset. It is
            not a malware or security review.
          </p>
        </aside>
      </div>
    </main>
  );
}
