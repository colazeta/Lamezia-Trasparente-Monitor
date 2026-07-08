import { type ReactNode } from "react";
import {
  BarChart3,
  CalendarDays,
  Database,
  Download,
  ExternalLink,
  FileJson,
  Info,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  LAMEZIA_FAMILIES_CHILDREN_DATA,
  LAMEZIA_FAMILIES_CHILDREN_DATA_URL,
  LAMEZIA_FAMILIES_CHILDREN_SUMMARY,
  type LameziaFamiliesChildrenRecord,
} from "@/data/lameziaFamiliesChildren";

const CHART_WIDTH = 1040;
const CHART_HEIGHT = 330;
const PLOT = { left: 96, right: 116, top: 48, bottom: 42 };

const numberFormat = new Intl.NumberFormat("it-IT");
const percentFormat = new Intl.NumberFormat("it-IT", {
  maximumFractionDigits: 1,
  style: "percent",
});

export function FamiliesChildrenDatasetCard() {
  const records = LAMEZIA_FAMILIES_CHILDREN_DATA.family_children;
  const metadata = LAMEZIA_FAMILIES_CHILDREN_DATA.metadata;
  const summary = LAMEZIA_FAMILIES_CHILDREN_SUMMARY;

  return (
    <section
      aria-labelledby="famiglie-figli-title"
      className="mb-8 overflow-hidden rounded-xl border border-card-border bg-card shadow-sm"
      id="famiglie-figli-lamezia"
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
              id="famiglie-figli-title"
            >
              Famiglie per numero di figli - Lamezia Terme
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Distribuzione aggregata delle famiglie per numero di figli
              pubblicata dal Portale OpenData del Comune.
            </p>
          </div>
          <a href={LAMEZIA_FAMILIES_CHILDREN_DATA_URL} download>
            <Button variant="outline" size="sm" className="w-full md:w-auto">
              <FileJson className="h-4 w-4" />
              Scarica JSON
              <Download className="h-4 w-4 opacity-70" />
            </Button>
          </a>
        </div>
      </div>

      <div className="p-5 md:p-6">
        <FamiliesChildrenChart records={records} />

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Le barre mostrano la distribuzione pubblicata nel CSV comunale; le
          quote sono calcolate sul totale delle famiglie presenti nella risorsa.
        </p>

        <details className="mt-5 rounded-lg border border-border bg-muted/20 text-sm leading-6">
          <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-foreground marker:hidden">
            Dettagli del dataset
          </summary>
          <div className="border-t border-border p-4">
            <div className="grid gap-3 lg:grid-cols-6">
              <InsightItem
                className="lg:col-span-2"
                detail={`${metadata.rows} classi pubblicate`}
                icon={<Users className="h-4 w-4" />}
                label="Famiglie nella distribuzione"
                tone="neutral"
                value={formatInteger(summary.total)}
              />
              <InsightItem
                className="lg:col-span-2"
                detail={formatPercent(summary.one_child_share)}
                icon={<BarChart3 className="h-4 w-4" />}
                label="Con 1 figlio"
                tone="warm"
                value={formatInteger(summary.one_child)}
              />
              <InsightItem
                className="lg:col-span-2"
                detail={formatPercent(summary.two_children_share)}
                icon={<BarChart3 className="h-4 w-4" />}
                label="Con 2 figli"
                tone="cool"
                value={formatInteger(summary.two_children)}
              />
              <InsightItem
                className="lg:col-span-3"
                detail={formatPercent(summary.three_or_more_share)}
                icon={<Database className="h-4 w-4" />}
                label="Con 3 o piu figli"
                tone="neutral"
                value={formatInteger(summary.three_or_more)}
              />
              <InsightItem
                className="lg:col-span-3"
                detail={`${formatInteger(
                  summary.largest_class.families,
                )} famiglie`}
                icon={<BarChart3 className="h-4 w-4" />}
                label="Classe piu numerosa"
                tone="warm"
                value={summary.largest_class.children_count_label}
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
                  il CSV ufficiale, valida intestazioni e conteggi, calcola
                  quote e totale, poi pubblica il JSON statico.
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

function FamiliesChildrenChart({
  records,
}: {
  records: LameziaFamiliesChildrenRecord[];
}) {
  const maxFamilies = Math.max(...records.map((record) => record.families));
  const plotWidth = CHART_WIDTH - PLOT.left - PLOT.right;
  const plotHeight = CHART_HEIGHT - PLOT.top - PLOT.bottom;
  const rowHeight = plotHeight / records.length;

  return (
    <div className="mt-5 overflow-x-auto rounded-xl border border-border bg-background p-3 shadow-sm">
      <svg
        aria-describedby="families-children-chart-desc"
        aria-labelledby="families-children-chart-title"
        className="block min-w-[740px] w-full"
        role="img"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      >
        <title id="families-children-chart-title">
          Grafico delle famiglie per numero di figli a Lamezia Terme
        </title>
        <desc id="families-children-chart-desc">
          Distribuzione delle famiglie per numero di figli pubblicata dal
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
          y={26}
        >
          Famiglie per numero di figli
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
        {records.map((record, index) => {
          const y = PLOT.top + index * rowHeight + rowHeight / 2;
          const width =
            (record.families / Math.max(1, maxFamilies)) * plotWidth;
          const barHeight = Math.min(28, rowHeight * 0.58);

          return (
            <g key={record.children_count_label}>
              <text
                fill="hsl(var(--foreground))"
                fontSize="12"
                fontWeight="700"
                textAnchor="end"
                x={PLOT.left - 16}
                y={y + 4}
              >
                {record.children_count_label}
              </text>
              <rect
                fill="hsl(var(--primary) / 0.74)"
                height={barHeight}
                rx="6"
                width={width}
                x={PLOT.left}
                y={y - barHeight / 2}
              />
              <text
                fill="hsl(var(--foreground))"
                fontSize="12"
                fontWeight="700"
                x={PLOT.left + width + 12}
                y={y - 1}
              >
                {numberFormat.format(record.families)}
              </text>
              <text
                fill="hsl(var(--muted-foreground))"
                fontSize="11"
                x={PLOT.left + width + 12}
                y={y + 15}
              >
                {formatPercent(record.share_of_total)}
              </text>
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
