import { describe, expect, it, vi } from "vitest";

import {
  createWebMcpTools,
  registerWebMcpTools,
  type WebMcpModelContext,
} from "./webmcp";

describe("WebMCP civic tools", () => {
  it("registers the four read-only public tools with an abort signal", async () => {
    const registered: Array<{
      name: string;
      annotations?: { readOnlyHint?: boolean };
    }> = [];
    const signals: Array<AbortSignal | undefined> = [];
    const modelContext: WebMcpModelContext = {
      registerTool: async (tool, options) => {
        registered.push(tool);
        signals.push(options?.signal);
      },
    };
    const controller = new AbortController();

    await registerWebMcpTools(
      modelContext,
      { navigate: vi.fn(), fetchImpl: vi.fn() as unknown as typeof fetch },
      controller.signal,
    );

    expect(registered.map((tool) => tool.name)).toEqual([
      "search_civic_documents",
      "filter_public_contracts",
      "explore_pnrr_projects",
      "inspect_civic_record",
    ]);
    expect(registered.every((tool) => tool.annotations?.readOnlyHint)).toBe(true);
    expect(signals.every((signal) => signal === controller.signal)).toBe(true);
  });

  it("filters contracts through the public API and navigates to the matching civic route", async () => {
    const navigate = vi.fn();
    const payload = {
      data: [{ id: 17, cig: "B123", title: "Manutenzione scuole" }],
      pagination: { page: 1, pageSize: 5, total: 1, totalPages: 1 },
    };
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => payload,
    }) as unknown as typeof fetch;
    const tool = createWebMcpTools({ navigate, fetchImpl }).find(
      (candidate) => candidate.name === "filter_public_contracts",
    );

    expect(tool).toBeDefined();
    const rawResult = await tool!.execute({
      q: "scuole",
      minAmount: 100000,
      from: "2026-01-01",
    });

    const requestUrl = String(vi.mocked(fetchImpl).mock.calls[0]?.[0]);
    expect(requestUrl).toContain("/api/public/v1/contracts?");
    expect(requestUrl).toContain("q=scuole");
    expect(requestUrl).toContain("minAmount=100000");
    expect(requestUrl).toContain("from=2026-01-01");
    expect(requestUrl).toContain("pageSize=5");
    expect(navigate).toHaveBeenCalledWith(
      "/contratti?q=scuole&minAmount=100000&from=2026-01-01",
    );

    const result = JSON.parse(String(rawResult));
    expect(result.ok).toBe(true);
    expect(result.tool).toBe("filter_public_contracts");
    expect(result.result).toEqual(payload);
  });
});
