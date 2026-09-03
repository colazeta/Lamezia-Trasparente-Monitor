import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileCheck2,
  Files,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  deriveWeightedPhaseProgress,
  getPerformanceRegistryStats,
  performanceObjectiveRecords,
  performanceSourceDocuments,
  type PerformanceObjectiveRecord,
  type PerformanceSourceDocument,
} from "@/data/performanceObjectiveRegistry";

const SOURCE_TYPE_LABEL: Record<PerformanceSourceDocument["type"], string> = {
  DUP: "DUP",
  PEG: "PEG / performance",
  PIAO: "PIAO",
  OIV: "OIV",
  MONITORAGGIO: "Monitoraggio",
};

const ACQUISITION_LABEL: Record<
  PerformanceSourceDocument["acquisitionStatus"],
  string
> = {
  "metadata-verified": "Metadati verificati",
  "indexed-page-verified": "PDF indicizzato · pagine verificate",
  "visual-page-verified": "PDF verificato visivamente",
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
            Le fonti ufficiali entrano prima nel registro documentale. I singoli
            obiettivi vengono materializzati solo quando titolo, ufficio, fasi e
            risultati possono essere ricondotti a pagine precise della fonte.
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
            value={String(stats.objectiveRecords)}
            label="Obiettivi verificati"
          />
        </div>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-2 md:p-6">
        {performanceSourceDocuments.map((source) => (
          <SourceCard key={source.id} source={source} />
        ))}
      </div>

      {performanceObjectiveRecords.length ? (
        <div className="border-t border-border p-5 md:p-6">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              Primo batch verificato · 2024
            </p>
            <h3 className="mt-1 text-xl font-display font-bold tracking-tight">
              Dal PDF alle fasi dell'obiettivo
            </h3>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              L'avanzamento mostrato nelle schede sotto è, quando indicato,
              ricalcolato da Lamezia Trasparente usando esclusivamente pesi e
              percentuali delle fasi pubblicate. Non è un voto, non sostituisce
              il valore ufficiale riepilogativo e non costituisce validazione OIV.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {performanceObjectiveRecords.map((objective) => (
              <ObjectiveCard key={objective.id} objective={objective} />
            ))}
          </div>
        </div>
      ) : null}

      <div className="border-t border-border bg-muted/20 p-5 text-sm md:p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          <div>
            <p className="font-semibold text-foreground">Criterio di acquisizione</p>
            <p className="mt-1 text-muted-foreground">
              Gli snippet di ricerca non diventano record amministrativi. Una
              lettura testuale del PDF con pagina verificabile è distinta dalla
              verifica visuale della pagina; se quest'ultima non è disponibile,
              lo stato resta esplicito. I campi non acquisiti restano null e non
              vengono interpretati come zero.
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
          {ACQUISITION_LABEL[source.acquisitionStatus]}
        </Badge>
        {source.objectiveExtractionStatus === "pending" ? (
          <Badge variant="outline" className="shadow-none text-muted-foreground">
            <Clock3 className="mr-1 h-3 w-3" />
            Estrazione pending
          </Badge>
        ) : (
          <Badge variant="outline" className="shadow-none">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Estrazione verificata
          </Badge>
        )}
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

function ObjectiveCard({ objective }: { objective: PerformanceObjectiveRecord }) {
  const derivedProgress = deriveWeightedPhaseProgress(objective);

  return (
    <article className="rounded-xl border border-card-border bg-background p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="shadow-none">
          Obiettivo {objective.id.split("-").at(-1)?.replace(/^0+/, "")}
        </Badge>
        <Badge variant="secondary" className="shadow-none">
          Monitorato
        </Badge>
      </div>

      <h4 className="mt-3 font-display font-bold leading-snug text-foreground">
        {objective.title}
      </h4>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {objective.office ?? "Ufficio non acquisito"}
        {objective.responsible ? ` · ${objective.responsible}` : ""}
      </p>
      {objective.objectiveType ? (
        <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
          {objective.objectiveType}
        </p>
      ) : null}

      {derivedProgress !== null ? (
        <div className="mt-4 rounded-lg border border-border bg-muted/20 p-3">
          <div className="text-xs font-medium text-muted-foreground">
            Avanzamento ricostruito dalle fasi
          </div>
          <div className="mt-1 text-2xl font-display font-bold tabular-nums">
            {derivedProgress}%
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Calcolo LT sui pesi di fase; non è una validazione OIV.
          </p>
        </div>
      ) : null}

      <ol className="mt-4 space-y-3" aria-label={`Fasi di ${objective.title}`}>
        {objective.phases.map((phase) => (
          <li key={phase.id} className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="font-semibold text-foreground">{phase.id}</span>
              <span className="tabular-nums text-muted-foreground">
                peso {phase.weightPercent ?? "—"}% · finale {phase.finalProgressPercent ?? "—"}%
              </span>
            </div>
            <p className="mt-1 text-sm font-medium leading-snug text-foreground">
              {phase.title}
            </p>
            {phase.expectedResult ? (
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Risultato atteso: {phase.expectedResult}
              </p>
            ) : null}
            <p className="mt-1 text-[11px] text-muted-foreground">
              Fonte: {phase.sourceLocator}
            </p>
          </li>
        ))}
      </ol>

      <a
        href={objective.evidenceUrl ?? undefined}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        Apri il PDF · {objective.sourceLocator}
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
