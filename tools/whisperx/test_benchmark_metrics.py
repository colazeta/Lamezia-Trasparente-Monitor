#!/usr/bin/env python3
from benchmark_metrics import build_metrics


def main() -> int:
    transcript = {
        "sourceSha256": "a" * 64,
        "processor": {
            "version": "3.8.6",
            "model": "small",
            "device": "cpu",
            "computeType": "int8",
        },
        "language": "it",
        "segments": [
            {
                "start": 0.0,
                "end": 2.0,
                "text": "Questo testo non deve comparire nelle metriche",
                "words": [
                    {"word": "Consiglio", "start": 0.1, "end": 0.5, "score": 0.9},
                    {"word": "comunale", "start": 0.6, "end": 1.0, "score": 0.8},
                    {"word": "Lamezia", "start": 1.1, "end": 1.5, "score": 0.7},
                ],
            }
        ],
    }
    manifest = {
        "result": {
            "status": "ok",
            "durationSeconds": 60,
            "elapsedSeconds": 30,
            "realTimeFactor": 0.5,
        }
    }
    metrics = build_metrics(
        transcript,
        manifest,
        benchmark_id="fixture",
        mirror_video_id="fixture-video",
        clip_start_seconds=300,
        clip_requested_seconds=600,
    )
    assert metrics["result"]["alignmentCoverage"] == 1.0
    assert metrics["result"]["reviewedTermHits"] == {
        "consiglio": True,
        "comunale": True,
        "lamezia": True,
    }
    assert metrics["privacy"]["transcriptRetained"] is False
    assert metrics["privacy"]["speakerIdentityProduced"] is False
    serialised = str(metrics).lower()
    assert "questo testo" not in serialised
    assert "speaker_" not in serialised
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
