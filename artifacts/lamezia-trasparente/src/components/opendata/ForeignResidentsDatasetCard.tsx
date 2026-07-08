import { type ReactNode } from "react";
import {
  BarChart3,
  CalendarDays,
  Database,
  Download,
  ExternalLink,
  FileJson,
  Info,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  LAMEZIA_FOREIGN_RESIDENTS_DATA,
  LAMEZIA_FOREIGN_RESIDENTS_DATA_URL,
  LAMEZIA_FOREIGN_RESIDENTS_LATEST_RECORDS,
  LAMEZIA_FOREIGN_RESIDENTS_SUMMARY,
  type LameziaForeignResidentsAgeRecord,
} from "@/data/lameziaForeignResidents";

const CHART_WIDTH = 1040;
const CHART_HEIGHT = 520;
const PLOT = { left: 64, right: 64, top: 54, bottom: 54 };
const CENTER_X = CHART_WIDTH / 2;
const CENTER_GAP = 92;

const numberFormat = new Intl.NumberFormat("it-IT");
const percentFormat = new Intl.NumberFormat("it-IT", {
  maximumFractionDigits: 1,
  style: "percent",
});

export function ForeignResidentsDatasetCard() {
  const records = LAMEZIA_FOREIGN_RESIDENTS_LATEST_RECORDS;
  const metadata = LAMEZIA_FOREIGN_RESIDENTS_DATA.metadata;
  const summary = LAMEZIA_FOREIGN_RESIDENTS_SUMMARY;

  return (
    <section
      aria-labelledby="stranieri-eta-sesso-title"
      className="mb-8 overflow-hidden rounded-xl border border-card-border bg-card shadow-sm"
      id="stranieri-eta-sesso-lamezia"
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
              id="stranieri-eta-sesso-title"
            >
              Stranieri per sesso ed eta - Lamezia Terme
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Distribuzione aggregata dei residenti stranieri per classi d'eta e
              sesso, pubblicata dal Portale OpenData del Comune.
            </p>
          </div>
          <a href={LAMEZIA_FOREIGN_RESIDENTS_DATA_URL} download>
            <Button variant="outline" size="sm" className="w-full md:w-auto">
              <FileJson className="h-4 w-4" />
              Scarica JSON
              <Download className="h-4 w-4 opacity-70" />
            </Button>
          </a>
        </div>
      </div>

      <div className="p-5 md:p-6">
        <ForeignResidentsPyramid records={records} />

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Le barre mostrano maschi a sinistra e femmine a destra. Le quote e i
          totali sono calcolati dalla pipeline locale a partire dal CSV
          comunale.
        </p>

        <details className="mt-5 rounded-lg border border-border bg-muted/20 text-sm leading-6">
          <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-foreground marker:hidden">
            Dettagli del dataset
          </summary>
          <div className="border-t border-border p-4">
            <div className="grid gap-3 lg:grid-cols-6">
              <InsightItem
                className="lg:col-span-2"
                detail={`anno ${metadata.latest_year}`}
                icon={<Users className="h-4 w-4" />}
                label="Residenti stranieri"
                tone="neutral"
                value={formatInteger(summary.total)}
              />
              <InsightItem
                className="lg:col-span-2"
                detail={formatPercent(summary.female_share)}
                icon={<BarChart3 className="h-4 w-4" />}
                label="Femmine"
                tone="warm"
                value={formatInteger(summary.female)}
              />
              <InsightItem
                className="lg:col-span-2"
                detail={formatPercent(summary.working_age_share)}
                icon={<ShieldCheck className="h-4 w-4" />}
                label="Eta 15-64"
                tone="cool"
                value={formatInteger(summary.workingAge)}
              />
              <InsightItem
                className="lg:col-span-2"
                detail={`${formatPercent(
                  summary.largest_age_class.share_of_year,
                )} del totale`}
                icon={<BarChart3 className="h-4 w-4" />}
                label="Classe piu numerosa"
                tone="warm"
                value={summary.largest_age_class.age_class}
              />
              <InsightItem
                className="lg:col-span-2"
                detail={formatPercent(summary.children_share)}
                icon={<Users className="h-4 w-4" />}
                label="Eta 0-14"
                tone="neutral"
                value={formatInteger(summary.children)}
              />
              <InsightItem
                className="lg:col-span-2"
                detail={`${metadata.rows} classi/righe`}
                icon={<Database className="h-4 w-4" />}
                label="Copertura"
                tone="cool"
                value={String(metadata.latest_year)}
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
                <CalendarDays className="h-3.5 w-3.5" />
                Frequenza {metadata.frequency}
              </span>
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
                  il CSV ufficiale, valida intestazioni e codici territoriali,
                  calcola totali e quote, poi pubblica il JSON statico.
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

function ForeignResidentsPyramid({
  records,
}: {
  records: LameziaForeignResidentsAgeRecord[];
}) {
  const maxSide = Math.max(
    ...records.flatMap((record) => [record.male, record.female]),
  );
  const plotHeight = CHART_HEIGHT - PLOT.top - PLOT.bottom;
  const rowHeight = plotHeight / records.length;
  const sideWidth = CENTER_X - CENTER_GAP / 2 - PLOT.left;
  const yForIndex = (index: number) =>
    PLOT.top + index * rowHeight + rowHeight / 2;
  const widthForValue = (value: number) =>
    (value / Math.max(1, maxSide)) * sideWidth;

  return (
    <div className="mt-5 overflow-x-auto rounded-xl border border-border bg-background p-3 shadow-sm">
      <svg
        aria-describedby="foreign-residents-chart-desc"
        aria-labelledby="foreign-residents-chart-title"
        className="block min-w-[780px] w-full"
        role="img"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      >
        <title id="foreign-residents-chart-title">
          Piramide per eta e sesso dei residenti stranieri a Lamezia Terme
        </title>
        <desc id="foreign-residents-chart-desc">
          Distribuzione 2025 dei residenti stranieri per classi d'eta, con
          maschi a sinistra e femmine a destra, dal portale OpenData comunale.
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
          y={26}
        >
          Residenti stranieri per classe d'eta
        </text>
        <text
          fill="hsl(var(--muted-foreground))"
          fontSize="12"
          textAnchor="end"
          x={CHART_WIDTH - PLOT.right}
          y={26}
        >
          fonte OpenData comunale
        </text>
        <line
          stroke="hsl(var(--border))"
          strokeWidth="1"
          x1={CENTER_X}
          x2={CENTER_X}
          y1={PLOT.top - 10}
          y2={CHART_HEIGHT - PLOT.bottom + 10}
        />
        <text
          fill="hsl(var(--muted-foreground))"
          fontSize="12"
          fontWeight="700"
          textAnchor="end"
          x={CENTER_X - CENTER_GAP / 2}
          y={45}
        >
          Maschi
        </text>
        <text
          fill="hsl(var(--muted-foreground))"
          fontSize="12"
          fontWeight="700"
          x={CENTER_X + CENTER_GAP / 2}
          y={45}
        >
          Femmine
        </text>
        {records.map((record, index) => {
          const y = yForIndex(index);
          const maleWidth = widthForValue(record.male);
          const femaleWidth = widthForValue(record.female);
          const barHeight = Math.min(16, rowHeight * 0.68);

          return (
            <g key={`${record.year}-${record.age_class}`}>
              <rect
                fill="hsl(var(--primary) / 0.72)"
                height={barHeight}
                rx="4"
                width={maleWidth}
                x={CENTER_X - CENTER_GAP / 2 - maleWidth}
                y={y - barHeight / 2}
              />
              <rect
                fill="hsl(var(--brand) / 0.72)"
                height={barHeight}
                rx="4"
                width={femaleWidth}
                x={CENTER_X + CENTER_GAP / 2}
                y={y - barHeight / 2}
              />
              <text
                fill="hsl(var(--foreground))"
                fontSize="11"
                fontWeight="700"
                textAnchor="middle"
                x={CENTER_X}
                y={y + 4}
              >
                {record.age_class}
              </text>
              {index % 2 === 0 ? (
                <>
                  <text
                    fill="hsl(var(--muted-foreground))"
                    fontSize="10"
                    textAnchor="end"
                    x={CENTER_X - CENTER_GAP / 2 - maleWidth - 8}
                    y={y + 4}
                  >
                    {numberFormat.format(record.male)}
                  </text>
                  <text
                    fill="hsl(var(--muted-foreground))"
                    fontSize="10"
                    x={CENTER_X + CENTER_GAP / 2 + femaleWidth + 8}
                    y={y + 4}
                  >
                    {numberFormat.format(record.female)}
                  </text>
                </>
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
      <dd className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</dd>
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

function formatInteger(value: number) {
  return numberFormat.format(value);
}

function formatPercent(value: number) {
  return percentFormat.format(value);
}
