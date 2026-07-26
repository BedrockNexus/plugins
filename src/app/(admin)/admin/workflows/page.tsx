import type { Metadata } from "next";

import { DashboardPageShell } from "@/components/dashboard/dashboard-page-shell";
import { WorkflowTemplateEditor } from "@/components/publishing/workflow-template-editor";

export const metadata: Metadata = {
  title: "Workflow templates",
  robots: { index: false, follow: false },
};

export default function WorkflowTemplatesPage() {
  return (
    <DashboardPageShell
      eyebrow="Publishing infrastructure"
      title="Workflow templates"
      description="Edit the validated GitHub Actions files installed into plugin repositories."
    >
      <WorkflowTemplateEditor />
    </DashboardPageShell>
  );
}
