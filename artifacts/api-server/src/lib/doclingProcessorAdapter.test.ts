import { createHash } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  runDoclingProcessorAdapter,
  type DoclingAdapterPolicy,
  type DoclingProcessorExecutor,
  type RunDoclingAdapterInput,
} from "./doclingProcessorAdapter";

const SOURCE_BYTES = Buffer.from("%PDF-1.4\ntrusted-adapter-test\n", "utf8");
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
      JSON.stringify({ schema_name: "DoclingDocument", version: "1" }),
      "utf8",
    );
    return {
      result: {
        schemaVersion: 1,
        jobKey: request.jobKey,
        sourceSha256: request.source.sha256,
        representationKind: "derived-noncanonical",
        processor: { name: "docling", version: PROCESSOR_VERSION },
        extractedAt: EXTRACTED_AT,
        status: "ok",
        durationMs: 10,
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
  it("never calls the executor when the feature is disabled", async () => {
    const executor = validExecutor();
    const result = await runDoclingProcessorAdapter(input(executor), {
      enabled: false,
      promotedReasons: ["embedded-pdf-container"],
    });

    expect(result).toEqual({ status: "skipped", code: "feature-disabled" });
    expect(executor).not.toHaveBeenCalled();
  });

  it("never calls the executor when no reason has been promoted", async () => {
    const executor = validExecutor();
    const result = await runDoclingProcessorAdapter(input(executor), {
      enabled: true,
      promotedReasons: [],
    });

    expect(result).toEqual({ status: "skipped", code: "policy-not-promoted" });
    expect(executor).not.toHaveBeenCalled();
  });

  it("rejects a source hash mismatch before execution", async () => {
    const executor = validExecutor();
    const result = await runDoclingProcessorAdapter(
      { ...input(executor), expectedSourceSha256: "f".repeat(64) },
      promotedPolicy(),
    );

    expect(result).toEqual({ status: "rejected", code: "source-hash-mismatch" });
    expect(executor).not.toHaveBeenCalled();
  });

  it("validates a promoted processor result and defaults to structured JSON only", async () => {
    const executor = validExecutor();
    const result = await runDoclingProcessorAdapter(input(executor), promotedPolicy());

    expect(result.status).toBe("validated");
    if (result.status === "validated") {
      expect(result.request.requestedOutputs).toEqual(["structured-json"]);
      expect(result.result.status).toBe("ok");
      expect(result.artifacts["structured-json"]).toBeDefined();
    }
    expect(executor).toHaveBeenCalledTimes(1);
  });

  it("rejects mutated source bytes returned from the executor boundary", async () => {
    const executor: DoclingProcessorExecutor = vi.fn(async ({ sourceBytes }) => {
      sourceBytes[0] = sourceBytes[0] === 0 ? 1 : 0;
      return { result: {}, artifacts: {} };
    });

    const result = await runDoclingProcessorAdapter(input(executor), promotedPolicy());
    expect(result).toEqual({ status: "rejected", code: "source-bytes-mutated" });
    expect(SOURCE_BYTES.toString("utf8")).toContain("%PDF-1.4");
  });

  it("rejects processor responses that fail the request-bound contract", async () => {
    const executor: DoclingProcessorExecutor = vi.fn(async ({ request }) => ({
      result: {
        schemaVersion: 1,
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

    const result = await runDoclingProcessorAdapter(input(executor), promotedPolicy());
    expect(result).toEqual({
      status: "rejected",
      code: "processor-result-invalid",
    });
  });

  it("rejects derived bytes whose hash does not match the processor manifest", async () => {
    const executor: DoclingProcessorExecutor = vi.fn(async ({ request }) => {
      const declared = Buffer.from('{"ok":true}', "utf8");
      const returned = Buffer.from('{"ok":false}', "utf8");
      return {
        result: {
          schemaVersion: 1,
          jobKey: request.jobKey,
          sourceSha256: request.source.sha256,
          representationKind: "derived-noncanonical",
          processor: { name: "docling", version: PROCESSOR_VERSION },
          extractedAt: EXTRACTED_AT,
          status: "ok",
          durationMs: 10,
          metrics: { markdownCharacters: 0, pages: 1, tables: 0 },
          artifacts: [
            {
              kind: "structured-json",
              contentSha256: sha256(declared),
              sizeBytes: returned.byteLength,
            },
          ],
        },
        artifacts: { "structured-json": returned },
      };
    });

    const result = await runDoclingProcessorAdapter(input(executor), promotedPolicy());
    expect(result).toEqual({ status: "rejected", code: "artifact-hash-mismatch" });
  });

  it("rejects derived bytes whose size does not match the manifest", async () => {
    const executor: DoclingProcessorExecutor = vi.fn(async ({ request }) => {
      const structured = Buffer.from('{"ok":true}', "utf8");
      return {
        result: {
          schemaVersion: 1,
          jobKey: request.jobKey,
          sourceSha256: request.source.sha256,
          representationKind: "derived-noncanonical",
          processor: { name: "docling", version: PROCESSOR_VERSION },
          extractedAt: EXTRACTED_AT,
          status: "ok",
          durationMs: 10,
          metrics: { markdownCharacters: 0, pages: 1, tables: 0 },
          artifacts: [
            {
              kind: "structured-json",
              contentSha256: sha256(structured),
              sizeBytes: structured.byteLength + 1,
            },
          ],
        },
        artifacts: { "structured-json": structured },
      };
    });

    const result = await runDoclingProcessorAdapter(input(executor), promotedPolicy());
    expect(result).toEqual({ status: "rejected", code: "artifact-size-mismatch" });
  });

  it("rejects a structured-json artifact that is not valid JSON", async () => {
    const executor: DoclingProcessorExecutor = vi.fn(async ({ request }) => {
      const structured = Buffer.from("{not-json", "utf8");
      return {
        result: {
          schemaVersion: 1,
          jobKey: request.jobKey,
          sourceSha256: request.source.sha256,
          representationKind: "derived-noncanonical",
          processor: { name: "docling", version: PROCESSOR_VERSION },
          extractedAt: EXTRACTED_AT,
          status: "ok",
          durationMs: 10,
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

    const result = await runDoclingProcessorAdapter(input(executor), promotedPolicy());
    expect(result).toEqual({ status: "rejected", code: "structured-json-invalid" });
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
    const result = await pending;
    expect(result).toEqual({ status: "rejected", code: "executor-timeout" });
    expect(signal?.aborted).toBe(true);
  });
});
