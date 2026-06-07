# Prompt template — 02 invoke Codex

Use this template for the second automation in the sequence.

```markdown
@codex

Work on GitHub issue #{{ISSUE_NUMBER}} in `colazeta/Lamezia-Trasparente-Monitor`.

Issue title: {{ISSUE_TITLE}}

Objective:
{{OBJECTIVE}}

Acceptance criteria:
{{ACCEPTANCE_CRITERIA}}

Likely files/modules to inspect:
{{LIKELY_FILES}}

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

Pull request requirements:
- Create a dedicated branch.
- Open a pull request referencing issue #{{ISSUE_NUMBER}}.
- In the PR description, include:
  - summary;
  - files/modules changed;
  - validation commands run;
  - screenshots or notes if UI changed;
  - residual limitations;
  - whether copy/legal/methodological safeguards were affected.

Stop conditions:
- If the issue is ambiguous, comment with the precise missing information instead of guessing.
- If the implementation would require secrets, credentials or unsupported factual claims, stop and explain.
- If another open PR already touches the same files in a conflicting way, stop and report the collision.
```
