import {
  CheckmarkCircle02Icon,
  FileCode,
  GitBranchIcon,
  Package01Icon,
  WorkflowSquare01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { softwareCatalog } from "@/lib/site";

type SoftwarePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return softwareCatalog.map((software) => ({ slug: software.slug }));
}

export async function generateMetadata({ params }: SoftwarePageProps): Promise<Metadata> {
  const { slug } = await params;
  const software = softwareCatalog.find((item) => item.slug === slug);

  return software
    ? {
        title: software.name,
        description: `Discover projects for ${software.name} on BedrockNexus Plugins.`,
        alternates: { canonical: `/software/${software.slug}` },
      }
    : { title: "Software not found" };
}

export default async function SoftwareDetailPage({ params }: SoftwarePageProps) {
  const { slug } = await params;
  const software = softwareCatalog.find((item) => item.slug === slug);

  if (!software) notFound();

  return (
    <PageShell
      eyebrow="Server software"
      title={software.name}
      description={`Adapter foundation for ${software.language} projects distributed as ${software.format} release assets.`}
      actions={<Badge variant="accent">{software.status}</Badge>}
    >
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <EmptyState
          icon={Package01Icon}
          title={`No ${software.name} projects yet`}
          description="Public projects appear here after the publishing, moderation, and registry phases are connected."
        />
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Adapter contract</CardTitle>
            <CardDescription>
              What the initial integration is designed to recognize.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { icon: FileCode, label: "Release format", value: software.format },
              { icon: WorkflowSquare01Icon, label: "Project language", value: software.language },
              { icon: GitBranchIcon, label: "Source model", value: "Public GitHub repository" },
              { icon: CheckmarkCircle02Icon, label: "Adapter status", value: software.status },
            ].map((item) => (
              <div
                className="flex items-center gap-3 border-t pt-4 first:border-t-0 first:pt-0"
                key={item.label}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
                  <HugeiconsIcon icon={item.icon} className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs">{item.label}</p>
                  <p className="truncate font-medium text-sm">{item.value}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
