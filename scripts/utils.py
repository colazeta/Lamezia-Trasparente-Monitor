from __future__ import annotations

import csv
import json
import re
import unicodedata
from pathlib import Path
from typing import Iterable


ROOT = Path(__file__).resolve().parents[1]
SOURCES_FILE = ROOT / "sources" / "sources.yml"
PROCESSED_DIR = ROOT / "data" / "processed"
INTERIM_TABLES_DIR = ROOT / "data" / "interim" / "extracted_tables"
QA_DIR = ROOT / "data" / "interim" / "qa"
RAW_DIR = ROOT / "data" / "raw"


CSV_HEADERS = {
    "elections.csv": [
        "election_id",
        "year",
        "election_type",
        "election_date_first_round",
        "election_date_second_round",
        "municipality_name",
        "municipality_istat_code",
        "province",
        "region",
        "ordinary_or_special",
        "notes",
        "primary_source_status",
        "eligendo_validation_status",
    ],
    "source_documents.csv": [
        "source_doc_id",
        "election_id",
        "publisher",
        "source_type",
        "title",
        "url",
        "local_path",
        "retrieval_date",
        "document_date",
        "file_format",
        "checksum_sha256",
        "extraction_method",
        "extraction_status",
        "confidence_level",
        "notes",
    ],
    "mayor_candidates.csv": [
        "mayor_candidate_id",
        "election_id",
        "round",
        "candidate_name",
        "normalised_candidate_name",
        "coalition_label",
        "source_doc_id",
        "notes",
    ],
    "lists.csv": [
        "list_id",
        "election_id",
        "list_name",
        "normalised_list_name",
        "mayor_candidate_id",
        "coalition_label",
        "source_doc_id",
        "notes",
    ],
    "council_candidates.csv": [
        "council_candidate_id",
        "election_id",
        "list_id",
        "candidate_name",
        "normalised_candidate_name",
        "source_doc_id",
        "notes",
    ],
    "sections.csv": [
        "election_id",
        "section_number",
        "section_label",
        "polling_place",
        "polling_place_address",
        "source_doc_id",
        "notes",
    ],
    "turnout_section.csv": [
        "election_id",
        "round",
        "section_number",
        "registered_voters",
        "voters",
        "valid_votes",
        "blank_ballots",
        "null_ballots",
        "contested_ballots",
        "source_doc_id",
        "validation_status",
        "notes",
    ],
    "votes_mayor_section.csv": [
        "election_id",
        "round",
        "section_number",
        "mayor_candidate_id",
        "votes",
        "source_doc_id",
        "validation_status",
        "notes",
    ],
    "votes_list_section.csv": [
        "election_id",
        "round",
        "section_number",
        "list_id",
        "votes",
        "source_doc_id",
        "validation_status",
        "notes",
    ],
    "preferences_section.csv": [
        "election_id",
        "section_number",
        "list_id",
        "council_candidate_id",
        "preference_votes",
        "source_doc_id",
        "validation_status",
        "notes",
    ],
}


def ensure_directories() -> None:
    for path in [
        RAW_DIR / "comune_lamezia",
        RAW_DIR / "eligendo",
        INTERIM_TABLES_DIR,
        QA_DIR,
        PROCESSED_DIR,
        ROOT / "data" / "geo",
        ROOT / "sources",
        ROOT / "docs",
        ROOT / "scripts",
    ]:
        path.mkdir(parents=True, exist_ok=True)


def ensure_processed_csvs() -> None:
    ensure_directories()
    for filename, headers in CSV_HEADERS.items():
        path = PROCESSED_DIR / filename
        if not path.exists():
            write_csv(path, [], headers)


def load_sources() -> list[dict]:
    with SOURCES_FILE.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    return list(data.get("sources", []))


def expand_source_entries(entries: Iterable[dict]) -> list[dict]:
    expanded: list[dict] = []
    for entry in entries:
        spec = entry.get("expand")
        if not spec:
            expanded.append(dict(entry))
            continue
        field = spec["field"]
        for value in spec["values"]:
            item = dict(entry)
            item.pop("expand", None)
            item[field] = value
            if "url_template" in item:
                item["url"] = item["url_template"].format(**{field: value})
            if "source_doc_id_template" in item:
                item["source_doc_id"] = item["source_doc_id_template"].format(**{field: value})
            if "title_template" in item:
                item["title"] = item["title_template"].format(**{field: value})
            item.pop("url_template", None)
            item.pop("source_doc_id_template", None)
            item.pop("title_template", None)
            expanded.append(item)
    return expanded


def read_csv(path: Path) -> list[dict]:
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def write_csv(path: Path, rows: Iterable[dict], headers: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=headers, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow({header: row.get(header, "") for header in headers})


def upsert_rows(path: Path, key: str, rows: Iterable[dict], headers: list[str]) -> None:
    existing = {row.get(key, ""): row for row in read_csv(path)}
    for row in rows:
        existing[row.get(key, "")] = row
    ordered = [existing[k] for k in sorted(existing)]
    write_csv(path, ordered, headers)


def normalize_text(value: str) -> str:
    value = unicodedata.normalize("NFKD", value or "")
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    value = re.sub(r"\s+", " ", value).strip().upper()
    return value


def slugify(value: str, max_len: int = 80) -> str:
    value = unicodedata.normalize("NFKD", value or "")
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    value = re.sub(r"[^A-Za-z0-9]+", "_", value).strip("_").lower()
    return (value[:max_len].strip("_") or "unknown")


def relpath(path: Path) -> str:
    return str(path.resolve().relative_to(ROOT)).replace("\\", "/")


def int_value(value: str | int | None) -> int:
    if value in (None, ""):
        return 0
    return int(str(value))


def unique_rows(rows: Iterable[dict], keys: list[str]) -> list[dict]:
    seen = set()
    output = []
    for row in rows:
        signature = tuple(row.get(key, "") for key in keys)
        if signature in seen:
            continue
        seen.add(signature)
        output.append(row)
    return output
