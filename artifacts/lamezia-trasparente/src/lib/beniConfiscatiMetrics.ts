import {
  BENI_CONFISCATI_CATEGORIES,
  BENI_CONFISCATI_DEMO_ADMIN_STATUSES,
  BENI_CONFISCATI_CATEGORY_LABELS,
  BENI_CONFISCATI_DEMO_ADMIN_STATUS_LABELS,
  type BeneConfiscatoCategory,
  type BeneConfiscatoDemoAdministrativeStatus,
  type BeneConfiscatoDemoItem,
} from "@/data/beniConfiscatiDemo";

export type BeneConfiscatoMissingField =
  | "id"
  | "title"
  | "category"
  | "administrativeStatus"
  | "genericTerritorialContext"
  | "sourceContext"
  | "dataQualityStatus"
  | "knownLimitations"
  | "possibleCivicUses"
  | "cautionNotes"
  | "demoOnly";

export interface BeneConfiscatoPreview {
  readonly title: string;
  readonly description: string;
  readonly caution: string;
}

const createZeroCategoryCounts = (): Record<BeneConfiscatoCategory, number> =>
  Object.fromEntries(
    BENI_CONFISCATI_CATEGORIES.map((category) => [category, 0]),
  ) as Record<BeneConfiscatoCategory, number>;

const createZeroStatusCounts = (): Record<
  BeneConfiscatoDemoAdministrativeStatus,
  number
> =>
  Object.fromEntries(
    BENI_CONFISCATI_DEMO_ADMIN_STATUSES.map((status) => [status, 0]),
  ) as Record<BeneConfiscatoDemoAdministrativeStatus, number>;

const hasText = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const hasItems = (value: unknown): value is readonly unknown[] =>
  Array.isArray(value) && value.length > 0;

export function countBeniConfiscatiByCategory(
  items: readonly Pick<BeneConfiscatoDemoItem, "category">[],
): Record<BeneConfiscatoCategory, number> {
  return items.reduce((counts, item) => {
    counts[item.category] += 1;
    return counts;
  }, createZeroCategoryCounts());
}

export function countBeniConfiscatiByAdministrativeStatus(
  items: readonly Pick<BeneConfiscatoDemoItem, "administrativeStatus">[],
): Record<BeneConfiscatoDemoAdministrativeStatus, number> {
  return items.reduce((counts, item) => {
    counts[item.administrativeStatus] += 1;
    return counts;
  }, createZeroStatusCounts());
}

export function findMissingBeneConfiscatoFields(
  item: Partial<BeneConfiscatoDemoItem>,
): BeneConfiscatoMissingField[] {
  const missing: BeneConfiscatoMissingField[] = [];

  if (!hasText(item.id)) missing.push("id");
  if (!hasText(item.title)) missing.push("title");
  if (!item.category) missing.push("category");
  if (!item.administrativeStatus) missing.push("administrativeStatus");
  if (!hasText(item.genericTerritorialContext)) {
    missing.push("genericTerritorialContext");
  }
  if (
    !item.sourceContext ||
    !hasText(item.sourceContext.label) ||
    !hasText(item.sourceContext.description) ||
    item.sourceContext.realSourceUsed !== false
  ) {
    missing.push("sourceContext");
  }
  if (!item.dataQualityStatus) missing.push("dataQualityStatus");
  if (!hasItems(item.knownLimitations)) missing.push("knownLimitations");
  if (!hasItems(item.possibleCivicUses)) missing.push("possibleCivicUses");
  if (!hasItems(item.cautionNotes)) missing.push("cautionNotes");
  if (item.demoOnly !== true) missing.push("demoOnly");

  return missing;
}

export function areAllBeniConfiscatiDemoOnly(
  items: readonly Partial<BeneConfiscatoDemoItem>[],
): boolean {
  return items.length > 0 && items.every((item) => item.demoOnly === true);
}

export function createBeneConfiscatoPreview(
  item: BeneConfiscatoDemoItem,
): BeneConfiscatoPreview {
  const category = BENI_CONFISCATI_CATEGORY_LABELS[item.category].toLowerCase();
  const status =
    BENI_CONFISCATI_DEMO_ADMIN_STATUS_LABELS[
      item.administrativeStatus
    ].toLowerCase();
  const limitation = item.knownLimitations[0] ?? "Verifica documentale richiesta.";

  return {
    title: item.title,
    description: `${category} con stato "${status}" in contesto dimostrativo: ${item.genericTerritorialContext}.`,
    caution: `Scheda fittizia solo demo. ${limitation}`,
  };
}
