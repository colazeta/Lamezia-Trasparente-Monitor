# Albo operational MVP check

Date: 2026-06-21

Scope: verify and materialise the first public Albo Pretorio operational run after PRs #584, #590, #595, #603, #607 and #611, before any broader UX expansion. This check does not add long-term storage, OCR, PDF parsing, summaries, rankings, accusations, evaluative language or advanced UX.

## Gate decision

UX ready for a cautious MVP surface.

The repository now contains a first official-source public run under `data/public/albo/**`: `status.json`, `latest.json`, `diff-latest.json` and `documents-manifest.json`. The first-run diff is explicitly marked `baseline_unavailable`, so the UX must not present all records as a meaningful increase from a prior tracked baseline. The UX can consume these public JSON files for a restrained status/list/diff surface with source, verification and known-limit caveats.

The gate does not clear PDF content UX, document preview UX, summaries, rankings or historical-completeness claims.

## Evidence reviewed

Run base inspected: `c80d2bf9c09865106eb2082f954611da229e4910`.

Relevant Albo history visible in the current repository:

| Change | Evidence |
| --- | --- |
| Tranche A ingestion | `287b3df Merge pull request #584 from colazeta/codex/578-albo-tranche-a` |
| Tranche B schedule/status | `08e28d3 Merge pull request #590 from colazeta/codex/578-albo-tranche-b` |
| Public-only workflow safeguard | `387e692 [codex] Hotfix Albo workflow public-only commits` |
| PDF preservation policy | `1f6b35c Merge pull request #603 from colazeta/codex/597-albo-pdf-preservation-policy` |
| Manifest privacy hotfix | `5529cb2 Merge pull request #607 from colazeta/codex/604-albo-manifest-privacy-hotfix-fresh` |
| Pre-run gate check | `c80d2bf Merge pull request #611 from colazeta/codex/albo-operational-mvp-check` |

Official-source run:

| Field | Value |
| --- | --- |
| Source | Albo Pretorio Comune di Lamezia Terme / Tinnvision |
| Source URL | `https://albo.tinnvision.cloud/?ente=00301390795` |
| Retrieved at | `2026-06-21T08:42:39.274Z` |
| Fetch method | `xml` |
| Verification status | `official_source_acquired` |
| Acquired records | 143 |
| Publishable | 91 |
| Publishable with minimisation | 27 |
| Metadata only | 23 |
| Excluded from public layer | 2 |
| Runtime warnings | none |

Commands and inspections used for this check:

| Check | Result |
| --- | --- |
| Official ingestion from the configured Tinnvision source | Generated public `status.json`, `latest.json`, `diff-latest.json` and `documents-manifest.json` from XML. |
| Public JSON invariant verifier | Passed: matching counts across status/latest/diff, `baseline_unavailable` present, no direct PDF URL leaks in review/excluded records, no non-archived manifest decision exposes `document_url`. |
| `git ls-files data/public/albo data/snapshots/albo data/processed/albo` | Tracks only public Albo outputs; no `data/snapshots/albo/**` or `data/processed/albo/**` files are tracked. |
| `.github/workflows/albo-ingestion.yml` | The workflow runs `pnpm albo:fetch` and stages only `data/public/albo`. |
| `scripts/albo-workflow-guard.test.ts` | Guard test asserts the workflow stages `data/public/albo` and rejects staging `data/snapshots/albo` or `data/processed/albo`. |

## Archive boundary

Pass.

Only `data/public/albo/**` is used as the MVP commit archive. Raw snapshots and full processed records remain intentionally excluded:

- `.gitignore` excludes `data/snapshots/albo/` and `data/processed/albo/`.
- `.github/workflows/albo-ingestion.yml` stages only `data/public/albo`.
- `scripts/albo-workflow-guard.test.ts` protects that workflow contract.

This run materialises only public JSON outputs. It does not commit raw snapshots, processed non-minimised records, source rows or PDFs.

## Status, latest and diff coherence

Pass.

`data/public/albo/status.json`, `data/public/albo/latest.json` and `data/public/albo/diff-latest.json` all report the same run counts:

- acquired: 143;
- new: 143;
- changed: 0;
- removed: 0;
- unchanged: 0;
- publishable: 91;
- minimised: 27;
- metadata_only: 23;
- excluded: 2.

`status.json` records the fetch method, last update, counts, warnings, verification status, known limits and the diff baseline state. `latest.json` contains 141 public records plus 2 excluded public-safe records. `diff-latest.json` contains 143 public-safe `new` records and no changed, removed or unchanged records for this first run.

## Diff baseline

Pass with first-run caveat.

The first run has no previous tracked Albo snapshot baseline, so both `status.json` and `diff-latest.json` include:

```json
{
  "status": "baseline_unavailable",
  "public_safe": false,
  "previous_retrieved_at": null
}
```

This is acceptable for MVP materialisation, but the UX must label the first diff as a first observed run, not as evidence that 143 acts were newly published since a prior monitor run.

## Documents manifest and PDF preservation

Pass.

`data/public/albo/documents-manifest.json` is minimised and policy-only for this run:

- considered records: 143;
- archived PDFs: 0;
- skipped records: 91;
- excluded decisions: 25;
- human review required: 27;
- warnings: none.

The manifest policy still limits archiving to HTTPS official PDFs for `public_visibility=publishable` and `privacy_risk=low`. In this official XML run, no PDFs were archived because the eligible records did not expose direct document URLs in the acquired export. Review-required, minimised, metadata-only and excluded records do not expose direct PDF URLs in manifest decisions.

The manifest keeps the safeguards explicit: no OCR, no PDF parsing, no summaries, no rankings and no paid storage.

## Residual limits

- This run covers the current official-source export only and does not certify historical completeness.
- The first diff baseline is unavailable; UX copy must say first observed run or equivalent.
- The source export can omit direct document URLs, so the absence of archived PDFs is expected and must not be presented as absence of official attachments.
- The privacy classification remains automatic and prudential; richer presentation of minimised or review-required records still requires human review.
- Lamezia Trasparente Monitor does not replace the official Albo Pretorio.

## Required UX posture

UX expansion may proceed only as a cautious MVP surface backed by `data/public/albo/status.json`, `latest.json`, `diff-latest.json` and `documents-manifest.json`.

The first UX pass should preserve:

- source URL and retrieved timestamp;
- verification status and known limits;
- first-run `baseline_unavailable` caveat;
- minimised display for review-required records;
- no direct PDF links for review-required, metadata-only or excluded records;
- no summaries, rankings, OCR-derived text or evaluative language.
