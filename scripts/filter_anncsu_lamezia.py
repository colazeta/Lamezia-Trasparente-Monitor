from __future__ import annotations

import csv
import hashlib
import io
import sys
import zipfile
from dataclasses import dataclass
from datetime import date
from pathlib import Path

from utils import QA_DIR, RAW_DIR, ROOT, relpath


MUNICIPALITY_ISTAT = "079160"
RAW_GEO_DIR = RAW_DIR / "geo"
INDIRIZZARIO_ZIP = RAW_GEO_DIR / "indirizzarioCalabria20260602.zip"
STRADARIO_ZIP = RAW_GEO_DIR / "stradarioCalabria20260602.zip"
ELECTORAL_STREET_REGISTER_PDF = RAW_GEO_DIR / "Stradario_elettorale.pdf"
INDIRIZZARIO_EXTRACT = RAW_GEO_DIR / "anncsu_lamezia_indirizzario_20260602.csv"
STRADARIO_EXTRACT = RAW_GEO_DIR / "anncsu_lamezia_stradario_20260602.csv"
REPORT_PATH = QA_DIR / "anncsu_lamezia_preflight_report.md"


@dataclass
class ZipInspection:
    zip_path: Path
    internal_name: str
    file_size: int
    compressed_size: int
    encoding: str
    delimiter: str
    columns: list[str]
    original_columns: list[str]
    total_rows: int
    lamezia_rows: int
    sha256: str
    output_path: Path


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def detect_encoding(data: bytes) -> str:
    for encoding in ["utf-8-sig", "utf-8", "cp1252", "latin-1"]:
        try:
            data[:200_000].decode(encoding)
            return encoding
        except UnicodeDecodeError:
            continue
    return "utf-8"


def detect_delimiter(sample: str) -> str:
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=";\t|,")
        return dialect.delimiter
    except csv.Error:
        return ";"


def clean_headers(headers: list[str]) -> list[str]:
    cleaned: list[str] = []
    seen: dict[str, int] = {}
    for index, header in enumerate(headers, start=1):
        name = (header or "").strip() or f"unnamed_{index}"
        seen[name] = seen.get(name, 0) + 1
        if seen[name] > 1:
            name = f"{name}_{seen[name]}"
        cleaned.append(name)
    return cleaned


def inspect_and_filter(zip_path: Path, output_path: Path) -> ZipInspection:
    with zipfile.ZipFile(zip_path) as archive:
        members = [info for info in archive.infolist() if not info.is_dir()]
        if len(members) != 1:
            raise RuntimeError(f"Expected exactly one CSV inside {zip_path}, found {len(members)}")
        member = members[0]
        data = archive.read(member.filename)

    encoding = detect_encoding(data)
    text = data.decode(encoding)
    delimiter = detect_delimiter(text[:20_000])
    reader = csv.DictReader(io.StringIO(text, newline=""), delimiter=delimiter)
    if not reader.fieldnames or "CODICE_ISTAT" not in reader.fieldnames:
        raise RuntimeError(f"{zip_path} does not expose a CODICE_ISTAT column")
    original_columns = list(reader.fieldnames)
    cleaned_columns = clean_headers(original_columns)
    column_map = dict(zip(original_columns, cleaned_columns))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    total_rows = 0
    lamezia_rows = 0
    with output_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=cleaned_columns, delimiter=delimiter)
        writer.writeheader()
        for row in reader:
            total_rows += 1
            if row.get("CODICE_ISTAT") == MUNICIPALITY_ISTAT:
                lamezia_rows += 1
                writer.writerow({column_map[column]: row.get(column, "") for column in original_columns})

    return ZipInspection(
        zip_path=zip_path,
        internal_name=member.filename,
        file_size=member.file_size,
        compressed_size=member.compress_size,
        encoding=encoding,
        delimiter=delimiter,
        columns=cleaned_columns,
        original_columns=original_columns,
        total_rows=total_rows,
        lamezia_rows=lamezia_rows,
        sha256=sha256_file(zip_path),
        output_path=output_path,
    )


def markdown_table(headers: list[str], rows: list[list[str]]) -> list[str]:
    lines = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join("---" for _ in headers) + " |",
    ]
    for row in rows:
        lines.append("| " + " | ".join(row) + " |")
    return lines


def write_report(inspections: list[ZipInspection]) -> None:
    raw_checks = [
        (INDIRIZZARIO_ZIP, "ANNCSU indirizzario Calabria"),
        (STRADARIO_ZIP, "ANNCSU stradario Calabria"),
        (ELECTORAL_STREET_REGISTER_PDF, "Comune Lamezia stradario elettorale PDF"),
    ]
    lines = [
        "# ANNCSU Lamezia preflight report",
        "",
        f"Date: {date.today().isoformat()}",
        "",
        "Scope: raw geographic source preflight for joining ANNCSU civic points to 2025 electoral street rules.",
        "",
        "## Raw files",
        "",
    ]
    lines.extend(
        markdown_table(
            ["source", "path", "exists", "bytes", "sha256"],
            [
                [
                    label,
                    relpath(path) if path.exists() else str(path),
                    "yes" if path.exists() else "no",
                    str(path.stat().st_size) if path.exists() else "",
                    sha256_file(path) if path.exists() else "",
                ]
                for path, label in raw_checks
            ],
        )
    )
    lines.extend(
        [
            "",
            "## ZIP inspection",
            "",
        ]
    )
    lines.extend(
        markdown_table(
            [
                "zip",
                "internal_csv",
                "delimiter",
                "encoding",
                "columns",
                "total_rows",
                "lamezia_rows",
                "extract",
            ],
            [
                [
                    relpath(item.zip_path),
                    item.internal_name,
                    item.delimiter,
                    item.encoding,
                    str(len(item.columns)),
                    str(item.total_rows),
                    str(item.lamezia_rows),
                    relpath(item.output_path),
                ]
                for item in inspections
            ],
        )
    )
    lines.extend(
        [
            "",
            "## Columns",
            "",
        ]
    )
    for item in inspections:
        lines.append(f"### {item.internal_name}")
        lines.append("")
        lines.append(", ".join(f"`{column}`" for column in item.columns))
        if item.columns != item.original_columns:
            lines.append("")
            lines.append("Blank or duplicate source headers were normalised in the extract for CSV readability.")
        lines.append("")
    lines.extend(
        [
            "## Methodological notes",
            "",
            "- `indirizzarioCalabria20260602.zip` is treated as the primary source for georeferenced civic access points.",
            "- `stradarioCalabria20260602.zip` is treated as a support source for odonym normalization and coverage checks.",
            "- `Stradario_elettorale.pdf` is treated as the normative source for electoral section assignment.",
            "- No assignment by geographic proximity is performed in this preflight step.",
            "- No polygons, shapefiles, UI, maps, or electoral result values are created or modified.",
        ]
    )
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    missing = [path for path in [INDIRIZZARIO_ZIP, STRADARIO_ZIP, ELECTORAL_STREET_REGISTER_PDF] if not path.exists()]
    if missing:
        for path in missing:
            print(f"missing_raw={path}", file=sys.stderr)
        return 1

    inspections = [
        inspect_and_filter(INDIRIZZARIO_ZIP, INDIRIZZARIO_EXTRACT),
        inspect_and_filter(STRADARIO_ZIP, STRADARIO_EXTRACT),
    ]
    write_report(inspections)
    for item in inspections:
        print(
            f"{item.zip_path.name}: internal_csv={item.internal_name} "
            f"delimiter={item.delimiter!r} encoding={item.encoding} "
            f"total_rows={item.total_rows} lamezia_rows={item.lamezia_rows} "
            f"extract={item.output_path}"
        )
    print(f"preflight_report={REPORT_PATH}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
