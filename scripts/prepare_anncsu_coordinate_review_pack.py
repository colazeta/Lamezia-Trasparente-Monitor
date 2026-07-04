from __future__ import annotations

import csv
import math
import sys
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any

from electoral_geo_utils import QA_DIR, read_csv_rows, relpath, write_csv_rows


SUSPECT_CSV = QA_DIR / "anncsu_coordinate_suspect_points_2025.csv"
DIAGNOSTIC_CSV = QA_DIR / "anncsu_coordinate_corruption_diagnostic_2025.csv"
GEOCODE_CANDIDATES_CSV = QA_DIR / "anncsu_coordinate_geocode_candidates_2025.csv"
LOCAL_ANCHOR_CANDIDATES_CSV = QA_DIR / "anncsu_coordinate_local_anchor_candidates_2025.csv"
REVIEW_QUEUE_CSV = QA_DIR / "anncsu_coordinate_review_priority_queue_2025.csv"

REVIEW_PACK_CSV = QA_DIR / "anncsu_coordinate_review_pack_2025.csv"
REPORT_PATH = QA_DIR / "anncsu_coordinate_review_pack_report_2025.md"

OUTPUT_FIELDS = [
    "review_rank",
    "access_id",
    "street",
    "civico",
    "esponente",
    "coordinate_quality_flag",
    "source_diagnosis",
    "recovery_action",
    "source_lon",
    "source_lat",
    "local_candidate_status",
    "local_candidate_method",
    "local_candidate_confidence",
    "local_candidate_lon",
    "local_candidate_lat",
    "local_distance_from_source_m",
    "local_anchor_count",
    "local_candidate_explanation",
    "geocode_candidate_status",
    "geocode_provider",
    "geocode_provider_confidence",
    "geocode_query_variant",
    "geocode_candidate_has_house_number",
    "geocode_lon",
    "geocode_lat",
    "geocode_distance_from_source_m",
    "geocode_display_name",
    "local_geocode_distance_m",
    "evidence_agreement",
    "recommended_review_track",
    "recommended_candidate_source",
    "review_candidate_lon",
    "review_candidate_lat",
    "decision_readiness",
    "suggested_workbench_filter",
    "reviewer_instruction",
    "notes",
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


def distance_text(value: float) -> str:
    return "" if math.isnan(value) else f"{value:.1f}"


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


def read_rows(path: Path) -> list[dict[str, str]]:
    return [dict(row) for row in read_csv_rows(path)]


def first_by_access(rows: list[dict[str, str]]) -> dict[str, dict[str, str]]:
    out: dict[str, dict[str, str]] = {}
    for row in rows:
        access_id = as_text(row.get("access_id"))
        if access_id and access_id not in out:
            out[access_id] = row
    return out


def local_anchor_rank_key(row: dict[str, str]) -> tuple[int, int, float, int]:
    status = as_text(row.get("candidate_status"))
    status_penalty = 0 if status == "candidate_requires_human_review" else 9
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
        status_penalty,
        confidence_order.get(as_text(row.get("candidate_confidence")), 8),
        distance,
        method_order.get(as_text(row.get("candidate_method")), 8),
    )


def geocode_rank_key(row: dict[str, str]) -> tuple[int, int, int, float, int]:
    status = as_text(row.get("candidate_status"))
    status_penalty = 0 if status == "candidate_requires_human_review" else 9
    confidence_order = {
        "medium": 0,
        "low": 1,
        "low_street_level": 2,
        "very_low": 3,
        "reject_outside_context": 9,
        "": 10,
    }
    house_penalty = 0 if as_bool(row.get("candidate_has_house_number")) else 1
    distance = as_float(row.get("distance_from_source_m"))
    if math.isnan(distance):
        distance = 999_999_999.0
    rank = as_float(row.get("candidate_rank"))
    if math.isnan(rank):
        rank = 9999
    return (
        status_penalty,
        confidence_order.get(as_text(row.get("provider_confidence")), 8),
        house_penalty,
        distance,
        int(rank),
    )


def best_by_access(rows: list[dict[str, str]], *, local: bool) -> dict[str, dict[str, str]]:
    grouped: dict[str, list[dict[str, str]]] = {}
    for row in rows:
        access_id = as_text(row.get("access_id"))
        if access_id:
            grouped.setdefault(access_id, []).append(row)
    rank_key = local_anchor_rank_key if local else geocode_rank_key
    return {access_id: sorted(group, key=rank_key)[0] for access_id, group in grouped.items()}


def source_row_for(access_id: str, queue_by_access: dict[str, dict[str, str]], suspect_by_access: dict[str, dict[str, str]]) -> dict[str, str]:
    row = queue_by_access.get(access_id) or suspect_by_access.get(access_id) or {}
    return row


def evidence_agreement(local: dict[str, str], geocode: dict[str, str], distance_m: float) -> str:
    local_status = as_text(local.get("candidate_status"))
    geocode_status = as_text(geocode.get("candidate_status"))
    if local_status != "candidate_requires_human_review" and geocode_status != "candidate_requires_human_review":
        return "no_review_candidate"
    if local_status == "candidate_requires_human_review" and geocode_status != "candidate_requires_human_review":
        return "local_anchor_only"
    if local_status != "candidate_requires_human_review" and geocode_status == "candidate_requires_human_review":
        return "external_geocoder_only"
    if math.isnan(distance_m):
        return "candidates_present_distance_unknown"
    if distance_m <= 150:
        return "local_and_geocoder_agree_within_150m"
    if distance_m <= 500:
        return "local_and_geocoder_near_within_500m"
    return "local_geocoder_conflict_over_500m"


def recommendation(
    *,
    local: dict[str, str],
    geocode: dict[str, str],
    agreement: str,
) -> tuple[str, str, str, str, str]:
    local_status = as_text(local.get("candidate_status"))
    local_confidence = as_text(local.get("candidate_confidence"))
    geocode_status = as_text(geocode.get("candidate_status"))
    geocode_confidence = as_text(geocode.get("provider_confidence"))
    geocode_house = as_bool(geocode.get("candidate_has_house_number"))

    if agreement in {"local_and_geocoder_agree_within_150m", "local_and_geocoder_near_within_500m"}:
        return (
            "review_local_anchor_with_external_support",
            "local_anncsu_anchor",
            "manual_review_ready",
            "Open the access_id in the workbench and compare street-register evidence, local anchor, and the external geocoder point before exporting a manual override.",
            "External geocoder support is street-level unless candidate_has_house_number=true.",
        )
    if local_status == "candidate_requires_human_review" and local_confidence == "medium":
        return (
            "review_medium_local_anchor",
            "local_anncsu_anchor",
            "manual_review_ready",
            "Open the access_id in the workbench and review the medium-confidence same-street ANNCSU anchor before exporting a manual override.",
            "Do not apply without human confirmation.",
        )
    if geocode_status == "candidate_requires_human_review" and geocode_house and geocode_confidence in {"medium", "low"}:
        return (
            "review_house_level_geocoder",
            "external_geocoder",
            "manual_review_ready",
            "Open the access_id in the workbench and review the house-number geocoder candidate against ANNCSU label and street-register evidence.",
            "Provider result still requires human confirmation.",
        )
    if agreement == "local_geocoder_conflict_over_500m":
        return (
            "resolve_local_geocoder_conflict",
            "",
            "needs_manual_map_check",
            "Do not preselect a coordinate. Compare local anchor, external geocoder street-level point, and map context in the workbench.",
            "Conflicting candidates should not become training rows until resolved.",
        )
    if local_status == "candidate_requires_human_review":
        return (
            "review_low_local_anchor",
            "local_anncsu_anchor",
            "needs_manual_map_check",
            "Use the local anchor as a weak candidate and check map context before any manual override.",
            "Low-confidence local anchor.",
        )
    if geocode_status == "candidate_requires_human_review":
        return (
            "review_street_level_geocoder",
            "external_geocoder",
            "needs_manual_map_check",
            "Use the geocoder result as street-level context only; pick a civic point manually if evidence supports it.",
            "External geocoder did not return a house-number candidate.",
        )
    return (
        "needs_dedicated_provider_or_manual_lookup",
        "",
        "not_ready",
        "No candidate coordinate is ready for review. Use a dedicated geocoder, municipal source, or manual lookup.",
        "No candidate returned.",
    )


def candidate_lon_lat(source: str, local: dict[str, str], geocode: dict[str, str]) -> tuple[str, str]:
    if source == "local_anncsu_anchor":
        return decimal_text(local.get("candidate_lon")), decimal_text(local.get("candidate_lat"))
    if source == "external_geocoder":
        return decimal_text(geocode.get("candidate_lon")), decimal_text(geocode.get("candidate_lat"))
    return "", ""


def markdown_table(headers: list[str], rows: list[list[str]]) -> list[str]:
    lines = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join("---" for _ in headers) + " |",
    ]
    for row in rows:
        lines.append("| " + " | ".join(value.replace("|", "\\|") for value in row) + " |")
    return lines


def write_report(rows: list[dict[str, str]]) -> None:
    status_counts = Counter(row["decision_readiness"] for row in rows)
    track_counts = Counter(row["recommended_review_track"] for row in rows)
    agreement_counts = Counter(row["evidence_agreement"] for row in rows)
    source_counts = Counter(row["recommended_candidate_source"] or "none" for row in rows)
    ready_rows = [row for row in rows if row["decision_readiness"] == "manual_review_ready"]
    lines = [
        "# ANNCSU Coordinate Review Pack 2025",
        "",
        f"Date: {date.today().isoformat()}",
        "",
        "## Result",
        "",
        f"- Review pack rows: {len(rows)}",
        f"- Manual-review-ready rows: {len(ready_rows)}",
        f"- Review pack CSV: `{relpath(REVIEW_PACK_CSV)}`",
        "",
        "This review pack does not overwrite ANNCSU raw coordinates, processed civic assignments, GPKG files, polygons, or public UI. It only joins existing diagnostics, local ANNCSU anchors, and external geocoder candidates into one review table.",
        "",
        "## Decision Readiness",
        "",
    ]
    for key, value in sorted(status_counts.items()):
        lines.append(f"- `{key}`: {value}")
    lines.extend(["", "## Recommended Candidate Source", ""])
    for key, value in sorted(source_counts.items()):
        lines.append(f"- `{key}`: {value}")
    lines.extend(["", "## Evidence Agreement", ""])
    for key, value in sorted(agreement_counts.items()):
        lines.append(f"- `{key}`: {value}")
    lines.extend(["", "## Recommended Review Tracks", ""])
    for key, value in sorted(track_counts.items()):
        lines.append(f"- `{key}`: {value}")

    sample = ready_rows[:10]
    lines.extend(["", "## First Manual-Review-Ready Rows", ""])
    if sample:
        lines.extend(
            markdown_table(
                ["rank", "access_id", "street", "civic", "source", "track", "candidate_lon", "candidate_lat"],
                [
                    [
                        row["review_rank"],
                        row["access_id"],
                        row["street"],
                        row["civico"],
                        row["recommended_candidate_source"],
                        row["recommended_review_track"],
                        row["review_candidate_lon"],
                        row["review_candidate_lat"],
                    ]
                    for row in sample
                ],
            )
        )
    else:
        lines.append("- No manual-review-ready rows.")

    lines.extend(
        [
            "",
            "## How To Use",
            "",
            "1. Open `tools/electoral-review-workbench` and filter by `access_id` from the review pack.",
            "2. Compare the local anchor, external geocoder candidate, ANNCSU label, and street-register evidence.",
            "3. Export a JSON `manual_coordinate_override` only when the reviewer accepts a point.",
            "4. Run `scripts/audit_anncsu_coordinate_decisions.py --decisions <exported-json>`.",
            "5. Run `scripts/build_anncsu_coordinate_recovery_layer.py --decisions <exported-json>` only after P0/P1 findings are resolved.",
            "",
            "## Guardrails",
            "",
            "- Do not train from this CSV directly.",
            "- Do not apply `low_street_level` geocoder rows as exact civic coordinates.",
            "- Use accepted manual overrides, not unreviewed candidates, as retraining rows.",
        ]
    )
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    missing = [
        path
        for path in [SUSPECT_CSV, DIAGNOSTIC_CSV, LOCAL_ANCHOR_CANDIDATES_CSV, GEOCODE_CANDIDATES_CSV]
        if not path.exists()
    ]
    if missing:
        for path in missing:
            print(f"missing_input={path}", file=sys.stderr)
        return 1

    suspects = read_rows(SUSPECT_CSV)
    diagnostics = read_rows(DIAGNOSTIC_CSV)
    queue = read_rows(REVIEW_QUEUE_CSV)
    local_candidates = read_rows(LOCAL_ANCHOR_CANDIDATES_CSV)
    geocode_candidates = read_rows(GEOCODE_CANDIDATES_CSV)

    suspect_by_access = first_by_access(suspects)
    diagnostic_by_access = first_by_access(diagnostics)
    queue_by_access = first_by_access(queue)
    best_local_by_access = best_by_access(local_candidates, local=True)
    best_geocode_by_access = best_by_access(geocode_candidates, local=False)

    access_ids = sorted(
        set(suspect_by_access)
        | set(queue_by_access)
        | set(best_local_by_access)
        | set(best_geocode_by_access),
        key=lambda value: (
            int(as_float((queue_by_access.get(value) or {}).get("review_rank")) or 999_999),
            value,
        ),
    )

    rows: list[dict[str, str]] = []
    for index, access_id in enumerate(access_ids, start=1):
        source = source_row_for(access_id, queue_by_access, suspect_by_access)
        diagnostic = diagnostic_by_access.get(access_id, {})
        local = best_local_by_access.get(access_id, {})
        geocode = best_geocode_by_access.get(access_id, {})

        local_lon = as_float(local.get("candidate_lon"))
        local_lat = as_float(local.get("candidate_lat"))
        geocode_lon = as_float(geocode.get("candidate_lon"))
        geocode_lat = as_float(geocode.get("candidate_lat"))
        local_geocode_distance = haversine_m(local_lon, local_lat, geocode_lon, geocode_lat)
        agreement = evidence_agreement(local, geocode, local_geocode_distance)
        track, recommended_source, readiness, instruction, notes = recommendation(
            local=local,
            geocode=geocode,
            agreement=agreement,
        )
        review_lon, review_lat = candidate_lon_lat(recommended_source, local, geocode)

        rows.append(
            {
                "review_rank": as_text(source.get("review_rank")) or str(index),
                "access_id": access_id,
                "street": as_text(source.get("street") or source.get("odonimo_raw") or local.get("street")),
                "civico": as_text(source.get("civico") or local.get("civico")),
                "esponente": as_text(source.get("esponente") or local.get("esponente")),
                "coordinate_quality_flag": as_text(source.get("coordinate_quality_flag") or local.get("coordinate_quality_flag")),
                "source_diagnosis": as_text(diagnostic.get("source_diagnosis")),
                "recovery_action": as_text(diagnostic.get("recovery_action") or source.get("recommended_review_action")),
                "source_lon": decimal_text(source.get("source_lon") or local.get("source_lon") or diagnostic.get("processed_coord_x")),
                "source_lat": decimal_text(source.get("source_lat") or local.get("source_lat") or diagnostic.get("processed_coord_y")),
                "local_candidate_status": as_text(local.get("candidate_status")),
                "local_candidate_method": as_text(local.get("candidate_method")),
                "local_candidate_confidence": as_text(local.get("candidate_confidence")),
                "local_candidate_lon": decimal_text(local.get("candidate_lon")),
                "local_candidate_lat": decimal_text(local.get("candidate_lat")),
                "local_distance_from_source_m": as_text(local.get("distance_from_source_m")),
                "local_anchor_count": as_text(local.get("anchor_count")),
                "local_candidate_explanation": as_text(local.get("candidate_explanation")),
                "geocode_candidate_status": as_text(geocode.get("candidate_status")),
                "geocode_provider": as_text(geocode.get("provider")),
                "geocode_provider_confidence": as_text(geocode.get("provider_confidence")),
                "geocode_query_variant": as_text(geocode.get("query_variant")),
                "geocode_candidate_has_house_number": as_text(geocode.get("candidate_has_house_number")),
                "geocode_lon": decimal_text(geocode.get("candidate_lon")),
                "geocode_lat": decimal_text(geocode.get("candidate_lat")),
                "geocode_distance_from_source_m": as_text(geocode.get("distance_from_source_m")),
                "geocode_display_name": as_text(geocode.get("candidate_display_name")),
                "local_geocode_distance_m": distance_text(local_geocode_distance),
                "evidence_agreement": agreement,
                "recommended_review_track": track,
                "recommended_candidate_source": recommended_source,
                "review_candidate_lon": review_lon,
                "review_candidate_lat": review_lat,
                "decision_readiness": readiness,
                "suggested_workbench_filter": f"access_id:{access_id}",
                "reviewer_instruction": instruction,
                "notes": notes,
            }
        )

    write_csv_rows(REVIEW_PACK_CSV, rows, OUTPUT_FIELDS)
    write_report(rows)

    status_counts = Counter(row["decision_readiness"] for row in rows)
    print(f"review_pack_csv={REVIEW_PACK_CSV}")
    print(f"review_pack_report={REPORT_PATH}")
    print(f"review_pack_rows={len(rows)}")
    for key, value in sorted(status_counts.items()):
        print(f"{key}={value}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
