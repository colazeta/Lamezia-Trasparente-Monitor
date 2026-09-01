# Docling benchmark scoring rubric

Use this rubric only after `run_benchmark.py` has processed the same immutable source with the current `pdf-parse` baseline and Docling.

The machine-generated comparison is diagnostic. It must not select a winner automatically.

## Per-document assessment

For each benchmark item, record one of `better`, `equivalent`, `worse`, or `not-assessable` for every dimension below.

| Dimension | What to inspect | Failure examples |
| --- | --- | --- |
| Text completeness | Fixed passages at beginning, middle and end; dates; amounts; identifiers; names | Missing lines, dropped pages, repeated blocks, invented OCR text |
| Reading order | Paragraph and column sequence | Sidebars inserted mid-sentence, columns interleaved |
| Headings and lists | Structural hierarchy and list boundaries | Heading flattened into body, numbered list collapsed |
| Tables | Rows, columns, headers, merged cells and totals | Shifted cells, lost headers, totals detached from labels |
| Page traceability | Ability to associate extracted structure with source page/layout | Content cannot be traced back to source page |
| OCR usefulness | For image-heavy/scanned material only | Empty extraction, severe character substitutions, hallucinated text |
| Critical identifiers | CUP, CIG, protocol/publication numbers, dates, monetary amounts where present | Identifier corrupted or split so downstream matching would fail |
| Determinism | Repeat the same extraction twice on the same SHA | Materially different structured output without source change |
| Failure behaviour | Error is explicit, bounded and non-destructive | Partial output presented as success, source overwritten |
| Resource envelope | Runtime and operational feasibility | Processing cost incompatible with worker use |

## Promotion rule

Docling can be proposed for selective worker integration only if all conditions hold:

1. No material regression on ordinary born-digital PDFs.
2. At least one difficult class shows a material structural or OCR gain.
3. No critical identifier is lost where the current baseline preserves it.
4. Source SHA equality is verified for every comparison.
5. Failures remain isolated from ingestion and publication.
6. Runtime/resource use is acceptable in the chosen worker environment.
7. The result remains a derived representation with explicit provenance, never the official act.

## Corpus-level decision

Do not average heterogeneous documents into one opaque score. Summarise by document class and retain the per-document reasons. A parser may be promoted selectively for scans or table-heavy documents while the lightweight baseline remains preferable for trivial born-digital PDFs.
