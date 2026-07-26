import { TableAggregate } from "@convex-dev/aggregate";

import { components } from "../_generated/api";
import type { DataModel, Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type PublishedProjectKey = [Doc<"projects">["visibility"], Doc<"projects">["status"]];

export const projectsBySoftware = new TableAggregate<{
  Namespace: Id<"serverSoftware">;
  Key: PublishedProjectKey;
  DataModel: DataModel;
  TableName: "projects";
}>(components.projectsBySoftware, {
  namespace: (project) => project.softwareId,
  sortKey: (project) => [project.visibility, project.status],
});

export const projectsByOwner = new TableAggregate<{
  Namespace: string;
  Key: null;
  DataModel: DataModel;
  TableName: "projects";
}>(components.projectsByOwner, {
  namespace: (project) => projectOwnerKey(project.ownerType, project.ownerId),
  sortKey: () => null,
});

export function projectOwnerKey(ownerType: Doc<"projects">["ownerType"], ownerId: string): string {
  return `${ownerType}:${ownerId}`;
}

export async function insertProjectAggregates(
  ctx: MutationCtx,
  project: Doc<"projects">,
): Promise<void> {
  await projectsBySoftware.insert(ctx, project);
  await projectsByOwner.insert(ctx, project);
}

export async function replaceProjectAggregates(
  ctx: MutationCtx,
  oldProject: Doc<"projects">,
  newProject: Doc<"projects">,
): Promise<void> {
  await projectsBySoftware.replace(ctx, oldProject, newProject);
  await projectsByOwner.replace(ctx, oldProject, newProject);
}

export async function countPublishedProjectsForSoftware(
  ctx: QueryCtx,
  softwareId: Id<"serverSoftware">,
): Promise<number> {
  return await projectsBySoftware.count(ctx, {
    namespace: softwareId,
    bounds: { prefix: ["public", "published"] },
  });
}

export async function countPublishedProjectsForSoftwareBatch(
  ctx: QueryCtx,
  softwareIds: Array<Id<"serverSoftware">>,
): Promise<number[]> {
  return await projectsBySoftware.countBatch(
    ctx,
    softwareIds.map((softwareId) => ({
      namespace: softwareId,
      bounds: { prefix: ["public", "published"] },
    })),
  );
}

export async function countProjectsForOwner(
  ctx: QueryCtx,
  ownerType: Doc<"projects">["ownerType"],
  ownerId: string,
): Promise<number> {
  return await projectsByOwner.count(ctx, {
    namespace: projectOwnerKey(ownerType, ownerId),
  });
}
