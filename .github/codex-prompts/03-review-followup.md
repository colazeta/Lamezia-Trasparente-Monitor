# Prompt template — 03 review outcome and route issue

Use this template for the third automation in the sequence.

````markdown
Review the current state of GitHub issue #{{ISSUE_NUMBER}} in `colazeta/Lamezia-Trasparente-Monitor`.

Issue title: {{ISSUE_TITLE}}
Issue labels: {{ISSUE_LABELS}}
Linked pull requests or candidate PRs:
{{LINKED_PRS}}
Recent branches, commits, Codex comments or activity:
{{RECENT_ACTIVITY}}
Issue acceptance criteria:
{{ACCEPTANCE_CRITERIA}}

Task:
1. determine whether a Codex implementation attempt exists;
2. determine whether a pull request exists, targets `main`, uses a `codex/{{ISSUE_NUMBER}}-<slug>` branch and references the issue;
3. detect delivery without PR and capture the exact reported reason, branch/diff or blocker;
4. detect stale zombie tasks: `codex:invoked` or `codex:working` for more than 60 minutes with no PR, branch, Codex comment, commit or other concrete activity;
5. check whether the implementation appears to satisfy the acceptance criteria;
6. identify validation status if available;
7. identify whether the implementation changed copy/legal/methodological safeguards;
8. recommend one of the following outcomes:
   - `codex:review-needed` when a PR exists and needs human review/merge;
   - `codex:follow-up` when no PR exists, delivery without PR needs recovery, the task is stale, validation is failing, or the implementation is incomplete;
   - `codex:blocked` when a concrete safety, permission, credential or collision blocker prevents continuation;
   - `codex:done` only after review/merge evidence indicates the issue appears solved.

Queue rules:
- `codex:review-needed` is human review/merge wait and does not saturate Codex capacity unless there is concrete file/module collision or Codex-side rework.
- PRs/issues waiting only for Giovanni review or merge are outside the queue capacity count and block only candidate work touching the same files/modules.
- Compute remaining capacity as `5 - real active Codex operational tasks`; do not subtract human-review-pending items.
- Moving a stale or failed no-PR task to `codex:follow-up` releases operational capacity.
- Preserve no-auto-merge and no-auto-close policy.

Do not close the issue automatically unless the repository policy explicitly authorises automatic closure. The current policy is to recommend closure only after human review.

Output format:

### Review result

### PR and branch status

### Stale-task check

### Recommended label changes

### Capacity effect

### Closure recommendation
Close / Do not close yet

### Reason

### Follow-up comment to post
```markdown
...
```
````
