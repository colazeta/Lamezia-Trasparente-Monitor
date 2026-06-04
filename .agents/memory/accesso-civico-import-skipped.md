---
name: Accesso Civico import skipped-row line numbers
description: Why import skipped-row line numbers need a sourceRiga mapping, and how blank lines shift them
---
The Accesso Civico admin import has two skip surfaces:
- Preview (client): `parseAccessoCivicoImport` drops `invalidRows` (missing oggetto / bad date) and only sends valid `rows` to the server.
- Post-import summary (server): POST /accesso-civico/importa returns `scartate[].indice`, which is an index into the **already-filtered** rows array, NOT the source-file line.

**Rule:** to show a real file line in the post-import summary you must carry a per-row source line. Valid rows get `sourceRiga` (parser sets matrix index + 1); handleConfirm captures `sourceLines` and strips `sourceRiga` before POSTing (server zod strips unknowns anyway). Summary maps `scartate.indice -> sourceLines[indice]`.

**Caveat:** both `invalidRows.riga` and `sourceRiga` are the post-filter matrix index, so fully-blank source lines (dropped by parseDelimited before indexing) shift the number off the literal file line. Consistent between the two surfaces; accepted, not a bug to "fix" by re-deriving literal line numbers unless asked.

**Test env:** jsdom here lacks `File.text()` — polyfill via `Object.defineProperty(file, "text", { value: async () => csv })` when driving the upload flow in component tests.
