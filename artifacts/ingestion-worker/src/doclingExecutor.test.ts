import { createHash } from "node:crypto";
import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { buildDoclingProcessorRequest } from "../../api-server/src/lib/doclingProcessorContract";
import { createWorkerDoclingExecutor } from "./doclingExecutor";

const cleanup: string[] = [];

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

async function createSuiteDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "lt-docling-executor-test-"));
  cleanup.push(dir);
  return dir;
}

function requestFor(source: Uint8Array) {
  return buildDoclingProcessorRequest({
    source: {
      sha256: sha256(source),
      contentType: "application/pdf",
      sizeBytes: source.byteLength,
    },
    reason: "embedded-pdf-container",
    baseline: {
      status: "ok",
      characters: 810,
      pages: 1,
      hasEmbeddedPdf: true,
    },
    processorVersion: "2.124.0",
    limits: { maxBytes: 10_000, maxPages: 20, timeoutMs: 5_000 },
    requestedOutputs: ["structured-json"],
  });
}

afterEach(async () => {
  await Promise.all(
    cleanup.splice(0).map((dir) => rm(dir, { recursive: true, force: true })),
  );
});

describe("createWorkerDoclingExecutor", () => {
  it("materialises only local transport files, returns bytes, and cleans the workdir", async () => {
    const root = await createSuiteDir();
    const script = join(root, "fake-processor.mjs");
    await writeFile(
      script,
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
const digest = createHash("sha256").update(structured).digest("hex");
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
  artifacts: [{ kind: "structured-json", contentSha256: digest, sizeBytes: structured.length }]
}));
`,
      { mode: 0o600 },
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

    expect(outcome.result).toMatchObject({
      jobKey: request.jobKey,
      status: "ok",
      representationKind: "derived-noncanonical",
    });
    expect(
      JSON.parse(Buffer.from(outcome.artifacts["structured-json"]!).toString("utf8")),
    ).toMatchObject({ schema_name: "DoclingDocument" });
    expect((await readdir(root)).sort()).toEqual(["fake-processor.mjs"]);
  });

  it("cleans temporary source/request files even when the processor produces no result", async () => {
    const root = await createSuiteDir();
    const script = join(root, "failing-processor.mjs");
    await writeFile(script, "process.exit(2);\n", { mode: 0o600 });

    const source = Buffer.from("%PDF-1.4\nfailing-worker-executor-test\n", "utf8");
    const executor = createWorkerDoclingExecutor({
      pythonBin: process.execPath,
      processorScript: script,
      tempRoot: root,
    });

    await expect(
      executor({
        request: requestFor(source),
        sourceBytes: source,
        signal: new AbortController().signal,
      }),
    ).rejects.toBeTruthy();
    expect((await readdir(root)).sort()).toEqual(["failing-processor.mjs"]);
  });
});
