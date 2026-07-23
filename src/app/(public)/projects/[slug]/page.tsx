import {
  CheckmarkBadge01Icon,
  Clock01Icon,
  PackageOpenIcon,
  PuzzleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Project preview",
  robots: { index: false, follow: false },
};

export default async function ProjectPlaceholderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <PageShell
      eyebrow="Project route preview"
      title={slug.replaceAll("-", " ")}
      description="This route is reserved for verified project metadata, releases, compatibility, provenance, reviews, and support links."
    >
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <EmptyState
          icon={PackageOpenIcon}
          title="Project data is not connected"
          description="No download or release action is shown until a trusted Convex record and validated GitHub Release asset exist."
        />
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Planned project page</CardTitle>
            <CardDescription>
              Real project records will bring these signals together.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: PuzzleIcon, text: "Software and version compatibility" },
              { icon: Clock01Icon, text: "Release history and changelogs" },
              { icon: CheckmarkBadge01Icon, text: "Repository and build provenance" },
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
