# WhisperX municipal-session PoC

This directory evaluates `m-bain/whisperX` as a **derived transcript processor** for public municipal-session recordings already acquired/reviewed by Lamezia Trasparente.

It is intentionally not a downloader, media-source resolver, speaker-identity system or production worker.

## Upstream pin

```text
whisperx==3.8.6
```

Upstream license: BSD-2-Clause.

Python supported by the pinned upstream release: `>=3.10,<3.14`.

Any WhisperX upgrade must be benchmarked again on the same reviewed municipal-session corpus before promotion.

## Processing track

The processor evaluates only:

```text
already-acquired local media → WhisperX ASR → word alignment → derived JSON
```

Diarization is **disabled**. No Hugging Face token is required for the ASR/alignment gate.

This is deliberate: search, navigation and timestamped quotations can have value even when speaker identity is unavailable.

## Phase 2 real benchmark

The real benchmark is intentionally separated from production source acquisition.

The selected item is a public mirror of the 19 May 2026 council session. Because the institutional recording locator has not yet been consolidated, its provenance remains:

```text
sourceRole = benchmark-only-public-mirror
canonicalStatus = not-established
```

The benchmark workflow may temporarily acquire that public mirror inside an isolated CI runner in order to produce a bounded local clip. The **WhisperX processor itself still receives only a local file and never a URL**.

Current bounded benchmark profile:

- clip: 300–900 seconds (10 minutes);
- acquisition tool: pinned `yt-dlp==2026.8.19`, benchmark-only;
- derived audio: 16 kHz mono PCM, temporary runner storage only;
- WhisperX: `3.8.6`;
- device: CPU;
- compute type: int8;
- model: `small`;
- batch size: 4;
- diarization: disabled.

### Metrics-only retention

The workflow temporarily creates the aligned transcript only to calculate technical metrics, then deletes both the media and transcript before artifact upload. The only retained CI artifact is a small JSON containing aggregate/non-content metrics:

- exact clip SHA-256;
- language;
- segment/word counts;
- word-alignment coverage;
- mean aligned-word confidence when available;
- elapsed time and real-time factor;
- words/minute;
- timing violation count;
- fixed boolean hits for the reviewed public terms `consiglio`, `comunale`, `lamezia`.

It does **not** retain segment text, word text, audio/video, screenshots, diarization labels or personal speaker identity. The artifact is short-retention and exists only to support the promotion decision.

A metrics-only pass demonstrates technical execution/alignment, not transcript accuracy. Names, amounts, votes, legal references and hallucinations still require a separate human spot-check before any production promotion.

## Local CPU setup

Use a dedicated Python environment. CPU/int8 is the first zero-cost baseline:

```bash
python3 -m venv .local/whisperx-venv
source .local/whisperx-venv/bin/activate
python -m pip install --upgrade pip uv
python -m uv pip install --python "$(command -v python)" --torch-backend=cpu \
  -r tools/whisperx/requirements.txt
```

The first run may download Whisper/faster-whisper and language-specific alignment model artifacts into upstream caches. That is acceptable for the isolated benchmark. A future production worker must define and preflight an explicit offline model cache before activation.

## Run a local extraction

Only an already-acquired local media path is accepted:

```bash
python tools/whisperx/extract_media.py /path/to/reviewed-session.mp4 \
  --model small \
  --output-dir tmp/whisperx
```

The extractor never accepts or fetches a URL.

Default execution profile:

- device: CPU;
- compute type: int8;
- model: `small` (PoC smoke baseline, not a quality claim);
- batch size: 4;
- max source size: 1 GiB;
- max decoded duration: 8 hours;
- diarization: disabled.

Model selection is part of the benchmark. If `small` is insufficient on local names/administrative vocabulary, compare a larger model on the same source SHA rather than silently changing the default and calling it an improvement.

## Output

For a source `consiglio.mp4` with SHA-256 prefix `abc123...`:

```text
tmp/whisperx/
  consiglio-abc123....whisperx.json
  consiglio-abc123....whisperx.manifest.json
```

The transcript JSON contains:

- source SHA-256;
- WhisperX version/model/device/compute type;
- detected language;
- media duration;
- aligned segments;
- word-level timestamps and confidence where available;
- explicit `diarization.enabled=false`.

The manifest contains source filename/hash/size, processing limits and aggregate metrics such as segment count, word count, elapsed time and real-time factor.

Neither file records the absolute input path. Both are written under `tmp/`, which is not a publication surface.

## Canonical vs derived

The official recording is the evidence. WhisperX JSON is marked:

```text
representationKind = derived-noncanonical
```

A transcript may be wrong even when it looks fluent. Names, places, numbers, protocol references and administrative terminology require particular caution.

## Speaker diarization is not speaker identity

A future optional diarization track may produce labels such as:

```text
SPEAKER_00
SPEAKER_01
```

Those labels are anonymous acoustic clusters. They are **not** Mario Murone, a councillor, a municipal officer or any other named person unless a separate human/provenance workflow validates that relation.

Do not use automated voice recognition to silently convert diarization labels into identities.

WhisperX upstream itself documents limitations in diarization and overlapping speech. Diarization therefore remains a separate promotion gate and is not required for the ASR/alignment benchmark.

## First corpus candidate

`benchmark-corpus.public.json` records the public mirror and the selected bounded benchmark clip. Its role remains explicitly `benchmark-only-public-mirror`; canonical institutional provenance has not yet been established.

Do not treat the mirror as the production recording. Resolve an institutional recording locator before any LT source integration.

## Privacy / minimisation

Public council recordings can still contain interventions or personal data concerning third parties. A machine transcript makes content dramatically easier to search and redistribute, so publication has a different privacy impact from merely linking a recording.

The benchmark therefore retains no real transcript artifact. Persistence/publication requires a later policy for source review, correction/versioning, minimisation/redaction and retention.

## Lightweight tests

The helper tests require no WhisperX installation:

```bash
python tools/whisperx/test_extract_media.py
python tools/whisperx/test_benchmark_metrics.py
python -m py_compile tools/whisperx/extract_media.py tools/whisperx/benchmark_metrics.py
```

They check content-keyed naming, bounded local-file input, atomic writes, path privacy, metrics minimisation and the absence of invented speaker identity in the normalised representation.

## Promotion gate after the real benchmark

A technically successful metrics-only benchmark must show at minimum:

1. Italian language detection and non-empty ASR output;
2. high word-timestamp coverage with no material timing anomalies;
3. measured CPU real-time factor inside an operationally plausible envelope;
4. no media/transcript leakage into retained artifacts;
5. no diarization or identity inference.

That is **not sufficient** to claim transcription quality. Before worker wiring, manually spot-check a few timestamp windows for proper names, administrative vocabulary, numbers, overlaps and hallucinations. Only after that evidence should LT design the processor contract and trusted worker adapter.
