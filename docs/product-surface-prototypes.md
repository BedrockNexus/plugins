# Product surface prototypes

These routes define the intended Phase 4–9 experience before the Phase 3
Convex domain model is finalized. All representative records are visibly
labeled as prototypes and mutation controls remain disabled.

## Public surfaces

| Route | Future phase | Domain questions exposed |
| --- | --- | --- |
| `/explore` | 7 | Search, filters, visibility, software, categories, pagination |
| `/projects/nexus-essentials` | 7 | Project, versions, compatibility, provenance, reviews, download redirect |
| `/creators/jeantkg` | 7 | GitHub identity, creator profile, projects, support links |
| `/organizations/bedrocknexus-labs` | 7 and 9 | Organization profile, members, roles, shared project ownership |

## Developer surfaces

| Route | Future phase | Domain questions exposed |
| --- | --- | --- |
| `/dashboard/repositories` | 4 | GitHub installation, granted repositories, visibility, default branch |
| `/dashboard/publish` | 5 and 6 | Adapter confidence, build configuration, metadata, workflow PR, release readiness |
| `/dashboard/projects` | 6 and 7 | Ownership, project state, latest release, visibility |
| `/dashboard/analytics` | 8 and 9 | Basic totals, advanced analytics entitlement, event boundaries |
| `/dashboard/organizations` | 9 | Membership, roles, organization ownership |
| `/dashboard/pro` | 9 | Entitlements and explicit free-versus-Pro boundaries |

## Administration surfaces

| Route | Future phase | Domain questions exposed |
| --- | --- | --- |
| `/admin/reports` | 8 | Report type, priority, target, assignment, decision |
| `/admin/deliveries` | 4 and 8 | Delivery ID, event, attempt, state, error history |
| `/admin/history` | 8 | Actor, target, reason, prior state, result, timestamp |

## Prototype rules

- Do not present representative data as live registry or analytics data.
- Keep mutation controls disabled until the relevant backend capability exists.
- Never describe Verified Build as a malware, security, or safety review.
- Keep private repositories and manual artifact uploads out of every workflow.
- Preserve GitHub as the source of code, workflow runs, releases, and assets.
