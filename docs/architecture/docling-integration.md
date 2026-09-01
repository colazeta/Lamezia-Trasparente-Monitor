# Docling integration path

## Decision

Docling is evaluated first as a **separate derived-document processor**, not as a replacement for the existing Node/TypeScript API extraction path.

The public API process must remain independent from the Python/ML dependency stack. The official source file remains canonical evidence. Any Docling representation is a derived artefact whose source hash, extractor version and extraction time are retained.

The initial implementation lives in `tools/docling/` and has no production side effects.

## Why this boundary

The current application already has a source-acquisition/archive layer and a public API. Docling solves a different problem: recovering structure from an already acquired document. Keeping those responsibilities separate avoids:

- duplicating civic-source fetching logic;
- loading a heavy Python dependency into the autoscaled Node API process;
- making public availability depend on ML/document-processing latency;
- silently replacing the official document with a derived representation;
- coupling future model upgrades to the core application release cycle.

The same processor boundary can later host other specialised, versioned processors where appropriate, such as speech transcription, without forcing them into the API server.

## Phase 0 — isolated PoC

Status: implemented on the Docling PoC branch.

Inputs:

- one already acquired local document;
- explicit maximum file size.

Outputs under ignored `tmp/docling/` storage:

- structured Markdown;
- lossless Docling JSON;
- provenance/benchmark manifest.

No database writes, HTTP fetches, public routes, scheduled jobs or GitHub Actions are added.

## Phase 1 — fixed benchmark corpus

Build a reproducible corpus using real document classes already encountered by Lamezia Trasparente. Keep source documents out of Git unless current publication/minimisation policy explicitly allows them.

Minimum composition:

| Class | Minimum | Purpose |
| --- | ---: | --- |
| Born-digital delibere/determine | 3 | Non-regression on ordinary PDFs |
| Scanned/image-heavy acts | 3 | OCR and reading-order gain |
| Table-heavy financial documents | 2 | Table reconstruction |
| PNRR/procurement attachments | 2 | Mixed administrative layout |
| Non-PDF office documents | 2 | Broader format value |

Each corpus item should have a stable internal identifier, source URL/reference, retrieval date, SHA-256 and a short note describing why it is in the corpus. The public source URL is metadata; the Docling PoC itself still receives only the local archived file.

## Phase 2 — baseline comparison

Run the current extraction path and Docling against the same immutable source hash.

Do not rank extractors using character count alone. Record at least:

- extraction success/failure;
- elapsed time;
- text completeness from a fixed manual spot-check protocol;
- reading order;
- headings/lists;
- table integrity, including merged cells where relevant;
- page/layout traceability;
- OCR usefulness on scans;
- deterministic output across a repeated run;
- peak memory/CPU envelope when it becomes operationally measurable.

Classify every result as `better`, `equivalent`, `worse` or `not-assessable`, with a short reason.

## Phase 3 — processor contract

Only after the benchmark succeeds, introduce a generic internal contract similar to:

```ts
type DerivedDocumentExtraction = {
  sourceSha256: string;
  sourceContentType: string;
  processor: "docling";
  processorVersion: string;
  status: "ok" | "failed" | "skipped";
  extractedAt: string;
  durationMs?: number;
  markdownObjectPath?: string;
  structuredObjectPath?: string;
  metrics?: {
    markdownCharacters?: number;
    pages?: number;
    tables?: number;
  };
  failureCode?: string;
};
```

This is a conceptual contract only in the PoC. Do not add a database migration until the benchmark demonstrates that the derived representation is worth retaining.

## Phase 4 — selective enrichment

If promoted, Docling should be called by an ingestion/enrichment worker after the source file has been acquired and hashed.

The first production policy should be selective rather than universal. Candidate triggers include:

- the current extractor fails;
- extracted text is implausibly sparse relative to document/page size;
- the document is detected as scanned/image-heavy;
- a document class is known to depend on table/layout recovery.

A feature flag must permit Docling processing to be disabled independently of source ingestion and public serving.

The derived output must never block publication of the official source link or archived source copy.

## Phase 5 — publication use

A Docling-derived representation may be exposed publicly only after the product has explicit rules for:

- provenance and extractor/version display;
- confidence/quality status;
- minimisation of personal data inherited from source documents;
- correction/reprocessing after an extractor upgrade;
- fallback to the official document;
- clear wording that the extracted representation is not the official act.

For tables or other structure where Markdown is lossy, retain and prefer the structured JSON representation; Docling's own documentation notes that structured exports are preferable when exact table structure matters.

## Promotion gates

Move from PoC to worker integration only when all of the following hold:

1. ordinary born-digital PDFs show no material regression;
2. at least one important difficult-document class shows a material gain;
3. output provenance is deterministic and source-hash keyed;
4. failures are fail-closed and do not affect source ingestion;
5. operational resource use is acceptable for the chosen worker environment;
6. no paid service or paid runner is required;
7. privacy/minimisation handling is defined before any extracted content becomes public.

Until those gates are met, Docling remains an internal evaluation tool.
