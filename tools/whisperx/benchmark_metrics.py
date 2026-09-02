#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import math
import re
from pathlib import Path
from typing import Any

REVIEWED_TERMS = ("consiglio", "comunale", "lamezia", "sondrio")


def load_json(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError("expected JSON object")
    return value


def finite_number(value: Any) -> float | None:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return number if math.isfinite(number) else None


def normalise_token(value: str) -> str:
    return re.sub(r"[^a-zà-ÿ0-9]+", "", value.casefold())


def build_metrics(
    transcript: dict[str, Any],
    manifest: dict[str, Any],
    *,
    benchmark_id: str,
    source_role: str,
    canonical_status: str,
    source_provider: str,
    source_id: str,
    clip_start_seconds: int,
    clip_requested_seconds: int,
) -> dict[str, Any]:
    segments = transcript.get("segments")
    if not isinstance(segments, list):
        segments = []

    tokens: list[str] = []
    word_scores: list[float] = []
    aligned_words = 0
    word_count = 0
    timing_violations = 0
    previous_end = -1.0

    for segment in segments:
        if not isinstance(segment, dict):
            continue
        start = finite_number(segment.get("start"))
        end = finite_number(segment.get("end"))
        if start is not None and end is not None:
            if start < 0 or end < start or (previous_end >= 0 and start + 0.25 < previous_end):
                timing_violations += 1
            previous_end = max(previous_end, end)

        words = segment.get("words")
        if not isinstance(words, list):
            continue
        for word in words:
            if not isinstance(word, dict):
                continue
            raw = str(word.get("word") or "").strip()
            if not raw:
                continue
            word_count += 1
            token = normalise_token(raw)
            if token:
                tokens.append(token)
            word_start = finite_number(word.get("start"))
            word_end = finite_number(word.get("end"))
            if word_start is not None and word_end is not None and word_end >= word_start >= 0:
                aligned_words += 1
            score = finite_number(word.get("score"))
            if score is not None and 0 <= score <= 1:
                word_scores.append(score)

    result = manifest.get("result") if isinstance(manifest.get("result"), dict) else {}
    duration = finite_number(result.get("durationSeconds"))
    elapsed = finite_number(result.get("elapsedSeconds"))
    rtf = finite_number(result.get("realTimeFactor"))

    token_set = set(tokens)
    term_hits = {term: term in token_set for term in REVIEWED_TERMS}
    alignment_coverage = aligned_words / word_count if word_count else 0.0
    mean_score = sum(word_scores) / len(word_scores) if word_scores else None
    words_per_minute = (word_count / duration * 60.0) if duration and duration > 0 else None

    return {
        "schemaVersion": 1,
        "benchmarkId": benchmark_id,
        "sourceRole": source_role,
        "canonicalStatus": canonical_status,
        "source": {"provider": source_provider, "id": source_id},
        "clip": {
            "startSeconds": clip_start_seconds,
            "requestedSeconds": clip_requested_seconds,
            "sha256": transcript.get("sourceSha256"),
            "actualDurationSeconds": round(duration, 3) if duration is not None else None,
        },
        "processor": {
            "name": "whisperx",
            "version": transcript.get("processor", {}).get("version") if isinstance(transcript.get("processor"), dict) else None,
            "model": transcript.get("processor", {}).get("model") if isinstance(transcript.get("processor"), dict) else None,
            "device": transcript.get("processor", {}).get("device") if isinstance(transcript.get("processor"), dict) else None,
            "computeType": transcript.get("processor", {}).get("computeType") if isinstance(transcript.get("processor"), dict) else None,
            "diarizationEnabled": False,
        },
        "result": {
            "status": result.get("status"),
            "language": transcript.get("language"),
            "segmentCount": len(segments),
            "wordCount": word_count,
            "alignedWordCount": aligned_words,
            "alignmentCoverage": round(alignment_coverage, 4),
            "meanAlignedWordScore": round(mean_score, 4) if mean_score is not None else None,
            "elapsedSeconds": round(elapsed, 3) if elapsed is not None else None,
            "realTimeFactor": round(rtf, 4) if rtf is not None else None,
            "wordsPerMinute": round(words_per_minute, 2) if words_per_minute is not None else None,
            "timingViolationCount": timing_violations,
            "reviewedTermHits": term_hits,
        },
        "privacy": {
            "transcriptRetained": False,
            "rawMediaRetained": False,
            "speakerIdentityProduced": False,
        },
        "qualityStatus": "metrics-only-not-human-transcript-reviewed",
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Produce content-minimised WhisperX benchmark metrics.")
    parser.add_argument("--transcript", type=Path, required=True)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--benchmark-id", required=True)
    parser.add_argument("--source-role", required=True)
    parser.add_argument("--canonical-status", required=True)
    parser.add_argument("--source-provider", required=True)
    parser.add_argument("--source-id", required=True)
    parser.add_argument("--clip-start-seconds", type=int, required=True)
    parser.add_argument("--clip-requested-seconds", type=int, required=True)
    args = parser.parse_args()

    metrics = build_metrics(
        load_json(args.transcript),
        load_json(args.manifest),
        benchmark_id=args.benchmark_id,
        source_role=args.source_role,
        canonical_status=args.canonical_status,
        source_provider=args.source_provider,
        source_id=args.source_id,
        clip_start_seconds=args.clip_start_seconds,
        clip_requested_seconds=args.clip_requested_seconds,
    )
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(metrics, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(metrics, ensure_ascii=False, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
