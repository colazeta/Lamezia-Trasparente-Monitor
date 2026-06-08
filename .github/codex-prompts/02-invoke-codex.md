# Prompt template — 02 invoke Codex

Use this template for the second automation in the sequence.

````markdown
@codex

Work on GitHub issue #{{ISSUE_NUMBER}} in `colazeta/Lamezia-Trasparente-Monitor`.

Issue title: {{ISSUE_TITLE}}

Objective:
{{OBJECTIVE}}

Acceptance criteria:
{{ACCEPTANCE_CRITERIA}}

Probable scope:
{{PROBABLE_SCOPE}}

Likely files/modules to inspect:
{{LIKELY_FILES}}

Collision risk:
{{COLLISION_RISK}}

Capacity context:
- Capacity 5 is computed only on real active Codex tasks.
- Issues or PRs waiting only for Giovanni review/merge, including `codex:review-needed`, are outside the capacity count.
- A human-review-pending PR blocks this invocation only when it touches the same files/modules or creates a concrete implementation collision.
- A prior Codex summary without an open PR to `main`, visible branch, explicit blocker or recent execution evidence is `output-without-PR`; it is stale follow-up, not a real active slot.

Repository rules:
- Follow `AGENTS.md`.
- Keep the implementation strictly scoped to this issue.
- Do not introduce unrelated refactoring.
- Use `pnpm`; do not use npm or yarn.
- Do not edit generated files manually.
- Preserve the civic, cautious and non-accusatory tone of the project.
- Treat indicators as transparency and risk-screening signals, not as proof of wrongdoing.
- Preserve methodological caveats, source limitations and legal notes.

Validation:
- Run the most relevant checks for the changed package/module.
- When feasible, run:
  - `pnpm run typecheck`
  - `pnpm run build`

Branch and pull request requirements:
- Create a dedicated branch named `codex/{{ISSUE_NUMBER}}-{{ISSUE_SLUG}}`.
- Commit your changes on that branch.
- Open a pull request targeting `main` and referencing issue #{{ISSUE_NUMBER}}; this PR is mandatory for completed delivery.
- In the PR description, include:
  - summary;
  - files/modules changed;
  - validation commands run and results;
  - screenshots or notes if UI changed;
  - residual limitations;
  - whether copy/legal/methodological safeguards were affected.
- Do not auto-merge the PR.
- Do not close the issue directly.

Fallback if PR creation fails:
- Comment on issue #{{ISSUE_NUMBER}} with the exact technical reason the PR could not be opened.
- Include the branch name, diff location or precise blocker.
- Do not present delivery without a PR as completed work; a summary without PR, visible branch, explicit blocker or recent execution evidence is `output-without-PR` and must be routed to follow-up.

Stop conditions:
- If the issue is ambiguous, comment with the precise missing information instead of guessing.
- If the implementation would require secrets, credentials or unsupported factual claims, stop and explain.
- If another open PR already touches the same files/modules in a conflicting way, stop and report the concrete collision.
- Do not stop merely because another PR is waiting for Giovanni review/merge when it is non-colliding and needs no Codex-side rework.
- If you cannot open the mandatory PR to `main`, create the required branch or produce a reviewable diff, stop and report the exact technical blocker.
````
