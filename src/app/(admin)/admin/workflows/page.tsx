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
      description="Add and manage the validated GitHub Actions workflows publishers can select."
    >
      <WorkflowTemplateEditor />
    </DashboardPageShell>
  );
}
