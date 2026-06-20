from __future__ import annotations

import csv
import re
import sys
from collections import Counter
from pathlib import Path

from normalise_street_names import normalize_street_name
from utils import RAW_DIR, ROOT, relpath, write_csv


ELECTION_ID = "comunali_lamezia_2025"
RAW_GEO_DIR = RAW_DIR / "geo"
INTERIM_GEO_DIR = ROOT / "data" / "interim" / "geo"
PDF_PATH = RAW_GEO_DIR / "Stradario_elettorale.pdf"
OUTPUT_PATH = INTERIM_GEO_DIR / "electoral_street_rules_2025.csv"


RULE_HEADERS = [
    "rule_id",
    "election_id",
    "section_number",
    "polling_place",
    "street_rule_raw",
    "street_name_raw",
    "street_name_normalised",
    "civic_rule_raw",
    "civic_from",
    "civic_to",
    "civic_parity",
    "includes_snc",
    "source_page",
    "extraction_confidence",
    "notes",
]


HEADER_PREFIXES = (
    "CITTA' DI LAMEZIA TERME",
    "(PROVINCIA DI CATANZARO)",
    "STRADARIO ELETTORALE",
    "SEZ EDIFICIO CIRC COLL VOTANO LE VIE",
)


SECTION_RE = re.compile(r"^(\d{1,2})\s+(.+)$")
RANGE_RE = re.compile(
    r"\(?\bD(?:AL|A)\s+N?\s*\.?\s*(\d+)(?:\s*[\/|]\s*[A-Z]+)?"
    r"\s+(?:AL|A)\s+N?\s*\.?\s*(\d+)(?:\s*[\/|]\s*[A-Z]+)?\.?\)?",
    flags=re.IGNORECASE,
)
RULE_START_PATTERNS = [
    re.compile(r"\(\s*DAL\s+\d", flags=re.IGNORECASE),
    re.compile(r"\(\s*DAL\s+N", flags=re.IGNORECASE),
    re.compile(r"\bDAL\s+N?\s*\.?\s*\d", flags=re.IGNORECASE),
    re.compile(r"\bDA\s+N\s*\.?\s*\d", flags=re.IGNORECASE),
    re.compile(r"\bSNC\b", flags=re.IGNORECASE),
    re.compile(r"\bNUMERI\s+(?:PARI|DISPARI)\b", flags=re.IGNORECASE),
    re.compile(r"\bNN\.?\s*(?:PARI|DISPARI)\b", flags=re.IGNORECASE),
    re.compile(r"\bCON\s+NUMERI\s+CIVICI\b", flags=re.IGNORECASE),
]


def extract_pdf_lines(path: Path) -> list[tuple[int, str]]:
    try:
        import pdfplumber
    except ImportError as exc:
        raise RuntimeError("pdfplumber is required to parse Stradario_elettorale.pdf") from exc

    lines: list[tuple[int, str]] = []
    with pdfplumber.open(path) as pdf:
        for page_number, page in enumerate(pdf.pages, start=1):
            text = page.extract_text(x_tolerance=1, y_tolerance=3) or ""
            for raw_line in text.splitlines():
                line = " ".join(raw_line.split())
                if line:
                    lines.append((page_number, line))
    return lines


def is_noise_line(line: str) -> bool:
    upper = line.upper()
    if upper.startswith("PAGINA ") and " DI " in upper:
        return True
    return any(upper.startswith(prefix) for prefix in HEADER_PREFIXES)


def find_rule_start(line: str) -> int | None:
    positions = [match.start() for pattern in RULE_START_PATTERNS if (match := pattern.search(line))]
    if not positions:
        return None
    return min(positions)


def split_street_rule(line: str) -> tuple[str, str]:
    start = find_rule_start(line)
    if start is None:
        return line.strip(), ""
    return line[:start].strip(" -"), line[start:].strip()


def infer_components(civic_rule_raw: str) -> tuple[str, str, str, str, list[str]]:
    upper = civic_rule_raw.upper()
    notes: list[str] = []
    civic_from = ""
    civic_to = ""
    parity = ""
    includes_snc = "true" if re.search(r"\bSNC\b", upper) else "false"

    range_match = RANGE_RE.search(civic_rule_raw)
    if range_match:
        civic_from = range_match.group(1)
        civic_to = range_match.group(2)
        start = int(civic_from)
        end = int(civic_to)
        if start % 2 == end % 2:
            parity = "even" if start % 2 == 0 else "odd"
        else:
            parity = "any"
    elif re.search(r"\bDA\s+N\s*\.?\s*\d+\s*-", upper):
        notes.append("enumerated civic rule requires manual review")

    if re.search(r"\b(?:NUMERI|NN\.?)\s+DISPARI\b", upper):
        parity = "odd"
    elif re.search(r"\b(?:NUMERI|NN\.?)\s+PARI\b", upper):
        parity = "even"

    if "CON NUMERI CIVICI" in upper and not parity:
        parity = "any"
    return civic_from, civic_to, parity, includes_snc, notes


def confidence_for(street_name_raw: str, civic_rule_raw: str, notes: list[str]) -> str:
    if notes:
        return "low"
    if street_name_raw.count("(") != street_name_raw.count(")"):
        notes.append("possible wrapped or truncated PDF line")
        return "medium"
    if civic_rule_raw and not (
        RANGE_RE.search(civic_rule_raw)
        or re.search(r"\bSNC\b", civic_rule_raw, flags=re.IGNORECASE)
        or re.search(r"\b(?:NUMERI|NN\.?)\s+(?:PARI|DISPARI)\b", civic_rule_raw, flags=re.IGNORECASE)
        or "CON NUMERI CIVICI" in civic_rule_raw.upper()
    ):
        notes.append("unparsed civic rule")
        return "low"
    return "high"


def parse_rules(lines: list[tuple[int, str]]) -> list[dict]:
    rows: list[dict] = []
    current_section = ""
    current_polling_place = ""
    section_rule_counts: Counter[str] = Counter()
    pending_ubicato = False

    for page_number, line in lines:
        if is_noise_line(line):
            continue

        section_match = SECTION_RE.match(line)
        if section_match:
            candidate_section = int(section_match.group(1))
            if 1 <= candidate_section <= 78:
                current_section = str(candidate_section)
                current_polling_place = section_match.group(2).strip()
                pending_ubicato = True
                continue

        if line.upper().startswith("UBICATO IN"):
            address = line[len("Ubicato in"):].strip()
            if current_polling_place:
                current_polling_place = f"{current_polling_place} | Ubicato in {address}"
            pending_ubicato = False
            continue

        if pending_ubicato:
            pending_ubicato = False

        if not current_section:
            continue

        street_name_raw, civic_rule_raw = split_street_rule(line)
        if not street_name_raw:
            continue
        civic_from, civic_to, civic_parity, includes_snc, notes = infer_components(civic_rule_raw)
        confidence = confidence_for(street_name_raw, civic_rule_raw, notes)
        section_rule_counts[current_section] += 1
        rule_id = f"electoral_2025_s{int(current_section):02d}_{section_rule_counts[current_section]:03d}"
        rows.append(
            {
                "rule_id": rule_id,
                "election_id": ELECTION_ID,
                "section_number": current_section,
                "polling_place": current_polling_place,
                "street_rule_raw": line,
                "street_name_raw": street_name_raw,
                "street_name_normalised": normalize_street_name(street_name_raw),
                "civic_rule_raw": civic_rule_raw,
                "civic_from": civic_from,
                "civic_to": civic_to,
                "civic_parity": civic_parity,
                "includes_snc": includes_snc,
                "source_page": str(page_number),
                "extraction_confidence": confidence,
                "notes": "; ".join(notes),
            }
        )
    return rows


def main() -> int:
    if not PDF_PATH.exists():
        print(f"missing_pdf={PDF_PATH}", file=sys.stderr)
        return 1
    rows = parse_rules(extract_pdf_lines(PDF_PATH))
    if not rows:
        print("No electoral street rules extracted", file=sys.stderr)
        return 1
    write_csv(OUTPUT_PATH, rows, RULE_HEADERS)
    sections = sorted({row["section_number"] for row in rows}, key=int)
    print("electoral street register parsed")
    print(f"rules={len(rows)}")
    print(f"sections={len(sections)} min={sections[0]} max={sections[-1]}")
    print(f"low_confidence={sum(1 for row in rows if row['extraction_confidence'] == 'low')}")
    print(f"medium_confidence={sum(1 for row in rows if row['extraction_confidence'] == 'medium')}")
    print(f"output={OUTPUT_PATH}")
    print(f"relative_path={relpath(OUTPUT_PATH)}")
    return 0 if len(sections) == 78 else 1


if __name__ == "__main__":
    sys.exit(main())
