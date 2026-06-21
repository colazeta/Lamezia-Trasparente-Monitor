# Albo operational MVP check

Date: 2026-06-21

Scope: verify the Albo Pretorio operational MVP after PRs #584, #590, #595, #603 and #607, before any UX expansion. This check does not add long-term storage, OCR, PDF parsing, summaries, rankings, accusations, evaluative language or advanced UX.

## Gate decision

Not ready for UX expansion.

The ingestion mechanics and privacy safeguards are present and pass a controlled run, but the current repository archive is still seed-only. `data/public/albo/status.json` explicitly records no official run in the repository, and `data/public/albo/latest.json` plus `data/public/albo/diff-latest.json` are not present. A UX layer should not be expanded until an operational public-safe run has materialized those public outputs, or the absence of a baseline is represented explicitly for consumers.

## Evidence reviewed

Current head inspected: `204e6f5555b8823b87e0841ebefbdebfff0d5b9e`.

Relevant Albo history visible in the current repository:

| Change | Evidence |
| --- | --- |
| Tranche A ingestion | `287b3df Merge pull request #584 from colazeta/codex/578-albo-tranche-a` |
| Tranche B schedule/status | `08e28d3 Merge pull request #590 from colazeta/codex/578-albo-tranche-b` |
| Public-only workflow safeguard | `387e692 [codex] Hotfix Albo workflow public-only commits` |
| PDF preservation policy | `1f6b35c Merge pull request #603 from colazeta/codex/597-albo-pdf-preservation-policy` |
| Manifest privacy hotfix | `5529cb2 Merge pull request #607 from colazeta/codex/604-albo-manifest-privacy-hotfix-fresh` |

Commands and inspections used for this check:

| Check | Result |
| --- | --- |
| `git ls-files data/public/albo data/snapshots/albo data/processed/albo` | Tracks `data/public/albo/status.json` and `data/public/albo/documents-manifest.json`; no `data/snapshots/albo/**` or `data/processed/albo/**` files are tracked. |
| `Test-Path data/public/albo/latest.json` | `False`. |
| `Test-Path data/public/albo/diff-latest.json` | `False`. |
| `Test-Path data/snapshots/albo` | `False` in the current checkout. |
| `Test-Path data/processed/albo` | `False` in the current checkout. |
| `.github/workflows/albo-ingestion.yml` | The workflow runs `pnpm albo:fetch` and stages only `data/public/albo`. |
| `scripts/albo-workflow-guard.test.ts` | Guard test asserts the workflow stages `data/public/albo` and rejects staging `data/snapshots/albo` or `data/processed/albo`. |
| Controlled two-run fixture ingestion outside the repo | Generated `latest.json`, `diff-latest.json`, `status.json`, `documents-manifest.json` and `run-latest.md` under a temp output directory; matching latest/diff/status counts were `acquired=3`, `changed=1`, `unchanged=2`, `publishable=1`, `minimised=1`, `excluded=1`. |

## Archive boundary

Pass, with one operational caveat.

Only `data/public/albo/**` is configured as the MVP commit archive. Raw snapshots and full processed records are intentionally excluded:

- `.gitignore` excludes `data/snapshots/albo/` and `data/processed/albo/`.
- `.github/workflows/albo-ingestion.yml` stages only `data/public/albo`.
- `scripts/albo-workflow-guard.test.ts` protects that workflow contract.

Operational caveat: because no official run is tracked yet, the current public archive contains only seed `status.json` and seed `documents-manifest.json`.

## Status, latest and diff coherence

Not ready.

The seed `status.json` is internally coherent: counts are all zero, `last_run_at` and `last_update` are `null`, and the warning says no official execution is registered in the repository. That is a safe placeholder.

However, `latest.json` and `diff-latest.json` are absent from the current tracked archive. The controlled fixture run confirms the script can generate coherent public outputs, but that evidence is not the same as a repository-level operational archive for UX consumption.

Before UX expansion, the repository should contain a public-safe operational run under `data/public/albo/` with:

- `latest.json`;
- `diff-latest.json`;
- refreshed `status.json`;
- refreshed `documents-manifest.json`;
- `run-latest.md`, if retained as the readable run log.

## Diff baseline

Not ready in the current archive.

No tracked `diff-latest.json` exists, so there is no current repository-level baseline state for consumers to inspect. In the controlled fixture run, the diff was public-safe because it was generated through `publicItem` and `publicExcludedItem`, not from raw snapshots or full processed records.

For the first official public run, the diff should either:

- expose only public-safe `new`, `changed`, `removed` and `unchanged` records; or
- explicitly mark the baseline as unavailable, for example with `baseline_unavailable`, if product consumers need to distinguish a first run from a true all-new diff.

## Documents manifest and PDF preservation

Pass for current safeguards.

The tracked `data/public/albo/documents-manifest.json` is a seed manifest with zero documents and zero decisions. Its policy is minimised and explicit:

- archive eligibility is limited to `public_visibility=publishable` and `privacy_risk=low`;
- official PDF URLs must use HTTPS;
- content type must be `application/pdf`;
- maximum public PDF size is bounded;
- SHA-256 deduplication is declared;
- OCR, PDF parsing, summaries, rankings and paid storage are disabled.

The current script and tests preserve the same boundary during generated runs:

- `publishable_with_minimisation` and `privacy_risk=medium` records become `human_review_required` decisions without `document_url`;
- `metadata_only`, `do_not_publish` and `privacy_risk=high` records become excluded decisions without `document_url`;
- non-archived fetch failures, non-PDF responses and size-limit failures do not retain direct PDF URLs in manifest decisions;
- official `http:` PDF URLs are skipped with reason `non_https_document_url` and a warning;
- only archived `publishable` plus `low` records reintroduce `document_url`, alongside storage path, SHA-256, byte size and content type.

The controlled fixture run also checked that review-required and excluded record URLs were absent from the generated public `latest`, `diff` and `documents-manifest` JSON.

## Residual limits

- This check did not fetch live Tinnvision data into the repository.
- This check did not commit any raw snapshot, processed non-minimised record or PDF.
- Current tracked public Albo outputs do not yet prove an official operational run.
- The UX should continue to present the official-source disclaimer and avoid implying completeness, legal effect or historical coverage.

## Required next step before UX expansion

Run the Albo ingestion workflow manually or wait for the scheduled workflow, then review the generated `data/public/albo/**` diff before UX work starts. The gate can move to ready only when the tracked public archive contains coherent `status`, `latest`, `diff` and minimised `documents-manifest` outputs, with no raw snapshot or processed non-minimised records tracked.
