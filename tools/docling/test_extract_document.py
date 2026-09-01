from __future__ import annotations

import hashlib
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).with_name("extract_document.py")
SPEC = importlib.util.spec_from_file_location("docling_poc_extractor", MODULE_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class ExtractDocumentHelpersTest(unittest.TestCase):
    def test_sha256_file(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "sample.pdf"
            payload = b"Lamezia Trasparente\n"
            path.write_bytes(payload)
            self.assertEqual(
                MODULE.sha256_file(path),
                hashlib.sha256(payload).hexdigest(),
            )

    def test_safe_stem_is_bounded_and_path_safe(self) -> None:
        value = MODULE.safe_stem("Delibera n. 12 / allegato molto lungo.pdf")
        self.assertEqual(value, "Delibera_n._12_allegato_molto_lungo")
        self.assertLessEqual(len(value), 96)
        self.assertNotIn("/", value)

    def test_atomic_write_json_is_valid_utf8_json(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "manifest.json"
            MODULE.atomic_write_json(path, {"citta": "Lamezia Terme", "n": 1})
            self.assertEqual(
                json.loads(path.read_text(encoding="utf-8")),
                {"citta": "Lamezia Terme", "n": 1},
            )

    def test_manifest_does_not_store_local_absolute_path(self) -> None:
        source = Path("/private/example/atto.pdf")
        manifest = MODULE.build_manifest_base(
            source,
            digest="a" * 64,
            size_bytes=42,
            extractor_version="2.124.0",
        )
        self.assertEqual(manifest["source"]["fileName"], "atto.pdf")
        self.assertNotIn("/private/example", json.dumps(manifest))


if __name__ == "__main__":
    unittest.main()
