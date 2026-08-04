# Security policy

## Supported versions

BedrockNexus Plugins is currently an alpha project. Security fixes are applied
only to the latest commit on `main` and to the currently deployed version.
Older commits and forks are not supported.

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability.

Use GitHub's private vulnerability reporting flow from the repository
**Security** tab. Include:

- the affected route, function, or workflow;
- the impact and prerequisites;
- reproducible steps or a minimal proof of concept;
- whether any real account, repository, token, or artifact was accessed; and
- a safe way to validate the proposed fix.

If private vulnerability reporting is temporarily unavailable, contact a
BedrockNexus organization owner through an existing private channel and ask for
a secure reporting path. Do not send credentials or exploit details through a
public issue or discussion.

Maintainers aim to acknowledge complete reports within five business days.
Timelines for validation, remediation, and disclosure depend on severity and
coordination with affected providers.

## Scope

High-value areas include authentication and session handling, organization
authorization, GitHub App installation ownership, webhook verification and
replay handling, workflow-template management, publishing moderation, download
redirect validation, and secret exposure.

Testing must use accounts, repositories, and data you own or have explicit
permission to test. Denial-of-service testing, social engineering, spam, and
accessing other users' private data are out of scope.
