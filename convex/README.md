# BedrockNexus Plugins Convex backend

This directory contains the standalone backend for BedrockNexus Plugins.
Authentication, organizations, GitHub installations and webhooks, project
publishing, moderation, catalog reads, and download counters all live here.

## Structure

- `betterAuth/` — the local Better Auth Convex component and generated schema
- `functions/github/` — GitHub App actions, installations, and webhooks
- `functions/projects/` — project metadata, publishing, and downloads
- `functions/site/` — catalog, account, organization, moderation, and admin APIs
- `schemas/` — the application domain schema
- `lib/` — shared authorization, aggregate, slug, and workflow helpers
- `*.test.ts` — Convex integration and authorization tests

## Development

Run commands from the repository root:

```bash
bunx convex dev
bun run typecheck
bun run test
```

Deployment variables are documented in
[`docs/ENVIRONMENT.md`](../docs/ENVIRONMENT.md). Never commit deployment
secrets or place them in `NEXT_PUBLIC_*` variables.
