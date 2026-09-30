# Municipal demographic backfill

Related to #771. This is a bounded consolidation tranche, not completion of the information-estate migration.

## Canonical representation

Three existing repository datasets are now recognised by the existing source-snapshot importer. They are decoded into source records and projected into the existing `demographic_series`, `demographic_releases` and `demographic_observations` tables within the same data transaction. No new tables, new dependencies or replacement ontology are introduced.

| Source key                               | Canonical series key                   | Source rows | Observations | Reference period                                                       |
| ---------------------------------------- | -------------------------------------- | ----------: | -----------: | ---------------------------------------------------------------------- |
| `lamezia.demographics.population`        | `municipal-population-resident-annual` |          25 |           25 | 2001–2025; within-year reference day not specified                     |
| `lamezia.demographics.foreign-age-sex`   | `municipal-foreign-residents-age-sex`  |          19 |           38 | The year declared by the source; separate male/female age-class counts |
| `lamezia.demographics.families-children` | `municipal-families-by-children`       |           6 |            6 | `unknown`; no year is supplied by the source                           |

Counts describe the input files inspected at main commit `11d28a5089c0b878cbf70fe40f9b79513b06d7d9`, not a guarantee about later releases. The input paths are defined in `lib/db/src/municipalDemographicPlan.ts`; original generated files have not been edited.

The municipal population series is **not** the ISTAT `population-resident-jan1` series. Do not combine them or assign a 1 January reference date without evidence. Source status remains `unknown`; import success is not evidence that an observation is final or independently verified. For families, `generated_at` is not the statistical reference period. The source caveat also states that families without children are not explicitly represented.

The 19 age/sex source rows yield 38 primary observations. Derived totals are retained in source evidence and checked against the primary values; they are not duplicated as additional primary observations. Population changes, shares and family cumulative totals likewise remain reproducible source-derived information rather than competing canonical measurements.

## Provenance and reversibility

The universal source registry retains the exact UTF-8 JSON bytes, byte hash, repository commit, source URLs, original caveats and every compact source column. These are existing **repository-derived datasets**, not newly downloaded or independently corroborated upstream CSV files.

`source_records` contains decoded source rows with stable source-native keys. Every typed release records its source-registry release ID, collection and native-key convention. The observation dimensions and period identify the corresponding source row; verification checks that the source-native key exists in that release.

The typed release points to the original source artefact's immutable locator. It does not duplicate the original file into `raw_payload`, and it does not invent a release date. Raw metadata timestamps and methodological limitations remain in the linked release.

Ingestion uses the existing source-specific lock and append-only conflict keys. A rerun must insert no duplicate source records, releases or observations. Counts alone are insufficient: the verifier compares every expected observation, rejects unexpected rows, checks source links and compares source bytes exactly. A typed-data reconciliation failure rolls back the source and typed data transaction; the failed acquisition attempt remains visible.

There is no destructive schema migration. Previous releases are not overwritten or silently deleted. Do not remove retained evidence as a rollback shortcut. Corrections require another traceable release or a separately reviewed corrective migration.

## Run and validate

Use the existing importer, which first checks committed source bytes and the database migration journal:

```sh
pnpm --filter @workspace/db run import:source-snapshots
pnpm --filter @workspace/db run import:source-snapshots --execute
```

The default command is a plan; `--execute` explicitly enables writes, as defined in `sourceSnapshotImport.ts`. A configured database must be an explicitly identified target. The existing startup importer can also apply the reviewed source manifest where `SOURCE_SNAPSHOT_SYNC_ON_START` is already configured; this change does not itself change deployment configuration.

Run unit and static checks:

```sh
pnpm --filter @workspace/db run test
pnpm run typecheck
pnpm run architecture:audit
```

The dedicated `Municipal demographic integration` workflow provisions a disposable PostgreSQL 18 service with no production credentials. Its test applies the migration chain, loads the original five sources, adds the three municipal sources, reruns the complete importer, verifies counts and provenance, and injects a reconciliation failure to verify transactional rollback. It uploads a machine-readable report. The standalone test refuses remote hosts, refuses any `DATABASE_URL`, requires database name `municipal_demographic_test`, and refuses an existing public schema with tables.

## Coverage and current limits

The source manifest expands from five to eight source files. This is **not** evidence that the whole project estate has migrated. The inspected repository inventory reported 75 database tables, 23 migrations, 878 files under `data/`, and ten generated frontend data files. Those counts include raw evidence and derived outputs, not 878 independent datasets.

The schema inventory, source preservation, typed canonical migration and runtime cutover are separate acceptance gates. In particular:

- The existing generic demographic API can address these series after import, but this tranche does not change public cards, source-health consumers or their static imports.
- Existing repository generators remain ingestion inputs, not evidence of completed database-first authoring. Do not remove their outputs until their remaining consumers have been migrated and checked.
- The family series must not be plotted against an invented calendar year. API/UI consumers must explicitly handle `unknown`.
- Deployment configuration and the actual runtime database must be verified before a production cutover. A Neon branch named `production` does not alone establish what the public app uses.
- No production deployment or production import is certified by this document. Use the actual import and integration reports for execution evidence.

Local validation during implementation: 66 database unit tests passed; shared TypeScript build passed; migration-safety and architecture checks passed. End-to-end PostgreSQL results are reported separately by the integration workflow, not inferred from unit-test success.
