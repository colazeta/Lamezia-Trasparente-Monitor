# WhisperX benchmark rubric — municipal sessions

The benchmark evaluates whether a derived transcript materially improves navigation and search over the canonical recording. It does **not** evaluate whether the transcript can replace the recording.

Score every dimension per reviewed recording as:

- `better/usable` — sufficient for the stated downstream use;
- `partial` — useful with visible defects or review burden;
- `worse/unusable` — defects materially undermine the use;
- `not-assessable` — the benchmark sample does not exercise the dimension.

Do not collapse all dimensions into one opaque average.

## ASR + alignment dimensions

### Speech completeness

Check omitted phrases, invented phrases, repeated phrases and truncation around pauses or background noise.

### Hallucination / silence safety

Inspect long silences, applause, microphone handling, room noise and music. A transcript must not manufacture substantive civic statements from non-speech.

### Italian readability

Assess punctuation, sentence segmentation, capitalization and whether the text can be read without repeatedly returning to the recording.

### Institutional vocabulary

Review names of municipal bodies, commissions, offices, neighbourhoods, projects and legal/administrative terminology.

### Proper names

Measure error rate on councillor/official/place names separately. A plausible-looking wrong name is more harmful than an obvious unknown token.

### Numbers and identifiers

Review dates, vote counts, monetary amounts, protocol numbers, CIG/CUP or other identifiers when they are actually spoken. Never infer an identifier that is not clearly present in the audio.

### Segment timing

Segments should point users to the correct portion of the recording without excessive lead/lag or merged unrelated interventions.

### Word timing

Sample word-level start/end timestamps across the recording, including fast speech and interruptions.

### Overlap / interruption

Record how the system behaves when several people speak together. WhisperX upstream explicitly notes overlapping speech as a limitation; this dimension should not be hidden by aggregate ASR quality.

### Determinism

Repeat the same source SHA/model/settings and compare language, segment count, text and timestamps. Differences should be documented before any idempotent processing contract is introduced.

## Resource dimensions

Record:

- source bytes;
- media duration;
- model;
- device / compute type;
- batch size;
- elapsed seconds;
- real-time factor (`elapsed / duration`);
- peak RAM where available;
- transcript JSON size.

CPU/int8 is the first baseline. A GPU profile is a separate infrastructure decision, not a prerequisite for the PoC.

## Diarization track — separate gate

Diarization is not required to promote ASR+alignment.

If evaluated later, score only technical speaker-turn behaviour:

- estimated speaker count stability;
- turn boundary quality;
- consistency of anonymous labels (`SPEAKER_00`, etc.);
- overlap behaviour;
- sensitivity to microphone changes / room acoustics.

**Never score or claim personal identity accuracy from WhisperX/pyannote clusters.** A speaker cluster is not a verified person. Any speaker→person relation must have its own human/provenance workflow and must not use automated voice recognition as an implicit identity oracle.

## Privacy / publication gate

A good ASR score is not permission to publish a transcript. Before persistence/publication, separately assess:

- whether the source recording is approved for LT canonical serving/reference;
- whether interventions by citizens/third parties require minimisation or redaction;
- correction/versioning workflow;
- visible labelling of machine-derived/unverified text;
- deletion/retention rules for intermediate audio and model outputs.

## Promotion rule

Promote WhisperX beyond the PoC only when a reviewed sample shows that timestamped text adds meaningful search/navigation value, errors are observable/manageable, and the resource envelope is compatible with a separate worker. The canonical media source and its source hash must remain independently accessible even if transcription fails.
