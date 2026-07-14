import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Admin preview",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <PageShell
      eyebrow="Admin route group"
      title="Moderation workspace"
      description="Review projects, reports, failed deliveries, suspicious activity, software definitions, and immutable admin history."
      actions={<Badge variant="outline">Backend access required in Phase 2</Badge>}
    >
      <EmptyState
        icon={ShieldCheck}
        title="No simulated moderation controls"
        description="Server-enforced role checks arrive with Convex and Better Auth. Until then, this route contains no actions that pretend to be protected."
      />
    </PageShell>
  );
}
