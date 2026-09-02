#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import tempfile
import time
from datetime import datetime, timezone
from importlib.metadata import PackageNotFoundError, version
from pathlib import Path
from typing import Any

SCHEMA_VERSION = 1
REPRESENTATION_KIND = "derived-noncanonical"
PROCESSOR_NAME = "whisperx"
DEFAULT_MAX_BYTES = 1024 * 1024 * 1024
DEFAULT_MAX_DURATION_SECONDS = 8 * 60 * 60
DEFAULT_MODEL = "small"
DEFAULT_BATCH_SIZE = 4
DEFAULT_DEVICE = "cpu"
DEFAULT_COMPUTE_TYPE = "int8"
WHISPER_SAMPLE_RATE = 16000
ALLOWED_SUFFIXES = {
    ".aac",
    ".flac",
    ".m4a",
    ".mkv",
    ".mov",
    ".mp3",
    ".mp4",
    ".ogg",
    ".opus",
    ".wav",
    ".webm",
}


class SourceValidationError(Exception):
    pass


class ResourceBoundError(Exception):
    pass


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def package_version(name: str) -> str:
    try:
        return version(name)
    except PackageNotFoundError:
        return "not-installed"


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def safe_stem(value: str) -> str:
    stem = re.sub(r"[^A-Za-z0-9._-]+", "_", value).strip("._-")
    stem = re.sub(r"_+", "_", stem)
    return stem[:80] or "media"


def output_prefix(source: Path, source_sha256: str) -> str:
    return f"{safe_stem(source.stem)}-{source_sha256[:12]}"


def atomic_write_bytes(path: Path, payload: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temp_name = tempfile.mkstemp(
        dir=path.parent,
        prefix=f".{path.name}.",
        suffix=".tmp",
    )
    try:
        with os.fdopen(fd, "wb") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temp_name, path)
    except Exception:
        try:
            os.unlink(temp_name)
        except FileNotFoundError:
            pass
        raise


def atomic_write_json(path: Path, value: Any) -> None:
    payload = (
        json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    ).encode("utf-8")
    atomic_write_bytes(path, payload)


def validate_source(path: Path, max_bytes: int) -> tuple[int, str]:
    if max_bytes <= 0:
        raise SourceValidationError("maxBytes must be positive")
    if not path.is_file():
        raise SourceValidationError("source must be an already-acquired local file")
    if path.suffix.lower() not in ALLOWED_SUFFIXES:
        raise SourceValidationError("unsupported local media suffix")
    size_bytes = path.stat().st_size
    if size_bytes <= 0:
        raise SourceValidationError("source media is empty")
    if size_bytes > max_bytes:
        raise ResourceBoundError("source media exceeds maxBytes")
    return size_bytes, sha256_file(path)


def probe_duration_seconds(path: Path) -> float | None:
    try:
        import av
    except Exception:
        return None

    try:
        with av.open(str(path)) as container:
            if container.duration is None:
                return None
            return max(0.0, float(container.duration) / 1_000_000.0)
    except Exception:
        return None


def bounded_float(value: Any) -> float | None:
    if value is None:
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    if number < 0:
        return None
    return round(number, 4)


def normalise_words(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []
    words: list[dict[str, Any]] = []
    for item in value:
        if not isinstance(item, dict):
            continue
        word = str(item.get("word") or "").strip()
        if not word:
            continue
        normalised: dict[str, Any] = {
            "word": word,
            "start": bounded_float(item.get("start")),
            "end": bounded_float(item.get("end")),
        }
        score = bounded_float(item.get("score"))
        if score is not None:
            normalised["score"] = score
        words.append(normalised)
    return words


def normalise_segments(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []
    segments: list[dict[str, Any]] = []
    for index, item in enumerate(value):
        if not isinstance(item, dict):
            continue
        text = str(item.get("text") or "").strip()
        segment: dict[str, Any] = {
            "id": index,
            "start": bounded_float(item.get("start")),
            "end": bounded_float(item.get("end")),
            "text": text,
            "words": normalise_words(item.get("words")),
        }
        segments.append(segment)
    return segments


def build_manifest_base(
    source: Path,
    source_sha256: str,
    size_bytes: int,
    model: str,
    max_bytes: int,
    max_duration_seconds: int,
) -> dict[str, Any]:
    return {
        "schemaVersion": SCHEMA_VERSION,
        "representationKind": REPRESENTATION_KIND,
        "source": {
            "fileName": source.name,
            "sha256": source_sha256,
            "sizeBytes": size_bytes,
        },
        "processor": {
            "name": PROCESSOR_NAME,
            "version": package_version("whisperx"),
            "model": model,
            "device": DEFAULT_DEVICE,
            "computeType": DEFAULT_COMPUTE_TYPE,
            "diarizationEnabled": False,
        },
        "limits": {
            "maxBytes": max_bytes,
            "maxDurationSeconds": max_duration_seconds,
        },
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Local-file WhisperX PoC for derived, word-aligned transcripts. "
            "It performs no media download and no speaker identity inference."
        )
    )
    parser.add_argument("input", type=Path, help="Already-acquired local media file")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("tmp/whisperx"),
    )
    parser.add_argument("--model", default=DEFAULT_MODEL)
    parser.add_argument("--batch-size", type=int, default=DEFAULT_BATCH_SIZE)
    parser.add_argument("--max-bytes", type=int, default=DEFAULT_MAX_BYTES)
    parser.add_argument(
        "--max-duration-seconds",
        type=int,
        default=DEFAULT_MAX_DURATION_SECONDS,
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    source = args.input.expanduser().resolve()
    output_dir = args.output_dir.expanduser().resolve()

    if args.batch_size <= 0 or args.max_duration_seconds <= 0:
        print("WhisperX resource limits must be positive", file=os.sys.stderr)
        return 2

    try:
        size_bytes, source_sha = validate_source(source, args.max_bytes)
    except (SourceValidationError, ResourceBoundError) as exc:
        print(type(exc).__name__, file=os.sys.stderr)
        return 2

    prefix = output_prefix(source, source_sha)
    manifest_path = output_dir / f"{prefix}.whisperx.manifest.json"
    transcript_path = output_dir / f"{prefix}.whisperx.json"
    manifest = build_manifest_base(
        source,
        source_sha,
        size_bytes,
        args.model,
        args.max_bytes,
        args.max_duration_seconds,
    )
    manifest["startedAt"] = utc_now()

    probed_duration = probe_duration_seconds(source)
    if (
        probed_duration is not None
        and probed_duration > args.max_duration_seconds
    ):
        manifest["result"] = {
            "status": "skipped",
            "code": "duration-bound",
            "durationSeconds": round(probed_duration, 3),
        }
        atomic_write_json(manifest_path, manifest)
        return 4

    if package_version("whisperx") == "not-installed":
        manifest["result"] = {"status": "failed", "code": "dependency-missing"}
        atomic_write_json(manifest_path, manifest)
        return 3

    started = time.perf_counter()
    try:
        import whisperx

        audio = whisperx.load_audio(str(source))
        exact_duration = len(audio) / WHISPER_SAMPLE_RATE
        if exact_duration > args.max_duration_seconds:
            raise ResourceBoundError("decoded audio exceeds maxDurationSeconds")

        model = whisperx.load_model(
            args.model,
            DEFAULT_DEVICE,
            compute_type=DEFAULT_COMPUTE_TYPE,
        )
        transcription = model.transcribe(audio, batch_size=args.batch_size)
        language = str(transcription.get("language") or "").strip()
        if not language:
            raise RuntimeError("WhisperX did not return a language code")

        align_model, align_metadata = whisperx.load_align_model(
            language_code=language,
            device=DEFAULT_DEVICE,
        )
        aligned = whisperx.align(
            transcription.get("segments") or [],
            align_model,
            align_metadata,
            audio,
            DEFAULT_DEVICE,
            return_char_alignments=False,
        )
        segments = normalise_segments(aligned.get("segments"))
        word_count = sum(len(segment["words"]) for segment in segments)
        elapsed = time.perf_counter() - started

        transcript = {
            "schemaVersion": SCHEMA_VERSION,
            "representationKind": REPRESENTATION_KIND,
            "sourceSha256": source_sha,
            "processor": {
                "name": PROCESSOR_NAME,
                "version": package_version("whisperx"),
                "model": args.model,
                "device": DEFAULT_DEVICE,
                "computeType": DEFAULT_COMPUTE_TYPE,
            },
            "language": language,
            "durationSeconds": round(exact_duration, 3),
            "diarization": {
                "enabled": False,
                "speakerIdentityStatus": "not-applicable",
            },
            "segments": segments,
        }
        atomic_write_json(transcript_path, transcript)

        manifest["result"] = {
            "status": "ok",
            "durationSeconds": round(exact_duration, 3),
            "language": language,
            "segmentCount": len(segments),
            "wordCount": word_count,
            "elapsedSeconds": round(elapsed, 3),
            "realTimeFactor": round(elapsed / exact_duration, 4)
            if exact_duration > 0
            else None,
        }
        manifest["artifacts"] = {
            "transcriptJson": transcript_path.name,
        }
        atomic_write_json(manifest_path, manifest)
        print(
            json.dumps(
                {
                    "status": "ok",
                    "manifest": manifest_path.name,
                    "transcript": transcript_path.name,
                    "sourceSha256": source_sha,
                    "durationSeconds": round(exact_duration, 3),
                    "segments": len(segments),
                    "words": word_count,
                }
            )
        )
        return 0
    except ResourceBoundError:
        manifest["result"] = {"status": "skipped", "code": "duration-bound"}
        atomic_write_json(manifest_path, manifest)
        return 4
    except Exception as exc:
        manifest["result"] = {
            "status": "failed",
            "code": "processing-failed",
            "errorType": type(exc).__name__,
        }
        atomic_write_json(manifest_path, manifest)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
