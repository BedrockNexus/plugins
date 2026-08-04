import {
  ArrowRight01Icon,
  CheckmarkBadge01Icon,
  CodeIcon,
  GitBranchIcon,
  Package01Icon,
  Search01Icon,
  SearchMinusIcon,
  ServerStack01Icon,
  Shield01Icon,
  WorkflowCircle01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { fetchQuery } from "convex/nextjs";
import Link from "next/link";

import { api } from "@/../convex/_generated/api";
import { EmptyState } from "@/components/empty-state";
import { ProjectCard } from "@/components/registry/project-card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Stat, StatDescription, StatIndicator, StatLabel, StatValue } from "@/components/ui/stat";
import { formatCompactNumber } from "@/lib/format-registry";
import { cn } from "@/lib/utils";

const publishingPath = [
  { icon: GitBranchIcon, label: "Connect", detail: "Public GitHub repository" },
  { icon: CodeIcon, label: "Build", detail: "Selected Actions workflow" },
  { icon: Shield01Icon, label: "Review", detail: "Moderator approval" },
  { icon: Package01Icon, label: "Publish", detail: "Traceable release asset" },
] as const;

const publishingSteps = [
  {
    number: "01",
    icon: GitBranchIcon,
    title: "Connect the source",
    description: "Install the GitHub App on a public plugin repository and choose its owner.",
  },
  {
    number: "02",
    icon: WorkflowCircle01Icon,
    title: "Build a release",
    description: "Pick a managed workflow, tag a version, and let GitHub produce the artifact.",
  },
  {
    number: "03",
    icon: CheckmarkBadge01Icon,
    title: "Pass review",
    description: "Submit the verified release for moderator review before it enters the catalog.",
  },
] as const;

export default async function HomePage() {
  const [featuredResult, softwareResult] = await Promise.allSettled([
    fetchQuery(api.functions.site.catalog.featured, { limit: 6 }),
    fetchQuery(api.functions.site.catalog.listSoftware, {}),
  ]);
  const featuredProjects = featuredResult.status === "fulfilled" ? featuredResult.value : [];
  const softwareCatalog = softwareResult.status === "fulfilled" ? softwareResult.value : [];
  const featuredAvailable = featuredResult.status === "fulfilled";
  const softwareAvailable = softwareResult.status === "fulfilled";
  const publishedProjectCount = softwareCatalog.reduce(
    (total, software) => total + software.projectCount,
    0,
  );

  return (
    <main className="flex-1">
      <section className="relative isolate overflow-hidden border-b">
        <div className="site-grid absolute inset-0 -z-20" />
        <div className="container mx-auto grid min-h-[640px] items-center gap-12 px-4 py-16 md:px-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(22rem,0.88fr)] lg:py-24">
          <div className="max-w-3xl">
            <Badge className="mb-6 gap-2 bg-background" variant="outline">
              <span className="size-2 rounded-full bg-primary" />
              The Bedrock plugin registry
            </Badge>
            <h1 className="text-balance font-bold text-5xl leading-[1.02] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              Plugins you can trace from source to release.
            </h1>
            <p className="mt-7 max-w-2xl text-base text-muted-foreground leading-7 sm:text-lg">
              Discover Bedrock server plugins backed by public repositories, GitHub Actions, and
              moderator-reviewed release artifacts.
            </p>

            <search className="mt-9 block">
              <form action="/explore" className="flex max-w-2xl flex-col gap-3 sm:flex-row">
                <label className="relative min-w-0 flex-1" htmlFor="home-registry-search">
                  <HugeiconsIcon
                    aria-hidden="true"
                    className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                    icon={Search01Icon}
                  />
                  <span className="sr-only">Search the plugin registry</span>
                  <Input
                    className="h-12 bg-background pl-10 shadow-sm"
                    id="home-registry-search"
                    name="q"
                    placeholder="Search plugins, creators, or software"
                    type="search"
                  />
                </label>
                <Button className="h-12 gap-2 px-6 font-semibold" type="submit">
                  Search registry
                  <HugeiconsIcon aria-hidden="true" className="size-4" icon={ArrowRight01Icon} />
                </Button>
              </form>
            </search>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-muted-foreground text-sm">
              <span className="inline-flex items-center gap-2">
                <HugeiconsIcon className="size-4 text-primary" icon={CheckmarkBadge01Icon} />
                Public source
              </span>
              <span className="inline-flex items-center gap-2">
                <HugeiconsIcon className="size-4 text-primary" icon={CheckmarkBadge01Icon} />
                GitHub-hosted assets
              </span>
              <span className="inline-flex items-center gap-2">
                <HugeiconsIcon className="size-4 text-primary" icon={CheckmarkBadge01Icon} />
                Reviewed before publishing
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-3 -z-10 rounded-3xl bg-primary" />
            <div className="overflow-hidden rounded-2xl border bg-background shadow-2xl">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <div>
                  <p className="font-semibold">Publishing trail</p>
                  <p className="text-muted-foreground text-xs">One release, four visible checks</p>
                </div>
                <Badge variant="accent">Traceable build</Badge>
              </div>
              <div className="p-3">
                {publishingPath.map((item, index) => (
                  <div className="relative flex items-center gap-4 rounded-xl p-3" key={item.label}>
                    {index < publishingPath.length - 1 ? (
                      <span className="absolute top-12 bottom-0 left-[1.95rem] w-px bg-border" />
                    ) : null}
                    <span className="z-10 grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                      <HugeiconsIcon className="size-4" icon={item.icon} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="truncate text-muted-foreground text-xs">{item.detail}</p>
                    </div>
                    <span className="font-mono text-muted-foreground text-xs">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t bg-muted/50 px-5 py-4 text-muted-foreground text-xs leading-5">
                “Traceable” describes build provenance. It is not a malware or security guarantee.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b bg-muted/30">
        <div className="container mx-auto grid gap-4 px-4 py-6 md:grid-cols-3 md:px-6">
          <Stat className="shadow-none">
            <StatLabel>Published plugins</StatLabel>
            <StatIndicator color="success" variant="icon">
              <HugeiconsIcon icon={Package01Icon} />
            </StatIndicator>
            <StatValue>
              {softwareAvailable ? formatCompactNumber(publishedProjectCount) : "—"}
            </StatValue>
            <StatDescription>
              {softwareAvailable
                ? "Approved projects in the public catalog"
                : "Catalog data is temporarily unavailable"}
            </StatDescription>
          </Stat>
          <Stat className="shadow-none">
            <StatLabel>Supported software</StatLabel>
            <StatIndicator color="info" variant="icon">
              <HugeiconsIcon icon={ServerStack01Icon} />
            </StatIndicator>
            <StatValue>{softwareAvailable ? softwareCatalog.length : "—"}</StatValue>
            <StatDescription>
              {softwareAvailable
                ? "Server platforms with publishing adapters"
                : "Software data is temporarily unavailable"}
            </StatDescription>
          </Stat>
          <Stat className="shadow-none">
            <StatLabel>Artifact source</StatLabel>
            <StatIndicator variant="icon">
              <HugeiconsIcon icon={GitBranchIcon} />
            </StatIndicator>
            <StatValue>GitHub</StatValue>
            <StatDescription>Release files remain with their source repository</StatDescription>
          </Stat>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 md:px-6 lg:py-24">
        <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-primary text-xs uppercase tracking-[0.18em]">Discover</p>
            <h2 className="mt-3 text-balance font-bold text-3xl tracking-tight sm:text-4xl">
              Projects worth exploring
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground leading-7">
              Popular plugins with public ownership, release history, and build provenance.
            </p>
          </div>
          <Link className={buttonVariants({ variant: "outline" })} href="/explore">
            View the catalog
            <HugeiconsIcon className="size-4" icon={ArrowRight01Icon} />
          </Link>
        </div>

        {featuredProjects.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        ) : (
          <EmptyState
            action={
              <Link className={buttonVariants()} href="/dashboard/projects">
                Publish a project
              </Link>
            }
            description={
              featuredAvailable
                ? "The first reviewed releases will appear here as the catalog opens."
                : "We could not reach the catalog service. The rest of the site remains available while it reconnects."
            }
            icon={SearchMinusIcon}
            title={
              featuredAvailable
                ? "The catalog is ready for its first plugins"
                : "The catalog is temporarily unavailable"
            }
          />
        )}
      </section>

      <section className="border-y bg-muted/30">
        <div className="container mx-auto grid gap-12 px-4 py-16 md:px-6 lg:grid-cols-[1fr_0.8fr] lg:py-24">
          <div>
            <p className="font-mono text-primary text-xs uppercase tracking-[0.18em]">
              For creators
            </p>
            <h2 className="mt-3 max-w-xl text-balance font-bold text-3xl tracking-tight sm:text-4xl">
              A publishing flow built around your repository
            </h2>
            <div className="mt-9 divide-y border-y">
              {publishingSteps.map((step) => (
                <div
                  className="grid grid-cols-[3rem_1fr] gap-4 py-6 sm:grid-cols-[3rem_3rem_1fr]"
                  key={step.number}
                >
                  <span className="pt-2 font-mono text-muted-foreground text-xs">
                    {step.number}
                  </span>
                  <span className="hidden size-10 place-items-center rounded-lg bg-primary text-primary-foreground sm:grid">
                    <HugeiconsIcon className="size-4" icon={step.icon} />
                  </span>
                  <div>
                    <h3 className="font-semibold text-lg">{step.title}</h3>
                    <p className="mt-1 text-muted-foreground text-sm leading-6">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="self-center rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-lg">Supported platforms</p>
                <p className="mt-1 text-muted-foreground text-sm">
                  Adapters currently accepting projects
                </p>
              </div>
              <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                <HugeiconsIcon className="size-5" icon={ServerStack01Icon} />
              </span>
            </div>
            <div className="mt-6 space-y-2">
              {softwareCatalog.length > 0 ? (
                softwareCatalog.map((software) => (
                  <Link
                    className="group flex items-center justify-between gap-4 rounded-xl border p-4 transition-colors hover:bg-muted"
                    href={`/software/${software.slug}`}
                    key={software.slug}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{software.name}</p>
                      <p className="mt-0.5 text-muted-foreground text-xs">
                        {formatCompactNumber(software.projectCount)} projects
                      </p>
                    </div>
                    <HugeiconsIcon
                      className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1"
                      icon={ArrowRight01Icon}
                    />
                  </Link>
                ))
              ) : (
                <p className="rounded-xl border border-dashed p-6 text-center text-muted-foreground text-sm">
                  {softwareAvailable
                    ? "Software adapters are being prepared."
                    : "The software catalog is temporarily unavailable."}
                </p>
              )}
            </div>
            <Link className={cn(buttonVariants(), "mt-6 w-full")} href="/dashboard/projects/new">
              Add your project
              <HugeiconsIcon className="size-4" icon={ArrowRight01Icon} />
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 md:px-6 lg:py-24">
        <div className="relative overflow-hidden rounded-3xl bg-foreground px-6 py-12 text-background sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:px-14">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-background/70">
              Open publishing workspace
            </p>
            <h2 className="mt-3 text-balance font-bold text-3xl tracking-tight sm:text-4xl">
              Turn your next GitHub release into a catalog project.
            </h2>
            <p className="mt-4 text-background/70 leading-7">
              Connect a repository, choose its workflow, and submit a verified release for review.
            </p>
          </div>
          <Link
            className={cn(
              buttonVariants({ variant: "secondary", size: "lg" }),
              "mt-7 shrink-0 lg:mt-0",
            )}
            href="/dashboard/projects/new"
          >
            Start publishing
            <HugeiconsIcon className="size-4" icon={ArrowRight01Icon} />
          </Link>
        </div>
      </section>
    </main>
  );
}
