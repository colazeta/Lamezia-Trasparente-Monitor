# Trusted PR auto-merge policy

This document is the canonical merge-routing policy for `colazeta/Lamezia-Trasparente-Monitor`.

The repository uses a controlled trusted auto-merge workflow for routine pull requests. Auto-merge is a merge-routing mechanism, not a bypass: the `Protect main` ruleset and its required checks remain authoritative.

Where older automation documentation says that every Codex pull request must wait for a human merge or that Codex work may never auto-merge, this document supersedes that blanket rule. Human merge remains mandatory for protected or explicitly manual work; routine eligible PRs may be merged automatically by `.github/workflows/trusted-auto-merge.yml` after all repository gates are satisfied.

## Eligibility model

A pull request is eligible for trusted auto-merge only when all of the following are true:

1. it targets `main`;
2. it comes from the same repository, not a fork;
3. it is not a draft;
4. its branch is in a trusted routine family **or** it carries the explicit `automerge:allow` opt-in label;
5. it carries none of the explicit manual-review labels;
6. none of its changed files match a protected path;
7. the required `Protect main` checks complete successfully;
8. the branch can be updated from `main` without an unresolved conflict.

Auto-merge uses squash merge. It does not grant an administrative bypass, push directly to `main`, waive required checks, waive branch freshness, or turn a failing PR green.

## Explicit merge-routing labels

The following labels exist in the repository and are part of the workflow contract:

| Label | Effect |
| --- | --- |
| `automerge:allow` | Opts an otherwise non-allowlisted same-repository routine branch into auto-merge eligibility. It does **not** override protected paths, required checks, conflicts, draft status or manual-review labels. |
| `automerge:off` | Disables auto-merge and leaves the PR for manual merge. |
| `manual-review` | Requires manual review/merge. |
| `needs-human-review` | Requires human review/merge before completion. |

The manual labels take precedence over `automerge:allow`.

## Trusted branch families

The workflow currently recognises these top-level routine families:

- `scouting/*`
- `evidence/*`
- `atlas/*`
- `ui/*`
- `contracts/*`
- `perf/*`
- `albo/*`
- `opendata/*`
- `pnrr/*`
- `organi/*`
- `proposte/*`
- `demografia/*`
- `legalita/*`
- `data/*`
- `content/*`

Named Codex families:

- `codex/evidence-interventions-*`
- `codex/proposte-*`
- `codex/opendata-*`
- `codex/atlante-*`
- `codex/contracts-*`
- `codex/organi-*`
- `codex/albo-*`
- `codex/pnrr-*`
- `codex/performance-*`
- `codex/beni-confiscati-*`
- `codex/context-*`
- `codex/sessione-*`
- `codex/trame-*`
- `codex/delibere-*`
- `codex/civic-*`
- `codex/home-*`
- `codex/menu-*`
- `codex/public-copy-*`
- `codex/public-data-*`
- `codex/page-*`
- `codex/section-*`
- `codex/climate-*`
- `codex/istat-*`
- `codex/anac-*`
- `codex/bdncp-*`

Issue-number Codex families:

- `codex/[0-9]*-opendata-*`
- `codex/[0-9]*-atlante-*`
- `codex/[0-9]*-contracts-*`
- `codex/[0-9]*-pnrr-*`
- `codex/[0-9]*-beni-confiscati-*`
- `codex/[0-9]*-performance-*`
- `codex/[0-9]*-proposte-*`
- `codex/[0-9]*-albo-*`
- `codex/[0-9]*-organi-*`
- `codex/[0-9]*-air-traffic-*`
- `codex/[0-9]*-delibere-*`
- `codex/[0-9]*-civic-*`
- `codex/[0-9]*-household-*`
- `codex/[0-9]*-geolibre-*`
- `codex/[0-9]*-anac-*`
- `codex/[0-9]*-bdncp-*`

Trusted ChatGPT families:

- `chatgpt/albo-*`
- `chatgpt/demografia-*`
- `chatgpt/opendata-*`

Do not broaden this to generic `codex/*` without a separate governance decision. Old and superseded Codex branches may still exist; a generic wildcard could revive obsolete work on a later `main` push.

## Protected paths

A trusted branch still requires manual merge when any changed file matches one of the workflow's protected-path families:

- `.github/*`
- `.agents/*`
- `docs/automation/*`
- dependency manifests and lockfiles: `package.json`, `pnpm-lock.yaml`, `package-lock.yaml`/`package-lock.json`, `yarn.lock` as applicable to the workflow matcher;
- `.env*` and nested environment files;
- `wrangler.toml`, `wrangler.json`, `wrangler.jsonc` and nested variants;
- `vite.config.*` and nested variants;
- `migrations/*` and nested migration paths;
- `drizzle/*` and nested Drizzle paths;
- `*/ClerkApp.*`;
- `*/auth/*` and `*/auth.ts`, `*/auth.tsx`, `*/auth.js`, `*/auth.jsx`;
- semantic architecture documentation matched by `docs/architecture/*semantic*`;
- `lib/api-zod/src/semantic*`.

The workflow YAML is the executable source of truth if this explanatory list and the matcher ever diverge.

## Required checks and strict freshness

Trusted auto-merge remains behind the repository's required checks. The current required contexts are expected to include the normal CI/build gate, static fallback smoke and hook guard as configured by `Protect main`.

The ruleset uses strict status checks, so an eligible PR must be up to date with `main`. When `main` advances, the workflow serially refreshes open trusted PRs. A conflict or failed update leaves the PR open rather than bypassing the gate.

The static fallback workflow must emit its required context for every PR; a required workflow must not be path-filtered in a way that leaves an eligible PR waiting forever for a check that never starts.

## Bot-triggered required workflows

Updating a trusted PR branch with `GITHUB_TOKEN` can create required pull-request workflow runs whose initial conclusion is `action_required`. The trusted workflow may approve only the expected required runs when both the actor and triggering actor are `github-actions[bot]` and the run belongs to the refreshed head SHA.

The workflow must observe the new branch-ref SHA after update before releasing those runs. This prevents approval of stale-generation runs caused by eventual consistency in the PR API.

Failure to observe the new SHA or release the expected required runs is fail-closed: required checks remain authoritative and the PR stays open.

## Codex prompt contract

Codex implementation prompts must still require a dedicated branch and PR to `main`. They must **not** tell Codex to bypass, force or administratively merge a PR.

After a PR is opened:

- if it is trusted and contains no protected path, the repository workflow may arm auto-merge and the required checks decide whether it merges;
- if it is outside the trusted families, it remains manual unless `automerge:allow` is intentionally added;
- if it touches protected paths or carries `manual-review`, `automerge:off` or `needs-human-review`, it remains manual;
- `automerge:allow` never overrides a protected path or explicit manual label.

Codex must not close issues directly unless a separate explicit closure policy authorises that behaviour.

## Fail-closed conditions

Leave the PR open for human intervention when any of these occurs:

- merge conflict or branch update failure;
- protected path detected;
- explicit manual-review label detected;
- branch outside trusted families without opt-in;
- required check failure or missing required context;
- inability to observe the refreshed branch SHA;
- inability to release an expected bot-triggered required workflow run;
- any condition the ruleset itself blocks.

## Governance changes

Changes to this policy, `.github/workflows/*`, `docs/automation/*`, Codex governance prompts, authentication, deployment configuration, migrations/schema and other protected paths must themselves remain manual-review work. The trusted auto-merge policy must not be used to auto-merge changes to its own governance or execution mechanism.
