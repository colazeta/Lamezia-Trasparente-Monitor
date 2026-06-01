import type {
  PerformanceIndicator,
  PerformanceIndicatorValue,
} from "@workspace/api-client-react";

/** Formatta un valore numerico secondo la convenzione italiana. */
export function formatIndicatorValue(value: number): string {
  return new Intl.NumberFormat("it-IT", {
    maximumFractionDigits: 2,
  }).format(value);
}

/** Restituisce l'ultimo valore della serie (ordinata per periodo crescente). */
export function latestValue(
  values: PerformanceIndicatorValue[],
): PerformanceIndicatorValue | undefined {
  return values.length ? values[values.length - 1] : undefined;
}

export type TrendTone = "good" | "bad" | "neutral";

export interface Trend {
  delta: number;
  /** Variazione percentuale rispetto al periodo precedente, se calcolabile. */
  percent: number | null;
  direction: "up" | "down" | "flat";
  tone: TrendTone;
}

/**
 * Calcola la variazione tra gli ultimi due valori della serie, interpretando
 * il segno in base alla polarità dell'indicatore (un calo della disoccupazione
 * è "positivo", un calo del verde pubblico è "negativo").
 */
export function computeTrend(
  values: PerformanceIndicatorValue[],
  polarity: PerformanceIndicator["polarity"],
): Trend | null {
  if (values.length < 2) return null;
  const last = values[values.length - 1].value;
  const prev = values[values.length - 2].value;
  const delta = last - prev;
  const percent = prev !== 0 ? (delta / Math.abs(prev)) * 100 : null;

  const direction: Trend["direction"] =
    delta > 0 ? "up" : delta < 0 ? "down" : "flat";

  let tone: TrendTone = "neutral";
  if (direction !== "flat" && polarity !== "neutral") {
    const improved =
      (polarity === "higher_better" && direction === "up") ||
      (polarity === "lower_better" && direction === "down");
    tone = improved ? "good" : "bad";
  }

  return { delta, percent, direction, tone };
}

export type ComparisonMode = "normalized" | "absolute";

export interface ComparisonInput {
  /** Chiave stabile della serie (es. l'id dell'indicatore come stringa). */
  key: string;
  values: PerformanceIndicatorValue[];
}

export interface ComparisonPoint {
  period: string;
  /**
   * Per ogni serie: `key` → valore tracciato (normalizzato o assoluto),
   * `key__raw` → valore originale. `null` quando il periodo manca.
   */
  [key: string]: number | string | null;
}

/** Suffisso usato per conservare il valore originale di ogni serie. */
export const RAW_SUFFIX = "__raw";

/**
 * Unisce più serie storiche su un asse temporale comune per il confronto.
 *
 * - In modalità `normalized` ogni serie viene indicizzata a 100 sul suo primo
 *   valore disponibile (diverso da zero), così indicatori con unità diverse
 *   diventano confrontabili.
 * - In modalità `absolute` vengono usati i valori originali (adatta al doppio
 *   asse quando si confrontano due sole serie).
 *
 * I periodi mancanti per una serie restano `null` così che il grafico possa
 * collegare i punti senza inventare dati.
 */
export function buildComparisonSeries(
  inputs: ComparisonInput[],
  mode: ComparisonMode,
): ComparisonPoint[] {
  const periodSet = new Set<string>();
  for (const series of inputs) {
    for (const v of series.values) periodSet.add(v.period);
  }
  const periods = Array.from(periodSet).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );

  const base: Record<string, number> = {};
  if (mode === "normalized") {
    for (const series of inputs) {
      const sorted = [...series.values].sort((a, b) =>
        a.period.localeCompare(b.period, undefined, { numeric: true }),
      );
      const first = sorted.find((v) => v.value !== 0) ?? sorted[0];
      base[series.key] = first ? first.value : 1;
    }
  }

  return periods.map((period) => {
    const point: ComparisonPoint = { period };
    for (const series of inputs) {
      const found = series.values.find((v) => v.period === period);
      const raw = found ? found.value : null;
      point[`${series.key}${RAW_SUFFIX}`] = raw;
      if (raw === null) {
        point[series.key] = null;
      } else if (mode === "normalized") {
        const b = base[series.key];
        point[series.key] = b !== 0 ? (raw / b) * 100 : raw;
      } else {
        point[series.key] = raw;
      }
    }
    return point;
  });
}
