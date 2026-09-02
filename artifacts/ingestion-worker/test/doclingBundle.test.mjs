import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

const processorUrl = new URL("../dist/docling/processor_contract.py", import.meta.url);
const requirementsUrl = new URL("../dist/docling/requirements.txt", import.meta.url);
const preflightUrl = new URL("../dist/doclingPreflight.mjs", import.meta.url);
const smokeUrl = new URL("../dist/doclingSmoke.mjs", import.meta.url);

test("worker build ships the v2 contract-aware Docling processor and readiness entrypoints", async () => {
  const [processor, requirements, preflight, smoke] = await Promise.all([
    readFile(processorUrl, "utf8"),
    readFile(requirementsUrl, "utf8"),
    stat(fileURLToPath(preflightUrl)),
    stat(fileURLToPath(smokeUrl)),
  ]);

  assert.match(processor, /SUPPORTED_REASON\s*=\s*"embedded-pdf-container"/u);
  assert.match(processor, /SCHEMA_VERSION\s*=\s*2/u);
  assert.match(processor, /extract_single_embedded_pdf/u);
  assert.match(processor, /DOCLING_ARTIFACTS_PATH/u);
  const pins = requirements
    .split(/\r?\n/u)
    .map((line) => line.trim());
  assert.ok(pins.includes("docling==2.124.0"));
  assert.ok(pins.includes("pypdf==6.16.2"));
  assert.equal(preflight.isFile(), true);
  assert.equal(smoke.isFile(), true);
});
