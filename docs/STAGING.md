# Staging and production setup

Staging and production are fully separate: each has its own Convex
deployment, GitHub OAuth app, GitHub App, secrets, and Coolify application.
Never share credentials between them.

## 1. Create the environments (once per environment)

- [ ] Convex: create a production deployment for the standalone project, and
      a separate staging project (or preview deployment).
- [ ] GitHub OAuth app per environment, callback
      `https://<host>/api/auth/callback/github`.
- [ ] GitHub App per environment, configured as in
      [github-app.md](./github-app.md), with the webhook URL pointing at that
      environment's Convex site URL plus `/github/webhooks`.
- [ ] Generate fresh high-entropy values for `BETTER_AUTH_SECRET`,
      `DOWNLOAD_REDIRECT_SECRET`, `AUTH_PROXY_SECRET`, and
      `GITHUB_APP_WEBHOOK_SECRET`.
- [ ] Set every Convex variable from [ENVIRONMENT.md](./ENVIRONMENT.md).
- [ ] Deploy Convex: `npx convex deploy` with that environment's deploy key.
- [ ] Seed server software as an admin (`seedDefaultsAsAdmin`).
- [ ] Coolify application on the GHCR image with the Next.js variables,
      including `DOWNLOAD_REDIRECT_SECRET` and `AUTH_PROXY_SECRET`.
- [ ] Grant your account the admin role and a second account the moderator
      role (moderators cannot approve their own submissions).

## 2. Staging acceptance flow

Run on staging after every significant change and before production.

- [ ] `E2E_BASE_URL=https://<staging-host> bun run test:e2e` passes.
- [ ] Record signed-in sessions once and run the signed-in suite:
      `E2E_DEVELOPER_STORAGE=e2e/.auth/developer.json`
      `E2E_MODERATOR_STORAGE=e2e/.auth/moderator.json`.
- [ ] Sign in with GitHub; sign out; sign in again.
- [ ] Install the GitHub App on a public fixture repository (for example
      `BedrockNexus/example-php-plugin`) and see it under Projects.
- [ ] Analyze the repository, review metadata, select and install the
      managed workflow.
- [ ] Push a `v*` tag; confirm the workflow creates the release and the draft
      shows a traceable build. Upload an extra asset by hand to a second
      release and confirm it is **not** traceable.
- [ ] Submit for review. Confirm the submitting account cannot approve it,
      then approve with the moderator account.
- [ ] Open the public project page and download. Confirm one redirect to the
      GitHub asset and that the download count increases exactly once on
      repeated clicks.
- [ ] Reject a second submission and confirm it cannot be resubmitted.
- [ ] Redeliver a webhook from the GitHub App settings and confirm it is
      acknowledged as a duplicate in `/admin/deliveries`.
- [ ] Check response headers and that a missing project returns 404.

## 3. Production

- [ ] Take a Convex export (see [OPERATIONS.md](./OPERATIONS.md)).
- [ ] Deploy Convex, then the app image that passed staging.
- [ ] Run `E2E_BASE_URL=https://<production-host> bun run test:e2e`.
- [ ] Point `plugins.bedrocknexus.com` at the Coolify application only after
      staging sign-off.
