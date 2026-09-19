import { describe, expect, it } from "vitest";

import { getProposalGeography } from "./proposalGeography";
import {
  PUBLIC_PROPOSALS,
  getAllPaPublicServiceSubjects,
  getCanonicalProposalPresentation,
  getProposalInstitutionalCompetence,
  getProposalInstitutionalState,
  getProposalPrimaryPaSubject,
  getProposalSecondaryPaSubjects,
} from "./propostePubbliche";

const UROLOGIA_ID = "urologia-ripristino-operativita-pd-2026";
const DICAPP_ID = "polizia-locale-mobilita-quattro-agenti-dicapp-2026";
const RUN_IDS = [UROLOGIA_ID, DICAPP_ID] as const;

describe("scouted public proposals 11 September 2026", () => {
  it("publishes the same two proposal IDs exactly once end-to-end", () => {
    for (const id of RUN_IDS) {
      expect(PUBLIC_PROPOSALS.filter((proposal) => proposal.id === id)).toHaveLength(1);
      const proposal = PUBLIC_PROPOSALS.find((item) => item.id === id);
      expect(proposal).toBeDefined();
      if (!proposal) continue;
      expect(getCanonicalProposalPresentation(proposal).proposalId).toBe(id);
      expect(getProposalGeography(id)).toBeDefined();
      expect(getProposalPrimaryPaSubject(proposal)).toBeDefined();
      expect(getProposalInstitutionalCompetence(proposal).proposalId).toBe(id);
    }
  });

  it("keeps the full official taxonomy and one official primary matter per proposal", () => {
    expect(getAllPaPublicServiceSubjects()).toHaveLength(15);

    const urologia = PUBLIC_PROPOSALS.find((item) => item.id === UROLOGIA_ID);
    const dicapp = PUBLIC_PROPOSALS.find((item) => item.id === DICAPP_ID);
    expect(urologia).toBeDefined();
    expect(dicapp).toBeDefined();
    if (!urologia || !dicapp) return;

    expect(getProposalPrimaryPaSubject(urologia).code).toBe("2");
    expect(getProposalSecondaryPaSubjects(urologia)).toHaveLength(0);
    expect(getProposalPrimaryPaSubject(dicapp).code).toBe("8");
    expect(getProposalSecondaryPaSubjects(dicapp)).toHaveLength(0);
  });

  it("uses neutral canonical presentations with operational measures", () => {
    const urologia = PUBLIC_PROPOSALS.find((item) => item.id === UROLOGIA_ID);
    const dicapp = PUBLIC_PROPOSALS.find((item) => item.id === DICAPP_ID);
    expect(urologia).toBeDefined();
    expect(dicapp).toBeDefined();
    if (!urologia || !dicapp) return;

    const urologiaCanonical = getCanonicalProposalPresentation(urologia);
    expect(urologiaCanonical.title).toBe("Ripristino dell’operatività del reparto di Urologia");
    expect(urologiaCanonical.measures).toHaveLength(5);

    const dicappCanonical = getCanonicalProposalPresentation(dicapp);
    expect(dicappCanonical.title).toBe("Conclusione della mobilità per quattro agenti di Polizia Locale");
    expect(dicappCanonical.measures).toHaveLength(5);
  });

  it("keeps documented addressees separate from evidence-based competence", () => {
    const urologia = PUBLIC_PROPOSALS.find((item) => item.id === UROLOGIA_ID);
    const dicapp = PUBLIC_PROPOSALS.find((item) => item.id === DICAPP_ID);
    expect(urologia).toBeDefined();
    expect(dicapp).toBeDefined();
    if (!urologia || !dicapp) return;

    const urologiaCompetence = getProposalInstitutionalCompetence(urologia);
    expect(urologiaCompetence.publicAddressee).toBe("Regione Calabria");
    expect(urologiaCompetence.assessmentStatus).toBe("partially_verified");
    expect(urologiaCompetence.primaryAuthority?.id).toBe("azienda-zero-calabria");

    const dicappCompetence = getProposalInstitutionalCompetence(dicapp);
    expect(dicappCompetence.publicAddressee).toBe("Comune di Lamezia Terme");
    expect(dicappCompetence.assessmentStatus).toBe("partially_verified");
    expect(dicappCompetence.primaryAuthority?.id).toBe("comune-lamezia-terme");
  });

  it("preserves formal-deposit distinctions and never infers implementation", () => {
    const urologia = PUBLIC_PROPOSALS.find((item) => item.id === UROLOGIA_ID);
    const dicapp = PUBLIC_PROPOSALS.find((item) => item.id === DICAPP_ID);
    expect(urologia).toBeDefined();
    expect(dicapp).toBeDefined();
    if (!urologia || !dicapp) return;

    expect(urologia.status).toBe("proposta_emersa");
    expect(urologia.events.some((event) => event.type === "deposito")).toBe(false);
    expect(getProposalInstitutionalState(urologia).implementation).toBe("none");

    expect(dicapp.status).toBe("presentata_formalmente");
    expect(dicapp.events.filter((event) => event.type === "deposito")).toHaveLength(1);
    expect(getProposalInstitutionalState(dicapp).implementation).toBe("none");
  });

  it("uses verified point geography for the hospital and coordinate-free citywide scope for police staffing", () => {
    const urologiaGeo = getProposalGeography(UROLOGIA_ID);
    expect(urologiaGeo?.scope).toBe("point");
    expect(urologiaGeo?.points).toHaveLength(1);
    expect(urologiaGeo?.points[0]?.precision).toBe("exact_landmark");

    const dicappGeo = getProposalGeography(DICAPP_ID);
    expect(dicappGeo?.scope).toBe("citywide");
    expect(dicappGeo?.points).toHaveLength(0);
  });
});
