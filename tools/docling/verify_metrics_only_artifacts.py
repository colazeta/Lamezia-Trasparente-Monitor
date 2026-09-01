#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description="Fail closed if a metrics-only corpus retained extracted document content.")
    parser.add_argument("root", type=Path)
    args = parser.parse_args()
    root = args.root.resolve()
    if not root.is_dir():
        raise SystemExit(f"Metrics-only root is missing: {root}")

    violations: list[str] = []
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        relative = path.relative_to(root)
        name = path.name
        if name.endswith(".docling.md") or (name.endswith(".docling.json") and not name.endswith(".docling.manifest.json")):
            violations.append(f"raw Docling content retained: {relative}")
            continue
        if path.suffix.lower() == ".pdf":
            violations.append(f"source/derived PDF retained in metrics artifact tree: {relative}")
            continue
        if name.endswith(".pdf-parse.json"):
            payload = json.loads(path.read_text(encoding="utf-8"))
            if "text" in payload:
                violations.append(f"pdf-parse text retained: {relative}")
            if payload.get("contentRetained") is not False:
                violations.append(f"pdf-parse artifact missing contentRetained=false: {relative}")
        if name.endswith(".docling.manifest.json"):
            payload = json.loads(path.read_text(encoding="utf-8"))
            if payload.get("contentRetained") is not False:
                violations.append(f"Docling manifest missing contentRetained=false: {relative}")
            if "artifacts" in payload:
                violations.append(f"Docling manifest still references discarded content: {relative}")
        if name.endswith(".comparison.json"):
            payload = json.loads(path.read_text(encoding="utf-8"))
            if payload.get("mode") != "metrics-only" or payload.get("contentRetained") is not False:
                violations.append(f"comparison is not metrics-only: {relative}")

    if violations:
        for violation in violations:
            print(f"- {violation}")
        return 1
    print("Metrics-only artifact verification passed: no extracted document content retained.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
