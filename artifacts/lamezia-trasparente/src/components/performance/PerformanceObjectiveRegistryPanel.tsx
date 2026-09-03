import {
  Clock3,
  ExternalLink,
  FileCheck2,
  Files,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  getPerformanceRegistryStats,
  performanceObjectiveRecords,
  performanceSourceDocuments,
  type PerformanceSourceDocument,
} from "@/data/performanceObjectiveRegistry";

const SOURCE_TYPE_LABEL: Record<PerformanceSourceDocument["type"], string> = {
  DUP: "DUP",
  PEG: "PEG / performance",
  PIAO: "PIAO",
  OIV: "OIV",
};

export function PerformanceObjectiveRegistryPanel() {
  const stats = getPerformanceRegistryStats();

  return (
    <section
      aria-labelledby="performance-source-registry-heading"
      className="mb-10 overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm"
    >
      <div className="grid gap-5 border-b border-border p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            Registro documentale
          </p>
          <h2
            id="performance-source-registry-heading"
            className="mt-1 text-2xl font-display font-bold tracking-tight"
          >
            Le fonti prima degli obiettivi
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Qui censiamo le fonti ufficiali che compongono il ciclo della
            performance. Una fonte acquisita non significa che i suoi obiettivi
            siano già stati estratti: il contenuto entra nel registro degli
            obiettivi solo dopo una verifica puntuale e riproducibile.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <RegistryCount
            icon={Files}
            value={String(stats.sourceDocuments)}
            label="Fonti censite"
          />
          <RegistryCount
            icon={FileCheck2}
            value={performanceObjectiveRecords.length ? String(stats.objectiveRecords) : "—"}
            label="Obiettivi verificati"
          />
        </div>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-2 md:p-6">
        {performanceSourceDocuments.map((source) => (
          <SourceCard key={source.id} source={source} />
        ))}
      </div>

      <div className="border-t border-border bg-muted/20 p-5 text-sm md:p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          <div>
            <p className="font-semibold text-foreground">Criterio di acquisizione</p>
            <p className="mt-1 text-muted-foreground">
              Gli snippet di ricerca non diventano record amministrativi. Se il
              PDF o il relativo locator non è verificabile, obiettivo, indicatore,
              target e risultato restano non acquisiti. Il trattino sopra indica
              quindi “non ancora verificato”, non zero.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function RegistryCount({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Files;
  value: string;
  label: string;
}) {
  return (
    <div className="min-w-32 rounded-xl border border-border bg-muted/20 p-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <div className="mt-1 text-xl font-display font-bold tabular-nums text-foreground">
        {value}
      </div>
    </div>
  );
}

function SourceCard({ source }: { source: PerformanceSourceDocument }) {
  return (
    <article className="flex flex-col rounded-xl border border-card-border bg-background p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="shadow-none">
          {SOURCE_TYPE_LABEL[source.type]}
        </Badge>
        <Badge variant="secondary" className="shadow-none">
          Metadati verificati
        </Badge>
        {source.objectiveExtractionStatus === "pending" ? (
          <Badge variant="outline" className="shadow-none text-muted-foreground">
            <Clock3 className="mr-1 h-3 w-3" />
            Estrazione pending
          </Badge>
        ) : null}
      </div>

      <h3 className="mt-3 font-display font-bold leading-snug text-foreground">
        {source.title}
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Ciclo {source.cycle} · {source.sourceLocator}
      </p>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <SourceField label="Atto" value={source.approvalAct} />
        <SourceField label="Ufficio" value={source.responsibleOffice} />
      </dl>

      {source.note ? (
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          {source.note}
        </p>
      ) : null}

      <a
        href={source.officialUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-primary hover:underline"
      >
        Fonte ufficiale
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </article>
  );
}

function SourceField({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{value ?? "Non acquisito"}</dd>
    </div>
  );
}
