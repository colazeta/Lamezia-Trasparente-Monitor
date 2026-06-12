# Prompt template — 02 invoke Codex

Use this template for the second automation in the sequence.

This template is goal-shaped even when the GitHub `@codex` surface does not support literal slash commands such as `/goal`. The contract below is intended to make Codex work as one coherent implementation run, with internal checkpoints, validation persistence and an explicit materialization or manual-recovery outcome.

See also: `docs/automation/codex-goal-driven-manual-materialization.md`.

## Pre-invocation materialization debt gate

Automation must evaluate this gate before rendering or posting the `@codex` invocation below.

- Confirm materialization debt is 5 or fewer before posting an ordinary invocation.
- The only allowed exceptions are materialization verification, manual UI/export recovery, split-required cleanup, blocker stabilization, or PR rebase/recovery/supersede work.
- Materialization debt labels/states are `materialization:required`, `fallback-bundle-incomplete`, `output-without-PR`, `invalid-output`, `local-only` and `needs-materialization-verification`.
- If debt is greater than 5 and the task is ordinary technical/platform work, do not post the invocation. Post a debt-gate blocker/handoff instead, so `@codex` is never the first line before the stop condition is evaluated.

Only after the pre-invocation gate passes or an allowed exception applies, post the prompt body below.

````markdown
@codex

Work on GitHub issue #{{ISSUE_NUMBER}} in `colazeta/Lamezia-Trasparente-Monitor`.

Issue title: {{ISSUE_TITLE}}

Goal-mode execution contract:
- Complete this issue as one coherent implementation run, not as analysis-only work and not as a shallow one-turn summary.
- Do not stop after partial progress. Continue until all acceptance criteria are satisfied, or until a precise stop condition below applies.
- Use internal checkpoints rather than splitting the task into separate issues, unless reviewability, collision risk or materialization safety would otherwise fail.
- Treat the objective, acceptance criteria, probable scope, likely files, collision decision, repository rules, validation requirements and stop conditions below as hard boundaries.
- Do not claim repository completion unless the final response contains a valid materialization outcome.

Objective:
{{OBJECTIVE}}

Acceptance criteria:
{{ACCEPTANCE_CRITERIA}}

Probable scope:
{{PROBABLE_SCOPE}}

Likely files/modules to inspect:
{{LIKELY_FILES}}

Internal checkpoints:
1. Read `AGENTS.md` and any relevant repository governance docs before editing.
2. Inspect the likely files/modules and confirm the narrow implementation boundary.
3. Map every acceptance criterion to concrete file changes, validation evidence or an explicit non-applicability note.
4. Implement the smallest coherent end-to-end change that satisfies the acceptance criteria.
5. Run the relevant validation commands for the changed package/module.
6. If validation fails, inspect the root cause, attempt targeted fixes where feasible and rerun the relevant checks.
7. Materialize the result through a verified PR, or produce a complete fallback or manual-materialization-ready blocker handoff as described below.

Execution effort contract:
- This is a full implementation run. Do not stop at planning, repository inspection or a prose-only recommendation.
- Do not reduce effort by creating separate follow-up issues unless the current task is too broad to review, unsafe to combine or impossible to materialize safely.
- Prefer one reviewable branch and one PR for a coherent macro-task touching a bounded set of files/modules.
- If the work becomes larger than the prompt can safely materialize without a PR, continue only if a verified PR can be opened or a manual-materialization-ready handoff can be produced.

Collision risk:
{{COLLISION_RISK}}

Collision matrix decision:
- High: same generated files, API contract, DB schema/migrations, generated clients, runtime file/module, prompt/doc section or public copy/legal/methodological text; stop unless human accepted the risk.
- Medium: same package/domain with distinct files and compatible criteria; continue only with narrow scope and explicit collision note.
- Low: unrelated files/modules or unrelated human-review PRs needing no Codex-side rework; continue when other safeguards pass.

Materialization debt gate:
- This invocation assumes the pre-invocation materialization debt gate above has already passed, or that an allowed exception applies.
- Do not use this prompt body as the first place where the debt stop condition is evaluated.

Capacity context:
- Capacity 5 is computed only on real active Codex tasks backed by evidence.
- `codex:ready` is eligible backlog only and does not count as active work.
- Count `codex:prompted`, `codex:invoked` or `codex:working` only when supported by recent invocation, branch/task/commit, validation, diff, open PR needing Codex-side changes, explicit blocker or in-progress Codex response.
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

Civic and election safeguards:
- For election, civic, public-administration or transparency work, do not introduce factual claims unless they are already present in authorised source data or explicitly required by the issue.
- Do not infer misconduct, manipulation, irregularity, intent, favouritism, corruption, mafia infiltration or individual responsibility from administrative or electoral data.
- Distinguish indicators, signals, patterns, data gaps and verification needs from factual conclusions.
- List any public-facing copy, legal, methodological or source-traceability change separately in the PR or manual handoff.

Validation:
- Run the most relevant checks for the changed package/module.
- When feasible, run:
  - `pnpm run typecheck`
  - `pnpm run build`
- If validation cannot be run, explain the exact reason and classify any residual risk.

Branch and pull request requirements:
- Create a dedicated branch named `codex/{{ISSUE_NUMBER}}-{{ISSUE_SLUG}}`.
- Commit your changes on that branch.
- Open a pull request targeting `main` and referencing issue #{{ISSUE_NUMBER}}; this PR is mandatory for completed repository delivery.
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
- The final response must contain a `Materialization` section with either a verified PR URL/number, a complete unified diff directly applicable from `main`, a complete small FILE/ACTION/BEGIN_FILE/END_FILE bundle, or an explicit technical blocker.
- Prefer a complete unified diff over full-file bundles when no PR exists and the full diff can be emitted safely.
- Do not emit partial fallback content: no ellipses, no `(truncated)`, no omitted hunks and no local-only commit as proof.
- If the implementation is complete but automatic GitHub materialization fails, produce a `manual-materialization-ready` handoff inside the explicit blocker outcome. This is not completed repository delivery; it is a recovery package for Giovanni to materialize manually from the Codex/Dialogo output.
- The `manual-materialization-ready` handoff must include:
  - state: `manual-materialization-ready`;
  - issue number and issue title;
  - objective and acceptance criteria addressed;
  - exact files changed, created or deleted;
  - implementation summary at file/module level;
  - validation commands run and their results;
  - known failures, residual limitations and whether they are related to this issue;
  - generated-file, API contract, database, copy/legal/methodological and source-traceability impact;
  - suggested branch name;
  - suggested PR title and PR body;
  - exact instructions for Giovanni to materialize the changes manually from the Codex/Dialogo output.
- If the response channel cannot carry a complete diff or bundle, do not paste a partial fallback. Report the materialization blocker and include the manual-materialization-ready handoff fields above.
- Do not present delivery without a PR as completed repository work; a summary without PR URL/number, complete fallback, manual-materialization-ready blocker handoff or explicit blocker is `output-without-PR` and must be routed to follow-up.

Stop conditions:
- If the issue is ambiguous, comment with the precise missing information instead of guessing.
- If the implementation would require secrets, credentials or unsupported factual claims, stop and explain.
- If another open PR, recent Codex branch/task or review-wait item already touches the same files/modules in a conflicting way, stop and report the concrete collision.
- Do not stop merely because another PR is waiting for Giovanni review/merge when it is non-colliding and needs no Codex-side rework.
- If you cannot open the mandatory PR to `main`, create the required branch, produce a complete fallback or produce a manual-materialization-ready blocker handoff, stop and report the exact technical blocker.
````
