from __future__ import annotations

import sys
from collections import defaultdict

from utils import INTERIM_TABLES_DIR, PROCESSED_DIR, QA_DIR, ensure_directories, int_value, read_csv


def sum_field(rows: list[dict], field: str) -> int:
    return sum(int_value(row.get(field, "")) for row in rows)


def status_line(label: str, observed: int, expected: str | None) -> tuple[str, bool]:
    if expected in (None, ""):
        return f"- {label}: observed {observed}; no official total available yet.", False
    expected_int = int_value(expected)
    status = "OK" if observed == expected_int else "MISMATCH"
    return f"- {label}: observed {observed}; expected {expected_int}; status {status}.", observed == expected_int


def main() -> int:
    ensure_directories()
    totals = {
        row["metric"]: row["value"]
        for row in read_csv(INTERIM_TABLES_DIR / "maggioli_2025_totals.csv")
        if row.get("election_id") == "comunali_lamezia_2025"
    }
    turnout = read_csv(PROCESSED_DIR / "turnout_section.csv")
    mayor_votes = read_csv(PROCESSED_DIR / "votes_mayor_section.csv")
    list_votes = read_csv(PROCESSED_DIR / "votes_list_section.csv")
    preferences = read_csv(PROCESSED_DIR / "preferences_section.csv")

    lines = [
        "# Validation report",
        "",
        "Scope: processed 2025 Comune/Maggioli data currently available in this repository.",
        "",
        "## Totals checks",
    ]
    checks = []
    for label, observed, expected_key in [
        ("Registered voters by section", sum_field(turnout, "registered_voters"), "registered_voters"),
        ("Voters by section", sum_field(turnout, "voters"), "voters"),
        ("Mayor valid votes by section", sum_field(turnout, "valid_votes"), "valid_votes_mayor"),
        ("Blank ballots by section", sum_field(turnout, "blank_ballots"), "blank_ballots"),
        ("Null ballots by section", sum_field(turnout, "null_ballots"), "null_ballots"),
        ("Mayor candidate votes by section", sum_field(mayor_votes, "votes"), "valid_votes_mayor"),
        ("List votes by section", sum_field(list_votes, "votes"), "valid_votes_list"),
    ]:
        line, ok = status_line(label, observed, totals.get(expected_key))
        lines.append(line)
        checks.append(ok)

    lines.extend(["", "## Structural checks"])
    for filename, required_source, required_validation in [
        ("turnout_section.csv", True, True),
        ("votes_mayor_section.csv", True, True),
        ("votes_list_section.csv", True, True),
        ("preferences_section.csv", True, True),
        ("mayor_candidates.csv", True, False),
        ("lists.csv", True, False),
        ("council_candidates.csv", True, False),
        ("sections.csv", True, False),
    ]:
        rows = read_csv(PROCESSED_DIR / filename)
        missing_source = sum(1 for row in rows if required_source and not row.get("source_doc_id"))
        missing_validation = sum(1 for row in rows if required_validation and not row.get("validation_status"))
        lines.append(f"- {filename}: rows={len(rows)}; missing_source_doc_id={missing_source}; missing_validation_status={missing_validation}.")
        checks.append(missing_source == 0 and missing_validation == 0)

    section_counts = defaultdict(int)
    for row in turnout:
        section_counts[row.get("section_number", "")] += 1
    duplicate_sections = sorted(section for section, count in section_counts.items() if count > 1)
    lines.append(f"- turnout_section duplicate section rows: {', '.join(duplicate_sections) if duplicate_sections else 'none'}.")
    checks.append(not duplicate_sections)

    lines.extend(
        [
            "",
            "## Notes",
            "- Eligendo validation is still pending until election-specific official endpoints/files are registered.",
            "- Preference totals are not compared to list votes because preference votes can follow different counting rules and require a separate official total reference.",
            "- 2021 is documented as a partial rerun attached to comunali_lamezia_2019, not as a standalone ordinary election.",
        ]
    )

    report = QA_DIR / "validation_report.md"
    report.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"validation_report={report}")
    return 0 if all(checks) else 1


if __name__ == "__main__":
    sys.exit(main())
