# CI validation notes v0

This note lists small, technical validation checks commonly reported for micro-fixes in documentation, frontend utility code and maintenance changes. It is a practical reference for review notes, not a governance policy and not a guarantee that every workspace condition is fully covered.

## Repo-wide checks

Use the root workspace commands when the change scope or review request calls for repository-level validation:

- `git diff --check` — checks the pending diff for whitespace and patch-format issues.
- `pnpm run typecheck` — runs the repository type-check command.
- `pnpm run build` — runs the repository build command.
- `pnpm run test` — runs the repository test command when requested or when broad test coverage is relevant.

Report each command exactly as executed and note whether it passed, failed, or was blocked.

## Targeted checks

For narrow changes, targeted commands can provide useful extra evidence for the affected package or file area, for example:

- `pnpm --filter <package> run typecheck`
- `pnpm --filter <package> run test`
- `pnpm --filter <package> run build`
- a package-specific unit, lint or documentation check when such a script already exists.

Targeted checks do not replace requested repo-wide validation. If both are relevant, report the targeted command separately from the root command.

## Reporting blockers

If a repo-wide command cannot complete because of an existing or out-of-scope blocker, report the smallest reproducible detail instead of masking the failure:

- the exact command;
- the minimal error message or failing file/area;
- whether the blocker appears outside the changed file;
- any targeted command that still ran successfully for the touched area.

Keep blocker notes technical and limited to validation impact. Do not infer broader project health or introduce new operational rules from a single failed command.

## Delivery note fields

A concise PR body or final comment should include:

- issue or PR reference;
- files changed;
- head SHA;
- validation commands and results;
- targeted checks, when used;
- residual blockers or a note that none were observed.

## Issue #287 — `main` CI run `27235668660` at `65359d2`

The failed GitHub Actions run reported for issue #287 was the `CI` workflow on a push to `main` at commit `65359d29a515c384cccf7790dc2d10a5751bd942` (`Add ingestion worker package manifest for #240`). The publicly visible run page confirms the run failed in job `Install, typecheck, build and test` with the annotation `Process completed with exit code 1`.

A local detached worktree at `65359d2` reproduces the failure with the CI install command:

```text
pnpm install --frozen-lockfile
```

The command exits with `ERR_PNPM_OUTDATED_LOCKFILE` because `artifacts/ingestion-worker/package.json` had been added at that commit without a corresponding `pnpm-lock.yaml` update. pnpm reported that the lockfile specifiers did not match the new package manifest dependencies for the ingestion worker.

On the current branch, the failure is no longer present as a source/workflow issue: `artifacts/ingestion-worker/package.json` is now represented in `pnpm-lock.yaml`, including the ingestion worker dependency block and worker-only runtime helper entries. Therefore the smallest safe follow-up for issue #287 is this diagnostic note rather than a speculative CI workflow change.

Validation performed for this diagnosis:

- historical reproduction: `pnpm install --frozen-lockfile` from a detached worktree at `65359d2` reproduced `ERR_PNPM_OUTDATED_LOCKFILE`;
- current workspace install: `pnpm install --frozen-lockfile` passes on the current branch;
- patch hygiene: `git diff --check` passes for this documentation-only change.
