import {
  ArrowRight01Icon,
  CheckmarkBadge01Icon,
  CheckmarkCircle02Icon,
  CodeIcon,
  FileCode,
  GitBranchIcon,
  GitPullRequestIcon,
  Package01Icon,
  Search01Icon,
  SearchMinusIcon,
  Shield01Icon,
  WorkflowCircle01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { fetchQuery } from "convex/nextjs";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { ProjectCard } from "@/components/registry/project-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "../../../convex/_generated/api";

const provenanceRows = [
  { icon: GitBranchIcon, label: "Source", value: "public repository" },
  { icon: WorkflowCircle01Icon, label: "Workflow", value: "GitHub Actions" },
  { icon: FileCode, label: "Release", value: "version tag" },
  { icon: Package01Icon, label: "Asset", value: "GitHub Release" },
] as const;

const publishingSteps = [
  {
    icon: GitBranchIcon,
    title: "Connect a repository",
    description: "Grant the BedrockNexus GitHub App access to a public plugin repository.",
  },
  {
    icon: CodeIcon,
    title: "Detect and configure",
    description: "An adapter identifies the server software, build tool, and expected output.",
  },
  {
    icon: GitPullRequestIcon,
    title: "Publish through GitHub",
    description: "Install the managed workflow and publish verified builds from version tags.",
  },
] as const;

const trustSignals = [
  {
    icon: WorkflowCircle01Icon,
    title: "Traceable builds",
    description: "Every version points back to its workflow run, commit, tag, release, and asset.",
  },
  {
    icon: Shield01Icon,
    title: "No mystery uploads",
    description: "Release files stay on GitHub. BedrockNexus never runs repository code.",
  },
  {
    icon: CheckmarkBadge01Icon,
    title: "Clear provenance",
    description: "Verified Build describes a traceable build path, not a security guarantee.",
  },
] as const;

export default async function HomePage() {
  const [featuredProjects, softwareCatalog] = await Promise.all([
    fetchQuery(api.functions.site.catalog.featured, { limit: 6 }),
    fetchQuery(api.functions.site.catalog.listSoftware, {}),
  ]);

  return (
    <main className="flex-1">
      <section className="relative isolate overflow-hidden border-b">
        <div className="site-grid absolute inset-0 -z-20" />
        <div className="absolute -top-40 right-0 -z-10 size-120 rounded-full bg-primary/20 blur-3xl" />
        <div className="container mx-auto grid min-h-[680px] items-center gap-12 px-4 py-16 md:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
          <div className="max-w-3xl">
            <Badge className="mb-6 gap-2" variant="outline">
              <span className="size-1.5 rounded-full bg-primary ring-4 ring-primary/20" />
              GitHub-native Bedrock registry
            </Badge>
            <h1 className="text-balance font-bold text-5xl leading-[1.03] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Ship Bedrock plugins with a{" "}
              <span className="relative whitespace-nowrap">
                build trail
                <span className="absolute inset-x-0 bottom-1 -z-10 h-3 bg-primary/70 sm:h-4" />
              </span>{" "}
              users can follow.
            </h1>
            <p className="mt-7 max-w-2xl text-base text-muted-foreground leading-7 sm:text-lg">
              BedrockNexus connects public repositories to discoverable plugin pages while GitHub
              remains the source of truth for code, builds, and release assets.
            </p>

            <search className="mt-9 block">
              <form action="/explore" className="flex max-w-xl flex-col gap-3 sm:flex-row">
                <label className="relative min-w-0 flex-1" htmlFor="home-registry-search">
                  <HugeiconsIcon
                    icon={Search01Icon}
                    className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Search the plugin registry</span>
                  <Input
                    className="h-11 bg-background pl-10 shadow-sm"
                    id="home-registry-search"
                    name="q"
                    placeholder="Search plugins and creators"
                    type="search"
                  />
                </label>
                <Button className="h-11 gap-2 font-semibold" type="submit">
                  Explore registry
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" aria-hidden="true" />
                </Button>
              </form>
            </search>
          </div>

          <Card className="relative overflow-hidden border-foreground/10 bg-card/95 py-0 shadow-2xl shadow-black/10 backdrop-blur">
            <div className="h-1.5 bg-primary" />
            <CardHeader className="border-b py-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardDescription className="font-mono text-xs uppercase tracking-[0.18em]">
                    Release provenance
                  </CardDescription>
                  <CardTitle className="mt-2 text-xl">A build path, not a black box</CardTitle>
                </div>
                <Badge className="gap-1.5" variant="accent">
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    className="size-3.5"
                    aria-hidden="true"
                  />
                  Verified build
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {provenanceRows.map((row) => (
                  <div
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border bg-muted/45 p-3"
                    key={row.label}
                  >
                    <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
                      <HugeiconsIcon icon={row.icon} className="size-4" aria-hidden="true" />
                    </span>
                    <span className="font-medium text-sm">{row.label}</span>
                    <span className="text-right text-muted-foreground text-sm">{row.value}</span>
                  </div>
                ))}
              </div>
              <p className="mt-5 border-t pt-5 text-muted-foreground text-xs leading-5">
                Each public release can be traced to the repository state and GitHub workflow that
                produced it.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-b py-16 sm:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em]">
                <span className="size-2 bg-primary" />
                Public registry
              </p>
              <h2 className="font-bold text-3xl tracking-tight md:text-5xl">
                Discover published projects.
              </h2>
              <p className="mt-4 text-muted-foreground leading-7">
                Ranked by recorded download redirects from trusted public releases.
              </p>
            </div>
            <Link href="/explore">
              <Button className="gap-2" variant="outline">
                Explore all projects
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>
          {featuredProjects.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.projectId} project={project} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={SearchMinusIcon}
              title="The public registry is ready"
              description="The first verified public release will appear here automatically."
            />
          )}
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-10 max-w-3xl">
            <p className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em]">
              <span className="size-2 bg-primary" />
              Publish without leaving GitHub
            </p>
            <h2 className="text-balance font-bold text-3xl tracking-tight md:text-5xl">
              Your repository remains the source of truth.
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground leading-7">
              BedrockNexus coordinates the publishing path. GitHub performs the build and hosts the
              permanent release asset.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {publishingSteps.map((step, index) => (
              <Card className="relative overflow-hidden shadow-none" key={step.title}>
                <CardHeader>
                  <div className="mb-8 flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-lg bg-primary text-primary-foreground">
                      <HugeiconsIcon icon={step.icon} className="size-5" aria-hidden="true" />
                    </span>
                    <span className="font-mono font-semibold text-muted-foreground text-xs">
                      0{index + 1}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription className="leading-6">{step.description}</CardDescription>
                </CardHeader>
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary/70" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y bg-muted">
        <div className="container mx-auto px-4 py-16 md:px-6 sm:py-24">
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em]">
                <span className="size-2 bg-primary" />
                Initial ecosystem
              </p>
              <h2 className="font-bold text-3xl tracking-tight md:text-5xl">
                {softwareCatalog.length} live adapters. One extensible platform.
              </h2>
            </div>
            <Link href="/software">
              <Button className="gap-2" variant="outline">
                Software directory
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {softwareCatalog.map((software) => (
              <Link
                className="group rounded-xl"
                href={`/software/${software.slug}`}
                key={software.slug}
              >
                <Card className="h-full transition-[transform,border-color] group-hover:-translate-y-1 group-hover:border-primary">
                  <CardHeader className="grid-cols-[auto_1fr_auto] items-center gap-x-4">
                    <span className="row-span-2 grid size-12 place-items-center rounded-lg bg-primary text-primary-foreground">
                      <HugeiconsIcon icon={Package01Icon} className="size-5" aria-hidden="true" />
                    </span>
                    <CardTitle className="col-start-2 text-lg">{software.name}</CardTitle>
                    <CardDescription className="col-start-2">
                      {software.projectCount} public{" "}
                      {software.projectCount === 1 ? "project" : "projects"}
                    </CardDescription>
                    <Badge className="col-start-3 row-start-1" variant="outline">
                      {software.adapterId}
                    </Badge>
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      className="col-start-3 row-start-2 size-4 justify-self-end text-muted-foreground transition-transform group-hover:translate-x-1"
                    />
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-10 max-w-2xl">
            <p className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em]">
              <span className="size-2 bg-primary" />
              Designed for trust, not hype
            </p>
            <h2 className="font-bold text-3xl tracking-tight md:text-5xl">
              Useful signals without vague promises.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {trustSignals.map((signal) => (
              <div className="border-t pt-7" key={signal.title}>
                <HugeiconsIcon icon={signal.icon} className="size-5" aria-hidden="true" />
                <h3 className="mt-7 font-semibold">{signal.title}</h3>
                <p className="mt-2 text-muted-foreground text-sm leading-6">{signal.description}</p>
              </div>
            ))}
          </div>

          <div className="relative mt-16 overflow-hidden rounded-xl bg-card px-6 py-10 text-card-foreground shadow-xs ring-1 ring-foreground/10 sm:px-10 sm:py-12">
            <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
            <div className="relative flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em]">
                  <span className="size-2 bg-primary" />
                  Built for plugin developers
                </p>
                <h2 className="mt-3 font-bold text-3xl tracking-tight sm:text-4xl">
                  Open your publishing workspace.
                </h2>
                <p className="mt-3 text-muted-foreground leading-7">
                  GitHub sign-in and profile sync are live. Repository connection arrives with the
                  GitHub App phase.
                </p>
              </div>
              <Link href="/dashboard">
                <Button className="gap-2" size="lg">
                  Developer dashboard
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
