# Docling document-extraction PoC

This directory contains an isolated proof of concept for evaluating Docling against the document-extraction needs of Lamezia Trasparente.

## Scope

The PoC does **not** replace the current PDF handling, modify the API server, write to PostgreSQL, publish extracted text, or participate in the production ingestion path. It accepts already acquired local documents and writes derived benchmark artefacts under `tmp/docling/`, which is ignored by Git.

Docling is pinned to `2.124.0`. `pypdf` is pinned to `6.16.2` for bounded inspection and extraction of files embedded inside PDF containers. Any upgrade must be evaluated again on the same benchmark corpus before promotion.

A dedicated GitHub Actions benchmark runs only when extraction code, tests, pinned dependencies, the benchmark workflow, baseline helper or immutable sample PDF changes (or by explicit manual dispatch). It uses the repository's allowed `ubuntu-latest` runner, requires no secrets and never deploys or publishes benchmark output.

## Why container-aware processing is required

Some administrative PDFs are only protocol wrappers. The substantive act may be stored as a PDF attachment embedded inside the outer PDF and may not be directly visible to a browser or to the existing text extractor.

For that reason the PoC separates two operations:

1. inspect the already acquired PDF container and extract bounded embedded files with their own SHA-256;
2. run the baseline and Docling against the exact same extracted file hash.

The outer official PDF remains canonical evidence. Embedded files and Docling outputs are derived artefacts whose relationship to the parent source must be retained.

## Local setup

```bash
python3 -m venv .local/docling-venv
source .local/docling-venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r tools/docling/requirements.txt
```

Docling may populate its local model cache on first use. No managed or paid document-processing service is required.

## Run a direct extraction

```bash
python tools/docling/extract_document.py /path/to/document.pdf
```

Optional output directory and size limit:

```bash
python tools/docling/extract_document.py /path/to/document.pdf \
  --output-dir tmp/docling \
  --max-bytes 52428800
```

## Inspect embedded PDF attachments

```bash
python tools/docling/extract_pdf_attachments.py /path/to/container.pdf \
  --output-dir tmp/docling/attachments
```

The attachment extractor fails closed above explicit count, per-file and total-size limits. Filenames are path-flattened and outputs are keyed by content hash to avoid traversal and silent overwrite.

## Compare with the current baseline

```bash
python tools/docling/run_benchmark.py /path/to/document.pdf
```

The runner executes the current backend baseline (`pdf-parse` 2.4.5) and Docling against the same immutable SHA-256. It records timing and structural diagnostics but intentionally does not select an automatic winner.

## Output and provenance

For a source named `delibera.pdf`, Docling outputs use the source hash:

```text
tmp/docling/
  delibera-<sha12>.docling.md
  delibera-<sha12>.docling.json
  delibera-<sha12>.docling.manifest.json
```

The manifest records the source file name, SHA-256, byte size, extractor/version, extraction timestamp, elapsed time and structural metrics. It intentionally does not record the absolute local input path.

Markdown is a convenience representation, not the lossless canonical derived representation. The structured Docling JSON may contain information (for example labels or layout elements) that Markdown omits.

## First real benchmark result

The first public benchmark item is Albo publication `2026/2648`.

The outer PDF is a protocol wrapper. On that wrapper, `pdf-parse` and Docling recover broadly equivalent substantive text; Docling adds structure but is much more computationally expensive.

The wrapper contains one embedded file, `convocazione 2.pdf`. Its extracted SHA-256 exactly matches the hash declared inside the protocol wrapper. On this substantive embedded PDF:

- `pdf-parse` 2.4.5 extracted only 16 characters of non-substantive page-marker text;
- Docling 2.124.0 extracted 1,452 Markdown characters and recovered the commission heading, recipients, subject, dates and agenda items;
- minor OCR/spacing defects remain possible, so derived text is not treated as verified official text.

This is the first demonstrated material gain and establishes embedded/scanned administrative PDFs as a strong candidate class for selective Docling enrichment.

## Lightweight tests

```bash
python tools/docling/test_extract_document.py
python tools/docling/test_extract_pdf_attachments.py
python -m py_compile \
  tools/docling/extract_document.py \
  tools/docling/extract_pdf_attachments.py \
  tools/docling/run_benchmark.py
```

## Benchmark corpus

Before runtime integration, continue evaluating a fixed corpus containing at least:

- 3 born-digital delibere/determine with ordinary paragraphs;
- 3 scanned or image-heavy administrative PDFs;
- 2 table-heavy documents, preferably financial/budget material;
- 2 PNRR or procurement attachments with mixed layout;
- 2 non-PDF office documents if they occur in the real archive.

Do not commit source documents or extracted output unless the existing publication/minimisation rules explicitly allow it. Record source identifiers and hashes so benchmark results remain reproducible.

## Evaluation dimensions

For every document compare:

1. text completeness and reading order;
2. heading/list structure;
3. table structure and merged cells;
4. page/layout information useful for traceability;
5. behaviour on scans and OCR;
6. preservation of critical identifiers and dates;
7. extraction time and resource use;
8. deterministic/stable output on a repeated run;
9. failure mode and diagnostic quality.

A larger character count is not, by itself, evidence of better extraction.

## Promotion rule

Docling should move beyond PoC only after the corpus shows a material improvement on difficult document classes without meaningful regression on ordinary born-digital PDFs and with an acceptable resource envelope.

The current result is sufficient to justify continuing toward **selective** enrichment, not universal replacement of `pdf-parse`.

If promoted, the intended architecture is a separate document processor called by an ingestion/enrichment worker after source acquisition and hashing. The public Node/TypeScript API process remains independent of the Python/ML stack. The official source document remains canonical evidence; embedded files and Docling outputs remain derived, versioned representations with explicit provenance.
