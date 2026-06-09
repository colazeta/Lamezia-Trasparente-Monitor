import type {
  PromessometroDemoItem,
  PromessometroStatus,
} from "@/data/promessometroDemo";
import { PROMESSOMETRO_STATUSES } from "@/data/promessometroDemo";

export interface PromessometroStatusDistributionEntry {
  status: PromessometroStatus;
  count: number;
}

export interface PromessometroSourceCoverage {
  total: number;
  withProgrammeSource: number;
  withLinkedActSources: number;
  withBothSourceTypes: number;
  programmeSourceCoverage: number;
  linkedActSourceCoverage: number;
}

export interface PromessometroMissingSourcesRecord {
  id: string;
  missingProgrammeSource: boolean;
  missingLinkedActSources: boolean;
}

export function countPromessometroItems(items: readonly PromessometroDemoItem[]): number {
  return items.length;
}

export function buildPromessometroStatusDistribution(
  items: readonly PromessometroDemoItem[],
): PromessometroStatusDistributionEntry[] {
  return PROMESSOMETRO_STATUSES.map((status) => ({
    status,
    count: items.filter((item) => item.status === status).length,
  }));
}

export function calculatePromessometroSourceCoverage(
  items: readonly PromessometroDemoItem[],
): PromessometroSourceCoverage {
  const total = items.length;
  const withProgrammeSource = items.filter((item) => item.programmeSource !== null).length;
  const withLinkedActSources = items.filter((item) => item.linkedActSources.length > 0).length;
  const withBothSourceTypes = items.filter(
    (item) => item.programmeSource !== null && item.linkedActSources.length > 0,
  ).length;

  return {
    total,
    withProgrammeSource,
    withLinkedActSources,
    withBothSourceTypes,
    programmeSourceCoverage: total === 0 ? 0 : withProgrammeSource / total,
    linkedActSourceCoverage: total === 0 ? 0 : withLinkedActSources / total,
  };
}

export function findPromessometroRecordsWithMissingSources(
  items: readonly PromessometroDemoItem[],
): PromessometroMissingSourcesRecord[] {
  return items
    .map((item) => ({
      id: item.id,
      missingProgrammeSource: item.programmeSource === null,
      missingLinkedActSources: item.linkedActSources.length === 0,
    }))
    .filter((item) => item.missingProgrammeSource || item.missingLinkedActSources);
}

export function isPromessometroDemoOnlyItem(item: PromessometroDemoItem): boolean {
  return item.dataKind === "demo_fittizio" && item.isDemoOnly === true;
}
