# Codex goal-driven execution and manual materialization handoff

This document defines the operational pattern for larger, coherent Codex tasks where the objective is to reduce fragmented micro-issue execution while preserving reviewability, civic safeguards and materialization discipline.

## Purpose

Use goal-driven execution when a task is too substantial for a shallow one-turn prompt but still represents one coherent implementation objective. The preferred result remains a verified GitHub pull request targeting `main`. When Codex completes the implementation but cannot create a verified PR, the fallback is not a generic summary. The fallback is a structured manual-materialization handoff that allows Giovanni to materialize the work manually from the Codex/Dialogo output.

This policy does not redefine repository completion. Repository completion still requires a reviewable artifact: a verified PR, a complete applicable diff, a complete small file bundle or a subsequent manual PR/commit created by Giovanni.

## Macro-task eligibility

A macro-task may be invoked as one goal-driven Codex run when all of these conditions hold:

- the task expresses one coherent feature, fix, refactor or governance change;
- the probable scope has bounded files/modules;
- acceptance criteria are explicit and checkable;
- validation commands or manual verification steps are known;
- collision risk is low, or a human explicitly accepts the medium/high collision risk;
- the public, legal, methodological and source-traceability safeguards are explicit when relevant.

Do not use a macro-task for a loose backlog, unrelated fixes, unresolved product decisions, high-collision API/database/generated-client changes, or mixed technical and sensitive copy changes that cannot be reviewed safely as one PR.

## Goal-driven execution contract

Every goal-driven invocation must instruct Codex to work through internal checkpoints rather than stop at planning or split the work into artificial micro-issues.

Minimum checkpoints:

1. read `AGENTS.md` and relevant governance documents;
2. inspect the likely files/modules and confirm the narrow implementation boundary;
3. map each acceptance criterion to concrete implementation work or validation evidence;
4. implement the smallest coherent end-to-end change;
5. run relevant validation commands;
6. diagnose validation failures and attempt targeted fixes where feasible;
7. materialize the result or produce a structured manual-materialization blocker handoff.

The goal-driven instruction must not be phrased as a vague request to "try harder". It must define operational persistence: keep working until the acceptance criteria are satisfied, or until an explicit blocker applies.

## Valid execution outcomes

The hierarchy remains:

```text
PR verified > complete unified diff > complete small file bundle > manual-materialization-ready blocker handoff > explicit blocker > failed output
```

The first three outcomes are directly reviewable artifacts. A `manual-materialization-ready` handoff is a recovery state: it can release the Codex execution slot, but it is not repository completion and must not be treated as merged, done or closed.

## Manual-materialization-ready state

Use `manual-materialization-ready` when all of these are true:

- Codex has completed or substantially completed the implementation work in its execution surface;
- automatic PR creation failed, was unavailable, or did not return a verifiable public PR URL/number;
- emitting a complete non-truncated diff or complete small file bundle is unsafe or impractical;
- the final comment contains enough structured evidence for Giovanni to materialize the work manually without reconstructing the implementation intent.

If the repository does not have a dedicated label for this state, record it explicitly in the issue or PR comment body and route the issue to manual recovery using the existing follow-up/materialization workflow.

## Required handoff format

A manual handoff must include this structure:

```md
## Materialization

State: manual-materialization-ready

Repository completion: not complete until Giovanni manually materializes and reviews the PR or commit.

## Goal executed

- Issue:
- Issue title:
- Objective:
- Acceptance criteria addressed:

## Changes prepared

- Files changed:
- Files created:
- Files deleted:
- Generated files touched: yes/no
- API contract touched: yes/no
- Database/schema/migration touched: yes/no
- Public copy/legal/methodological/source-traceability safeguards affected: yes/no

## Implementation summary

- Behaviour before:
- Behaviour after:
- File/module-level changes:

## Validation

- Commands run:
- Results:
- Known failures:
- Related/unrelated failure assessment:

## Manual materialization instructions

- Suggested branch:
- Suggested PR title:
- Suggested PR body:
- Exact files to inspect in Codex/Dialogo:
- Exact steps Giovanni should perform to materialize the work:
- Commands to rerun after materialization:
- Screenshots/artifacts to attach, if UI changed:

## Stop reason

Automatic GitHub materialization failed or was unavailable. The work is not completed in the repository until Giovanni creates or reviews the materialized PR/commit.
```

A prose-only summary is not a manual handoff. A local-only branch or short SHA is not enough. A truncated diff or file bundle is not enough.

## Civic and election safeguards

For election, civic, public-administration or transparency work, goal-driven execution must preserve the repository's cautious public-interest posture:

- do not introduce factual electoral claims unless already present in authorised source data or explicitly required by the issue;
- do not infer misconduct, manipulation, irregularity, intent, favouritism, corruption, mafia infiltration or individual responsibility from administrative or electoral data;
- distinguish indicators, signals, patterns, data gaps and verification needs from factual conclusions;
- list public-facing copy, legal, methodological and source-traceability changes separately in the PR or manual handoff.

## Queue treatment

A `manual-materialization-ready` handoff is a human recovery state. It should not continue to occupy a real active Codex slot unless Codex-side rework is still required. It may still represent materialization debt until Giovanni creates a verified PR/commit or explicitly supersedes the work.

Do not re-invoke Codex merely because the PR was not created automatically when the handoff is sufficient for manual recovery. Re-invoke only when the handoff is incomplete, contradictory, unsafe, stale, or cannot be materialized from the available Codex/Dialogo output.

## Anti-patterns

Reject these as failed or incomplete outputs:

- analysis-only response;
- generic summary without file-level handoff;
- claim of completion without PR, complete diff, complete bundle or manual handoff;
- partial fallback with ellipses, omitted hunks, `(truncated)` markers or missing files;
- local-only branch or short SHA as proof of materialization;
- public-facing election or civic claims unsupported by authorised source data;
- broad unrelated refactoring hidden inside a macro-task.
