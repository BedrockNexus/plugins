import type { Metadata } from "next";

import type { Id } from "@/../convex/_generated/dataModel";
import { DashboardPageShell } from "@/components/dashboard/dashboard-page-shell";
import { ProjectManageNav, ProjectReleaseManager } from "@/components/publishing/publishing-wizard";

export const metadata: Metadata = {
  title: "Project releases",
  robots: { index: false, follow: false },
};

export default async function ProjectReleasesPage({
  params,
}: {
  params: Promise<{ draftId: string }>;
}) {
  const { draftId } = await params;
  return (
    <DashboardPageShell
      eyebrow="Projects"
      title="Releases and review"
      description="Detect verified GitHub releases, choose one, and submit it for moderator review."
    >
      <ProjectManageNav draftId={draftId} />
      <ProjectReleaseManager draftId={draftId as Id<"publishingDrafts">} />
    </DashboardPageShell>
  );
}
