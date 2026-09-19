# Municipal demographic consumer convergence

Related to #771; depends on the implementation in PR #1211. This document describes a **candidate implementation**, not a production cutover or completion of the information-estate migration.

## Scope and authoritative reads

The three municipal datasets imported by #1211 now have a shared database-only read model. Public cards, downloads and municipal source-health entries consume that model rather than loading the original frontend JSON files. The authenticated database console exposes the same reconciliation against its own database connection.

The original municipal files remain source evidence and inputs to the existing importer. They have not been removed or rewritten. The repository acquisition generators are still migration inputs: this tranche does not claim database-first authoring or retirement of those writers.

The family card also displays a **separate ISTAT household-composition benchmark for 2023**. The follow-up adapter now imports its six classes into the same source/typed tables and serves them through an independent, reconciled API. The original JSON remains import evidence; its materializer and repository-evidence health/freshness views remain. See [the bounded census mapping](household-composition-canonicalisation.md). Migrating the three municipal datasets does not complete the entire demographic domain.

## Public and administrative contracts

`GET /api/demographics/municipal/{key}` supports `population`, `foreign-age-sex` and `families-children`. It reads a complete typed release, its retained source artefact, source rows and observations in one SQL statement. It makes no file reads, external source acquisitions or database writes.

The read verifies source identity, exact retained bytes and SHA-256, source-row identity/content, observation counts/values/dimensions, geography, status and provenance. Measured values are taken from typed observations; redundant differences, totals and shares are reproduced. Only allowlisted aggregate metadata is published.

The newest typed release is selected **before** evidence is joined. Missing or inconsistent evidence on that release cannot silently make an older release appear current. Conflicting releases with identical source-generation timestamps require resolution. Selecting a complete release also prevents periods removed by a later snapshot from being resurrected by rowwise latest-value selection.

A `release` SHA-256 parameter pins an imported source version. Card download links pin the exact version displayed; catalogue download links request the current version. `download=1` returns an attachment disposition. Responses use normal HTTP entity tags and revalidation. Missing data or failed reconciliation returns HTTP 503 without fabricated zero counts or filesystem fallbacks; invalid keys and invalid release parameters return 404 and 400 respectively.

`GET /api/admin/database/municipal-demographics` remains behind the existing database-owner/session/origin controls. It uses the console's read-only repeatable-read transaction and reports each series as available or unavailable. An authenticated console result is not proof that the public website uses that same deployment or database.

Both endpoints are declared in `lib/api-spec/openapi.yaml`; API clients and validators are regenerated from that contract.

## Time, source identity and availability

The municipal annual population series is not ISTAT `population-resident-jan1`. Source health now reads them separately. The municipal family dataset retains an unknown reference period; generation/import dates are not statistical reference years.

Source-generation time, source modification and database acquisition are distinct. Importing an old file does not reset the source-freshness clock or prove that a recurring acquisition job is operational. The static catalogue therefore does not manufacture current observation dates or certify municipal automation.

Cards preserve their deep-link anchors while loading. Unavailable canonical data is explicitly unavailable, not zero. If a refresh fails after a successful response, the retained canonical response is labelled as cached; its download remains pinned. No embedded source JSON is substituted.

## Migration ledger and checks

`architecture/canonicalisation-ledger.v1.json` records bounded asset reviews and separate source-registration, typed-migration, consumer, legacy and production gates. `architecture/consolidation-resolutions.v1.json` records resolved redundancies and residual evidentiary uncertainty.

Run:

```sh
pnpm run architecture:canonicalisation
pnpm --filter @workspace/db run test
pnpm run architecture:audit
pnpm run typecheck
pnpm run build
pnpm test
```

The census writes `reports/canonicalisation/audit.json` and `queue.json`. It records file hashes, reviewed asset ownership and literal code references. **Unreviewed files remain unreviewed.** A file census is not a full semantic audit; literal-reference scanning does not prove reachability and cannot resolve all computed paths. Files, asset groups, source rows and typed observations have different denominators, so no combined completion percentage is reported.

Review coverage is pinned to the file SHA-256 and asset ownership recorded in
`architecture/canonicalisation-review-baseline.v1.json`. The baseline preserves
the 120 file receipts from the bounded 10 September audit, with the audit's own
SHA-256 and source commit. Matching an asset directory establishes ownership
only: new files, changed bytes and changed ownership remain unreviewed with a
null semantic status. Unchanged bytes retain only the original bounded review,
not a certificate of migration or production use. The audit reports missing
baseline files separately; their absence does not establish a safe deprecation.

Automated guards reject known legacy municipal file reads in runtime frontend code, duplicate asset IDs, missing ledger gates, malformed review receipts, unsupported completion claims and duplicated conceptual evidence paths. Existing raw artefacts and test fixtures remain legitimate.

## Validation and safe release sequence

Tests cover source equivalence, corrupted/missing/extra observations, missing provenance, broken newest releases, pinned downloads, loading/error/cache states, authenticated console access and ledger consistency. The PostgreSQL 18 integration test additionally executes the original import, rerun, injected-failure rollback, filesystem-independent reads, corrupted-data rejection and complete-snapshot revision selection. Execution reports—not this document—establish which checks actually ran.

Before production use:

1. Confirm the actual public API deployment, its database identity and the ingestion target using non-secret metadata and the platform's required approvals.
2. Reconcile the predecessor import and candidate read model in an isolated database; inspect the test receipts and review the changes against current `main`.
3. Import the reviewed sources into the verified target using the controlled importer, without overwriting evidence or changing unknown periods.
4. Deploy the API before switching its consumers; verify the three endpoints, pinned downloads, source health and owner-only console against that deployment.
5. Only then mark the corresponding operational ledger gates verified. Retire remaining legacy writers only after source acquisition and regeneration have their own equivalent canonical workflow.

No production import, connection change or deployment is authorised by a successful unit test. On 19 September the user confirmed the Render workspace; acquisition-run timestamps, commit, source identities and counts correlated its API process with the Neon database. Demographic tables remain empty. Render build minutes are exhausted and the published frontend's public API origin is not configured. The [current operational receipt](canonicalisation-resumption-2026-09-19.md) records the evidence and remaining release gates. Independent domain migrations remain separately queued.
