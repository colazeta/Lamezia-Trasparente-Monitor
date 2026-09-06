from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

REPO_ROOT = Path(__file__).resolve().parents[3]
SCHEMA_PATH = REPO_ROOT / "data/legalita/ltceds/event-cluster-1.0-draft.2.schema.json"


def load_json(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def validator() -> Draft202012Validator:
    schema = load_json(SCHEMA_PATH)
    Draft202012Validator.check_schema(schema)
    return Draft202012Validator(schema, format_checker=FormatChecker())


def validate_path(path: Path) -> list[dict[str, str]]:
    instance = load_json(path)
    errors = sorted(
        validator().iter_errors(instance),
        key=lambda error: [str(part) for part in error.absolute_path],
    )
    return [
        {
            "path": ".".join(str(part) for part in error.absolute_path) or "$",
            "message": error.message,
        }
        for error in errors
    ]


def synthetic_cluster() -> dict:
    cluster_id = "0199a8f2-9a34-7e70-8437-1028521c1d29"
    return {
        "cluster_id": cluster_id,
        "schema_version": "1.0-draft.2",
        "reported_event_count": 27,
        "reported_count_text": None,
        "count_precision": "exact",
        "resolution_status": "unresolved",
        "resolved_event_ids": [],
        "assertions": [
            {
                "assertion_id": "0199a8f2-9a35-7b60-8c14-111111111111",
                "subject_type": "event_cluster",
                "subject_id": cluster_id,
                "predicate": "temporal_scope",
                "scope": "investigation_seed",
                "value": {
                    "type": "temporal",
                    "start": "2025-02-28",
                    "end": "2025-03-01",
                    "edtf": None,
                    "precision": "bounded_interval",
                },
                "source_id": "0199a8f2-9a36-7c20-8d15-222222222222",
                "assertion_mode": "explicit",
                "source_locator": "synthetic seed window",
                "subset_descriptor": None,
            },
            {
                "assertion_id": "0199a8f2-9a37-7d30-8e16-333333333333",
                "subject_type": "event_cluster",
                "subject_id": cluster_id,
                "predicate": "geographic_scope",
                "scope": "cluster_context",
                "value": {
                    "type": "geographic",
                    "place_name": "Example city centre and district",
                    "precision": "locality",
                },
                "source_id": "0199a8f2-9a36-7c20-8d15-222222222222",
                "assertion_mode": "explicit",
                "source_locator": "synthetic aggregate geography",
                "subset_descriptor": None,
            },
        ],
        "updated_at": "2026-09-06T17:00:00Z",
    }


def self_test() -> None:
    check = validator()

    exact_cluster = synthetic_cluster()
    assert not list(check.iter_errors(exact_cluster)), "valid exact-count cluster must pass"

    approximate = synthetic_cluster()
    approximate["reported_event_count"] = None
    approximate["reported_count_text"] = "several hundred"
    approximate["count_precision"] = "approximate"
    approximate["assertions"] = [
        {
            "assertion_id": "0199a8f2-9a38-7e40-8f17-444444444444",
            "subject_type": "event_cluster",
            "subject_id": approximate["cluster_id"],
            "predicate": "target_class",
            "scope": "cluster_context",
            "value": {"type": "text", "text": "business and commercial activities"},
            "source_id": "0199a8f2-9a39-7f50-8a18-555555555555",
            "assertion_mode": "explicit",
            "source_locator": "synthetic approximate-count source",
            "subset_descriptor": None,
        }
    ]
    assert not list(check.iter_errors(approximate)), "source-faithful approximate count text must pass"

    no_count = json.loads(json.dumps(approximate))
    no_count["reported_count_text"] = None
    assert list(check.iter_errors(no_count)), "approximate cluster without count/text must fail"

    with_member = json.loads(json.dumps(exact_cluster))
    with_member["resolved_event_ids"] = ["0199a8f2-9a40-7a60-8b19-666666666666"]
    assert list(check.iter_errors(with_member)), "unresolved cluster cannot contain resolved EVENT IDs"

    geographic_point = json.loads(json.dumps(exact_cluster))
    geographic_point["assertions"][1]["value"]["geometry"] = {
        "type": "Point",
        "coordinates": [16.25, 38.95],
    }
    assert list(check.iter_errors(geographic_point)), "cluster geography must reject point geometry"

    subset_without_descriptor = json.loads(json.dumps(exact_cluster))
    subset_without_descriptor["assertions"][0]["scope"] = "member_subset"
    subset_without_descriptor["assertions"][0]["subset_descriptor"] = None
    assert list(check.iter_errors(subset_without_descriptor)), "member_subset requires descriptor"


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Validate LTCEDS event-cluster 1.0-draft.2 JSON with Draft 2020-12"
    )
    parser.add_argument("paths", nargs="*", type=Path)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    try:
        Draft202012Validator.check_schema(load_json(SCHEMA_PATH))
        if args.self_test:
            self_test()
        failures = 0
        for path in args.paths:
            errors = validate_path(path)
            if errors:
                failures += 1
                print(
                    json.dumps(
                        {"file": str(path), "valid": False, "errors": errors},
                        ensure_ascii=False,
                    )
                )
            else:
                print(json.dumps({"file": str(path), "valid": True}, ensure_ascii=False))
        if args.self_test:
            print(
                json.dumps(
                    {
                        "self_test": "passed",
                        "schema": str(SCHEMA_PATH.relative_to(REPO_ROOT)),
                    }
                )
            )
        return 1 if failures else 0
    except Exception as exc:
        print(json.dumps({"valid": False, "error": str(exc)}, ensure_ascii=False), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
