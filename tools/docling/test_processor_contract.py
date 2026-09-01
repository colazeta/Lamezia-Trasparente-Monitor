from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).with_name("processor_contract.py")
SPEC = importlib.util.spec_from_file_location("docling_processor_contract", MODULE_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class ProcessorContractTest(unittest.TestCase):
    def base_request(self, source: bytes) -> dict:
        return {
            "schemaVersion": 1,
            "jobKey": "docling:v1:test",
            "representationKind": "derived-noncanonical",
            "source": {
                "sha256": MODULE.sha256_bytes(source),
                "contentType": "application/pdf",
                "sizeBytes": len(source),
            },
            "selection": {
                "reason": "embedded-pdf-container",
                "baseline": {
                    "status": "ok",
                    "characters": 810,
                    "pages": 1,
                    "hasEmbeddedPdf": True,
                },
            },
            "target": {"processor": "docling", "processorVersion": "2.124.0"},
            "limits": {"maxBytes": 10000, "maxPages": 20, "timeoutMs": 120000},
            "requestedOutputs": ["structured-json"],
        }

    def test_accepts_only_already_supplied_matching_source_bytes(self) -> None:
        source = b"%PDF-1.4\ncontract-test\n"
        MODULE.validate_transport(self.base_request(source), source)

    def test_rejects_source_hash_mismatch(self) -> None:
        source = b"%PDF-1.4\ncontract-test\n"
        request = self.base_request(source)
        request["source"]["sha256"] = "0" * 64
        with self.assertRaisesRegex(ValueError, "SHA-256 mismatch"):
            MODULE.validate_transport(request, source)

    def test_rejects_unpromoted_reason(self) -> None:
        source = b"%PDF-1.4\ncontract-test\n"
        request = self.base_request(source)
        request["selection"]["reason"] = "scan-like-sparse-baseline"
        with self.assertRaisesRegex(ValueError, "only embedded-pdf-container"):
            MODULE.validate_transport(request, source)

    def test_rejects_markdown_without_structured_json(self) -> None:
        source = b"%PDF-1.4\ncontract-test\n"
        request = self.base_request(source)
        request["requestedOutputs"] = ["markdown"]
        with self.assertRaisesRegex(ValueError, "structured-json is mandatory"):
            MODULE.validate_transport(request, source)

    def test_failed_result_never_contains_source_path_or_text(self) -> None:
        source = b"%PDF-1.4\ncontract-test\n"
        request = self.base_request(source)
        result = MODULE.failed_result(
            request,
            code="dependency-missing",
            retryable=False,
            duration_ms=1,
        )
        encoded = json.dumps(result)
        self.assertNotIn("path", encoded.lower())
        self.assertNotIn("contract-test", encoded)


if __name__ == "__main__":
    unittest.main()
