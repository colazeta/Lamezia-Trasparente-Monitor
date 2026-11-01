import { describe, expect, it } from "vitest";
import {
  PUBLIC_PROPOSALS,
  getAllPaPublicServiceSubjects,
  getCanonicalProposalPresentation,
  getCanonicalProposalPresentationIds,
  getProposalInstitutionalCompetence,
  getProposalInstitutionalState,
  getProposalPrimaryPaSubject,
  getProposalSecondaryPaSubjects,
} from "./propostePubbliche";
import { getProposalGeography, isProposalGeoreferenced } from "./proposalGeography";

const PROPOSAL_ID = "turismo-imposta-soggiorno-tavolo-federalberghi-2026";

describe("Scouting 1 novembre — gate end-to-end Federalberghi, medesimo proposal ID", () => {
  it("conserva la tassonomia ufficiale completa, inclusi i concetti non utilizzati", () => {
    const catalogue = getAllPaPublicServiceSubjects();
    expect(catalogue).toHaveLength(15);
    expect(new Set(catalogue.map((item) => item.code)).size).toBe(15);
    expect(catalogue.every((item) => item.label && item.uri && item.schemeUri && item.authority)).toBe(true);
  });

  it("materializza una sola proposta, un titolo neutrale e misure operative", () => {
    const matches = PUBLIC_PROPOSALS.filter((p) => p.id === PROPOSAL_ID);
    expect(matches).toHaveLength(1);
    const proposal = matches[0]!;
    expect(proposal.promoterId).toBe("federalberghi-calabria");
    expect(proposal.promoterType).toBe("categoria");
    expect(proposal.institutionalRecipient).toContain("Assessorato al Turismo");
    expect(proposal.channel).toBe("comunicato");
    expect(proposal.firstSeen).toBe("2026-10-31");
    expect(proposal.lastUpdated).toBe("2026-10-31");
    expect(proposal.status).toBe("proposta_emersa");
    expect(proposal.evidenceLevel).toBe("fonte_stampa");
    expect(proposal.sourceUrl).toContain("lametino.it");
    expect(proposal.verificationNote).toContain("not_assessed");
    expect(proposal.linkedActs).toEqual([]);
    expect(proposal.events).toHaveLength(1);
    expect(proposal.events[0]?.type).toBe("emersione");
    expect(proposal.events[0]?.date).toBe("2026-10-31");
    expect(new Set(proposal.events.map((e) => e.id)).size).toBe(1);
    expect(proposal.events.every((e) => e.type !== "deposito" && e.type !== "recepimento")).toBe(true);

    const canonical = getCanonicalProposalPresentation(proposal);
    expect(getCanonicalProposalPresentationIds()).toContain(PROPOSAL_ID);
    expect(canonical.proposalId).toBe(PROPOSAL_ID);
    expect(canonical.version).toBe("1.0");
    expect(canonical.title.length).toBeGreaterThan(20);
    expect(canonical.request.length).toBeGreaterThan(30);
    expect(canonical.measures.length).toBeGreaterThanOrEqual(3);
    expect(canonical.actionTypes).toContain("coordinamento");
  });

  it("usa una sola materia primaria schema.gov.it e secondarie conservate in audit", () => {
    const proposal = PUBLIC_PROPOSALS.find((p) => p.id === PROPOSAL_ID)!;
    const primary = getProposalPrimaryPaSubject(proposal);
    expect(primary.code).toBe("7");
    expect(primary.source).toBe("schema.gov.it / AgID");
    expect(primary.uri).toContain("/public-services-subject-matters/7");
    const secondaries = getProposalSecondaryPaSubjects(proposal);
    expect(secondaries.map((x) => x.code)).toEqual(["9", "4", "10"]);
    expect(secondaries.every((x) => x.uri !== primary.uri)).toBe(true);
  });

  it("separa destinatario da competenza, distingue proposta, deposito e attuazione", () => {
    const proposal = PUBLIC_PROPOSALS.find((p) => p.id === PROPOSAL_ID)!;
    const assessment = getProposalInstitutionalCompetence(proposal);
    expect(assessment.sourceAddressee).toBe(proposal.institutionalRecipient);
    expect(assessment.publicAddressee).toBeTruthy();
    expect(assessment.assessmentStatus).toBe("not_assessed");
    expect(assessment.primaryAuthority).toBeUndefined();
    expect(assessment.involvedAuthorities).toEqual([]);

    const state = getProposalInstitutionalState(proposal);
    expect(state.publicState).toBe("segnalata");
    expect(state.progressStage).toBe("emersa");
    expect(state.hasFormalization).toBe(false);
    expect(state.hasInstitutionalFollowUp).toBe(false);
    expect(state.implementation).toBe("none");
  });

  it("preserva geografia citywide senza coordinate e senza georeferenziazione", () => {
    const geography = getProposalGeography(PROPOSAL_ID)!;
    expect(geography.scope).toBe("citywide");
    expect(geography.areas).toEqual(["intera_citta"]);
    expect(geography.points).toEqual([]);
    expect(isProposalGeoreferenced(PROPOSAL_ID)).toBe(false);
  });
});

describe("Sviluppo ATS del 30 ottobre — stesso ID Progetto di Vita", () => {
  const PROGETTO_VITA_ID = "politiche-sociali-progetto-vita-2026";
  const EVENT_ID = "progetto-vita-ats-avviso-tavoli-permanenti-30-ottobre";

  it("aggiorna la timeline esistente senza duplicare proposte o attribuire effetti", () => {
    const matches = PUBLIC_PROPOSALS.filter((p) => p.id === PROGETTO_VITA_ID);
    expect(matches).toHaveLength(1);
    const proposal = matches[0]!;
    expect(proposal.promoterId).toBe("una-citta-dove-vivere-bene");
    expect(proposal.lastUpdated).toBe("2026-10-30");
    const events = proposal.events.filter((event) => event.id === EVENT_ID);
    expect(events).toHaveLength(1);
    const event = events[0]!;
    expect(event.date).toBe("2026-10-30");
    expect(event.type).toBe("aggiornamento");
    expect(event.evidenceLevel).toBe("fonte_ufficiale");
    expect(event.sourceUrl).toContain("comune.lamezia-terme.cz.it");
    expect(proposal.linkedActs.some((act) => act.includes("1656"))).toBe(true);
    expect(proposal.verificationNote).toContain("non si deduce l'origine");
    expect(proposal.events.every((entry) => entry.id !== EVENT_ID || entry.type !== "recepimento")).toBe(true);
  });

  it("conserva canone, materia ufficiale, destinatario e geografia sul medesimo ID", () => {
    const proposal = PUBLIC_PROPOSALS.find((p) => p.id === PROGETTO_VITA_ID)!;
    const canonical = getCanonicalProposalPresentation(proposal);
    expect(canonical.proposalId).toBe(PROGETTO_VITA_ID);
    expect(getCanonicalProposalPresentationIds()).toContain(PROGETTO_VITA_ID);
    const primary = getProposalPrimaryPaSubject(proposal);
    expect(primary.source).toBe("schema.gov.it / AgID");
    expect(primary.code).toBe("2");
    const assessment = getProposalInstitutionalCompetence(proposal);
    expect(assessment.sourceAddressee).toBe(proposal.institutionalRecipient);
    expect(assessment.publicAddressee).toBeTruthy();
    expect(getProposalGeography(PROGETTO_VITA_ID)).toBeDefined();
    const state = getProposalInstitutionalState(proposal);
    expect(state.implementation).toBe("none");
  });
});
