#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import time
from importlib.metadata import PackageNotFoundError, version
from pathlib import Path
from typing import Any

SCHEMA_VERSION = 1


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def package_version(name: str) -> str:
    try:
        return version(name)
    except PackageNotFoundError:
        return "not-installed"


def container_len(value: Any) -> int | None:
    if isinstance(value, (list, dict)):
        return len(value)
    return None


def chars_per_page(characters: Any, pages: Any) -> float | None:
    if not isinstance(characters, int) or not isinstance(pages, int) or pages <= 0:
        return None
    return round(characters / pages, 2)


def screening_signal(baseline: dict[str, Any], docling: dict[str, Any]) -> str:
    base_chars = baseline.get("characters")
    doc_chars = docling.get("characters")
    pages = baseline.get("pages") or docling.get("pages")
    tables = docling.get("tables")
    density = chars_per_page(base_chars, pages)

    if isinstance(tables, int) and tables > 0:
        return "structured-table-signal"
    if (
        isinstance(base_chars, int)
        and isinstance(doc_chars, int)
        and density is not None
        and density < 100
        and doc_chars >= 500
        and doc_chars >= max(3 * max(base_chars, 1), 500)
    ):
        return "sparse-baseline-docling-recovery-signal"
    return "no-automatic-quality-conclusion"


def run_baseline(document: Path, repo_root: Path) -> tuple[int, dict[str, Any], int]:
    command = [
        "pnpm",
        "--filter",
        "@workspace/api-server",
        "exec",
        "node",
        "scripts/docling_pdf_baseline.mjs",
        str(document),
        "--omit-text",
    ]
    started = time.perf_counter()
    proc = subprocess.run(command, cwd=repo_root, text=True, capture_output=True, check=False)
    wall_ms = round((time.perf_counter() - started) * 1000)
    if not proc.stdout.strip():
        return proc.returncode, {
            "status": "failed",
            "extractor": "pdf-parse",
            "extractorVersion": "2.4.5",
            "errorType": "MissingJsonOutput",
            "contentRetained": False,
        }, wall_ms
    try:
        payload = json.loads(proc.stdout)
    except json.JSONDecodeError:
        return proc.returncode or 1, {
            "status": "failed",
            "extractor": "pdf-parse",
            "extractorVersion": "2.4.5",
            "errorType": "InvalidJsonOutput",
            "contentRetained": False,
        }, wall_ms
    payload.pop("text", None)
    payload["contentRetained"] = False
    return proc.returncode, payload, wall_ms


def main() -> int:
    parser = argparse.ArgumentParser(description="Run a bounded, metrics-only Docling benchmark corpus using one shared converter.")
    parser.add_argument("candidates", type=Path)
    parser.add_argument("--repo-root", type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument("--output-dir", type=Path, default=Path("tmp/docling/corpus/results"))
    parser.add_argument("--max-items", type=int, default=6)
    args = parser.parse_args()

    if args.max_items <= 0:
        raise SystemExit("--max-items must be greater than zero")

    repo_root = args.repo_root.resolve()
    candidates_path = args.candidates.resolve()
    output_dir = (repo_root / args.output_dir).resolve() if not args.output_dir.is_absolute() else args.output_dir.resolve()
    archive_root = (repo_root / "data/public/albo/documents").resolve()
    payload = load_json(candidates_path)
    if payload.get("mode") != "metrics-only":
        raise SystemExit("Candidate manifest must explicitly declare mode=metrics-only")

    items = list(payload.get("items") or [])[: args.max_items]
    if not items:
        raise SystemExit("Candidate manifest contains no benchmark items")

    docling_version = package_version("docling")
    if docling_version == "not-installed":
        raise SystemExit("Docling is not installed")

    from docling.document_converter import DocumentConverter

    converter_started = time.perf_counter()
    converter = DocumentConverter()
    converter_init_ms = round((time.perf_counter() - converter_started) * 1000)

    results: list[dict[str, Any]] = []
    failures = 0

    for item in items:
        relative = Path(str(item.get("storagePath") or ""))
        document = (repo_root / relative).resolve()
        try:
            document.relative_to(archive_root)
        except ValueError as exc:
            raise SystemExit(f"Candidate escapes the archive root: {relative}") from exc
        if not document.is_file():
            raise SystemExit(f"Candidate document is missing: {relative}")

        expected_sha = str(item.get("sha256") or "")
        source_sha = sha256_file(document)
        if source_sha != expected_sha:
            raise SystemExit(f"SHA mismatch for {relative}: expected {expected_sha}, got {source_sha}")

        baseline_code, baseline_payload, baseline_wall_ms = run_baseline(document, repo_root)
        baseline_metrics = baseline_payload.get("metrics") or {}
        baseline = {
            "status": baseline_payload.get("status"),
            "extractor": "pdf-parse",
            "extractorVersion": baseline_payload.get("extractorVersion", "2.4.5"),
            "characters": baseline_metrics.get("characters"),
            "words": baseline_metrics.get("words"),
            "pages": baseline_metrics.get("pages"),
            "elapsedMs": baseline_metrics.get("elapsedMs"),
            "runnerWallMs": baseline_wall_ms,
            "contentRetained": False,
        }

        docling: dict[str, Any]
        doc_started = time.perf_counter()
        try:
            conversion = converter.convert(document)
            doc = conversion.document
            markdown = doc.export_to_markdown()
            doc_dict = doc.export_to_dict()
            doc_elapsed_ms = round((time.perf_counter() - doc_started) * 1000)
            docling = {
                "status": "ok",
                "extractor": "docling",
                "extractorVersion": docling_version,
                "characters": len(markdown),
                "pages": container_len(doc_dict.get("pages")),
                "tables": container_len(doc_dict.get("tables")),
                "elapsedMs": doc_elapsed_ms,
                "contentRetained": False,
            }
            del markdown
            del doc_dict
            del doc
            del conversion
        except Exception as exc:
            doc_elapsed_ms = round((time.perf_counter() - doc_started) * 1000)
            docling = {
                "status": "failed",
                "extractor": "docling",
                "extractorVersion": docling_version,
                "elapsedMs": doc_elapsed_ms,
                "errorType": type(exc).__name__,
                "contentRetained": False,
            }

        same_source_hash = sha256_file(document) == source_sha
        base_chars = baseline.get("characters")
        doc_chars = docling.get("characters")
        base_pages = baseline.get("pages")
        doc_pages = docling.get("pages")
        comparison = {
            "sameSourceHash": same_source_hash,
            "characterDelta": doc_chars - base_chars if isinstance(base_chars, int) and isinstance(doc_chars, int) else None,
            "pageDelta": doc_pages - base_pages if isinstance(base_pages, int) and isinstance(doc_pages, int) else None,
            "automaticWinner": None,
        }

        status = "ok" if baseline_code == 0 and baseline.get("status") == "ok" and docling.get("status") == "ok" and same_source_hash else "failed"
        if status != "ok":
            failures += 1

        results.append(
            {
                "id": item.get("id"),
                "publicationNumber": item.get("publicationNumber"),
                "benchmarkClass": item.get("benchmarkClass"),
                "sha256": source_sha,
                "sizeBytes": document.stat().st_size,
                "status": status,
                "contentRetained": False,
                "baseline": baseline,
                "docling": docling,
                "comparison": comparison,
                "diagnostics": {
                    "baselineCharactersPerPage": chars_per_page(base_chars, base_pages),
                    "doclingCharactersPerPage": chars_per_page(doc_chars, doc_pages),
                    "screeningSignal": screening_signal(baseline, docling),
                    "qualityStatus": "not-assessed-metrics-only",
                },
            }
        )

    summary = {
        "schemaVersion": SCHEMA_VERSION,
        "mode": "metrics-only",
        "contentRetained": False,
        "candidateManifest": candidates_path.name,
        "requestedItems": len(items),
        "completedItems": sum(1 for item in results if item.get("status") == "ok"),
        "failedItems": failures,
        "docling": {
            "version": docling_version,
            "sharedConverter": True,
            "converterInitMs": converter_init_ms,
        },
        "qualityPolicy": "Metrics can screen document classes but cannot establish extraction quality without reviewed source-level spot checks.",
        "items": results,
    }
    output_dir.mkdir(parents=True, exist_ok=True)
    summary_path = output_dir / "corpus-summary.json"
    summary_path.write_text(json.dumps(summary, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(summary, indent=2, ensure_ascii=False))
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
