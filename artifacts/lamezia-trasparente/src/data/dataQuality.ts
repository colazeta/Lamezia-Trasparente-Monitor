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
] satisfies readonly DataQualityNote[];

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
