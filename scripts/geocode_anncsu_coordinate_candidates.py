from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any

from electoral_geo_utils import QA_DIR, ROOT, relpath


SUSPECT_CSV = QA_DIR / "anncsu_coordinate_suspect_points_2025.csv"
DIAGNOSTIC_CSV = QA_DIR / "anncsu_coordinate_corruption_diagnostic_2025.csv"
REQUEST_PLAN_CSV = QA_DIR / "anncsu_coordinate_geocode_request_plan_2025.csv"
CANDIDATES_CSV = QA_DIR / "anncsu_coordinate_geocode_candidates_2025.csv"
REPORT_PATH = QA_DIR / "anncsu_coordinate_geocode_candidates_report_2025.md"
CACHE_DIR = ROOT / ".cache" / "anncsu-geocode" / "nominatim"
WORKBENCH_DATA_DIR = ROOT / "tools" / "electoral-review-workbench" / "public" / "data"
WORKBENCH_CANDIDATES_JSON = WORKBENCH_DATA_DIR / "coordinate_geocode_candidates_by_access.json"

NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search"
NOMINATIM_POLICY_URL = "https://operations.osmfoundation.org/policies/nominatim/"
DEFAULT_USER_AGENT = "Lamezia-Trasparente-Monitor/anncsu-coordinate-qa (https://github.com/colazeta/Lamezia-Trasparente-Monitor)"
LAMEZIA_BBOX = (16.0, 38.75, 16.6, 39.15)

REQUEST_FIELDS = [
    "access_id",
    "priority",
    "address_query",
    "fallback_queries",
    "street",
    "civic",
    "esponente",
    "coordinate_quality_flag",
    "source_diagnosis",
    "recovery_action",
    "source_lon",
    "source_lat",
    "request_status",
    "request_notes",
]

CANDIDATE_FIELDS = [
    "access_id",
    "provider",
    "query",
    "query_variant",
    "candidate_rank",
    "candidate_lon",
    "candidate_lat",
    "candidate_display_name",
    "candidate_class",
    "candidate_type",
    "candidate_importance",
    "candidate_place_rank",
    "candidate_has_house_number",
    "within_lamezia_bbox",
    "distance_from_source_m",
    "provider_confidence",
    "candidate_status",
    "provider_license",
    "cache_key",
]


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


def read_csv(path: Path) -> list[dict[str, str]]:
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


def write_csv(path: Path, rows: list[dict[str, Any]], headers: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=headers, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow({header: row.get(header, "") for header in headers})


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")


def workbench_payload(rows: list[dict[str, Any]]) -> dict[str, list[dict[str, str]]]:
    grouped: dict[str, list[dict[str, str]]] = {}
    for row in rows:
        access_id = as_text(row.get("access_id"))
        if not access_id:
            continue
        grouped.setdefault(access_id, []).append(
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
    return grouped


def address_query(row: dict[str, str]) -> str:
    street = as_text(row.get("odonimo_raw"))
    civic = as_text(row.get("civico"))
    exponent = as_text(row.get("esponente"))
    number = f"{civic}/{exponent}" if civic and exponent else civic
    parts = [part for part in [f"{street} {number}".strip(), "Lamezia Terme", "Calabria", "Italia"] if part]
    return ", ".join(parts)


def query_variants(row: dict[str, str]) -> list[tuple[str, str]]:
    variants: list[tuple[str, str]] = []
    exact = as_text(row.get("address_query") or address_query(row))
    if exact:
        variants.append(("exact_civic", exact))
    street = as_text(row.get("odonimo_raw"))
    if street:
        street_only = ", ".join([street, "Lamezia Terme", "Calabria", "Italia"])
        if street_only != exact:
            variants.append(("street_only", street_only))
    return variants


def priority_for(row: dict[str, str]) -> str:
    flag = as_text(row.get("coordinate_quality_flag"))
    diagnosis = as_text(row.get("source_diagnosis"))
    if diagnosis in {"pipeline_extract_coordinate_mismatch", "processed_coordinate_mismatch"}:
        return "P1_pipeline_repair_first"
    if flag in {"implausible_coordinate", "possible_xy_swap", "missing_coordinate"}:
        return "P1_external_candidate_required"
    if flag in {"street_context_mismatch", "same_street_outlier"}:
        return "P2_external_candidate_useful"
    return "P2_manual_review"


def merge_suspect_diagnostics() -> list[dict[str, str]]:
    suspects = read_csv(SUSPECT_CSV)
    diagnostics_by_access = {as_text(row.get("access_id")): row for row in read_csv(DIAGNOSTIC_CSV)}
    rows: list[dict[str, str]] = []
    for row in suspects:
        access_id = as_text(row.get("access_id"))
        merged = dict(row)
        merged.update({key: value for key, value in diagnostics_by_access.get(access_id, {}).items() if value})
        merged["access_id"] = access_id
        merged["address_query"] = address_query(merged)
        merged["fallback_queries"] = " | ".join(query for _label, query in query_variants(merged)[1:])
        merged["priority"] = priority_for(merged)
        merged["source_lon"] = as_text(merged.get("coord_x") or merged.get("raw_coord_x"))
        merged["source_lat"] = as_text(merged.get("coord_y") or merged.get("raw_coord_y"))
        rows.append(merged)
    rows.sort(key=lambda item: (item["priority"], as_text(item.get("odonimo_raw")), as_text(item.get("civico")), item["access_id"]))
    return rows


def cache_key(query: str) -> str:
    return hashlib.sha256(query.encode("utf-8")).hexdigest()


def cached_response(query: str) -> list[dict[str, Any]] | None:
    path = CACHE_DIR / f"{cache_key(query)}.json"
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def write_cache(query: str, payload: list[dict[str, Any]]) -> None:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    path = CACHE_DIR / f"{cache_key(query)}.json"
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def request_nominatim(query: str, user_agent: str, timeout: float) -> list[dict[str, Any]]:
    params = {
        "q": query,
        "format": "jsonv2",
        "addressdetails": "1",
        "limit": "3",
        "countrycodes": "it",
        "accept-language": "it",
        "viewbox": ",".join(str(value) for value in [LAMEZIA_BBOX[0], LAMEZIA_BBOX[3], LAMEZIA_BBOX[2], LAMEZIA_BBOX[1]]),
        "bounded": "0",
    }
    url = f"{NOMINATIM_SEARCH_URL}?{urllib.parse.urlencode(params)}"
    request = urllib.request.Request(url, headers={"User-Agent": user_agent})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        if response.status != 200:
            raise RuntimeError(f"Nominatim returned HTTP {response.status}")
        payload = json.loads(response.read().decode("utf-8"))
    if not isinstance(payload, list):
        raise RuntimeError("Nominatim response is not a list")
    write_cache(query, payload)
    return payload


def haversine_m(lon1: float, lat1: float, lon2: float, lat2: float) -> float:
    if any(math.isnan(value) for value in [lon1, lat1, lon2, lat2]):
        return math.nan
    radius = 6_371_000.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return radius * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def within_lamezia_bbox(lon: float, lat: float) -> bool:
    west, south, east, north = LAMEZIA_BBOX
    return west <= lon <= east and south <= lat <= north


def query_has_house_number(query: str) -> bool:
    first_part = query.split(",", 1)[0]
    return bool(re.search(r"\b\d+\w*(?:/\w+)?\b", first_part))


def candidate_has_house_number(candidate: dict[str, Any]) -> bool:
    address = candidate.get("address")
    if isinstance(address, dict) and as_text(address.get("house_number")):
        return True
    return as_text(candidate.get("type")) in {"house", "building", "yes"}


def provider_confidence(candidate: dict[str, Any], query: str, distance_m: float) -> str:
    display = as_text(candidate.get("display_name")).upper()
    importance = as_float(candidate.get("importance"))
    place_rank = as_float(candidate.get("place_rank"))
    in_lamezia = "LAMEZIA" in display or "NICASTRO" in display or "SAMBIASE" in display or "SANT'EUFEMIA" in display
    has_house_number = candidate_has_house_number(candidate)
    if query_has_house_number(query) and not has_house_number:
        return "low_street_level"
    if in_lamezia and has_house_number and not math.isnan(distance_m) and distance_m <= 500 and importance >= 0.2:
        return "medium"
    if in_lamezia and has_house_number and (math.isnan(place_rank) or place_rank >= 26):
        return "medium"
    if in_lamezia:
        return "low"
    if "CALABRIA" in display:
        return "very_low"
    return "reject_outside_context"


def candidate_rows_for(row: dict[str, str], payload: list[dict[str, Any]], query: str, query_variant: str) -> list[dict[str, Any]]:
    source_lon = as_float(row.get("source_lon"))
    source_lat = as_float(row.get("source_lat"))
    out: list[dict[str, Any]] = []
    for index, candidate in enumerate(payload, start=1):
        lon = as_float(candidate.get("lon"))
        lat = as_float(candidate.get("lat"))
        distance = haversine_m(source_lon, source_lat, lon, lat)
        confidence = provider_confidence(candidate, query, distance)
        out.append(
            {
                "access_id": row["access_id"],
                "provider": "nominatim",
                "query": query,
                "query_variant": query_variant,
                "candidate_rank": index,
                "candidate_lon": "" if math.isnan(lon) else f"{lon:.7f}",
                "candidate_lat": "" if math.isnan(lat) else f"{lat:.7f}",
                "candidate_display_name": as_text(candidate.get("display_name")),
                "candidate_class": as_text(candidate.get("category") or candidate.get("class")),
                "candidate_type": as_text(candidate.get("type")),
                "candidate_importance": as_text(candidate.get("importance")),
                "candidate_place_rank": as_text(candidate.get("place_rank")),
                "candidate_has_house_number": "true" if candidate_has_house_number(candidate) else "false",
                "within_lamezia_bbox": "true" if within_lamezia_bbox(lon, lat) else "false",
                "distance_from_source_m": "" if math.isnan(distance) else f"{distance:.1f}",
                "provider_confidence": confidence,
                "candidate_status": "candidate_requires_human_review" if confidence != "reject_outside_context" else "rejected_context",
                "provider_license": "OpenStreetMap/Nominatim result; verify provider terms before bulk reuse",
                "cache_key": cache_key(query),
            }
        )
    if not out:
        out.append(
            {
                "access_id": row["access_id"],
                "provider": "nominatim",
                "query": query,
                "query_variant": query_variant,
                "candidate_rank": "",
                "candidate_status": "no_candidate_returned",
                "provider_license": "OpenStreetMap/Nominatim result; verify provider terms before bulk reuse",
                "cache_key": cache_key(query),
            }
        )
    return out


def write_report(
    *,
    planned_count: int,
    requested_count: int,
    cache_hits: int,
    candidate_rows: list[dict[str, Any]],
    dry_run: bool,
    limit: int,
    sleep_seconds: float,
    selection_filter: str,
    failures: list[str],
) -> None:
    counts = Counter(as_text(row.get("candidate_status")) for row in candidate_rows)
    confidence_counts = Counter(as_text(row.get("provider_confidence")) for row in candidate_rows if as_text(row.get("provider_confidence")))
    lines = [
        "# ANNCSU Coordinate External Geocode Candidates 2025",
        "",
        f"Date: {date.today().isoformat()}",
        "",
        "## Result",
        "",
        f"- Request plan rows: {planned_count}",
        f"- Requests attempted in this run: {requested_count}",
        f"- Cached provider responses reused: {cache_hits}",
        f"- Candidate rows written: {len(candidate_rows)}",
        f"- Dry run: {'yes' if dry_run else 'no'}",
        f"- Limit: {limit}",
        f"- Selection filter: {selection_filter or 'none'}",
        f"- Rate limit sleep seconds: {sleep_seconds}",
        f"- Request plan CSV: `{relpath(REQUEST_PLAN_CSV)}`",
        f"- Candidate CSV: `{relpath(CANDIDATES_CSV)}`",
        f"- Workbench candidate JSON: `{relpath(WORKBENCH_CANDIDATES_JSON)}`",
        f"- Cache directory: `{relpath(CACHE_DIR)}`",
        "",
        "This script creates coordinate candidates only. It does not overwrite ANNCSU raw coordinates, processed civic assignments, GPKG files, polygons, or public UI.",
        "",
        "## Provider Guardrails",
        "",
        f"- Provider: Nominatim search API ({NOMINATIM_SEARCH_URL}).",
        f"- Public usage policy: {NOMINATIM_POLICY_URL}.",
        "- Public Nominatim is not a bulk geocoding backend; use this script for small, cached, rate-limited QA batches or point it at a dedicated provider/internal instance.",
        "- API candidates require human review before they can become manual coordinate overrides.",
        "",
        "## Candidate Status Counts",
        "",
    ]
    if counts:
        for key, value in sorted(counts.items()):
            lines.append(f"- `{key}`: {value}")
    else:
        lines.append("- No candidate requests executed.")
    lines.extend(["", "## Provider Confidence Counts", ""])
    if confidence_counts:
        for key, value in sorted(confidence_counts.items()):
            lines.append(f"- `{key}`: {value}")
    else:
        lines.append("- No provider confidence values produced.")
    if failures:
        lines.extend(["", "## Failures", ""])
        for failure in failures:
            lines.append(f"- {failure}")
    lines.extend(
        [
            "",
            "## Next Review Step",
            "",
            "Use the candidate CSV as evidence in the local workbench. Accepted replacements must be exported as explicit `manual_coordinate_override` decisions with original coordinates, proposed coordinates, provider/query evidence, and reviewer confidence.",
        ]
    )
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate external geocoder candidates for ANNCSU coordinate suspects.")
    parser.add_argument("--execute", action="store_true", help="Call the provider. Without this flag only the request plan is written.")
    parser.add_argument("--limit", type=int, default=25, help="Maximum planned rows to request or mark in a dry run.")
    parser.add_argument("--sleep-seconds", type=float, default=1.1, help="Delay between uncached provider requests.")
    parser.add_argument("--timeout-seconds", type=float, default=20.0, help="HTTP timeout per provider request.")
    parser.add_argument("--user-agent", default=DEFAULT_USER_AGENT, help="Identifiable User-Agent for Nominatim requests.")
    parser.add_argument("--only-priority", default="", help="Optional exact priority value from the request plan.")
    parser.add_argument("--street-prefix", default="", help="Optional street-name prefix filter, e.g. VIA.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.limit < 0:
        print("--limit must be >= 0", file=sys.stderr)
        return 1
    if not SUSPECT_CSV.exists():
        print(f"missing_input={SUSPECT_CSV}", file=sys.stderr)
        return 1

    planned = merge_suspect_diagnostics()
    for row in planned:
        row["street"] = as_text(row.get("odonimo_raw"))
        row["civic"] = as_text(row.get("civico"))
        row["request_status"] = "planned"
        row["request_notes"] = "execute with --execute after confirming provider terms/rate limits"
    write_csv(REQUEST_PLAN_CSV, planned, REQUEST_FIELDS)

    street_prefix = as_text(args.street_prefix).upper()
    selected = [
        row
        for row in planned
        if (not args.only_priority or row.get("priority") == args.only_priority)
        and (not street_prefix or as_text(row.get("odonimo_raw")).upper().startswith(street_prefix))
    ]
    if args.limit:
        selected = selected[: args.limit]
    else:
        selected = []

    candidate_rows: list[dict[str, Any]] = []
    failures: list[str] = []
    requested_count = 0
    cache_hits = 0
    if args.execute:
        for row in selected:
            variants = query_variants(row)
            if not variants:
                continue
            found_payload = False
            row_failures: list[str] = []
            for query_variant, query in variants:
                payload = cached_response(query)
                if payload is not None:
                    cache_hits += 1
                else:
                    try:
                        payload = request_nominatim(query, args.user_agent, args.timeout_seconds)
                        requested_count += 1
                        time.sleep(max(args.sleep_seconds, 1.0))
                    except (urllib.error.URLError, TimeoutError, RuntimeError, json.JSONDecodeError) as exc:
                        row_failures.append(f"{query_variant}: {exc}")
                        continue
                if payload:
                    found_payload = True
                    candidate_rows.extend(candidate_rows_for(row, payload, query, query_variant))
                    break
            if not found_payload:
                if row_failures:
                    failures.append(f"{row['access_id']}: {'; '.join(row_failures)}")
                else:
                    candidate_rows.extend(candidate_rows_for(row, [], as_text(row.get("address_query")), "all_variants"))
    write_csv(CANDIDATES_CSV, candidate_rows, CANDIDATE_FIELDS)
    write_json(WORKBENCH_CANDIDATES_JSON, workbench_payload(candidate_rows))
    write_report(
        planned_count=len(planned),
        requested_count=requested_count,
        cache_hits=cache_hits,
        candidate_rows=candidate_rows,
        dry_run=not args.execute,
        limit=args.limit,
        sleep_seconds=args.sleep_seconds,
        selection_filter="; ".join(
            part
            for part in [
                f"priority={args.only_priority}" if args.only_priority else "",
                f"street_prefix={args.street_prefix}" if args.street_prefix else "",
            ]
            if part
        ),
        failures=failures,
    )

    print(f"request_plan_csv={REQUEST_PLAN_CSV}")
    print(f"candidate_csv={CANDIDATES_CSV}")
    print(f"workbench_candidate_json={WORKBENCH_CANDIDATES_JSON}")
    print(f"candidate_report={REPORT_PATH}")
    print(f"planned_rows={len(planned)}")
    print(f"provider_requests={requested_count}")
    print(f"candidate_rows={len(candidate_rows)}")
    if failures:
        print(f"failures={len(failures)}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
