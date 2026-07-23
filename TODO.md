# BedrockNexus Plugins MVP TODO

This file is the implementation source of truth. Complete work in order, keep
checkboxes synchronized with shipped code, and do not begin later phases while
an earlier phase has unresolved acceptance criteria.

## Production stack decision

- [x] Use a completely standalone repository, deployment, Convex project,
  Better Auth configuration, GitHub App, secrets, and release cycle.
- [x] Use standard Next.js 16 App Router with TypeScript and the Node.js runtime.
  Do not use Vinext, Vite, Wrangler, Cloudflare Workers, D1, R2, or the Sites
  starter in the production repository.
- [x] Use React 19 and Tailwind CSS 4.
- [x] Use shadcn/ui as owned application code, with Base UI or Radix selected
  once during initialization. Do not build a parallel custom component system.
- [x] Use Convex as the sole application data source of truth.
- [x] Use Better Auth with the official Convex Better Auth component and GitHub
  social provider. Keep GitHub sign-in separate from GitHub App installation.
- [x] Install Better Auth UI through its shadcn registry for sign-in, account,
  sessions, security, and linked-account surfaces.
- [x] Use a separate GitHub App with minimum repository permissions and webhook
  subscriptions. Use Octokit for installation tokens and GitHub API calls.
- [x] Use GitHub Actions for builds and GitHub Releases for permanent assets.
  Never execute repository code on the BedrockNexus Plugins server.
- [x] Use OpenPanel for product analytics while Convex remains authoritative for
  downloads, builds, releases, subscriptions, permissions, and moderation.
- [x] Defer billing until the core publishing loop works. Prefer Polar for the
  single Pro subscription because it has official Next.js and Better Auth
  integrations. Do not install billing packages during foundation work.
- [x] Deploy the Next.js application on Vercel for the MVP and Convex separately.
  Point `plugins.bedrocknexus.com` at the Vercel deployment after staging passes.
- [x] Use GitHub-derived project imagery during the MVP. Do not add general file
  uploads or a second blob store while the product forbids manual artifacts.

## Validation policy

Every completed phase must pass the checks relevant to it:

- `bun run format:check`
- `bun run lint`
- `bun run typecheck`
- `bun run test`
- `bun run build`

Adapter and workflow behavior requires unit tests. Authentication, GitHub App,
webhook, publishing, and download flows require integration tests. Do not claim
checks passed unless they actually ran.

## Phase 0 — Preserve the concept and reset cleanly

- [x] Preserve the concept implementation in Git history.
- [x] Rename or recreate the GitHub repository as `bedrocknexus-plugins`.
- [x] Remove the concept application files and the Sites/Vinext deployment
  configuration while retaining this TODO and any approved brand reference.
- [x] Scaffold a fresh standard Next.js application in this repository.
- [x] Use Bun and commit the generated `bun.lock`.
- [x] Confirm scripts use `next dev`, `next build`, and `next start`.
- [x] Add Biome for formatting/linting and explicit `tsc --noEmit` typechecking.
- [x] Add Vitest with a minimal passing test.
- [x] Add `.env.example` containing names only—never real secrets.
- [x] Add CI for format, lint, typecheck, test, and build.

Acceptance:

- No Vinext, Vite, Wrangler, Cloudflare, D1, R2, or `.openai/hosting.json`
  remains in the production app.
- A clean install, test, and `next build` succeed.
- The repository has no copied runtime code from the main BedrockNexus app.

## Phase 1 — UI and application foundation

- [x] Initialize Tailwind CSS 4 and shadcn/ui.
- [x] Add the BedrockNexus Plugins design tokens, typography, dark mode, and
  accessible focus states.
- [x] Create route groups for public, authenticated dashboard, admin, and API
  surfaces.
- [x] Build the shared navigation, footer, page shell, empty states, loading
  states, error boundaries, and responsive layout.
- [x] Rebuild the approved concept home page using shadcn/ui components.
- [x] Add public placeholder routes for Explore, Software, Project, and Creator.
- [x] Add metadata, sitemap, robots, canonical URL, and social card handling.

Acceptance:

- Public routes render without authentication or runtime secrets.
- Dark/light themes, keyboard navigation, mobile layout, and metadata work.
- No demo download or sign-in action pretends to be connected.

## Phase 2 — Convex and Better Auth

- [x] Create a new standalone Convex project for BedrockNexus Plugins.
- [x] Install current mutually compatible versions of `convex`, `better-auth`,
  and `@convex-dev/better-auth` from the official integration guide.
- [x] Register the Better Auth Convex component and auth provider config.
- [x] Create the Convex HTTP auth routes and Next.js auth proxy route.
- [x] Configure a separate GitHub OAuth application for Better Auth sign-in.
  The development app uses the localhost callback, and its credentials are
  stored only in the standalone Convex development environment.
- [x] Add GitHub as the only MVP social provider and request email access.
- [x] Add the Convex Better Auth client provider with authenticated SSR helpers.
- [x] Install Better Auth UI from its shadcn registry.
- [x] Use Better Auth UI for sign-in, account, sessions, security, and linked
  accounts. Do not maintain duplicate custom auth screens.
- [x] Add backend role helpers for developer, verified creator, moderator, admin.
- [x] Add user and creator-profile synchronization without duplicating Better
  Auth-owned session/account tables.
- [x] Protect dashboard and admin data on the backend, not only in navigation.

Acceptance:

- A user can sign in and sign out with GitHub.
- Refreshing a protected route preserves the authenticated session.
- Convex functions can reliably authorize the current user.
- Admin and moderator functions reject insufficient roles server-side.

## Pre-Phase 3 — Shared BedrockNexus visual system

- [x] Reuse the main BedrockNexus logo, favicon, color tokens, radii, and
  JetBrains Mono typography.
- [x] Align public navigation, mobile navigation, footer, cards, empty states,
  page headers, and responsive spacing with the main platform.
- [x] Align authenticated and admin shells with the main platform's dashboard
  styling while keeping the Plugins information architecture.
- [x] Keep Plugins pages and product flows distinct instead of cloning the main
  BedrockNexus page designs.
- [x] Restore the Plugins-specific split hero, release-provenance story,
  publishing workflow, directory layouts, and horizontal workspace navigation
  within the shared visual system.
- [x] Refine light/dark contrast, responsive page composition, route-specific
  empty states, and stale pre-authentication copy.
- [x] Standardize application and shared UI iconography on Hugeicons using the
  official Lucide migration workflow.

Acceptance:

- BedrockNexus and BedrockNexus Plugins clearly belong to one visual system.
- Plugins retains its publishing-specific pages, copy, and navigation.
- Public and authenticated layouts work without horizontal overflow at desktop
  and mobile breakpoints.

## Phase 3 — Core Convex domain model

- [ ] Design tables and indexes for users, creator profiles, organizations,
  organization members, GitHub installations, repositories, server software,
  projects, versions, builds, releases, release assets, downloads, categories,
  tags, reviews, ratings, support links, subscriptions, moderation reports,
  admin actions, and webhook deliveries.
- [ ] Keep Better Auth tables owned by its Convex component.
- [ ] Add canonical timestamps and normalized slugs.
- [ ] Add public-project search and filter indexes.
- [ ] Add backend authorization helpers shared by all domain functions.
- [ ] Seed PocketMine-MP and PowerNukkitX software records idempotently.
- [ ] Add tests for ownership, organization membership, roles, and visibility.

Acceptance:

- Schema deploys cleanly to the standalone Convex development project.
- Every query/mutation uses an index where appropriate.
- Publishing, moderation, and ownership rules cannot be bypassed from clients.

## Phase 4 — GitHub App integration

- [ ] Register the separate `BedrockNexus Plugins` GitHub App.
- [ ] Document and request only the permissions required for metadata, contents,
  pull requests, workflows, actions, releases, and relevant statuses/checks.
- [ ] Subscribe only to installation, installation repositories, repository,
  push, workflow run, and release events.
- [ ] Add Octokit GitHub App authentication and installation-token helpers.
- [ ] Implement the installation setup callback and ownership correlation.
- [ ] List only repositories granted to an installation.
- [ ] Reject private repositories in both UI and backend.
- [ ] Fetch repository metadata and trees with rate-limit-aware error handling.
- [ ] Verify webhook signatures against the raw request body.
- [ ] Atomically claim GitHub delivery IDs before processing.
- [ ] Add safe retries, processing status, error history, and duplicate handling.
- [ ] Add fixture-based webhook integration tests.

Acceptance:

- A signed-in developer can install the GitHub App and see granted public repos.
- Forged, duplicate, unsupported, and retried webhook deliveries are handled
  safely and observably.

## Phase 5 — Adapter system

- [ ] Define the generic adapter interface and domain types.
- [ ] Build an explicit registry with `getAdapterById`, `getEnabledAdapters`, and
  `detectCompatibleAdapters`.
- [ ] Define confidence thresholds and ambiguity behavior.
- [ ] Implement the PMMP adapter in isolated detection, metadata, workflow, and
  validation modules.
- [ ] Implement the PowerNukkitX adapter with isolated Gradle/Maven detection,
  metadata, workflow, and validation modules.
- [ ] Support user-confirmed build command overrides with strict validation.
- [ ] Store workflow templates as testable templates or generators.
- [ ] Generate `.github/workflows/bedrocknexus-publish.yml`.
- [ ] Ensure normal branch pushes validate/build without creating releases.
- [ ] Ensure `v*` tag pushes create GitHub Releases with validated assets.
- [ ] Exclude sources, Javadocs, tests, and unrelated JARs from primary output.
- [ ] Add fixture repositories and snapshot tests for detection and workflows.

Acceptance:

- PMMP and PowerNukkitX fixtures are detected with explainable confidence.
- Unsupported and ambiguous repositories fail gracefully.
- Adding a third adapter does not require changing the generic publishing flow.

## Phase 6 — Publishing workflow

- [ ] Build the install/select/detect/metadata/workflow/track/release wizard.
- [ ] Prefill metadata from GitHub and sanitized README content.
- [ ] Let users correct adapter and project-type detection.
- [ ] Validate project metadata with shared Zod schemas.
- [ ] Create a pull request for the generated workflow; never silently commit it.
- [ ] Track the workflow PR, merge readiness, workflow runs, logs URL, commit,
  tag, and conclusion.
- [ ] Correlate a release, workflow run, tag, commit, and release assets.
- [ ] Implement Verified Build as a strict backend-computed status.
- [ ] Require a verified public repository, installed workflow, valid release
  asset, and moderation readiness before publication.

Acceptance:

- A developer can complete the full repository-to-public-project loop for one
  PMMP fixture and one PowerNukkitX fixture.
- A normal default-branch push never creates a public release.

## Phase 7 — Public registry and downloads

- [ ] Build home, Explore, software directory, software detail, project detail,
  version history, creator, and organization pages from Convex data.
- [ ] Add Convex search, filters, sorting, pagination, and URL-backed filter state.
- [ ] Sanitize README and changelog rendering.
- [ ] Show source repository and build provenance prominently.
- [ ] Implement `/download/[projectSlug]/[version]` as a redirect-only route.
- [ ] Resolve the asset from trusted Convex records; never accept a destination
  URL from request input.
- [ ] Validate the GitHub release asset host, record the download, apply basic
  duplicate/rate protection, emit analytics, and redirect.
- [ ] Clearly define downloads as redirects, not unique installations.

Acceptance:

- Plugin bytes never pass through the application server or Convex.
- Open redirects and arbitrary asset URLs are impossible.
- Public counts come from Convex and are updated consistently.

## Phase 8 — Analytics and moderation

- [ ] Integrate the official OpenPanel Next.js SDK.
- [ ] Define a typed event catalog and shared event-property schemas.
- [ ] Track the publishing funnel, project views, downloads, GitHub connections,
  workflow outcomes, release detection, publication, and support links.
- [ ] Do not duplicate OpenPanel event streams into Convex.
- [ ] Build reports, pending review, hidden/suspended projects, failed builds,
  failed webhook deliveries, suspicious downloads, and moderation history.
- [ ] Add immutable admin-action audit records.
- [ ] Never describe Verified Build as a security or safety review.

Acceptance:

- Funnel events appear in OpenPanel without exposing secrets or private data.
- Moderator/admin actions are enforced server-side and auditable.

## Phase 9 — BedrockNexus Plugins Pro

- [ ] Confirm Polar as the billing provider before installing billing packages.
- [ ] Create exactly one paid product: BedrockNexus Plugins Pro.
- [ ] Integrate checkout, customer portal, subscription webhooks, and backend
  entitlement checks.
- [ ] Store authoritative application entitlement state in Convex.
- [ ] Gate only advanced analytics, profile customization, organizations/teams,
  API access, early access, and priority support.
- [ ] Keep publishing, GitHub workflows, public pages, basic totals, reviews,
  ratings, and support links free.
- [ ] Do not sell ranking or featured placement.

Acceptance:

- Subscription events are verified and idempotent.
- Cancelled/expired subscriptions lose Pro access without losing projects.

## Phase 10 — Production readiness

- [ ] Add security headers, CSP, secret-rotation documentation, and structured
  server logs with sensitive-value redaction.
- [ ] Add rate limits to auth-adjacent, GitHub callback, webhook, report, review,
  and download routes.
- [ ] Add end-to-end tests for authentication, GitHub installation, publishing,
  verified release correlation, download, and moderation.
- [ ] Add dependency and code scanning in CI.
- [ ] Create staging and production Convex deployments and GitHub Apps.
- [ ] Deploy staging on Vercel and run the full acceptance flow.
- [ ] Configure `plugins.bedrocknexus.com` only after staging sign-off.
- [ ] Document incident response, webhook replay, data deletion, backups/export,
  and rollback procedures.

## Explicit non-goals for the MVP

- [x] No shared authentication or SSO with the main BedrockNexus application.
- [x] No private repositories.
- [x] No manual PHAR, JAR, or ZIP uploads.
- [x] No self-hosted build workers or execution of plugin code on app servers.
- [x] No permanent GitHub Actions artifact download URLs.
- [x] No Cloudflare R2, D1, or Meilisearch.
- [x] No creator payouts, paid ranking, featured placement sales, or multiple
  subscription tiers.
- [x] No adapters beyond PMMP and PowerNukkitX until the MVP loop is complete.
