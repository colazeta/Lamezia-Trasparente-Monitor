# Codex issue automation protocol

This document defines the controlled automation protocol for using Codex on the Lamezia Trasparente Monitor backlog.

The objective is not to let Codex work indiscriminately on every open issue. The objective is to operate a controlled capacity-10 queue where issues are explored, converted into precise implementation prompts, assigned to Codex on dedicated branches, reviewed by humans through pull requests, and either routed to follow-up or recommended for closure after review.

## Core principle

Codex may work only on issues that have been explicitly marked as ready. Human review remains mandatory before merge and before closing an issue. Codex must not auto-merge pull requests and must not close issues directly.

The source of truth for queue state is the issue label set. Comments are operational evidence, but they must not override labels when stale, contradictory, duplicated or explicitly superseded.

## Role separation and invocation mandate

Automations own issue preparation and Codex invocation only: they create useful issues, make them ready, keep prompts coherent and invoke Codex when the issue is eligible. Giovanni owns pull request review, merge decisions and issue closure decisions. Automations may inspect PRs only as evidence for labels, artifacts, validation state or concrete file/module collisions; they must not treat PR review or merge management as automation capacity.

When a non-colliding issue is labelled `codex:ready` or `codex:prompted`, has no recent operative `@codex` invocation, and would keep real active operational work within the capacity-10 limit, the automation should invoke Codex directly or complete the prompt-and-invoke sequence without waiting for unrelated open PRs, reviews or merges. Open PRs are informative signals for collision checks, not a queue-saturation metric and not a bottleneck for unrelated issue invocations.

## Capacity model

The Codex work queue has a controlled maximum capacity of **10 operational tasks**.

Operational tasks are issues in one of these states:

- `codex:prompted` waiting for immediate invocation;
- `codex:invoked`;
- `codex:working`;
- an open Codex implementation PR that still requires Codex-side changes.

`codex:review-needed` is a human review/merge wait state. It does **not** saturate the Codex work queue unless there is a concrete file/module collision with a candidate task or the same PR still needs Codex-side rework. A PR or issue waiting only for Giovanni's human review or merge is therefore outside the capacity count and blocks only new work that would touch the same files/modules or otherwise create an unresolved review conflict.

Effective free slots are calculated as `10 - real active Codex operational tasks`. Human-review-pending items, including `codex:review-needed` issues and PRs awaiting Giovanni's merge decision, are excluded from that arithmetic unless they become Codex-side rework or have a concrete file/module collision with the candidate work.

### No PR, no active slot

A Codex invocation counts as real active work only when at least one reviewer-verifiable artifact exists:

- an open pull request targeting `main`;
- a branch visible in GitHub with the exact ref and a recent commit SHA;
- a concrete diff or execution artifact that a reviewer can inspect;
- an in-progress Codex invocation that is still within the stale-task grace window defined below.

A generic operational summary without one of those artifacts is classified as `output-without-PR`. It must not saturate the capacity-10 queue, must be routed to `codex:follow-up`, and must receive a recovery comment asking Codex to open a reviewable PR or provide the exact verifiable blocker.

An explicit technical blocker is reviewable evidence, but it is **not active work**. Once Codex or an automation reports a precise blocker that prevents branch, diff or pull request creation, route the issue to `codex:blocked` or `codex:follow-up` according to recoverability, preserve the exact blocker details in the comment, and release the active slot. Do not keep the task in `codex:invoked` or `codex:working` merely because a blocker was reported.

### Fresh prompt and stale-task grace window

Do not classify a newly prepared issue as stale or `output-without-PR` before Codex has had a reasonable opportunity to act.

- `codex:prompted` means a prompt is prepared and waiting for invocation. It counts as operational capacity, but it must not be treated as a failed or stale implementation attempt until an operative `@codex` invocation exists or the prompt itself is older than 60 minutes with no invocation or cleanup action.
- `codex:invoked` and `codex:working` may be considered stale only after more than 60 minutes with no visible PR, branch, Codex comment, commit or other concrete activity.
- The 60-minute clock starts from the most recent operative event: prompt publication, Codex invocation, Codex status comment, branch push, commit, PR creation or explicit blocker report.
- If there is a recent operative event inside the grace window, record the issue as pending/in-progress rather than stale, and leave capacity accounting unchanged unless a concrete blocker has already released the slot.

The governor should use all ten real active slots when eligible low-collision backlog exists. A queue below 10/10 is healthy only when there is no real eligible backlog, a concrete file/module collision, legal/copy/methodological risk, CI instability, or a decision that must be made by Giovanni before parallel work on the affected files/modules is safe. Giovanni review/merge wait alone is not a reason to pause the whole pipeline.

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
3. confirm that adding the issue would keep real active operational capacity at or below 10;
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

1. identify an issue with `codex:prompted` and without `codex:invoked` or a recent operative `@codex` invocation;
2. verify that exactly one current operative Codex prompt exists in the issue thread;
3. verify that invocation would keep real active operational capacity at or below 10;
4. refuse invocation if the thread contains unresolved contradictory prompt/blocker/status comments;
5. post the final `@codex` instruction or use the selected Codex integration without waiting for unrelated PR review or merge activity;
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

Fresh-prompt rule: do not mark a just-prepared `codex:prompted` issue as stalled merely because no PR exists yet. It remains a prompt awaiting invocation until an operative `@codex` invocation is posted, or until the prompt is older than 60 minutes with no invocation or cleanup action.

Stale-task rule: if an issue has `codex:invoked` or `codex:working` for more than 60 minutes since the most recent operative event and still has no PR, branch, Codex comment, commit or other concrete activity, move it to `codex:follow-up`, comment with the observed inactivity, and release operational capacity.

Output-without-PR triage checklist:

1. verify whether GitHub shows an open PR targeting `main` for the issue branch;
2. verify whether GitHub shows the claimed `codex/<issue-number>-<slug>` branch;
3. if a branch is claimed, record the exact ref and latest commit SHA, or record that no such ref is visible;
4. inspect the latest Codex summary for a direct PR URL, branch ref, commit SHA, diff location or explicit technical blocker;
5. if none exists, classify the attempt as `output-without-PR`, move it to `codex:follow-up`, and release the active slot;
6. post a recovery comment requiring either a reviewable PR to `main` or a precise blocker with verifiable branch/diff/SHA details.

Fallback rule: if Codex reports that it could not open a PR, route to `codex:follow-up` unless the comment gives a concrete technical blocker that should become `codex:blocked`. The follow-up or blocker comment must preserve the exact technical reason and branch/diff or blocker information. A reported blocker is a review artifact, not an active slot: release capacity as soon as it is routed. If Codex claims a PR or branch exists but GitHub cannot verify it, treat the claim as `output-without-PR` until Codex provides the direct PR URL, exact ref and commit SHA, or a technical blocker.

Safety rule: this automation must not close issues automatically unless a future explicit policy allows it. The current policy is to comment with a closure recommendation only.

### Automation 4 — Queue governor and collision control

Frequency: every 30–60 minutes, or before each automation cycle.

Purpose:

1. count real active Codex tasks against the capacity-10 limit;
2. exclude `codex:review-needed` and PRs/issues awaiting Giovanni review or merge from saturation unless there is concrete file/module collision or Codex-side rework;
3. calculate effective free slots as `10 - real active Codex operational tasks`;
4. detect duplicate work across issues and pull requests;
5. detect stale `codex:invoked` or `codex:working` issues with no concrete activity for more than 60 minutes since the latest operative event, while exempting newly prepared `codex:prompted` issues that are still inside the 60-minute prompt/invocation grace window;
6. stop or slow promotion when CI fails repeatedly because of recent Codex work;
7. add `codex:blocked` where the automation should not continue;
8. promote safe tasks to `codex:ready` whenever real active capacity is below 10/10 and eligible low-collision backlog exists;
9. recommend direct Codex invocation for non-colliding `codex:ready` or `codex:prompted` issues with no recent operative `@codex` invocation.

Anti-idle rule: if real active operational capacity is below 10/10, the governor should promote safe technical tasks to `codex:ready` and surface eligible `codex:ready` or `codex:prompted` issues for direct invocation until the queue is full or it records an explicit reason not to fill it. Valid reasons are absence of real eligible backlog, concrete file/module collision, legal/copy/methodological risk, CI instability, or a decision required from Giovanni before work on the same files/modules can proceed safely. Giovanni review/merge wait for non-colliding work must remain outside the queue and must not pause unrelated promotions. Prioritise typecheck/build/lint/test failures, small bugs and technical-debt tasks with low collision risk.

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
- proceeding would exceed the capacity-10 real active operational queue or create medium/high collision risk without a human decision.
