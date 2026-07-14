import { SearchX } from "lucide-react";
import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      <search>
        <form className="mb-8 flex max-w-2xl gap-3">
          <Input
            name="q"
            type="search"
            placeholder="Search the registry"
            aria-label="Search the registry"
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </search>
      <EmptyState
        icon={SearchX}
        title="The registry is ready for data"
        description="Project search and filtering connect to Convex in Phase 7. This public route and its responsive, accessible empty state are available now."
      />
    </PageShell>
  );
}
