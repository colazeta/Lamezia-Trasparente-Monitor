# WhisperX municipal-session PoC

This directory evaluates `m-bain/whisperX` as a **derived transcript processor** for public municipal-session recordings already acquired/reviewed by Lamezia Trasparente.

It is intentionally not a downloader, media-source resolver, speaker-identity system or production worker.

## Upstream pin

```text
whisperx==3.8.6
```

Upstream license: BSD-2-Clause. Python supported by the pinned upstream release: `>=3.10,<3.14`.

Any WhisperX upgrade must be benchmarked again before promotion.

## Processing boundary

The processor evaluates only:

```text
already-acquired local media → WhisperX ASR → word alignment → derived JSON
```

Diarization is **disabled**. No Hugging Face token is required for the ASR/alignment gate. The extractor never accepts or fetches a URL.

## Phase 2: two distinct benchmark roles

The corpus deliberately separates **technical execution evidence** from **Lamezia-specific quality evidence**.

### A. Official technical control — current CI benchmark

The CI benchmark uses an official municipality-hosted MP3:

```text
Comune di Sondrio
Seduta consiglio comunale del 30 aprile 2026
sourceRole = official-municipal-control
canonicalStatus = official-source
```

This source is used only to answer the technical questions:

- can WhisperX 3.8.6 run CPU/int8 in our zero-cost environment?;
- does ASR + word alignment complete on real Italian council speech?;
- what alignment coverage and real-time factor do we observe?;
- can the workflow guarantee metrics-only retention?

It does **not** make Sondrio a production source for Lamezia Trasparente.

Current profile:

- direct official MP3 downloaded temporarily with `curl`;
- clip: 300–900 seconds (10 minutes);
- derived audio: 16 kHz mono PCM, temporary runner storage only;
- WhisperX `3.8.6`;
- CPU-only PyTorch;
- compute type `int8`;
- model `small`;
- batch size 4;
- diarization disabled.

### B. Lamezia quality candidate — separate gate

The 19 May 2026 Lamezia Terme council-session mirror remains in `benchmark-corpus.public.json` because it contains the vocabulary and names we ultimately need to evaluate.

Its status remains:

```text
sourceRole = benchmark-only-public-mirror
canonicalStatus = not-established
```

A public unauthenticated CI acquisition attempt was blocked by YouTube's bot challenge. **Do not add browser cookies, user credentials or repository secrets merely to force that benchmark through CI.** Resolve an institutional recording locator, or perform a separately reviewed local quality check, instead.

This Lamezia candidate is where we will later inspect proper names, local place names, administrative vocabulary, numbers, overlap and hallucinations. A green Sondrio control cannot substitute for that quality review.

## Metrics-only retention

The real benchmark temporarily creates a bounded audio clip and aligned transcript only to calculate technical metrics, then deletes both before artifact upload.

The only retained CI artifact is aggregate/non-content JSON containing:

- exact clip SHA-256;
- source role/provider/id;
- detected language;
- segment/word counts;
- word-alignment coverage;
- mean aligned-word confidence when available;
- elapsed time and real-time factor;
- words/minute;
- timing violation count;
- fixed boolean hits for reviewed public terms (`consiglio`, `comunale`, `lamezia`, `sondrio`);
- privacy flags confirming zero transcript/media retention and zero speaker identity.

It does **not** retain segment text, word text, audio/video, screenshots, diarization labels or personal speaker identity.

A metrics-only pass demonstrates technical execution/alignment, not verbatim accuracy.

## Local CPU setup

Use a dedicated Python environment:

```bash
python3 -m venv .local/whisperx-venv
source .local/whisperx-venv/bin/activate
python -m pip install --upgrade pip uv
python -m uv pip install --python "$(command -v python)" --torch-backend=cpu \
  -r tools/whisperx/requirements.txt
```

The isolated benchmark may download Whisper/faster-whisper and language-specific alignment model artifacts into upstream caches. A future production worker must define and preflight an explicit offline model cache before activation.

## Run a local extraction

Only an already-acquired local media path is accepted:

```bash
python tools/whisperx/extract_media.py /path/to/reviewed-session.mp4 \
  --model small \
  --output-dir tmp/whisperx
```

Default PoC profile:

- device CPU;
- compute type int8;
- model `small`;
- batch size 4;
- max source size 1 GiB;
- max decoded duration 8 hours;
- diarization disabled.

Model selection is part of the benchmark. If `small` is insufficient on local names/administrative vocabulary, compare a larger model on the **same source SHA** rather than silently changing the default.

## Canonical vs derived

The reviewed recording is the evidence. WhisperX JSON is always:

```text
representationKind = derived-noncanonical
```

A transcript may be wrong even when it looks fluent. Names, places, numbers, protocol references and administrative terminology require particular caution.

## Speaker diarization is not speaker identity

A future optional diarization track may produce anonymous labels such as `SPEAKER_00` and `SPEAKER_01`. Those are acoustic clusters, not named councillors, officers or citizens.

Do not use automated voice recognition to silently convert diarization labels into identities. Any future speaker-name association must be a separate human/provenance workflow.

## Privacy / minimisation

Public council recordings can still contain interventions or personal data concerning third parties. A machine transcript makes content substantially easier to search and redistribute, so persistence/publication has a different privacy impact from merely linking a recording.

The benchmark therefore retains no real transcript artifact. Persistence/publication requires a later policy for source review, correction/versioning, minimisation/redaction and retention.

## Lightweight tests

```bash
python tools/whisperx/test_extract_media.py
python tools/whisperx/test_benchmark_metrics.py
python -m py_compile tools/whisperx/extract_media.py tools/whisperx/benchmark_metrics.py
```

They check bounded local-file input, content-keyed naming, atomic writes, path privacy, metrics minimisation and the absence of invented speaker identity.

## Promotion sequence

1. Pass the official technical control with Italian, non-empty ASR, coherent word alignment, measured CPU RTF and zero content leakage.
2. Perform a **human spot-check on Lamezia-specific audio** using an institutionally resolved recording or separately reviewed local source.
3. If quality is borderline, compare another model profile on the same audio SHA.
4. Only then design a worker-only processor contract, offline model cache and feature flag.
5. Evaluate diarization independently; speaker identity remains outside automatic processing.
