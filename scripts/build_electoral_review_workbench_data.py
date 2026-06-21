from __future__ import annotations

import json
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

MAX_DETERMINISTIC_SAMPLE = 3000
MAX_RULES_PER_CASE = 80


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
        "street_name_normalised": as_text(row.get("street_name_normalised")),
        "civico": as_text(row.get("CIVICO") or row.get("civico")),
        "esponente": as_text(row.get("ESPONENTE") or row.get("esponente")),
        "section_number": as_text(row.get("section_number")),
        "assignment_method": as_text(row.get("assignment_method")),
        "assignment_confidence": as_text(row.get("assignment_confidence")),
        "human_review_required": as_bool(row.get("human_review_required")),
        "rule_id": as_text(row.get("rule_id")),
        "coord_x": as_text(row.get("COORD_X_COMUNE") or row.get("coord_x")),
        "coord_y": as_text(row.get("COORD_Y_COMUNE") or row.get("coord_y")),
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

    review_cell_ids = {case["census_cell_id"] for case in cases if case.get("census_cell_id")}
    low_sections = {case["current_assigned_section"] for case in cases if case["case_type"] == "low_confidence_section"}
    review_cells = cells[
        cells["census_cell_id"].astype(str).isin(review_cell_ids)
        | cells["assigned_section_number"].astype(str).isin(low_sections)
    ].copy()
    cell_case_map: dict[str, list[str]] = defaultdict(list)
    for case in cases:
        if case.get("census_cell_id"):
            cell_case_map[case["census_cell_id"]].append(case["review_id"])
    review_cells["review_case_ids"] = review_cells["census_cell_id"].astype(str).map(lambda value: ";".join(cell_case_map.get(value, [])))

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

    deterministic = deterministic_points.copy().sort_values("access_id")
    if len(deterministic) > MAX_DETERMINISTIC_SAMPLE:
        step = len(deterministic) / MAX_DETERMINISTIC_SAMPLE
        sample_indexes = sorted({int(i * step) for i in range(MAX_DETERMINISTIC_SAMPLE)})
        deterministic = deterministic.iloc[sample_indexes].copy()

    write_json(OUT_DIR / "review_cases.json", cases)
    write_json(OUT_DIR / "civics_by_case.json", case_civics)
    write_json(OUT_DIR / "street_rules_by_case.json", case_rules)
    write_json(
        OUT_DIR / "review_summary.json",
        {
            "total_cases": len(cases),
            "census_cell_conflict": sum(1 for case in cases if case["case_type"] == "census_cell_conflict"),
            "no_assigned_civics": sum(1 for case in cases if case["case_type"] == "no_assigned_civics"),
            "low_confidence_sections": len(low_metrics),
            "manual_review_sections": sum(1 for row in metrics if as_bool(row.get("needs_manual_review"))),
            "boundary_uncertainty_points": len(boundary_rows),
            "remaining_review_points": sum(1 for case in cases if case["case_type"] == "remaining_review_point"),
            "excluded_sections": ["78"],
            "excluded_section_notes": "Section 78 is excluded from candidate polygons as a special/hospital section.",
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
            "notes": "Local review workbench data only. No V4 geometry is generated.",
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
    print(f"review_cells={len(review_cells)}")
    print(f"review_points={len(review_points)}")
    print(f"deterministic_sample={len(deterministic)}")
    print(f"street_rules={len(rules)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
