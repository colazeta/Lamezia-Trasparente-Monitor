import fs from "node:fs/promises";
import crypto from "node:crypto";
import { performance } from "node:perf_hooks";
import { PDFParse } from "pdf-parse";

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: node scripts/docling_pdf_baseline.mjs <local-pdf>");
  process.exit(2);
}

const started = performance.now();
let parser;
try {
  const data = await fs.readFile(inputPath);
  const sha256 = crypto.createHash("sha256").update(data).digest("hex");
  parser = new PDFParse({ data });
  const result = await parser.getText();
  const text = typeof result?.text === "string" ? result.text : "";

  process.stdout.write(
    JSON.stringify({
      schemaVersion: 1,
      extractor: "pdf-parse",
      extractorVersion: "2.4.5",
      status: "ok",
      source: {
        fileName: inputPath.split(/[\\/]/).pop(),
        sha256,
        bytes: data.byteLength,
      },
      metrics: {
        characters: text.length,
        words: text.trim() ? text.trim().split(/\s+/u).length : 0,
        pages: Number.isFinite(result?.total) ? result.total : null,
        elapsedMs: Math.round(performance.now() - started),
      },
      text,
    }) + "\n",
  );
} catch (error) {
  process.stdout.write(
    JSON.stringify({
      schemaVersion: 1,
      extractor: "pdf-parse",
      extractorVersion: "2.4.5",
      status: "failed",
      error: error instanceof Error ? error.message : String(error),
      metrics: { elapsedMs: Math.round(performance.now() - started) },
    }) + "\n",
  );
  process.exitCode = 1;
} finally {
  if (parser) {
    try {
      await parser.destroy();
    } catch {
      // Benchmark cleanup must not mask the extraction result.
    }
  }
}
