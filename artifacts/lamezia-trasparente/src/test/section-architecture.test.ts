import { describe, expect, it } from "vitest";

import { PUBLIC_INDEXABLE_PATHS } from "../data/publicRoutes";
import {
  PRIORITY_PAGE_PATHS,
  SECTION_ARCHITECTURES,
  assertEveryPublicSectionHasSafeguards,
  getPriorityPageArchitectures,
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
      expect(section.pageImplementation.primaryDataObject.trim()).not.toBe("");
      expect(section.pageImplementation.sourceStatusPlacement).toMatch(
        /fonte/i,
      );
    }
  });

  it("defines page-level implementation blueprints for every priority page", () => {
    const priority = getPriorityPageArchitectures();

    expect(priority.map((section) => section.path)).toEqual(
      expect.arrayContaining([...PRIORITY_PAGE_PATHS]),
    );
    expect(priority).toHaveLength(PRIORITY_PAGE_PATHS.length);

    for (const section of priority) {
      const blueprint = section.pageImplementation;

      expect(blueprint.isPriorityPage).toBe(true);
      expect(blueprint.primaryDataObject.trim()).not.toBe("");
      expect(blueprint.contentHierarchy.length).toBeGreaterThanOrEqual(3);
      expect(blueprint.sourceStatusPlacement).toMatch(/fonte/i);
      expect(blueprint.sourceStatusPlacement).toMatch(/stato|limit/i);
      expect(blueprint.usefulControls.length).toBeGreaterThan(0);
      expect(blueprint.citizenAction.trim()).not.toBe("");
      expect(blueprint.remainingDataDependency.trim()).not.toBe("");
      expect(blueprint.launchPosture.trim()).not.toBe("");
      expect(blueprint.furtherWorkBeforeLaunch.trim()).not.toBe("");
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
