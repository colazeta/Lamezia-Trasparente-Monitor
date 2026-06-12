# Codex materialization by design

## Diagnosis

The recurring failure is not primarily implementation quality. It is a handoff failure between the Codex workspace and GitHub.

Observed failure modes:

1. Codex produces a diff in its workspace and comments a Summary on the issue, but no public GitHub PR is created.
2. Codex reports `created via make_pr`, but the public PR URL and number are missing.
3. Codex reports a remote branch or commit, but GitHub cannot verify it in the repository.
4. Codex links to `blob/<sha>/<path>` URLs that point to unrelated commits or paths.
5. Codex provides fallback file contents, but the fallback is not structured enough for an automatic materializer to parse safely.
6. Codex provides a structured file bundle, but the payload is too long and gets truncated.
7. Codex declares `complete unified diff`, but the response transport truncates the diff or replaces parts with `...`.
8. Codex completes useful work in its execution surface but leaves no structured manual-recovery handoff for Giovanni when automatic GitHub materialization fails.

The root design problem is that `implementation done` and `reviewable GitHub artifact produced` have been treated as one phase. They are two different phases and the second one is the source of the stall.

## Design correction

Every Codex task must be designed as a materialization transaction.

A task is not repository-complete when code is written. Repository completion requires a reviewable artifact produced by one of:

1. a verifiable GitHub PR;
2. a complete unified diff directly applicable from `main`;
3. a complete structured file bundle only when the payload is small enough to be safely complete;
4. a manual PR/commit created by Giovanni from a sufficient manual-materialization handoff.

A Codex execution may also end with an explicit technical blocker. When Codex has implemented the task but cannot create a PR and cannot safely emit a complete diff or bundle, it must produce a `manual-materialization-ready` blocker handoff instead of a generic summary.

No intermediate state may occupy the active Codex queue. A sufficient manual handoff is a human recovery state, not an active Codex slot and not repository completion.

## Materialization debt gate

Materialization debt is the count of open issues or PRs with any of these states or labels: `materialization:required`, `fallback-bundle-incomplete`, `output-without-PR`, `invalid-output`, `local-only`, `manual-materialization-ready` or `needs-materialization-verification`. The debt count is operational evidence, not a civic or legal indicator.

When materialization debt is **greater than 5**, every ordinary technical or platform lane must pause new non-urgent Codex invocations. During the gate, allowed work is limited to:

- verifying whether an existing output has a public PR, remote branch, complete diff, complete small file bundle or sufficient manual-materialization handoff;
- recovering a real PR from a manual UI/export path when it can be verified;
- splitting an unmaterialized task so the next output can fit in a complete fallback;
- updating labels/comments to `complete-diff-provided`, `small-file-bundle-complete`, `fallback-bundle-incomplete`, `output-without-PR`, `invalid-output`, `local-only`, `manual-ui-recoverable`, `manual-materialization-ready`, `split-required`, `blocked-stable`, `superseded` or `duplicate`;
- handling real open PRs with no merge, no approval and no auto-merge, especially rebase/recovery/supersede decisions.

The anti-idle rule is suspended while this gate is active. Empty capacity must not be filled with ordinary work until debt is back to **5 or fewer** or a human explicitly declares an urgent exception.

## Required prompt contract

Every Codex invocation and recovery prompt must include this exact contract or an equivalent stricter version:

```text
Your final response must contain a same-response Materialization section.

Valid outcomes:
1. PR created: include PR URL, PR number, remote branch, full commit SHA, GitHub verification, issue linkage and scope check.
2. If no PR exists: prefer a complete unified diff directly applicable from main, but only if the diff can be emitted completely in the response.
3. Use complete FILE/ACTION/BEGIN_FILE/END_FILE blocks only for small outputs where every file can be provided without truncation.
4. If implementation is complete but PR creation fails and no complete fallback can be emitted safely: produce a manual-materialization-ready blocker handoff with exact files, implementation summary, validation, safeguard impact and Giovanni's manual recovery steps.
5. If neither PR, complete fallback nor sufficient manual handoff can be emitted: report a precise technical blocker and do not claim success.

A Summary without PR URL/number, complete non-truncated fallback bundle, sufficient manual-materialization-ready handoff or explicit blocker is a failed output.
```

## Materialization bundle format

If no public PR is available, Codex must prefer a complete unified diff. A full-file bundle is a secondary fallback, not the default.

### Preferred fallback: complete unified diff

```diff
--- a/path/to/file.ts
+++ b/path/to/file.ts
@@
<complete hunks directly applicable from main>
```

Rules:

- the diff must be complete and directly applicable from `main`;
- include all modified files;
- no ellipses;
- no omitted sections;
- no prose-only descriptions;
- no `(truncated)` markers;
- no local-only commit or branch as evidence;
- no declared `complete unified diff` if the response channel cannot carry the complete diff.

### Secondary fallback: file-content bundle

Use one fenced block per file only when the whole bundle is small enough to be safely complete.

````text
FILE: artifacts/lamezia-trasparente/src/lib/example.ts
ACTION: create|replace|delete
BEGIN_FILE
<complete file content here>
END_FILE
````

Rules:

- include the full repository path;
- include the intended action;
- include complete contents for create/replace;
- include every modified file;
- do not use ellipses or truncation markers;
- do not mix prose inside file blocks;
- do not use this fallback for long multi-file changes if truncation is likely;
- if the output would be too long, report a blocker instead of sending an incomplete bundle.

## Manual materialization handoff format

When Codex has completed the implementation but automatic GitHub materialization fails and a complete diff/bundle cannot be emitted safely, Codex must provide a `manual-materialization-ready` blocker handoff.

Minimum required fields:

```text
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

A manual handoff is sufficient only when it lets Giovanni materialize the work without reconstructing the implementation intent. It releases the Codex execution slot but remains materialization debt until a PR/commit exists or the work is superseded.

## Transport-capacity blocker rule

If Codex cannot create a public PR and cannot emit a complete diff or complete small bundle without truncation, it must produce a manual-materialization-ready handoff when it has enough execution evidence for manual recovery. If it lacks enough evidence for that handoff, it must report a blocker instead of pasting a partial fallback.

Required blocker language when no manual handoff is possible:

```text
Technical blocker: PR creation did not return a public PR URL/number, and the response channel cannot safely carry a complete non-truncated diff or file bundle. No sufficient manual-materialization-ready handoff can be produced from the available execution evidence. This output is not materialized.
```

This blocker releases the active slot and requires either a real PR, a smaller issue split, a manual UI export, or a new invocation only after the missing recovery evidence is understood.

## Materializer decision logic

When a Codex output is received:

1. If there is a PR URL/number, run PR governor.
2. If there is no PR but a complete unified diff with no truncation/omission markers, create branch `materialize/<issue>-<slug>` from `main`, apply it, and open a PR.
3. If there is no PR but a complete small file bundle with no truncation/omission markers, create branch `materialize/<issue>-<slug>` from `main`, apply it, and open a PR.
4. If there is no PR and no complete bundle but the output contains a sufficient `manual-materialization-ready` handoff, route to Giovanni manual recovery and do not count it as an active Codex slot.
5. If the manual handoff is incomplete, contradictory, unsafe or lacks file-level materialization instructions, classify `output-without-PR` or `fallback-bundle-incomplete` as appropriate.
6. If the output declares a complete fallback but contains `...`, `(truncated)`, omitted sections, missing files, or cannot be mechanically parsed, classify `fallback-bundle-incomplete` and `output-without-PR`.
7. If a second recovery also lacks PR, complete bundle or sufficient manual handoff, classify `blocked-stable` and do not reinvoke.

## Anti-patterns to reject

Reject immediately:

- `Summary` only;
- `created via make_pr` without public PR URL or PR number;
- short commit SHA;
- local branch names without remote verification;
- `blob` links that fail the link-integrity gate;
- file contents with `...`, `(truncated)`, `omitted`, or partial snippets;
- unified diffs with `...`, `(truncated)`, omitted hunks, missing files or prose substitutions;
- a structured file bundle that is missing any changed file;
- a manual handoff without exact files, validation status, safeguard impact and Giovanni's manual materialization steps;
- a long multi-file full-content fallback where truncation risk is visible;
- validation claims without a materialization or manual-recovery path.

## Issue design rule

New Codex issues should be sized for reviewable materialization. Prefer coherent macro-tasks over artificial micro-task fragmentation when the work has one clear objective, bounded files/modules and one reviewable PR target.

Prefer:

- one coherent feature/fix/refactor per issue;
- explicit acceptance criteria;
- bounded file/module scope;
- pure helpers and tests when possible;
- strict file allowlists for sensitive areas;
- no unrelated UI/API/DB/governance mixing;
- no sensitive civic/legal/election copy unless explicitly reviewed.

If the issue cannot fit in a complete fallback bundle, it must require a real GitHub PR or a manual-materialization-ready handoff. If PR creation fails and neither a complete unified diff nor a sufficient manual handoff can be provided, Codex must report a blocker rather than sending partial file contents.

## Automation rule

Every automation that creates, invokes, recovers or verifies Codex work must enforce this hierarchy:

```text
PR verified > complete unified diff > complete small file bundle > manual-materialization-ready blocker handoff > explicit blocker > failed output
```

The automation must not wait for a manual UI click as its only plan. Giovanni manual recovery is allowed only when Codex provides a sufficient handoff that identifies the exact work to materialize.

## Operational consequence

This design does not assume Codex will always create PRs. It makes PR creation failure non-blocking when Codex provides a complete, non-truncated diff, a complete small bundle, or a sufficient manual-materialization-ready handoff for Giovanni. It makes incomplete fallback outputs fail fast instead of occupying queue capacity.
