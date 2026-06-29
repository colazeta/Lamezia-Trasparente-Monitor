import {
  ArrowRight,
  CalendarDays,
  Database,
  Download,
  FileJson,
  Sparkles,
  Thermometer,
} from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LAMEZIA_CLIMATE_DATA,
  LAMEZIA_CLIMATE_DATA_URL,
} from "@/data/lameziaClimate";

const DATASET_COUNT_FORMATTER = new Intl.NumberFormat("it-IT");

export function OpenDataDashboard() {
  const metadata = LAMEZIA_CLIMATE_DATA.metadata;
  const dailyCount = DATASET_COUNT_FORMATTER.format(
    LAMEZIA_CLIMATE_DATA.daily.length,
  );

  return (
    <section
      aria-labelledby="opendata-dashboard-title"
      className="mb-8 overflow-hidden rounded-xl border border-card-border bg-card shadow-sm"
    >
      <div className="border-b border-border p-5 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow text-primary">
              <Database className="h-3.5 w-3.5" />
              Cruscotto dati consultabili
            </span>
            <h2
              id="opendata-dashboard-title"
              className="mt-2 text-2xl font-display font-bold text-foreground"
            >
              Dataset con lettura visuale
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Schede pronte per essere lette, confrontate e scaricate. Il clima e
            il primo dataset pubblicato in questo formato; i prossimi entrano
            nello stesso cruscotto senza duplicare la pagina.
          </p>
        </div>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)] md:p-6">
        <a
          className="group rounded-lg border border-border bg-background p-4 transition-colors hover:border-brand/50 hover:bg-muted/20"
          href="#clima-territorio"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success" className="shadow-none">
              <Sparkles className="mr-1 h-3 w-3" />
              Disponibile
            </Badge>
            <Badge variant="outline" className="shadow-none">
              Serie giornaliera
            </Badge>
          </div>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-xl font-display font-bold text-foreground">
                Clima e territorio
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Anomalie climatiche giornaliere di Lamezia Terme, normale
                1991-2020, ultimo giorno completo e serie JSON statica.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              Apri scheda
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
            <DashboardStat
              icon={<FileJson className="h-4 w-4" />}
              label="Record"
              value={dailyCount}
            />
            <DashboardStat
              icon={<CalendarDays className="h-4 w-4" />}
              label="Dato fino a"
              value={formatDate(metadata.latest_complete_date)}
            />
            <DashboardStat
              icon={<Thermometer className="h-4 w-4" />}
              label="Baseline"
              value={metadata.baseline_period}
            />
          </dl>
        </a>

        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
          <Badge variant="outline" className="shadow-none">
            Prossimi dataset
          </Badge>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Questo spazio e predisposto per nuove schede dataset-first con
            grafico, indicatori essenziali e download statico.
          </p>
          <a className="mt-4 block" href={LAMEZIA_CLIMATE_DATA_URL} download>
            <Button variant="outline" size="sm" className="w-full">
              <Download className="h-4 w-4" />
              Scarica il primo JSON
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}

function DashboardStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 font-display text-lg font-bold text-foreground">
        {value}
      </dd>
    </div>
  );
}

function formatDate(date: string) {
  const [year, month, day] = date.slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}
