import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

const processorUrl = new URL("../dist/docling/processor_contract.py", import.meta.url);
const requirementsUrl = new URL("../dist/docling/requirements.txt", import.meta.url);
const preflightUrl = new URL("../dist/doclingPreflight.mjs", import.meta.url);

test("worker build ships the contract-aware Docling processor beside the bundle", async () => {
  const [processor, requirements, preflight] = await Promise.all([
    readFile(processorUrl, "utf8"),
    readFile(requirementsUrl, "utf8"),
    stat(fileURLToPath(preflightUrl)),
  ]);

  assert.match(processor, /SUPPORTED_REASON\s*=\s*"embedded-pdf-container"/u);
  assert.ok(
    requirements
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .includes("docling==2.124.0"),
  );
  assert.equal(preflight.isFile(), true);
});
