import {
  Alert01Icon,
  Clock01Icon,
  Shield01Icon,
  WorkflowSquare01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const moderationAreas = [
  { icon: Shield01Icon, label: "Project review" },
  { icon: Alert01Icon, label: "Reports" },
  { icon: WorkflowSquare01Icon, label: "Failed deliveries" },
  { icon: Clock01Icon, label: "Admin history" },
] as const;

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <PageShell
      eyebrow="Admin route group"
      title="Moderation workspace"
      description="Review projects, reports, failed deliveries, suspicious activity, software definitions, and immutable admin history."
      actions={<Badge variant="outline">Server-authorized admin</Badge>}
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {moderationAreas.map((area) => (
            <Card className="shadow-none" key={area.label}>
              <CardContent className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <HugeiconsIcon icon={area.icon} className="size-4" aria-hidden="true" />
                </span>
                <span className="font-medium text-sm">{area.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
        <EmptyState
          icon={Shield01Icon}
          title="Moderation queues arrive in Phase 8"
          description="This page is already protected by a Convex admin-role query. Later phases will add the moderation records and actions."
        />
      </div>
    </PageShell>
  );
}
