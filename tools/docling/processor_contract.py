#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import os
import time
from datetime import datetime, timezone
from importlib.metadata import PackageNotFoundError, version
from io import BytesIO
from pathlib import Path
from typing import Any

SUPPORTED_REASON = "embedded-pdf-container"
REPRESENTATION_KIND = "derived-noncanonical"
SCHEMA_VERSION = 2
EXPECTED_DOCLING_VERSION = "2.124.0"
EXPECTED_PYPDF_VERSION = "6.16.2"
MAX_EMBEDDED_ATTACHMENTS = 20


class UnsupportedEmbeddedSource(Exception):
    pass


class ResourceBound(Exception):
    pass


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


def result_base(request: dict[str, Any], duration_ms: int) -> dict[str, Any]:
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
        "durationMs": duration_ms,
    }


def failed_result(
    request: dict[str, Any], *, code: str, retryable: bool, duration_ms: int
) -> dict[str, Any]:
    return {
        **result_base(request, duration_ms),
        "status": "failed",
        "failure": {"code": code, "retryable": retryable},
    }


def skipped_result(
    request: dict[str, Any], *, code: str, duration_ms: int
) -> dict[str, Any]:
    return {
        **result_base(request, duration_ms),
        "status": "skipped",
        "skip": {"code": code},
    }


def write_result(output_dir: Path, result: dict[str, Any]) -> None:
    (output_dir / "result.json").write_text(
        json.dumps(result, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def model_artifacts_path() -> Path:
    configured = os.environ.get("DOCLING_ARTIFACTS_PATH", "").strip()
    if not configured:
        raise FileNotFoundError("DOCLING_ARTIFACTS_PATH is required")
    path = Path(configured).expanduser().resolve()
    if not path.is_dir() or not any(path.iterdir()):
        raise FileNotFoundError("Docling model artifact directory is unavailable")
    return path


def extract_single_embedded_pdf(
    source: bytes, *, max_bytes: int, max_pages: int
) -> tuple[int, bytes, int]:
    from pypdf import PdfReader

    reader = PdfReader(BytesIO(source), strict=False)
    attachments = list(reader.attachment_list)
    if len(attachments) > MAX_EMBEDDED_ATTACHMENTS:
        raise ResourceBound("too many embedded attachments")

    pdf_candidates: list[tuple[int, bytes]] = []
    for index, attachment in enumerate(attachments, start=1):
        payload = bytes(attachment.content)
        if payload.startswith(b"%PDF-"):
            pdf_candidates.append((index, payload))

    # The first promoted runtime class is deliberately conservative: an outer
    # container is executable only when it has exactly one unambiguous embedded
    # PDF. Multiple-PDF containers remain observation-only until a selection
    # policy is reviewed.
    if len(pdf_candidates) != 1:
        raise UnsupportedEmbeddedSource("expected exactly one embedded PDF")

    attachment_index, derived = pdf_candidates[0]
    if len(derived) > max_bytes:
        raise ResourceBound("embedded PDF exceeds maxBytes")

    child_reader = PdfReader(BytesIO(derived), strict=False)
    page_count = len(child_reader.pages)
    if page_count <= 0 or page_count > max_pages:
        raise ResourceBound("embedded PDF exceeds maxPages")

    return attachment_index, derived, page_count


def build_converter(artifacts_path: Path, timeout_ms: int):
    from docling.datamodel.base_models import InputFormat
    from docling.datamodel.pipeline_options import PdfPipelineOptions
    from docling.document_converter import DocumentConverter, PdfFormatOption

    pipeline_options = PdfPipelineOptions(
        artifacts_path=artifacts_path,
        enable_remote_services=False,
        document_timeout=max(1.0, timeout_ms / 1000.0),
    )
    return DocumentConverter(
        format_options={
            InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options)
        }
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
        return 0

    installed_docling = package_version("docling")
    installed_pypdf = package_version("pypdf")
    requested_version = str((request.get("target") or {}).get("processorVersion") or "")
    if (
        installed_docling == "not-installed"
        or installed_docling != requested_version
        or installed_docling != EXPECTED_DOCLING_VERSION
        or installed_pypdf != EXPECTED_PYPDF_VERSION
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

    limits = request.get("limits") or {}
    max_bytes = int(limits.get("maxBytes") or 0)
    max_pages = int(limits.get("maxPages") or 0)
    timeout_ms = int(limits.get("timeoutMs") or 0)

    try:
        attachment_index, derived_source, derived_pages = extract_single_embedded_pdf(
            source,
            max_bytes=max_bytes,
            max_pages=max_pages,
        )
    except ResourceBound:
        duration_ms = round((time.perf_counter() - started) * 1000)
        write_result(
            output_dir,
            skipped_result(request, code="resource-bound", duration_ms=duration_ms),
        )
        return 0
    except UnsupportedEmbeddedSource:
        duration_ms = round((time.perf_counter() - started) * 1000)
        write_result(
            output_dir,
            skipped_result(request, code="unsupported-source", duration_ms=duration_ms),
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

    derived_sha = sha256_bytes(derived_source)
    derived_path = output_dir / "derived-source.pdf"
    derived_path.write_bytes(derived_source)

    try:
        artifacts_path = model_artifacts_path()
        converter = build_converter(artifacts_path, timeout_ms)
        conversion = converter.convert(derived_path)
        document = conversion.document
        doc_dict = document.export_to_dict()
        markdown = document.export_to_markdown()

        pages = (
            len(doc_dict.get("pages", []))
            if isinstance(doc_dict.get("pages"), (list, dict))
            else derived_pages
        )
        if pages is not None and (pages <= 0 or pages > max_pages):
            raise ResourceBound("converted embedded PDF exceeds maxPages")

        structured_bytes = (
            json.dumps(doc_dict, ensure_ascii=False, separators=(",", ":")) + "\n"
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
        result = {
            **result_base(request, duration_ms),
            "status": "ok",
            "derivedSource": {
                "kind": "embedded-pdf",
                "parentSha256": request["source"]["sha256"],
                "sha256": derived_sha,
                "sizeBytes": len(derived_source),
                "attachmentIndex": attachment_index,
            },
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
        }
        write_result(output_dir, result)
        return 0
    except FileNotFoundError:
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
    except ResourceBound:
        duration_ms = round((time.perf_counter() - started) * 1000)
        write_result(
            output_dir,
            skipped_result(request, code="resource-bound", duration_ms=duration_ms),
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


if __name__ == "__main__":
    raise SystemExit(main())
