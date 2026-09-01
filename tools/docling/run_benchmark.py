#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
import time
from pathlib import Path


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def run_command(command: list[str], cwd: Path) -> tuple[int, str, str, int]:
    started = time.perf_counter()
    proc = subprocess.run(command, cwd=cwd, text=True, capture_output=True, check=False)
    elapsed_ms = round((time.perf_counter() - started) * 1000)
    return proc.returncode, proc.stdout, proc.stderr, elapsed_ms


def load_json_stdout(stdout: str, label: str) -> dict:
    try:
        return json.loads(stdout)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"{label} returned non-JSON output: {exc}") from exc


def main() -> int:
    parser = argparse.ArgumentParser(description="Compare current pdf-parse extraction with Docling on one immutable local PDF.")
    parser.add_argument("document", type=Path)
    parser.add_argument("--repo-root", type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument("--output-dir", type=Path, default=Path("tmp/docling/benchmark"))
    parser.add_argument("--skip-docling", action="store_true", help="Run only the current pdf-parse baseline.")
    args = parser.parse_args()

    repo_root = args.repo_root.resolve()
    document = args.document.resolve()
    if not document.is_file():
        raise SystemExit(f"Input is not a file: {document}")
    if document.suffix.lower() != ".pdf":
        raise SystemExit("The current baseline comparison is intentionally limited to PDF files.")

    source_sha = sha256_file(document)
    output_dir = (repo_root / args.output_dir).resolve() if not args.output_dir.is_absolute() else args.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)
    prefix = f"{document.stem}-{source_sha[:12]}"

    baseline_command = [
        "pnpm",
        "--filter",
        "@workspace/api-server",
        "exec",
        "node",
        "scripts/docling_pdf_baseline.mjs",
        str(document),
    ]
    code, stdout, stderr, wall_ms = run_command(baseline_command, repo_root)
    baseline = load_json_stdout(stdout, "pdf-parse baseline") if stdout.strip() else {
        "schemaVersion": 1,
        "extractor": "pdf-parse",
        "extractorVersion": "2.4.5",
        "status": "failed",
        "error": stderr.strip() or f"exit code {code}",
    }
    baseline["runnerWallMs"] = wall_ms
    baseline["processExitCode"] = code
    if stderr.strip():
        baseline["stderr"] = stderr.strip()

    baseline_path = output_dir / f"{prefix}.pdf-parse.json"
    baseline_path.write_text(json.dumps(baseline, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    result = {
        "schemaVersion": 1,
        "source": {
            "fileName": document.name,
            "sha256": source_sha,
            "bytes": document.stat().st_size,
        },
        "baseline": {
            "status": baseline.get("status"),
            "extractor": "pdf-parse",
            "extractorVersion": "2.4.5",
            "characters": baseline.get("metrics", {}).get("characters"),
            "words": baseline.get("metrics", {}).get("words"),
            "pages": baseline.get("metrics", {}).get("pages"),
            "elapsedMs": baseline.get("metrics", {}).get("elapsedMs"),
            "artifact": baseline_path.name,
        },
        "docling": {"status": "skipped" if args.skip_docling else "not-run"},
        "comparison": {
            "sameSourceHash": None,
            "characterDelta": None,
            "pageDelta": None,
            "automaticWinner": None,
            "note": "Character/page deltas are diagnostics only; quality requires the manual spot-check rubric.",
        },
    }

    if not args.skip_docling:
        docling_output = output_dir / "docling"
        docling_command = [
            sys.executable,
            str(repo_root / "tools/docling/extract_document.py"),
            str(document),
            "--output-dir",
            str(docling_output),
        ]
        doc_code, doc_stdout, doc_stderr, doc_wall_ms = run_command(docling_command, repo_root)
        manifest_path = docling_output / f"{prefix}.docling.manifest.json"
        docling = None
        if manifest_path.is_file():
            docling = json.loads(manifest_path.read_text(encoding="utf-8"))

        result["docling"] = {
            "status": "ok" if doc_code == 0 and docling else "failed",
            "processExitCode": doc_code,
            "runnerWallMs": doc_wall_ms,
            "stderr": doc_stderr.strip() or None,
            "stdout": doc_stdout.strip() or None,
            "manifest": manifest_path.name if manifest_path.is_file() else None,
            "characters": (docling or {}).get("metrics", {}).get("markdownCharacters"),
            "pages": (docling or {}).get("metrics", {}).get("pages"),
            "tables": (docling or {}).get("metrics", {}).get("tables"),
            "sourceSha256": (docling or {}).get("source", {}).get("sha256"),
        }

        if docling:
            same_hash = result["docling"]["sourceSha256"] == source_sha
            result["comparison"]["sameSourceHash"] = same_hash
            base_chars = result["baseline"]["characters"]
            doc_chars = result["docling"]["characters"]
            if isinstance(base_chars, int) and isinstance(doc_chars, int):
                result["comparison"]["characterDelta"] = doc_chars - base_chars
            base_pages = result["baseline"]["pages"]
            doc_pages = result["docling"]["pages"]
            if isinstance(base_pages, int) and isinstance(doc_pages, int):
                result["comparison"]["pageDelta"] = doc_pages - base_pages

    summary_path = output_dir / f"{prefix}.comparison.json"
    summary_path.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2, ensure_ascii=False))

    if baseline.get("status") != "ok":
        return 1
    if not args.skip_docling and result["docling"]["status"] != "ok":
        return 1
    if result["comparison"]["sameSourceHash"] is False:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
