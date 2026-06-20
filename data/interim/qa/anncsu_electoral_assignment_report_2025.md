# ANNCSU electoral assignment report 2025

Date: 2026-06-20

Scope: enrichment of Lamezia Terme ANNCSU civic access points with 2025 electoral section assignments from the official electoral street register.

## Method

- ANNCSU indirizzario is used as the source for civic access points and coordinates.
- ANNCSU stradario is used only to normalize and check odonyms.
- `Stradario_elettorale.pdf` is used as the normative source for section assignment.
- Assignments are based on normalized odonym plus explicit civic/SNC/range/parity rules when present.
- No assignment is made by geographic proximity.
- No polygons, shapefiles, maps, UI, deploy changes, or electoral 2025 result values are created or modified.

## Outputs

| artifact | path | rows |
| --- | --- | --- |
| Lamezia ANNCSU indirizzario extract | data/raw/geo/anncsu_lamezia_indirizzario_20260602.csv | 22757 |
| Lamezia ANNCSU stradario extract | data/raw/geo/anncsu_lamezia_stradario_20260602.csv | 1320 |
| Electoral street rules | data/interim/geo/electoral_street_rules_2025.csv | 1294 |
| Odonym crosswalk | data/interim/geo/anncsu_electoral_street_crosswalk_2025.csv | 1228 |
| Enriched civics | data/processed/geo/anncsu_lamezia_civics_with_electoral_section_2025.csv | 22757 |
| Review queue | data/interim/qa/anncsu_electoral_assignment_review_queue_2025.csv | 8254 |

## Assignment coverage

- Total civic access rows: 22757.
- Assigned rows: 14503 (63.73%).
- Review-required rows: 8254 (36.27%).
- Sections referenced by assignments: 77.
- Sections without assigned civic rows: 78: OSPEDALE CIVILE.

### Assignment status

| status | rows |
| --- | --- |
| assigned | 14503 |
| review_required | 8254 |

### Assignment methods

| method | rows |
| --- | --- |
| anncsu_crosswalk_abbreviation_unique | 3004 |
| anncsu_crosswalk_abbreviation_unique_and_civic_rule | 1277 |
| normalized_street_exact | 8693 |
| normalized_street_exact_and_civic_rule | 1529 |

### Assignment confidence

| confidence | rows |
| --- | --- |
| high | 10222 |
| medium | 4281 |

## Review queue

| reason | rows |
| --- | --- |
| ambiguous_multiple_rules | 112 |
| no_civic_rule_match | 51 |
| street_not_in_electoral_rules | 8091 |

## Source parsing and crosswalk

| rule extraction confidence | rules |
| --- | --- |
| high | 1291 |
| low | 1 |
| medium | 2 |


| crosswalk status | streets |
| --- | --- |
| matched | 528 |
| matched_abbreviation_unique | 168 |
| unmatched | 532 |

## Issues

- No P0/P1/P2 issues found by the automated audit.

## Residual limits

- Low-confidence PDF lines and unmatched odonyms are preserved for review rather than assigned heuristically.
- Section 78 is the hospital section (`OSPEDALE CIVILE`) and has no ANNCSU civic row assigned by this text-rule pipeline.
- Streets split across multiple sections require the civic rule to match exactly; otherwise the row remains in the review queue.
- ANNCSU coordinates are retained as source attributes but are not used as an assignment criterion.
- The pipeline enriches civic access rows only; it does not change non-geographic electoral processed tables.
