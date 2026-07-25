import { Alert01Icon, Clock01Icon, Shield01Icon, WebhookIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata, Route } from "next";
import Link from "next/link";

import { PageShell } from "@/components/page-shell";
import {
  MetricCard,
  PrototypeBanner,
  PrototypeFeatureCard,
  PrototypeSection,
} from "@/components/prototype-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const adminAreas = [
  {
    href: "/admin/reports",
    icon: Alert01Icon,
    title: "Reports and review",
    description: "Triage pending projects, user reports, and visibility decisions.",
  },
  {
    href: "/admin/deliveries",
    icon: WebhookIcon,
    title: "Webhook deliveries",
    description: "Inspect processing state, retries, duplicate deliveries, and failure history.",
  },
  {
    href: "/admin/history",
    icon: Clock01Icon,
    title: "Immutable history",
    description: "Review a permanent record of server-authorized moderation actions.",
  },
] as const;

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <PageShell
      eyebrow="Phase 8 operations prototype"
      title="Moderation and delivery operations"
      description="Review projects, reports, suspicious activity, failed deliveries, and immutable administrative history."
      actions={<Badge variant="accent">Server-authorized admin</Badge>}
    >
      <PrototypeBanner>
        Queues and operational records are representative. This route remains protected by the
        existing backend admin-role query.
      </PrototypeBanner>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Pending review" value="4" detail="Representative queue depth" />
        <MetricCard label="Open reports" value="2" detail="One high priority" />
        <MetricCard label="Failed deliveries" value="3" detail="Retry state preview" />
      </div>

      <PrototypeSection title="Operational surfaces">
        <div className="grid gap-5 md:grid-cols-3">
          {adminAreas.map((area) => (
            <PrototypeFeatureCard
              description={area.description}
              icon={area.icon}
              key={area.href}
              title={area.title}
              footer={
                <Link href={area.href as Route}>
                  <Button className="w-full justify-between" variant="outline">
                    Open prototype
                    <HugeiconsIcon className="size-4" icon={Shield01Icon} />
                  </Button>
                </Link>
              }
            />
          ))}
        </div>
      </PrototypeSection>
    </PageShell>
  );
}
