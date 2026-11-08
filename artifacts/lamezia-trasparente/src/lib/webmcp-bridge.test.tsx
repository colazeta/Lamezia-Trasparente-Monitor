import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WebMcpBridge, type WebMcpModelContext } from "./webmcp";

afterEach(() => {
  delete (document as Document & { modelContext?: WebMcpModelContext })
    .modelContext;
  vi.unstubAllGlobals();
});

function setup() {
  const tools: Parameters<WebMcpModelContext["registerTool"]>[0][] = [];
  Object.defineProperty(document, "modelContext", {
    configurable: true,
    value: {
      registerTool: (tool: (typeof tools)[number]) => {
        tools.push(tool);
      },
    },
  });
  const view = render(<WebMcpBridge />);
  return { tools, ...view };
}

describe("WebMCP visible lifecycle", () => {
  it("shows pending and safe failure feedback without exposing the exception", async () => {
    let reject!: (error: Error) => void;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(
        new Promise((_, no) => {
          reject = no;
        }),
      ),
    );
    const { tools } = setup();
    await waitFor(() => expect(tools).toHaveLength(4));
    let call!: Promise<unknown>;
    act(() => {
      call = tools[0].execute({});
    });
    expect(screen.getByRole("status")).toHaveTextContent("in corso");
    await act(async () => {
      reject(new Error("private transport details"));
      await expect(call).rejects.toThrow("private transport details");
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Richiesta non completata",
    );
    expect(screen.queryByText(/private transport/)).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Chiudi avviso WebMCP" }),
    );
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });

  it("does not reopen a dismissed pending panel on completion", async () => {
    let resolve!: (response: Response) => void;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(
        new Promise<Response>((yes) => {
          resolve = yes;
        }),
      ),
    );
    const { tools } = setup();
    let call!: Promise<unknown>;
    act(() => {
      call = tools[0].execute({});
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Chiudi avviso WebMCP" }),
    );
    await act(async () => {
      resolve({ ok: true, json: async () => ({ data: [] }) } as Response);
      await call;
    });
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });
});
