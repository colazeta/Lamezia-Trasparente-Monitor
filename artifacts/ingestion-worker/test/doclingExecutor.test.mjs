import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createWorkerDoclingExecutor } from "../dist/doclingExecutor.mjs";

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function requestFor(source, overrides = {}) {
  return {
    schemaVersion: 1,
    jobKey: "docling:test-job",
    representationKind: "derived-noncanonical",
    source: {
      sha256: sha256(source),
      contentType: "application/pdf",
      sizeBytes: source.byteLength,
    },
    selection: {
      reason: "embedded-pdf-container",
      baseline: {
        status: "ok",
        characters: 810,
        pages: 1,
        hasEmbeddedPdf: true,
      },
    },
    target: { processor: "docling", processorVersion: "2.124.0" },
    limits: { maxBytes: 10_000, maxPages: 20, timeoutMs: 5_000 },
    requestedOutputs: ["structured-json"],
    ...overrides,
  };
}

async function suiteDir(t) {
  const dir = await mkdtemp(join(tmpdir(), "lt-docling-executor-test-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return dir;
}

async function writeFakeProcessor(root, name, source) {
  const path = join(root, name);
  await writeFile(path, source, { mode: 0o600 });
  return path;
}

test("worker executor returns local artifact bytes and removes its private workdir", async (t) => {
  const root = await suiteDir(t);
  const script = await writeFakeProcessor(
    root,
    "fake-processor.mjs",
    `import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const args = process.argv.slice(2);
const value = (name) => args[args.indexOf(name) + 1];
const request = JSON.parse(readFileSync(value("--request"), "utf8"));
const source = readFileSync(value("--source"));
const output = value("--output-dir");
const structured = Buffer.from(JSON.stringify({ schema_name: "DoclingDocument", source_bytes: source.length }) + "\\n", "utf8");
writeFileSync(join(output, "structured.json"), structured);
writeFileSync(join(output, "result.json"), JSON.stringify({
  schemaVersion: 1,
  jobKey: request.jobKey,
  sourceSha256: request.source.sha256,
  representationKind: "derived-noncanonical",
  processor: { name: "docling", version: request.target.processorVersion },
  extractedAt: "2026-09-01T20:40:00.000Z",
  status: "ok",
  durationMs: 1,
  metrics: { markdownCharacters: 0, pages: 1, tables: 0 },
  artifacts: [{
    kind: "structured-json",
    contentSha256: createHash("sha256").update(structured).digest("hex"),
    sizeBytes: structured.length
  }]
}));
`,
  );

  const source = Buffer.from("%PDF-1.4\nworker-executor-test\n", "utf8");
  const request = requestFor(source);
  const executor = createWorkerDoclingExecutor({
    pythonBin: process.execPath,
    processorScript: script,
    tempRoot: root,
  });

  const outcome = await executor({
    request,
    sourceBytes: source,
    signal: new AbortController().signal,
  });

  assert.equal(outcome.result.status, "ok");
  const structured = outcome.artifacts["structured-json"];
  assert.ok(structured instanceof Uint8Array);
  assert.deepEqual(JSON.parse(Buffer.from(structured).toString("utf8")), {
    schema_name: "DoclingDocument",
    source_bytes: source.length,
  });
  assert.deepEqual((await readdir(root)).sort(), ["fake-processor.mjs"]);
});

test("worker executor rejects nonzero processor exit and still cleans transport files", async (t) => {
  const root = await suiteDir(t);
  const script = await writeFakeProcessor(root, "failing-processor.mjs", "process.exit(2);\n");
  const source = Buffer.from("%PDF-1.4\nfailing-worker-executor-test\n", "utf8");
  const executor = createWorkerDoclingExecutor({
    pythonBin: process.execPath,
    processorScript: script,
    tempRoot: root,
  });

  await assert.rejects(
    executor({
      request: requestFor(source),
      sourceBytes: source,
      signal: new AbortController().signal,
    }),
    /Docling processor exited unsuccessfully/,
  );
  assert.deepEqual((await readdir(root)).sort(), ["failing-processor.mjs"]);
});

test("worker executor enforces a local artifact-size bound before reading output", async (t) => {
  const root = await suiteDir(t);
  const script = await writeFakeProcessor(
    root,
    "oversized-processor.mjs",
    `import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const args = process.argv.slice(2);
const value = (name) => args[args.indexOf(name) + 1];
const request = JSON.parse(readFileSync(value("--request"), "utf8"));
const output = value("--output-dir");
writeFileSync(join(output, "structured.json"), Buffer.alloc(1024 * 1024 + 1));
writeFileSync(join(output, "result.json"), JSON.stringify({ status: "ok", jobKey: request.jobKey }));
`,
  );

  const source = Buffer.from("%PDF-1.4\nsmall-source\n", "utf8");
  const executor = createWorkerDoclingExecutor({
    pythonBin: process.execPath,
    processorScript: script,
    tempRoot: root,
  });

  await assert.rejects(
    executor({
      request: requestFor(source),
      sourceBytes: source,
      signal: new AbortController().signal,
    }),
    /output exceeds local transport bound/,
  );
  assert.deepEqual((await readdir(root)).sort(), ["oversized-processor.mjs"]);
});
