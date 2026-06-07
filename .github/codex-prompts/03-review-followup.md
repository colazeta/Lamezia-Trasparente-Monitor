# Prompt template — 03 review outcome and route issue

Use this template for the third automation in the sequence.

```markdown
Review the current state of GitHub issue #{{ISSUE_NUMBER}} in `colazeta/Lamezia-Trasparente-Monitor`.

Issue title: {{ISSUE_TITLE}}
Issue labels: {{ISSUE_LABELS}}
Linked pull requests or candidate PRs:
{{LINKED_PRS}}

Issue acceptance criteria:
{{ACCEPTANCE_CRITERIA}}

Task:
1. determine whether a Codex implementation attempt exists;
2. determine whether a pull request exists and references the issue;
3. check whether the implementation appears to satisfy the acceptance criteria;
4. identify validation status if available;
5. identify whether the implementation changed copy/legal/methodological safeguards;
6. recommend one of the following outcomes:
   - `codex:review-needed`;
   - `codex:follow-up`;
   - `codex:blocked`;
   - `codex:done`.

Do not close the issue automatically unless the repository policy explicitly authorises automatic closure.

Output format:

### Review result

### Recommended label changes

### Closure recommendation
Close / Do not close yet

### Reason

### Follow-up comment to post
```markdown
...
```
```
