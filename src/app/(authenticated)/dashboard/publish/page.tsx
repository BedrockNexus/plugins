import {
  CodeIcon,
  FileCode,
  GitPullRequestIcon,
  Package01Icon,
  WorkflowSquare01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";

import { PageShell } from "@/components/page-shell";
import {
  PrototypeBanner,
  PrototypeSection,
  PrototypeStatusList,
  PrototypeTimeline,
} from "@/components/prototype-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { publishingTimeline, prototypeProject } from "@/lib/prototype-data";

export const metadata: Metadata = {
  title: "Publishing flow",
  robots: { index: false, follow: false },
};

export default function PublishPrototypePage() {
  return (
    <PageShell
      eyebrow="Phases 5–6 prototype"
      title="Prepare a GitHub-native release"
      description="Confirm adapter detection and project metadata before opening a pull request for the generated publishing workflow."
      actions={<Badge variant="accent">Step 3 of 5</Badge>}
    >
      <PrototypeBanner>
        Fields are populated with representative repository metadata. Buttons are disabled because
        no workflow or pull request will be created during the prototype milestone.
      </PrototypeBanner>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.72fr_1.28fr]">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Publishing progress</CardTitle>
            <CardDescription>The planned repository-to-release sequence.</CardDescription>
          </CardHeader>
          <CardContent>
            <PrototypeTimeline items={publishingTimeline} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <PrototypeStatusList
            items={[
              {
                icon: Package01Icon,
                label: "Detected adapter",
                value: "PowerNukkitX",
                status: "96% confidence",
              },
              {
                icon: CodeIcon,
                label: "Build system",
                value: "Gradle · ./gradlew clean build",
                status: "Detected",
              },
              {
                icon: FileCode,
                label: "Primary output",
                value: "build/libs/nexus-essentials.jar",
                status: "JAR",
              },
            ]}
          />

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Review project metadata</CardTitle>
              <CardDescription>
                These values will become the initial public project record after validation.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="prototype-name">Project name</Label>
                <Input id="prototype-name" readOnly value={prototypeProject.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prototype-license">License</Label>
                <Input id="prototype-license" readOnly value={prototypeProject.license} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="prototype-summary">Summary</Label>
                <Input id="prototype-summary" readOnly value={prototypeProject.summary} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prototype-software">Software</Label>
                <Input id="prototype-software" readOnly value={prototypeProject.software} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prototype-game">Minecraft compatibility</Label>
                <Input id="prototype-game" readOnly value={prototypeProject.minecraftVersion} />
              </div>
            </CardContent>
          </Card>

          <PrototypeSection title="Workflow pull request">
            <Card className="shadow-none">
              <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <HugeiconsIcon className="size-5" icon={WorkflowSquare01Icon} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">.github/workflows/bedrocknexus-publish.yml</p>
                  <p className="mt-1 text-muted-foreground text-sm">
                    Branch pushes validate; v* tags create GitHub Releases.
                  </p>
                </div>
                <Button className="gap-2" disabled>
                  <HugeiconsIcon className="size-4" icon={GitPullRequestIcon} />
                  Open pull request
                </Button>
              </CardContent>
            </Card>
          </PrototypeSection>
        </div>
      </div>
    </PageShell>
  );
}
