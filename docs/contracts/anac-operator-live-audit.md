# ANAC operator live audit

## Purpose

This audit is the first live materialisation attempt for the source-backed ANAC `Partecipanti` and `Aggiudicatari` operator layer introduced by #896 / PR #901.

The audit is deliberately fail-closed: a source read failure is not converted into an empty snapshot and therefore never becomes an apparent zero-coverage result.

## Live audit — 2026-09-02

The audit was executed from GitHub-hosted Ubuntu runners against the public ANAC endpoints used by the operator sync.

Observed results:

- `Partecipanti` CKAN `package_show`: HTTP 403;
- `Partecipanti` canonical CSV ZIP: HTTP 403;
- `Aggiudicatari` CKAN `package_show`: HTTP 403;
- `Aggiudicatari` canonical CSV ZIP: HTTP 403;
- a public per-CIG request on `dettaglio-cig.anticorruzione.it`: HTTP 403.

The response body identified the rejection as an F5 site policy response. The failure occurred before ZIP download, CSV parsing or CIG matching. It therefore does **not** provide evidence that a tracked CIG has no participants or awardees.

No participant or awardee snapshot was materialised from these failed reads.

## Federated catalogue verification

To separate metadata availability from byte availability, the same dataset identifiers were queried through the public `data.europa.eu` CKAN API.

The federated catalogue successfully resolves both datasets with publisher `Sistemi Informativi ANAC`:

- `Partecipanti`: 15 distributions in the response inspected on 2026-09-02;
- `Aggiudicatari`: 14 distributions in the response inspected on 2026-09-02.

The latest monthly CSV distributions visible in that metadata were dated `20260801`:

- `20260801-partecipanti_csv.zip`, declared size 54,278,808 bytes;
- `20260801-aggiudicatari_csv.zip`, declared size 25,800,605 bytes.

However, every distribution `access_url` returned by the federated metadata still points to `https://dati.anticorruzione.it/...`. The inspected resources expose no independent `download_url`, and no non-ANAC file host was present. The EU catalogue therefore provides useful source metadata but not a byte mirror that would remove the current ANAC access dependency.

## Current publication state

The committed ANAC/BDNCP baseline used by the audit is itself degraded and has no successful structured CIG acquisition. The operator audit records this baseline separately from the operator source outcome.

Until a source read succeeds:

- `data/public/contracts/anac-participants/latest.json` must not be created as an empty live snapshot;
- `data/public/contracts/anac-awardees/latest.json` must not be created as an empty live snapshot;
- `not-materialized` must remain distinct from `0`;
- no operator recurrence, participation or award statistic should be published from this attempted acquisition.

## Audit workflow

`.github/workflows/anac-operator-audit.yml` is manual (`workflow_dispatch`) rather than scheduled. It:

1. runs the production operator sync;
2. always writes a coverage audit;
3. records the run outcome and source log;
4. includes any snapshots only if the production sync actually materialised them;
5. uploads an audit artifact;
6. fails the run if the live sync was incomplete.

A red audit run can therefore be an expected and informative result when the official source is unavailable. It must not be reclassified as a successful zero-row acquisition.

## Next safe acquisition path

The next implementation should support ingesting an **official ANAC archive obtained through an accessible public channel** while preserving the same validation, SHA-256, dataset identity, CSV schema, CIG filtering and provenance rules used by the network sync.

This must not introduce proxy rotation, WAF circumvention, fabricated mirrors or substitution of a third-party dataset as if it were ANAC. If an alternate public distribution is used, its publisher, catalogue record, retrieval path and relationship to the ANAC source must be explicit.

## Civic safeguard

Participation, award and recurrence are descriptive procurement facts. They are not evidence of collusion, favouritism, corruption, criminal infiltration or individual wrongdoing.
