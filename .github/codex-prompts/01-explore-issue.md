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

Task:
1. classify the issue as one of: technical, UI/accessibility/metadata, civic-methodological, copy/legal tone, data/API/schema, backlog/governance, unsafe/manual;
2. extract the objective;
3. define narrow acceptance criteria;
4. identify likely files/modules to inspect;
5. define validation commands;
6. add civic/legal/copy safeguards where relevant;
7. produce a final `@codex` prompt ready to be posted as a GitHub comment.

Safety rules:
- If the issue is ambiguous, too broad, legally sensitive or potentially accusatory, do not produce an implementation prompt. Produce a blocker comment instead.
- If the issue is backlog/governance, prefer a triage prompt or analysis-only prompt, not a direct implementation prompt.
- Keep the resulting task narrow and reviewable.

Output format:

### Classification

### Decision
Proceed / Block / Human review needed

### Reason

### Final comment to post
```markdown
@codex
...
```
```
