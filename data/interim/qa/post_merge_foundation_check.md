# Post-merge foundation check

Date: 2026-06-19

Scope: post-merge verification on `main` for PR #585, electoral data foundation.

Main commit checked: `295f8b3f3e64ba7aa2ebaa49dae2c51c8d1104f9`.

## Summary

Status: usable with one P1 provenance issue tracked separately.

- PR #585 is merged into `main`.
- All 80 files materialized by #585 are present on `main`.
- No frontend, UI, deploy, map, or geometry files were introduced by this check.
- No invented geometry is present; `data/geo/` contains only `electoral_sections_schema.md`.
- 2025 totals validation passes.
- Processed CSVs are readable and match the expected headers in `scripts/utils.py`.
- `sources/sources.yml` and `data/processed/source_documents.csv` remain coherent after source expansion.
- A P1 checksum/provenance issue was opened as #587.

## Validation commands

- `scripts/validate_totals.py`: OK.
- `git diff --check HEAD`: OK before this report.
- PR #585 file presence check on `main`: OK.
- Processed CSV header/readability check: OK.
- Expanded `sources/sources.yml` vs `source_documents.csv`: OK.
- High-confidence credential scan for token patterns: OK.
- Tracked cache/temp scan: OK.

## 2025 validation

`scripts/validate_totals.py` regenerated `data/interim/qa/validation_report.md` and reported OK totals:

- Registered voters: 61,256.
- Voters: 36,382.
- Mayor valid votes: 35,497.
- Blank ballots: 115.
- Null ballots: 747.
- Mayor candidate votes: 35,497.
- List votes: 34,280.

## Processed CSVs

All processed CSVs are readable and have the expected headers:

- `elections.csv`: 1 row.
- `source_documents.csv`: 31 rows.
- `mayor_candidates.csv`: 3 rows.
- `lists.csv`: 14 rows.
- `council_candidates.csv`: 330 rows.
- `sections.csv`: 78 rows.
- `turnout_section.csv`: 78 rows.
- `votes_mayor_section.csv`: 234 rows.
- `votes_list_section.csv`: 1,092 rows.
- `preferences_section.csv`: 25,740 rows.

## Source coherence

`sources/sources.yml` uses one expanded source template for the 14 Maggioli preference XML files.

- Expanded source ids: 31.
- `source_documents.csv` ids: 31.
- Status: OK, exact id match.

All `local_path` values in `source_documents.csv` point to existing files.

## Raw archive size and nature

Raw archive totals:

- Raw files: 31.
- Raw bytes: 8,318,699.
- By extension:
  - `.html`: 5 files, 501,296 bytes.
  - `.md`: 3 files, 7,290 bytes.
  - `.pdf`: 4 files, 2,027,802 bytes.
  - `.xml`: 18 files, 5,730,990 bytes.
  - `.xsl`: 1 file, 51,321 bytes.

Largest raw files:

- `data/raw/comune_lamezia/comune_2021_rinnovazione_manifesto_convocazione_pdf.pdf`: 1,624,967 bytes.
- `data/raw/comune_lamezia/maggioli_2025_preferences_section_l01_xml.xml`: 385,113 bytes.
- `data/raw/comune_lamezia/maggioli_2025_preferences_section_l14_xml.xml`: 385,054 bytes.
- `data/raw/comune_lamezia/maggioli_2025_preferences_section_l13_xml.xml`: 385,020 bytes.
- `data/raw/comune_lamezia/maggioli_2025_preferences_section_l06_xml.xml`: 385,003 bytes.

Current raw archive size is acceptable for this foundation. No raw file exceeds 5 MB. The largest tracked file in the electoral foundation is `data/processed/preferences_section.csv` at 7,413,841 bytes.

## Hygiene checks

- No Windows local paths were found in `data/`, `sources/`, `scripts/`, or `docs/`.
- No high-confidence credential values were found in `data/`, `sources/`, `scripts/`, or `docs/`.
- Broad string scans can match benign text such as environment variable names (`GITHUB_TOKEN`) in existing automation scripts and official Maggioli XML attributes (`TMPTOKEN`); no secret value was identified.
- No tracked cache/temp directories or files were found.

## Findings

### P0

None.

### P1

- #587: raw Maggioli checksum provenance mismatch.
  - 20 HTML/XML/XSL raw files have checksums in `source_documents.csv` that do not match the LF-normalized bytes currently checked out from Git.
  - For sampled files, the recorded checksum matches the `LF -> CRLF` byte variant, which indicates original-download CRLF checksums while Git stores LF bytes.
  - Impact: processed data remains usable and validated, but byte-for-byte raw provenance is weakened until remediated.
  - Action: track separately in #587; no invasive correction was made in this post-merge check.

### P2

- Monitor future repository growth as additional years are added.
  - Current raw size is modest.
  - The processed preference table is already 7.4 MB; repeated elections may eventually justify compression, partitioning, or documented storage policy.

## Conclusion

The electoral data foundation is present on `main` and reusable for downstream work. The numeric 2025 dataset validates successfully and no UI, map, deployment, or geometry scope was introduced. The only substantive issue is P1 provenance mismatch for raw text checksums, now tracked separately in #587.
