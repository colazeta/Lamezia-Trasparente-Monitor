from __future__ import annotations

import sys
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any

from audit_anncsu_coordinate_decisions import audit_decisions, load_decisions
from electoral_geo_utils import INTERIM_GEO_DIR, PROCESSED_GEO_DIR, QA_DIR, read_csv_rows, relpath, write_csv_rows


CIVICS_CSV = PROCESSED_GEO_DIR / "anncsu_lamezia_civics_with_electoral_section_2025_v2.csv"
SUSPECT_CSV = QA_DIR / "anncsu_coordinate_suspect_points_2025.csv"
DIAGNOSTIC_CSV = QA_DIR / "anncsu_coordinate_corruption_diagnostic_2025.csv"
GEOCODE_CANDIDATES_CSV = QA_DIR / "anncsu_coordinate_geocode_candidates_2025.csv"
LOCAL_ANCHOR_CANDIDATES_CSV = QA_DIR / "anncsu_coordinate_local_anchor_candidates_2025.csv"
REVIEW_PACK_CSV = QA_DIR / "anncsu_coordinate_review_pack_2025.csv"
WORKSHEET_CSV = QA_DIR / "anncsu_coordinate_review_worksheet_batch_1_2025.csv"
REVIEWED_DECISIONS_JSON = QA_DIR / "anncsu_coordinate_reviewed_decisions_batch_1_2025.json"
RECOVERY_LAYER_CSV = INTERIM_GEO_DIR / "anncsu_lamezia_coordinate_recovery_candidates_2025.csv"
TRAINING_SET_CSV = QA_DIR / "anncsu_coordinate_recovery_training_set_2025.csv"

REPORT_PATH = QA_DIR / "anncsu_coordinate_recovery_readiness_report_2025.md"
FINDINGS_CSV = QA_DIR / "anncsu_coordinate_recovery_readiness_findings_2025.csv"

FINDING_FIELDS = ["severity", "code", "detail", "next_action"]
ACCEPT_ACTIONS = {"accept_candidate", "edit_coordinate"}
PIPELINE_MISMATCH_DIAGNOSES = {"pipeline_extract_coordinate_mismatch", "processed_coordinate_mismatch"}


def as_text(value: Any) -> str:
    if value is None:
        return ""
    text = str(value)
    return "" if text.lower() == "nan" else text.strip()


def access_ids(rows: list[dict[str, Any]], field: str = "access_id") -> set[str]:
    return {as_text(row.get(field)) for row in rows if as_text(row.get(field))}


def count_by(rows: list[dict[str, Any]], field: str) -> Counter[str]:
    return Counter(as_text(row.get(field)) or "blank" for row in rows)


def load_decision_rows(path: Path) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    if not path.exists():
        return [], {}
    return load_decisions(path)


def add_finding(findings: list[dict[str, str]], severity: str, code: str, detail: str, next_action: str) -> None:
    findings.append({"severity": severity, "code": code, "detail": detail, "next_action": next_action})


def markdown_counts(counter: Counter[str]) -> list[str]:
    if not counter:
        return ["- none"]
    return [f"- `{key}`: {value}" for key, value in sorted(counter.items())]


def write_report(
    *,
    civics_count: int,
    suspect_rows: list[dict[str, Any]],
    diagnostic_rows: list[dict[str, Any]],
    geocode_rows: list[dict[str, Any]],
    local_anchor_rows: list[dict[str, Any]],
    review_pack_rows: list[dict[str, Any]],
    worksheet_rows: list[dict[str, Any]],
    decision_rows: list[dict[str, Any]],
    decision_summary: dict[str, Any],
    decision_findings: list[dict[str, str]],
    recovery_rows: list[dict[str, Any]],
    training_rows: list[dict[str, Any]],
    findings: list[dict[str, str]],
) -> None:
    suspect_access = access_ids(suspect_rows)
    geocode_access = access_ids(
        [row for row in geocode_rows if as_text(row.get("candidate_status")) == "candidate_requires_human_review"]
    )
    local_anchor_access = access_ids(
        [row for row in local_anchor_rows if as_text(row.get("candidate_status")) == "candidate_requires_human_review"]
    )
    manual_ready_access = access_ids(
        [row for row in review_pack_rows if as_text(row.get("decision_readiness")) == "manual_review_ready"]
    )
    accepted_worksheet = [
        row for row in worksheet_rows if as_text(row.get("reviewer_action")) in ACCEPT_ACTIONS
    ]
    recovery_accepted = [
        row
        for row in recovery_rows
        if as_text(row.get("coordinate_recovery_status")) == "accepted_reviewed_override"
    ]
    severity_counts = Counter(row["severity"] for row in findings)
    decision_severity_counts = Counter(row["severity"] for row in decision_findings)

    lines = [
        "# ANNCSU Coordinate Recovery Readiness 2025",
        "",
        f"Date: {date.today().isoformat()}",
        "",
        "## Readiness Verdict",
        "",
    ]
    if severity_counts.get("P0") or severity_counts.get("P1"):
        lines.append("- `not_ready`: resolve P0/P1 findings before applying reviewed coordinates.")
    elif accepted_worksheet or decision_rows:
        lines.append("- `ready_for_recovery_build`: no P0/P1 readiness blockers detected for the reviewed rows.")
    else:
        lines.append("- `awaiting_human_review`: diagnostics and candidate evidence exist, but no reviewed coordinate overrides have been accepted yet.")

    lines.extend(
        [
            "",
            "## Source And Candidate Coverage",
            "",
            f"- Source civics: {civics_count}",
            f"- Suspect coordinate rows: {len(suspect_rows)}",
            f"- Suspects with local ANNCSU candidate: {len(suspect_access & local_anchor_access)}",
            f"- Suspects with external geocoder candidate: {len(suspect_access & geocode_access)}",
            f"- Suspects manual-review-ready in review pack: {len(suspect_access & manual_ready_access)}",
            f"- Worksheet rows: {len(worksheet_rows)}",
            f"- Worksheet accepted rows: {len(accepted_worksheet)}",
            f"- Reviewed decisions JSON rows: {len(decision_rows)}",
            f"- Recovery rows: {len(recovery_rows)}",
            f"- Accepted reviewed overrides in recovery layer: {len(recovery_accepted)}",
            f"- Training-set rows: {len(training_rows)}",
            "",
            "## Diagnosis Counts",
            "",
        ]
    )
    lines.extend(markdown_counts(count_by(diagnostic_rows, "source_diagnosis")))
    lines.extend(["", "## Coordinate Quality Flags", ""])
    lines.extend(markdown_counts(count_by(suspect_rows, "coordinate_quality_flag")))
    lines.extend(["", "## Review Pack Readiness", ""])
    lines.extend(markdown_counts(count_by(review_pack_rows, "decision_readiness")))
    lines.extend(["", "## Worksheet Actions", ""])
    lines.extend(markdown_counts(count_by(worksheet_rows, "reviewer_action")))
    lines.extend(["", "## Decision Audit Summary", ""])
    if decision_summary:
        for key, value in decision_summary.items():
            if isinstance(value, dict):
                lines.append(f"- {key}:")
                for subkey, subvalue in value.items():
                    lines.append(f"  - `{subkey}`: {subvalue}")
            else:
                lines.append(f"- {key}: {value}")
        lines.append(f"- decision audit findings P0/P1/P2: {dict(sorted(decision_severity_counts.items()))}")
    else:
        lines.append("- No reviewed coordinate decision rows to audit yet.")
    lines.extend(["", "## Recovery Status Counts", ""])
    lines.extend(markdown_counts(count_by(recovery_rows, "coordinate_recovery_status")))
    lines.extend(["", "## Findings", ""])
    if findings:
        lines.append("| Severity | Code | Detail | Next action |")
        lines.append("| --- | --- | --- | --- |")
        for row in findings:
            detail = row["detail"].replace("|", "\\|")
            next_action = row["next_action"].replace("|", "\\|")
            lines.append(f"| {row['severity']} | `{row['code']}` | {detail} | {next_action} |")
    else:
        lines.append("- No P0/P1/P2 findings.")
    lines.extend(
        [
            "",
            "## Operational Next Step",
            "",
            "1. Complete rows in `data/interim/qa/anncsu_coordinate_review_worksheet_batch_1_2025.csv` with `accept_candidate`, `edit_coordinate`, `reject_candidate`, or `needs_more_evidence`.",
            "2. Re-run `scripts/build_anncsu_coordinate_decisions_from_worksheet.py`.",
            "3. Re-run `scripts/audit_anncsu_coordinate_decisions.py --decisions data/interim/qa/anncsu_coordinate_reviewed_decisions_batch_1_2025.json`.",
            "4. Re-run `scripts/build_anncsu_coordinate_recovery_layer.py --decisions data/interim/qa/anncsu_coordinate_reviewed_decisions_batch_1_2025.json` only when the decision audit has no P0/P1 findings.",
            "5. Re-run `scripts/audit_anncsu_coordinate_quality.py --use-recovery-layer` and inspect whether suspect counts actually fall.",
            "",
            "Raw ANNCSU coordinates remain immutable. Reviewed replacements become separate effective coordinates and training rows only after the audit gate passes.",
        ]
    )
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    required = [CIVICS_CSV, SUSPECT_CSV, DIAGNOSTIC_CSV, REVIEW_PACK_CSV, WORKSHEET_CSV, RECOVERY_LAYER_CSV]
    missing = [path for path in required if not path.exists()]
    if missing:
        for path in missing:
            print(f"missing_input={path}", file=sys.stderr)
        return 1

    civics_count = len(read_csv_rows(CIVICS_CSV))
    suspect_rows = read_csv_rows(SUSPECT_CSV)
    diagnostic_rows = read_csv_rows(DIAGNOSTIC_CSV)
    geocode_rows = read_csv_rows(GEOCODE_CANDIDATES_CSV)
    local_anchor_rows = read_csv_rows(LOCAL_ANCHOR_CANDIDATES_CSV)
    review_pack_rows = read_csv_rows(REVIEW_PACK_CSV)
    worksheet_rows = read_csv_rows(WORKSHEET_CSV)
    recovery_rows = read_csv_rows(RECOVERY_LAYER_CSV)
    training_rows = read_csv_rows(TRAINING_SET_CSV)
    decision_rows, _decision_meta = load_decision_rows(REVIEWED_DECISIONS_JSON)
    decision_findings, decision_summary = audit_decisions(decision_rows) if decision_rows else ([], {})

    findings: list[dict[str, str]] = []
    diagnosis_counts = count_by(diagnostic_rows, "source_diagnosis")
    pipeline_mismatches = sum(diagnosis_counts.get(key, 0) for key in PIPELINE_MISMATCH_DIAGNOSES)
    if pipeline_mismatches:
        add_finding(
            findings,
            "P1",
            "pipeline-coordinate-mismatch",
            f"{pipeline_mismatches} suspect rows differ between raw, extract, or processed coordinate bytes.",
            "Repair the extraction/processing pipeline before using external geocoding candidates.",
        )
    if suspect_rows and diagnosis_counts.get("suspect_coordinate_present_in_original_anncsu_raw", 0) == len(suspect_rows):
        add_finding(
            findings,
            "P2",
            "source-coordinate-suspects-come-from-raw-anncsu",
            "All current suspect coordinates are already present in the original ANNCSU indirizzario bytes.",
            "Treat replacements as reviewed effective coordinates; do not overwrite raw source fields.",
        )

    accepted_actions = [row for row in worksheet_rows if as_text(row.get("reviewer_action")) in ACCEPT_ACTIONS]
    if not accepted_actions:
        add_finding(
            findings,
            "P2",
            "no-reviewed-coordinate-overrides-yet",
            "The current worksheet has no accepted or edited coordinate rows.",
            "Human review must mark rows before any recovery/training set can be populated.",
        )
    if accepted_actions and not decision_rows:
        add_finding(
            findings,
            "P1",
            "accepted-worksheet-without-decision-export",
            "Worksheet contains accepted coordinate rows, but reviewed decisions JSON is empty or missing.",
            "Run build_anncsu_coordinate_decisions_from_worksheet.py and resolve validation errors.",
        )

    blocking_decision_findings = [row for row in decision_findings if row["severity"] in {"P0", "P1"}]
    if blocking_decision_findings:
        add_finding(
            findings,
            "P1",
            "decision-audit-blockers",
            f"Reviewed decision audit has {len(blocking_decision_findings)} P0/P1 finding(s).",
            "Resolve the decision audit before building recovery coordinates.",
        )

    recovery_accepted_count = sum(
        1 for row in recovery_rows if as_text(row.get("coordinate_recovery_status")) == "accepted_reviewed_override"
    )
    training_ready_count = int(decision_summary.get("training_ready_manual_overrides", 0) or 0)
    if training_ready_count and recovery_accepted_count < training_ready_count:
        add_finding(
            findings,
            "P1",
            "recovery-layer-not-built-from-reviewed-decisions",
            f"{training_ready_count} training-ready decision(s) exist but only {recovery_accepted_count} accepted override(s) appear in the recovery layer.",
            "Re-run build_anncsu_coordinate_recovery_layer.py with the reviewed decisions JSON.",
        )
    if training_rows and len(training_rows) != recovery_accepted_count:
        add_finding(
            findings,
            "P1",
            "training-set-recovery-count-mismatch",
            f"Training set rows ({len(training_rows)}) do not match accepted recovery overrides ({recovery_accepted_count}).",
            "Rebuild the recovery layer and training set from the same audited decisions file.",
        )

    suspect_access = access_ids(suspect_rows)
    manual_ready_access = access_ids([row for row in review_pack_rows if as_text(row.get("decision_readiness")) == "manual_review_ready"])
    if len(suspect_access - manual_ready_access) > 0:
        add_finding(
            findings,
            "P2",
            "not-all-suspects-have-review-ready-candidate",
            f"{len(suspect_access - manual_ready_access)} suspect row(s) are not manual-review-ready in the current review pack.",
            "Use dedicated geocoder/manual lookup for rows without a local or external candidate.",
        )

    write_csv_rows(FINDINGS_CSV, findings, FINDING_FIELDS)
    write_report(
        civics_count=civics_count,
        suspect_rows=suspect_rows,
        diagnostic_rows=diagnostic_rows,
        geocode_rows=geocode_rows,
        local_anchor_rows=local_anchor_rows,
        review_pack_rows=review_pack_rows,
        worksheet_rows=worksheet_rows,
        decision_rows=decision_rows,
        decision_summary=decision_summary,
        decision_findings=decision_findings,
        recovery_rows=recovery_rows,
        training_rows=training_rows,
        findings=findings,
    )

    severity_counts = Counter(row["severity"] for row in findings)
    print(f"readiness_report={REPORT_PATH}")
    print(f"readiness_findings_csv={FINDINGS_CSV}")
    print(f"source_civics={civics_count}")
    print(f"suspect_rows={len(suspect_rows)}")
    print(f"worksheet_accepted_rows={len(accepted_actions)}")
    print(f"decision_rows={len(decision_rows)}")
    print(f"recovery_accepted_overrides={recovery_accepted_count}")
    for severity in ["P0", "P1", "P2"]:
        print(f"{severity}={severity_counts.get(severity, 0)}")
    return 1 if severity_counts.get("P0") or severity_counts.get("P1") else 0


if __name__ == "__main__":
    sys.exit(main())
