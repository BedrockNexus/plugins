import { UserRound } from "lucide-react";
import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Creator preview",
  robots: { index: false, follow: false },
};

export default async function CreatorPlaceholderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <PageShell
      eyebrow="Creator route preview"
      title={`@${slug}`}
      description="Creator profiles will bring together verified GitHub identity, public projects, and external support links."
    >
      <EmptyState
        icon={UserRound}
        title="Creator data is not connected"
        description="Better Auth and creator-profile synchronization arrive in Phase 2. This page intentionally shows no simulated account data."
      />
    </PageShell>
  );
}
