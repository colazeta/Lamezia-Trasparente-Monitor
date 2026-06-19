from __future__ import annotations

import hashlib
import sys
from datetime import datetime
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlsplit, urlunsplit
from urllib.request import Request, urlopen

from utils import (
    CSV_HEADERS,
    PROCESSED_DIR,
    QA_DIR,
    RAW_DIR,
    ensure_processed_csvs,
    expand_source_entries,
    load_sources,
    relpath,
    upsert_rows,
)


USER_AGENT = "Mozilla/5.0 (Lamezia Trasparente Monitor source archive)"


def safe_url(url: str) -> str:
    parts = urlsplit(url)
    path = quote(parts.path, safe="/%")
    query = quote(parts.query, safe="=&%:/?+,-._~")
    return urlunsplit((parts.scheme, parts.netloc, path, query, parts.fragment))


def extension_for(entry: dict, content_type: str, url: str) -> str:
    expected = (entry.get("expected_format") or "").lower().lstrip(".")
    if expected:
        return expected
    suffix = Path(urlsplit(url).path).suffix.lstrip(".")
    if suffix:
        return suffix
    if "html" in content_type:
        return "html"
    if "xml" in content_type:
        return "xml"
    if "pdf" in content_type:
        return "pdf"
    return "bin"


def source_row(entry: dict, **updates: str) -> dict:
    row = {
        "source_doc_id": entry.get("source_doc_id", ""),
        "election_id": entry.get("election_id", ""),
        "publisher": entry.get("publisher", ""),
        "source_type": entry.get("source_type", ""),
        "title": entry.get("title", ""),
        "url": entry.get("url", ""),
        "local_path": "",
        "retrieval_date": "",
        "document_date": entry.get("document_date", ""),
        "file_format": entry.get("expected_format", ""),
        "checksum_sha256": "",
        "extraction_method": entry.get("extraction_method", ""),
        "extraction_status": "pending",
        "confidence_level": entry.get("confidence_level", ""),
        "notes": entry.get("notes", ""),
    }
    row.update(updates)
    return row


def download(entry: dict) -> tuple[dict, str | None]:
    url = entry.get("url", "")
    source_doc_id = entry.get("source_doc_id", "")
    if entry.get("enabled", True) is False or not url:
        return source_row(entry, extraction_status="pending_discovery"), None

    req = Request(safe_url(url), headers={"User-Agent": USER_AGENT})
    try:
        with urlopen(req, timeout=45) as response:
            data = response.read()
            content_type = response.headers.get_content_type()
            ext = extension_for(entry, content_type, url)
    except (HTTPError, URLError, TimeoutError, OSError) as exc:
        message = f"{source_doc_id}: download failed for {url}: {exc}"
        return source_row(entry, extraction_status="download_failed", notes=f"{entry.get('notes', '')} | {message}"), message

    storage_subdir = entry.get("storage_subdir") or ("eligendo" if "Eligendo" in entry.get("publisher", "") else "comune_lamezia")
    target_dir = RAW_DIR / storage_subdir
    target_dir.mkdir(parents=True, exist_ok=True)
    local_path = target_dir / f"{source_doc_id}.{ext}"
    local_path.write_bytes(data)
    checksum = hashlib.sha256(data).hexdigest()
    retrieval_date = datetime.now().date().isoformat()
    return (
        source_row(
            entry,
            local_path=relpath(local_path),
            retrieval_date=retrieval_date,
            file_format=ext,
            checksum_sha256=checksum,
            extraction_status="downloaded_not_extracted",
        ),
        None,
    )


def main() -> int:
    ensure_processed_csvs()
    entries = expand_source_entries(load_sources())
    rows = []
    errors = []
    for entry in entries:
        row, error = download(entry)
        rows.append(row)
        if error:
            errors.append(error)

    upsert_rows(PROCESSED_DIR / "source_documents.csv", "source_doc_id", rows, CSV_HEADERS["source_documents.csv"])
    QA_DIR.mkdir(parents=True, exist_ok=True)
    report = QA_DIR / "download_report.md"
    ok = [row for row in rows if row["extraction_status"] == "downloaded_not_extracted"]
    pending = [row for row in rows if row["extraction_status"] == "pending_discovery"]
    failed = [row for row in rows if row["extraction_status"] == "download_failed"]
    report.write_text(
        "# Download report\n\n"
        f"- Downloaded: {len(ok)}\n"
        f"- Pending discovery: {len(pending)}\n"
        f"- Failed: {len(failed)}\n\n"
        "## Failed sources\n\n"
        + ("\n".join(f"- {error}" for error in errors) if errors else "None.\n")
        + "\n\n## Pending discovery\n\n"
        + ("\n".join(f"- {row['source_doc_id']}: {row['title']}" for row in pending) if pending else "None.\n")
        + "\n",
        encoding="utf-8",
    )
    print(f"downloaded={len(ok)} failed={len(failed)} pending={len(pending)}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
