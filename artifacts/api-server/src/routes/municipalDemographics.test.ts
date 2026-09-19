import { describe, it, expect, vi } from "vitest";
import express from "express";
import request from "supertest";
import { createMunicipalDemographicsRouter } from "./municipalDemographics";
import {
  readMunicipalDemographicSnapshot,
  MunicipalReadModelError,
} from "@workspace/db/municipal-demographics";
vi.mock("@workspace/db/municipal-demographics", async (original) => ({
  ...(await original<typeof import("@workspace/db/municipal-demographics")>()),
  readMunicipalDemographicSnapshot: vi.fn(),
}));
const app = () =>
  express().use(
    "/api",
    createMunicipalDemographicsRouter({ query: vi.fn() } as any),
  );
describe("municipal read-only public route", () => {
  it("returns a canonical snapshot with a pinned download", async () => {
    vi.mocked(readMunicipalDemographicSnapshot).mockResolvedValue({
      schema_version: 1,
      metadata: {},
      provenance: { canonical: true, release_hash: "a".repeat(64) },
    } as any);
    const r = await request(app()).get(
      `/api/demographics/municipal/population?release=${"a".repeat(64)}&download=1`,
    );
    expect(r.status).toBe(200);
    expect(r.headers["content-disposition"]).toContain("attachment");
    expect(r.headers["cache-control"]).toBe("no-cache");
    expect(
      vi.mocked(readMunicipalDemographicSnapshot).mock.lastCall?.slice(1),
    ).toEqual(["population", "a".repeat(64)]);
  });
  for (const [code, status] of [
    ["INVALID_KEY", 404],
    ["INVALID_RELEASE", 400],
    ["CANONICAL_DATA_UNAVAILABLE", 503],
    ["CANONICAL_RECONCILIATION_FAILED", 503],
  ] as const)
    it(`${code} returns ${status} without fabricated values`, async () => {
      vi.mocked(readMunicipalDemographicSnapshot).mockRejectedValue(
        new MunicipalReadModelError(code),
      );
      const r = await request(app()).get(
        "/api/demographics/municipal/population",
      );
      expect(r.status).toBe(status);
      expect(r.body).toEqual({ error: code });
      expect(r.headers["cache-control"]).toBe("no-store");
    });
  it("redacts database errors", async () => {
    vi.mocked(readMunicipalDemographicSnapshot).mockRejectedValue(
      new Error("postgres://password@private"),
    );
    const r = await request(app()).get(
      "/api/demographics/municipal/population",
    );
    expect(r.status).toBe(503);
    expect(r.text).not.toMatch(/password|postgres|private/);
  });
  it("rejects repeated query parameters", async () => {
    vi.mocked(readMunicipalDemographicSnapshot).mockClear();
    const r = await request(app()).get(
      "/api/demographics/municipal/population?release=a&release=b",
    );
    expect(r.status).toBe(400);
    expect(readMunicipalDemographicSnapshot).not.toHaveBeenCalled();
  });
});

vi.mock("@workspace/db/household-composition", () => ({
  readHouseholdComposition: vi.fn(),
}));
import { readHouseholdComposition } from "@workspace/db/household-composition";
describe("independent canonical ISTAT household route", () => {
  it("serves and pins a census without requiring annual P02 data", async () => {
    vi.mocked(readHouseholdComposition).mockResolvedValue({
      provenance: { canonical: true, release_hash: "b".repeat(64) },
    } as any);
    const result = await request(app()).get(
      `/api/demographics/household-composition-2023?release=${"b".repeat(64)}&download=1`,
    );
    expect(result.status).toBe(200);
    expect(result.headers["cache-control"]).toBe("no-cache");
    expect(result.headers["content-disposition"]).toContain(
      "lamezia-famiglie-componenti-2023.json",
    );
    expect(vi.mocked(readHouseholdComposition).mock.lastCall?.slice(1)).toEqual(
      ["b".repeat(64)],
    );
  });
  for (const code of [
    "CANONICAL_DATA_UNAVAILABLE",
    "CANONICAL_RECONCILIATION_FAILED",
    "INVALID_RELEASE",
  ] as const) {
    it(`returns ${code} without a bundled substitute`, async () => {
      vi.mocked(readHouseholdComposition).mockRejectedValue(
        new MunicipalReadModelError(code),
      );
      const result = await request(app()).get(
        "/api/demographics/household-composition-2023",
      );
      expect(result.status).toBe(code === "INVALID_RELEASE" ? 400 : 503);
      expect(result.body).toEqual({ error: code });
      expect(result.headers["cache-control"]).toBe("no-store");
    });
  }
  it("rejects ambiguous query parameters without querying", async () => {
    vi.mocked(readHouseholdComposition).mockClear();
    expect(
      (
        await request(app()).get(
          "/api/demographics/household-composition-2023?release=a&release=b",
        )
      ).status,
    ).toBe(400);
    expect(readHouseholdComposition).not.toHaveBeenCalled();
  });
  it("redacts unexpected database errors", async () => {
    vi.mocked(readHouseholdComposition).mockRejectedValue(
      new Error("postgres://password@private"),
    );
    const result = await request(app()).get(
      "/api/demographics/household-composition-2023",
    );
    expect(result.status).toBe(503);
    expect(result.text).not.toMatch(/password|postgres|private/);
  });
});
