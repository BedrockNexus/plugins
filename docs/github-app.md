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
| Webhook URL | The development Convex site URL followed by `/github/webhooks` | The production Convex site URL followed by `/github/webhooks` |
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

## Traceable builds

A release earns the "Traceable build" badge only when GitHub's own records tie
its primary asset to a successful run of the exact managed workflow. The rules
live in `convex/lib/buildProvenance.ts`:

| Check | Evidence from GitHub |
| --- | --- |
| Workflow not edited | The git blob SHA of `.github/workflows/bedrocknexus-publish.yml` at the tagged commit equals the blob BedrockNexus installed (`publishingDrafts.workflowBlobSha`). |
| Successful tag build | The managed workflow's run for that tag and commit completed with `success`. |
| Built by the workflow | The GitHub Release and its asset were created by `github-actions[bot]`, which is the identity of the workflow's `gh release create` step. |
| Not replaced later | The asset was uploaded between the run's start and completion (two minutes of slack). Replacing an asset creates a new one with a later timestamp. |

When a release fails, `releases.verificationFailure` records the first failed
check. The asset's GitHub `digest` is stored on `releaseAssets` for future
integrity checks.

Remaining gap: another workflow in the same repository that also uses
`GITHUB_TOKEN` could upload an asset during the same run window. Closing it
fully requires GitHub artifact attestations (`actions/attest-build-provenance`)
in the managed templates, plus Sigstore verification of the attestation.

"Traceable" describes build provenance. It is not a malware or security
review of the plugin's code.
