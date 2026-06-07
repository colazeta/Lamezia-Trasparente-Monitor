# Prompt template — 01 explore issue and prepare implementation prompt

Use this template for the first automation in the sequence.

````markdown
You are preparing a Codex implementation prompt for `colazeta/Lamezia-Trasparente-Monitor`.

Read the GitHub issue below and produce a precise implementation prompt, but do not invoke Codex yet.

Issue number: {{ISSUE_NUMBER}}
Issue title: {{ISSUE_TITLE}}
Issue labels: {{ISSUE_LABELS}}
Issue body:
{{ISSUE_BODY}}

Repository context:
- Monorepo using pnpm.
- Public web app: `artifacts/lamezia-trasparente`.
- Mobile app: `artifacts/lamezia-mobile`.
- API server: `artifacts/api-server`.
- API contract: `lib/api-spec/openapi.yaml`.
- DB schema/migrations: `lib/db`.
- Do not edit generated files manually.
- Before posting any operational comment, apply the comment cleanup preflight defined in `docs/automation/codex-issue-ops.md`.

Queue model:
- Maximum operational Codex capacity is 5 tasks.
- `codex:prompted`, `codex:invoked` and `codex:working` are operational states.
- `codex:review-needed` is human review/merge wait and does not saturate Codex capacity unless there is concrete file/module collision or Codex-side rework.
- Do not prepare a prompt that would exceed capacity 5 or create unresolved collision risk.

Task:
1. classify the issue as one of: technical, UI/accessibility/metadata, civic-methodological, copy/legal tone, data/API/schema, backlog/governance, unsafe/manual;
2. confirm whether the issue thread is clean, cleaned, or blocked by unresolved contradictory comments;
3. extract the objective;
4. define narrow acceptance criteria;
5. identify probable scope;
6. identify likely files/modules to inspect;
7. classify collision risk as `low`, `medium` or `high` and explain the reason;
8. define validation commands;
9. add civic/legal/copy safeguards where relevant;
10. require a dedicated branch named `codex/{{ISSUE_NUMBER}}-<slug>` and a pull request targeting `main` as mandatory Codex output;
11. include fallback instructions requiring Codex to comment with the exact technical reason, branch/diff or blocker if a PR cannot be opened;
12. produce a final `@codex` prompt ready to be posted as a GitHub comment only if the cleanup preflight passed.

Safety rules:
- If the issue is ambiguous, too broad, legally sensitive or potentially accusatory, do not produce an implementation prompt. Produce a blocker comment instead.
- If the issue is backlog/governance, prefer a triage prompt or analysis-only prompt, not a direct implementation prompt.
- If the thread contains unresolved contradictory automation comments, produce a follow-up/blocker comment instead of an implementation prompt.
- Keep the resulting task narrow and reviewable.
- Preserve the no-auto-merge and no-auto-close policy.

Output format:

### Classification

### Cleanup preflight

### Capacity and collision check
- Probable scope:
- Likely files/modules:
- Collision risk: low / medium / high
- Capacity impact:

### Decision
Proceed / Block / Human review needed

### Reason

### Final comment to post
```markdown
@codex

Work on GitHub issue #{{ISSUE_NUMBER}} in `colazeta/Lamezia-Trasparente-Monitor`.

Create branch `codex/{{ISSUE_NUMBER}}-<slug>`, commit your changes there, and open a pull request targeting `main`. If you cannot open the pull request, comment on the issue with the exact technical reason and indicate the branch/diff or blocker.
...
```
````
