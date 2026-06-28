#!/usr/bin/env python3
"""Audit the civic relocation support flow in the local electoral workbench."""

from __future__ import annotations

import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WORKBENCH = ROOT / "tools" / "electoral-review-workbench"
DATA_DIR = WORKBENCH / "public" / "data"
REPORT_PATH = ROOT / "data" / "interim" / "qa" / "electoral_workbench_relocation_flow_report.md"


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def is_number(value) -> bool:
    try:
        float(value)
        return True
    except (TypeError, ValueError):
        return False


def main() -> int:
    findings: list[tuple[str, str, str]] = []
    required_files = [
        WORKBENCH / "index.html",
        WORKBENCH / "app.js",
        WORKBENCH / "styles.css",
        WORKBENCH / "README.md",
        ROOT / "docs" / "geo" / "electoral_review_workbench_methodology.md",
        DATA_DIR / "civic_review_tasks.json",
        DATA_DIR / "civics_by_task.json",
        DATA_DIR / "coordinate_suspect_points.json",
        DATA_DIR / "coordinate_suspect_points.geojson",
        DATA_DIR / "deterministic_points_sample.geojson",
        DATA_DIR / "candidate_sections_v3.geojson",
    ]
    missing_files = [path for path in required_files if not path.exists()]
    if missing_files:
        for path in missing_files:
            findings.append(("P0", "missing-file", str(path.relative_to(ROOT))))
        write_report([], {}, findings)
        return 1

    index_html = read_text(WORKBENCH / "index.html")
    app_js = read_text(WORKBENCH / "app.js")
    styles_css = read_text(WORKBENCH / "styles.css")
    readme = read_text(WORKBENCH / "README.md")
    methodology = read_text(ROOT / "docs" / "geo" / "electoral_review_workbench_methodology.md")
    tasks = read_json(DATA_DIR / "civic_review_tasks.json")
    civics_by_task = read_json(DATA_DIR / "civics_by_task.json")
    suspect_records = read_json(DATA_DIR / "coordinate_suspect_points.json")
    suspect_geojson = read_json(DATA_DIR / "coordinate_suspect_points.geojson")
    deterministic_geojson = read_json(DATA_DIR / "deterministic_points_sample.geojson")
    sections_v3 = read_json(DATA_DIR / "candidate_sections_v3.geojson")

    app_contract = {
        "decision_field_relocation_support_snapshot": "relocation_support_snapshot" in app_js,
        "map_pick_button": "data-coordinate-pick" in index_html,
        "clear_button": "data-coordinate-clear" in index_html,
        "use_original_button": "data-coordinate-use-original" in index_html,
        "support_panel": "coordinateRelocationSupport" in index_html,
        "draft_state": "relocationDrafts" in app_js,
        "map_pick_state": "relocationPickActive" in app_js,
        "support_model": "function relocationSupportModel" in app_js,
        "support_snapshot": "function relocationSupportSnapshot" in app_js,
        "leaflet_render": "function renderRelocationLeaflet" in app_js,
        "map_click_handler": "handleRelocationMapPick" in app_js,
        "drag_handler": "marker_drag" in app_js,
        "manual_override_validation": "manual_coordinate_override requires" in app_js,
        "fallback_render": "fallback-relocation-proposed" in app_js,
        "relocation_styles": "fallback-relocation-proposed" in styles_css,
        "readme_docs": "Civic Relocation Support" in readme,
        "methodology_docs": "relocation_support_snapshot" in methodology,
    }
    for key, ok in app_contract.items():
        if not ok:
            findings.append(("P1", "missing-ui-contract", key))

    task_count = len(tasks)
    civic_rows = [row for rows in civics_by_task.values() for row in rows]
    civic_access_ids = {str(row.get("access_id", "")) for row in civic_rows if row.get("access_id")}
    suspect_access_ids = {str(row.get("access_id", "")) for row in suspect_records if row.get("access_id")}
    suspect_features = suspect_geojson.get("features", [])
    deterministic_features = deterministic_geojson.get("features", [])
    section_features = sections_v3.get("features", [])
    suspect_task_count = sum(1 for task in tasks if task.get("has_coordinate_suspect") or int(task.get("coordinate_suspect_count") or 0) > 0)

    missing_suspect_civics = sorted(suspect_access_ids - civic_access_ids)
    if missing_suspect_civics:
        preview = ", ".join(missing_suspect_civics[:10])
        findings.append(("P0", "suspect-access-id-not-in-civics-by-task", preview))

    bad_suspect_features = []
    for feature in suspect_features:
        props = feature.get("properties") or {}
        coords = (feature.get("geometry") or {}).get("coordinates") or []
        if not props.get("access_id") or len(coords) < 2 or not is_number(coords[0]) or not is_number(coords[1]):
            bad_suspect_features.append(str(props.get("access_id", "")))
    if bad_suspect_features:
        findings.append(("P1", "bad-coordinate-suspect-feature", ", ".join(bad_suspect_features[:10])))

    if not suspect_records:
        findings.append(("P1", "no-coordinate-suspect-records", "coordinate suspect review cannot be exercised"))
    if not deterministic_features:
        findings.append(("P1", "no-deterministic-support-sample", "nearest civic relocation support cannot be computed"))
    if not section_features:
        findings.append(("P1", "no-v3-sections", "proposed coordinate section context cannot be computed"))
    if suspect_task_count == 0:
        findings.append(("P1", "no-coordinate-suspect-tasks", "task filter has no coordinate-quality cases"))

    summary = {
        "task_count": task_count,
        "civic_rows": len(civic_rows),
        "coordinate_suspect_records": len(suspect_records),
        "coordinate_suspect_features": len(suspect_features),
        "coordinate_suspect_tasks": suspect_task_count,
        "deterministic_support_features": len(deterministic_features),
        "v3_section_features": len(section_features),
        "app_contract_checks": sum(1 for ok in app_contract.values() if ok),
        "app_contract_total": len(app_contract),
    }
    write_report(app_contract, summary, findings)

    for severity, code, detail in findings:
        print(f"{severity} {code}: {detail}")
    print(f"Wrote {REPORT_PATH.relative_to(ROOT)}")
    blocking = [finding for finding in findings if finding[0] in {"P0", "P1"}]
    return 1 if blocking else 0


def write_report(app_contract, summary, findings) -> None:
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        "# Electoral Workbench Relocation Flow Audit",
        "",
        "## Scope",
        "",
        "Static and payload audit for the local civic-first workbench relocation support. This report verifies that proposed coordinate overrides are captured as review evidence only, without modifying ANNCSU raw data or generating V4 geometry.",
        "",
        "## Summary",
        "",
    ]
    if summary:
        for key, value in summary.items():
            lines.append(f"- {key}: {value}")
    else:
        lines.append("- no summary available because required files were missing")

    lines.extend(["", "## UI Contract", ""])
    if app_contract:
        for key, ok in app_contract.items():
            lines.append(f"- {key}: {'ok' if ok else 'missing'}")
    else:
        lines.append("- not evaluated")

    lines.extend(["", "## Findings", ""])
    if findings:
        for severity, code, detail in findings:
            lines.append(f"- {severity} {code}: {detail}")
    else:
        lines.append("- P0: none")
        lines.append("- P1: none")
        lines.append("- P2: none")

    lines.extend([
        "",
        "## Boundary",
        "",
        "- No ANNCSU raw coordinate is modified by the workbench.",
        "- Proposed coordinates are exported in manual decisions only.",
        "- `relocation_support_snapshot` is review evidence for a later auditable geometry workflow.",
        "- The workbench does not create V4, public UI, deploy changes, GPKG changes, or public map routes.",
        "",
    ])
    REPORT_PATH.write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    sys.exit(main())
