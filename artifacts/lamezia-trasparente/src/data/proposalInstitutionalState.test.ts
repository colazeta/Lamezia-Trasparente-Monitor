import { describe, expect, it } from "vitest";

import { PUBLIC_PROPOSALS } from "./propostePubbliche";
import type { PublicProposal, ProposalEventType } from "./propostePubblicheCore";
import {
  PROPOSAL_EVIDENCE_ROLES,
  PROPOSAL_IMPLEMENTATION_EVIDENCE,
  PROPOSAL_PUBLIC_STATES,
  getAvailablePublicInstitutionalStates,
  getProposalInstitutionalEvidence,
  getProposalInstitutionalState,
  proposalMatchesPublicInstitutionalState,
} from "./proposalInstitutionalState";

const byId = (id: string) => {
  const proposal = PUBLIC_PROPOSALS.find((item) => item.id === id);
  if (!proposal) throw new Error(`Missing fixture ${id}`);
  return proposal;
};

describe("proposal institutional state", () => {
  it("derives one compact public state for every published proposal", () => {
    for (const proposal of PUBLIC_PROPOSALS) {
      const state = getProposalInstitutionalState(proposal);
      expect(PROPOSAL_PUBLIC_STATES).toContain(state.publicState);
      expect(state.progressStage).toBeTruthy();
      expect(state.technicalStatus).toBe(proposal.status);
    }
  });

  it("keeps the citizen state simpler than the backend trajectory", () => {
    expect(
      getProposalInstitutionalState(
        byId("piazza-italia-sicurezza-prevenzione-2026"),
      ).publicState,
    ).toBe("segnalata");

    expect(
      getProposalInstitutionalState(
        byId("asili-nido-continuita-servizio-2026"),
      ).publicState,
    ).toBe("presentata");

    expect(
      getProposalInstitutionalState(
        byId("politiche-sociali-progetto-vita-2026"),
      ).publicState,
    ).toBe("con_seguito");
  });

  it("does not treat the launch of a petition as verified formal submission", () => {
    const petition = byId("scuole-posticipo-apertura-petizione-2026");
    const state = getProposalInstitutionalState(petition);

    expect(petition.status).toBe("proposta_emersa");
    expect(petition.events.some((event) => event.type === "petizione")).toBe(true);
    expect(petition.events.some((event) => event.type === "deposito")).toBe(false);
    expect(state.progressStage).toBe("emersa");
    expect(state.hasFormalization).toBe(false);
    expect(state.publicState).toBe("segnalata");
  });

  it("never infers implementation from reception alone", () => {
    expect(Object.keys(PROPOSAL_IMPLEMENTATION_EVIDENCE)).toHaveLength(0);

    const source = byId("piazza-italia-sicurezza-prevenzione-2026");
    const synthetic: PublicProposal = {
      ...source,
      id: "synthetic-received-proposal",
      status: "recepita_parzialmente",
      events: [
        ...source.events,
        {
          id: "synthetic-reception",
          date: "2026-09-01",
          type: "recepimento",
          title: "Recepimento documentato",
          summary: "Evento sintetico usato esclusivamente per il test.",
          sourceLabel: "Fixture",
          evidenceLevel: "fonte_ufficiale",
        },
      ],
    };

    const state = getProposalInstitutionalState(synthetic);
    expect(state.progressStage).toBe("recepita");
    expect(state.implementation).toBe("none");
    expect(state.publicState).toBe("con_seguito");
  });

  it("only exposes public filter states that are actually used", () => {
    const available = getAvailablePublicInstitutionalStates(PUBLIC_PROPOSALS);
    expect(available.length).toBeGreaterThan(0);
    expect(available.every((state) => PROPOSAL_PUBLIC_STATES.includes(state))).toBe(
      true,
    );
    expect(available).not.toContain("in_attuazione");
  });

  it("filters against the compact public state rather than the technical status", () => {
    const proposal = byId("politiche-sociali-progetto-vita-2026");
    expect(proposalMatchesPublicInstitutionalState(proposal, "con_seguito")).toBe(
      true,
    );
    expect(proposalMatchesPublicInstitutionalState(proposal, "presentata")).toBe(
      false,
    );
  });

  it("normalizes every event type to an evidence role for audit", () => {
    const source = byId("piazza-italia-sicurezza-prevenzione-2026");
    const eventTypes: ProposalEventType[] = [
      "emersione",
      "deposito",
      "petizione",
      "calendarizzazione",
      "discussione",
      "risposta_istituzionale",
      "recepimento",
      "aggiornamento",
    ];

    const synthetic: PublicProposal = {
      ...source,
      id: "synthetic-evidence-roles",
      linkedActs: ["Atto sintetico"],
      events: eventTypes.map((type, index) => ({
        id: `event-${type}`,
        date: `2026-08-${String(index + 1).padStart(2, "0")}`,
        type,
        title: type,
        summary: "Evento sintetico usato esclusivamente per il test.",
        sourceLabel: "Fixture",
        evidenceLevel: "fonte_ufficiale",
      })),
    };

    const roles = new Set(
      getProposalInstitutionalEvidence(synthetic).map((item) => item.role),
    );
    for (const role of PROPOSAL_EVIDENCE_ROLES) {
      expect(roles.has(role), role).toBe(true);
    }
  });
});
