from __future__ import annotations

import sys
from html.parser import HTMLParser
from pathlib import Path

from utils import CSV_HEADERS, INTERIM_TABLES_DIR, PROCESSED_DIR, QA_DIR, ROOT, ensure_directories, read_csv, write_csv


class LinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[dict] = []
        self._link: dict | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "a":
            self._link = {"href": dict(attrs).get("href", "") or "", "text": ""}

    def handle_data(self, data: str) -> None:
        if self._link is not None:
            self._link["text"] += data.strip() + " "

    def handle_endtag(self, tag: str) -> None:
        if tag == "a" and self._link is not None:
            self._link["text"] = self._link["text"].strip()
            self.links.append(self._link)
            self._link = None


def main() -> int:
    ensure_directories()
    rows = []
    qa = [
        "# Eligendo parse report",
        "",
        "Eligendo is treated as validation/completion, not as an automatic overwrite of Comune data.",
        "Election-specific Eligendo endpoints for Lamezia Terme must be added to sources/sources.yml before automated comparison.",
        "",
    ]
    source_docs = read_csv(PROCESSED_DIR / "source_documents.csv")
    for doc in source_docs:
        if "Eligendo" not in doc.get("publisher", ""):
            continue
        local_path = doc.get("local_path", "")
        source_doc_id = doc.get("source_doc_id", "")
        if not local_path:
            qa.append(f"- {source_doc_id}: no local file, pending download or endpoint discovery.")
            doc["extraction_status"] = "pending_endpoint_discovery"
            continue
        path = ROOT / local_path
        if path.suffix.lower() not in {".html", ".htm"}:
            qa.append(f"- {source_doc_id}: archived as {path.suffix}; no parser configured.")
            doc["extraction_status"] = "archived_no_parser"
            continue
        parser = LinkParser()
        parser.feed(path.read_text(encoding="utf-8", errors="replace"))
        for link in parser.links:
            rows.append({"source_doc_id": source_doc_id, "link_text": link["text"], "href": link["href"]})
        qa.append(f"- {source_doc_id}: {len(parser.links)} links inventoried.")
        doc["extraction_status"] = "inventory_extracted"

    write_csv(INTERIM_TABLES_DIR / "eligendo_link_inventory.csv", rows, ["source_doc_id", "link_text", "href"])
    (QA_DIR / "eligendo_parse_report.md").write_text("\n".join(qa) + "\n", encoding="utf-8")
    write_csv(PROCESSED_DIR / "source_documents.csv", source_docs, CSV_HEADERS["source_documents.csv"])
    print(f"eligendo_links={len(rows)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
