import type { Metadata } from "next";

import type { Id } from "@/../convex/_generated/dataModel";
import { DashboardPageShell } from "@/components/dashboard/dashboard-page-shell";
import {
  ProjectManageNav,
  ProjectMetadataManager,
} from "@/components/publishing/publishing-wizard";

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
  return (
    <DashboardPageShell
      eyebrow="Projects"
      title="Project metadata"
      description="Manage the catalog information for this plugin. Repository setup stays in Add Project."
    >
      <ProjectManageNav draftId={draftId} />
      <ProjectMetadataManager draftId={draftId as Id<"publishingDrafts">} />
    </DashboardPageShell>
  );
}
