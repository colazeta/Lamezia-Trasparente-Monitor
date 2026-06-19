from __future__ import annotations

import re
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path

import pdfplumber

from utils import (
    CSV_HEADERS,
    INTERIM_TABLES_DIR,
    PROCESSED_DIR,
    QA_DIR,
    ROOT,
    ensure_directories,
    read_csv,
    relpath,
    unique_rows,
    write_csv,
)


ELECTION_ID_2025 = "comunali_lamezia_2025"


class HtmlInventoryParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.title = ""
        self.links: list[dict] = []
        self.headings: list[dict] = []
        self._in_title = False
        self._link: dict | None = None
        self._heading_level: str | None = None
        self._heading_text = ""

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = {key: value or "" for key, value in attrs}
        if tag == "title":
            self._in_title = True
        elif tag == "a":
            self._link = {"href": attrs_dict.get("href", ""), "text": ""}
        elif re.fullmatch(r"h[1-6]", tag):
            self._heading_level = tag
            self._heading_text = ""

    def handle_data(self, data: str) -> None:
        text = re.sub(r"\s+", " ", data).strip()
        if not text:
            return
        if self._in_title:
            self.title += (text + " ")
        if self._link is not None:
            self._link["text"] += (text + " ")
        if self._heading_level:
            self._heading_text += (text + " ")

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self._in_title = False
            self.title = self.title.strip()
        elif tag == "a" and self._link is not None:
            self._link["text"] = self._link["text"].strip()
            self.links.append(self._link)
            self._link = None
        elif tag == self._heading_level:
            self.headings.append({"level": self._heading_level, "text": self._heading_text.strip()})
            self._heading_level = None
            self._heading_text = ""


def parse_html(path: Path, source_doc_id: str) -> None:
    html = path.read_text(encoding="utf-8", errors="replace")
    parser = HtmlInventoryParser()
    parser.feed(html)
    links = [
        {"source_doc_id": source_doc_id, "link_text": link["text"], "href": link["href"]}
        for link in parser.links
        if link.get("href")
    ]
    headings = [
        {"source_doc_id": source_doc_id, "level": item["level"], "heading_text": item["text"]}
        for item in parser.headings
        if item.get("text")
    ]
    if links:
        write_csv(INTERIM_TABLES_DIR / f"{source_doc_id}__links.csv", links, ["source_doc_id", "link_text", "href"])
    if headings:
        write_csv(INTERIM_TABLES_DIR / f"{source_doc_id}__headings.csv", headings, ["source_doc_id", "level", "heading_text"])


def parse_pdf(path: Path, source_doc_id: str) -> str:
    text_parts: list[str] = []
    try:
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                text_parts.append(page.extract_text() or "")
    except Exception as exc:
        qa_path = QA_DIR / f"{source_doc_id}__pdf_parse_error.md"
        qa_path.write_text(f"# PDF parse error\n\n{source_doc_id}: {exc}\n", encoding="utf-8")
        return f"{source_doc_id}: PDF text extraction failed: {exc}"

    text = "\n\n".join(part for part in text_parts if part.strip())
    if text.strip():
        output = INTERIM_TABLES_DIR / f"{source_doc_id}__text.txt"
        output.write_text(text, encoding="utf-8")
        return f"{source_doc_id}: PDF text extracted to {relpath(output)}; manual table QA still required."

    qa_path = QA_DIR / f"{source_doc_id}__pdf_no_text.md"
    qa_path.write_text(
        "# PDF without extractable text\n\n"
        "No OCR was attempted. Add a controlled OCR workflow before using this document for processed data.\n",
        encoding="utf-8",
    )
    return f"{source_doc_id}: no extractable PDF text; OCR not attempted."


def parse_totals_xml(root: ET.Element, source_doc_id: str, rows: dict[str, list[dict]]) -> None:
    if root.attrib.get("LIVELLO") == "1":
        for c1 in root.findall("./C0/C1"):
            rows["mayor_candidates"].append(
                {
                    "election_id": ELECTION_ID_2025,
                    "round": "1",
                    "candidate_number": c1.attrib.get("NUMERO", ""),
                    "candidate_name": c1.attrib.get("NOME", ""),
                    "source_doc_id": source_doc_id,
                }
            )
            for c2 in c1.findall("./C2"):
                rows["lists"].append(
                    {
                        "election_id": ELECTION_ID_2025,
                        "list_number": c2.attrib.get("NUMERO", ""),
                        "list_name": c2.attrib.get("NOME", ""),
                        "mayor_candidate_number": c1.attrib.get("NUMERO", ""),
                        "source_doc_id": source_doc_id,
                    }
                )

    tv = root.find("./TV")
    if tv is not None:
        for metric, attr in [
            ("registered_voters", "ELETTORI"),
            ("voters", "TOTVOT"),
            ("valid_votes_mayor", "VOTIVALIDI_C1"),
            ("valid_votes_list", "VOTIVALIDI_C2"),
            ("blank_ballots", "BIANCHE"),
            ("null_ballots", "NULLE"),
            ("contested_ballots", "VCNAS_TOT"),
        ]:
            rows["totals"].append(
                {
                    "election_id": ELECTION_ID_2025,
                    "round": "1",
                    "metric": metric,
                    "value": tv.attrib.get(attr, ""),
                    "source_doc_id": source_doc_id,
                    "source_attribute": attr,
                }
            )


def parse_mayor_sections(root: ET.Element, source_doc_id: str, rows: dict[str, list[dict]]) -> None:
    for sv in root.findall("./SV"):
        section_number = sv.attrib.get("NUMERO", "")
        rows["sections"].append(
            {
                "election_id": ELECTION_ID_2025,
                "section_number": section_number,
                "section_label": sv.attrib.get("NOME", ""),
                "polling_place": sv.attrib.get("UBICAZIONE", ""),
                "polling_place_address": "",
                "source_doc_id": source_doc_id,
                "notes": "polling_place copied from Maggioli UBICAZIONE attribute; verify against municipal stradario",
            }
        )
        rows["turnout_section"].append(
            {
                "election_id": ELECTION_ID_2025,
                "round": "1",
                "section_number": section_number,
                "registered_voters": sv.attrib.get("ELETTORI", ""),
                "voters": sv.attrib.get("TOTVOT", ""),
                "valid_votes": sv.attrib.get("VOTIVALIDI_C1", ""),
                "blank_ballots": sv.attrib.get("BIANCHE", ""),
                "null_ballots": sv.attrib.get("NULLE", ""),
                "contested_ballots": sv.attrib.get("VCNAS_TOT", ""),
                "source_doc_id": source_doc_id,
                "validation_status": "extracted_pending_totals_validation",
                "notes": "valid_votes uses VOTIVALIDI_C1; contested_ballots uses VCNAS_TOT",
            }
        )
        for vote in sv.findall(".//V1"):
            rows["votes_mayor_section"].append(
                {
                    "election_id": ELECTION_ID_2025,
                    "round": "1",
                    "section_number": section_number,
                    "candidate_number": vote.attrib.get("NUMERO", ""),
                    "votes": vote.attrib.get("VOTIVALIDI_C1", ""),
                    "source_doc_id": source_doc_id,
                    "validation_status": "extracted_pending_totals_validation",
                    "notes": "",
                }
            )


def parse_list_sections(root: ET.Element, source_doc_id: str, rows: dict[str, list[dict]]) -> None:
    for sv in root.findall("./SV"):
        section_number = sv.attrib.get("NUMERO", "")
        for vote in sv.findall(".//V1"):
            rows["votes_list_section"].append(
                {
                    "election_id": ELECTION_ID_2025,
                    "round": "1",
                    "section_number": section_number,
                    "list_number": vote.attrib.get("NUMERO", ""),
                    "votes": vote.attrib.get("VOTIVALIDI_C1", ""),
                    "source_doc_id": source_doc_id,
                    "validation_status": "extracted_pending_totals_validation",
                    "notes": "",
                }
            )


def parse_preference_sections(root: ET.Element, source_doc_id: str, rows: dict[str, list[dict]]) -> None:
    list_node = root.find("./C0")
    if list_node is None:
        return
    list_number = list_node.attrib.get("NUMERO", "")
    list_name = list_node.attrib.get("NOME", "")
    for candidate in list_node.findall("./C1"):
        rows["council_candidates"].append(
            {
                "election_id": ELECTION_ID_2025,
                "list_number": list_number,
                "list_name": list_name,
                "council_candidate_number": candidate.attrib.get("NUMERO", ""),
                "candidate_name": candidate.attrib.get("NOME", ""),
                "source_doc_id": source_doc_id,
            }
        )
    for sv in root.findall("./SV"):
        section_number = sv.attrib.get("NUMERO", "")
        for vote in sv.findall(".//V1"):
            rows["preferences_section"].append(
                {
                    "election_id": ELECTION_ID_2025,
                    "section_number": section_number,
                    "list_number": list_number,
                    "council_candidate_number": vote.attrib.get("NUMERO", ""),
                    "preference_votes": vote.attrib.get("VOTIVALIDI_C1", ""),
                    "source_doc_id": source_doc_id,
                    "validation_status": "extracted_pending_totals_validation",
                    "notes": "",
                }
            )


def parse_xml(path: Path, source_doc_id: str, rows: dict[str, list[dict]]) -> str:
    root = ET.parse(path).getroot()
    title = root.attrib.get("TITOLO", "")
    liv_det = root.attrib.get("LIV_DETT", "")
    livello = root.attrib.get("LIVELLO", "")
    if liv_det == "TOT":
        parse_totals_xml(root, source_doc_id, rows)
    elif liv_det == "SEZ" and livello == "1":
        parse_mayor_sections(root, source_doc_id, rows)
    elif liv_det == "SEZ" and livello == "2":
        parse_list_sections(root, source_doc_id, rows)
    elif liv_det == "SEZ" and livello == "3":
        parse_preference_sections(root, source_doc_id, rows)
    return f"{source_doc_id}: parsed XML '{title}' LIV_DETT={liv_det} LIVELLO={livello}"


def main() -> int:
    ensure_directories()
    source_docs = read_csv(PROCESSED_DIR / "source_documents.csv")
    rows: dict[str, list[dict]] = {
        "mayor_candidates": [],
        "lists": [],
        "council_candidates": [],
        "sections": [],
        "turnout_section": [],
        "votes_mayor_section": [],
        "votes_list_section": [],
        "preferences_section": [],
        "totals": [],
    }
    qa_lines = ["# Comune source parse report", ""]

    for doc in source_docs:
        publisher = doc.get("publisher", "")
        local_path = doc.get("local_path", "")
        source_doc_id = doc.get("source_doc_id", "")
        if "Comune" not in publisher and "Maggioli" not in publisher:
            continue
        if not local_path:
            continue
        path = ROOT / local_path
        if not path.exists():
            qa_lines.append(f"- {source_doc_id}: local file missing at {local_path}")
            doc["extraction_status"] = "local_file_missing"
            continue
        suffix = path.suffix.lower()
        try:
            if suffix in {".html", ".htm"}:
                parse_html(path, source_doc_id)
                qa_lines.append(f"- {source_doc_id}: HTML inventory extracted.")
                doc["extraction_status"] = "inventory_extracted"
            elif suffix == ".xml":
                qa_lines.append(f"- {parse_xml(path, source_doc_id, rows)}")
                doc["extraction_status"] = "extracted_to_interim"
            elif suffix == ".pdf":
                message = parse_pdf(path, source_doc_id)
                qa_lines.append(f"- {message}")
                doc["extraction_status"] = "qa_required_no_text" if "no extractable" in message else "text_extracted_manual_qa"
            elif suffix == ".xsl":
                qa_lines.append(f"- {source_doc_id}: XSL archived; no data extraction attempted.")
                doc["extraction_status"] = "archived_reference"
        except Exception as exc:
            qa_lines.append(f"- {source_doc_id}: parse failed: {exc}")
            doc["extraction_status"] = "parse_failed"

    write_csv(INTERIM_TABLES_DIR / "maggioli_2025_mayor_candidates.csv", unique_rows(rows["mayor_candidates"], ["candidate_number"]), ["election_id", "round", "candidate_number", "candidate_name", "source_doc_id"])
    write_csv(INTERIM_TABLES_DIR / "maggioli_2025_lists.csv", unique_rows(rows["lists"], ["list_number"]), ["election_id", "list_number", "list_name", "mayor_candidate_number", "source_doc_id"])
    write_csv(INTERIM_TABLES_DIR / "maggioli_2025_council_candidates.csv", unique_rows(rows["council_candidates"], ["list_number", "council_candidate_number"]), ["election_id", "list_number", "list_name", "council_candidate_number", "candidate_name", "source_doc_id"])
    write_csv(INTERIM_TABLES_DIR / "maggioli_2025_sections.csv", unique_rows(rows["sections"], ["section_number"]), ["election_id", "section_number", "section_label", "polling_place", "polling_place_address", "source_doc_id", "notes"])
    write_csv(INTERIM_TABLES_DIR / "maggioli_2025_turnout_section.csv", rows["turnout_section"], ["election_id", "round", "section_number", "registered_voters", "voters", "valid_votes", "blank_ballots", "null_ballots", "contested_ballots", "source_doc_id", "validation_status", "notes"])
    write_csv(INTERIM_TABLES_DIR / "maggioli_2025_votes_mayor_section.csv", rows["votes_mayor_section"], ["election_id", "round", "section_number", "candidate_number", "votes", "source_doc_id", "validation_status", "notes"])
    write_csv(INTERIM_TABLES_DIR / "maggioli_2025_votes_list_section.csv", rows["votes_list_section"], ["election_id", "round", "section_number", "list_number", "votes", "source_doc_id", "validation_status", "notes"])
    write_csv(INTERIM_TABLES_DIR / "maggioli_2025_preferences_section.csv", rows["preferences_section"], ["election_id", "section_number", "list_number", "council_candidate_number", "preference_votes", "source_doc_id", "validation_status", "notes"])
    write_csv(INTERIM_TABLES_DIR / "maggioli_2025_totals.csv", rows["totals"], ["election_id", "round", "metric", "value", "source_doc_id", "source_attribute"])

    qa_lines.append("")
    qa_lines.append("## Extracted row counts")
    for key, value in rows.items():
        qa_lines.append(f"- {key}: {len(value)}")
    (QA_DIR / "comune_parse_report.md").write_text("\n".join(qa_lines) + "\n", encoding="utf-8")
    write_csv(PROCESSED_DIR / "source_documents.csv", source_docs, CSV_HEADERS["source_documents.csv"])
    print("parsed Comune/Maggioli sources")
    return 0


if __name__ == "__main__":
    sys.exit(main())
