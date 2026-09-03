import {
  deriveWeightedPhaseProgress,
  performanceObjectiveRecords,
  performanceSourceDocuments,
} from "@/data/performanceObjectiveRegistry";

export type PerformanceCheckpointKind =
  | "intermediate"
  | "final"
  | "cdr-summary"
  | "phase-detail";

export type PerformanceCheckpointProvenance =
  | "official-reported"
  | "lt-derived-from-phases";

export type PerformanceReconciliationStatus =
  | "single-verified-observation"
  | "aligned"
  | "different-source-levels"
  | "pending-source-reconciliation";

export interface PerformanceObjectiveCheckpoint {
  id: string;
  objectiveId: string;
  date: string;
  kind: PerformanceCheckpointKind;
  progressPercent: number;
  provenance: PerformanceCheckpointProvenance;
  sourceDocumentId: string;
  sourceLocator: string;
  reconciliationStatus: PerformanceReconciliationStatus;
  note: string | null;
}

export interface PerformanceObjectiveCdrSummary {
  id: string;
  objectiveId: string;
  cdrLabel: string;
  objectiveWeightPercent: number;
  reportedProgressPercent: number;
  weightedContributionPercent: number;
  checkpointDate: string | null;
  sourceDocumentId: string;
  sourceLocator: string;
  note: string | null;
}

const FINAL_MONITORING_SOURCE_ID =
  "performance-2024-monitoraggio-finale-13-54-93";

/**
 * Primo strato temporale verificato.
 *
 * Le tre rilevazioni al 31/12/2024 sono costruite esclusivamente dagli
 * obiettivi già verificati nel PDF finale e dal calcolo pesato delle loro fasi.
 * Non vengono importati qui valori ottenuti dal solo indice del motore di
 * ricerca del PDF PIAO.
 */
export const performanceObjectiveCheckpoints: PerformanceObjectiveCheckpoint[] =
  performanceObjectiveRecords
    .filter((objective) => objective.sourceDocumentId === FINAL_MONITORING_SOURCE_ID)
    .flatMap((objective) => {
      const progressPercent = deriveWeightedPhaseProgress(objective);
      if (progressPercent === null) return [];

      return [
        {
          id: `${objective.id}-2024-12-31-phase-detail`,
          objectiveId: objective.id,
          date: "2024-12-31",
          kind: "phase-detail" as const,
          progressPercent,
          provenance: "lt-derived-from-phases" as const,
          sourceDocumentId: objective.sourceDocumentId,
          sourceLocator: objective.sourceLocator,
          reconciliationStatus: "single-verified-observation" as const,
          note:
            "Checkpoint LT derivato dalle fasi della rilevazione finale al 31/12/2024; non equivale a percentuale riepilogativa CDR né a validazione OIV.",
        },
      ];
    });

/**
 * Nessun riepilogo CDR entra nel dataset finché la relativa pagina del PDF
 * completo non è direttamente verificabile. I valori visibili solo nell'indice
 * di ricerca restano piste di acquisizione, non record amministrativi.
 */
export const performanceObjectiveCdrSummaries: PerformanceObjectiveCdrSummary[] = [];

function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

function isPercentage(value: number) {
  return Number.isFinite(value) && value >= 0 && value <= 100;
}

export function validatePerformanceObjectiveTimeline(
  checkpoints: PerformanceObjectiveCheckpoint[] = performanceObjectiveCheckpoints,
  cdrSummaries: PerformanceObjectiveCdrSummary[] = performanceObjectiveCdrSummaries,
) {
  const errors: string[] = [];
  const objectiveIds = new Set(performanceObjectiveRecords.map((item) => item.id));
  const sourceById = new Map(
    performanceSourceDocuments.map((source) => [source.id, source] as const),
  );
  const checkpointIds = new Set<string>();
  const cdrIds = new Set<string>();

  for (const checkpoint of checkpoints) {
    if (checkpointIds.has(checkpoint.id)) {
      errors.push(`duplicate checkpoint id: ${checkpoint.id}`);
    }
    checkpointIds.add(checkpoint.id);

    if (!objectiveIds.has(checkpoint.objectiveId)) {
      errors.push(`unknown checkpoint objective: ${checkpoint.id}`);
    }
    if (!sourceById.has(checkpoint.sourceDocumentId)) {
      errors.push(`unknown checkpoint source: ${checkpoint.id}`);
    }
    if (!isIsoDate(checkpoint.date)) {
      errors.push(`invalid checkpoint date: ${checkpoint.id}`);
    }
    if (!isPercentage(checkpoint.progressPercent)) {
      errors.push(`invalid checkpoint progress: ${checkpoint.id}`);
    }
    if (!checkpoint.sourceLocator.trim()) {
      errors.push(`missing checkpoint locator: ${checkpoint.id}`);
    }
  }

  for (const cdr of cdrSummaries) {
    if (cdrIds.has(cdr.id)) errors.push(`duplicate CDR summary id: ${cdr.id}`);
    cdrIds.add(cdr.id);

    if (!objectiveIds.has(cdr.objectiveId)) {
      errors.push(`unknown CDR objective: ${cdr.id}`);
    }
    const source = sourceById.get(cdr.sourceDocumentId);
    if (!source) {
      errors.push(`unknown CDR source: ${cdr.id}`);
    } else if (source.acquisitionStatus === "metadata-verified") {
      errors.push(`CDR source lacks page verification: ${cdr.id}`);
    }
    if (!isPercentage(cdr.objectiveWeightPercent)) {
      errors.push(`invalid CDR weight: ${cdr.id}`);
    }
    if (!isPercentage(cdr.reportedProgressPercent)) {
      errors.push(`invalid CDR progress: ${cdr.id}`);
    }
    if (!isPercentage(cdr.weightedContributionPercent)) {
      errors.push(`invalid CDR weighted contribution: ${cdr.id}`);
    }
    if (cdr.checkpointDate !== null && !isIsoDate(cdr.checkpointDate)) {
      errors.push(`invalid CDR checkpoint date: ${cdr.id}`);
    }
    if (!cdr.sourceLocator.trim()) {
      errors.push(`missing CDR locator: ${cdr.id}`);
    }

    const expectedContribution =
      (cdr.objectiveWeightPercent * cdr.reportedProgressPercent) / 100;
    if (Math.abs(expectedContribution - cdr.weightedContributionPercent) > 0.01) {
      errors.push(`CDR weighted contribution mismatch: ${cdr.id}`);
    }
  }

  return errors;
}
