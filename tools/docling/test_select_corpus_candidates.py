from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).with_name("select_corpus_candidates.py")
SPEC = importlib.util.spec_from_file_location("docling_corpus_selector", MODULE_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class CorpusSelectorTest(unittest.TestCase):
    def test_pool_excludes_non_publishable_and_non_low_risk(self) -> None:
        latest = {
            "items": [
                {
                    "id": "safe",
                    "publication_number": "2026/1",
                    "subject": "Variazione di bilancio",
                    "public_visibility": "publishable",
                    "privacy_risk": "low",
                    "classification": {"sector": {"id": "bilancio_finanze"}, "act_category": {"id": "deliberazioni"}},
                    "presentation": {"area_theme": {"theme_id": "bilancio_tributi"}},
                },
                {
                    "id": "hidden",
                    "publication_number": "2026/2",
                    "subject": "Dato personale",
                    "public_visibility": "metadata_only",
                    "privacy_risk": "high",
                },
            ]
        }
        manifest = {
            "documents": [
                {
                    "publication_number": "2026/1",
                    "storage_path": "data/public/albo/documents/2026/a.pdf",
                    "sha256": "a" * 64,
                    "size_bytes": 10,
                    "preservation_status": "archived",
                    "public_visibility": "publishable",
                    "privacy_risk": "low",
                },
                {
                    "publication_number": "2026/2",
                    "storage_path": "data/public/albo/documents/2026/b.pdf",
                    "sha256": "b" * 64,
                    "size_bytes": 10,
                    "preservation_status": "archived",
                    "public_visibility": "publishable",
                    "privacy_risk": "low",
                },
            ]
        }
        pool = MODULE.build_pool(latest, manifest)
        self.assertEqual([item["id"] for item in pool], ["safe"])

    def test_selected_output_does_not_copy_subject(self) -> None:
        record = {
            "id": "safe",
            "publicationNumber": "2026/1",
            "sha256": "a" * 64,
            "storagePath": "data/public/albo/documents/2026/a.pdf",
            "sizeBytes": 100,
            "actCategory": "deliberazioni",
            "sector": "bilancio_finanze",
            "areaTheme": "bilancio_tributi",
            "_finance": True,
            "_procurement": False,
            "_ordinary": False,
        }
        selected = MODULE.select_candidates([record], per_class=1)
        self.assertEqual(len(selected), 1)
        self.assertEqual(selected[0]["benchmarkClass"], "financial-layout-candidate")
        self.assertEqual(selected[0]["contentPolicy"], "metrics-only")
        self.assertNotIn("subject", selected[0])


if __name__ == "__main__":
    unittest.main()
