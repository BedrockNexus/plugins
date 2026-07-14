import {
  ArrowRight,
  BadgeCheck,
  Box,
  Boxes,
  CheckCircle2,
  CircleDot,
  Code2,
  FileCode2,
  GitBranch,
  GitPullRequest,
  Search,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { softwareCatalog } from "@/lib/site";

const publishingSteps = [
  {
    icon: GitBranch,
    index: "01",
    title: "Connect a repository",
    description: "Grant the GitHub App access to a public plugin repository you control.",
  },
  {
    icon: Code2,
    index: "02",
    title: "Detect and configure",
    description: "An adapter identifies the software, build tool, language, and expected output.",
  },
  {
    icon: GitPullRequest,
    index: "03",
    title: "Publish through GitHub",
    description: "Review a generated workflow pull request and release from version tags.",
  },
] as const;

const trustSignals = [
  {
    icon: Workflow,
    title: "Traceable builds",
    description: "Connect every version to its workflow run, commit, tag, release, and asset.",
  },
  {
    icon: ShieldCheck,
    title: "No mystery uploads",
    description: "Release files stay on GitHub. The platform never runs repository code itself.",
  },
  {
    icon: Boxes,
    title: "Software adapters",
    description: "A modular contract keeps the registry open to more Bedrock server ecosystems.",
  },
] as const;

export default function HomePage() {
  return (
    <main className="flex-1 overflow-hidden">
      <section className="relative border-b border-border/70">
        <div className="site-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -left-40 top-24 size-[30rem] rounded-full bg-primary/12 blur-[110px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-40 -top-24 size-[28rem] rounded-full bg-brand-sky/10 blur-[110px]"
          aria-hidden="true"
        />

        <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-8 lg:py-28">
          <div>
            <Badge variant="accent" className="mb-6">
              <CircleDot aria-hidden="true" /> GitHub-native Bedrock registry
            </Badge>
            <h1 className="text-balance max-w-4xl text-5xl font-bold tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Ship Bedrock plugins with a build trail users can follow.
            </h1>
            <p className="mt-6 max-w-2xl text-balance text-lg leading-8 text-muted-foreground sm:text-xl">
              One place to publish, discover, and understand extensions for every Minecraft Bedrock
              server software—powered by public repositories and GitHub Releases.
            </p>

            <search>
              <form action="/explore" className="mt-9 flex max-w-2xl flex-col gap-3 sm:flex-row">
                <label htmlFor="project-search" className="relative flex-1">
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Search projects</span>
                  <Input
                    id="project-search"
                    name="q"
                    type="search"
                    placeholder="Search projects, software, or creators"
                    className="h-12 bg-card/85 pl-11 shadow-sm"
                  />
                </label>
                <Button type="submit" size="lg">
                  Explore registry <ArrowRight aria-hidden="true" />
                </Button>
              </form>
            </search>
            <p className="mt-3 text-xs text-muted-foreground">
              Registry data arrives with the Convex phase. Search currently opens the public
              preview.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:mx-0">
            <div
              className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-primary/15 via-transparent to-brand-sky/15 blur-2xl"
              aria-hidden="true"
            />
            <Card className="relative overflow-hidden border-foreground/10 bg-card/88 shadow-2xl backdrop-blur">
              <CardHeader className="border-b border-border/70 pb-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-foreground text-background">
                      <FileCode2 className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <CardTitle>Release provenance</CardTitle>
                      <CardDescription className="mt-1 font-mono text-xs">
                        v2.4.0 · example/plugin
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="accent">
                    <BadgeCheck aria-hidden="true" /> Verified build
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 py-1">
                {[
                  { label: "Source", value: "8f4c2b1", icon: GitBranch },
                  { label: "Workflow", value: "run #184", icon: Workflow },
                  { label: "Release", value: "GitHub Release", icon: Box },
                  { label: "Asset", value: "example-2.4.0.jar", icon: CheckCircle2 },
                ].map(({ label, value, icon: Icon }, index) => (
                  <div key={label} className="relative flex items-center gap-4 py-3.5">
                    {index < 3 && (
                      <span
                        className="absolute left-[17px] top-10 h-5 w-px bg-border"
                        aria-hidden="true"
                      />
                    )}
                    <span className="grid size-9 shrink-0 place-items-center rounded-full border bg-background text-primary">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="ml-auto font-mono text-xs font-semibold">{value}</span>
                  </div>
                ))}
              </CardContent>
              <div className="border-t border-border/70 bg-muted/50 px-6 py-4 font-mono text-xs text-muted-foreground">
                Built on GitHub · downloaded from GitHub
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="max-w-2xl">
          <p className="font-mono text-xs font-semibold tracking-[0.16em] text-primary uppercase">
            Publish without leaving GitHub
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
            Your repository remains the source of truth.
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            BedrockNexus coordinates the publishing path. GitHub performs the build and hosts every
            permanent release asset.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {publishingSteps.map((step) => (
            <Card
              key={step.index}
              className="relative overflow-hidden transition-transform hover:-translate-y-1"
            >
              <span className="absolute right-5 top-3 font-mono text-5xl font-black text-foreground/[0.045]">
                {step.index}
              </span>
              <CardHeader>
                <span className="mb-4 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="size-5" aria-hidden="true" />
                </span>
                <CardTitle className="text-lg">{step.title}</CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border/70 bg-muted/45">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="font-mono text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                Initial ecosystem
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
                Two adapters. One extensible platform.
              </h2>
            </div>
            <Link href="/software" className={buttonVariants({ variant: "outline" })}>
              View software directory <ArrowRight aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {softwareCatalog.map((software) => (
              <Link
                key={software.slug}
                href={`/software/${software.slug}`}
                className="group rounded-2xl"
              >
                <Card className="h-full transition-[border-color,transform] group-hover:-translate-y-1 group-hover:border-primary/35">
                  <CardHeader className="grid-cols-[auto_1fr_auto] items-center gap-x-4">
                    <span
                      className={`row-span-2 grid size-12 place-items-center rounded-xl ${
                        software.tone === "emerald"
                          ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
                          : "bg-sky-500/12 text-sky-600 dark:text-sky-400"
                      }`}
                    >
                      <Box className="size-5" aria-hidden="true" />
                    </span>
                    <CardTitle className="col-start-2 text-lg">{software.name}</CardTitle>
                    <CardDescription className="col-start-2">
                      {software.language} · {software.format}
                    </CardDescription>
                    <ArrowRight className="col-start-3 row-span-2 row-start-1 size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <div>
            <Badge variant="outline">Designed for trust, not hype</Badge>
            <h2 className="mt-5 text-balance text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
              Clear provenance for every public release.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              A Verified Build describes traceability—not a security guarantee. Project pages will
              keep source and build evidence visible.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {trustSignals.map((signal) => (
              <div key={signal.title} className="rounded-2xl border bg-card p-5">
                <signal.icon className="size-5 text-primary" aria-hidden="true" />
                <h3 className="mt-8 font-semibold">{signal.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{signal.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 overflow-hidden rounded-3xl border bg-foreground px-6 py-10 text-background shadow-xl sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-14">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-semibold tracking-[0.16em] text-primary uppercase">
              Built for plugin developers
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
              Preview the publishing workspace.
            </h2>
            <p className="mt-3 text-sm leading-6 text-background/65">
              Authentication and GitHub App connections arrive in the next phases. This preview does
              not create an account or connect a repository.
            </p>
          </div>
          <Link
            href="/dashboard"
            className={buttonVariants({
              size: "lg",
              className: "mt-7 bg-primary text-primary-foreground hover:bg-primary/90 lg:mt-0",
            })}
          >
            Open dashboard preview <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
