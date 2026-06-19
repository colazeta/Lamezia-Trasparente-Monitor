# Codex automations and repo-scoped skills

Issue reference: #556. This docs/ops layer is designed to be compatible with #553, #554, #555 and #557 without modifying public frontend routes, deploy configuration, workflows or open PR branches.

## Purpose

Lamezia Trasparente Monitor can use Codex as an operational assistant, but the stable remote control layer remains GitHub-native. The goal of this document is to define safe candidate automations and reusable repo-scoped skills for triage, PR babysitting, source safeguards, civic copy review, ledger updates and issue hygiene.

This layer does not replace human review, editorial/legal gates or CI. It only standardizes prompts and expected outputs for assisted work.

## GitHub Actions, Codex Automations and Codex Skills

| Layer | Role | Safe use in LTM | What it must not do |
| --- | --- | --- | --- |
| GitHub Actions | Stable remote automation that runs from GitHub events or schedules. | CI, build/typecheck gates, issue/PR metadata checks and workflow-backed validation from #555. | Replace human editorial/legal approval or publish sensitive content automatically. |
| Codex Automations | Assisted recurring operational loops driven by prompts and repository context. | PR babysitting, issue queue triage, morning control summaries and pre-release source/copy checks. | Merge, approve, auto-close issues, alter open PR branches, or bypass stop conditions. |
| Codex Skills | Versioned repo-scoped procedures used by Codex tasks and automations. | Encode common LTM guardrails for sources, copy, ledger, hygiene and PR/issue operations. | Become broad generic agents or override project safeguards. |

## Why GitHub Actions remains the stable remote layer

GitHub Actions remains the appropriate stable layer because it is remote, auditable, event-driven and independent of a local workstation. It can enforce repeatable checks on every relevant branch and PR, and it provides a durable status signal for reviewers.

Codex Automations are complementary. They can summarize, inspect, suggest and prepare small follow-ups, but their outputs should be treated as operational assistance rather than authoritative approval. Any automation that affects publishing, sensitive copy, merge state, source validation or issue closure requires a human gate.

## Repo-scoped skills

The initial skills live under `.agents/skills`:

- `$ltm-issue-triage` classifies issues as ready, blocked, scope-risk or overlap candidates.
- `$ltm-pr-babysitter` monitors PR status, CI, review feedback, scope and next safe action.
- `$ltm-source-safeguard` checks source, update date, verification level, limits and data state.
- `$ltm-civic-copy-review` checks public tone, overclaiming and cautious civic language.
- `$ltm-ledger-update` supports human gate ledger and founder control panel summaries.
- `$ltm-issue-hygiene` proposes non-destructive queue cleanup and overlap notes.

All skills share these explicit prohibitions: no merge, no approval, no auto-close and no publication of sensitive content.

## Candidate Codex Automations

### 1. PR babysitter

- **Skill:** `$ltm-pr-babysitter`.
- **Cadence:** every 2-4 hours while P0/P1 PRs are open, or manually when a reviewer asks for status.
- **Prompt shape:** check open PRs, CI, review feedback, scope, issue references and next safe step; only comment when there is a meaningful change or blocker.
- **Expected output:** concise PR status with CI, review, scope, issue linkage, next safe step and stop condition.
- **Stop conditions:** requested changes require code edits; CI is ambiguous; branch belongs to another active PR; scope touches frontend public routes, deploy, workflows or sensitive publication.
- **Human gates:** merge readiness, approval, changes to open PR branches, editorial/legal decisions.

### 2. Morning founder control panel

- **Skill:** `$ltm-ledger-update`.
- **Cadence:** once daily on active project days.
- **Prompt shape:** summarize what is mergeable, what needs editorial decision, what lacks source verification and what can proceed autonomously.
- **Expected output:** mobile-readable ledger update with PR/issue references and clear blockers.
- **Stop conditions:** uncertain source status, missing issue linkage, contradictory PR status or sensitive content risk.
- **Human gates:** prioritization changes, publication readiness, editorial/legal sign-off.

### 3. Issue queue triage

- **Skills:** `$ltm-issue-triage` and, when cleanup is requested, `$ltm-issue-hygiene`.
- **Cadence:** 1-2 times per day for P0/P1 queues, or manually before assigning Codex work.
- **Prompt shape:** classify issues, detect duplicate/overlap candidates and flag only meaningful status changes.
- **Expected output:** classification, reason, risks, next safe step and actions not to take now.
- **Stop conditions:** unclear acceptance criteria, missing source, legal/editorial ambiguity, overlap with active PRs or #568.
- **Human gates:** closing issues, changing priorities, merging duplicate candidates, broad scope expansion.

### 4. Source and public-copy guard

- **Skills:** `$ltm-source-safeguard` and `$ltm-civic-copy-review`.
- **Cadence:** manual or before v0 release gates; not high frequency.
- **Prompt shape:** inspect public copy, banners, cards, indicators, source notes and limits for cautious language and traceability.
- **Expected output:** `ok`, `ok with changes`, `blocked-editorial` or `blocked-legal/human`, with specific text risks and source gaps.
- **Stop conditions:** missing source/update date, demo data presented as verified, copy implying misconduct, or sensitive publication risk.
- **Human gates:** legal/editorial sign-off, sensitive public copy, unresolved source limitations.

## Safe automation boundaries

Safe Codex automations are low-frequency, inspect-and-suggest loops. They may produce comments, status summaries, checklist findings, small docs-only follow-ups or explicit blockers. They must not perform irreversible repository or GitHub actions.

Do not create high-frequency automations. Do not use Codex Automations as a substitute for GitHub Actions from #555. Do not use them to modify the public frontend, deployment settings, routes, Cloudflare settings, Vite config, `_redirects` or files under `artifacts/lamezia-trasparente/` unless a future issue explicitly authorizes that scope.

## Global stop conditions

Stop and ask for human review when any of these apply:

- the task could affect public claims, legal interpretation or sensitive civic content;
- source, update date, verification level or data status is missing;
- copy could imply wrongdoing, corruption, favouritism, mafia infiltration or individual responsibility;
- the requested action would merge, approve, close, publish or alter an open PR branch;
- the diff would touch public routes, deploy configuration, workflows or #568-related work outside the issue scope;
- acceptance criteria are unclear or conflict with repository safeguards.

## Human gates

Human approval is required for:

- merges and approvals;
- issue closure or duplicate consolidation;
- editorial/legal decisions;
- source completeness claims;
- publication of sensitive content;
- priority changes or scope expansion;
- any release decision affecting public-facing content.

## Compatibility notes

- **#553:** this layer supports the GitHub-native control tower and does not replace it.
- **#554:** source and copy skills preserve civic safeguards and verification limits.
- **#555:** workflows remain separate; this PR creates no GitHub Actions workflows.
- **#557:** ledger and control-panel summaries remain human-gated and non-authoritative.
- **#568:** this layer must not interfere with #568 or modify its branch, files or review path.
