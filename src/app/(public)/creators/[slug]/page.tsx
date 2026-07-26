import { FolderLibraryIcon, Link02Icon, UserCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/page-shell";
import { ProjectCard } from "@/components/registry/project-card";
import { RegistrySection } from "@/components/registry/registry-section";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { safeExternalUrl } from "@/lib/safe-external-url";
import { api } from "../../../../../convex/_generated/api";

type CreatorPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: CreatorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchQuery(api.functions.site.catalog.getCreator, { slug });
  return result
    ? {
        title: result.creator.displayName,
        description: result.creator.bio ?? `Projects published by ${result.creator.displayName}.`,
        alternates: { canonical: `/creators/${result.creator.slug}` },
      }
    : { title: "Creator not found" };
}

export default async function CreatorPage({ params }: CreatorPageProps) {
  const { slug } = await params;
  const result = await fetchQuery(api.functions.site.catalog.getCreator, { slug });
  if (!result) notFound();
  const website = safeExternalUrl(result.creator.websiteUrl);

  return (
    <PageShell
      eyebrow="Creator"
      title={result.creator.displayName}
      description={result.creator.bio ?? "A verified BedrockNexus Plugins creator."}
      actions={
        website ? (
          <a
            className={buttonVariants({ variant: "outline" })}
            href={website}
            rel="noreferrer"
            target="_blank"
          >
            <HugeiconsIcon className="size-4" icon={Link02Icon} />
            Website
          </a>
        ) : undefined
      }
    >
      <RegistrySection
        title="Published projects"
        description={`${result.projects.length} public ${
          result.projects.length === 1 ? "project" : "projects"
        }`}
      >
        {result.projects.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {result.projects.map((project) => (
              <ProjectCard key={project.projectId} project={project} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FolderLibraryIcon}
            title="No published projects"
            description="Public releases attributed to this creator will appear here."
          />
        )}
      </RegistrySection>

      {result.supportLinks.length > 0 && (
        <RegistrySection title="Support this creator">
          <Card className="shadow-none">
            <CardContent className="flex flex-wrap gap-3">
              {result.supportLinks.map((link) => {
                const url = safeExternalUrl(link.url);
                return url ? (
                  <a
                    className={buttonVariants({ variant: "outline" })}
                    href={url}
                    key={`${link.type}-${link.label}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <HugeiconsIcon className="size-4" icon={UserCircleIcon} />
                    {link.label}
                  </a>
                ) : null;
              })}
            </CardContent>
          </Card>
        </RegistrySection>
      )}
    </PageShell>
  );
}
