from __future__ import annotations

import importlib.util
import json
import os
import tempfile
import unittest
from io import BytesIO
from pathlib import Path
from unittest.mock import patch

MODULE_PATH = Path(__file__).with_name("processor_contract.py")
SPEC = importlib.util.spec_from_file_location("docling_processor_contract", MODULE_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class ProcessorContractTest(unittest.TestCase):
    def base_request(self, source: bytes) -> dict:
        return {
            "schemaVersion": 2,
            "jobKey": "docling:v2:test",
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
            "limits": {"maxBytes": 100000, "maxPages": 20, "timeoutMs": 120000},
            "requestedOutputs": ["structured-json"],
        }

    @staticmethod
    def simple_pdf() -> bytes:
        from pypdf import PdfWriter

        buffer = BytesIO()
        writer = PdfWriter()
        writer.add_blank_page(width=72, height=72)
        writer.write(buffer)
        return buffer.getvalue()

    @classmethod
    def wrapper_pdf(cls, children: int = 1) -> tuple[bytes, bytes]:
        from pypdf import PdfWriter

        child = cls.simple_pdf()
        buffer = BytesIO()
        writer = PdfWriter()
        writer.add_blank_page(width=72, height=72)
        for index in range(children):
            writer.add_attachment(f"child-{index + 1}.pdf", child)
        writer.write(buffer)
        return buffer.getvalue(), child

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

    def test_extracts_exactly_one_embedded_pdf_with_child_provenance(self) -> None:
        wrapper, child = self.wrapper_pdf(children=1)
        index, derived, pages = MODULE.extract_single_embedded_pdf(
            wrapper,
            max_bytes=100000,
            max_pages=20,
        )
        self.assertEqual(index, 1)
        self.assertEqual(derived, child)
        self.assertEqual(MODULE.sha256_bytes(derived), MODULE.sha256_bytes(child))
        self.assertEqual(pages, 1)

    def test_multiple_embedded_pdfs_fail_closed(self) -> None:
        wrapper, _ = self.wrapper_pdf(children=2)
        with self.assertRaises(MODULE.UnsupportedEmbeddedSource):
            MODULE.extract_single_embedded_pdf(
                wrapper,
                max_bytes=100000,
                max_pages=20,
            )

    def test_model_artifact_path_is_explicit_and_nonempty(self) -> None:
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaises(FileNotFoundError):
                MODULE.model_artifacts_path()
        with tempfile.TemporaryDirectory() as directory:
            model_dir = Path(directory)
            (model_dir / "marker.bin").write_bytes(b"model")
            with patch.dict(os.environ, {"DOCLING_ARTIFACTS_PATH": directory}, clear=False):
                self.assertEqual(MODULE.model_artifacts_path(), model_dir.resolve())

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
