import { Building03Icon, Link02Icon, Package01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/page-shell";
import { ProjectCard } from "@/components/registry/project-card";
import { RegistryMetric, RegistrySection } from "@/components/registry/registry-section";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCompactNumber } from "@/lib/format-registry";
import { safeExternalUrl } from "@/lib/safe-external-url";
import { api } from "../../../../../convex/_generated/api";

type OrganizationPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: OrganizationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchQuery(api.functions.site.catalog.getOrganization, { slug });
  return result
    ? {
        title: result.organization.name,
        description:
          result.organization.summary ?? `Projects published by ${result.organization.name}.`,
        alternates: { canonical: `/organizations/${result.organization.slug}` },
      }
    : { title: "Organization not found" };
}

export default async function OrganizationPage({ params }: OrganizationPageProps) {
  const { slug } = await params;
  const result = await fetchQuery(api.functions.site.catalog.getOrganization, { slug });
  if (!result) notFound();
  const website = safeExternalUrl(result.organization.websiteUrl);

  return (
    <PageShell
      eyebrow="Organization"
      title={result.organization.name}
      description={result.organization.summary ?? "A BedrockNexus Plugins organization."}
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
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <RegistryMetric
          label="Public projects"
          value={formatCompactNumber(result.projects.length)}
          detail="Published registry entries"
        />
        <RegistryMetric
          label="Total downloads"
          value={formatCompactNumber(result.totalDownloads)}
          detail="Recorded redirects"
        />
      </div>

      <RegistrySection title="Published projects">
        {result.projects.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {result.projects.map((project) => (
              <ProjectCard key={project.projectId} project={project} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Package01Icon}
            title="No published projects"
            description="Public organization-owned releases will appear here."
          />
        )}
      </RegistrySection>

      {result.supportLinks.length > 0 && (
        <RegistrySection title="Support this organization">
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
                    <HugeiconsIcon className="size-4" icon={Building03Icon} />
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
