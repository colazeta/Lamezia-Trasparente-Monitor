# WhisperX integration boundary for municipal sessions

## Status

Phase 1 proof of concept only. No API route, DB table, worker call-site, scheduled transcription or public transcript is introduced by the initial WhisperX PR.

Upstream baseline reviewed on 2026-09-02:

- repository: `m-bain/whisperX`;
- pinned version: `3.8.6`;
- license: BSD-2-Clause;
- Python: `>=3.10,<3.14`;
- CPU CLI profile supported upstream: `--device cpu --compute_type int8`;
- ASR backend: faster-whisper;
- word-level alignment: supported;
- optional diarization: pyannote/Hugging Face gated.

## Evidence model

The source hierarchy is:

```text
institutional/public recording
        ↓ canonical evidence + immutable hash
trusted LT media acquisition/archive
        ↓
WhisperX processor
        ↓
derived transcript / word timestamps
        ↓
(optional later) anonymous speaker clusters
```

The recording remains canonical even when transcript quality is excellent.

WhisperX output must always be represented as `derived-noncanonical` and tied to the exact source hash and processor/model version.

## Media acquisition boundary

WhisperX must never receive a civic URL and fetch it itself.

A future production path must follow:

1. LT resolves an approved institutional media locator;
2. LT acquires/preserves the media through a trusted source-specific layer;
3. SHA-256 and resource bounds are established;
4. the processor receives only local bytes/file access plus immutable metadata.

This prevents the transcription processor from becoming a second crawler/source resolver and prevents URL-controlled SSRF behavior.

The first metadata-only benchmark candidate is a public mirror of the 19 May 2026 council session. It may be used only for quality experimentation after an explicit acquisition/review decision; it is not canonical LT provenance by default.

## Processing layers

### Layer A — ASR

Speech-to-text. Primary quality risks: omissions, hallucinations, names, numbers and local/administrative terminology.

### Layer B — alignment

Word-level timestamps. Primary downstream use: seek-to-word/segment, searchable recording, agenda navigation and evidence-linked quotations.

### Layer C — diarization — separate capability

Anonymous acoustic speaker clustering. This layer is intentionally outside the first promotion gate because:

- it requires an additional Hugging Face/model agreement and token;
- upstream documents diarization limitations;
- overlapping speech is a known difficulty;
- the civic value of timestamped text does not depend on personal speaker attribution.

### Layer D — speaker identity — not a WhisperX capability

Any relation between `SPEAKER_00` and a real named person is a separate curated claim requiring human/provenance evidence.

No automated voice-recognition identity inference is authorised by this architecture.

## Future processor contract

Only after a successful benchmark, a runtime contract should include at least:

### Request

- source SHA-256;
- media content type;
- source byte size;
- known/probed duration;
- processor version;
- ASR model;
- device/compute type;
- batch size;
- max bytes / max duration / timeout;
- requested outputs (`segments-json`, optionally `word-json`);
- diarization explicitly false unless a later contract version promotes it.

No URL/path owned by the processor should be part of source identity.

### Result

- source SHA-256;
- `representationKind=derived-noncanonical`;
- WhisperX/model versions;
- detected language;
- duration / elapsed / real-time factor;
- segment and word counts;
- artifact hashes and sizes;
- bounded failure code;
- explicit diarization state;
- if diarization is ever enabled: anonymous speaker labels + `speakerIdentityStatus=unverified`.

## Resource boundary

Phase 1 CPU baseline:

- source max 1 GiB;
- duration max 8 hours;
- CPU;
- int8;
- small model smoke baseline;
- batch size 4.

These defaults are safety/benchmark defaults, not final production tuning.

A council session may be hours long, so the benchmark must report real-time factor. If CPU processing is too slow, the decision is not automatically “use GPU”; possible responses include a larger worker window, chunking, a different model profile or a dedicated GPU worker after explicit cost/infrastructure review.

## Failure isolation

Future transcription must be optional enrichment:

- media acquisition/serving succeeds even if WhisperX fails;
- transcript timeout/failure does not invalidate the recording;
- no ASR error changes the source recording hash or metadata;
- retry/idempotency should be keyed by source hash + processor/model/settings;
- a changed model/version produces a new derived representation, not an in-place silent overwrite.

## Quality and hallucination safeguards

Machine text must never be treated as a verbatim official record unless a separate human validation process explicitly establishes that status.

Particular review attention:

- proper names;
- neighbourhood/place names;
- monetary amounts;
- votes/counts;
- protocol/CIG/CUP-style identifiers;
- legal citations;
- silence/noise hallucinations;
- interruptions/overlap.

Public UI, if later introduced, should keep seek-to-recording available and visibly label transcript status/version.

## Privacy / minimisation boundary

Transcription increases discoverability of personal information. Before persistence or public indexing, define:

- which session classes are eligible;
- treatment of citizen/third-party interventions;
- redaction/minimisation rules;
- correction/versioning workflow;
- retention of raw intermediate audio/chunks;
- whether search indexes retain deleted/replaced transcript text;
- audit trail between transcript version and source hash.

Phase 1 therefore keeps real transcript artifacts local/temporary.

## Promotion phases

### Phase 1 — local ASR/alignment PoC — current

- pin upstream;
- local-file-only extractor;
- source/resource bounds;
- content-keyed artifacts;
- manifest + temporary aligned JSON;
- no diarization;
- benchmark rubric and metadata-only corpus.

### Phase 2 — real benchmark

Acquire one reviewed recording and measure ASR/alignment quality + resource envelope. Compare model profiles on the same source hash where useful.

### Phase 3 — processor contract + trusted worker adapter

Only if Phase 2 demonstrates value. Separate Python/ML execution from the public API process; feature flag disabled by default; derived artifacts still non-public.

### Phase 4 — optional diarization benchmark

Introduce Hugging Face/pyannote only if anonymous turn segmentation adds value. Never conflate this with speaker identity.

### Phase 5 — persistence/search/UI

Requires explicit privacy/source-review and correction/versioning rules. Search results and quotations must remain linked to canonical media timestamps.

## Definition of Phase 1 done

- upstream version/license documented;
- local-file-only extractor exists;
- no diarization/HF-token dependency in the first execution path;
- source hash/resource bounds/atomic artifacts tested;
- absolute paths excluded from manifest;
- benchmark source role distinguishes public mirror from canonical institutional provenance;
- no runtime/API/DB/frontend integration;
- general CI/hook gates green.
