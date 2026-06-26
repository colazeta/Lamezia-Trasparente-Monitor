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
    if simplify_m and out.crs and str(out.crs).upper() != "EPSG:4326":
        out["geometry"] = out.geometry.apply(lambda geom: shapely.make_valid(geom).simplify(simplify_m, preserve_topology=True))
    out = out.to_crs("EPSG:4326")
    keep = [col for col in columns if col in out.columns] + ["geometry"]
    out = out[keep].copy()
    return json.loads(out.to_json(drop_id=True))


def point_collection(gdf, columns: list[str]) -> dict[str, Any]:
    out = gdf.copy().to_crs("EPSG:4326")
    keep = [col for col in columns if col in out.columns] + ["geometry"]
    out = out[keep].copy()
    return json.loads(out.to_json(drop_id=True))


def civic_record(row: dict[str, Any]) -> dict[str, Any]:
    return {
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
        "coord_x": as_text(row.get("COORD_X_COMUNE") or row.get("coord_x")),
        "coord_y": as_text(row.get("COORD_Y_COMUNE") or row.get("coord_y")),
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
                cell_task_map.get(as_text(row.get("census_cell_id")), [])
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

    deterministic = deterministic_points.copy().sort_values("access_id")
    if len(deterministic) > MAX_DETERMINISTIC_SAMPLE:
        step = len(deterministic) / MAX_DETERMINISTIC_SAMPLE
        sample_indexes = sorted({int(i * step) for i in range(MAX_DETERMINISTIC_SAMPLE)})
        deterministic = deterministic.iloc[sample_indexes].copy()

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
    write_json(OUT_DIR / "civics_by_task.json", task_civics)
    write_json(OUT_DIR / "street_register_evidence_by_task.json", task_evidence)
    write_json(OUT_DIR / "candidate_sections_by_task.json", task_candidate_sections)
    write_json(OUT_DIR / "nearby_deterministic_by_task.json", nearby_deterministic_by_task)
    write_json(
        OUT_DIR / "review_summary.json",
        {
            "total_cases": len(cases),
            "total_review_tasks": len(review_tasks),
            "review_tasks_by_type": dict(Counter(task["task_type"] for task in review_tasks)),
            "high_priority_review_tasks": sum(1 for task in review_tasks if task.get("priority") == "high"),
            "tasks_with_street_register_evidence": sum(1 for task in review_tasks if task.get("has_street_register_evidence")),
            "tasks_without_street_register_match": sum(1 for task in review_tasks if task.get("has_no_street_register_match")),
            "census_cell_conflict": sum(1 for case in cases if case["case_type"] == "census_cell_conflict"),
            "no_assigned_civics": sum(1 for case in cases if case["case_type"] == "no_assigned_civics"),
            "low_confidence_sections": len(low_metrics),
            "manual_review_sections": sum(1 for row in metrics if as_bool(row.get("needs_manual_review"))),
            "boundary_uncertainty_points": len(boundary_rows),
            "remaining_review_points": sum(1 for case in cases if case["case_type"] == "remaining_review_point"),
            "excluded_sections": ["78"],
            "excluded_section_notes": "Section 78 is excluded from candidate polygons as a special/hospital section.",
            "street_register_pdf": public_pdf_path,
            "decision_model_version": "v2-task-oriented",
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
            ],
            "notes": "Local review workbench data only. OSM is an optional visual basemap; no V4 geometry is generated.",
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
                "ODONIMO",
                "CIVICO",
                "ESPONENTE",
                "section_number",
                "assignment_method",
                "assignment_confidence",
                "problem_type",
                "nearest_candidate_section",
                "distance_to_candidate_boundary_m",
                "competing_sections",
                "task_id",
            ],
        ),
    )
    write_json(
        OUT_DIR / "spatially_resolved_points.geojson",
        point_collection(
            spatially_resolved_points,
            ["access_id", "ODONIMO", "CIVICO", "ESPONENTE", "section_number", "assignment_method", "assignment_confidence"],
        ),
    )
    write_json(
        OUT_DIR / "deterministic_points_sample.geojson",
        point_collection(
            deterministic,
            ["access_id", "ODONIMO", "CIVICO", "ESPONENTE", "section_number", "assignment_method", "assignment_confidence"],
        ),
    )

    print("electoral review workbench data")
    print(f"output_dir={relpath(OUT_DIR)}")
    print(f"review_cases={len(cases)}")
    print(f"review_tasks={len(review_tasks)}")
    print(f"review_cells={len(review_cells)}")
    print(f"review_points={len(review_points)}")
    print(f"deterministic_sample={len(deterministic)}")
    print(f"street_rules={len(rules)}")
    print(f"street_register_pdf={public_pdf_path or 'not copied'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
