export interface DataQualityIndicator {
  sourceName: string;
  lastKnownUpdate: string;
  sourceTraceability: "Calcolato" | "Documentato";
  sourceLinkAvailability: string;
  identifierCoverage: string;
  attachmentAvailability: string;
  coverageLimits: string;
}

export interface QualityLegendItem {
  label: "Calcolato" | "Documentato/manuale" | "Non applicabile";
  text: string;
}

export const DATA_QUALITY_MATRIX = [
  {
    sourceName: "Albo Pretorio del Comune di Lamezia Terme",
    lastKnownUpdate:
      "Documentato: monitoraggio automatico periodico; questa pagina non espone un timestamp di ultimo snapshot.",
    sourceTraceability: "Calcolato",
    sourceLinkAvailability:
      "Disponibile: la scheda fonte contiene un link pubblico verificabile.",
    identifierCoverage:
      "Documentato/manuale: numero atto, tipo e date dipendono dalla pubblicazione ufficiale; copertura aggregata non calcolata qui.",
    attachmentAvailability:
      "Documentato/manuale: allegati presenti quando pubblicati dall'Albo e recuperabili nella finestra pubblica; quota non calcolata qui.",
    coverageLimits:
      "L'Albo ufficiale conserva gli atti per finestre temporali limitate. I documenti precedenti all'avvio del monitoraggio continuativo potrebbero non essere recuperabili se non più pubblici.",
  },
  {
    sourceName: "Bandi di gara e contratti — feed Legge 190/2012",
    lastKnownUpdate:
      "Documentato: sincronizzazione periodica del feed; il valore puntuale dipende dall'ultima pubblicazione del gestore.",
    sourceTraceability: "Calcolato",
    sourceLinkAvailability:
      "Disponibile: la scheda fonte contiene un link pubblico verificabile.",
    identifierCoverage:
      "Documentato/manuale: CIG e operatori possono essere presenti o estratti dal testo; percentuale non calcolata senza uno snapshot strutturato.",
    attachmentAvailability:
      "Documentato/manuale: gli allegati vanno verificati sugli atti collegati; quota non calcolata dal feed sintetico.",
    coverageLimits:
      "Alcuni campi non sono sempre strutturati nel feed e vengono estratti dal testo con regole conservative. Importi, operatori e classificazioni possono richiedere verifica sull'atto originale o sulla BDNCP.",
  },
  {
    sourceName: "Portale ANAC / BDNCP sui contratti pubblici",
    lastKnownUpdate:
      "Documentato: aggiornamento secondo flussi nazionali ANAC; nessun timestamp locale calcolato in questa sezione.",
    sourceTraceability: "Calcolato",
    sourceLinkAvailability:
      "Disponibile: la scheda fonte contiene un link pubblico verificabile.",
    identifierCoverage:
      "Documentato/manuale: il CIG è l'identificativo di consultazione, ma la disponibilità puntuale varia per scheda e trasmissione.",
    attachmentAvailability:
      "Non applicabile in questa matrice: la sezione monitora il collegamento alle schede, non la presenza di allegati locali.",
    coverageLimits:
      "La disponibilità puntuale per singolo CIG può variare. Il collegamento ANAC non sostituisce la verifica degli atti di gara, degli allegati e delle determine pubblicate dall'ente.",
  },
  {
    sourceName: "Catalogo Open Data del Comune di Lamezia Terme",
    lastKnownUpdate:
      "Documentato: sincronizzazione periodica del catalogo; le date effettive restano nei metadati delle singole schede.",
    sourceTraceability: "Calcolato",
    sourceLinkAvailability:
      "Disponibile: la scheda fonte contiene un link pubblico verificabile.",
    identifierCoverage:
      "Documentato/manuale: identificativi e campi chiave variano per dataset; copertura aggregata non confrontabile tra risorse eterogenee.",
    attachmentAvailability:
      "Documentato/manuale: risorse CSV, JSON o altri formati sono collegate nelle schede quando pubblicate; quota aggregata non calcolata qui.",
    coverageLimits:
      "I dataset possono avere granularità, completezza e periodicità diverse. Le trasformazioni tabellari e gli snapshot locali servono alla consultazione civica e vanno confrontati con la scheda ufficiale del dataset.",
  },
  {
    sourceName: "Italia Domani — Open data PNRR",
    lastKnownUpdate:
      "Documentato: aggiornamento secondo calendario nazionale PNRR; questa pagina conserva solo la regola di consultazione.",
    sourceTraceability: "Calcolato",
    sourceLinkAvailability:
      "Disponibile: la scheda fonte contiene un link pubblico verificabile.",
    identifierCoverage:
      "Documentato/manuale: il CUP è l'identificativo principale; la copertura va verificata sugli open data nazionali filtrati.",
    attachmentAvailability:
      "Non applicabile in questa matrice: i dataset PNRR sono basi tabellari nazionali, non fascicoli con allegati locali.",
    coverageLimits:
      "I dati nazionali possono essere aggiornati con ritardi rispetto agli atti locali. Stato, importi e cronoprogrammi vanno letti insieme agli atti comunali e alle eventuali variazioni di progetto.",
  },
  {
    sourceName: "ANBSC — Open data beni sequestrati e confiscati",
    lastKnownUpdate:
      "Documentato: sincronizzazione periodica del CSV nazionale; il timestamp puntuale dipende dalla pubblicazione ANBSC.",
    sourceTraceability: "Calcolato",
    sourceLinkAvailability:
      "Disponibile: la scheda fonte contiene un link pubblico verificabile.",
    identifierCoverage:
      "Documentato/manuale: localizzazione e stato amministrativo sono campi del CSV nazionale; copertura locale non calcolata qui.",
    attachmentAvailability:
      "Non applicabile in questa matrice: fonte tabellare nazionale senza allegati locali monitorati dal portale.",
    coverageLimits:
      "Localizzazione, stato amministrativo e destinazione possono cambiare o richiedere verifica documentale. Le geocodifiche e le aggregazioni territoriali sono arricchimenti da trattare con cautela.",
  },
  {
    sourceName: "Registro comunale degli accessi civici",
    lastKnownUpdate:
      "Documentato/manuale: aggiornamento in base alla disponibilità del registro ufficiale o dei file importati.",
    sourceTraceability: "Calcolato",
    sourceLinkAvailability:
      "Disponibile: la scheda fonte contiene un link pubblico verificabile.",
    identifierCoverage:
      "Documentato/manuale: date, oggetti ed esiti dipendono dal formato del registro; copertura aggregata non calcolata qui.",
    attachmentAvailability:
      "Documentato/manuale: eventuali file o documenti di provenienza vanno letti con il registro ufficiale; quota non calcolata qui.",
    coverageLimits:
      "Oggetti, esiti e date possono provenire da CSV o documenti ufficiali con formati non uniformi. Ogni riga deve essere letta insieme al registro o all'atto di provenienza.",
  },
] satisfies readonly DataQualityIndicator[];

export const QUALITY_LEGEND = [
  {
    label: "Calcolato",
    text: "valore derivato direttamente da campi già presenti in questa pagina, ad esempio la presenza di un link pubblico nella scheda fonte.",
  },
  {
    label: "Documentato/manuale",
    text: "nota metodologica ricavata dalle schede fonte esistenti: segnala che l'aggregato non è ancora calcolato da uno snapshot strutturato.",
  },
  {
    label: "Non applicabile",
    text: "indicatore non confrontabile per quella fonte, ad esempio allegati locali su dataset tabellari nazionali.",
  },
] satisfies readonly QualityLegendItem[];
