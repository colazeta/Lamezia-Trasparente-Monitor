# Codex issue automation protocol

This document defines the controlled automation protocol for using Codex on the Lamezia Trasparente Monitor backlog.

The objective is not to let Codex work indiscriminately on every open issue. The objective is to create a controlled queue where issues are explored, converted into precise implementation prompts, assigned to Codex, reviewed, and either closed or returned to follow-up.

## Core principle

Codex may work only on issues that have been explicitly marked as ready. Human review remains mandatory before merge and before closing an issue.

## Suggested labels

- `codex:candidate` — issue may be considered for automation.
- `codex:ready` — issue is sufficiently clear and may enter the automated sequence.
- `codex:prompted` — an implementation prompt has been prepared.
- `codex:invoked` — Codex has been invoked on the issue.
- `codex:working` — a pull request or implementation attempt is in progress.
- `codex:review-needed` — changes exist and require review.
- `codex:follow-up` — the issue needs clarification, additional work or a new issue.
- `codex:done` — acceptance criteria appear satisfied after review.
- `codex:blocked` — automation should not proceed.
- `codex:dangerous` — issue is sensitive and requires manual handling only.

## Recommended sequence

### Automation 1 — Explore issue and prepare prompt

Frequency: every 15 minutes, or manually triggered.

Purpose:

1. identify the next open issue with `codex:ready` and without `codex:prompted`;
2. read title, body, labels and linked context;
3. classify the issue as technical, civic-methodological, UI/copy, data/API, or backlog/governance;
4. generate a precise implementation prompt using the templates in `.github/codex-prompts/`;
5. post the prompt as a GitHub comment;
6. add `codex:prompted`.

Safety rule: if the issue is ambiguous, potentially accusatory, legally sensitive or too broad, the automation should add `codex:blocked` or `codex:follow-up` instead of preparing an implementation prompt.

### Automation 2 — Invoke Codex

Frequency: every 15 minutes, offset after Automation 1.

Purpose:

1. identify an issue with `codex:prompted` and without `codex:invoked`;
2. post the final `@codex` instruction or use the selected Codex integration;
3. add `codex:invoked` and `codex:working`;
4. avoid invoking Codex on more than one or two issues at the same time.

Safety rule: never invoke Codex on issues labelled `codex:blocked`, `codex:dangerous`, `needs:human-decision` or equivalent.

### Automation 3 — Review outcome and route issue

Frequency: every 15 minutes, offset after Automation 2.

Purpose:

1. identify issues with `codex:working`, linked pull requests or recent Codex comments;
2. check whether a pull request exists;
3. inspect whether the PR references the issue;
4. check whether the issue acceptance criteria appear satisfied;
5. route the issue to one of three outcomes:
   - `codex:review-needed` if a PR exists and needs human review;
   - `codex:follow-up` if the implementation is incomplete, failing or too broad;
   - `codex:done` if the issue appears solved after merge/review.

Safety rule: this automation should not close issues automatically unless the final policy explicitly allows it. The safer default is to comment with a closure recommendation.

### Automation 4 — Queue governor and collision control

Frequency: every 30–60 minutes, or before each automation cycle.

Purpose:

1. ensure only a limited number of Codex tasks are active simultaneously;
2. detect duplicate work across issues and pull requests;
3. detect stale `codex:working` issues;
4. stop the queue when CI fails repeatedly;
5. add `codex:blocked` where the automation should not continue.

This fourth automation is recommended because the main risk is not prompt generation. The main risk is collision: multiple Codex tasks modifying the same files or creating overlapping pull requests.

## Issue classes and default policy

| Issue class | Default policy |
| --- | --- |
| Technical bug/typecheck/build | Suitable for Codex if acceptance criteria are clear. |
| UI/accessibility/metadata | Suitable for Codex with screenshots or route checklist. |
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
6. files or modules likely involved, if known;
7. validation commands;
8. civic/legal/copy safeguards;
9. branch and PR instructions;
10. explicit stop condition.

## Stop conditions

Codex or the automation should stop and ask for human decision when:

- acceptance criteria are missing;
- the task requires factual claims not supported by repository data;
- the change may imply allegations against persons or entities;
- implementation requires credentials or secrets;
- migrations, generated API packages or public data semantics would be changed without a clear source of truth;
- the same files are already touched by an open PR.
