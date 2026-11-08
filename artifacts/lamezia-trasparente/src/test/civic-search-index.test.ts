import { describe, expect, it } from "vitest";

import {
  CIVIC_SEARCH_INDEX,
  buildOpenDataArchiveHref,
  searchCivicIndex,
} from "@/lib/civicSearchIndex";

describe("civic search index", () => {
  it("indexes the real static institutional registry and published datasets", () => {
    const kinds = CIVIC_SEARCH_INDEX.reduce<Record<string, number>>(
      (counts, item) => {
        counts[item.kind] = (counts[item.kind] ?? 0) + 1;
        return counts;
      },
      {},
    );

    expect(kinds.persona).toBeGreaterThan(30);
    expect(kinds.organo).toBeGreaterThanOrEqual(10);
    expect(kinds.dataset).toBe(9);
    expect(new Set(CIVIC_SEARCH_INDEX.map((item) => item.id)).size).toBe(
      CIVIC_SEARCH_INDEX.length,
    );
  });

  it("ranks exact profile and dataset matches ahead of generic metadata", () => {
    expect(searchCivicIndex("Paolo Mascaro")[0]).toMatchObject({
      kind: "persona",
      label: "Paolo Mascaro",
    });
    expect(searchCivicIndex("trend demografico")[0]).toMatchObject({
      kind: "dataset",
      label: "Osservatorio demografico - Lamezia Terme",
    });
    expect(searchCivicIndex("famiglie numero componenti")[0]).toMatchObject({
      kind: "dataset",
      label: "Famiglie per numero di componenti 2023 - Lamezia Terme",
    });
  });

  it("matches accent-insensitive civic queries and requires two characters", () => {
    expect(searchCivicIndex("mobilita")[0]).toMatchObject({ kind: "dataset" });
    expect(searchCivicIndex("c")).toEqual([]);
  });

  it("builds a shareable deep-link to the selected OpenData record", () => {
    expect(
      buildOpenDataArchiveHref(
        "population-society",
        "lamezia-demographic-trend",
      ),
    ).toBe(
      "/opendata?tema=population-society&dataset=lamezia-demographic-trend",
    );
  });
  it("finds reviewed sessions by topic without claiming editorial records are official", () => {
    expect(searchCivicIndex("Scordovillo")[0]).toMatchObject({
      kind: "seduta",
      href: "/convocazioni/editorial-consiglio-aperto-scordovillo-2026-11",
      statusLabel: "Stato della seduta non verificato",
    });
    expect(searchCivicIndex("Scordovillo")[0].detail).toContain(
      "Contesto da fonti editoriali",
    );
    expect(
      searchCivicIndex("bilancio").some((item) => item.kind === "seduta"),
    ).toBe(true);
    expect(CIVIC_SEARCH_INDEX.some((item) => item.id.includes("demo-"))).toBe(
      false,
    );
  });
});
