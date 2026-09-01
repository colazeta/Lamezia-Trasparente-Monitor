import { type ReactNode } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Download,
  ExternalLink,
  FileJson,
  Home,
  Info,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  LAMEZIA_HOUSEHOLD_COMPOSITION_2023_DATA,
  LAMEZIA_HOUSEHOLD_COMPOSITION_2023_DATA_URL,
  type LameziaHouseholdCompositionRecord,
} from "@/data/lameziaHouseholdComposition2023";
import { withPublicBasePath } from "@/lib/publicBasePath";

const CHART_WIDTH = 1080;
const CHART_HEIGHT = 390;
const PLOT = { left: 190, right: 185, top: 60, bottom: 38 };
const FAMILIES_CHILDREN_DATASET_URL = withPublicBasePath(
  "/opendata?tema=population-society&dataset=lamezia-families-children",
);

const numberFormat = new Intl.NumberFormat("it-IT", {
  useGrouping: "always",
});
const percentFormat = new Intl.NumberFormat("it-IT", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function HouseholdCompositionDatasetCard() {
  const data = LAMEZIA_HOUSEHOLD_COMPOSITION_2023_DATA;

  return (
    <section
      aria-labelledby="famiglie-componenti-title"
      className="mb-8 overflow-hidden rounded-xl border border-card-border bg-card shadow-sm"
      id="famiglie-componenti-2023-lamezia"
    >
      <div className="border-b border-border p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="eyebrow text-primary">
              <Users className="h-3.5 w-3.5" />
              Popolazione e società
            </span>
            <h2
              className="mt-2 text-2xl font-display font-bold text-foreground"
              id="famiglie-componenti-title"
            >
              Distribuzione 2023 per numero di componenti
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Fotografia censuaria delle famiglie anagrafiche di Lamezia Terme,
              aggregata dalle sezioni ISTAT e pubblicata come dato statico
              verificabile anche senza il backend demografico.
            </p>
          </div>
          <Button
            asChild
            className="w-full md:w-auto"
            size="sm"
            variant="outline"
          >
            <a
              download="lamezia-famiglie-componenti-2023.json"
              href={LAMEZIA_HOUSEHOLD_COMPOSITION_2023_DATA_URL}
            >
              <FileJson className="h-4 w-4" />
              Scarica JSON
              <Download className="h-4 w-4 opacity-70" />
            </a>
          </Button>
        </div>
      </div>

      <div className="p-5 md:p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <InsightItem
            detail="PF1 · totale censuario"
            icon={<Home className="h-4 w-4" />}
            label="Famiglie totali"
            tone="neutral"
            value={formatInteger(data.totalHouseholds)}
          />
          <InsightItem
            detail={`${formatPercent(data.indicators.onePersonShare)} del totale`}
            icon={<Users className="h-4 w-4" />}
            label="Famiglie unipersonali"
            tone="cool"
            value={formatInteger(data.indicators.onePersonHouseholds)}
          />
          <InsightItem
            detail={`${formatPercent(data.indicators.fivePlusShare)} del totale`}
            icon={<Users className="h-4 w-4" />}
            label="Almeno 5 componenti"
            tone="warm"
            value={formatInteger(data.indicators.fivePlusHouseholds)}
          />
        </div>

        <HouseholdCompositionChart records={data.byComponents} />

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <p className="text-sm leading-6 text-muted-foreground">
            Le quote sono arrotondate a un decimale e sommano visivamente a
            100,1%. Il controllo di pubblicazione usa invece i conteggi interi:
            PF3 + PF4 + PF5 + PF6 + PF7 + PF8 = PF1, con residuo zero.
          </p>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Quadratura esatta · {formatInteger(data.quality.componentSum)}
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-4 text-sm leading-6 md:flex-row md:items-center md:justify-between">
          <p className="max-w-3xl text-muted-foreground">
            <strong className="font-semibold text-foreground">
              Uso come benchmark.
            </strong>{" "}
            Questo profilo definisce il perimetro strutturale 2023 delle
            famiglie. La fonte comunale sul numero di figli resta un
            approfondimento separato e non viene quadrata su questo totale.
          </p>
          <Button asChild className="shrink-0" size="sm" variant="outline">
            <a href={FAMILIES_CHILDREN_DATASET_URL}>
              Apri la fonte comunale
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>

        <details className="mt-5 rounded-lg border border-border bg-muted/20 text-sm leading-6">
          <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-foreground marker:hidden">
            Fonte, controlli e limiti del dato
          </summary>
          <div className="border-t border-border p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <QualityItem
                label="Sezioni reali incluse"
                value={formatInteger(data.quality.includedRows)}
              />
              <QualityItem
                label="Sezioni fittizie escluse"
                value={formatInteger(data.quality.skippedFictitiousRows)}
              />
              <QualityItem
                label="Righe reali incomplete"
                value={formatInteger(data.quality.incompleteRows)}
              />
              <QualityItem
                label="Residuo PF3–PF8 / PF1"
                value={formatInteger(data.quality.reconciliationDifference)}
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <a
                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 font-medium text-foreground hover:border-primary/50 hover:text-primary"
                href={data.source.pageUrl}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Pagina fonte ISTAT
              </a>
              <a
                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 font-medium text-foreground hover:border-primary/50 hover:text-primary"
                href={data.source.downloadUrl}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Archivio ufficiale 2023
              </a>
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                Riferimento {formatSourceDate(data.source.referenceDate)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5">
                <Info className="h-3.5 w-3.5" />
                Fonte aggiornata il{" "}
                {formatSourceDate(data.source.sourceUpdateDate)}
              </span>
            </div>

            <div className="mt-5 grid overflow-hidden rounded-lg border border-border md:grid-cols-3 md:divide-x md:divide-border">
              <MethodBox title="Fonte">
                {data.source.institution}, {data.source.dataset}. Il profilo usa
                l’edizione 2023 con riferimento al 31 dicembre.
              </MethodBox>
              <MethodBox title="Metodo">
                Sono aggregate soltanto le{" "}
                {formatInteger(data.quality.includedRows)} sezioni reali
                complete di Lamezia Terme; i mancanti non vengono trasformati in
                zero e una mancata quadratura blocca la pubblicazione.
              </MethodBox>
              <MethodBox title="Limite semantico">
                “Famiglia anagrafica” non equivale a “nucleo familiare”. La sola
                dimensione non consente di inferire coppie, figli, parentela o
                condizioni personali.
              </MethodBox>
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}

function HouseholdCompositionChart({
  records,
}: {
  records: LameziaHouseholdCompositionRecord[];
}) {
  const maxHouseholds = Math.max(...records.map((record) => record.households));
  const plotWidth = CHART_WIDTH - PLOT.left - PLOT.right;
  const plotHeight = CHART_HEIGHT - PLOT.top - PLOT.bottom;
  const rowHeight = plotHeight / records.length;

  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-background p-3 shadow-sm">
      <svg
        aria-describedby="household-composition-chart-desc"
        aria-labelledby="household-composition-chart-title"
        className="block min-w-[760px] w-full"
        role="img"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      >
        <title id="household-composition-chart-title">
          Famiglie di Lamezia Terme per numero di componenti nel 2023
        </title>
        <desc id="household-composition-chart-desc">
          Distribuzione ISTAT delle 27.591 famiglie anagrafiche nelle classi da
          uno a sei o più componenti.
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
          y={28}
        >
          Numero di componenti della famiglia anagrafica
        </text>
        <text
          fill="hsl(var(--muted-foreground))"
          fontSize="12"
          textAnchor="end"
          x={CHART_WIDTH - PLOT.right}
          y={28}
        >
          ISTAT · Censimento permanente 2023
        </text>
        {records.map((record, index) => {
          const label = componentLabel(record.key);
          const y = PLOT.top + index * rowHeight + rowHeight / 2;
          const width =
            (record.households / Math.max(1, maxHouseholds)) * plotWidth;
          const barHeight = Math.min(30, rowHeight * 0.58);

          return (
            <g
              aria-label={`${label}: ${formatInteger(record.households)} famiglie, ${formatPercent(record.share)}`}
              key={record.key}
              role="group"
            >
              <text
                fill="hsl(var(--foreground))"
                fontSize="12"
                fontWeight="700"
                textAnchor="end"
                x={PLOT.left - 16}
                y={y + 4}
              >
                {label}
              </text>
              <rect
                fill="hsl(var(--primary) / 0.76)"
                height={barHeight}
                rx="7"
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
                {formatInteger(record.households)} famiglie
              </text>
              <text
                fill="hsl(var(--muted-foreground))"
                fontSize="11"
                x={PLOT.left + width + 12}
                y={y + 15}
              >
                {formatPercent(record.share)} · {record.sourceField}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function InsightItem({
  detail,
  icon,
  label,
  tone,
  value,
}: {
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
    <dl className="rounded-lg border border-border bg-background p-4 shadow-sm">
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

function QualityItem({ label, value }: { label: string; value: string }) {
  return (
    <dl className="rounded-lg border border-border bg-background px-3 py-2.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-display text-lg font-bold tabular-nums text-foreground">
        {value}
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
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-muted-foreground">{children}</p>
    </section>
  );
}

function componentLabel(key: LameziaHouseholdCompositionRecord["key"]) {
  if (key === "1") return "1 componente";
  if (key === "6+") return "6 o più componenti";
  return `${key} componenti`;
}

function formatInteger(value: number) {
  return numberFormat.format(value);
}

function formatPercent(value: number) {
  return `${percentFormat.format(value)}%`;
}

function formatSourceDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
