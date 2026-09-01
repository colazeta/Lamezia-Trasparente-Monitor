#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
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


def main() -> int:
    parser = argparse.ArgumentParser(description="Run a bounded, metrics-only Docling benchmark corpus.")
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
    results: list[dict[str, Any]] = []
    failures = 0

    for index, item in enumerate(items, start=1):
        relative = Path(str(item.get("storagePath") or ""))
        document = (repo_root / relative).resolve()
        try:
            document.relative_to(archive_root)
        except ValueError as exc:
            raise SystemExit(f"Candidate escapes the reviewed archive root: {relative}") from exc
        if not document.is_file():
            raise SystemExit(f"Candidate document is missing: {relative}")

        expected_sha = str(item.get("sha256") or "")
        actual_sha = sha256_file(document)
        if actual_sha != expected_sha:
            raise SystemExit(f"SHA mismatch for {relative}: expected {expected_sha}, got {actual_sha}")

        item_output = output_dir / f"{index:02d}-{actual_sha[:12]}"
        command = [
            sys.executable,
            str(repo_root / "tools/docling/run_benchmark.py"),
            str(document),
            "--output-dir",
            str(item_output),
            "--metrics-only",
        ]
        proc = subprocess.run(command, cwd=repo_root, text=True, capture_output=True, check=False)
        comparison_path = item_output / f"{document.stem}-{actual_sha[:12]}.comparison.json"
        comparison = load_json(comparison_path) if comparison_path.is_file() else None

        record: dict[str, Any] = {
            "id": item.get("id"),
            "publicationNumber": item.get("publicationNumber"),
            "benchmarkClass": item.get("benchmarkClass"),
            "sha256": actual_sha,
            "sizeBytes": document.stat().st_size,
            "processExitCode": proc.returncode,
            "contentRetained": False,
        }
        if comparison:
            baseline = comparison.get("baseline") or {}
            docling = comparison.get("docling") or {}
            record["baseline"] = baseline
            record["docling"] = docling
            record["comparison"] = comparison.get("comparison") or {}
            record["diagnostics"] = {
                "baselineCharactersPerPage": chars_per_page(baseline.get("characters"), baseline.get("pages")),
                "doclingCharactersPerPage": chars_per_page(docling.get("characters"), docling.get("pages")),
                "screeningSignal": screening_signal(baseline, docling),
                "qualityStatus": "not-assessed-metrics-only",
            }
        else:
            record["status"] = "failed-no-comparison-artifact"

        if proc.returncode != 0:
            failures += 1
            record["status"] = "failed"
            record["errorType"] = "BenchmarkProcessFailed"
        else:
            record["status"] = "ok"
        results.append(record)

    summary = {
        "schemaVersion": SCHEMA_VERSION,
        "mode": "metrics-only",
        "contentRetained": False,
        "candidateManifest": candidates_path.name,
        "requestedItems": len(items),
        "completedItems": sum(1 for item in results if item.get("status") == "ok"),
        "failedItems": failures,
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
