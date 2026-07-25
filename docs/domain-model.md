# Core Convex domain model

Phase 3 keeps authentication records inside the `@convex-dev/better-auth`
component. The application schema stores only the synchronized `users` record
needed for roles and ownership, plus product-domain data.

## Ownership and access

- A project is owned by one user or one organization. Project creation
  mutations must set exactly one of `ownerUserId` and `ownerOrganizationId`.
- Organization access requires an `active` membership. Members can view
  organization drafts; only owners and organization admins can manage them.
- Moderators and admins can inspect every visibility state. Owners cannot read
  a project after moderation changes it to `hidden` or `suspended`.
- Anonymous users can read only `published` projects with `public` or
  `unlisted` visibility.
- Public functions derive the current user from Convex authentication. Client
  input is never used to select the acting user.

## Canonical fields

- Mutable records use numeric `createdAt` and `updatedAt` timestamps.
- Append-only event and junction records use numeric `createdAt`; webhook
  deliveries also preserve provider `receivedAt` and optional `processedAt`.
- Creator, organization, project, software, category, and tag slugs are stored
  in lowercase hyphenated form. All mutations that create or update these
  records must call `assertNormalizedSlug`.
- GitHub numeric identifiers are stored separately from Convex document IDs.

## Search and relationships

- Public project search uses `search_search_text` and can filter by visibility,
  publication status, and server software.
- Public directory ordering uses the visibility/status/software and
  visibility/updated-at indexes.
- Categories and tags use junction tables instead of unbounded arrays.
- Versions, builds, releases, and assets remain separate records so workflow
  provenance can be correlated without rewriting project documents.
- Downloads, admin actions, and webhook deliveries are append-oriented
  operational records with time-ordered indexes for later pagination.

## Seed catalog

`serverSoftware:seedDefaults` is an internal idempotent mutation. It inserts or
updates PocketMine-MP and PowerNukkitX by normalized slug. The public
`seedDefaultsAsAdmin` wrapper uses the shared admin authorization boundary.
