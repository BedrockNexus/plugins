import {
  CheckmarkBadge01Icon,
  Download01Icon,
  GitBranchIcon,
  GithubIcon,
  Package01Icon,
  StarIcon,
  WorkflowSquare01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata, Route } from "next";
import Link from "next/link";

import { PageShell } from "@/components/page-shell";
import {
  MetricCard,
  PrototypeBanner,
  PrototypeSection,
  PrototypeStatusList,
} from "@/components/prototype-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prototypeProject, prototypeVersions } from "@/lib/prototype-data";

export const metadata: Metadata = {
  title: "Project preview",
  robots: { index: false, follow: false },
};

export default async function ProjectPrototypePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const isRepresentativeProject = slug === prototypeProject.slug;
  const title = isRepresentativeProject
    ? prototypeProject.name
    : slug
        .split("-")
        .filter(Boolean)
        .map((word) => word[0]?.toUpperCase() + word.slice(1))
        .join(" ");

  return (
    <PageShell
      eyebrow="Phase 7 public project prototype"
      title={title}
      description={
        isRepresentativeProject
          ? prototypeProject.summary
          : "A representative public project layout for metadata, releases, compatibility, provenance, reviews, and support links."
      }
      actions={
        <div className="flex flex-wrap gap-2">
          <Badge variant="accent">Verified build</Badge>
          <Badge variant="outline">Public prototype</Badge>
        </div>
      }
    >
      <PrototypeBanner>
        This page uses representative project and release records. Download actions remain disabled
        until trusted Convex records can resolve a validated GitHub Release asset.
      </PrototypeBanner>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard
              label="Downloads"
              value={prototypeProject.downloads}
              detail="Redirect totals"
            />
            <MetricCard
              label="Rating"
              value={prototypeProject.rating}
              detail="Representative reviews"
            />
            <MetricCard
              label="Latest version"
              value={prototypeProject.version}
              detail="Jul 18, 2026"
            />
          </div>

          <PrototypeSection title="About this project">
            <Card className="shadow-none">
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <h3>Focused essentials for community servers</h3>
                <p className="text-muted-foreground leading-7">
                  Nexus Essentials demonstrates how a sanitized repository README could introduce a
                  project, explain configuration, and link users back to its public source.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {["Moderation", "Utilities", "Administration"].map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </PrototypeSection>

          <PrototypeSection
            title="Version history"
            description="Release assets remain hosted by GitHub."
          >
            <Card className="shadow-none">
              <CardContent className="divide-y">
                {prototypeVersions.map((version) => (
                  <div
                    className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                    key={version.version}
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                      <HugeiconsIcon className="size-4" icon={Package01Icon} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">v{version.version}</p>
                        <Badge variant={version.status === "Verified build" ? "accent" : "outline"}>
                          {version.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-muted-foreground text-sm">
                        {version.compatibility} · {version.published}
                      </p>
                    </div>
                    <Button disabled variant="outline">
                      <HugeiconsIcon className="size-4" icon={Download01Icon} />
                      Download preview
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </PrototypeSection>
        </div>

        <aside className="space-y-6">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Latest release</CardTitle>
              <CardDescription>{prototypeProject.software} plugin</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full gap-2" disabled size="lg">
                <HugeiconsIcon className="size-4" icon={Download01Icon} />
                Download v{prototypeProject.version}
              </Button>
              <p className="mt-3 text-center text-muted-foreground text-xs">
                Redirects to a validated GitHub Release asset
              </p>
            </CardContent>
          </Card>

          <PrototypeStatusList
            items={[
              {
                icon: CheckmarkBadge01Icon,
                label: "Build provenance",
                value: "Strict correlation complete",
                status: "Verified",
              },
              {
                icon: GitBranchIcon,
                label: "Source",
                value: prototypeProject.repository,
                status: "Public",
              },
              {
                icon: WorkflowSquare01Icon,
                label: "Workflow",
                value: "bedrocknexus-publish.yml",
                status: "Passed",
              },
            ]}
          />

          <Card className="shadow-none">
            <CardContent className="space-y-3">
              <Link href={`/creators/${prototypeProject.creator}` as Route}>
                <Button className="w-full justify-start gap-2" variant="outline">
                  <HugeiconsIcon className="size-4" icon={StarIcon} />@{prototypeProject.creator}
                </Button>
              </Link>
              <Button className="w-full justify-start gap-2" disabled variant="outline">
                <HugeiconsIcon className="size-4" icon={GithubIcon} />
                Source repository
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </PageShell>
  );
}
