import {
  Building03Icon,
  GitBranchIcon,
  Package01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata, Route } from "next";
import Link from "next/link";

import { PageShell } from "@/components/page-shell";
import {
  MetricCard,
  PrototypeBanner,
  PrototypeSection,
  PrototypeStatusList,
} from "@/components/prototype-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prototypeProject } from "@/lib/prototype-data";

export const metadata: Metadata = {
  title: "Organization preview",
  robots: { index: false, follow: false },
};

export default async function OrganizationPrototypePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const name = slug
    .split("-")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <PageShell
      eyebrow="Phase 7 organization prototype"
      title={name}
      description="A public home for shared project ownership, verified members, repositories, and support links."
      actions={<Badge variant="accent">Organization preview</Badge>}
    >
      <PrototypeBanner>
        This profile illustrates a future Pro organization. Membership and ownership records are not
        connected.
      </PrototypeBanner>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Public projects" value="1" detail="Representative project" />
        <MetricCard label="Members" value="3" detail="Visible maintainers" />
        <MetricCard label="Total downloads" value="12.8K" detail="Across public projects" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
        <PrototypeSection title="Published projects">
          <Card className="shadow-none">
            <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                <HugeiconsIcon className="size-5" icon={Package01Icon} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{prototypeProject.name}</p>
                <p className="mt-1 text-muted-foreground text-sm">{prototypeProject.summary}</p>
              </div>
              <Link href={`/projects/${prototypeProject.slug}` as Route}>
                <Button variant="outline">View project</Button>
              </Link>
            </CardContent>
          </Card>
        </PrototypeSection>

        <PrototypeStatusList
          items={[
            {
              icon: Building03Icon,
              label: "Profile type",
              value: "Plugins Pro organization",
              status: "Preview",
            },
            {
              icon: UserGroupIcon,
              label: "Maintainers",
              value: "3 public members",
              status: "Visible",
            },
            {
              icon: GitBranchIcon,
              label: "Source ownership",
              value: "GitHub organization",
              status: "Planned",
            },
          ]}
        />
      </div>
    </PageShell>
  );
}
