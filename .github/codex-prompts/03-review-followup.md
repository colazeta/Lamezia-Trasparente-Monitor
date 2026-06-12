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
11. recommend one of the following outcomes:

- remove or neutralise stale `codex:ready` when a PR, blocker, supersession or completed outcome means the issue is no longer eligible backlog;
- `codex:review-needed` when a PR exists and needs human review/merge;
- `codex:follow-up` when no PR exists, delivery without PR needs recovery, the task is stale, validation is failing, or the implementation is incomplete;
- `codex:blocked` when a concrete safety, permission, credential or collision blocker prevents continuation;
- `codex:done` only after review/merge evidence indicates the issue appears solved.

Operational decision for Giovanni:

- The follow-up comment must include a final section titled `## Decisione operativa per Giovanni`.
- The section must report Task Codex, PR/branch, PR state, CI, scope, decision and exactly one concrete action for Giovanni.
- Use the template below and preserve every field, using `non disponibile / non verificata`, `nessuna PR verificabile`, `non verificato` or `non verificabile` when evidence is missing.
- Do not classify a conflicting PR, `mergeable: false` PR, failed-CI PR, stale branch, unverifiable output, scope-risk PR or superseded PR as generic `codex:review-needed` without an explicit `NON MERGIARE`, `RIGENERARE DA MAIN` or `CHIUDERE COME SUPERSEDED` decision.
- Use `ATTENDERE` for pending CI, recoverable draft PRs, missing content review, or decisions that require Giovanni before safe routing.
- The decision section must not authorize merge, approval, auto-merge or automatic issue/PR closure.

Required decision template:

```markdown
## Decisione operativa per Giovanni

- Task Codex: <link diretto alla Task Codex, oppure `non disponibile / non verificata`>
- PR GitHub: #<numero> / <link>, oppure `nessuna PR verificabile`
- Branch: `<branch>`, oppure `non verificato`
- Stato PR: `mergeable` / `conflict-on-creation` / `needs-rebase` / `ci-pending` / `ci-failed` / `draft` / `superseded` / `non verificabile`
- CI: `success` / `failure` / `pending` / `not run` / `non verificata`
- Scope: `ok` / `scope-risk` / `troppo ampia` / `non verificato`
- Decisione: `MERGIARE` / `NON MERGIARE` / `ATTENDERE` / `RIGENERARE DA MAIN` / `CHIUDERE COME SUPERSEDED`
- Azione richiesta a Giovanni: <una sola azione concreta, oppure `nessuna azione richiesta`>
- Motivo sintetico: <1-3 righe>
```

Materialization gate:

- Count open issues/PRs with `materialization:required`, `fallback-bundle-incomplete`, `output-without-PR`, `invalid-output`, `local-only` or `needs-materialization-verification`.
- If the count is greater than 5, recommend only materialization verification, manual UI/export recovery, split-required cleanup, blocker stabilization, stale-label cleanup or PR rebase/recovery/supersede; do not recommend a new ordinary Codex invocation.

Queue rules:

- `codex:ready` is not active work and must not be counted as an occupied slot.
- `codex:review-needed` is human review/merge wait and does not saturate Codex capacity unless there is concrete file/module collision or Codex-side rework.
- PRs/issues waiting only for Giovanni review or merge are outside the queue capacity count and block only candidate work touching the same files/modules.
- Compute remaining capacity as `5 - real active Codex operational tasks`; do not subtract human-review-pending items.
- Moving a stale or failed no-PR task to `codex:follow-up` releases operational capacity.
- `output-without-PR` is not active work; it must not be promoted to review or done without verified PR, branch, explicit blocker or reviewable execution evidence.
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

## Decisione operativa per Giovanni

- Task Codex: <link diretto alla Task Codex, oppure `non disponibile / non verificata`>
- PR GitHub: #<numero> / <link>, oppure `nessuna PR verificabile`
- Branch: `<branch>`, oppure `non verificato`
- Stato PR: `mergeable` / `conflict-on-creation` / `needs-rebase` / `ci-pending` / `ci-failed` / `draft` / `superseded` / `non verificabile`
- CI: `success` / `failure` / `pending` / `not run` / `non verificata`
- Scope: `ok` / `scope-risk` / `troppo ampia` / `non verificato`
- Decisione: `MERGIARE` / `NON MERGIARE` / `ATTENDERE` / `RIGENERARE DA MAIN` / `CHIUDERE COME SUPERSEDED`
- Azione richiesta a Giovanni: <una sola azione concreta, oppure `nessuna azione richiesta`>
- Motivo sintetico: <1-3 righe>
```
````
