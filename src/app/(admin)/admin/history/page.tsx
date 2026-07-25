import { Clock01Icon, EyeIcon, Package01Icon, UserShield01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";

import { PageShell } from "@/components/page-shell";
import { PrototypeBanner, PrototypeTimeline } from "@/components/prototype-ui";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Administration history",
  robots: { index: false, follow: false },
};

export default function AdminHistoryPrototypePage() {
  return (
    <PageShell
      eyebrow="Phase 8 audit prototype"
      title="Immutable administration history"
      description="Every moderation action records the actor, target, reason, prior state, resulting state, and timestamp."
      actions={<Badge variant="accent">Append-only design</Badge>}
    >
      <PrototypeBanner />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_22rem]">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Recent actions</CardTitle>
            <CardDescription>Representative server-authorized audit events.</CardDescription>
          </CardHeader>
          <CardContent>
            <PrototypeTimeline
              items={[
                {
                  title: "Project approved for publication",
                  description:
                    "Jean approved Nexus Essentials after repository and release review.",
                  status: "complete",
                },
                {
                  title: "Community report acknowledged",
                  description: "A compatibility report was assigned for moderator investigation.",
                  status: "complete",
                },
                {
                  title: "Visibility decision pending",
                  description: "The project remains public while the report is investigated.",
                  status: "current",
                },
              ]}
            />
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Required audit fields</CardTitle>
            <CardDescription>Records are append-only and cannot be rewritten.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: UserShield01Icon, label: "Authorized actor and role" },
              { icon: Package01Icon, label: "Target type and identifier" },
              { icon: EyeIcon, label: "Prior and resulting state" },
              { icon: Clock01Icon, label: "Canonical server timestamp" },
            ].map((field) => (
              <div className="flex items-center gap-3 rounded-lg bg-muted/60 p-3" key={field.label}>
                <HugeiconsIcon className="size-4" icon={field.icon} />
                <span className="text-sm">{field.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
