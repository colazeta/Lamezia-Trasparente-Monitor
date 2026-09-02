from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).with_name("extract_media.py")
SPEC = importlib.util.spec_from_file_location("lt_whisperx_extract", MODULE_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class WhisperXExtractorHelpersTest(unittest.TestCase):
    def test_hash_and_prefix_are_content_keyed(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            source = Path(tmp) / "Seduta Consiglio!!.mp4"
            source.write_bytes(b"first-media-payload")
            first_sha = MODULE.sha256_file(source)
            first_prefix = MODULE.output_prefix(source, first_sha)

            source.write_bytes(b"second-media-payload")
            second_sha = MODULE.sha256_file(source)
            second_prefix = MODULE.output_prefix(source, second_sha)

            self.assertNotEqual(first_sha, second_sha)
            self.assertNotEqual(first_prefix, second_prefix)
            self.assertRegex(first_prefix, r"^Seduta_Consiglio-[a-f0-9]{12}$")

    def test_validate_source_accepts_only_local_bounded_media(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            source = Path(tmp) / "session.wav"
            source.write_bytes(b"not-real-audio-but-local")
            size, digest = MODULE.validate_source(source, 10_000)
            self.assertEqual(size, source.stat().st_size)
            self.assertEqual(len(digest), 64)

            with self.assertRaises(MODULE.ResourceBoundError):
                MODULE.validate_source(source, 2)

            unsupported = Path(tmp) / "session.txt"
            unsupported.write_text("https://example.org/media.mp4", encoding="utf-8")
            with self.assertRaises(MODULE.SourceValidationError):
                MODULE.validate_source(unsupported, 10_000)

    def test_atomic_json_write_does_not_leave_temporary_file(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / "manifest.json"
            MODULE.atomic_write_json(target, {"status": "ok"})
            self.assertEqual(json.loads(target.read_text(encoding="utf-8")), {"status": "ok"})
            self.assertEqual([path.name for path in Path(tmp).iterdir()], ["manifest.json"])

    def test_manifest_contains_filename_but_never_absolute_source_path(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            source = Path(tmp) / "reviewed-session.mp4"
            source.write_bytes(b"bounded")
            digest = MODULE.sha256_file(source)
            manifest = MODULE.build_manifest_base(
                source,
                digest,
                source.stat().st_size,
                "small",
                1024,
                3600,
            )
            encoded = json.dumps(manifest)
            self.assertEqual(manifest["source"]["fileName"], "reviewed-session.mp4")
            self.assertNotIn(str(source.resolve()), encoded)
            self.assertEqual(manifest["representationKind"], "derived-noncanonical")
            self.assertFalse(manifest["processor"]["diarizationEnabled"])

    def test_segment_normalisation_never_invents_speaker_identity(self) -> None:
        segments = MODULE.normalise_segments(
            [
                {
                    "start": 1.23456,
                    "end": 2.34567,
                    "text": " Buongiorno consiglieri ",
                    "speaker": "Mario Rossi",
                    "words": [
                        {"word": "Buongiorno", "start": 1.2, "end": 1.8, "score": 0.95},
                        {"word": "consiglieri", "start": 1.8, "end": 2.3},
                    ],
                }
            ]
        )
        self.assertEqual(segments[0]["text"], "Buongiorno consiglieri")
        self.assertNotIn("speaker", segments[0])
        self.assertNotIn("Mario Rossi", json.dumps(segments))
        self.assertEqual(segments[0]["start"], 1.2346)
        self.assertEqual(len(segments[0]["words"]), 2)


if __name__ == "__main__":
    unittest.main()
