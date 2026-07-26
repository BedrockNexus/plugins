# Download redirect contract

BedrockNexus Plugins never receives or streams plugin bytes. Public download links use:

```text
GET /download/[projectSlug]/[version]
```

The Next.js route hashes the client address and user agent, then asks the Convex
download mutation to resolve the destination. The request never accepts a destination URL.

Convex only returns an asset when all of these conditions hold:

- the project is public and published;
- the requested version is published;
- the release is published and linked to a verified build;
- exactly one accepted primary asset exists;
- the source repository is public, active, and still granted to the GitHub App;
- the stored URL is HTTPS on `github.com` and its decoded path exactly matches the
  repository owner, repository name, release tag, and asset name.

The route records the redirect and updates both the exact per-project counter and the
project owner's exact lifetime counter in the same mutation. The project document keeps a
debounced materialized total only for indexed popularity ordering. A repeat request for the
same asset and anonymous hash within ten seconds is
redirected but not counted twice. The official Convex rate-limiter component also applies a
per-hash token bucket. Counts therefore mean successful BedrockNexus redirect decisions, not
unique users, installations, or completed GitHub downloads.

## Required secret

Set the same high-entropy `DOWNLOAD_REDIRECT_SECRET` in the Next.js deployment and the
Convex deployment. It authenticates the server-to-Convex resolution call and salts anonymous
fingerprints. Direct public mutation calls without the secret receive the same not-found
response as invalid downloads.

For local development, add it to `.env.local`. For Convex, set it with:

```powershell
bunx convex env set DOWNLOAD_REDIRECT_SECRET
```

Never commit the value or expose it through a `NEXT_PUBLIC_` variable.
