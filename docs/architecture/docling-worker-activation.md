# Docling worker activation gate

Docling is integrated as a worker-only, memory-only derived extraction path. It must remain disabled until the dedicated ingestion-worker environment passes the offline preflight.

## Invariants

- `pdf-parse` remains the default fast path.
- The HTTP API process must not configure the Docling executor.
- Only the one-shot ingestion worker may configure the executor capability.
- `DOCLING_ENRICHMENT_ENABLED` defaults to `false`.
- Only `embedded-pdf-container` is eligible for the current runtime path.
- At most one real Docling evaluation may run per ingestion cycle.
- Derived Docling artifacts are not persisted or published by the current runtime path.
- The archived official source remains canonical evidence.

## Provisioning

Provision Python/Docling outside application startup and outside the ingestion cycle. For a generic Linux worker image or build environment:

```bash
bash tools/docling/provision_cpu_worker.sh
pnpm --filter @workspace/ingestion-worker run build
pnpm --filter @workspace/ingestion-worker run docling:preflight
```

The provisioning helper uses `uv` with the CPU PyTorch backend and fails if CUDA/NVIDIA packages are detected. It does not run automatically from `start`, `build`, migrations, API startup or the ingestion cycle.

## Activation sequence

1. Build the worker bundle.
2. Provision the dedicated worker environment with CPU-only dependencies.
3. Run `docling:preflight`; it must report Docling `2.124.0` and must not install or download anything.
4. Keep `DOCLING_ENRICHMENT_ENABLED=false` while verifying ordinary ingestion behaviour.
5. Only in the dedicated one-shot worker environment, set `DOCLING_ENRICHMENT_ENABLED=true` for a controlled run.
6. Confirm runtime telemetry shows at most one adapter evaluation and that baseline Markdown publication remains unaffected by Docling skip/reject/error outcomes.
7. Disable the flag immediately if the preflight or runtime gate does not behave as expected.

## Required environment

- `DOCLING_PYTHON_BIN`: optional interpreter override; defaults to `python3`.
- `DOCLING_ENRICHMENT_ENABLED`: explicit activation flag; use `true` only after preflight succeeds in the dedicated worker environment.

Do not set the enrichment flag in the HTTP/API deployment.

## Rollback

Set `DOCLING_ENRICHMENT_ENABLED=false`. No canonical document, database schema or published derived artifact needs to be reverted because the current Docling runtime path is memory-only.
