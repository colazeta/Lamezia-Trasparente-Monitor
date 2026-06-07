# Codex issue automation protocol

This document defines the controlled automation protocol for using Codex on the Lamezia Trasparente Monitor backlog.

The objective is not to let Codex work indiscriminately on every open issue. The objective is to operate a controlled capacity-5 queue where issues are explored, converted into precise implementation prompts, assigned to Codex on dedicated branches, reviewed by humans through pull requests, and either routed to follow-up or recommended for closure after review.

## Core principle

Codex may work only on issues that have been explicitly marked as ready. Human review remains mandatory before merge and before closing an issue. Codex must not auto-merge pull requests and must not close issues directly.

The source of truth for queue state is the issue label set. Comments are operational evidence, but they must not override labels when stale, contradictory, duplicated or explicitly superseded.

## Capacity model

The Codex work queue has a controlled maximum capacity of **5 operational tasks**.

Operational tasks are issues in one of these states:

- `codex:prompted` waiting for immediate invocation;
- `codex:invoked`;
- `codex:working`;
- an open Codex implementation PR that still requires Codex-side changes.

`codex:review-needed` is a human review/merge wait state. It does **not** saturate the Codex work queue unless there is a concrete file/module collision with a candidate task or the same PR still needs Codex-side rework.

The governor should use all five slots when eligible low-collision backlog exists. A queue below 5/5 is healthy only when there is no real eligible backlog, a concrete file/module collision, legal/copy/methodological risk, CI instability, or a decision that must be made by Giovanni before parallel work is safe.

## Branch and pull request requirement

Every implementation prompt and invocation must require Codex to:

1. create a dedicated branch named `codex/<issue-number>-<slug>`;
2. commit changes on that branch;
3. open a pull request targeting `main`;
4. reference the issue in the PR description;
5. include changed files/modules, validation performed, residual limitations and safeguard impact in the PR description.

If Codex cannot open a pull request, it must comment on the issue with the exact technical reason and indicate the branch/diff location or the blocker that prevented branch or diff creation. Delivery without a PR is not a completed implementation state; it must be routed to `codex:follow-up` unless a human reviewer explicitly accepts another path.

## Suggested labels

- `codex:candidate` — issue may be considered for automation.
- `codex:ready` — issue is sufficiently clear and may enter the automated sequence.
- `codex:prompted` — an implementation prompt has been prepared.
- `codex:invoked` — Codex has been invoked on the issue.
- `codex:working` — Codex work or an implementation PR is in progress.
- `codex:review-needed` — a PR exists and is waiting for human review/merge; not queue-saturating unless there is a concrete collision or Codex-side rework.
- `codex:follow-up` — the issue needs clarification, additional work, stale-task recovery or a new issue.
- `codex:done` — acceptance criteria appear satisfied after review.
- `codex:blocked` — automation should not proceed.
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

When the GitHub integration allows deletion, inappropriate automation comments should be deleted. When deletion is not available, the automation should update the comment body to a short neutral supersession note, for example: `Superseded during queue cleanup. Not operative; use current labels and the latest valid prompt/blocker only.`

Automation must not add a final Codex prompt on top of unresolved contradictory comments. Stale comments must not block an issue when the PR, issue or dependency cited as the blocker is closed, merged, resolved or explicitly superseded; the automation should neutralise the stale comment and proceed from the current labels. If cleanup cannot be completed, the correct outcome is to add `codex:follow-up` or `codex:blocked` and explain the cleanup obstacle. Do not use placeholder comments to test connectivity or reserve a comment slot.

At the end of cleanup, the issue thread should have at most one current operative comment for the current state: either one final Codex prompt, one blocker/follow-up comment, or one review-routing comment.

## Recommended sequence

### Automation 1 — Explore issue and prepare prompt

Frequency: every 15 minutes, or manually triggered.

Purpose:

1. identify the next open issue with `codex:ready` and without `codex:prompted`;
2. exclude issues with `codex:invoked`, `codex:working`, `codex:blocked` or `codex:dangerous`;
3. confirm that adding the issue would keep operational capacity at or below 5;
4. read title, body, labels, comments and linked context;
5. run the comment cleanup preflight before posting anything new;
6. classify the issue as technical, civic-methodological, UI/copy, data/API, or backlog/governance;
7. record minimum collision-control fields: probable scope, likely files/modules, and collision risk (`low`, `medium` or `high`);
8. generate a precise implementation prompt using the templates in `.github/codex-prompts/`;
9. require branch `codex/<issue-number>-<slug>` and a PR targeting `main` in the final prompt;
10. post the prompt as a GitHub comment only if the thread has no unresolved contradictory operational comments;
11. add `codex:prompted` only after a real operational prompt has been posted or an existing prompt has been updated into final form.

Safety rule: if the issue is ambiguous, potentially accusatory, legally sensitive, too broad, or the thread cannot be cleaned into a coherent state, the automation should add `codex:blocked` or `codex:follow-up` instead of preparing an implementation prompt.

### Automation 2 — Invoke Codex

Frequency: every 15 minutes, offset after Automation 1.

Purpose:

1. identify an issue with `codex:prompted` and without `codex:invoked`;
2. verify that exactly one current operative Codex prompt exists in the issue thread;
3. verify that invocation would keep operational capacity at or below 5;
4. refuse invocation if the thread contains unresolved contradictory prompt/blocker/status comments;
5. post the final `@codex` instruction or use the selected Codex integration;
6. require branch `codex/<issue-number>-<slug>`, commit, and PR targeting `main` as mandatory output;
7. add `codex:invoked` and `codex:working`.

Safety rule: never invoke Codex on issues labelled `codex:blocked`, `codex:dangerous`, `needs:human-decision` or equivalent.

### Automation 3 — Review outcome and route issue

Frequency: every 15 minutes, offset after Automation 2.

Purpose:

1. identify issues with `codex:working`, linked pull requests or recent Codex comments;
2. check whether a pull request exists and targets `main` from a `codex/<issue-number>-<slug>` branch;
3. inspect whether the PR references the issue;
4. check whether the issue acceptance criteria appear satisfied;
5. route the issue to one of four outcomes:
   - `codex:review-needed` if a PR exists and needs human review;
   - `codex:follow-up` if no PR was opened, the delivery is incomplete, validation is failing, the task is stale, or the implementation is too broad;
   - `codex:blocked` if a safety or collision blocker prevents continuation;
   - `codex:done` only after review/merge evidence indicates the issue appears solved.

Stale-task rule: if an issue has `codex:invoked` or `codex:working` for more than 60 minutes with no PR, branch, Codex comment, commit or other concrete activity, move it to `codex:follow-up`, comment with the observed inactivity, and release operational capacity.

Fallback rule: if Codex reports that it could not open a PR, route to `codex:follow-up` unless the comment gives a concrete recoverable technical blocker that should become `codex:blocked`. The follow-up comment must preserve the exact technical reason and branch/diff or blocker information.

Safety rule: this automation must not close issues automatically unless a future explicit policy allows it. The current policy is to comment with a closure recommendation only.

### Automation 4 — Queue governor and collision control

Frequency: every 30–60 minutes, or before each automation cycle.

Purpose:

1. count operational Codex tasks against the capacity-5 limit;
2. exclude `codex:review-needed` from saturation unless there is concrete file/module collision or Codex-side rework;
3. detect duplicate work across issues and pull requests;
4. detect stale `codex:invoked` or `codex:working` issues with no concrete activity for more than 60 minutes;
5. stop or slow promotion when CI fails repeatedly because of recent Codex work;
6. add `codex:blocked` where the automation should not continue;
7. promote safe tasks to `codex:ready` whenever the queue is below 5/5 and eligible low-collision backlog exists.

Anti-idle rule: if operational capacity is below 5/5, the governor should promote safe technical tasks to `codex:ready` until the queue is full or it records an explicit reason not to fill it. Valid reasons are absence of real eligible backlog, concrete file/module collision, legal/copy/methodological risk, CI instability, or a decision required from Giovanni. Prioritise typecheck/build/lint/test failures, small bugs and technical-debt tasks with low collision risk.

Collision-control minimum fields for every promotion or pause decision:

- probable scope;
- likely files/modules;
- collision risk: `low`, `medium` or `high`.

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
| Copy/legal tone | Suitable for limited edits; should require human review. |
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

Every prompt prepared for Codex should include:

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
14. explicit stop condition;
15. confirmation that comment cleanup was completed or was unnecessary.

## Stop conditions

Codex or the automation should stop and ask for human decision when:

- acceptance criteria are missing;
- the task requires factual claims not supported by repository data;
- the change may imply allegations against persons or entities;
- implementation requires credentials or secrets;
- migrations, generated API packages or public data semantics would be changed without a clear source of truth;
- the same files are already touched by an open PR in a conflicting way;
- the issue thread contains unresolved contradictory automation comments or multiple active prompts;
- proceeding would exceed the capacity-5 operational queue or create medium/high collision risk without a human decision.
