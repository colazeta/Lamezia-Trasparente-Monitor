# Codex automation label policy

This file defines the intended label taxonomy for the controlled Codex issue workflow.

The labels are not merely cosmetic, but they are still nominal routing hints. Automation must derive the operational state from labels plus verifiable evidence before counting slots or deciding promotion.

## State labels

| Label | Meaning | Queue effect | Who/what may add it |
| --- | --- | --- | --- |
| `codex:candidate` | The issue may be suitable for Codex after triage. | Candidate only; not operational. | Human, scouting automation or queue-governor automation. |
| `codex:ready` | The issue has passed queue-governor triage and is clear enough to enter the automated queue. | Eligible for operation but not active until prompted/invoked. | Queue-governor automation or human reviewer. |
| `codex:prompted` | A Codex-ready prompt has been generated and posted. | Operational only while it has a current prompt and is awaiting invocation; if later evidence is only `output-without-PR`, route to follow-up and release capacity. | Automation 1. |
| `codex:invoked` | Codex has been invoked. | Operational only with recent execution evidence, a visible branch, an open PR or an explicit blocker; a summary alone is `output-without-PR` and does not count. | Automation 2. |
| `codex:working` | Codex work or an implementation PR is in progress. | Operational only while backed by a reviewable PR/branch, recent execution evidence or Codex-side rework; otherwise route to follow-up. | Automation 2 or review automation. |
| `codex:review-needed` | A PR exists and requires human review/merge. | Human review wait; does not saturate Codex capacity unless there is concrete file/module collision or Codex-side rework. | Automation 3. |
| `codex:follow-up` | The issue needs additional work, clarification, stale-task recovery or a new issue. | Releases operational capacity unless re-promoted. | Automation 3 or human reviewer. |
| `codex:done` | The issue appears resolved after review. | Not operational. | Automation 3 or human reviewer. |
| `codex:blocked` | The automation must not continue. | Blocks automation and releases operational capacity. | Any safety check or human reviewer. |
| `codex:dangerous` | Manual handling only because the issue is legally, reputationally or methodologically sensitive. | Blocks automation. | Human reviewer or queue-governor automation. |

## Classification labels

| Label | Meaning | Automation treatment |
| --- | --- | --- |
| `area:technical-debt` | Typecheck, build, lint, test, configuration, package structure and small technical cleanup. | Fast-lane candidate when scoped, low-collision and non-generated. |
| `area:ui-accessibility` | Public routes, metadata, semantic structure, accessibility, mobile rendering. | Suitable with route checklist and screenshot/notes when UI changes. |
| `area:civic-methodology` | Indicators, dashboards, source coverage, data quality, interpretability. | Stricter review; preserve caveats and source limitations. |
| `area:copy-legal-tone` | Wording, legal notes, disclaimers, non-accusatory tone. | Stricter review; avoid any implication of wrongdoing. |
| `area:data-api` | API, schema, ingestion, OpenAPI, database, generated packages. | Strict source-of-truth checks; do not edit generated files manually. |
| `area:backlog-governance` | Issue consolidation, roadmap, prioritisation, project structure. | Prefer triage comments unless implementation is explicitly scoped. |

## Priority labels

| Label | Meaning |
| --- | --- |
| `priority:low` | Useful refinement, no immediate blocker. |
| `priority:medium` | Should be solved in normal backlog order. |
| `priority:high` | Important for public quality, correctness or safety. |
| `priority:critical` | Blocks build, deployment, public safety or legal/methodological reliability. |

## Materialization debt labels

These labels and canonical states define materialization debt for queue control: `materialization:required`, `fallback-bundle-incomplete`, `output-without-PR`, `invalid-output`, `local-only` and `needs-materialization-verification`.

When more than 5 open issues or PRs carry materialization debt, queue governance must pause new ordinary technical/platform invocations. The only allowed actions are PR/branch/SHA verification, complete-diff or complete-bundle materialization, manual UI/export recovery classification, split-required classification, blocker stabilization, stale active-label cleanup, and no-merge/no-approval PR rebase/recovery/supersede handoff.

Do not use `codex:ready`, `codex:prompted`, `codex:invoked` or `codex:working` to hide materialization debt. If the published fallback contains truncation markers, classify it as `fallback-bundle-incomplete` and `output-without-PR`, not as patch-available.

## Operational groups

- **Candidate/triage states:** `codex:candidate`, `codex:ready`. These are nominal routing hints and never consume operational capacity by themselves.
- **Operational states that can saturate capacity:** real active Codex work: `codex:prompted`, `codex:invoked`, `codex:working`, and open Codex PRs that still need Codex-side changes. A label alone is not enough: count only when a recent invocation, branch/task/commit, validation log, diff, open PR needing Codex-side changes, explicit blocker or in-progress Codex response exists. Summaries without PR, visible branch, explicit blocker or recent execution evidence are `output-without-PR` and are excluded from capacity.
- **Human review wait:** `codex:review-needed` and PRs/issues waiting only for Giovanni review or merge; these are outside the capacity count unless there is concrete file/module collision or Codex-side rework.
- **Follow-up/blocking states:** `codex:follow-up`, `codex:blocked`, `codex:dangerous`.
- **Completion state:** `codex:done`, which must not be used to auto-close an issue.

## Capacity, derived state and collision guardrails

- The operational queue has maximum capacity 5, computed only on real active Codex work. Effective free slots are `5 - real active Codex operational tasks`.
- Materialization debt greater than 5 overrides anti-idle promotion: empty capacity must remain unused for ordinary work until debt is 5 or fewer or a human declares an urgent exception.
- Before counting capacity, derive one state per issue from evidence: `idle`, `candidate`, `ready`, `invoked`, `working`, `pr-open`, `blocked`, `stale`, `completed-by-pr` or `superseded`. Labels are inputs to this state, not proof by themselves.
- `codex:ready` is the only label that starts the queue, but it is not work in progress. `codex:ready` is eligible backlog and must never be counted as an occupied slot.
- `codex:ready` is assigned by the queue-governor automation after checking priority, scope, acceptance criteria, active queue saturation and possible overlap with open PRs.
- Every promotion, invocation, pause or block decision must include minimum collision-control fields:
  - probable scope;
  - likely files/modules;
  - collision risk: `low`, `medium` or `high`;
  - evidence used and age of the evidence.
- Collision matrix: high risk means same generated files, API contract, DB schema/migrations, generated clients, runtime file/module, prompt/doc section or public copy/legal/methodological text; medium risk means same package/domain with distinct files and compatible criteria; low risk means unrelated files/modules or unrelated human-review PRs needing no Codex-side rework.
- High collision blocks invocation unless a human explicitly accepts the risk. Medium collision requires a narrow prompt and explicit collision note. Low collision may proceed when other safeguards pass.
- The queue governor must not treat `codex:review-needed` or Giovanni review/merge wait as saturation unless a concrete file/module collision exists or the PR needs Codex-side rework.
- Pending Giovanni review/merge blocks only candidate work touching the same files/modules or creating a concrete review conflict; it must not stop unrelated queue promotion.
- If real active operational capacity is below 5/5, the queue governor must apply the anti-idle rule: invoke a ready non-colliding issue, promote and invoke a mature non-colliding candidate, create and invoke a concrete micro-issue, or record a verifiable reason why none is safe or possible. A report without action is insufficient when eligible backlog exists.
- Fast-lane candidates include typecheck/build/lint/test failures, small bugs and limited technical-debt tasks with clear acceptance criteria and low collision risk.
- Issues labelled `codex:invoked`, `codex:prompted` or `codex:working` must be checked for no-PR false-active evidence before they are counted against capacity.
- New or newly discovered issues must be classified during the same governor cycle as `codex:ready` plus invocation, `codex:candidate`, blocked, duplicate/superseded or needing a human decision.

## Automation guardrails

- Labels are nominal routing hints; derived operational state from labels plus evidence is the source of truth for queue decisions. Stale comments must not override current evidence. Comments that cite a blocker PR, issue or dependency must not block work after that blocker is closed, merged, resolved or explicitly superseded.
- After a PR, blocker, stale output or supersession is found, remove or neutralise stale `codex:ready`, `codex:prompted`, `codex:invoked` or `codex:working` labels so served issues do not re-enter the candidate pool. If labels such as `codex:pr-open`, `codex:completed-by-pr`, `duplicate`, `superseded` or `needs-human-decision` do not exist, use a short issue comment with that fallback state instead of inventing labels.
- Before `codex:prompted` is added, Automation 1 must confirm that the issue thread contains no unresolved contradictory, duplicated or placeholder automation comments.
- If contradictory comments cannot be removed or neutralised, the issue must receive `codex:follow-up` or `codex:blocked`, not `codex:prompted`.
- `codex:dangerous` always overrides `codex:ready`.
- `codex:blocked` always pauses the issue.
- `area:copy-legal-tone`, `area:civic-methodology` and `area:data-api` require stricter review.
- `area:backlog-governance` generally produces triage comments, not direct code changes.
- Issues must not move from `codex:working` to `codex:done` without evidence of a PR, validation or explicit reviewer confirmation.
- Issues with `codex:invoked` or `codex:working` for more than 60 minutes and no PR, branch, Codex comment, commit or other concrete activity must move to `codex:follow-up` and release operational capacity.
- A Codex summary without an open PR targeting `main`, a visible branch with recent commits, an explicit technical blocker or recent execution evidence is `output-without-PR`; it must move to `codex:follow-up` and must not count as a real active slot.
- Triage `codex:prompted`, `codex:invoked` and `codex:working` issues without PR/branch/blocker by checking, in order: linked PR to `main`, visible `codex/<issue-number>-<slug>` branch with recent commits, explicit blocker, recent commit/validation/diff evidence, and only then recovery as `output-without-PR`.
- All implementation work must use a dedicated branch named `codex/<issue-number>-<slug>` and open a PR targeting `main`; every future invocation must include this PR requirement and the stop condition that Codex reports the exact blocker if it cannot open the PR or produce a reviewable branch/diff.
- Codex must not auto-merge PRs and must not close issues directly.

## Recommended processing rule

Process issues that satisfy all of the following:

- `codex:ready`;
- no `codex:blocked`;
- no `codex:dangerous`;
- no already open linked implementation PR requiring Codex-side changes;
- clear acceptance criteria in the issue body or generated by Automation 1;
- a clean issue thread, meaning no active contradictory queue comments and no duplicate active prompt;
- real active operational capacity remains at or below 5 after promotion/invocation;
- materialization debt is 5 or fewer, or the action is itself materialization cleanup/recovery;
- collision risk is low, or a human reviewer has explicitly accepted the medium/high collision risk.
