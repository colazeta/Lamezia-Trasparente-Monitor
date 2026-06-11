# Development validation quick reference

This page is a short operational reference for choosing validation commands while preparing or reviewing repository changes. It does not add new required scripts or CI rules: use only commands that already exist in the repository, and keep the final validation proportional to the files touched by the issue.

## Root validation

Run these commands from the repository root when the change is broad, touches shared contracts, or is ready for final review.

| Command | When to use it | What it checks |
| --- | --- | --- |
| `pnpm run typecheck` | Standard final validation for most code changes. | TypeScript project references and package typecheck scripts under `artifacts/**` and `scripts` where present. |
| `pnpm run build` | Final validation before requesting merge, especially for application or package changes. | Runs root typecheck first, then every package build script that exists. |
| `pnpm run test` | Use when tests are relevant to the touched code or when a reviewer asks for the full test pass. | Runs package test scripts that exist across the workspace. |
| `git diff --check` | Use before committing any patch. | Detects whitespace errors in the current diff. |

For documentation-only changes, `git diff --check` is usually the most targeted check, but issue instructions may still require root `typecheck` or `build` for materialization.

## Package-scoped validation

Package-scoped commands are useful when the issue touches a single package and a narrower check gives faster feedback before root validation.

### Web app: `@workspace/lamezia-trasparente`

Use the existing package scripts through pnpm filtering:

```bash
pnpm --filter @workspace/lamezia-trasparente run typecheck
pnpm --filter @workspace/lamezia-trasparente run build
pnpm --filter @workspace/lamezia-trasparente run test
```

These commands are examples for work limited to the public web app. They do not replace root validation when the issue or reviewer explicitly asks for `pnpm run typecheck` or `pnpm run build` from the repository root.

### `scripts` package

The `scripts` workspace package also has its own validation entry points:

```bash
pnpm --filter @workspace/scripts run typecheck
pnpm --filter @workspace/scripts run test
```

Use them for changes limited to repository scripts or their tests. Do not edit package scripts as part of a validation-only documentation change.

## Targeted tests for narrow issues

When an issue changes one helper, parser or test file, a targeted test can be reported alongside the broader checks. Prefer the package's existing test runner instead of inventing a new root command. Examples:

```bash
pnpm --filter @workspace/lamezia-trasparente exec vitest run path/to/file.test.ts
pnpm --filter @workspace/scripts exec node --import tsx --test scripts/check-source-health.test.ts
```

Use targeted tests as additional evidence for the changed area. If the acceptance criteria require root validation, still run and report the root command separately.

## Reporting warnings, failures and exit codes

Validation notes should distinguish three things:

1. the exact command that was run;
2. the exit code or pass/fail result;
3. any warning text that appeared even when the command completed successfully.

If a command exits `0` with known non-blocking warnings, report it as passed with warnings instead of calling it a functional failure. If a command exits non-zero, report it as failed even when the log also contains warnings. Keep the log excerpt minimal and identify whether the failure appears in the changed scope or looks pre-existing and out of scope.

## Do not expand validation scope by changing scripts

This guide is descriptive. Do not add new mandatory scripts, modify package scripts, change workflows, or update dependencies just to make a validation command available. If the needed command does not exist, report the closest existing command and the limitation instead.
