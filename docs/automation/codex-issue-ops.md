# Codex issue automation protocol

This document defines the controlled automation protocol for using Codex on the Lamezia Trasparente Monitor backlog.

The objective is not to let Codex work indiscriminately on every open issue. The objective is to operate a controlled capacity-5 queue where issues are explored, converted into precise implementation prompts, assigned to Codex on dedicated branches, materialized through pull requests, validated by repository gates and routed either to trusted auto-merge, manual review/merge, follow-up or closure recommendation.

Merge routing is defined canonically in `docs/automation/trusted-auto-merge.md`.

## Core principle

Codex may work only on issues that have been explicitly marked as ready. Every implementation must use a reviewable branch and pull request; repository checks and the `Protect main` ruleset remain authoritative.

Human merge is **not** required for every routine Codex pull request. A same-repository, non-draft PR may be auto-merged by the repository's `Trusted PR auto-merge` workflow when its branch/diff is eligible, it carries no manual-review labels, it touches no protected path, it is up to date with `main`, and every required check succeeds.

Human review/merge remains mandatory for protected work and explicit manual cases, including workflow/CI/governance changes, protected deployment/auth/configuration paths, migrations/schema, and PRs carrying `manual-review`, `automerge:off` or `needs-human-review`.

Codex must never bypass or force merge gates, and it must not close issues directly unless a future explicit closure policy authorises that behaviour.

Labels are nominal routing hints, not proof of active work. The source of truth for queue decisions is the derived operational state computed from labels plus verifiable evidence: latest `@codex` invocation, Codex response, branch/task evidence, linked PR status, merge routing, CI status, age of the last event and concrete file/module collision. Comments are operational evidence only while recent and consistent; they must not override labels when stale, contradictory, duplicated or explicitly superseded.

## Derived operational state

For every issue inspected by the queue governor, derive and record one operational state before counting capacity or deciding promotion:

| Derived state | Required evidence | Capacity effect |
| --- | --- | --- |
| `idle` | Open issue with no Codex routing label and no current Codex evidence. | Does not count. |
| `candidate` | `codex:candidate`, clear issue metadata or triage evidence, but not yet ready for invocation. | Does not count. |
| `ready` | `codex:ready` plus clean acceptance criteria and no active blocker. | Does **not** count; it is eligible backlog, not active work. |
| `invoked` | Recent `@codex` invocation or `codex:invoked` label inside the waiting window, with no terminal Codex answer yet. | Counts only while recent and unclassified. |
| `working` | Recent Codex branch/task/commit, running response, validation log or explicit in-progress evidence. | Counts while recent. |
| `pr-open` | Open linked Codex PR targeting `main`. | Counts only if Codex-side changes are still needed. A PR waiting only for trusted checks/merge or actual human review is outside active Codex capacity. |
| `blocked` | Explicit unresolved blocker: permissions, secrets, unsafe scope, concrete collision, CI gate or human decision. | Counts only if the blocker is a recent Codex-side stop condition awaiting cleanup; otherwise it pauses the issue outside capacity. |
| `stale` | Nominal active label or old comment with no PR, branch, blocker, validation, diff or recent activity. | Does not count; route to stale cleanup. |
| `completed-by-pr` | Linked PR merged/closed with evidence satisfying the issue or accepted follow-up. | Does not count; remove/neutralise active labels. |
| `superseded` | Later issue/PR/comment explicitly replaces this work. | Does not count; route to duplicate/supersession notes. |

Derived state must be based on verifiable evidence, not label names alone. The governor must list the evidence used, evidence age and any uncertainty whenever it promotes, invokes, blocks or releases an issue.

### Canonical operational vocabulary

Use these exact state names in handoffs, queue reports and materialization comments when they apply: `pr-open`, `ready-for-human-merge`, `needs-rebase`, `ci-pending`, `ci-failed`, `review-needed`, `scope-risk`, `complete-diff-provided`, `small-file-bundle-complete`, `fallback-bundle-incomplete`, `output-without-PR`, `invalid-output`, `local-only`, `manual-ui-recoverable`, `split-required`, `blocked-stable`, `needs-human-decision`, `superseded`, `duplicate` and `archivable`.

The queue governor may keep the compact derived states above for capacity arithmetic, but comments and handoffs must include the canonical state where it is more precise. Do not invent near-synonyms such as `patch-available` when the published fallback contains truncation markers.

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
- `codex:review-needed` or PRs/issues waiting only for Giovanni review or manual merge;
- trusted-auto-merge-eligible PRs waiting only for branch refresh, required checks or merge execution when no Codex-side changes remain;
- stale `codex:prompted`, `codex:invoked` or `codex:working` labels with no PR, branch, explicit blocker, validation log, diff location or recent Codex activity;
- summary-only `output-without-PR` comments.

`codex:review-needed` is a real human-review/merge wait state and must be applied only when human review is actually required. It does not saturate the Codex work queue unless there is a concrete file/module collision with a candidate task or the same PR still needs Codex-side rework.

A trusted PR waiting only for required checks or automatic merge is likewise outside active Codex capacity. Required checks are merge gates, not Codex work, once implementation is complete.

Effective free slots are calculated as `5 - real active Codex operational tasks`. Human-review-pending and trusted-check-wait items are excluded from that arithmetic unless they become Codex-side rework or create a concrete file/module collision.

The governor must use all five real active slots when eligible low-collision backlog exists. A queue below 5/5 is healthy only when there is no real eligible backlog, a concrete file/module collision, legal/copy/methodological risk, CI instability, or a decision that must be made by Giovanni before parallel work on the affected files/modules is safe. Review/merge wait for non-colliding work is not a reason to pause the whole pipeline.

### Materialization debt gate

Before applying anti-idle promotion, count open issues and PRs carrying any materialization-debt state or label: `materialization:required`, `fallback-bundle-incomplete`, `output-without-PR`, `invalid-output`, `local-only` or `needs-materialization-verification`.

If the count is **greater than 5**, ordinary technical and platform invocations are blocked. The only permitted queue actions are materialization verification, complete-diff or complete-bundle application, manual UI/export recovery classification, split-required classification, blocker stabilization, PR rebase/recovery/supersede triage, and stale active-label cleanup. Do not create new ordinary technical issues, do not post new ordinary `@codex` prompts and do not fill empty slots via anti-idle while this gate is active.

Debt-gated reports must include the debt count, labels/states counted, query/page scope inspected, allowed cleanup action chosen, and any real PRs needing rebase, human decision or merge-routing intervention.

## Promotion SLA and anti-idle rule

Every new or newly discovered issue must leave ambiguity during the same governor cycle. The governor must choose exactly one path:

1. add/confirm `codex:ready` and invoke Codex when the issue is mature, low-collision and capacity is available;
2. add/confirm `codex:candidate` when refinement is required but automation may be suitable;
3. mark or comment `blocked` when a concrete missing datum, unsafe scope, credential, source or decision prevents progress;
4. mark or comment `duplicate`/`superseded` when another issue or PR covers the work;
5. mark or comment `needs-human-decision` when Giovanni must decide before automation can proceed.

An issue must not remain merely created, noticed or labelled without one of those outcomes. If real active capacity is below target, a report-only governor pass is insufficient. The governor must, in order:

1. invoke a ready, non-colliding issue;
2. promote a mature, non-colliding candidate to ready and invoke it;
3. create a concrete micro-issue from an observed actionable maintenance need and invoke it;
4. record a verifiable reason why none of the first three actions is safe or possible.

Do not create filler issues or artificial saturation. The action must be tied to a real backlog item, a verified small maintenance need or a documented blocker.

## Collision matrix

Before preparing or invoking Codex, compare the candidate's likely files/modules against open PRs, recent Codex branches/tasks and recent Codex-side rework.

| Candidate vs active/review item | Risk | Required action |
| --- | --- | --- |
| Same generated files, API contract, DB schema/migrations or generated client packages. | High | Do not invoke unless a human explicitly accepts the collision; prefer block/follow-up. |
| Same runtime file/module, same prompt/doc section or same public copy/legal/methodological text. | High | Do not invoke; wait, split scope or request human decision. |
| Same package/domain but different files and compatible acceptance criteria. | Medium | Invoke only with a narrow scope and explicit collision note, or defer if review risk is unclear. |
| Different package/domain or documentation-only change outside touched sections. | Low | Invocation may proceed when other safeguards pass. |
| Manual-review or trusted-check-wait PR touches unrelated files and needs no Codex-side rework. | Low for capacity, file-specific for collision | Exclude from capacity; block only candidates touching the same files/modules. |

Collision decisions must distinguish operational evidence from nominal labels and from merge-routing state.

## Branch and pull request requirement

Every implementation prompt and invocation must require Codex to:

1. create a dedicated branch named `codex/<issue-number>-<slug>`;
2. commit changes on that branch;
3. open a pull request targeting `main`;
4. reference the issue in the PR description;
5. include changed files/modules, validation performed, residual limitations and safeguard impact in the PR description;
6. avoid force-merging, administrative bypass or direct writes to `main`;
7. leave merge execution to the repository policy described below.

If Codex cannot open a pull request, it must comment on the issue with the exact technical reason and indicate the branch/diff location or the blocker that prevented branch or diff creation. Delivery without a PR is not a completed implementation state; it must be routed to `codex:follow-up` unless a human reviewer explicitly accepts another path.

A Codex summary without a reviewable PR is classified as `output-without-PR` unless it includes at least one of these concrete signals:

- an open pull request targeting `main`;
- a visible branch named `codex/<issue-number>-<slug>` with recent commits;
- an explicit technical blocker that explains why PR creation or branch/diff creation failed;
- recent evidence of execution, such as a concrete commit SHA, validation log, artifact or diff location that a reviewer can inspect.

`output-without-PR` does not count as a real active Codex slot, must not be treated as completed delivery and must not keep an issue in `codex:invoked`, `codex:prompted` or `codex:working` by itself. Route it to stale-task recovery with `codex:follow-up` unless a human reviewer confirms a valid branch, PR, blocker or reviewable diff.

## Merge-routing policy

The executable source of truth is `.github/workflows/trusted-auto-merge.yml`; the canonical explanatory policy is `docs/automation/trusted-auto-merge.md`.

A PR may be eligible for trusted auto-merge only when it is same-repository, non-draft, targets `main`, belongs to a trusted branch family or carries `automerge:allow`, contains no protected path, carries no manual-review label, can be refreshed from `main`, and passes all required checks.

Merge-routing labels:

- `automerge:allow` — opt-in eligibility for an otherwise non-allowlisted routine branch; never a bypass;
- `automerge:off` — manual merge;
- `manual-review` — manual review/merge;
- `needs-human-review` — human review/merge required.

`automerge:off`, `manual-review` and `needs-human-review` override `automerge:allow`.

Protected paths always remain manual. The current protected families include workflow/automation governance, `.agents`, dependency manifests/lockfiles, environment files, Wrangler/deploy configuration, Vite configuration, migrations/Drizzle, Clerk/auth paths, semantic architecture documentation and semantic API contract paths. Consult the workflow for the exact matcher.

Auto-merge is fail-closed. Conflicts, branch-refresh failure, required-check failure, missing required contexts, inability to observe the refreshed head SHA, or inability to release expected bot-triggered required workflow runs leave the PR open.

The workflow may approve only expected bot-triggered required runs for the refreshed head SHA; it does not approve code reviews, waive checks or bypass the ruleset.

## Suggested labels

Codex queue labels:

- `codex:candidate` — issue may be considered for automation;
- `codex:ready` — issue is sufficiently clear and may enter the automated sequence;
- `codex:prompted` — an implementation prompt has been prepared;
- `codex:invoked` — Codex has been invoked;
- `codex:working` — Codex work or Codex-side PR rework is in progress;
- `codex:review-needed` — a PR specifically requires human review/merge; do not apply merely because it is a Codex PR;
- `codex:follow-up` — clarification, stale-task recovery or additional work is needed;
- `codex:done` — acceptance criteria appear satisfied after verified completion evidence;
- `codex:blocked` — automation must not proceed;
- `codex:dangerous` — manual handling only because the issue is sensitive.

Merge-routing labels are documented in `docs/automation/codex-labels.md` and `docs/automation/trusted-auto-merge.md`.

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
- apply `codex:review-needed` only when the PR actually needs human review/merge;
- prefer existing labels such as `codex:follow-up`, `codex:blocked` or `codex:done` instead of inventing new labels;
- if a useful state such as `codex:pr-open`, `codex:completed-by-pr`, `duplicate`, `superseded` or `needs-human-decision` has no repository label, document it in a short issue comment using that exact text as a fallback state;
- remove stale active labels when a PR is merged/closed, a blocker is resolved, or a newer branch/PR supersedes the attempt;
- never let a stale `codex:ready` label make an already served issue appear eligible again.

When the GitHub integration allows deletion, inappropriate automation comments should be deleted. When deletion is not available, update the comment body to a short neutral supersession note.

Automation must not add a final Codex prompt on top of unresolved contradictory comments. Stale comments must not block an issue when the dependency they cite is closed, merged, resolved or explicitly superseded. If cleanup cannot be completed, add `codex:follow-up` or `codex:blocked` and explain the obstacle. Do not use placeholder comments to test connectivity or reserve a comment slot.

At the end of cleanup, the issue thread must have at most one current operative comment for the current state: one final Codex prompt, one blocker/follow-up comment, or one review-routing comment.

## Triage checklist for `output-without-PR`

Use this checklist whenever an issue has `codex:invoked`, `codex:prompted` or `codex:working` but no obvious reviewable PR:

1. check for an open PR that references the issue, targets `main` and uses a `codex/<issue-number>-<slug>` branch;
2. if no PR exists, check whether the branch is visible and has recent commits matching the issue scope;
3. if no branch exists, check whether the latest Codex comment includes an explicit technical blocker and any branch/diff/artifact location;
4. if no blocker exists, check for recent execution evidence: concrete commit SHA, validation output, artifact, patch location or other reviewer-inspectable activity;
5. if the only evidence is a summary or completion-style comment, classify the state as `output-without-PR`;
6. for `output-without-PR`, remove it from real active capacity, recommend `codex:follow-up`, and request a new invocation with mandatory PR to `main` or an explicit blocker;
7. do not promote to `codex:review-needed`, `codex:done` or completion routing until a PR, branch, blocker or reviewable diff is verified.

Recovery comments must use neutral wording and must not imply bad faith by the agent or project maintainers.

## Recommended sequence

### Automation 1 — Explore issue and prepare prompt

Frequency: every 15 minutes, or manually triggered.

Purpose:

1. identify the next open issue with `codex:ready` and without `codex:prompted`;
2. exclude issues with `codex:invoked`, `codex:working`, `codex:blocked` or `codex:dangerous`;
3. confirm that adding the issue would keep real active operational capacity at or below 5;
4. read title, body, labels, comments and linked context;
5. run the comment cleanup preflight;
6. classify the issue as technical, civic-methodological, UI/copy, data/API, backlog/governance or manual;
7. record probable scope, likely files/modules and collision risk;
8. generate a precise implementation prompt using `.github/codex-prompts/`;
9. require branch `codex/<issue-number>-<slug>` and a PR targeting `main`;
10. classify expected merge routing as trusted-auto-merge eligible, manual-review, or unknown until diff;
11. post the prompt only if thread cleanup and the materialization debt gate pass;
12. add `codex:prompted` only after a real operational prompt has been posted or updated into final form.

Safety rule: if the issue is ambiguous, potentially accusatory, legally sensitive, too broad, or the thread cannot be cleaned into a coherent state, add `codex:blocked` or `codex:follow-up` instead of preparing an implementation prompt.

### Automation 2 — Invoke Codex

Frequency: every 15 minutes, offset after Automation 1.

Purpose:

1. identify an issue with `codex:prompted` and without `codex:invoked`;
2. verify exactly one current operative Codex prompt exists;
3. verify invocation would keep real active operational capacity at or below 5;
4. refuse invocation if the thread contains unresolved contradictory prompt/blocker/status comments;
5. post the final `@codex` instruction or use the selected Codex integration;
6. require branch `codex/<issue-number>-<slug>`, commit and PR targeting `main` as mandatory output;
7. tell Codex not to force/bypass merge; repository merge routing applies after PR creation;
8. require exact blocker reporting if PR, branch or reviewable diff cannot be created;
9. add `codex:invoked` and `codex:working`.

Safety rule: never invoke Codex on issues labelled `codex:blocked`, `codex:dangerous`, `needs-human-decision` or equivalent.

### Automation 3 — Review outcome and route issue

Frequency: every 15 minutes, offset after Automation 2.

Purpose:

1. identify issues with `codex:working`, linked PRs or recent Codex comments;
2. verify that any PR targets `main` from a `codex/<issue-number>-<slug>` branch and references the issue;
3. classify summary-only attempts with no PR, visible branch, explicit blocker or recent execution evidence as `output-without-PR`;
4. check whether acceptance criteria appear satisfied and validation is adequate;
5. classify merge routing from actual labels and changed files;
6. route the issue to one of these outcomes:
   - `pr-open` / trusted-check-wait if a routine PR is eligible for trusted auto-merge and no Codex-side work remains;
   - `codex:review-needed` if protected paths, manual labels, sensitive scope or another concrete gate requires human review/merge;
   - `codex:follow-up` if no PR exists, delivery is incomplete, validation is failing, the task is stale, or implementation is too broad;
   - `codex:blocked` if a safety or collision blocker prevents continuation;
   - `codex:done` only after verified merge/review evidence indicates the issue appears solved.

Stale-task rule: if an issue has `codex:invoked` or `codex:working` for more than 60 minutes with no PR, branch, Codex comment, commit or other concrete activity, move it to `codex:follow-up`, comment with observed inactivity, and release operational capacity.

No-PR recovery rule: if an issue has `codex:prompted`, `codex:invoked` or `codex:working` and the only evidence is a Codex summary, classify it as `output-without-PR`, move it to `codex:follow-up`, request a new PR-to-`main` invocation or explicit blocker, and release operational capacity.

Fallback rule: if Codex reports that it could not open a PR, route to `codex:follow-up` unless the comment gives a concrete recoverable technical blocker that must become `codex:blocked`. Preserve the exact reason and branch/diff or blocker information.

Safety rule: this automation must not close issues automatically unless a future explicit policy allows it. The current policy is to comment with a closure recommendation only.

### Automation 4 — Queue governor and collision control

Frequency: every 30–60 minutes, or before each automation cycle.

Purpose:

1. derive state for every inspected issue from labels plus evidence before capacity arithmetic;
2. count only real active Codex tasks against the capacity-5 limit;
3. explicitly exclude `codex:ready`, `codex:candidate`, `output-without-PR`, merged/closed PRs, trusted-check-wait PRs and human-review-only waits from saturation;
4. calculate effective free slots as `5 - real active Codex operational tasks`;
5. classify every new or newly discovered issue in the same cycle as ready-plus-invoked, candidate, blocked, duplicate/superseded or needs-human-decision;
6. detect duplicate work across issues and PRs;
7. detect stale `codex:prompted`, `codex:invoked` or `codex:working` issues with no PR, branch, blocker or concrete activity;
8. detect `output-without-PR` summaries and exclude them from active capacity;
9. classify merge routing for open PRs where possible;
10. stop or slow promotion when CI fails repeatedly because of recent Codex work;
11. add `codex:blocked` where automation must not continue;
12. apply stale-label cleanup whenever a PR, blocker, supersession or completed outcome means an issue is no longer eligible backlog;
13. invoke or prepare invocation for safe tasks whenever real active capacity is below 5/5, eligible low-collision backlog exists and materialization debt is not gated;
14. if materialization debt is greater than 5, pause ordinary promotion and choose only materialization verification, recovery, split, blocker, stale-label cleanup or PR rebase/recovery/supersede action.

Anti-idle rule: if materialization debt is 5 or fewer and real active operational capacity is below 5/5, the governor must not stop at a report when eligible backlog exists. In order, invoke a ready non-colliding issue, promote and invoke a mature non-colliding candidate, create and invoke a concrete micro-issue from a verified maintenance need, or record a verifiable reason not to fill capacity. Valid reasons are absence of real eligible backlog, concrete file/module collision, legal/copy/methodological risk, CI instability, or a decision required from Giovanni before same-file/module work can proceed safely.

Collision-control minimum fields for every promotion, invocation, pause or block decision:

- probable scope;
- likely files/modules;
- collision risk: `low`, `medium` or `high`;
- evidence used and age;
- matrix outcome and required action.

## Technical fast lane

The governor may fast-lane tightly scoped technical tasks when capacity is available and collision risk is low. Suitable examples include:

- typecheck, build, lint or test failures;
- small regressions with clear reproduction steps;
- limited technical-debt cleanups with no public civic-copy or methodology impact;
- package configuration or automation fixes that do not modify generated files.

Fast-lane tasks still require acceptance criteria, collision-control fields, dedicated branch, PR and validation notes. They must not auto-close issues. Merge routing follows the trusted policy: eligible routine PRs may auto-merge through the repository workflow; protected/manual PRs remain human-gated.

## Issue classes and default policy

| Issue class | Default policy |
| --- | --- |
| Technical bug/typecheck/build/lint/test | Suitable for fast lane when acceptance criteria are clear and collision risk is low. |
| UI/accessibility/metadata | Suitable for Codex with screenshots or route checklist; assess public route and accessibility risk. |
| Civic-methodological dashboard | Suitable only for v0, cautious copy, source notes and methodological caveats. |
| Copy/legal tone | Suitable for limited edits; normally route to explicit human review when judgement is material. |
| Data/API/schema | Suitable only if source of truth and migration implications are clear; protected schema/migration paths remain manual. |
| Backlog/governance | Prefer analysis and triage comment; implementation touching governance paths remains manual-review. |
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
13. expected merge routing when it can be predicted: trusted-auto-merge eligible, manual-review, or unknown until diff;
14. explicit instruction not to force/bypass merge and to leave merge execution to repository policy;
15. PR fallback instruction if the PR cannot be opened;
16. explicit stop condition requiring Codex to report the exact blocker if it cannot open the PR or produce a reviewable branch/diff;
17. `output-without-PR` recovery rule for summaries without PR, branch, blocker or recent execution evidence;
18. confirmation that comment cleanup was completed or was unnecessary.

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
- Codex cannot open the mandatory PR to `main` and cannot provide a visible branch, reviewable diff or explicit technical blocker;
- merge would require bypassing protected paths, explicit manual-review labels, conflicts, required checks or the `Protect main` ruleset.
