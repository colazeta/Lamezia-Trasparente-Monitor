#!/usr/bin/env python3
from __future__ import annotations

import json
import tempfile
from pathlib import Path

from prepare_quality_review import build_packet, require_tmp_output


PLAN = {
    "reviewId": "fixture-quality",
    "processorPolicy": {
        "name": "whisperx",
        "expectedVersion": "3.8.6",
        "requiredLanguage": "it",
        "diarizationEnabled": False,
        "sourceSha256Required": True,
        "automaticPassPermitted": False,
    },
    "expectedTerms": [
        {"value": "Mario Murone", "category": "proper-name"},
        {"value": "Sant'Eufemia", "category": "local-toponym"},
        {"value": "PNRR", "category": "acronym-policy"},
    ],
    "mandatoryHumanReviewDimensions": ["proper-names", "numbers", "hallucinations"],
}


def transcript(**overrides):
    value = {
        "sourceSha256": "a" * 64,
        "language": "it",
        "durationSeconds": 100,
        "processor": {"name": "whisperx", "version": "3.8.6", "model": "small"},
        "diarization": {"enabled": False},
        "segments": [
            {"start": 2.0, "end": 8.0, "text": "Interviene Mario Murone sulla questione."},
            {"start": 30.0, "end": 36.0, "text": "Si parla di Sant'Eufemia e del PNRR."},
            {"start": 70.0, "end": 76.0, "text": "Frase fixture che non deve comparire nel packet senza snippet."},
        ],
    }
    value.update(overrides)
    return value


def expect_error(value, fragment):
    try:
        build_packet(value, PLAN, include_snippets=False)
    except ValueError as exc:
        assert fragment in str(exc)
    else:
        raise AssertionError(f"Expected ValueError containing {fragment!r}")


def main() -> int:
    packet = build_packet(transcript(), PLAN, include_snippets=False)
    assert packet["sourceSha256"] == "a" * 64
    assert packet["humanDecision"]["status"] == "pending-human-review"
    assert packet["humanDecision"]["automaticPassPermitted"] is False
    assert packet["processor"]["speakerIdentityStatus"] == "not-produced"
    assert packet["processor"]["diarizationEnabled"] is False
    assert packet["privacy"]["speakerIdentityProduced"] is False
    assert packet["privacy"]["containsTranscriptSnippets"] is False

    counts = {item["value"]: item["count"] for item in packet["termDiagnostics"]}
    assert counts == {"Mario Murone": 1, "Sant'Eufemia": 1, "PNRR": 1}
    assert all(0 <= item["start"] < item["end"] <= 100 for item in packet["reviewWindows"])
    reasons = {reason for item in packet["reviewWindows"] for reason in item["reasons"]}
    assert {"coverage-start", "coverage-mid-1", "coverage-mid-2", "coverage-end"} <= reasons
    assert "first-hit:proper-name" in reasons
    assert "first-hit:local-toponym" in reasons
    assert "first-hit:acronym-policy" in reasons
    assert "frase fixture" not in json.dumps(packet, ensure_ascii=False).casefold()

    snippet_packet = build_packet(transcript(), PLAN, include_snippets=True)
    assert snippet_packet["privacy"]["mustRemainLocal"] is True
    assert any("transcriptSnippet" in item for item in snippet_packet["reviewWindows"])

    with tempfile.TemporaryDirectory() as tmpdir:
        require_tmp_output(Path(tmpdir) / "review.json")
    try:
        require_tmp_output(Path("quality-review.json"))
    except ValueError:
        pass
    else:
        raise AssertionError("Non-tmp snippet output should fail closed")

    expect_error(transcript(sourceSha256="bad"), "sourceSha256")
    expect_error(transcript(language="en"), "language=it")
    expect_error(transcript(diarization={"enabled": True}), "diarization-disabled")
    expect_error(transcript(processor={"name": "whisperx", "version": "3.7.0", "model": "small"}), "3.8.6")
    expect_error(transcript(segments=[]), "non-empty transcript")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
