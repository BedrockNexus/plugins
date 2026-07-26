import {
  Alert01Icon,
  Clock01Icon,
  Package01Icon,
  Shield01Icon,
  WebhookIcon,
  WorkflowSquare01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata, Route } from "next";
import Link from "next/link";

import { api } from "@/../convex/_generated/api";
import { PageShell } from "@/components/page-shell";
import {
  MetricCard,
  PrototypeBanner,
  PrototypeFeatureCard,
  PrototypeSection,
} from "@/components/prototype-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchAuthQuery } from "@/lib/auth-server";

const adminAreas = [
  {
    href: "/admin/workflows",
    icon: WorkflowSquare01Icon,
    title: "Workflow templates",
    description: "Maintain validated publishing workflows for every supported build system.",
  },
  {
    href: "/admin/reviews",
    icon: Package01Icon,
    title: "Publishing reviews",
    description: "Approve, request changes, or reject verified release submissions.",
  },
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

export default async function AdminPage() {
  const publishingReviews = await fetchAuthQuery(
    api.functions.projects.publishing.model.listReviewQueue,
    {},
  );
  return (
    <PageShell
      eyebrow="Phase 8 operations prototype"
      title="Moderation and delivery operations"
      description="Review projects, reports, suspicious activity, failed deliveries, and immutable administrative history."
      actions={<Badge variant="accent">Server-authorized admin</Badge>}
    >
      <PrototypeBanner>
        Publishing reviews are live. Report and operational summary values remain representative
        while the remaining Phase 8 functions are built.
      </PrototypeBanner>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Pending review"
          value={publishingReviews.length.toString()}
          detail="Verified releases awaiting a decision"
        />
        <MetricCard label="Open reports" value="2" detail="One high priority" />
        <MetricCard label="Failed deliveries" value="3" detail="Retry state preview" />
      </div>

      <PrototypeSection title="Operational surfaces">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {adminAreas.map((area) => (
            <PrototypeFeatureCard
              description={area.description}
              icon={area.icon}
              key={area.href}
              title={area.title}
              footer={
                <Link href={area.href as Route}>
                  <Button className="w-full justify-between" variant="outline">
                    {area.href === "/admin/reviews"
                      ? "Open queue"
                      : area.href === "/admin/workflows"
                        ? "Open editor"
                        : "Open prototype"}
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
