import { GitBranch } from "lucide-react";
import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Developer dashboard preview",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <PageShell
      eyebrow="Authenticated route group"
      title="Developer dashboard"
      description="Manage GitHub connections, publishing progress, builds, releases, projects, and analytics from one workspace."
      actions={<Badge variant="outline">Authentication not connected</Badge>}
    >
      <EmptyState
        icon={GitBranch}
        title="GitHub sign-in arrives in Phase 2"
        description="This is a layout preview only. It does not create a session, install a GitHub App, or expose private repository controls."
      />
    </PageShell>
  );
}
