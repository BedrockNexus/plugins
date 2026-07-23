import {
  CheckmarkCircle02Icon,
  GitBranchIcon,
  WorkflowSquare01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const foundationStatus = [
  { icon: GitBranchIcon, label: "GitHub identity", value: "Connected" },
  { icon: CheckmarkCircle02Icon, label: "Profile sync", value: "Active" },
  { icon: WorkflowSquare01Icon, label: "Publishing workflow", value: "Next phase" },
] as const;

export const metadata: Metadata = {
  title: "Developer dashboard",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <PageShell
      eyebrow="Authenticated route group"
      title="Developer dashboard"
      description="Manage GitHub connections, publishing progress, builds, releases, projects, and analytics from one workspace."
      actions={<Badge variant="outline">GitHub account connected</Badge>}
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {foundationStatus.map((item) => (
            <Card className="shadow-none" key={item.label}>
              <CardContent className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <HugeiconsIcon icon={item.icon} className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-muted-foreground text-xs">{item.label}</p>
                  <p className="mt-1 font-medium text-sm">{item.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <EmptyState
          icon={GitBranchIcon}
          title="Your publishing workspace is ready"
          description="Repository connection and publishing arrive in later phases. Authentication and backend profile synchronization are active."
        />
      </div>
    </PageShell>
  );
}
