from __future__ import annotations

import json
import sys

from utils import QA_DIR, ROOT, ensure_directories


REQUIRED_FIELDS = {
    "section_geo_id",
    "section_number",
    "municipality_istat_code",
    "valid_from_year",
    "valid_to_year",
    "geometry_source",
    "geometry_confidence",
    "notes",
}


def check_geojson(path):
    data = json.loads(path.read_text(encoding="utf-8"))
    features = data.get("features", [])
    if not features:
        return f"- {path.name}: no features found."
    missing = {}
    for idx, feature in enumerate(features, start=1):
        props = set((feature.get("properties") or {}).keys())
        diff = REQUIRED_FIELDS - props
        if diff:
            missing[idx] = sorted(diff)
    if not missing:
        return f"- {path.name}: {len(features)} features, required fields present."
    sample = "; ".join(f"feature {idx}: {fields}" for idx, fields in list(missing.items())[:5])
    return f"- {path.name}: missing required fields in {len(missing)} features. Sample: {sample}"


def main() -> int:
    ensure_directories()
    geo_dir = ROOT / "data" / "geo"
    candidates = [path for path in geo_dir.iterdir() if path.suffix.lower() in {".geojson", ".json", ".shp"}]
    lines = [
        "# Geometry link report",
        "",
        "This script validates future geometry inputs only. It does not create geometries and does not modify election results.",
        "",
    ]
    if not candidates:
        lines.append("No shapefile or GeoJSON is present yet in data/geo/.")
    for path in candidates:
        if path.suffix.lower() in {".geojson", ".json"}:
            try:
                lines.append(check_geojson(path))
            except Exception as exc:
                lines.append(f"- {path.name}: could not parse GeoJSON/JSON: {exc}")
        elif path.suffix.lower() == ".shp":
            lines.append(f"- {path.name}: shapefile detected; use GIS tooling to confirm fields {sorted(REQUIRED_FIELDS)}.")
    report = QA_DIR / "geometry_link_report.md"
    report.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"geometry_link_report={report}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
