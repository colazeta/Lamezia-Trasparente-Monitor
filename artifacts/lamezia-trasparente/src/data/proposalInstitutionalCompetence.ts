import type { PublicProposal } from "./propostePubblicheCore";

/**
 * Institutional addressee and substantive competence are deliberately distinct.
 * A proposal being addressed to an institution does not prove that institution
 * has the legal or administrative competence to implement every requested measure.
 */
export const PROPOSAL_COMPETENCE_ASSESSMENT_STATUSES = [
  "not_assessed",
  "partially_verified",
  "verified",
] as const;

export type ProposalCompetenceAssessmentStatus =
  (typeof PROPOSAL_COMPETENCE_ASSESSMENT_STATUSES)[number];

export const PROPOSAL_COMPETENCE_ASSESSMENT_LABELS: Record<
  ProposalCompetenceAssessmentStatus,
  string
> = {
  not_assessed: "Competenza non valutata",
  partially_verified: "Competenza verificata in parte",
  verified: "Competenza verificata",
};

export const PROPOSAL_AUTHORITY_LEVELS = [
  "municipal",
  "intermunicipal",
  "regional",
  "health_authority",
  "state",
  "other",
] as const;

export type ProposalAuthorityLevel = (typeof PROPOSAL_AUTHORITY_LEVELS)[number];

export type ProposalCompetentAuthority = {
  id: string;
  label: string;
  level: ProposalAuthorityLevel;
  sourceLabel: string;
  sourceUrl?: string;
};

export type ProposalCompetenceAssessment = {
  status: Exclude<ProposalCompetenceAssessmentStatus, "not_assessed">;
  primaryAuthority?: ProposalCompetentAuthority;
  involvedAuthorities?: readonly ProposalCompetentAuthority[];
  note: string;
};

const REGION_CALABRIA_SCHOOL_CALENDAR: ProposalCompetentAuthority = {
  id: "regione-calabria",
  label: "Regione Calabria",
  level: "regional",
  sourceLabel: "Regione Calabria — DPGR n. 32 del 27/04/2026",
  sourceUrl:
    "https://www.regione.calabria.it/wp-content/uploads/2026/04/DPGR-32_2026.pdf",
};

const SCHOOL_INSTITUTIONS_CALABRIA: ProposalCompetentAuthority = {
  id: "istituzioni-scolastiche-autonome",
  label: "Istituzioni scolastiche autonome interessate",
  level: "other",
  sourceLabel: "Regione Calabria — DPGR n. 32 del 27/04/2026",
  sourceUrl:
    "https://www.regione.calabria.it/wp-content/uploads/2026/04/DPGR-32_2026.pdf",
};

const COMUNE_LAMEZIA_SCHOOL_ORDERS: ProposalCompetentAuthority = {
  id: "comune-lamezia-terme",
  label: "Comune di Lamezia Terme",
  level: "municipal",
  sourceLabel: "Regione Calabria — DPGR n. 32 del 27/04/2026",
  sourceUrl:
    "https://www.regione.calabria.it/wp-content/uploads/2026/04/DPGR-32_2026.pdf",
};

const REGION_CALABRIA_EMODINAMICA: ProposalCompetentAuthority = {
  id: "regione-calabria",
  label: "Regione Calabria",
  level: "regional",
  sourceLabel:
    "Regione Calabria — DGR n. 400 del 21/07/2026, modello organizzativo dei servizi di emodinamica",
  sourceUrl:
    "https://www.regione.calabria.it/provvedimenti-della-regione/page/19/?filter_active=true&filter_department=dipartimento-salute-e-servizi-sanitari&sort_order=4",
};

const ASP_CATANZARO_CARDIOLOGY: ProposalCompetentAuthority = {
  id: "asp-catanzaro",
  label: "Azienda Sanitaria Provinciale di Catanzaro",
  level: "health_authority",
  sourceLabel: "ASP Catanzaro — Cardiologia e UTIC, P.O. Lamezia Terme",
  sourceUrl:
    "https://www.asp.cz.it/presidi-ospedalieri/presidio-ospedaliero-lamezia-terme/cardiologia-e-utic-/",
};

const ASP_CATANZARO_STAFFING: ProposalCompetentAuthority = {
  id: "asp-catanzaro",
  label: "Azienda Sanitaria Provinciale di Catanzaro",
  level: "health_authority",
  sourceLabel: "ASP Catanzaro — PIAO 2026-2028 e fabbisogni di personale",
  sourceUrl:
    "https://www.asp.cz.it/files/FORMAZIONE_ROCCIA/000-documenti/piao-2026-2028-asp-cz.pdf",
};

const REGION_CALABRIA_STAFFING: ProposalCompetentAuthority = {
  id: "regione-calabria",
  label: "Regione Calabria / struttura commissariale sanitaria",
  level: "regional",
  sourceLabel: "ASP Catanzaro — PIAO 2026-2028 e fabbisogni di personale",
  sourceUrl:
    "https://www.asp.cz.it/files/FORMAZIONE_ROCCIA/000-documenti/piao-2026-2028-asp-cz.pdf",
};

const REGION_CALABRIA_TRANSPORT: ProposalCompetentAuthority = {
  id: "regione-calabria",
  label: "Regione Calabria",
  level: "regional",
  sourceLabel:
    "Regione Calabria — Piano Regionale dei Trasporti, Executive summary 2026",
  sourceUrl:
    "https://www.regione.calabria.it/wp-content/uploads/2026/03/PRT-Calabria-Executive-summary_compressed.pdf",
};

const SACAL: ProposalCompetentAuthority = {
  id: "sacal",
  label: "SACAL S.p.A.",
  level: "other",
  sourceLabel: "SACAL — Corporate, ruolo del gestore aeroportuale",
  sourceUrl: "https://sacal.it/it/gruppo-corporate/",
};

const COMUNE_LAMEZIA_SECURITY: ProposalCompetentAuthority = {
  id: "comune-lamezia-terme",
  label: "Comune di Lamezia Terme",
  level: "municipal",
  sourceLabel:
    "Prefettura di Catanzaro — progetti di videosorveglianza urbana e Comuni soggetti attuatori",
  sourceUrl:
    "https://prefettura.interno.gov.it/it/prefetture/catanzaro/notizie/poc-legalita-2014-2020-progetti-videosorveglianza-urbana-calabria",
};

const PREFETTURA_CATANZARO: ProposalCompetentAuthority = {
  id: "prefettura-catanzaro",
  label: "Prefettura di Catanzaro",
  level: "state",
  sourceLabel:
    "Prefettura di Catanzaro — Patti per la sicurezza urbana e raccordo Prefettura-Comuni",
  sourceUrl:
    "https://prefettura.interno.gov.it/it/prefetture/catanzaro/notizie/approvati-prefettura-31-progetti-videosorveglianza-urbana",
};

const COMUNE_LAMEZIA_NURSERIES: ProposalCompetentAuthority = {
  id: "comune-lamezia-terme",
  label: "Comune di Lamezia Terme",
  level: "municipal",
  sourceLabel: "Comune di Lamezia Terme — Ufficio Asili nido e prima infanzia",
  sourceUrl:
    "https://www.comune.lamezia-terme.cz.it/it/unita_organizzative/ufficio-asili-nidi-e-prima-infanzia",
};

const ATS_LAMEZIA: ProposalCompetentAuthority = {
  id: "ats-lamezia-terme",
  label: "Ambito Territoriale Sociale di Lamezia Terme (Comune capofila)",
  level: "intermunicipal",
  sourceLabel: "Comune di Lamezia Terme — Progetti di Vita, programmazione ATS",
  sourceUrl:
    "https://comune.lamezia-terme.cz.it/it/news/lats-investe-oltre-255-mila-euro-sui-progetti-di-vita?type=2",
};

const REGION_CALABRIA_FNA: ProposalCompetentAuthority = {
  id: "regione-calabria",
  label: "Regione Calabria",
  level: "regional",
  sourceLabel:
    "Regione Calabria — Decreto n. 11315 del 25/06/2026, trasferimento FNA agli ATS per disabili gravissimi",
  sourceUrl:
    "https://www.regione.calabria.it/provvedimenti-della-regione/page/392/",
};

const ASP_CATANZARO_PROJECT_OF_LIFE: ProposalCompetentAuthority = {
  id: "asp-catanzaro",
  label: "Azienda Sanitaria Provinciale di Catanzaro",
  level: "health_authority",
  sourceLabel:
    "Comune di Lamezia Terme — Protocollo ATS-ASP e presa in carico multidisciplinare dei Progetti di Vita",
  sourceUrl:
    "https://www.comune.lamezia-terme.cz.it/it/news/115163/lamezia-amministrazione-comunale-su-disabilita-sottoscritti-142-progetti-di-vita-ora-rafforziamo-la-rete-territoriale",
};

const CONFERENZA_SINDACI_ATS_LAMEZIA: ProposalCompetentAuthority = {
  id: "conferenza-sindaci-ats-lamezia",
  label: "Conferenza dei Sindaci dell'ATS di Lamezia Terme",
  level: "intermunicipal",
  sourceLabel: "Comune di Lamezia Terme — Progetti di Vita, programmazione ATS",
  sourceUrl:
    "https://comune.lamezia-terme.cz.it/it/news/lats-investe-oltre-255-mila-euro-sui-progetti-di-vita?type=2",
};

/**
 * Curated registry of substantive competence assessments.
 *
 * Entries are added only when official or administrative evidence supports the
 * allocation for the concrete measure(s). `institutionalRecipient` is never
 * copied into this registry automatically.
 */
export const PROPOSAL_COMPETENCE_ASSESSMENTS: Readonly<
  Partial<Record<string, ProposalCompetenceAssessment>>
> = {
  "emodinamica-h24-vescio-2026": {
    status: "partially_verified",
    primaryAuthority: REGION_CALABRIA_EMODINAMICA,
    involvedAuthorities: [ASP_CATANZARO_CARDIOLOGY],
    note:
      "La DGR regionale n. 400/2026 interviene direttamente sul modello organizzativo dei servizi di emodinamica; l'ASP di Catanzaro gestisce il presidio Giovanni Paolo II e la relativa Cardiologia-UTIC. La proposta comprende però anche personale stabile e trasparenza sui criteri: per questo la competenza complessiva resta qualificata come verificata solo in parte.",
  },
  "emodinamica-h24-nucifero-2026": {
    status: "partially_verified",
    primaryAuthority: REGION_CALABRIA_EMODINAMICA,
    involvedAuthorities: [ASP_CATANZARO_CARDIOLOGY],
    note:
      "Il modello H24/H6-H12 della rete di emodinamica è oggetto di indirizzo regionale, mentre organizzazione operativa e dotazioni del presidio afferiscono all'ASP di Catanzaro. Gli ulteriori investimenti richiesti su personale, infrastrutture e pronto soccorso coinvolgono più leve amministrative, quindi non si attribuisce una competenza esclusiva a un solo ente.",
  },
  "ospedale-organici-continuita-chirurgica-pd-2026": {
    status: "partially_verified",
    primaryAuthority: ASP_CATANZARO_STAFFING,
    involvedAuthorities: [REGION_CALABRIA_STAFFING],
    note:
      "Il presidio Giovanni Paolo II appartiene all'ASP di Catanzaro e il fabbisogno di personale è pianificato dall'Azienda. Il PIAO ASP precisa però che il Piano dei fabbisogni è soggetto ai vincoli di spesa regionali e all'approvazione della struttura commissariale: il Comune, pur destinatario politico dell'interrogazione, non viene quindi trattato come autorità competente per gli organici ospedalieri.",
  },
  "scuole-posticipo-apertura-petizione-2026": {
    status: "verified",
    primaryAuthority: REGION_CALABRIA_SCHOOL_CALENDAR,
    note:
      "Il DPGR n. 32/2026 stabilisce il calendario scolastico regionale e fissa al 15 settembre 2026 l'inizio delle lezioni. Per una richiesta di modifica generale della data regionale di apertura, la Regione Calabria è quindi l'autorità sostanziale di riferimento; gli adattamenti delle singole scuole restano una fattispecie distinta.",
  },
  "scuole-orario-ridotto-caldo-settembre-2026": {
    status: "partially_verified",
    primaryAuthority: SCHOOL_INSTITUTIONS_CALABRIA,
    involvedAuthorities: [COMUNE_LAMEZIA_SCHOOL_ORDERS],
    note:
      "Il DPGR n. 32/2026 consente alle istituzioni scolastiche di adottare adattamenti motivati del calendario nel rispetto del monte ore annuale e contempla anche esigenze connesse a ordinanze sindacali o disposizioni degli enti locali. Una riduzione uniforme dell'orario in tutte le scuole cittadine non può quindi essere attribuita al solo Comune: richiede il concorso delle autonomie scolastiche e, a seconda dello strumento, dell'ente locale.",
  },
  "aeroporto-intermodalita-rilancio-taverna-2026": {
    status: "partially_verified",
    primaryAuthority: REGION_CALABRIA_TRANSPORT,
    involvedAuthorities: [SACAL],
    note:
      "Il Piano Regionale dei Trasporti programma per Lamezia un hub di interscambio ferro-bus-aeroporto, mentre SACAL è il gestore aeroportuale responsabile della gestione e dello sviluppo infrastrutturale dello scalo. La proposta comprende anche Alta Velocità e collegamenti territoriali, per i quali servono ulteriori soggetti infrastrutturali: non viene quindi attribuita una competenza esclusiva né estesa oltre quanto documentato.",
  },
  "piazza-italia-sicurezza-prevenzione-2026": {
    status: "partially_verified",
    involvedAuthorities: [COMUNE_LAMEZIA_SECURITY, PREFETTURA_CATANZARO],
    note:
      "Le fonti ufficiali della Prefettura documentano, anche per Lamezia Terme, un modello di sicurezza urbana basato su progetti comunali di videosorveglianza e raccordo con Prefettura e Forze di polizia. Poiché la proposta comprende anche ordinanze, controlli, servizi sociali e un possibile tavolo prefettizio, non esiste un'unica autorità competente per tutte le misure e non viene indicata una primaryAuthority.",
  },
  "asili-nido-continuita-servizio-2026": {
    status: "verified",
    primaryAuthority: COMUNE_LAMEZIA_NURSERIES,
    note:
      "L'organigramma ufficiale del Comune attribuisce all'Ufficio Asili nido e prima infanzia la gestione del servizio comunale e dei relativi procedimenti. L'eventuale ricorso a centrali di committenza per la gara non trasferisce la responsabilità sostanziale del servizio censito nella proposta.",
  },
  "politiche-sociali-progetto-vita-2026": {
    status: "partially_verified",
    primaryAuthority: ATS_LAMEZIA,
    involvedAuthorities: [
      ASP_CATANZARO_PROJECT_OF_LIFE,
      CONFERENZA_SINDACI_ATS_LAMEZIA,
    ],
    note:
      "Le fonti istituzionali comunali documentano che l'ATS di Lamezia Terme, con il Comune capofila, programma e attua i Progetti di Vita; la Conferenza dei Sindaci approva la programmazione e l'ASP partecipa alla presa in carico multidisciplinare tramite protocollo. Il pacchetto civico comprende tuttavia anche trasparenza, co-progettazione e capacità amministrativa, quindi l'assessment resta prudenzialmente parziale.",
  },
  "fna-disabilita-gravissima-bando-futuro-nazionale-2026": {
    status: "partially_verified",
    primaryAuthority: ATS_LAMEZIA,
    involvedAuthorities: [REGION_CALABRIA_FNA],
    note:
      "Il Decreto regionale n. 11315/2026 documenta il trasferimento delle risorse FNA agli Ambiti Territoriali Sociali per l'area disabili gravissimi, mentre le fonti istituzionali comunali identificano Lamezia Terme come Comune capofila dell'ATS. Questo sostiene l'ATS quale livello operativo della misura. L'assessment resta parziale perché lo scouting non ha verificato un atto locale specifico che documenti l'accredito indicato dalla fonte stampa, né una disciplina locale completa dei tempi di istruttoria, erogazione e pubblicità richiesti dalla proposta.",
  },
};

export type ProposalInstitutionalCompetence = {
  proposalId: string;
  sourceAddressee: string | null;
  publicAddressee: string;
  assessmentStatus: ProposalCompetenceAssessmentStatus;
  primaryAuthority?: ProposalCompetentAuthority;
  involvedAuthorities: readonly ProposalCompetentAuthority[];
  assessmentNote: string;
};

function canonicalPublicAddressee(value?: string) {
  if (!value?.trim()) return "Non indicato";

  // Keep the documented institution while removing internal office/role detail
  // after an em dash. The exact source wording remains available for audit.
  const [institution] = value.split(" — ");
  return institution.trim();
}

export function getProposalInstitutionalCompetence(
  proposal: Pick<PublicProposal, "id" | "institutionalRecipient">,
): ProposalInstitutionalCompetence {
  const assessment = PROPOSAL_COMPETENCE_ASSESSMENTS[proposal.id];

  if (!assessment) {
    return {
      proposalId: proposal.id,
      sourceAddressee: proposal.institutionalRecipient ?? null,
      publicAddressee: canonicalPublicAddressee(proposal.institutionalRecipient),
      assessmentStatus: "not_assessed",
      involvedAuthorities: [],
      assessmentNote:
        "Il destinatario documentato della proposta non viene trattato automaticamente come ente competente. La competenza sostanziale richiede una verifica separata.",
    };
  }

  return {
    proposalId: proposal.id,
    sourceAddressee: proposal.institutionalRecipient ?? null,
    publicAddressee: canonicalPublicAddressee(proposal.institutionalRecipient),
    assessmentStatus: assessment.status,
    primaryAuthority: assessment.primaryAuthority,
    involvedAuthorities: assessment.involvedAuthorities ?? [],
    assessmentNote: assessment.note,
  };
}

export function hasVerifiedProposalCompetence(
  proposal: Pick<PublicProposal, "id" | "institutionalRecipient">,
) {
  return getProposalInstitutionalCompetence(proposal).assessmentStatus !==
    "not_assessed";
}
