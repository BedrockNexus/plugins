import type { Metadata } from "next";

import { DashboardPageShell } from "@/components/dashboard/dashboard-page-shell";
import {
  ProjectManageNav,
  ProjectMetadataManager,
} from "@/components/publishing/publishing-wizard";
import { resolveProjectDraftId } from "@/lib/resolve-project-draft";

export const metadata: Metadata = {
  title: "Manage project",
  robots: { index: false, follow: false },
};

export default async function ManageProjectPage({
  params,
}: {
  params: Promise<{ draftId: string }>;
}) {
  const { draftId } = await params;
  const resolvedDraftId = await resolveProjectDraftId(draftId);
  return (
    <DashboardPageShell
      eyebrow="Projects"
      title="Project metadata"
      description="Manage the catalog information for this plugin. Repository setup stays in Add Project."
    >
      <ProjectManageNav draftId={draftId} />
      <ProjectMetadataManager draftId={resolvedDraftId} />
    </DashboardPageShell>
  );
}
