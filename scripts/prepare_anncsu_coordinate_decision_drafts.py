from __future__ import annotations

import argparse
import json
import math
import sys
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any

from electoral_geo_utils import QA_DIR, read_csv_rows, relpath


REVIEW_QUEUE_CSV = QA_DIR / "anncsu_coordinate_review_priority_queue_2025.csv"
DRAFT_JSON = QA_DIR / "anncsu_coordinate_decision_drafts_batch_1_2025.json"
REPORT_PATH = QA_DIR / "anncsu_coordinate_decision_drafts_batch_1_report_2025.md"

DEFAULT_BATCH_ID = "anncsu_coordinate_review_batch_1_2025"


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


def decimal_text(value: Any) -> str:
    parsed = as_float(value)
    if math.isnan(parsed):
        return ""
    return f"{parsed:.7f}".rstrip("0").rstrip(".")


def sort_key(row: dict[str, str]) -> tuple[int, str]:
    rank = as_float(row.get("review_rank"))
    return (int(rank) if not math.isnan(rank) else 999_999, as_text(row.get("access_id")))


def decision_for(row: dict[str, str]) -> dict[str, Any]:
    access_id = as_text(row.get("access_id"))
    source_lon = decimal_text(row.get("source_lon"))
    source_lat = decimal_text(row.get("source_lat"))
    proposed_lon = decimal_text(row.get("candidate_lon"))
    proposed_lat = decimal_text(row.get("candidate_lat"))
    evidence_snapshot = {
        "draft_source": "scripts/prepare_anncsu_coordinate_decision_drafts.py",
        "draft_policy": "not_training_ready_until_human_reviewed",
        "selected_civic_coordinate_quality": {
            "access_id": access_id,
            "street": as_text(row.get("street")),
            "civico": as_text(row.get("civico")),
            "esponente": as_text(row.get("esponente")),
            "coordinate_quality_flag": as_text(row.get("coordinate_quality_flag")),
            "coordinate_suspect_reason": as_text(row.get("coordinate_suspect_reason")),
            "source_lon": source_lon,
            "source_lat": source_lat,
        },
        "review_queue": {
            "review_rank": as_text(row.get("review_rank")),
            "review_batch_id": as_text(row.get("review_batch_id")),
            "review_priority_band": as_text(row.get("review_priority_band")),
            "candidate_review_status": as_text(row.get("candidate_review_status")),
            "recommended_review_action": as_text(row.get("recommended_review_action")),
        },
        "local_anchor_candidate": {
            "candidate_method": as_text(row.get("candidate_method")),
            "candidate_status": as_text(row.get("candidate_status")),
            "candidate_confidence": as_text(row.get("candidate_confidence")),
            "candidate_lon": proposed_lon,
            "candidate_lat": proposed_lat,
            "distance_from_source_m": as_text(row.get("distance_from_source_m")),
            "anchor_count": as_text(row.get("anchor_count")),
            "numeric_anchor_count": as_text(row.get("numeric_anchor_count")),
            "nearest_anchor_access_id": as_text(row.get("nearest_anchor_access_id")),
            "nearest_anchor_civic": as_text(row.get("nearest_anchor_civic")),
            "nearest_anchor_distance_m": as_text(row.get("nearest_anchor_distance_m")),
            "candidate_explanation": as_text(row.get("candidate_explanation")),
        },
    }
    relocation_support_snapshot = {
        "access_id": access_id,
        "source_lon": source_lon,
        "source_lat": source_lat,
        "proposed_lon": proposed_lon,
        "proposed_lat": proposed_lat,
        "coordinate_quality_flag": as_text(row.get("coordinate_quality_flag")),
        "coordinate_suspect_reason": as_text(row.get("coordinate_suspect_reason")),
        "coordinate_review_batch": [
            {
                "review_rank": as_text(row.get("review_rank")),
                "review_batch_id": as_text(row.get("review_batch_id")),
                "review_priority_band": as_text(row.get("review_priority_band")),
                "candidate_review_status": as_text(row.get("candidate_review_status")),
                "candidate_method": as_text(row.get("candidate_method")),
                "candidate_confidence": as_text(row.get("candidate_confidence")),
                "candidate_lon": proposed_lon,
                "candidate_lat": proposed_lat,
                "distance_from_source_m": as_text(row.get("distance_from_source_m")),
            }
        ],
        "local_anchor_candidates": [
            {
                "provider": "local_anncsu_anchor",
                "candidate_method": as_text(row.get("candidate_method")),
                "candidate_status": as_text(row.get("candidate_status")),
                "candidate_confidence": as_text(row.get("candidate_confidence")),
                "candidate_lon": proposed_lon,
                "candidate_lat": proposed_lat,
                "distance_from_source_m": as_text(row.get("distance_from_source_m")),
                "anchor_count": as_text(row.get("anchor_count")),
                "numeric_anchor_count": as_text(row.get("numeric_anchor_count")),
                "candidate_explanation": as_text(row.get("candidate_explanation")),
            }
        ],
        "external_geocode_candidates": [],
        "draft_warning": "Draft only. Reviewer must inspect evidence before changing follow-up flags or confidence.",
    }
    return {
        "decision_id": f"draft-coordinate-override:{access_id}",
        "task_id": f"coordinate-draft:{access_id}",
        "decision_scope": "single_civic",
        "selected_access_ids": access_id,
        "odonimo_raw": as_text(row.get("street")),
        "civic_from": as_text(row.get("civico")),
        "civic_to": as_text(row.get("civico")),
        "civic_parity": "",
        "includes_snc": False,
        "proposed_section_number": "",
        "decision_type": "needs_manual_review",
        "decision_confidence": "draft",
        "reason": "Draft generated from ANNCSU coordinate review queue; requires human workbench review.",
        "street_register_rule_ids_used": "",
        "street_register_pages_used": "",
        "qgis_observation": "",
        "reviewed_by": "",
        "review_date": "",
        "requires_follow_up": True,
        "coordinate_decision_type": "manual_coordinate_override",
        "original_lon": source_lon,
        "original_lat": source_lat,
        "proposed_lon": proposed_lon,
        "proposed_lat": proposed_lat,
        "coordinate_decision_confidence": "draft",
        "coordinate_reason": "Draft local ANNCSU anchor candidate; reviewer must confirm before recovery-layer use.",
        "exclude_from_geometry": False,
        "requires_external_coordinate_check": True,
        "relocation_support_snapshot": relocation_support_snapshot,
        "notes": as_text(row.get("notes")),
        "evidence_snapshot": evidence_snapshot,
        "saved_at": "",
        "draft_status": "requires_human_review_before_audit",
    }


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_report(path: Path, decisions: list[dict[str, Any]], selected_rows: list[dict[str, str]], batch_id: str) -> None:
    confidence_counts = Counter(as_text(row.get("candidate_confidence")) for row in selected_rows)
    method_counts = Counter(as_text(row.get("candidate_method")) for row in selected_rows)
    lines = [
        "# ANNCSU Coordinate Decision Drafts Batch 1 2025",
        "",
        f"Date: {date.today().isoformat()}",
        "",
        "## Result",
        "",
        f"- Batch ID: `{batch_id}`",
        f"- Draft decisions: {len(decisions)}",
        f"- Draft JSON: `{relpath(DRAFT_JSON)}`",
        "",
        "These draft decisions are not accepted coordinate overrides. They intentionally keep `requires_follow_up=true`, `requires_external_coordinate_check=true`, blank reviewer metadata, and `coordinate_decision_confidence=draft`, so `scripts/audit_anncsu_coordinate_decisions.py --decisions` must block them until a human reviewer edits and accepts each row.",
        "",
        "## Candidate Confidence Counts",
        "",
    ]
    for key, value in sorted(confidence_counts.items()):
        lines.append(f"- `{key or 'blank'}`: {value}")
    lines.extend(["", "## Candidate Method Counts", ""])
    for key, value in sorted(method_counts.items()):
        lines.append(f"- `{key or 'blank'}`: {value}")
    lines.extend(
        [
            "",
            "## How To Use",
            "",
            "1. Open each `access_id` in the local workbench.",
            "2. Compare the proposed point against ANNCSU label, street-register evidence, map context, and any external geocoder evidence.",
            "3. Only after review, set reviewer metadata, review date, coordinate confidence (`high` or `medium`), and clear follow-up/external-check flags.",
            "4. Run `scripts/audit_anncsu_coordinate_decisions.py --decisions <edited-json>`.",
            "5. Use the recovery layer only after P0/P1 findings are resolved.",
            "",
            "## Guardrails",
            "",
            "- Do not pass this draft JSON directly to recovery as accepted coordinates.",
            "- Do not train from these draft rows.",
            "- Do not modify ANNCSU raw coordinates.",
        ]
    )
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Prepare non-applicable draft coordinate decisions for manual ANNCSU review.")
    parser.add_argument("--batch-id", default=DEFAULT_BATCH_ID, help="Review batch id to export as draft decisions.")
    parser.add_argument("--limit", type=int, default=50, help="Maximum draft decisions to write.")
    parser.add_argument("--output", type=Path, default=DRAFT_JSON, help="Draft decision JSON path.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not REVIEW_QUEUE_CSV.exists():
        print(f"missing_input={REVIEW_QUEUE_CSV}", file=sys.stderr)
        return 1
    if args.limit <= 0:
        print("--limit must be positive", file=sys.stderr)
        return 1

    rows = [
        row
        for row in read_csv_rows(REVIEW_QUEUE_CSV)
        if as_text(row.get("review_batch_id")) == args.batch_id
        and as_text(row.get("candidate_status")) == "candidate_requires_human_review"
        and decimal_text(row.get("candidate_lon"))
        and decimal_text(row.get("candidate_lat"))
    ]
    selected_rows = sorted(rows, key=sort_key)[: args.limit]
    decisions = [decision_for(row) for row in selected_rows]
    payload = {
        "exported_at": "",
        "export_format": "anncsu_coordinate_decision_drafts_v1",
        "draft_status": "requires_human_review_before_audit",
        "source_csv": relpath(REVIEW_QUEUE_CSV),
        "batch_id": args.batch_id,
        "guardrail": "Draft decisions are intentionally audit-blocking until reviewed.",
        "decisions": decisions,
    }
    write_json(args.output, payload)
    write_report(REPORT_PATH, decisions, selected_rows, args.batch_id)

    print(f"draft_json={args.output}")
    print(f"draft_report={REPORT_PATH}")
    print(f"draft_decisions={len(decisions)}")
    print("audit_expected=blocking_until_human_reviewed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
