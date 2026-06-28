from __future__ import annotations

import csv
import hashlib
import io
import sys
import zipfile
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any

from electoral_geo_utils import QA_DIR, ROOT, relpath


RAW_GEO_DIR = ROOT / "data" / "raw" / "geo"
INDIRIZZARIO_ZIP = RAW_GEO_DIR / "indirizzarioCalabria20260602.zip"
INDIRIZZARIO_EXTRACT = RAW_GEO_DIR / "anncsu_lamezia_indirizzario_20260602.csv"
PROCESSED_CIVICS = ROOT / "data" / "processed" / "geo" / "anncsu_lamezia_civics_with_electoral_section_2025_v2.csv"
SUSPECT_CSV = QA_DIR / "anncsu_coordinate_suspect_points_2025.csv"

REPORT_PATH = QA_DIR / "anncsu_coordinate_corruption_diagnostic_report_2025.md"
DIAGNOSTIC_CSV = QA_DIR / "anncsu_coordinate_corruption_diagnostic_2025.csv"

MUNICIPALITY_ISTAT = "079160"
COMPARE_FIELDS = [
    "CODICE_COMUNE",
    "CODICE_ISTAT",
    "PROGRESSIVO_NAZIONALE",
    "ODONIMO",
    "LOCALITA'",
    "PROGRESSIVO_ACCESSO",
    "CIVICO",
    "ESPONENTE",
    "PROGRESSIVO_SNC",
    "COORD_X_COMUNE",
    "COORD_Y_COMUNE",
    "METODO",
]
ADDRESS_FIELDS = ["ODONIMO", "LOCALITA'", "CIVICO", "ESPONENTE", "PROGRESSIVO_SNC"]
COORD_FIELDS = ["COORD_X_COMUNE", "COORD_Y_COMUNE"]

OUTPUT_FIELDS = [
    "access_id",
    "odonimo_raw",
    "civico",
    "esponente",
    "coordinate_quality_flag",
    "raw_found",
    "extract_found",
    "processed_found",
    "raw_coord_x",
    "raw_coord_y",
    "extract_coord_x",
    "extract_coord_y",
    "processed_coord_x",
    "processed_coord_y",
    "raw_extract_coordinate_match",
    "extract_processed_coordinate_match",
    "raw_extract_address_match",
    "extract_processed_address_match",
    "same_exact_coordinate_group_size",
    "same_exact_coordinate_distinct_streets",
    "same_exact_coordinate_streets_sample",
    "source_diagnosis",
    "recovery_action",
]


def as_text(value: Any) -> str:
    if value is None:
        return ""
    text = str(value)
    return "" if text.lower() == "nan" else text.strip()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def detect_encoding(data: bytes) -> str:
    for encoding in ["utf-8-sig", "utf-8", "cp1252", "latin-1"]:
        try:
            data[:200_000].decode(encoding)
            return encoding
        except UnicodeDecodeError:
            continue
    return "utf-8"


def detect_delimiter(sample: str) -> str:
    try:
        return csv.Sniffer().sniff(sample, delimiters=";\t|,").delimiter
    except csv.Error:
        return ";"


def read_csv_flexible(path: Path) -> tuple[list[dict[str, str]], str]:
    if not path.exists():
        return [], ""
    text = path.read_text(encoding="utf-8-sig")
    delimiter = detect_delimiter(text[:20_000])
    return list(csv.DictReader(io.StringIO(text, newline=""), delimiter=delimiter)), delimiter


def read_raw_zip_lamezia() -> tuple[list[dict[str, str]], dict[str, Any]]:
    with zipfile.ZipFile(INDIRIZZARIO_ZIP) as archive:
        members = [info for info in archive.infolist() if not info.is_dir()]
        if len(members) != 1:
            raise RuntimeError(f"Expected one CSV inside {INDIRIZZARIO_ZIP}, found {len(members)}")
        member = members[0]
        data = archive.read(member.filename)

    encoding = detect_encoding(data)
    text = data.decode(encoding)
    delimiter = detect_delimiter(text[:20_000])
    reader = csv.DictReader(io.StringIO(text, newline=""), delimiter=delimiter)
    rows: list[dict[str, str]] = []
    total_rows = 0
    for row in reader:
        total_rows += 1
        if row.get("CODICE_ISTAT") == MUNICIPALITY_ISTAT:
            rows.append(row)
    return rows, {
        "internal_csv": member.filename,
        "encoding": encoding,
        "delimiter": delimiter,
        "total_rows": total_rows,
        "lamezia_rows": len(rows),
        "sha256": sha256_file(INDIRIZZARIO_ZIP),
    }


def index_by_access(rows: list[dict[str, str]], label: str) -> tuple[dict[str, dict[str, str]], Counter[str]]:
    counts: Counter[str] = Counter(as_text(row.get("PROGRESSIVO_ACCESSO")) for row in rows)
    duplicates = Counter({key: count for key, count in counts.items() if key and count > 1})
    indexed: dict[str, dict[str, str]] = {}
    for row in rows:
        access_id = as_text(row.get("PROGRESSIVO_ACCESSO"))
        if not access_id:
            continue
        indexed.setdefault(access_id, row)
    if "" in counts:
        duplicates[f"{label}:missing_access_id"] = counts[""]
    return indexed, duplicates


def fields_match(left: dict[str, str] | None, right: dict[str, str] | None, fields: list[str]) -> str:
    if left is None or right is None:
        return "false"
    return "true" if all(as_text(left.get(field)) == as_text(right.get(field)) for field in fields) else "false"


def coordinate_key(row: dict[str, str]) -> tuple[str, str]:
    return as_text(row.get("COORD_X_COMUNE")), as_text(row.get("COORD_Y_COMUNE"))


def source_diagnosis(
    *,
    raw: dict[str, str] | None,
    extract: dict[str, str] | None,
    processed: dict[str, str] | None,
    raw_extract_coord_match: str,
    extract_processed_coord_match: str,
) -> str:
    if raw is None:
        return "missing_from_raw_zip"
    if extract is None:
        return "missing_from_lamezia_extract"
    if processed is None:
        return "missing_from_processed_civics"
    if raw_extract_coord_match != "true":
        return "pipeline_extract_coordinate_mismatch"
    if extract_processed_coord_match != "true":
        return "processed_coordinate_mismatch"
    return "suspect_coordinate_present_in_original_anncsu_raw"


def recovery_action(flag: str, diagnosis: str) -> str:
    if diagnosis in {"pipeline_extract_coordinate_mismatch", "processed_coordinate_mismatch"}:
        return "repair_pipeline_before_external_geocoding"
    if diagnosis.startswith("missing_"):
        return "investigate_missing_source_record"
    if flag in {"implausible_coordinate", "possible_xy_swap", "missing_coordinate"}:
        return "external_geocode_candidate_required"
    if flag in {"street_context_mismatch", "same_street_outlier", "isolated_point"}:
        return "external_geocode_candidate_plus_human_review"
    if flag == "outside_boundary":
        return "boundary_check_then_external_geocode_if_needed"
    return "manual_coordinate_review_before_geometry"


def markdown_table(headers: list[str], rows: list[list[str]]) -> list[str]:
    lines = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join("---" for _ in headers) + " |",
    ]
    for row in rows:
        lines.append("| " + " | ".join(row) + " |")
    return lines


def write_csv(rows: list[dict[str, Any]]) -> None:
    DIAGNOSTIC_CSV.parent.mkdir(parents=True, exist_ok=True)
    with DIAGNOSTIC_CSV.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=OUTPUT_FIELDS, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field, "") for field in OUTPUT_FIELDS})


def write_report(
    *,
    zip_meta: dict[str, Any],
    extract_delimiter: str,
    processed_delimiter: str,
    raw_count: int,
    extract_count: int,
    processed_count: int,
    suspect_count: int,
    duplicate_counts: dict[str, int],
    mismatch_counts: dict[str, int],
    diagnosis_counts: Counter[str],
    repeated_coordinate_groups: dict[str, int],
) -> None:
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    all_suspects_raw = (
        suspect_count > 0
        and diagnosis_counts.get("suspect_coordinate_present_in_original_anncsu_raw", 0) == suspect_count
    )
    conclusion = (
        "The current suspect coordinates are copied through from the original ANNCSU indirizzario bytes."
        if all_suspects_raw
        else "At least one suspect coordinate needs pipeline-level investigation before external replacement."
    )
    lines = [
        "# ANNCSU Coordinate Corruption Diagnostic 2025",
        "",
        f"Date: {date.today().isoformat()}",
        "",
        "## Result",
        "",
        f"- {conclusion}",
        f"- Suspect records inspected: {suspect_count}",
        f"- Diagnostic CSV: `{relpath(DIAGNOSTIC_CSV)}`",
        "",
        "This diagnostic does not edit ANNCSU raw files, processed election values, GPKG files, polygons, or public UI.",
        "",
        "## Source Chain",
        "",
    ]
    lines.extend(
        markdown_table(
            ["stage", "path", "rows", "delimiter", "notes"],
            [
                [
                    "raw zip",
                    relpath(INDIRIZZARIO_ZIP),
                    str(raw_count),
                    zip_meta.get("delimiter", ""),
                    f"internal={zip_meta.get('internal_csv', '')}; sha256={zip_meta.get('sha256', '')[:16]}...",
                ],
                ["Lamezia extract", relpath(INDIRIZZARIO_EXTRACT), str(extract_count), extract_delimiter, ""],
                ["processed civics V2", relpath(PROCESSED_CIVICS), str(processed_count), processed_delimiter, ""],
                ["coordinate suspects", relpath(SUSPECT_CSV), str(suspect_count), ",", ""],
            ],
        )
    )
    lines.extend(["", "## Integrity Checks", ""])
    lines.extend(
        markdown_table(
            ["check", "count"],
            [[key, str(value)] for key, value in sorted({**duplicate_counts, **mismatch_counts}.items())],
        )
    )
    lines.extend(["", "## Suspect Source Diagnosis", ""])
    lines.extend(
        markdown_table(
            ["diagnosis", "count"],
            [[key, str(value)] for key, value in sorted(diagnosis_counts.items())],
        )
    )
    lines.extend(["", "## Repeated Coordinate Signals", ""])
    lines.extend(
        markdown_table(
            ["signal", "count"],
            [[key, str(value)] for key, value in sorted(repeated_coordinate_groups.items())],
        )
    )
    lines.extend(
        [
            "",
            "## Interpretation",
            "",
            "- If `pipeline_extract_coordinate_mismatch` or `processed_coordinate_mismatch` appears, fix the local extraction/processing pipeline first.",
            "- If suspect coordinates are already present in the original ANNCSU zip, treat ANNCSU coordinates as source evidence but not as automatically trustworthy geometry.",
            "- Do not overwrite `COORD_X_COMUNE` or `COORD_Y_COMUNE`; preserve them as immutable source fields.",
            "- Store any replacement as a separate reviewed coordinate with provider, query, confidence, reviewer decision, and original-coordinate distance.",
            "",
            "## Recovery / Retraining Process",
            "",
            "1. Keep raw ANNCSU coordinates unchanged and reproducible.",
            "2. Use `anncsu_coordinate_suspect_points_2025.csv` plus this diagnostic to decide whether a record needs pipeline repair or external coordinate recovery.",
            "3. Generate external geocoder candidates only for suspect records, with cache and rate limiting.",
            "4. Compare each candidate against municipal boundary, ANNCSU street context, electoral street-register evidence, and same-street reviewed anchors.",
            "5. Review candidates in the local workbench and export explicit coordinate decisions.",
            "6. Build a future correction/training set from accepted manual overrides, not from unreviewed API results.",
            "7. Re-run coordinate quality audits and only then consider a future V4 candidate geometry.",
            "",
            "## External Geocoder Guardrails",
            "",
            "- Nominatim can support small, cached, rate-limited candidate generation, but public Nominatim must not be treated as a bulk geocoding backend.",
            "- For full re-geocoding of hundreds or thousands of civics, use a dedicated service, an internal Nominatim instance, or another provider with explicit bulk terms.",
            "- API coordinates are proposals, not authoritative corrections.",
        ]
    )
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    missing = [path for path in [INDIRIZZARIO_ZIP, INDIRIZZARIO_EXTRACT, PROCESSED_CIVICS, SUSPECT_CSV] if not path.exists()]
    if missing:
        for path in missing:
            print(f"missing_input={path}", file=sys.stderr)
        return 1

    raw_rows, zip_meta = read_raw_zip_lamezia()
    extract_rows, extract_delimiter = read_csv_flexible(INDIRIZZARIO_EXTRACT)
    processed_rows, processed_delimiter = read_csv_flexible(PROCESSED_CIVICS)
    suspect_rows, _suspect_delimiter = read_csv_flexible(SUSPECT_CSV)

    raw_by_access, raw_dupes = index_by_access(raw_rows, "raw")
    extract_by_access, extract_dupes = index_by_access(extract_rows, "extract")
    processed_by_access, processed_dupes = index_by_access(processed_rows, "processed")

    mismatch_counts: dict[str, int] = {
        "raw_extract_coordinate_mismatches_all_rows": 0,
        "raw_extract_address_mismatches_all_rows": 0,
        "extract_processed_coordinate_mismatches_all_rows": 0,
        "extract_processed_address_mismatches_all_rows": 0,
        "raw_missing_from_extract": 0,
        "extract_missing_from_raw": 0,
        "extract_missing_from_processed": 0,
    }
    for access_id, raw in raw_by_access.items():
        extract = extract_by_access.get(access_id)
        if extract is None:
            mismatch_counts["raw_missing_from_extract"] += 1
            continue
        if fields_match(raw, extract, COORD_FIELDS) != "true":
            mismatch_counts["raw_extract_coordinate_mismatches_all_rows"] += 1
        if fields_match(raw, extract, ADDRESS_FIELDS) != "true":
            mismatch_counts["raw_extract_address_mismatches_all_rows"] += 1
    for access_id, extract in extract_by_access.items():
        raw = raw_by_access.get(access_id)
        processed = processed_by_access.get(access_id)
        if raw is None:
            mismatch_counts["extract_missing_from_raw"] += 1
        if processed is None:
            mismatch_counts["extract_missing_from_processed"] += 1
            continue
        if fields_match(extract, processed, COORD_FIELDS) != "true":
            mismatch_counts["extract_processed_coordinate_mismatches_all_rows"] += 1
        if fields_match(extract, processed, ADDRESS_FIELDS) != "true":
            mismatch_counts["extract_processed_address_mismatches_all_rows"] += 1

    coordinate_groups: dict[tuple[str, str], list[dict[str, str]]] = defaultdict(list)
    for row in raw_rows:
        key = coordinate_key(row)
        if all(key):
            coordinate_groups[key].append(row)
    coordinate_group_summary = {
        "exact_coordinate_groups_with_10plus_civics": sum(1 for rows in coordinate_groups.values() if len(rows) >= 10),
        "exact_coordinate_groups_with_3plus_distinct_streets": sum(
            1 for rows in coordinate_groups.values() if len({as_text(row.get("ODONIMO")) for row in rows}) >= 3
        ),
    }

    diagnostics: list[dict[str, Any]] = []
    diagnosis_counts: Counter[str] = Counter()
    for suspect in suspect_rows:
        access_id = as_text(suspect.get("access_id"))
        raw = raw_by_access.get(access_id)
        extract = extract_by_access.get(access_id)
        processed = processed_by_access.get(access_id)
        raw_extract_coord_match = fields_match(raw, extract, COORD_FIELDS)
        extract_processed_coord_match = fields_match(extract, processed, COORD_FIELDS)
        raw_extract_address_match = fields_match(raw, extract, ADDRESS_FIELDS)
        extract_processed_address_match = fields_match(extract, processed, ADDRESS_FIELDS)
        diagnosis = source_diagnosis(
            raw=raw,
            extract=extract,
            processed=processed,
            raw_extract_coord_match=raw_extract_coord_match,
            extract_processed_coord_match=extract_processed_coord_match,
        )
        diagnosis_counts[diagnosis] += 1
        group = coordinate_groups.get(coordinate_key(raw or {}), [])
        distinct_streets = sorted({as_text(row.get("ODONIMO")) for row in group if as_text(row.get("ODONIMO"))})
        flag = as_text(suspect.get("coordinate_quality_flag"))
        diagnostics.append(
            {
                "access_id": access_id,
                "odonimo_raw": as_text(suspect.get("odonimo_raw") or (raw or {}).get("ODONIMO")),
                "civico": as_text(suspect.get("civico") or (raw or {}).get("CIVICO")),
                "esponente": as_text(suspect.get("esponente") or (raw or {}).get("ESPONENTE")),
                "coordinate_quality_flag": flag,
                "raw_found": "true" if raw is not None else "false",
                "extract_found": "true" if extract is not None else "false",
                "processed_found": "true" if processed is not None else "false",
                "raw_coord_x": as_text((raw or {}).get("COORD_X_COMUNE")),
                "raw_coord_y": as_text((raw or {}).get("COORD_Y_COMUNE")),
                "extract_coord_x": as_text((extract or {}).get("COORD_X_COMUNE")),
                "extract_coord_y": as_text((extract or {}).get("COORD_Y_COMUNE")),
                "processed_coord_x": as_text((processed or {}).get("COORD_X_COMUNE")),
                "processed_coord_y": as_text((processed or {}).get("COORD_Y_COMUNE")),
                "raw_extract_coordinate_match": raw_extract_coord_match,
                "extract_processed_coordinate_match": extract_processed_coord_match,
                "raw_extract_address_match": raw_extract_address_match,
                "extract_processed_address_match": extract_processed_address_match,
                "same_exact_coordinate_group_size": len(group),
                "same_exact_coordinate_distinct_streets": len(distinct_streets),
                "same_exact_coordinate_streets_sample": "; ".join(distinct_streets[:8]),
                "source_diagnosis": diagnosis,
                "recovery_action": recovery_action(flag, diagnosis),
            }
        )

    write_csv(diagnostics)
    duplicate_counts = {
        "raw_duplicate_access_ids": sum(raw_dupes.values()),
        "extract_duplicate_access_ids": sum(extract_dupes.values()),
        "processed_duplicate_access_ids": sum(processed_dupes.values()),
    }
    write_report(
        zip_meta=zip_meta,
        extract_delimiter=extract_delimiter,
        processed_delimiter=processed_delimiter,
        raw_count=len(raw_rows),
        extract_count=len(extract_rows),
        processed_count=len(processed_rows),
        suspect_count=len(suspect_rows),
        duplicate_counts=duplicate_counts,
        mismatch_counts=mismatch_counts,
        diagnosis_counts=diagnosis_counts,
        repeated_coordinate_groups=coordinate_group_summary,
    )

    print(f"diagnostic_report={REPORT_PATH}")
    print(f"diagnostic_csv={DIAGNOSTIC_CSV}")
    print(f"suspect_records={len(suspect_rows)}")
    for diagnosis, count in sorted(diagnosis_counts.items()):
        print(f"{diagnosis}={count}")
    pipeline_mismatches = (
        mismatch_counts["raw_extract_coordinate_mismatches_all_rows"]
        + mismatch_counts["extract_processed_coordinate_mismatches_all_rows"]
    )
    return 1 if pipeline_mismatches else 0


if __name__ == "__main__":
    sys.exit(main())
