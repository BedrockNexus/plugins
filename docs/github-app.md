# BedrockNexus Plugins GitHub App

The publishing integration is a separate GitHub App. It does not reuse the
GitHub OAuth application that Better Auth uses for sign-in.

## Registration

Create the App under the `BedrockNexus` organization with these settings:

| Setting | Development | Production |
| --- | --- | --- |
| GitHub App name | `BedrockNexus Plugins` | `BedrockNexus Plugins` |
| Homepage URL | `http://localhost:3000` | `https://plugins.bedrocknexus.com` |
| Callback URL | `http://localhost:3000/api/github/callback` | `https://plugins.bedrocknexus.com/api/github/callback` |
| Setup URL | Leave blank | Leave blank |
| Request user authorization during installation | Enabled | Enabled |
| Webhook URL | `https://woozy-marten-367.convex.site/github/webhooks` | The production Convex site URL followed by `/github/webhooks` |
| Webhook secret | A dedicated random secret | A separate dedicated random secret |
| Where can this GitHub App be installed? | Any account | Any account |

The callback uses a short-lived, single-use `state` value tied to the signed-in
BedrockNexus Plugins user. It exchanges GitHub's OAuth code for a transient user
token and verifies that the user can access the returned installation before
the installation is claimed. The user token is never persisted.

## Repository permissions

Configure only these repository permissions:

| Permission | Access | Why it is needed |
| --- | --- | --- |
| Metadata | Read-only | Identify the selected repository and its owner. GitHub requires this permission. |
| Contents | Read and write | Read repository metadata and trees, commit the managed workflow to the selected default branch, and manage GitHub Release assets. |
| Workflows | Read and write | Add or update `.github/workflows/bedrocknexus-publish.yml` when the project owner explicitly installs or updates it. |
| Actions | Read-only | Track workflow runs and link developers to GitHub-hosted logs. |
| Checks | Read-only | Correlate check conclusions with a build. |
| Commit statuses | Read-only | Correlate commit statuses with a build. |

Do not request pull requests, administration, issues, secrets, members,
deployments, or any organization permission. Private repositories are not
eligible: newly observed private repositories are discarded, and a previously
public repository is marked ineligible if GitHub later reports it as private.

## Webhook subscriptions

Subscribe only to:

- Installation
- Installation repositories
- Repository
- Push
- Workflow run
- Release

The endpoint validates `X-Hub-Signature-256` over the untouched request body,
then atomically claims `X-GitHub-Delivery`. Duplicate delivery IDs are recorded
without reprocessing, failed deliveries can be retried, and a delivery ID reused
with different content is rejected.

## Convex environment

Store all GitHub App secrets in the standalone Convex deployment, never in
Next.js environment files or source control:

```text
GITHUB_APP_ID
GITHUB_APP_CLIENT_ID
GITHUB_APP_CLIENT_SECRET
GITHUB_APP_PRIVATE_KEY
GITHUB_APP_WEBHOOK_SECRET
GITHUB_APP_SLUG
```

The private key can be stored with literal `\n` separators; the server restores
the PEM newlines before creating the Octokit App client. Keep the Better Auth
`GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` values separate.

After configuring the App, test with a public repository selected explicitly.
Confirm the repository appears at `/dashboard/projects`, a forged webhook
returns `401`, a duplicate returns `202` without reprocessing, and the delivery
history appears at `/admin/deliveries` for moderators and administrators.
