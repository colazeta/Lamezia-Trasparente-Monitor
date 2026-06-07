# Prompt template — 01 explore issue and prepare implementation prompt

Use this template for the first automation in the sequence.

```markdown
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

Task:
1. classify the issue as one of: technical, UI/accessibility/metadata, civic-methodological, copy/legal tone, data/API/schema, backlog/governance, unsafe/manual;
2. confirm whether the issue thread is clean, cleaned, or blocked by unresolved contradictory comments;
3. extract the objective;
4. define narrow acceptance criteria;
5. identify likely files/modules to inspect;
6. define validation commands;
7. add civic/legal/copy safeguards where relevant;
8. produce a final `@codex` prompt ready to be posted as a GitHub comment only if the cleanup preflight passed.

Safety rules:
- If the issue is ambiguous, too broad, legally sensitive or potentially accusatory, do not produce an implementation prompt. Produce a blocker comment instead.
- If the issue is backlog/governance, prefer a triage prompt or analysis-only prompt, not a direct implementation prompt.
- If the thread contains unresolved contradictory automation comments, produce a follow-up/blocker comment instead of an implementation prompt.
- Keep the resulting task narrow and reviewable.

Output format:

### Classification

### Cleanup preflight

### Decision
Proceed / Block / Human review needed

### Reason

### Final comment to post
```markdown
@codex
...
```
```