# Coolify deployment

Coolify hosts the Next.js application container. Convex remains a separate
deployment and must be deployed independently.

## Deployment model

GitHub Actions validates pull requests and `main`. Coolify builds the
repository-owned `Dockerfile` and deploys the resulting image after a validated
change reaches `main`.

Protect `main` in GitHub and require the `CI / validate` check before merging.
Connect Coolify to the repository with its GitHub App, select `main`, and enable
automatic deployments. Do not use Coolify's Static build pack for this app.

## Coolify application settings

| Setting | Value |
| --- | --- |
| Build pack | Dockerfile |
| Dockerfile location | `/Dockerfile` |
| Port | `3000` |
| Health check path | `/api/health` |
| Domain | `https://plugins.bedrocknexus.com` |
| Force HTTPS | Enabled |

The image runs as an unprivileged user and includes an image-level health check.
The health route intentionally does not contact Convex, so it reports whether
the web process is ready rather than whether every external dependency is
available.

## Build-time variables

Next.js embeds `NEXT_PUBLIC_*` variables during `next build`. Configure these as
Coolify build variables and runtime variables:

```text
NEXT_PUBLIC_CONVEX_URL
NEXT_PUBLIC_CONVEX_SITE_URL
```

Both values must belong to the same production Convex deployment. Redeploy the
application after changing either value.

## Runtime secret

Configure this as a runtime-only secret in Coolify:

```text
DOWNLOAD_REDIRECT_SECRET
```

It must exactly match `DOWNLOAD_REDIRECT_SECRET` in the production Convex
deployment. Do not expose it as a build argument or commit it to the repository.

The remaining authentication and GitHub App values belong in Convex, as
documented in `docs/ENVIRONMENT.md`; they must not be copied into Coolify.

## Convex deployment

Deploy the production Convex functions separately from an authenticated local
or CI environment:

```bash
bunx convex deploy
```

Do not deploy Convex automatically until the production deployment and its
environment variables have been created and a staging deployment has passed the
publishing acceptance flow.

## First deployment verification

1. Confirm the GitHub `CI / validate` check passes on the deployed commit.
2. Confirm the Coolify build uses `bun install --frozen-lockfile`.
3. Open `/api/health` and confirm it returns HTTP 200.
4. Test GitHub sign-in against the production callback URL.
5. Test one GitHub App installation and webhook delivery.
6. Complete the real download-redirect QA tracked in `TODO.md`.
7. Confirm Coolify can roll back to the previous local image.
