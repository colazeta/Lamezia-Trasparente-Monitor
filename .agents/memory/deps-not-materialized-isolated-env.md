---
name: Deps declared but not linked in isolated env
description: Vite/vitest "Failed to resolve import X" when X is already in package.json — fix is pnpm install, not a code change
---

In an isolated task environment, a dependency can be listed in an artifact's
`package.json` and present in the pnpm store (`node_modules/.pnpm/...`) yet NOT
be symlinked into the importable `node_modules`. Vite then throws
`[plugin:vite:import-analysis] Failed to resolve import "X"` (500s the whole
app), and vitest suites fail to load with the same error.

**Why:** the lockfile already has the package, but this env never materialized
the links (`pnpm install` was never run here for that change). It looks exactly
like a missing-dependency code bug, but the code/import is correct.

**How to apply:** before "fixing" an import that resolution can't find, confirm
it's in `package.json` and in `node_modules/.pnpm`. If it's there but missing
from `artifacts/<name>/node_modules`, run `pnpm install` at the repo root, then
restart the workflow. Example that bit us: `react-leaflet`/`leaflet` for
lamezia-trasparente's map components (LocationEditor, InterventionsMap).
