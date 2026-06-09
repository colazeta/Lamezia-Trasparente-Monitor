# CI validation notes v0

This short technical note records common validation commands used when reporting small frontend, documentation, and maintenance fixes. It is intended as reusable review context only: it does not change workflows, governance, release policy, or the acceptance criteria of individual issues.

## Repo-wide checks

When requested for a change, report the exact command and result for these repository-level checks:

```bash
git diff --check
pnpm run typecheck
pnpm run build
pnpm run test
```

`git diff --check` is useful for whitespace and patch-format problems before commit. `pnpm run typecheck`, `pnpm run build`, and `pnpm run test` exercise the root workspace and should be kept distinct from narrower package checks in PR notes.

## Targeted checks

Targeted commands are useful when a change is limited to one package, page, utility, or test file. Examples may include package filters or a specific test command already present in the workspace:

```bash
pnpm --filter <package-name> run typecheck
pnpm --filter <package-name> run build
pnpm --filter <package-name> run test
pnpm --filter <package-name> exec vitest run <path-or-pattern>
```

Report targeted commands exactly as run, including filters and paths. Targeted checks do not replace repo-wide validation when the issue or reviewer requests root commands; they only add narrower evidence for the changed area.

## Reporting blockers

If a repo-wide command cannot complete because of a pre-existing or out-of-scope blocker, do not hide the failure or broaden the fix. Report:

- the exact command;
- the minimal reproducible error line or summary;
- the file, package, or area that appears to block the command;
- whether the blocker is outside the touched file set.

For documentation-only changes, note when no targeted tests are applicable and still report any requested root validation that was run.

## Delivery note fields

A concise PR body or final comment should include the files changed, head SHA, validation commands with pass/fail/blocker status, any targeted checks, and any residual limitation. Keep the wording technical and avoid claims such as complete coverage or guaranteed green status unless the reported commands actually establish it.
