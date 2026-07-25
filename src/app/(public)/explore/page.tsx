import { HugeiconsIcon } from "@hugeicons/react";
import { FilterIcon, Search01Icon, SearchMinusIcon } from "@hugeicons/core-free-icons";
import type { Metadata, Route } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { prototypeProject } from "@/lib/prototype-data";

export const metadata: Metadata = {
  title: "Explore",
  description: "Explore Minecraft Bedrock server plugins across supported software ecosystems.",
  alternates: { canonical: "/explore" },
};

export default function ExplorePage() {
  return (
    <PageShell
      eyebrow="Public registry"
      title="Explore Bedrock projects"
      description="Search and filter plugins, extensions, libraries, and tools across every supported server software."
    >
      <Card className="mb-8 shadow-none">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <search className="min-w-0 flex-1">
            <form className="flex flex-col gap-3 sm:flex-row">
              <label className="relative min-w-0 flex-1" htmlFor="registry-search">
                <HugeiconsIcon
                  icon={Search01Icon}
                  className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="sr-only">Search the registry</span>
                <Input
                  className="pl-9"
                  id="registry-search"
                  name="q"
                  type="search"
                  placeholder="Search plugins, creators, or software"
                />
              </label>
              <Button type="submit">Search registry</Button>
            </form>
          </search>
          <Button className="gap-2" disabled variant="outline">
            <HugeiconsIcon icon={FilterIcon} className="size-4" aria-hidden="true" />
            Filters coming soon
          </Button>
        </CardContent>
      </Card>
      <EmptyState
        icon={SearchMinusIcon}
        title="The registry is ready for data"
        description="Project search and filtering connect to Convex in Phase 7. Until trusted records exist, the registry deliberately avoids showing simulated projects."
        action={
          <Link href={`/projects/${prototypeProject.slug}` as Route}>
            <Button variant="outline">View representative project design</Button>
          </Link>
        }
      />
    </PageShell>
  );
}
