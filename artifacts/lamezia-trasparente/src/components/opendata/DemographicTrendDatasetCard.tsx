import { type ReactNode } from "react";
import {
  CalendarDays,
  Database,
  Download,
  ExternalLink,
  FileJson,
  Info,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  LAMEZIA_DEMOGRAPHIC_TREND_DATA,
  LAMEZIA_DEMOGRAPHIC_TREND_DATA_URL,
  LAMEZIA_DEMOGRAPHIC_TREND_SUMMARY,
  type LameziaDemographicTrendAnnualRecord,
} from "@/data/lameziaDemographicTrend";

const CHART_WIDTH = 1040;
const CHART_HEIGHT = 330;
const PLOT = { left: 76, right: 40, top: 32, bottom: 58 };

const numberFormat = new Intl.NumberFormat("it-IT");
const compactNumberFormat = new Intl.NumberFormat("it-IT", {
  maximumFractionDigits: 1,
  notation: "compact",
});
const percentFormat = new Intl.NumberFormat("it-IT", {
  maximumFractionDigits: 1,
  style: "percent",
});

export function DemographicTrendDatasetCard() {
  const records = LAMEZIA_DEMOGRAPHIC_TREND_DATA.annual;
  const metadata = LAMEZIA_DEMOGRAPHIC_TREND_DATA.metadata;
  const summary = LAMEZIA_DEMOGRAPHIC_TREND_SUMMARY;

  return (
    <section
      aria-labelledby="trend-demografico-title"
      className="mb-8 overflow-hidden rounded-xl border border-card-border bg-card shadow-sm"
      id="trend-demografico-lamezia"
    >
      <div className="border-b border-border p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="eyebrow text-primary">
              <Users className="h-3.5 w-3.5" />
              Popolazione e societa
            </span>
            <h2
              className="mt-2 text-2xl font-display font-bold text-foreground"
              id="trend-demografico-title"
            >
              Trend demografico - Lamezia Terme
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Serie annuale della popolazione residente pubblicata dal Portale
              OpenData del Comune di Lamezia Terme.
            </p>
          </div>
          <a href={LAMEZIA_DEMOGRAPHIC_TREND_DATA_URL} download>
            <Button variant="outline" size="sm" className="w-full md:w-auto">
              <FileJson className="h-4 w-4" />
              Scarica JSON
              <Download className="h-4 w-4 opacity-70" />
            </Button>
          </a>
        </div>
      </div>

      <div className="p-5 md:p-6">
        <DemographicTrendChart records={records} />

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          La linea mostra il valore annuale pubblicato nella risorsa CSV
          comunale; le variazioni sono calcolate dalla pipeline locale sul
          valore dell'anno precedente.
        </p>

        <details className="mt-5 rounded-lg border border-border bg-muted/20 text-sm leading-6">
          <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-foreground marker:hidden">
            Dettagli del dataset
          </summary>
          <div className="border-t border-border p-4">
            <div className="grid gap-3 lg:grid-cols-6">
              <InsightItem
                className="lg:col-span-2"
                detail={`anno ${summary.latest?.year ?? "n.d."}`}
                icon={<Users className="h-4 w-4" />}
                label="Popolazione residente"
                tone="neutral"
                value={formatInteger(
                  summary.latest?.population_resident ?? null,
                )}
              />
              <InsightItem
                className="lg:col-span-2"
                detail={`dal ${summary.first?.year ?? "n.d."}`}
                icon={<TrendingUp className="h-4 w-4" />}
                label="Saldo sulla serie"
                tone={toneForValue(summary.change_since_first_abs)}
                value={formatSignedInteger(summary.change_since_first_abs)}
              />
              <InsightItem
                className="lg:col-span-2"
                detail={`picco ${summary.peak?.year ?? "n.d."}`}
                icon={<TrendingDown className="h-4 w-4" />}
                label="Scarto dal massimo"
                tone={toneForValue(summary.change_since_peak_abs)}
                value={formatSignedInteger(summary.change_since_peak_abs)}
              />
              <InsightItem
                className="lg:col-span-2"
                detail={formatSignedPercent(summary.latest_year_delta_pct)}
                icon={<CalendarDays className="h-4 w-4" />}
                label="Variazione ultimo anno"
                tone={toneForValue(summary.latest_year_delta_abs)}
                value={formatSignedInteger(summary.latest_year_delta_abs)}
              />
              <InsightItem
                className="lg:col-span-2"
                detail={formatInteger(summary.peak?.population_resident ?? null)}
                icon={<TrendingUp className="h-4 w-4" />}
                label="Massimo della serie"
                tone="warm"
                value={summary.peak ? String(summary.peak.year) : "n.d."}
              />
              <InsightItem
                className="lg:col-span-2"
                detail={`${metadata.rows} record annuali`}
                icon={<Database className="h-4 w-4" />}
                label="Copertura"
                tone="cool"
                value={`${metadata.first_year}-${metadata.latest_year}`}
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <a
                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 font-medium text-foreground hover:border-primary/50 hover:text-primary"
                href={metadata.source_catalog_url}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Portale OpenData comunale
              </a>
              <a
                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 font-medium text-foreground hover:border-primary/50 hover:text-primary"
                href={metadata.source_csv_url}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                CSV sorgente
              </a>
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5">
                <Info className="h-3.5 w-3.5" />
                Licenza {metadata.license_title}
              </span>
            </div>

            <details className="mt-5 rounded-lg border border-border bg-muted/20 text-sm leading-6">
              <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-foreground marker:hidden">
                Fonte, metodo e limiti del dato
              </summary>
              <div className="grid border-t border-border md:grid-cols-3 md:divide-x md:divide-border">
                <MethodBox title="Fonte">
                  Dataset {metadata.dataset_title}, pubblicato dal Comune sul
                  portale OpenData Maggioli.
                </MethodBox>
                <MethodBox title="Metodo">
                  La pipeline interroga il dettaglio API con `cod-ente`, scarica
                  il CSV ufficiale, valida intestazioni e anni, calcola le
                  variazioni e pubblica il JSON statico.
                </MethodBox>
                <MethodBox title="Limiti">{metadata.caveat}</MethodBox>
              </div>
            </details>
          </div>
        </details>
      </div>
    </section>
  );
}

function DemographicTrendChart({
  records,
}: {
  records: LameziaDemographicTrendAnnualRecord[];
}) {
  const values = records.map((record) => record.population_resident);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const padding = Math.max(250, Math.ceil((maxValue - minValue) * 0.16));
  const yMin = Math.floor((minValue - padding) / 500) * 500;
  const yMax = Math.ceil((maxValue + padding) / 500) * 500;
  const plotWidth = CHART_WIDTH - PLOT.left - PLOT.right;
  const plotHeight = CHART_HEIGHT - PLOT.top - PLOT.bottom;
  const xForIndex = (index: number) =>
    PLOT.left + (index / Math.max(1, records.length - 1)) * plotWidth;
  const yForValue = (value: number) =>
    PLOT.top + ((yMax - value) / Math.max(1, yMax - yMin)) * plotHeight;
  const path = records
    .map((record, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command}${xForIndex(index).toFixed(1)},${yForValue(
        record.population_resident,
      ).toFixed(1)}`;
    })
    .join(" ");
  const gridValues = buildGridValues(yMin, yMax);

  return (
    <div className="mt-5 overflow-x-auto rounded-xl border border-border bg-background p-3 shadow-sm">
      <svg
        aria-describedby="demographic-trend-chart-desc"
        aria-labelledby="demographic-trend-chart-title"
        className="block min-w-[780px] w-full"
        role="img"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      >
        <title id="demographic-trend-chart-title">
          Grafico del trend demografico di Lamezia Terme
        </title>
        <desc id="demographic-trend-chart-desc">
          Serie annuale 2001-2025 della popolazione residente pubblicata dal
          portale OpenData del Comune di Lamezia Terme.
        </desc>
        <rect
          fill="hsl(var(--background))"
          height={CHART_HEIGHT}
          width={CHART_WIDTH}
        />
        <text
          fill="hsl(var(--foreground))"
          fontSize="13"
          fontWeight="700"
          x={PLOT.left}
          y={24}
        >
          Popolazione residente per anno
        </text>
        <text
          fill="hsl(var(--muted-foreground))"
          fontSize="12"
          textAnchor="end"
          x={CHART_WIDTH - PLOT.right}
          y={24}
        >
          fonte OpenData comunale
        </text>
        {gridValues.map((value) => (
          <g key={value}>
            <line
              stroke="hsl(var(--border))"
              strokeDasharray="4 5"
              strokeWidth="1"
              x1={PLOT.left}
              x2={CHART_WIDTH - PLOT.right}
              y1={yForValue(value)}
              y2={yForValue(value)}
            />
            <text
              fill="hsl(var(--muted-foreground))"
              fontSize="12"
              textAnchor="end"
              x={PLOT.left - 10}
              y={yForValue(value) + 4}
            >
              {compactNumberFormat.format(value)}
            </text>
          </g>
        ))}
        <path
          d={`${path} L${xForIndex(records.length - 1).toFixed(1)},${(
            PLOT.top + plotHeight
          ).toFixed(1)} L${PLOT.left},${(PLOT.top + plotHeight).toFixed(1)} Z`}
          fill="hsl(var(--primary) / 0.12)"
        />
        <path
          d={path}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
        {records.map((record, index) => {
          const showLabel =
            index === 0 ||
            index === records.length - 1 ||
            record.population_resident === maxValue;
          const x = xForIndex(index);
          const y = yForValue(record.population_resident);

          return (
            <g key={record.year}>
              <circle
                cx={x}
                cy={y}
                fill="hsl(var(--background))"
                r="5"
                stroke="hsl(var(--primary))"
                strokeWidth="2.5"
              />
              {showLabel ? (
                <text
                  fill="hsl(var(--foreground))"
                  fontSize="12"
                  fontWeight="700"
                  textAnchor="middle"
                  x={x}
                  y={y - 12}
                >
                  {numberFormat.format(record.population_resident)}
                </text>
              ) : null}
              {index % 4 === 0 || index === records.length - 1 ? (
                <text
                  fill="hsl(var(--muted-foreground))"
                  fontSize="12"
                  fontWeight="600"
                  textAnchor="middle"
                  x={x}
                  y={CHART_HEIGHT - 28}
                >
                  {record.year}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function InsightItem({
  className = "",
  detail,
  icon,
  label,
  tone,
  value,
}: {
  className?: string;
  detail: string;
  icon: ReactNode;
  label: string;
  tone: "warm" | "cool" | "neutral";
  value: string;
}) {
  const toneClasses = {
    cool: "bg-primary/10 text-primary ring-primary/20",
    neutral: "bg-muted text-muted-foreground ring-border",
    warm: "bg-brand/10 text-brand ring-brand/20",
  };

  return (
    <dl
      className={`rounded-lg border border-border bg-background p-4 shadow-sm ${className}`}
    >
      <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded-md ring-1 ${toneClasses[tone]}`}
        >
          {icon}
        </span>
        {label}
      </dt>
      <dd className="mt-2 text-2xl font-display font-bold tabular-nums text-foreground">
        {value}
      </dd>
      <dd className="mt-1 text-xs leading-5 text-muted-foreground">
        {detail}
      </dd>
    </dl>
  );
}

function MethodBox({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="border-b border-border p-4 last:border-b-0 md:border-b-0">
      <h4 className="font-semibold text-foreground">{title}</h4>
      <p className="mt-2 text-muted-foreground">{children}</p>
    </section>
  );
}

function buildGridValues(min: number, max: number) {
  const values = [];
  const step = 1000;
  for (let value = Math.ceil(min / step) * step; value <= max; value += step) {
    values.push(value);
  }
  return values;
}

function toneForValue(value: number | null): "warm" | "cool" | "neutral" {
  if (value === null || value === 0) {
    return "neutral";
  }
  return value > 0 ? "warm" : "cool";
}

function formatInteger(value: number | null) {
  return value === null ? "n.d." : numberFormat.format(value);
}

function formatSignedInteger(value: number | null) {
  if (value === null) {
    return "n.d.";
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${numberFormat.format(value)}`;
}

function formatSignedPercent(value: number | null) {
  if (value === null) {
    return "n.d.";
  }
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${percentFormat.format(Math.abs(value))}`;
}
