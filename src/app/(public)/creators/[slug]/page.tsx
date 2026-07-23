import {
  CheckmarkBadge01Icon,
  FolderLibraryIcon,
  Link02Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Creator preview",
  robots: { index: false, follow: false },
};

export default async function CreatorPlaceholderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <PageShell
      eyebrow="Creator route preview"
      title={`@${slug}`}
      description="Creator profiles will bring together verified GitHub identity, public projects, and external support links."
    >
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <EmptyState
          icon={UserCircleIcon}
          title="Creator data is not connected"
          description="GitHub authentication and profile synchronization are active. Public creator records arrive with the registry data model."
        />
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Creator profile foundation</CardTitle>
            <CardDescription>
              Profiles will only display verified or creator-provided data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: CheckmarkBadge01Icon, text: "Verified GitHub identity" },
              { icon: FolderLibraryIcon, text: "Published public projects" },
              { icon: Link02Icon, text: "Explicit external support links" },
            ].map((item) => (
              <div className="flex items-center gap-3 rounded-lg bg-muted/60 p-3" key={item.text}>
                <HugeiconsIcon icon={item.icon} className="size-4 shrink-0" aria-hidden="true" />
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
