import { createHash } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  runDoclingProcessorAdapter,
  type DoclingProcessorExecutor,
  type RunDoclingAdapterInput,
} from "./doclingProcessorAdapter";

const SOURCE = Buffer.from("%PDF-1.4\nadapter-edge-test\n", "utf8");
const PROCESSOR_VERSION = "2.124.0";
const EXTRACTED_AT = "2026-09-01T20:40:00.000Z";

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function baseInput(executor: DoclingProcessorExecutor): RunDoclingAdapterInput {
  return {
    sourceBytes: SOURCE,
    expectedSourceSha256: sha256(SOURCE),
    reason: "embedded-pdf-container",
    baseline: {
      status: "ok",
      characters: 810,
      pages: 1,
      hasEmbeddedPdf: true,
    },
    processorVersion: PROCESSOR_VERSION,
    limits: { maxBytes: 10_000, maxPages: 20, timeoutMs: 1_000 },
    executor,
  };
}

function validOutcome(
  request: Parameters<DoclingProcessorExecutor>[0]["request"],
  structured: Uint8Array,
) {
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
  } as const;
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("trusted Docling adapter edge gates", () => {
  it("does not execute with the real default policy even if the feature flag is true", async () => {
    vi.stubEnv("DOCLING_ENRICHMENT_ENABLED", "true");
    const executor: DoclingProcessorExecutor = vi.fn(async () => {
      throw new Error("must not run");
    });

    const result = await runDoclingProcessorAdapter(baseInput(executor));
    expect(result).toEqual({ status: "skipped", code: "policy-not-promoted" });
    expect(executor).not.toHaveBeenCalled();
  });

  it("normalises an abort-driven executor rejection to executor-timeout", async () => {
    vi.useFakeTimers();
    const executor: DoclingProcessorExecutor = vi.fn(
      ({ signal }) =>
        new Promise<Awaited<ReturnType<DoclingProcessorExecutor>>>(
          (_resolve, reject) => {
            signal.addEventListener(
              "abort",
              () => reject(new Error("transport aborted")),
              { once: true },
            );
          },
        ),
    );

    const pending = runDoclingProcessorAdapter(
      {
        ...baseInput(executor),
        limits: { maxBytes: 10_000, maxPages: 20, timeoutMs: 50 },
      },
      { enabled: true, promotedReasons: ["embedded-pdf-container"] },
    );

    await vi.advanceTimersByTimeAsync(50);
    expect(await pending).toEqual({ status: "rejected", code: "executor-timeout" });
  });

  it("rejects an executor artifact map containing non-byte values", async () => {
    const executor = vi.fn(async () => ({
      result: {},
      artifacts: { "structured-json": "not-bytes" },
    })) as unknown as DoclingProcessorExecutor;

    const result = await runDoclingProcessorAdapter(baseInput(executor), {
      enabled: true,
      promotedReasons: ["embedded-pdf-container"],
    });
    expect(result).toEqual({
      status: "rejected",
      code: "executor-outcome-invalid",
    });
  });

  it("returns defensive copies of validated derived bytes", async () => {
    let executorOwned = Buffer.from(
      JSON.stringify({ schema_name: "DoclingDocument", value: 1 }),
      "utf8",
    );
    const executor: DoclingProcessorExecutor = vi.fn(async ({ request }) =>
      validOutcome(request, executorOwned),
    );

    const result = await runDoclingProcessorAdapter(baseInput(executor), {
      enabled: true,
      promotedReasons: ["embedded-pdf-container"],
    });
    expect(result.status).toBe("validated");
    if (result.status !== "validated") return;

    const adapterOwned = result.artifacts["structured-json"];
    expect(adapterOwned).toBeDefined();
    const snapshot = Buffer.from(adapterOwned!);

    executorOwned.fill(0);
    executorOwned = Buffer.from("changed", "utf8");
    expect(Buffer.from(adapterOwned!)).toEqual(snapshot);
  });
});
