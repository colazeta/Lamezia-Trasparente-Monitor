import {
  identifyInstitutionalSessionCandidate,
  type InstitutionalSessionCandidate,
  type InstitutionalSessionCandidateInput,
} from "../../../../scripts/institutional-session-candidates";

import type {
  CouncilSessionV0,
  CouncilSessionV0ContextResearch,
  CouncilSessionV0Provenance,
} from "@/data/councilSessionV0";

const OFFICIAL_ALBO_URL = "https://albo.tinnvision.cloud/?ente=00301390795";
const COMMISSION_NOTICE_URL =
  "https://albo.tinnvision.cloud/allegati/2026_2648_2_P?ente=00301390795";
const COMMISSION_ARCHIVED_DOCUMENT_URL =
  "/data/public/albo/documents/2026/842702b2044b4b6f9a7b21a65eac2ab59866ee3f321872e6b28fd481598be304.pdf";
const COUNCIL_SESSION_EVIDENCE_URL =
  "https://albo.tinnvision.cloud/allegati/2026_2755_6_ALLEG?ente=00301390795";
const SOURCE_REVIEWED_AT = "2026-08-22T12:10:49Z";
const CONTEXT_RESEARCHED_AT = "2026-08-23T10:48:08Z";
const COUNCIL_CONTEXT_RESEARCHED_AT = "2026-08-25T18:54:22.874Z";

const councilContextResearch: CouncilSessionV0ContextResearch = {
  status: "reviewed_matches",
  checkedAt: COUNCIL_CONTEXT_RESEARCHED_AT,
  searchNote:
    "La pubblicazione istituzionale 2026/2755 conferma una seduta del Consiglio comunale il 13 agosto 2026. Cinque articoli coincidono con organo, data e temi distintivi; un sesto descrive un ulteriore tema trattato nella stessa giornata ma resta una possibile corrispondenza. La stampa non completa l'orario o l'ordine del giorno. City One indicizza anche un video senza esporre una pagina stabile verificabile, quindi non è pubblicato come collegamento audiovisivo.",
  articles: [
    {
      title:
        "Convocato Consiglio Comunale di Lamezia Terme in prossimità del ferragosto",
      url: "https://www.cityonelamezia.it/convocato-consiglio-comunale-di-lamezia-terme-in-prossimita-del-ferragosto/",
      publisher: "City One",
      publishedAt: "2026-08-10",
      relationship: "same_session",
      relevanceNote:
        "Indica il Consiglio del 13 agosto e include tra i 33 punti i debiti fuori bilancio; la successiva pubblicazione istituzionale 2026/2755 conferma organo, data e l'approvazione di uno di questi debiti.",
      reviewedAt: COUNCIL_CONTEXT_RESEARCHED_AT,
    },
    {
      title:
        "Consiglio comunale prima di Ferragosto con soliti stilemi politici e qualche fuoriprogramma estivo",
      url: "https://www.lameziainforma.it/istituzione/2026/08/13/consiglio-comunale-prima-di-ferragosto-con-soliti-stilemi-politici-e-qualche-fuoriprogramma-estivo/68880/",
      publisher: "LameziaInforma",
      publishedAt: "2026-08-13",
      relationship: "same_session",
      relevanceNote:
        "Descrive il Consiglio del 13 agosto e temi distintivi, inclusi bilancio e debiti fuori bilancio; la data della seduta è ora confermata dalla fonte istituzionale 2026/2755.",
      reviewedAt: COUNCIL_CONTEXT_RESEARCHED_AT,
    },
    {
      title: "Question time politico evaso in consiglio comunale",
      url: "https://www.lameziainforma.it/politica/2026/08/13/question-time-politico-evaso-in-consiglio-comunale/68885/",
      publisher: "LameziaInforma",
      publishedAt: "2026-08-13",
      relationship: "same_session",
      relevanceNote:
        "Il resoconto del 13 agosto tratta question time e debiti fuori bilancio; organo, data e tema del debito coincidono con la successiva fonte istituzionale.",
      reviewedAt: COUNCIL_CONTEXT_RESEARCHED_AT,
    },
    {
      title:
        "Lamezia, 33 punti in Consiglio comunale il 13 agosto: al centro assestamento e salvaguardia equilibri di Bilancio",
      url: "https://www.lametino.it/ultime/lamezia-33-punti-in-consiglio-comunale-il-13-agosto-al-centro-assestamento-e-salvaguardia-equilibri-di-bilancio.html",
      publisher: "il Lametino",
      publishedAt: "2026-08-10",
      relationship: "same_session",
      relevanceNote:
        "Annuncia il Consiglio del 13 agosto e riporta assestamento, salvaguardia degli equilibri e debiti fuori bilancio; uno di questi ultimi è richiamato dalla fonte istituzionale 2026/2755.",
      reviewedAt: COUNCIL_CONTEXT_RESEARCHED_AT,
    },
    {
      title:
        "Lamezia, il Consiglio comunale approva l'assestamento e la salvaguardia degli equilibri di Bilancio",
      url: "https://www.lametino.it/ultime/lamezia-il-consiglio-comunale-approva-lassestamento-e-la-salvaguardia-degli-equilibri-di-bilancio.html",
      publisher: "il Lametino",
      publishedAt: "2026-08-13",
      relationship: "same_session",
      relevanceNote:
        "Resoconta il Consiglio del 13 agosto e più temi distintivi già presenti negli avvisi editoriali; la data è confermata dalla pubblicazione istituzionale successiva.",
      reviewedAt: COUNCIL_CONTEXT_RESEARCHED_AT,
    },
    {
      title:
        "Lamezia, Amministrazione Comunale su disabilità: \"Sottoscritti 142 Progetti di Vita. Ora rafforziamo rete territoriale\"",
      url: "https://www.lametino.it/ultimora/lamezia-amministrazione-comunale-su-disabilita-sottoscritti-142-progetti-di-vita-ora-rafforziamo-rete-territoriale.html",
      publisher: "il Lametino",
      publishedAt: "2026-08-14",
      relationship: "possible_same_session",
      relevanceNote:
        "Riferisce un'informativa resa nel Consiglio del 13 agosto. La data coincide con quella verificata, ma la fonte ufficiale acquisita non espone l'ordine del giorno completo.",
      reviewedAt: COUNCIL_CONTEXT_RESEARCHED_AT,
    },
  ],
  media: [],
};

const commissionContextResearch: CouncilSessionV0ContextResearch = {
  status: "reviewed_matches",
  checkedAt: CONTEXT_RESEARCHED_AT,
  searchNote:
    "La ricerca di articoli, dirette e video per organo, date e temi non ha restituito contenuti che nominino con sufficiente precisione le sedute della II Commissione del 10 o 11 agosto; i collegamenti riportati riguardano soltanto i temi in agenda.",
  articles: [
    {
      title:
        "Approvato in giunta l'assestamento generale di bilancio e salvaguardia degli equilibri per l'esercizio 2026",
      url: "https://www.lameziainforma.it/istituzione/2026/08/06/approvato-in-giunta-lassestamento-generale-di-bilancio-e-salvaguardia-degli-equilibri-per-lesercizio-2026/68773/",
      publisher: "LameziaInforma",
      publishedAt: "2026-08-06",
      relationship: "agenda_item",
      relevanceNote:
        "Approfondisce la proposta di assestamento approvata dalla Giunta il 6 agosto, poi indicata nel primo punto della convocazione; non documenta le riunioni della Commissione.",
      reviewedAt: CONTEXT_RESEARCHED_AT,
    },
    {
      title:
        "LAMEZIA | Bilancio, la maggioranza si sfalda in Giunta: tre assessori assenti. Muraca: «È sfiducia al sindaco»",
      url: "https://lanovitaonline.it/lamezia-bilancio-la-maggioranza-si-sfalda-in-giunta-tre-assessori-assenti-muraca-e-sfiducia-al-sindaco/",
      publisher: "La Novità Online",
      publishedAt: "2026-08-08",
      relationship: "agenda_item",
      relevanceNote:
        "Riporta una posizione politica sulla deliberazione di Giunta relativa all'assestamento; riguarda il tema in agenda e non verifica attività o esiti della Commissione.",
      reviewedAt: CONTEXT_RESEARCHED_AT,
    },
  ],
  media: [],
};

function requireCandidate(
  input: InstitutionalSessionCandidateInput,
): InstitutionalSessionCandidate {
  const candidate = identifyInstitutionalSessionCandidate(input);
  if (!candidate) {
    throw new Error(`Invalid institutional session source record: ${input.id}`);
  }
  return candidate;
}

const commissionCandidate = requireCandidate({
  id: "albo-2026-2648",
  source: "Albo Pretorio Comune di Lamezia Terme",
  source_url: OFFICIAL_ALBO_URL,
  retrieved_at: "2026-08-11T07:32:34.743Z",
  publication_number: "2026/2648",
  publication_start: "2026-08-07",
  publication_end: "2026-08-14",
  act_type: "CONVOCAZIONI COMMISSIONI CONSILIARI",
  subject:
    "Convocazione 2° Commissione Consiliare Permanente. Calendario lavori.",
  document_url: COMMISSION_NOTICE_URL,
  content_hash:
    "f4301f15e2bfd99aecb79f25ceb4d1346a486ff1fe20e748f9bac89a818eee09",
  verification_status: "official_source_acquired",
  privacy_risk: "low",
  public_visibility: "publishable",
});

const councilCandidate = requireCandidate({
  id: "albo-2026-2673",
  source: "Albo Pretorio Comune di Lamezia Terme",
  source_url: OFFICIAL_ALBO_URL,
  retrieved_at: "2026-08-11T07:32:34.743Z",
  publication_number: "2026/2673",
  publication_start: "2026-08-10",
  publication_end: "2026-08-14",
  act_type: "CONVOCAZIONE CONSIGLIO COMUNALE",
  subject: "Avviso seduta di Consiglio Comunale.",
  document_url: null,
  content_hash:
    "31789ffe968c4991b8b066817d50b757920a36b0bc6f83bff5628f9012a4d108",
  verification_status: "official_source_acquired",
  privacy_risk: "low",
  public_visibility: "publishable",
});

const commissionProvenance: CouncilSessionV0Provenance = {
  noticeId: commissionCandidate.id,
  publicationNumber: commissionCandidate.publicationNumber,
  sourceLabel: commissionCandidate.source.label,
  sourceUrl: commissionCandidate.source.url,
  documentUrl: commissionCandidate.source.documentUrl,
  archivedDocumentUrl: COMMISSION_ARCHIVED_DOCUMENT_URL,
  sourceContentHash: commissionCandidate.source.contentHash,
  documentSha256:
    "842702b2044b4b6f9a7b21a65eac2ab59866ee3f321872e6b28fd481598be304",
  embeddedDocumentSha256:
    "3069388db15c43fdbf3cc980195f9c88ded602a6e9f8f89f358a006ce789096c",
  retrievedAt: commissionCandidate.source.retrievedAt,
  reviewedAt: SOURCE_REVIEWED_AT,
  sourceReviewStatus: "reviewed_against_official_attachment",
};

const councilProvenance: CouncilSessionV0Provenance = {
  noticeId: councilCandidate.id,
  publicationNumber: councilCandidate.publicationNumber,
  sourceLabel: councilCandidate.source.label,
  sourceUrl: councilCandidate.source.url,
  documentUrl: null,
  archivedDocumentUrl: null,
  sourceContentHash: councilCandidate.source.contentHash,
  documentSha256: null,
  embeddedDocumentSha256: null,
  retrievedAt: councilCandidate.source.retrievedAt,
  reviewedAt: SOURCE_REVIEWED_AT,
  sourceReviewStatus: "official_metadata_only",
};

const commissionAgenda = [
  "Esame della proposta di deliberazione del Consiglio comunale n. 2259 del 6 agosto 2026: assestamento generale di bilancio e salvaguardia degli equilibri per l'esercizio 2026.",
  "Esame delle proposte di deliberazione del Consiglio comunale relative a debiti fuori bilancio derivanti da sentenze esecutive.",
] as const;

function commissionSession(
  date: "2026-08-10" | "2026-08-11",
): CouncilSessionV0 {
  const italianDate =
    date === "2026-08-10" ? "10 agosto 2026" : "11 agosto 2026";
  const documentUrl = commissionCandidate.source.documentUrl ?? undefined;

  return {
    id: `albo-2026-2648-commissione-ii-${date}`,
    kind: "commission",
    isDemoFixture: false,
    provenance: commissionProvenance,
    contextResearch: commissionContextResearch,
    title: {
      key: "title",
      label: "Titolo",
      value: `II Commissione consiliare permanente — seduta del ${italianDate}`,
      sourceStatus: "verificato",
      sourceUrl: documentUrl,
      limit:
        "Titolo normalizzato dalla convocazione ufficiale; la fonte identifica la II Commissione come Servizi economici e finanziari.",
    },
    scheduledAt: {
    key: "scheduledAt",
    label: "Data e ora",
    value: "2026-08-13",
    sourceStatus: "verificato",
    sourceUrl: COUNCIL_SESSION_EVIDENCE_URL,
    limit:
      "La data è indicata nella pubblicazione istituzionale 2026/2755; l'orario non è presente nella fonte e non viene ricavato dalla stampa.",
  },
  sessionStatus: {
    key: "sessionStatus",
    label: "Stato seduta",
    value: "svolta",
    sourceStatus: "verificato",
    sourceUrl: COUNCIL_SESSION_EVIDENCE_URL,
    limit:
      "La determinazione successiva richiama un debito approvato nella seduta del 13 agosto; non documenta presenze, durata o trattazione completa.",
  },
  agenda: {
    key: "agenda",
    label: "Ordine del giorno",
    value: null,
    sourceStatus: "assente",
    sourceUrl: councilCandidate.source.url,
    limit:
      "Non rilevato nei metadati ufficiali acquisiti; serve l'allegato o un'altra fonte istituzionale per pubblicarlo.",
  },
  sourceLink: {
    key: "sourceLink",
    label: "Fonte",
    value: "Apri l'evidenza istituzionale sulla seduta",
    sourceStatus: "verificato",
    sourceUrl: COUNCIL_SESSION_EVIDENCE_URL,
    limit:
      "La pubblicazione 2026/2755 conferma organo, data e approvazione di un debito; l'avviso originario 2026/2673 resta privo di allegato nell'export acquisito.",
  },
  liveStreaming: {
    key: "liveStreaming",
    label: "Streaming live",
    value: null,
    sourceStatus: "assente",
    sourceUrl: councilCandidate.source.url,
    limit:
      "Non rilevato nei metadati dell'avviso; il controllo dei canali video istituzionali resta separato.",
  },
  recording: {
    key: "recording",
    label: "Registrazione",
    value: null,
    sourceStatus: "assente",
    sourceUrl: councilCandidate.source.url,
    limit:
      "Non rilevata nei metadati dell'avviso; non equivale a dichiararne l'inesistenza.",
  },
  minutesOrReport: {
    key: "minutesOrReport",
    label: "Verbale o resoconto",
    value: null,
    sourceStatus: "assente",
    sourceUrl: councilCandidate.source.url,
    limit:
      "Non rilevato nei metadati acquisiti; una pubblicazione successiva richiede un controllo dedicato.",
  },
  lastCheckedAt: {
    key: "lastCheckedAt",
    label: "Ultimo controllo",
    value: COUNCIL_CONTEXT_RESEARCHED_AT,
    sourceStatus: "verificato",
    sourceUrl: COUNCIL_SESSION_EVIDENCE_URL,
    limit:
      "Controllo della nuova pubblicazione istituzionale e nuova ricerca di articoli e video nella finestra dal 6 al 20 agosto 2026.",
  },
  dataLimits: {
    key: "dataLimits",
    label: "Limiti del dato",
    value: [
      "Data e svolgimento sono confermati dalla pubblicazione istituzionale 2026/2755; l'orario resta da verificare.",
      "La fonte successiva documenta l'approvazione di un debito fuori bilancio, non l'ordine del giorno completo, le presenze o tutte le votazioni.",
      "L'avviso originario 2026/2673 non espone un allegato nell'export acquisito.",
      "Il richiamo video di City One non ha ancora una pagina stabile verificabile.",
    ],
    sourceStatus: "parziale",
    sourceUrl: COUNCIL_SESSION_EVIDENCE_URL,
    limit:
      "Arricchimento prudenziale basato su una fonte istituzionale successiva; nessuna informazione editoriale completa i campi ufficiali mancanti.",
  },
};

export const councilSessionV0ReviewedRecords: readonly CouncilSessionV0[] = [
  commissionSession("2026-08-11"),
  commissionSession("2026-08-10"),
  councilVerifiedSession,
];

const reviewedRecordsById = new Map(
  councilSessionV0ReviewedRecords.map((session) => [session.id, session]),
);

export function findCouncilSessionV0ReviewedRecord(
  id: string,
): CouncilSessionV0 | undefined {
  return reviewedRecordsById.get(id);
}
