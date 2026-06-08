# Codex issue automation protocol

This document defines the controlled automation protocol for using Codex on the Lamezia Trasparente Monitor backlog.

The objective is not to let Codex work indiscriminately on every open issue. The objective is to operate a controlled capacity-5 queue where issues are explored, converted into precise implementation prompts, assigned to Codex on dedicated branches, reviewed by humans through pull requests, and either routed to follow-up or recommended for closure after review.

## Core principle

Codex may work only on issues that have been explicitly marked as ready. Human review remains mandatory before merge and before closing an issue. Codex must not auto-merge pull requests and must not close issues directly.

Labels are nominal routing hints, not proof of active work. The source of truth for queue decisions is the derived operational state computed from labels plus verifiable evidence: latest `@codex` invocation, Codex response, branch/task evidence, linked PR status, explicit blocker, CI status, age of the last event and concrete file/module collision. Comments are operational evidence only while recent and consistent; they must not override labels when stale, contradictory, duplicated or explicitly superseded.

## Derived operational state

For every issue inspected by the queue governor, derive and record one operational state before counting capacity or deciding promotion:

| Derived state | Required evidence | Capacity effect |
| --- | --- | --- |
| `idle` | Open issue with no Codex routing label and no current Codex evidence. | Does not count. |
| `candidate` | `codex:candidate`, clear issue metadata or triage evidence, but not yet ready for invocation. | Does not count. |
| `ready` | `codex:ready` plus clean acceptance criteria and no active blocker. | Does **not** count; it is eligible backlog, not active work. |
| `invoked` | Recent `@codex` invocation or `codex:invoked` label inside the waiting window, with no terminal Codex answer yet. | Counts only while recent and unclassified. |
| `working` | Recent Codex branch/task/commit, running response, validation log or explicit in-progress evidence. | Counts while recent. |
| `pr-open` | Open linked Codex PR targeting `main`. | Counts only if Codex-side changes are still needed; otherwise it is human review wait. |
| `blocked` | Explicit unresolved blocker: permissions, secrets, unsafe scope, concrete collision, CI gate or human decision. | Counts only if the blocker is a recent Codex-side stop condition awaiting cleanup; otherwise it pauses the issue outside capacity. |
| `stale` | Nominal active label or old comment with no PR, branch, blocker, validation, diff or recent activity. | Does not count; route to stale cleanup. |
| `completed-by-pr` | Linked PR merged/closed with review evidence satisfying the issue or accepted follow-up. | Does not count; remove/neutralise active labels. |
| `superseded` | Later issue/PR/comment explicitly replaces this work. | Does not count; route to duplicate/supersession notes. |

Derived state must be based on verifiable evidence, not label names alone. The governor must list the evidence used, the evidence age and any uncertainty whenever it promotes, invokes, blocks or releases an issue.

## Capacity model

The Codex work queue has a controlled maximum capacity of **5 real active operational tasks**.

Count a slot as occupied only when at least one of these current evidence signals exists:

- an open Codex implementation PR linked to the issue that still requires Codex-side changes;
- a visible `codex/<issue-number>-<slug>` branch, task, commit, validation log or diff artifact with recent activity;
- a recent `@codex` invocation still inside the waiting window and not yet answered/classified;
- an explicit unresolved Codex-side blocker that still needs follow-up before the issue can be released;
- a recent Codex response that says work is in progress or gives an outcome not yet classified by review automation.

Do **not** count these as occupied slots:

- `codex:ready` by itself;
- `codex:candidate` by itself;
- PRs that are already merged or closed;
- `codex:review-needed` or PRs/issues waiting only for Giovanni review or merge;
- stale `codex:prompted`, `codex:invoked` or `codex:working` labels with no PR, branch, explicit blocker, validation log, diff location or recent Codex activity;
- summary-only `output-without-PR` comments.

`codex:review-needed` is a human review/merge wait state. It does **not** saturate the Codex work queue unless there is a concrete file/module collision with a candidate task or the same PR still needs Codex-side rework. A PR or issue waiting only for Giovanni's human review or merge is therefore outside the capacity count and blocks only new work that would touch the same files/modules or otherwise create an unresolved review conflict.

Effective free slots are calculated as `5 - real active Codex operational tasks`. Human-review-pending items, including `codex:review-needed` issues and PRs awaiting Giovanni's merge decision, are excluded from that arithmetic unless they become Codex-side rework or have a concrete file/module collision with the candidate work.

The governor must use all five real active slots when eligible low-collision backlog exists. A queue below 5/5 is healthy only when there is no real eligible backlog, a concrete file/module collision, legal/copy/methodological risk, CI instability, or a decision that must be made by Giovanni before parallel work on the affected files/modules is safe. Giovanni review/merge wait alone is not a reason to pause the whole pipeline.

## Promotion SLA and anti-idle rule

Every new or newly discovered issue must leave ambiguity during the same governor cycle. The governor must choose exactly one path:

1. add/confirm `codex:ready` and invoke Codex when the issue is mature, low-collision and capacity is available;
2. add/confirm `codex:candidate` when refinement is required but automation may be suitable;
3. mark or comment `blocked` when a concrete missing datum, unsafe scope, credential, source or decision prevents progress;
4. mark or comment `duplicate`/`superseded` when another issue or PR covers the work;
5. mark or comment `needs-human-decision` when Giovanni must decide before automation can proceed.

An issue must not remain merely created, noticed or labelled without one of those outcomes. If real active capacity is below target, a report-only governor pass is insufficient. The governor must do one of the following, in order, and document the evidence:

1. invoke a ready, non-colliding issue;
2. promote a mature, non-colliding candidate to ready and invoke it;
3. create a concrete micro-issue from an observed actionable maintenance need and invoke it;
4. record a verifiable reason why none of the first three actions is safe or possible.

Do not create filler issues or artificial saturation. The action must be tied to a real backlog item, a verified small maintenance need or a documented blocker.

## Collision matrix

Before preparing or invoking Codex, compare the candidate's likely files/modules against open PRs, recent Codex branches/tasks and recent Codex-side rework. Use this minimum matrix:

| Candidate vs active/review item | Risk | Required action |
| --- | --- | --- |
| Same generated files, API contract, DB schema/migrations or generated client packages. | High | Do not invoke unless a human explicitly accepts the collision; prefer block/follow-up. |
| Same runtime file/module, same prompt/doc section or same public copy/legal/methodological text. | High | Do not invoke; wait, split scope or request human decision. |
| Same package/domain but different files and compatible acceptance criteria. | Medium | Invoke only with a narrow scope and explicit collision note, or defer if review risk is unclear. |
| Different package/domain or documentation-only change outside touched sections. | Low | Invocation may proceed when other safeguards pass. |
| Human review PR touches unrelated files and needs no Codex-side rework. | Low for capacity, file-specific for collision | Exclude from capacity; block only candidates touching the same files/modules. |

Collision decisions must distinguish operational evidence from nominal labels and from human decisions still pending.

## Branch and pull request requirement

Every implementation prompt and invocation must require Codex to:

1. create a dedicated branch named `codex/<issue-number>-<slug>`;
2. commit changes on that branch;
3. open a pull request targeting `main`;
4. reference the issue in the PR description;
5. include changed files/modules, validation performed, residual limitations and safeguard impact in the PR description.

If Codex cannot open a pull request, it must comment on the issue with the exact technical reason and indicate the branch/diff location or the blocker that prevented branch or diff creation. Delivery without a PR is not a completed implementation state; it must be routed to `codex:follow-up` unless a human reviewer explicitly accepts another path.

A Codex summary without a reviewable PR is classified as `output-without-PR` unless it includes at least one of these concrete signals:

- an open pull request targeting `main`;
- a visible branch named `codex/<issue-number>-<slug>` with recent commits;
- an explicit technical blocker that explains why PR creation or branch/diff creation failed;
- recent evidence of execution, such as a concrete commit SHA, validation log, artifact or diff location that a reviewer can inspect.

`output-without-PR` does not count as a real active Codex slot, must not be treated as completed delivery and must not keep an issue in `codex:invoked`, `codex:prompted` or `codex:working` by itself. Route it to stale-task recovery with `codex:follow-up` unless a human reviewer confirms a valid branch, PR, blocker or reviewable diff.

## Suggested labels

- `codex:candidate` — issue may be considered for automation.
- `codex:ready` — issue is sufficiently clear and may enter the automated sequence.
- `codex:prompted` — an implementation prompt has been prepared.
- `codex:invoked` — Codex has been invoked on the issue.
- `codex:working` — Codex work or an implementation PR is in progress.
- `codex:review-needed` — a PR exists and is waiting for human review/merge; not queue-saturating unless there is a concrete collision or Codex-side rework.
- `codex:follow-up` — the issue needs clarification, additional work, stale-task recovery or a new issue.
- `codex:done` — acceptance criteria appear satisfied after review.
- `codex:blocked` — automation must not proceed.
- `codex:dangerous` — issue is sensitive and requires manual handling only.

## Comment hygiene and cleanup

Before any automation posts a new operational comment, it must inspect the existing issue thread and run a cleanup preflight.

The cleanup preflight must identify:

- placeholder comments, including comments containing only punctuation or filler text;
- queue-state comments that contradict the current labels;
- duplicate Codex prompts or duplicate blocker/follow-up comments;
- comments that tell later agents to ignore, reinterpret or bypass the label state;
- stale automation comments superseded by a later label transition or final prompt;
- stale blocker comments whose cited PR, issue or dependency is closed, merged, resolved or explicitly superseded.

When Codex opens a PR, reports a blocker, produces `output-without-PR`, or otherwise reaches an outcome, cleanup must also update or neutralise stale labels:

- remove or neutralise `codex:ready` when the issue is no longer eligible backlog because it was invoked, blocked, superseded or covered by a PR;
- prefer existing labels such as `codex:review-needed`, `codex:follow-up`, `codex:blocked` or `codex:done` instead of inventing new labels;
- if a useful state such as `codex:pr-open`, `codex:completed-by-pr`, `duplicate`, `superseded` or `needs-human-decision` has no repository label, document it in a short issue comment using that exact text as a fallback state;
- remove stale active labels when a PR is merged/closed, a blocker is resolved, or a newer branch/PR supersedes the attempt;
- never let a stale `codex:ready` label make an already served issue appear eligible again.

When the GitHub integration allows deletion, inappropriate automation comments should be deleted. When deletion is not available, the automation should update the comment body to a short neutral supersession note, for example: `Superseded during queue cleanup. Not operative; use current labels and the latest valid prompt/blocker only.`

Automation must not add a final Codex prompt on top of unresolved contradictory comments. Stale comments must not block an issue when the PR, issue or dependency cited as the blocker is closed, merged, resolved or explicitly superseded; the automation must neutralise the stale comment and proceed from the current labels. If cleanup cannot be completed, the correct outcome is to add `codex:follow-up` or `codex:blocked` and explain the cleanup obstacle. Do not use placeholder comments to test connectivity or reserve a comment slot.

At the end of cleanup, the issue thread must have at most one current operative comment for the current state: either one final Codex prompt, one blocker/follow-up comment, or one review-routing comment.

## Triage checklist for `output-without-PR`

Use this checklist whenever an issue has `codex:invoked`, `codex:prompted` or `codex:working` but no obvious reviewable PR. The goal is to distinguish real active work from a false active slot.

1. Check for an open pull request that references the issue, targets `main` and uses a `codex/<issue-number>-<slug>` branch.
2. If no PR exists, check whether the branch is visible and has recent commits that match the issue scope.
3. If no branch exists, check whether the latest Codex comment includes an explicit technical blocker, including the exact reason PR creation failed and any branch, diff or artifact location.
4. If no blocker exists, check for recent execution evidence: concrete commit SHA, validation output, artifact, patch location or other reviewer-inspectable activity.
5. If the only evidence is a summary or completion-style comment, classify the state as `output-without-PR`.
6. For `output-without-PR`, remove it from the real active capacity count, recommend `codex:follow-up`, and post or prepare a recovery comment requesting a new invocation with mandatory PR to `main` or an explicit blocker.
7. Do not promote the issue to `codex:review-needed`, `codex:done` or completion routing until a PR, branch, blocker or reviewable diff is verified.

Recovery comments must use neutral wording: the issue is stalled or missing reviewable evidence; do not imply bad faith by the agent or by project maintainers.

## Recommended sequence

### Automation 1 — Explore issue and prepare prompt

Frequency: every 15 minutes, or manually triggered.

Purpose:

1. identify the next open issue with `codex:ready` and without `codex:prompted`;
2. exclude issues with `codex:invoked`, `codex:working`, `codex:blocked` or `codex:dangerous`;
3. confirm that adding the issue would keep real active operational capacity at or below 5;
4. read title, body, labels, comments and linked context;
5. run the comment cleanup preflight before posting anything new;
6. classify the issue as technical, civic-methodological, UI/copy, data/API, or backlog/governance;
7. record minimum collision-control fields: probable scope, likely files/modules, and collision risk (`low`, `medium` or `high`);
8. generate a precise implementation prompt using the templates in `.github/codex-prompts/`;
9. require branch `codex/<issue-number>-<slug>` and a PR targeting `main` in the final prompt;
10. post the prompt as a GitHub comment only if the thread has no unresolved contradictory operational comments;
11. add `codex:prompted` only after a real operational prompt has been posted or an existing prompt has been updated into final form.

Safety rule: if the issue is ambiguous, potentially accusatory, legally sensitive, too broad, or the thread cannot be cleaned into a coherent state, the automation must add `codex:blocked` or `codex:follow-up` instead of preparing an implementation prompt.

### Automation 2 — Invoke Codex

Frequency: every 15 minutes, offset after Automation 1.

Purpose:

1. identify an issue with `codex:prompted` and without `codex:invoked`;
2. verify that exactly one current operative Codex prompt exists in the issue thread;
3. verify that invocation would keep real active operational capacity at or below 5;
4. refuse invocation if the thread contains unresolved contradictory prompt/blocker/status comments;
5. post the final `@codex` instruction or use the selected Codex integration;
6. require branch `codex/<issue-number>-<slug>`, commit, and PR targeting `main` as mandatory output;
7. include the stop condition that Codex must report the exact blocker if the PR, branch or reviewable diff cannot be created;
8. add `codex:invoked` and `codex:working`.

Safety rule: never invoke Codex on issues labelled `codex:blocked`, `codex:dangerous`, `needs:human-decision` or equivalent.

### Automation 3 — Review outcome and route issue

Frequency: every 15 minutes, offset after Automation 2.

Purpose:

1. identify issues with `codex:working`, linked pull requests or recent Codex comments;
2. check whether a pull request exists and targets `main` from a `codex/<issue-number>-<slug>` branch;
3. inspect whether the PR references the issue;
4. classify summary-only attempts with no PR, visible branch, explicit blocker or recent execution evidence as `output-without-PR`;
5. check whether the issue acceptance criteria appear satisfied;
6. route the issue to one of four outcomes:
   - `codex:review-needed` if a PR exists and needs human review;
   - `codex:follow-up` if no PR was opened, the delivery is incomplete, validation is failing, the task is stale, or the implementation is too broad;
   - `codex:blocked` if a safety or collision blocker prevents continuation;
   - `codex:done` only after review/merge evidence indicates the issue appears solved.

Stale-task rule: if an issue has `codex:invoked` or `codex:working` for more than 60 minutes with no PR, branch, Codex comment, commit or other concrete activity, move it to `codex:follow-up`, comment with the observed inactivity, and release operational capacity.

No-PR recovery rule: if an issue has `codex:prompted`, `codex:invoked` or `codex:working` and the only evidence is a Codex summary, classify it as `output-without-PR`, move it to `codex:follow-up`, request a new PR-to-`main` invocation or explicit blocker, and release operational capacity.

Fallback rule: if Codex reports that it could not open a PR, route to `codex:follow-up` unless the comment gives a concrete recoverable technical blocker that must become `codex:blocked`. The follow-up comment must preserve the exact technical reason and branch/diff or blocker information.

Safety rule: this automation must not close issues automatically unless a future explicit policy allows it. The current policy is to comment with a closure recommendation only.

### Automation 4 — Queue governor and collision control

Frequency: every 30–60 minutes, or before each automation cycle.

Purpose:

1. derive state for every inspected issue from labels plus evidence before capacity arithmetic;
2. count only real active Codex tasks against the capacity-5 limit;
3. explicitly exclude `codex:ready`, `codex:candidate`, `output-without-PR`, merged/closed PRs and human-review-only waits from saturation;
4. exclude `codex:review-needed` and PRs/issues awaiting Giovanni review or merge from saturation unless there is concrete file/module collision or Codex-side rework;
5. calculate effective free slots as `5 - real active Codex operational tasks`;
6. classify every new or newly discovered issue in the same cycle as ready-plus-invoked, candidate, blocked, duplicate/superseded or needs-human-decision;
7. detect duplicate work across issues and pull requests;
8. detect stale `codex:prompted`, `codex:invoked` or `codex:working` issues with no PR, branch, blocker or concrete activity;
9. detect `output-without-PR` summaries and exclude them from active capacity;
10. stop or slow promotion when CI fails repeatedly because of recent Codex work;
11. add `codex:blocked` where the automation must not continue;
12. apply stale-label cleanup whenever a PR, blocker, supersession or completed outcome means an issue is no longer eligible backlog;
13. invoke or prepare invocation for safe tasks whenever real active capacity is below 5/5 and eligible low-collision backlog exists.

Anti-idle rule: if real active operational capacity is below 5/5, the governor must not stop at a report when eligible backlog exists. It must, in order, invoke a ready non-colliding issue, promote and invoke a mature non-colliding candidate, create and invoke a concrete micro-issue from a verified maintenance need, or record a verifiable reason not to fill capacity. Valid reasons are absence of real eligible backlog, concrete file/module collision, legal/copy/methodological risk, CI instability, or a decision required from Giovanni before work on the same files/modules can proceed safely. Giovanni review/merge wait for non-colliding work must remain outside the queue and must not pause unrelated promotions. Prioritise typecheck/build/lint/test failures, small bugs and technical-debt tasks with low collision risk.

Collision-control minimum fields for every promotion, invocation, pause or block decision:

- probable scope;
- likely files/modules;
- collision risk: `low`, `medium` or `high`;
- evidence used and age;
- matrix outcome and required action.

This fourth automation is required for stable parallelism because the main risk is not prompt generation. The main risk is collision: multiple Codex tasks modifying the same files or creating overlapping pull requests.

## Technical fast lane

The governor may fast-lane tightly scoped technical tasks when capacity is available and collision risk is low. Suitable fast-lane examples include:

- typecheck, build, lint or test failures;
- small regressions with clear reproduction steps;
- limited technical-debt cleanups with no public civic-copy or methodology impact;
- package configuration or automation fixes that do not modify generated files.

Fast-lane tasks still require acceptance criteria, collision-control fields, dedicated branch, PR, validation notes, no auto-merge and no auto-close.

## Issue classes and default policy

| Issue class | Default policy |
| --- | --- |
| Technical bug/typecheck/build/lint/test | Suitable for fast lane when acceptance criteria are clear and collision risk is low. |
| UI/accessibility/metadata | Suitable for Codex with screenshots or route checklist; assess public route and accessibility risk. |
| Civic-methodological dashboard | Suitable only for v0, cautious copy, source notes and methodological caveats. |
| Copy/legal tone | Suitable for limited edits; requires human review. |
| Data/API/schema | Suitable only if source of truth and migration implications are clear. |
| Backlog/governance | Prefer analysis and triage comment, not direct implementation. |
| Potentially accusatory content | Manual handling only. |

## Closure policy

Default position: do not auto-close issues.

Recommended behaviour:

- if a PR is merged and the issue is clearly resolved, add `codex:done` and post a closure recommendation;
- if the PR partially resolves the issue, add `codex:follow-up` and propose a narrower follow-up issue;
- if the implementation is unsafe or off-scope, add `codex:blocked` and explain why.

## Minimum prompt contents

Every prompt prepared for Codex must include:

1. repository name;
2. issue number and title;
3. issue body summary;
4. objective;
5. acceptance criteria;
6. probable scope;
7. likely files or modules involved, if known;
8. collision risk (`low`, `medium` or `high`);
9. validation commands;
10. civic/legal/copy safeguards;
11. mandatory branch name `codex/<issue-number>-<slug>`;
12. mandatory PR requirement targeting `main`;
13. PR fallback instruction if the PR cannot be opened;
14. explicit stop condition requiring Codex to stop and report the exact blocker if it cannot open the PR or produce a reviewable branch/diff;
15. `output-without-PR` recovery rule for summaries without PR, branch, blocker or recent execution evidence;
16. confirmation that comment cleanup was completed or was unnecessary.

## Stop conditions

Codex or the automation must stop and ask for human decision when:

- acceptance criteria are missing;
- the task requires factual claims not supported by repository data;
- the change may imply allegations against persons or entities;
- implementation requires credentials or secrets;
- migrations, generated API packages or public data semantics would be changed without a clear source of truth;
- the same files are already touched by an open PR in a conflicting way;
- the issue thread contains unresolved contradictory automation comments or multiple active prompts;
- proceeding would exceed the capacity-5 real active operational queue or create medium/high collision risk without a human decision;
- Codex cannot open the mandatory PR to `main` and cannot provide a visible branch, reviewable diff or explicit technical blocker.
