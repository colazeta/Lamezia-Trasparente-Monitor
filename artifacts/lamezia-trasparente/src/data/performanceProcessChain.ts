export type PerformanceProcessStage =
  | "plan-approval"
  | "intermediate-monitoring"
  | "final-monitoring"
  | "reporting-consultation"
  | "oiv-validation"
  | "giunta-approval"
  | "permanent-publication";

export type PerformanceProcessEvidenceStatus =
  | "metadata-indexed"
  | "indexed-page-verified"
  | "pending-document";

export interface PerformanceProcessEvent {
  id: string;
  cycle: string;
  stage: PerformanceProcessStage;
  date: string | null;
  title: string;
  officialUrl: string | null;
  sourceLocator: string | null;
  evidenceStatus: PerformanceProcessEvidenceStatus;
  note: string;
}

const TINNVISION_PIAO_SECTION_EXPORT =
  "https://trasparenza.tinnvision.cloud/traspamm/documenti/00301390795/download/pdf/?_search=&idannopubblicazione=2025&idsezione=243&page=1&rows=50";

const FINAL_MONITORING_13_54_93 =
  "https://lamezia-terme-api.municipiumapp.it/s3/3458/allegati/segreteria-generale/obiettivi-13_54_93-uniti.pdf";

const REPORTING_CONSULTATION_2024 =
  "https://lamezia-terme-api.municipiumapp.it/s3/3458/allegati/segreteria-generale/avviso-stakeholders-inclusione-e-accessibilita-signed.pdf";

/**
 * Catena di processo del ciclo Performance 2024.
 *
 * Un evento `metadata-indexed` documenta soltanto l'esistenza/descrizione del
 * record nell'indice ufficiale. Non autorizza l'estrazione dei valori contenuti
 * negli allegati. I valori amministrativi entrano nei dataset soltanto da una
 * fonte verificata pagina per pagina.
 */
export const performance2024ProcessEvents: PerformanceProcessEvent[] = [
  {
    id: "performance-2024-piao-approval",
    cycle: "2024",
    stage: "plan-approval",
    date: "2024-08-09",
    title: "PIAO 2024–2026 approvato",
    officialUrl: TINNVISION_PIAO_SECTION_EXPORT,
    sourceLocator:
      "Amministrazione Trasparente · sezione PIAO · riga 09/08/2024: «PIAO 2024-2026 DELIBERA DI G.C. N. 240 DEL 09.08.2024 ED ALLEGATI»",
    evidenceStatus: "metadata-indexed",
    note:
      "Il registro ufficiale documenta atto e data. Gli allegati del PIAO non sono ancora trattati come pagina-verificati perché il file del Portale PIAO oggi non è direttamente servibile.",
  },
  {
    id: "performance-2024-intermediate-monitoring",
    cycle: "2024",
    stage: "intermediate-monitoring",
    date: "2024-09-30",
    title: "Monitoraggio intermedio al 30 settembre 2024",
    officialUrl: TINNVISION_PIAO_SECTION_EXPORT,
    sourceLocator:
      "Amministrazione Trasparente · sezione PIAO · riga 29/11/2024: «PIAO 2024-2026 - presa atto monitoraggio al 30-09-2024 e contestuale variazione Allegato 2...»",
    evidenceStatus: "metadata-indexed",
    note:
      "È verificata l'esistenza della presa d'atto del monitoraggio. Le percentuali visibili soltanto nell'indice del PDF non sono materializzate come record finché l'allegato non torna direttamente acquisibile.",
  },
  {
    id: "performance-2024-final-monitoring-selected-objectives",
    cycle: "2024",
    stage: "final-monitoring",
    date: "2024-12-31",
    title: "Monitoraggio finale — primo nucleo verificato",
    officialUrl: FINAL_MONITORING_13_54_93,
    sourceLocator:
      "PDF di 7 pagine · numerazione interna pp. 91–92, 112–114, 162–163",
    evidenceStatus: "indexed-page-verified",
    note:
      "Sono già materializzati gli obiettivi 13, 54 e 93 con fasi e pesi. È un nucleo documentale parziale, non il censimento completo del monitoraggio finale.",
  },
  {
    id: "performance-2024-reporting-consultation",
    cycle: "2024",
    stage: "reporting-consultation",
    date: "2025-10-14",
    title: "Consultazione sulla Relazione sulla Performance 2024",
    officialUrl: REPORTING_CONSULTATION_2024,
    sourceLocator: "pp. 1–2",
    evidenceStatus: "indexed-page-verified",
    note:
      "L'avviso apre la fase di rendicontazione e precisa che la Relazione 2024, dopo validazione OIV e approvazione della Giunta, sarebbe stata pubblicata permanentemente in Amministrazione Trasparente. Non dimostra che tali passaggi successivi siano già avvenuti.",
  },
  {
    id: "performance-2024-oiv-validation",
    cycle: "2024",
    stage: "oiv-validation",
    date: null,
    title: "Validazione OIV della Relazione 2024",
    officialUrl: null,
    sourceLocator: null,
    evidenceStatus: "pending-document",
    note:
      "Da acquisire il documento OIV riferito specificamente alla Relazione sulla Performance 2024.",
  },
  {
    id: "performance-2024-giunta-approval",
    cycle: "2024",
    stage: "giunta-approval",
    date: null,
    title: "Approvazione della Relazione 2024 da parte della Giunta",
    officialUrl: null,
    sourceLocator: null,
    evidenceStatus: "pending-document",
    note:
      "Da identificare e verificare l'atto di Giunta che approva la Relazione sulla Performance 2024.",
  },
  {
    id: "performance-2024-permanent-publication",
    cycle: "2024",
    stage: "permanent-publication",
    date: null,
    title: "Pubblicazione permanente della Relazione 2024",
    officialUrl: null,
    sourceLocator: null,
    evidenceStatus: "pending-document",
    note:
      "Il percorso previsto dall'avviso 14/10/2025 termina con la pubblicazione in Amministrazione Trasparente; il documento finale non è ancora stato localizzato in forma direttamente verificabile.",
  },
];

function isValidIsoDate(value: string | null) {
  if (value === null) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

export function validatePerformanceProcessChain(
  events: PerformanceProcessEvent[] = performance2024ProcessEvents,
) {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const event of events) {
    if (ids.has(event.id)) errors.push(`duplicate process event id: ${event.id}`);
    ids.add(event.id);

    if (!isValidIsoDate(event.date)) {
      errors.push(`invalid process event date: ${event.id}`);
    }
    if (!event.title.trim()) errors.push(`missing process event title: ${event.id}`);
    if (!event.note.trim()) errors.push(`missing process event note: ${event.id}`);

    if (event.evidenceStatus === "pending-document") {
      if (event.officialUrl !== null || event.sourceLocator !== null) {
        errors.push(`pending event must not claim a verified source: ${event.id}`);
      }
      continue;
    }

    if (event.officialUrl === null || event.sourceLocator === null) {
      errors.push(`verified event lacks source: ${event.id}`);
      continue;
    }

    try {
      const url = new URL(event.officialUrl);
      if (url.protocol !== "https:") {
        errors.push(`process event source is not HTTPS: ${event.id}`);
      }
    } catch {
      errors.push(`invalid process event URL: ${event.id}`);
    }
  }

  return errors;
}

export function getPerformanceProcessStats(
  events: PerformanceProcessEvent[] = performance2024ProcessEvents,
) {
  return {
    total: events.length,
    pageVerified: events.filter(
      (event) => event.evidenceStatus === "indexed-page-verified",
    ).length,
    metadataOnly: events.filter(
      (event) => event.evidenceStatus === "metadata-indexed",
    ).length,
    pending: events.filter(
      (event) => event.evidenceStatus === "pending-document",
    ).length,
  };
}
