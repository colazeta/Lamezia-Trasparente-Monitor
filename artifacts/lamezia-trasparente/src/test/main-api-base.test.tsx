import { beforeEach, describe, expect, it, vi } from "vitest";

const configureGeneratedApiClient = vi.hoisted(() => vi.fn());
const render = vi.hoisted(() => vi.fn());

vi.mock("@/lib/apiBaseUrl", () => ({ configureGeneratedApiClient }));
vi.mock("@/App", () => ({ default: () => null }));
vi.mock("react-dom/client", () => ({
  createRoot: () => ({ render }),
}));

describe("web API bootstrap", () => {
  beforeEach(() => {
    vi.resetModules();
    configureGeneratedApiClient.mockClear();
    render.mockClear();
    document.body.innerHTML = '<div id="root"></div>';
  });

  it("configures the API client before rendering the application", async () => {
    await import("@/main");

    expect(configureGeneratedApiClient).toHaveBeenCalledTimes(1);
    expect(render).toHaveBeenCalledTimes(1);
    expect(
      configureGeneratedApiClient.mock.invocationCallOrder[0],
    ).toBeLessThan(render.mock.invocationCallOrder[0]);
  });
});
