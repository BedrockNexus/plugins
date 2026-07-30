import {
  CheckmarkBadge01Icon,
  Download01Icon,
  GitBranchIcon,
  GithubIcon,
  Package01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { fetchQuery } from "convex/nextjs";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { RegistryMetric, RegistrySection } from "@/components/registry/registry-section";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBytes, formatCompactNumber, formatRegistryDate } from "@/lib/format-registry";
import { registryTextParagraphs } from "@/lib/registry-content";
import { api } from "../../../../../convex/_generated/api";

type ProjectPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchQuery(api.functions.site.catalog.getProject, { slug });
  return result
    ? {
        title: result.project.name,
        description: result.project.summary,
        alternates: { canonical: `/projects/${result.project.slug}` },
      }
    : { title: "Project not found" };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const result = await fetchQuery(api.functions.site.catalog.getProject, { slug });
  if (!result) notFound();

  const { project, repository, versions } = result;
  const description = registryTextParagraphs(result.description);
  const downloadable = versions.find(
    (version) => version.release?.verifiedBuild && version.release.asset,
  );
  const repositoryUrl = `https://github.com/${repository.fullName
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
  const owner = project.organization ?? project.creator;

  return (
    <PageShell
      eyebrow={`${project.software.name} project`}
      title={project.name}
      description={project.summary}
      actions={
        <div className="flex flex-wrap gap-2">
          {project.latestVersion?.verifiedBuild && (
            <Badge variant="accent">
              <HugeiconsIcon className="size-3.5" icon={CheckmarkBadge01Icon} />
              Traceable build
            </Badge>
          )}
          <Badge variant="outline">Public source</Badge>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <RegistryMetric
              label="Downloads"
              value={formatCompactNumber(project.downloadCount)}
              detail="Recorded redirects"
            />
            <RegistryMetric
              label="Rating"
              value={project.ratingCount > 0 ? project.ratingAverage.toFixed(1) : "New"}
              detail={`${project.ratingCount} public reviews`}
            />
            <RegistryMetric
              label="Latest version"
              value={project.latestVersion?.version ?? "—"}
              detail={formatRegistryDate(project.latestVersion?.publishedAt)}
            />
          </div>

          <RegistrySection title="About this project">
            <Card className="shadow-none">
              <CardContent className="space-y-4 text-muted-foreground leading-7">
                {description?.length ? (
                  description.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
                ) : (
                  <p>{project.summary}</p>
                )}
              </CardContent>
            </Card>
          </RegistrySection>

          <RegistrySection
            title="Version history"
            description="Artifacts stay on GitHub; BedrockNexus records and redirects trusted release assets."
          >
            {versions.length > 0 ? (
              <Card className="shadow-none">
                <CardContent className="divide-y">
                  {versions.map((version) => {
                    const changelog = registryTextParagraphs(version.changelog);
                    const canDownload =
                      version.release?.verifiedBuild === true && version.release.asset !== null;
                    return (
                      <article
                        className="py-5 first:pt-0 last:pb-0"
                        key={version.normalizedVersion}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                            <HugeiconsIcon className="size-4" icon={Package01Icon} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold">v{version.version}</h3>
                              <Badge variant={canDownload ? "accent" : "outline"}>
                                {canDownload ? "Traceable build" : "Release metadata"}
                              </Badge>
                            </div>
                            <p className="mt-1 text-muted-foreground text-sm">
                              {version.minecraftVersion
                                ? `Minecraft ${version.minecraftVersion} · `
                                : ""}
                              {formatRegistryDate(version.publishedAt)}
                              {version.release?.asset
                                ? ` · ${formatBytes(version.release.asset.size)}`
                                : ""}
                            </p>
                          </div>
                          {canDownload && (
                            <Link
                              className={buttonVariants({ variant: "outline" })}
                              href={
                                `/download/${project.slug}/${version.normalizedVersion}` as Route
                              }
                              rel="nofollow"
                            >
                              <HugeiconsIcon className="size-4" icon={Download01Icon} />
                              Download
                            </Link>
                          )}
                        </div>
                        {changelog?.length ? (
                          <details className="mt-4 rounded-lg border p-4 text-sm">
                            <summary className="cursor-pointer font-medium">Changelog</summary>
                            <div className="mt-3 space-y-3 text-muted-foreground leading-6">
                              {changelog.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                              ))}
                            </div>
                          </details>
                        ) : null}
                      </article>
                    );
                  })}
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-none">
                <CardContent className="text-muted-foreground text-sm">
                  No public versions are available.
                </CardContent>
              </Card>
            )}
          </RegistrySection>
        </div>

        <aside className="space-y-6">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Latest download</CardTitle>
              <CardDescription>{project.software.name} plugin</CardDescription>
            </CardHeader>
            <CardContent>
              {downloadable ? (
                <Link
                  className={buttonVariants({ className: "w-full", size: "lg" })}
                  href={`/download/${project.slug}/${downloadable.normalizedVersion}` as Route}
                  rel="nofollow"
                >
                  <HugeiconsIcon className="size-4" icon={Download01Icon} />
                  Download v{downloadable.version}
                </Link>
              ) : (
                <p className="rounded-lg border p-4 text-muted-foreground text-sm">
                  No verified release asset is available.
                </p>
              )}
              <p className="mt-3 text-center text-muted-foreground text-xs">
                Redirects to the validated GitHub asset
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <HugeiconsIcon className="mt-0.5 size-4 shrink-0" icon={GitBranchIcon} />
                <div>
                  <p className="font-medium text-sm">Build provenance</p>
                  <p className="mt-1 text-muted-foreground text-xs leading-5">
                    A traceable build links the release tag, commit, workflow run, and selected
                    artifact. It is not a security review.
                  </p>
                </div>
              </div>
              {downloadable?.release?.build && (
                <dl className="grid gap-2 border-t pt-4 text-xs">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Workflow run</dt>
                    <dd>#{downloadable.release.build.workflowRunId}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Commit</dt>
                    <dd className="font-mono">{downloadable.release.commitSha.slice(0, 12)}</dd>
                  </div>
                </dl>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardContent className="space-y-3">
              {owner && (
                <Link
                  className={buttonVariants({
                    className: "w-full justify-start",
                    variant: "outline",
                  })}
                  href={
                    project.organization
                      ? (`/organizations/${project.organization.slug}` as Route)
                      : (`/creators/${project.creator?.slug}` as Route)
                  }
                >
                  <HugeiconsIcon className="size-4" icon={StarIcon} />
                  {project.organization?.name ??
                    (project.creator ? `@${project.creator.username}` : null)}
                </Link>
              )}
              <a
                className={buttonVariants({
                  className: "w-full justify-start",
                  variant: "outline",
                })}
                href={repositoryUrl}
                rel="noreferrer"
                target="_blank"
              >
                <HugeiconsIcon className="size-4" icon={GithubIcon} />
                {repository.fullName}
              </a>
            </CardContent>
          </Card>
        </aside>
      </div>
    </PageShell>
  );
}
