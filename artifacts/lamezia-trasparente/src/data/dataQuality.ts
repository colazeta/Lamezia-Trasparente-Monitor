import { DATA_SOURCE_BY_NAME, type DataSourceName } from "@/data/dataSources";

export interface DataQualityIndicator {
  sourceName: DataSourceName;
  lastKnownUpdate: string;
  sourceTraceability: "Calcolato" | "Documentato";
  sourceLinkAvailability: string;
  identifierCoverage: string;
  attachmentAvailability: string;
  coverageLimits: string;
}

interface DataQualityNote {
  sourceName: DataSourceName;
  lastKnownUpdate: string;
  identifierCoverage: string;
  attachmentAvailability: string;
}

export interface QualityLegendItem {
  label: "Calcolato" | "Documentato/manuale" | "Non applicabile";
  text: string;
}

const DATA_QUALITY_NOTES = [
  {
    sourceName: "Albo Pretorio del Comune di Lamezia Terme",
    lastKnownUpdate:
      "Documentato: monitoraggio automatico periodico; questa pagina non espone un timestamp di ultimo snapshot.",
    identifierCoverage:
      "Documentato/manuale: numero atto, tipo e date dipendono dalla pubblicazione ufficiale; copertura aggregata non calcolata qui.",
    attachmentAvailability:
      "Documentato/manuale: allegati presenti quando pubblicati dall'Albo e recuperabili nella finestra pubblica; quota non calcolata qui.",
  },
  {
    sourceName: "Bandi di gara e contratti — feed Legge 190/2012",
    lastKnownUpdate:
      "Documentato: sincronizzazione periodica del feed; il valore puntuale dipende dall'ultima pubblicazione del gestore.",
    identifierCoverage:
      "Documentato/manuale: CIG e operatori possono essere presenti o estratti dal testo; percentuale non calcolata senza uno snapshot strutturato.",
    attachmentAvailability:
      "Documentato/manuale: gli allegati vanno verificati sugli atti collegati; quota non calcolata dal feed sintetico.",
  },
  {
    sourceName: "Portale ANAC / BDNCP sui contratti pubblici",
    lastKnownUpdate:
      "Documentato: aggiornamento secondo flussi nazionali ANAC; nessun timestamp locale calcolato in questa sezione.",
    identifierCoverage:
      "Documentato/manuale: il CIG è l'identificativo di consultazione, ma la disponibilità puntuale varia per scheda e trasmissione.",
    attachmentAvailability:
      "Non applicabile in questa matrice: la sezione monitora il collegamento alle schede, non la presenza di allegati locali.",
  },
  {
    sourceName: "Catalogo Open Data del Comune di Lamezia Terme",
    lastKnownUpdate:
      "Documentato: sincronizzazione periodica del catalogo; le date effettive restano nei metadati delle singole schede.",
    identifierCoverage:
      "Documentato/manuale: identificativi e campi chiave variano per dataset; copertura aggregata non confrontabile tra risorse eterogenee.",
    attachmentAvailability:
      "Documentato/manuale: risorse CSV, JSON o altri formati sono collegate nelle schede quando pubblicate; quota aggregata non calcolata qui.",
  },
  {
    sourceName: "Italia Domani — Open data PNRR",
    lastKnownUpdate:
      "Documentato: aggiornamento secondo calendario nazionale PNRR; questa pagina conserva solo la regola di consultazione.",
    identifierCoverage:
      "Documentato/manuale: il CUP è l'identificativo principale; la copertura va verificata sugli open data nazionali filtrati.",
    attachmentAvailability:
      "Non applicabile in questa matrice: i dataset PNRR sono basi tabellari nazionali, non fascicoli con allegati locali.",
  },

  {
    sourceName: "OpenPNRR — Openpolis",
    lastKnownUpdate:
      "Documentato/manuale: fonte di supporto consultata solo come fallback; gli aggiornamenti dipendono dal servizio OpenPNRR e dalle basi dati PNRR sottostanti.",
    identifierCoverage:
      "Documentato/manuale: CUP e collegamenti di progetto vanno confrontati con il catalogo ufficiale Italia Domani e con gli atti dell'ente attuatore; copertura locale non calcolata qui.",
    attachmentAvailability:
      "Non applicabile in questa matrice: fonte civica di consultazione e rielaborazione, non fascicolo locale con allegati monitorati dal portale.",
  },
  {
    sourceName: "ANBSC — Open data beni sequestrati e confiscati",
    lastKnownUpdate:
      "Documentato: sincronizzazione periodica del CSV nazionale; il timestamp puntuale dipende dalla pubblicazione ANBSC.",
    identifierCoverage:
      "Documentato/manuale: localizzazione e stato amministrativo sono campi del CSV nazionale; copertura locale non calcolata qui.",
    attachmentAvailability:
      "Non applicabile in questa matrice: fonte tabellare nazionale senza allegati locali monitorati dal portale.",
  },
  {
    sourceName: "Registro comunale degli accessi civici",
    lastKnownUpdate:
      "Documentato/manuale: aggiornamento in base alla disponibilità del registro ufficiale o dei file importati.",
    identifierCoverage:
      "Documentato/manuale: date, oggetti ed esiti dipendono dal formato del registro; copertura aggregata non calcolata qui.",
    attachmentAvailability:
      "Documentato/manuale: eventuali file o documenti di provenienza vanno letti con il registro ufficiale; quota non calcolata qui.",
  },

  {
    sourceName: "Promessometro amministrativo — seed manuale",
    lastKnownUpdate:
      "Documentato/manuale: seed redazionale aggiornabile solo dopo verifica di fonte programmatica, data, mandato di riferimento e nota di cautela.",
    identifierCoverage:
      "Documentato/manuale: eventuali promesse reali richiedono fonte e atto pertinente verificati; nessuna copertura aggregata è calcolata da questa matrice.",
    attachmentAvailability:
      "Documentato/manuale: i collegamenti ad atti o fonti programmatiche vanno verificati caso per caso; quota di allegati non calcolata qui.",
  },
  {
    sourceName: "Atti fondamentali, performance, legalità e pareri",
    lastKnownUpdate:
      "Documentato/manuale: periodicità variabile per tipologia di documento istituzionale; questa matrice non calcola un timestamp unico di aggiornamento.",
    identifierCoverage:
      "Documentato/manuale: estremi, annualità e versioni dipendono dalle schede ufficiali dei singoli documenti; copertura aggregata non calcolata qui.",
    attachmentAvailability:
      "Documentato/manuale: documenti e pareri vanno confrontati con l'ultima pubblicazione ufficiale dell'ente; quota di allegati non calcolata qui.",
  },
] satisfies readonly DataQualityNote[];

export const DATA_QUALITY_EXCLUDED_SOURCE_NAMES =
  [] satisfies readonly DataSourceName[];

const getSourceLinkAvailability = (href: string) =>
  href.trim().length > 0
    ? "Disponibile: la scheda fonte contiene un link pubblico verificabile."
    : "Non documentato: la scheda fonte non contiene un link pubblico verificabile.";

export const DATA_QUALITY_MATRIX = DATA_QUALITY_NOTES.map((indicator) => {
  const source = DATA_SOURCE_BY_NAME[indicator.sourceName];

  return {
    ...indicator,
    sourceTraceability: "Calcolato",
    sourceLinkAvailability: getSourceLinkAvailability(source.href),
    coverageLimits: source.limitations,
  };
}) satisfies readonly DataQualityIndicator[];

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
