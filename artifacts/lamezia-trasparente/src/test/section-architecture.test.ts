import { describe, expect, it } from "vitest";

import { PUBLIC_INDEXABLE_PATHS } from "../data/publicRoutes";
import {
  SECTION_ARCHITECTURES,
  assertEveryPublicSectionHasSafeguards,
  getSectionArchitecture,
} from "../data/sectionArchitecture";

describe("section architecture registry", () => {
  it("covers every static public indexable route", () => {
    const architecturePaths = SECTION_ARCHITECTURES.map(
      (section) => section.path,
    );

    expect(new Set(architecturePaths).size).toBe(architecturePaths.length);
    expect(architecturePaths).toEqual(
      expect.arrayContaining(PUBLIC_INDEXABLE_PATHS),
    );
  });

  it("keeps civic safeguards populated for each public section", () => {
    expect(assertEveryPublicSectionHasSafeguards()).toBe(true);

    for (const section of SECTION_ARCHITECTURES) {
      expect(section.helpsUnderstand.length).toBeGreaterThan(0);
      expect(section.filters.length).toBeGreaterThan(0);
      expect(section.primaryContent.trim()).not.toBe("");
      expect(section.auditNotes.structuralWeaknesses.trim()).not.toBe("");
    }
  });

  it("marks demo routes and demo modules explicitly", () => {
    expect(
      getSectionArchitecture("/convocazioni/demo-consiglio-comunale-v0")
        ?.dataReadiness.dataStatus,
    ).toBe("demo");
    expect(getSectionArchitecture("/promessometro")?.status).toBe("demo");
    expect(getSectionArchitecture("/macchina-comunale")?.status).toBe("demo");
  });

  it("does not claim verified public data without verified source metadata", () => {
    const verifiedClaims = SECTION_ARCHITECTURES.filter(
      (section) =>
        section.status === "verified" ||
        section.dataReadiness.dataStatus === "verified",
    );

    expect(verifiedClaims).toEqual([]);
  });
});
