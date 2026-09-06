from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

REPO_ROOT = Path(__file__).resolve().parents[3]
SCHEMA_PATH = REPO_ROOT / "data/legalita/ltceds/reviewed-event-bundle-1.0.schema.json"


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
        key=lambda error: list(error.absolute_path),
    )
    return [
        {
            "path": ".".join(str(part) for part in error.absolute_path) or "$",
            "message": error.message,
        }
        for error in errors
    ]


def valid_fixture() -> dict:
    return {
        "bundle_schema_version": "ltceds-reviewed-bundle/1.0",
        "event_id": "018f3f2a-1111-7abc-8def-0123456789ab",
        "record_status": "published",
        "event_form": "discrete",
        "title": "Synthetic reviewed event",
        "temporal": {"start": "2026-01-02", "precision": "exact_date"},
        "offences": [
            {
                "offence_instance_id": "018f3f2a-2222-7abc-8def-0123456789ab",
                "classification_source_id": "018f3f2a-3333-7abc-8def-0123456789ab",
                "classification_basis": "provisional",
            }
        ],
        "locations": [],
        "sources": [
            {
                "source_id": "018f3f2a-3333-7abc-8def-0123456789ab",
                "source_type": "public_authority_primary",
                "provider": "Synthetic Authority",
                "title": "Synthetic source",
                "url": "https://example.invalid/source/1",
                "publication_support": "primary_possible",
                "candidate_policy": "automatic",
                "personal_data_risk": "low",
                "reputational_risk": "low",
                "requires_corroboration": False,
            }
        ],
        "cluster_ids": [],
        "review": {
            "reviewer_role": "editor",
            "reviewer_id": "editorial:ltceds",
            "reviewed_at": "2026-01-03T12:00:00Z",
            "decision": "approved",
            "rationale_codes": ["SOURCE_VERIFIED"],
            "public_text_checked": True,
        },
        "publication_intent": "publish",
    }


def self_test() -> None:
    check = validator()
    valid = valid_fixture()
    assert not list(check.iter_errors(valid)), "valid reviewed bundle must pass"

    person_field = json.loads(json.dumps(valid))
    person_field["suspect_name"] = "Synthetic Person"
    assert list(check.iter_errors(person_field)), "person identity field must be rejected"

    wrong_status = json.loads(json.dumps(valid))
    wrong_status["record_status"] = "verified_source"
    assert list(check.iter_errors(wrong_status)), "publish intent must require published status"

    unchecked_text = json.loads(json.dumps(valid))
    unchecked_text["review"]["public_text_checked"] = False
    assert list(check.iter_errors(unchecked_text)), "publish intent requires public text review"

    coarse_point = json.loads(json.dumps(valid))
    coarse_point["locations"] = [
        {
            "location_id": "018f3f2a-4444-7abc-8def-0123456789ab",
            "basis_source_id": "018f3f2a-3333-7abc-8def-0123456789ab",
            "role": "occurrence",
            "municipality": "Example Municipality",
            "evidence_basis": "source_stated_locality",
            "evidence_precision": "municipality",
            "resolved_precision": "municipality",
            "sensitivity": "unknown",
            "publication_risk": "unknown",
            "geometry": {"type": "Point", "coordinates": [16.25, 38.95]},
        }
    ]
    assert list(check.iter_errors(coarse_point)), "municipality precision cannot carry a point"


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Validate LTCEDS reviewed-event bundles with Draft 2020-12"
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
