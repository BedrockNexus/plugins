import type { Metadata } from "next";

import { DashboardPageShell } from "@/components/dashboard/dashboard-page-shell";
import { ProjectManageNav, ProjectReleaseManager } from "@/components/publishing/publishing-wizard";
import { resolveProjectDraftId } from "@/lib/resolve-project-draft";

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
  const resolvedDraftId = await resolveProjectDraftId(draftId);
  return (
    <DashboardPageShell
      eyebrow="Projects"
      title="Releases and review"
      description="Detect verified GitHub releases, choose one, and submit it for moderator review."
    >
      <ProjectManageNav draftId={draftId} />
      <ProjectReleaseManager draftId={resolvedDraftId} />
    </DashboardPageShell>
  );
}
