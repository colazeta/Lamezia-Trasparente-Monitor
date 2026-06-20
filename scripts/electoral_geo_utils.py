from __future__ import annotations

import csv
import math
import os
import sys
from pathlib import Path
from typing import Iterable


ROOT = Path(__file__).resolve().parents[1]
ELECTION_ID = "comunali_lamezia_2025"
RAW_GEO_DIR = ROOT / "data" / "raw" / "geo"
INTERIM_GEO_DIR = ROOT / "data" / "interim" / "geo"
QA_DIR = ROOT / "data" / "interim" / "qa"
PROCESSED_GEO_DIR = ROOT / "data" / "processed" / "geo"
BOUNDARY_GEOJSON = ROOT / "data" / "processed" / "territorio" / "istat_sezioni_censimento_lamezia.geojson"
GEOSPATIAL_DEPS_HINT = (
    "Missing geospatial Python dependencies. Install shapely, geopandas, pyproj, "
    "scipy and pyogrio, or set PYTHONPATH to a directory containing them."
)


def require_geospatial_dependencies():
    try:
        import geopandas as gpd
        import pandas as pd
        import shapely
        from scipy.spatial import cKDTree
    except Exception as exc:  # pragma: no cover - import guard
        print(f"{GEOSPATIAL_DEPS_HINT}\nImport error: {exc}", file=sys.stderr)
        raise
    return gpd, pd, shapely, cKDTree


def read_csv_rows(path: Path) -> list[dict]:
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


def write_csv_rows(path: Path, rows: Iterable[dict], headers: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=headers, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow({header: row.get(header, "") for header in headers})


def relpath(path: Path) -> str:
    return str(path.resolve().relative_to(ROOT)).replace("\\", "/")


def decimal_it(value: str) -> float | None:
    value = (value or "").strip()
    if not value:
        return None
    try:
        return float(value.replace(",", "."))
    except ValueError:
        return None


def bool_text(value: bool) -> str:
    return "true" if value else "false"


def parse_sections(value: str) -> set[str]:
    parts = [part.strip() for part in (value or "").replace(",", ";").split(";")]
    return {part for part in parts if part}


def read_review_by_access_id(path: Path = QA_DIR / "anncsu_electoral_assignment_review_queue_2025.csv") -> dict[str, dict]:
    return {row.get("anncsu_progressivo_accesso", ""): row for row in read_csv_rows(path)}


def load_boundary_32633():
    gpd, _pd, shapely, _tree = require_geospatial_dependencies()
    if not BOUNDARY_GEOJSON.exists():
        return None, "missing"
    boundary = gpd.read_file(BOUNDARY_GEOJSON)
    if boundary.empty:
        return None, "empty"
    boundary = boundary.set_crs("EPSG:4326", allow_override=True).to_crs("EPSG:32633")
    boundary["geometry"] = boundary.geometry.apply(shapely.make_valid)
    geom = shapely.make_valid(boundary.geometry.union_all())
    if geom.is_empty:
        return None, "empty_union"
    return geom, relpath(BOUNDARY_GEOJSON)


def civics_to_geodataframe(csv_path: Path, review_by_access_id: dict[str, dict] | None = None):
    gpd, pd, _shapely, _tree = require_geospatial_dependencies()
    rows = read_csv_rows(csv_path)
    records: list[dict] = []
    geometries = []
    review_by_access_id = review_by_access_id or {}
    for row in rows:
        lon = decimal_it(row.get("COORD_X_COMUNE", ""))
        lat = decimal_it(row.get("COORD_Y_COMUNE", ""))
        access_id = row.get("PROGRESSIVO_ACCESSO", "")
        review = review_by_access_id.get(access_id, {})
        human_review_required = row.get("assignment_status") != "assigned"
        record = dict(row)
        record["access_id"] = access_id
        record["coord_x"] = "" if lon is None else lon
        record["coord_y"] = "" if lat is None else lat
        record["human_review_required"] = bool(human_review_required)
        record["problem_type"] = review.get("reason", "")
        record["notes"] = row.get("assignment_notes", "")
        records.append(record)
        geometries.append(None if lon is None or lat is None else gpd.points_from_xy([lon], [lat], crs="EPSG:4326")[0])
    gdf = gpd.GeoDataFrame(pd.DataFrame(records), geometry=geometries, crs="EPSG:4326")
    return gdf.to_crs("EPSG:32633")


def write_gpkg(gdf, path: Path, layer: str, *, delete_existing: bool = False) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if delete_existing and path.exists():
        path.unlink()
    gdf.to_file(path, layer=layer, driver="GPKG")


def polygon_count(geometry) -> int:
    if geometry is None or geometry.is_empty:
        return 0
    if geometry.geom_type == "Polygon":
        return 1
    if geometry.geom_type == "MultiPolygon":
        return len(geometry.geoms)
    if geometry.geom_type == "GeometryCollection":
        return sum(1 for geom in geometry.geoms if geom.geom_type in {"Polygon", "MultiPolygon"})
    return 0


def compactness_score(area_sq_m: float, perimeter_m: float) -> float:
    if area_sq_m <= 0 or perimeter_m <= 0:
        return 0.0
    return max(0.0, min(1.0, (4 * math.pi * area_sq_m) / (perimeter_m * perimeter_m)))


def geometry_confidence(points_used: int, parts: int, area_sq_km: float) -> tuple[str, bool, str]:
    notes: list[str] = []
    confidence = "high"
    if points_used < 5:
        confidence = "low"
        notes.append("very few supporting civic points")
    elif points_used < 20:
        confidence = "medium"
        notes.append("limited supporting civic points")
    if parts > 8:
        confidence = "low"
        notes.append("fragmented dissolved geometry")
    elif parts > 3 and confidence == "high":
        confidence = "medium"
        notes.append("multi-part dissolved geometry")
    if area_sq_km <= 0:
        confidence = "low"
        notes.append("zero or invalid area")
    return confidence, confidence != "high", "; ".join(notes)


def section_sort_key(value: str) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return 999999
