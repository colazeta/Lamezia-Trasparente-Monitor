# Prompt template — 04 queue governor and collision control

Use this template for the optional fourth automation.

```markdown
Assess the Codex automation queue for `colazeta/Lamezia-Trasparente-Monitor`.

Scope:
- open issues with labels matching `codex:*`;
- open pull requests related to Codex work;
- recent Codex comments, if available;
- recent CI/typecheck/build failures, if available.

Task:
1. count active Codex tasks;
2. identify issues with `codex:working` but no visible PR;
3. identify issues with multiple overlapping Codex attempts;
4. identify open PRs touching the same files or solving overlapping issues;
5. identify stale tasks that need `codex:follow-up` or `codex:blocked`;
6. recommend whether the queue should continue, pause or require human intervention.

Default queue limits:
- maximum active Codex tasks: 2;
- maximum active task touching API/schema/migrations: 1;
- maximum active task touching public copy/legal/methodological notes: 1;
- do not start new tasks if root typecheck or build is failing because of a recent Codex PR.

Output format:

### Queue status
Continue / Pause / Human intervention required

### Active tasks

### Collision risks

### Recommended label changes

### Comment to post, if needed
```markdown
...
```
```
