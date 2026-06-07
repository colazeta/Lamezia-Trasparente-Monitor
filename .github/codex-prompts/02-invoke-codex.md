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
- Open a pull request targeting `main` and referencing issue #{{ISSUE_NUMBER}}.
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
- Do not present delivery without a PR as completed work.

Stop conditions:
- If the issue is ambiguous, comment with the precise missing information instead of guessing.
- If the implementation would require secrets, credentials or unsupported factual claims, stop and explain.
- If another open PR already touches the same files in a conflicting way, stop and report the collision.
- If you cannot create the required branch or produce a reviewable diff, stop and report the exact technical blocker.
````
