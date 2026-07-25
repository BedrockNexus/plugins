import {
  Analytics01Icon,
  ApiIcon,
  Building03Icon,
  PaintBoardIcon,
  Rocket01Icon,
  SentIcon,
} from "@hugeicons/core-free-icons";
import type { Metadata } from "next";

import { PageShell } from "@/components/page-shell";
import { PrototypeBanner, PrototypeFeatureCard, PrototypeSection } from "@/components/prototype-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const proFeatures = [
  {
    icon: Analytics01Icon,
    title: "Advanced analytics",
    description: "Release adoption, attribution, retention, and deeper publishing-funnel analysis.",
  },
  {
    icon: Building03Icon,
    title: "Organizations and teams",
    description: "Shared ownership, member roles, and organization-level project management.",
  },
  {
    icon: PaintBoardIcon,
    title: "Profile customization",
    description:
      "Expanded creator and organization presentation controls without ranking benefits.",
  },
  {
    icon: ApiIcon,
    title: "API access",
    description: "Programmatic access with server-authorized entitlements and documented limits.",
  },
  {
    icon: Rocket01Icon,
    title: "Early access",
    description: "Preview selected product capabilities before their general release.",
  },
  {
    icon: SentIcon,
    title: "Priority support",
    description: "A direct path for product and publishing support without preferential discovery.",
  },
] as const;

export const metadata: Metadata = {
  title: "Plugins Pro",
  robots: { index: false, follow: false },
};

export default function ProPrototypePage() {
  return (
    <PageShell
      eyebrow="Phase 9 prototype"
      title="One optional plan for advanced workflows"
      description="Publishing, public pages, reviews, ratings, support links, and basic totals remain free."
      actions={<Badge variant="accent">Provider not selected</Badge>}
    >
      <PrototypeBanner>
        This is a product-boundary prototype, not a checkout page. Polar must be confirmed before
        billing packages or live purchase actions are added.
      </PrototypeBanner>

      <Card className="overflow-hidden py-0 shadow-none">
        <div className="h-1 bg-primary" />
        <div className="grid grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Badge variant="outline">BedrockNexus Plugins Pro</Badge>
            <h2 className="mt-5 font-bold text-3xl tracking-tight">
              Advanced tools, never paid ranking.
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground leading-7">
              Pro expands team, analytics, profile, API, early-access, and support capabilities.
              Core publishing and community participation stay available to everyone.
            </p>
          </div>
          <Button disabled size="lg">
            Checkout unavailable
          </Button>
        </div>
      </Card>

      <PrototypeSection title="Pro capability boundaries">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {proFeatures.map((feature) => (
            <PrototypeFeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </PrototypeSection>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Always free</CardTitle>
          <CardDescription>
            These product areas are explicitly excluded from the paid entitlement.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {[
            "Publishing",
            "GitHub workflows",
            "Public project pages",
            "Basic totals",
            "Reviews and ratings",
            "Support links",
          ].map((item) => (
            <Badge key={item} variant="outline">
              {item}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </PageShell>
  );
}
