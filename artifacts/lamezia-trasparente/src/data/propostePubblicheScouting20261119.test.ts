import { describe, expect, it } from "vitest";
import {
  PUBLIC_PROPOSALS, getAllPaPublicServiceSubjects, getCanonicalProposalPresentation,
  getCanonicalProposalPresentationIds, getProposalInstitutionalCompetence,
  getProposalInstitutionalEvidence, getProposalInstitutionalState,
  getProposalPrimaryPaSubject, getProposalSecondaryPaSubjects,
} from "./propostePubbliche";
import { getProposalGeography, isProposalGeoreferenced } from "./proposalGeography";

const cases = [
  {
    id: "porto-turistico-marinella-cafarone-ginepri-cristiano-villella-2026",
    promoter: "massimo-cristiano-carmine-villella-futuro-nazionale",
    theme: "Candidatura comunale per porto turistico costiero",
    primary: "4", secondaries: ["7","5","11"],
    actions: ["infrastruttura","organizzazione","trasparenza"],
    scope: "area", areas: ["costa"],
  },
  {
    id: "torrente-canne-rifiuti-via-emilio-la-scala-cittadini-2026",
    promoter: "cittadino-segnalante-non-nominato-via-emilio-la-scala-2026",
    theme: "Rimozione rifiuti e bonifica presso torrente Canne",
    primary: "11", secondaries: ["8"],
    actions: ["manutenzione","messa_in_sicurezza","prevenzione_rischio"],
    scope: "area", areas: ["nicastro"],
  },
] as const;

const masiId = "quartiere-bella-manutenzione-masi-2026";
const sameSet = [...cases.map(x=>x.id), masiId];

describe("Scouting 19 novembre: gate sullo stesso insieme di tre proposal ID", () => {
  it("preserva tutte le 15 materie ufficiali, comprese quelle non utilizzate", () => {
    const subjects = getAllPaPublicServiceSubjects();
    expect(subjects).toHaveLength(15);
    expect(new Set(subjects.map(x=>x.code)).size).toBe(15);
    for(const subject of subjects) {
      expect(subject.code).toBeTruthy();
      expect(subject.label.length).toBeGreaterThan(3);
      expect(subject.uri).toContain(subject.schemeUri);
      expect(subject.schemeUri).toMatch(/^https:\/\//);
      expect(subject.authority).toBe("Agenzia per l'Italia Digitale");
      expect(subject.source).toBe("schema.gov.it / AgID");
    }
  });

  it("non crea ID duplicati e preserva gli stessi tre casi", () => {
    expect(new Set(sameSet).size).toBe(3);
    expect(new Set(PUBLIC_PROPOSALS.map(p=>p.id)).size).toBe(PUBLIC_PROPOSALS.length);
    for(const id of sameSet) expect(PUBLIC_PROPOSALS.filter(p=>p.id===id)).toHaveLength(1);
  });

  for(const entry of cases) {
    it(entry.id + ": canone, semantica primaria e secondarie, destinatario/competenza, timeline, stato, geografia", () => {
      const p=PUBLIC_PROPOSALS.find(x=>x.id===entry.id)!;
      expect(p).toBeTruthy();
      expect(p.promoterId).toBe(entry.promoter);
      expect(p.theme).toBe(entry.theme);
      expect(p.channel).toBe("comunicato");
      expect(p.status).toBe("proposta_emersa");
      expect(p.firstSeen).toBe("2026-11-18");
      expect(p.lastUpdated).toBe("2026-11-18");
      expect(p.institutionalRecipient).toBeTruthy();
      expect(p.sourceUrl?.startsWith("https://")).toBe(true);
      expect(p.linkedActs).toHaveLength(0);
      expect(p.events.some(e=>e.type==="emersione" && e.date==="2026-11-18")).toBe(true);
      expect(p.events.every(e=>e.sourceUrl?.startsWith("https://"))).toBe(true);
      expect(p.events.some(e=>["deposito","petizione","calendarizzazione","discussione","recepimento"].includes(e.type))).toBe(false);

      const canonical=getCanonicalProposalPresentation(p);
      expect(getCanonicalProposalPresentationIds()).toContain(entry.id);
      expect(canonical.proposalId).toBe(entry.id);
      expect(canonical.title).toBeTruthy();
      expect(canonical.version).toBe("1.0");
      expect(canonical.request.length).toBeGreaterThan(40);
      expect(canonical.measures.length).toBeGreaterThanOrEqual(4);
      expect(canonical.measures.every(m=>m.length>25)).toBe(true);
      expect(canonical.actionTypes).toEqual(entry.actions);
      expect(canonical.expectedOutcome).toBeTruthy();

      const primary=getProposalPrimaryPaSubject(p);
      const secondary=getProposalSecondaryPaSubjects(p);
      expect(primary.code).toBe(entry.primary);
      expect(primary.uri.startsWith("https://")).toBe(true);
      expect(secondary.map(x=>x.code)).toEqual(entry.secondaries);
      expect(secondary.every(x=>x.uri!==primary.uri)).toBe(true);
      expect(new Set(secondary.map(x=>x.uri)).size).toBe(secondary.length);

      const competence=getProposalInstitutionalCompetence(p);
      expect(competence.sourceAddressee).toBe(p.institutionalRecipient);
      expect(competence.publicAddressee).toBeTruthy();
      expect(competence.assessmentStatus).toBe("not_assessed");
      expect(competence.primaryAuthority).toBeUndefined();
      expect(competence.involvedAuthorities).toEqual([]);

      const state=getProposalInstitutionalState(p);
      expect(state.publicState).toBe("segnalata");
      expect(state.hasFormalization).toBe(false);
      expect(state.hasInstitutionalFollowUp).toBe(false);
      expect(state.implementation).toBe("none");
      const evidence=getProposalInstitutionalEvidence(p);
      expect(evidence.some(e=>e.role==="origine")).toBe(true);
      expect(evidence.some(e=>e.role==="formalizzazione")).toBe(false);

      const geo=getProposalGeography(entry.id)!;
      expect(geo.scope).toBe(entry.scope);
      expect(geo.areas).toEqual(entry.areas);
      expect(geo.points).toHaveLength(0);
      expect(geo.note).toContain("WGS84");
      expect(isProposalGeoreferenced(entry.id)).toBe(false);
    });
  }

  it("la proposta Masi conserva ID e precedente deposito senza attribuire all'interrogazione di novembre una nuova prova amministrativa",()=>{
    const p=PUBLIC_PROPOSALS.find(p=>p.id===masiId)!;
    expect(p.promoterId).toBe("gennarino-masi");
    expect(p.firstSeen).toBe("2026-09-02");
    expect(p.lastUpdated).toBe("2026-11-18");
    expect(p.events.filter(e=>e.date==="2026-11-18")).toHaveLength(1);
    const latest=p.events.find(e=>e.date==="2026-11-18")!;
    expect(latest.type).toBe("aggiornamento");
    expect(latest.sourceUrl).toContain("lamezia-masi-pd-strade-dissestate");
    expect(p.verificationNote).toContain("2026-PROT-68150");
    expect(p.verificationNote).toContain("non sono stati acquisiti");
    expect(getCanonicalProposalPresentationIds()).toContain(masiId);
    expect(getCanonicalProposalPresentation(p).proposalId).toBe(masiId);
    expect(getProposalPrimaryPaSubject(p).uri).toMatch(/^https:\/\//);
    expect(getProposalInstitutionalCompetence(p).sourceAddressee).toBe(p.institutionalRecipient);
    expect(getProposalInstitutionalCompetence(p).assessmentStatus).toBe("not_assessed");
    const state=getProposalInstitutionalState(p);
    expect(state.implementation).toBe("none");
    expect(state.hasInstitutionalFollowUp).toBe(false);
    expect(state.publicState).toBe("presentata");
    expect(getProposalInstitutionalEvidence(p).some(e=>e.role==="aggiornamento" && e.date==="2026-11-18")).toBe(true);
    expect(getProposalGeography(masiId)).toBeTruthy();
  });

  it("riutilizza il promotore Cristiano–Villella, separando il porto dal collegamento viario", () => {
    const port=PUBLIC_PROPOSALS.find(x=>x.id===cases[0].id)!;
    const road=PUBLIC_PROPOSALS.find(x=>x.id==="via-gramsci-palermo-completamento-viario-cristiano-villella-2026")!;
    expect(port.promoterId).toBe(road.promoterId);
    expect(port.threadId).not.toBe(road.threadId);
  });
});
