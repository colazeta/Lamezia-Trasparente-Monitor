#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
from pathlib import Path
from typing import Any


def load_object(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"Expected JSON object: {path}")
    return value


def finite(value: Any) -> float | None:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return number if math.isfinite(number) else None


def norm(value: str) -> str:
    return re.sub(r"[^a-zà-ÿ0-9]+", " ", value.casefold()).strip()


def transcript_segments(transcript: dict[str, Any]) -> list[dict[str, Any]]:
    raw = transcript.get("segments")
    return [item for item in raw if isinstance(item, dict)] if isinstance(raw, list) else []


def transcript_duration(transcript: dict[str, Any], segments: list[dict[str, Any]]) -> float:
    direct = finite(transcript.get("durationSeconds"))
    if direct is not None and direct > 0:
        return direct
    ends = [finite(segment.get("end")) for segment in segments]
    valid = [value for value in ends if value is not None and value >= 0]
    return max(valid) if valid else 0.0


def segment_text(segment: dict[str, Any]) -> str:
    value = segment.get("text")
    if isinstance(value, str):
        return value.strip()
    words = segment.get("words")
    if isinstance(words, list):
        return " ".join(
            str(word.get("word") or "").strip()
            for word in words
            if isinstance(word, dict) and str(word.get("word") or "").strip()
        )
    return ""


def source_sha(transcript: dict[str, Any]) -> str | None:
    value = transcript.get("sourceSha256")
    return value.lower() if isinstance(value, str) and re.fullmatch(r"[0-9a-fA-F]{64}", value) else None


def term_hits(
    segments: list[dict[str, Any]], expected_terms: list[dict[str, Any]]
) -> list[dict[str, Any]]:
    hits: list[dict[str, Any]] = []
    prepared = [
        (
            str(term.get("value") or "").strip(),
            str(term.get("category") or "uncategorised").strip(),
        )
        for term in expected_terms
        if isinstance(term, dict) and str(term.get("value") or "").strip()
    ]

    for value, category in prepared:
        wanted = norm(value)
        occurrences: list[dict[str, float]] = []
        if wanted:
            for segment in segments:
                text = norm(segment_text(segment))
                if not text or wanted not in text:
                    continue
                start = finite(segment.get("start"))
                end = finite(segment.get("end"))
                if start is None or end is None or start < 0 or end < start:
                    continue
                occurrences.append({"start": round(start, 3), "end": round(end, 3)})
        hits.append(
            {
                "value": value,
                "category": category,
                "count": len(occurrences),
                "occurrences": occurrences[:5],
            }
        )
    return hits


def merge_windows(windows: list[dict[str, Any]], duration: float) -> list[dict[str, Any]]:
    cleaned: list[dict[str, Any]] = []
    for item in sorted(windows, key=lambda x: (float(x["start"]), float(x["end"]))):
        start = max(0.0, min(duration, float(item["start"]))) if duration > 0 else max(0.0, float(item["start"]))
        end = max(start, min(duration, float(item["end"]))) if duration > 0 else max(start, float(item["end"]))
        if end - start < 1:
            continue
        reasons = list(dict.fromkeys(item.get("reasons", [])))
        terms = list(dict.fromkeys(item.get("terms", [])))
        if cleaned and start <= float(cleaned[-1]["end"]) + 2:
            previous = cleaned[-1]
            previous["end"] = round(max(float(previous["end"]), end), 3)
            previous["reasons"] = list(dict.fromkeys(previous["reasons"] + reasons))
            previous["terms"] = list(dict.fromkeys(previous["terms"] + terms))
        else:
            cleaned.append(
                {
                    "start": round(start, 3),
                    "end": round(end, 3),
                    "reasons": reasons,
                    "terms": terms,
                }
            )
    for index, item in enumerate(cleaned, 1):
        item["id"] = f"window-{index:02d}"
    return cleaned


def deterministic_windows(
    duration: float,
    hits: list[dict[str, Any]],
    *,
    context_seconds: float = 10.0,
) -> list[dict[str, Any]]:
    windows: list[dict[str, Any]] = []
    if duration > 0:
        for label, fraction in (
            ("coverage-start", 0.05),
            ("coverage-mid-1", 0.35),
            ("coverage-mid-2", 0.65),
            ("coverage-end", 0.90),
        ):
            center = duration * fraction
            windows.append(
                {
                    "start": center - context_seconds,
                    "end": center + context_seconds,
                    "reasons": [label],
                    "terms": [],
                }
            )

    first_by_category: dict[str, tuple[str, dict[str, float]]] = {}
    for hit in hits:
        occurrences = hit.get("occurrences")
        if not isinstance(occurrences, list) or not occurrences:
            continue
        first = occurrences[0]
        if not isinstance(first, dict):
            continue
        category = str(hit.get("category") or "uncategorised")
        first_by_category.setdefault(category, (str(hit.get("value") or ""), first))

    for category, (term, occurrence) in sorted(first_by_category.items()):
        start = float(occurrence["start"])
        end = float(occurrence["end"])
        windows.append(
            {
                "start": start - context_seconds,
                "end": end + context_seconds,
                "reasons": [f"first-hit:{category}"],
                "terms": [term],
            }
        )
    return merge_windows(windows, duration)


def snippet_for_window(segments: list[dict[str, Any]], start: float, end: float) -> str:
    snippets: list[str] = []
    for segment in segments:
        seg_start = finite(segment.get("start"))
        seg_end = finite(segment.get("end"))
        if seg_start is None or seg_end is None or seg_end < start or seg_start > end:
            continue
        text = segment_text(segment)
        if text:
            snippets.append(text)
    return " ".join(snippets).strip()


def require_tmp_output(path: Path) -> None:
    resolved = path.resolve()
    if "tmp" not in resolved.parts:
        raise ValueError("Quality review packets containing transcript snippets must stay under a tmp/ directory")


def build_packet(
    transcript: dict[str, Any],
    plan: dict[str, Any],
    *,
    include_snippets: bool,
) -> dict[str, Any]:
    segments = transcript_segments(transcript)
    duration = transcript_duration(transcript, segments)
    expected_terms = plan.get("expectedTerms")
    if not isinstance(expected_terms, list):
        expected_terms = []
    hits = term_hits(segments, expected_terms)
    windows = deterministic_windows(duration, hits)

    if include_snippets:
        for window in windows:
            window["transcriptSnippet"] = snippet_for_window(
                segments, float(window["start"]), float(window["end"])
            )

    processor = transcript.get("processor") if isinstance(transcript.get("processor"), dict) else {}
    diarization = transcript.get("diarization") if isinstance(transcript.get("diarization"), dict) else {}

    return {
        "schemaVersion": 1,
        "reviewId": plan.get("reviewId"),
        "representationKind": "derived-local-quality-review",
        "sourceSha256": source_sha(transcript),
        "durationSeconds": round(duration, 3),
        "processor": {
            "name": processor.get("name") or "whisperx",
            "version": processor.get("version"),
            "model": processor.get("model"),
            "language": transcript.get("language"),
            "diarizationEnabled": bool(diarization.get("enabled", False)),
            "speakerIdentityStatus": "not-produced",
        },
        "termDiagnostics": hits,
        "reviewWindows": windows,
        "mandatoryHumanReviewDimensions": plan.get("mandatoryHumanReviewDimensions", []),
        "humanDecision": {
            "status": "pending-human-review",
            "automaticPassPermitted": False,
            "criticalNameErrors": None,
            "criticalNumericOrVoteErrors": None,
            "materialHallucinationOrOmission": None,
            "timestampUsabilityAccepted": None,
            "overlapHandlingAccepted": None,
            "reviewerNotes": None,
        },
        "privacy": {
            "containsTranscriptSnippets": include_snippets,
            "mustRemainLocal": include_snippets,
            "speakerIdentityProduced": False,
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Prepare a non-automatic human quality-review packet for a local WhisperX transcript."
    )
    parser.add_argument("--transcript", type=Path, required=True)
    parser.add_argument("--plan", type=Path, default=Path(__file__).with_name("lamezia-quality-plan.public.json"))
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--include-snippets", action="store_true")
    args = parser.parse_args()

    if args.include_snippets:
        require_tmp_output(args.output)

    packet = build_packet(
        load_object(args.transcript),
        load_object(args.plan),
        include_snippets=args.include_snippets,
    )
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(packet, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )

    # Print only a non-content summary, never transcript snippets.
    summary = {
        "reviewId": packet["reviewId"],
        "sourceSha256": packet["sourceSha256"],
        "durationSeconds": packet["durationSeconds"],
        "termHitCount": sum(1 for hit in packet["termDiagnostics"] if hit["count"] > 0),
        "reviewWindowCount": len(packet["reviewWindows"]),
        "humanDecision": packet["humanDecision"]["status"],
        "outputSha256": hashlib.sha256(args.output.read_bytes()).hexdigest(),
    }
    print(json.dumps(summary, ensure_ascii=False, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
