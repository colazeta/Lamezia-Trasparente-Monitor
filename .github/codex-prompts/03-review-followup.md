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
3. detect delivery without PR and capture the exact reported reason, branch/diff, commit SHA or blocker;
4. classify any generic summary without a GitHub-visible PR, GitHub-visible branch plus recent commit SHA, reviewable diff/execution artifact or explicit technical blocker as `output-without-PR`;
5. detect stale zombie tasks only after the grace window: `codex:invoked` or `codex:working` for more than 60 minutes since the latest operative event with no PR, branch, Codex comment, commit or other concrete activity;
6. check whether the implementation appears to satisfy the acceptance criteria;
7. identify validation status if available;
8. identify whether the implementation changed copy/legal/methodological safeguards;
9. recommend one of the following outcomes:
   - `codex:review-needed` when a PR exists and needs human review/merge;
   - `codex:follow-up` when no PR exists, delivery without PR needs recovery, the task is stale, validation is failing, or the implementation is incomplete;
   - `codex:blocked` when a concrete safety, permission, credential or collision blocker prevents continuation;
   - `codex:done` only after review/merge evidence indicates the issue appears solved.

Materialization gate:
- Count open issues/PRs with `materialization:required`, `fallback-bundle-incomplete`, `output-without-PR`, `invalid-output`, `local-only` or `needs-materialization-verification`.
- If the count is greater than 5, recommend only materialization verification, manual UI/export recovery, split-required cleanup, blocker stabilization, stale-label cleanup or PR rebase/recovery/supersede; do not recommend a new ordinary Codex invocation.

Queue rules:
- `codex:ready` is not active work and must not be counted as an occupied slot.
- `codex:review-needed` is human review/merge wait and does not saturate Codex capacity unless there is concrete file/module collision or Codex-side rework.
- Open PRs, pending reviews and PRs/issues waiting only for Giovanni review or merge are outside the queue capacity count and block only candidate work touching the same files/modules or creating a concrete implementation collision.
- Compute remaining capacity as `10 - (real active Codex operational tasks + reserved fresh codex:prompted slots awaiting invocation)`; do not subtract human-review-pending items.
- A newly prepared `codex:prompted` issue is not stale merely because it has no PR yet. Treat it as a reserved pending slot awaiting invocation until an operative `@codex` invocation exists or the prompt is older than 60 minutes with no invocation or cleanup action.
- Moving a stale, failed no-PR or `output-without-PR` task to `codex:follow-up` releases operational capacity.
- A concrete technical blocker is reviewable evidence but not active work. Route it to `codex:blocked` or `codex:follow-up`, preserve the exact blocker details, and release the active slot.
- If a claimed PR or branch is not visible on GitHub, require the direct PR URL, exact branch ref and commit SHA before counting the task as active, or require a precise blocker before routing it to `codex:blocked` / `codex:follow-up` and releasing capacity.
- Preserve no-auto-merge and no-auto-close policy.

Do not close the issue automatically unless the repository policy explicitly authorises automatic closure. The current policy is to recommend closure only after human review.

Output format:

### Review result

### Derived operational state
- State:
- Evidence used and age:
- Stale label cleanup needed:

### PR and branch status

### Stale-task and output-without-PR check

### Recommended label changes

### Materialization status
- PR verified: yes/no
- Fallback complete: yes/no
- Truncation marker present: yes/no
- Canonical state: pr-open / ready-for-human-merge / needs-rebase / ci-pending / ci-failed / review-needed / scope-risk / complete-diff-provided / small-file-bundle-complete / fallback-bundle-incomplete / output-without-PR / invalid-output / local-only / manual-ui-recoverable / split-required / blocked-stable / needs-human-decision / superseded / duplicate / archivable

### Capacity effect

### Closure recommendation
Close / Do not close yet

### Reason

### Follow-up comment to post
```markdown
...
```
````
