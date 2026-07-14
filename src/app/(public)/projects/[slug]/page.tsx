import { PackageOpen } from "lucide-react";
import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Project preview",
  robots: { index: false, follow: false },
};

export default async function ProjectPlaceholderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <PageShell
      eyebrow="Project route preview"
      title={slug.replaceAll("-", " ")}
      description="This route is reserved for verified project metadata, releases, compatibility, provenance, reviews, and support links."
    >
      <EmptyState
        icon={PackageOpen}
        title="Project data is not connected"
        description="No download or release action is shown until a trusted Convex record and validated GitHub Release asset exist."
      />
    </PageShell>
  );
}
