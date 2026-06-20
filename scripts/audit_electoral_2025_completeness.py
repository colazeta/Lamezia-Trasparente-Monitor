from __future__ import annotations

import sys
from collections import Counter, defaultdict
from datetime import date

from utils import INTERIM_TABLES_DIR, PROCESSED_DIR, QA_DIR, ROOT, int_value, read_csv, write_csv


ELECTION_ID = "comunali_lamezia_2025"
REPORT_PATH = QA_DIR / "electoral_2025_completeness_report.md"
MATRIX_PATH = QA_DIR / "electoral_2025_coverage_matrix.csv"

COVERAGE_HEADERS = [
    "table_name",
    "expected_unit",
    "expected_rows",
    "observed_rows",
    "completeness_status",
    "source_doc_id_coverage",
    "validation_status",
    "notes",
]


def rows_for(filename: str, election_id: str = ELECTION_ID) -> list[dict]:
    return [
        row
        for row in read_csv(PROCESSED_DIR / filename)
        if row.get("election_id") == election_id
    ]


def source_rows_for_2025() -> list[dict]:
    return rows_for("source_documents.csv")


def duplicate_keys(rows: list[dict], keys: list[str]) -> list[tuple[str, int]]:
    counts = Counter(tuple(row.get(key, "") for key in keys) for row in rows)
    duplicates = []
    for key_values, count in counts.items():
        if count > 1:
            duplicates.append((" / ".join(key_values), count))
    return sorted(duplicates)


def missing_required(rows: list[dict], fields: list[str]) -> dict[str, int]:
    missing = {}
    for field in fields:
        count = sum(1 for row in rows if row.get(field, "") == "")
        if count:
            missing[field] = count
    return missing


def source_coverage(rows: list[dict], source_doc_ids: set[str]) -> tuple[str, list[str]]:
    used = sorted({row.get("source_doc_id", "") for row in rows if row.get("source_doc_id", "")})
    missing = sorted(set(used) - source_doc_ids)
    if not used:
        return "none", missing
    return f"{len(used)} source_doc_id(s): {', '.join(used)}", missing


def markdown_table(headers: list[str], rows: list[list[str]]) -> list[str]:
    lines = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join("---" for _ in headers) + " |",
    ]
    for row in rows:
        lines.append("| " + " | ".join(str(value) for value in row) + " |")
    return lines


def total_rows() -> list[dict]:
    return [
        row
        for row in read_csv(INTERIM_TABLES_DIR / "maggioli_2025_totals.csv")
        if row.get("election_id") == ELECTION_ID
    ]


def matching_total(totals: list[dict], metric: str, observed: int) -> tuple[str, str, str]:
    matches = [
        row for row in totals
        if row.get("metric") == metric and int_value(row.get("value", "")) == observed
    ]
    if matches:
        row = matches[-1]
        return row["value"], row.get("source_doc_id", ""), row.get("source_attribute", "")
    metric_rows = [row for row in totals if row.get("metric") == metric]
    if not metric_rows:
        return "", "", ""
    row = metric_rows[-1]
    return row["value"], row.get("source_doc_id", ""), row.get("source_attribute", "")


def sum_field(rows: list[dict], field: str) -> int:
    return sum(int_value(row.get(field, "")) for row in rows)


def add_matrix_row(
    matrix_rows: list[dict],
    *,
    table_name: str,
    expected_unit: str,
    expected_rows: int,
    observed_rows: int,
    issues: list[str],
    source_doc_id_coverage: str,
    notes: str,
) -> None:
    status = "complete" if expected_rows == observed_rows and not issues else "needs_review"
    matrix_rows.append(
        {
            "table_name": table_name,
            "expected_unit": expected_unit,
            "expected_rows": str(expected_rows),
            "observed_rows": str(observed_rows),
            "completeness_status": status,
            "source_doc_id_coverage": source_doc_id_coverage,
            "validation_status": "pass" if not issues else "; ".join(issues),
            "notes": notes,
        }
    )


def main() -> int:
    QA_DIR.mkdir(parents=True, exist_ok=True)

    elections = rows_for("elections.csv")
    source_documents = source_rows_for_2025()
    mayor_candidates = rows_for("mayor_candidates.csv")
    lists = rows_for("lists.csv")
    council_candidates = rows_for("council_candidates.csv")
    sections = rows_for("sections.csv")
    turnout = rows_for("turnout_section.csv")
    votes_mayor = rows_for("votes_mayor_section.csv")
    votes_list = rows_for("votes_list_section.csv")
    preferences = rows_for("preferences_section.csv")

    source_doc_ids = {row["source_doc_id"] for row in source_documents}
    section_numbers = {row["section_number"] for row in sections}
    mayor_candidate_ids = {row["mayor_candidate_id"] for row in mayor_candidates}
    list_ids = {row["list_id"] for row in lists}
    council_candidate_ids = {row["council_candidate_id"] for row in council_candidates}
    candidate_to_list = {
        row["council_candidate_id"]: row["list_id"]
        for row in council_candidates
    }

    expected = {
        "elections.csv": 1,
        "source_documents.csv": 21,
        "mayor_candidates.csv": 3,
        "lists.csv": 14,
        "council_candidates.csv": 330,
        "sections.csv": 78,
        "turnout_section.csv": 78,
        "votes_mayor_section.csv": len(section_numbers) * len(mayor_candidate_ids),
        "votes_list_section.csv": len(section_numbers) * len(list_ids),
        "preferences_section.csv": len(section_numbers) * len(council_candidate_ids),
    }

    table_specs = [
        ("elections.csv", elections, ["election_id"], ["election_id", "year", "election_type"], "2025 election row", "one 2025 election metadata row"),
        ("source_documents.csv", source_documents, ["source_doc_id"], ["source_doc_id", "publisher", "source_type", "title", "url", "local_path", "file_format", "checksum_sha256"], "2025 source document", "2025 Comune/Maggioli source registry rows"),
        ("mayor_candidates.csv", mayor_candidates, ["election_id", "mayor_candidate_id"], ["election_id", "mayor_candidate_id", "candidate_name", "source_doc_id"], "candidate sindaco", "3 candidates from Maggioli 2025"),
        ("lists.csv", lists, ["election_id", "list_id"], ["election_id", "list_id", "list_name", "mayor_candidate_id", "source_doc_id"], "lista", "14 lists from Maggioli 2025"),
        ("council_candidates.csv", council_candidates, ["election_id", "list_id", "council_candidate_id"], ["election_id", "list_id", "council_candidate_id", "candidate_name", "source_doc_id"], "candidate consigliere", "330 council candidates across 14 lists"),
        ("sections.csv", sections, ["election_id", "section_number"], ["election_id", "section_number", "section_label", "source_doc_id"], "sezione", "one row per electoral section"),
        ("turnout_section.csv", turnout, ["election_id", "section_number"], ["election_id", "round", "section_number", "registered_voters", "voters", "valid_votes", "blank_ballots", "null_ballots", "contested_ballots", "source_doc_id", "validation_status"], "sezione", "one turnout row per section"),
        ("votes_mayor_section.csv", votes_mayor, ["election_id", "round", "section_number", "mayor_candidate_id"], ["election_id", "round", "section_number", "mayor_candidate_id", "votes", "source_doc_id", "validation_status"], "sezione/candidato sindaco", "one row for each section and mayor candidate"),
        ("votes_list_section.csv", votes_list, ["election_id", "round", "section_number", "list_id"], ["election_id", "round", "section_number", "list_id", "votes", "source_doc_id", "validation_status"], "sezione/lista", "one row for each section and list"),
        ("preferences_section.csv", preferences, ["election_id", "section_number", "list_id", "council_candidate_id"], ["election_id", "section_number", "list_id", "council_candidate_id", "preference_votes", "source_doc_id", "validation_status"], "sezione/lista/candidato consigliere", "one row for each section and council candidate"),
    ]

    issues_by_table: dict[str, list[str]] = defaultdict(list)
    duplicate_summaries: list[str] = []
    missing_summaries: list[str] = []

    for filename, rows, key_fields, required_fields, _unit, _notes in table_specs:
        duplicates = duplicate_keys(rows, key_fields)
        if duplicates:
            issues_by_table[filename].append(f"{len(duplicates)} duplicate logical key(s)")
            duplicate_summaries.append(f"{filename}: {len(duplicates)} duplicate logical key(s)")
        missing = missing_required(rows, required_fields)
        if missing:
            fields = ", ".join(f"{field}={count}" for field, count in sorted(missing.items()))
            issues_by_table[filename].append(f"missing essential fields: {fields}")
            missing_summaries.append(f"{filename}: {fields}")
        if filename != "source_documents.csv":
            _coverage, missing_sources = source_coverage(rows, source_doc_ids)
            if missing_sources:
                issues_by_table[filename].append(f"unknown source_doc_id reference(s): {', '.join(missing_sources)}")

    relation_issues: list[str] = []
    for row in lists:
        if row["mayor_candidate_id"] not in mayor_candidate_ids:
            relation_issues.append(f"lists.csv unknown mayor_candidate_id {row['mayor_candidate_id']}")
    for row in council_candidates:
        if row["list_id"] not in list_ids:
            relation_issues.append(f"council_candidates.csv unknown list_id {row['list_id']}")
    for row in turnout:
        if row["section_number"] not in section_numbers:
            relation_issues.append(f"turnout_section.csv unknown section {row['section_number']}")
    for row in votes_mayor:
        if row["section_number"] not in section_numbers:
            relation_issues.append(f"votes_mayor_section.csv unknown section {row['section_number']}")
        if row["mayor_candidate_id"] not in mayor_candidate_ids:
            relation_issues.append(f"votes_mayor_section.csv unknown mayor_candidate_id {row['mayor_candidate_id']}")
    for row in votes_list:
        if row["section_number"] not in section_numbers:
            relation_issues.append(f"votes_list_section.csv unknown section {row['section_number']}")
        if row["list_id"] not in list_ids:
            relation_issues.append(f"votes_list_section.csv unknown list_id {row['list_id']}")
    for row in preferences:
        candidate_id = row["council_candidate_id"]
        list_id = row["list_id"]
        if row["section_number"] not in section_numbers:
            relation_issues.append(f"preferences_section.csv unknown section {row['section_number']}")
        if list_id not in list_ids:
            relation_issues.append(f"preferences_section.csv unknown list_id {list_id}")
        if candidate_id not in council_candidate_ids:
            relation_issues.append(f"preferences_section.csv unknown council_candidate_id {candidate_id}")
        elif candidate_to_list[candidate_id] != list_id:
            relation_issues.append(f"preferences_section.csv candidate/list mismatch {candidate_id}")

    if relation_issues:
        issues_by_table["relations"].extend(relation_issues)

    totals = total_rows()
    total_checks = [
        ("Registered voters by section", sum_field(turnout, "registered_voters"), "registered_voters"),
        ("Voters by section", sum_field(turnout, "voters"), "voters"),
        ("Turnout valid votes by section", sum_field(turnout, "valid_votes"), "valid_votes_mayor"),
        ("Blank ballots by section", sum_field(turnout, "blank_ballots"), "blank_ballots"),
        ("Null ballots by section", sum_field(turnout, "null_ballots"), "null_ballots"),
        ("Contested ballots by section", sum_field(turnout, "contested_ballots"), "contested_ballots"),
        ("Mayor candidate votes by section", sum_field(votes_mayor, "votes"), "valid_votes_mayor"),
        ("List votes by section", sum_field(votes_list, "votes"), "valid_votes_list"),
    ]
    total_results = []
    for label, observed, metric in total_checks:
        expected_value, source_doc_id, attribute = matching_total(totals, metric, observed)
        ok = expected_value != "" and observed == int_value(expected_value)
        total_results.append(
            {
                "label": label,
                "observed": observed,
                "expected": expected_value,
                "source_doc_id": source_doc_id,
                "source_attribute": attribute,
                "status": "OK" if ok else "MISMATCH",
            }
        )
    total_failures = [row for row in total_results if row["status"] != "OK"]
    if total_failures:
        issues_by_table["totals"].append(f"{len(total_failures)} total check(s) failed")

    matrix_rows: list[dict] = []
    for filename, rows, _key_fields, _required_fields, unit, notes in table_specs:
        coverage, missing_sources = source_coverage(rows, source_doc_ids)
        table_issues = list(issues_by_table.get(filename, []))
        if missing_sources:
            table_issues.append(f"unknown source_doc_id reference(s): {', '.join(missing_sources)}")
        if filename == "source_documents.csv":
            coverage = f"{len(source_doc_ids)} registered 2025 source_doc_id(s)"
        add_matrix_row(
            matrix_rows,
            table_name=filename,
            expected_unit=unit,
            expected_rows=expected[filename],
            observed_rows=len(rows),
            issues=table_issues,
            source_doc_id_coverage=coverage,
            notes=notes,
        )

    if total_failures:
        matrix_rows.append(
            {
                "table_name": "totals",
                "expected_unit": "official total check",
                "expected_rows": str(len(total_results)),
                "observed_rows": str(len(total_results) - len(total_failures)),
                "completeness_status": "needs_review",
                "source_doc_id_coverage": "maggioli_2025_totals_mayor_xml; maggioli_2025_totals_lists_xml",
                "validation_status": f"{len(total_failures)} mismatch(es)",
                "notes": "Totals are checked against Maggioli 2025 total XML rows.",
            }
        )

    write_csv(MATRIX_PATH, matrix_rows, COVERAGE_HEADERS)

    complete_tables = [row["table_name"] for row in matrix_rows if row["completeness_status"] == "complete"]
    report_lines = [
        "# Electoral 2025 completeness report",
        "",
        f"Date: {date.today().isoformat()}",
        "",
        "Scope: complete processed dataset currently available for `comunali_lamezia_2025` from already downloaded Comune/Maggioli sources.",
        "",
        "## Summary",
        "",
        f"- Overall audit status: {'PASS' if not any(issues_by_table.values()) else 'NEEDS REVIEW'}.",
        f"- Complete 2025 tables: {', '.join(complete_tables)}.",
        f"- Number of sections: {len(section_numbers)}.",
        f"- Number of mayor candidates: {len(mayor_candidate_ids)}.",
        f"- Number of lists: {len(list_ids)}.",
        f"- Number of council candidates: {len(council_candidate_ids)}.",
        f"- Turnout rows: {len(turnout)}.",
        f"- Mayor vote rows: {len(votes_mayor)}.",
        f"- List vote rows: {len(votes_list)}.",
        f"- Preference rows: {len(preferences)}.",
        "",
        "## Coverage matrix",
        "",
    ]
    report_lines.extend(
        markdown_table(
            ["table", "expected unit", "expected rows", "observed rows", "status"],
            [
                [
                    row["table_name"],
                    row["expected_unit"],
                    row["expected_rows"],
                    row["observed_rows"],
                    row["completeness_status"],
                ]
                for row in matrix_rows
            ],
        )
    )
    report_lines.extend(
        [
            "",
            "## Logical key and duplicate checks",
            "",
        ]
    )
    if duplicate_summaries:
        report_lines.extend(f"- {item}." for item in duplicate_summaries)
    else:
        report_lines.append("- No duplicate logical keys found in the 2025 processed tables.")
    if missing_summaries:
        report_lines.extend(f"- Missing essential fields: {item}." for item in missing_summaries)
    else:
        report_lines.append("- No missing values found in essential 2025 fields checked by the audit.")
    if relation_issues:
        report_lines.append(f"- Referential issues: {len(relation_issues)}.")
    else:
        report_lines.append("- Lists, mayor candidates, council candidates, section references, and preference rows are mutually consistent.")
    report_lines.extend(
        [
            "",
            "## Totals checks",
            "",
        ]
    )
    report_lines.extend(
        markdown_table(
            ["check", "observed", "expected", "source_doc_id", "attribute", "status"],
            [
                [
                    row["label"],
                    str(row["observed"]),
                    row["expected"],
                    row["source_doc_id"],
                    row["source_attribute"],
                    row["status"],
                ]
                for row in total_results
            ],
        )
    )
    report_lines.extend(
        [
            "",
            "Preference votes are not compared to list votes as a total check because preference votes follow separate counting rules and no separate official preference-total reference is registered in the processed dataset.",
            "",
            "## Residual limits",
            "",
            "- The complete analytical dataset currently covers only the 2025 municipal election.",
            "- 2021 remains documented only as a partial rerun linked to the 2019 election and is not part of comparative processed analysis.",
            "- Historical elections remain outside the analytical scope until complete, verifiable official sources are available.",
            "- Polling-place addresses and future territorial joins still require separate source verification; no geometry is created or inferred here.",
            "- Eligendo remains a future validation/completion source and is not extended in this audit.",
            "",
            "## Outputs",
            "",
            f"- Coverage matrix: `{MATRIX_PATH.relative_to(ROOT).as_posix()}`.",
            f"- This report: `{REPORT_PATH.relative_to(ROOT).as_posix()}`.",
        ]
    )
    REPORT_PATH.write_text("\n".join(report_lines) + "\n", encoding="utf-8")

    print("Electoral 2025 completeness audit")
    print(f"status={'PASS' if not any(issues_by_table.values()) else 'NEEDS REVIEW'}")
    print(f"sections={len(section_numbers)}")
    print(f"mayor_candidates={len(mayor_candidate_ids)}")
    print(f"lists={len(list_ids)}")
    print(f"council_candidates={len(council_candidate_ids)}")
    print(f"turnout_rows={len(turnout)}")
    print(f"votes_mayor_rows={len(votes_mayor)}")
    print(f"votes_list_rows={len(votes_list)}")
    print(f"preference_rows={len(preferences)}")
    print(f"totals_checks={len(total_results)} failures={len(total_failures)}")
    print(f"coverage_matrix={MATRIX_PATH}")
    print(f"report={REPORT_PATH}")

    if any(issues_by_table.values()):
        for table, issues in sorted(issues_by_table.items()):
            for issue in issues[:20]:
                print(f"{table}: {issue}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
