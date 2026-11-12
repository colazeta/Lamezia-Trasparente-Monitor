import type { PublicProposal } from "./propostePubblicheCore";

/**
 * Semantic profile for civic proposals.
 *
 * The complete official taxonomy is retained in the data layer even when only a
 * subset is currently used by published proposals. Public presentation uses one
 * primary subject; secondary subjects and semantic metadata remain available for
 * analysis and audit without being pushed into the default UI.
 */
export const PA_PUBLIC_SERVICE_SUBJECT_SCHEME = {
  label: "Vocabolario Controllato sulle Materie dei Servizi Pubblici",
  uri: "https://w3id.org/italia/controlled-vocabulary/classifications-for-public-services/public-services-subject-matters",
  sourceUrl:
    "https://schema.gov.it/semantic-assets/details/?uri=https%3A%2F%2Fw3id.org%2Fitalia%2Fcontrolled-vocabulary%2Fclassifications-for-public-services%2Fpublic-services-subject-matters",
  ontologyUri: "https://w3id.org/italia/onto/CPSV",
  conceptCount: 15,
  numberOfLevels: 1,
} as const;

export const PA_PUBLIC_SERVICE_SUBJECT_CODES = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
] as const;

export type PaPublicServiceSubjectCode =
  (typeof PA_PUBLIC_SERVICE_SUBJECT_CODES)[number];

function publicServiceSubject(
  code: PaPublicServiceSubjectCode,
  label: string,
) {
  return {
    code,
    label,
    uri: `${PA_PUBLIC_SERVICE_SUBJECT_SCHEME.uri}/${code}`,
    schemeUri: PA_PUBLIC_SERVICE_SUBJECT_SCHEME.uri,
    authority: "Agenzia per l'Italia Digitale",
    source: "schema.gov.it / AgID" as const,
  };
}

/**
 * Complete 15-concept official vocabulary used as the backend reference catalogue.
 * A concept being present here does not imply that it must be displayed in the UI
 * or that the current archive already contains a proposal classified under it.
 */
export const PA_PUBLIC_SERVICE_SUBJECTS = {
  "1": publicServiceSubject("1", "Educazione e formazione"),
  "2": publicServiceSubject("2", "Salute, benessere e assistenza"),
  "3": publicServiceSubject("3", "Vita lavorativa"),
  "4": publicServiceSubject("4", "Mobilità e trasporti"),
  "5": publicServiceSubject("5", "Catasto e urbanistica"),
  "6": publicServiceSubject("6", "Anagrafe e stato civile"),
  "7": publicServiceSubject("7", "Turismo"),
  "8": publicServiceSubject("8", "Giustizia e sicurezza pubblica"),
  "9": publicServiceSubject("9", "Tributi, finanze e contravvenzioni"),
  "10": publicServiceSubject("10", "Cultura e tempo libero"),
  "11": publicServiceSubject("11", "Ambiente"),
  "12": publicServiceSubject("12", "Impresa e commercio"),
  "13": publicServiceSubject("13", "Autorizzazioni"),
  "14": publicServiceSubject("14", "Appalti pubblici"),
  "15": publicServiceSubject("15", "Agricoltura e pesca"),
} as const satisfies Record<
  PaPublicServiceSubjectCode,
  {
    code: PaPublicServiceSubjectCode;
    label: string;
    uri: string;
    schemeUri: string;
    authority: string;
    source: "schema.gov.it / AgID";
  }
>;

export const EU_DATA_THEME_SCHEME = {
  label: "Data Theme",
  uri: "http://publications.europa.eu/resource/authority/data-theme",
  authority: "Publications Office of the European Union",
} as const;

export const PA_TRANSPARENCY_SUBJECT_SCHEME_URI =
  "https://w3id.org/italia/controlled-vocabulary/classifications-for-transparency/transparency-subject" as const;

export const OFFICIAL_FALLBACK_DATA_THEMES = {
  GOVE: {
    code: "GOVE",
    label: "Governo e settore pubblico",
    uri: "http://publications.europa.eu/resource/authority/data-theme/GOVE",
    schemeUri: EU_DATA_THEME_SCHEME.uri,
    authority: EU_DATA_THEME_SCHEME.authority,
    source: "EU Data Theme" as const,
    relatedOfficialUris: [PA_TRANSPARENCY_SUBJECT_SCHEME_URI],
  },
} as const;

/** No thematic LT extension is currently needed. */
export const LT_SEMANTIC_EXTENSIONS = {} as const;
export type LtSemanticExtensionId = never;
export type LtSemanticExtension = {
  id: string;
  label: string;
  definition: string;
  relatedOfficialUris: readonly string[];
};

export type OfficialFallbackDataThemeCode =
  keyof typeof OFFICIAL_FALLBACK_DATA_THEMES;
export type ProposalPaSubjectCode =
  | PaPublicServiceSubjectCode
  | OfficialFallbackDataThemeCode;

export type PaSemanticConcept = {
  code: ProposalPaSubjectCode;
  label: string;
  uri: string;
  schemeUri: string;
  authority: string;
  source: "schema.gov.it / AgID" | "EU Data Theme";
  relatedOfficialUris?: readonly string[];
};

type ProposalPaSubjectRef =
  | { scheme: "public-service-subject"; code: PaPublicServiceSubjectCode }
  | { scheme: "eu-data-theme"; code: OfficialFallbackDataThemeCode };

export type ProposalPaSemanticProfile = {
  primary: ProposalPaSubjectRef;
  secondary?: readonly ProposalPaSubjectRef[];
  mappingNote?: string;
};

const ps = (code: PaPublicServiceSubjectCode): ProposalPaSubjectRef => ({
  scheme: "public-service-subject",
  code,
});

const eu = (code: OfficialFallbackDataThemeCode): ProposalPaSubjectRef => ({
  scheme: "eu-data-theme",
  code,
});

const THEME_TO_PA_PROFILE: Record<string, ProposalPaSemanticProfile> = {
  "Programmazione del nuovo cimitero e verifica degli spazi cimiteriali": {
    primary: ps("5"),
    secondary: [ps("2")],
    mappingNote: "La richiesta concerne programmazione territoriale e fattibilità di una struttura cimiteriale: Catasto e urbanistica è primaria (AgID 5). I servizi alle famiglie nel contesto cimiteriale sono materia secondaria Salute, benessere e assistenza (AgID 2). Il mapping non dimostra proprietà, competenza istituzionale, carenze di posti o fattibilità: not_assessed.",
  },
  "Rigenerazione del verde urbano e microforeste": {
    primary: ps("11"),
    secondary: [ps("5")],
    mappingNote: "L'oggetto prevalente è il verde urbano con finalità ambientali (Ambiente, AgID 11); l'eventuale trasformazione di spazi pubblici giustifica Catasto e urbanistica come secondaria (AgID 5). Il metodo e i benefici sono da verificare, senza attribuire enti competenti dal tema: not_assessed.",
  },
  "Verifica e adeguamento del Regolamento Edilizio Urbanistico": {
    primary: ps("5"),
    mappingNote: "La richiesta di verifica e possibile modifica del REU ricade nella materia ufficiale Catasto e urbanistica (AgID 5). L'esame tecnico e le procedure normative non sono un'attribuzione automatica di competenza al destinatario; not_assessed fino ad accertamento giuridico specifico.",
  },
  "Programmazione e gestione culturale dell\u0027ex Cinema Grandinetti di Sambiase": {
    primary: ps("10"),
    secondary: [ps("5")],
    mappingNote:
      "La richiesta prevalente riguarda la gestione e la programmazione dell\u0027uso culturale della struttura (AgID 10 Cultura e tempo libero). Il recupero dell\u0027immobile è classificato soltanto come seconda materia ufficiale (AgID 5 Catasto e urbanistica). L\u0027interlocuzione con il Settore Patrimonio non determina alcuna competenza formalmente accertata: not_assessed.",
  },
  "Collocazione e potenziamento del corso universitario di Infermieristica": {
    primary: ps("1"),
    secondary: [ps("2")],
    mappingNote:
      "La richiesta principale riguarda sede e organizzazione della formazione universitaria (Educazione e formazione, materia ufficiale AgID 1); il contesto clinico del presidio ospedaliero giustifica la classificazione secondaria Salute, benessere e assistenza (AgID 2). Il mapping non attribuisce al Comune, all\u0027Università o all\u0027azienda sanitaria alcuna competenza non dimostrata: not_assessed.",
  },
  "Manutenzione e sicurezza stradale di via Guido Dorso": {
    primary: ps("4"),
    secondary: [ps("8")],
    mappingNote:
      "La richiesta operativa concerne verifiche e ripristino della sede stradale di via Guido Dorso: materia prevalente Mobilità e trasporti (AgID 4). Giustizia e sicurezza pubblica (AgID 8) è una classificazione secondaria per il rischio segnalato, senza presupporre una criticità accertata. Il destinatario non prova la competenza amministrativa, che rimane not_assessed fino a fonte ufficiale sul tratto specifico. Nessuna misura del Piano Asfalti generale è qui considerata prova di recepimento o intervento sulla via.",
  },
  "Manutenzione e sicurezza dei loculi cimiteriali": {
    primary: ps("5"),
    secondary: [ps("2"), ps("8")],
    mappingNote:
      "La richiesta principale riguarda accertamenti e manutenzione di strutture cimiteriali: Catasto e urbanistica è la materia nazionale prevalente. Salute, benessere e assistenza e Giustizia e sicurezza pubblica sono secondarie analitiche per possibili profili igienico-sanitari e di incolumità, non per competenze accertate. Destinatario e competenza sono campi separati: not_assessed.",
  },
  "Decentramento istituzionale e partecipazione territoriale": {
    primary: eu("GOVE"),
    mappingNote:
      "La materia riguarda l'organizzazione istituzionale e il decentramento della rappresentanza, non contemplati con sufficiente precisione nelle 15 Materie dei servizi pubblici AgID. Si impiega la risorsa interoperabile ufficiale EU Data Theme GOVE, senza estensione LT e senza dedurre competenza o fattibilità ai sensi del TUEL.",
  },
  "Cerimoniale pubblico e memoria istituzionale": {
    primary: eu("GOVE"),
    mappingNote:
      "Il cerimoniale comunale e le regole di memoria istituzionale attengono alla governance pubblica, non a uno specifico servizio delle 15 Materie AgID; classificazione ufficiale EU Data Theme GOVE. Nessuna competenza o adozione di regolamento è dedotta dal destinatario; not_assessed.",
  },
  "Manutenzione e sicurezza della viabilità nelle contrade": {
    primary: ps("4"),
    secondary: [ps("8")],
    mappingNote:
      "La richiesta principale riguarda verifiche e manutenzione della rete viaria (Mobilità e trasporti); la possibile incidenza sulla sicurezza della circolazione è classificata come seconda materia ufficiale. Nessuna competenza è inferita da tema, luogo o destinatario.",
  },
  "Sicurezza e accessibilità degli ingressi scolastici": {
    primary: ps("8"),
    secondary: [ps("1"), ps("4")],
    mappingNote:
      "La misura principale richiesta è il presidio e il controllo dell'area scolastica (Giustizia e sicurezza pubblica). Educazione e formazione e Mobilità e trasporti sono secondarie per contesto e gestione dell'accesso veicolare. L'eventuale ripartizione delle competenze fra soggetti pubblici non è inferita.",
  },
  "Manutenzione dei corsi d'acqua e prevenzione idrogeologica": {
    primary: ps("11"),
    secondary: [ps("8")],
    mappingNote: "La richiesta di manutenzione dei corpi idrici ricade nella materia ufficiale Ambiente, con Giustizia e sicurezza pubblica come classificazione analitica secondaria per il rischio. Il mapping non attribuisce competenze istituzionali.",
  },
  "Co-programmazione del welfare e Terzo Settore": {
    primary: ps("2"),
    mappingNote: "Il contenuto riguarda la programmazione partecipata di servizi sociali: la materia ufficiale Salute, benessere e assistenza è primaria. Il coordinamento è una facet operativa, non una categoria tematica né una prova di competenza.",
  },
  "Accessibilità e funzionalità dei servizi ospedalieri": {
    primary: ps("2"),
    secondary: [ps("5")],
    mappingNote:
      "La richiesta è prevalentemente riferita alla funzionalità e all'accessibilità di servizi sanitari: Salute, benessere e assistenza è materia primaria ufficiale. Catasto e urbanistica resta classificazione secondaria per gli impianti dell'edificio; la materia non stabilisce chi sia istituzionalmente competente.",
  },
  "Accessibilità della sede municipale": {
    primary: ps("5"),
    secondary: [ps("2")],
    mappingNote:
      "L'intervento materiale di accessibilità della sede pubblica ricade nella materia ufficiale Catasto e urbanistica, con Salute, benessere e assistenza secondaria per l'attenzione alle persone con difficoltà motorie. Nessuna competenza istituzionale è inferita dal luogo o dal destinatario.",
  },
  "Coordinamento turistico e imposta di soggiorno": {
    primary: ps("7"),
    secondary: [ps("9"), ps("4"), ps("10")],
    mappingNote:
      "La misura principale riguarda il coordinamento dei servizi di accoglienza e della destinazione turistica (Turismo). Imposta di soggiorno, collegamenti e servizi culturali sono materie ufficiali secondarie per analisi e audit. Il mapping non attribuisce competenze al Comune, al Sindaco o agli altri destinatari.",
  },
  "Trasparenza e partecipazione sull'imposta di soggiorno": {
    primary: ps("9"),
    secondary: [ps("7")],
    mappingNote:
      "La richiesta principale riguarda verificabilità dei presupposti informativi e trasparenza nell'impiego degli introiti di un tributo (materia ufficiale Tributi, finanze e contravvenzioni). Turismo è materia secondaria, distinta dalla facet trasparenza. Il mapping non prova che il Comune abbia introdotto l'imposta né attribuisce competenza istituzionale.",
  },
  "Organizzazione dell'orario scolastico": {
    primary: ps("1"),
    secondary: [ps("4")],
    mappingNote:
      "Il riesame della distribuzione settimanale dell'orario didattico attiene a Educazione e formazione; Mobilità e trasporti è solo secondaria per le ricadute ipotizzate sulle famiglie e sugli spostamenti, non accertate. Il decreto scolastico n. 1386/2026 e la delibera n. 161/2025 documentano il ruolo organizzativo dell'istituto, non un recepimento della successiva petizione né una competenza del Comune a modificare gli orari.",
  },
  "Bilancio comunale e riequilibrio finanziario": {
    primary: ps("9"),
    mappingNote:
      "La revoca o rimodulazione del piano di riequilibrio finanziario riguarda Tributi, finanze e contravvenzioni. La materia non costituisce un assessment di competenza del destinatario.",
  },
  "Accesso agli impianti sportivi e alle palestre": {
    primary: ps("10"),
    secondary: [ps("5")],
    mappingNote:
      "L'accesso alle strutture per lo sport ricade in Cultura e tempo libero; Catasto e urbanistica è secondaria per il contesto degli impianti. Non si presume proprietà, competenza o disponibilità dei locali.",
  },
  "Educazione alla legalità e iniziative di sensibilizzazione": {
    primary: ps("1"),
    secondary: [ps("8")],
    mappingNote:
      "La misura principale concretamente richiesta riguarda attività di educazione e sensibilizzazione dei giovani (Educazione e formazione); legalità e sicurezza pubblica sono materie secondarie. La classificazione non assegna la competenza a scuola, Comune o altri destinatari.",
  },
  "Trattamento economico e indennità della Polizia di Frontiera": {
    primary: ps("3"),
    secondary: [ps("8")],
    mappingNote:
      "L'indennità richiesta riguarda principalmente il trattamento economico del personale (Vita lavorativa); la sicurezza pubblica è materia secondaria. Il mapping non attribuisce la competenza sull'indennità al destinatario del SAP.",
  },
  "Sicurezza pubblica e organici del Commissariato": {
    primary: ps("8"),
    mappingNote:
      "L\u0027organico del Commissariato di Polizia di Stato attiene alla sicurezza pubblica; la classificazione non assegna competenze istituzionali.",
  },
  "Sicurezza e decoro urbano": {
    primary: ps("8"),
    secondary: [ps("5")],
    mappingNote:
      "Sicurezza pubblica come materia primaria; urbanistica come classificazione secondaria dello spazio urbano interessato.",
  },
  "Decoro urbano e manutenzione": {
    primary: ps("5"),
  },
  "Welfare e servizi per l'infanzia": {
    primary: ps("1"),
    secondary: [ps("2")],
    mappingNote:
      "Il vocabolario nazionale include esplicitamente i nidi in Educazione e formazione e i servizi ai minori in Salute, benessere e assistenza.",
  },
  "Spazio pubblico e mobilità": {
    primary: ps("4"),
    secondary: [ps("5")],
  },
  "Welfare e disabilità": {
    primary: ps("2"),
  },
  "Scuola e inclusione": {
    primary: ps("1"),
  },
  "Rigenerazione urbana e patrimonio": {
    primary: ps("5"),
    secondary: [ps("10")],
  },
  "Ambiente e sicurezza urbana": {
    primary: ps("11"),
    secondary: [ps("8")],
  },
  "Ambiente, costa e spazio pubblico": {
    primary: ps("11"),
    secondary: [ps("5")],
  },
  "Mobilità ciclopedonale e sicurezza stradale": {
    primary: ps("4"),
    secondary: [ps("8")],
  },
  "Ambiente e servizi idrici": {
    primary: ps("11"),
    mappingNote:
      "La ricognizione e programmazione degli interventi sulla rete idrica ricade nella materia ufficiale Ambiente. L'infrastruttura non viene riclassificata automaticamente come urbanistica, né la materia definisce competenze istituzionali.",
  },
  "Sanità e rete ospedaliera": {
    primary: ps("2"),
  },
  "Manutenzione stradale del rione Cafaldo": {
    primary: ps("4"),
    secondary: [ps("8")],
    mappingNote:
      "Il rifacimento del manto stradale riguarda Mobilità e trasporti; i rischi per la circolazione sono classificati anche in Giustizia e sicurezza pubblica. Il mapping non determina la competenza dell’ente destinatario.",
  },
  "Scuola, clima e sicurezza": {
    primary: ps("1"),
    secondary: [ps("8")],
  },
  "Tutela animale e servizi civici": {
    primary: ps("2"),
    mappingNote:
      "La definizione ufficiale di Salute, benessere e assistenza include esplicitamente i servizi relativi agli animali.",
  },
  "Manutenzione urbana e prevenzione del rischio": {
    primary: ps("5"),
    secondary: [ps("8")],
  },
  "Mobilità, aeroporto e sviluppo territoriale": {
    primary: ps("4"),
    secondary: [ps("7")],
  },
  "Sport e impianti pubblici": {
    primary: ps("10"),
    secondary: [ps("5")],
    mappingNote:
      "La materia ufficiale Cultura e tempo libero include espressamente l'accesso a luoghi dello sport e, come etichetta alternativa, gli impianti sportivi. Catasto e urbanistica resta una classificazione secondaria per il contesto dell'infrastruttura pubblica.",
  },
  "Polizia locale e sicurezza urbana": {
    primary: ps("8"),
    mappingNote:
      "La richiesta riguarda l'operatività e l'organico della Polizia Locale come funzione di sicurezza pubblica locale. Le modalità di reclutamento restano facet operative e non introducono una tassonomia tematica parallela.",
  },
  "Ambiente e bonifica amianto": {
    primary: ps("11"),
    secondary: [ps("2")],
    mappingNote:
      "Censimento e gestione delle situazioni di rischio amianto nell’ambiente come materia primaria; salute come classificazione secondaria, non come assegnazione di competenza istituzionale.",
  },
  "Sicurezza stradale e controllo della velocità": {
    primary: ps("4"),
    secondary: [ps("8")],
    mappingNote:
      "Controlli della velocità e sicurezza della circolazione come mobilità e trasporti; sicurezza pubblica come classificazione analitica secondaria, non come attribuzione di competenza.",
  },
  "Manutenzione della viabilità e drenaggio urbano": {
    primary: ps("4"),
    secondary: [ps("11"), ps("8")],
    mappingNote:
      "La richiesta principale riguarda circolazione e manutenzione della strada, materia ufficiale Mobilità e trasporti. Acque meteoriche e prevenzione dei rischi sono classificazioni analitiche secondarie Ambiente e Giustizia e sicurezza pubblica. Nessuna competenza istituzionale viene inferita dalle materie.",
  },
  "Finanze comunali e riallocazione delle risorse": {
    primary: ps("9"),
    secondary: [ps("2")],
    mappingNote:
      "La misura riguarda la riallocazione di risorse comunali e le conseguenze su tributi e tariffe: materia primaria ufficiale Tributi, finanze e contravvenzioni. I servizi sociali indicati fra le destinazioni sono secondari. L'oggetto non determina competenze istituzionali.",
  },
  "Trasparenza e partecipazione democratica": {
    primary: eu("GOVE"),
    mappingNote:
      "Le 15 materie nazionali dei servizi pubblici non contengono una voce specifica per pubblicità dell'attività istituzionale e partecipazione civica. Si usa quindi il concetto ufficiale EU Data Theme GOVE — Governo e settore pubblico, mantenendo il vocabolario nazionale della trasparenza come risorsa ufficiale correlata.",
  },
};

function resolveOfficialConcept(ref: ProposalPaSubjectRef): PaSemanticConcept {
  if (ref.scheme === "public-service-subject") {
    return PA_PUBLIC_SERVICE_SUBJECTS[ref.code];
  }
  return OFFICIAL_FALLBACK_DATA_THEMES[ref.code];
}

export function getProposalPaSemanticProfile(
  proposal: Pick<PublicProposal, "id" | "theme">,
): ProposalPaSemanticProfile {
  const profile = THEME_TO_PA_PROFILE[proposal.theme];
  if (!profile) {
    throw new Error(
      `Missing official semantic mapping for proposal ${proposal.id} (theme: ${proposal.theme})`,
    );
  }
  return profile;
}

export function getProposalPrimaryPaSubject(
  proposal: Pick<PublicProposal, "id" | "theme">,
): PaSemanticConcept {
  return resolveOfficialConcept(getProposalPaSemanticProfile(proposal).primary);
}

export function getProposalSecondaryPaSubjects(
  proposal: Pick<PublicProposal, "id" | "theme">,
): readonly PaSemanticConcept[] {
  return (getProposalPaSemanticProfile(proposal).secondary ?? []).map(
    resolveOfficialConcept,
  );
}

export function getProposalOfficialPaSubjects(
  proposal: Pick<PublicProposal, "id" | "theme">,
): readonly PaSemanticConcept[] {
  return [
    getProposalPrimaryPaSubject(proposal),
    ...getProposalSecondaryPaSubjects(proposal),
  ];
}

export function getProposalLocalSemanticExtensions(
  proposal: Pick<PublicProposal, "id" | "theme">,
): readonly LtSemanticExtension[] {
  getProposalPaSemanticProfile(proposal);
  return [];
}

/** Complete backend catalogue, including subjects not yet used by proposals. */
export function getAllPaPublicServiceSubjects() {
  return PA_PUBLIC_SERVICE_SUBJECT_CODES.map(
    (code) => PA_PUBLIC_SERVICE_SUBJECTS[code],
  );
}

/** All official concepts used anywhere in the archive, including secondaries. */
export function getAvailablePaSubjects(proposals: readonly PublicProposal[]) {
  const conceptMap = new Map<string, PaSemanticConcept>();
  for (const proposal of proposals) {
    for (const concept of getProposalOfficialPaSubjects(proposal)) {
      conceptMap.set(concept.uri, concept);
    }
  }
  return sortConcepts([...conceptMap.values()]);
}

/** Only primary concepts: this is the intentionally compact public-navigation set. */
export function getAvailablePrimaryPaSubjects(
  proposals: readonly PublicProposal[],
) {
  const conceptMap = new Map<string, PaSemanticConcept>();
  for (const proposal of proposals) {
    const concept = getProposalPrimaryPaSubject(proposal);
    conceptMap.set(concept.uri, concept);
  }
  return sortConcepts([...conceptMap.values()]);
}

function sortConcepts(concepts: PaSemanticConcept[]) {
  return concepts.sort((a, b) => {
    const aNumber = Number(a.code);
    const bNumber = Number(b.code);
    if (Number.isFinite(aNumber) && Number.isFinite(bNumber)) return aNumber - bNumber;
    if (Number.isFinite(aNumber)) return -1;
    if (Number.isFinite(bNumber)) return 1;
    return a.label.localeCompare(b.label, "it");
  });
}

/** Analytical match: includes primary and secondary semantic classifications. */
export function proposalMatchesPaSubject(
  proposal: Pick<PublicProposal, "id" | "theme">,
  code: ProposalPaSubjectCode,
) {
  return getProposalOfficialPaSubjects(proposal).some(
    (concept) => concept.code === code,
  );
}

/** Public-navigation match: one proposal belongs to one primary matter. */
export function proposalMatchesPrimaryPaSubject(
  proposal: Pick<PublicProposal, "id" | "theme">,
  code: ProposalPaSubjectCode,
) {
  return getProposalPrimaryPaSubject(proposal).code === code;
}

export function getMappedProposalThemes() {
  return Object.keys(THEME_TO_PA_PROFILE).sort((a, b) =>
    a.localeCompare(b, "it"),
  );
}
