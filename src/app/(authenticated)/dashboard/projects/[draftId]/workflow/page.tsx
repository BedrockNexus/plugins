import type { Metadata } from "next";

import type { Id } from "@/../convex/_generated/dataModel";
import { DashboardPageShell } from "@/components/dashboard/dashboard-page-shell";
import {
  ProjectManageNav,
  ProjectWorkflowManager,
} from "@/components/publishing/publishing-wizard";

export const metadata: Metadata = {
  title: "Publishing workflow",
  robots: { index: false, follow: false },
};

export default async function ProjectWorkflowPage({
  params,
}: {
  params: Promise<{ draftId: string }>;
}) {
  const { draftId } = await params;
  return (
    <DashboardPageShell
      eyebrow="Projects"
      title="Publishing workflow"
      description="Install or update the admin-managed GitHub Actions workflow on the repository."
    >
      <ProjectManageNav draftId={draftId} />
      <ProjectWorkflowManager draftId={draftId as Id<"publishingDrafts">} />
    </DashboardPageShell>
  );
}
