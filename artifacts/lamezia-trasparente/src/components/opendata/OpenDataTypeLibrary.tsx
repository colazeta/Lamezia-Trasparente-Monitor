import {
  Activity,
  ArrowRight,
  CalendarDays,
  Clock3,
  Database,
  FileJson,
  Map,
  Table2,
} from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import {
  OPEN_DATA_TYPE_LIBRARY,
  OPEN_DATA_TYPE_LIBRARY_SUMMARY,
  type OpenDataTypeDefinition,
} from "@/data/opendataDataTypes";

const TYPE_ICONS: Record<string, ReactNode> = {
  "daily-time-series": <CalendarDays className="h-4 w-4" />,
  "tabular-registers": <Table2 className="h-4 w-4" />,
  "territorial-layers": <Map className="h-4 w-4" />,
  "civic-indicators": <Activity className="h-4 w-4" />,
};

export function OpenDataTypeLibrary() {
  return (
    <section aria-labelledby="opendata-type-library-title" className="mb-8">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="eyebrow text-primary">
            <Database className="h-3.5 w-3.5" />
            Libreria dei tipi di dato
          </span>
          <h2
            id="opendata-type-library-title"
            className="mt-2 text-2xl font-display font-bold text-foreground"
          >
            Tipi di dati disponibili
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Modelli riusabili per leggere e pubblicare dataset civici: ogni nuovo
          dato entra con formato, aggiornamento, metadati minimi e limiti
          dichiarati.
        </p>
      </div>

      <dl className="mb-4 grid gap-3 sm:grid-cols-3">
        <LibraryStat
          icon={<FileJson className="h-4 w-4" />}
          label="Tipi registrati"
          value={String(OPEN_DATA_TYPE_LIBRARY_SUMMARY.total)}
        />
        <LibraryStat
          icon={<CalendarDays className="h-4 w-4" />}
          label="Schede pubblicate"
          value={String(OPEN_DATA_TYPE_LIBRARY_SUMMARY.published)}
        />
        <LibraryStat
          icon={<Clock3 className="h-4 w-4" />}
          label="Modelli pronti"
          value={String(OPEN_DATA_TYPE_LIBRARY_SUMMARY.ready)}
        />
      </dl>

      <div className="grid gap-4 lg:grid-cols-2">
        {OPEN_DATA_TYPE_LIBRARY.map((type) => (
          <DataTypeCard key={type.id} type={type} />
        ))}
      </div>
    </section>
  );
}

function DataTypeCard({ type }: { type: OpenDataTypeDefinition }) {
  const isPublished = type.status === "published";

  return (
    <article className="rounded-lg border border-card-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/20">
          {TYPE_ICONS[type.id] ?? <Database className="h-4 w-4" />}
        </span>
        <Badge
          variant={isPublished ? "success" : "outline"}
          className="shadow-none"
        >
          {type.statusLabel}
        </Badge>
        <Badge variant="outline" className="shadow-none">
          {type.shortLabel}
        </Badge>
      </div>

      <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">
            {type.label}
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {type.description}
          </p>
        </div>
        {type.href ? (
          <a
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary"
            href={type.href}
          >
            Apri dato
            <ArrowRight className="h-4 w-4" />
          </a>
        ) : null}
      </div>

      <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
        <DataPoint label="Schema" value={type.model} />
        <DataPoint label="Aggiornamento" value={type.updateCadence} />
      </dl>

      <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
        <TokenList label="Formati" values={type.formats} />
        <TokenList label="Metadati minimi" values={type.requiredMetadata} />
      </div>

      <div className="mt-4 rounded-md border border-border bg-muted/20 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Riuso civico
        </p>
        <ul className="mt-2 space-y-1 text-sm leading-6 text-foreground">
          {type.civicUses.map((use) => (
            <li key={use}>{use}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function LibraryStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-sm">
      <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 font-display text-xl font-bold text-foreground">
        {value}
      </dd>
    </div>
  );
}

function DataPoint({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 leading-6 text-foreground">{value}</dd>
    </div>
  );
}

function TokenList({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((value) => (
          <span
            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground"
            key={value}
          >
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}
