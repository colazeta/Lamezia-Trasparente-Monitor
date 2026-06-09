import { describe, expect, it } from "vitest";

import {
  areCivicSlugsUnique,
  buildCivicSlugMap,
  DEFAULT_CIVIC_SLUG_FALLBACK,
  normalizeCivicSlug,
} from "@/lib/civicSlugs";

describe("normalizeCivicSlug", () => {
  it("normalizes Italian accents and uppercase technical labels", () => {
    expect(normalizeCivicSlug("Legalità e Trasparenza"))
      .toBe("legalita-e-trasparenza");
    expect(normalizeCivicSlug("Città_Unità_Qualità"))
      .toBe("citta-unita-qualita");
  });

  it("normalizes spaces, underscores and repeated dashes to a single separator", () => {
    expect(normalizeCivicSlug("  FOIA__Machine -- Demo   V0  "))
      .toBe("foia-machine-demo-v0");
  });

  it("removes unsupported characters without producing empty segments", () => {
    expect(normalizeCivicSlug("Modulo civico: stato/check + beta!"))
      .toBe("modulo-civico-stato-check-beta");
  });

  it("returns a safe deterministic fallback for empty or symbol-only input", () => {
    expect(normalizeCivicSlug("")).toBe(DEFAULT_CIVIC_SLUG_FALLBACK);
    expect(normalizeCivicSlug(" %%% -- *** ")).toBe(DEFAULT_CIVIC_SLUG_FALLBACK);
    expect(normalizeCivicSlug("***", "Segnale Demo")).toBe("segnale-demo");
  });
});

describe("areCivicSlugsUnique", () => {
  it("returns true when normalized demo-record slugs are unique", () => {
    const records = [
      { slug: "Promessometro Demo", label: "Record A" },
      { slug: "Foia_Machine_Demo", label: "Record B" },
      { slug: "legalita-timeline-demo", label: "Record C" },
    ];

    expect(areCivicSlugsUnique(records)).toBe(true);
  });

  it("returns false when dirty technical slugs collide after normalization", () => {
    const records = [
      { slug: "Legalità Timeline Demo" },
      { slug: "legalita--timeline_demo" },
    ];

    expect(areCivicSlugsUnique(records)).toBe(false);
  });
});

describe("buildCivicSlugMap", () => {
  it("builds a stable slug-to-record map in input order", () => {
    const records = [
      { slug: "Primo Modulo", order: 1 },
      { slug: "Secondo_Modulo", order: 2 },
      { slug: "Terzo---Modulo", order: 3 },
    ];

    const bySlug = buildCivicSlugMap(records);

    expect([...bySlug.keys()]).toEqual([
      "primo-modulo",
      "secondo-modulo",
      "terzo-modulo",
    ]);
    expect(bySlug.get("secondo-modulo")).toBe(records[1]);
  });

  it("fails deterministically when duplicate normalized slugs are present", () => {
    const records = [
      { slug: "Beni Confiscati Demo" },
      { slug: "beni_confiscati---demo" },
    ];

    expect(() => buildCivicSlugMap(records))
      .toThrow("Duplicate civic slug: beni-confiscati-demo");
  });
});
