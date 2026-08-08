import { Search01Icon, SearchMinusIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { fetchQuery } from "convex/nextjs";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/page-shell";
import { ProjectCard } from "@/components/registry/project-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "../../../../convex/_generated/api";

export const metadata: Metadata = {
  title: "Explore",
  description: "Explore Minecraft Bedrock server plugins across supported software ecosystems.",
  alternates: { canonical: "/explore" },
};

type ExploreSearchParams = Promise<Record<string, string | string[] | undefined>>;
type RegistrySort = "relevance" | "latest" | "downloads" | "rating";

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ExplorePage({ searchParams }: { searchParams: ExploreSearchParams }) {
  const params = await searchParams;
  const search = first(params.q)?.trim().slice(0, 100) || undefined;
  const requestedSoftware = first(params.software);
  const requestedSort = first(params.sort);
  const cursor = first(params.cursor) || null;
  const software = await fetchQuery(api.functions.site.catalog.listSoftware, {});
  const softwareSlug = software.some((item) => item.slug === requestedSoftware)
    ? requestedSoftware
    : undefined;
  const sort: RegistrySort = search
    ? "relevance"
    : ["latest", "downloads", "rating"].includes(requestedSort ?? "")
      ? (requestedSort as RegistrySort)
      : "latest";

  const queryArgs = {
    paginationOpts: { numItems: 12, cursor },
    search,
    softwareSlug,
    sort,
  };
  const result = await fetchQuery(api.functions.site.catalog.explore, queryArgs).catch(
    (error: unknown) => {
      if (!cursor) {
        throw error;
      }
      return fetchQuery(api.functions.site.catalog.explore, {
        ...queryArgs,
        paginationOpts: { ...queryArgs.paginationOpts, cursor: null },
      });
    },
  );

  const nextParams = new URLSearchParams();
  if (search) nextParams.set("q", search);
  if (softwareSlug) nextParams.set("software", softwareSlug);
  nextParams.set("sort", sort);
  if (!result.isDone) nextParams.set("cursor", result.continueCursor);

  return (
    <PageShell
      eyebrow="Public registry"
      title="Explore Bedrock projects"
      description="Search, filter, and sort published plugins across supported server software."
    >
      <Card className="mb-8 shadow-none">
        <CardContent>
          <search>
            <form className="grid gap-3 lg:grid-cols-[1fr_13rem_11rem_auto]">
              <label className="relative min-w-0" htmlFor="registry-search">
                <HugeiconsIcon
                  icon={Search01Icon}
                  className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="sr-only">Search the registry</span>
                <Input
                  className="pl-9"
                  defaultValue={search}
                  id="registry-search"
                  name="q"
                  type="search"
                  placeholder="Search projects"
                />
              </label>
              <div>
                <Label className="sr-only" htmlFor="registry-software">
                  Server software
                </Label>
                <Select defaultValue={softwareSlug ?? ""} name="software">
                  <SelectTrigger className="h-10 w-full" id="registry-software">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All software</SelectItem>
                    {software.map((item) => (
                      <SelectItem key={item.slug} value={item.slug}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="sr-only" htmlFor="registry-sort">
                  Sort projects
                </Label>
                <Select defaultValue={sort} name="sort">
                  <SelectTrigger className="h-10 w-full" id="registry-sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="downloads">Downloads</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit">Apply</Button>
            </form>
          </search>
        </CardContent>
      </Card>

      {result.page.length > 0 ? (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {result.page.map((project) => (
              <ProjectCard key={project.projectId} project={project} />
            ))}
          </div>
          {!result.isDone && (
            <div className="mt-8 flex justify-center">
              <Link href={`/explore?${nextParams.toString()}` as Route}>
                <Button variant="outline">Next page</Button>
              </Link>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={SearchMinusIcon}
          title="No projects matched"
          description="Try a broader search or a different server software filter. Newly published projects appear here automatically."
          action={
            <Link href="/explore">
              <Button variant="outline">Clear filters</Button>
            </Link>
          }
        />
      )}
    </PageShell>
  );
}
