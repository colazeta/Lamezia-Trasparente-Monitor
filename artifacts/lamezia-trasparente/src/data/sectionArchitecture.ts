import { PUBLIC_INDEXABLE_ROUTES } from "./publicRoutes";

export type SectionStatus =
  | "demo"
  | "partial"
  | "verified"
  | "needs-source"
  | "under-construction";
export type SectionDataStatus = "demo" | "partial" | "missing" | "verified";
export type SectionLaunchReadiness =
  | "launch-ready"
  | "launch-ready-with-caveats"
  | "not-launch-ready";
export type SectionSourceType =
  | "primary"
  | "secondary"
  | "manual"
  | "mixed"
  | "technical";

export interface SectionArchitecture {
  path: `/${string}`;
  group: string;
  title: string;
  publicExplanation: string;
  helpsUnderstand: readonly string[];
  status: SectionStatus;
  lastUpdated: string;
  civicQuestion: string;
  dataReadiness: {
    expectedSource: string;
    sourceType: SectionSourceType;
    updateFrequency: string;
    verificationLevel: string;
    knownLimits: string;
    ingestionStatus: string;
    dataStatus: SectionDataStatus;
  };
  primaryContent: string;
  filters: readonly string[];
  emptyState: { title: string; description: string; whyItMatters: string };
  related: readonly { href: `/${string}`; label: string; reason: string }[];
  launchReadiness: SectionLaunchReadiness;
  pageImplementation: SectionPageImplementation;
  auditNotes: {
    currentPurpose: string;
    structuralWeaknesses: string;
    necessaryUiBlocks: string;
    missingEmptyStates: string;
    missingSourceIndicators: string;
    missingFilters: string;
    missingCrossLinks: string;
    mobileReadability: string;
  };
}

export interface SectionPageImplementation {
  isPriorityPage: boolean;
  primaryDataObject: string;
  contentHierarchy: readonly string[];
  sourceStatusPlacement: string;
  usefulControls: readonly string[];
  citizenAction: string;
  remainingDataDependency: string;
  launchPosture: string;
  furtherWorkBeforeLaunch: string;
  implementationNote: string;
}

export const SECTION_STATUS_LABELS: Record<SectionStatus, string> = {
  demo: "Demo dichiarata",
  partial: "Dati parziali",
  verified: "Verificato",
  "needs-source": "Fonte da collegare",
  "under-construction": "In costruzione",
};
export const SECTION_DATA_STATUS_LABELS: Record<SectionDataStatus, string> = {
  demo: "Demo/prototipo",
  partial: "Parziale",
  missing: "Assente",
  verified: "Verificato",
};
export const SECTION_SOURCE_TYPE_LABELS: Record<SectionSourceType, string> = {
  primary: "Fonte primaria",
  secondary: "Fonte secondaria",
  manual: "Contenuto manuale",
  mixed: "Fonti miste",
  technical: "Dato tecnico",
};
export const SECTION_LAUNCH_READINESS_LABELS: Record<
  SectionLaunchReadiness,
  string
> = {
  "launch-ready": "Pubblicabile",
  "launch-ready-with-caveats": "Pubblicabile con cautele",
  "not-launch-ready": "Non pubblicabile come dato reale",
};

type PublicPath =
  | (typeof PUBLIC_INDEXABLE_ROUTES)[number]["path"]
  | "/atlante-territoriale";

export const PRIORITY_PAGE_PATHS = [
  "/",
  "/convocazioni",
  "/delibere",
  "/albo",
  "/contratti",
  "/incarichimetro",
  "/pnrr",
  "/organi",
  "/amministratori",
  "/monitoraggio",
  "/criticita-pubbliche",
  "/segnalazioni",
  "/fonti-dati",
  "/stato-monitoraggio",
  "/metodologia",
  "/atlante-territoriale",
  "/legalita",
  "/legalita/timeline",
  "/legalita/trame-festival",
] as const satisfies readonly PublicPath[];

export type PriorityPagePath = (typeof PRIORITY_PAGE_PATHS)[number];

const sourceCheck =
  "Ogni dato va riscontrato sulla fonte richiamata prima di essere usato come informazione ufficiale.";
const noFakeData =
  "La sezione non deve mostrare numeri o conclusioni se la fonte non restituisce dati.";

const GROUPS = {
  orient: "Orientamento civico",
  decide: "Cosa decide il Comune",
  people: "Chi partecipa e come vota",
  money: "Come vengono spesi soldi e incarichi",
  works: "Cosa viene finanziato e realizzato",
  places: "Cosa succede nei luoghi della citta",
  memory: "Memoria civica e antimafia",
  civic: "Partecipazione e proposte",
  state: "Stato delle fonti e del monitoraggio",
} as const;

const sourceFamilies: Record<SectionSourceType, string> = {
  primary: "Albo, atti, allegati, sedute e fonti istituzionali primarie.",
  secondary: "Fonti secondarie da collegare a record e documenti primari.",
  manual: "Contenuti redazionali, route pubbliche, metodologia e note interne.",
  mixed: "Fonti primarie, dataset pubblici, note redazionali e record collegati.",
  technical: "Dataset, feed, health check, API e documentazione tecnica.",
};

const titleOverrides: Partial<Record<PublicPath, string>> = {
  "/": "Lamezia Trasparente Monitor",
  "/pnrr": "PNRR",
  "/opendata": "Open data",
  "/fonti-dati": "Fonti dati",
  "/stato-monitoraggio": "Stato monitoraggio",
  "/note-legali": "Note legali",
  "/chi-siamo": "Chi siamo",
  "/accesso-civico": "Accesso civico",
  "/atlante-territoriale": "Atlante territoriale",
  "/criticita-pubbliche": "Criticita pubbliche",
  "/atti-fondamentali": "Atti fondamentali",
  "/beni-confiscati": "Beni confiscati",
  "/legalita": "Legalita",
  "/legalita/timeline": "Timeline legalita",
  "/legalita/trame-festival": "Trame - Festival",
  "/convocazioni/demo-consiglio-comunale-v0": "Demo convocazione",
  "/performance/confronta": "Confronta performance",
};

const demoPaths = new Set<PublicPath>([
  "/convocazioni/demo-consiglio-comunale-v0",
  "/promessometro",
  "/macchina-comunale",
]);
const missingPaths = new Set<PublicPath>([
  "/monitoraggio/nuovo",
  "/contatti",
  "/iscrizioni",
  "/feeds",
]);
const launchReadyPaths = new Set<PublicPath>([
  "/fonti-dati",
  "/metodologia",
  "/note-legali",
]);

const relatedDefaults: readonly PublicPath[] = [
  "/fonti-dati",
  "/metodologia",
  "/guida",
];

const priorityPageImplementations: Record<
  PriorityPagePath,
  SectionPageImplementation
> = {
  "/": {
    isPriorityPage: true,
    primaryDataObject:
      "Mappa operativa del monitor: sezioni, stato dati, fonte, limiti, demo e azioni civiche.",
    contentHierarchy: [
      "cosa puoi controllare",
      "dati consultabili con cautele e dati parziali",
      "fonti mancanti, demo e moduli pronti per ingestion",
      "azioni concrete: consultare, verificare, segnalare, richiedere accesso civico",
    ],
    sourceStatusPlacement:
      "La home deve mostrare fonte, stato e limiti come legenda del sistema, prima dei percorsi rapidi.",
    usefulControls: ["Percorsi per domanda", "Sezioni per fonte", "Accesso a metodo e fonti"],
    citizenAction:
      "Scegliere un percorso, verificare la fonte, aprire una segnalazione o preparare una richiesta FOIA.",
    remainingDataDependency:
      "Collegare tutti i conteggi della home a fonti live e distinguere sempre dati assenti da dati non ancora importati.",
    launchPosture:
      "Pubblicabile come mappa civica se non promette copertura completa.",
    furtherWorkBeforeLaunch:
      "Raffinare i conteggi quando le ingestion automatiche diventano stabili.",
    implementationNote:
      "La home e trattata come sistema di orientamento, non come semplice collezione di card.",
  },
  "/convocazioni": {
    isPriorityPage: true,
    primaryDataObject:
      "Scheda seduta: data, organo, ordine del giorno, pubblicazione fonte, resoconto, votazioni e atti collegati.",
    contentHierarchy: [
      "prossime e ultime sedute",
      "copertura ODG, resoconto, votazioni e atti collegati",
      "filtri per organo, macrotema e copertura documentale",
      "rinvio a delibere, organi e fonte Albo",
    ],
    sourceStatusPlacement:
      "Stato e fonte devono stare vicino a data, organo e documenti della seduta.",
    usefulControls: ["Organo", "Macrotema", "Resoconto", "Votazioni", "Atti collegati"],
    citizenAction:
      "Controllare una seduta, aprire la fonte, seguire gli atti collegati o segnalare un documento mancante.",
    remainingDataDependency:
      "Automatizzare allineamento tra convocazioni, resoconti, votazioni e delibere quando disponibili.",
    launchPosture:
      "Pubblicabile con cautele; la scheda demo resta marcata come demo.",
    furtherWorkBeforeLaunch:
      "Completare collegamenti puntuali con resoconti e votazioni quando la fonte li espone.",
    implementationNote:
      "La pagina e strutturata attorno alla copertura documentale della seduta.",
  },
  "/delibere": {
    isPriorityPage: true,
    primaryDataObject:
      "Delibera o atto: tipo, data, oggetto, organo, fonte di pubblicazione, allegati, stato e seduta collegata.",
    contentHierarchy: [
      "elenco atti per data e organo",
      "oggetto e tipo atto",
      "allegati e fonte di pubblicazione",
      "collegamento a sedute, albo e temi civici",
    ],
    sourceStatusPlacement:
      "La fonte e lo stato di pubblicazione devono restare dentro la scheda dell'atto.",
    usefulControls: ["Tipo atto", "Organo", "Data", "Fonte", "Allegati"],
    citizenAction:
      "Aprire l'atto, confrontarlo con la seduta e verificare gli allegati.",
    remainingDataDependency:
      "Completare la relazione stabile tra atto, seduta, allegati e pubblicazione Albo.",
    launchPosture:
      "Pubblicabile con cautele su copertura e allegati.",
    furtherWorkBeforeLaunch:
      "Aggiungere per-record source check date e link alla seduta quando presenti.",
    implementationNote:
      "Il focus e l'atto documentale, non un giudizio sulla decisione.",
  },
  "/albo": {
    isPriorityPage: true,
    primaryDataObject:
      "Pubblicazione Albo: numero, categoria, oggetto, date pubblicazione, allegati, fonte puntuale o fallback portale.",
    contentHierarchy: [
      "ricerca e filtri sulle pubblicazioni",
      "scheda atto con data e categoria",
      "allegati e stato fonte",
      "collegamenti a delibere, contratti, PNRR e temi",
    ],
    sourceStatusPlacement:
      "Fonte, stato e limiti devono accompagnare ogni allegato o fallback al portale ufficiale.",
    usefulControls: ["Ricerca", "Categoria", "Periodo", "Allegati", "Fonte puntuale"],
    citizenAction:
      "Trovare un atto, scaricare l'allegato, verificare la fonte o aprire una segnalazione se manca un documento.",
    remainingDataDependency:
      "Mantenere l'import Albo e distinguere allegato archiviato da link ufficiale non puntuale.",
    launchPosture:
      "Pubblicabile con cautele di copertura e fallback.",
    furtherWorkBeforeLaunch:
      "Consolidare deduplica, retention degli allegati e stato importazione per categoria.",
    implementationNote:
      "L'Albo e la fonte primaria da cui partono molte verifiche del monitor.",
  },
  "/contratti": {
    isPriorityPage: true,
    primaryDataObject:
      "Contratto/affidamento: procedura, CIG, fornitore, importo, data, fonte ANAC o atto comunale, CUP e caveat.",
    contentHierarchy: [
      "elenco contratti con filtri",
      "scheda procedura e importo",
      "fonte, CIG/CUP e data affidamento",
      "collegamenti a PNRR, incarichimetro e Albo",
    ],
    sourceStatusPlacement:
      "Fonte, stato, limiti, CIG, importo e data devono essere nella stessa scheda del contratto.",
    usefulControls: ["CIG", "Fornitore", "Importo", "Procedura", "CUP", "Periodo"],
    citizenAction:
      "Verificare una procedura, aprire la fonte, seguire CUP/PNRR o segnalare un dato incompleto.",
    remainingDataDependency:
      "Allineare ANAC, atti comunali e allegati senza presentare copertura come completa.",
    launchPosture:
      "Pubblicabile con caveat su completezza e fonte.",
    furtherWorkBeforeLaunch:
      "Aggiungere source check date e collegamenti automatici alle determine quando disponibili.",
    implementationNote:
      "La pagina mostra documenti e importi come elementi verificabili, non come valutazioni automatiche.",
  },
  "/incarichimetro": {
    isPriorityPage: true,
    primaryDataObject:
      "Segnale incarichi: ricorrenza, concentrazione, rotazione, soglia, fonte e spiegazione metodologica.",
    contentHierarchy: [
      "caveat metodologico prima degli indicatori",
      "segnali di concentrazione e ricorrenza",
      "fonte e periodo osservato",
      "rinvio a contratti, Albo e metodologia",
    ],
    sourceStatusPlacement:
      "Ogni segnale deve dichiarare periodo, fonte e limite interpretativo vicino al valore.",
    usefulControls: ["Periodo", "Soggetto/operatore", "Procedura", "Soglia", "Fonte"],
    citizenAction:
      "Usare il segnale per cercare documenti, non per attribuire responsabilita.",
    remainingDataDependency:
      "Serve dataset incarichi/affidamenti normalizzato e collegato alle fonti primarie.",
    launchPosture:
      "Pubblicabile solo come indicatore prudente e parziale.",
    furtherWorkBeforeLaunch:
      "Documentare soglie, denominatori e casi esclusi prima di ampliare l'uso pubblico.",
    implementationNote:
      "Il contenuto deve parlare di segnali e data gap, mai di accuse.",
  },
  "/pnrr": {
    isPriorityPage: true,
    primaryDataObject:
      "Progetto PNRR: CUP, titolo, finanziamento, stato attuazione, luogo, ufficio/responsabile, fonte e ultimo aggiornamento.",
    contentHierarchy: [
      "censimento progetti e importi",
      "stato attuazione e localizzazione",
      "fonti Italia Domani, comunali o contratti collegati",
      "contratti, Albo e Atlante come contesto",
    ],
    sourceStatusPlacement:
      "Fonte finanziamento, stato, limiti, localizzazione e aggiornamento devono stare nella scheda progetto.",
    usefulControls: ["CUP", "Missione", "Importo", "Stato", "Luogo", "Fonte"],
    citizenAction:
      "Seguire un progetto, controllare fonte e contratto collegato o segnalare uno stato mancante.",
    remainingDataDependency:
      "Mantenere fonte progetto, fonte localizzazione e fonte comunale distinte.",
    launchPosture:
      "Sperimentale con dati e collegamenti da riscontrare.",
    furtherWorkBeforeLaunch:
      "Rendere esplicita la data fonte per ogni CUP e collegare uffici/atti quando verificati.",
    implementationNote:
      "La pagina e una scheda di avanzamento documentale, non una certificazione di completamento.",
  },
  "/organi": {
    isPriorityPage: true,
    primaryDataObject:
      "Organo istituzionale: nome, tipo, composizione, mandato, fonte e ultimo controllo.",
    contentHierarchy: [
      "indice degli organi",
      "composizione e ruoli",
      "mandato, fonte e ultimo controllo",
      "collegamenti a sedute, delibere e amministratori",
    ],
    sourceStatusPlacement:
      "Fonte, stato e ultimo controllo devono stare vicino alla composizione dell'organo.",
    usefulControls: ["Tipo organo", "Mandato", "Ruolo", "Fonte"],
    citizenAction:
      "Capire chi partecipa a un organo e seguire sedute o atti collegati.",
    remainingDataDependency:
      "Aggiornare ruoli e composizioni quando cambiano le fonti ufficiali.",
    launchPosture:
      "Pubblicabile con cautele sulla freschezza dei ruoli.",
    furtherWorkBeforeLaunch:
      "Aggiungere date di verifica per ogni composizione.",
    implementationNote:
      "La pagina deve evitare profili personali non necessari e restare su ruoli pubblici.",
  },
  "/amministratori": {
    isPriorityPage: true,
    primaryDataObject:
      "Scheda amministratore: ruolo pubblico, organo, mandato, atti/attivita disponibili, fonte e limiti.",
    contentHierarchy: [
      "indice ruoli pubblici",
      "schede amministratore",
      "fonti, curriculum, dichiarazioni o assenze dichiarate",
      "collegamenti a organi e sedute",
    ],
    sourceStatusPlacement:
      "Ogni dato personale pubblico deve avere fonte, ambito e limite vicino al campo.",
    usefulControls: ["Ruolo", "Organo", "Mandato", "Fonte", "Dati mancanti"],
    citizenAction:
      "Consultare il ruolo pubblico e verificare eventuali documenti disponibili.",
    remainingDataDependency:
      "Tenere distinti dati pubblici obbligatori, dati assenti e dati non pertinenti.",
    launchPosture:
      "Pubblicabile con cautele su aggiornamento e minimizzazione.",
    furtherWorkBeforeLaunch:
      "Aggiungere source check date e stato per curriculum/dichiarazioni.",
    implementationNote:
      "La pagina deve restare informativa e non profilare oltre il ruolo pubblico.",
  },
  "/monitoraggio": {
    isPriorityPage: true,
    primaryDataObject:
      "Elemento di monitoraggio: tema, fonte iniziale, stato verifica, atti collegati, dati mancanti e prossima azione.",
    contentHierarchy: [
      "hub di accesso alle verifiche",
      "segnali e criticita come elementi da verificare",
      "collegamenti ad accesso civico, segnalazioni e fonti",
      "stato moderazione e limiti",
    ],
    sourceStatusPlacement:
      "Stato verifica e fonte iniziale devono precedere qualsiasi interpretazione.",
    usefulControls: ["Tema", "Luogo", "Stato verifica", "Fonte", "Atto collegato"],
    citizenAction:
      "Seguire una verifica, proporre fonti o aprire una richiesta documentale.",
    remainingDataDependency:
      "Consolidare moderazione, workflow e collegamenti a record ufficiali.",
    launchPosture:
      "Pubblicabile come hub documentale se mantiene il linguaggio di verifica.",
    furtherWorkBeforeLaunch:
      "Formalizzare stati editoriali e audit trail delle segnalazioni.",
    implementationNote:
      "Il monitoraggio deve distinguere fatti, fonti e interpretazioni.",
  },
  "/criticita-pubbliche": {
    isPriorityPage: true,
    primaryDataObject:
      "Criticita pubblica: descrizione, fonte iniziale, stato verifica, ente/ufficio, atti collegati, risposta e data.",
    contentHierarchy: [
      "registro consultabile",
      "fonte iniziale e stato verifica",
      "atti o risposte collegate",
      "data gap e prossima azione",
    ],
    sourceStatusPlacement:
      "Fonte iniziale, stato e data devono restare nella testata della scheda.",
    usefulControls: ["Ambito", "Luogo", "Stato verifica", "Fonte", "Risposta"],
    citizenAction:
      "Leggere una criticita come verifica aperta e contribuire con fonti.",
    remainingDataDependency:
      "Serve moderazione stabile e collegamento a documenti ufficiali prima della pubblicazione ampia.",
    launchPosture:
      "Pubblicabile con forte caveat: registro di verifiche, non accuse.",
    furtherWorkBeforeLaunch:
      "Aggiungere log pubblico di cambi stato e regole di pubblicazione.",
    implementationNote:
      "Ogni scheda deve mantenere un registro prudente e tracciabile.",
  },
  "/segnalazioni": {
    isPriorityPage: true,
    primaryDataObject:
      "Segnalazione civica: fatto documentato, fonte indicata, contesto, stato moderazione e dati mancanti.",
    contentHierarchy: [
      "invio guidato della segnalazione",
      "distinzione tra fatto, fonte e interpretazione",
      "stato moderazione",
      "rinvio a monitoraggio e accesso civico",
    ],
    sourceStatusPlacement:
      "La richiesta di fonte e lo stato moderazione devono essere visibili prima della pubblicazione.",
    usefulControls: ["Ambito", "Fonte", "Luogo", "Stato", "Dati mancanti"],
    citizenAction:
      "Inviare un elemento verificabile o seguire una criticita gia pubblicata.",
    remainingDataDependency:
      "Completare regole di moderazione, privacy e notifica.",
    launchPosture:
      "Non pubblicabile come flusso automatico; consultabile con moderazione esplicita.",
    furtherWorkBeforeLaunch:
      "Definire policy redazionale, antispam e tempi di risposta.",
    implementationNote:
      "La sezione deve impedire che una segnalazione diventi accusa non verificata.",
  },
  "/fonti-dati": {
    isPriorityPage: true,
    primaryDataObject:
      "Registro fonte: nome fonte, titolare, URL, tipo, frequenza attesa, stato collegamento, limiti e uso nel sito.",
    contentHierarchy: [
      "fonti primarie e tecniche",
      "stato collegamento e frequenza",
      "limiti, assunzioni e uso nei moduli",
      "rinvio a metodologia e stato monitoraggio",
    ],
    sourceStatusPlacement:
      "Ogni fonte deve mostrare stato, frequenza e limite nello stesso record.",
    usefulControls: ["Tipo fonte", "Modulo", "Stato", "Frequenza", "Priorita"],
    citizenAction:
      "Capire da dove arriva un dato e quando serve tornare alla fonte ufficiale.",
    remainingDataDependency:
      "Mantenere registro sincronizzato con ingestion, sitemap e moduli pubblici.",
    launchPosture:
      "Pubblicabile come ancora metodologica del sito.",
    furtherWorkBeforeLaunch:
      "Aggiungere source check date e owner per ogni fonte live.",
    implementationNote:
      "La pagina e il punto di verita pubblico per fonti e limiti.",
  },
  "/stato-monitoraggio": {
    isPriorityPage: true,
    primaryDataObject:
      "Stato fonte: health check, ultimo controllo, ultimo aggiornamento, copertura, cautela e priorita.",
    contentHierarchy: [
      "dashboard tecnica delle fonti",
      "stato e freschezza",
      "copertura come controllo operativo",
      "rinvio a fonti dati e metodologia",
    ],
    sourceStatusPlacement:
      "Stato, ultimo controllo e cautela devono stare nella riga o scheda mobile della fonte.",
    usefulControls: ["Fonte", "Tipo", "Priorita", "Stato", "Copertura"],
    citizenAction:
      "Capire se un dato mancante dipende dalla fonte, dall'import o dalla copertura.",
    remainingDataDependency:
      "Aggiornare il payload health quando nuove ingestion diventano operative.",
    launchPosture:
      "Pubblicabile come dashboard tecnica, non come valutazione sostanziale.",
    furtherWorkBeforeLaunch:
      "Aggiungere storico controlli e motivi di errore quando disponibili.",
    implementationNote:
      "La dashboard misura operativita delle fonti, non qualita politica dell'ente.",
  },
  "/metodologia": {
    isPriorityPage: true,
    primaryDataObject:
      "Metodo pubblico: criteri, definizioni, cautele, limiti, cosa non si puo dedurre e come verificare.",
    contentHierarchy: [
      "principi di lettura",
      "indicatori come segnali",
      "assenze informative e limiti",
      "rinvio a fonti, note legali e guida",
    ],
    sourceStatusPlacement:
      "Fonte, stato metodologico e limiti devono accompagnare ogni definizione usata da dashboard e indicatori.",
    usefulControls: ["Concetto", "Modulo", "Cautela", "Fonte", "Limite"],
    citizenAction:
      "Leggere i dati senza trasformare segnali in conclusioni non verificate.",
    remainingDataDependency:
      "Aggiornare il metodo quando cambiano dataset, soglie o workflow redazionali.",
    launchPosture:
      "Pubblicabile e necessaria prima degli indicatori sensibili.",
    furtherWorkBeforeLaunch:
      "Aggiungere esempi per ogni nuovo indicatore introdotto.",
    implementationNote:
      "La metodologia protegge il sito da letture accusatorie o fuorvianti.",
  },
  "/atlante-territoriale": {
    isPriorityPage: true,
    primaryDataObject:
      "Unita territoriale: sezione censuaria ISTAT, indicatore, anno, fonte, geometria, limiti mappa ed export.",
    contentHierarchy: [
      "mappa e lista territori",
      "indicatore, anno e fonte",
      "limiti di precisione e copertura",
      "export e rinvio a open data/metodologia",
    ],
    sourceStatusPlacement:
      "Fonte ISTAT, anno, livello territoriale e limiti devono restare vicino alla mappa e alla tabella.",
    usefulControls: ["Indicatore", "Sezione", "Anno", "Fonte", "Export"],
    citizenAction:
      "Leggere differenze territoriali come contesto statistico, non come prova puntuale.",
    remainingDataDependency:
      "Aggiornare GeoJSON e metadati quando cambiano base ISTAT o indicatori.",
    launchPosture:
      "Pubblicabile con limiti cartografici e fonte sempre visibili.",
    furtherWorkBeforeLaunch:
      "Documentare trasformazioni geografiche, CRS e data lineage degli indicatori.",
    implementationNote:
      "La pagina deve trattare la mappa come orientamento territoriale, non precisione assoluta.",
  },
  "/legalita": {
    isPriorityPage: true,
    primaryDataObject:
      "Percorso legalita: tema, fonte pubblica, contesto, collegamento a beni, timeline o Trame, cautela redazionale.",
    contentHierarchy: [
      "percorsi di legalita e prevenzione",
      "beni, timeline e contributi culturali",
      "fonte e limite prima del racconto",
      "rinvio a metodologia e note legali",
    ],
    sourceStatusPlacement:
      "Ogni contenuto sensibile deve dichiarare fonte e limite prima della descrizione.",
    usefulControls: ["Tema", "Fonte", "Anno", "Luogo", "Verifica"],
    citizenAction:
      "Orientarsi tra fonti pubbliche e memoria civica senza inferire responsabilita.",
    remainingDataDependency:
      "Mantenere separati contenuti documentali, memoria civica e dati sui beni.",
    launchPosture:
      "Pubblicabile con linguaggio prudente e source-first.",
    furtherWorkBeforeLaunch:
      "Aggiungere riferimenti puntuali quando nuovi contenuti sensibili vengono pubblicati.",
    implementationNote:
      "La sezione coordina memoria civica senza produrre claims non supportati.",
  },
  "/legalita/timeline": {
    isPriorityPage: true,
    primaryDataObject:
      "Evento timeline: data, titolo, fonte, luogo, stato verifica, contesto e nota di cautela.",
    contentHierarchy: [
      "eventi ordinati nel tempo",
      "fonte e stato verifica",
      "contesto essenziale",
      "rinvio a legalita, beni e metodo",
    ],
    sourceStatusPlacement:
      "Fonte, data, stato verifica e limiti devono stare nella stessa scheda evento.",
    usefulControls: ["Anno", "Tema", "Luogo", "Fonte", "Verifica"],
    citizenAction:
      "Consultare eventi documentati e distinguere memoria pubblica da ricostruzioni non verificate.",
    remainingDataDependency:
      "Pubblicare eventi solo con fonte puntuale e verifica redazionale.",
    launchPosture:
      "Pubblicabile solo con eventi source-first.",
    furtherWorkBeforeLaunch:
      "Aggiungere audit trail della fonte per ogni evento.",
    implementationNote:
      "La timeline deve evitare eventi non attribuiti o formulazioni sensazionalistiche.",
  },
  "/legalita/trame-festival": {
    isPriorityPage: true,
    primaryDataObject:
      "Scheda Trame: evento, speaker o panel, idea/proposta, minuto video, fonte, stato trascrizione e verifica redazionale.",
    contentHierarchy: [
      "criteri di pubblicazione",
      "schede approvate con fonte e minuto",
      "stato trascrizione e priorita editoriale",
      "rinvio a legalita, timeline e fonti",
    ],
    sourceStatusPlacement:
      "Fonte, minuto video e stato trascrizione devono restare vicino alla sintesi pubblicata.",
    usefulControls: ["Edizione", "Tipo contenuto", "Fonte", "Minuto", "Stato trascrizione"],
    citizenAction:
      "Leggere idee selezionate e risalire al punto video o alla fonte prima di riusarle.",
    remainingDataDependency:
      "Pubblicare solo schede con attribuzione completa e revisione redazionale.",
    launchPosture:
      "Pubblicabile anche vuota se dichiara che nessuna scheda e ancora approvata.",
    furtherWorkBeforeLaunch:
      "Aggiungere schede solo dopo trascrizione, fonte e minuto verificati.",
    implementationNote:
      "Il modulo valorizza contributi culturali senza trasformarli in dati ufficiali comunali.",
  },
};

function defaultPageImplementation({
  title,
  group,
  sourceType,
  dataStatus,
  filters,
}: {
  title: string;
  group: string;
  sourceType: SectionSourceType;
  dataStatus: SectionDataStatus;
  filters: readonly string[];
}): SectionPageImplementation {
  return {
    isPriorityPage: false,
    primaryDataObject: `${title}: record, fonte, stato, limiti e collegamenti correlati.`,
    contentHierarchy: [
      `inquadramento ${group}`,
      "fonte e stato dati",
      "contenuto principale",
      "empty state e percorsi correlati",
    ],
    sourceStatusPlacement:
      "Fonte, stato e limiti devono restare visibili vicino al contenuto principale.",
    usefulControls: filters,
    citizenAction:
      "Consultare la sezione e usare fonti, metodo o guida per verificare i dati.",
    remainingDataDependency:
      sourceType === "technical"
        ? "Aggiornare il dato tecnico quando cambiano feed, API o dataset."
        : "Collegare fonti puntuali e source check date quando disponibili.",
    launchPosture:
      dataStatus === "missing"
        ? "Da tenere come stato non pronto finche la fonte non e collegata."
        : "Pubblicabile solo con limiti e stato dati visibili.",
    furtherWorkBeforeLaunch:
      "Consolidare record reali, filtri e collegamenti prima di ampliare la sezione.",
    implementationNote:
      "Struttura generica ereditata dalla registry; le pagine prioritarie hanno blueprint specifici.",
  };
}

function pageImplementationFor(
  path: PublicPath,
  context: Parameters<typeof defaultPageImplementation>[0],
) {
  return priorityPageImplementations[path as PriorityPagePath] ??
    defaultPageImplementation(context);
}

function titleFor(path: PublicPath) {
  if (titleOverrides[path]) return titleOverrides[path]!;
  const last = path.split("/").filter(Boolean).at(-1) ?? "home";
  return last
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function groupFor(path: PublicPath) {
  if (path === "/" || ["/domande", "/temi", "/statistiche"].includes(path)) {
    return GROUPS.orient;
  }
  if (/^\/(convocazioni|delibere|albo|atti-fondamentali|pareri)/.test(path)) {
    return GROUPS.decide;
  }
  if (/^\/(organi|amministratori)/.test(path)) return GROUPS.people;
  if (/^\/(contratti|incarichimetro)/.test(path)) return GROUPS.money;
  if (/^\/(pnrr|bandi|performance|macchina-comunale)/.test(path)) {
    return GROUPS.works;
  }
  if (path === "/atlante-territoriale") return GROUPS.places;
  if (/^\/(beni-confiscati|legalita)/.test(path)) return GROUPS.memory;
  if (
    /^\/(accesso-civico|monitoraggio|promessometro|archivio-proposte|criticita-pubbliche|segnalazioni|iscrizioni)/.test(
      path,
    )
  ) {
    return GROUPS.civic;
  }
  return GROUPS.state;
}

function sourceTypeFor(path: PublicPath): SectionSourceType {
  if (/^\/(albo|atti-fondamentali|convocazioni|delibere|organi|amministratori|pareri)/.test(path)) {
    return "primary";
  }
  if (/^\/(opendata|feeds|sviluppatori|stato-monitoraggio|statistiche|iscrizioni|atlante-territoriale)/.test(path)) {
    return "technical";
  }
  if (/^\/(domande|guida|metodologia|note-legali|chi-siamo|contatti|accesso-civico|roadmap)/.test(path)) {
    return "manual";
  }
  return "mixed";
}

function statusFor(path: PublicPath): SectionStatus {
  if (demoPaths.has(path)) return "demo";
  if (path === "/feeds" || path === "/contatti") return "needs-source";
  if (path === "/monitoraggio/nuovo" || path === "/iscrizioni") {
    return "under-construction";
  }
  return "partial";
}

function dataStatusFor(path: PublicPath): SectionDataStatus {
  if (demoPaths.has(path)) return "demo";
  if (missingPaths.has(path)) return "missing";
  return "partial";
}

function readinessFor(path: PublicPath): SectionLaunchReadiness {
  if (demoPaths.has(path) || missingPaths.has(path)) return "not-launch-ready";
  if (launchReadyPaths.has(path)) return "launch-ready";
  return "launch-ready-with-caveats";
}

function filtersFor(group: string, path: PublicPath) {
  if (path === "/") return ["Sezione", "Fonte", "Stato"];
  if (group === GROUPS.money) {
    return ["Data", "Procedura", "Importo", "Operatore", "Fonte"];
  }
  if (group === GROUPS.people) return ["Ruolo", "Organo", "Mandato", "Fonte"];
  if (group === GROUPS.memory) return ["Anno", "Luogo", "Fonte", "Verifica"];
  if (group === GROUPS.places) return ["Luogo", "Indicatore", "Fonte", "Verifica"];
  if (group === GROUPS.state) return ["Modulo", "Fonte", "Stato", "Frequenza"];
  return ["Tema", "Fonte", "Stato verifica"];
}

function relatedFor(path: PublicPath) {
  const local: Partial<Record<PublicPath, readonly PublicPath[]>> = {
    "/convocazioni": ["/delibere", "/organi", "/fonti-dati"],
    "/contratti": ["/incarichimetro", "/pnrr", "/fonti-dati"],
    "/beni-confiscati": ["/legalita", "/legalita/timeline", "/fonti-dati"],
    "/legalita/trame-festival": ["/legalita", "/legalita/timeline", "/fonti-dati"],
    "/monitoraggio": ["/segnalazioni", "/accesso-civico", "/criticita-pubbliche"],
    "/atlante-territoriale": ["/fonti-dati", "/opendata", "/metodologia"],
    "/fonti-dati": ["/stato-monitoraggio", "/metodologia", "/opendata"],
  };
  return (local[path] ?? relatedDefaults).filter((href) => href !== path);
}

function buildSection(route: (typeof PUBLIC_INDEXABLE_ROUTES)[number]) {
  const path: PublicPath = route.path;
  const title = titleFor(path);
  const group = groupFor(path);
  const sourceType = sourceTypeFor(path);
  const dataStatus = dataStatusFor(path);
  const filters = filtersFor(group, path);
  const related = relatedFor(path);
  const pageImplementation = pageImplementationFor(path, {
    title,
    group,
    sourceType,
    dataStatus,
    filters,
  });

  return {
    path,
    group,
    title,
    publicExplanation: `${route.rationale} La sezione dichiara fonte, stato dei dati, limiti e prossimi passi prima di mostrare o interpretare record.`,
    helpsUnderstand: [
      "quale bisogno civico affronta la sezione",
      "quali fonti e campi sono disponibili o mancanti",
      "quali cautele servono prima di riusare i dati",
    ],
    status: statusFor(path),
    lastUpdated: "Da allineare a ogni rilascio pubblico o aggiornamento fonte",
    civicQuestion: `Quale fonte aiuta a leggere ${title} e quali limiti restano da verificare?`,
    dataReadiness: {
      expectedSource: sourceFamilies[sourceType],
      sourceType,
      updateFrequency:
        sourceType === "technical"
          ? "Quando cambiano integrazioni, health check o dataset pubblici."
          : "Quando cambiano fonti, route o contenuti redazionali.",
      verificationLevel:
        dataStatus === "demo"
          ? "Demo dichiarata: non rappresenta un dato pubblico reale."
          : "Parziale: ogni record va riscontrato sulla fonte richiamata.",
      knownLimits:
        "Copertura, aggiornamento e campi disponibili possono essere incompleti; il monitor non sostituisce la fonte ufficiale.",
      ingestionStatus:
        dataStatus === "missing"
          ? "Fonte o servizio da collegare prima dell'uso pubblico pieno."
          : dataStatus === "demo"
            ? "Fixture o struttura dimostrativa separata dai dati reali."
            : "Struttura pronta, alimentazione e verifica da consolidare.",
      dataStatus,
    },
    primaryContent: `${route.rationale} Deve mostrare scopo, fonte, stato, limiti, filtri e collegamenti correlati.`,
    filters,
    emptyState: {
      title:
        dataStatus === "demo"
          ? "Dati reali non pubblicati"
          : dataStatus === "missing"
            ? "Fonte non ancora collegata"
            : "Nessun record disponibile",
      description:
        "Quando non ci sono dati, la sezione dichiara il vuoto, indica la fonte prevista e rinvia a metodo o fonti.",
      whyItMatters:
        "Un vuoto informativo dichiarato e piu trasparente di numeri dimostrativi o conclusioni non verificabili.",
    },
    related: related.map((href) => ({
      href,
      label: titleFor(href),
      reason: "aiuta a verificare fonte, metodo o contesto civico",
    })),
    launchReadiness: readinessFor(path),
    pageImplementation,
    auditNotes: {
      currentPurpose: route.rationale,
      structuralWeaknesses:
        "La pagina puo sembrare completa se non espone fonte, stato, limiti e dati mancanti.",
      necessaryUiBlocks:
        "Scaffold civico, badge stato, fonte attesa, limiti, filtri, empty state e collegamenti correlati.",
      missingEmptyStates:
        "Stato vuoto per fonte assente, record mancanti, demo o servizio non attivo.",
      missingSourceIndicators:
        "Fonte prevista, tipo fonte, ultimo controllo, livello verifica e stato ingestion.",
      missingFilters: filters.join(", "),
      missingCrossLinks: related.map(titleFor).join(", "),
      mobileReadability:
        "Tabelle dense devono degradare in schede o liste leggibili con fonte e stato vicini ai campi principali.",
    },
  } satisfies SectionArchitecture;
}

export const SECTION_ARCHITECTURES: readonly SectionArchitecture[] =
  PUBLIC_INDEXABLE_ROUTES.map(buildSection);

export const SECTION_ARCHITECTURE_BY_PATH: ReadonlyMap<
  string,
  SectionArchitecture
> = new Map(SECTION_ARCHITECTURES.map((entry) => [entry.path, entry]));

export function getSectionArchitecture(path: string) {
  return SECTION_ARCHITECTURE_BY_PATH.get(path) ?? null;
}

export function findSectionArchitecture(path: string) {
  const exact = getSectionArchitecture(path);
  if (exact) return exact;

  const normalized = path.split("?")[0]?.replace(/\/+$/, "") || "/";
  return (
    [...SECTION_ARCHITECTURES]
      .filter(
        (entry) =>
          entry.path !== "/" && normalized.startsWith(`${entry.path}/`),
      )
      .sort((left, right) => right.path.length - left.path.length)[0] ?? null
  );
}

export function getRelatedSectionArchitectures(section: SectionArchitecture) {
  return section.related
    .map((related) => ({
      ...related,
      section: getSectionArchitecture(related.href),
    }))
    .filter((related) => related.section !== null);
}

export function getLaunchReadySections() {
  return SECTION_ARCHITECTURES.filter(
    (section) => section.launchReadiness !== "not-launch-ready",
  );
}

export function getPriorityPageArchitectures() {
  return PRIORITY_PAGE_PATHS.map((path) => getSectionArchitecture(path)).filter(
    (section): section is SectionArchitecture => section !== null,
  );
}

export function assertEveryPublicSectionHasSafeguards() {
  return SECTION_ARCHITECTURES.every((section) => {
    const readiness = section.dataReadiness;
    return Boolean(
      section.civicQuestion &&
        readiness.expectedSource &&
        readiness.verificationLevel &&
        readiness.knownLimits &&
        readiness.ingestionStatus &&
        section.emptyState.description &&
        section.related.length > 0,
    );
  });
}

export const SECTION_ARCHITECTURE_GUARDRAILS = {
  sourceCheck,
  noFakeData,
} as const;
