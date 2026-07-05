import {
  Activity,
  ArrowRight,
  CalendarDays,
  Database,
  Map,
  Table2,
} from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import {
  OPEN_DATA_TYPE_LIBRARY,
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
          Modelli riusabili per pubblicare altri dataset senza cambiare la
          struttura della pagina.
        </p>
      </div>

      <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
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
    <article className="p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-3">
          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/20">
            {TYPE_ICONS[type.id] ?? <Database className="h-4 w-4" />}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
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
            <h3 className="font-display text-lg font-bold text-foreground">
              {type.label}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {type.description}
            </p>
          </div>
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

      <details className="mt-3 rounded-md border border-border bg-muted/20">
        <summary className="cursor-pointer list-none px-3 py-2 text-sm font-semibold text-foreground marker:hidden">
          Specifiche
        </summary>
        <div className="grid gap-3 border-t border-border p-3 text-sm md:grid-cols-2">
          <DataPoint label="Schema" value={type.model} />
          <DataPoint label="Aggiornamento" value={type.updateCadence} />
          <TokenList label="Formati" values={type.formats} />
          <TokenList label="Metadati minimi" values={type.requiredMetadata} />
          <TokenList label="Riuso civico" values={type.civicUses} />
        </div>
      </details>
    </article>
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
