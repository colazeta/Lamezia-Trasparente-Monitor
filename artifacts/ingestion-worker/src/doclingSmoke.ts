import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  runDoclingProcessorAdapter,
  type DoclingAdapterResult,
} from "../../api-server/src/lib/doclingProcessorAdapter";
import { createWorkerDoclingExecutor } from "./doclingExecutor";

const SHA256_RE = /^[a-f0-9]{64}$/u;
const PROCESSOR_VERSION = "2.124.0";
const SMOKE_LIMITS = {
  maxBytes: 30 * 1024 * 1024,
  maxPages: 20,
  timeoutMs: 180_000,
} as const;

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function cliValue(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index < 0) return undefined;
  return process.argv[index + 1];
}

function requiredSha(name: string): string {
  const value = cliValue(name)?.trim().toLowerCase();
  if (!value || !SHA256_RE.test(value)) {
    throw new Error(`Missing or invalid ${name}`);
  }
  return value;
}

function ensureSmokeSuccess(
  result: DoclingAdapterResult,
  expectedChildSha256: string,
): {
  parentSha256: string;
  childSha256: string;
  pages: number | null;
  tables: number | null;
  structuredBytes: number;
} {
  if (result.status !== "validated" || result.result.status !== "ok") {
    throw new Error("Packaged Docling smoke did not produce a validated ok result");
  }

  const derived = result.result.derivedSource;
  if (!derived || derived.sha256 !== expectedChildSha256) {
    throw new Error("Packaged Docling smoke child SHA-256 mismatch");
  }

  const structured = result.artifacts["structured-json"];
  if (!structured) {
    throw new Error("Packaged Docling smoke missing structured JSON bytes");
  }
  const decoded = new TextDecoder("utf-8", { fatal: true }).decode(structured);
  const parsed = JSON.parse(decoded) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Packaged Docling smoke structured JSON is not an object");
  }

  return {
    parentSha256: result.request.source.sha256,
    childSha256: derived.sha256,
    pages: result.result.metrics.pages,
    tables: result.result.metrics.tables,
    structuredBytes: structured.byteLength,
  };
}

async function main(): Promise<void> {
  const sourceArg = cliValue("--source");
  if (!sourceArg) {
    throw new Error("Missing --source");
  }
  const expectedParentSha256 = requiredSha("--expected-parent");
  const expectedChildSha256 = requiredSha("--expected-child");
  const sourcePath = resolve(sourceArg);
  const sourceBytes = new Uint8Array(await readFile(sourcePath));
  const parentSha256 = sha256(sourceBytes);
  if (parentSha256 !== expectedParentSha256) {
    throw new Error("Packaged Docling smoke parent SHA-256 mismatch");
  }

  const executor = createWorkerDoclingExecutor();
  const result = await runDoclingProcessorAdapter(
    {
      sourceBytes,
      expectedSourceSha256: expectedParentSha256,
      reason: "embedded-pdf-container",
      baseline: {
        status: "ok",
        characters: 810,
        pages: 1,
        hasEmbeddedPdf: true,
      },
      processorVersion: PROCESSOR_VERSION,
      limits: SMOKE_LIMITS,
      requestedOutputs: ["structured-json"],
      executor,
    },
    {
      // The smoke command is an explicit operator gate, not production runtime.
      // It bypasses the feature flag only to prove the packaged trust path.
      enabled: true,
      promotedReasons: ["embedded-pdf-container"],
    },
  );

  const checked = ensureSmokeSuccess(result, expectedChildSha256);
  process.stdout.write(
    JSON.stringify({
      status: "ok",
      processor: "docling",
      processorVersion: PROCESSOR_VERSION,
      contractVersion: 2,
      representationKind: "derived-noncanonical",
      parentSha256: checked.parentSha256,
      childSha256: checked.childSha256,
      pages: checked.pages,
      tables: checked.tables,
      structuredBytes: checked.structuredBytes,
      extractedContentEmitted: false,
    }) + "\n",
  );
}

main().catch(() => {
  process.stderr.write("Packaged Docling smoke failed.\n");
  process.exitCode = 1;
});
