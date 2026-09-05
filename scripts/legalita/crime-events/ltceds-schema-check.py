from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

REPO_ROOT = Path(__file__).resolve().parents[3]
SCHEMA_PATH = REPO_ROOT / "data/legalita/ltceds/public-event-1.0-draft.1.schema.json"


def load_json(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def validator() -> Draft202012Validator:
    schema = load_json(SCHEMA_PATH)
    Draft202012Validator.check_schema(schema)
    return Draft202012Validator(schema, format_checker=FormatChecker())


def validate_path(path: Path) -> list[dict[str, str]]:
    instance = load_json(path)
    errors = sorted(validator().iter_errors(instance), key=lambda error: list(error.absolute_path))
    return [
        {
            "path": ".".join(str(part) for part in error.absolute_path) or "$",
            "message": error.message,
        }
        for error in errors
    ]


def self_test() -> None:
    check = validator()
    valid = {
        "event_id": "018f3f2a-1111-7abc-8def-0123456789ab",
        "schema_version": "1.0-draft.1",
        "record_status": "published",
        "event_form": "discrete",
        "title": "Synthetic documented event",
        "temporal": {"start": "2026-01-02", "precision": "exact_date"},
        "privacy_tier": "open",
        "locations": [
            {
                "role": "occurrence",
                "municipality": "Example Municipality",
                "precision": "exact_public_site",
                "sensitivity": "public_place",
                "privacy_transform": "none",
                "geometry": {"type": "Point", "coordinates": [16.25, 38.95]},
            }
        ],
        "offences": [
            {
                "offence_instance_id": "018f3f2a-2222-7abc-8def-0123456789ab",
                "classification_basis": "provisional",
            }
        ],
        "sources": [
            {
                "source_id": "018f3f2a-3333-7abc-8def-0123456789ab",
                "source_type": "public_authority_primary",
            }
        ],
        "updated_at": "2026-01-03T12:00:00Z",
    }
    assert not list(check.iter_errors(valid)), "valid synthetic fixture must pass JSON Schema"

    schema_invalid = dict(valid)
    schema_invalid.pop("sources")
    assert list(check.iter_errors(schema_invalid)), "missing required sources must fail JSON Schema"

    private_exact = json.loads(json.dumps(valid))
    private_exact["privacy_tier"] = "generalised"
    private_exact["locations"][0]["precision"] = "exact_address"
    private_exact["locations"][0]["sensitivity"] = "private_or_sensitive"
    assert list(check.iter_errors(private_exact)), "private exact public geometry must fail JSON Schema"


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate LTCEDS public-event JSON with Draft 2020-12")
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
                print(json.dumps({"file": str(path), "valid": False, "errors": errors}, ensure_ascii=False))
            else:
                print(json.dumps({"file": str(path), "valid": True}, ensure_ascii=False))
        if args.self_test:
            print(json.dumps({"self_test": "passed", "schema": str(SCHEMA_PATH.relative_to(REPO_ROOT))}))
        return 1 if failures else 0
    except Exception as exc:  # fail closed with stable stderr
        print(json.dumps({"valid": False, "error": str(exc)}, ensure_ascii=False), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
