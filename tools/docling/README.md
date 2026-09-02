# Docling selective document processor

This directory contains the benchmark, processor and verification tooling used by Lamezia Trasparente's **selective** Docling enrichment path.

Docling does not replace the existing `pdf-parse` fast path. The official archived document remains canonical evidence; embedded files and Docling outputs are always `derived-noncanonical` representations with explicit provenance.

## Current production boundary

The controlled worker path is:

```text
canonical archived PDF
  → pdf-parse baseline + observation
  → embedded-pdf-container candidate
  → trusted adapter
  → worker-only local executor
  → extract exactly one embedded child PDF
  → Docling on the child PDF with prefetched local models
  → child SHA + structured JSON independently validated by the adapter
```

Only `embedded-pdf-container` is currently promoted for real execution. A wrapper with zero or multiple embedded PDFs fails closed and remains observation-only. At most one Docling evaluation may run per ingestion cycle.

`DOCLING_ENRICHMENT_ENABLED` remains `false` by default and must never be enabled in the HTTP/API process. Current validated output is memory-only: it is not persisted or published.

## Pinned dependencies

- Docling `2.124.0`
- pypdf `6.16.2`

Any upgrade requires re-running the reviewed benchmark and packaged smoke test before promotion.

## Offline worker provisioning

Runtime must not download model weights. Provision the dedicated ingestion-worker environment explicitly:

```bash
export DOCLING_ARTIFACTS_PATH=/opt/lamezia/docling-models
bash tools/docling/provision_cpu_worker.sh
pnpm --filter @workspace/ingestion-worker run build
pnpm --filter @workspace/ingestion-worker run docling:preflight
```

The provisioning helper installs the pinned dependencies with the CPU PyTorch backend, rejects CUDA/NVIDIA packages and prefetches Docling model artifacts with `docling-tools models download`. The preflight is offline and requires the model directory to be present and non-empty.

See `docs/architecture/docling-worker-activation.md` for the activation and rollback procedure.

## Packaged smoke test

The reviewed public fixture is Albo publication `2026/2648`:

- parent wrapper SHA-256: `842702b2044b4b6f9a7b21a65eac2ab59866ee3f321872e6b28fd481598be304`
- embedded child SHA-256: `3069388db15c43fdbf3cc980195f9c88ded602a6e9f8f89f358a006ce789096c`

After provisioning/build:

```bash
pnpm --filter @workspace/ingestion-worker run docling:smoke -- \
  --source data/public/albo/documents/2026/842702b2044b4b6f9a7b21a65eac2ab59866ee3f321872e6b28fd481598be304.pdf \
  --expected-parent 842702b2044b4b6f9a7b21a65eac2ab59866ee3f321872e6b28fd481598be304 \
  --expected-child 3069388db15c43fdbf3cc980195f9c88ded602a6e9f8f89f358a006ce789096c
```

The smoke command traverses the packaged worker trust path and emits only technical metadata. It never prints extracted document content.

## Evidence behind selective promotion

On the outer `2026/2648` wrapper, `pdf-parse` and Docling recover broadly equivalent text, so Docling is not justified as a universal parser.

The wrapper contains `convocazione 2.pdf`. On that child:

- `pdf-parse` 2.4.5 extracted only 16 non-substantive characters;
- Docling 2.124.0 extracted 1,452 Markdown characters and recovered the commission heading, recipients, subject, dates and agenda items.

This is the reviewed material-gain case supporting the current `embedded-pdf-container` promotion. Character count alone is never treated as a quality verdict.

## Benchmark and diagnostic tooling

Direct benchmark tools remain available for evaluation and future document classes:

```bash
python tools/docling/extract_document.py /path/to/document.pdf
python tools/docling/extract_pdf_attachments.py /path/to/container.pdf \
  --output-dir tmp/docling/attachments
python tools/docling/run_benchmark.py /path/to/document.pdf
```

The GitHub `Docling benchmark` workflow runs the reviewed benchmark plus the packaged worker smoke path whenever the Docling contract, processor, executor, readiness or fixture changes.

## Tests

Lightweight tests include hashing, path/privacy controls, embedded-child selection, contract v2, CPU provisioning policy and model-cache requirements. Node tests cover trusted-adapter validation, runtime gating/telemetry and executor cleanup/bounds.

The key invariants are:

- parent source hash is attested before execution;
- child PDF hash/size/magic are independently revalidated by the trusted adapter;
- no remote source fetch is available to the processor;
- model download happens only during provisioning;
- worker execution is feature-gated and bounded;
- baseline Markdown remains independent of any Docling skip/failure/error;
- no Docling output becomes canonical evidence.

Persistence, backfill, indexing and UI use of validated structured JSON are a **separate document-intelligence phase**, not part of the Docling processor integration itself.
