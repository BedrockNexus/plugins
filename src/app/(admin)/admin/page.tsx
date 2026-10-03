import {
  ArrowRight01Icon,
  Package01Icon,
  WebhookIcon,
  WorkflowSquare01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata, Route } from "next";
import Link from "next/link";

import { api } from "@/../convex/_generated/api";
import { PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stat, StatDescription, StatLabel, StatValue } from "@/components/ui/stat";
import { fetchAuthQuery } from "@/lib/auth-server";

const adminAreas = [
  {
    href: "/admin/reviews",
    icon: Package01Icon,
    title: "Publishing reviews",
    description: "Approve, request changes, or reject verified release submissions.",
    action: "Open queue",
  },
  {
    href: "/admin/workflows",
    icon: WorkflowSquare01Icon,
    title: "Workflow templates",
    description: "Maintain validated publishing workflows for every supported build system.",
    action: "Open editor",
  },
  {
    href: "/admin/deliveries",
    icon: WebhookIcon,
    title: "Webhook deliveries",
    description: "Inspect processing state, retries, duplicate deliveries, and failure history.",
    action: "Open deliveries",
  },
] as const;

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const [publishingReviews, deliveries] = await Promise.all([
    fetchAuthQuery(api.functions.projects.publishing.model.listReviewQueue, {}),
    fetchAuthQuery(api.functions.github.webhooks.listRecent, {}),
  ]);
  const failedDeliveries = deliveries.filter((delivery) => delivery.status === "failed").length;

  return (
    <PageShell
      eyebrow="Administration"
      title="Moderation and delivery operations"
      description="Review verified releases, maintain publishing workflows, and inspect GitHub webhook deliveries."
      actions={<Badge variant="accent">Server-authorized admin</Badge>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Stat>
          <StatLabel>Pending review</StatLabel>
          <StatValue>{publishingReviews.length}</StatValue>
          <StatDescription>Verified releases awaiting a decision</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Failed deliveries</StatLabel>
          <StatValue>{failedDeliveries}</StatValue>
          <StatDescription>
            Among the {deliveries.length} most recent webhook deliveries
          </StatDescription>
        </Stat>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {adminAreas.map((area) => (
          <Card className="shadow-none" key={area.href}>
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <HugeiconsIcon className="size-5" icon={area.icon} />
              </div>
              <CardTitle>{area.title}</CardTitle>
              <CardDescription>{area.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Link href={area.href as Route}>
                <Button className="w-full justify-between" variant="outline">
                  {area.action}
                  <HugeiconsIcon className="size-4" icon={ArrowRight01Icon} />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
