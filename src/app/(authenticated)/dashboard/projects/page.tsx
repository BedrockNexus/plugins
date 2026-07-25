import {
  CheckmarkCircle02Icon,
  GitBranchIcon,
  Package01Icon,
  Settings01Icon,
  ViewIcon,
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
  title: "Project management",
  robots: { index: false, follow: false },
};

export default function ProjectsPrototypePage() {
  return (
    <PageShell
      eyebrow="Phases 6–7 prototype"
      title="Manage published projects"
      description="Review release readiness, compatibility, visibility, and public presentation from a single project workspace."
      actions={<Badge variant="accent">1 representative project</Badge>}
    >
      <PrototypeBanner />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Projects" value="1" detail="Representative published project" />
        <MetricCard
          label="Latest version"
          value={prototypeProject.version}
          detail="Verified build"
        />
        <MetricCard label="Visibility" value="Public" detail="Moderation ready" />
      </div>

      <PrototypeSection
        title="Your projects"
        description="Project records remain connected to their source repositories."
      >
        <Card className="shadow-none">
          <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_0.85fr]">
            <div className="flex gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                <HugeiconsIcon className="size-6" icon={Package01Icon} />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-lg">{prototypeProject.name}</h2>
                  <Badge variant="accent">Public</Badge>
                </div>
                <p className="mt-1 text-muted-foreground text-sm leading-6">
                  {prototypeProject.summary}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={`/projects/${prototypeProject.slug}` as Route}>
                    <Button className="gap-2" variant="outline">
                      <HugeiconsIcon className="size-4" icon={ViewIcon} />
                      Public preview
                    </Button>
                  </Link>
                  <Button className="gap-2" disabled variant="outline">
                    <HugeiconsIcon className="size-4" icon={Settings01Icon} />
                    Edit project
                  </Button>
                </div>
              </div>
            </div>

            <PrototypeStatusList
              className="ring-0"
              items={[
                {
                  icon: GitBranchIcon,
                  label: "Repository",
                  value: prototypeProject.repository,
                  status: "Connected",
                },
                {
                  icon: CheckmarkCircle02Icon,
                  label: "Latest release",
                  value: `v${prototypeProject.version}`,
                  status: "Verified",
                },
              ]}
            />
          </CardContent>
        </Card>
      </PrototypeSection>
    </PageShell>
  );
}
