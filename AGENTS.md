# AGENTS.md

## Project identity

Lamezia Trasparente Monitor is a civic transparency platform for the Municipality of Lamezia Terme. It aggregates, explains and makes public-interest administrative information easier to navigate. The project must remain factual, cautious, document-based and non-accusatory.

The repository is a monorepo with a public web app, a mobile app, an API server, shared API contracts and generated client/validation packages. Treat the API contract and database schema as architectural sources of truth.

## Non-negotiable civic safeguards

- Do not present indicators as evidence of wrongdoing, corruption, favouritism, mafia infiltration or individual responsibility.
- Use cautious language: prefer terms such as `indicator`, `signal`, `pattern`, `recurrence`, `data gap`, `monitoring need`, `transparency issue`, `verification required`.
- Avoid accusatory, journalistic or sensational wording.
- Preserve legal notes, methodological caveats and source limitations.
- Do not add personal allegations or infer intent from administrative data.
- Do not introduce external data sources without documenting source, update logic, limitations and lawful/public-use assumptions.

## Scope control

- Keep every change strictly scoped to the GitHub issue being addressed.
- Prefer small, reviewable pull requests.
- Do not perform broad refactoring unless the issue explicitly asks for it.
- If an issue is ambiguous, unsafe or too broad, stop and comment with a precise blocker list instead of guessing.
- Do not edit generated files manually. Update the relevant source file and regenerate when required.

## Repository-specific implementation rules

- Use `pnpm`, not `npm` or `yarn`.
- Root validation commands are:
  - `pnpm run typecheck`
  - `pnpm run build`
- The OpenAPI contract under `lib/api-spec/openapi.yaml` is the source of truth for generated API packages.
- Database schema and migrations live under `lib/db` and must remain consistent with API/server changes.
- Public-facing pages must preserve accessibility, metadata quality and mobile readability.
- UI changes should preserve the project tone: civic, explanatory, transparent, non-partisan and non-accusatory.

## Pull request requirements

Every pull request should include:

1. the issue reference;
2. a concise summary of changes;
3. the files or modules touched;
4. validation commands run and their result;
5. screenshots or notes when UI changed;
6. residual limitations or follow-up needs;
7. a note on whether legal/methodological/copy safeguards were affected.

## Review priorities

Flag as high priority:

- broken typecheck or build;
- public routes without metadata or accessibility coverage;
- copy that implies misconduct without evidence;
- missing methodological caveats for indicators or dashboards;
- hard-coded data presented as official or complete;
- changes that weaken source traceability;
- broad refactoring unrelated to the issue;
- generated files edited manually.

## Codex operating rule

When invoked from an issue, Codex must create a dedicated branch named `codex/<issue-number>-<slug>`, commit changes there, and open a pull request targeting `main`. Delivery without a pull request is not a completed implementation state. Codex must not close the issue directly. The issue may be closed only after review confirms that the acceptance criteria are met and no follow-up issue is required.

## Same-response materialization contract

Codex must materialize its work in the same final response. Delayed materialization is not accepted.

Every final Codex response must contain exactly one of these outcomes:

1. **GitHub PR materialized**
   - PR URL
   - PR number
   - remote branch
   - full commit SHA
   - GitHub verification performed
   - issue linkage
   - scope check with changed files
2. **Fallback materializable output**
   - complete unified diff; or
   - complete contents of every modified file, including file paths
3. **Explicit technical blocker**
   - exact reason why no PR, branch, commit, patch or file contents can be provided.

A plain Summary is not an outcome. `created PR via make_pr` is not an outcome unless the public GitHub PR URL or number is included and verifiable. A short SHA, local branch, internal task link, or GitHub `blob` link that cannot pass repository verification is not an outcome.

If Codex cannot create a public PR, it must include the complete patch or full file contents in the same response under `Materialization`. If it cannot provide either a PR or patch/files, it must report a blocker and must not claim success.

Required final section:

```text
## Materialization

- PR URL:
- PR number:
- Remote branch:
- Full commit SHA:
- GitHub verification:
- Issue linkage:
- Scope check:
- If no PR exists: provide complete unified diff or complete contents of every modified file.
```

## Structured fallback bundle

When using fallback materialization, Codex must provide a machine-readable bundle. Prefer complete unified diff. If full file contents are safer, use exactly one block per file:

```text
FILE: path/from/repository/root.ts
ACTION: create|replace|delete
BEGIN_FILE
<complete file content, no omissions>
END_FILE
```

Fallback rules:

- no ellipses;
- no `(truncated)` markers;
- no omitted imports, omitted tests or partial snippets;
- no prose inside file blocks;
- include every modified file;
- if the bundle would be too long to provide completely, report a blocker instead of sending a partial fallback.

A final response without the `Materialization` section and a verifiable PR, complete fallback bundle or explicit blocker must be triaged as `output-without-PR` or `invalid-output`, must not count as an active slot, and must not be treated as completed work.

See also: `docs/automation/codex-materialization-by-design.md` and `docs/automation/codex-pr-materialization.md`.