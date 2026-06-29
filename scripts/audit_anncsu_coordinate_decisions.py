#!/usr/bin/env python3
"""Audit reviewed coordinate decisions before they become effective coordinates."""

from __future__ import annotations

import argparse
import csv
import json
import math
import sys
from collections import Counter, defaultdict
from datetime import date, datetime
from pathlib import Path
from typing import Any

from electoral_geo_utils import PROCESSED_GEO_DIR, QA_DIR, ROOT, read_csv_rows, relpath, write_csv_rows


CIVICS_CSV = PROCESSED_GEO_DIR / "anncsu_lamezia_civics_with_electoral_section_2025_v2.csv"
SUSPECT_CSV = QA_DIR / "anncsu_coordinate_suspect_points_2025.csv"
GEOCODE_CANDIDATES_CSV = QA_DIR / "anncsu_coordinate_geocode_candidates_2025.csv"
LOCAL_ANCHOR_CANDIDATES_CSV = QA_DIR / "anncsu_coordinate_local_anchor_candidates_2025.csv"

REPORT_PATH = QA_DIR / "anncsu_coordinate_decisions_audit_report_2025.md"
FINDINGS_CSV = QA_DIR / "anncsu_coordinate_decisions_audit_findings_2025.csv"

LAMEZIA_LON_RANGE = (16.0, 16.6)
LAMEZIA_LAT_RANGE = (38.75, 39.15)
KNOWN_COORDINATE_DECISIONS = {
    "",
    "keep_as_is",
    "flag_coordinate_suspect",
    "exclude_from_geometry",
    "manual_coordinate_override",
    "needs_external_verification",
}
TRAINING_READY_CONFIDENCE = {"high", "medium"}

FINDING_FIELDS = ["severity", "code", "access_id", "task_id", "detail"]


def as_text(value: Any) -> str:
    if value is None:
        return ""
    text = str(value)
    return "" if text.lower() == "nan" else text.strip()


def as_bool(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    return as_text(value).lower() in {"1", "true", "yes", "y"}


def as_float(value: Any) -> float:
    text = as_text(value).replace(",", ".")
    try:
        return float(text)
    except ValueError:
        return math.nan


def jsonish(value: Any) -> Any:
    if isinstance(value, (dict, list)):
        return value
    text = as_text(value)
    if not text or text == "[object Object]":
        return None
    if not text.startswith(("{", "[")):
        return None
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None


def safe_relpath(path: Path | None) -> str:
    if path is None:
        return "none"
    try:
        return relpath(path)
    except ValueError:
        return str(path)


def load_decisions(path: Path | None) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    if path is None:
        return [], {}
    if not path.exists():
        raise RuntimeError(f"Decision file not found: {path}")
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


def selected_access_ids(decision: dict[str, Any]) -> list[str]:
    raw = as_text(decision.get("selected_access_ids"))
    if raw:
        return [part.strip() for part in raw.replace("|", ";").replace(",", ";").split(";") if part.strip()]

    snapshot = jsonish(decision.get("evidence_snapshot"))
    if isinstance(snapshot, dict):
        selected = snapshot.get("selected_civic_coordinate_quality") or {}
        access_id = as_text(selected.get("access_id"))
        if access_id:
            return [access_id]

    relocation = jsonish(decision.get("relocation_support_snapshot"))
    if isinstance(relocation, dict):
        access_id = as_text(relocation.get("access_id"))
        if access_id:
            return [access_id]

    return []


def lon_lat_plausibility(lon: float, lat: float) -> str:
    if math.isnan(lon) or math.isnan(lat):
        return "missing_or_invalid"
    if LAMEZIA_LAT_RANGE[0] <= lon <= LAMEZIA_LAT_RANGE[1] and LAMEZIA_LON_RANGE[0] <= lat <= LAMEZIA_LON_RANGE[1]:
        return "possible_xy_swap"
    if not (LAMEZIA_LON_RANGE[0] <= lon <= LAMEZIA_LON_RANGE[1]):
        return "outside_lamezia_lon_range"
    if not (LAMEZIA_LAT_RANGE[0] <= lat <= LAMEZIA_LAT_RANGE[1]):
        return "outside_lamezia_lat_range"
    return "ok"


def haversine_m(lon_a: float, lat_a: float, lon_b: float, lat_b: float) -> float:
    if any(math.isnan(value) for value in [lon_a, lat_a, lon_b, lat_b]):
        return math.nan
    radius_m = 6_371_000.0
    lon1 = math.radians(lon_a)
    lat1 = math.radians(lat_a)
    lon2 = math.radians(lon_b)
    lat2 = math.radians(lat_b)
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    value = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 2 * radius_m * math.atan2(math.sqrt(value), math.sqrt(1 - value))


def parse_review_date(value: Any) -> bool:
    text = as_text(value)
    if not text:
        return False
    for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%SZ"):
        try:
            datetime.strptime(text, fmt)
            return True
        except ValueError:
            continue
    return False


def candidate_points_by_access(path: Path, lon_field: str, lat_field: str) -> dict[str, list[tuple[float, float]]]:
    points: dict[str, list[tuple[float, float]]] = defaultdict(list)
    for row in read_csv_rows(path):
        access_id = as_text(row.get("access_id"))
        lon = as_float(row.get(lon_field))
        lat = as_float(row.get(lat_field))
        if access_id and not math.isnan(lon) and not math.isnan(lat):
            points[access_id].append((lon, lat))
    return points


def add_finding(findings: list[dict[str, str]], severity: str, code: str, access_id: str, task_id: str, detail: str) -> None:
    findings.append(
        {
            "severity": severity,
            "code": code,
            "access_id": access_id,
            "task_id": task_id,
            "detail": detail,
        }
    )


def audit_decisions(decisions: list[dict[str, Any]]) -> tuple[list[dict[str, str]], dict[str, Any]]:
    civics = read_csv_rows(CIVICS_CSV)
    civics_by_access = {as_text(row.get("PROGRESSIVO_ACCESSO") or row.get("access_id")): row for row in civics}
    suspect_access_ids = {as_text(row.get("access_id")) for row in read_csv_rows(SUSPECT_CSV) if as_text(row.get("access_id"))}
    geocode_candidates = candidate_points_by_access(GEOCODE_CANDIDATES_CSV, "candidate_lon", "candidate_lat")
    local_anchor_candidates = candidate_points_by_access(LOCAL_ANCHOR_CANDIDATES_CSV, "candidate_lon", "candidate_lat")

    findings: list[dict[str, str]] = []
    coordinate_type_counts: Counter[str] = Counter()
    training_ready_overrides = 0
    override_access_counts: Counter[str] = Counter()
    override_distances: list[float] = []
    candidate_matches = 0

    for decision in decisions:
        task_id = as_text(decision.get("task_id") or decision.get("review_id"))
        coordinate_type = as_text(decision.get("coordinate_decision_type"))
        coordinate_type_counts[coordinate_type or "blank"] += 1
        access_ids = selected_access_ids(decision)
        primary_access_id = access_ids[0] if access_ids else ""

        if coordinate_type not in KNOWN_COORDINATE_DECISIONS:
            add_finding(findings, "P2", "unknown-coordinate-decision-type", primary_access_id, task_id, coordinate_type)

        if coordinate_type != "manual_coordinate_override":
            continue

        for access_id in access_ids:
            override_access_counts[access_id] += 1

        if not access_ids:
            add_finding(findings, "P0", "manual-override-without-access-id", "", task_id, "selected_access_ids or selected civic snapshot is required")
            continue
        if len(access_ids) > 1:
            add_finding(
                findings,
                "P1",
                "manual-override-not-civic-specific",
                primary_access_id,
                task_id,
                "coordinate override should target one reviewed access_id",
            )

        civic = civics_by_access.get(primary_access_id)
        if not civic:
            add_finding(findings, "P0", "manual-override-access-id-not-found", primary_access_id, task_id, "access_id is not in processed ANNCSU civics")
            continue

        proposed_lon = as_float(decision.get("proposed_lon"))
        proposed_lat = as_float(decision.get("proposed_lat"))
        plausibility = lon_lat_plausibility(proposed_lon, proposed_lat)
        if plausibility != "ok":
            add_finding(findings, "P0", "manual-override-coordinate-not-plausible", primary_access_id, task_id, plausibility)

        confidence = as_text(decision.get("coordinate_decision_confidence"))
        if confidence not in TRAINING_READY_CONFIDENCE:
            add_finding(
                findings,
                "P1",
                "manual-override-not-training-ready-confidence",
                primary_access_id,
                task_id,
                f"expected high or medium, found {confidence or 'blank'}",
            )

        if as_bool(decision.get("requires_follow_up")) or as_bool(decision.get("requires_external_coordinate_check")):
            add_finding(
                findings,
                "P1",
                "manual-override-still-requires-follow-up",
                primary_access_id,
                task_id,
                "requires_follow_up/requires_external_coordinate_check must be false before training",
            )

        if as_text(decision.get("coordinate_reason")).strip() == "":
            add_finding(findings, "P1", "manual-override-missing-coordinate-reason", primary_access_id, task_id, "coordinate_reason is required")

        if as_text(decision.get("reviewed_by")).strip() == "":
            add_finding(findings, "P1", "manual-override-missing-reviewer", primary_access_id, task_id, "reviewed_by is required")
        if not parse_review_date(decision.get("review_date")):
            add_finding(findings, "P1", "manual-override-missing-review-date", primary_access_id, task_id, "review_date must be YYYY-MM-DD or ISO timestamp")

        evidence_snapshot = jsonish(decision.get("evidence_snapshot"))
        if not isinstance(evidence_snapshot, dict):
            add_finding(
                findings,
                "P1",
                "manual-override-missing-structured-evidence-snapshot",
                primary_access_id,
                task_id,
                "use JSON export from the workbench; CSV exports cannot preserve structured evidence",
            )

        relocation_snapshot = jsonish(decision.get("relocation_support_snapshot"))
        if not isinstance(relocation_snapshot, dict):
            add_finding(findings, "P1", "manual-override-missing-relocation-snapshot", primary_access_id, task_id, "relocation_support_snapshot is required")
        else:
            snapshot_access_id = as_text(relocation_snapshot.get("access_id"))
            if snapshot_access_id and snapshot_access_id != primary_access_id:
                add_finding(findings, "P0", "relocation-snapshot-access-id-mismatch", primary_access_id, task_id, f"snapshot access_id={snapshot_access_id}")
            snapshot_lon = as_float(relocation_snapshot.get("proposed_lon"))
            snapshot_lat = as_float(relocation_snapshot.get("proposed_lat"))
            snapshot_distance = haversine_m(proposed_lon, proposed_lat, snapshot_lon, snapshot_lat)
            if not math.isnan(snapshot_distance) and snapshot_distance > 5:
                add_finding(
                    findings,
                    "P1",
                    "relocation-snapshot-coordinate-mismatch",
                    primary_access_id,
                    task_id,
                    f"decision and snapshot differ by {snapshot_distance:.1f} m",
                )

        source_lon = as_float(civic.get("COORD_X_COMUNE") or civic.get("coord_x") or civic.get("source_lon"))
        source_lat = as_float(civic.get("COORD_Y_COMUNE") or civic.get("coord_y") or civic.get("source_lat"))
        move_m = haversine_m(source_lon, source_lat, proposed_lon, proposed_lat)
        if not math.isnan(move_m):
            override_distances.append(move_m)
            if move_m < 1:
                add_finding(findings, "P2", "manual-override-no-effective-movement", primary_access_id, task_id, f"movement={move_m:.1f} m")
            if move_m > 5_000:
                add_finding(findings, "P2", "manual-override-large-movement", primary_access_id, task_id, f"movement={move_m:.1f} m")

        if primary_access_id not in suspect_access_ids:
            add_finding(findings, "P2", "manual-override-access-id-not-in-suspect-queue", primary_access_id, task_id, "allowed only with explicit reviewer rationale")

        candidate_points = geocode_candidates.get(primary_access_id, []) + local_anchor_candidates.get(primary_access_id, [])
        if any(haversine_m(proposed_lon, proposed_lat, cand_lon, cand_lat) <= 5 for cand_lon, cand_lat in candidate_points):
            candidate_matches += 1

        if confidence in TRAINING_READY_CONFIDENCE and not as_bool(decision.get("requires_follow_up")) and not as_bool(decision.get("requires_external_coordinate_check")):
            training_ready_overrides += 1

    for access_id, count in override_access_counts.items():
        if count > 1:
            add_finding(findings, "P0", "duplicate-manual-coordinate-override", access_id, "", f"{count} manual overrides target this access_id")

    summary = {
        "decision_rows": len(decisions),
        "coordinate_decision_type_counts": dict(sorted(coordinate_type_counts.items())),
        "manual_coordinate_override_rows": coordinate_type_counts.get("manual_coordinate_override", 0),
        "training_ready_manual_overrides": training_ready_overrides,
        "manual_override_candidate_matches_within_5m": candidate_matches,
        "manual_override_distance_min_m": min(override_distances) if override_distances else "",
        "manual_override_distance_max_m": max(override_distances) if override_distances else "",
        "manual_override_distance_avg_m": (sum(override_distances) / len(override_distances)) if override_distances else "",
    }
    return findings, summary


def write_report(decisions_path: Path | None, meta: dict[str, Any], summary: dict[str, Any], findings: list[dict[str, str]]) -> None:
    severity_counts = Counter(row["severity"] for row in findings)
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        "# ANNCSU Coordinate Decisions Audit 2025",
        "",
        f"Date: {date.today().isoformat()}",
        "",
        "## Scope",
        "",
        "This audit checks exported local workbench coordinate decisions before any reviewed coordinate can become an effective replacement or a training-set row.",
        "",
        "Raw ANNCSU coordinates remain immutable. A coordinate replacement is acceptable only as a reviewed `manual_coordinate_override` with a civic `access_id`, plausible lon/lat, reviewer metadata, and structured evidence snapshots.",
        "",
        "## Inputs",
        "",
        f"- Decisions file: `{safe_relpath(decisions_path)}`",
        f"- Processed civics: `{relpath(CIVICS_CSV)}`",
        f"- Coordinate suspects: `{relpath(SUSPECT_CSV)}`",
        f"- External geocoder candidates: `{relpath(GEOCODE_CANDIDATES_CSV)}`",
        f"- Local ANNCSU anchor candidates: `{relpath(LOCAL_ANCHOR_CANDIDATES_CSV)}`",
        "",
        "## Summary",
        "",
    ]
    if meta:
        lines.append("### Export Metadata")
        lines.append("")
        for key, value in meta.items():
            lines.append(f"- {key}: `{value}`")
        lines.append("")

    if summary:
        for key, value in summary.items():
            if isinstance(value, dict):
                lines.append(f"- {key}:")
                for subkey, subvalue in value.items():
                    lines.append(f"  - `{subkey}`: {subvalue}")
            elif isinstance(value, float):
                lines.append(f"- {key}: {value:.1f}")
            else:
                lines.append(f"- {key}: {value}")
    else:
        lines.append("- No decisions file supplied. Run this script with `--decisions <workbench-json-export>` before applying reviewed coordinate overrides.")

    lines.extend(["", "## Findings", ""])
    if findings:
        for severity in ["P0", "P1", "P2"]:
            count = severity_counts.get(severity, 0)
            lines.append(f"- {severity}: {count}")
        lines.append("")
        lines.append("| Severity | Code | Access ID | Task | Detail |")
        lines.append("| --- | --- | --- | --- | --- |")
        for row in findings:
            detail = row["detail"].replace("|", "\\|")
            lines.append(f"| {row['severity']} | `{row['code']}` | `{row['access_id']}` | `{row['task_id']}` | {detail} |")
    else:
        lines.append("- No P0/P1/P2 findings.")

    lines.extend(
        [
            "",
            "## Gate",
            "",
            "- P0/P1 findings mean the decisions file is not ready for `scripts/build_anncsu_coordinate_recovery_layer.py --decisions`.",
            "- P2 findings are non-blocking review notes, but should be checked before future geometry generation.",
            "- Use JSON export from the workbench for coordinate overrides; CSV export is insufficient for structured evidence snapshots.",
        ]
    )
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    write_csv_rows(FINDINGS_CSV, findings, FINDING_FIELDS)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Audit exported workbench coordinate decisions before coordinate recovery.")
    parser.add_argument("--decisions", type=Path, default=None, help="Workbench JSON/CSV decision export to audit.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    missing = [path for path in [CIVICS_CSV, SUSPECT_CSV] if not path.exists()]
    if missing:
        for path in missing:
            print(f"missing_input={path}", file=sys.stderr)
        return 1

    decisions, meta = load_decisions(args.decisions)
    findings, summary = audit_decisions(decisions) if args.decisions else ([], {})
    write_report(args.decisions, meta, summary, findings)

    for row in findings:
        print(f"{row['severity']} {row['code']} {row['access_id']} {row['detail']}")
    print(f"report={REPORT_PATH}")
    print(f"findings_csv={FINDINGS_CSV}")
    print(f"decision_rows={len(decisions)}")
    blocking = [row for row in findings if row["severity"] in {"P0", "P1"}]
    return 1 if blocking else 0


if __name__ == "__main__":
    sys.exit(main())
