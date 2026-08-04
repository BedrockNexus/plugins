# Authentication setup

BedrockNexus Plugins owns a standalone Better Auth installation backed by its
standalone Convex project. It does not share login state, OAuth credentials, or
sessions with the main BedrockNexus application.

## GitHub OAuth application

Create an OAuth application in GitHub Developer settings with:

- Application name: `BedrockNexus Plugins (Development)`
- Homepage URL: `http://localhost:3000`
- Authorization callback URL:
  `http://localhost:3000/api/auth/callback/github`

This OAuth application is only for user sign-in. Do not reuse the GitHub App
used for repository installations.

Better Auth requests `read:user` and `user:email`. The email scope is required
so accounts with a private public email can still return a verified address.

Add the generated credentials to the Convex development deployment:

```powershell
bunx convex env set GITHUB_CLIENT_ID <client-id>
bunx convex env set GITHUB_CLIENT_SECRET <client-secret>
```

Never add either value to `.env.local`, `.env.example`, Git history, or Vercel
client environment variables. Better Auth runs in Convex, so the credentials
belong in Convex deployment environment variables.

Create separate OAuth applications and credentials for staging and production.
Their callback URLs must use the matching public application origin.

## Local URLs

The Next.js application reads these non-secret values from `.env.local`:

- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CONVEX_SITE_URL`

The Convex development deployment stores:

- `SITE_URL=http://localhost:3000`
- `BETTER_AUTH_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

After changing a Convex environment variable, run `bunx convex dev --once` so
the deployment is ready before testing sign-in.
