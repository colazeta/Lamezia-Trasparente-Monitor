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
