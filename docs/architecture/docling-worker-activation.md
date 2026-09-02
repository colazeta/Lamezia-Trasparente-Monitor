# Docling worker activation gate

Docling is integrated as a worker-only, memory-only derived extraction path. It must remain disabled until the dedicated ingestion-worker environment passes the offline preflight and the packaged smoke test.

## Invariants

- `pdf-parse` remains the default fast path.
- The HTTP API process must not configure the Docling executor.
- Only the one-shot ingestion worker may configure the executor capability.
- `DOCLING_ENRICHMENT_ENABLED` defaults to `false`.
- Only `embedded-pdf-container` is eligible for the current runtime path.
- An eligible wrapper is processed only when it contains exactly one unambiguous embedded PDF; multiple-PDF containers fail closed and remain observation-only.
- The parent wrapper SHA is attested upstream; the processor computes the child SHA and the trusted adapter independently re-hashes the exact child bytes before accepting output.
- At most one real Docling evaluation may run per ingestion cycle.
- Derived Docling artifacts are not persisted or published by the current runtime path.
- The archived official source remains canonical evidence.

## Provisioning

Provision Python/Docling and model weights outside application startup and outside the ingestion cycle. Choose an explicit persistent model directory for the dedicated worker environment:

```bash
export DOCLING_ARTIFACTS_PATH=/opt/lamezia/docling-models
bash tools/docling/provision_cpu_worker.sh
pnpm --filter @workspace/ingestion-worker run build
pnpm --filter @workspace/ingestion-worker run docling:preflight
```

The provisioning helper uses `uv` with the CPU PyTorch backend, rejects CUDA/NVIDIA packages, and runs `docling-tools models download` only during provisioning. The worker processor requires the prefetched `DOCLING_ARTIFACTS_PATH` and configures Docling with local artifacts and remote services disabled. No model download is permitted on first document use.

The provisioning helper is not called by `start`, `build`, migrations, API startup or the ingestion cycle.

## Packaged smoke test

Before first activation, run the packaged smoke test against the reviewed Albo wrapper used by the benchmark. The smoke path must validate the full chain:

`wrapper SHA → embedded PDF extraction → child SHA → Docling → structured JSON → trusted adapter`

For the reviewed fixture `2026/2648`, the expected immutable hashes are:

- parent wrapper: `842702b2044b4b6f9a7b21a65eac2ab59866ee3f321872e6b28fd481598be304`;
- embedded PDF: `3069388db15c43fdbf3cc980195f9c88ded602a6e9f8f89f358a006ce789096c`.

The GitHub Docling benchmark workflow runs this packaged smoke path when the processor/runtime packaging changes.

## Activation sequence

1. Provision the dedicated worker environment with CPU-only dependencies and prefetched model artifacts.
2. Build the worker bundle.
3. Run `docling:preflight`; it must report Docling `2.124.0`, CPU-only runtime and `modelArtifacts=ready`, without downloading anything.
4. Run the packaged smoke test and verify the reviewed parent and child hashes.
5. Keep `DOCLING_ENRICHMENT_ENABLED=false` while verifying ordinary ingestion behaviour.
6. Only in the dedicated one-shot worker environment, set `DOCLING_ENRICHMENT_ENABLED=true` for a controlled run.
7. Confirm runtime telemetry shows at most one adapter evaluation and that baseline Markdown publication remains unaffected by Docling skip/failure/error outcomes.
8. Disable the flag immediately if preflight, provenance validation or runtime behaviour is not as expected.

## Required environment

- `DOCLING_PYTHON_BIN`: optional interpreter override; defaults to `python3`.
- `DOCLING_ARTIFACTS_PATH`: required local directory populated during provisioning; runtime is fail-closed when it is missing or empty.
- `DOCLING_ENRICHMENT_ENABLED`: explicit activation flag; use `true` only after preflight and smoke tests succeed in the dedicated worker environment.

Do not set the enrichment flag in the HTTP/API deployment.

## Rollback

Set `DOCLING_ENRICHMENT_ENABLED=false`. No canonical document, database schema or published derived artifact needs to be reverted because the current Docling runtime path is memory-only.
