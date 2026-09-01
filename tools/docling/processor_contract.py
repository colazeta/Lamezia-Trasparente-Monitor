#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import time
from datetime import datetime, timezone
from importlib.metadata import PackageNotFoundError, version
from io import BytesIO
from pathlib import Path
from typing import Any, Iterable

SUPPORTED_REASON = "embedded-pdf-container"
REPRESENTATION_KIND = "derived-noncanonical"
SCHEMA_VERSION = 1
EXPECTED_PYPDF_VERSION = "6.16.2"
PDF_HEADER_SCAN_BYTES = 1024


class ProcessorSkip(Exception):
    def __init__(self, code: str):
        super().__init__(code)
        self.code = code


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def package_version(name: str) -> str:
    try:
        return version(name)
    except PackageNotFoundError:
        return "not-installed"


def load_request(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError("request must be a JSON object")
    return value


def validate_transport(request: dict[str, Any], source: bytes) -> None:
    if request.get("schemaVersion") != SCHEMA_VERSION:
        raise ValueError("unsupported schemaVersion")
    if request.get("representationKind") != REPRESENTATION_KIND:
        raise ValueError("representationKind must be derived-noncanonical")

    selection = request.get("selection") or {}
    if selection.get("reason") != SUPPORTED_REASON:
        raise ValueError("processor currently accepts only embedded-pdf-container")

    target = request.get("target") or {}
    if target.get("processor") != "docling":
        raise ValueError("target processor must be docling")

    source_meta = request.get("source") or {}
    if source_meta.get("contentType") != "application/pdf":
        raise ValueError("source contentType must be application/pdf")
    if source_meta.get("sizeBytes") != len(source):
        raise ValueError("source byte size mismatch")
    if source_meta.get("sha256") != sha256_bytes(source):
        raise ValueError("source SHA-256 mismatch")

    limits = request.get("limits") or {}
    max_bytes = int(limits.get("maxBytes") or 0)
    if max_bytes <= 0 or len(source) > max_bytes:
        raise ValueError("source exceeds maxBytes")

    outputs = request.get("requestedOutputs")
    if not isinstance(outputs, list) or "structured-json" not in outputs:
        raise ValueError("structured-json is mandatory")
    if any(item not in {"structured-json", "markdown"} for item in outputs):
        raise ValueError("unsupported requested output")
    if len(set(outputs)) != len(outputs):
        raise ValueError("requested outputs must be unique")


def failed_result(
    request: dict[str, Any],
    *,
    code: str,
    retryable: bool,
    duration_ms: int,
) -> dict[str, Any]:
    return {
        "schemaVersion": SCHEMA_VERSION,
        "jobKey": request.get("jobKey"),
        "sourceSha256": (request.get("source") or {}).get("sha256"),
        "representationKind": REPRESENTATION_KIND,
        "processor": {
            "name": "docling",
            "version": (request.get("target") or {}).get("processorVersion")
            or package_version("docling"),
        },
        "extractedAt": utc_now(),
        "status": "failed",
        "durationMs": duration_ms,
        "failure": {"code": code, "retryable": retryable},
    }


def skipped_result(
    request: dict[str, Any], *, code: str, duration_ms: int, processor_version: str
) -> dict[str, Any]:
    return {
        "schemaVersion": SCHEMA_VERSION,
        "jobKey": request.get("jobKey"),
        "sourceSha256": (request.get("source") or {}).get("sha256"),
        "representationKind": REPRESENTATION_KIND,
        "processor": {"name": "docling", "version": processor_version},
        "extractedAt": utc_now(),
        "status": "skipped",
        "durationMs": duration_ms,
        "skip": {"code": code},
    }


def looks_like_pdf(payload: bytes) -> bool:
    return b"%PDF-" in payload[:PDF_HEADER_SCAN_BYTES]


def select_single_embedded_pdf(attachments: Iterable[Any]) -> dict[str, Any]:
    candidates: list[dict[str, Any]] = []
    for index, attachment in enumerate(attachments, start=1):
        name = str(
            getattr(attachment, "name", "")
            or getattr(attachment, "alternative_name", "")
            or ""
        )
        payload = bytes(getattr(attachment, "content", b""))
        if name.lower().endswith(".pdf") and looks_like_pdf(payload):
            candidates.append(
                {
                    "index": index,
                    "payload": payload,
                    "sha256": sha256_bytes(payload),
                    "sizeBytes": len(payload),
                }
            )

    if len(candidates) != 1:
        raise ProcessorSkip("unsupported-source")
    return candidates[0]


def structured_envelope(
    *,
    request: dict[str, Any],
    child: dict[str, Any],
    pypdf_version: str,
    docling_version: str,
    document: dict[str, Any],
) -> dict[str, Any]:
    return {
        "schemaName": "lt-docling-embedded-envelope",
        "schemaVersion": SCHEMA_VERSION,
        "representationKind": REPRESENTATION_KIND,
        "parentSource": {
            "sha256": request["source"]["sha256"],
            "sizeBytes": request["source"]["sizeBytes"],
        },
        "embeddedSource": {
            "attachmentIndex": child["index"],
            "sha256": child["sha256"],
            "sizeBytes": child["sizeBytes"],
        },
        "processors": {
            "embeddedExtractor": {"name": "pypdf", "version": pypdf_version},
            "documentExtractor": {"name": "docling", "version": docling_version},
        },
        "document": document,
    }


def write_result(output_dir: Path, result: dict[str, Any]) -> None:
    (output_dir / "result.json").write_text(
        json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Standalone Docling processor implementing the LT processor contract "
            "over already-acquired local PDF-container bytes."
        )
    )
    parser.add_argument("--request", type=Path, required=True)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    args = parser.parse_args()

    request = load_request(args.request)
    source = args.source.read_bytes()
    output_dir = args.output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    started = time.perf_counter()
    try:
        validate_transport(request, source)
    except Exception:
        duration_ms = round((time.perf_counter() - started) * 1000)
        write_result(
            output_dir,
            failed_result(
                request,
                code="source-hash-mismatch",
                retryable=False,
                duration_ms=duration_ms,
            ),
        )
        # A materialised contract result is communicated in result.json; process
        # exit status is reserved for failures that prevent contract output.
        return 0

    installed = package_version("docling")
    pypdf_version = package_version("pypdf")
    requested_version = str((request.get("target") or {}).get("processorVersion") or "")
    if (
        installed == "not-installed"
        or installed != requested_version
        or pypdf_version != EXPECTED_PYPDF_VERSION
    ):
        duration_ms = round((time.perf_counter() - started) * 1000)
        write_result(
            output_dir,
            failed_result(
                request,
                code="dependency-missing",
                retryable=False,
                duration_ms=duration_ms,
            ),
        )
        return 0

    embedded_path = output_dir / "embedded-source.pdf"
    try:
        from pypdf import PdfReader

        reader = PdfReader(BytesIO(source), strict=False)
        child = select_single_embedded_pdf(reader.attachment_list)
        max_bytes = int((request.get("limits") or {}).get("maxBytes") or 0)
        if child["sizeBytes"] <= 0 or child["sizeBytes"] > max_bytes:
            raise ProcessorSkip("resource-bound")

        embedded_path.write_bytes(child["payload"])

        from docling.document_converter import DocumentConverter

        conversion = DocumentConverter().convert(embedded_path)
        document = conversion.document
        doc_dict = document.export_to_dict()
        markdown = document.export_to_markdown()

        pages = (
            len(doc_dict.get("pages", []))
            if isinstance(doc_dict.get("pages"), (list, dict))
            else None
        )
        max_pages = int((request.get("limits") or {}).get("maxPages") or 0)
        if pages is not None and max_pages > 0 and pages > max_pages:
            raise ProcessorSkip("resource-bound")

        envelope = structured_envelope(
            request=request,
            child=child,
            pypdf_version=pypdf_version,
            docling_version=installed,
            document=doc_dict,
        )
        structured_bytes = (
            json.dumps(envelope, ensure_ascii=False, separators=(",", ":")) + "\n"
        ).encode("utf-8")
        (output_dir / "structured.json").write_bytes(structured_bytes)

        artifacts = [
            {
                "kind": "structured-json",
                "contentSha256": sha256_bytes(structured_bytes),
                "sizeBytes": len(structured_bytes),
            }
        ]

        if "markdown" in request.get("requestedOutputs", []):
            markdown_bytes = markdown.encode("utf-8")
            (output_dir / "document.md").write_bytes(markdown_bytes)
            artifacts.append(
                {
                    "kind": "markdown",
                    "contentSha256": sha256_bytes(markdown_bytes),
                    "sizeBytes": len(markdown_bytes),
                }
            )

        duration_ms = round((time.perf_counter() - started) * 1000)
        write_result(
            output_dir,
            {
                "schemaVersion": SCHEMA_VERSION,
                "jobKey": request["jobKey"],
                "sourceSha256": request["source"]["sha256"],
                "representationKind": REPRESENTATION_KIND,
                "processor": {"name": "docling", "version": installed},
                "extractedAt": utc_now(),
                "status": "ok",
                "durationMs": duration_ms,
                "metrics": {
                    "markdownCharacters": len(markdown),
                    "pages": pages,
                    "tables": (
                        len(doc_dict.get("tables", []))
                        if isinstance(doc_dict.get("tables"), (list, dict))
                        else None
                    ),
                },
                "artifacts": artifacts,
            },
        )
        return 0
    except ProcessorSkip as exc:
        duration_ms = round((time.perf_counter() - started) * 1000)
        write_result(
            output_dir,
            skipped_result(
                request,
                code=exc.code,
                duration_ms=duration_ms,
                processor_version=installed,
            ),
        )
        return 0
    except Exception:
        duration_ms = round((time.perf_counter() - started) * 1000)
        write_result(
            output_dir,
            failed_result(
                request,
                code="conversion-failed",
                retryable=True,
                duration_ms=duration_ms,
            ),
        )
        return 0
    finally:
        try:
            embedded_path.unlink()
        except FileNotFoundError:
            pass


if __name__ == "__main__":
    raise SystemExit(main())
