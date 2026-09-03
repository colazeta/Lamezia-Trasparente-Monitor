import {
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileSearch,
  ShieldCheck,
} from "lucide-react";

import {
  getPerformanceProcessStats,
  performance2024ProcessEvents,
  type PerformanceProcessEvent,
} from "@/data/performanceProcessChain";

const STAGE_LABEL: Record<PerformanceProcessEvent["stage"], string> = {
  "plan-approval": "Piano approvato",
  "intermediate-monitoring": "Monitoraggio intermedio",
  "final-monitoring": "Monitoraggio finale",
  "reporting-consultation": "Relazione · consultazione",
  "oiv-validation": "Validazione OIV",
  "giunta-approval": "Approvazione Giunta",
  "permanent-publication": "Pubblicazione permanente",
};

const STATUS_LABEL: Record<PerformanceProcessEvent["evidenceStatus"], string> = {
  "metadata-indexed": "Registro ufficiale · metadati",
  "indexed-page-verified": "PDF · pagina verificata",
  "pending-document": "Documento da acquisire",
};

function formatDate(value: string | null) {
  if (!value) return "Data da acquisire";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export function PerformanceProcessChainPanel() {
  const stats = getPerformanceProcessStats();

  return (
    <section
      aria-labelledby="performance-process-chain-heading"
      className="mb-10 overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm"
    >
      <div className="grid gap-5 border-b border-border p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            Ciclo 2024
          </p>
          <h2
            id="performance-process-chain-heading"
            className="mt-1 text-2xl font-display font-bold tracking-tight"
          >
            Dove siamo nella catena di rendicontazione
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Il percorso distingue ciò che è già verificato in un documento da
            ciò che è soltanto censito nel registro ufficiale e dai passaggi per
            cui il documento specifico non è ancora stato acquisito. Un passaggio
            pendente non equivale a un esito negativo.
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-2 text-center text-xs">
          <ProcessCount label="Pagina verificata" value={stats.pageVerified} />
          <ProcessCount label="Solo metadati" value={stats.metadataOnly} />
          <ProcessCount label="Da acquisire" value={stats.pending} />
        </dl>
      </div>

      <ol className="divide-y divide-border" aria-label="Catena Performance 2024">
        {performance2024ProcessEvents.map((event, index) => (
          <ProcessEventRow
            key={event.id}
            event={event}
            ordinal={index + 1}
            total={performance2024ProcessEvents.length}
          />
        ))}
      </ol>

      <div className="border-t border-border bg-muted/20 p-5 text-sm md:p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          <p className="text-muted-foreground">
            La consultazione del 14 ottobre 2025 documenta che la Relazione 2024
            avrebbe seguito la sequenza validazione OIV → approvazione della
            Giunta → pubblicazione permanente. Finché i tre documenti successivi
            non sono localizzati e verificati, la piattaforma non li presenta
            come già avvenuti.
          </p>
        </div>
      </div>
    </section>
  );
}

function ProcessCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-24 rounded-xl border border-border bg-muted/20 p-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-xl font-display font-bold tabular-nums text-foreground">
        {value}
      </dd>
    </div>
  );
}

function ProcessEventRow({
  event,
  ordinal,
  total,
}: {
  event: PerformanceProcessEvent;
  ordinal: number;
  total: number;
}) {
  const verified = event.evidenceStatus === "indexed-page-verified";
  const metadata = event.evidenceStatus === "metadata-indexed";
  const Icon = verified ? CheckCircle2 : metadata ? FileSearch : Clock3;

  return (
    <li className="grid gap-4 p-5 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-start md:p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/20 text-sm font-bold tabular-nums text-foreground">
        {ordinal}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold uppercase tracking-wide text-brand">
            {STAGE_LABEL[event.stage]}
          </span>
          <span className="text-muted-foreground">{ordinal} di {total}</span>
        </div>
        <h3 className="mt-1 font-display text-lg font-bold leading-snug text-foreground">
          {event.title}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarCheck2 className="h-3.5 w-3.5" />
            {formatDate(event.date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5" />
            {STATUS_LABEL[event.evidenceStatus]}
          </span>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {event.note}
        </p>
        {event.sourceLocator ? (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Locator: {event.sourceLocator}
          </p>
        ) : null}
      </div>

      {event.officialUrl ? (
        <a
          href={event.officialUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          Fonte
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      ) : (
        <span className="text-xs font-medium text-muted-foreground">
          Nessun link verificato
        </span>
      )}
    </li>
  );
}
