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

- **Candidate/triage states:** `codex:candidate`, `codex:ready`.
- **Operational states that can saturate capacity:** real active Codex work (`codex:invoked`, `codex:working` and open Codex PRs that still need Codex-side changes) while backed by a visible PR, visible branch with recent commit, reviewable diff/execution artifact or an in-progress invocation inside the stale-task grace window, plus fresh `codex:prompted` issues that reserve pending capacity while awaiting invocation inside the 60-minute prompt grace window. Explicit technical blockers are reviewable evidence, but after routing they release capacity instead of saturating it.
- **Fresh prompt grace:** a newly prepared `codex:prompted` issue is awaiting invocation, not stalled, and reserves pending capacity until an operative `@codex` invocation exists or the prompt is older than 60 minutes with no invocation or cleanup action.
- **Human review wait:** `codex:review-needed` and PRs/issues waiting only for Giovanni review or merge; these are outside the capacity count unless there is concrete file/module collision or Codex-side rework.
- **Follow-up/blocking states:** `codex:follow-up`, `codex:blocked`, `codex:dangerous`.
- **Completion state:** `codex:done`, which must not be used to auto-close an issue.

## Capacity, derived state and collision guardrails

- The operational queue has maximum capacity 10, computed on real active Codex work plus reserved fresh `codex:prompted` slots awaiting invocation. Effective free slots are `10 - (real active Codex operational tasks + reserved fresh codex:prompted slots awaiting invocation)`.
- `codex:ready` should be the only label that starts the queue; by itself it is eligible backlog, never an active state, and does not reserve capacity. When it is non-colliding and capacity remains available after active work and fresh `codex:prompted` reservations are counted, automation should move it toward prompting and invocation rather than wait for unrelated PR review or merge activity. A `codex:prompted` issue with no recent operative `@codex` invocation should be invoked directly when the same capacity and collision checks pass.
- `codex:ready` is normally assigned by the queue-governor automation after checking priority, scope, acceptance criteria, active queue saturation and possible overlap with open PRs.
- Every promotion or pause decision should include minimum collision-control fields:
  - probable scope;
  - likely files/modules;
  - collision risk: `low`, `medium` or `high`;
  - evidence used and age of the evidence.
- Collision matrix: high risk means same generated files, API contract, DB schema/migrations, generated clients, runtime file/module, prompt/doc section or public copy/legal/methodological text; medium risk means same package/domain with distinct files and compatible criteria; low risk means unrelated files/modules or unrelated human-review PRs needing no Codex-side rework.
- High collision blocks invocation unless a human explicitly accepts the risk. Medium collision requires a narrow prompt and explicit collision note. Low collision may proceed when other safeguards pass.
- The queue governor must not treat `codex:review-needed` or Giovanni review/merge wait as saturation unless a concrete file/module collision exists or the PR needs Codex-side rework.
- Pending Giovanni review/merge blocks only candidate work touching the same files/modules or creating a concrete review conflict; it must not stop unrelated queue promotion.
- If active plus reserved operational capacity is below 10/10, the queue governor should apply the anti-idle rule by prompting or invoking eligible low-collision work so available slots become reserved fresh `codex:prompted` capacity or real active Codex work. Promoting an issue only to `codex:ready` is backlog triage, not capacity fill; do it only as preparation and continue to prompt/invoke within capacity, or record an explicit reason the slot cannot be reserved or activated. Valid reasons are absence of real eligible backlog, concrete file/module collision, legal/copy/methodological risk, CI instability, or a decision required from Giovanni before same-file/module work can proceed safely.
- Fast-lane candidates include typecheck/build/lint/test failures, small bugs and limited technical-debt tasks with clear acceptance criteria and low collision risk.
- Collision decisions should follow this matrix: `codex:ready` only is unreserved backlog; fresh `codex:prompted` inside the 60-minute prompt grace window is reserved pending capacity; `codex:invoked` / `codex:working` with recent operative evidence or a PR/branch/diff needing Codex-side changes is real active capacity; routed technical blockers and `output-without-PR` recovery release capacity; `codex:review-needed` and Giovanni review/merge wait stay outside capacity except for same-file/module collisions.
- Promotion SLA: every queue-governor pass must either use available capacity by prompting or invoking eligible low-collision work toward 10/10 active or reserved slots, optionally promoting issues to `codex:ready` only as backlog triage before reserving/activating a slot, or record the concrete anti-idle reason that prevents doing so.

## Automation guardrails

- Labels are nominal routing hints; derived operational state from labels plus evidence is the source of truth for queue decisions. Stale comments must not override current evidence. Comments that cite a blocker PR, issue or dependency must not block work after that blocker is closed, merged, resolved or explicitly superseded.
- After a PR, blocker, stale output or supersession is found, remove or neutralise stale `codex:ready`, `codex:prompted`, `codex:invoked` or `codex:working` labels so served issues do not re-enter the candidate pool. If labels such as `codex:pr-open`, `codex:completed-by-pr`, `duplicate`, `superseded` or `needs-human-decision` do not exist, use a short issue comment with that fallback state instead of inventing labels.
- Before `codex:prompted` is added, Automation 1 must confirm that the issue thread contains no unresolved contradictory, duplicated or placeholder automation comments.
- If contradictory comments cannot be removed or neutralised, the issue must receive `codex:follow-up` or `codex:blocked`, not `codex:prompted`.
- `codex:dangerous` always overrides `codex:ready`.
- `codex:blocked` always pauses the issue.
- `area:copy-legal-tone`, `area:civic-methodology` and `area:data-api` require stricter review.
- `area:backlog-governance` should generally produce triage comments, not direct code changes.
- Issues should not move from `codex:working` to `codex:done` without evidence of a PR, validation or explicit reviewer confirmation.
- Issues with `codex:invoked` or `codex:working` for more than 60 minutes and no PR, branch, Codex comment, commit or other concrete activity should move to `codex:follow-up` and release operational capacity.
- Start the 60-minute stale-task clock from the latest operative event: prompt publication, Codex invocation, Codex status comment, branch push, commit, PR creation or explicit blocker report.
- A Codex summary without a GitHub-visible PR, GitHub-visible branch plus recent commit SHA, reviewable diff/execution artifact or explicit technical blocker is `output-without-PR`; it does not count as a real active slot and should be routed to `codex:follow-up` for recovery.
- A precise technical blocker is reviewable evidence but not active work after routing; move it to `codex:blocked` or `codex:follow-up`, preserve the exact blocker details, and release capacity.
- All implementation work must use a dedicated branch named `codex/<issue-number>-<slug>` and open a PR targeting `main`; if a PR cannot be opened, Codex must comment with the exact technical reason and the branch ref, commit SHA, diff location or blocker.
- Codex must not auto-merge PRs and must not close issues directly.

## Recommended processing rule

Process issues that satisfy all of the following:

- `codex:ready`;
- no `codex:blocked`;
- no `codex:dangerous`;
- no already open linked implementation PR requiring Codex-side changes;
- clear acceptance criteria in the issue body or generated by Automation 1;
- a clean issue thread, meaning no active contradictory queue comments and no duplicate active prompt;
- active plus reserved operational capacity remains at or below 10 after promotion/invocation;
- collision risk is low, or a human reviewer has explicitly accepted the medium/high collision risk.
