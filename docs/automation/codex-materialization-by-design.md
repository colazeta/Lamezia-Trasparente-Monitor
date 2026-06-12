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

The root design problem is that `implementation done` and `reviewable GitHub artifact produced` have been treated as one phase. They are two different phases and the second one is the source of the stall.

## Design correction

Every Codex task must be designed as a materialization transaction.

A task is not complete when code is written. A task is complete only when the same final response includes one of:

1. a verifiable GitHub PR;
2. a complete unified diff directly applicable from `main`;
3. a complete structured file bundle only when the payload is small enough to be safely complete;
4. an explicit technical blocker.

No intermediate state may occupy the active queue.

## Materialization debt gate

Materialization debt is the count of open issues or PRs with any of these states or labels: `materialization:required`, `fallback-bundle-incomplete`, `output-without-PR`, `invalid-output`, `local-only` or `needs-materialization-verification`. The debt count is operational evidence, not a civic or legal indicator.

When materialization debt is **greater than 5**, every ordinary technical or platform lane must pause new non-urgent Codex invocations. During the gate, allowed work is limited to:

- verifying whether an existing output has a public PR, remote branch, complete diff or complete small file bundle;
- recovering a real PR from a manual UI/export path when it can be verified;
- splitting an unmaterialized task so the next output can fit in a complete fallback;
- updating labels/comments to `complete-diff-provided`, `small-file-bundle-complete`, `fallback-bundle-incomplete`, `output-without-PR`, `invalid-output`, `local-only`, `manual-ui-recoverable`, `split-required`, `blocked-stable`, `superseded` or `duplicate`;
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
4. If neither PR nor complete fallback can be emitted without truncation: report a precise technical blocker and do not claim success.

A Summary without PR URL/number or a complete, non-truncated fallback bundle is a failed output.
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

```text
FILE: artifacts/lamezia-trasparente/src/lib/example.ts
ACTION: create|replace|delete
BEGIN_FILE
<complete file content here>
END_FILE
```

Rules:

- include the full repository path;
- include the intended action;
- include complete contents for create/replace;
- include every modified file;
- do not use ellipses or truncation markers;
- do not mix prose inside file blocks;
- do not use this fallback for long multi-file changes if truncation is likely;
- if the output would be too long, report a blocker instead of sending an incomplete bundle.

## Transport-capacity blocker rule

If Codex cannot create a public PR and cannot emit a complete diff or complete small bundle without truncation, it must report a blocker instead of pasting a partial fallback.

Required blocker language:

```text
Technical blocker: PR creation did not return a public PR URL/number, and the response channel cannot safely carry a complete non-truncated diff or file bundle. This output is not materialized.
```

This blocker releases the active slot and requires either a real PR, a smaller issue split, or manual UI export.

## Decisione operativa per Giovanni

Every Codex or automation update that materially changes the routing of an issue or pull request must end with a standard `Decisione operativa per Giovanni` section. This section turns materialization evidence into one operational decision for the human maintainer.

Required template:

```md
## Decisione operativa per Giovanni

- Task Codex: <link diretto alla Task Codex, oppure `non disponibile / non verificata`>
- PR GitHub: #<numero> / <link>, oppure `nessuna PR verificabile`
- Branch: `<branch>`, oppure `non verificato`
- Stato PR: `mergeable` / `conflict-on-creation` / `needs-rebase` / `ci-pending` / `ci-failed` / `draft` / `superseded` / `non verificabile`
- CI: `success` / `failure` / `pending` / `not run` / `non verificata`
- Scope: `ok` / `scope-risk` / `troppo ampia` / `non verificato`
- Decisione: `MERGIARE` / `NON MERGIARE` / `ATTENDERE` / `RIGENERARE DA MAIN` / `CHIUDERE COME SUPERSEDED`
- Azione richiesta a Giovanni: <una sola azione concreta, oppure `nessuna azione richiesta`>
- Motivo sintetico: <1-3 righe>
```

Decision rules:

- Use `MERGIARE` only when the PR is verified, not draft, mergeable, conflict-free, green or sufficiently validated, in scope, and has no unresolved copy/legal/privacy/methodological risk.
- Use `NON MERGIARE` when the PR is conflicting, `mergeable: false`, failed in CI, scope-risk, too broad, too stale, not verifiable, based on an unreliable branch, or superseded by a canonical PR.
- Use `ATTENDERE` when CI is pending, a draft PR is plausibly recoverable, content review is missing, or Giovanni must decide on MVP/deploy/privacy/copy before routing.
- Use `RIGENERARE DA MAIN` when a useful patch is attached to a branch that starts conflicted, stale, or otherwise unreliable.
- Use `CHIUDERE COME SUPERSEDED` when another PR has already solved the requirement or the work is intentionally replaced.
- Do not describe conflicting PRs, failed-CI PRs or unverifiable outputs as generic `review-needed` without the operational decision above.
- The section may advise Giovanni, but it does not authorize approval, merge, auto-merge, or automatic issue/PR closure.

## Materializer decision logic

When a Codex output is received:

1. If there is a PR URL/number, run PR governor.
2. If there is no PR but a complete unified diff with no truncation/omission markers, create branch `materialize/<issue>-<slug>` from `main`, apply it, and open a PR.
3. If there is no PR but a complete small file bundle with no truncation/omission markers, create branch `materialize/<issue>-<slug>` from `main`, apply it, and open a PR.
4. If there is no PR and no complete bundle, classify `output-without-PR` or `local-only`.
5. If the output declares a complete fallback but contains `...`, `(truncated)`, omitted sections, missing files, or cannot be mechanically parsed, classify `fallback-bundle-incomplete` and `output-without-PR`.
6. If a second recovery also lacks PR or complete bundle, classify `blocked-stable` and do not reinvoke.

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
- a long multi-file full-content fallback where truncation risk is visible;
- validation claims without a materialization path.

## Issue design rule

New Codex issues must be small enough to materialize. Prefer:

- one to three files;
- pure helpers and tests when possible;
- strict file allowlists;
- no mixed UI/API/DB/governance changes;
- no sensitive civic/legal copy unless explicitly reviewed.

If the issue cannot fit in a complete fallback bundle, it must require a real GitHub PR. If PR creation fails and a complete unified diff cannot be provided, Codex must report a blocker rather than sending partial file contents.

## Automation rule

Every automation that creates, invokes, recovers or verifies Codex work must enforce this hierarchy:

```text
PR verified > complete unified diff > complete small file bundle > explicit blocker > failed output
```

The automation must not wait for a manual UI click. A manual `Create PR` click is an accelerator only, never a required pipeline step.

## Operational consequence

This design does not assume Codex will always create PRs. It makes PR creation failure non-blocking only when Codex provides a complete, non-truncated diff or complete small bundle in the same response. It makes incomplete fallback outputs fail fast instead of occupying queue capacity.
