# Runtime integrity verification — 2026-09-08

Scope: #1129; operational follow-up to #1106 and the conceptual assessment #1115.

## Findings and changes

1. **Contracts edge schema mismatch.** The emitted dataset uses
   `lamezia-contracts-multisource.v1`; the Pages worker still accepted only
   `lamezia-contracts-current.v1`. Replaying the emitted artifact against the
   previous worker produces HTTP 503; the corrected worker returns HTTP 200.
   List, detail, storyline, public-v1 alias, search, HEAD, read-only methods,
   analytics and RSS remain covered. Invalid artifacts still fail closed.
2. **Smoke tested a different artifact.** The canonical smoke rewrote the
   dataset to the legacy schema for its worker tests, then restored it. All
   validation now uses the actual multi-source artifact. The shared validator
   retains reconciliation, identity, ANAC coverage and source limitations.
   A before/after SHA-256 comparison confirms the smoke leaves bytes unchanged.
3. **An imported CLI ran on API startup.** The database barrel exported a
   module whose main-program guard became true inside the bundled API entrypoint.
   Render logs showed an unintended LTCEDS dry-run failing on missing Python
   `jsonschema`. This was not a successful write import. The CLI is now a separate
   entrypoint; deliberate imports still execute the existing publication gate.
   A subprocess regression test bundles the database library and forbids child
   processes and network connections during loading.
4. **Workspace build ordering.** Root builds run sequentially, so Metro cannot
   watch a web output directory while Vite removes and recreates it.

## Verification

- Root `pnpm run build` passed, including typecheck and all workspace builds.
- Corrected static smoke passed; previous worker + current artifact returned 503,
  corrected worker + the same artifact returned 200.
- Database bundle regression passed.
- LTCEDS importer-core, canonical-identity and schema-convergence tests passed.
  Locally these used `node --import tsx --test` because the `tsx` CLI IPC pipe is
  unavailable in the execution environment; CI retains its normal test command.
- Production verification is a separate gate: both deployment provider status
  and the final public smoke must be checked after merge. A successful build or
  frontend publication alone does not establish API availability.

No civic records, publication approvals, authentication configuration or database
schema were changed. This operational repair does not complete the canonical
domain migrations. PNRR reconciliation remains tracked by #1118.
