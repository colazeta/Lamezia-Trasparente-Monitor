#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

SCHEMA_VERSION = 1

FINANCE_PATTERNS = (
    r"\bbilancio\b",
    r"\brendiconto\b",
    r"\bassestament",
    r"salvaguardia.*equilibri",
    r"debiti fuori bilancio",
    r"\bvariazion.*bilancio",
    r"\btribut",
)
PROCUREMENT_PATTERNS = (
    r"\bpnrr\b",
    r"\bcup\b",
    r"\bcig\b",
    r"\baffidament",
    r"\bappalt",
    r"\bgara\b",
    r"determina.*contrarre",
    r"\blavori\b",
    r"\bfornitura\b",
)


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def matches_any(text: str, patterns: tuple[str, ...]) -> bool:
    return any(re.search(pattern, text, flags=re.IGNORECASE) for pattern in patterns)


def candidate_record(item: dict[str, Any], archived: dict[str, Any]) -> dict[str, Any]:
    classification = item.get("classification") or {}
    act_category = (classification.get("act_category") or {}).get("id")
    sector = (classification.get("sector") or {}).get("id")
    presentation = item.get("presentation") or {}
    area_theme = (presentation.get("area_theme") or {}).get("theme_id")
    return {
        "id": item.get("id"),
        "publicationNumber": item.get("publication_number"),
        "sha256": archived.get("sha256"),
        "storagePath": archived.get("storage_path"),
        "sizeBytes": archived.get("size_bytes"),
        "actCategory": act_category,
        "sector": sector,
        "areaTheme": area_theme,
    }


def build_pool(latest: dict[str, Any], manifest: dict[str, Any]) -> list[dict[str, Any]]:
    archived_by_publication = {
        document.get("publication_number"): document
        for document in manifest.get("documents", [])
        if document.get("preservation_status") == "archived"
        and document.get("storage_path")
        and document.get("sha256")
    }

    pool: list[dict[str, Any]] = []
    for item in latest.get("items", []):
        publication_number = item.get("publication_number")
        archived = archived_by_publication.get(publication_number)
        if not archived:
            continue
        if item.get("public_visibility") != "publishable":
            continue
        if item.get("privacy_risk") != "low":
            continue
        if archived.get("public_visibility") != "publishable":
            continue
        if archived.get("privacy_risk") != "low":
            continue

        record = candidate_record(item, archived)
        subject = str(item.get("subject") or "")
        record["_finance"] = matches_any(subject, FINANCE_PATTERNS) or record["areaTheme"] == "bilancio_tributi" or record["sector"] == "bilancio_finanze"
        record["_procurement"] = matches_any(subject, PROCUREMENT_PATTERNS)
        record["_ordinary"] = record["actCategory"] in {"determinazioni", "deliberazioni"} and not record["_finance"] and not record["_procurement"]
        pool.append(record)

    return pool


def select_candidates(pool: list[dict[str, Any]], per_class: int = 2) -> list[dict[str, Any]]:
    selected: list[dict[str, Any]] = []
    used: set[str] = set()

    def add(records: list[dict[str, Any]], benchmark_class: str, limit: int) -> None:
        for record in records:
            sha = str(record.get("sha256") or "")
            if not sha or sha in used:
                continue
            clean = {key: value for key, value in record.items() if not key.startswith("_")}
            clean["benchmarkClass"] = benchmark_class
            clean["contentPolicy"] = "metrics-only"
            selected.append(clean)
            used.add(sha)
            if sum(1 for item in selected if item["benchmarkClass"] == benchmark_class) >= limit:
                break

    finance = sorted(
        [record for record in pool if record["_finance"]],
        key=lambda record: (-int(record.get("sizeBytes") or 0), str(record.get("publicationNumber") or "")),
    )
    procurement = sorted(
        [record for record in pool if record["_procurement"]],
        key=lambda record: (-int(record.get("sizeBytes") or 0), str(record.get("publicationNumber") or "")),
    )
    ordinary = sorted(
        [record for record in pool if record["_ordinary"]],
        key=lambda record: (int(record.get("sizeBytes") or 0), str(record.get("publicationNumber") or "")),
    )
    largest = sorted(
        pool,
        key=lambda record: (-int(record.get("sizeBytes") or 0), str(record.get("publicationNumber") or "")),
    )

    add(finance, "financial-layout-candidate", per_class)
    add(procurement, "pnrr-procurement-candidate", per_class)
    add(ordinary, "ordinary-born-digital-candidate", 1)
    add(largest, "large-layout-candidate", 1)
    return selected


def main() -> int:
    parser = argparse.ArgumentParser(description="Select a bounded metrics-only Docling corpus from public-safe Albo metadata.")
    parser.add_argument("--latest", type=Path, default=Path("data/public/albo/latest.json"))
    parser.add_argument("--manifest", type=Path, default=Path("data/public/albo/documents-manifest.json"))
    parser.add_argument("--output", type=Path, default=Path("tmp/docling/corpus/candidates.json"))
    parser.add_argument("--per-class", type=int, default=2)
    args = parser.parse_args()

    if args.per_class <= 0:
        raise SystemExit("--per-class must be greater than zero")

    latest = load_json(args.latest)
    manifest = load_json(args.manifest)
    pool = build_pool(latest, manifest)
    selected = select_candidates(pool, per_class=args.per_class)

    payload = {
        "schemaVersion": SCHEMA_VERSION,
        "mode": "metrics-only",
        "selectionPolicy": {
            "requiredPublicVisibility": "publishable",
            "requiredPrivacyRisk": "low",
            "requiredPreservationStatus": "archived",
            "contentRetained": False,
            "classes": [
                "financial-layout-candidate",
                "pnrr-procurement-candidate",
                "ordinary-born-digital-candidate",
                "large-layout-candidate",
            ],
        },
        "eligiblePoolCount": len(pool),
        "selectedCount": len(selected),
        "items": selected,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(payload, indent=2, ensure_ascii=False))
    return 0 if selected else 1


if __name__ == "__main__":
    raise SystemExit(main())
