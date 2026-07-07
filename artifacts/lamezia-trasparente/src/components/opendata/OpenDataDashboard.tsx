import {
  ArrowRight,
  CalendarDays,
  Database,
  FileJson,
  Sparkles,
  Thermometer,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { LAMEZIA_CLIMATE_DATA } from "@/data/lameziaClimate";
import { LAMEZIA_AIR_TRAFFIC_DATA } from "@/data/lameziaAirTraffic";

const DATASET_COUNT_FORMATTER = new Intl.NumberFormat("it-IT");

export function OpenDataDashboard() {
  const climateMetadata = LAMEZIA_CLIMATE_DATA.metadata;
  const airMetadata = LAMEZIA_AIR_TRAFFIC_DATA.metadata;
  const dailyCount = DATASET_COUNT_FORMATTER.format(
    LAMEZIA_CLIMATE_DATA.daily.length,
  );
  const monthlyCount = DATASET_COUNT_FORMATTER.format(airMetadata.months);

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
            il traffico aeroportuale sono i primi dataset pubblicati in questo
            formato; i prossimi entrano nello stesso cruscotto senza duplicare
            la pagina.
          </p>
        </div>
      </div>

      <div className="grid gap-4 p-5 lg:grid-cols-2 md:p-6">
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
                value={formatDate(climateMetadata.latest_complete_date)}
              />
              <DashboardStat
                icon={<Thermometer className="h-4 w-4" />}
                label="Baseline"
                value={climateMetadata.baseline_period}
              />
          </dl>
        </a>

        <a
          className="group rounded-lg border border-border bg-background p-4 transition-colors hover:border-brand/50 hover:bg-muted/20"
          href="#trasporto-aereo-lamezia"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success" className="shadow-none">
              <Sparkles className="mr-1 h-3 w-3" />
              Disponibile
            </Badge>
            <Badge variant="outline" className="shadow-none">
              Serie mensile
            </Badge>
          </div>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-xl font-display font-bold text-foreground">
                Trasporto aereo
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Passeggeri, movimenti e cargo mensili dello scalo SUF, con
                fonte Assaeroporti e serie JSON statica.
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
              label="Mesi"
              value={monthlyCount}
            />
            <DashboardStat
              icon={<CalendarDays className="h-4 w-4" />}
              label="Dato fino a"
              value={formatMonth(airMetadata.latest_complete_month)}
            />
            <DashboardStat
              icon={<Users className="h-4 w-4" />}
              label="Scalo"
              value={airMetadata.airport_iata}
            />
          </dl>
        </a>
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

function formatMonth(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("it-IT", {
    month: "short",
    year: "numeric",
  }).format(new Date(Date.UTC(year, monthNumber - 1, 1, 12)));
}
