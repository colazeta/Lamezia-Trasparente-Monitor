import { describe, expect, it } from "vitest";

import { PUBLIC_PROPOSALS } from "./propostePubbliche";

const ASILI_ID = "asili-nido-continuita-servizio-2026";
const GRANDINETTI_ID = "ex-cinema-grandinetti-bonifica-2026";
const PROGETTO_VITA_ID = "politiche-sociali-progetto-vita-2026";

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

  it("keeps the Grandinetti development in the existing proposal timeline", () => {
    const matches = PUBLIC_PROPOSALS.filter(
      (proposal) => proposal.id === GRANDINETTI_ID,
    );
    expect(matches).toHaveLength(1);
    expect(matches[0].status).toBe("recepita_parzialmente");
    expect(matches[0].lastUpdated).toBe("2026-08-18");
    expect(
      matches[0].events.some(
        (event) => event.id === "grandinetti-mozione-approvata-13-agosto",
      ),
    ).toBe(true);
    expect(
      matches[0].events.some(
        (event) => event.id === "grandinetti-sicurezza-risorse-18-agosto",
      ),
    ).toBe(true);
  });

  it("records the official Progetti di Vita update without inferring formal reception", () => {
    const matches = PUBLIC_PROPOSALS.filter(
      (proposal) => proposal.id === PROGETTO_VITA_ID,
    );
    expect(matches).toHaveLength(1);
    expect(matches[0].lastUpdated).toBe("2026-08-14");
    expect(
      matches[0].events.some(
        (event) =>
          event.id === "progetto-vita-informativa-amministrazione-14-agosto" &&
          event.type === "risposta_istituzionale" &&
          event.evidenceLevel === "fonte_ufficiale",
      ),
    ).toBe(true);
  });

  it("adds the two 31 August proposals once", () => {
    expect(
      PUBLIC_PROPOSALS.filter(
        (proposal) => proposal.id === "scuole-orario-ridotto-caldo-settembre-2026",
      ),
    ).toHaveLength(1);
    expect(
      PUBLIC_PROPOSALS.filter(
        (proposal) =>
          proposal.id === "tutela-animali-regolamento-garante-sportello-2026",
      ),
    ).toHaveLength(1);
  });
});
