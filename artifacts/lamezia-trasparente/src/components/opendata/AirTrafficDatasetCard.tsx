import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  Database,
  Download,
  ExternalLink,
  FileJson,
  Globe2,
  Info,
  Package,
  Plane,
  TrendingUp,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  LAMEZIA_AIR_TRAFFIC_DATA,
  LAMEZIA_AIR_TRAFFIC_DATA_URL,
  LAMEZIA_AIR_TRAFFIC_LATEST_YEAR,
  LAMEZIA_AIR_TRAFFIC_YEARS,
  getLameziaAirTrafficAnnualMetrics,
  getLameziaAirTrafficRecordsForYear,
  type LameziaAirTrafficAnnualMetrics,
  type LameziaAirTrafficMonthlyRecord,
} from "@/data/lameziaAirTraffic";

const CHART_WIDTH = 1040;
const CHART_HEIGHT = 340;
const PLOT = { left: 74, right: 34, top: 34, bottom: 64 };
const MONTH_LABELS = [
  "Gen",
  "Feb",
  "Mar",
  "Apr",
  "Mag",
  "Giu",
  "Lug",
  "Ago",
  "Set",
  "Ott",
  "Nov",
  "Dic",
];

const numberFormat = new Intl.NumberFormat("it-IT");
const compactNumberFormat = new Intl.NumberFormat("it-IT", {
  maximumFractionDigits: 1,
  notation: "compact",
});
const decimalFormat = new Intl.NumberFormat("it-IT", {
  maximumFractionDigits: 1,
});

export function AirTrafficDatasetCard() {
  const [selectedYear, setSelectedYear] = useState(
    LAMEZIA_AIR_TRAFFIC_LATEST_YEAR,
  );
  const records = useMemo(
    () => getLameziaAirTrafficRecordsForYear(selectedYear),
    [selectedYear],
  );
  const annualMetrics = getLameziaAirTrafficAnnualMetrics(selectedYear);
  const metadata = LAMEZIA_AIR_TRAFFIC_DATA.metadata;
  const latestAvailableYear = Number(
    metadata.latest_complete_month.slice(0, 4),
  );
  const isLatestYear = selectedYear === latestAvailableYear;
  const latestRecord = records[records.length - 1] ?? null;

  return (
    <section
      aria-labelledby="trasporto-aereo-title"
      className="mb-8 overflow-hidden rounded-xl border border-card-border bg-card shadow-sm"
      id="trasporto-aereo-lamezia"
    >
      <div className="border-b border-border p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="eyebrow text-primary">
              <Plane className="h-3.5 w-3.5" />
              Mobilita e collegamenti
            </span>
            <h2
              className="mt-2 text-2xl font-display font-bold text-foreground"
              id="trasporto-aereo-title"
            >
              Traffico aeroportuale mensile - Lamezia Terme
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Passeggeri, movimenti e cargo dello scalo SUF secondo i file
              mensili Assaeroporti.
            </p>
          </div>
          <label className="grid gap-1 text-sm font-medium text-foreground">
            <span>Anno</span>
            <select
              aria-label="Anno del dataset sul traffico aeroportuale"
              className="h-10 min-w-36 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm"
              onChange={(event) => setSelectedYear(Number(event.target.value))}
              value={selectedYear}
            >
              {LAMEZIA_AIR_TRAFFIC_YEARS.slice()
                .reverse()
                .map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
            </select>
          </label>
        </div>
      </div>

      <div className="p-5 md:p-6">
        <AirTrafficChart
          isLatestYear={isLatestYear}
          latestCompleteMonth={metadata.latest_complete_month}
          records={records}
          year={selectedYear}
        />

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Le barre impilate distinguono passeggeri nazionali, internazionali e
          altri conteggi residuali; il totale include le definizioni pubblicate
          nei file mensili della fonte.
        </p>

        <details className="mt-5 rounded-lg border border-border bg-muted/20 text-sm leading-6">
          <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-foreground marker:hidden">
            Dettagli del dataset
          </summary>
          <div className="border-t border-border p-4">
            <AirTrafficInsightBoard
              annualMetrics={annualMetrics}
              isLatestYear={isLatestYear}
              latestRecord={latestRecord}
            />
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <AirTrafficQuickFacts
                firstMonth={metadata.first_month}
                latestMonth={metadata.latest_complete_month}
                sourceUrl={metadata.source_url}
              />
              <a href={LAMEZIA_AIR_TRAFFIC_DATA_URL} download>
                <Button variant="outline" size="sm" className="w-full md:w-auto">
                  <FileJson className="h-4 w-4" />
                  Scarica JSON
                  <Download className="h-4 w-4 opacity-70" />
                </Button>
              </a>
            </div>
            <MethodDisclosure metadata={metadata} />
          </div>
        </details>
      </div>
    </section>
  );
}

function AirTrafficChart({
  records,
  year,
  latestCompleteMonth,
  isLatestYear,
}: {
  records: LameziaAirTrafficMonthlyRecord[];
  year: number;
  latestCompleteMonth: string;
  isLatestYear: boolean;
}) {
  const recordsByMonth = new Map(
    records.map((record) => [record.month_number, record]),
  );
  const plotWidth = CHART_WIDTH - PLOT.left - PLOT.right;
  const plotHeight = CHART_HEIGHT - PLOT.top - PLOT.bottom;
  const maxPassengers = Math.max(
    1,
    ...records.map((record) => record.passengers.total ?? 0),
  );
  const yMax = Math.ceil(maxPassengers / 50_000) * 50_000;
  const yForValue = (value: number) =>
    PLOT.top + plotHeight - (value / yMax) * plotHeight;
  const xForMonth = (month: number) =>
    PLOT.left + ((month - 1) / 11) * plotWidth;
  const barWidth = 46;
  const gridValues = buildPassengerGrid(yMax);

  return (
    <div className="mt-5 overflow-x-auto rounded-xl border border-border bg-background p-3 shadow-sm">
      <svg
        aria-describedby="air-traffic-chart-desc"
        aria-labelledby="air-traffic-chart-title"
        className="block min-w-[820px] w-full"
        role="img"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      >
        <title id="air-traffic-chart-title">
          Grafico del traffico aeroportuale mensile di Lamezia Terme
        </title>
        <desc id="air-traffic-chart-desc">
          Anno {year}: barre mensili dei passeggeri totali con segmenti per
          traffico nazionale, internazionale e residuale; il marker evidenzia
          l'ultimo mese completo disponibile quando l'anno e parziale.
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
          Passeggeri mensili dello scalo SUF
        </text>
        <text
          fill="hsl(var(--muted-foreground))"
          fontSize="12"
          textAnchor="end"
          x={CHART_WIDTH - PLOT.right}
          y={24}
        >
          nazionali, internazionali e altri conteggi
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
        {MONTH_LABELS.map((label, index) => {
          const month = index + 1;
          const record = recordsByMonth.get(month);
          const x = xForMonth(month);
          const total = record?.passengers.total ?? 0;
          const national = record?.passengers.national ?? 0;
          const international = record?.passengers.international ?? 0;
          const other = Math.max(0, total - national - international);
          const nationalHeight = yForValue(0) - yForValue(national);
          const internationalHeight =
            yForValue(0) - yForValue(international);
          const otherHeight = yForValue(0) - yForValue(other);
          const baseY = PLOT.top + plotHeight;
          const isLatestMarker =
            isLatestYear && record?.month === latestCompleteMonth;

          return (
            <g key={label}>
              {record ? (
                <>
                  <rect
                    fill="hsl(var(--chart-1) / 0.88)"
                    height={nationalHeight}
                    rx="4"
                    width={barWidth}
                    x={x - barWidth / 2}
                    y={baseY - nationalHeight}
                  />
                  <rect
                    fill="hsl(var(--chart-2) / 0.88)"
                    height={internationalHeight}
                    rx="4"
                    width={barWidth}
                    x={x - barWidth / 2}
                    y={baseY - nationalHeight - internationalHeight}
                  />
                  {otherHeight > 0 ? (
                    <rect
                      fill="hsl(var(--muted-foreground) / 0.45)"
                      height={otherHeight}
                      rx="4"
                      width={barWidth}
                      x={x - barWidth / 2}
                      y={
                        baseY -
                        nationalHeight -
                        internationalHeight -
                        otherHeight
                      }
                    />
                  ) : null}
                  <text
                    fill="hsl(var(--foreground))"
                    fontSize="11"
                    fontWeight="700"
                    textAnchor="middle"
                    x={x}
                    y={
                      baseY -
                      nationalHeight -
                      internationalHeight -
                      otherHeight -
                      8
                    }
                  >
                    {compactNumberFormat.format(total)}
                  </text>
                </>
              ) : (
                <rect
                  fill="hsl(var(--muted) / 0.34)"
                  height={plotHeight}
                  rx="4"
                  width={barWidth}
                  x={x - barWidth / 2}
                  y={PLOT.top}
                />
              )}
              {isLatestMarker ? (
                <line
                  stroke="hsl(var(--brand))"
                  strokeDasharray="5 5"
                  strokeWidth="2"
                  x1={x}
                  x2={x}
                  y1={PLOT.top}
                  y2={baseY}
                />
              ) : null}
              <text
                fill="hsl(var(--muted-foreground))"
                fontSize="12"
                fontWeight="600"
                textAnchor="middle"
                x={x}
                y={CHART_HEIGHT - 28}
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <LegendItem color="hsl(var(--chart-1))" label="Nazionali" />
        <LegendItem color="hsl(var(--chart-2))" label="Internazionali" />
        <LegendItem
          color="hsl(var(--muted-foreground) / 0.45)"
          label="Transiti diretti e altri"
        />
        {isLatestYear ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 border-l-2 border-dashed border-brand" />
            ultimo mese completo disponibile
          </span>
        ) : null}
      </div>
    </div>
  );
}

function AirTrafficInsightBoard({
  annualMetrics,
  latestRecord,
  isLatestYear,
}: {
  annualMetrics: LameziaAirTrafficAnnualMetrics | null;
  latestRecord: LameziaAirTrafficMonthlyRecord | null;
  isLatestYear: boolean;
}) {
  return (
    <div className="mt-5 grid gap-3 lg:grid-cols-6">
      <InsightItem
        className="lg:col-span-2"
        detail={latestRecord ? formatMonth(latestRecord.month) : "n.d."}
        icon={<Users className="h-4 w-4" />}
        label={isLatestYear ? "Ultimo mese completo" : "Ultimo mese dell'anno"}
        tone={toneForValue(latestRecord?.passengers.total_yoy_pct ?? null)}
        value={formatInteger(latestRecord?.passengers.total ?? null)}
      />
      <InsightItem
        className="lg:col-span-2"
        detail={`${formatInteger(annualMetrics?.months ?? null)} mesi nel dataset`}
        icon={<TrendingUp className="h-4 w-4" />}
        label={isLatestYear ? "Passeggeri da gennaio" : "Passeggeri annui"}
        tone="neutral"
        value={formatInteger(annualMetrics?.passengers_total ?? null)}
      />
      <InsightItem
        className="lg:col-span-2"
        detail={formatInteger(
          annualMetrics?.international_passengers_total ?? null,
        )}
        icon={<Globe2 className="h-4 w-4" />}
        label="Quota internazionale"
        tone="cool"
        value={formatPercent(
          annualMetrics?.international_passenger_share ?? null,
        )}
      />
      <InsightItem
        className="lg:col-span-2"
        detail={`var. mese ${formatSignedPercent(
          latestRecord?.movements.total_yoy_pct ?? null,
        )}`}
        icon={<Activity className="h-4 w-4" />}
        label={isLatestYear ? "Movimenti da gennaio" : "Movimenti annui"}
        tone={toneForValue(latestRecord?.movements.total_yoy_pct ?? null)}
        value={formatInteger(annualMetrics?.movements_total ?? null)}
      />
      <InsightItem
        className="lg:col-span-2"
        detail={`var. mese ${formatSignedPercent(
          latestRecord?.cargo_tons.total_yoy_pct ?? null,
        )}`}
        icon={<Package className="h-4 w-4" />}
        label="Cargo cumulato"
        tone={toneForValue(latestRecord?.cargo_tons.total_yoy_pct ?? null)}
        value={formatTons(annualMetrics?.cargo_tons_total ?? null)}
      />
      <InsightItem
        className="lg:col-span-2"
        detail={formatInteger(
          annualMetrics?.busiest_month_passengers ?? null,
        )}
        icon={<BarChart3 className="h-4 w-4" />}
        label="Mese piu trafficato"
        tone="warm"
        value={
          annualMetrics ? formatMonthShort(annualMetrics.busiest_month) : "n.d."
        }
      />
    </div>
  );
}

function AirTrafficQuickFacts({
  firstMonth,
  latestMonth,
  sourceUrl,
}: {
  firstMonth: string;
  latestMonth: string;
  sourceUrl: string;
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
      <a
        className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 font-medium text-foreground hover:border-primary/50 hover:text-primary"
        href={sourceUrl}
        rel="noreferrer"
        target="_blank"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        Assaeroporti
      </a>
      <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5">
        <CalendarDays className="h-3.5 w-3.5" />
        Serie da {formatMonthShort(firstMonth)}
      </span>
      <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5">
        <Info className="h-3.5 w-3.5" />
        Dato fino a {formatMonth(latestMonth)}
      </span>
    </div>
  );
}

function MethodDisclosure({
  metadata,
}: {
  metadata: typeof LAMEZIA_AIR_TRAFFIC_DATA.metadata;
}) {
  return (
    <details className="mt-5 rounded-lg border border-border bg-muted/20 text-sm leading-6">
      <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-foreground marker:hidden">
        Fonte, metodo e limiti del dato
      </summary>
      <div className="grid border-t border-border md:grid-cols-3 md:divide-x md:divide-border">
        <MethodBox title="Fonte">
          {metadata.source}. Ogni record deriva dal file Excel mensile scaricato
          dal portale pubblico Assaeroporti.
        </MethodBox>
        <MethodBox title="Metodo">
          La pipeline scarica i file `download-export/anno/mese`, seleziona la
          riga {metadata.airport_name} nei fogli mensili e pubblica una serie
          JSON statica.
        </MethodBox>
        <MethodBox title="Limiti">
          {metadata.caveat}
        </MethodBox>
      </div>
    </details>
  );
}

function InsightItem({
  className = "",
  icon,
  label,
  value,
  detail,
  tone,
}: {
  className?: string;
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
  tone: "warm" | "cool" | "neutral";
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
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-border p-4 last:border-b-0 md:border-b-0">
      <h4 className="font-semibold text-foreground">{title}</h4>
      <p className="mt-2 text-muted-foreground">{children}</p>
    </section>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className="h-3 w-6 rounded-sm border border-border"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function buildPassengerGrid(max: number) {
  const step = max <= 250_000 ? 50_000 : 100_000;
  const values = [];
  for (let value = 0; value <= max; value += step) {
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

function formatMonth(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("it-IT", {
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, monthNumber - 1, 1, 12)));
}

function formatMonthShort(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("it-IT", {
    month: "short",
    year: "numeric",
  }).format(new Date(Date.UTC(year, monthNumber - 1, 1, 12)));
}

function formatInteger(value: number | null) {
  return value === null ? "n.d." : numberFormat.format(value);
}

function formatTons(value: number | null) {
  return value === null ? "n.d." : `${decimalFormat.format(value)} t`;
}

function formatPercent(value: number | null) {
  return value === null
    ? "n.d."
    : new Intl.NumberFormat("it-IT", {
        maximumFractionDigits: 1,
        style: "percent",
      }).format(value);
}

function formatSignedPercent(value: number | null) {
  if (value === null) {
    return "n.d.";
  }
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${new Intl.NumberFormat("it-IT", {
    maximumFractionDigits: 1,
    style: "percent",
  }).format(Math.abs(value))}`;
}
