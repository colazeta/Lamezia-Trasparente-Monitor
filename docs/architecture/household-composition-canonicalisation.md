# ISTAT household composition: bounded common-schema migration

Related to #771, continuation in draft PR #1214. This is a candidate implementation, not a production migration receipt. Render build capacity is not required to prepare or test it.

## Reviewed mapping

Source: `artifacts/api-server/src/data/lameziaHouseholdComposition2023.json`, retained byte-for-byte. It is an aggregate derived from the identified ISTAT 2023 Calabria workbook. The archive/workbook SHA-256 values and original quality/verification metadata remain evidence; this import does not download or independently reverify those upstream bytes.

| Original field                   | Common representation                           | Meaning                                                        |
| -------------------------------- | ----------------------------------------------- | -------------------------------------------------------------- |
| Six `byComponents` rows          | Six `source_records`                            | Municipal aggregates, not 246 section-level records            |
| PF3 / key 1                      | `components: 1`                                 | One-person households                                          |
| PF4 / key 2                      | `components: 2`                                 | Two-person households                                          |
| PF5 / key 3                      | `components: 3`                                 | Three-person households                                        |
| PF6 / key 4                      | `components: 4`                                 | Four-person households                                         |
| PF7 / key 5                      | `components: 5`                                 | Five-person households                                         |
| PF8 / key 6+                     | `components: 6+`                                | Six or more people; open upper bound                           |
| `households`                     | Six `demographic_observations`, unit `famiglie` | Counts at `2023-12-31`, geography `079160`                     |
| PF1 total, shares and indicators | Reconciled evidence and recalculated projection | 27,591 total; shares rounded only after integer reconciliation |
| Census reference date            | Observation period / release metadata           | 31 December 2023                                               |
| Source update date               | `source_update_date` metadata                   | 9 June 2026, not acquisition date                              |
| Existing verification timestamp  | `source_verified_at` metadata                   | 1 September 2026, preserved on import                          |
| Database acquisition time        | Canonical release acquisition                   | Does not refresh the external source verification              |

Source key `istat.lamezia.household-composition-2023`, series key `istat-households-by-components-2023`. Publisher remains ISTAT. Source status remains unknown; neither the dataset title nor exact reconciliation invents a final/provisional status. Source update is not relabelled as a release date. The family-size distribution cannot infer children, couples, relationships or nuclei; municipal families-by-children retain an unknown period and are never used as its denominator. P02 remains a separate annual series.

## Persistence and reads

Reuse the existing nine source/typed tables and per-source transaction/lock. No new database migration or dependency is needed. Six source rows and six observations are added to the reviewed plan: **nine sources, 316 source records, four demographic series, 75 typed observations**. These are candidate import expectations, not observed production counts.

The common transaction verifies exact source bytes, records and typed values; a typed reconciliation failure rolls the whole data transaction back while retaining a failed acquisition attempt. An identical rerun adds no duplicates.

`GET /api/demographics/household-composition-2023` reads one complete release in one SQL snapshot. It verifies the retained byte hash, source identity, metadata, every source row and observation before publishing an allowlisted response. Counts come from typed observations and totals/shares are recalculated. Releases are ordered by source update then verification time before evidence joins; broken newest evidence fails closed. Equally dated contradictory editions require resolution. `release=<sha256>` pins a historical version and `download=1` sets attachment disposition.

Missing/inconsistent canonical data returns 503; invalid release parameters return 400. The GET performs no ingestion or filesystem reads. It works independently of P02. The annual households response now permits `composition: null` so a missing census cannot hide available annual data. OpenAPI is the source of truth; generated packages are regenerated.

Primary cards, the municipal family's ISTAT benchmark, annual panel and downloads use canonical reads. Loading/unavailable/cached states remain explicit, downloads pin the displayed release, and absent data never becomes zero. Catalogue wording no longer promises a static JSON substitute.

## Verification and retained work

Focused tests cover identity/period/source-field errors, missing counts, reconciliation, original hashes, allowlisting, duplicate observations, broken newest evidence, pinning, API errors, and UI availability/cache behavior. The isolated PostgreSQL 18 workflow exercises all nine imports, idempotency, real rollback for both municipal and ISTAT data, filesystem-independent reads, corrupt observations, census revision selection and pinned retrieval. It then submits the real first/rerun reports to the production checkpoint comparator. Workflow receipts establish execution; this document does not substitute for them.

The upstream materializer remains an ingestion input. Source health and generated freshness metadata still describe the retained repository evidence and explicitly do not certify current canonical API availability. No entire demographic domain, writer retirement, source freshness or production consumer cutover is certified. Production counts and the Render/API-origin blockers remain those recorded in the separate runtime receipt. Restore capacity and verify import/API before releasing consumers.
