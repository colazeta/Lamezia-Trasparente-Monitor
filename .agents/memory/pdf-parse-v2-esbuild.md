---
name: pdf-parse v2 + esbuild externalization
description: How to use pdf-parse@2 in the bundled api-server, and why it needs externals
---

Text extraction from archived PDFs (api-server) uses `pdf-parse@2`:
`new PDFParse({ data: Uint8Array }).getText()` (class API, not the v1 default fn).

**Runtime requirements / gotchas:**
- pdf-parse drives `pdfjs-dist`, which needs a `DOMMatrix` polyfill — provided by
  installing `@napi-rs/canvas` (no explicit import needed; pdfjs picks it up).
- pdfjs dynamically imports its **worker** entry at runtime. esbuild bundling
  breaks that resolution.

**Why:** bundled (esm) output relocates files, so dynamic worker/native module
resolution fails unless the packages are loaded from `node_modules` at runtime.

**How to apply:** in `artifacts/api-server/build.mjs`, keep `@napi-rs/canvas`,
`pdf-parse`, `pdfjs-dist` in the esbuild `external` array. The MCP SDK
(`@modelcontextprotocol/sdk`) and `zod` are pure ESM and bundle fine — do NOT
externalize them.
