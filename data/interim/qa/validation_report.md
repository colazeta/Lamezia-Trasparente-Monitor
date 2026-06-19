# Validation report

Scope: processed 2025 Comune/Maggioli data currently available in this repository.

## Totals checks
- Registered voters by section: observed 61256; expected 61256; status OK.
- Voters by section: observed 36382; expected 36382; status OK.
- Mayor valid votes by section: observed 35497; expected 35497; status OK.
- Blank ballots by section: observed 115; expected 115; status OK.
- Null ballots by section: observed 747; expected 747; status OK.
- Mayor candidate votes by section: observed 35497; expected 35497; status OK.
- List votes by section: observed 34280; expected 34280; status OK.

## Structural checks
- turnout_section.csv: rows=78; missing_source_doc_id=0; missing_validation_status=0.
- votes_mayor_section.csv: rows=234; missing_source_doc_id=0; missing_validation_status=0.
- votes_list_section.csv: rows=1092; missing_source_doc_id=0; missing_validation_status=0.
- preferences_section.csv: rows=25740; missing_source_doc_id=0; missing_validation_status=0.
- mayor_candidates.csv: rows=3; missing_source_doc_id=0; missing_validation_status=0.
- lists.csv: rows=14; missing_source_doc_id=0; missing_validation_status=0.
- council_candidates.csv: rows=330; missing_source_doc_id=0; missing_validation_status=0.
- sections.csv: rows=78; missing_source_doc_id=0; missing_validation_status=0.
- turnout_section duplicate section rows: none.

## Notes
- Eligendo validation is still pending until election-specific official endpoints/files are registered.
- Preference totals are not compared to list votes because preference votes can follow different counting rules and require a separate official total reference.
- 2021 is documented as a partial rerun attached to comunali_lamezia_2019, not as a standalone ordinary election.
