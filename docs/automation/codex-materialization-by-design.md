# Codex materialization by design

## Diagnosis

The recurring failure is not primarily implementation quality. It is a handoff failure between the Codex workspace and GitHub.

Observed failure modes:

1. Codex produces a diff in its workspace and comments a Summary on the issue, but no public GitHub PR is created.
2. Codex reports `created via make_pr`, but the public PR URL and number are missing.
3. Codex reports a remote branch or commit, but GitHub cannot verify it in the repository.
4. Codex links to `blob/<sha>/<path>` URLs that point to unrelated commits or paths.
5. Codex provides fallback file contents, but the fallback is not structured enough for an automatic materializer to parse safely.

The root design problem is that `implementation done` and `reviewable GitHub artifact produced` have been treated as one phase. They are two different phases and the second one is the source of the stall.

## Design correction

Every Codex task must be designed as a materialization transaction.

A task is not complete when code is written. A task is complete only when the same final response includes one of:

1. a verifiable GitHub PR;
2. a machine-materializable fallback bundle;
3. an explicit technical blocker.

No intermediate state may occupy the active queue.

## Required prompt contract

Every Codex invocation and recovery prompt must include this exact contract or an equivalent stricter version:

```text
Your final response must contain a same-response Materialization section.

Valid outcomes:
1. PR created: include PR URL, PR number, remote branch, full commit SHA, GitHub verification, issue linkage and scope check.
2. If no PR exists: include a complete materialization bundle in this same response.
3. If neither is possible: report a precise technical blocker and do not claim success.

A Summary without PR URL/number or a complete fallback bundle is a failed output.
```

## Materialization bundle format

If no public PR is available, Codex must prefer a complete unified diff. If a diff is not reliable, it must provide complete file contents.

### Preferred fallback: unified diff

```diff
--- a/path/to/file.ts
+++ b/path/to/file.ts
@@
...
```

The diff must be complete and directly applicable from `main`. No ellipses, no omitted sections, no prose-only descriptions.

### File-content fallback

Use one fenced block per file.

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
- do not use ellipses or truncation markers;
- do not mix prose inside file blocks;
- if the output would be too long, report a blocker instead of sending an incomplete bundle.

## Materializer decision logic

When a Codex output is received:

1. If there is a PR URL/number, run PR governor.
2. If there is no PR but a complete materialization bundle, create branch `materialize/<issue>-<slug>` from `main` and open a PR.
3. If there is no PR and no complete bundle, classify `output-without-PR` or `local-only`.
4. If a second recovery also lacks PR or bundle, classify `blocked stabile` and do not reinvoke.

## Anti-patterns to reject

Reject immediately:

- `Summary` only;
- `created via make_pr` without public PR URL or PR number;
- short commit SHA;
- local branch names without remote verification;
- `blob` links that fail the link-integrity gate;
- file contents with `...`, `(truncated)`, `omitted`, or partial snippets;
- validation claims without a materialization path.

## Issue design rule

New Codex issues must be small enough to materialize. Prefer:

- one to three files;
- pure helpers and tests when possible;
- strict file allowlists;
- no mixed UI/API/DB/governance changes;
- no sensitive civic/legal copy unless explicitly reviewed.

If the issue cannot fit in a complete fallback bundle, it must require a real GitHub PR and report blocker if PR creation fails.

## Automation rule

Every automation that creates, invokes, recovers or verifies Codex work must enforce this hierarchy:

```text
PR verified > complete fallback bundle > explicit blocker > failed output
```

The automation must not wait for a manual UI click. A manual `Create PR` click is an accelerator only, never a required pipeline step.

## Operational consequence

This design does not assume Codex will always create PRs. It makes PR creation failure non-blocking by requiring a complete fallback bundle in the same response, and it makes incomplete fallback outputs fail fast instead of occupying queue capacity.