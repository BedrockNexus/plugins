# BedrockNexus Plugins

Standalone publishing and discovery platform for Minecraft Bedrock server extensions.

The production application uses standard Next.js App Router, TypeScript, Tailwind CSS, and
Bun. Convex, Better Auth, the GitHub App, OpenPanel, and later billing integrations are added
in the ordered phases documented in [`TODO.md`](./TODO.md).

## Requirements

- Node.js 20.9 or newer
- Bun 1.3.6 or a compatible newer release

## Development

```bash
bun install
bun dev
```

## Validation

Run each check independently so failures remain easy to diagnose:

```bash
bun run format:check
bun run lint
bun run typecheck
bun run test
bun run build
```

## Architecture boundary

This repository has its own deployment, Convex project, authentication configuration,
GitHub App, secrets, and release cycle. It does not import application code or runtime state
from the main BedrockNexus application.
