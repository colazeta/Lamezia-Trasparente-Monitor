from __future__ import annotations

import argparse
import csv
import json
import math
import sys
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any

from electoral_geo_utils import INTERIM_GEO_DIR, QA_DIR, ROOT, relpath


CIVICS_V2_CSV = ROOT / "data" / "processed" / "geo" / "anncsu_lamezia_civics_with_electoral_section_2025_v2.csv"
SUSPECT_CSV = QA_DIR / "anncsu_coordinate_suspect_points_2025.csv"
DIAGNOSTIC_CSV = QA_DIR / "anncsu_coordinate_corruption_diagnostic_2025.csv"
GEOCODE_CANDIDATES_CSV = QA_DIR / "anncsu_coordinate_geocode_candidates_2025.csv"
LOCAL_ANCHOR_CANDIDATES_CSV = QA_DIR / "anncsu_coordinate_local_anchor_candidates_2025.csv"

RECOVERY_LAYER_CSV = INTERIM_GEO_DIR / "anncsu_lamezia_coordinate_recovery_candidates_2025.csv"
TRAINING_SET_CSV = QA_DIR / "anncsu_coordinate_recovery_training_set_2025.csv"
REPORT_PATH = QA_DIR / "anncsu_coordinate_recovery_layer_report_2025.md"

OUTPUT_FIELDS = [
    "access_id",
    "odonimo_raw",
    "civico",
    "esponente",
    "section_number",
    "source_lon",
    "source_lat",
    "effective_lon",
    "effective_lat",
    "effective_coordinate_source",
    "coordinate_recovery_status",
    "coordinate_quality_flag",
    "coordinate_suspect_reason",
    "source_diagnosis",
    "recovery_action",
    "best_geocode_provider",
    "best_geocode_query",
    "best_geocode_query_variant",
    "best_geocode_lon",
    "best_geocode_lat",
    "best_geocode_confidence",
    "best_geocode_status",
    "best_geocode_has_house_number",
    "best_geocode_distance_from_source_m",
    "best_local_anchor_method",
    "best_local_anchor_lon",
    "best_local_anchor_lat",
    "best_local_anchor_confidence",
    "best_local_anchor_status",
    "best_local_anchor_distance_from_source_m",
    "best_local_anchor_count",
    "best_local_anchor_explanation",
    "manual_decision_id",
    "manual_decision_type",
    "manual_decision_confidence",
    "manual_decision_reason",
    "manual_reviewed_by",
    "manual_review_date",
    "requires_external_coordinate_check",
    "exclude_from_geometry",
    "training_label",
    "training_notes",
]

TRAINING_FIELDS = [
    "access_id",
    "odonimo_raw",
    "civico",
    "esponente",
    "source_lon",
    "source_lat",
    "accepted_lon",
    "accepted_lat",
    "coordinate_decision_confidence",
    "coordinate_reason",
    "reviewed_by",
    "review_date",
    "decision_id",
    "task_id",
    "evidence_snapshot",
    "relocation_support_snapshot",
    "training_label",
]


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


def decimal_text(value: Any) -> str:
    parsed = as_float(value)
    if math.isnan(parsed):
        return ""
    return f"{parsed:.7f}".rstrip("0").rstrip(".")


def read_csv_rows(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        sample = handle.read(20_000)
        handle.seek(0)
        try:
            delimiter = csv.Sniffer().sniff(sample, delimiters=";\t|,").delimiter
        except csv.Error:
            delimiter = ","
        return list(csv.DictReader(handle, delimiter=delimiter))


def write_csv_rows(path: Path, rows: list[dict[str, Any]], headers: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=headers, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow({header: row.get(header, "") for header in headers})


def load_decisions(path: Path | None) -> list[dict[str, Any]]:
    if path is None:
        return []
    if not path.exists():
        raise RuntimeError(f"Decision file not found: {path}")
    text = path.read_text(encoding="utf-8-sig")
    if path.suffix.lower() == ".json":
        payload = json.loads(text)
        if isinstance(payload, dict):
            rows = payload.get("decisions", [])
        else:
            rows = payload
        if not isinstance(rows, list):
            raise RuntimeError(f"Decision JSON does not contain a decisions list: {path}")
        return [row for row in rows if isinstance(row, dict)]
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def selected_access_ids(decision: dict[str, Any]) -> list[str]:
    raw = as_text(decision.get("selected_access_ids"))
    if raw:
        return [part.strip() for part in raw.replace("|", ";").replace(",", ";").split(";") if part.strip()]
    snapshot = decision.get("evidence_snapshot")
    if isinstance(snapshot, str) and snapshot.strip().startswith("{"):
        try:
            snapshot = json.loads(snapshot)
        except json.JSONDecodeError:
            snapshot = None
    if isinstance(snapshot, dict):
        selected = snapshot.get("selected_civic_coordinate_quality") or {}
        access_id = as_text(selected.get("access_id"))
        if access_id:
            return [access_id]
    return []


def accepted_coordinate_decisions(decisions: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    accepted: dict[str, dict[str, Any]] = {}
    conflicts: Counter[str] = Counter()
    for decision in decisions:
        if as_text(decision.get("coordinate_decision_type")) != "manual_coordinate_override":
            continue
        lon = decimal_text(decision.get("proposed_lon"))
        lat = decimal_text(decision.get("proposed_lat"))
        if not lon or not lat:
            continue
        access_ids = selected_access_ids(decision)
        for access_id in access_ids:
            if access_id in accepted:
                conflicts[access_id] += 1
                continue
            accepted[access_id] = decision
    for access_id in conflicts:
        accepted.pop(access_id, None)
    return accepted


def geocode_rank_key(row: dict[str, str]) -> tuple[int, float, int]:
    confidence_order = {
        "medium": 0,
        "low": 1,
        "low_street_level": 2,
        "very_low": 3,
        "reject_outside_context": 9,
        "": 10,
    }
    status = as_text(row.get("candidate_status"))
    status_penalty = 0 if status == "candidate_requires_human_review" else 5
    confidence_penalty = confidence_order.get(as_text(row.get("provider_confidence")), 8)
    distance = as_float(row.get("distance_from_source_m"))
    if math.isnan(distance):
        distance = 999_999_999.0
    house_penalty = 0 if as_bool(row.get("candidate_has_house_number")) else 1
    return (status_penalty + confidence_penalty + house_penalty, distance, int(as_float(row.get("candidate_rank")) or 9999))


def best_geocode_by_access(rows: list[dict[str, str]]) -> dict[str, dict[str, str]]:
    grouped: dict[str, list[dict[str, str]]] = {}
    for row in rows:
        access_id = as_text(row.get("access_id"))
        if not access_id:
            continue
        grouped.setdefault(access_id, []).append(row)
    out: dict[str, dict[str, str]] = {}
    for access_id, candidates in grouped.items():
        usable = [row for row in candidates if as_text(row.get("candidate_lon")) and as_text(row.get("candidate_lat"))]
        if usable:
            out[access_id] = sorted(usable, key=geocode_rank_key)[0]
        elif candidates:
            out[access_id] = candidates[0]
    return out


def local_anchor_rank_key(row: dict[str, str]) -> tuple[int, float, int]:
    confidence_order = {"medium": 0, "low": 1, "": 9}
    method_order = {
        "same_street_same_civic_number_anchor": 0,
        "same_street_civic_number_interpolation": 1,
        "nearest_same_street_numeric_anchor": 2,
        "same_street_anchor_median": 3,
        "no_local_anchor_candidate": 9,
    }
    distance = as_float(row.get("distance_from_source_m"))
    if math.isnan(distance):
        distance = 999_999_999.0
    return (
        0 if as_text(row.get("candidate_status")) == "candidate_requires_human_review" else 9,
        confidence_order.get(as_text(row.get("candidate_confidence")), 8),
        method_order.get(as_text(row.get("candidate_method")), 8),
        distance,
    )


def best_local_anchor_by_access(rows: list[dict[str, str]]) -> dict[str, dict[str, str]]:
    grouped: dict[str, list[dict[str, str]]] = {}
    for row in rows:
        access_id = as_text(row.get("access_id"))
        if not access_id:
            continue
        grouped.setdefault(access_id, []).append(row)
    out: dict[str, dict[str, str]] = {}
    for access_id, candidates in grouped.items():
        out[access_id] = sorted(candidates, key=local_anchor_rank_key)[0]
    return out


def coord_source_status(
    *,
    source_flag: str,
    decision: dict[str, Any] | None,
    geocode: dict[str, str] | None,
    local_anchor: dict[str, str] | None,
    diagnostic: dict[str, str] | None,
) -> tuple[str, str, str, str]:
    if decision is not None:
        return (
            decimal_text(decision.get("proposed_lon")),
            decimal_text(decision.get("proposed_lat")),
            "manual_coordinate_override",
            "accepted_reviewed_override",
        )
    geocode_status = as_text((geocode or {}).get("candidate_status"))
    geocode_confidence = as_text((geocode or {}).get("provider_confidence"))
    geocode_house = as_bool((geocode or {}).get("candidate_has_house_number"))
    if geocode_status == "candidate_requires_human_review" and geocode_house and geocode_confidence in {"medium", "low"}:
        return ("", "", "anncsu_source_coordinate", "candidate_requires_human_review")
    local_status = as_text((local_anchor or {}).get("candidate_status"))
    local_confidence = as_text((local_anchor or {}).get("candidate_confidence"))
    if local_status == "candidate_requires_human_review" and local_confidence in {"medium", "low"}:
        return ("", "", "anncsu_source_coordinate", "candidate_requires_human_review")
    if source_flag and source_flag != "ok":
        diagnosis = as_text((diagnostic or {}).get("source_diagnosis"))
        if diagnosis in {"pipeline_extract_coordinate_mismatch", "processed_coordinate_mismatch"}:
            return ("", "", "pipeline_repair_required", "pipeline_repair_required")
        return ("", "", "anncsu_source_coordinate", "suspect_requires_review")
    return ("", "", "anncsu_source_coordinate", "source_coordinate_unchanged")


def source_lon(row: dict[str, str]) -> str:
    return decimal_text(row.get("COORD_X_COMUNE") or row.get("coord_x") or row.get("source_lon"))


def source_lat(row: dict[str, str]) -> str:
    return decimal_text(row.get("COORD_Y_COMUNE") or row.get("coord_y") or row.get("source_lat"))


def write_report(
    *,
    recovery_rows: list[dict[str, Any]],
    training_rows: list[dict[str, Any]],
    decisions_path: Path | None,
    source_counts: Counter[str],
    status_counts: Counter[str],
    geocode_counts: Counter[str],
    local_anchor_counts: Counter[str],
) -> None:
    lines = [
        "# ANNCSU Coordinate Recovery Layer 2025",
        "",
        f"Date: {date.today().isoformat()}",
        "",
        "## Result",
        "",
        f"- Recovery rows: {len(recovery_rows)}",
        f"- Training rows accepted from manual overrides: {len(training_rows)}",
        f"- Decisions input: `{relpath(decisions_path)}`" if decisions_path else "- Decisions input: none",
        f"- Recovery CSV: `{relpath(RECOVERY_LAYER_CSV)}`",
        f"- Training-set CSV: `{relpath(TRAINING_SET_CSV)}`",
        "",
        "This layer does not overwrite ANNCSU raw coordinates. `source_lon/source_lat` remain the original source values; `effective_lon/effective_lat` are populated only for accepted reviewed overrides.",
        "",
        "## Effective Coordinate Source Counts",
        "",
    ]
    for key, value in sorted(source_counts.items()):
        lines.append(f"- `{key}`: {value}")
    lines.extend(["", "## Recovery Status Counts", ""])
    for key, value in sorted(status_counts.items()):
        lines.append(f"- `{key}`: {value}")
    lines.extend(["", "## Geocoder Candidate Counts", ""])
    if geocode_counts:
        for key, value in sorted(geocode_counts.items()):
            lines.append(f"- `{key}`: {value}")
    else:
        lines.append("- No external geocoder candidates available.")
    lines.extend(["", "## Local ANNCSU Anchor Candidate Counts", ""])
    if local_anchor_counts:
        for key, value in sorted(local_anchor_counts.items()):
            lines.append(f"- `{key}`: {value}")
    else:
        lines.append("- No local ANNCSU anchor candidates available.")
    lines.extend(
        [
            "",
            "## How To Use",
            "",
            "1. Run `scripts/diagnose_anncsu_coordinate_corruption.py`, `scripts/geocode_anncsu_coordinate_candidates.py`, and `scripts/generate_anncsu_local_anchor_coordinate_candidates.py`.",
            "2. Review candidate or manually picked coordinates in the local workbench.",
            "3. Export decisions from the workbench as JSON or CSV.",
            "4. Run `scripts/audit_anncsu_coordinate_decisions.py --decisions <exported file>` and resolve any P0/P1 findings.",
            "5. Re-run this script with `--decisions <exported file>`.",
            "6. Use only `accepted_reviewed_override` rows as a correction/training set for future coordinate-quality passes.",
            "",
            "## Guardrails",
            "",
            "- Do not use `candidate_requires_human_review` as an applied correction.",
            "- Do not train from unreviewed provider results.",
            "- Do not change processed electoral result values.",
            "- Do not generate V4 geometry until reviewed overrides pass a separate audit.",
        ]
    )
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build a traced ANNCSU coordinate recovery layer and training set.")
    parser.add_argument("--decisions", type=Path, default=None, help="Optional exported workbench decisions JSON/CSV.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    missing = [path for path in [CIVICS_V2_CSV, SUSPECT_CSV] if not path.exists()]
    if missing:
        for path in missing:
            print(f"missing_input={path}", file=sys.stderr)
        return 1

    civics = read_csv_rows(CIVICS_V2_CSV)
    suspects_by_access = {as_text(row.get("access_id")): row for row in read_csv_rows(SUSPECT_CSV)}
    diagnostics_by_access = {as_text(row.get("access_id")): row for row in read_csv_rows(DIAGNOSTIC_CSV)}
    geocode_by_access = best_geocode_by_access(read_csv_rows(GEOCODE_CANDIDATES_CSV))
    local_anchor_by_access = best_local_anchor_by_access(read_csv_rows(LOCAL_ANCHOR_CANDIDATES_CSV))
    decisions = load_decisions(args.decisions)
    accepted_decisions = accepted_coordinate_decisions(decisions)

    recovery_rows: list[dict[str, Any]] = []
    training_rows: list[dict[str, Any]] = []
    for civic in civics:
        access_id = as_text(civic.get("PROGRESSIVO_ACCESSO") or civic.get("access_id"))
        suspect = suspects_by_access.get(access_id, {})
        diagnostic = diagnostics_by_access.get(access_id, {})
        geocode = geocode_by_access.get(access_id, {})
        local_anchor = local_anchor_by_access.get(access_id, {})
        decision = accepted_decisions.get(access_id)
        flag = as_text(suspect.get("coordinate_quality_flag")) or "ok"
        effective_lon, effective_lat, effective_source, recovery_status = coord_source_status(
            source_flag=flag,
            decision=decision,
            geocode=geocode,
            local_anchor=local_anchor,
            diagnostic=diagnostic,
        )
        original_lon = source_lon(civic)
        original_lat = source_lat(civic)
        if not effective_lon:
            effective_lon = original_lon
        if not effective_lat:
            effective_lat = original_lat
        training_label = ""
        if decision is not None:
            training_label = "accepted_manual_coordinate_override"
            training_rows.append(
                {
                    "access_id": access_id,
                    "odonimo_raw": as_text(civic.get("ODONIMO")),
                    "civico": as_text(civic.get("CIVICO")),
                    "esponente": as_text(civic.get("ESPONENTE")),
                    "source_lon": original_lon,
                    "source_lat": original_lat,
                    "accepted_lon": decimal_text(decision.get("proposed_lon")),
                    "accepted_lat": decimal_text(decision.get("proposed_lat")),
                    "coordinate_decision_confidence": as_text(decision.get("coordinate_decision_confidence")),
                    "coordinate_reason": as_text(decision.get("coordinate_reason")),
                    "reviewed_by": as_text(decision.get("reviewed_by")),
                    "review_date": as_text(decision.get("review_date")),
                    "decision_id": as_text(decision.get("decision_id")),
                    "task_id": as_text(decision.get("task_id")),
                    "evidence_snapshot": decision.get("evidence_snapshot", ""),
                    "relocation_support_snapshot": decision.get("relocation_support_snapshot", ""),
                    "training_label": training_label,
                }
            )

        recovery_rows.append(
            {
                "access_id": access_id,
                "odonimo_raw": as_text(civic.get("ODONIMO")),
                "civico": as_text(civic.get("CIVICO")),
                "esponente": as_text(civic.get("ESPONENTE")),
                "section_number": as_text(civic.get("section_number")),
                "source_lon": original_lon,
                "source_lat": original_lat,
                "effective_lon": effective_lon,
                "effective_lat": effective_lat,
                "effective_coordinate_source": effective_source,
                "coordinate_recovery_status": recovery_status,
                "coordinate_quality_flag": flag,
                "coordinate_suspect_reason": as_text(suspect.get("coordinate_suspect_reason")),
                "source_diagnosis": as_text(diagnostic.get("source_diagnosis")),
                "recovery_action": as_text(diagnostic.get("recovery_action") or suspect.get("suggested_action")),
                "best_geocode_provider": as_text(geocode.get("provider")),
                "best_geocode_query": as_text(geocode.get("query")),
                "best_geocode_query_variant": as_text(geocode.get("query_variant")),
                "best_geocode_lon": decimal_text(geocode.get("candidate_lon")),
                "best_geocode_lat": decimal_text(geocode.get("candidate_lat")),
                "best_geocode_confidence": as_text(geocode.get("provider_confidence")),
                "best_geocode_status": as_text(geocode.get("candidate_status")),
                "best_geocode_has_house_number": as_text(geocode.get("candidate_has_house_number")),
                "best_geocode_distance_from_source_m": as_text(geocode.get("distance_from_source_m")),
                "best_local_anchor_method": as_text(local_anchor.get("candidate_method")),
                "best_local_anchor_lon": decimal_text(local_anchor.get("candidate_lon")),
                "best_local_anchor_lat": decimal_text(local_anchor.get("candidate_lat")),
                "best_local_anchor_confidence": as_text(local_anchor.get("candidate_confidence")),
                "best_local_anchor_status": as_text(local_anchor.get("candidate_status")),
                "best_local_anchor_distance_from_source_m": as_text(local_anchor.get("distance_from_source_m")),
                "best_local_anchor_count": as_text(local_anchor.get("anchor_count")),
                "best_local_anchor_explanation": as_text(local_anchor.get("candidate_explanation")),
                "manual_decision_id": as_text((decision or {}).get("decision_id")),
                "manual_decision_type": as_text((decision or {}).get("coordinate_decision_type")),
                "manual_decision_confidence": as_text((decision or {}).get("coordinate_decision_confidence")),
                "manual_decision_reason": as_text((decision or {}).get("coordinate_reason")),
                "manual_reviewed_by": as_text((decision or {}).get("reviewed_by")),
                "manual_review_date": as_text((decision or {}).get("review_date")),
                "requires_external_coordinate_check": as_text((decision or {}).get("requires_external_coordinate_check")),
                "exclude_from_geometry": as_text((decision or {}).get("exclude_from_geometry")),
                "training_label": training_label,
                "training_notes": "Use as training data only after accepted manual review." if training_label else "",
            }
        )

    write_csv_rows(RECOVERY_LAYER_CSV, recovery_rows, OUTPUT_FIELDS)
    write_csv_rows(TRAINING_SET_CSV, training_rows, TRAINING_FIELDS)
    source_counts = Counter(row["effective_coordinate_source"] for row in recovery_rows)
    status_counts = Counter(row["coordinate_recovery_status"] for row in recovery_rows)
    geocode_counts = Counter(as_text(row.get("best_geocode_status")) for row in recovery_rows if as_text(row.get("best_geocode_status")))
    local_anchor_counts = Counter(
        as_text(row.get("best_local_anchor_status")) for row in recovery_rows if as_text(row.get("best_local_anchor_status"))
    )
    write_report(
        recovery_rows=recovery_rows,
        training_rows=training_rows,
        decisions_path=args.decisions,
        source_counts=source_counts,
        status_counts=status_counts,
        geocode_counts=geocode_counts,
        local_anchor_counts=local_anchor_counts,
    )

    print(f"recovery_layer_csv={RECOVERY_LAYER_CSV}")
    print(f"training_set_csv={TRAINING_SET_CSV}")
    print(f"recovery_report={REPORT_PATH}")
    print(f"recovery_rows={len(recovery_rows)}")
    print(f"training_rows={len(training_rows)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
