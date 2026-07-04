import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  CalendarDays,
  CloudRain,
  Database,
  Download,
  ExternalLink,
  FileJson,
  Flame,
  Info,
  LineChart,
  MapPin,
  Moon,
  Snowflake,
  Thermometer,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  LAMEZIA_CLIMATE_DATA,
  LAMEZIA_CLIMATE_DATA_URL,
  LAMEZIA_CLIMATE_LATEST_YEAR,
  LAMEZIA_CLIMATE_YEARS,
  getLameziaClimateAnnualMetrics,
  getLameziaClimateRecordsForYear,
  type LameziaClimateAnnualMetrics,
  type LameziaClimateDailyRecord,
} from "@/data/lameziaClimate";

const CHART_WIDTH = 1040;
const CHART_HEIGHT = 456;
const PLOT = { left: 72, right: 34, top: 34, bottom: 62 };
const ANOMALY_PANEL = { top: 42, height: 136 };
const TEMPERATURE_PANEL = { top: 226, height: 150 };
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
  const anomalySummary = useMemo(() => summarizeAnomalies(records), [records]);
  const metadata = LAMEZIA_CLIMATE_DATA.metadata;
  const latestAvailableYear = Number(metadata.latest_complete_date.slice(0, 4));
  const isLatestYear = selectedYear === latestAvailableYear;

  return (
    <section
      aria-labelledby="clima-territorio-title"
      id="clima-territorio"
      className="mb-8 overflow-hidden rounded-xl border border-card-border bg-card shadow-sm"
    >
      <div className="border-b border-border p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="eyebrow text-primary">
              <Database className="h-3.5 w-3.5" />
              Clima e territorio
            </span>
            <h2
              id="clima-territorio-title"
              className="mt-2 text-2xl font-display font-bold text-foreground"
            >
              Anomalie climatiche · Lamezia Terme
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
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
      </div>

      <div className="p-5 md:p-6">
        <ClimateAnomalyChart
          anomalySummary={anomalySummary}
          isLatestYear={isLatestYear}
          latestCompleteDate={metadata.latest_complete_date}
          records={records}
          year={selectedYear}
        />

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          La fascia superiore mette in evidenza lo scarto dalla normale:
          barre sopra lo zero indicano giornate piu calde, barre sotto lo zero
          giornate piu fresche. La parte inferiore conserva il confronto tra
          temperatura media osservata, normale climatica e intervallo p10-p90
          del periodo 1991–2020.
        </p>

        <details className="mt-5 rounded-lg border border-border bg-muted/20 text-sm leading-6">
          <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-foreground marker:hidden">
            Dettagli del dataset
          </summary>
          <div className="border-t border-border p-4">
            <ClimateInsightBoard
              annualMetrics={annualMetrics}
              latestRecord={latestRecord}
              isLatestYear={isLatestYear}
              summary={anomalySummary}
            />
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <ClimateQuickFacts
                baseline={metadata.baseline_period}
                latestDate={metadata.latest_complete_date}
                sourceUrl={
                  metadata.source_documentation_url ?? metadata.source_url
                }
              />
              <a href={LAMEZIA_CLIMATE_DATA_URL} download>
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

function ClimateQuickFacts({
  baseline,
  latestDate,
  sourceUrl,
}: {
  baseline: string;
  latestDate: string;
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
        Open-Meteo
      </a>
      <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5">
        <CalendarDays className="h-3.5 w-3.5" />
        Normale {baseline}
      </span>
      <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5">
        <Info className="h-3.5 w-3.5" />
        Dato fino a {formatDate(latestDate)}
      </span>
    </div>
  );
}

function ClimateInsightBoard({
  annualMetrics,
  latestRecord,
  isLatestYear,
  summary,
}: {
  annualMetrics: LameziaClimateAnnualMetrics | null;
  latestRecord: LameziaClimateDailyRecord | null;
  isLatestYear: boolean;
  summary: ClimateAnomalySummary;
}) {
  return (
    <div className="mt-5 grid gap-3 lg:grid-cols-6">
      <InsightItem
        className="lg:col-span-2"
        detail={
          latestRecord
            ? `${formatCelsius(latestRecord.tMean)} il ${formatDate(
                latestRecord.date,
              )}`
            : "n.d."
        }
        icon={<Thermometer className="h-4 w-4" />}
        label={
          isLatestYear
            ? "Ultimo giorno completo"
            : "Ultimo giorno dell'anno"
        }
        tone={toneForValue(latestRecord?.anomalyTMean ?? null)}
        value={formatSignedCelsius(latestRecord?.anomalyTMean ?? null)}
      />
      <InsightItem
        className="lg:col-span-2"
        detail={`${formatInteger(summary.positiveDays)} giorni sopra norma su ${formatInteger(
          summary.validDays,
        )}`}
        icon={<Activity className="h-4 w-4" />}
        label="Bilancio dell'anno"
        tone={toneForValue(annualMetrics?.meanAnomalyTMean ?? null)}
        value={formatSignedCelsius(annualMetrics?.meanAnomalyTMean ?? null)}
      />
      <InsightItem
        className="lg:col-span-2"
        detail={`sequenza piu lunga: ${formatInteger(
          summary.longestWarmRun,
        )} giorni`}
        icon={<TrendingUp className="h-4 w-4" />}
        label="Quota sopra normale"
        tone="warm"
        value={formatPercent(summary.warmShare)}
      />
      <InsightItem
        className="lg:col-span-2"
        detail={`${formatInteger(
          annualMetrics?.warmDaysOver30C ?? null,
        )} giorni oltre 30 °C`}
        icon={<Flame className="h-4 w-4" />}
        label="Stress termico"
        tone="warm"
        value={`${formatInteger(annualMetrics?.tropicalNights ?? null)} notti tropicali`}
      />
      <InsightItem
        className="lg:col-span-2"
        detail={`${formatInteger(annualMetrics?.days ?? null)} giorni nel dataset`}
        icon={<CloudRain className="h-4 w-4" />}
        label="Pioggia cumulata"
        tone="neutral"
        value={formatMillimeters(annualMetrics?.precipitationTotal ?? null)}
      />
      <InsightItem
        className="lg:col-span-2"
        detail={
          summary.strongestCold
            ? `fresco ${formatSignedCelsius(
                summary.strongestCold.anomalyTMean,
              )} il ${formatDate(summary.strongestCold.date)}`
            : "n.d."
        }
        icon={<LineChart className="h-4 w-4" />}
        label="Estremi dell'anno"
        tone="neutral"
        value={
          summary.strongestWarm
            ? `caldo ${formatSignedCelsius(summary.strongestWarm.anomalyTMean)}`
            : "n.d."
        }
      />
      <div className="rounded-lg border border-border bg-background p-4 lg:col-span-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              Distribuzione delle anomalie
            </h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Giorni piu freschi, vicini alla normale e piu caldi nell'anno
              selezionato.
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {formatInteger(summary.validDays)}
            </span>{" "}
            giorni con anomalia calcolata
          </div>
        </div>
        <DistributionBar summary={summary} />
      </div>
    </div>
  );
}

function ClimateAnomalyChart({
  records,
  year,
  latestCompleteDate,
  isLatestYear,
  anomalySummary,
}: {
  records: LameziaClimateDailyRecord[];
  year: number;
  latestCompleteDate: string;
  isLatestYear: boolean;
  anomalySummary: ClimateAnomalySummary;
}) {
  const daysInSelectedYear = daysInYear(year);
  const plotWidth = CHART_WIDTH - PLOT.left - PLOT.right;
  const latestMarkerRecord = isLatestYear
    ? records.find((record) => record.date === latestCompleteDate)
    : null;
  const temperatureDomain = getTemperatureDomain(records);
  const anomalyMagnitude = getAnomalyMagnitude(records);
  const anomalyTicks = buildAnomalyGridValues(anomalyMagnitude);
  const xForDay = (dayOfYear: number) =>
    PLOT.left + ((dayOfYear - 1) / (daysInSelectedYear - 1)) * plotWidth;
  const yForTemperature = (value: number) =>
    TEMPERATURE_PANEL.top +
    ((temperatureDomain.max - value) /
      (temperatureDomain.max - temperatureDomain.min)) *
      TEMPERATURE_PANEL.height;
  const yForAnomaly = (value: number) =>
    ANOMALY_PANEL.top +
    ((anomalyMagnitude - value) / (anomalyMagnitude * 2)) *
      ANOMALY_PANEL.height;
  const zeroY = yForAnomaly(0);
  const stripeWidth = Math.max(1.4, (plotWidth / daysInSelectedYear) * 0.76);
  const observedPath = buildLinePath(
    records,
    "tMean",
    xForDay,
    yForTemperature,
  );
  const normalPath = buildLinePath(
    records,
    "normalTMean",
    xForDay,
    yForTemperature,
  );
  const anomalyPath = buildAnomalyLinePath(records, xForDay, yForAnomaly);
  const rangePath = buildRangePath(records, xForDay, yForTemperature);
  const gridValues = buildGridValues(temperatureDomain);
  const latestMarkerX = latestMarkerRecord
    ? xForDay(latestMarkerRecord.dayOfYear)
    : null;
  const markerTextAnchor =
    latestMarkerX && latestMarkerX > CHART_WIDTH - 250 ? "end" : "start";
  const markerTextX =
    latestMarkerX === null
      ? 0
      : markerTextAnchor === "end"
        ? latestMarkerX - 10
        : latestMarkerX + 10;

  return (
    <div className="mt-5 overflow-x-auto rounded-xl border border-border bg-background p-3 shadow-sm">
      <svg
        aria-describedby="climate-chart-desc"
        aria-labelledby="climate-chart-title"
        className="block min-w-[820px] w-full"
        role="img"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      >
        <title id="climate-chart-title">
          Grafico delle anomalie climatiche giornaliere di Lamezia Terme
        </title>
        <desc id="climate-chart-desc">
          Anno {year}: in alto barre divergenti sopra e sotto lo zero mostrano
          lo scarto dalla normale 1991-2020; in basso sono presenti la
          temperatura media giornaliera, la normale climatica, la fascia p10-p90
          e il marker dell'ultimo giorno completo disponibile.
        </desc>
        <defs>
          <linearGradient id="climate-anomaly-warm" x1="0" x2="0" y1="1" y2="0">
            <stop offset="0%" stopColor="hsl(var(--chart-2) / 0.42)" />
            <stop offset="100%" stopColor="hsl(var(--chart-2) / 0.96)" />
          </linearGradient>
          <linearGradient id="climate-anomaly-cool" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--chart-1) / 0.42)" />
            <stop offset="100%" stopColor="hsl(var(--chart-1) / 0.96)" />
          </linearGradient>
          <filter id="climate-line-glow" x="-8%" y="-35%" width="116%" height="170%">
            <feGaussianBlur stdDeviation="2.4" />
            <feColorMatrix
              values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 .22 0"
            />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect
          fill="hsl(var(--background))"
          height={CHART_HEIGHT}
          width={CHART_WIDTH}
        />
        <rect
          fill="hsl(var(--chart-2) / 0.045)"
          height={zeroY - ANOMALY_PANEL.top}
          rx="10"
          width={plotWidth}
          x={PLOT.left}
          y={ANOMALY_PANEL.top}
        />
        <rect
          fill="hsl(var(--chart-1) / 0.055)"
          height={ANOMALY_PANEL.top + ANOMALY_PANEL.height - zeroY}
          rx="10"
          width={plotWidth}
          x={PLOT.left}
          y={zeroY}
        />
        <rect
          fill="hsl(var(--muted) / 0.18)"
          height={TEMPERATURE_PANEL.height}
          rx="10"
          width={plotWidth}
          x={PLOT.left}
          y={TEMPERATURE_PANEL.top}
        />
        <text
          fill="hsl(var(--foreground))"
          fontSize="13"
          fontWeight="700"
          x={PLOT.left}
          y={24}
        >
          Scarto dalla normale 1991-2020
        </text>
        <text
          fill="hsl(var(--muted-foreground))"
          fontSize="12"
          textAnchor="end"
          x={CHART_WIDTH - PLOT.right}
          y={24}
        >
          sopra zero = piu caldo, sotto zero = piu fresco
        </text>
        {anomalyTicks.map((value) => (
          <g key={`anomaly-${value}`}>
            <line
              stroke={
                value === 0
                  ? "hsl(var(--foreground) / 0.52)"
                  : "hsl(var(--border))"
              }
              strokeDasharray={value === 0 ? undefined : "4 5"}
              strokeWidth={value === 0 ? "1.5" : "1"}
              x1={PLOT.left}
              x2={CHART_WIDTH - PLOT.right}
              y1={yForAnomaly(value)}
              y2={yForAnomaly(value)}
            />
            <text
              fill="hsl(var(--muted-foreground))"
              fontSize="12"
              fontWeight={value === 0 ? "700" : "500"}
              textAnchor="end"
              x={PLOT.left - 10}
              y={yForAnomaly(value) + 4}
            >
              {value > 0 ? "+" : ""}
              {formatNumber.format(value)} °C
            </text>
          </g>
        ))}
        {monthStartTicks(year).map((tick) => (
          <g key={tick.month}>
            <line
              stroke="hsl(var(--border) / 0.72)"
              strokeWidth="1"
              x1={xForDay(tick.dayOfYear)}
              x2={xForDay(tick.dayOfYear)}
              y1={ANOMALY_PANEL.top}
              y2={TEMPERATURE_PANEL.top + TEMPERATURE_PANEL.height}
            />
            <text
              fill="hsl(var(--muted-foreground))"
              fontSize="12"
              fontWeight="600"
              textAnchor="middle"
              x={xForDay(tick.dayOfYear)}
              y={CHART_HEIGHT - 24}
            >
              {MONTH_LABELS[tick.month - 1]}
            </text>
          </g>
        ))}
        <g aria-hidden="true">
          {records.map((record) => {
            if (record.anomalyTMean === null) {
              return null;
            }
            const anomalyY = yForAnomaly(record.anomalyTMean);
            const height = Math.max(1.2, Math.abs(anomalyY - zeroY));
            const isWarm = record.anomalyTMean >= 0;
            return (
              <rect
                fill={
                  isWarm
                    ? "url(#climate-anomaly-warm)"
                    : "url(#climate-anomaly-cool)"
                }
                height={height}
                key={record.date}
                opacity={anomalyOpacity(record.anomalyTMean)}
                rx="1.4"
                width={stripeWidth}
                x={xForDay(record.dayOfYear) - stripeWidth / 2}
                y={Math.min(anomalyY, zeroY)}
              />
            );
          })}
        </g>
        {anomalyPath ? (
          <path
            d={anomalyPath}
            fill="none"
            filter="url(#climate-line-glow)"
            stroke="hsl(var(--foreground) / 0.7)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        ) : null}
        <ExtremeAnnotation
          label="picco caldo"
          record={anomalySummary.strongestWarm}
          tone="warm"
          xForDay={xForDay}
          yForAnomaly={yForAnomaly}
        />
        <ExtremeAnnotation
          label="picco fresco"
          record={anomalySummary.strongestCold}
          tone="cool"
          xForDay={xForDay}
          yForAnomaly={yForAnomaly}
        />
        <text
          fill="hsl(var(--foreground))"
          fontSize="13"
          fontWeight="700"
          x={PLOT.left}
          y={TEMPERATURE_PANEL.top - 24}
        >
          Temperatura media giornaliera
        </text>
        <text
          fill="hsl(var(--muted-foreground))"
          fontSize="12"
          textAnchor="end"
          x={CHART_WIDTH - PLOT.right}
          y={TEMPERATURE_PANEL.top - 24}
        >
          fascia storica p10-p90 e normale climatica
        </text>
        {gridValues.map((value) => (
          <g key={`temperature-${value}`}>
            <line
              stroke="hsl(var(--border))"
              strokeDasharray="4 5"
              strokeWidth="1"
              x1={PLOT.left}
              x2={CHART_WIDTH - PLOT.right}
              y1={yForTemperature(value)}
              y2={yForTemperature(value)}
            />
            <text
              fill="hsl(var(--muted-foreground))"
              fontSize="12"
              textAnchor="end"
              x={PLOT.left - 10}
              y={yForTemperature(value) + 4}
            >
              {formatNumber.format(value)} °C
            </text>
          </g>
        ))}
        {rangePath ? (
          <path
            d={rangePath}
            fill="hsl(var(--chart-3) / 0.16)"
            stroke="hsl(var(--chart-3) / 0.22)"
            strokeWidth="1"
          />
        ) : null}
        {normalPath ? (
          <path
            d={normalPath}
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="6 6"
            strokeLinecap="round"
            strokeWidth="2.4"
          />
        ) : null}
        {observedPath ? (
          <path
            d={observedPath}
            fill="none"
            filter="url(#climate-line-glow)"
            stroke="hsl(var(--foreground))"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3.2"
          />
        ) : null}
        {latestMarkerRecord ? (
          <g>
            <line
              stroke="hsl(var(--brand))"
              strokeDasharray="5 5"
              strokeWidth="2"
              x1={xForDay(latestMarkerRecord.dayOfYear)}
              x2={xForDay(latestMarkerRecord.dayOfYear)}
              y1={ANOMALY_PANEL.top}
              y2={TEMPERATURE_PANEL.top + TEMPERATURE_PANEL.height}
            />
            {latestMarkerRecord.anomalyTMean !== null ? (
              <circle
                cx={xForDay(latestMarkerRecord.dayOfYear)}
                cy={yForAnomaly(latestMarkerRecord.anomalyTMean)}
                fill="hsl(var(--brand))"
                r="5.5"
                stroke="hsl(var(--background))"
                strokeWidth="2"
              />
            ) : null}
            {latestMarkerRecord.tMean !== null ? (
              <circle
                cx={xForDay(latestMarkerRecord.dayOfYear)}
                cy={yForTemperature(latestMarkerRecord.tMean)}
                fill="hsl(var(--foreground))"
                r="5"
                stroke="hsl(var(--background))"
                strokeWidth="2"
              />
            ) : null}
            <text
              fill="hsl(var(--foreground))"
              fontSize="12"
              fontWeight="700"
              textAnchor={markerTextAnchor}
              x={markerTextX}
              y={ANOMALY_PANEL.top + ANOMALY_PANEL.height + 22}
            >
              ultimo giorno completo disponibile
            </text>
          </g>
        ) : null}
      </svg>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <LegendItem
          color="hsl(var(--chart-1))"
          label="Giorni piu freschi della normale"
          value="< 0 °C"
        />
        <LegendItem
          color="hsl(var(--muted))"
          label="Linea zero"
          value="0 °C"
        />
        <LegendItem
          color="hsl(var(--chart-2))"
          label="Giorni piu caldi della normale"
          value="> 0 °C"
        />
        <LegendLine
          className="border-foreground"
          label="Temperatura media"
        />
        <LegendLine
          className="border-muted-foreground border-dashed"
          label="Normale 1991-2020"
        />
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-6 rounded-sm bg-chart-3/20 ring-1 ring-chart-3/30" />
          fascia p10-p90
        </span>
      </div>
    </div>
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

function DistributionBar({ summary }: { summary: ClimateAnomalySummary }) {
  const segments = [
    {
      count: summary.coolDays,
      icon: <Snowflake className="h-3.5 w-3.5" />,
      label: "freschi",
      color: "hsl(var(--chart-1))",
    },
    {
      count: summary.nearNormalDays,
      icon: <Activity className="h-3.5 w-3.5" />,
      label: "vicini alla normale",
      color: "hsl(var(--muted-foreground) / 0.55)",
    },
    {
      count: summary.warmDays,
      icon: <Flame className="h-3.5 w-3.5" />,
      label: "caldi",
      color: "hsl(var(--chart-2))",
    },
  ];

  return (
    <div className="mt-4">
      <div className="flex h-4 overflow-hidden rounded-full bg-muted">
        {segments.map((segment) => (
          <span
            aria-hidden="true"
            key={segment.label}
            style={{
              backgroundColor: segment.color,
              width:
                summary.validDays === 0
                  ? "0%"
                  : `${(segment.count / summary.validDays) * 100}%`,
            }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
        {segments.map((segment) => (
          <span className="inline-flex items-center gap-1.5" key={segment.label}>
            {segment.icon}
            <span className="font-semibold text-foreground">
              {formatInteger(segment.count)}
            </span>
            {segment.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function ExtremeAnnotation({
  record,
  label,
  tone,
  xForDay,
  yForAnomaly,
}: {
  record: LameziaClimateDailyRecord | null;
  label: string;
  tone: "warm" | "cool";
  xForDay: (dayOfYear: number) => number;
  yForAnomaly: (value: number) => number;
}) {
  if (!record || record.anomalyTMean === null) {
    return null;
  }

  const x = xForDay(record.dayOfYear);
  const y = yForAnomaly(record.anomalyTMean);
  const anchor = x > CHART_WIDTH - 220 ? "end" : "start";
  const labelX = anchor === "end" ? x - 10 : x + 10;
  const labelY =
    tone === "warm"
      ? Math.max(ANOMALY_PANEL.top + 16, y - 10)
      : Math.min(ANOMALY_PANEL.top + ANOMALY_PANEL.height - 8, y + 18);
  const color =
    tone === "warm" ? "hsl(var(--chart-2))" : "hsl(var(--chart-1))";

  return (
    <g>
      <circle
        cx={x}
        cy={y}
        fill={color}
        r="5.5"
        stroke="hsl(var(--background))"
        strokeWidth="2"
      />
      <text
        fill="hsl(var(--foreground))"
        fontSize="12"
        fontWeight="700"
        textAnchor={anchor}
        x={labelX}
        y={labelY}
      >
        {label} {formatSignedCelsius(record.anomalyTMean)}
      </text>
      <text
        fill="hsl(var(--muted-foreground))"
        fontSize="11"
        textAnchor={anchor}
        x={labelX}
        y={labelY + 14}
      >
        {formatDate(record.date)}
      </text>
    </g>
  );
}

function MethodDisclosure({
  metadata,
}: {
  metadata: typeof LAMEZIA_CLIMATE_DATA.metadata;
}) {
  return (
    <details className="mt-5 rounded-lg border border-border bg-muted/20 text-sm leading-6">
      <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-foreground marker:hidden">
        Fonte, metodo e limiti del dato
      </summary>
      <div className="grid border-t border-border md:grid-cols-3 md:divide-x md:divide-border">
        <MethodBox title="Fonte">
          <span className="inline-flex items-start gap-2">
            <MapPin className="mt-1 h-4 w-4 shrink-0" />
            <span>
              {metadata.source}. Griglia {metadata.coordinates.latitude},{" "}
              {metadata.coordinates.longitude}, timezone{" "}
              {metadata.coordinates.timezone}.
            </span>
          </span>
        </MethodBox>
        <MethodBox title="Metodo">
          La normale giornaliera e calcolata sul periodo 1991-2020.
          L'anomalia e la differenza tra temperatura media giornaliera e
          normale climatica; il 29 febbraio ha una regola esplicita nella
          pipeline.
          {metadata.update_policy ? <> {metadata.update_policy}</> : null}
        </MethodBox>
        <MethodBox title="Limiti">
          {metadata.caveat}
        </MethodBox>
      </div>
    </details>
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

interface ClimateAnomalySummary {
  validDays: number;
  positiveDays: number;
  negativeDays: number;
  coolDays: number;
  nearNormalDays: number;
  warmDays: number;
  longestWarmRun: number;
  warmShare: number | null;
  strongestWarm: LameziaClimateDailyRecord | null;
  strongestCold: LameziaClimateDailyRecord | null;
}

function summarizeAnomalies(
  records: LameziaClimateDailyRecord[],
): ClimateAnomalySummary {
  const validRecords = records.filter((record) =>
    Number.isFinite(record.anomalyTMean),
  );
  let strongestWarm: LameziaClimateDailyRecord | null = null;
  let strongestCold: LameziaClimateDailyRecord | null = null;
  let positiveDays = 0;
  let negativeDays = 0;
  let coolDays = 0;
  let nearNormalDays = 0;
  let warmDays = 0;
  let currentWarmRun = 0;
  let longestWarmRun = 0;

  for (const record of validRecords) {
    const anomaly = record.anomalyTMean as number;
    if (anomaly > 0) {
      positiveDays += 1;
      currentWarmRun += 1;
      longestWarmRun = Math.max(longestWarmRun, currentWarmRun);
      if (
        !strongestWarm ||
        anomaly > (strongestWarm.anomalyTMean as number)
      ) {
        strongestWarm = record;
      }
    } else if (anomaly < 0) {
      negativeDays += 1;
      currentWarmRun = 0;
      if (
        !strongestCold ||
        anomaly < (strongestCold.anomalyTMean as number)
      ) {
        strongestCold = record;
      }
    } else {
      currentWarmRun = 0;
    }

    if (anomaly < -1) {
      coolDays += 1;
    } else if (anomaly > 1) {
      warmDays += 1;
    } else {
      nearNormalDays += 1;
    }
  }

  return {
    validDays: validRecords.length,
    positiveDays,
    negativeDays,
    coolDays,
    nearNormalDays,
    warmDays,
    longestWarmRun,
    warmShare:
      validRecords.length === 0 ? null : positiveDays / validRecords.length,
    strongestWarm,
    strongestCold,
  };
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

function buildAnomalyLinePath(
  records: LameziaClimateDailyRecord[],
  xForDay: (dayOfYear: number) => number,
  yForValue: (value: number) => number,
) {
  const points = records
    .filter((record) => Number.isFinite(record.anomalyTMean))
    .map((record) => ({
      x: xForDay(record.dayOfYear),
      y: yForValue(record.anomalyTMean as number),
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

function buildAnomalyGridValues(magnitude: number) {
  const half = Math.max(1, Math.round(magnitude / 2));
  return [-magnitude, -half, 0, half, magnitude];
}

function getAnomalyMagnitude(records: LameziaClimateDailyRecord[]) {
  const maxAbs = records.reduce((max, record) => {
    if (!Number.isFinite(record.anomalyTMean)) {
      return max;
    }
    return Math.max(max, Math.abs(record.anomalyTMean as number));
  }, 0);
  return Math.max(4, Math.ceil(maxAbs));
}

function anomalyOpacity(value: number) {
  const capped = Math.min(7, Math.abs(value));
  return Number((0.46 + capped * 0.07).toFixed(2));
}

function toneForValue(value: number | null): "warm" | "cool" | "neutral" {
  if (value === null || value === 0) {
    return "neutral";
  }
  return value > 0 ? "warm" : "cool";
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

function formatPercent(value: number | null) {
  return value === null
    ? "n.d."
    : new Intl.NumberFormat("it-IT", {
        maximumFractionDigits: 0,
        style: "percent",
      }).format(value);
}

function formatInteger(value: number | null) {
  return value === null ? "n.d." : new Intl.NumberFormat("it-IT").format(value);
}
