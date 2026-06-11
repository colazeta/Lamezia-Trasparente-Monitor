import { describe, expect, it } from "vitest";
import type { Seduta } from "@workspace/api-client-react";

import {
  getSedutaCoverageFlags,
  matchesCoverageFilter,
  summarizeConvocazioniCoverage,
  type SedutaPublication,
} from "./convocazioniCoverage";

function seduta(overrides: Partial<Seduta> = {}): Seduta {
  return {
    id: 1,
    type: "consiglio",
    date: "2026-01-15T00:00:00.000Z",
    agenda: null,
    hasReport: false,
    publicationId: 10,
    organo: null,
    macrotema: null,
    odgMacrotemi: [],
    ...overrides,
  };
}

const publication: SedutaPublication = {
  id: 10,
  cups: [],
  isPnrr: false,
  pnrrMission: null,
  odgMacrotemi: [],
};

describe("convocazioni coverage utilities", () => {
  it("summarizes loaded sedute using only available coverage fields", () => {
    const rows = [
      seduta({ agenda: "1. Approvazione verbali", hasReport: true }),
      {
        ...seduta({
          id: 2,
          publicationId: 20,
          odgMacrotemi: ["lavori_pubblici"],
        }),
        votes: [{ vote: "favorevole" }],
        odgPoints: [{ outcomes: [{ type: "delibera", id: 100 }] }],
      },
      {
        ...seduta({ id: 3, publicationId: 30 }),
        odgPoints: [{ outcomes: [{ type: "contract", id: 200 }] }],
      },
    ];
    const publications = new Map<number, SedutaPublication>([
      [10, publication],
      [20, { ...publication, id: 20 }],
      [30, { ...publication, id: 30, isPnrr: true }],
    ]);

    expect(summarizeConvocazioniCoverage(rows, publications)).toEqual({
      total: 3,
      withOdg: 3,
      withReport: 1,
      withVotes: 1,
      withLinkedActs: 1,
      withContractsOrPnrr: 1,
    });
  });

  it("treats publication CUP/PNRR metadata as a contracts-or-PNRR link signal", () => {
    const flags = getSedutaCoverageFlags(seduta(), {
      ...publication,
      cups: ["CUP-DEMO"],
    });

    expect(flags.hasContractsOrPnrr).toBe(true);
  });

  it("matches tri-state coverage filters", () => {
    expect(matchesCoverageFilter(true, "present")).toBe(true);
    expect(matchesCoverageFilter(false, "present")).toBe(false);
    expect(matchesCoverageFilter(false, "missing")).toBe(true);
    expect(matchesCoverageFilter(true, "all")).toBe(true);
  });
});
