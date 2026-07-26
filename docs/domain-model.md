# Core Convex domain model

Phase 3 keeps authentication, organizations, memberships, invitations, and
active-workspace state inside the `@convex-dev/better-auth` component. The
Better Auth user is also the source of truth for application roles. The
application schema stores only product-specific extensions such as creator and
organization profiles.

## Ownership and access

- Projects, publishing drafts, and GitHub App installations use
  `ownerType` plus a Better Auth `ownerId`. `createdBy` or `connectedBy`
  separately preserves the acting Better Auth user for audit history.
- Organization access is resolved directly from Better Auth membership.
  Members can view organization drafts; only owners and organization admins
  can manage them.
- Moderators and admins can inspect every visibility state. Owners cannot read
  a project after moderation changes it to `hidden` or `suspended`.
- Anonymous users can read only `published` projects with `public` or
  `unlisted` visibility.
- Public functions derive the current user from Convex authentication. Client
  input is never used to select the acting user.

## Canonical fields

- Mutable records use numeric `createdAt` and `updatedAt` timestamps.
- Append-only event and junction records use numeric `createdAt`. Webhook
  deliveries use `receivedAt` plus a terminal `completedAt`; individual
  attempts use `startedAt` plus a terminal `completedAt`.
- Creator, project, software, category, and tag slugs are stored in lowercase
  hyphenated form. Better Auth owns organization slugs.
- GitHub numeric identifiers are stored separately from Convex document IDs.
- Project licenses are detected from GitHub repository metadata with adapter
  manifest metadata as a fallback. They are not editable publishing inputs.
- Programming language is not stored on repositories, publishing drafts, or
  projects; adapter and server-software identity provide the publishing context.

## Search and relationships

- Public project search uses `search_search_text` and can filter by visibility,
  publication status, and server software.
- Public directory ordering uses the visibility/status/software and
  visibility/updated-at indexes.
- Categories and tags use junction tables instead of unbounded arrays.
- Support links and moderation reports use discriminated target unions, so a
  record can reference exactly one creator, organization, project, or review as
  applicable. Generic target keys and ambiguous combinations are not stored.
- Versions, builds, releases, and assets remain separate records so workflow
  provenance can be correlated without rewriting project documents.
- Downloads, admin actions, and webhook deliveries are append-oriented
  operational records with time-ordered indexes for later pagination.
- `projectsBySoftware` and `projectsByOwner` aggregate components maintain
  exact project totals without scanning or truncating project tables. Project
  creation, metadata changes, and publication update both aggregates in the
  same transaction as the source project.
- `projectDownloadCounts` and `ownerDownloadCounts` use sharded counters for
  high-write project and owner lifetime download totals. Both counters update
  in the same transaction as each accepted download; the project document
  keeps a debounced materialized value only for indexed popularity ordering.

## Seed catalog

`functions/site/serverSoftware:seedDefaults` is an internal idempotent mutation.
It inserts or updates PocketMine-MP and PowerNukkitX by normalized slug. The public
`seedDefaultsAsAdmin` wrapper uses the shared admin authorization boundary.
