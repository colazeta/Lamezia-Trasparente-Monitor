# Prompt template — 03 review outcome and route issue

Use this template for the third automation in the sequence.

Merge-routing reference: `docs/automation/trusted-auto-merge.md`.

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
1. derive the issue state as `idle`, `candidate`, `ready`, `invoked`, `working`, `pr-open`, `blocked`, `stale`, `completed-by-pr` or `superseded` from labels plus evidence;
2. determine whether a Codex implementation attempt exists;
3. determine whether a pull request exists, targets `main`, uses a `codex/{{ISSUE_NUMBER}}-<slug>` branch and references the issue;
4. detect delivery without PR and capture the exact reported reason, branch/diff or blocker;
5. classify any summary without an open PR to `main`, complete non-truncated fallback, visible `codex/{{ISSUE_NUMBER}}-<slug>` branch, explicit blocker or recent execution evidence as `output-without-PR`;
6. detect stale zombie tasks: `codex:prompted`, `codex:invoked` or `codex:working` with no PR, branch, explicit blocker, commit, validation log, diff location or other concrete activity;
7. classify declared fallback content with `...`, `(truncated)`, omitted sections, missing files or unparseable file blocks as `fallback-bundle-incomplete` plus `output-without-PR`;
8. check whether the implementation appears to satisfy the acceptance criteria;
9. identify validation status if available;
10. identify whether the implementation changed copy/legal/methodological safeguards;
11. classify merge routing from the actual PR diff and labels: trusted-auto-merge eligible / manual-review / not yet determinable;
12. recommend one of the following outcomes:
   - remove or neutralise stale `codex:ready` when a PR, blocker, supersession or completed outcome means the issue is no longer eligible backlog;
   - keep the issue in `pr-open`/check-wait when a routine PR is eligible for trusted auto-merge and no Codex-side work remains;
   - `codex:review-needed` when the PR actually requires human review/merge because of protected paths, explicit manual labels, sensitive scope or another concrete manual gate;
   - `codex:follow-up` when no PR exists, delivery without PR needs recovery, the task is stale, validation is failing, or the implementation is incomplete;
   - `codex:blocked` when a concrete safety, permission, credential or collision blocker prevents continuation;
   - `codex:done` only after verified merge/review evidence indicates the issue appears solved.

Materialization gate:
- Count open issues/PRs with `materialization:required`, `fallback-bundle-incomplete`, `output-without-PR`, `invalid-output`, `local-only` or `needs-materialization-verification`.
- If the count is greater than 5, recommend only materialization verification, manual UI/export recovery, split-required cleanup, blocker stabilization, stale-label cleanup or PR rebase/recovery/supersede; do not recommend a new ordinary Codex invocation.

Queue rules:
- `codex:ready` is not active work and must not be counted as an occupied slot.
- `codex:review-needed` is human review/merge wait and does not saturate Codex capacity unless there is concrete file/module collision or Codex-side rework. Apply it only when human review is actually required.
- PRs/issues waiting only for Giovanni review or merge are outside the queue capacity count and block only candidate work touching the same files/modules.
- A trusted-auto-merge-eligible PR waiting only for required checks is also outside Codex active capacity when no Codex-side work remains.
- Compute remaining capacity as `5 - real active Codex operational tasks`; do not subtract human-review-pending or trusted-check-wait items.
- Moving a stale or failed no-PR task to `codex:follow-up` releases operational capacity.
- `output-without-PR` is not active work; it must not be promoted to review or done without verified PR, branch, explicit blocker or reviewable execution evidence.
- Preserve controlled merge routing: never bypass checks, rulesets, protected paths or explicit manual labels. Routine eligible PRs may be auto-merged only by the repository's trusted workflow. Preserve no-auto-close policy.

Do not close the issue automatically unless the repository policy explicitly authorises automatic closure. The current policy is to recommend closure only after verified completion evidence.

Output format:

### Review result

### Derived operational state
- State:
- Evidence used and age:
- Stale label cleanup needed:

### PR and branch status

### Merge routing
- Classification: trusted-auto-merge eligible / manual-review / not yet determinable
- Manual labels present:
- Protected path detected:
- Required checks status:

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
