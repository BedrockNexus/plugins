import {
  CheckmarkBadge01Icon,
  Download01Icon,
  Package01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Route } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompactNumber } from "@/lib/format-registry";

export type PublicProjectCard = {
  slug: string;
  name: string;
  summary: string;
  downloadCount: number;
  ratingAverage: number;
  ratingCount: number;
  software: { slug: string; name: string };
  latestVersion: {
    version: string;
    verifiedBuild: boolean;
    publishedAt?: number;
  } | null;
  creator: {
    slug: string;
    username: string;
    githubUsername?: string;
    displayName: string;
    avatarUrl?: string;
  } | null;
  organization: { slug: string; name: string; avatarUrl?: string } | null;
};

export function ProjectCard({ project }: { project: PublicProjectCard }) {
  const owner =
    project.organization?.name ??
    (project.creator ? `@${project.creator.username}` : "Independent creator");
  return (
    <Link className="group rounded-xl" href={`/projects/${project.slug}` as Route}>
      <Card className="h-full transition-[transform,border-color] group-hover:-translate-y-1 group-hover:border-primary">
        <CardHeader>
          <div className="mb-4 flex items-start justify-between gap-3">
            <span className="grid size-12 place-items-center rounded-lg bg-primary text-primary-foreground">
              <HugeiconsIcon className="size-5" icon={Package01Icon} />
            </span>
            <div className="flex flex-wrap justify-end gap-2">
              <Badge variant="outline">{project.software.name}</Badge>
              {project.latestVersion?.verifiedBuild && (
                <Badge variant="accent">
                  <HugeiconsIcon className="size-3.5" icon={CheckmarkBadge01Icon} />
                  Traceable build
                </Badge>
              )}
            </div>
          </div>
          <CardTitle>{project.name}</CardTitle>
          <CardDescription className="line-clamp-2 leading-6">{project.summary}</CardDescription>
        </CardHeader>
        <CardContent className="mt-auto flex items-center justify-between gap-3 border-t pt-5 text-muted-foreground text-xs">
          <span className="truncate">{owner}</span>
          <span className="flex shrink-0 items-center gap-3">
            <span className="flex items-center gap-1">
              <HugeiconsIcon className="size-3.5" icon={Download01Icon} />
              {formatCompactNumber(project.downloadCount)}
            </span>
            <span className="flex items-center gap-1">
              <HugeiconsIcon className="size-3.5" icon={StarIcon} />
              {project.ratingCount > 0 ? project.ratingAverage.toFixed(1) : "New"}
            </span>
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
