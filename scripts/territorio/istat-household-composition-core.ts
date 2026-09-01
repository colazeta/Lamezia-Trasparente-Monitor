export const HOUSEHOLD_COMPONENT_FIELDS = [
  "PF3",
  "PF4",
  "PF5",
  "PF6",
  "PF7",
  "PF8",
] as const;

export type HouseholdComponentField =
  (typeof HOUSEHOLD_COMPONENT_FIELDS)[number];

export type HouseholdCensusRow = {
  sectionId?: string | null;
  isFictitious?: boolean;
  PF1: number | null;
  PF3: number | null;
  PF4: number | null;
  PF5: number | null;
  PF6: number | null;
  PF7: number | null;
  PF8: number | null;
};

export type HouseholdCompositionProfile = {
  referenceYear: 2023;
  municipality: {
    name: "Lamezia Terme";
    istatCode: "079160";
  };
  totalHouseholds: number;
  byComponents: Array<{
    key: "1" | "2" | "3" | "4" | "5" | "6+";
    sourceField: HouseholdComponentField;
    households: number;
    share: number;
  }>;
  indicators: {
    onePersonHouseholds: number;
    onePersonShare: number;
    fivePlusHouseholds: number;
    fivePlusShare: number;
  };
  quality: {
    includedRows: number;
    skippedFictitiousRows: number;
    incompleteRows: number;
    componentSum: number;
    reconciliationDifference: number;
    exactReconciliation: boolean;
  };
};

const LABELS = ["1", "2", "3", "4", "5", "6+"] as const;

function assertCount(value: number | null, label: string): number {
  if (value === null || !Number.isInteger(value) || value < 0) {
    throw new Error(`${label}: expected a non-negative integer`);
  }
  return value;
}

function round(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/**
 * Aggrega la distribuzione comunale delle famiglie per numero di componenti
 * dalle righe ufficiali ISTAT 2023 per sezione di censimento.
 *
 * PF1 = famiglie residenti totali.
 * PF3..PF8 = famiglie con 1, 2, 3, 4, 5, 6+ componenti.
 * Le sezioni fittizie 888888x/999999x vanno marcate dal caller e sono escluse
 * per coerenza con il layer territoriale pubblico corrente.
 */
export function aggregateHouseholdComposition(
  rows: HouseholdCensusRow[],
): HouseholdCompositionProfile {
  let totalHouseholds = 0;
  const components = new Map<HouseholdComponentField, number>(
    HOUSEHOLD_COMPONENT_FIELDS.map((field) => [field, 0]),
  );
  let includedRows = 0;
  let skippedFictitiousRows = 0;
  let incompleteRows = 0;

  for (const row of rows) {
    if (row.isFictitious) {
      skippedFictitiousRows += 1;
      continue;
    }

    const values = [row.PF1, ...HOUSEHOLD_COMPONENT_FIELDS.map((f) => row[f])];
    if (values.some((value) => value === null)) {
      incompleteRows += 1;
      continue;
    }

    const householdCount = assertCount(row.PF1, `${row.sectionId ?? "row"}.PF1`);
    totalHouseholds += householdCount;
    includedRows += 1;

    for (const field of HOUSEHOLD_COMPONENT_FIELDS) {
      const value = assertCount(row[field], `${row.sectionId ?? "row"}.${field}`);
      components.set(field, (components.get(field) ?? 0) + value);
    }
  }

  if (!includedRows) {
    throw new Error("No complete non-fictitious household census rows");
  }
  if (totalHouseholds <= 0) {
    throw new Error("Household census profile has zero total households");
  }

  const componentSum = HOUSEHOLD_COMPONENT_FIELDS.reduce(
    (sum, field) => sum + (components.get(field) ?? 0),
    0,
  );
  const reconciliationDifference = componentSum - totalHouseholds;

  const byComponents = HOUSEHOLD_COMPONENT_FIELDS.map((field, index) => {
    const households = components.get(field) ?? 0;
    return {
      key: LABELS[index],
      sourceField: field,
      households,
      share: round((households / totalHouseholds) * 100),
    };
  });

  const onePersonHouseholds = components.get("PF3") ?? 0;
  const fivePlusHouseholds =
    (components.get("PF7") ?? 0) + (components.get("PF8") ?? 0);

  return {
    referenceYear: 2023,
    municipality: { name: "Lamezia Terme", istatCode: "079160" },
    totalHouseholds,
    byComponents,
    indicators: {
      onePersonHouseholds,
      onePersonShare: round((onePersonHouseholds / totalHouseholds) * 100),
      fivePlusHouseholds,
      fivePlusShare: round((fivePlusHouseholds / totalHouseholds) * 100),
    },
    quality: {
      includedRows,
      skippedFictitiousRows,
      incompleteRows,
      componentSum,
      reconciliationDifference,
      exactReconciliation: reconciliationDifference === 0,
    },
  };
}

export function assertPublishableHouseholdComposition(
  profile: HouseholdCompositionProfile,
): void {
  if (!profile.quality.exactReconciliation) {
    throw new Error(
      `Household composition does not reconcile with PF1: difference=${profile.quality.reconciliationDifference}`,
    );
  }
  if (profile.quality.incompleteRows > 0) {
    throw new Error(
      `Household composition has ${profile.quality.incompleteRows} incomplete census rows`,
    );
  }
}
