#!/usr/bin/env python3
"""Extract embedded files from an already acquired local PDF.

This is a benchmark/pre-processing helper. It performs no network access and
writes only to an explicit local output directory. The containing PDF remains
the canonical source; extracted files are derived artefacts keyed by hash.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
import tempfile
from datetime import datetime, timezone
from importlib.metadata import PackageNotFoundError, version
from pathlib import Path
from typing import Any

DEFAULT_MAX_ATTACHMENTS = 20
DEFAULT_MAX_ATTACHMENT_BYTES = 50 * 1024 * 1024
DEFAULT_MAX_TOTAL_BYTES = 100 * 1024 * 1024
SCHEMA_VERSION = 1


def sha256_bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def safe_attachment_name(name: str | None, index: int, digest: str) -> str:
    raw = name or f"attachment-{index:02d}"
    flattened = raw.replace("/", "_").replace("\\", "_")
    suffix = Path(flattened).suffix[:16]
    stem = Path(flattened).stem
    stem = re.sub(r"[^A-Za-z0-9._-]+", "_", stem).strip("._-")
    stem = re.sub(r"_+", "_", stem)[:80] or f"attachment-{index:02d}"
    clean_suffix = re.sub(r"[^A-Za-z0-9.]", "", suffix)[:16]
    return f"{stem}-{index:02d}-{digest[:12]}{clean_suffix}"


def atomic_write_bytes(path: Path, payload: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temp_name = tempfile.mkstemp(
        dir=path.parent, prefix=f".{path.name}.", suffix=".tmp"
    )
    try:
        with os.fdopen(fd, "wb") as handle:
            handle.write(payload)
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
    payload = json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True).encode("utf-8") + b"\n"
    atomic_write_bytes(path, payload)


def package_version(name: str) -> str:
    try:
        return version(name)
    except PackageNotFoundError:
        return "not-installed"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Extract embedded files from one local PDF with bounded, hash-keyed output."
    )
    parser.add_argument("input", type=Path, help="Already acquired local PDF path.")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("tmp/docling/attachments"),
    )
    parser.add_argument("--max-attachments", type=int, default=DEFAULT_MAX_ATTACHMENTS)
    parser.add_argument(
        "--max-attachment-bytes", type=int, default=DEFAULT_MAX_ATTACHMENT_BYTES
    )
    parser.add_argument("--max-total-bytes", type=int, default=DEFAULT_MAX_TOTAL_BYTES)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    source = args.input.expanduser().resolve()
    if not source.is_file() or source.suffix.lower() != ".pdf":
        print(f"Input is not a local PDF: {source}", file=sys.stderr)
        return 2
    if args.max_attachments <= 0 or args.max_attachment_bytes <= 0 or args.max_total_bytes <= 0:
        print("Attachment limits must be greater than zero", file=sys.stderr)
        return 2

    pypdf_version = package_version("pypdf")
    output_dir = args.output_dir.expanduser().resolve()
    source_sha = sha256_file(source)
    manifest_path = output_dir / f"{source.stem}-{source_sha[:12]}.attachments.manifest.json"

    manifest: dict[str, Any] = {
        "schemaVersion": SCHEMA_VERSION,
        "source": {
            "fileName": source.name,
            "sha256": source_sha,
            "sizeBytes": source.stat().st_size,
        },
        "extractor": {"name": "pypdf-attachments", "version": pypdf_version},
        "extractedAt": utc_now(),
        "limits": {
            "maxAttachments": args.max_attachments,
            "maxAttachmentBytes": args.max_attachment_bytes,
            "maxTotalBytes": args.max_total_bytes,
        },
        "attachments": [],
    }

    if pypdf_version == "not-installed":
        manifest["result"] = {"status": "error", "errorType": "DependencyMissing"}
        atomic_write_json(manifest_path, manifest)
        print("pypdf is not installed", file=sys.stderr)
        return 3

    try:
        from pypdf import PdfReader

        reader = PdfReader(source, strict=False)
        attachments = list(reader.attachment_list)
        if len(attachments) > args.max_attachments:
            raise ValueError(
                f"PDF contains {len(attachments)} attachments; limit is {args.max_attachments}"
            )

        total_bytes = 0
        for index, attachment in enumerate(attachments, start=1):
            payload = bytes(attachment.content)
            size_bytes = len(payload)
            if size_bytes > args.max_attachment_bytes:
                raise ValueError(
                    f"Attachment {index} is {size_bytes} bytes; per-file limit is {args.max_attachment_bytes}"
                )
            total_bytes += size_bytes
            if total_bytes > args.max_total_bytes:
                raise ValueError(
                    f"Total embedded payload is {total_bytes} bytes; limit is {args.max_total_bytes}"
                )

            digest = sha256_bytes(payload)
            file_name = safe_attachment_name(attachment.name, index, digest)
            target = output_dir / file_name
            atomic_write_bytes(target, payload)
            manifest["attachments"].append(
                {
                    "index": index,
                    "name": attachment.name,
                    "alternativeName": attachment.alternative_name,
                    "sizeBytes": size_bytes,
                    "sha256": digest,
                    "outputFile": file_name,
                }
            )

        manifest["result"] = {
            "status": "ok",
            "attachmentCount": len(attachments),
            "totalBytes": total_bytes,
        }
        atomic_write_json(manifest_path, manifest)
        print(
            json.dumps(
                {
                    "status": "ok",
                    "manifest": str(manifest_path),
                    "attachmentCount": len(attachments),
                    "totalBytes": total_bytes,
                },
                ensure_ascii=False,
            )
        )
        return 0
    except Exception as exc:
        manifest["result"] = {
            "status": "error",
            "errorType": type(exc).__name__,
            "errorMessage": str(exc)[:1000],
        }
        atomic_write_json(manifest_path, manifest)
        print(f"Embedded-file extraction failed ({type(exc).__name__}): {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
