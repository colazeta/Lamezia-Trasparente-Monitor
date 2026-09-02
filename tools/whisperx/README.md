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

## Phase 2: technical control vs Lamezia quality evidence

The corpus deliberately separates technical execution evidence from Lamezia-specific quality evidence.

The CI technical control uses the official Comune di Sondrio audio for the 30 April 2026 council session. It proved that WhisperX 3.8.6 can run CPU/int8 on real Italian council speech with non-empty ASR, 100% word-timestamp coverage in the reviewed ten-minute clip, zero timing violations and a measured real-time factor around 0.31. The workflow retains only aggregate metrics and deletes the audio/transcript before artifact upload.

This does **not** make Sondrio a production source and does not establish verbatim accuracy for Lamezia.

The 19 May 2026 Lamezia Terme session remains the local quality candidate:

```text
sourceRole = benchmark-only-public-mirror
canonicalStatus = not-established
```

A public unauthenticated CI acquisition attempt was blocked by YouTube's bot challenge. Do not add browser cookies, user credentials or repository secrets merely to force that mirror through CI. Resolve an institutional recording locator, or use a separately reviewed local recording.

## Phase 3: Lamezia human quality gate

`lamezia-quality-plan.public.json` fixes the review criteria **before** the Lamezia transcript is examined. It contains public expected terms and mandatory review dimensions for proper names/toponyms, acronyms and administrative vocabulary, numbers/amounts/dates/votes, timestamp usability, overlapping speech and material hallucination/omission.

Term hits are diagnostics only. They are never proof of accuracy and can never produce an automatic pass.

The helper fails closed unless the transcript has:

- a valid source SHA-256;
- Italian language (`it`);
- WhisperX `3.8.6` processor metadata;
- non-empty segments and positive duration;
- diarization disabled.

After a reviewed Lamezia media file is locally available:

```bash
python tools/whisperx/extract_media.py /path/to/reviewed-lamezia-session.mp4 \
  --model small \
  --output-dir tmp/whisperx

python tools/whisperx/prepare_quality_review.py \
  --transcript tmp/whisperx/<source>.whisperx.json \
  --output tmp/whisperx/lamezia-quality-review.json \
  --include-snippets
```

The helper creates deterministic coverage windows plus first-hit windows for reviewed term categories. Any packet containing transcript snippets is **refused outside a `tmp/` path** and must never be committed or uploaded as a CI artifact.

Every packet starts with:

```text
humanDecision.status = pending-human-review
automaticPassPermitted = false
speakerIdentityStatus = not-produced
```

A human reviewer must listen to the source audio at each window and complete the decision fields. Critical name/numeric errors or material hallucinations block promotion and trigger a model comparison on the **same source SHA**. The helper itself never declares the transcript acceptable.

## Local CPU setup

Use a dedicated Python environment:

```bash
python3 -m venv .local/whisperx-venv
source .local/whisperx-venv/bin/activate
python -m pip install --upgrade pip uv
python -m uv pip install --python "$(command -v python)" --torch-backend=cpu \
  -r tools/whisperx/requirements.txt
```

A future production worker must define and preflight an explicit offline model cache before activation.

## Canonical vs derived

The reviewed recording is the evidence. WhisperX JSON is always `derived-noncanonical`. A transcript may be wrong even when it looks fluent, especially on names, places, numbers, protocol references and administrative terminology.

## Speaker diarization is not speaker identity

A future optional diarization track may produce anonymous labels such as `SPEAKER_00`. Those are acoustic clusters, not named councillors, officers or citizens. Do not use automated voice recognition to silently map them to identities. Any speaker-name association requires a separate human/provenance workflow.

## Privacy / minimisation

Public council recordings can still contain interventions or personal data concerning third parties. A machine transcript makes content substantially easier to search and redistribute. Persistence/publication therefore requires a later policy for source review, correction/versioning, minimisation/redaction and retention.

## Lightweight tests

```bash
python tools/whisperx/test_extract_media.py
python tools/whisperx/test_benchmark_metrics.py
python tools/whisperx/test_prepare_quality_review.py
python -m py_compile tools/whisperx/extract_media.py tools/whisperx/benchmark_metrics.py tools/whisperx/prepare_quality_review.py
```

## Promotion sequence

1. Technical CPU/int8 control — complete.
2. Human spot-check on Lamezia-specific audio — mandatory and still pending.
3. If quality is borderline, compare another model profile on the same audio SHA.
4. Only after quality acceptance, design a worker-only processor contract, offline model cache and feature flag.
5. Evaluate diarization independently; speaker identity remains outside automatic processing.
