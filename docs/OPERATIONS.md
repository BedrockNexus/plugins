# Operations runbook

Procedures for running BedrockNexus Plugins in production. Deployment itself
is described in [COOLIFY.md](./COOLIFY.md) and variables in
[ENVIRONMENT.md](./ENVIRONMENT.md).

## Components

| Component | Where | Holds |
| --- | --- | --- |
| Next.js app | Coolify, image `ghcr.io/bedrocknexus/plugins:<sha>` | No data. Proxies auth and download redirects. |
| Convex deployment | Convex dashboard | All application data, Better Auth, rate limits, webhook processing. |
| GitHub App | GitHub organization settings | Installation access to repositories, webhook deliveries. |
| GitHub OAuth app | GitHub organization settings | User sign-in. |
| Plugin files | GitHub Releases of each repository | Never stored by BedrockNexus. |

## Secret rotation

Rotate a secret immediately if it may have leaked, and otherwise yearly.
Change staging first and run the acceptance flow before production.

| Secret | Set in | Rotation steps | User impact |
| --- | --- | --- | --- |
| `BETTER_AUTH_SECRET` | Convex | Set a new value with `npx convex env set`. | Every session is invalidated; users sign in again. |
| `GITHUB_CLIENT_SECRET` | Convex | Generate a second secret in the OAuth app, set it in Convex, verify sign-in, then delete the old one. | None. |
| `GITHUB_APP_PRIVATE_KEY` | Convex | Generate a new key in the GitHub App, set it (full PEM) in Convex, verify a publishing refresh, then delete the old key in GitHub. | None. |
| `GITHUB_APP_CLIENT_SECRET` | Convex | Same as the OAuth client secret. | Installation callbacks fail until updated. |
| `GITHUB_APP_WEBHOOK_SECRET` | Convex and GitHub App | Update GitHub and Convex together, then redeliver any deliveries that failed in between (see below). | Deliveries between the two updates fail with 401 and need redelivery. |
| `DOWNLOAD_REDIRECT_SECRET` | Convex and Coolify | Set the new value in Convex, then redeploy the app with it. | Downloads return 503 between the two steps; do it quickly. Anonymous download de-duplication restarts. |
| `AUTH_PROXY_SECRET` | Convex and Coolify | Set the new value in Convex, then redeploy the app with it. | Between steps, sign-in rate limits share one bucket. |

Never paste secrets into issues, chat, or logs. Logs and stored errors are
redacted by `convex/lib/redact.ts`, which removes GitHub tokens, JWTs, PEM
keys, and sensitive fields, but treat that as a safety net, not permission.

## Content Security Policy

Every page gets a per-request Content Security Policy from `src/proxy.ts`.
Scripts only run with that request's nonce (`'strict-dynamic'`), so injected
markup, inline event handlers, and `javascript:` links cannot execute, and
the browser may only connect to this site and the Convex deployment
(derived from `NEXT_PUBLIC_CONVEX_URL` and `NEXT_PUBLIC_CONVEX_SITE_URL`).
Inline styles stay allowed for Base UI and CodeMirror.

Adding a third-party script, analytics, or API origin means adding it to
`buildContentSecurityPolicy` in `src/proxy.ts`; otherwise the browser blocks
it and logs a `securitypolicyviolation` in the console. Pages must stay
dynamically rendered for nonces to work, and `bun run test:e2e` checks that
every script carries the nonce.

## Incident response

1. **Assess.** Check Coolify logs (JSON lines with `level` and `event`),
   Convex function logs, and `/admin/deliveries` for failing webhooks.
2. **Contain.**
   - Leaked secret: rotate it (above).
   - Malicious or broken plugin release: set the project's visibility to
     `suspended` in the Convex dashboard. Download redirects and catalog
     listings stop immediately because both require `visibility: "public"`.
   - Abusive account: ban it through Better Auth (Convex dashboard, `user`
     table in the `betterAuth` component) and suspend its projects.
   - Webhook flood: forged requests are throttled automatically
     (`invalidWebhook` rate limit). If the GitHub App itself is compromised,
     suspend it in GitHub settings.
3. **Communicate.** Post on the BedrockNexus status channels; contact
   affected creators directly when their projects were suspended.
4. **Recover.** Fix, redeploy or roll back (below), redeliver webhooks, and
   restore visibility.
5. **Review.** Write a short post-incident note: timeline, cause, fix, and
   follow-ups. Every moderator decision is already recorded in `adminActions`.

## Webhook replay

Each delivery is claimed by its GitHub delivery ID. Redelivering a delivery
that **failed** processes it again; redelivering one that was **processed** or
**ignored** is acknowledged without side effects, so replay is always safe.

1. Find failed deliveries in `/admin/deliveries`, or in GitHub under the App's
   **Advanced → Recent deliveries**.
2. Fix the cause (configuration, secret, or code).
3. Click **Redeliver** in GitHub for each failed delivery.

Publishing state can also be rebuilt without webhooks: the project owner can
refresh it from the dashboard, which re-reads releases and workflow runs from
GitHub.

## Data deletion

- **Project deletion (self-service):** Dashboard → Projects → a project →
  Delete project, confirmed by typing the slug. Allowed for the owner, an
  owner or admin of the owning organization, and site admins (not
  moderators). The project and its drafts are removed immediately, so it
  leaves the catalog and download redirects at once; versions, builds,
  releases, assets, download records, categories, tags, support links, and
  reports are purged in the background (`projects/deletion:purgeProjectData`).
  The moderation audit log (`adminActions`) is kept and records the deletion.
- **Account deletion (self-service):** Settings → Account → Danger zone.
  It deletes the Better Auth user, sessions, linked accounts, organization
  memberships, the creator profile with its username aliases, and records of
  uninstalled GitHub App installations. It is refused while the user owns an
  organization, a personal project or draft, or an active personal GitHub App
  installation, or while projects are attributed to their creator profile;
  each case has a self-service fix (transfer the organization, delete the
  project, or uninstall the GitHub App).
- Plugin files live in the creator's own GitHub repository and are never
  stored by BedrockNexus.
- Respond to deletion requests within 30 days and record the request date
  and completion date.

## Backups and export

Convex keeps automatic backups according to the plan; also take a manual
snapshot before every risky deploy or migration:

```bash
npx convex export --path backups/plugins-$(date +%Y%m%d).zip
```

Store exports encrypted and outside the repository; they contain user data.
To restore into a fresh deployment for inspection or recovery:

```bash
npx convex import --replace backups/plugins-YYYYMMDD.zip
```

Restoring over production replaces all data; only do it as a last resort and
announce downtime first.

## Rollback

- **App:** every build is tagged `ghcr.io/bedrocknexus/plugins:<commit-sha>`.
  In Coolify, point the application at the previous tag and redeploy. The app
  holds no state, so this is always safe.
- **Convex functions:** redeploy the previous commit with
  `npx convex deploy`. Schema changes in this project are additive (new
  optional fields, tables, and indexes), so older functions keep working with
  newer data. If a release narrowed a schema, restore from the pre-deploy
  export instead.
- After rolling back, run the smoke tests against production:

```bash
E2E_BASE_URL=https://plugins.bedrocknexus.com bun run test:e2e
```
