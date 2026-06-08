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

When invoked from an issue, Codex must create a dedicated branch named `codex/<issue-number>-<slug>`, commit changes there, and open a pull request targeting `main`. Delivery without a pull request is not a completed implementation state. A Codex summary that is not backed by a visible PR, a visible branch with a recent commit, an explicit technical blocker, or another reviewable execution artifact is `output-without-PR` and must not count as a real active slot. If Codex cannot open a pull request, it must comment on the issue with the exact technical reason and indicate the branch ref, commit SHA, diff location or blocker that can be verified by a reviewer. Codex must not close the issue directly. The issue may be closed only after review confirms that the acceptance criteria are met and no follow-up issue is required.
