export const ROADMAP_STATUSES = [
  "pianificato",
  "in sviluppo",
  "Disponibile",
  "sperimentale",
  "da validare",
] as const;

export type RoadmapStatus = (typeof ROADMAP_STATUSES)[number];

export type RoadmapLink = {
  href: string;
  label: string;
};

export type RoadmapModule = {
  name: string;
  status: RoadmapStatus;
  description: string;
  sources: string;
  limits: string;
  priority: string;
  hrefs: RoadmapLink[];
};

export type RoadmapStatusSummary = {
  status: RoadmapStatus;
  description: string;
};

export const ROADMAP_STATUS_SUMMARY: RoadmapStatusSummary[] = [
  {
    status: "pianificato",
    description:
      "Area prevista o ipotizzata, senza date, copertura garantita o impegni di rilascio.",
  },
  {
    status: "in sviluppo",
    description:
      "Area in lavorazione o refinement, da pubblicare solo con fonti, limiti e verifiche adeguati.",
  },
  {
    status: "Disponibile",
    description:
      "Prima versione pubblica raggiungibile, utile alla consultazione ma ancora soggetta a miglioramenti.",
  },
  {
    status: "sperimentale",
    description:
      "Modulo consultabile con cautele rafforzate perché dipende da dati, classificazioni o integrazioni ancora da consolidare.",
  },
  {
    status: "da validare",
    description:
      "Ambito da definire meglio prima di ampliare esposizione pubblica o metriche di sintesi.",
  },
];

export const ROADMAP_MODULES: RoadmapModule[] = [
  {
    name: "Albo Monitor",
    status: "Disponibile",
    description:
      "Indice pubblico degli atti dell'Albo Pretorio pensato per orientare ricerca, lettura e verifica sui documenti disponibili.",
    sources:
      "Albo Pretorio e allegati pubblicati dall'ente, con rinvii alla fonte originaria quando disponibili.",
    limits:
      "Non sostituisce l'Albo ufficiale; pubblicazioni, date, allegati e contenuti devono essere verificati sulla fonte primaria.",
    priority:
      "Mantenere tracciabilità dei rinvii, leggibilità mobile e cautele sui metadati parziali.",
    hrefs: [{ href: "/albo/", label: "Apri Albo" }],
  },
  {
    name: "PNRR Tracker",
    status: "sperimentale",
    description:
      "Vista civica sui progetti PNRR collegati al territorio, da leggere come supporto di orientamento e non come registro esaustivo.",
    sources:
      "Dataset e documenti pubblici nazionali o locali quando disponibili, CUP e atti collegati se pubblicati.",
    limits:
      "Importi, stati e cronoprogrammi possono cambiare nelle fonti; la copertura dipende dalla disponibilità e qualità dei dati pubblici.",
    priority:
      "Rafforzare collegamenti documentali e note di qualità prima di ampliare filtri o sintesi.",
    hrefs: [
      { href: "/pnrr", label: "Apri PNRR" },
      { href: "/fonti-dati", label: "Fonti dati" },
    ],
  },
  {
    name: "Incarichimetro",
    status: "sperimentale",
    description:
      "Modulo di lettura su incarichi, affidamenti e ricorrenze amministrative, con indicatori da verificare sempre sugli atti.",
    sources:
      "Determine, pubblicazioni amministrative, CIG/CUP quando presenti e classificazioni conservative derivate da fonti pubbliche.",
    limits:
      "Ricorrenze e pattern sono segnali di monitoraggio, non evidenze di irregolarità o responsabilità individuale.",
    priority:
      "Rendere più esplicite fonte, criterio di classificazione e significato prudente degli indicatori.",
    hrefs: [{ href: "/incarichimetro", label: "Apri Incarichimetro" }],
  },
  {
    name: "FOIA Machine / Accesso civico",
    status: "Disponibile",
    description:
      "Area di orientamento per richieste di accesso civico e raccolta di elementi utili a una domanda documentata.",
    sources:
      "Normativa e indicazioni pubbliche sull'accesso civico, fonti già consultate dall'utente e documenti amministrativi richiamati nella richiesta.",
    limits:
      "Non fornisce consulenza legale, non assicura esiti o tempi di risposta e non invia richieste in modo automatico.",
    priority:
      "Migliorare testi guida, esempi prudenti e collegamenti alle note metodologiche.",
    hrefs: [{ href: "/accesso-civico", label: "Apri Accesso civico" }],
  },
  {
    name: "Macchina comunale / capacità amministrativa",
    status: "da validare",
    description:
      "Area di analisi sulle condizioni organizzative che possono aiutare a formulare domande di monitoraggio sulla capacità amministrativa.",
    sources:
      "Dati e documenti pubblici su performance, organizzazione, procedimenti e atti fondamentali, solo dove fonte e metodo sono documentabili.",
    limits:
      "Gli indicatori non spiegano da soli cause, intenti o responsabilità; prima di nuove viste servono definizioni stabili e caveat.",
    priority:
      "Validare glossario, metriche ammissibili e soglie descrittive senza introdurre ranking impropri.",
    hrefs: [
      { href: "/performance", label: "Performance" },
      { href: "/metodologia", label: "Metodologia" },
    ],
  },
  {
    name: "Trasparenza organizzativa",
    status: "Disponibile",
    description:
      "Percorsi di consultazione su organi, amministratori e informazioni organizzative pubbliche già presenti nel sito.",
    sources:
      "Sezioni istituzionali, atti pubblici e schede informative disponibili presso le fonti dell'ente.",
    limits:
      "Le schede sono informative e devono essere lette con riferimento agli atti e alle sezioni istituzionali aggiornate.",
    priority:
      "Preservare accessibilità, metadata e rinvii alle fonti senza introdurre valutazioni personali.",
    hrefs: [
      { href: "/organi", label: "Organi istituzionali" },
      { href: "/amministratori", label: "Amministratori" },
    ],
  },
  {
    name: "Registro criticità pubbliche",
    status: "in sviluppo",
    description:
      "Spazio di monitoraggio civico per raccogliere elementi verificabili, bisogni informativi e richieste di attenzione documentale.",
    sources:
      "Segnalazioni civiche, documenti allegati, atti pubblici e verifiche redazionali sulle fonti disponibili.",
    limits:
      "Una criticità registrata è una questione di trasparenza o un bisogno di verifica, non una conclusione su condotte o responsabilità.",
    priority:
      "Esplicitare stato di verifica, fonte disponibile e percorso di aggiornamento prima di ampliare la pubblicazione.",
    hrefs: [
      { href: "/monitoraggio", label: "Monitoraggio civico" },
      { href: "/segnalazioni", label: "Segnalazioni" },
    ],
  },
  {
    name: "Beni confiscati",
    status: "Disponibile",
    description:
      "Schede e mappe informative sui beni confiscati, con lettura civica orientata a riuso, stato informativo e fonti disponibili.",
    sources:
      "Informazioni pubbliche e atti amministrativi disponibili sui beni, con rinvii alla fonte quando presenti.",
    limits:
      "La presenza di un bene non implica valutazioni su persone o responsabilità; dati e stato d'uso possono richiedere verifica sulla fonte.",
    priority:
      "Mantenere cautele testuali e aggiornare limiti quando cambiano fonti o qualità dei dati.",
    hrefs: [{ href: "/beni-confiscati", label: "Apri Beni confiscati" }],
  },
  {
    name: "Open Data",
    status: "Disponibile",
    description:
      "Catalogo e strumenti per il riuso civico dei dati disponibili, inclusi dataset, risorse e documentazione tecnica.",
    sources:
      "Cataloghi sorgente, snapshot pubblicati dal progetto, API e metadati documentati nelle pagine dedicate.",
    limits:
      "Snapshot e API possono riflettere trasformazioni tecniche; per usi ufficiali occorre controllare la fonte primaria.",
    priority:
      "Chiarire formati, frequenza di aggiornamento, limiti e differenza tra dato ufficiale ed elaborazione civica.",
    hrefs: [
      { href: "/opendata", label: "Open Data" },
      { href: "/sviluppatori", label: "API" },
    ],
  },
  {
    name: "Convocazioni e delibere",
    status: "Disponibile",
    description:
      "Percorsi di consultazione su sedute, convocazioni e delibere per seguire l'attività degli organi istituzionali.",
    sources:
      "Convocazioni, delibere, verbali e pubblicazioni istituzionali quando reperibili dalle fonti pubbliche.",
    limits:
      "Calendari, allegati e testi possono essere incompleti o aggiornati successivamente; la fonte istituzionale resta il riferimento.",
    priority:
      "Conservare collegamenti alle fonti e distinguere chiaramente dati disponibili, assenti o da verificare.",
    hrefs: [
      { href: "/convocazioni", label: "Convocazioni" },
      { href: "/delibere", label: "Delibere" },
    ],
  },
  {
    name: "Contratti, bandi e pareri",
    status: "Disponibile",
    description:
      "Aree pubbliche già navigabili per orientarsi tra contratti, bandi, finanziamenti e documenti di vigilanza.",
    sources:
      "Atti pubblici, pubblicazioni amministrative, CIG/CUP ove disponibili e documenti di vigilanza richiamati nelle schede.",
    limits:
      "Le viste aiutano la consultazione ma non certificano completezza o correttezza del dato rispetto alla fonte ufficiale.",
    priority:
      "Tenere allineate note di fonte, limiti e linguaggio prudente nelle schede pubbliche.",
    hrefs: [
      { href: "/contratti", label: "Contratti" },
      { href: "/contratti", label: "Contratti pubblici" },
      { href: "/pareri", label: "Pareri" },
    ],
  },
];

export const ROADMAP_READING_CRITERIA = {
  title: "Criterio di lettura degli stati",
  description:
    "Gli stati sono assegnati in base a disponibilità della pagina pubblica, tracciabilità delle fonti, maturità metodologica e limiti noti. Non indicano priorità politiche, esiti certi o completezza dei dati.",
};

export const ROADMAP_MODULES_NOTE =
  "Le schede includono i moduli esistenti e pianificati richiamati da issue #42. Altre issue di modulo restano autonome: qui sono citate solo come aree di roadmap, senza duplicarne il lavoro.";

export const ROADMAP_LIMIT_NOTES = [
  {
    title: "Nessuna data promessa",
    description:
      "Le priorità possono cambiare in base a dati, manutenzione e verifiche. La pagina non annuncia scadenze.",
  },
  {
    title: "Moduli non duplicati",
    description:
      "Le issue su moduli applicativi, hub di navigazione e indicizzazione restano fuori da questa PR salvo link minimi già a basso rischio.",
  },
  {
    title: "Linguaggio non accusatorio",
    description:
      "Indicatori, ricorrenze e data gap restano segnali di monitoraggio e non prove di condotte illecite.",
  },
];
