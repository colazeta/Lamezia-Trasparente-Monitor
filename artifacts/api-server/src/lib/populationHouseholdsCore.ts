import {
  normalizeDemoLabel,
  type DemoIstatResponse,
} from "./demographicBalance";

export type HouseholdSourceStatus =
  | "final"
  | "provisional"
  | "estimated"
  | "reconstructed"
  | "forecast"
  | "unknown";

export type ParsedHouseholdPoint = {
  period: string;
  households: number;
  householdPopulation: number;
  averageHouseholdSize: number;
  publishedAverageHouseholdSize: number | null;
  sourceStatus: HouseholdSourceStatus;
  qualityFlags: string[];
};

type DemoColumn = { data: string; title: string };
type DemoRow = Record<string, unknown>;

type HouseholdMeasure =
  | "households"
  | "householdPopulation"
  | "averageHouseholdSize";

function columnText(column: DemoColumn) {
  return normalizeDemoLabel(`${column.title} ${column.data}`);
}

function isForeignSpecific(text: string) {
  return text.includes("stranier");
}

function measureScore(column: DemoColumn, measure: HouseholdMeasure) {
  const text = columnText(column);
  if (isForeignSpecific(text)) return -1;

  if (measure === "households") {
    if (
      text.includes("numero di famiglie") ||
      text.includes("numero famiglie") ||
      text === "famiglie"
    ) {
      if (
        text.includes("almeno") ||
        text.includes("intestatario") ||
        text.includes("medio") ||
        text.includes("component")
      ) {
        return -1;
      }
      return text.includes("totale") ? 120 : 100;
    }
    return -1;
  }

  if (measure === "householdPopulation") {
    if (
      text.includes("popolazione residente in famiglia") ||
      text.includes("popolazione in famiglia")
    ) {
      return text.includes("totale") ? 120 : 100;
    }
    return -1;
  }

  if (
    text.includes("numero medio") &&
    text.includes("component") &&
    text.includes("famigli")
  ) {
    return 100;
  }
  return -1;
}

function candidateColumns(response: DemoIstatResponse) {
  const declared = response.datatable?.columns ?? [];
  const declaredKeys = new Set(declared.map((column) => column.data));
  const firstRow = response.datatable?.data?.[0] ?? {};
  const synthetic = Object.keys(firstRow)
    .filter((key) => !declaredKeys.has(key))
    .map((key) => ({ data: key, title: key }));
  return [...declared, ...synthetic];
}

function selectColumn(
  response: DemoIstatResponse,
  measure: HouseholdMeasure,
): DemoColumn {
  const ranked = candidateColumns(response)
    .map((column, index) => ({
      column,
      index,
      score: measureScore(column, measure),
    }))
    .filter((item) => item.score >= 0)
    .sort((left, right) => right.score - left.score || left.index - right.index);
  if (!ranked.length) {
    throw new Error(`ISTAT P02: household measure ${measure} not found`);
  }
  const top = ranked[0];
  const equallyRanked = ranked.filter((item) => item.score === top.score);
  if (
    equallyRanked.length > 1 &&
    new Set(equallyRanked.map((item) => item.column.data)).size > 1
  ) {
    throw new Error(
      `ISTAT P02: ambiguous household measure ${measure}: ${equallyRanked
        .map((item) => item.column.data)
        .join(", ")}`,
    );
  }
  return top.column;
}

function numericValue(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value) return null;
  const normalized = value.includes(",")
    ? value.replace(/\./g, "").replace(",", ".")
    : value;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function isTotalRow(row: DemoRow) {
  return Object.entries(row).some(([key, raw]) => {
    if (typeof raw !== "string") return false;
    const keyText = normalizeDemoLabel(key);
    const value = normalizeDemoLabel(raw);
    return (
      (keyText.includes("sesso") ||
        keyText.includes("sex") ||
        keyText.includes("genere")) &&
      (value === "totale" || value === "total" || value === "9" || value === "t")
    );
  });
}

function valueFromRows(rows: DemoRow[], column: DemoColumn, measure: HouseholdMeasure) {
  const available = rows
    .map((row) => ({ row, value: numericValue(row[column.data]) }))
    .filter((item): item is { row: DemoRow; value: number } => item.value !== null);
  if (!available.length) {
    throw new Error(
      `ISTAT P02: household measure ${measure} has no numeric values`,
    );
  }

  const totalRows = available.filter((item) => isTotalRow(item.row));
  if (totalRows.length === 1) return totalRows[0].value;
  if (totalRows.length > 1) {
    const distinct = new Set(totalRows.map((item) => item.value));
    if (distinct.size === 1) return totalRows[0].value;
    throw new Error(`ISTAT P02: multiple total rows for ${measure}`);
  }

  const distinct = [...new Set(available.map((item) => item.value))];
  if (distinct.length === 1) return distinct[0];
  if (available.length === 1) return available[0].value;
  throw new Error(
    `ISTAT P02: household measure ${measure} differs across rows without an identifiable total`,
  );
}

function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function parseP02HouseholdPayload(
  rawPayload: string,
  period: string,
  sourceStatus: HouseholdSourceStatus,
): ParsedHouseholdPoint {
  let response: DemoIstatResponse;
  try {
    response = JSON.parse(rawPayload) as DemoIstatResponse;
  } catch {
    throw new Error("ISTAT P02 household payload is not valid JSON");
  }
  if (!response.Status || !response.datatable?.data?.length) {
    throw new Error("ISTAT P02 household payload has no valid data table");
  }

  const rows = response.datatable.data;
  const householdsColumn = selectColumn(response, "households");
  const householdPopulationColumn = selectColumn(
    response,
    "householdPopulation",
  );
  const households = valueFromRows(rows, householdsColumn, "households");
  const householdPopulation = valueFromRows(
    rows,
    householdPopulationColumn,
    "householdPopulation",
  );

  let publishedAverageHouseholdSize: number | null = null;
  try {
    const averageColumn = selectColumn(response, "averageHouseholdSize");
    publishedAverageHouseholdSize = valueFromRows(
      rows,
      averageColumn,
      "averageHouseholdSize",
    );
  } catch {
    // The canonical average is derived from the two stock measures. The
    // published average is only an optional cross-check and never a fallback.
  }

  if (!Number.isInteger(households) || households <= 0) {
    throw new Error(`ISTAT P02: implausible household count ${households}`);
  }
  if (!Number.isInteger(householdPopulation) || householdPopulation < households) {
    throw new Error(
      `ISTAT P02: implausible household population ${householdPopulation}`,
    );
  }

  const averageHouseholdSize = round(householdPopulation / households, 3);
  if (averageHouseholdSize < 1 || averageHouseholdSize > 10) {
    throw new Error(
      `ISTAT P02: implausible average household size ${averageHouseholdSize}`,
    );
  }

  const qualityFlags: string[] = ["derived_from_p02_release"];
  if (
    publishedAverageHouseholdSize !== null &&
    Math.abs(publishedAverageHouseholdSize - averageHouseholdSize) > 0.05
  ) {
    qualityFlags.push("published_average_differs_from_derived");
  }
  if (sourceStatus === "provisional") qualityFlags.push("source_provisional");
  if (sourceStatus === "estimated") qualityFlags.push("source_estimate");

  return {
    period,
    households,
    householdPopulation,
    averageHouseholdSize,
    publishedAverageHouseholdSize,
    sourceStatus,
    qualityFlags,
  };
}

export function summarizeHouseholdHistory(
  points: ParsedHouseholdPoint[],
  period: string,
  totalPopulationByPeriod: Map<string, number> = new Map(),
) {
  const ordered = [...points].sort((left, right) => left.period.localeCompare(right.period));
  const selected = ordered.find((point) => point.period === period);
  if (!selected) return null;
  const totalPopulation = totalPopulationByPeriod.get(period) ?? null;
  const householdPopulationShare =
    totalPopulation && totalPopulation > 0
      ? round((selected.householdPopulation / totalPopulation) * 100, 1)
      : null;
  const first = ordered[0] ?? selected;
  return {
    period: selected.period,
    sourceStatus: selected.sourceStatus,
    counts: {
      households: selected.households,
      householdPopulation: selected.householdPopulation,
      averageHouseholdSize: round(selected.averageHouseholdSize, 2),
      totalPopulation,
      householdPopulationShare,
    },
    changeFromFirst: {
      firstPeriod: first.period,
      householdsAbsolute: selected.households - first.households,
      householdsPercent:
        first.households > 0
          ? round(((selected.households - first.households) / first.households) * 100, 1)
          : null,
      averageHouseholdSize: round(
        selected.averageHouseholdSize - first.averageHouseholdSize,
        2,
      ),
    },
    history: ordered.map((point) => ({
      period: point.period,
      households: point.households,
      householdPopulation: point.householdPopulation,
      averageHouseholdSize: round(point.averageHouseholdSize, 2),
      sourceStatus: point.sourceStatus,
      totalPopulation: totalPopulationByPeriod.get(point.period) ?? null,
    })),
    quality: {
      publishedAverageHouseholdSize: selected.publishedAverageHouseholdSize,
      derivedAverageHouseholdSize: round(selected.averageHouseholdSize, 3),
      averageDifference:
        selected.publishedAverageHouseholdSize === null
          ? null
          : round(
              selected.publishedAverageHouseholdSize -
                selected.averageHouseholdSize,
              3,
            ),
      flags: selected.qualityFlags,
    },
  };
}
