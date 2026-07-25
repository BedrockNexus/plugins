import {
  Building03Icon,
  Crown02Icon,
  Package01Icon,
  UserGroupIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata, Route } from "next";
import Link from "next/link";

import { PageShell } from "@/components/page-shell";
import { PrototypeBanner, PrototypeSection } from "@/components/prototype-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Organizations",
  robots: { index: false, follow: false },
};

export default function OrganizationsPrototypePage() {
  return (
    <PageShell
      eyebrow="Phase 9 prototype"
      title="Publish as a team"
      description="Organizations bring shared project ownership, explicit roles, and coordinated repository access to Plugins Pro."
      actions={<Badge variant="accent">Pro surface</Badge>}
    >
      <PrototypeBanner>
        Organization membership and entitlement checks are not implemented. The prototype defines
        the ownership and role states needed by the future backend.
      </PrototypeBanner>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_0.72fr]">
        <Card className="shadow-none">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <span className="grid size-12 place-items-center rounded-lg bg-primary text-primary-foreground">
                <HugeiconsIcon className="size-5" icon={Building03Icon} />
              </span>
              <Badge variant="outline">3 members</Badge>
            </div>
            <CardTitle className="mt-5">BedrockNexus Labs</CardTitle>
            <CardDescription>
              Shared ownership for maintained Bedrock server tooling and plugins.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link href={"/organizations/bedrocknexus-labs" as Route}>
              <Button variant="outline">Public profile preview</Button>
            </Link>
            <Button disabled>Manage organization</Button>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Role model</CardTitle>
            <CardDescription>Permissions remain explicit and backend-enforced.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { icon: Crown02Icon, name: "Jean", role: "Owner" },
              { icon: UserGroupIcon, name: "Build maintainers", role: "Maintainer" },
              { icon: UserIcon, name: "Release reviewer", role: "Member" },
            ].map((member) => (
              <div
                className="flex items-center gap-3 border-t pt-4 first:border-0 first:pt-0"
                key={member.name}
              >
                <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <HugeiconsIcon className="size-4" icon={member.icon} />
                </span>
                <span className="min-w-0 flex-1 truncate font-medium text-sm">{member.name}</span>
                <Badge variant="outline">{member.role}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <PrototypeSection title="Organization projects">
        <Card className="shadow-none">
          <CardContent className="flex items-center gap-4">
            <span className="grid size-11 place-items-center rounded-lg bg-primary text-primary-foreground">
              <HugeiconsIcon className="size-5" icon={Package01Icon} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">Nexus Essentials</p>
              <p className="text-muted-foreground text-sm">PowerNukkitX · Public · 3 maintainers</p>
            </div>
            <Badge variant="accent">Shared</Badge>
          </CardContent>
        </Card>
      </PrototypeSection>
    </PageShell>
  );
}
