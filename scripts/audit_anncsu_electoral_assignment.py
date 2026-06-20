from __future__ import annotations

import sys
from collections import Counter
from datetime import date
from pathlib import Path

from normalise_street_names import read_csv_flexible
from utils import PROCESSED_DIR, QA_DIR, ROOT, relpath


INTERIM_GEO_DIR = ROOT / "data" / "interim" / "geo"
RAW_GEO_DIR = ROOT / "data" / "raw" / "geo"
ENRICHED_PATH = PROCESSED_DIR / "geo" / "anncsu_lamezia_civics_with_electoral_section_2025.csv"
REVIEW_QUEUE_PATH = QA_DIR / "anncsu_electoral_assignment_review_queue_2025.csv"
RULES_PATH = INTERIM_GEO_DIR / "electoral_street_rules_2025.csv"
CROSSWALK_PATH = INTERIM_GEO_DIR / "anncsu_electoral_street_crosswalk_2025.csv"
PREFLIGHT_REPORT_PATH = QA_DIR / "anncsu_lamezia_preflight_report.md"
REPORT_PATH = QA_DIR / "anncsu_electoral_assignment_report_2025.md"


REQUIRED_ASSIGNMENT_FIELDS = [
    "rule_id",
    "assignment_method",
    "assignment_confidence",
    "section_number",
]


def markdown_table(headers: list[str], rows: list[list[str]]) -> list[str]:
    lines = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join("---" for _ in headers) + " |",
    ]
    for row in rows:
        lines.append("| " + " | ".join(row) + " |")
    return lines


def count_rows(path: Path) -> int:
    return len(read_csv_flexible(path))


def pct(part: int, total: int) -> str:
    if not total:
        return "0.00%"
    return f"{part / total:.2%}"


def main() -> int:
    required_files = [
        RAW_GEO_DIR / "indirizzarioCalabria20260602.zip",
        RAW_GEO_DIR / "stradarioCalabria20260602.zip",
        RAW_GEO_DIR / "Stradario_elettorale.pdf",
        RAW_GEO_DIR / "anncsu_lamezia_indirizzario_20260602.csv",
        RAW_GEO_DIR / "anncsu_lamezia_stradario_20260602.csv",
        RULES_PATH,
        CROSSWALK_PATH,
        ENRICHED_PATH,
        REVIEW_QUEUE_PATH,
        PREFLIGHT_REPORT_PATH,
    ]
    missing_files = [path for path in required_files if not path.exists()]
    if missing_files:
        for path in missing_files:
            print(f"missing_file={path}", file=sys.stderr)
        return 1

    enriched = read_csv_flexible(ENRICHED_PATH)
    review = read_csv_flexible(REVIEW_QUEUE_PATH)
    rules = read_csv_flexible(RULES_PATH)
    crosswalk = read_csv_flexible(CROSSWALK_PATH)
    rule_ids = {row["rule_id"] for row in rules}
    section_numbers = {row["section_number"] for row in rules}

    assigned = [row for row in enriched if row.get("assignment_status") == "assigned"]
    review_required = [row for row in enriched if row.get("assignment_status") != "assigned"]
    invalid_assigned = []
    unknown_rule_ids = []
    unknown_sections = []
    forbidden_methods = []
    for row in assigned:
        missing = [field for field in REQUIRED_ASSIGNMENT_FIELDS if not row.get(field)]
        if missing:
            invalid_assigned.append((row.get("PROGRESSIVO_ACCESSO", ""), ",".join(missing)))
        if row.get("rule_id") not in rule_ids:
            unknown_rule_ids.append(row.get("rule_id", ""))
        if row.get("section_number") not in section_numbers:
            unknown_sections.append(row.get("section_number", ""))
        if "proximity" in (row.get("assignment_method", "").lower()):
            forbidden_methods.append(row.get("PROGRESSIVO_ACCESSO", ""))

    status_counts = Counter(row.get("assignment_status", "") for row in enriched)
    method_counts = Counter(row.get("assignment_method", "") for row in assigned)
    confidence_counts = Counter(row.get("assignment_confidence", "") for row in assigned)
    review_reasons = Counter(row.get("reason", "") for row in review)
    crosswalk_counts = Counter(row.get("crosswalk_status", "") for row in crosswalk)
    rule_confidence_counts = Counter(row.get("extraction_confidence", "") for row in rules)
    assigned_sections = {row.get("section_number", "") for row in assigned if row.get("section_number")}
    missing_assigned_sections = sorted(section_numbers - assigned_sections, key=lambda value: int(value or 0))
    missing_section_labels = [
        f"{section}: {next((row.get('street_rule_raw', '') for row in rules if row.get('section_number') == section), '')}"
        for section in missing_assigned_sections
    ]

    issues: list[tuple[str, str, str]] = []
    if invalid_assigned:
        issues.append(("P1", "assigned rows missing required assignment fields", str(len(invalid_assigned))))
    if unknown_rule_ids:
        issues.append(("P1", "assigned rows referencing unknown rule_id", str(len(unknown_rule_ids))))
    if unknown_sections:
        issues.append(("P1", "assigned rows referencing unknown section_number", str(len(unknown_sections))))
    if forbidden_methods:
        issues.append(("P0", "assignment method uses proximity", str(len(forbidden_methods))))
    if len(review) != len(review_required):
        issues.append(("P2", "review queue row count differs from review_required rows", f"{len(review)} vs {len(review_required)}"))

    lines = [
        "# ANNCSU electoral assignment report 2025",
        "",
        f"Date: {date.today().isoformat()}",
        "",
        "Scope: enrichment of Lamezia Terme ANNCSU civic access points with 2025 electoral section assignments from the official electoral street register.",
        "",
        "## Method",
        "",
        "- ANNCSU indirizzario is used as the source for civic access points and coordinates.",
        "- ANNCSU stradario is used only to normalize and check odonyms.",
        "- `Stradario_elettorale.pdf` is used as the normative source for section assignment.",
        "- Assignments are based on normalized odonym plus explicit civic/SNC/range/parity rules when present.",
        "- No assignment is made by geographic proximity.",
        "- No polygons, shapefiles, maps, UI, deploy changes, or electoral 2025 result values are created or modified.",
        "",
        "## Outputs",
        "",
    ]
    lines.extend(
        markdown_table(
            ["artifact", "path", "rows"],
            [
                ["Lamezia ANNCSU indirizzario extract", relpath(RAW_GEO_DIR / "anncsu_lamezia_indirizzario_20260602.csv"), str(count_rows(RAW_GEO_DIR / "anncsu_lamezia_indirizzario_20260602.csv"))],
                ["Lamezia ANNCSU stradario extract", relpath(RAW_GEO_DIR / "anncsu_lamezia_stradario_20260602.csv"), str(count_rows(RAW_GEO_DIR / "anncsu_lamezia_stradario_20260602.csv"))],
                ["Electoral street rules", relpath(RULES_PATH), str(len(rules))],
                ["Odonym crosswalk", relpath(CROSSWALK_PATH), str(len(crosswalk))],
                ["Enriched civics", relpath(ENRICHED_PATH), str(len(enriched))],
                ["Review queue", relpath(REVIEW_QUEUE_PATH), str(len(review))],
            ],
        )
    )
    lines.extend(
        [
            "",
            "## Assignment coverage",
            "",
            f"- Total civic access rows: {len(enriched)}.",
            f"- Assigned rows: {len(assigned)} ({pct(len(assigned), len(enriched))}).",
            f"- Review-required rows: {len(review_required)} ({pct(len(review_required), len(enriched))}).",
            f"- Sections referenced by assignments: {len(assigned_sections)}.",
            f"- Sections without assigned civic rows: {', '.join(missing_section_labels) if missing_section_labels else 'none'}.",
            "",
            "### Assignment status",
            "",
        ]
    )
    lines.extend(markdown_table(["status", "rows"], [[key or "(blank)", str(value)] for key, value in sorted(status_counts.items())]))
    lines.extend(["", "### Assignment methods", ""])
    lines.extend(markdown_table(["method", "rows"], [[key or "(blank)", str(value)] for key, value in sorted(method_counts.items())]))
    lines.extend(["", "### Assignment confidence", ""])
    lines.extend(markdown_table(["confidence", "rows"], [[key or "(blank)", str(value)] for key, value in sorted(confidence_counts.items())]))
    lines.extend(["", "## Review queue", ""])
    lines.extend(markdown_table(["reason", "rows"], [[key or "(blank)", str(value)] for key, value in sorted(review_reasons.items())]))
    lines.extend(["", "## Source parsing and crosswalk", ""])
    lines.extend(markdown_table(["rule extraction confidence", "rules"], [[key or "(blank)", str(value)] for key, value in sorted(rule_confidence_counts.items())]))
    lines.extend(["", ""])
    lines.extend(markdown_table(["crosswalk status", "streets"], [[key or "(blank)", str(value)] for key, value in sorted(crosswalk_counts.items())]))
    lines.extend(["", "## Issues", ""])
    if issues:
        lines.extend(markdown_table(["priority", "issue", "evidence"], [[p, issue, evidence] for p, issue, evidence in issues]))
    else:
        lines.append("- No P0/P1/P2 issues found by the automated audit.")
    lines.extend(
        [
            "",
            "## Residual limits",
            "",
            "- Low-confidence PDF lines and unmatched odonyms are preserved for review rather than assigned heuristically.",
            "- Section 78 is the hospital section (`OSPEDALE CIVILE`) and has no ANNCSU civic row assigned by this text-rule pipeline.",
            "- Streets split across multiple sections require the civic rule to match exactly; otherwise the row remains in the review queue.",
            "- ANNCSU coordinates are retained as source attributes but are not used as an assignment criterion.",
            "- The pipeline enriches civic access rows only; it does not change non-geographic electoral processed tables.",
        ]
    )

    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print("ANNCSU electoral assignment audit")
    print(f"rows={len(enriched)} assigned={len(assigned)} review_required={len(review_required)}")
    print(f"issues={len(issues)}")
    print(f"report={REPORT_PATH}")
    for priority, issue, evidence in issues:
        print(f"{priority}: {issue}: {evidence}")
    return 1 if any(priority in {"P0", "P1"} for priority, _, _ in issues) else 0


if __name__ == "__main__":
    sys.exit(main())
