import { createHash } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  runDoclingProcessorAdapter,
  type DoclingAdapterPolicy,
  type DoclingProcessorExecutor,
  type RunDoclingAdapterInput,
} from "./doclingProcessorAdapter";

const SOURCE_BYTES = Buffer.from("%PDF-1.4\ntrusted-adapter-parent\n", "utf8");
const CHILD_BYTES = Buffer.from("%PDF-1.4\ntrusted-adapter-child\n", "utf8");
const EXTRACTED_AT = "2026-09-01T20:30:00.000Z";
const PROCESSOR_VERSION = "2.124.0";

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function promotedPolicy(): DoclingAdapterPolicy {
  return {
    enabled: true,
    promotedReasons: ["embedded-pdf-container"],
  };
}

function validExecutor(): DoclingProcessorExecutor {
  return vi.fn(async ({ request }) => {
    const structured = Buffer.from(
      JSON.stringify({ schema_name: "DoclingDocument", version: "2" }),
      "utf8",
    );
    return {
      result: {
        schemaVersion: 2,
        jobKey: request.jobKey,
        sourceSha256: request.source.sha256,
        representationKind: "derived-noncanonical",
        processor: { name: "docling", version: PROCESSOR_VERSION },
        extractedAt: EXTRACTED_AT,
        status: "ok",
        durationMs: 10,
        derivedSource: {
          kind: "embedded-pdf",
          parentSha256: request.source.sha256,
          sha256: sha256(CHILD_BYTES),
          sizeBytes: CHILD_BYTES.byteLength,
          attachmentIndex: 1,
        },
        metrics: {
          markdownCharacters: 0,
          pages: 1,
          tables: 0,
        },
        artifacts: [
          {
            kind: "structured-json",
            contentSha256: sha256(structured),
            sizeBytes: structured.byteLength,
          },
        ],
      },
      artifacts: { "structured-json": structured },
      derivedSourceBytes: CHILD_BYTES,
    };
  });
}

function input(executor: DoclingProcessorExecutor): RunDoclingAdapterInput {
  return {
    sourceBytes: SOURCE_BYTES,
    expectedSourceSha256: sha256(SOURCE_BYTES),
    reason: "embedded-pdf-container",
    baseline: {
      status: "ok",
      characters: 810,
      pages: 1,
      hasEmbeddedPdf: true,
    },
    processorVersion: PROCESSOR_VERSION,
    limits: {
      maxBytes: 10_000,
      maxPages: 20,
      timeoutMs: 1_000,
    },
    executor,
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("runDoclingProcessorAdapter", () => {
  it("never calls the executor when disabled or unpromoted", async () => {
    const executor = validExecutor();
    expect(
      await runDoclingProcessorAdapter(input(executor), {
        enabled: false,
        promotedReasons: ["embedded-pdf-container"],
      }),
    ).toEqual({ status: "skipped", code: "feature-disabled" });
    expect(
      await runDoclingProcessorAdapter(input(executor), {
        enabled: true,
        promotedReasons: [],
      }),
    ).toEqual({ status: "skipped", code: "policy-not-promoted" });
    expect(executor).not.toHaveBeenCalled();
  });

  it("rejects a parent source hash mismatch before execution", async () => {
    const executor = validExecutor();
    const result = await runDoclingProcessorAdapter(
      { ...input(executor), expectedSourceSha256: "f".repeat(64) },
      promotedPolicy(),
    );
    expect(result).toEqual({ status: "rejected", code: "source-hash-mismatch" });
    expect(executor).not.toHaveBeenCalled();
  });

  it("validates parent, child and structured JSON in memory", async () => {
    const executor = validExecutor();
    const result = await runDoclingProcessorAdapter(input(executor), promotedPolicy());
    expect(result.status).toBe("validated");
    if (result.status === "validated") {
      expect(result.request.schemaVersion).toBe(2);
      expect(result.request.requestedOutputs).toEqual(["structured-json"]);
      expect(result.result.status).toBe("ok");
      if (result.result.status === "ok") {
        expect(result.result.derivedSource?.sha256).toBe(sha256(CHILD_BYTES));
      }
      expect(result.artifacts["structured-json"]).toBeDefined();
    }
    expect(executor).toHaveBeenCalledTimes(1);
  });

  it("rejects mutated parent bytes returned from the executor boundary", async () => {
    const executor: DoclingProcessorExecutor = vi.fn(async ({ sourceBytes }) => {
      sourceBytes[0] = sourceBytes[0] === 0 ? 1 : 0;
      return { result: {}, artifacts: {} };
    });
    const result = await runDoclingProcessorAdapter(input(executor), promotedPolicy());
    expect(result).toEqual({ status: "rejected", code: "source-bytes-mutated" });
    expect(SOURCE_BYTES.toString("utf8")).toContain("%PDF-1.4");
  });

  it("rejects a processor result bound to another parent", async () => {
    const executor: DoclingProcessorExecutor = vi.fn(async ({ request }) => ({
      result: {
        schemaVersion: 2,
        jobKey: request.jobKey,
        sourceSha256: "e".repeat(64),
        representationKind: "derived-noncanonical",
        processor: { name: "docling", version: PROCESSOR_VERSION },
        extractedAt: EXTRACTED_AT,
        status: "failed",
        durationMs: 10,
        failure: { code: "conversion-failed", retryable: false },
      },
      artifacts: {},
    }));
    expect(
      await runDoclingProcessorAdapter(input(executor), promotedPolicy()),
    ).toEqual({ status: "rejected", code: "processor-result-invalid" });
  });

  it("rejects missing or mismatched derived child bytes", async () => {
    const missing: DoclingProcessorExecutor = vi.fn(async ({ request }) => {
      const structured = Buffer.from('{"ok":true}', "utf8");
      return {
        result: {
          schemaVersion: 2,
          jobKey: request.jobKey,
          sourceSha256: request.source.sha256,
          representationKind: "derived-noncanonical",
          processor: { name: "docling", version: PROCESSOR_VERSION },
          extractedAt: EXTRACTED_AT,
          status: "ok",
          durationMs: 10,
          derivedSource: {
            kind: "embedded-pdf",
            parentSha256: request.source.sha256,
            sha256: sha256(CHILD_BYTES),
            sizeBytes: CHILD_BYTES.byteLength,
            attachmentIndex: 1,
          },
          metrics: { markdownCharacters: 0, pages: 1, tables: 0 },
          artifacts: [
            {
              kind: "structured-json",
              contentSha256: sha256(structured),
              sizeBytes: structured.byteLength,
            },
          ],
        },
        artifacts: { "structured-json": structured },
      };
    });
    expect(
      await runDoclingProcessorAdapter(input(missing), promotedPolicy()),
    ).toEqual({ status: "rejected", code: "derived-source-missing" });

    const wrongHash: DoclingProcessorExecutor = vi.fn(async ({ request }) => {
      const structured = Buffer.from('{"ok":true}', "utf8");
      const wrongChild = Buffer.from("%PDF-1.4\nwrong-child\n", "utf8");
      return {
        result: {
          schemaVersion: 2,
          jobKey: request.jobKey,
          sourceSha256: request.source.sha256,
          representationKind: "derived-noncanonical",
          processor: { name: "docling", version: PROCESSOR_VERSION },
          extractedAt: EXTRACTED_AT,
          status: "ok",
          durationMs: 10,
          derivedSource: {
            kind: "embedded-pdf",
            parentSha256: request.source.sha256,
            sha256: sha256(CHILD_BYTES),
            sizeBytes: wrongChild.byteLength,
            attachmentIndex: 1,
          },
          metrics: { markdownCharacters: 0, pages: 1, tables: 0 },
          artifacts: [
            {
              kind: "structured-json",
              contentSha256: sha256(structured),
              sizeBytes: structured.byteLength,
            },
          ],
        },
        artifacts: { "structured-json": structured },
        derivedSourceBytes: wrongChild,
      };
    });
    expect(
      await runDoclingProcessorAdapter(input(wrongHash), promotedPolicy()),
    ).toEqual({ status: "rejected", code: "derived-source-hash-mismatch" });
  });

  it("rejects a non-PDF derived child even when hash and size match", async () => {
    const executor: DoclingProcessorExecutor = vi.fn(async ({ request }) => {
      const structured = Buffer.from('{"ok":true}', "utf8");
      const badChild = Buffer.from("not-a-pdf", "utf8");
      return {
        result: {
          schemaVersion: 2,
          jobKey: request.jobKey,
          sourceSha256: request.source.sha256,
          representationKind: "derived-noncanonical",
          processor: { name: "docling", version: PROCESSOR_VERSION },
          extractedAt: EXTRACTED_AT,
          status: "ok",
          durationMs: 10,
          derivedSource: {
            kind: "embedded-pdf",
            parentSha256: request.source.sha256,
            sha256: sha256(badChild),
            sizeBytes: badChild.byteLength,
            attachmentIndex: 1,
          },
          metrics: { markdownCharacters: 0, pages: 1, tables: 0 },
          artifacts: [
            {
              kind: "structured-json",
              contentSha256: sha256(structured),
              sizeBytes: structured.byteLength,
            },
          ],
        },
        artifacts: { "structured-json": structured },
        derivedSourceBytes: badChild,
      };
    });
    expect(
      await runDoclingProcessorAdapter(input(executor), promotedPolicy()),
    ).toEqual({ status: "rejected", code: "derived-source-format-invalid" });
  });

  it("rejects artifact hash, size and JSON mismatches", async () => {
    for (const [code, declared, returned, sizeDelta] of [
      ["artifact-hash-mismatch", Buffer.from('{"ok":true}'), Buffer.from('{"ok":false}'), 0],
      ["artifact-size-mismatch", Buffer.from('{"ok":true}'), Buffer.from('{"ok":true}'), 1],
      ["structured-json-invalid", Buffer.from("{not-json"), Buffer.from("{not-json"), 0],
    ] as const) {
      const executor: DoclingProcessorExecutor = vi.fn(async ({ request }) => ({
        result: {
          schemaVersion: 2,
          jobKey: request.jobKey,
          sourceSha256: request.source.sha256,
          representationKind: "derived-noncanonical",
          processor: { name: "docling", version: PROCESSOR_VERSION },
          extractedAt: EXTRACTED_AT,
          status: "ok",
          durationMs: 10,
          derivedSource: {
            kind: "embedded-pdf",
            parentSha256: request.source.sha256,
            sha256: sha256(CHILD_BYTES),
            sizeBytes: CHILD_BYTES.byteLength,
            attachmentIndex: 1,
          },
          metrics: { markdownCharacters: 0, pages: 1, tables: 0 },
          artifacts: [
            {
              kind: "structured-json",
              contentSha256: sha256(declared),
              sizeBytes: returned.byteLength + sizeDelta,
            },
          ],
        },
        artifacts: { "structured-json": returned },
        derivedSourceBytes: CHILD_BYTES,
      }));
      expect(
        await runDoclingProcessorAdapter(input(executor), promotedPolicy()),
      ).toEqual({ status: "rejected", code });
    }
  });

  it("enforces the adapter timeout and aborts the executor signal", async () => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    const executor: DoclingProcessorExecutor = vi.fn(
      async ({ signal: receivedSignal }) => {
        signal = receivedSignal;
        return await new Promise<never>(() => {});
      },
    );
    const pending = runDoclingProcessorAdapter(
      {
        ...input(executor),
        limits: { maxBytes: 10_000, maxPages: 20, timeoutMs: 50 },
      },
      promotedPolicy(),
    );
    await vi.advanceTimersByTimeAsync(50);
    expect(await pending).toEqual({ status: "rejected", code: "executor-timeout" });
    expect(signal?.aborted).toBe(true);
  });
});
