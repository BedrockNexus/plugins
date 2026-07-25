import {
  Alert01Icon,
  CheckmarkCircle02Icon,
  Flag01Icon,
  Package01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";

import { PageShell } from "@/components/page-shell";
import { PrototypeBanner, PrototypeSection } from "@/components/prototype-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const queueItems = [
  {
    icon: Package01Icon,
    title: "Nexus Essentials",
    description: "Initial publication review · PowerNukkitX",
    priority: "Normal",
    action: "Review project",
  },
  {
    icon: Flag01Icon,
    title: "Misleading compatibility claim",
    description: "Reported on a public project · 2 corroborating reports",
    priority: "High",
    action: "Review report",
  },
  {
    icon: Alert01Icon,
    title: "Suspicious redirect volume",
    description: "Download protection signal · 4 related events",
    priority: "Investigate",
    action: "Inspect activity",
  },
] as const;

export const metadata: Metadata = {
  title: "Reports and review",
  robots: { index: false, follow: false },
};

export default function ReportsPrototypePage() {
  return (
    <PageShell
      eyebrow="Moderation prototype"
      title="Reports and review queue"
      description="Prioritize pending publication, community reports, and suspicious activity without conflating Verified Build with a safety review."
      actions={<Badge variant="accent">3 representative items</Badge>}
    >
      <PrototypeBanner />

      <PrototypeSection title="Active queue">
        <Card className="shadow-none">
          <CardContent className="divide-y">
            {queueItems.map((item) => (
              <div
                className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                key={item.title}
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <HugeiconsIcon className="size-5" icon={item.icon} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{item.title}</p>
                    <Badge variant={item.priority === "High" ? "destructive" : "outline"}>
                      {item.priority}
                    </Badge>
                  </div>
                  <p className="mt-1 text-muted-foreground text-sm">{item.description}</p>
                </div>
                <Button disabled variant="outline">
                  {item.action}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </PrototypeSection>

      <div className="flex items-center gap-3 rounded-xl border border-dashed p-4 text-muted-foreground text-sm">
        <HugeiconsIcon className="size-5" icon={CheckmarkCircle02Icon} />
        Decisions will require a server-authorized action and an immutable audit record.
      </div>
    </PageShell>
  );
}
