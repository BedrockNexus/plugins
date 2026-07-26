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
| `/organizations/bedrocknexus-labs` | 7 | Organization profile, members, roles, shared project ownership |

## Developer surfaces

| Route | Future phase | Domain questions exposed |
| --- | --- | --- |
| `/dashboard/projects` | 4–7 | GitHub installation, repositories, adapter detection, metadata, releases, review state, visibility |
| `/dashboard/projects/new` | 4–6 | Repository connection, adapter detection, metadata, and workflow setup |
| `/dashboard/projects/[draftId]` | 6 and 7 | Project metadata editing and fixed repository context |
| `/dashboard/projects/[draftId]/workflow` | 6 | Direct managed-workflow installation and update status |
| `/dashboard/projects/[draftId]/releases` | 6 and 7 | Detected release selection, verification, and review submission |
| `/dashboard/analytics` | 8 | Totals, traffic sources, and event boundaries |
| `/dashboard/organizations` | Live | Membership, roles, organization ownership |

## Administration surfaces

| Route | Future phase | Domain questions exposed |
| --- | --- | --- |
| `/admin/reviews` | 6 and 8 | Exact release, asset, metadata, approval, requested changes, rejection |
| `/admin/workflows` | 6 and 8 | Validated adapter workflow templates, versions, and audit history |
| `/admin/reports` | 8 | Report type, priority, target, assignment, decision |
| `/admin/deliveries` | 4 and 8 | Delivery ID, event, attempt, state, error history |
| `/admin/history` | 8 | Actor, target, reason, prior state, result, timestamp |

## Prototype rules

- Do not present representative data as live registry or analytics data.
- Keep mutation controls disabled until the relevant backend capability exists.
- Never describe Verified Build as a malware, security, or safety review.
- Keep private repositories and manual artifact uploads out of every workflow.
- Preserve GitHub as the source of code, workflow runs, releases, and assets.
