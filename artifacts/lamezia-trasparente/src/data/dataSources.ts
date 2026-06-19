export interface DataSource {
  name: string;
  description: string;
  href: string;
  linkLabel: string;
  linkScope: "specifico" | "consultazione" | "fallback" | "generico";
  linkNote: string;
  dataType: "Ufficiale" | "Estratto" | "Arricchito" | "Da verificare";
  updateFrequency: string;
  limitations: string;
}

export const DATA_SOURCES = [
  {
    name: "Albo Pretorio del Comune di Lamezia Terme",
    description:
      "Pubblicazioni, determine, ordinanze, delibere e convocazioni rese disponibili dal portale ufficiale dell'Albo Pretorio comunale.",
    href: "https://albo.tinnvision.cloud/?ente=00301390795",
    linkLabel: "Apri l'Albo Pretorio comunale",
    linkScope: "specifico",
    linkNote:
      "Collegamento alla sezione dell'Albo individuata per l'ente; i singoli atti restano da verificare nella relativa scheda/documento.",
    dataType: "Ufficiale",
    updateFrequency:
      "Monitoraggio automatico periodico; le nuove pubblicazioni dipendono dalla frequenza di aggiornamento del portale ufficiale.",
    limitations:
      "L'Albo ufficiale conserva gli atti per finestre temporali limitate. I documenti precedenti all'avvio del monitoraggio continuativo potrebbero non essere recuperabili se non più pubblici.",
  },
  {
    name: "Bandi di gara e contratti — feed Legge 190/2012",
    description:
      "Feed pubblico collegato alla sezione comunale sui contratti, usato per ricostruire affidamenti, CIG, importi e operatori quando presenti nel testo dell'atto.",
    href: "https://albo.tinnvision.cloud/export/xml?wich=190&ente=00301390795",
    linkLabel: "Apri il feed Legge 190/2012",
    linkScope: "specifico",
    linkNote:
      "Collegamento al feed tecnico usato per l'estrazione; non equivale alla scheda completa di ogni affidamento.",
    dataType: "Estratto",
    updateFrequency:
      "Monitoraggio automatico periodico; gli aggiornamenti seguono la pubblicazione del feed da parte del gestore del servizio.",
    limitations:
      "Alcuni campi non sono sempre strutturati nel feed e vengono estratti dal testo con regole conservative. Importi, operatori e classificazioni possono richiedere verifica sull'atto originale o sulla BDNCP.",
  },
  {
    name: "Portale ANAC / BDNCP sui contratti pubblici",
    description:
      "Fonte nazionale di consultazione sui contratti pubblici e sulle schede collegate ai CIG quando disponibili.",
    href: "https://dati.anticorruzione.it/superset/dashboard/appalti/",
    linkLabel: "Apri il portale ANAC/BDNCP",
    linkScope: "consultazione",
    linkNote:
      "Collegamento a un portale nazionale di consultazione: non punta automaticamente alla scheda del singolo CIG.",
    dataType: "Ufficiale",
    updateFrequency:
      "Aggiornata secondo i flussi nazionali ANAC; il sito mostra i dati quando trasmessi dalle stazioni appaltanti e pubblicati dalla piattaforma.",
    limitations:
      "La disponibilità puntuale per singolo CIG può variare. Il collegamento ANAC non sostituisce la verifica degli atti di gara, degli allegati e delle determine pubblicate dall'ente.",
  },
  {
    name: "Catalogo Open Data del Comune di Lamezia Terme",
    description:
      "Catalogo comunale di dataset riutilizzabili, con risorse CSV, JSON o altri formati pubblicati dall'ente.",
    href: "https://opendata.comune.lamezia-terme.cz.it",
    linkLabel: "Apri il catalogo Open Data comunale",
    linkScope: "specifico",
    linkNote:
      "Collegamento al catalogo comunale; ogni dataset va letto nella propria scheda ufficiale e nelle risorse collegate.",
    dataType: "Ufficiale",
    updateFrequency:
      "Sincronizzazione periodica del catalogo e delle risorse tabellari; la frequenza effettiva dipende dagli aggiornamenti pubblicati dall'ente.",
    limitations:
      "I dataset possono avere granularità, completezza e periodicità diverse. Le trasformazioni tabellari e gli snapshot locali servono alla consultazione civica e vanno confrontati con la scheda ufficiale del dataset.",
  },
  {
    name: "Italia Domani — Open data PNRR",
    description:
      "Dataset nazionali sui progetti PNRR, filtrati per il Comune di Lamezia Terme e collegati ai CUP quando presenti.",
    href: "https://www.italiadomani.gov.it/it/catalogo-open-data.html",
    linkLabel: "Apri il catalogo Open data PNRR",
    linkScope: "consultazione",
    linkNote:
      "Collegamento al catalogo nazionale: il filtro territoriale e l'associazione ai CUP sono parte della consultazione locale.",
    dataType: "Ufficiale",
    updateFrequency:
      "Aggiornata secondo il calendario nazionale di pubblicazione dei dati PNRR; il sito effettua controlli periodici e conserva l'ultima sincronizzazione riuscita.",
    limitations:
      "I dati nazionali possono essere aggiornati con ritardi rispetto agli atti locali. Stato, importi e cronoprogrammi vanno letti insieme agli atti comunali e alle eventuali variazioni di progetto.",
  },
  {
    name: "OpenPNRR — Openpolis",
    description:
      "Fonte civica usata come fallback tecnico per consultare progetti PNRR quando i CSV nazionali non sono raggiungibili.",
    href: "https://openpnrr.it/",
    linkLabel: "Apri OpenPNRR",
    linkScope: "fallback",
    linkNote:
      "Collegamento di supporto/fallback metodologico; la fonte primaria resta il catalogo ufficiale Italia Domani e la documentazione dell'ente attuatore.",
    dataType: "Arricchito",
    updateFrequency:
      "Consultata solo come fonte di supporto/fallback; gli aggiornamenti dipendono dal servizio OpenPNRR e dalle basi dati nazionali sottostanti.",
    limitations:
      "È una rielaborazione civica di dati PNRR e non sostituisce il catalogo ufficiale Italia Domani né gli atti dell'ente attuatore.",
  },
  {
    name: "ANBSC — Open data beni sequestrati e confiscati",
    description:
      "Dataset nazionale sui beni immobili destinati o in gestione, filtrato per il territorio comunale quando disponibile.",
    href: "https://www.anbsc.it/opendata/beni-immobili-destinati.csv",
    linkLabel: "Apri il CSV ANBSC",
    linkScope: "specifico",
    linkNote:
      "Collegamento diretto al CSV nazionale; eventuali filtri territoriali, normalizzazioni e geocodifiche sono passaggi locali da verificare.",
    dataType: "Ufficiale",
    updateFrequency:
      "Sincronizzazione periodica del CSV nazionale; la frequenza effettiva dipende dalla pubblicazione ANBSC.",
    limitations:
      "Localizzazione, stato amministrativo e destinazione possono cambiare o richiedere verifica documentale. Le geocodifiche e le aggregazioni territoriali sono arricchimenti da trattare con cautela.",
  },
  {
    name: "Registro comunale degli accessi civici",
    description:
      "Registro ufficiale delle richieste di accesso civico e generalizzato quando pubblicato dall'ente o importato da documenti comunali.",
    href: "https://www.comune.lamezia-terme.cz.it/",
    linkLabel: "Apri il sito istituzionale del Comune",
    linkScope: "generico",
    linkNote:
      "Collegamento generico al sito dell'ente, usato quando il repository non documenta un URL stabile e puntuale del registro.",
    dataType: "Estratto",
    updateFrequency:
      "Aggiornamento manuale o periodico in base alla disponibilità del registro ufficiale e dei file pubblicati dal Comune.",
    limitations:
      "Oggetti, esiti e date possono provenire da CSV o documenti ufficiali con formati non uniformi. Ogni riga deve essere letta insieme al registro o all'atto di provenienza.",
  },
  {
    name: "Promessometro amministrativo — seed manuale",
    description:
      "Struttura redazionale locale per collegare promesse programmatiche, fonti della promessa e atti amministrativi pertinenti quando verificati.",
    href: "https://www.comune.lamezia-terme.cz.it/",
    linkLabel: "Apri il sito istituzionale del Comune",
    linkScope: "generico",
    linkNote:
      "Collegamento generico di contesto; non identifica una promessa, un atto o una fonte programmatica specifica.",
    dataType: "Da verificare",
    updateFrequency:
      "Aggiornamento manuale nella versione pubblica: ogni promessa reale richiede fonte programmatica, data, mandato di riferimento, nota di cautela e ultima verifica.",
    limitations:
      "La versione pubblica contiene un record modello non conteggiato quando non sono disponibili promesse verificate nel repository. I collegamenti ad atti non equivalgono automaticamente a completamento o realizzazione osservabile.",
  },
  {
    name: "Atti fondamentali, performance, legalità e pareri",
    description:
      "Documenti istituzionali come Statuto, regolamenti, PIAO, bilanci, indicatori di performance, requisiti di trasparenza e pareri di organismi di controllo.",
    href: "https://www.comune.lamezia-terme.cz.it/",
    linkLabel: "Apri il sito istituzionale del Comune",
    linkScope: "generico",
    linkNote:
      "Collegamento generico al sito dell'ente; le schede puntuali dei documenti possono richiedere ricerca nella sezione istituzionale aggiornata.",
    dataType: "Da verificare",
    updateFrequency:
      "Aggiornamento redazionale o automatico dove disponibile; la periodicità varia per tipologia di documento e per pubblicazione istituzionale.",
    limitations:
      "Le schede possono includere collegamenti, note e sintesi civiche. La valutazione di completezza documentale richiede sempre il confronto con l'ultimo documento ufficiale pubblicato dall'ente.",
  },
] as const satisfies readonly DataSource[];

export type DataSourceName = (typeof DATA_SOURCES)[number]["name"];

export const DATA_SOURCE_BY_NAME = Object.fromEntries(
  DATA_SOURCES.map((source) => [source.name, source]),
) as Record<DataSourceName, (typeof DATA_SOURCES)[number]>;
