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
1. count operational Codex tasks against maximum capacity 5;
2. treat `codex:prompted`, `codex:invoked`, `codex:working` and open Codex PRs needing Codex-side changes as operational;
3. treat `codex:review-needed` as human review/merge wait, not saturation, unless there is concrete file/module collision or Codex-side rework;
4. identify issues with `codex:working` or `codex:invoked` but no visible PR;
5. identify stale zombie tasks with `codex:invoked` or `codex:working` for more than 60 minutes and no PR, branch, Codex comment, commit or concrete activity;
6. identify issues with multiple overlapping Codex attempts;
7. identify open PRs touching the same files or solving overlapping issues;
8. identify stale tasks that need `codex:follow-up` or `codex:blocked`;
9. apply the anti-idle rule whenever operational capacity is below 5/5;
10. recommend whether the queue should continue, pause or require human intervention.

Default queue limits:
- maximum active operational Codex tasks: 5;
- maximum active task touching API/schema/migrations: 1 unless a human reviewer accepts the collision risk;
- maximum active task touching public copy/legal/methodological notes: 1 unless a human reviewer accepts the collision risk;
- do not start new tasks if root typecheck or build is failing because of a recent Codex PR.

Anti-idle rule:
- If operational capacity is below 5/5, promote safe technical tasks to `codex:ready` until the queue is full or record an explicit reason not to fill it. Valid reasons are absence of real eligible backlog, concrete file/module collision, legal/copy/methodological risk, CI instability, or a decision required from Giovanni.
- Prefer typecheck/build/lint/test failures, small bugs and limited technical-debt tasks.
- Do not promote unsafe/manual, accusatory, broad, generated-file or unclear tasks merely to fill the queue.
- Do not let stale blocker comments pause an issue when the cited PR, issue or dependency is closed, merged, resolved or explicitly superseded.

Collision-control fields required for every recommended promotion, pause or block:
- Probable scope: {{PROBABLE_SCOPE}}
- Likely files/modules: {{LIKELY_FILES}}
- Collision risk: low / medium / high

Fast lane treatment:
- Technical fast-lane candidates may be promoted ahead of ordinary backlog items when they are small, clear, low-collision and validate with typecheck/build/lint/test commands.
- Fast-lane tasks still require a dedicated branch `codex/<issue-number>-<slug>`, a PR targeting `main`, validation notes, no auto-merge and no auto-close.

Output format:

### Queue status
Continue / Pause / Human intervention required

### Capacity count
- Operational tasks:
- Human review wait (`codex:review-needed`):
- Remaining safe capacity:

### Active tasks

### Collision risks

### Stale zombie tasks

### Anti-idle actions

### Fast-lane candidates

### Recommended label changes

### Comment to post, if needed
```markdown
...
```
````
