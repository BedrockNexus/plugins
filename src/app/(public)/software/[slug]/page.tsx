import { Boxes } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
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
      <EmptyState
        icon={Boxes}
        title={`No ${software.name} projects yet`}
        description="Public projects appear here after the publishing, moderation, and registry phases are connected."
      />
    </PageShell>
  );
}
