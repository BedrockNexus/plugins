# Coolify deployment

Coolify hosts the Next.js application container. Convex remains a separate
deployment and must be deployed independently.

## Deployment model

The deployment pipeline mirrors the BedrockNexus Hub:

1. The `CI` workflow validates pull requests and `main`.
2. The separate `Build and push (GHCR)` workflow runs after pushes to `main` or
   through manual workflow dispatch.
3. GitHub Actions builds the repository-owned `Dockerfile` and publishes the
   image to GitHub Container Registry (GHCR).
4. Coolify pulls and runs the prebuilt image. The production server does not
   clone the repository, install dependencies, or run `next build`.

The image workflow publishes these tags:

```text
ghcr.io/bedrocknexus/plugins:latest
ghcr.io/bedrocknexus/plugins:<full-commit-sha>
```

The workflow intentionally does not store or call a Coolify API webhook. Image
deployment remains configured in Coolify, matching the Hub application.

Protect `main` in GitHub and require the `CI / validate` check before merging.

## GitHub production environment

Create a GitHub Actions environment named `prod`. Add these environment
variables to it:

```text
NEXT_PUBLIC_CONVEX_URL
NEXT_PUBLIC_CONVEX_SITE_URL
```

Both values must belong to the same production Convex deployment. The image
workflow refuses to build when either value is missing. GHCR publishing uses
GitHub's short-lived `GITHUB_TOKEN`; no registry write secret is required.

After the first successful push, make the GHCR container package public. A
public image lets Coolify pull without storing GitHub credentials. If the image
remains private, authenticate the Coolify server's deployment user to GHCR with
a read-only package token.

## Coolify application settings

| Setting | Value |
| --- | --- |
| Resource type | Docker Image |
| Image | `ghcr.io/bedrocknexus/plugins` |
| Tag | `latest` |
| Port | `3000` |
| Health check path | `/api/health` |
| Domain | `https://plugins.bedrocknexus.com` |
| Force HTTPS | Enabled |

Do not connect this resource to the Git repository and do not select the
Dockerfile, Nixpacks, or Static build packs. The GitHub workflow is the only
production image builder.

Redeploy the Docker Image resource after a successful GHCR workflow so Coolify
pulls the current `latest` tag. If image-update automation is configured in
Coolify, keep that configuration outside this repository, as it is for Hub.

The image runs as an unprivileged user and includes an image-level health check.
The health route intentionally does not contact Convex, so it reports whether
the web process is ready rather than whether every external dependency is
available.

## Runtime variables

Next.js embeds `NEXT_PUBLIC_*` variables during `next build`. Configure the same
values as Coolify runtime variables so server-side code sees the matching
deployment:

```text
NEXT_PUBLIC_CONVEX_URL
NEXT_PUBLIC_CONVEX_SITE_URL
```

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
2. Confirm `Build and push (GHCR)` publishes `latest` and the commit SHA tag.
3. Confirm Coolify pulls the image instead of starting a build.
4. Open `/api/health` and confirm it returns HTTP 200.
5. Test GitHub sign-in against the production callback URL.
6. Test one GitHub App installation and webhook delivery.
7. Complete the real download-redirect QA tracked in `TODO.md`.
8. Test rollback by selecting the previous commit SHA image tag in Coolify and
   redeploying it.
