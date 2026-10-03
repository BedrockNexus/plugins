# Publishing moderation

Every release enters the public catalog through a moderator decision in
`/admin/reviews` (`convex/functions/projects/publishing/model.ts`).

| Decision | Effect |
| --- | --- |
| Approve | The selected verified release and its version are published. |
| Request changes | The owner may fix metadata or choose another verified release and resubmit. |
| Reject | Final. The selected release is marked `rejected` and can never be selected or submitted again. If the project has never been published, the whole submission stays rejected and cannot be resubmitted; GitHub refreshes no longer change it. If the project is already published, the owner may later submit a different, newer release. |

Moderators cannot approve a submission they created, that they own, or whose
owning organization they belong to (`SELF_REVIEW_FORBIDDEN`). Another
moderator must review it. Every decision is recorded in `adminActions`.
