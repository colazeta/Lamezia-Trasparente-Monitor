import { describe, expect, it } from "vitest";

import { PUBLIC_PROPOSALS } from "./propostePubbliche";

const ASILI_ID = "asili-nido-continuita-servizio-2026";

describe("incremental proposal scouting updates", () => {
  it("updates the existing asili proposal without creating a duplicate", () => {
    const matches = PUBLIC_PROPOSALS.filter((proposal) => proposal.id === ASILI_ID);
    expect(matches).toHaveLength(1);

    const proposal = matches[0];
    expect(proposal.lastUpdated).toBe("2026-08-29");
    expect(
      proposal.events.some(
        (event) => event.id === "asili-nido-masi-controreplica-29-agosto",
      ),
    ).toBe(true);
  });

  it("links the official Albo records used to verify the asili timeline", () => {
    const proposal = PUBLIC_PROPOSALS.find((item) => item.id === ASILI_ID);
    expect(proposal).toBeDefined();
    expect(
      proposal?.linkedActs.some((act) => act.includes("2026/2689")),
    ).toBe(true);
    expect(
      proposal?.linkedActs.some((act) => act.includes("2026/2719")),
    ).toBe(true);
    expect(
      proposal?.linkedActs.some((act) => act.includes("2026/2759")),
    ).toBe(true);
  });
});
