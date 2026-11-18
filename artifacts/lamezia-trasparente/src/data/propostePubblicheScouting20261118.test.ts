import { describe, expect, it } from "vitest";
import { PUBLIC_PROPOSALS, getAllPaPublicServiceSubjects, getCanonicalProposalPresentation, getCanonicalProposalPresentationIds, getProposalInstitutionalCompetence, getProposalInstitutionalState, getProposalPrimaryPaSubject, getProposalSecondaryPaSubjects } from "./propostePubbliche";
import { getProposalGeography, isProposalGeoreferenced } from "./proposalGeography";

const cases = [
  {
    "id": "luminarie-frazioni-contrade-raso-2026",
    "promoter": "marialucia-raso",
    "primary": "10",
    "secondary": [],
    "actions": [
      "organizzazione",
      "valorizzazione",
      "trasparenza"
    ],
    "scope": "citywide",
    "areas": [
      "intera_citta"
    ]
  },
  {
    "id": "via-gramsci-palermo-completamento-viario-cristiano-villella-2026",
    "promoter": "massimo-cristiano-carmine-villella-futuro-nazionale",
    "primary": "4",
    "secondary": [
      "5",
      "8"
    ],
    "actions": [
      "infrastruttura",
      "trasparenza",
      "messa_in_sicurezza"
    ],
    "scope": "area",
    "areas": [
      "sambiase"
    ]
  },
  {
    "id": "coordinamento-sport-impianti-associazioni-2026",
    "promoter": "associazioni-sportive-lametine-coordinamento-territoriale",
    "primary": "10",
    "secondary": [
      "1"
    ],
    "actions": [
      "coordinamento",
      "trasparenza",
      "organizzazione"
    ],
    "scope": "citywide",
    "areas": [
      "intera_citta"
    ]
  },
  {
    "id": "teatro-costabile-cronoprogramma-progetto-civico-2026",
    "promoter": "progetto-civico-italia-lamezia-terme",
    "primary": "10",
    "secondary": [
      "5"
    ],
    "actions": [
      "trasparenza",
      "organizzazione"
    ],
    "scope": "area",
    "areas": [
      "sambiase"
    ]
  }
] as const;
describe("Scouting 18 novembre: gate sui medesimi quattro proposal ID", () => {
  it("preserva l'intero catalogo official-first delle 15 materie AgID", () => {
    const all = getAllPaPublicServiceSubjects();
    expect(all).toHaveLength(15);
    expect(new Set(all.map(x => x.code)).size).toBe(15);
    for(const x of all) {
      expect(x.label).toBeTruthy();
      expect(x.uri.startsWith("https://")).toBe(true);
      expect(x.schemeUri.startsWith("https://")).toBe(true);
      expect(x.authority).toBeTruthy();
      expect(x.source).toBe("schema.gov.it / AgID");
    }
  });
  it("garantisce identità uniche per i quattro casi", () => {
    expect(new Set(cases.map(x=>x.id)).size).toBe(cases.length);
    expect(new Set(PUBLIC_PROPOSALS.map(x=>x.id)).size).toBe(PUBLIC_PROPOSALS.length);
  });
  for (const entry of cases) {
    it(entry.id + ": canone, tassonomia, destinatario, competenza, stati e geografia", () => {
      const matches=PUBLIC_PROPOSALS.filter(x=>x.id===entry.id);
      expect(matches).toHaveLength(1);
      const p=matches[0]!;
      expect(p.promoterId).toBe(entry.promoter);
      expect(p.institutionalRecipient).toBeTruthy();
      expect(p.channel).toBe("comunicato");
      expect(p.firstSeen).toBe("2026-11-17");
      expect(p.lastUpdated).toBe("2026-11-17");
      expect(p.status).toBe("proposta_emersa");
      expect(p.sourceUrl?.startsWith("https://")).toBe(true);
      expect(p.linkedActs).toHaveLength(0);
      expect(p.events).toHaveLength(1);
      expect(p.events[0]?.date).toBe("2026-11-17");
      expect(p.events[0]?.type).toBe("emersione");
      expect(p.events[0]?.sourceUrl).toBe(p.sourceUrl);
      const c=getCanonicalProposalPresentation(p);
      expect(getCanonicalProposalPresentationIds()).toContain(entry.id);
      expect(c.proposalId).toBe(entry.id);
      expect(c.version).toBe("1.0");
      expect(c.request.length).toBeGreaterThan(50);
      expect(c.measures.length).toBeGreaterThanOrEqual(4);
      expect(c.measures.every(x=>x.length>25)).toBe(true);
      expect(c.actionTypes).toEqual(entry.actions);
      expect(c.expectedOutcome).toBeTruthy();
      expect(c.editorialNote).toBeTruthy();
      const primary=getProposalPrimaryPaSubject(p);
      const secondary=getProposalSecondaryPaSubjects(p);
      expect(primary.code).toBe(entry.primary);
      expect(primary.uri.startsWith("https://")).toBe(true);
      expect(secondary.map(x=>x.code)).toEqual(entry.secondary);
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
      const g=getProposalGeography(entry.id)!;
      expect(g.scope).toBe(entry.scope);
      expect(g.areas).toEqual(entry.areas);
      expect(g.points).toHaveLength(0);
      expect(g.note).toContain("WGS84");
      expect(isProposalGeoreferenced(entry.id)).toBe(false);
    });
  }
  it("mantiene l'ID dei promotori Cristiano-Villella per oggetti distinti",()=>{
    const a=PUBLIC_PROPOSALS.find(x=>x.id===cases[1].id)!;
    const b=PUBLIC_PROPOSALS.find(x=>x.id==="capizzaglie-un-passo-oltre-riattivazione-cristiano-villella-2026")!;
    expect(a.promoterId).toBe(b.promoterId);
    expect(a.threadId).not.toBe(b.threadId);
  });
});
