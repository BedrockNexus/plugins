import {
  Analytics01Icon,
  Building03Icon,
  GitBranchIcon,
  Package01Icon,
  Rocket01Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
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

const workspaceAreas = [
  {
    href: "/dashboard/repositories",
    icon: GitBranchIcon,
    title: "Repositories",
    description: "Install the GitHub App, review granted repositories, and begin detection.",
    action: "Connect repository",
  },
  {
    href: "/dashboard/publish",
    icon: Rocket01Icon,
    title: "Publishing",
    description: "Review detection, metadata, workflow setup, and release readiness.",
    action: "Open publishing flow",
  },
  {
    href: "/dashboard/projects",
    icon: Package01Icon,
    title: "Projects",
    description: "Manage public project metadata, versions, compatibility, and visibility.",
    action: "Manage projects",
  },
  {
    href: "/dashboard/analytics",
    icon: Analytics01Icon,
    title: "Analytics",
    description: "Understand discovery, downloads, publishing health, and release adoption.",
    action: "View analytics",
  },
  {
    href: "/dashboard/organizations",
    icon: Building03Icon,
    title: "Organizations",
    description: "Coordinate project ownership, members, roles, and shared publishing.",
    action: "Preview organizations",
  },
  {
    href: "/dashboard/pro",
    icon: Shield01Icon,
    title: "Plugins Pro",
    description: "Preview advanced analytics, organizations, API access, and profile controls.",
    action: "Preview Pro",
  },
] as const;

export const metadata: Metadata = {
  title: "Developer dashboard",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <PageShell
      eyebrow="Developer workspace"
      title="Build, publish, and understand your plugins."
      description="The workspace brings repository connection, publishing progress, project management, and analytics into one focused workflow."
      actions={<Badge variant="accent">Prototype milestone</Badge>}
    >
      <PrototypeBanner>
        The workspace cards below link to planned product surfaces for Phases 4–9. They use
        representative states and do not perform backend actions.
      </PrototypeBanner>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Connected repos" value="1" detail="Representative granted repository" />
        <MetricCard label="Published projects" value="1" detail="Prototype public project" />
        <MetricCard label="Release health" value="Ready" detail="No live workflow is connected" />
      </div>

      <PrototypeSection
        title="Workspace surfaces"
        description="Explore the product flow before the domain model is finalized."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {workspaceAreas.map((area) => (
            <PrototypeFeatureCard
              description={area.description}
              icon={area.icon}
              key={area.href}
              title={area.title}
              footer={
                <Link href={area.href as Route}>
                  <Button className="w-full justify-between" variant="outline">
                    {area.action}
                    <HugeiconsIcon className="size-4" icon={Rocket01Icon} />
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
