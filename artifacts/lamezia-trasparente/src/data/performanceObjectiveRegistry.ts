export type PerformanceSourceType =
  | "DUP"
  | "PEG"
  | "PIAO"
  | "OIV"
  | "MONITORAGGIO";

export type PerformanceSourceRole =
  | "programming"
  | "objective-definition"
  | "monitoring"
  | "validation";

export type PerformanceSourceAcquisitionStatus =
  | "metadata-verified"
  | "indexed-page-verified"
  | "visual-page-verified";

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

export type PerformanceObjectiveResultProvenance =
  | "official"
  | "lt-derived-from-phases";

export type PerformanceObjectivePhaseStatus =
  | "completed"
  | "partial"
  | "not-completed"
  | "unknown";

export interface PerformanceObjectivePhase {
  id: string;
  title: string;
  weightPercent: number | null;
  plannedStart: string | null;
  plannedEnd: string | null;
  expectedResult: string | null;
  finalProgressPercent: number | null;
  finalStatus: PerformanceObjectivePhaseStatus;
  sourceLocator: string;
}

/**
 * Record canonico per un obiettivo amministrativo.
 *
 * I campi documentali restano null finché il contenuto non è stato verificato
 * nella fonte ufficiale con un locator riproducibile (pagina, sezione o altro
 * riferimento puntuale). In particolare, gli snippet dei motori di ricerca non
 * sono sufficienti per popolare questo registro.
 *
 * `result` può contenere un valore LT derivato esclusivamente quando
 * `resultProvenance` lo dichiara esplicitamente e le fasi documentali consentono
 * un calcolo riproducibile. Un risultato derivato non equivale a una valutazione
 * ufficiale né a una validazione OIV.
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
  objectiveType: string | null;
  indicatorTitle: string | null;
  baseline: string | null;
  target: string | null;
  result: string | null;
  resultProvenance: PerformanceObjectiveResultProvenance | null;
  phases: PerformanceObjectivePhase[];
  evidenceUrl: string | null;
  validationSourceUrl: string | null;
  validationStatus: PerformanceObjectiveValidationStatus;
  note: string | null;
}

/**
 * Fonti ufficiali verificate a livello di metadati o di pagina.
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
    title: "PEG finanziario 2024–2026",
    officialUrl:
      "https://www.comune.lamezia-terme.cz.it/it/page/documento-di-programmazione-e-rendicontazione",
    sourceLocator:
      "Scheda comunale «Piano della performance»; D.G.C. n. 173 del 23.05.2024",
    approvalAct: "D.G.C. n. 173 del 23.05.2024",
    responsibleOffice: null,
    publishedAt: null,
    roles: ["programming"],
    acquisitionStatus: "metadata-verified",
    objectiveExtractionStatus: "pending",
    note:
      "La pagina di navigazione comunale etichetta il PEG 2024–2026 come «Piano della performance». L'atto primario di approvazione chiarisce invece che il PEG è finanziario e che gli obiettivi di performance rientrano nelle apposite sezioni del PIAO. Il registro segue il contenuto dell'atto senza qualificare il disallineamento di etichetta come errore amministrativo.",
  },
  {
    id: "piao-2024-2026-approved",
    cycle: "2024–2026",
    type: "PIAO",
    title: "PIAO 2024–2026 approvato",
    officialUrl:
      "https://piao.dfp.gov.it/data/documents/129469/PIAO_2024_2026.pdf",
    sourceLocator:
      "Registro Amministrazione Trasparente: pubblicazione 09.08.2024 «PIAO 2024-2026 DELIBERA DI G.C. N. 240 DEL 09.08.2024 ED ALLEGATI»",
    approvalAct: "D.G.C. n. 240 del 09.08.2024",
    responsibleOffice: null,
    publishedAt: "2024-08-09",
    roles: ["programming", "objective-definition"],
    acquisitionStatus: "metadata-verified",
    objectiveExtractionStatus: "pending",
    note:
      "Fonte primaria per la definizione degli obiettivi di performance del ciclo 2024. Il registro comunale ne attesta pubblicazione e atto di approvazione; il Portale PIAO indicizza il PDF, ma al controllo del 3 settembre 2026 il download diretto non era nuovamente servibile. Indicatori, baseline e target restano quindi da estrarre solo dopo verifica documentale con locator puntuale.",
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
    id: "performance-2024-monitoraggio-finale-13-54-93",
    cycle: "2024",
    type: "MONITORAGGIO",
    title: "Monitoraggio finale delle Performance 2024 — obiettivi 13, 54 e 93",
    officialUrl:
      "https://lamezia-terme-api.municipiumapp.it/s3/3458/allegati/segreteria-generale/obiettivi-13_54_93-uniti.pdf",
    sourceLocator:
      "Numerazione interna: pp. 91–92, 112–114 e 162–163; PDF di 7 pagine",
    approvalAct: null,
    responsibleOffice: null,
    publishedAt: null,
    roles: ["monitoring"],
    acquisitionStatus: "indexed-page-verified",
    objectiveExtractionStatus: "verified",
    note:
      "Il testo del PDF è stato verificato pagina per pagina con locator riproducibili il 3 settembre 2026. La verifica visuale delle pagine resta separatamente pendente perché il renderer screenshot della fonte ha restituito cache miss; nessun contenuto è stato ricostruito da snippet di ricerca.",
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

const PERFORMANCE_2024_FINAL_MONITORING_URL =
  "https://lamezia-terme-api.municipiumapp.it/s3/3458/allegati/segreteria-generale/obiettivi-13_54_93-uniti.pdf";

export const performanceObjectiveRecords: PerformanceObjectiveRecord[] = [
  {
    id: "2024-013",
    cycle: "2024",
    title: "Inclusione ed accessibilità dell'Amministrazione",
    sourceDocumentId: "performance-2024-monitoraggio-finale-13-54-93",
    sourceLocator: "pp. 91–92 (numerazione interna; PDF pp. 1–2)",
    strategicArea: null,
    office: "Settore Servizi alla Persona",
    responsible: "Ida Virginia Bufano",
    objectiveType: "PERFORMANCE ORGANIZZATIVA - ANNUALE",
    indicatorTitle: null,
    baseline: null,
    target: null,
    result: "90%",
    resultProvenance: "lt-derived-from-phases",
    phases: [
      {
        id: "F01",
        title: "Predisposizione avviso pubblico",
        weightPercent: 70,
        plannedStart: "2024-01-01",
        plannedEnd: "2024-07-31",
        expectedResult: "Determina",
        finalProgressPercent: 100,
        finalStatus: "completed",
        sourceLocator: "p. 92",
      },
      {
        id: "F02",
        title: "Valutazione candidature presentate",
        weightPercent: 20,
        plannedStart: "2024-07-31",
        plannedEnd: "2024-09-15",
        expectedResult: "Determina",
        finalProgressPercent: 100,
        finalStatus: "completed",
        sourceLocator: "p. 92",
      },
      {
        id: "F03",
        title: "Conferimento incarico",
        weightPercent: 10,
        plannedStart: "2024-09-15",
        plannedEnd: "2024-12-31",
        expectedResult: "Disciplinare / Contratto",
        finalProgressPercent: 0,
        finalStatus: "not-completed",
        sourceLocator: "p. 92",
      },
    ],
    evidenceUrl: PERFORMANCE_2024_FINAL_MONITORING_URL,
    validationSourceUrl: null,
    validationStatus: "monitored",
    note:
      "Il 90% è un calcolo LT riproducibile sulle tre fasi documentate: 70×100% + 20×100% + 10×0%. Non è presentato come valutazione ufficiale complessiva né come validazione OIV.",
  },
  {
    id: "2024-054",
    cycle: "2024",
    title:
      "Obiettivo inclusione e accessibilità - (PNRR) - M2 C3 I1.1 - Costruzione di nuove scuole mediante sostituzione di edifici",
    sourceDocumentId: "performance-2024-monitoraggio-finale-13-54-93",
    sourceLocator: "pp. 112–114 (numerazione interna; PDF pp. 3–5)",
    strategicArea: "PNRR M2 C3 I1.1",
    office: "Settore Tecnico",
    responsible: "Francesco Esposito",
    objectiveType: "PERFORMANCE INDIVIDUALE - ANNUALE",
    indicatorTitle: null,
    baseline: null,
    target: null,
    result: "100%",
    resultProvenance: "lt-derived-from-phases",
    phases: [
      {
        id: "F01",
        title: "Consegna dei lavori",
        weightPercent: 20,
        plannedStart: "2024-01-01",
        plannedEnd: "2024-03-31",
        expectedResult: "Contratto stipulato",
        finalProgressPercent: 100,
        finalStatus: "completed",
        sourceLocator: "p. 113",
      },
      {
        id: "F02",
        title: "Stipula contratto",
        weightPercent: 20,
        plannedStart: "2024-01-01",
        plannedEnd: "2024-03-31",
        expectedResult: "Verbale di consegna dei lavori",
        finalProgressPercent: 100,
        finalStatus: "completed",
        sourceLocator: "p. 113",
      },
      {
        id: "F03",
        title: "Concreto inizio dei lavori e liquidazione anticipazione contrattuale",
        weightPercent: 30,
        plannedStart: "2024-04-01",
        plannedEnd: "2024-05-31",
        expectedResult: "Liquidazione anticipazione contrattuale",
        finalProgressPercent: 100,
        finalStatus: "completed",
        sourceLocator: "p. 113",
      },
      {
        id: "F04",
        title:
          "Avanzamento dei lavori con raggiungimento di almeno uno Stato di Avanzamento dei Lavori",
        weightPercent: 30,
        plannedStart: "2024-06-01",
        plannedEnd: "2024-12-31",
        expectedResult:
          "Approvazione del primo Stato di Avanzamento dei Lavori con relativa approvazione della determina",
        finalProgressPercent: 100,
        finalStatus: "completed",
        sourceLocator: "pp. 113–114",
      },
    ],
    evidenceUrl: PERFORMANCE_2024_FINAL_MONITORING_URL,
    validationSourceUrl: null,
    validationStatus: "monitored",
    note:
      "Il 100% è un calcolo LT riproducibile sulle quattro fasi, tutte riportate al 100% nel monitoraggio finale. Il registro conserva separatamente le formulazioni di fase e risultato atteso così come pubblicate.",
  },
  {
    id: "2024-093",
    cycle: "2024",
    title:
      "Inclusione e accessibilità: Misura PNRR 1.4.1. \"Esperienza del cittadino nei servizi pubblici\". Sito Internet e servizi digitali",
    sourceDocumentId: "performance-2024-monitoraggio-finale-13-54-93",
    sourceLocator: "pp. 162–163 (numerazione interna; PDF pp. 6–7)",
    strategicArea: "PNRR 1.4.1",
    office: "U.O.A. Transizione Digitale",
    responsible: "Gianfranco Molinaro",
    objectiveType: "PERFORMANCE ORGANIZZATIVA - ANNUALE",
    indicatorTitle: null,
    baseline: null,
    target: null,
    result: "100%",
    resultProvenance: "lt-derived-from-phases",
    phases: [
      {
        id: "F01",
        title: "Migrazione contenuti (entro il 31/10/2024)",
        weightPercent: 60,
        plannedStart: "2024-01-01",
        plannedEnd: "2024-10-31",
        expectedResult:
          "Test e presa d'atto della corretta effettuazione dell'attività",
        finalProgressPercent: 100,
        finalStatus: "completed",
        sourceLocator: "p. 162",
      },
      {
        id: "F02",
        title: "Pubblicazione sito (entro il 31/12/2024)",
        weightPercent: 40,
        plannedStart: "2024-11-01",
        plannedEnd: "2024-12-31",
        expectedResult: "Strumento in uso",
        finalProgressPercent: 100,
        finalStatus: "completed",
        sourceLocator: "pp. 162–163",
      },
    ],
    evidenceUrl: PERFORMANCE_2024_FINAL_MONITORING_URL,
    validationSourceUrl: null,
    validationStatus: "monitored",
    note:
      "Il 100% è un calcolo LT riproducibile sulle due fasi del monitoraggio finale. Il monitoraggio intermedio al 30/09/2024 sarà aggiunto come checkpoint separato solo quando il relativo PDF sarà nuovamente servibile con locator verificabile.",
  },
];

export function deriveWeightedPhaseProgress(
  objective: Pick<PerformanceObjectiveRecord, "phases">,
) {
  if (!objective.phases.length) return null;
  if (
    objective.phases.some(
      (phase) =>
        phase.weightPercent === null || phase.finalProgressPercent === null,
    )
  ) {
    return null;
  }

  const totalWeight = objective.phases.reduce(
    (sum, phase) => sum + (phase.weightPercent ?? 0),
    0,
  );
  if (Math.abs(totalWeight - 100) > 0.001) return null;

  const weighted = objective.phases.reduce(
    (sum, phase) =>
      sum +
      ((phase.weightPercent ?? 0) * (phase.finalProgressPercent ?? 0)) / 100,
    0,
  );
  return Math.round(weighted * 100) / 100;
}

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
    indexedPageSources: sources.filter(
      (source) => source.acquisitionStatus === "indexed-page-verified",
    ).length,
    objectiveRecords: objectives.length,
    withIndicator: objectives.filter((objective) => objective.indicatorTitle !== null)
      .length,
    withTarget: objectives.filter((objective) => objective.target !== null).length,
    withResult: objectives.filter((objective) => objective.result !== null).length,
    withPhases: objectives.filter((objective) => objective.phases.length > 0).length,
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
  "lamezia-terme-api.municipiumapp.it",
]);

function hasEmptyString(value: string | null) {
  return typeof value === "string" && value.trim().length === 0;
}

function validateAllowedHttpsUrl(
  value: string,
  label: string,
  errors: string[],
) {
  let parsedUrl: URL | null = null;
  try {
    parsedUrl = new URL(value);
  } catch {
    errors.push(`invalid ${label} URL`);
  }

  if (!parsedUrl) return;
  if (parsedUrl.protocol !== "https:") {
    errors.push(`${label} URL is not HTTPS`);
  }
  if (!ALLOWED_SOURCE_HOSTS.has(parsedUrl.hostname)) {
    errors.push(`${label} host is not allow-listed`);
  }
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

    const sourceUrlErrors: string[] = [];
    validateAllowedHttpsUrl(source.officialUrl, `source ${source.id}`, sourceUrlErrors);
    errors.push(...sourceUrlErrors);

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
    if (objective.result !== null && objective.resultProvenance === null) {
      errors.push(`result without provenance: ${objective.id}`);
    }
    if (objective.result === null && objective.resultProvenance !== null) {
      errors.push(`result provenance without result: ${objective.id}`);
    }
    if (
      objective.validationStatus === "validated" &&
      objective.validationSourceUrl === null
    ) {
      errors.push(`validated objective without validation source: ${objective.id}`);
    }

    if (objective.evidenceUrl !== null) {
      const urlErrors: string[] = [];
      validateAllowedHttpsUrl(
        objective.evidenceUrl,
        `evidence ${objective.id}`,
        urlErrors,
      );
      errors.push(...urlErrors);
    }
    if (objective.validationSourceUrl !== null) {
      const urlErrors: string[] = [];
      validateAllowedHttpsUrl(
        objective.validationSourceUrl,
        `validation ${objective.id}`,
        urlErrors,
      );
      errors.push(...urlErrors);
    }

    const phaseIds = new Set<string>();
    for (const phase of objective.phases) {
      if (phaseIds.has(phase.id)) {
        errors.push(`duplicate phase id: ${objective.id}/${phase.id}`);
      }
      phaseIds.add(phase.id);
      if (!phase.sourceLocator.trim()) {
        errors.push(`missing phase locator: ${objective.id}/${phase.id}`);
      }
      if (
        phase.weightPercent !== null &&
        (phase.weightPercent < 0 || phase.weightPercent > 100)
      ) {
        errors.push(`invalid phase weight: ${objective.id}/${phase.id}`);
      }
      if (
        phase.finalProgressPercent !== null &&
        (phase.finalProgressPercent < 0 || phase.finalProgressPercent > 100)
      ) {
        errors.push(`invalid phase progress: ${objective.id}/${phase.id}`);
      }
      for (const [field, value] of Object.entries({
        plannedStart: phase.plannedStart,
        plannedEnd: phase.plannedEnd,
        expectedResult: phase.expectedResult,
      })) {
        if (hasEmptyString(value)) {
          errors.push(`empty phase ${field} must be null: ${objective.id}/${phase.id}`);
        }
      }
    }

    if (objective.phases.length > 0) {
      const completeWeights = objective.phases.every(
        (phase) => phase.weightPercent !== null,
      );
      if (completeWeights) {
        const totalWeight = objective.phases.reduce(
          (sum, phase) => sum + (phase.weightPercent ?? 0),
          0,
        );
        if (Math.abs(totalWeight - 100) > 0.001) {
          errors.push(`phase weights do not sum to 100: ${objective.id}`);
        }
      }
    }

    if (objective.resultProvenance === "lt-derived-from-phases") {
      const derived = deriveWeightedPhaseProgress(objective);
      if (derived === null) {
        errors.push(`derived result is not reproducible: ${objective.id}`);
      } else if (objective.result !== `${derived}%`) {
        errors.push(`derived result mismatch: ${objective.id}`);
      }
    }

    for (const [field, value] of Object.entries({
      strategicArea: objective.strategicArea,
      office: objective.office,
      responsible: objective.responsible,
      objectiveType: objective.objectiveType,
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
