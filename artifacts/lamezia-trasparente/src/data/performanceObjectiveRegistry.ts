export type PerformanceSourceType = "DUP" | "PEG" | "PIAO" | "OIV";

export type PerformanceSourceRole =
  | "programming"
  | "objective-definition"
  | "monitoring"
  | "validation";

export type PerformanceSourceAcquisitionStatus =
  | "metadata-verified"
  | "document-verified";

export type PerformanceObjectiveExtractionStatus = "pending" | "verified";

export interface PerformanceSourceDocument {
  id: string;
  cycle: string;
  type: PerformanceSourceType;
  title: string;
  officialUrl: string;
  sourceLocator: string;
  approvalAct: string | null;
  responsibleOffice: string | null;
  publishedAt: string | null;
  roles: PerformanceSourceRole[];
  acquisitionStatus: PerformanceSourceAcquisitionStatus;
  objectiveExtractionStatus: PerformanceObjectiveExtractionStatus;
  note: string | null;
}

export type PerformanceObjectiveValidationStatus =
  | "planned"
  | "monitored"
  | "validated"
  | "pending";

/**
 * Record canonico per un obiettivo amministrativo.
 *
 * I campi documentali restano null finché il contenuto non è stato verificato
 * nella fonte ufficiale con un locator riproducibile (pagina, sezione o altro
 * riferimento puntuale). In particolare, gli snippet dei motori di ricerca non
 * sono sufficienti per popolare questo registro.
 */
export interface PerformanceObjectiveRecord {
  id: string;
  cycle: string;
  title: string;
  sourceDocumentId: string;
  sourceLocator: string;
  strategicArea: string | null;
  office: string | null;
  responsible: string | null;
  indicatorTitle: string | null;
  baseline: string | null;
  target: string | null;
  result: string | null;
  evidenceUrl: string | null;
  validationSourceUrl: string | null;
  validationStatus: PerformanceObjectiveValidationStatus;
  note: string | null;
}

/**
 * Fonti ufficiali verificate a livello di metadati il 2 settembre 2026.
 *
 * La presenza di una fonte non implica che gli obiettivi contenuti nel relativo
 * documento siano già stati estratti o validati. `objectiveExtractionStatus`
 * rende esplicita questa distinzione.
 */
export const performanceSourceDocuments: PerformanceSourceDocument[] = [
  {
    id: "peg-2024-2026-performance",
    cycle: "2024–2026",
    type: "PEG",
    title: "Piano della performance — PEG 2024–2026",
    officialUrl:
      "https://www.comune.lamezia-terme.cz.it/it/page/documento-di-programmazione-e-rendicontazione",
    sourceLocator: "Scheda «Piano della performance»",
    approvalAct: "D.G.C. n. 173 del 23.05.2024",
    responsibleOffice: null,
    publishedAt: null,
    roles: ["programming", "objective-definition"],
    acquisitionStatus: "metadata-verified",
    objectiveExtractionStatus: "pending",
    note:
      "La pagina istituzionale qualifica il PEG 2024–2026 come Piano della performance. Gli obiettivi non sono trascritti finché l'allegato non è verificato con locator puntuale.",
  },
  {
    id: "dup-2025-2027-schema",
    cycle: "2025–2027",
    type: "DUP",
    title: "Documento Unico di Programmazione DUP 2025–2027 — schema",
    officialUrl:
      "https://www.comune.lamezia-terme.cz.it/it/documenti_pubblici/documento-unico-di-programmazione-dup-2025-2027",
    sourceLocator: "Pagina documentale «Documento Unico di Programmazione DUP 2025-2027»",
    approvalAct: "D.G.C. n. 65 del 26.02.2025 (approvazione dello schema)",
    responsibleOffice: "Settore Economico-Finanziario",
    publishedAt: "2025-03-03",
    roles: ["programming"],
    acquisitionStatus: "metadata-verified",
    objectiveExtractionStatus: "pending",
    note:
      "Il registro descrive la pagina ufficiale dello schema pubblicato dal Comune; non la presenta come se fosse già il documento consiliare definitivo.",
  },
  {
    id: "piao-2025-2027-performance-consultation",
    cycle: "2025–2027",
    type: "PIAO",
    title: "Consultazione pubblica — sottosezione Performance del PIAO 2025/2027",
    officialUrl:
      "https://www.comune.lamezia-terme.cz.it/it/news/115171/consultazione-per-aggiornamento-del-piao-2025-2027",
    sourceLocator: "Descrizione e sezione «A cura di»",
    approvalAct: null,
    responsibleOffice: "UOA Segreteria Generale",
    publishedAt: "2025-01-21",
    roles: ["programming", "objective-definition"],
    acquisitionStatus: "metadata-verified",
    objectiveExtractionStatus: "pending",
    note:
      "La pagina attesta il processo di aggiornamento degli obiettivi programmatici e strategici della sottosezione Performance. Non equivale al PIAO approvato e non viene usata per ricostruire singoli obiettivi.",
  },
  {
    id: "oiv-office-performance-validation",
    cycle: "continuativo",
    type: "OIV",
    title: "Ufficio OIV — presidio della validazione della performance",
    officialUrl:
      "https://www.comune.lamezia-terme.cz.it/it/unita_organizzative/ufficio-oiv",
    sourceLocator: "Sezione «Competenze»",
    approvalAct: null,
    responsibleOffice: "UOA Segreteria Generale",
    publishedAt: null,
    roles: ["monitoring", "validation"],
    acquisitionStatus: "metadata-verified",
    objectiveExtractionStatus: "pending",
    note:
      "La pagina istituzionale documenta il ruolo dell'OIV nella validazione della Relazione sulla performance e nella pubblicazione dei verbali; non documenta una specifica validazione annuale.",
  },
];

/**
 * Nessun obiettivo viene materializzato nella v1 senza una verifica puntuale del
 * documento sorgente. Il tipo è già disponibile per le successive acquisizioni.
 */
export const performanceObjectiveRecords: PerformanceObjectiveRecord[] = [];

export function getPerformanceRegistryStats(
  sources: PerformanceSourceDocument[] = performanceSourceDocuments,
  objectives: PerformanceObjectiveRecord[] = performanceObjectiveRecords,
) {
  return {
    sourceDocuments: sources.length,
    objectiveDefinitionSources: sources.filter((source) =>
      source.roles.includes("objective-definition"),
    ).length,
    validationSources: sources.filter((source) =>
      source.roles.includes("validation"),
    ).length,
    objectiveRecords: objectives.length,
    withIndicator: objectives.filter((objective) => objective.indicatorTitle !== null)
      .length,
    withTarget: objectives.filter((objective) => objective.target !== null).length,
    withResult: objectives.filter((objective) => objective.result !== null).length,
    withEvidence: objectives.filter((objective) => objective.evidenceUrl !== null)
      .length,
    withOivValidation: objectives.filter(
      (objective) => objective.validationStatus === "validated",
    ).length,
  };
}

const ALLOWED_SOURCE_HOSTS = new Set([
  "www.comune.lamezia-terme.cz.it",
  "comune.lamezia-terme.cz.it",
  "piao.dfp.gov.it",
]);

function hasEmptyString(value: string | null) {
  return typeof value === "string" && value.trim().length === 0;
}

export function validatePerformanceObjectiveRegistry(
  sources: PerformanceSourceDocument[] = performanceSourceDocuments,
  objectives: PerformanceObjectiveRecord[] = performanceObjectiveRecords,
) {
  const errors: string[] = [];
  const sourceIds = new Set<string>();
  const objectiveIds = new Set<string>();

  for (const source of sources) {
    if (sourceIds.has(source.id)) errors.push(`duplicate source id: ${source.id}`);
    sourceIds.add(source.id);

    let parsedUrl: URL | null = null;
    try {
      parsedUrl = new URL(source.officialUrl);
    } catch {
      errors.push(`invalid source URL: ${source.id}`);
    }

    if (parsedUrl) {
      if (parsedUrl.protocol !== "https:") {
        errors.push(`source URL is not HTTPS: ${source.id}`);
      }
      if (!ALLOWED_SOURCE_HOSTS.has(parsedUrl.hostname)) {
        errors.push(`source host is not allow-listed: ${source.id}`);
      }
    }

    if (!source.sourceLocator.trim()) {
      errors.push(`missing source locator: ${source.id}`);
    }
    if (hasEmptyString(source.approvalAct)) {
      errors.push(`empty approvalAct must be null: ${source.id}`);
    }
    if (hasEmptyString(source.responsibleOffice)) {
      errors.push(`empty responsibleOffice must be null: ${source.id}`);
    }
    if (hasEmptyString(source.publishedAt)) {
      errors.push(`empty publishedAt must be null: ${source.id}`);
    }
    if (hasEmptyString(source.note)) {
      errors.push(`empty note must be null: ${source.id}`);
    }
  }

  for (const objective of objectives) {
    if (objectiveIds.has(objective.id)) {
      errors.push(`duplicate objective id: ${objective.id}`);
    }
    objectiveIds.add(objective.id);

    if (!sourceIds.has(objective.sourceDocumentId)) {
      errors.push(`unknown sourceDocumentId: ${objective.id}`);
    }
    if (!objective.sourceLocator.trim()) {
      errors.push(`missing objective locator: ${objective.id}`);
    }
    if (objective.target !== null && objective.indicatorTitle === null) {
      errors.push(`target without indicator: ${objective.id}`);
    }
    if (objective.result !== null && objective.evidenceUrl === null) {
      errors.push(`result without evidence URL: ${objective.id}`);
    }
    if (
      objective.validationStatus === "validated" &&
      objective.validationSourceUrl === null
    ) {
      errors.push(`validated objective without validation source: ${objective.id}`);
    }

    for (const [field, value] of Object.entries({
      strategicArea: objective.strategicArea,
      office: objective.office,
      responsible: objective.responsible,
      indicatorTitle: objective.indicatorTitle,
      baseline: objective.baseline,
      target: objective.target,
      result: objective.result,
      evidenceUrl: objective.evidenceUrl,
      validationSourceUrl: objective.validationSourceUrl,
      note: objective.note,
    })) {
      if (hasEmptyString(value)) {
        errors.push(`empty ${field} must be null: ${objective.id}`);
      }
    }
  }

  return errors;
}
