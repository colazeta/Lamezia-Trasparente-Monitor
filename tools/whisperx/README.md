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

## First benchmark track

Phase 1 evaluates only:

```text
local media file → WhisperX ASR → word alignment → derived JSON
```

Diarization is **disabled**. No Hugging Face token is required for the first gate.

This is deliberate: search, navigation and timestamped quotations can have value even when speaker identity is unavailable.

## Local CPU setup

Use a dedicated Python environment. CPU/int8 is the first zero-cost baseline:

```bash
python3 -m venv .local/whisperx-venv
source .local/whisperx-venv/bin/activate
python -m pip install --upgrade pip uv
python -m uv pip install --python "$(command -v python)" --torch-backend=cpu \
  -r tools/whisperx/requirements.txt
```

The first run may download Whisper/faster-whisper and language-specific alignment model artifacts into upstream caches. That is acceptable for the isolated PoC. A future production worker must define and preflight an explicit offline model cache before activation.

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

WhisperX upstream itself documents limitations in diarization and overlapping speech. Diarization therefore remains a separate promotion gate and is not required for Phase 1.

## First corpus candidate

`benchmark-corpus.public.json` contains metadata for a public mirror of the 19 May 2026 Lamezia Terme council session. Its role is explicitly `benchmark-only-public-mirror`; canonical institutional provenance has not yet been established.

Do not automatically download that media in CI or treat the mirror as the production recording. Resolve an institutional recording locator before any LT source integration.

## Privacy / minimisation

Public council recordings can still contain interventions or personal data concerning third parties. A machine transcript makes content dramatically easier to search and redistribute, so publication has a different privacy impact from merely linking a recording.

Phase 1 therefore keeps real transcripts outside Git. Persistence/publication requires a later policy for source review, correction/versioning, minimisation/redaction and retention.

## Lightweight tests

The helper tests require no WhisperX installation:

```bash
python tools/whisperx/test_extract_media.py
python -m py_compile tools/whisperx/extract_media.py
```

They check content-keyed naming, bounded local-file input, atomic writes, path privacy and the absence of invented speaker identity in the normalised ASR representation.

## Next gate

After this PoC wrapper passes CI/review:

1. resolve one institutional recording locator or explicitly approve a benchmark-only local acquisition;
2. run ASR+alignment against an immutable source hash;
3. review quality using `benchmark-rubric.md`;
4. compare at least two model/resource profiles if quality is borderline;
5. only after a demonstrated gain, design a processor contract and separate worker boundary.

Diarization is evaluated independently after ASR+alignment quality is established.
