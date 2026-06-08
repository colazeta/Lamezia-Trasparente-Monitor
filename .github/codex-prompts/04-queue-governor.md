# Prompt template — 04 queue governor and collision control

Use this template for the fourth automation.

````markdown
Assess the Codex automation queue for `colazeta/Lamezia-Trasparente-Monitor`.

Scope:
- open issues with labels matching `codex:*`;
- open pull requests related to Codex work;
- recent Codex comments, branches and commits, if available;
- recent CI/typecheck/build/lint/test failures, if available.

Task:
1. derive a state for every inspected issue from labels plus evidence: `idle`, `candidate`, `ready`, `invoked`, `working`, `pr-open`, `blocked`, `stale`, `completed-by-pr` or `superseded`;
2. count real active Codex tasks against maximum capacity 5;
3. treat `codex:prompted`, `codex:invoked`, `codex:working` and open Codex PRs needing Codex-side changes as operational only when backed by recent evidence;
4. treat `codex:ready` as eligible backlog only, never active work;
5. classify new or newly discovered issues during this same cycle as ready-plus-invoked, candidate, blocked, duplicate/superseded or needs-human-decision;
6. treat `codex:review-needed` and PRs/issues waiting only for Giovanni review/merge as human review wait, not saturation, unless there is concrete file/module collision or Codex-side rework;
7. compute effective free slots as `5 - real active Codex operational tasks`, excluding human-review-pending items;
8. identify issues with `codex:prompted`, `codex:working` or `codex:invoked` but no visible PR;
9. classify a Codex summary with no open PR to `main`, visible branch, explicit blocker or recent execution evidence as `output-without-PR`;
10. identify stale zombie tasks with `codex:invoked`, `codex:prompted` or `codex:working` and no PR, branch, explicit blocker, Codex comment, commit, validation log, diff location or concrete activity;
11. identify issues with multiple overlapping Codex attempts;
12. identify open PRs touching the same files/modules or solving overlapping issues;
13. identify stale tasks that need `codex:follow-up` or `codex:blocked`;
14. apply the anti-idle rule whenever real active operational capacity is below 5/5;
15. recommend whether the queue should continue, pause or require human intervention.

Default queue limits:
- maximum active operational Codex tasks: 5, counted only from real active Codex work; `codex:ready` and `output-without-PR` are excluded from this count;
- maximum active task touching API/schema/migrations: 1 unless a human reviewer accepts the collision risk;
- maximum active task touching public copy/legal/methodological notes: 1 unless a human reviewer accepts the collision risk;
- do not start new tasks if root typecheck or build is failing because of a recent Codex PR.

Anti-idle rule:
- If real active operational capacity is below 5/5, a report-only pass is insufficient when eligible backlog exists. In order: invoke a ready non-colliding issue; promote a mature non-colliding candidate and invoke it; create a concrete micro-issue from a verified maintenance need and invoke it; or record a verifiable reason not to fill capacity. Valid reasons are absence of real eligible backlog, concrete file/module collision, legal/copy/methodological risk, CI instability, or a decision required from Giovanni before same-file/module work can proceed safely.
- Do not pause the whole pipeline merely because a PR or issue is awaiting Giovanni review/merge; treat it as outside the queue unless it collides on files/modules or needs Codex-side rework.
- Prefer typecheck/build/lint/test failures, small bugs and limited technical-debt tasks.
- Do not promote unsafe/manual, accusatory, broad, generated-file or unclear tasks merely to fill the queue.
- Do not let stale blocker comments pause an issue when the cited PR, issue or dependency is closed, merged, resolved or explicitly superseded.
- Do not let a summary-only Codex comment consume an active slot; route it to `codex:follow-up` as `output-without-PR` unless PR, branch, blocker or recent execution evidence is verified.

Collision-control fields required for every recommended promotion, invocation, pause or block:
- Probable scope: {{PROBABLE_SCOPE}}
- Likely files/modules: {{LIKELY_FILES}}
- Collision risk: low / medium / high
- Evidence used and age:
- Matrix result: high blocks unless human accepted; medium requires narrow scope and explicit note; low may proceed

Fast lane treatment:
- Technical fast-lane candidates may be promoted ahead of ordinary backlog items when they are small, clear, low-collision and validate with typecheck/build/lint/test commands.
- Fast-lane tasks still require a dedicated branch `codex/<issue-number>-<slug>`, a PR targeting `main`, validation notes, no auto-merge and no auto-close.

Output format:

### Queue status
Continue / Pause / Human intervention required

### Derived states
- Issue / state / evidence age / capacity effect:

### Capacity count
- Real active operational tasks:
- Human review wait outside capacity (`codex:review-needed` / Giovanni review or merge):
- Concrete file/module collisions from review-wait items:
- Effective free slots (`5 - real active operational tasks`):
- Remaining safe capacity after collisions:

### Active tasks

### Collision risks

### Stale zombie and output-without-PR tasks

### Promotion SLA outcomes
- New or newly discovered issue / outcome:

### Anti-idle actions

### Fast-lane candidates

### Recommended label changes

### Comment to post, if needed
```markdown
...
```
````
