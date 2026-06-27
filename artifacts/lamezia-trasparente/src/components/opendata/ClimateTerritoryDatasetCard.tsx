import { useMemo, useState, type ReactNode } from "react";
import {
  CalendarDays,
  CloudRain,
  Database,
  Download,
  ExternalLink,
  FileJson,
  Info,
  LineChart,
  MapPin,
  Moon,
  Thermometer,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LAMEZIA_CLIMATE_DATA,
  LAMEZIA_CLIMATE_DATA_URL,
  LAMEZIA_CLIMATE_LATEST_YEAR,
  LAMEZIA_CLIMATE_YEARS,
  getLameziaClimateAnnualMetrics,
  getLameziaClimateRecordsForYear,
  type LameziaClimateDailyRecord,
} from "@/data/lameziaClimate";

const CHART_WIDTH = 980;
const CHART_HEIGHT = 360;
const PLOT = { left: 58, right: 24, top: 28, bottom: 54 };
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

const formatNumber = new Intl.NumberFormat("it-IT", {
  maximumFractionDigits: 1,
});

export function ClimateTerritoryDatasetCard() {
  const [selectedYear, setSelectedYear] = useState(LAMEZIA_CLIMATE_LATEST_YEAR);
  const records = useMemo(
    () => getLameziaClimateRecordsForYear(selectedYear),
    [selectedYear],
  );
  const annualMetrics = getLameziaClimateAnnualMetrics(selectedYear);
  const latestRecord = records[records.length - 1] ?? null;
  const metadata = LAMEZIA_CLIMATE_DATA.metadata;
  const latestAvailableYear = Number(metadata.latest_complete_date.slice(0, 4));
  const isLatestYear = selectedYear === latestAvailableYear;

  return (
    <section
      aria-labelledby="clima-territorio-title"
      className="mb-8 overflow-hidden rounded-xl border border-card-border bg-card shadow-sm"
    >
      <div className="border-b border-border p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl">
            <Badge variant="brand" className="mb-3 shadow-none">
              <Database className="mr-1 h-3 w-3" />
              Dataset statico
            </Badge>
            <h2
              id="clima-territorio-title"
              className="text-2xl font-display font-bold text-foreground"
            >
              Clima e territorio
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Serie giornaliera per leggere scostamenti termici, variabilita
              storica e continuita del dato climatico locale come materiale di
              analisi civica, non come servizio meteo.
            </p>
          </div>
          <a href={LAMEZIA_CLIMATE_DATA_URL} download>
            <Button variant="outline" size="sm" className="w-full md:w-auto">
              <FileJson className="h-4 w-4" />
              Scarica JSON
              <Download className="h-4 w-4 opacity-70" />
            </Button>
          </a>
        </div>

        <dl className="mt-5 grid overflow-hidden rounded-lg border border-border text-sm md:grid-cols-4">
          <MetadataItem
            icon={<ExternalLink className="h-4 w-4" />}
            label="Fonte"
            value={metadata.source}
            href={metadata.source_documentation_url ?? metadata.source_url}
          />
          <MetadataItem
            icon={<MapPin className="h-4 w-4" />}
            label="Griglia"
            value={`${metadata.coordinates.latitude}, ${metadata.coordinates.longitude}`}
            detail={metadata.coordinates.timezone}
          />
          <MetadataItem
            icon={<CalendarDays className="h-4 w-4" />}
            label="Normale climatica"
            value={metadata.baseline_period}
            detail="temperatura media giornaliera"
          />
          <MetadataItem
            icon={<Info className="h-4 w-4" />}
            label="Dato fino a"
            value={formatDate(metadata.latest_complete_date)}
            detail="ultimo giorno completo disponibile"
          />
        </dl>
      </div>

      <div className="p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-xl font-display font-bold text-foreground">
              Anomalie climatiche · Lamezia Terme
            </h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Temperatura media giornaliera rispetto alla normale 1991–2020
            </p>
          </div>
          <label className="grid gap-1 text-sm font-medium text-foreground">
            <span>Anno</span>
            <select
              aria-label="Anno del dataset climatico"
              className="h-10 min-w-36 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm"
              onChange={(event) => setSelectedYear(Number(event.target.value))}
              value={selectedYear}
            >
              {LAMEZIA_CLIMATE_YEARS.slice()
                .reverse()
                .map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
            </select>
          </label>
        </div>

        <ClimateAnomalyChart
          isLatestYear={isLatestYear}
          latestCompleteDate={metadata.latest_complete_date}
          records={records}
          year={selectedYear}
        />

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Nel grafico ogni barra verticale rappresenta un giorno: il colore
          indica l'anomalia rispetto alla normale, mentre le linee mostrano
          temperatura media osservata e normale climatica. La fascia chiara
          indica l'intervallo p10-p90 del periodo 1991–2020.
        </p>

        <dl className="mt-5 grid overflow-hidden rounded-lg border border-border text-sm sm:grid-cols-2 lg:grid-cols-3">
          <MetricItem
            icon={<Thermometer className="h-4 w-4" />}
            label="Temperatura media ultimo giorno"
            value={formatCelsius(latestRecord?.tMean ?? null)}
            detail={latestRecord ? formatDate(latestRecord.date) : "n.d."}
          />
          <MetricItem
            icon={<LineChart className="h-4 w-4" />}
            label="Anomalia ultimo giorno"
            value={formatSignedCelsius(latestRecord?.anomalyTMean ?? null)}
            detail={
              isLatestYear
                ? "ultimo giorno completo disponibile"
                : "ultimo giorno dell'anno selezionato"
            }
          />
          <MetricItem
            icon={<Thermometer className="h-4 w-4" />}
            label="Giorni oltre 30 °C"
            value={formatInteger(annualMetrics?.warmDaysOver30C ?? null)}
            detail="temperatura massima giornaliera"
          />
          <MetricItem
            icon={<Moon className="h-4 w-4" />}
            label="Notti tropicali"
            value={formatInteger(annualMetrics?.tropicalNights ?? null)}
            detail="temperatura minima almeno 20 °C"
          />
          <MetricItem
            icon={<CloudRain className="h-4 w-4" />}
            label="Precipitazione cumulata annua"
            value={formatMillimeters(annualMetrics?.precipitationTotal ?? null)}
            detail={`${annualMetrics?.days ?? 0} giorni nel dataset`}
          />
          <MetricItem
            icon={<CalendarDays className="h-4 w-4" />}
            label="Ultimo aggiornamento"
            value={formatDate(metadata.generated_at.slice(0, 10))}
            detail={`dato fino a ${formatDate(metadata.latest_complete_date)}`}
          />
        </dl>

        <div className="mt-5 grid overflow-hidden rounded-lg border border-border text-sm leading-6 md:grid-cols-3 md:divide-x md:divide-border">
          <MethodBox title="Metodologia">
            La normale giornaliera e calcolata sul periodo 1991–2020 per giorno
            dell'anno. L'anomalia e la differenza tra temperatura media
            giornaliera e normale climatica; il 29 febbraio ha una regola
            esplicita nella pipeline.
          </MethodBox>
          <MethodBox title="Limiti del dato">
            {metadata.caveat}
          </MethodBox>
          <MethodBox title="Riuso civico">
            Il JSON statico puo essere usato per confronti, note metodologiche,
            richieste di accesso civico e analisi su tendenze locali, mantenendo
            fonte, periodo baseline e caveat accanto ai numeri.
          </MethodBox>
        </div>
      </div>
    </section>
  );
}

function ClimateAnomalyChart({
  records,
  year,
  latestCompleteDate,
  isLatestYear,
}: {
  records: LameziaClimateDailyRecord[];
  year: number;
  latestCompleteDate: string;
  isLatestYear: boolean;
}) {
  const daysInSelectedYear = daysInYear(year);
  const plotWidth = CHART_WIDTH - PLOT.left - PLOT.right;
  const plotHeight = CHART_HEIGHT - PLOT.top - PLOT.bottom;
  const latestMarkerRecord = isLatestYear
    ? records.find((record) => record.date === latestCompleteDate)
    : null;
  const domain = getTemperatureDomain(records);
  const xForDay = (dayOfYear: number) =>
    PLOT.left + ((dayOfYear - 1) / (daysInSelectedYear - 1)) * plotWidth;
  const yForValue = (value: number) =>
    PLOT.top + ((domain.max - value) / (domain.max - domain.min)) * plotHeight;
  const stripeWidth = Math.max(1, plotWidth / daysInSelectedYear + 0.3);
  const observedPath = buildLinePath(records, "tMean", xForDay, yForValue);
  const normalPath = buildLinePath(
    records,
    "normalTMean",
    xForDay,
    yForValue,
  );
  const rangePath = buildRangePath(records, xForDay, yForValue);
  const gridValues = buildGridValues(domain);

  return (
    <div className="mt-5 overflow-x-auto rounded-lg border border-border bg-background p-3">
      <svg
        aria-describedby="climate-chart-desc"
        aria-labelledby="climate-chart-title"
        className="block min-w-[760px] w-full"
        role="img"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      >
        <title id="climate-chart-title">
          Grafico delle anomalie climatiche giornaliere di Lamezia Terme
        </title>
        <desc id="climate-chart-desc">
          Anno {year}: barre blu e rosse per anomalie negative e positive,
          linea della temperatura media, linea della normale climatica e fascia
          p10-p90 del periodo 1991-2020.
        </desc>
        <rect
          fill="hsl(var(--background))"
          height={CHART_HEIGHT}
          width={CHART_WIDTH}
        />
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
              {formatNumber.format(value)} °C
            </text>
          </g>
        ))}
        {monthStartTicks(year).map((tick) => (
          <g key={tick.month}>
            <line
              stroke="hsl(var(--border))"
              strokeWidth="1"
              x1={xForDay(tick.dayOfYear)}
              x2={xForDay(tick.dayOfYear)}
              y1={PLOT.top}
              y2={CHART_HEIGHT - PLOT.bottom}
            />
            <text
              fill="hsl(var(--muted-foreground))"
              fontSize="12"
              textAnchor="middle"
              x={xForDay(tick.dayOfYear)}
              y={CHART_HEIGHT - 24}
            >
              {MONTH_LABELS[tick.month - 1]}
            </text>
          </g>
        ))}
        <g aria-hidden="true">
          {records.map((record) =>
            record.anomalyTMean === null ? null : (
              <rect
                fill={anomalyColor(record.anomalyTMean)}
                height={plotHeight}
                key={record.date}
                width={stripeWidth}
                x={xForDay(record.dayOfYear) - stripeWidth / 2}
                y={PLOT.top}
              />
            ),
          )}
        </g>
        {rangePath ? (
          <path
            d={rangePath}
            fill="hsl(var(--primary) / 0.12)"
            stroke="none"
          />
        ) : null}
        {normalPath ? (
          <path
            d={normalPath}
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="5 5"
            strokeLinecap="round"
            strokeWidth="2.5"
          />
        ) : null}
        {observedPath ? (
          <path
            d={observedPath}
            fill="none"
            stroke="hsl(var(--foreground))"
            strokeLinecap="round"
            strokeWidth="2.8"
          />
        ) : null}
        {latestMarkerRecord && latestMarkerRecord.tMean !== null ? (
          <g>
            <line
              stroke="hsl(var(--brand))"
              strokeWidth="2"
              x1={xForDay(latestMarkerRecord.dayOfYear)}
              x2={xForDay(latestMarkerRecord.dayOfYear)}
              y1={PLOT.top}
              y2={CHART_HEIGHT - PLOT.bottom}
            />
            <circle
              cx={xForDay(latestMarkerRecord.dayOfYear)}
              cy={yForValue(latestMarkerRecord.tMean)}
              fill="hsl(var(--brand))"
              r="5"
              stroke="hsl(var(--background))"
              strokeWidth="2"
            />
            <text
              fill="hsl(var(--foreground))"
              fontSize="12"
              fontWeight="600"
              textAnchor="end"
              x={Math.min(
                CHART_WIDTH - PLOT.right,
                xForDay(latestMarkerRecord.dayOfYear) + 172,
              )}
              y={PLOT.top + 16}
            >
              ultimo giorno completo disponibile
            </text>
          </g>
        ) : null}
      </svg>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <LegendItem
          color="hsl(var(--chart-1))"
          label="Anomalia negativa"
          value="-4 °C"
        />
        <LegendItem color="hsl(var(--muted))" label="Normale" value="0 °C" />
        <LegendItem
          color="hsl(var(--chart-2))"
          label="Anomalia positiva"
          value="+4 °C"
        />
        <LegendLine
          className="border-foreground"
          label="Temperatura media"
        />
        <LegendLine
          className="border-muted-foreground border-dashed"
          label="Normale 1991–2020"
        />
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-6 rounded-sm bg-primary/15" />
          fascia p10-p90
        </span>
      </div>
    </div>
  );
}

function MetadataItem({
  icon,
  label,
  value,
  detail,
  href,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail?: string;
  href?: string;
}) {
  const content = href ? (
    <a
      className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {value}
      <ExternalLink className="h-3 w-3" />
    </a>
  ) : (
    value
  );

  return (
    <div className="border-b border-border p-4 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 font-semibold text-foreground">{content}</dd>
      {detail ? <dd className="mt-1 text-xs text-muted-foreground">{detail}</dd> : null}
    </div>
  );
}

function MetricItem({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="border-b border-border p-4 last:border-b-0 sm:odd:border-r lg:border-r lg:[&:nth-child(3n)]:border-r-0 lg:[&:nth-last-child(-n+3)]:border-b-0">
      <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-xl font-display font-bold text-foreground">
        {value}
      </dd>
      <dd className="mt-1 text-xs text-muted-foreground">{detail}</dd>
    </div>
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

function LegendItem({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className="h-3 w-6 rounded-sm border border-border"
        style={{ backgroundColor: color }}
      />
      <span>
        {label} <span className="font-medium text-foreground">{value}</span>
      </span>
    </span>
  );
}

function LegendLine({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`w-6 border-t-2 ${className}`} />
      {label}
    </span>
  );
}

function getTemperatureDomain(records: LameziaClimateDailyRecord[]) {
  const values = records.flatMap((record) => [
    record.tMean,
    record.normalTMean,
    record.normalRange.p10,
    record.normalRange.p90,
  ]);
  const finiteValues = values.filter((value): value is number =>
    Number.isFinite(value),
  );
  const min = Math.floor(Math.min(...finiteValues) - 2);
  const max = Math.ceil(Math.max(...finiteValues) + 2);
  return { min, max };
}

function buildLinePath(
  records: LameziaClimateDailyRecord[],
  key: "tMean" | "normalTMean",
  xForDay: (dayOfYear: number) => number,
  yForValue: (value: number) => number,
) {
  const points = records
    .filter((record) => Number.isFinite(record[key]))
    .map((record) => ({
      x: xForDay(record.dayOfYear),
      y: yForValue(record[key] as number),
    }));

  return pointsToPath(points);
}

function buildRangePath(
  records: LameziaClimateDailyRecord[],
  xForDay: (dayOfYear: number) => number,
  yForValue: (value: number) => number,
) {
  const points = records.filter(
    (record) =>
      Number.isFinite(record.normalRange.p10) &&
      Number.isFinite(record.normalRange.p90),
  );
  if (points.length === 0) {
    return "";
  }

  const upper = points.map((record) => ({
    x: xForDay(record.dayOfYear),
    y: yForValue(record.normalRange.p90 as number),
  }));
  const lower = points
    .slice()
    .reverse()
    .map((record) => ({
      x: xForDay(record.dayOfYear),
      y: yForValue(record.normalRange.p10 as number),
    }));

  return `${pointsToPath(upper)} L ${lower
    .map((point) => `${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(" L ")} Z`;
}

function pointsToPath(points: Array<{ x: number; y: number }>) {
  return points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(
          1,
        )}`,
    )
    .join(" ");
}

function buildGridValues(domain: { min: number; max: number }) {
  const values = [];
  const step = 5;
  const start = Math.ceil(domain.min / step) * step;
  for (let value = start; value <= domain.max; value += step) {
    values.push(value);
  }
  return values;
}

function anomalyColor(value: number) {
  const capped = Math.min(5, Math.abs(value));
  const opacity = 0.22 + capped * 0.11;
  if (value > 0) {
    return `hsl(var(--chart-2) / ${opacity.toFixed(2)})`;
  }
  if (value < 0) {
    return `hsl(var(--chart-1) / ${opacity.toFixed(2)})`;
  }
  return "hsl(var(--muted-foreground) / 0.28)";
}

function daysInYear(year: number) {
  return new Date(Date.UTC(year, 2, 0)).getUTCDate() === 29 ? 366 : 365;
}

function monthStartTicks(year: number) {
  return MONTH_LABELS.map((_, index) => {
    const month = index + 1;
    const start = Date.UTC(year, month - 1, 1);
    const yearStart = Date.UTC(year, 0, 1);
    return {
      month,
      dayOfYear: Math.floor((start - yearStart) / 86_400_000) + 1,
    };
  });
}

function formatDate(date: string) {
  const [year, month, day] = date.slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

function formatCelsius(value: number | null) {
  return value === null ? "n.d." : `${formatNumber.format(value)} °C`;
}

function formatSignedCelsius(value: number | null) {
  if (value === null) {
    return "n.d.";
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber.format(value)} °C`;
}

function formatMillimeters(value: number | null) {
  return value === null ? "n.d." : `${formatNumber.format(value)} mm`;
}

function formatInteger(value: number | null) {
  return value === null ? "n.d." : new Intl.NumberFormat("it-IT").format(value);
}
