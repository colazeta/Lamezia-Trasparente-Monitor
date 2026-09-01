import { describe, expect, it } from "vitest";
import {
  buildDoclingProcessorRequest,
  doclingProcessorRequestSchema,
  parseDoclingProcessorResultForRequest,
} from "./doclingProcessorContract";

const SOURCE_SHA = "a".repeat(64);
const STRUCTURED_SHA = "b".repeat(64);
const MARKDOWN_SHA = "c".repeat(64);
const EXTRACTED_AT = "2026-09-01T20:00:00.000Z";

function request(requestedOutputs?: Array<"structured-json" | "markdown">) {
  return buildDoclingProcessorRequest({
    source: {
      sha256: SOURCE_SHA,
      contentType: "application/pdf",
      sizeBytes: 1000,
    },
    reason: "embedded-pdf-container",
    baseline: {
      status: "ok",
      characters: 810,
      pages: 1,
      hasEmbeddedPdf: true,
    },
    processorVersion: "2.124.0",
    limits: {
      maxBytes: 10_000,
      maxPages: 20,
      timeoutMs: 120_000,
    },
    requestedOutputs,
  });
}

function okResult(req = request()) {
  return {
    schemaVersion: 1 as const,
    jobKey: req.jobKey,
    sourceSha256: SOURCE_SHA,
    representationKind: "derived-noncanonical" as const,
    processor: { name: "docling" as const, version: "2.124.0" },
    extractedAt: EXTRACTED_AT,
    status: "ok" as const,
    durationMs: 2500,
    metrics: {
      markdownCharacters: 1452,
      pages: 1,
      tables: 0,
    },
    artifacts: [
      {
        kind: "structured-json" as const,
        contentSha256: STRUCTURED_SHA,
        sizeBytes: 9000,
      },
      {
        kind: "markdown" as const,
        contentSha256: MARKDOWN_SHA,
        sizeBytes: 1452,
      },
    ],
  };
}

describe("Docling processor request contract", () => {
  it("builds a deterministic source-hash keyed request without a locator", () => {
    const first = request();
    const second = request();
    expect(first.jobKey).toBe(second.jobKey);
    expect(first.jobKey).toContain(SOURCE_SHA);
    expect(first.representationKind).toBe("derived-noncanonical");
    expect(first).not.toHaveProperty("path");
    expect(first).not.toHaveProperty("url");
    expect(first.source).not.toHaveProperty("path");
    expect(first.source).not.toHaveProperty("url");
  });

  it("includes the normalized requested output set in job identity", () => {
    const structuredOnly = request(["structured-json"]);
    const both = request(["structured-json", "markdown"]);
    const bothReordered = request(["markdown", "structured-json"]);

    expect(structuredOnly.jobKey).not.toBe(both.jobKey);
    expect(both.jobKey).toBe(bothReordered.jobKey);
  });

  it("rejects requests whose source exceeds the explicit byte bound", () => {
    expect(() =>
      buildDoclingProcessorRequest({
        source: {
          sha256: SOURCE_SHA,
          contentType: "application/pdf",
          sizeBytes: 20_000,
        },
        reason: "scan-like-sparse-baseline",
        baseline: {
          status: "ok",
          characters: 16,
          pages: 1,
          hasEmbeddedPdf: false,
        },
        processorVersion: "2.124.0",
        limits: {
          maxBytes: 10_000,
          maxPages: 20,
          timeoutMs: 120_000,
        },
      }),
    ).toThrow();
  });

  it("rejects requests whose known page count exceeds maxPages", () => {
    expect(() =>
      buildDoclingProcessorRequest({
        source: {
          sha256: SOURCE_SHA,
          contentType: "application/pdf",
          sizeBytes: 1000,
        },
        reason: "scan-like-sparse-baseline",
        baseline: {
          status: "ok",
          characters: 16,
          pages: 21,
          hasEmbeddedPdf: false,
        },
        processorVersion: "2.124.0",
        limits: {
          maxBytes: 10_000,
          maxPages: 20,
          timeoutMs: 120_000,
        },
      }),
    ).toThrow(/observed page count exceeds request maxPages/);
  });

  it("rejects markdown-only requests because lossless structured JSON is mandatory", () => {
    expect(() => request(["markdown"])).toThrow(/structured-json is mandatory/);
  });

  it("allows structured-json without requesting convenience Markdown", () => {
    expect(request(["structured-json"]).requestedOutputs).toEqual([
      "structured-json",
    ]);
  });

  it("fails closed on unrecognised fields such as a processor-side source URL", () => {
    const req = request();
    expect(() =>
      doclingProcessorRequestSchema.parse({
        ...req,
        source: {
          ...req.source,
          url: "https://example.test/document.pdf",
        },
      }),
    ).toThrow();
  });
});

describe("Docling processor result contract", () => {
  it("accepts a matching derived result with all requested artifacts", () => {
    const req = request();
    const parsed = parseDoclingProcessorResultForRequest(req, okResult(req));
    expect(parsed.status).toBe("ok");
    if (parsed.status === "ok") {
      expect(parsed.artifacts.some((artifact) => artifact.kind === "structured-json")).toBe(true);
      expect(parsed.artifacts.some((artifact) => artifact.kind === "markdown")).toBe(true);
      expect(parsed.extractedAt).toBe(EXTRACTED_AT);
    }
  });

  it("requires a validated extraction timestamp", () => {
    const req = request();
    expect(() =>
      parseDoclingProcessorResultForRequest(req, {
        ...okResult(req),
        extractedAt: "not-a-date",
      }),
    ).toThrow();
  });

  it("rejects a result for a different immutable source hash", () => {
    const req = request();
    expect(() =>
      parseDoclingProcessorResultForRequest(req, {
        ...okResult(req),
        sourceSha256: "d".repeat(64),
      }),
    ).toThrow(/source SHA-256 mismatch/);
  });

  it("rejects a result with a mismatched job identity", () => {
    const req = request();
    expect(() =>
      parseDoclingProcessorResultForRequest(req, {
        ...okResult(req),
        jobKey: "docling:v1:other",
      }),
    ).toThrow(/jobKey mismatch/);
  });

  it("rejects successful output that omits structured-json", () => {
    const req = request();
    expect(() =>
      parseDoclingProcessorResultForRequest(req, {
        ...okResult(req),
        artifacts: [
          {
            kind: "markdown",
            contentSha256: MARKDOWN_SHA,
            sizeBytes: 1452,
          },
        ],
      }),
    ).toThrow();
  });

  it("rejects a zero-byte structured JSON artifact", () => {
    const req = request(["structured-json"]);
    expect(() =>
      parseDoclingProcessorResultForRequest(req, {
        ...okResult(req),
        artifacts: [
          {
            kind: "structured-json",
            contentSha256: STRUCTURED_SHA,
            sizeBytes: 0,
          },
        ],
      }),
    ).toThrow();
  });

  it("rejects a response that omits a requested convenience output", () => {
    const req = request();
    expect(() =>
      parseDoclingProcessorResultForRequest(req, {
        ...okResult(req),
        artifacts: [
          {
            kind: "structured-json",
            contentSha256: STRUCTURED_SHA,
            sizeBytes: 9000,
          },
        ],
      }),
    ).toThrow(/missing requested output: markdown/);
  });

  it("accepts exactly structured-json when that is the only requested output", () => {
    const req = request(["structured-json"]);
    const parsed = parseDoclingProcessorResultForRequest(req, {
      ...okResult(req),
      artifacts: [
        {
          kind: "structured-json",
          contentSha256: STRUCTURED_SHA,
          sizeBytes: 9000,
        },
      ],
    });
    expect(parsed.status).toBe("ok");
  });

  it("rejects unrequested extra artifacts for minimisation", () => {
    const req = request(["structured-json"]);
    expect(() =>
      parseDoclingProcessorResultForRequest(req, okResult(req)),
    ).toThrow(/returned unrequested output: markdown/);
  });

  it("rejects an ok result whose discovered page count exceeds maxPages", () => {
    const req = request();
    expect(() =>
      parseDoclingProcessorResultForRequest(req, {
        ...okResult(req),
        metrics: {
          ...okResult(req).metrics,
          pages: 21,
        },
      }),
    ).toThrow(/exceeds requested maxPages/);
  });

  it("rejects an ok result whose duration exceeds the requested timeout", () => {
    const req = request();
    expect(() =>
      parseDoclingProcessorResultForRequest(req, {
        ...okResult(req),
        durationMs: 120_001,
      }),
    ).toThrow(/exceeds requested timeoutMs/);
  });

  it("accepts a bounded skip without fabricated artifacts", () => {
    const req = request();
    const parsed = parseDoclingProcessorResultForRequest(req, {
      schemaVersion: 1,
      jobKey: req.jobKey,
      sourceSha256: SOURCE_SHA,
      representationKind: "derived-noncanonical",
      processor: { name: "docling", version: "2.124.0" },
      extractedAt: EXTRACTED_AT,
      status: "skipped",
      durationMs: 0,
      skip: { code: "resource-bound" },
    });
    expect(parsed.status).toBe("skipped");
  });
});
