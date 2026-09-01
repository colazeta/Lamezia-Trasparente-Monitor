#!/usr/bin/env python3
"""Local Docling proof-of-concept extractor for Lamezia Trasparente.

This tool is intentionally offline with respect to civic sources: it accepts
only a local file path. Docling itself can populate its local model cache on
first use; no managed or paid service is required.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
import tempfile
import time
from datetime import datetime, timezone
from importlib.metadata import PackageNotFoundError, version
from pathlib import Path
from typing import Any

DEFAULT_MAX_BYTES = 50 * 1024 * 1024
SCHEMA_VERSION = 1


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def safe_stem(name: str) -> str:
    flattened = name.replace("/", "_").replace("\\", "_")
    stem = Path(flattened).stem
    cleaned = re.sub(r"[^A-Za-z0-9._-]+", "_", stem).strip("._-")
    cleaned = re.sub(r"_+", "_", cleaned)
    return cleaned[:96] or "document"


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def container_len(value: Any) -> int | None:
    if isinstance(value, (list, dict)):
        return len(value)
    return None


def atomic_write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temp_name = tempfile.mkstemp(
        dir=path.parent, prefix=f".{path.name}.", suffix=".tmp"
    )
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(content)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temp_name, path)
    except Exception:
        try:
            os.unlink(temp_name)
        except FileNotFoundError:
            pass
        raise


def atomic_write_json(path: Path, value: Any) -> None:
    atomic_write_text(
        path,
        json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
    )


def docling_version() -> str:
    try:
        return version("docling")
    except PackageNotFoundError:
        return "not-installed"


def build_manifest_base(
    source: Path,
    *,
    digest: str,
    size_bytes: int,
    extractor_version: str,
) -> dict[str, Any]:
    return {
        "schemaVersion": SCHEMA_VERSION,
        "source": {
            "fileName": source.name,
            "sha256": digest,
            "sizeBytes": size_bytes,
        },
        "extractor": {
            "name": "docling",
            "version": extractor_version,
        },
        "extractedAt": utc_now(),
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Run a local Docling extraction and write Markdown, lossless JSON "
            "and a provenance/benchmark manifest."
        )
    )
    parser.add_argument("input", type=Path, help="Local document path.")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("tmp/docling"),
        help="Output directory (default: tmp/docling, ignored by Git).",
    )
    parser.add_argument(
        "--max-bytes",
        type=int,
        default=DEFAULT_MAX_BYTES,
        help=f"Fail closed above this file size (default: {DEFAULT_MAX_BYTES}).",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    source = args.input.expanduser().resolve()

    if not source.is_file():
        print(f"Input is not a local file: {source}", file=sys.stderr)
        return 2
    if args.max_bytes <= 0:
        print("--max-bytes must be greater than zero", file=sys.stderr)
        return 2

    size_bytes = source.stat().st_size
    if size_bytes == 0:
        print("Input file is empty", file=sys.stderr)
        return 2
    if size_bytes > args.max_bytes:
        print(
            f"Input file is {size_bytes} bytes; limit is {args.max_bytes}",
            file=sys.stderr,
        )
        return 2

    output_dir = args.output_dir.expanduser().resolve()
    digest = sha256_file(source)
    stem = safe_stem(source.name)
    prefix = f"{stem}-{digest[:12]}"

    markdown_path = output_dir / f"{prefix}.docling.md"
    json_path = output_dir / f"{prefix}.docling.json"
    manifest_path = output_dir / f"{prefix}.docling.manifest.json"

    extractor_version = docling_version()
    manifest = build_manifest_base(
        source,
        digest=digest,
        size_bytes=size_bytes,
        extractor_version=extractor_version,
    )

    if extractor_version == "not-installed":
        manifest["result"] = {
            "status": "error",
            "errorType": "DependencyMissing",
            "errorMessage": (
                "Docling is not installed. Install tools/docling/requirements.txt "
                "inside a local virtual environment."
            ),
        }
        atomic_write_json(manifest_path, manifest)
        print(manifest["result"]["errorMessage"], file=sys.stderr)
        print(f"Manifest: {manifest_path}", file=sys.stderr)
        return 3

    started = time.perf_counter()
    try:
        # Delayed import keeps --help and dependency diagnostics lightweight.
        from docling.document_converter import DocumentConverter

        converter = DocumentConverter()
        conversion = converter.convert(source)
        document = conversion.document

        markdown = document.export_to_markdown()
        doc_dict = document.export_to_dict()

        atomic_write_text(markdown_path, markdown.rstrip() + "\n")
        atomic_write_json(json_path, doc_dict)

        elapsed_ms = round((time.perf_counter() - started) * 1000)
        manifest["result"] = {
            "status": "ok",
            "elapsedMs": elapsed_ms,
            "markdownCharacters": len(markdown),
            "tableCount": container_len(doc_dict.get("tables")),
            "pageCount": container_len(doc_dict.get("pages")),
        }
        manifest["artifacts"] = {
            "markdown": markdown_path.name,
            "json": json_path.name,
        }
        atomic_write_json(manifest_path, manifest)

        print(
            json.dumps(
                {
                    "status": "ok",
                    "manifest": str(manifest_path),
                    "markdown": str(markdown_path),
                    "json": str(json_path),
                },
                ensure_ascii=False,
            )
        )
        return 0
    except Exception as exc:
        elapsed_ms = round((time.perf_counter() - started) * 1000)
        manifest["result"] = {
            "status": "error",
            "elapsedMs": elapsed_ms,
            "errorType": type(exc).__name__,
            "errorMessage": str(exc)[:1000],
        }
        atomic_write_json(manifest_path, manifest)
        print(
            f"Docling extraction failed ({type(exc).__name__}): {exc}",
            file=sys.stderr,
        )
        print(f"Manifest: {manifest_path}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
