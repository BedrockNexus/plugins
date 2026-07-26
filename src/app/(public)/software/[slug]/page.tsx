import { LinkSquare01Icon, Package01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/page-shell";
import { ProjectCard } from "@/components/registry/project-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { api } from "../../../../../convex/_generated/api";

type SoftwarePageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: SoftwarePageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchQuery(api.functions.site.catalog.getSoftware, { slug });
  return result
    ? {
        title: result.software.name,
        description: `Discover published ${result.software.name} projects on BedrockNexus Plugins.`,
        alternates: { canonical: `/software/${result.software.slug}` },
      }
    : { title: "Software not found" };
}

export default async function SoftwareDetailPage({ params }: SoftwarePageProps) {
  const { slug } = await params;
  const result = await fetchQuery(api.functions.site.catalog.getSoftware, { slug });
  if (!result) notFound();

  return (
    <PageShell
      eyebrow="Server software"
      title={result.software.name}
      description={result.software.description}
      actions={
        <div className="flex flex-wrap gap-2">
          <Badge variant="accent">{result.software.adapterId} adapter</Badge>
          <a
            className={buttonVariants({ variant: "outline" })}
            href={result.software.websiteUrl}
            rel="noreferrer"
            target="_blank"
          >
            <HugeiconsIcon className="size-4" icon={LinkSquare01Icon} />
            Official website
          </a>
        </div>
      }
    >
      {result.projects.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {result.projects.map((project) => (
            <ProjectCard key={project.projectId} project={project} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Package01Icon}
          title={`No ${result.software.name} projects yet`}
          description="The adapter is live. Verified public projects appear here after their first release is published."
        />
      )}
    </PageShell>
  );
}
