import { createHash } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { DoclingProcessorExecutor } from "./doclingProcessorAdapter";
import {
  configureWorkerDoclingExecutor,
  createDoclingRuntimeContext,
  evaluateDoclingRuntimeCandidate,
} from "./doclingRuntimeWiring";

const SOURCE = Buffer.from("%PDF-1.4\nruntime-wiring-test\n", "utf8");

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function candidate(overrides: Record<string, unknown> = {}) {
  return {
    decision: {
      requestStructuredExtraction: true,
      reason: "embedded-pdf-container" as const,
      baselineCharactersPerPage: 810,
    },
    sourceBytes: SOURCE,
    expectedSourceSha256: sha256(SOURCE),
    baselineCharacters: 810,
    pages: 1,
    hasEmbeddedPdf: true,
    ...overrides,
  };
}

function validExecutor(): DoclingProcessorExecutor {
  return vi.fn(async ({ request }) => {
    const structured = Buffer.from(
      JSON.stringify({ schema_name: "DoclingDocument", test: true }),
      "utf8",
    );
    return {
      result: {
        schemaVersion: 1,
        jobKey: request.jobKey,
        sourceSha256: request.source.sha256,
        representationKind: "derived-noncanonical",
        processor: {
          name: "docling",
          version: request.target.processorVersion,
        },
        extractedAt: "2026-09-01T21:00:00.000Z",
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
}

afterEach(() => {
  configureWorkerDoclingExecutor(undefined);
  vi.unstubAllEnvs();
});

describe("worker-only Docling runtime gate", () => {
  it("cannot execute in a process that did not configure the worker executor", async () => {
    vi.stubEnv("DOCLING_ENRICHMENT_ENABLED", "true");
    const context = createDoclingRuntimeContext();
    await evaluateDoclingRuntimeCandidate(context, candidate());

    expect(context.summary).toMatchObject({
      eligible: 1,
      executorUnavailable: 1,
      adapterEvaluated: 0,
      validated: 0,
    });
    expect(context.summary.outcomes["executor-unavailable"]).toBe(1);
  });

  it("keeps the processor off when the feature flag is false", async () => {
    const executor = validExecutor();
    configureWorkerDoclingExecutor(executor);
    const context = createDoclingRuntimeContext();
    await evaluateDoclingRuntimeCandidate(context, candidate());

    expect(context.summary.featureDisabled).toBe(1);
    expect(context.summary.adapterEvaluated).toBe(0);
    expect(executor).not.toHaveBeenCalled();
  });

  it("requires an upstream-attested SHA before the trusted adapter", async () => {
    vi.stubEnv("DOCLING_ENRICHMENT_ENABLED", "true");
    const executor = validExecutor();
    configureWorkerDoclingExecutor(executor);
    const context = createDoclingRuntimeContext();
    await evaluateDoclingRuntimeCandidate(
      context,
      candidate({ expectedSourceSha256: null }),
    );

    expect(context.summary.provenanceMissing).toBe(1);
    expect(context.summary.adapterEvaluated).toBe(0);
    expect(context.summary.outcomes["missing-provenance"]).toBe(1);
    expect(executor).not.toHaveBeenCalled();
  });

  it("validates one embedded-PDF candidate in memory when explicitly enabled", async () => {
    vi.stubEnv("DOCLING_ENRICHMENT_ENABLED", "true");
    const executor = validExecutor();
    configureWorkerDoclingExecutor(executor);
    const context = createDoclingRuntimeContext();
    await evaluateDoclingRuntimeCandidate(context, candidate());

    expect(context.summary).toMatchObject({
      eligible: 1,
      adapterEvaluated: 1,
      validated: 1,
      rejected: 0,
      internalErrors: 0,
    });
    expect(context.summary.outcomes.validated).toBe(1);
    expect(executor).toHaveBeenCalledTimes(1);
  });

  it("caps real processor execution at one candidate per ingestion cycle", async () => {
    vi.stubEnv("DOCLING_ENRICHMENT_ENABLED", "true");
    const executor = validExecutor();
    configureWorkerDoclingExecutor(executor);
    const context = createDoclingRuntimeContext();

    await evaluateDoclingRuntimeCandidate(context, candidate());
    await evaluateDoclingRuntimeCandidate(context, candidate());

    expect(context.summary.eligible).toBe(2);
    expect(context.summary.adapterEvaluated).toBe(1);
    expect(context.summary.validated).toBe(1);
    expect(context.summary.budgetSkipped).toBe(1);
    expect(context.summary.outcomes["cycle-budget"]).toBe(1);
    expect(executor).toHaveBeenCalledTimes(1);
  });

  it("ignores observation reasons that have not been promoted for runtime", async () => {
    vi.stubEnv("DOCLING_ENRICHMENT_ENABLED", "true");
    const executor = validExecutor();
    configureWorkerDoclingExecutor(executor);
    const context = createDoclingRuntimeContext();
    await evaluateDoclingRuntimeCandidate(
      context,
      candidate({
        decision: {
          requestStructuredExtraction: true,
          reason: "scan-like-sparse-baseline",
          baselineCharactersPerPage: 16,
        },
      }),
    );

    expect(context.summary.eligible).toBe(0);
    expect(context.summary.adapterEvaluated).toBe(0);
    expect(executor).not.toHaveBeenCalled();
  });
});
