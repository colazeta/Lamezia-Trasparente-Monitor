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
1. count real active Codex tasks against maximum capacity 10;
2. treat `codex:prompted`, `codex:invoked`, `codex:working` and open Codex PRs needing Codex-side changes as operational;
3. treat `codex:review-needed` and PRs/issues waiting only for Giovanni review/merge as human review wait, not saturation, unless there is concrete file/module collision or Codex-side rework;
4. compute effective free slots as `10 - real active Codex operational tasks`, excluding human-review-pending items;
5. identify issues with `codex:working` or `codex:invoked` but no visible PR, while checking whether their latest operative event is still inside the stale-task grace window;
6. classify summaries without a GitHub-visible PR, GitHub-visible branch plus recent commit SHA, reviewable diff/execution artifact or explicit technical blocker as `output-without-PR`;
7. identify stale zombie tasks with `codex:invoked` or `codex:working` for more than 60 minutes since the latest operative event and no PR, branch, Codex comment, commit or concrete activity;
8. identify issues with multiple overlapping Codex attempts;
9. identify open PRs touching the same files/modules or solving overlapping issues;
10. identify stale tasks that need `codex:follow-up` or `codex:blocked`;
11. apply the anti-idle rule whenever real active operational capacity is below 10/10;
12. identify non-colliding `codex:ready` or `codex:prompted` issues with no recent operative `@codex` invocation and recommend direct invocation;
13. recommend whether the queue should continue, pause or require human intervention.

Default queue limits:
- maximum active operational Codex tasks: 10, counted only from real active Codex work backed by a visible PR, visible branch with recent commit, reviewable diff/execution artifact or an in-progress invocation inside the stale-task grace window; explicit technical blockers are routed evidence, not active slots;
- maximum active task touching API/schema/migrations: 1 unless a human reviewer accepts the collision risk;
- maximum active task touching public copy/legal/methodological notes: 1 unless a human reviewer accepts the collision risk;
- do not start new tasks if root typecheck or build is failing because of a recent Codex PR.

Anti-idle rule:
- If real active operational capacity is below 10/10, promote safe technical tasks to `codex:ready` until the queue is full or record an explicit reason not to fill it. Valid reasons are absence of real eligible backlog, concrete file/module collision, legal/copy/methodological risk, CI instability, or a decision required from Giovanni before same-file/module work can proceed safely.
- Do not pause the whole pipeline merely because a PR is open, pending review, pending merge, or an issue is awaiting Giovanni review/merge; treat it as outside the queue unless it collides on files/modules or needs Codex-side rework.
- Do not classify a newly prepared `codex:prompted` issue as stalled merely because no PR exists yet. Treat it as awaiting invocation until an operative `@codex` invocation exists or the prompt is older than 60 minutes with no invocation or cleanup action.
- Prefer typecheck/build/lint/test failures, small bugs and limited technical-debt tasks.
- Do not promote unsafe/manual, accusatory, broad, generated-file or unclear tasks merely to fill the queue.
- Do not let stale blocker comments pause an issue when the cited PR, issue or dependency is closed, merged, resolved or explicitly superseded.
- Do not count `output-without-PR` summaries as active slots; route them to `codex:follow-up` and request a reviewable PR to `main` or a verifiable blocker with exact branch/ref/SHA details.
- Do not count explicit technical blockers as active slots after they are reported. Route them to `codex:blocked` or `codex:follow-up`, preserve exact blocker details, and release capacity.

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
- Real active operational tasks:
- Human review wait outside capacity (`codex:review-needed` / Giovanni review or merge):
- Concrete file/module collisions from review-wait items:
- Effective free slots (`10 - real active operational tasks`):
- Remaining safe capacity after collisions:

### Active tasks

### Collision risks

### Stale zombie tasks

### Fresh prompted issues inside grace window

### Anti-idle actions

### Direct Codex invocations

### Fast-lane candidates

### Recommended label changes

### Comment to post, if needed
```markdown
...
```
````
