# BedrockNexus Plugins

[![CI](https://github.com/BedrockNexus/plugins/actions/workflows/ci.yml/badge.svg)](https://github.com/BedrockNexus/plugins/actions/workflows/ci.yml)
[![CodeQL](https://github.com/BedrockNexus/plugins/actions/workflows/codeql.yml/badge.svg)](https://github.com/BedrockNexus/plugins/actions/workflows/codeql.yml)
[![License: AGPL-3.0-or-later](https://img.shields.io/badge/license-AGPL--3.0--or--later-blue.svg)](./LICENSE)

BedrockNexus Plugins is a GitHub-powered publishing and discovery platform for
Minecraft Bedrock server extensions. It connects public plugin repositories,
installs administrator-managed GitHub Actions workflows, detects GitHub
Releases, submits releases for moderation, and exposes approved projects through
a public catalog.

> [!WARNING]
> The project is under active development. Treat the current release as alpha:
> interfaces, schemas, and deployment procedures may change before the first
> stable release.

## Current capabilities

- GitHub sign-in through Better Auth
- Personal and Better Auth organization workspaces
- GitHub App installation and public-repository synchronization
- PocketMine-MP and PowerNukkitX plugin metadata adapters
- Administrator-managed publishing workflow templates
- Moderated release submission and approval
- Public software, project, creator, and organization pages
- Validated download redirects to GitHub Release assets

Analytics and the remaining production-hardening work are tracked in
[`TODO.md`](./TODO.md).

## Technology

- Next.js App Router, React, TypeScript, and Tailwind CSS
- shadcn/ui built on Base UI
- Convex for the database, functions, actions, and HTTP endpoints
- Better Auth and Better Auth UI
- GitHub OAuth for identity and a separate GitHub App for repositories
- Bun for dependency management and scripts

## Requirements

- Node.js 20.9 or newer
- Bun 1.3.6
- A standalone Convex project
- A GitHub OAuth application
- A GitHub App when testing repository publishing

## Local development

Install the locked dependencies:

```bash
bun install --frozen-lockfile
```

Start Convex and select or create the standalone development deployment:

```bash
bunx convex dev
```

The Convex CLI creates the public Convex values in `.env.local`. Copy any
remaining application values from `.env.example`, then configure the server-only
deployment variables described in [`docs/ENVIRONMENT.md`](./docs/ENVIRONMENT.md).

In a second terminal, start Next.js:

```bash
bun dev
```

The application is available at `http://localhost:3000`.

Detailed integration setup:

- [`docs/AUTHENTICATION.md`](./docs/AUTHENTICATION.md)
- [`docs/github-app.md`](./docs/github-app.md)
- [`docs/ENVIRONMENT.md`](./docs/ENVIRONMENT.md)
- [`docs/adapters.md`](./docs/adapters.md)
- [`docs/downloads.md`](./docs/downloads.md)

## Validation

Run the same checks used by CI:

```bash
bun run audit
bun run format:check
bun run lint
bun run typecheck
bun run test
bun run build
```

`bun run build` requires valid-looking `NEXT_PUBLIC_CONVEX_URL` and
`NEXT_PUBLIC_CONVEX_SITE_URL` values. CI supplies non-production placeholders;
deployed builds must use the matching deployment URLs.

## Architecture boundary

This repository owns its deployment, Convex project, authentication
configuration, GitHub App, secrets, and release cycle. It does not import
application code or runtime state from the main BedrockNexus platform.

Plugin artifacts remain on GitHub. BedrockNexus records validated release
metadata and redirects downloads to approved GitHub Release assets; it does not
run repository code.

## Contributing and security

Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before opening a pull request. Report
security vulnerabilities using the private process in
[`SECURITY.md`](./SECURITY.md), never through a public issue.

## License

BedrockNexus Plugins is licensed under the
[GNU Affero General Public License v3.0 or later](./LICENSE). See
[`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md) for source-derived
components under compatible third-party licenses.

The BedrockNexus name and logos are brand assets and are not granted for use by
the software license. Minecraft is a trademark of Microsoft; this project is not
affiliated with or endorsed by Microsoft or Mojang Studios.
