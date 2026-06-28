# Albo operational MVP check

Date: 2026-06-25

Scope: verify and materialise the first public Albo Pretorio operational run after PRs #584, #590, #595, #603, #607 and #611, before any broader UX expansion. This check does not add long-term storage, OCR, PDF parsing, summaries, rankings, accusations, evaluative language or advanced UX.

## Gate decision

Data layer ready for ordinary human review; Albo UX remains out of scope.

The repository now contains a repaired official-source public run under `data/public/albo/**`: `status.json`, `latest.json`, `diff-latest.json` and `documents-manifest.json`. This PR still does not implement public UX. A later UX must consume only these public-safe files, preserve source, timestamp, verification and known-limit caveats, and avoid presenting first-run counts as a true comparison against a prior monitor baseline.

The first-run diff remains explicitly marked `baseline_unavailable` because `main` did not contain a committed `data/public/albo/latest.json` baseline before this PR. The ingestion code now supports a public-safe scheduled baseline from committed `data/public/albo/latest.json` after merge, without committing raw snapshots or processed source rows.

The gate does not clear PDF content UX, document preview UX, summaries, rankings, historical-completeness claims or broader Albo presentation work.

## Evidence reviewed

Run base inspected: current `origin/main` at `44f07f328107d4af2924325ea40d066aec8daa4f`.

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
| Retrieved at | `2026-06-25T14:07:05.864Z` |
| Fetch method | `xml` |
| Verification status | `official_source_acquired` |
| Acquired records | 175 |
| Publishable | 114 |
| Publishable with minimisation | 29 |
| Metadata only | 27 |
| Excluded from public layer | 5 |
| Runtime warnings | none |

Commands and inspections used for this check:

| Check | Result |
| --- | --- |
| Official ingestion from the configured Tinnvision source | Generated public `status.json`, `latest.json`, `diff-latest.json` and `documents-manifest.json` from XML. |
| Focused classifier regression tests | Passed: maternity allowance, welfare benefits, domiciliary assistance and similar personal-service records are not low-risk publishable and do not expose full subject text in public output. |
| Public JSON invariant verifier | Passed: matching counts across status/latest/diff, first-run `baseline_unavailable` caveat, no sensitive welfare/maternity subject text mirrored, no direct PDF URL leaks in review/excluded records, and no non-archived manifest decision exposes `document_url`. |
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

- acquired: 175;
- new: 175;
- changed: 0;
- removed: 0;
- unchanged: 0;
- publishable: 114;
- minimised: 29;
- metadata_only: 27;
- excluded: 5.

`status.json` records the fetch method, last update, counts, warnings, verification status, known limits and the diff baseline state. `latest.json` contains 170 public records plus 5 excluded public-safe records. `diff-latest.json` contains 175 public-safe `new` records and no changed, removed or unchanged records for this first run.

## Diff baseline

Pass with first-run caveat.

The first run has no previous tracked raw snapshot or committed public latest baseline on `main`, so both `status.json` and `diff-latest.json` include:

```json
{
  "status": "baseline_unavailable",
  "public_safe": false,
  "previous_retrieved_at": null
}
```

This is acceptable for MVP materialisation, but the UX must label the first diff as a first observed run, not as evidence that 175 acts were newly published since a prior monitor run.

Scheduled runs after merge can use the committed public `data/public/albo/latest.json` as a public-safe baseline. That path intentionally compares only public-safe records and keeps raw snapshots, processed non-minimised rows and source rows out of the committed repository.

## Documents manifest and PDF preservation

Pass.

`data/public/albo/documents-manifest.json` is minimised and policy-only for this run:

- considered records: 175;
- archived PDFs: 0;
- skipped records: 114;
- excluded decisions: 32;
- human review required: 29;
- warnings: none.

The manifest policy still limits archiving to HTTPS official PDFs for `public_visibility=publishable` and `privacy_risk=low`. In this official XML run, no PDFs were archived because the eligible records did not expose direct document URLs in the acquired export. Review-required, minimised, metadata-only and excluded records do not expose direct PDF URLs in manifest decisions.

The manifest keeps the safeguards explicit: no OCR, no PDF parsing, no summaries, no rankings and no paid storage.

## Residual limits

- This run covers the current official-source export only and does not certify historical completeness.
- The first diff baseline is unavailable for this PR output; UX copy must say first observed run or equivalent.
- Future scheduled diffs can be public-safe comparisons only after a committed public `latest.json` exists.
- The source export can omit direct document URLs, so the absence of archived PDFs is expected and must not be presented as absence of official attachments.
- The privacy classification remains automatic and prudential; richer presentation of minimised or review-required records still requires human review.
- Lamezia Trasparente Monitor does not replace the official Albo Pretorio.

## Required next posture

This PR may proceed only as a cautious public data-layer repair for ordinary human review. UX expansion belongs to a later tranche and may proceed only as a cautious MVP surface backed by `data/public/albo/status.json`, `latest.json`, `diff-latest.json` and `documents-manifest.json`.

Any later UX pass should preserve:

- source URL and retrieved timestamp;
- verification status and known limits;
- first-run `baseline_unavailable` caveat;
- minimised display for review-required records;
- no direct PDF links for review-required, metadata-only or excluded records;
- no summaries, rankings, OCR-derived text or evaluative language.
