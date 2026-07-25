import { Analytics01Icon, Download01Icon, ViewIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";

import { PageShell } from "@/components/page-shell";
import { MetricCard, PrototypeBanner, PrototypeSection } from "@/components/prototype-ui";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const weeklyActivity = [38, 52, 45, 72, 64, 88, 76, 104, 96, 128, 116, 142] as const;

export const metadata: Metadata = {
  title: "Project analytics",
  robots: { index: false, follow: false },
};

export default function AnalyticsPrototypePage() {
  return (
    <PageShell
      eyebrow="Phases 8–9 prototype"
      title="Understand project adoption"
      description="Basic totals remain free. Plugins Pro adds deeper release, source, and publishing-funnel analysis."
      actions={<Badge variant="accent">Representative metrics</Badge>}
    >
      <PrototypeBanner>
        These numbers demonstrate hierarchy and reporting states only. No analytics SDK or event
        stream is connected.
      </PrototypeBanner>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Downloads" value="12,842" detail="+18% over the previous period" />
        <MetricCard label="Project views" value="28,491" detail="Public project page views" />
        <MetricCard
          label="Conversion"
          value="45.1%"
          detail="Views that reached download redirect"
        />
        <MetricCard
          label="Release adoption"
          value="71%"
          detail="Latest version share · Pro preview"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <PrototypeSection
          title="Download activity"
          description="A twelve-week representative trend."
        >
          <Card className="shadow-none">
            <CardContent>
              <div className="flex h-64 items-end gap-2 sm:gap-3">
                {weeklyActivity.map((value, index) => (
                  <div className="flex h-full min-w-0 flex-1 items-end" key={value}>
                    <div
                      className="w-full rounded-t-sm bg-primary"
                      style={{ height: `${Math.round((value / 142) * 100)}%` }}
                      title={`Week ${index + 1}: ${value}`}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-between font-mono text-muted-foreground text-xs">
                <span>12 weeks ago</span>
                <span>Current week</span>
              </div>
            </CardContent>
          </Card>
        </PrototypeSection>

        <PrototypeSection title="Top signals">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon className="size-4" icon={Analytics01Icon} />
                Discovery funnel
              </CardTitle>
              <CardDescription>Representative free and Pro boundaries.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                { icon: ViewIcon, label: "Project views", value: "28.5K" },
                { icon: Download01Icon, label: "Redirected downloads", value: "12.8K" },
                { icon: Analytics01Icon, label: "Source attribution", value: "Pro" },
              ].map((item) => (
                <div
                  className="flex items-center gap-3 border-t pt-4 first:border-0 first:pt-0"
                  key={item.label}
                >
                  <HugeiconsIcon className="size-4" icon={item.icon} />
                  <span className="flex-1 text-muted-foreground text-sm">{item.label}</span>
                  <span className="font-medium text-sm">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </PrototypeSection>
      </div>
    </PageShell>
  );
}
