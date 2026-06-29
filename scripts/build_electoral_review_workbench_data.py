from __future__ import annotations

import json
import math
import re
import shutil
import subprocess
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from electoral_geo_utils import (
    INTERIM_GEO_DIR,
    PROCESSED_GEO_DIR,
    QA_DIR,
    ROOT,
    civics_to_geodataframe,
    read_csv_rows,
    read_review_by_access_id,
    relpath,
    require_geospatial_dependencies,
)


OUT_DIR = ROOT / "tools" / "electoral-review-workbench" / "public" / "data"
SOURCE_DIR = ROOT / "tools" / "electoral-review-workbench" / "public" / "source"

CELLS_GPKG = INTERIM_GEO_DIR / "electoral_section_census_cells_assignment_2025.gpkg"
CELLS_LAYER = "electoral_section_census_cells_assignment_2025"
V3_GPKG = PROCESSED_GEO_DIR / "electoral_sections_candidate_2025_v3_census_aggregated.gpkg"
V3_LAYER = "electoral_sections_candidate_2025_v3_census_aggregated"
QGIS_GPKG = QA_DIR / "electoral_sections_qgis_review_layers_2025_v3.gpkg"
V2_LAYER = "candidate_sections_v2_voronoi"
V1_LAYER = "candidate_sections_v1_voronoi"

CIVICS_V2_CSV = PROCESSED_GEO_DIR / "anncsu_lamezia_civics_with_electoral_section_2025_v2.csv"
REVIEW_QUEUE_CSV = QA_DIR / "anncsu_electoral_assignment_review_queue_2025.csv"
STREET_RULES_CSV = INTERIM_GEO_DIR / "electoral_street_rules_2025.csv"
CROSSWALK_CSV = INTERIM_GEO_DIR / "anncsu_electoral_street_crosswalk_2025.csv"
V3_METRICS_CSV = QA_DIR / "electoral_sections_candidate_v3_census_metrics_2025.csv"
BOUNDARY_UNCERTAINTY_CSV = QA_DIR / "electoral_sections_boundary_uncertainty_points_2025.csv"
COORDINATE_SUSPECT_CSV = QA_DIR / "anncsu_coordinate_suspect_points_2025.csv"
COORDINATE_GEOCODE_CANDIDATES_CSV = QA_DIR / "anncsu_coordinate_geocode_candidates_2025.csv"
COORDINATE_LOCAL_ANCHOR_CANDIDATES_CSV = QA_DIR / "anncsu_coordinate_local_anchor_candidates_2025.csv"
RAW_STREET_REGISTER_PDF = ROOT / "data" / "raw" / "geo" / "Stradario_elettorale.pdf"

MAX_DETERMINISTIC_SAMPLE = 3000
MAX_RULES_PER_CASE = 80
MAX_RULES_PER_TASK = 60
MAX_CIVICS_PER_TASK_PAYLOAD = 160
MAX_NEARBY_DETERMINISTIC_PER_TASK = 4
MAX_STREETS_PER_TASK = 8


def as_text(value: Any) -> str:
    if value is None:
        return ""
    text = str(value)
    return "" if text.lower() == "nan" else text


def as_int(value: Any, default: int = 0) -> int:
    try:
        if value is None or as_text(value) == "":
            return default
        return int(float(str(value).replace(",", ".")))
    except (TypeError, ValueError):
        return default


def as_float(value: Any, default: float = 0.0) -> float:
    try:
        if value is None or as_text(value) == "":
            return default
        return float(str(value).replace(",", "."))
    except (TypeError, ValueError):
        return default


def decimal_text(value: Any) -> str:
    text = as_text(value).strip()
    if not text:
        return ""
    parsed = as_float(text, math.nan)
    return "" if math.isnan(parsed) else f"{parsed:.7f}".rstrip("0").rstrip(".")


def as_bool(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    return as_text(value).lower() in {"true", "1", "yes"}


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")


def git_commit() -> str:
    for ref in ["origin/main", "HEAD"]:
        try:
            return subprocess.check_output(["git", "rev-parse", ref], cwd=ROOT, text=True).strip()
        except Exception:
            continue
    return "unknown"


def parse_competing_sections(value: Any) -> list[str]:
    sections: list[str] = []
    for part in as_text(value).replace(",", ";").split(";"):
        part = part.strip()
        if not part:
            continue
        section = part.split(":", 1)[0].strip()
        if section and section not in sections:
            sections.append(section)
    return sections


def section_sort_key(value: Any) -> tuple[int, str]:
    text = as_text(value)
    return (as_int(text, 9999), text)


def parse_section_counts(value: Any) -> dict[str, int]:
    counts: dict[str, int] = {}
    for part in as_text(value).replace(",", ";").split(";"):
        part = part.strip()
        if not part:
            continue
        if ":" in part:
            section, count = part.split(":", 1)
            counts[section.strip()] = counts.get(section.strip(), 0) + as_int(count, 0)
        else:
            counts[part] = counts.get(part, 0) + 1
    return {section: count for section, count in counts.items() if section}


def unique_texts(values: list[Any], limit: int | None = None) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for value in values:
        text = as_text(value).strip()
        if not text or text in seen:
            continue
        seen.add(text)
        out.append(text)
        if limit and len(out) >= limit:
            break
    return out


def street_value(row: dict[str, Any]) -> str:
    return as_text(row.get("street_name_normalised") or row.get("ODONIMO") or row.get("anncsu_odonimo") or row.get("odonimo_raw"))


def civic_number_value(row: dict[str, Any]) -> str:
    return as_text(row.get("CIVICO") or row.get("civico"))


def civic_sort_value(row: dict[str, Any]) -> tuple[float, str, str]:
    text = civic_number_value(row)
    match = re.search(r"\d+", text)
    numeric = float(match.group(0)) if match else math.inf
    return (numeric, text, as_text(row.get("ESPONENTE") or row.get("esponente")))


def civic_range_summary(rows: list[dict[str, Any]]) -> str:
    if not rows:
        return ""
    by_street: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        by_street[street_value(row) or "Unknown street"].append(row)
    summaries: list[str] = []
    for street, street_rows in sorted(by_street.items(), key=lambda item: (-len(item[1]), item[0]))[:MAX_STREETS_PER_TASK]:
        numbered = [row for row in street_rows if civic_number_value(row)]
        if not numbered:
            summaries.append(f"{street}: {len(street_rows)} civics")
            continue
        ordered = sorted(numbered, key=civic_sort_value)
        first = civic_number_value(ordered[0])
        last = civic_number_value(ordered[-1])
        if first == last:
            summaries.append(f"{street}: civic {first} ({len(street_rows)} civics)")
        else:
            summaries.append(f"{street}: civics {first}-{last} ({len(street_rows)} civics)")
    if len(by_street) > MAX_STREETS_PER_TASK:
        summaries.append(f"+{len(by_street) - MAX_STREETS_PER_TASK} more streets")
    return "; ".join(summaries)


def slugify(value: Any, *, max_len: int = 64) -> str:
    text = as_text(value).lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return (text[:max_len].strip("-") or "unknown")


def priority_for_cell(row: dict[str, Any]) -> str:
    method = as_text(row.get("assignment_method"))
    total = as_int(row.get("total_civics"))
    share = as_float(row.get("dominant_section_share"))
    if method == "census_cell_conflict" and (total >= 100 or share < 0.5):
        return "high"
    if method == "no_assigned_civics" and total >= 100:
        return "high"
    if total > 0:
        return "medium"
    return "low"


def priority_for_group(count: int, *, min_distance_m: float | None = None, competing_count: int = 0) -> str:
    if count >= 30 or (min_distance_m is not None and min_distance_m <= 25) or competing_count >= 4:
        return "high"
    if count >= 6 or (min_distance_m is not None and min_distance_m <= 75) or competing_count >= 2:
        return "medium"
    return "low"


def evidence_strength_for_task(
    *,
    direct_rule_count: int = 0,
    street_rule_count: int = 0,
    dominant_share: float = 0.0,
    competing_count: int = 0,
) -> str:
    if direct_rule_count > 0 and competing_count <= 1:
        return "strong"
    if street_rule_count > 0 or dominant_share >= 0.55:
        return "medium"
    if competing_count > 0 or dominant_share > 0:
        return "weak"
    return "none"


def civic_numeric_value(row: dict[str, Any]) -> int | None:
    match = re.search(r"\d+", civic_number_value(row))
    return int(match.group(0)) if match else None


def is_snc_civic(row: dict[str, Any]) -> bool:
    return (
        as_bool(row.get("anncsu_is_snc"))
        or bool(as_text(row.get("PROGRESSIVO_SNC") or row.get("progressivo_snc")))
        or not civic_number_value(row)
    )


def civic_parity_value(row: dict[str, Any]) -> str:
    if is_snc_civic(row):
        return "snc"
    numeric = civic_numeric_value(row)
    if numeric is None:
        return "unknown"
    return "even" if numeric % 2 == 0 else "odd"


def civic_label(row: dict[str, Any]) -> str:
    civic = civic_number_value(row)
    exponent = as_text(row.get("ESPONENTE") or row.get("esponente"))
    if civic and exponent:
        return f"{civic}/{exponent}"
    if civic:
        return civic
    return "SNC" if is_snc_civic(row) else ""


def anncsu_address_label(row: dict[str, Any]) -> str:
    street = as_text(row.get("ODONIMO") or row.get("anncsu_odonimo") or row.get("odonimo_raw"))
    civic = civic_label(row)
    suffix = f" {civic}" if civic else ""
    return f"ANNCSU: {street}{suffix}".strip()


def source_coord_lon(row: dict[str, Any]) -> str:
    return decimal_text(row.get("COORD_X_COMUNE") or row.get("coord_x") or row.get("source_coord_x"))


def source_coord_lat(row: dict[str, Any]) -> str:
    return decimal_text(row.get("COORD_Y_COMUNE") or row.get("coord_y") or row.get("source_coord_y"))


def coordinate_status(row: dict[str, Any]) -> str:
    lon = as_float(source_coord_lon(row), math.nan)
    lat = as_float(source_coord_lat(row), math.nan)
    if math.isnan(lon) or math.isnan(lat):
        return "coordinate_outlier"
    if not (16.0 <= lon <= 16.6 and 38.75 <= lat <= 39.15):
        return "coordinate_outlier"
    if 38.75 <= lon <= 39.15 and 16.0 <= lat <= 16.6:
        return "coordinate_outlier"
    return "ok"


def coordinate_quality_flag(row: dict[str, Any]) -> str:
    return as_text(row.get("coordinate_quality_flag")) or "ok"


def suggested_coordinate_action(row: dict[str, Any]) -> str:
    value = as_text(row.get("suggested_coordinate_action") or row.get("suggested_action"))
    if value:
        return value
    return "keep_as_is" if coordinate_quality_flag(row) == "ok" else "exclude_from_future_geometry_until_reviewed"


def exclude_from_geometry_candidate(row: dict[str, Any]) -> bool:
    if "exclude_from_geometry_candidate" in row:
        return as_bool(row.get("exclude_from_geometry_candidate"))
    return coordinate_quality_flag(row) != "ok"


def civic_validated_for_heading(row: dict[str, Any]) -> bool:
    return (
        bool(street_value(row))
        and coordinate_status(row) == "ok"
        and coordinate_quality_flag(row) == "ok"
        and not exclude_from_geometry_candidate(row)
    )


def civic_min_max(rows: list[dict[str, Any]]) -> tuple[Any, Any]:
    values = [value for value in (civic_numeric_value(row) for row in rows) if value is not None]
    if not values:
        return "", ""
    return min(values), max(values)


def civic_values_sample(rows: list[dict[str, Any]], limit: int = 24) -> list[str]:
    ordered = sorted(rows, key=lambda row: (street_value(row), civic_sort_value(row), as_text(row.get("access_id"))))
    return unique_texts([civic_label(row) for row in ordered], limit)


def parity_mix_for_rows(rows: list[dict[str, Any]]) -> dict[str, int]:
    counts = Counter(civic_parity_value(row) for row in rows)
    return {key: counts.get(key, 0) for key in ["even", "odd", "snc", "unknown"] if counts.get(key, 0)}


def snc_count_for_rows(rows: list[dict[str, Any]]) -> int:
    return sum(1 for row in rows if is_snc_civic(row))


def normalised_rule_parity(rule: dict[str, Any]) -> str:
    value = as_text(rule.get("civic_parity")).lower()
    if value in {"even", "pari"}:
        return "even"
    if value in {"odd", "dispari"}:
        return "odd"
    if value in {"any", "all", "both", "tutti"}:
        return "any"
    return ""


def rule_numeric_range(rule: dict[str, Any]) -> tuple[int | None, int | None]:
    civic_from = as_text(rule.get("civic_from"))
    civic_to = as_text(rule.get("civic_to"))
    start = as_int(civic_from, -1) if civic_from else None
    end = as_int(civic_to, -1) if civic_to else None
    if start == -1:
        start = None
    if end == -1:
        end = None
    if start is not None and end is not None and start > end:
        start, end = end, start
    return start, end


def rule_overlaps_civics(rule: dict[str, Any], rows: list[dict[str, Any]]) -> bool:
    start, end = rule_numeric_range(rule)
    numbers = [value for value in (civic_numeric_value(row) for row in rows) if value is not None]
    if start is None and end is None:
        return bool(numbers)
    for value in numbers:
        if start is not None and value < start:
            continue
        if end is not None and value > end:
            continue
        return True
    return False


def rule_includes_snc(rule: dict[str, Any]) -> bool:
    return as_bool(rule.get("includes_snc"))


def map_bbox_for_geometries(gpd, geoms: list[Any]) -> list[float]:
    valid = [geom for geom in geoms if geom is not None and not getattr(geom, "is_empty", True)]
    if not valid:
        return []
    series = gpd.GeoSeries(valid, crs="EPSG:32633").to_crs("EPSG:4326")
    minx, miny, maxx, maxy = series.total_bounds
    dx = max(maxx - minx, 0.002)
    dy = max(maxy - miny, 0.002)
    pad_x = dx * 0.18
    pad_y = dy * 0.18
    return [
        round(float(minx - pad_x), 6),
        round(float(miny - pad_y), 6),
        round(float(maxx + pad_x), 6),
        round(float(maxy + pad_y), 6),
    ]


def feature_collection(gdf, columns: list[str], *, simplify_m: float | None = None) -> dict[str, Any]:
    gpd, _pd, shapely, _tree = require_geospatial_dependencies()
    out = gdf.copy()
    out = out.loc[:, ~out.columns.duplicated()]
    if simplify_m and out.crs and str(out.crs).upper() != "EPSG:4326":
        out["geometry"] = out.geometry.apply(lambda geom: shapely.make_valid(geom).simplify(simplify_m, preserve_topology=True))
    out = out.to_crs("EPSG:4326")
    keep = list(dict.fromkeys([col for col in columns if col in out.columns] + ["geometry"]))
    out = out[keep].copy()
    return json.loads(out.to_json(drop_id=True))


def point_collection(gdf, columns: list[str]) -> dict[str, Any]:
    out = gdf.copy().to_crs("EPSG:4326")
    out = out.loc[:, ~out.columns.duplicated()]
    keep = list(dict.fromkeys([col for col in columns if col in out.columns] + ["geometry"]))
    out = out[keep].copy()
    return json.loads(out.to_json(drop_id=True))


def enrich_point_label_columns(frame, source_records: dict[str, dict[str, Any]] | None = None) -> Any:
    out = frame.copy()
    source_records = source_records or {}

    def value(row: Any, *keys: str) -> str:
        for key in keys:
            if key in row and as_text(row.get(key)):
                return as_text(row.get(key))
        return ""

    records = []
    for _idx, row in out.iterrows():
        record = row.to_dict()
        source = source_records.get(as_text(record.get("access_id")))
        if source:
            merged = dict(source)
            merged.update({key: value for key, value in record.items() if as_text(value)})
            record = merged
        records.append(record)
    out["odonimo_raw"] = [value(row, "ODONIMO", "anncsu_odonimo", "odonimo_raw") for row in records]
    out["localita"] = [value(row, "LOCALITA'", "localita") for row in records]
    out["civico"] = [value(row, "CIVICO", "civico") for row in records]
    out["esponente"] = [value(row, "ESPONENTE", "esponente") for row in records]
    out["anncsu_address_label"] = [anncsu_address_label(row) for row in records]
    out["map_popup_title"] = out["anncsu_address_label"]
    out["source_record_access_id"] = [value(row, "access_id", "PROGRESSIVO_ACCESSO") for row in records]
    out["source_coord_x"] = [value(row, "COORD_X_COMUNE", "source_coord_x", "coord_x") for row in records]
    out["source_coord_y"] = [value(row, "COORD_Y_COMUNE", "source_coord_y", "coord_y") for row in records]
    out["source_coord_lon"] = [source_coord_lon(row) for row in records]
    out["source_coord_lat"] = [source_coord_lat(row) for row in records]
    out["coordinate_quality_flag"] = [coordinate_quality_flag(row) for row in records]
    out["coordinate_suspect_reason"] = [value(row, "coordinate_suspect_reason") for row in records]
    out["nearest_validated_street_context"] = [value(row, "nearest_validated_street_context") for row in records]
    out["nearest_validated_street_context_count"] = [value(row, "nearest_validated_street_context_count") for row in records]
    out["distance_to_nearest_different_street_m"] = [value(row, "distance_to_nearest_different_street_m") for row in records]
    out["suggested_coordinate_action"] = [suggested_coordinate_action(row) for row in records]
    out["exclude_from_geometry_candidate"] = [exclude_from_geometry_candidate(row) for row in records]
    statuses = [coordinate_status(row) for row in records]
    out["label_integrity_status"] = statuses
    out["label_integrity_notes"] = [
        "" if status == "ok" else "Coordinate sorgente mancanti, fuori range Lamezia o potenzialmente invertite."
        for status in statuses
    ]
    return out


def civic_record(row: dict[str, Any]) -> dict[str, Any]:
    lon = source_coord_lon(row)
    lat = source_coord_lat(row)
    status = coordinate_status(row)
    return {
        "task_id": as_text(row.get("task_id")),
        "access_id": as_text(row.get("access_id") or row.get("PROGRESSIVO_ACCESSO")),
        "odonimo_raw": as_text(row.get("ODONIMO") or row.get("anncsu_odonimo")),
        "localita": as_text(row.get("LOCALITA'") or row.get("localita")),
        "street_name_normalised": as_text(row.get("street_name_normalised")),
        "civico": as_text(row.get("CIVICO") or row.get("civico")),
        "esponente": as_text(row.get("ESPONENTE") or row.get("esponente")),
        "section_number": as_text(row.get("section_number")),
        "current_section_number": as_text(row.get("current_section_number") or row.get("section_number")),
        "suggested_section_number": as_text(row.get("suggested_section_number") or row.get("nearest_candidate_section")),
        "competing_sections": as_text(row.get("competing_sections")),
        "assignment_method": as_text(row.get("assignment_method")),
        "assignment_confidence": as_text(row.get("assignment_confidence")),
        "human_review_required": as_bool(row.get("human_review_required")),
        "rule_id": as_text(row.get("rule_id")),
        "civic_parity": civic_parity_value(row),
        "is_snc": is_snc_civic(row),
        "coord_x": as_text(row.get("COORD_X_COMUNE") or row.get("coord_x")),
        "coord_y": as_text(row.get("COORD_Y_COMUNE") or row.get("coord_y")),
        "source_coord_x": as_text(row.get("COORD_X_COMUNE") or row.get("source_coord_x") or row.get("coord_x")),
        "source_coord_y": as_text(row.get("COORD_Y_COMUNE") or row.get("source_coord_y") or row.get("coord_y")),
        "source_coord_lon": lon,
        "source_coord_lat": lat,
        "anncsu_address_label": anncsu_address_label(row),
        "map_popup_title": anncsu_address_label(row),
        "source_record_access_id": as_text(row.get("access_id") or row.get("PROGRESSIVO_ACCESSO")),
        "label_integrity_status": status,
        "label_integrity_notes": "" if status == "ok" else "Coordinate sorgente mancanti, fuori range Lamezia o potenzialmente invertite.",
        "coordinate_quality_flag": coordinate_quality_flag(row),
        "coordinate_suspect_reason": as_text(row.get("coordinate_suspect_reason")),
        "nearest_validated_street_context": as_text(row.get("nearest_validated_street_context")),
        "nearest_validated_street_context_count": as_text(row.get("nearest_validated_street_context_count")),
        "distance_to_nearest_different_street_m": as_text(row.get("distance_to_nearest_different_street_m")),
        "suggested_coordinate_action": suggested_coordinate_action(row),
        "exclude_from_geometry_candidate": exclude_from_geometry_candidate(row),
        "distance_to_boundary_m": as_text(row.get("distance_to_boundary_m") or row.get("distance_to_candidate_boundary_m")),
        "problem_type": as_text(row.get("problem_type")),
        "notes": as_text(row.get("assignment_notes") or row.get("notes") or row.get("review_notes")),
    }


def rule_record(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "rule_id": as_text(row.get("rule_id")),
        "section_number": as_text(row.get("section_number")),
        "street_name_raw": as_text(row.get("street_name_raw")),
        "street_name_normalised": as_text(row.get("street_name_normalised")),
        "civic_rule_raw": as_text(row.get("civic_rule_raw")),
        "civic_from": as_text(row.get("civic_from")),
        "civic_to": as_text(row.get("civic_to")),
        "civic_parity": as_text(row.get("civic_parity")),
        "includes_snc": as_text(row.get("includes_snc")),
        "source_page": as_text(row.get("source_page")),
        "extraction_confidence": as_text(row.get("extraction_confidence")),
        "notes": as_text(row.get("notes")),
    }


def case_base(review_id: str, case_type: str) -> dict[str, Any]:
    return {
        "review_id": review_id,
        "case_type": case_type,
        "census_cell_id": "",
        "current_assignment_method": "",
        "current_assigned_section": "",
        "suggested_section_number": "",
        "competing_sections": "",
        "dominant_section_share": "",
        "total_civics": 0,
        "deterministic_civics": 0,
        "spatially_resolved_civics": 0,
        "review_civics": 0,
        "geometry_confidence": "",
        "needs_manual_review": True,
        "priority": "medium",
        "problem_summary": "",
        "notes": "",
    }


def main() -> int:
    gpd, pd, _shapely, _tree = require_geospatial_dependencies()
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    cells = gpd.read_file(CELLS_GPKG, layer=CELLS_LAYER)
    v3 = gpd.read_file(V3_GPKG, layer=V3_LAYER)
    v2 = gpd.read_file(QGIS_GPKG, layer=V2_LAYER)
    v1 = gpd.read_file(QGIS_GPKG, layer=V1_LAYER)
    deterministic_points = gpd.read_file(QGIS_GPKG, layer="deterministic_points")
    spatially_resolved_points = gpd.read_file(QGIS_GPKG, layer="spatially_resolved_points")

    civics = civics_to_geodataframe(CIVICS_V2_CSV, read_review_by_access_id(REVIEW_QUEUE_CSV))
    civics["access_id"] = civics["access_id"].astype(str)
    cells_32633 = cells.to_crs("EPSG:32633")
    joined = gpd.sjoin(
        civics,
        cells_32633[["census_cell_id", "geometry"]],
        how="left",
        predicate="covered_by",
    )
    joined["census_cell_id"] = joined["census_cell_id"].fillna("")
    joined = joined.sort_values(["access_id", "census_cell_id"]).drop_duplicates(subset=["access_id"], keep="first")
    coordinate_quality_by_access = {
        as_text(row.get("access_id")): row for row in read_csv_rows(COORDINATE_SUSPECT_CSV) if as_text(row.get("access_id"))
    }

    def coordinate_action_for_access(access_id: str) -> str:
        quality = coordinate_quality_by_access.get(access_id, {})
        action = as_text(quality.get("suggested_action"))
        if action:
            return action
        flag = as_text(quality.get("coordinate_quality_flag")) or "ok"
        return "keep_as_is" if flag == "ok" else "exclude_from_future_geometry_until_reviewed"

    joined["coordinate_quality_flag"] = joined["access_id"].astype(str).map(
        lambda access_id: as_text(coordinate_quality_by_access.get(access_id, {}).get("coordinate_quality_flag")) or "ok"
    )
    joined["coordinate_suspect_reason"] = joined["access_id"].astype(str).map(
        lambda access_id: as_text(coordinate_quality_by_access.get(access_id, {}).get("coordinate_suspect_reason"))
    )
    joined["nearest_validated_street_context"] = joined["access_id"].astype(str).map(
        lambda access_id: as_text(coordinate_quality_by_access.get(access_id, {}).get("nearest_validated_street_context"))
    )
    joined["nearest_validated_street_context_count"] = joined["access_id"].astype(str).map(
        lambda access_id: as_text(coordinate_quality_by_access.get(access_id, {}).get("nearest_validated_street_context_count"))
    )
    joined["distance_to_nearest_different_street_m"] = joined["access_id"].astype(str).map(
        lambda access_id: as_text(coordinate_quality_by_access.get(access_id, {}).get("distance_to_nearest_different_street_m"))
    )
    joined["suggested_coordinate_action"] = joined["access_id"].astype(str).map(coordinate_action_for_access)
    joined["exclude_from_geometry_candidate"] = joined["coordinate_quality_flag"].map(lambda flag: as_text(flag) != "ok")
    joined_records = [row.to_dict() for _idx, row in joined.iterrows()]
    civics_by_access = {as_text(row.get("access_id")): row for row in joined_records}
    civics_by_cell: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in joined_records:
        cell_id = as_text(row.get("census_cell_id"))
        if cell_id:
            civics_by_cell[cell_id].append(row)

    metrics = read_csv_rows(V3_METRICS_CSV)
    boundary_rows = read_csv_rows(BOUNDARY_UNCERTAINTY_CSV)
    boundary_by_access = {as_text(row.get("access_id")): row for row in boundary_rows}
    for row in joined_records:
        boundary = boundary_by_access.get(as_text(row.get("access_id")))
        if not boundary:
            continue
        row["nearest_candidate_section"] = as_text(boundary.get("nearest_candidate_section"))
        row["distance_to_candidate_boundary_m"] = as_text(boundary.get("distance_to_candidate_boundary_m"))
        row["suggested_review_action"] = as_text(boundary.get("suggested_review_action"))
    rules = read_csv_rows(STREET_RULES_CSV)
    crosswalk_rows = read_csv_rows(CROSSWALK_CSV)
    rules_by_id = {as_text(row.get("rule_id")): row for row in rules if as_text(row.get("rule_id"))}
    rules_by_street: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in rules:
        street = as_text(row.get("street_name_normalised"))
        if street:
            rules_by_street[street].append(row)

    cases: list[dict[str, Any]] = []
    case_civics: dict[str, list[dict[str, Any]]] = {}
    case_rules: dict[str, list[dict[str, Any]]] = {}

    def add_case(case: dict[str, Any], civic_rows: list[dict[str, Any]]) -> None:
        review_id = case["review_id"]
        cases.append(case)
        minimal_civics = [civic_record(row) for row in civic_rows]
        case_civics[review_id] = minimal_civics
        relevant_sections = set(parse_competing_sections(case.get("competing_sections")))
        for key in ["current_assigned_section", "suggested_section_number"]:
            value = as_text(case.get(key))
            if value:
                relevant_sections.add(value)
        selected_rules: dict[str, dict[str, Any]] = {}
        streets = {row["street_name_normalised"] for row in minimal_civics if row.get("street_name_normalised")}
        for civic in minimal_civics:
            rule_id = civic.get("rule_id", "")
            if rule_id and rule_id in rules_by_id:
                selected_rules[rule_id] = rules_by_id[rule_id]
        for street in sorted(streets):
            for rule in rules_by_street.get(street, []):
                section = as_text(rule.get("section_number"))
                if relevant_sections and section not in relevant_sections:
                    continue
                selected_rules[as_text(rule.get("rule_id"))] = rule
                if len(selected_rules) >= MAX_RULES_PER_CASE:
                    break
            if len(selected_rules) >= MAX_RULES_PER_CASE:
                break
        case_rules[review_id] = [rule_record(row) for row in selected_rules.values()]

    review_tasks: list[dict[str, Any]] = []
    task_civics: dict[str, list[dict[str, Any]]] = {}
    task_evidence: dict[str, list[dict[str, Any]]] = {}
    task_candidate_sections: dict[str, list[dict[str, Any]]] = {}
    nearby_deterministic_by_task: dict[str, list[dict[str, Any]]] = {}
    point_task_by_access: dict[str, str] = {}
    cell_task_map: dict[str, list[str]] = defaultdict(list)
    section_task_map: dict[str, list[str]] = defaultdict(list)
    civic_review_tasks: list[dict[str, Any]] = []
    civic_task_civics: dict[str, list[dict[str, Any]]] = {}
    civic_task_evidence: dict[str, list[dict[str, Any]]] = {}
    civic_task_candidate_sections: dict[str, list[dict[str, Any]]] = {}
    civic_nearby_deterministic_by_task: dict[str, list[dict[str, Any]]] = {}
    civic_cell_task_map: dict[str, list[str]] = defaultdict(list)
    civic_section_task_map: dict[str, list[str]] = defaultdict(list)
    used_civic_task_ids: set[str] = set()

    def street_register_evidence_for_task(
        task_id: str,
        civic_rows: list[dict[str, Any]],
        suggested_section: str,
        competing_sections: list[str],
    ) -> list[dict[str, Any]]:
        relevant_sections = {section for section in competing_sections if section}
        if suggested_section:
            relevant_sections.add(suggested_section)
        selected: dict[str, dict[str, Any]] = {}

        def add_rule(row: dict[str, Any], reason: str, score: int) -> None:
            rule_id = as_text(row.get("rule_id"))
            if not rule_id:
                return
            existing = selected.get(rule_id)
            if existing and as_int(existing.get("relevance_score")) >= score:
                return
            record = {
                "task_id": task_id,
                "rule_id": rule_id,
                "source_page": as_text(row.get("source_page")),
                "section_number": as_text(row.get("section_number")),
                "polling_place": as_text(row.get("polling_place")),
                "street_rule_raw": as_text(row.get("street_rule_raw")),
                "street_name_raw": as_text(row.get("street_name_raw")),
                "street_name_normalised": as_text(row.get("street_name_normalised")),
                "civic_rule_raw": as_text(row.get("civic_rule_raw")),
                "civic_from": as_text(row.get("civic_from")),
                "civic_to": as_text(row.get("civic_to")),
                "civic_parity": as_text(row.get("civic_parity")),
                "includes_snc": as_text(row.get("includes_snc")),
                "extraction_confidence": as_text(row.get("extraction_confidence")),
                "match_reason": reason,
                "relevance_score": score,
                "notes": as_text(row.get("notes")),
            }
            selected[rule_id] = record

        for civic in civic_rows:
            rule_id = as_text(civic.get("rule_id"))
            if rule_id and rule_id in rules_by_id:
                add_rule(rules_by_id[rule_id], "direct_rule_id_from_civic_assignment", 100)

        for street in unique_texts([street_value(row) for row in civic_rows]):
            street_rules = rules_by_street.get(street, [])
            for rule in street_rules:
                section = as_text(rule.get("section_number"))
                if suggested_section and section == suggested_section:
                    add_rule(rule, "same_street_suggested_section", 90)
                elif section in relevant_sections:
                    add_rule(rule, "same_street_competing_section", 82)
            if len(selected) < MAX_RULES_PER_TASK:
                for rule in street_rules:
                    add_rule(rule, "same_street_other_section", 55)
                    if len(selected) >= MAX_RULES_PER_TASK:
                        break
            if len(selected) >= MAX_RULES_PER_TASK:
                break

        return sorted(selected.values(), key=lambda item: (-as_int(item.get("relevance_score")), section_sort_key(item.get("section_number"))))

    def deterministic_context(task_geom: Any) -> list[dict[str, Any]]:
        if task_geom is None or getattr(task_geom, "is_empty", True):
            return []
        minx, miny, maxx, maxy = task_geom.bounds
        radius = 250
        try:
            window = deterministic_points.cx[minx - radius : maxx + radius, miny - radius : maxy + radius].copy()
        except Exception:
            window = deterministic_points.copy()
        if window.empty:
            return []
        window["distance_m"] = window.geometry.distance(task_geom)
        window = window.sort_values(["distance_m", "access_id"]).head(MAX_NEARBY_DETERMINISTIC_PER_TASK)
        rows: list[dict[str, Any]] = []
        for _idx, row in window.iterrows():
            record = civic_record(row.to_dict())
            record["distance_m"] = round(float(row.get("distance_m") or 0), 2)
            rows.append(record)
        return rows

    def candidate_sections_for_task(
        task: dict[str, Any],
        civic_rows: list[dict[str, Any]],
        evidence_rows: list[dict[str, Any]],
        nearby_rows: list[dict[str, Any]],
        section_counts: dict[str, int] | None,
    ) -> list[dict[str, Any]]:
        counts: dict[str, int] = dict(section_counts or {})
        for row in civic_rows:
            section = as_text(row.get("section_number"))
            if section:
                counts[section] = counts.get(section, 0) + 1
            nearest = as_text(row.get("nearest_candidate_section"))
            if nearest:
                counts.setdefault(nearest, 0)
        suggested = as_text(task.get("suggested_section_number"))
        if suggested:
            counts.setdefault(suggested, 0)
        for section in task.get("competing_sections") or []:
            counts.setdefault(section, 0)
        evidence_counts = Counter(as_text(row.get("section_number")) for row in evidence_rows if as_text(row.get("section_number")))
        nearby_counts = Counter(as_text(row.get("section_number")) for row in nearby_rows if as_text(row.get("section_number")))
        for section in evidence_counts:
            counts.setdefault(section, 0)
        total = sum(counts.values()) or len(civic_rows) or 1
        candidates: list[dict[str, Any]] = []
        for section, support in sorted(counts.items(), key=lambda item: (-item[1], section_sort_key(item[0]))):
            if not section:
                continue
            candidates.append(
                {
                    "section_number": section,
                    "civic_support_count": support,
                    "civic_support_share": round(float(support) / total, 4),
                    "is_suggested": section == suggested,
                    "is_competing": section in (task.get("competing_sections") or []),
                    "street_register_rule_count": evidence_counts.get(section, 0),
                    "nearby_deterministic_count": nearby_counts.get(section, 0),
                    "boundary_warning": task.get("task_type") == "boundary_uncertainty_cluster",
                }
            )
        return candidates

    def add_task(
        task: dict[str, Any],
        civic_rows: list[dict[str, Any]],
        geoms: list[Any],
        *,
        section_counts: dict[str, int] | None = None,
        task_geom: Any | None = None,
    ) -> None:
        task_id = as_text(task["task_id"])
        civic_rows = sorted(civic_rows, key=lambda row: (street_value(row), civic_sort_value(row), as_text(row.get("access_id"))))
        task_geoms = [geom for geom in geoms if geom is not None and not getattr(geom, "is_empty", True)]
        if task_geom is None and task_geoms:
            task_geom = _shapely.union_all(task_geoms)
        suggested = as_text(task.get("suggested_section_number"))
        competing = unique_texts(task.get("competing_sections") or [])
        evidence_rows = street_register_evidence_for_task(task_id, civic_rows, suggested, competing)
        nearby_rows = (
            deterministic_context(task_geom)
            if task.get("priority") in {"high", "medium"} or len(civic_rows) >= 6
            else []
        )
        direct_rule_count = sum(1 for row in evidence_rows if row.get("match_reason") == "direct_rule_id_from_civic_assignment")
        evidence_sections = unique_texts([row.get("section_number") for row in evidence_rows])
        street_match_status = "no_match"
        if direct_rule_count:
            street_match_status = "direct_match"
        elif len(evidence_sections) > 1:
            street_match_status = "multiple_sections"
        elif evidence_rows:
            street_match_status = "same_street_match"
        dominant_share = as_float(task.get("dominant_section_share"))
        task.update(
            {
                "competing_sections": competing,
                "involved_streets": unique_texts([street_value(row) for row in civic_rows], MAX_STREETS_PER_TASK),
                "civic_count": len(civic_rows) if civic_rows else as_int(task.get("civic_count")),
                "civic_range_summary": civic_range_summary(civic_rows),
                "representative_access_ids": unique_texts([row.get("access_id") for row in civic_rows], 12),
                "map_focus_bbox": map_bbox_for_geometries(gpd, task_geoms) if task_geoms else task.get("map_focus_bbox", []),
                "evidence_strength": task.get("evidence_strength")
                or evidence_strength_for_task(
                    direct_rule_count=direct_rule_count,
                    street_rule_count=len(evidence_rows),
                    dominant_share=dominant_share,
                    competing_count=len(competing),
                ),
                "street_register_match_status": street_match_status,
                "has_street_register_evidence": bool(evidence_rows),
                "has_multiple_candidate_sections": len(set(competing) | set(evidence_sections)) > 1,
                "has_no_street_register_match": not bool(evidence_rows),
                "source_files": task.get("source_files") or [],
            }
        )
        review_tasks.append(task)
        task_civics[task_id] = [civic_record(row) for row in civic_rows[:MAX_CIVICS_PER_TASK_PAYLOAD]]
        if len(civic_rows) > MAX_CIVICS_PER_TASK_PAYLOAD:
            task["notes"] = (as_text(task.get("notes")) + f" Civics payload limited to {MAX_CIVICS_PER_TASK_PAYLOAD} rows.").strip()
        task_evidence[task_id] = evidence_rows
        nearby_deterministic_by_task[task_id] = nearby_rows
        task_candidate_sections[task_id] = candidate_sections_for_task(task, civic_rows, evidence_rows, nearby_rows, section_counts)
        if task.get("census_cell_id"):
            cell_task_map[as_text(task.get("census_cell_id"))].append(task_id)
        if task.get("task_type") in {"section_low_confidence", "section_needs_manual_review"}:
            section_task_map[as_text(task.get("suggested_section_number"))].append(task_id)
        if task.get("task_type") in {"boundary_uncertainty_cluster", "unresolved_civic_group"}:
            for row in civic_rows:
                access_id = as_text(row.get("access_id"))
                if access_id:
                    point_task_by_access[access_id] = task_id

    def current_sections_for_rows(civic_rows: list[dict[str, Any]]) -> list[str]:
        return unique_texts(
            [
                row.get("current_section_number") or row.get("section_number")
                for row in civic_rows
                if as_text(row.get("current_section_number") or row.get("section_number"))
            ]
        )

    def street_rules_for_rows(civic_rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
        selected: dict[str, dict[str, Any]] = {}
        for street in unique_texts([street_value(row) for row in civic_rows]):
            for rule in rules_by_street.get(street, []):
                rule_id = as_text(rule.get("rule_id"))
                if rule_id:
                    selected[rule_id] = rule
        return list(selected.values())

    def street_register_sections_for_rows(civic_rows: list[dict[str, Any]]) -> list[str]:
        return sorted(
            unique_texts([rule.get("section_number") for rule in street_rules_for_rows(civic_rows)]),
            key=section_sort_key,
        )

    def rule_compatibility_with_civic_task(
        rule: dict[str, Any],
        civic_rows: list[dict[str, Any]],
        suggested_section: str,
        competing_sections: list[str],
    ) -> str:
        rule_id = as_text(rule.get("rule_id"))
        direct_rule_ids = {as_text(row.get("rule_id")) for row in civic_rows if as_text(row.get("rule_id"))}
        if rule_id and rule_id in direct_rule_ids:
            return "direct_compatible_rule"
        parities = {civic_parity_value(row) for row in civic_rows}
        if "snc" in parities and rule_includes_snc(rule):
            return "snc_match"
        rule_parity = normalised_rule_parity(rule)
        if rule_parity in {"even", "odd"}:
            if rule_parity in parities:
                return "parity_match"
            if "even" in parities or "odd" in parities:
                return "parity_conflict"
        if rule_overlaps_civics(rule, civic_rows):
            return "interval_overlap"
        section = as_text(rule.get("section_number"))
        task_sections = set(current_sections_for_rows(civic_rows)) | set(competing_sections)
        if suggested_section:
            task_sections.add(suggested_section)
        if suggested_section and section == suggested_section:
            return "direct_compatible_rule"
        if section in set(competing_sections):
            return "competing_rule"
        if section in task_sections:
            return "possible_variant_match"
        return "no_compatible_rule"

    def street_register_evidence_for_civic_task(
        task_id: str,
        civic_rows: list[dict[str, Any]],
        suggested_section: str,
        competing_sections: list[str],
    ) -> list[dict[str, Any]]:
        selected: dict[str, dict[str, Any]] = {}

        def score_for_compatibility(compatibility: str) -> int:
            return {
                "direct_compatible_rule": 100,
                "snc_match": 92,
                "parity_match": 88,
                "interval_overlap": 82,
                "possible_variant_match": 70,
                "competing_rule": 66,
                "parity_conflict": 44,
                "no_compatible_rule": 20,
            }.get(compatibility, 10)

        def add_rule(row: dict[str, Any], reason: str) -> None:
            rule_id = as_text(row.get("rule_id"))
            if not rule_id:
                return
            compatibility = rule_compatibility_with_civic_task(row, civic_rows, suggested_section, competing_sections)
            score = score_for_compatibility(compatibility)
            existing = selected.get(rule_id)
            if existing and as_int(existing.get("relevance_score")) >= score:
                return
            selected[rule_id] = {
                "task_id": task_id,
                "rule_id": rule_id,
                "source_page": as_text(row.get("source_page")),
                "section_number": as_text(row.get("section_number")),
                "polling_place": as_text(row.get("polling_place")),
                "street_rule_raw": as_text(row.get("street_rule_raw")),
                "street_name_raw": as_text(row.get("street_name_raw")),
                "street_name_normalised": as_text(row.get("street_name_normalised")),
                "civic_rule_raw": as_text(row.get("civic_rule_raw")),
                "civic_from": as_text(row.get("civic_from")),
                "civic_to": as_text(row.get("civic_to")),
                "civic_parity": as_text(row.get("civic_parity")),
                "includes_snc": as_text(row.get("includes_snc")),
                "extraction_confidence": as_text(row.get("extraction_confidence")),
                "match_reason": reason,
                "compatibility_with_task": compatibility,
                "relevance_score": score,
                "notes": as_text(row.get("notes")),
            }

        for civic in civic_rows:
            rule_id = as_text(civic.get("rule_id"))
            if rule_id and rule_id in rules_by_id:
                add_rule(rules_by_id[rule_id], "direct_rule_id_from_civic_assignment")

        task_sections = set(current_sections_for_rows(civic_rows)) | set(competing_sections)
        if suggested_section:
            task_sections.add(suggested_section)
        for rule in street_rules_for_rows(civic_rows):
            section = as_text(rule.get("section_number"))
            compatibility = rule_compatibility_with_civic_task(rule, civic_rows, suggested_section, competing_sections)
            if (
                compatibility != "no_compatible_rule"
                or section in task_sections
                or len(selected) < MAX_RULES_PER_TASK // 2
            ):
                add_rule(rule, "same_street_civic_rule_context")
            if len(selected) >= MAX_RULES_PER_TASK:
                break

        return sorted(
            selected.values(),
            key=lambda item: (
                -as_int(item.get("relevance_score")),
                section_sort_key(item.get("section_number")),
                as_text(item.get("rule_id")),
            ),
        )

    def civic_task_type_for_rows(civic_rows: list[dict[str, Any]], *, boundary: bool = False) -> str:
        if boundary:
            return "boundary_civic_cluster"
        street_rules = street_rules_for_rows(civic_rows)
        reason = ";".join(unique_texts([row.get("problem_type") for row in civic_rows])).lower()
        if snc_count_for_rows(civic_rows) and any(rule_includes_snc(rule) for rule in street_rules):
            return "snc_review"
        if "no_civic_rule_match" in reason:
            return "civic_range_conflict"
        if "ambiguous_multiple_rules" in reason:
            if any(normalised_rule_parity(rule) in {"even", "odd"} for rule in street_rules):
                return "parity_rule_review"
            return "street_register_multiple_matches"
        competing = set()
        for row in civic_rows:
            competing.update(parse_competing_sections(row.get("competing_sections")))
        if not street_rules and len(competing) > 1:
            return "multi_section_street_conflict"
        if not street_rules:
            return "street_register_no_match"
        if any(normalised_rule_parity(rule) in {"even", "odd"} for rule in street_rules):
            return "parity_rule_review"
        if len(street_register_sections_for_rows(civic_rows)) > 1:
            return "street_register_multiple_matches"
        if any(rule_numeric_range(rule) != (None, None) for rule in street_rules):
            return "civic_range_conflict"
        if len(competing) > 1:
            return "multi_section_street_conflict"
        return "unassigned_civic_group"

    def unique_civic_task_id(base: str) -> str:
        task_id = base
        suffix = 2
        while task_id in used_civic_task_ids:
            task_id = f"{base}-{suffix}"
            suffix += 1
        used_civic_task_ids.add(task_id)
        return task_id

    def add_civic_task(
        task: dict[str, Any],
        civic_rows: list[dict[str, Any]],
        geoms: list[Any],
        *,
        section_counts: dict[str, int] | None = None,
        task_geom: Any | None = None,
    ) -> None:
        task_id = unique_civic_task_id(as_text(task["task_id"]))
        civic_rows = sorted(civic_rows, key=lambda row: (street_value(row), civic_sort_value(row), as_text(row.get("access_id"))))
        task_geoms = [geom for geom in geoms if geom is not None and not getattr(geom, "is_empty", True)]
        if task_geom is None and task_geoms:
            task_geom = _shapely.union_all(task_geoms)
        all_streets = unique_texts([street_value(row) for row in civic_rows])
        validated_heading_rows = [row for row in civic_rows if civic_validated_for_heading(row)]
        heading_streets = unique_texts([street_value(row) for row in validated_heading_rows], MAX_STREETS_PER_TASK)
        unvalidated_streets = unique_texts(
            [street for street in all_streets if street and street not in set(heading_streets)],
            MAX_STREETS_PER_TASK,
        )
        heading_source = "validated_civics" if heading_streets else "no_validated_civic_heading"
        streets = heading_streets
        current_sections = current_sections_for_rows(civic_rows)
        street_register_sections = street_register_sections_for_rows(civic_rows)
        suggested = as_text(task.get("suggested_section_number"))
        if not suggested and len(street_register_sections) == 1:
            suggested = street_register_sections[0]
        competing = unique_texts(task.get("competing_sections") or [])
        for section in current_sections:
            if section and section not in competing and section != suggested:
                competing.append(section)
        for row in civic_rows:
            for section in parse_competing_sections(row.get("competing_sections")):
                if section and section not in competing and section != suggested:
                    competing.append(section)
        evidence_rows = street_register_evidence_for_civic_task(task_id, civic_rows, suggested, competing)
        direct_compatible_count = sum(
            1 for row in evidence_rows if row.get("compatibility_with_task") == "direct_compatible_rule"
        )
        has_multiple_rules = len(street_register_sections) > 1 or len(street_rules_for_rows(civic_rows)) > 1
        representative_cells = unique_texts([row.get("census_cell_id") for row in civic_rows], 12)
        civic_min, civic_max = civic_min_max(civic_rows)
        nearby_rows = (
            deterministic_context(task_geom)
            if task.get("priority") in {"high", "medium"} or len(civic_rows) >= 6
            else []
        )
        street_match_status = "no_match"
        if direct_compatible_count:
            street_match_status = "direct_match"
        elif len(street_register_sections) > 1:
            street_match_status = "multiple_sections"
        elif evidence_rows:
            street_match_status = "same_street_match"
        interval_count = sum(1 for row in evidence_rows if as_text(row.get("civic_from")) or as_text(row.get("civic_to")))
        parity_mix = parity_mix_for_rows(civic_rows)
        coordinate_flags = Counter(coordinate_quality_flag(row) for row in civic_rows)
        coordinate_suspect_count = sum(count for flag, count in coordinate_flags.items() if flag != "ok")
        exclude_candidate_count = sum(1 for row in civic_rows if exclude_from_geometry_candidate(row))
        status_values = {coordinate_status(row) for row in civic_rows}
        task_label_status = "coordinate_outlier" if "coordinate_outlier" in status_values else "ok"
        if len(all_streets) > 1 and task_label_status == "ok":
            task_label_status = "multi_street_task"
        display_title_is_representative = len(heading_streets) != 1 or len(all_streets) > 1
        range_label = f"{civic_min}-{civic_max}" if civic_min != "" and civic_max != "" else f"{len(civic_rows)} civici"
        parity_label = "/".join(key for key in ["even", "odd", "snc"] if parity_mix.get(key))
        suffix = f" ({parity_label})" if parity_label else ""
        if len(heading_streets) > 1:
            task["title"] = f"Gruppo civici validati multi-via - {len(heading_streets)} odonimi validati, {len(civic_rows)} civici"
        elif heading_streets:
            task["title"] = f"{streets[0]} - civici {range_label}{suffix}"
        elif len(all_streets) > 1:
            task["title"] = f"Civici da validare - {len(all_streets)} odonimi, {len(civic_rows)} civici"
        else:
            task["title"] = f"Civici da validare - {len(civic_rows)} civici"
        street_register_context_streets = unique_texts(
            [row.get("street_name_normalised") for row in street_rules_for_rows(civic_rows)],
            MAX_STREETS_PER_TASK,
        )
        task.update(
            {
                "task_id": task_id,
                "competing_sections": competing,
                "involved_streets": all_streets,
                "street_name_normalised": heading_streets[0] if len(heading_streets) == 1 else "",
                "is_multi_street_task": len(all_streets) > 1,
                "street_count": len(all_streets),
                "heading_source": heading_source,
                "heading_streets": heading_streets,
                "unvalidated_heading_streets": unvalidated_streets,
                "street_register_context_streets": street_register_context_streets,
                "validated_civic_count": len(validated_heading_rows),
                "unvalidated_civic_count": max(0, len(civic_rows) - len(validated_heading_rows)),
                "representative_streets": all_streets[:MAX_STREETS_PER_TASK],
                "display_title_is_representative": display_title_is_representative,
                "civic_interval_count": interval_count,
                "has_parity_subset": bool(parity_mix.get("even") and parity_mix.get("odd")),
                "has_snc_subset": bool(parity_mix.get("snc")),
                "candidate_section_count": len(set(competing) | set(street_register_sections) | set(current_sections)),
                "coordinate_quality_flags": dict(sorted(coordinate_flags.items())),
                "coordinate_suspect_count": coordinate_suspect_count,
                "exclude_from_geometry_candidate_count": exclude_candidate_count,
                "has_coordinate_suspect": coordinate_suspect_count > 0,
                "label_integrity_status": task_label_status,
                "label_integrity_notes": (
                    "Il titolo usa solo civici con coordinate affidabili; gli odonimi non validati restano nella tab Civics e nei popup ANNCSU."
                    if heading_streets
                    else "Nessun civico con coordinate affidabili disponibile per costruire il titolo; usare la tab Civics, il contesto-via e lo stradario prima di decidere."
                ),
                "civic_count": len(civic_rows) if civic_rows else as_int(task.get("civic_count")),
                "civic_min": civic_min,
                "civic_max": civic_max,
                "civic_values_sample": civic_values_sample(civic_rows),
                "parity_mix": parity_mix,
                "snc_count": snc_count_for_rows(civic_rows),
                "current_assigned_sections": current_sections,
                "suggested_section_number": suggested,
                "street_register_sections": street_register_sections,
                "street_register_rule_count": len(street_rules_for_rows(civic_rows)),
                "has_direct_street_register_rule": direct_compatible_count > 0,
                "has_multiple_street_register_rules": has_multiple_rules,
                "has_no_street_register_rule": len(street_rules_for_rows(civic_rows)) == 0,
                "representative_census_cells": representative_cells,
                "representative_access_ids": unique_texts([row.get("access_id") for row in civic_rows], 20),
                "map_focus_bbox": map_bbox_for_geometries(gpd, task_geoms) if task_geoms else task.get("map_focus_bbox", []),
                "civic_range_summary": civic_range_summary(civic_rows),
                "evidence_strength": task.get("evidence_strength")
                or evidence_strength_for_task(
                    direct_rule_count=direct_compatible_count,
                    street_rule_count=len(evidence_rows),
                    dominant_share=0.0,
                    competing_count=len(competing),
                ),
                "street_register_match_status": street_match_status,
                "has_street_register_evidence": bool(evidence_rows),
                "has_multiple_candidate_sections": len(set(competing) | set(street_register_sections)) > 1,
                "has_no_street_register_match": not bool(evidence_rows),
                "source_files": task.get("source_files") or [],
            }
        )
        civic_review_tasks.append(task)
        civic_task_civics[task_id] = [civic_record(row) for row in civic_rows[:MAX_CIVICS_PER_TASK_PAYLOAD]]
        if len(civic_rows) > MAX_CIVICS_PER_TASK_PAYLOAD:
            task["notes"] = (as_text(task.get("notes")) + f" Civics payload limited to {MAX_CIVICS_PER_TASK_PAYLOAD} rows.").strip()
        civic_task_evidence[task_id] = evidence_rows
        civic_nearby_deterministic_by_task[task_id] = nearby_rows
        civic_task_candidate_sections[task_id] = candidate_sections_for_task(task, civic_rows, evidence_rows, nearby_rows, section_counts)
        for row in civic_rows:
            access_id = as_text(row.get("access_id"))
            if access_id:
                point_task_by_access[access_id] = task_id
        for cell_id in representative_cells:
            civic_cell_task_map[cell_id].append(task_id)
        for section in unique_texts([suggested] + competing + current_sections):
            civic_section_task_map[section].append(task_id)

    for _idx, row in cells.iterrows():
        method = as_text(row.get("assignment_method"))
        if method not in {"census_cell_conflict", "no_assigned_civics"}:
            continue
        cell_id = as_text(row.get("census_cell_id"))
        case_type = method
        case = case_base(f"cell:{cell_id}", case_type)
        case.update(
            {
                "census_cell_id": cell_id,
                "current_assignment_method": method,
                "current_assigned_section": as_text(row.get("assigned_section_number")),
                "suggested_section_number": as_text(row.get("suggested_section_number")),
                "competing_sections": as_text(row.get("competing_sections")),
                "dominant_section_share": as_float(row.get("dominant_section_share")),
                "total_civics": as_int(row.get("total_civics")),
                "deterministic_civics": as_int(row.get("deterministic_civics")),
                "spatially_resolved_civics": as_int(row.get("spatially_resolved_civics")),
                "review_civics": as_int(row.get("review_civics")),
                "geometry_confidence": as_text(row.get("assignment_confidence")),
                "needs_manual_review": as_bool(row.get("needs_manual_review")),
                "priority": priority_for_cell(row.to_dict()),
                "problem_summary": "No dominant electoral section reaches the assignment threshold"
                if method == "census_cell_conflict"
                else "No assigned ANNCSU civic evidence supports this census cell",
                "notes": as_text(row.get("notes")),
            }
        )
        add_case(case, civics_by_cell.get(cell_id, []))

    low_metrics = [row for row in metrics if as_text(row.get("geometry_confidence")) == "low"]
    for row in low_metrics:
        section = as_text(row.get("section_number"))
        case = case_base(f"section-low-confidence:{section}", "low_confidence_section")
        case.update(
            {
                "current_assignment_method": "v3_section_metric",
                "current_assigned_section": section,
                "suggested_section_number": section,
                "total_civics": as_int(row.get("total_civics")),
                "deterministic_civics": as_int(row.get("deterministic_civics")),
                "spatially_resolved_civics": as_int(row.get("spatially_resolved_civics")),
                "review_civics": as_int(row.get("review_civics_inside")),
                "geometry_confidence": as_text(row.get("geometry_confidence")),
                "needs_manual_review": as_bool(row.get("needs_manual_review")),
                "priority": "high" if as_int(row.get("conflict_cells_count")) >= 2 else "medium",
                "problem_summary": "V3 section has low geometry confidence or sparse supporting evidence",
                "notes": as_text(row.get("notes")),
            }
        )
        add_case(case, [r for r in joined_records if as_text(r.get("section_number")) == section])

    for row in boundary_rows:
        access_id = as_text(row.get("access_id"))
        civic = civics_by_access.get(access_id, row)
        distance = as_float(row.get("distance_to_candidate_boundary_m"), 9999)
        case = case_base(f"boundary:{access_id}", "boundary_uncertainty_point")
        case.update(
            {
                "suggested_section_number": as_text(row.get("nearest_candidate_section")),
                "competing_sections": as_text(civic.get("competing_sections")),
                "total_civics": 1,
                "review_civics": 1,
                "priority": "high" if distance <= 25 else "medium" if distance <= 50 else "low",
                "problem_summary": "Remaining review point lies near a candidate V2 boundary",
                "notes": as_text(row.get("notes") or civic.get("assignment_notes")),
            }
        )
        add_case(case, [civic])

    boundary_access_ids = set(boundary_by_access)
    for row in joined_records:
        access_id = as_text(row.get("access_id"))
        if not as_bool(row.get("human_review_required")) or access_id in boundary_access_ids:
            continue
        case = case_base(f"remaining:{access_id}", "remaining_review_point")
        case.update(
            {
                "census_cell_id": as_text(row.get("census_cell_id")),
                "current_assignment_method": as_text(row.get("assignment_method")),
                "current_assigned_section": as_text(row.get("section_number")),
                "suggested_section_number": "",
                "competing_sections": as_text(row.get("competing_sections")),
                "total_civics": 1,
                "review_civics": 1,
                "priority": "medium",
                "problem_summary": as_text(row.get("problem_type") or "Remaining ANNCSU civic review point"),
                "notes": as_text(row.get("assignment_notes") or row.get("notes")),
            }
        )
        add_case(case, [row])

    source_common = [
        relpath(CELLS_GPKG),
        relpath(QGIS_GPKG),
        relpath(CIVICS_V2_CSV),
        relpath(REVIEW_QUEUE_CSV),
        relpath(STREET_RULES_CSV),
    ]

    for _idx, row in cells.iterrows():
        method = as_text(row.get("assignment_method"))
        if method not in {"census_cell_conflict", "no_assigned_civics"}:
            continue
        cell_id = as_text(row.get("census_cell_id"))
        civic_rows = civics_by_cell.get(cell_id, [])
        suggested = as_text(row.get("suggested_section_number"))
        competing_counts = parse_section_counts(row.get("competing_sections"))
        competing = sorted(competing_counts, key=section_sort_key)
        task_type = "census_cell_conflict" if method == "census_cell_conflict" else "no_assigned_civics_cell"
        task_id = f"task:cell:{slugify(method)}:{cell_id}"
        title_method = "Census cell conflict" if method == "census_cell_conflict" else "No assigned-civic census cell"
        why = (
            "The cell has assigned civic evidence split across multiple sections and no dominant section reaches the V3 threshold."
            if method == "census_cell_conflict"
            else "The cell contributes to the V3 review surface but has no assigned civic evidence strong enough for automatic section assignment."
        )
        add_task(
            {
                "task_id": task_id,
                "task_type": task_type,
                "priority": priority_for_cell(row.to_dict()),
                "title": f"{title_method} {cell_id}",
                "short_description": f"{as_int(row.get('total_civics'))} civics; suggested section {suggested or 'none'}",
                "why_needs_review": why,
                "suggested_section_number": suggested,
                "competing_sections": competing,
                "dominant_section_share": as_float(row.get("dominant_section_share")),
                "census_cell_id": cell_id,
                "suggested_action": "Inspect census cell, street-register rules, and nearby deterministic points before deciding whether it can support a section.",
                "unresolved_reason": method,
                "source_files": source_common,
                "notes": as_text(row.get("notes")),
            },
            civic_rows,
            [row.geometry],
            section_counts=competing_counts,
            task_geom=row.geometry,
        )

    v3_by_section = {as_text(row.get("section_number")): row for _idx, row in v3.iterrows()}
    for row in metrics:
        section = as_text(row.get("section_number"))
        if not section or not as_bool(row.get("needs_manual_review")):
            continue
        confidence = as_text(row.get("geometry_confidence"))
        task_type = "section_low_confidence" if confidence == "low" else "section_needs_manual_review"
        task_id = f"task:section:{slugify(task_type)}:{section}"
        civic_rows = [record for record in joined_records if as_text(record.get("section_number")) == section]
        v3_row = v3_by_section.get(section)
        geoms = [v3_row.geometry] if v3_row is not None else []
        conflict_cells = as_int(row.get("conflict_cells_count"))
        no_evidence_cells = as_int(row.get("no_evidence_cells_count"))
        reason = (
            "V3 metrics mark this candidate section as low confidence."
            if task_type == "section_low_confidence"
            else "V3 metrics mark this candidate section as needing manual review even though confidence is not low."
        )
        add_task(
            {
                "task_id": task_id,
                "task_type": task_type,
                "priority": "high" if confidence == "low" or conflict_cells >= 2 else "medium",
                "title": f"Section {section} needs manual geometry review",
                "short_description": f"{confidence or 'unknown'} confidence; {conflict_cells} conflict cells; {no_evidence_cells} no-evidence cells",
                "why_needs_review": reason,
                "suggested_section_number": section,
                "competing_sections": [],
                "dominant_section_share": "",
                "census_cell_id": "",
                "suggested_action": "Review V3 shape in QGIS against street-register evidence and surrounding deterministic civics.",
                "unresolved_reason": f"geometry_confidence_{confidence or 'unknown'}",
                "source_files": [relpath(V3_GPKG), relpath(V3_METRICS_CSV), relpath(QGIS_GPKG), relpath(STREET_RULES_CSV)],
                "notes": as_text(row.get("notes")),
            },
            civic_rows,
            geoms,
            section_counts={section: len(civic_rows)},
            task_geom=geoms[0] if geoms else None,
        )

    boundary_groups: dict[tuple[str, str, str], list[dict[str, Any]]] = defaultdict(list)
    for row in boundary_rows:
        access_id = as_text(row.get("access_id"))
        civic = dict(civics_by_access.get(access_id, {}))
        civic.update(
            {
                "access_id": access_id,
                "ODONIMO": as_text(civic.get("ODONIMO") or row.get("odonimo_raw")),
                "CIVICO": as_text(civic.get("CIVICO") or row.get("civico")),
                "ESPONENTE": as_text(civic.get("ESPONENTE") or row.get("esponente")),
                "nearest_candidate_section": as_text(row.get("nearest_candidate_section")),
                "distance_to_candidate_boundary_m": as_text(row.get("distance_to_candidate_boundary_m")),
                "problem_type": as_text(row.get("problem_type")),
                "notes": as_text(row.get("notes")),
            }
        )
        key = (
            street_value(civic),
            as_text(row.get("problem_type")),
            as_text(row.get("nearest_candidate_section")),
        )
        boundary_groups[key].append(civic)

    for (street, problem, nearest_section), rows in boundary_groups.items():
        competing = []
        for civic in rows:
            for section in parse_competing_sections(civic.get("competing_sections")):
                if section not in competing:
                    competing.append(section)
        if nearest_section and nearest_section not in competing:
            competing = [nearest_section, *competing]
        distances = [as_float(row.get("distance_to_candidate_boundary_m"), 9999) for row in rows]
        min_distance = min(distances) if distances else None
        task_id = f"task:boundary:{slugify(street)}:{slugify(nearest_section)}:{slugify(problem)}"
        add_task(
            {
                "task_id": task_id,
                "task_type": "boundary_uncertainty_cluster",
                "priority": priority_for_group(len(rows), min_distance_m=min_distance, competing_count=len(competing)),
                "title": f"Boundary uncertainty near section {nearest_section or 'unknown'}",
                "short_description": f"{len(rows)} civics on {street or 'unknown street'} within the boundary uncertainty review set",
                "why_needs_review": "These civics are close to candidate boundaries or V2 boundary uncertainty points and should not be assigned by proximity alone.",
                "suggested_section_number": nearest_section,
                "competing_sections": competing,
                "dominant_section_share": "",
                "census_cell_id": "",
                "suggested_action": "Inspect the local street-register rule, nearby deterministic civics, and QGIS boundary context before deciding.",
                "unresolved_reason": problem or "boundary_uncertainty",
                "source_files": [relpath(BOUNDARY_UNCERTAINTY_CSV), relpath(CIVICS_V2_CSV), relpath(QGIS_GPKG), relpath(STREET_RULES_CSV)],
                "notes": f"Closest point is {round(min_distance, 2) if min_distance is not None else 'unknown'} m from a candidate boundary.",
            },
            rows,
            [row.get("geometry") for row in rows],
        )

    unresolved_groups: dict[tuple[str, str, str, str], list[dict[str, Any]]] = defaultdict(list)
    for row in joined_records:
        access_id = as_text(row.get("access_id"))
        if not as_bool(row.get("human_review_required")) or access_id in boundary_access_ids:
            continue
        key = (
            street_value(row),
            as_text(row.get("problem_type") or row.get("assignment_method")),
            as_text(row.get("section_number")),
            as_text(row.get("competing_sections")),
        )
        unresolved_groups[key].append(row)

    for (street, problem, current_section, competing_raw), rows in unresolved_groups.items():
        competing = parse_competing_sections(competing_raw)
        task_id = f"task:unresolved:{slugify(street)}:{slugify(current_section or 'none')}:{slugify(problem)}"
        add_task(
            {
                "task_id": task_id,
                "task_type": "unresolved_civic_group",
                "priority": priority_for_group(len(rows), competing_count=len(competing)),
                "title": f"Unresolved civics on {street or 'unknown street'}",
                "short_description": f"{len(rows)} civics require review; current section {current_section or 'none'}",
                "why_needs_review": "The ANNCSU civic assignment pipeline left this street/civic group in manual review, usually because the street rule is absent, ambiguous, or incompatible.",
                "suggested_section_number": current_section,
                "competing_sections": competing,
                "dominant_section_share": "",
                "census_cell_id": "",
                "suggested_action": "Use the street-register evidence and nearby deterministic points to confirm, reassign, or keep the group unresolved.",
                "unresolved_reason": problem or "remaining_review",
                "source_files": [relpath(CIVICS_V2_CSV), relpath(REVIEW_QUEUE_CSV), relpath(STREET_RULES_CSV)],
                "notes": "",
            },
            rows,
            [row.get("geometry") for row in rows],
            section_counts={current_section: len(rows)} if current_section else None,
        )

    civic_source_common = [
        relpath(CIVICS_V2_CSV),
        relpath(REVIEW_QUEUE_CSV),
        relpath(STREET_RULES_CSV),
        relpath(CROSSWALK_CSV),
    ]
    civic_review_note = (
        "Census cells are geometric context only. The primary decision concerns civics, civic groups, "
        "or electoral street-register rules and can feed a future auditable V4 only after human review."
    )

    for (street, problem, nearest_section), rows in boundary_groups.items():
        competing = []
        for civic in rows:
            for section in parse_competing_sections(civic.get("competing_sections")):
                if section not in competing:
                    competing.append(section)
        if nearest_section and nearest_section not in competing:
            competing = [nearest_section, *competing]
        distances = [as_float(row.get("distance_to_candidate_boundary_m"), 9999) for row in rows]
        min_distance = min(distances) if distances else None
        add_civic_task(
            {
                "task_id": f"civic-task:boundary:{slugify(street)}:{slugify(nearest_section)}:{slugify(problem)}",
                "task_type": "boundary_civic_cluster",
                "priority": priority_for_group(len(rows), min_distance_m=min_distance, competing_count=len(competing)),
                "title": f"Boundary civic cluster on {street or 'unknown street'}",
                "short_description": f"{len(rows)} civics near candidate section {nearest_section or 'unknown'} boundary context",
                "why_needs_review": "These civics are close to candidate boundaries, but proximity alone is not a valid assignment criterion.",
                "suggested_section_number": nearest_section,
                "competing_sections": competing,
                "suggested_action": "Select the civics, inspect the street-register rule and QGIS context, then assign only the reviewed group or keep it unresolved.",
                "unresolved_reason": problem or "boundary_uncertainty",
                "source_files": [relpath(BOUNDARY_UNCERTAINTY_CSV), *civic_source_common, relpath(QGIS_GPKG)],
                "notes": f"{civic_review_note} Closest point is {round(min_distance, 2) if min_distance is not None else 'unknown'} m from a candidate boundary.",
            },
            rows,
            [row.get("geometry") for row in rows],
        )

    for (street, problem, current_section, competing_raw), rows in unresolved_groups.items():
        competing = parse_competing_sections(competing_raw)
        task_type = civic_task_type_for_rows(rows)
        civic_min, civic_max = civic_min_max(rows)
        range_label = f"{civic_min}-{civic_max}" if civic_min != "" and civic_max != "" else "unknown range"
        add_civic_task(
            {
                "task_id": f"civic-task:{slugify(task_type)}:{slugify(street)}:{slugify(current_section or 'none')}:{slugify(problem)}:{slugify(competing_raw)}",
                "task_type": task_type,
                "priority": priority_for_group(len(rows), competing_count=len(competing)),
                "title": f"{task_type.replace('_', ' ').title()} on {street or 'unknown street'}",
                "short_description": f"{len(rows)} civics, range {range_label}, current section {current_section or 'none'}",
                "why_needs_review": "The unresolved unit is a group of civics, not a census cell. Review should select civics, a range, a parity subset, or SNC records.",
                "suggested_section_number": current_section,
                "competing_sections": competing,
                "suggested_action": "Use the civics table and street-register evidence to choose an auditable assignment scope or keep the task unresolved.",
                "unresolved_reason": problem or "remaining_review",
                "source_files": civic_source_common,
                "notes": civic_review_note,
            },
            rows,
            [row.get("geometry") for row in rows],
            section_counts={current_section: len(rows)} if current_section else None,
        )

    for _idx, row in cells.iterrows():
        method = as_text(row.get("assignment_method"))
        if method not in {"census_cell_conflict", "no_assigned_civics"}:
            continue
        cell_id = as_text(row.get("census_cell_id"))
        if not cell_id or civic_cell_task_map.get(cell_id):
            continue
        civic_rows = civics_by_cell.get(cell_id, [])
        suggested = as_text(row.get("suggested_section_number"))
        competing_counts = parse_section_counts(row.get("competing_sections"))
        add_civic_task(
            {
                "task_id": f"civic-task:census-cell-context:{cell_id}",
                "task_type": "census_cell_context",
                "priority": priority_for_cell(row.to_dict()),
                "title": f"Census cell context {cell_id}",
                "short_description": f"{as_int(row.get('total_civics'))} civics in diagnostic census-cell context",
                "why_needs_review": "This is retained only as geometric diagnostic context where no smaller civic task was generated.",
                "suggested_section_number": suggested,
                "competing_sections": sorted(competing_counts, key=section_sort_key),
                "suggested_action": "Use this only to orient QGIS review; do not assign sections by census-cell geometry alone.",
                "unresolved_reason": method,
                "source_files": [relpath(CELLS_GPKG), *civic_source_common],
                "notes": "Le celle censuarie sono supporto geometrico. La decisione primaria riguarda civici, gruppi di civici o regole dello stradario.",
            },
            civic_rows,
            [row.geometry],
            section_counts=competing_counts,
            task_geom=row.geometry,
        )

    coordinate_groups: dict[tuple[str, str, str], list[dict[str, Any]]] = defaultdict(list)
    for row in joined_records:
        access_id = as_text(row.get("access_id"))
        if coordinate_quality_flag(row) == "ok" or access_id in point_task_by_access:
            continue
        key = (street_value(row), coordinate_quality_flag(row), as_text(row.get("section_number")))
        coordinate_groups[key].append(row)

    for (street, flag, current_section), rows in coordinate_groups.items():
        task_reason = "coordinate_quality_review"
        reasons = unique_texts([row.get("coordinate_suspect_reason") for row in rows], 6)
        add_civic_task(
            {
                "task_id": f"civic-task:coordinate-quality:{slugify(street)}:{slugify(flag)}:{slugify(current_section or 'none')}",
                "task_type": "coordinate_quality_review",
                "priority": "high" if flag in {"outside_boundary", "missing_coordinate", "possible_xy_swap", "implausible_coordinate", "street_context_mismatch"} else "medium",
                "title": f"Coordinate suspect - {street or 'unknown street'}",
                "short_description": f"{len(rows)} civics with coordinate quality flag {flag}",
                "why_needs_review": "These ANNCSU civics may be correct as addresses but unreliable as geometric points. The section decision remains grounded in the electoral street register.",
                "suggested_section_number": current_section,
                "competing_sections": parse_competing_sections(";".join(as_text(row.get("competing_sections")) for row in rows)),
                "suggested_action": "Review the source coordinate separately from the street-register section decision. Exclude from future geometry or record a manual coordinate override only with traced evidence.",
                "unresolved_reason": task_reason,
                "source_files": [relpath(COORDINATE_SUSPECT_CSV), relpath(CIVICS_V2_CSV), relpath(STREET_RULES_CSV)],
                "notes": "Coordinate suspect does not imply a wrong civic label or wrong section. Reasons: " + "; ".join(reasons),
            },
            rows,
            [row.get("geometry") for row in rows],
            section_counts={current_section: len(rows)} if current_section else None,
        )

    priority_order = {"high": 0, "medium": 1, "low": 2}
    strength_order = {"strong": 0, "medium": 1, "weak": 2, "none": 3}
    review_tasks.sort(
        key=lambda item: (
            priority_order.get(as_text(item.get("priority")), 9),
            strength_order.get(as_text(item.get("evidence_strength")), 9),
            -as_int(item.get("civic_count")),
            as_text(item.get("task_type")),
            as_text(item.get("task_id")),
        )
    )
    civic_review_tasks.sort(
        key=lambda item: (
            priority_order.get(as_text(item.get("priority")), 9),
            strength_order.get(as_text(item.get("evidence_strength")), 9),
            0 if as_bool(item.get("has_direct_street_register_rule")) else 1,
            -as_int(item.get("civic_count")),
            as_text(item.get("street_name_normalised") or ",".join(item.get("involved_streets") or [])),
            as_text(item.get("task_id")),
        )
    )

    review_cell_ids = {case["census_cell_id"] for case in cases if case.get("census_cell_id")}
    task_sections = set(section_task_map)
    low_sections = {case["current_assigned_section"] for case in cases if case["case_type"] == "low_confidence_section"} | task_sections
    review_cells = cells[
        cells["census_cell_id"].astype(str).isin(review_cell_ids)
        | cells["assigned_section_number"].astype(str).isin(low_sections)
    ].copy()
    cell_case_map: dict[str, list[str]] = defaultdict(list)
    for case in cases:
        if case.get("census_cell_id"):
            cell_case_map[case["census_cell_id"]].append(case["review_id"])
    review_cells["review_case_ids"] = review_cells["census_cell_id"].astype(str).map(lambda value: ";".join(cell_case_map.get(value, [])))
    review_cells["review_task_ids"] = review_cells.apply(
        lambda row: ";".join(
            unique_texts(
                civic_cell_task_map.get(as_text(row.get("census_cell_id")), [])
                + civic_section_task_map.get(as_text(row.get("assigned_section_number")), [])
                + civic_section_task_map.get(as_text(row.get("suggested_section_number")), [])
                + cell_task_map.get(as_text(row.get("census_cell_id")), [])
                + section_task_map.get(as_text(row.get("assigned_section_number")), [])
                + section_task_map.get(as_text(row.get("suggested_section_number")), [])
            )
        ),
        axis=1,
    )

    review_points = joined[joined["human_review_required"] == True].copy()
    review_points["point_type"] = review_points["access_id"].astype(str).map(
        lambda access_id: "boundary_uncertainty_point" if access_id in boundary_access_ids else "remaining_review_point"
    )
    review_points["review_id"] = review_points.apply(
        lambda row: ("boundary:" if row["point_type"] == "boundary_uncertainty_point" else "remaining:") + as_text(row["access_id"]),
        axis=1,
    )
    review_points["nearest_candidate_section"] = review_points["access_id"].astype(str).map(
        lambda access_id: as_text(boundary_by_access.get(access_id, {}).get("nearest_candidate_section"))
    )
    review_points["distance_to_candidate_boundary_m"] = review_points["access_id"].astype(str).map(
        lambda access_id: as_text(boundary_by_access.get(access_id, {}).get("distance_to_candidate_boundary_m"))
    )
    review_points["task_id"] = review_points["access_id"].astype(str).map(lambda access_id: point_task_by_access.get(access_id, ""))
    review_points = enrich_point_label_columns(review_points, civics_by_access)

    deterministic = deterministic_points.copy().sort_values("access_id")
    if len(deterministic) > MAX_DETERMINISTIC_SAMPLE:
        step = len(deterministic) / MAX_DETERMINISTIC_SAMPLE
        sample_indexes = sorted({int(i * step) for i in range(MAX_DETERMINISTIC_SAMPLE)})
        deterministic = deterministic.iloc[sample_indexes].copy()
    spatially_resolved_points = enrich_point_label_columns(spatially_resolved_points, civics_by_access)
    deterministic = enrich_point_label_columns(deterministic, civics_by_access)
    coordinate_suspect_points = joined[joined["coordinate_quality_flag"].astype(str) != "ok"].copy()
    coordinate_suspect_points["task_id"] = coordinate_suspect_points["access_id"].astype(str).map(
        lambda access_id: point_task_by_access.get(access_id, "")
    )
    coordinate_suspect_points = enrich_point_label_columns(coordinate_suspect_points, civics_by_access)
    coordinate_suspect_records = [
        civic_record(row.to_dict()) for _idx, row in coordinate_suspect_points.sort_values(["ODONIMO", "CIVICO", "access_id"]).iterrows()
    ]
    coordinate_suspect_geo = coordinate_suspect_points[
        coordinate_suspect_points.geometry.notna() & ~coordinate_suspect_points.geometry.is_empty
    ].copy()
    coordinate_geocode_candidates_by_access: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in read_csv_rows(COORDINATE_GEOCODE_CANDIDATES_CSV):
        access_id = as_text(row.get("access_id"))
        if not access_id:
            continue
        coordinate_geocode_candidates_by_access[access_id].append(
            {
                "provider": as_text(row.get("provider")),
                "query": as_text(row.get("query")),
                "query_variant": as_text(row.get("query_variant")),
                "candidate_rank": as_text(row.get("candidate_rank")),
                "candidate_lon": as_text(row.get("candidate_lon")),
                "candidate_lat": as_text(row.get("candidate_lat")),
                "candidate_display_name": as_text(row.get("candidate_display_name")),
                "candidate_type": as_text(row.get("candidate_type")),
                "candidate_has_house_number": as_text(row.get("candidate_has_house_number")),
                "within_lamezia_bbox": as_text(row.get("within_lamezia_bbox")),
                "distance_from_source_m": as_text(row.get("distance_from_source_m")),
                "provider_confidence": as_text(row.get("provider_confidence")),
                "candidate_status": as_text(row.get("candidate_status")),
            }
        )
    coordinate_local_anchor_candidates_by_access: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in read_csv_rows(COORDINATE_LOCAL_ANCHOR_CANDIDATES_CSV):
        access_id = as_text(row.get("access_id"))
        if not access_id:
            continue
        coordinate_local_anchor_candidates_by_access[access_id].append(
            {
                "provider": as_text(row.get("provider")),
                "candidate_method": as_text(row.get("candidate_method")),
                "candidate_status": as_text(row.get("candidate_status")),
                "candidate_lon": as_text(row.get("candidate_lon")),
                "candidate_lat": as_text(row.get("candidate_lat")),
                "candidate_confidence": as_text(row.get("candidate_confidence")),
                "candidate_explanation": as_text(row.get("candidate_explanation")),
                "distance_from_source_m": as_text(row.get("distance_from_source_m")),
                "anchor_count": as_text(row.get("anchor_count")),
                "numeric_anchor_count": as_text(row.get("numeric_anchor_count")),
                "nearest_anchor_distance_m": as_text(row.get("nearest_anchor_distance_m")),
            }
        )

    public_pdf_path = ""
    if RAW_STREET_REGISTER_PDF.exists() and RAW_STREET_REGISTER_PDF.stat().st_size <= 2_000_000:
        SOURCE_DIR.mkdir(parents=True, exist_ok=True)
        pdf_target = SOURCE_DIR / "Stradario_elettorale.pdf"
        shutil.copyfile(RAW_STREET_REGISTER_PDF, pdf_target)
        public_pdf_path = "./public/source/Stradario_elettorale.pdf"

    write_json(OUT_DIR / "review_cases.json", cases)
    write_json(OUT_DIR / "civics_by_case.json", case_civics)
    write_json(OUT_DIR / "street_rules_by_case.json", case_rules)
    write_json(OUT_DIR / "review_tasks.json", review_tasks)
    write_json(OUT_DIR / "civic_review_tasks.json", civic_review_tasks)
    write_json(OUT_DIR / "civics_by_task.json", civic_task_civics)
    write_json(OUT_DIR / "street_register_evidence_by_task.json", civic_task_evidence)
    write_json(OUT_DIR / "candidate_sections_by_task.json", civic_task_candidate_sections)
    write_json(OUT_DIR / "nearby_deterministic_by_task.json", civic_nearby_deterministic_by_task)
    write_json(OUT_DIR / "coordinate_suspect_points.json", coordinate_suspect_records)
    write_json(OUT_DIR / "coordinate_geocode_candidates_by_access.json", coordinate_geocode_candidates_by_access)
    write_json(OUT_DIR / "coordinate_local_anchor_candidates_by_access.json", coordinate_local_anchor_candidates_by_access)
    write_json(
        OUT_DIR / "review_summary.json",
        {
            "total_cases": len(cases),
            "total_review_tasks": len(review_tasks),
            "total_civic_review_tasks": len(civic_review_tasks),
            "review_tasks_by_type": dict(Counter(task["task_type"] for task in review_tasks)),
            "civic_review_tasks_by_type": dict(Counter(task["task_type"] for task in civic_review_tasks)),
            "civic_review_tasks_by_label_integrity_status": dict(Counter(task["label_integrity_status"] for task in civic_review_tasks)),
            "civic_review_tasks_by_heading_source": dict(Counter(as_text(task.get("heading_source")) or "unknown" for task in civic_review_tasks)),
            "civic_review_tasks_with_coordinate_suspects": sum(1 for task in civic_review_tasks if task.get("has_coordinate_suspect")),
            "coordinate_suspect_points": len(coordinate_suspect_records),
            "coordinate_suspects_by_flag": dict(Counter(row["coordinate_quality_flag"] for row in coordinate_suspect_records)),
            "coordinate_geocode_candidate_access_ids": len(coordinate_geocode_candidates_by_access),
            "coordinate_geocode_candidate_rows": sum(len(rows) for rows in coordinate_geocode_candidates_by_access.values()),
            "coordinate_geocode_candidate_statuses": dict(
                Counter(
                    as_text(row.get("candidate_status"))
                    for rows in coordinate_geocode_candidates_by_access.values()
                    for row in rows
                    if as_text(row.get("candidate_status"))
                )
            ),
            "coordinate_local_anchor_candidate_access_ids": len(coordinate_local_anchor_candidates_by_access),
            "coordinate_local_anchor_candidate_rows": sum(len(rows) for rows in coordinate_local_anchor_candidates_by_access.values()),
            "coordinate_local_anchor_candidate_statuses": dict(
                Counter(
                    as_text(row.get("candidate_status"))
                    for rows in coordinate_local_anchor_candidates_by_access.values()
                    for row in rows
                    if as_text(row.get("candidate_status"))
                )
            ),
            "coordinate_quality_report": relpath(QA_DIR / "anncsu_coordinate_quality_report_2025.md"),
            "coordinate_suspect_csv": relpath(COORDINATE_SUSPECT_CSV),
            "coordinate_geocode_candidates_csv": relpath(COORDINATE_GEOCODE_CANDIDATES_CSV)
            if COORDINATE_GEOCODE_CANDIDATES_CSV.exists()
            else "",
            "coordinate_local_anchor_candidates_csv": relpath(COORDINATE_LOCAL_ANCHOR_CANDIDATES_CSV)
            if COORDINATE_LOCAL_ANCHOR_CANDIDATES_CSV.exists()
            else "",
            "high_priority_review_tasks": sum(1 for task in review_tasks if task.get("priority") == "high"),
            "high_priority_civic_review_tasks": sum(1 for task in civic_review_tasks if task.get("priority") == "high"),
            "tasks_with_street_register_evidence": sum(1 for task in civic_review_tasks if task.get("has_street_register_evidence")),
            "tasks_without_street_register_match": sum(1 for task in civic_review_tasks if task.get("has_no_street_register_match")),
            "census_cell_conflict": sum(1 for case in cases if case["case_type"] == "census_cell_conflict"),
            "no_assigned_civics": sum(1 for case in cases if case["case_type"] == "no_assigned_civics"),
            "low_confidence_sections": len(low_metrics),
            "manual_review_sections": sum(1 for row in metrics if as_bool(row.get("needs_manual_review"))),
            "boundary_uncertainty_points": len(boundary_rows),
            "remaining_review_points": sum(1 for case in cases if case["case_type"] == "remaining_review_point"),
            "excluded_sections": ["78"],
            "excluded_section_notes": "Section 78 is excluded from candidate polygons as a special/hospital section.",
            "street_register_pdf": public_pdf_path,
            "decision_model_version": "v3-civic-first-local-review",
            "civic_first_scope": "Manual decisions are about civics, civic groups, civic ranges, parity/SNC subsets, or electoral street-register rules. Census cells are diagnostic geometry only.",
            "future_v4_note": "Exported decisions are inputs for a future auditable V4 after human review. This script does not generate V4 geometry.",
            "sections_involved": sorted(
                {
                    value
                    for case in cases
                    for value in [as_text(case.get("current_assigned_section")), as_text(case.get("suggested_section_number"))]
                    if value
                },
                key=lambda value: int(value) if value.isdigit() else 9999,
            ),
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "source_commit": git_commit(),
            "source_files": [
                relpath(CELLS_GPKG),
                relpath(V3_GPKG),
                relpath(QGIS_GPKG),
                relpath(CIVICS_V2_CSV),
                relpath(REVIEW_QUEUE_CSV),
                relpath(STREET_RULES_CSV),
                relpath(CROSSWALK_CSV),
                relpath(V3_METRICS_CSV),
                relpath(COORDINATE_SUSPECT_CSV),
                relpath(COORDINATE_GEOCODE_CANDIDATES_CSV) if COORDINATE_GEOCODE_CANDIDATES_CSV.exists() else "",
                relpath(COORDINATE_LOCAL_ANCHOR_CANDIDATES_CSV) if COORDINATE_LOCAL_ANCHOR_CANDIDATES_CSV.exists() else "",
            ],
            "notes": "Local review workbench data only. OSM is an optional visual basemap; census cells are support context; no V4 geometry is generated.",
        },
    )

    write_json(
        OUT_DIR / "review_cells.geojson",
        feature_collection(
            review_cells,
            [
                "census_cell_id",
                "assigned_section_number",
                "suggested_section_number",
                "total_civics",
                "deterministic_civics",
                "spatially_resolved_civics",
                "review_civics",
                "dominant_section_share",
                "competing_sections",
                "assignment_method",
                "assignment_confidence",
                "needs_manual_review",
                "review_case_ids",
                "review_task_ids",
                "notes",
            ],
            simplify_m=2,
        ),
    )
    write_json(
        OUT_DIR / "candidate_sections_v3.geojson",
        feature_collection(
            v3,
            [
                "section_number",
                "geometry_status",
                "candidate_geometry_method",
                "census_cells_used",
                "deterministic_civics_used",
                "spatially_resolved_civics_used",
                "review_civics_inside",
                "conflict_cells_count",
                "no_evidence_cells_count",
                "geometry_confidence",
                "needs_manual_review",
                "notes",
            ],
            simplify_m=5,
        ),
    )
    write_json(
        OUT_DIR / "candidate_sections_v2.geojson",
        feature_collection(
            v2,
            [
                "section_number",
                "geometry_status",
                "candidate_geometry_method",
                "polygon_count",
                "geometry_confidence",
                "needs_manual_review",
                "deterministic_points_used",
                "spatially_resolved_points_used",
                "total_points_used",
                "notes",
            ],
            simplify_m=8,
        ),
    )
    write_json(
        OUT_DIR / "review_points.geojson",
        point_collection(
            review_points,
            [
                "review_id",
                "point_type",
                "access_id",
                "task_id",
                "source_record_access_id",
                "anncsu_address_label",
                "map_popup_title",
                "odonimo_raw",
                "localita",
                "civico",
                "esponente",
                "ODONIMO",
                "CIVICO",
                "ESPONENTE",
                "source_coord_x",
                "source_coord_y",
                "source_coord_lon",
                "source_coord_lat",
                "section_number",
                "assignment_method",
                "assignment_confidence",
                "problem_type",
                "nearest_candidate_section",
                "distance_to_candidate_boundary_m",
                "competing_sections",
                "task_id",
                "label_integrity_status",
                "label_integrity_notes",
                "coordinate_quality_flag",
                "coordinate_suspect_reason",
                "nearest_validated_street_context",
                "nearest_validated_street_context_count",
                "distance_to_nearest_different_street_m",
                "suggested_coordinate_action",
                "exclude_from_geometry_candidate",
            ],
        ),
    )
    write_json(
        OUT_DIR / "spatially_resolved_points.geojson",
        point_collection(
            spatially_resolved_points,
            [
                "access_id",
                "source_record_access_id",
                "anncsu_address_label",
                "map_popup_title",
                "odonimo_raw",
                "localita",
                "civico",
                "esponente",
                "ODONIMO",
                "CIVICO",
                "ESPONENTE",
                "source_coord_x",
                "source_coord_y",
                "source_coord_lon",
                "source_coord_lat",
                "section_number",
                "assignment_method",
                "assignment_confidence",
                "label_integrity_status",
                "label_integrity_notes",
                "coordinate_quality_flag",
                "coordinate_suspect_reason",
                "nearest_validated_street_context",
                "nearest_validated_street_context_count",
                "distance_to_nearest_different_street_m",
                "suggested_coordinate_action",
                "exclude_from_geometry_candidate",
            ],
        ),
    )
    write_json(
        OUT_DIR / "deterministic_points_sample.geojson",
        point_collection(
            deterministic,
            [
                "access_id",
                "source_record_access_id",
                "anncsu_address_label",
                "map_popup_title",
                "odonimo_raw",
                "localita",
                "civico",
                "esponente",
                "ODONIMO",
                "CIVICO",
                "ESPONENTE",
                "source_coord_x",
                "source_coord_y",
                "source_coord_lon",
                "source_coord_lat",
                "section_number",
                "assignment_method",
                "assignment_confidence",
                "label_integrity_status",
                "label_integrity_notes",
                "coordinate_quality_flag",
                "coordinate_suspect_reason",
                "nearest_validated_street_context",
                "nearest_validated_street_context_count",
                "distance_to_nearest_different_street_m",
                "suggested_coordinate_action",
                "exclude_from_geometry_candidate",
            ],
        ),
    )
    write_json(
        OUT_DIR / "coordinate_suspect_points.geojson",
        point_collection(
            coordinate_suspect_geo,
            [
                "access_id",
                "task_id",
                "source_record_access_id",
                "anncsu_address_label",
                "map_popup_title",
                "odonimo_raw",
                "localita",
                "civico",
                "esponente",
                "ODONIMO",
                "CIVICO",
                "ESPONENTE",
                "source_coord_x",
                "source_coord_y",
                "source_coord_lon",
                "source_coord_lat",
                "section_number",
                "assignment_method",
                "assignment_confidence",
                "label_integrity_status",
                "label_integrity_notes",
                "coordinate_quality_flag",
                "coordinate_suspect_reason",
                "nearest_validated_street_context",
                "nearest_validated_street_context_count",
                "distance_to_nearest_different_street_m",
                "suggested_coordinate_action",
                "exclude_from_geometry_candidate",
            ],
        ),
    )

    print("electoral review workbench data")
    print(f"output_dir={relpath(OUT_DIR)}")
    print(f"review_cases={len(cases)}")
    print(f"review_tasks={len(review_tasks)}")
    print(f"civic_review_tasks={len(civic_review_tasks)}")
    print(f"review_cells={len(review_cells)}")
    print(f"review_points={len(review_points)}")
    print(f"coordinate_suspect_points={len(coordinate_suspect_records)}")
    print(f"coordinate_geocode_candidate_rows={sum(len(rows) for rows in coordinate_geocode_candidates_by_access.values())}")
    print(f"coordinate_local_anchor_candidate_rows={sum(len(rows) for rows in coordinate_local_anchor_candidates_by_access.values())}")
    print(f"deterministic_sample={len(deterministic)}")
    print(f"street_rules={len(rules)}")
    print(f"street_register_pdf={public_pdf_path or 'not copied'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
