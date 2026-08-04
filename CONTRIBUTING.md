# Contributing to BedrockNexus Plugins

Thanks for helping improve BedrockNexus Plugins. The project is in alpha, so
please discuss large product, schema, or publishing-workflow changes in an issue
before investing in an implementation.

## Development setup

1. Fork and clone the repository.
2. Install Bun 1.3.6 and Node.js 20.9 or newer.
3. Run `bun install --frozen-lockfile`.
4. Create a standalone Convex development deployment with `bunx convex dev`.
5. Configure the values documented in `docs/ENVIRONMENT.md`.
6. Run `bun dev`.

Never reuse production OAuth applications, GitHub Apps, Convex deployments, or
secrets for local development.

## Pull requests

- Keep each pull request focused on one coherent change.
- Add or update tests for behavioral changes.
- Update documentation and `TODO.md` when the product contract changes.
- Do not commit generated build output, `.env.local`, credentials, private keys,
  GitHub payloads containing private data, or production identifiers.
- Preserve the separation between the Plugins platform and the main
  BedrockNexus platform.

Before opening a pull request, run:

```bash
bun run audit
bun run format:check
bun run lint
bun run typecheck
bun run test
bun run build
```

## Commit and license expectations

Use clear, imperative commit messages. By submitting a contribution, you agree
that your contribution is licensed under AGPL-3.0-or-later and that you have the
right to submit it.

Follow `CODE_OF_CONDUCT.md` in all project spaces. Security reports belong in
the private process described by `SECURITY.md`, not in public issues.
