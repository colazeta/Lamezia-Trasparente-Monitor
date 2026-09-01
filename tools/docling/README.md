# Docling document-extraction PoC

This directory contains a deliberately isolated proof of concept for evaluating Docling against the document-extraction needs of Lamezia Trasparente.

## Scope

The PoC does **not** replace the current PDF handling, modify the API server, write to PostgreSQL, publish extracted text, or add a scheduled workflow. It accepts an already acquired local document and writes benchmark artefacts under `tmp/docling/`, which is ignored by Git.

The extractor is pinned to Docling `2.124.0`. Any upgrade must be evaluated again on the same benchmark corpus before it is promoted.

## Local setup

```bash
python3 -m venv .local/docling-venv
source .local/docling-venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r tools/docling/requirements.txt
```

Docling may populate its local model cache on first use. The PoC does not require a managed or paid service and no Docling job is added to GitHub Actions.

## Run an extraction

```bash
python tools/docling/extract_document.py /path/to/document.pdf
```

Optional output directory and size limit:

```bash
python tools/docling/extract_document.py /path/to/document.pdf \
  --output-dir tmp/docling \
  --max-bytes 52428800
```

The tool accepts only local files. Fetching the official civic source remains the responsibility of the existing ingestion/archive layer.

For a source named `delibera.pdf`, the output prefix includes the first 12 hexadecimal characters of the source SHA-256 so that two different files with the same name cannot silently overwrite each other:

```text
tmp/docling/
  delibera-<sha12>.docling.md
  delibera-<sha12>.docling.json
  delibera-<sha12>.docling.manifest.json
```

The manifest records the source file name, full SHA-256, byte size, Docling version, extraction timestamp, elapsed time, Markdown character count, table count and page count when exposed by the Docling document representation. It intentionally does not record the absolute local input path.

## Lightweight tests

The helper tests do not require Docling to be installed:

```bash
python tools/docling/test_extract_document.py
python -m py_compile tools/docling/extract_document.py
```

## Benchmark corpus

Before any runtime integration, evaluate the same fixed corpus with the current extraction path and with this PoC. The first corpus should contain at least:

- 3 born-digital delibere/determine with ordinary paragraphs;
- 3 scanned or image-heavy administrative PDFs;
- 2 table-heavy documents, preferably financial/budget material;
- 2 PNRR or procurement attachments with mixed layout;
- 2 non-PDF office documents if they occur in the real archive.

Do not commit the source documents or extracted output unless the existing publication/minimisation rules explicitly allow it. Record source identifiers and hashes separately so the benchmark can be reproduced.

## Evaluation dimensions

For every document compare:

1. text completeness and reading order;
2. heading/list structure;
3. table structure and merged cells;
4. page/layout information useful for traceability;
5. behaviour on scans and OCR;
6. extraction time and resource use;
7. deterministic/stable output on a repeated run;
8. failure mode and diagnostic quality.

A larger Markdown character count is not, by itself, evidence of a better extraction.

## Promotion rule

Docling should move beyond PoC only if the benchmark shows a material improvement on complex documents without a meaningful regression on ordinary born-digital PDFs and with an acceptable resource envelope.

If promoted, the intended architecture is a separate document processor called by an ingestion/enrichment worker, not a Python dependency loaded into the public Node/TypeScript API process. The official source document remains canonical evidence; Docling output is a derived, versioned representation with explicit provenance.
