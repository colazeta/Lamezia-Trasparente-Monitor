# Human gate ledger

Issue linkage: #544. This ledger is the mobile-readable control surface for the current launch/governance track. It records numbers, blockers and next ownership without authorising merge, approval, auto-merge or issue closure.

## Current operational snapshot

| Field | Value |
| --- | --- |
| Total tracked P0/P1 governance tasks | 6 |
| P0 tasks | 4: #543, #544, #545, #548 |
| P1 tasks | 2: #546, #547 |
| Completed | 0 |
| In progress | 4 P0 issues have prompts or governance scope defined |
| In PR | This PR, covering #543, #544 and #548 documentation scaffolding |
| Merged | 0 |
| Blocked | #545 remains launch-blocking until prototype/public-copy safeguards are reviewable |
| Materialization debt observed before this PR | 4 unique open issues from the configured debt labels: #395, #522, #524, #525 |
| Real active operational slots | 4 / 5, counting #543, #544, #545 and #548 as the active P0 lane |
| Release confidence | low until #545 has reviewable safeguards |
| Public-readiness confidence | low-to-medium after this PR, still gated by #545 |

## Next human gate

Giovanni must review whether this governance layer is acceptable as the P0 operating model. This PR is documentation-only and should not be treated as public launch clearance.

## Next Codex goal

Produce a reviewable #545 implementation path that introduces a reusable prototype/status/source/verification/limits pattern without changing sensitive public copy beyond the smallest safe surface.

## Blockers

| Blocker | Type | Owner | Required action |
| --- | --- | --- | --- |
| #545 prototype/public-copy safeguards missing | public-readiness | Codex + Giovanni review | Create a small PR or complete diff for a reusable notice/checklist; human review before merge |
| Existing materialization debt #522/#524/#525 | materialization | Materialization governor | Recover only complete PR/diff/bundle, otherwise keep classified |
| Open PR #162 not mergeable | PR review | PR governor | Do not merge from this lane; keep separate from P0 civic governance |

## GitHub comment template

```md
Progress: X/Y tasks completed
Next human gate: ...
Decision needed from Giovanni: ...
Safe autonomous next step: ...
Risk: low / medium / high
Evidence/source status: complete / partial / missing
PR: #... / none
State: pr-open / ready-for-human-merge / review-needed / needs-human-decision / blocked-stable
```

## Update rule

A PR must update this ledger when it changes P0/P1 governance state, public-readiness, launch-blocker status, materialization debt, or Giovanni-facing decision ownership. A PR may skip the ledger only when it is a purely technical change with no effect on these fields, and the PR body must say so.
