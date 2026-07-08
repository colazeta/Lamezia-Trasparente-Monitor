from __future__ import annotations

import argparse
import csv
import json
import subprocess
import sys
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any

from electoral_geo_utils import INTERIM_GEO_DIR, QA_DIR, ROOT, read_csv_rows, relpath


DECISIONS_AUDIT_FINDINGS_CSV = QA_DIR / "anncsu_coordinate_decisions_audit_findings_2025.csv"
DECISIONS_AUDIT_REPORT = QA_DIR / "anncsu_coordinate_decisions_audit_report_2025.md"
RECOVERY_LAYER_CSV = INTERIM_GEO_DIR / "anncsu_lamezia_coordinate_recovery_candidates_2025.csv"
RECOVERY_LAYER_REPORT = QA_DIR / "anncsu_coordinate_recovery_layer_report_2025.md"
TRAINING_SET_CSV = QA_DIR / "anncsu_coordinate_recovery_training_set_2025.csv"
QUALITY_REPORT = QA_DIR / "anncsu_coordinate_quality_report_2025.md"
SUSPECT_CSV = QA_DIR / "anncsu_coordinate_suspect_points_2025.csv"
REPORT_PATH = QA_DIR / "anncsu_coordinate_override_intake_report_2025.md"


def as_text(value: Any) -> str:
    if value is None:
        return ""
    text = str(value)
    return "" if text.lower() == "nan" else text.strip()


def read_json_or_csv_rows(path: Path | None) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    if path is None or not path.exists():
        return [], {}
    if path.suffix.lower() == ".json":
        payload = json.loads(path.read_text(encoding="utf-8-sig"))
        if isinstance(payload, dict):
            rows = payload.get("decisions", [])
            meta = {key: value for key, value in payload.items() if key != "decisions"}
        else:
            rows = payload
            meta = {}
        if not isinstance(rows, list):
            raise RuntimeError(f"Decision JSON does not contain a decisions list: {path}")
        return [row for row in rows if isinstance(row, dict)], meta
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle)), {"decision_file_format": "csv"}


def count_rows(path: Path) -> int:
    return len(read_csv_rows(path)) if path.exists() else 0


def counter_from_csv(path: Path, field: str) -> Counter[str]:
    counts: Counter[str] = Counter()
    if not path.exists():
        return counts
    for row in read_csv_rows(path):
        counts[as_text(row.get(field)) or "blank"] += 1
    return counts


def script_path(name: str) -> Path:
    return ROOT / "scripts" / name


def safe_relpath(path: Path | None) -> str:
    if path is None:
        return "none"
    try:
        return relpath(path)
    except ValueError:
        return str(path)


def run_step(label: str, args: list[str]) -> dict[str, Any]:
    result = subprocess.run(
        [sys.executable, *args],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    return {
        "label": label,
        "returncode": result.returncode,
        "stdout": result.stdout.strip(),
        "stderr": result.stderr.strip(),
    }


def step_status(step: dict[str, Any]) -> str:
    return "pass" if step["returncode"] == 0 else "fail"


def markdown_table(headers: list[str], rows: list[list[str]]) -> list[str]:
    lines = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join("---" for _ in headers) + " |",
    ]
    for row in rows:
        lines.append("| " + " | ".join(value.replace("|", "\\|") for value in row) + " |")
    return lines


def gate_status(decisions_path: Path | None, steps: list[dict[str, Any]], training_rows: int) -> str:
    if decisions_path is None:
        return "awaiting_reviewed_decisions"
    if any(step["returncode"] != 0 for step in steps):
        return "blocked_by_coordinate_decision_gate"
    if training_rows == 0:
        return "passed_with_no_accepted_overrides"
    return "passed_with_accepted_reviewed_overrides"


def write_report(
    *,
    decisions_path: Path | None,
    decision_rows: int,
    decision_meta: dict[str, Any],
    steps: list[dict[str, Any]],
    skip_quality_audit: bool,
) -> None:
    training_rows = count_rows(TRAINING_SET_CSV)
    recovery_rows = count_rows(RECOVERY_LAYER_CSV)
    suspect_rows = count_rows(SUSPECT_CSV)
    source_counts = counter_from_csv(RECOVERY_LAYER_CSV, "effective_coordinate_source")
    recovery_status_counts = counter_from_csv(RECOVERY_LAYER_CSV, "coordinate_recovery_status")
    suspect_flag_counts = counter_from_csv(SUSPECT_CSV, "coordinate_quality_flag")
    finding_counts = counter_from_csv(DECISIONS_AUDIT_FINDINGS_CSV, "severity")
    status = gate_status(decisions_path, steps, training_rows)
    quality_audit_run = any(step["label"] == "audit coordinate quality with recovery layer" for step in steps)

    lines = [
        "# ANNCSU Coordinate Override Intake 2025",
        "",
        f"Date: {date.today().isoformat()}",
        "",
        "## Scope",
        "",
        "This report records the controlled intake gate for reviewed ANNCSU coordinate overrides. It does not edit raw ANNCSU coordinates, processed electoral results, GPKG files, public UI, maps, or candidate polygons.",
        "",
        "Reviewed coordinates become effective only as separate recovery-layer values after the coordinate-decision audit has no P0/P1 findings.",
        "",
        "## Gate Result",
        "",
        f"- Status: `{status}`",
        f"- Decisions input: `{safe_relpath(decisions_path)}`" if decisions_path else "- Decisions input: none",
        f"- Decision rows: {decision_rows}",
        f"- Recovery rows: {recovery_rows}",
        f"- Training rows accepted from manual overrides: {training_rows}",
        f"- Suspect rows after latest coordinate-quality audit: {suspect_rows}",
        f"- Quality audit run in this intake: {'true' if quality_audit_run else 'false'}",
        f"- Quality audit skip option: {'true' if skip_quality_audit else 'false'}",
        "",
        "## Pipeline Steps",
        "",
    ]
    if steps:
        lines.extend(
            markdown_table(
                ["Step", "Status", "Return code"],
                [[step["label"], step_status(step), str(step["returncode"])] for step in steps],
            )
        )
    else:
        lines.append("- No decision file supplied; no override pipeline steps were run.")

    if decision_meta:
        lines.extend(["", "## Decision Export Metadata", ""])
        for key, value in decision_meta.items():
            lines.append(f"- {key}: `{value}`")

    lines.extend(["", "## Decision Audit Findings", ""])
    if finding_counts:
        for key, value in sorted(finding_counts.items()):
            lines.append(f"- `{key}`: {value}")
    else:
        lines.append("- No findings CSV entries currently recorded.")

    lines.extend(["", "## Effective Coordinate Source Counts", ""])
    if source_counts:
        for key, value in sorted(source_counts.items()):
            lines.append(f"- `{key}`: {value}")
    else:
        lines.append("- Recovery layer not present or empty.")

    lines.extend(["", "## Recovery Status Counts", ""])
    if recovery_status_counts:
        for key, value in sorted(recovery_status_counts.items()):
            lines.append(f"- `{key}`: {value}")
    else:
        lines.append("- Recovery layer not present or empty.")

    lines.extend(["", "## Coordinate Quality Flag Counts", ""])
    if suspect_flag_counts:
        for key, value in sorted(suspect_flag_counts.items()):
            lines.append(f"- `{key}`: {value}")
    else:
        lines.append("- No suspect coordinate rows currently recorded.")

    lines.extend(
        [
            "",
            "## Outputs Checked",
            "",
            f"- Decision audit report: `{relpath(DECISIONS_AUDIT_REPORT)}`",
            f"- Decision findings CSV: `{relpath(DECISIONS_AUDIT_FINDINGS_CSV)}`",
            f"- Recovery layer CSV: `{relpath(RECOVERY_LAYER_CSV)}`",
            f"- Recovery layer report: `{relpath(RECOVERY_LAYER_REPORT)}`",
            f"- Training-set CSV: `{relpath(TRAINING_SET_CSV)}`",
            f"- Coordinate quality report: `{relpath(QUALITY_REPORT)}`",
            "",
            "## How To Use",
            "",
            "1. Export reviewed coordinate decisions from the local workbench or build them from a human-filled worksheet.",
            "2. Run `python scripts/intake_anncsu_coordinate_overrides.py --decisions <reviewed-decisions.json>`.",
            "3. If the status is `passed_with_accepted_reviewed_overrides`, commit the decision export, recovery layer, training set, and QA reports in a small PR.",
            "4. If the status is blocked, inspect the decision audit report and fix P0/P1 findings before rebuilding the recovery layer.",
            "",
            "## Guardrails",
            "",
            "- Do not train from geocoder or local-anchor candidates before human acceptance.",
            "- Do not rewrite `COORD_X_COMUNE` or `COORD_Y_COMUNE` in raw ANNCSU files.",
            "- Do not use this intake report to create V4 geometry automatically.",
            "- Keep public UI, deploy, maps, GPKG files, and electoral result values out of this workflow.",
        ]
    )

    for step in steps:
        if step["returncode"] == 0:
            continue
        lines.extend(["", f"## Failed Step: {step['label']}", ""])
        if step["stdout"]:
            lines.extend(["### stdout", "", "```text", step["stdout"][:4000], "```"])
        if step["stderr"]:
            lines.extend(["### stderr", "", "```text", step["stderr"][:4000], "```"])

    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the reviewed ANNCSU coordinate override intake gate.")
    parser.add_argument("--decisions", type=Path, default=None, help="Reviewed coordinate decision export JSON/CSV.")
    parser.add_argument(
        "--skip-quality-audit",
        action="store_true",
        help="Skip the recovery-layer coordinate quality audit after accepted decisions are applied.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    decisions_path = args.decisions
    if decisions_path is not None and not decisions_path.exists():
        print(f"missing_decisions={decisions_path}", file=sys.stderr)
        return 1

    decision_rows, decision_meta = read_json_or_csv_rows(decisions_path)
    steps: list[dict[str, Any]] = []
    exit_code = 0

    if decisions_path is not None:
        steps.append(
            run_step(
                "audit reviewed coordinate decisions",
                [str(script_path("audit_anncsu_coordinate_decisions.py")), "--decisions", str(decisions_path)],
            )
        )
        if steps[-1]["returncode"] == 0:
            steps.append(
                run_step(
                    "build recovery layer and training set",
                    [str(script_path("build_anncsu_coordinate_recovery_layer.py")), "--decisions", str(decisions_path)],
                )
            )
        if steps[-1]["returncode"] == 0 and not args.skip_quality_audit:
            steps.append(
                run_step(
                    "audit coordinate quality with recovery layer",
                    [str(script_path("audit_anncsu_coordinate_quality.py")), "--use-recovery-layer"],
                )
            )
        if any(step["returncode"] != 0 for step in steps):
            exit_code = 1

    write_report(
        decisions_path=decisions_path,
        decision_rows=len(decision_rows),
        decision_meta=decision_meta,
        steps=steps,
        skip_quality_audit=args.skip_quality_audit,
    )

    print(f"override_intake_report={REPORT_PATH}")
    print(f"decision_rows={len(decision_rows)}")
    print(f"training_rows={count_rows(TRAINING_SET_CSV)}")
    print(f"status={gate_status(decisions_path, steps, count_rows(TRAINING_SET_CSV))}")
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
