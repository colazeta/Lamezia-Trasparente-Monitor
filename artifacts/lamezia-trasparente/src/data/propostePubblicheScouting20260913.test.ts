import { describe, expect, it } from "vitest";

import { getProposalGeography } from "./proposalGeography";
import {
  LT_SEMANTIC_EXTENSIONS,
  PUBLIC_PROPOSALS,
  getAllPaPublicServiceSubjects,
  getCanonicalProposalPresentation,
  getProposalInstitutionalCompetence,
  getProposalInstitutionalState,
  getProposalPrimaryPaSubject,
  getProposalSecondaryPaSubjects,
} from "./propostePubbliche";

const SCORDOVILLO_ID =
  "scordovillo-consiglio-aperto-trasparenza-futuro-nazionale-2026";
const POLIZIA_LOCALE_RENDA_ID =
  "polizia-locale-piano-assunzioni-h24-parco-agricolo-2026";
const RUN_IDS = [SCORDOVILLO_ID, POLIZIA_LOCALE_RENDA_ID] as const;

describe("scouted public proposals 13 September 2026 and Scordovillo timeline update", () => {
  it("publishes the run proposal IDs exactly once end to end", () => {
    for (const proposalId of RUN_IDS) {
      expect(
        PUBLIC_PROPOSALS.filter((proposal) => proposal.id === proposalId),
      ).toHaveLength(1);

      const proposal = PUBLIC_PROPOSALS.find((item) => item.id === proposalId);
      expect(proposal).toBeDefined();
      if (!proposal) continue;

      expect(getCanonicalProposalPresentation(proposal).proposalId).toBe(
        proposalId,
      );
      expect(getProposalGeography(proposalId)).toBeDefined();
      expect(getProposalPrimaryPaSubject(proposal)).toBeDefined();
      expect(getProposalInstitutionalCompetence(proposal).proposalId).toBe(
        proposalId,
      );
    }
  });

  it("keeps the complete 15-concept backend vocabulary and no LT thematic extensions", () => {
    expect(getAllPaPublicServiceSubjects()).toHaveLength(15);
    expect(Object.keys(LT_SEMANTIC_EXTENSIONS)).toHaveLength(0);

    const scordovillo = PUBLIC_PROPOSALS.find(
      (item) => item.id === SCORDOVILLO_ID,
    );
    const poliziaLocale = PUBLIC_PROPOSALS.find(
      (item) => item.id === POLIZIA_LOCALE_RENDA_ID,
    );
    expect(scordovillo).toBeDefined();
    expect(poliziaLocale).toBeDefined();
    if (!scordovillo || !poliziaLocale) return;

    expect(getProposalPrimaryPaSubject(scordovillo).code).toBe("GOVE");
    expect(getProposalSecondaryPaSubjects(scordovillo)).toHaveLength(0);
    expect(getProposalPrimaryPaSubject(poliziaLocale).code).toBe("8");
    expect(getProposalSecondaryPaSubjects(poliziaLocale)).toHaveLength(0);
  });

  it("uses neutral canonical presentations with atomic operational measures", () => {
    const scordovillo = PUBLIC_PROPOSALS.find(
      (item) => item.id === SCORDOVILLO_ID,
    );
    const poliziaLocale = PUBLIC_PROPOSALS.find(
      (item) => item.id === POLIZIA_LOCALE_RENDA_ID,
    );
    expect(scordovillo).toBeDefined();
    expect(poliziaLocale).toBeDefined();
    if (!scordovillo || !poliziaLocale) return;

    const scordovilloCanonical = getCanonicalProposalPresentation(scordovillo);
    expect(scordovilloCanonical.title).toBe(
      "Trasparenza e confronto pubblico sul percorso abitativo di Scordovillo",
    );
    expect(scordovilloCanonical.version).toBe("1.1");
    expect(scordovilloCanonical.measures).toHaveLength(6);
    expect(scordovilloCanonical.actionTypes).toEqual([
      "organizzazione",
      "trasparenza",
      "coordinamento",
    ]);
    expect(
      scordovilloCanonical.measures.some((measure) =>
        measure.includes("Sospendere le ulteriori procedure di acquisto"),
      ),
    ).toBe(true);

    const poliziaCanonical = getCanonicalProposalPresentation(poliziaLocale);
    expect(poliziaCanonical.title).toBe(
      "Rafforzamento strutturale dell’organico della Polizia Locale",
    );
    expect(poliziaCanonical.measures).toHaveLength(3);
    expect(poliziaCanonical.actionTypes).toEqual([
      "rafforzamento_servizio",
      "organizzazione",
    ]);
  });

  it("keeps documented addressees separate from partially verified competence", () => {
    const scordovillo = PUBLIC_PROPOSALS.find(
      (item) => item.id === SCORDOVILLO_ID,
    );
    const poliziaLocale = PUBLIC_PROPOSALS.find(
      (item) => item.id === POLIZIA_LOCALE_RENDA_ID,
    );
    expect(scordovillo).toBeDefined();
    expect(poliziaLocale).toBeDefined();
    if (!scordovillo || !poliziaLocale) return;

    const scordovilloCompetence =
      getProposalInstitutionalCompetence(scordovillo);
    expect(scordovilloCompetence.sourceAddressee).toContain("ATERP Calabria");
    expect(scordovilloCompetence.sourceAddressee).toContain("Regione Calabria");
    expect(scordovilloCompetence.publicAddressee).toBe(
      "Comune di Lamezia Terme",
    );
    expect(scordovilloCompetence.assessmentStatus).toBe("partially_verified");
    expect(scordovilloCompetence.primaryAuthority?.id).toBe(
      "presidente-consiglio-comunale-lamezia-terme",
    );
    expect(scordovilloCompetence.assessmentNote).toContain(
      "non vengono inferiti",
    );

    const poliziaCompetence = getProposalInstitutionalCompetence(poliziaLocale);
    expect(poliziaCompetence.sourceAddressee).toContain("Autorità competenti");
    expect(poliziaCompetence.publicAddressee).toBe("Autorità competenti");
    expect(poliziaCompetence.assessmentStatus).toBe("partially_verified");
    expect(poliziaCompetence.primaryAuthority?.id).toBe("comune-lamezia-terme");
  });

  it("updates the same Scordovillo timeline without inferring a formal deposit or implementation", () => {
    const scordovilloMatches = PUBLIC_PROPOSALS.filter(
      (proposal) => proposal.id === SCORDOVILLO_ID,
    );
    expect(scordovilloMatches).toHaveLength(1);

    const scordovillo = scordovilloMatches[0];
    expect(scordovillo.lastUpdated).toBe("2026-09-18");
    expect(scordovillo.status).toBe("proposta_emersa");
    expect(scordovillo.events.map((event) => event.type)).toEqual([
      "emersione",
      "aggiornamento",
    ]);
    expect(
      scordovillo.events.some(
        (event) =>
          event.id ===
            "scordovillo-fn-sospensione-acquisti-confronto-18-settembre" &&
          event.type === "aggiornamento",
      ),
    ).toBe(true);
    expect(getProposalInstitutionalState(scordovillo).implementation).toBe(
      "none",
    );

    const poliziaLocale = PUBLIC_PROPOSALS.find(
      (proposal) => proposal.id === POLIZIA_LOCALE_RENDA_ID,
    );
    expect(poliziaLocale).toBeDefined();
    if (!poliziaLocale) return;
    expect(poliziaLocale.status).toBe("proposta_emersa");
    expect(poliziaLocale.events.map((event) => event.type)).toEqual([
      "emersione",
    ]);
    expect(getProposalInstitutionalState(poliziaLocale).implementation).toBe(
      "none",
    );
  });

  it("uses coordinate-free citywide geography for the same proposal IDs", () => {
    for (const proposalId of RUN_IDS) {
      const geography = getProposalGeography(proposalId);
      expect(geography?.scope).toBe("citywide");
      expect(geography?.areas).toEqual(["intera_citta"]);
      expect(geography?.points).toHaveLength(0);
    }
  });
});
