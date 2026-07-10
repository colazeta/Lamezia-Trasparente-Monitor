import { afterEach, describe, expect, it, vi } from "vitest";

const setBaseUrlMock = vi.hoisted(() => vi.fn());

vi.mock("@workspace/api-client-react", () => ({
  setBaseUrl: setBaseUrlMock,
}));

import {
  absoluteApiUrl,
  apiFetch,
  apiUrl,
  configureGeneratedApiClient,
  normalizeApiBaseUrl,
  readConfiguredApiBaseUrl,
} from "@/lib/apiBaseUrl";

describe("configurable API origin", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    setBaseUrlMock.mockClear();
  });

  it.each([undefined, null, "", "   ", "/"])(
    "keeps same-origin mode for %s",
    (value) => {
      expect(normalizeApiBaseUrl(value)).toBeNull();
    },
  );

  it("normalizes absolute origins and reverse-proxy prefixes", () => {
    expect(normalizeApiBaseUrl(" https://API.example.test/root/// ")).toBe(
      "https://api.example.test/root",
    );
    expect(normalizeApiBaseUrl("http://localhost:5000/")).toBe(
      "http://localhost:5000",
    );
    expect(normalizeApiBaseUrl("/backend///")).toBe("/backend");
  });

  it.each([
    "api.example.test",
    "//api.example.test",
    "ftp://api.example.test",
    "https://user:secret@api.example.test",
    "https://api.example.test?token=secret",
    "https://api.example.test#fragment",
    "/backend?token=secret",
  ])("rejects unsafe or ambiguous configuration %s", (value) => {
    expect(() => normalizeApiBaseUrl(value)).toThrow(/VITE_API_BASE_URL/);
  });

  it("falls back to same-origin mode without breaking the public app", () => {
    const reportInvalid = vi.fn();

    expect(
      readConfiguredApiBaseUrl(
        "https://user:secret@api.example.test",
        reportInvalid,
      ),
    ).toBeNull();
    expect(reportInvalid).toHaveBeenCalledOnce();
    expect(reportInvalid.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it("resolves API paths for split and same-origin deployments", () => {
    expect(apiUrl("/api/healthz", null)).toBe("/api/healthz");
    expect(apiUrl("api/healthz", "https://api.example.test")).toBe(
      "https://api.example.test/api/healthz",
    );
    expect(apiUrl("/api/healthz", "/backend")).toBe("/backend/api/healthz");
    expect(apiUrl("https://data.example.test/file.json", null)).toBe(
      "https://data.example.test/file.json",
    );
  });

  it("produces copyable absolute URLs for the developer hub", () => {
    expect(absoluteApiUrl("/api/public/v1", null)).toBe(
      `${window.location.origin}/api/public/v1`,
    );
    expect(absoluteApiUrl("/api/public/v1", "https://api.example.test")).toBe(
      "https://api.example.test/api/public/v1",
    );
  });

  it("configures the generated API client with the normalized origin", () => {
    configureGeneratedApiClient("https://api.example.test");
    expect(setBaseUrlMock).toHaveBeenCalledWith("https://api.example.test");

    configureGeneratedApiClient(null);
    expect(setBaseUrlMock).toHaveBeenLastCalledWith(null);
  });

  it("routes manual API fetches through the shared resolver", async () => {
    const response = new Response(null, { status: 204 });
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/api/healthz", {
      headers: { Accept: "application/json" },
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/healthz", {
      headers: { Accept: "application/json" },
    });
  });
});
