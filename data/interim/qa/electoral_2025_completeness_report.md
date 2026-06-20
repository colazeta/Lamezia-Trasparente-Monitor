# Electoral 2025 completeness report

Date: 2026-06-20

Scope: complete processed dataset currently available for `comunali_lamezia_2025` from already downloaded Comune/Maggioli sources.

## Summary

- Overall audit status: PASS.
- Complete 2025 tables: elections.csv, source_documents.csv, mayor_candidates.csv, lists.csv, council_candidates.csv, sections.csv, turnout_section.csv, votes_mayor_section.csv, votes_list_section.csv, preferences_section.csv.
- Number of sections: 78.
- Number of mayor candidates: 3.
- Number of lists: 14.
- Number of council candidates: 330.
- Turnout rows: 78.
- Mayor vote rows: 234.
- List vote rows: 1092.
- Preference rows: 25740.

## Coverage matrix

| table | expected unit | expected rows | observed rows | status |
| --- | --- | --- | --- | --- |
| elections.csv | 2025 election row | 1 | 1 | complete |
| source_documents.csv | 2025 source document | 21 | 21 | complete |
| mayor_candidates.csv | candidate sindaco | 3 | 3 | complete |
| lists.csv | lista | 14 | 14 | complete |
| council_candidates.csv | candidate consigliere | 330 | 330 | complete |
| sections.csv | sezione | 78 | 78 | complete |
| turnout_section.csv | sezione | 78 | 78 | complete |
| votes_mayor_section.csv | sezione/candidato sindaco | 234 | 234 | complete |
| votes_list_section.csv | sezione/lista | 1092 | 1092 | complete |
| preferences_section.csv | sezione/lista/candidato consigliere | 25740 | 25740 | complete |

## Logical key and duplicate checks

- No duplicate logical keys found in the 2025 processed tables.
- No missing values found in essential 2025 fields checked by the audit.
- Lists, mayor candidates, council candidates, section references, and preference rows are mutually consistent.

## Totals checks

| check | observed | expected | source_doc_id | attribute | status |
| --- | --- | --- | --- | --- | --- |
| Registered voters by section | 61256 | 61256 | maggioli_2025_totals_mayor_xml | ELETTORI | OK |
| Voters by section | 36382 | 36382 | maggioli_2025_totals_mayor_xml | TOTVOT | OK |
| Turnout valid votes by section | 35497 | 35497 | maggioli_2025_totals_mayor_xml | VOTIVALIDI_C1 | OK |
| Blank ballots by section | 115 | 115 | maggioli_2025_totals_mayor_xml | BIANCHE | OK |
| Null ballots by section | 747 | 747 | maggioli_2025_totals_mayor_xml | NULLE | OK |
| Contested ballots by section | 8 | 8 | maggioli_2025_totals_mayor_xml | VCNAS_TOT | OK |
| Mayor candidate votes by section | 35497 | 35497 | maggioli_2025_totals_mayor_xml | VOTIVALIDI_C1 | OK |
| List votes by section | 34280 | 34280 | maggioli_2025_totals_mayor_xml | VOTIVALIDI_C2 | OK |

Preference votes are not compared to list votes as a total check because preference votes follow separate counting rules and no separate official preference-total reference is registered in the processed dataset.

## Residual limits

- The complete analytical dataset currently covers only the 2025 municipal election.
- 2021 remains documented only as a partial rerun linked to the 2019 election and is not part of comparative processed analysis.
- Historical elections remain outside the analytical scope until complete, verifiable official sources are available.
- Polling-place addresses and future territorial joins still require separate source verification; no geometry is created or inferred here.
- Eligendo remains a future validation/completion source and is not extended in this audit.

## Outputs

- Coverage matrix: `data/interim/qa/electoral_2025_coverage_matrix.csv`.
- This report: `data/interim/qa/electoral_2025_completeness_report.md`.
