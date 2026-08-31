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
const COMMISSION_VI_NOTICE_URL =
  "https://albo.tinnvision.cloud/allegati/2026_2788_2_P?ente=00301390795";
const COMMISSION_VI_ARCHIVED_DOCUMENT_URL =
  "/data/public/albo/documents/2026/165152190ac39451d35caf5815bfb4d7d6d7ee66c20abe630c98b47d62858c72.pdf";
const COUNCIL_SESSION_EVIDENCE_URL =
  "https://albo.tinnvision.cloud/allegati/2026_2755_6_ALLEG?ente=00301390795";
const COUNCIL_SESSION_EVIDENCE_ARCHIVE_URL =
  "/data/public/albo/documents/2026/e008e83a4d7ae0a4672146b73ebc62e64d565a26eeb043cafaf9e45d92ecf2c5.pdf";
const COUNCIL_PROJECTS_OF_LIFE_URL =
  "https://www.comune.lamezia-terme.cz.it/it/news/115163/lamezia-amministrazione-comunale-su-disabilita-sottoscritti-142-progetti-di-vita-ora-rafforziamo-rete-territoriale";
const COUNCIL_CITY_ONE_RECORDING_URL =
  "https://www.cityonelamezia.it/episodio/video/consiglio-comunale-del-13-agosto-consiglio-comunale/?format=video";
const COUNCIL_VITALE_VIDEO_URL = "https://www.instagram.com/reel/DcGRDc8o1qI/";
const SOURCE_REVIEWED_AT = "2026-08-22T12:10:49Z";
const CONTEXT_RESEARCHED_AT = "2026-08-23T10:48:08Z";
const COUNCIL_CONTEXT_RESEARCHED_AT = "2026-08-27T21:49:11Z";
const COMMISSION_VI_RESEARCHED_AT = "2026-08-31T22:02:47Z";

const councilContextResearch: CouncilSessionV0ContextResearch = {
  status: "reviewed_matches",
  checkedAt: COUNCIL_CONTEXT_RESEARCHED_AT,
  searchNote:
    "La pubblicazione istituzionale 2026/2755 conferma una seduta del Consiglio comunale il 13 agosto 2026. Sette articoli e comunicati coincidono con organo, data e temi distintivi; il comunicato ufficiale del Comune del 14 agosto conferma che l'informativa sui Progetti di Vita è stata resa durante quella seduta, senza documentarne l'ordine del giorno completo. La stampa non completa l'orario o l'ordine del giorno ufficiale. Sono disponibili la pagina editoriale stabile della registrazione integrale pubblicata da City One il 17 agosto e due estratti attribuiti a Salvatore Vescio e Annita Vitale; il video City One già individuato su Facebook non è contato una seconda volta. Tutti restano distinti da eventuali registrazioni istituzionali. I temi sono ricostruiti separatamente dalla copertura editoriale.",
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
        'Lamezia, Amministrazione Comunale su disabilità: "Sottoscritti 142 Progetti di Vita. Ora rafforziamo rete territoriale"',
      url: "https://www.lametino.it/ultimora/lamezia-amministrazione-comunale-su-disabilita-sottoscritti-142-progetti-di-vita-ora-rafforziamo-rete-territoriale.html",
      publisher: "il Lametino",
      publishedAt: "2026-08-14",
      relationship: "same_session",
      relevanceNote:
        "Riprende l'informativa sui Progetti di Vita resa nel Consiglio del 13 agosto, ora collegata anche al comunicato ufficiale del Comune; non documenta l'ordine del giorno completo.",
      reviewedAt: COUNCIL_CONTEXT_RESEARCHED_AT,
    },
    {
      title:
        'Lamezia, Amministrazione Comunale su disabilità: "Sottoscritti 142 Progetti di Vita. Ora rafforziamo la rete territoriale"',
      url: COUNCIL_PROJECTS_OF_LIFE_URL,
      publisher: "Comune di Lamezia Terme",
      publishedAt: "2026-08-14",
      relationship: "same_session",
      relevanceNote:
        "Il comunicato istituzionale indica espressamente che i dati sui Progetti di Vita sono stati comunicati durante il Consiglio comunale del 13 agosto 2026. Verifica questo singolo tema trattato, non l'ordine del giorno completo, votazioni o altri esiti.",
      reviewedAt: COUNCIL_CONTEXT_RESEARCHED_AT,
    },
  ],
  media: [
    {
      title: "Consiglio comunale del 13 Agosto",
      url: COUNCIL_CITY_ONE_RECORDING_URL,
      publisher: "City One",
      publishedAt: "2026-08-17",
      relationship: "same_session",
      mediaType: "full_recording",
      availability: "replay_available",
      relevanceNote:
        "La pagina editoriale di City One, pubblicata il 17 agosto, identifica e ospita il video del Consiglio comunale del 13 agosto 2026. Sostituisce come collegamento stabile la stessa registrazione già individuata su Facebook, senza duplicarla. Non prova da sola completezza, svolgimento o risultati della seduta.",
      reviewedAt: COUNCIL_CONTEXT_RESEARCHED_AT,
    },
    {
      title: "Salvatore Vescio — Consiglio comunale del 13 agosto 2026",
      url: "https://www.instagram.com/reel/DcB8mBgtILm/",
      publisher: "Liberali Calabria",
      publishedAt: "2026-08-14",
      relationship: "same_session",
      mediaType: "excerpt",
      availability: "replay_available",
      relevanceNote:
        "Il titolo identifica espressamente il consigliere, l'organo e la data del 13 agosto 2026. È un estratto editoriale esterno: non prova completezza, programmazione, esiti o deliberazioni della seduta.",
      reviewedAt: COUNCIL_CONTEXT_RESEARCHED_AT,
    },
    {
      title: "Annita Vitale — intervento sul Piano di riequilibrio finanziario",
      url: COUNCIL_VITALE_VIDEO_URL,
      publisher: "Annita Vitale",
      publishedAt: "2026-08-16",
      relationship: "same_session",
      mediaType: "excerpt",
      availability: "replay_available",
      relevanceNote:
        "Il fotogramma del reel identifica espressamente il Consiglio comunale del 13 agosto 2026 e un intervento sul Piano di riequilibrio finanziario; la descrizione espone una posizione politica. È un estratto editoriale esterno e non certifica ordine del giorno, votazioni, risultati o completezza della seduta.",
      reviewedAt: COUNCIL_CONTEXT_RESEARCHED_AT,
    },
  ],
  editorialAgenda: [
    {
      title:
        "Variazione al bilancio 2026–2028, assestamento e salvaguardia degli equilibri",
      sourceUrls: [
        "https://www.cityonelamezia.it/convocato-consiglio-comunale-di-lamezia-terme-in-prossimita-del-ferragosto/",
        "https://www.lametino.it/ultime/lamezia-33-punti-in-consiglio-comunale-il-13-agosto-al-centro-assestamento-e-salvaguardia-equilibri-di-bilancio.html",
      ],
      confidence: "high",
      reason:
        "Entrambe le testate associano questi temi alla seduta del 13 agosto; il resoconto successivo del Lametino ne riferisce anche la trattazione. Non è un ordine del giorno ufficiale acquisito.",
    },
    {
      title: "Piano di riequilibrio finanziario pluriennale",
      sourceUrls: [COUNCIL_VITALE_VIDEO_URL],
      confidence: "medium",
      reason:
        "Il reel di Annita Vitale identifica il proprio contenuto come intervento sul Piano di riequilibrio finanziario nel Consiglio del 13 agosto. La singola fonte documenta un tema emerso dalla copertura, non un punto dell'ordine del giorno ufficiale né l'esito di una votazione.",
    },
    {
      title:
        "Ripiano parziale delle perdite di Sacal e fondo per le società partecipate",
      sourceUrls: [
        "https://www.cityonelamezia.it/convocato-consiglio-comunale-di-lamezia-terme-in-prossimita-del-ferragosto/",
        "https://www.lametino.it/ultime/lamezia-33-punti-in-consiglio-comunale-il-13-agosto-al-centro-assestamento-e-salvaguardia-equilibri-di-bilancio.html",
      ],
      confidence: "high",
      reason:
        "Il tema è riportato da entrambe le anticipazioni editoriali e ripreso dal resoconto post-seduta; resta una ricostruzione da stampa.",
    },
    {
      title:
        "Riconoscimento di debiti fuori bilancio e posizioni debitorie del Comune",
      sourceUrls: [
        "https://www.cityonelamezia.it/convocato-consiglio-comunale-di-lamezia-terme-in-prossimita-del-ferragosto/",
        "https://www.lametino.it/ultime/lamezia-33-punti-in-consiglio-comunale-il-13-agosto-al-centro-assestamento-e-salvaguardia-equilibri-di-bilancio.html",
      ],
      confidence: "high",
      reason:
        "Le due testate riportano numerosi punti sui debiti fuori bilancio; la fonte istituzionale 2026/2755 conferma soltanto uno specifico debito approvato.",
    },
    {
      title:
        "Disabilità, Progetti di Vita, continuità assistenziale e inclusione scolastica",
      sourceUrls: [
        "https://www.cityonelamezia.it/convocato-consiglio-comunale-di-lamezia-terme-in-prossimita-del-ferragosto/",
        "https://www.lametino.it/ultime/lamezia-33-punti-in-consiglio-comunale-il-13-agosto-al-centro-assestamento-e-salvaguardia-equilibri-di-bilancio.html",
        COUNCIL_PROJECTS_OF_LIFE_URL,
      ],
      confidence: "high",
      reason:
        "Mozioni e interrogazioni su questi temi compaiono nelle due ricostruzioni editoriali; il comunicato del Comune conferma inoltre che l'informativa sui Progetti di Vita è stata resa durante la seduta. Non se ne inferiscono l'ordine del giorno completo, votazioni o risultati ulteriori.",
    },
    {
      title:
        "Riqualificazione urbana, parchi, fascia costiera ed ex Cinema Grandinetti",
      sourceUrls: [
        "https://www.cityonelamezia.it/convocato-consiglio-comunale-di-lamezia-terme-in-prossimita-del-ferragosto/",
        "https://www.lametino.it/ultime/lamezia-33-punti-in-consiglio-comunale-il-13-agosto-al-centro-assestamento-e-salvaguardia-equilibri-di-bilancio.html",
      ],
      confidence: "high",
      reason:
        "Le due testate elencano interrogazioni e mozioni su spazi pubblici, parchi, pineta, lungomare e area dell'ex Cinema Grandinetti.",
    },
    {
      title:
        "Castello Normanno-Svevo e gestione del Teatro comunale Grandinetti",
      sourceUrls: [
        "https://www.cityonelamezia.it/convocato-consiglio-comunale-di-lamezia-terme-in-prossimita-del-ferragosto/",
        "https://www.lametino.it/ultime/lamezia-33-punti-in-consiglio-comunale-il-13-agosto-al-centro-assestamento-e-salvaguardia-equilibri-di-bilancio.html",
      ],
      confidence: "high",
      reason:
        "Entrambe le anticipazioni includono quesiti sul recupero del Castello e sul futuro affidamento del Teatro; non documentano gli esiti.",
    },
    {
      title:
        "Digitalizzazione dell'ente e riconciliazione dei pagamenti tributari",
      sourceUrls: [
        "https://www.cityonelamezia.it/convocato-consiglio-comunale-di-lamezia-terme-in-prossimita-del-ferragosto/",
        "https://www.lametino.it/ultime/lamezia-33-punti-in-consiglio-comunale-il-13-agosto-al-centro-assestamento-e-salvaguardia-equilibri-di-bilancio.html",
      ],
      confidence: "high",
      reason:
        "Il tema è riportato con formulazione coerente dalle due testate come interrogazione; non è trasferito nel campo ufficiale agenda.",
    },
    {
      title:
        "Sicurezza e servizi: cinghiali, SUEM 118, degrado urbano e incendio presso un'azienda di pneumatici",
      sourceUrls: [
        "https://www.cityonelamezia.it/convocato-consiglio-comunale-di-lamezia-terme-in-prossimita-del-ferragosto/",
        "https://www.lametino.it/ultime/lamezia-33-punti-in-consiglio-comunale-il-13-agosto-al-centro-assestamento-e-salvaguardia-equilibri-di-bilancio.html",
      ],
      confidence: "high",
      reason:
        "I temi ricorrono nelle due ricostruzioni editoriali; la loro presenza non certifica discussione completa, decisioni o seguito amministrativo.",
    },
  ],
};

const commissionViContextResearch: CouncilSessionV0ContextResearch = {
  status: "checked_no_match",
  checkedAt: COMMISSION_VI_RESEARCHED_AT,
  searchNote:
    "Ricerca eseguita dopo la revisione dell'allegato ufficiale 2026/2788, usando VI Commissione, le date del 1° e 4 settembre 2026, l'orario delle 12:00 e i due punti distintivi dell'ordine del giorno. Non sono emersi articoli, dirette, registrazioni, clip o interviste collegabili con sufficiente precisione. La ricerca sarà ripetuta in prossimità e dopo le sedute; non sono ricostruiti temi editoriali perché l'ordine del giorno ufficiale è disponibile.",
  articles: [],
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

const commissionViCandidate = requireCandidate({
  id: "albo-2026-2788",
  source: "Albo Pretorio Comune di Lamezia Terme",
  source_url: OFFICIAL_ALBO_URL,
  retrieved_at: "2026-08-31T13:37:46.902Z",
  publication_number: "2026/2788",
  publication_start: "2026-08-31",
  publication_end: "2026-09-07",
  act_type: "CONVOCAZIONI COMMISSIONI CONSILIARI",
  subject:
    "Convocazione 6° Commissione Consiliare Permanente. Calendario lavori.",
  document_url: COMMISSION_VI_NOTICE_URL,
  content_hash:
    "32af1fef2fdc84892259f836c0cc6c1aa70d1e404d664a91f7cad339e3c24629",
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

const commissionViProvenance: CouncilSessionV0Provenance = {
  noticeId: commissionViCandidate.id,
  publicationNumber: commissionViCandidate.publicationNumber,
  sourceLabel: commissionViCandidate.source.label,
  sourceUrl: commissionViCandidate.source.url,
  documentUrl: commissionViCandidate.source.documentUrl,
  archivedDocumentUrl: COMMISSION_VI_ARCHIVED_DOCUMENT_URL,
  sourceContentHash: commissionViCandidate.source.contentHash,
  documentSha256:
    "165152190ac39451d35caf5815bfb4d7d6d7ee66c20abe630c98b47d62858c72",
  embeddedDocumentSha256:
    "c09e7aacd7d22f77f8e72db5b5198203748b5f032dfd604b236f46fe8a28197d",
  retrievedAt: commissionViCandidate.source.retrievedAt,
  reviewedAt: COMMISSION_VI_RESEARCHED_AT,
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
  reviewedAt: COUNCIL_CONTEXT_RESEARCHED_AT,
  sourceReviewStatus: "reviewed_against_later_official_source",
  supplementalEvidence: [
    {
      publicationNumber: "2026/2755",
      sourceLabel: "Albo Pretorio Comune di Lamezia Terme",
      sourceUrl: COUNCIL_SESSION_EVIDENCE_URL,
      archivedDocumentUrl: COUNCIL_SESSION_EVIDENCE_ARCHIVE_URL,
      documentSha256:
        "e008e83a4d7ae0a4672146b73ebc62e64d565a26eeb043cafaf9e45d92ecf2c5",
      retrievedAt: COUNCIL_CONTEXT_RESEARCHED_AT,
      reviewedAt: COUNCIL_CONTEXT_RESEARCHED_AT,
      verificationNote:
        "La determinazione conferma la seduta del 13 agosto 2026 e l'approvazione di uno specifico debito fuori bilancio; non documenta orario, ordine del giorno completo, presenze o tutte le votazioni.",
    },
  ],
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
      value: `${date}T09:30:00+02:00`,
      sourceStatus: "verificato",
      sourceUrl: documentUrl,
      limit:
        "Data e ora trascritte dall'allegato ufficiale; indicano la programmazione, non provano lo svolgimento.",
    },
    sessionStatus: {
      key: "sessionStatus",
      label: "Stato seduta",
      value: "non_verificata",
      sourceStatus: "parziale",
      sourceUrl: documentUrl,
      limit:
        "La convocazione documenta la seduta programmata; non è stata collegata una fonte che ne confermi lo svolgimento o l'eventuale rinvio.",
    },
    agenda: {
      key: "agenda",
      label: "Ordine del giorno",
      value: commissionAgenda,
      sourceStatus: "verificato",
      sourceUrl: documentUrl,
      limit:
        "Sintesi fedele dei due punti riportati nell'allegato; per formulazione completa e riferimenti normativi consultare il documento originale.",
    },
    sourceLink: {
      key: "sourceLink",
      label: "Fonte",
      value: "Apri la convocazione nell'Albo ufficiale",
      sourceStatus: "verificato",
      sourceUrl: documentUrl,
      limit: `Pubblicazione ${commissionCandidate.publicationNumber}; copia acquisita e verificata tramite hash nel repository.`,
    },
    liveStreaming: {
      key: "liveStreaming",
      label: "Streaming live",
      value: null,
      sourceStatus: "assente",
      sourceUrl: documentUrl,
      limit:
        "Non rilevato nella convocazione consultata; ciò non esclude che possa essere stato comunicato su un altro canale.",
    },
    recording: {
      key: "recording",
      label: "Registrazione",
      value: null,
      sourceStatus: "assente",
      sourceUrl: documentUrl,
      limit:
        "Non rilevata nella fonte monitorata; nessuna conclusione viene tratta sulla disponibilità complessiva di registrazioni.",
    },
    minutesOrReport: {
      key: "minutesOrReport",
      label: "Verbale o resoconto",
      value: null,
      sourceStatus: "assente",
      sourceUrl: documentUrl,
      limit:
        "Non rilevato nella convocazione; verbali o resoconti successivi richiedono una ricerca separata nelle fonti istituzionali.",
    },
    lastCheckedAt: {
      key: "lastCheckedAt",
      label: "Ultimo controllo",
      value: SOURCE_REVIEWED_AT,
      sourceStatus: "verificato",
      sourceUrl: documentUrl,
      limit:
        "Controllo della copia ufficiale archiviata; future modifiche o nuove pubblicazioni non sono incluse automaticamente in questa scheda revisionata.",
    },
    dataLimits: {
      key: "dataLimits",
      label: "Limiti del dato",
      value: [
        "La stessa convocazione programma due sedute, il 10 e l'11 agosto 2026 alle 09:30.",
        "La scheda non certifica svolgimento, presenze, esiti o completezza storica.",
        "Streaming, registrazione e verbale sono indicati come non rilevati nella fonte consultata, non come inesistenti.",
      ],
      sourceStatus: "parziale",
      sourceUrl: documentUrl,
      limit:
        "Prima tranche editoriale basata su un solo avviso ufficiale; la copertura delle Commissioni non è completa.",
    },
  };
}

const commissionViAgenda = [
  "Denominazione comunale d'origine (De.Co.).",
  "Regolamento chioschi.",
] as const;

function commissionViSession(
  date: "2026-09-01" | "2026-09-04",
): CouncilSessionV0 {
  const italianDate =
    date === "2026-09-01" ? "1 settembre 2026" : "4 settembre 2026";
  const documentUrl = commissionViCandidate.source.documentUrl ?? undefined;

  return {
    id: `albo-2026-2788-commissione-vi-${date}`,
    kind: "commission",
    isDemoFixture: false,
    provenance: commissionViProvenance,
    contextResearch: commissionViContextResearch,
    title: {
      key: "title",
      label: "Titolo",
      value: `VI Commissione consiliare permanente — seduta del ${italianDate}`,
      sourceStatus: "verificato",
      sourceUrl: documentUrl,
      limit:
        "Titolo normalizzato dalla convocazione ufficiale; la fonte identifica la VI Commissione come Sviluppo economico ed attività produttive.",
    },
    scheduledAt: {
      key: "scheduledAt",
      label: "Data e ora",
      value: `${date}T12:00:00+02:00`,
      sourceStatus: "verificato",
      sourceUrl: documentUrl,
      limit:
        "Data e ora trascritte dall'allegato ufficiale; indicano la programmazione, non provano lo svolgimento.",
    },
    sessionStatus: {
      key: "sessionStatus",
      label: "Stato seduta",
      value: "non_verificata",
      sourceStatus: "parziale",
      sourceUrl: documentUrl,
      limit:
        "La convocazione documenta la seduta programmata; non è stata collegata una fonte che ne confermi lo svolgimento o l'eventuale rinvio.",
    },
    agenda: {
      key: "agenda",
      label: "Ordine del giorno",
      value: commissionViAgenda,
      sourceStatus: "verificato",
      sourceUrl: documentUrl,
      limit:
        "Trascrizione fedele dei due punti riportati nell'allegato ufficiale; non documenta discussione, votazioni o esiti.",
    },
    sourceLink: {
      key: "sourceLink",
      label: "Fonte",
      value: "Apri il calendario ufficiale della VI Commissione",
      sourceStatus: "verificato",
      sourceUrl: documentUrl,
      limit: `Pubblicazione ${commissionViCandidate.publicationNumber}; copia acquisita e verificata tramite hash nel repository.`,
    },
    liveStreaming: {
      key: "liveStreaming",
      label: "Streaming live",
      value: null,
      sourceStatus: "assente",
      sourceUrl: documentUrl,
      limit:
        "Non rilevato nella convocazione consultata; ciò non esclude che possa essere comunicato su un altro canale.",
    },
    recording: {
      key: "recording",
      label: "Registrazione",
      value: null,
      sourceStatus: "assente",
      sourceUrl: documentUrl,
      limit:
        "Non rilevata nella fonte monitorata; nessuna conclusione viene tratta sulla disponibilità complessiva di registrazioni.",
    },
    minutesOrReport: {
      key: "minutesOrReport",
      label: "Verbale o resoconto",
      value: null,
      sourceStatus: "assente",
      sourceUrl: documentUrl,
      limit:
        "Non rilevato nella convocazione; verbali o resoconti successivi richiedono una ricerca separata nelle fonti istituzionali.",
    },
    lastCheckedAt: {
      key: "lastCheckedAt",
      label: "Ultimo controllo",
      value: COMMISSION_VI_RESEARCHED_AT,
      sourceStatus: "verificato",
      sourceUrl: documentUrl,
      limit:
        "Controllo della copia ufficiale archiviata e ricerca contestuale iniziale; nuovi collegamenti saranno verificati in prossimità e dopo la seduta.",
    },
    dataLimits: {
      key: "dataLimits",
      label: "Limiti del dato",
      value: [
        "La stessa convocazione programma due sedute, il 1° e il 4 settembre 2026 alle 12:00.",
        "La sede non è indicata nell'allegato ufficiale e non viene inferita.",
        "La scheda non certifica svolgimento, presenze, esiti o completezza storica.",
        "Streaming, registrazione e verbale sono indicati come non rilevati nella fonte consultata, non come inesistenti.",
        "Non sono emersi collegamenti editoriali sufficientemente precisi al primo controllo.",
      ],
      sourceStatus: "parziale",
      sourceUrl: documentUrl,
      limit:
        "Prima verifica basata sul calendario ufficiale; la ricerca di copertura sarà ripetuta durante la finestra attiva.",
    },
  };
}

const councilVerifiedSession: CouncilSessionV0 = {
  id: "albo-2026-2673-consiglio-comunale",
  kind: "council",
  isDemoFixture: false,
  provenance: councilProvenance,
  contextResearch: councilContextResearch,
  title: {
    key: "title",
    label: "Titolo",
    value: "Consiglio comunale — seduta del 13 agosto 2026",
    sourceStatus: "verificato",
    sourceUrl: councilCandidate.source.url,
    limit: `Titolo normalizzato dall'oggetto della pubblicazione ${councilCandidate.publicationNumber} e dalla data confermata dalla pubblicazione istituzionale 2026/2755.`,
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
      "Non rilevato nei metadati ufficiali acquisiti; la fonte successiva conferma un solo punto e non viene usata per ricostruire l'elenco completo.",
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
      "La registrazione City One è copertura editoriale esterna e non una registrazione istituzionale.",
    ],
    sourceStatus: "parziale",
    sourceUrl: COUNCIL_SESSION_EVIDENCE_URL,
    limit:
      "Arricchimento prudenziale basato su una fonte istituzionale successiva; nessuna informazione editoriale completa i campi ufficiali mancanti.",
  },
};

export const councilSessionV0ReviewedRecords: readonly CouncilSessionV0[] = [
  commissionViSession("2026-09-04"),
  commissionViSession("2026-09-01"),
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
