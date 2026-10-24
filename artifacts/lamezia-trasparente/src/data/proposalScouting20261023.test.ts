import { describe, expect, it } from "vitest";
import {
  PUBLIC_PROPOSALS,
  getCanonicalProposalPresentation,
  getCanonicalProposalPresentationIds,
  getProposalPrimaryPaSubject,
  getProposalSecondaryPaSubjects,
  getAllPaPublicServiceSubjects,
} from "./propostePubbliche";
import { getProposalGeography, isProposalGeoreferenced } from "./proposalGeography";

const id = "stadi-renda-riga-regolarizzazione-apertura-pubblico-2026";

describe("scouting stadi Renda e Riga — 23 October 2026", () => {
  it("keeps a unique source-backed candidate without inventing formal filing", () => {
    const matches = PUBLIC_PROPOSALS.filter((proposal) => proposal.id === id);
    expect(matches).toHaveLength(1);
    const item = matches[0]!;
    expect(item.status).toBe("proposta_emersa");
    expect(item.channel).toBe("interrogazione");
    expect(item.institutionalRecipient).toBeTruthy();
    expect(item.evidenceLevel).toBe("fonte_stampa");
    expect(item.linkedActs).toHaveLength(0);
    expect(item.events.map((event) => event.type)).toEqual(["emersione"]);
    expect(item.sourceUrl).toContain("lametino.it");
  });

  it("uses one official primary subject with a separate secondary", () => {
    const proposal = PUBLIC_PROPOSALS.find((entry) => entry.id === id)!;
    expect(getAllPaPublicServiceSubjects()).toHaveLength(15);
    expect(getProposalPrimaryPaSubject(proposal).code).toBe("10");
    expect(getProposalSecondaryPaSubjects(proposal).map((concept) => concept.code)).toEqual(["5"]);
  });

  it("provides canonical copy and non-georeferenced two-area geography", () => {
    const proposal = PUBLIC_PROPOSALS.find((entry) => entry.id === id)!;
    const presentation = getCanonicalProposalPresentation(proposal);
    expect(getCanonicalProposalPresentationIds()).toContain(id);
    expect(presentation.proposalId).toBe(id);
    expect(presentation.measures.length).toBeGreaterThan(2);
    const geography = getProposalGeography(id)!;
    expect(geography.scope).toBe("area");
    expect(geography.areas).toEqual(["sambiase", "sant_eufemia"]);
    expect(geography.points).toEqual([]);
    expect(isProposalGeoreferenced(id)).toBe(false);
  });
});
