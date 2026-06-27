from __future__ import annotations

import csv
import json
import math
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from electoral_geo_utils import PROCESSED_GEO_DIR, QA_DIR, ROOT


SOURCE_CSV = PROCESSED_GEO_DIR / "anncsu_lamezia_civics_with_electoral_section_2025_v2.csv"
DATA_DIR = ROOT / "tools" / "electoral-review-workbench" / "public" / "data"
TASKS_JSON = DATA_DIR / "civic_review_tasks.json"
CIVICS_BY_TASK_JSON = DATA_DIR / "civics_by_task.json"
REVIEW_POINTS_GEOJSON = DATA_DIR / "review_points.geojson"
DETERMINISTIC_POINTS_GEOJSON = DATA_DIR / "deterministic_points_sample.geojson"
SPATIALLY_RESOLVED_POINTS_GEOJSON = DATA_DIR / "spatially_resolved_points.geojson"
STREET_EVIDENCE_JSON = DATA_DIR / "street_register_evidence_by_task.json"

REPORT_PATH = QA_DIR / "electoral_workbench_label_integrity_report.md"
SAMPLE_PATH = QA_DIR / "electoral_workbench_label_integrity_sample.csv"

LAMEZIA_LON_RANGE = (16.0, 16.6)
LAMEZIA_LAT_RANGE = (38.75, 39.15)
COORD_TOLERANCE = 0.0000015


def as_text(value: Any) -> str:
    if value is None:
        return ""
    text = str(value)
    return "" if text.lower() == "nan" else text.strip()


def as_float(value: Any) -> float:
    text = as_text(value).replace(",", ".")
    try:
        return float(text)
    except ValueError:
        return math.nan


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def read_source_rows() -> dict[str, dict[str, str]]:
    with SOURCE_CSV.open("r", encoding="utf-8", newline="") as handle:
        rows = list(csv.DictReader(handle))
    out: dict[str, dict[str, str]] = {}
    for row in rows:
        access_id = as_text(row.get("PROGRESSIVO_ACCESSO"))
        if access_id:
            out[access_id] = row
    return out


def source_value(row: dict[str, Any], *keys: str) -> str:
    for key in keys:
        value = as_text(row.get(key))
        if value:
            return value
    return ""


def civic_label(row: dict[str, Any]) -> str:
    civic = source_value(row, "CIVICO", "civico")
    exponent = source_value(row, "ESPONENTE", "esponente")
    if civic and exponent:
        return f"{civic}/{exponent}"
    return civic


def anncsu_label(row: dict[str, Any]) -> str:
    street = source_value(row, "ODONIMO", "anncsu_odonimo", "odonimo_raw")
    civic = civic_label(row)
    return f"ANNCSU: {street}{(' ' + civic) if civic else ''}".strip()


def coord_plausibility(lon: float, lat: float) -> str:
    if math.isnan(lon) or math.isnan(lat):
        return "coordinate_outlier"
    if not (LAMEZIA_LON_RANGE[0] <= lon <= LAMEZIA_LON_RANGE[1]):
        return "coordinate_outlier"
    if not (LAMEZIA_LAT_RANGE[0] <= lat <= LAMEZIA_LAT_RANGE[1]):
        return "coordinate_outlier"
    if LAMEZIA_LAT_RANGE[0] <= lon <= LAMEZIA_LAT_RANGE[1] and LAMEZIA_LON_RANGE[0] <= lat <= LAMEZIA_LON_RANGE[1]:
        return "coordinate_outlier"
    return "ok"


def compare_text(source: str, observed: str) -> bool:
    return as_text(source) == as_text(observed)


def compare_coord(source: str, observed: Any) -> bool:
    source_float = as_float(source)
    observed_float = observed if isinstance(observed, float) else as_float(observed)
    if math.isnan(source_float) or math.isnan(observed_float):
        return False
    return abs(source_float - observed_float) <= COORD_TOLERANCE


def geojson_features(path: Path) -> list[dict[str, Any]]:
    payload = load_json(path)
    return list(payload.get("features") or [])


def add_finding(findings: list[dict[str, str]], severity: str, code: str, detail: str) -> None:
    findings.append({"severity": severity, "code": code, "detail": detail})


def audit_geojson_layer(
    layer_name: str,
    path: Path,
    source_by_access: dict[str, dict[str, str]],
    findings: list[dict[str, str]],
    sample_rows: list[dict[str, str]],
) -> Counter:
    counts: Counter = Counter()
    for feature in geojson_features(path):
        props = feature.get("properties") or {}
        coords = ((feature.get("geometry") or {}).get("coordinates") or [math.nan, math.nan])
        access_id = as_text(props.get("access_id"))
        counts["features"] += 1
        source = source_by_access.get(access_id)
        if not source:
            counts["missing_source_record"] += 1
            add_finding(findings, "P0", "missing_source_record", f"{layer_name}: access_id {access_id} is not in source CSV.")
            continue

        expected = {
            "odonimo": source_value(source, "ODONIMO"),
            "localita": source_value(source, "LOCALITA'"),
            "civico": source_value(source, "CIVICO"),
            "esponente": source_value(source, "ESPONENTE"),
            "section": source_value(source, "section_number"),
            "lon": source_value(source, "COORD_X_COMUNE"),
            "lat": source_value(source, "COORD_Y_COMUNE"),
        }
        observed = {
            "odonimo": source_value(props, "odonimo_raw", "ODONIMO"),
            "localita": source_value(props, "localita"),
            "civico": source_value(props, "civico", "CIVICO"),
            "esponente": source_value(props, "esponente", "ESPONENTE"),
            "section": source_value(props, "section_number"),
            "label": source_value(props, "map_popup_title", "anncsu_address_label"),
        }
        field_mismatches = []
        for key in ["odonimo", "localita", "civico", "esponente", "section"]:
            if not compare_text(expected[key], observed[key]):
                field_mismatches.append(key)

        lon = coords[0] if len(coords) > 0 else math.nan
        lat = coords[1] if len(coords) > 1 else math.nan
        if not compare_coord(expected["lon"], lon) or not compare_coord(expected["lat"], lat):
            field_mismatches.append("coordinates")
        if coord_plausibility(as_float(expected["lon"]), as_float(expected["lat"])) != "ok":
            counts["coordinate_outlier"] += 1
            add_finding(findings, "P0", "coordinate_outlier", f"{layer_name}: source coordinates for {access_id} are implausible.")

        expected_label = anncsu_label(source)
        if observed["label"] and observed["label"] != expected_label:
            field_mismatches.append("label")
        if "task_title" in observed["label"].lower():
            field_mismatches.append("task_title_label")

        if field_mismatches:
            counts["field_mismatch"] += 1
            add_finding(findings, "P0", "marker_source_mismatch", f"{layer_name}: {access_id} mismatch in {', '.join(field_mismatches)}.")
            status = "fail"
        else:
            counts["ok"] += 1
            status = "ok"

        if len(sample_rows) < 100:
            sample_rows.append(
                {
                    "layer": layer_name,
                    "access_id": access_id,
                    "source_odonimo": expected["odonimo"],
                    "source_civico": expected["civico"],
                    "source_esponente": expected["esponente"],
                    "source_lon": expected["lon"],
                    "source_lat": expected["lat"],
                    "geojson_odonimo": observed["odonimo"],
                    "geojson_civico": observed["civico"],
                    "geojson_esponente": observed["esponente"],
                    "geojson_lon": f"{float(lon):.7f}" if not math.isnan(float(lon)) else "",
                    "geojson_lat": f"{float(lat):.7f}" if not math.isnan(float(lat)) else "",
                    "label_shown_by_workbench": observed["label"],
                    "status": status,
                }
            )
    return counts


def audit_civics_by_task(
    civics_by_task: dict[str, list[dict[str, Any]]],
    source_by_access: dict[str, dict[str, str]],
    findings: list[dict[str, str]],
) -> Counter:
    counts: Counter = Counter()
    for task_id, rows in civics_by_task.items():
        for row in rows:
            counts["rows"] += 1
            access_id = as_text(row.get("access_id"))
            source = source_by_access.get(access_id)
            if not source:
                counts["missing_source_record"] += 1
                add_finding(findings, "P0", "missing_source_record", f"civics_by_task: {task_id} has unknown access_id {access_id}.")
                continue
            checks = [
                ("odonimo_raw", source_value(source, "ODONIMO"), source_value(row, "odonimo_raw")),
                ("localita", source_value(source, "LOCALITA'"), source_value(row, "localita")),
                ("civico", source_value(source, "CIVICO"), source_value(row, "civico")),
                ("esponente", source_value(source, "ESPONENTE"), source_value(row, "esponente")),
                ("section_number", source_value(source, "section_number"), source_value(row, "section_number")),
            ]
            bad = [name for name, expected, observed in checks if not compare_text(expected, observed)]
            if not compare_coord(source_value(source, "COORD_X_COMUNE"), row.get("source_coord_lon") or row.get("coord_x")):
                bad.append("coord_x")
            if not compare_coord(source_value(source, "COORD_Y_COMUNE"), row.get("source_coord_lat") or row.get("coord_y")):
                bad.append("coord_y")
            if source_value(row, "map_popup_title") and source_value(row, "map_popup_title") != anncsu_label(source):
                bad.append("map_popup_title")
            if bad:
                counts["field_mismatch"] += 1
                add_finding(findings, "P0", "civic_payload_mismatch", f"civics_by_task: {task_id}/{access_id} mismatch in {', '.join(bad)}.")
            else:
                counts["ok"] += 1
    return counts


def audit_tasks(tasks: list[dict[str, Any]], civics_by_task: dict[str, list[dict[str, Any]]], findings: list[dict[str, str]]) -> Counter:
    counts: Counter = Counter()
    for task in tasks:
        task_id = as_text(task.get("task_id"))
        rows = civics_by_task.get(task_id, [])
        streets = {source_value(row, "odonimo_raw", "street_name_normalised") for row in rows if source_value(row, "odonimo_raw", "street_name_normalised")}
        counts["tasks"] += 1
        if "is_multi_street_task" not in task or "street_count" not in task or "display_title_is_representative" not in task:
            counts["missing_task_integrity_fields"] += 1
            add_finding(findings, "P1", "missing_task_integrity_fields", f"{task_id} lacks explicit multi-street declaration fields.")
            continue
        expected_multi = len(streets) > 1
        if bool(task.get("is_multi_street_task")) != expected_multi:
            counts["multi_street_flag_mismatch"] += 1
            add_finding(findings, "P1", "multi_street_flag_mismatch", f"{task_id} multi-street flag disagrees with civics_by_task.")
        if int(task.get("street_count") or 0) != len(streets):
            counts["street_count_mismatch"] += 1
            add_finding(findings, "P1", "street_count_mismatch", f"{task_id} street_count {task.get('street_count')} != observed {len(streets)}.")
        if expected_multi and not bool(task.get("display_title_is_representative")):
            counts["multi_street_title_not_marked"] += 1
            add_finding(findings, "P1", "multi_street_title_not_marked", f"{task_id} is multi-street but title is not marked representative.")
        if expected_multi:
            counts["multi_street_task"] += 1
        else:
            counts["single_street_task"] += 1
    return counts


def audit_street_evidence(evidence: dict[str, list[dict[str, Any]]], tasks: list[dict[str, Any]], findings: list[dict[str, str]]) -> Counter:
    task_ids = {as_text(task.get("task_id")) for task in tasks}
    allowed = {
        "direct_compatible_rule",
        "possible_variant_match",
        "competing_rule",
        "interval_overlap",
        "parity_match",
        "parity_conflict",
        "snc_match",
        "no_compatible_rule",
    }
    counts: Counter = Counter()
    for task_id, rows in evidence.items():
        if task_id not in task_ids:
            counts["unknown_task_id"] += 1
            add_finding(findings, "P1", "street_evidence_unknown_task", f"street evidence references unknown task {task_id}.")
        for row in rows:
            value = as_text(row.get("compatibility_with_task"))
            if value not in allowed:
                counts["bad_compatibility"] += 1
                add_finding(findings, "P1", "bad_compatibility", f"{task_id}/{row.get('rule_id')} has invalid compatibility {value}.")
            else:
                counts[value] += 1
    return counts


def write_sample(rows: list[dict[str, str]]) -> None:
    SAMPLE_PATH.parent.mkdir(parents=True, exist_ok=True)
    fields = [
        "layer",
        "access_id",
        "source_odonimo",
        "source_civico",
        "source_esponente",
        "source_lon",
        "source_lat",
        "geojson_odonimo",
        "geojson_civico",
        "geojson_esponente",
        "geojson_lon",
        "geojson_lat",
        "label_shown_by_workbench",
        "status",
    ]
    with SAMPLE_PATH.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows[:100])


def write_report(
    findings: list[dict[str, str]],
    layer_counts: dict[str, Counter],
    task_counts: Counter,
    civic_counts: Counter,
    evidence_counts: Counter,
) -> None:
    severity_counts = Counter(item["severity"] for item in findings)
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        "# Electoral Workbench Label Integrity Audit",
        "",
        "## Result",
        "",
        f"- P0 findings: {severity_counts.get('P0', 0)}",
        f"- P1 findings: {severity_counts.get('P1', 0)}",
        f"- P2 findings: {severity_counts.get('P2', 0)}",
        f"- Sample CSV: `{SAMPLE_PATH.relative_to(ROOT)}`",
        "",
        "The audit checks that every marker label and coordinate remains tied to its source ANNCSU `access_id`.",
        "OpenStreetMap is not audited as an address source because it is visual context only.",
        "",
        "## Layer Counts",
        "",
    ]
    for layer, counts in layer_counts.items():
        lines.append(f"- `{layer}`: " + ", ".join(f"{key}={value}" for key, value in sorted(counts.items())))
    lines.extend(
        [
            "",
            "## Task Integrity",
            "",
            "- " + ", ".join(f"{key}={value}" for key, value in sorted(task_counts.items())),
            "",
            "## Civic Payload Integrity",
            "",
            "- " + ", ".join(f"{key}={value}" for key, value in sorted(civic_counts.items())),
            "",
            "## Street Register Evidence",
            "",
            "- " + ", ".join(f"{key}={value}" for key, value in sorted(evidence_counts.items())),
            "",
            "## Findings",
            "",
        ]
    )
    if findings:
        by_severity: dict[str, list[dict[str, str]]] = defaultdict(list)
        for finding in findings:
            by_severity[finding["severity"]].append(finding)
        for severity in ["P0", "P1", "P2"]:
            if not by_severity.get(severity):
                continue
            lines.append(f"### {severity}")
            lines.append("")
            for finding in by_severity[severity][:50]:
                lines.append(f"- `{finding['code']}`: {finding['detail']}")
            if len(by_severity[severity]) > 50:
                lines.append(f"- ... {len(by_severity[severity]) - 50} additional findings omitted from the report body.")
            lines.append("")
    else:
        lines.append("No P0/P1 findings.")
        lines.append("")
    lines.extend(
        [
            "## Interpretation",
            "",
            "- P0: marker `access_id`, label, section, or coordinate does not match the source civic CSV.",
            "- P1: task-level multi-street/range/parity metadata is missing or misleading.",
            "- P2: OSM/ANNCSU visual-name differences only; OSM remains a background context.",
        ]
    )
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    source_by_access = read_source_rows()
    tasks = load_json(TASKS_JSON)
    civics_by_task = load_json(CIVICS_BY_TASK_JSON)
    evidence = load_json(STREET_EVIDENCE_JSON)

    findings: list[dict[str, str]] = []
    sample_rows: list[dict[str, str]] = []
    layer_counts = {
        "review_points.geojson": audit_geojson_layer("review_points.geojson", REVIEW_POINTS_GEOJSON, source_by_access, findings, sample_rows),
        "deterministic_points_sample.geojson": audit_geojson_layer(
            "deterministic_points_sample.geojson",
            DETERMINISTIC_POINTS_GEOJSON,
            source_by_access,
            findings,
            sample_rows,
        ),
        "spatially_resolved_points.geojson": audit_geojson_layer(
            "spatially_resolved_points.geojson",
            SPATIALLY_RESOLVED_POINTS_GEOJSON,
            source_by_access,
            findings,
            sample_rows,
        ),
    }
    civic_counts = audit_civics_by_task(civics_by_task, source_by_access, findings)
    task_counts = audit_tasks(tasks, civics_by_task, findings)
    evidence_counts = audit_street_evidence(evidence, tasks, findings)

    if not any(item["severity"] == "P2" for item in findings):
        add_finding(
            findings,
            "P2",
            "osm_anncsu_name_difference_not_a_marker_error",
            "Differences between OSM visible labels and ANNCSU odonimi are expected review context, not source-label errors.",
        )

    write_sample(sample_rows)
    write_report(findings, layer_counts, task_counts, civic_counts, evidence_counts)

    p0 = sum(1 for item in findings if item["severity"] == "P0")
    p1 = sum(1 for item in findings if item["severity"] == "P1")
    print(f"label_integrity_report={REPORT_PATH}")
    print(f"label_integrity_sample={SAMPLE_PATH}")
    print(f"p0={p0}")
    print(f"p1={p1}")
    return 1 if p0 or p1 else 0


if __name__ == "__main__":
    sys.exit(main())
