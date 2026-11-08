import { describe, expect, it, vi } from "vitest";

import {
  webMcpExecutionReducer,
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
    expect(registered.every((tool) => tool.annotations?.readOnlyHint)).toBe(
      true,
    );
    expect(signals.every((signal) => signal === controller.signal)).toBe(true);
  });

  it("filters contracts through the public API and navigates to the matching civic route", async () => {
    const navigate = vi.fn();
    const payload = {
      data: [{ id: 17, cig: "B123", title: "Manutenzione scuole" }],
      pagination: { page: 1, pageSize: 5, total: 1, totalPages: 1 },
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => payload,
    });
    const fetchImpl = fetchMock as unknown as typeof fetch;
    const tool = createWebMcpTools({ navigate, fetchImpl }).find(
      (candidate) => candidate.name === "filter_public_contracts",
    );

    expect(tool).toBeDefined();
    const rawResult = await tool!.execute({
      q: "scuole",
      minAmount: 100000,
      from: "2026-01-01",
    });

    const requestUrl = String(fetchMock.mock.calls[0]?.[0]);
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

// Deferred responses exercise the ordering rather than relying on timer delays.
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
const response = (result: unknown) =>
  ({ ok: true, json: async () => result }) as Response;

describe("WebMCP execution ownership", () => {
  it("returns both results but lets only the latest-started request navigate", async () => {
    const first = deferred<Response>();
    const second = deferred<Response>();
    const navigate = vi.fn();
    const onActivity = vi.fn();
    const onExecutionState = vi.fn();
    const fetchImpl = vi
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const tools = createWebMcpTools({
      navigate,
      onActivity,
      onExecutionState,
      fetchImpl,
    });
    const oldCall = tools[0].execute({ q: "old" });
    const newCall = tools[1].execute({ q: "new" });
    second.resolve(response({ data: [] }));
    expect(JSON.parse(String(await newCall)).uiApplied).toBe(true);
    first.resolve(response({ data: [{ id: "old" }] }));
    const oldResult = JSON.parse(String(await oldCall));
    expect(oldResult.uiApplied).toBe(false);
    expect(oldResult.result.data).toEqual([{ id: "old" }]);
    expect(navigate.mock.calls).toEqual([["/contratti?q=new"]]);
    expect(onActivity).toHaveBeenCalledTimes(1);
    expect(onActivity.mock.calls[0][0].resultCount).toBe(0);
    expect(onExecutionState.mock.calls.map(([state]) => state.status)).toEqual([
      "running",
      "running",
      "succeeded",
    ]);
  });

  it("does not allow an older success to take over after a newer failure", async () => {
    const pending = deferred<Response>();
    const navigate = vi.fn();
    const onExecutionState = vi.fn();
    const tools = createWebMcpTools({
      navigate,
      onExecutionState,
      fetchImpl: vi
        .fn()
        .mockReturnValueOnce(pending.promise)
        .mockRejectedValueOnce(new Error("offline")),
    });
    const older = tools[0].execute({});
    await expect(tools[1].execute({})).rejects.toThrow("offline");
    pending.resolve(response({ data: [] }));
    await older;
    expect(navigate).not.toHaveBeenCalled();
    expect(onExecutionState.mock.calls.at(-1)?.[0].status).toBe("failed");
  });

  it("aborts requests and suppresses late activity after bridge cleanup", async () => {
    const pending = deferred<Response>();
    const controller = new AbortController();
    const navigate = vi.fn();
    const onActivity = vi.fn();
    const fetchImpl = vi.fn().mockReturnValue(pending.promise);
    const tools = createWebMcpTools({
      navigate,
      onActivity,
      fetchImpl,
      signal: controller.signal,
    });
    const call = tools[0].execute({});
    expect(fetchImpl.mock.calls[0][1].signal).toBe(controller.signal);
    controller.abort();
    pending.resolve(response({ data: [] }));
    await expect(call).rejects.toMatchObject({ name: "AbortError" });
    expect(navigate).not.toHaveBeenCalled();
    expect(onActivity).not.toHaveBeenCalled();
    await expect(tools[0].execute({})).rejects.toMatchObject({
      name: "AbortError",
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("reports API errors without navigation or a success activity", async () => {
    const navigate = vi.fn();
    const onActivity = vi.fn();
    const onExecutionState = vi.fn();
    const tool = createWebMcpTools({
      navigate,
      onActivity,
      onExecutionState,
      fetchImpl: vi.fn().mockResolvedValue({ ok: false, status: 503 }),
    })[0];
    await expect(tool.execute({})).rejects.toThrow("503");
    expect(navigate).not.toHaveBeenCalled();
    expect(onActivity).not.toHaveBeenCalled();
    expect(onExecutionState.mock.calls.map(([state]) => state.status)).toEqual([
      "running",
      "failed",
    ]);
  });
});

describe("WebMCP activity state transitions", () => {
  it("keeps dismissal terminal for that request and allows the next request", () => {
    const running = {
      status: "running",
      requestId: 1,
      tool: "search",
      label: "Search",
    } as const;
    const dismissed = webMcpExecutionReducer(running, { status: "dismiss" });
    expect(dismissed.status).toBe("dismissed");
    expect(
      webMcpExecutionReducer(dismissed, {
        status: "failed",
        requestId: 1,
        tool: "search",
        label: "Search",
      }),
    ).toBe(dismissed);
    const next = { ...running, requestId: 2 };
    expect(webMcpExecutionReducer(dismissed, next)).toEqual(next);
    expect(
      webMcpExecutionReducer(next, {
        status: "failed",
        requestId: 1,
        tool: "search",
        label: "Search",
      }),
    ).toBe(next);
  });
});

describe("WebMCP record evidence", () => {
  it("links numeric contract IDs in the activity preview", async () => {
    const onActivity = vi.fn();
    await createWebMcpTools({
      navigate: vi.fn(),
      onActivity,
      fetchImpl: vi
        .fn()
        .mockResolvedValue(response({ data: [{ id: 17, title: "Scuole" }] })),
    })[1].execute({});
    expect(onActivity.mock.calls[0][0].items).toEqual([
      { label: "Scuole", href: "/contratti/17" },
    ]);
  });

  it.each([[], [{ cup: "OTHER", title: "Other project" }]])(
    "does not invent a PNRR detail when CUP is absent: %j",
    async (projects) => {
      const navigate = vi.fn();
      const onActivity = vi.fn();
      const tool = createWebMcpTools({
        navigate,
        onActivity,
        fetchImpl: vi.fn().mockResolvedValue(response({ projects })),
      })[3];
      await expect(
        tool.execute({ resource: "pnrr", id: "A123" }),
      ).rejects.toThrow("not found");
      expect(navigate).not.toHaveBeenCalled();
      expect(onActivity).not.toHaveBeenCalled();
    },
  );

  it("opens an exactly matched PNRR CUP", async () => {
    const navigate = vi.fn();
    const tool = createWebMcpTools({
      navigate,
      fetchImpl: vi
        .fn()
        .mockResolvedValue(response({ projects: [{ cup: "A123" }] })),
    })[3];
    await tool.execute({ resource: "pnrr", id: "a123" });
    expect(navigate).toHaveBeenCalledWith("/pnrr/A123");
  });
});
