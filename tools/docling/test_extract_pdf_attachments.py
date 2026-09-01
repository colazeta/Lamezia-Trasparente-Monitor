from __future__ import annotations

import hashlib
import importlib.util
import tempfile
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).with_name("extract_pdf_attachments.py")
SPEC = importlib.util.spec_from_file_location("docling_attachment_extractor", MODULE_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class ExtractPdfAttachmentsHelpersTest(unittest.TestCase):
    def test_sha256_bytes(self) -> None:
        payload = b"embedded administrative document"
        self.assertEqual(MODULE.sha256_bytes(payload), hashlib.sha256(payload).hexdigest())

    def test_safe_attachment_name_flattens_paths(self) -> None:
        digest = "a" * 64
        name = MODULE.safe_attachment_name("../../convocazione 2.pdf", 1, digest)
        self.assertEqual(name, "convocazione_2-01-aaaaaaaaaaaa.pdf")
        self.assertNotIn("/", name)
        self.assertNotIn("\\", name)

    def test_atomic_write_bytes_replaces_target(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "attachment.pdf"
            MODULE.atomic_write_bytes(path, b"first")
            MODULE.atomic_write_bytes(path, b"second")
            self.assertEqual(path.read_bytes(), b"second")


if __name__ == "__main__":
    unittest.main()
