import type { useColors } from "@/hooks/useColors";
import type {
  PerformanceIndicator,
  PerformanceIndicatorValue,
} from "@workspace/api-client-react";

type Colors = ReturnType<typeof useColors>;

const numberFormatter = new Intl.NumberFormat("it-IT", {
  maximumFractionDigits: 2,
});

// Formatta un valore numerico con la sua unità di misura. Le percentuali e i
// gradi si accodano senza spazio, la valuta si antepone, gli altri casi usano
// uno spazio separatore.
export function formatIndicatorValue(value: number, unit: string): string {
  if (!isFinite(value)) return "—";
  const n = numberFormatter.format(value);
  const u = (unit ?? "").trim();
  if (!u) return n;
  if (u === "%" || u === "°" || u === "‰") return `${n}${u}`;
  if (u === "€" || u === "$") return `${u} ${n}`;
  return `${n} ${u}`;
}

// Restituisce l'ultimo valore della serie (i valori arrivano ordinati per
// periodo crescente dal backend).
export function latestValue(
  values: PerformanceIndicatorValue[],
): PerformanceIndicatorValue | undefined {
  if (values.length === 0) return undefined;
  return values[values.length - 1];
}

export type TrendInfo = {
  direction: "up" | "down" | "flat";
  icon: "trending-up" | "trending-down" | "minus";
  delta: number;
  // Colore semantico in base alla polarità dell'indicatore.
  color: string;
};

// Calcola la variazione fra gli ultimi due periodi e ne deriva un colore
// semantico tenendo conto della polarità (per alcuni indicatori "meno è
// meglio").
export function computeTrend(
  values: PerformanceIndicatorValue[],
  polarity: PerformanceIndicator["polarity"],
  colors: Colors,
): TrendInfo | null {
  if (values.length < 2) return null;
  return trendFromPair(
    values[values.length - 1].value,
    values[values.length - 2].value,
    polarity,
    colors,
  );
}

// Variante di computeTrend basata sui soli due valori più recenti (più recente
// e precedente), come restituiti inline dall'endpoint categorie.
export function trendFromPair(
  current: number,
  previous: number | null | undefined,
  polarity: PerformanceIndicator["polarity"],
  colors: Colors,
): TrendInfo | null {
  if (previous === null || previous === undefined) return null;
  const delta = current - previous;

  let direction: TrendInfo["direction"] = "flat";
  if (delta > 0) direction = "up";
  else if (delta < 0) direction = "down";

  let color = colors.mutedForeground;
  if (direction !== "flat" && polarity !== "neutral") {
    const improving =
      (direction === "up" && polarity === "higher_better") ||
      (direction === "down" && polarity === "lower_better");
    color = improving ? colors.primary : colors.destructive;
  }

  const icon =
    direction === "up"
      ? "trending-up"
      : direction === "down"
        ? "trending-down"
        : "minus";

  return { direction, icon, delta, color };
}

export const POLARITY_LABEL: Record<
  PerformanceIndicator["polarity"],
  string
> = {
  higher_better: "Più alto è meglio",
  lower_better: "Più basso è meglio",
  neutral: "Neutro",
};

// Etichetta leggibile di un periodo. Supporta gli anni ("2024"), i trimestri
// ("2024-Q1") e i mesi ("2024-03"); negli altri casi restituisce il valore
// originale.
export function formatPeriod(period: string): string {
  const p = (period ?? "").trim();
  const q = /^(\d{4})-Q([1-4])$/i.exec(p);
  if (q) return `${q[2]}° trim. ${q[1]}`;
  const m = /^(\d{4})-(\d{2})$/.exec(p);
  if (m) {
    const months = [
      "gen",
      "feb",
      "mar",
      "apr",
      "mag",
      "giu",
      "lug",
      "ago",
      "set",
      "ott",
      "nov",
      "dic",
    ];
    const idx = Number(m[2]) - 1;
    if (idx >= 0 && idx < 12) return `${months[idx]} ${m[1]}`;
  }
  return p;
}
