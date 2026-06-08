import { Link } from "wouter";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Database,
  Info,
  ShieldCheck,
  Signal,
  XCircle,
} from "lucide-react";

import {
  MOCK_SOURCE_HEALTH,
  SOURCE_PRIORITY_LABELS,
  SOURCE_STATUS_LABELS,
  SOURCE_TYPE_LABELS,
  type SourceHealthItem,
  type SourceHealthStatus,
} from "@/data/sourceHealth";
import { cn } from "@/lib/utils";

const statusStyles: Record<SourceHealthStatus, string> = {
  ok: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100",
  warning:
    "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100",
  stale:
    "border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-100",
  error: "border-red-200 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-100",
  missing:
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200",
};

const statusIcons: Record<SourceHealthStatus, typeof CheckCircle2> = {
  ok: CheckCircle2,
  warning: AlertTriangle,
  stale: Clock3,
  error: XCircle,
  missing: Info,
};

function formatDateTime(value: string | null) {
  if (!value) return "Non ancora disponibile";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Dato non leggibile";

  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function scoreTone(score: number) {
  if (score >= 80) return "text-emerald-700 dark:text-emerald-300";
  if (score >= 60) return "text-amber-700 dark:text-amber-300";
  return "text-orange-700 dark:text-orange-300";
}

function StatusBadge({ status }: { status: SourceHealthStatus }) {
  const Icon = statusIcons[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        statusStyles[status],
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {SOURCE_STATUS_LABELS[status]}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Activity;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-display font-bold tracking-tight">
            {value}
          </p>
        </div>
        <span className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {detail}
      </p>
    </article>
  );
}

function SourceMobileCard({ source }: { source: SourceHealthItem }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm md:hidden">
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="font-display text-lg font-bold">{source.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {SOURCE_TYPE_LABELS[source.sourceType]} · priorità {SOURCE_PRIORITY_LABELS[source.priority]}
          </p>
        </div>
        <StatusBadge status={source.status} />
      </div>
      <dl className="mt-4 grid gap-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="font-semibold text-foreground">Ultimo controllo</dt>
          <dd className="text-right text-muted-foreground">
            {formatDateTime(source.lastCheckedAt)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="font-semibold text-foreground">Ultimo aggiornamento</dt>
          <dd className="text-right text-muted-foreground">
            {formatDateTime(source.lastUpdatedAt)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="font-semibold text-foreground">Copertura operativa</dt>
          <dd className={cn("font-bold", scoreTone(source.coverageScore))}>
            {source.coverageScore}%
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {source.cautionNote}
      </p>
    </article>
  );
}

export function StatoMonitoraggio() {
  const payload = MOCK_SOURCE_HEALTH;
  const statusCounts = payload.sources.reduce<Record<SourceHealthStatus, number>>(
    (acc, source) => ({ ...acc, [source.status]: acc[source.status] + 1 }),
    { ok: 0, warning: 0, stale: 0, error: 0, missing: 0 },
  );
  const needsReview =
    statusCounts.warning + statusCounts.stale + statusCounts.error + statusCounts.missing;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
      <header className="max-w-3xl">
        <span className="eyebrow text-primary">
          <Signal className="h-3.5 w-3.5" aria-hidden="true" />
          Qualità operativa delle fonti
        </span>
        <h1 className="mt-2 text-3xl font-display font-bold tracking-tight md:text-5xl">
          Stato del monitoraggio
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Una vista prudente sullo stato tecnico delle fonti censite: controlli,
          freschezza, copertura operativa e note di cautela. I segnali mostrati
          aiutano a orientare verifiche documentali, non costituiscono valutazioni
          sull'operato dell'ente o sulla completezza assoluta degli atti pubblici.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Generato da dataset mock tipizzato compatibile con il futuro payload di{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">/healthz/sources</code>: {formatDateTime(payload.generatedAt)}.
        </p>
      </header>

      <section
        aria-labelledby="riepilogo-monitoraggio"
        className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <h2 id="riepilogo-monitoraggio" className="sr-only">
          Riepilogo aggregato del monitoraggio
        </h2>
        <SummaryCard
          label="Fonti censite"
          value={String(payload.sources.length)}
          detail="Numero di fonti presenti nel registro operativo mock in attesa dell'endpoint pubblico."
          icon={Database}
        />
        <SummaryCard
          label="Copertura operativa"
          value={`${payload.coverageScore}%`}
          detail="Quota sintetica dei controlli censiti con dati disponibili e tracciabili nel runtime."
          icon={BarChart3}
        />
        <SummaryCard
          label="Freschezza controlli"
          value={`${payload.freshnessScore}%`}
          detail="Indicatore tecnico sulla vicinanza tra ultimo controllo e soglia attesa per ogni fonte."
          icon={Clock3}
        />
        <SummaryCard
          label="Da verificare"
          value={String(needsReview)}
          detail="Fonti con warning, stale, errore tecnico o tracciamento runtime non ancora disponibile."
          icon={ShieldCheck}
        />
      </section>

      <section
        aria-labelledby="legenda-stati"
        className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-sm"
      >
        <h2 id="legenda-stati" className="font-display text-2xl font-bold">
          Legenda degli stati
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {(Object.keys(SOURCE_STATUS_LABELS) as SourceHealthStatus[]).map((status) => (
            <div key={status} className="rounded-xl border border-border bg-muted/30 p-3">
              <StatusBadge status={status} />
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="dettaglio-fonti" className="mt-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="dettaglio-fonti" className="font-display text-2xl font-bold">
              Dettaglio per fonte
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              La tabella espone tipo, priorità, stato, ultimo controllo, ultimo
              aggiornamento e copertura operativa. Su schermi piccoli gli stessi
              dati sono presentati come schede compatte.
            </p>
          </div>
          <Link
            href="/fonti-dati"
            className="text-sm font-semibold text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Consulta l'elenco metodologico delle fonti
          </Link>
        </div>

        <div className="mt-5 hidden overflow-x-auto rounded-2xl border border-border bg-card shadow-sm md:block">
          <table className="min-w-full divide-y divide-border text-left text-sm">
            <caption className="sr-only">
              Stato tecnico delle fonti monitorate con priorità, controlli e note di cautela.
            </caption>
            <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-bold">Fonte</th>
                <th scope="col" className="px-4 py-3 font-bold">Tipo</th>
                <th scope="col" className="px-4 py-3 font-bold">Priorità</th>
                <th scope="col" className="px-4 py-3 font-bold">Stato</th>
                <th scope="col" className="px-4 py-3 font-bold">Ultimo controllo</th>
                <th scope="col" className="px-4 py-3 font-bold">Ultimo aggiornamento</th>
                <th scope="col" className="px-4 py-3 font-bold">Copertura operativa</th>
                <th scope="col" className="px-4 py-3 font-bold">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payload.sources.map((source) => (
                <tr key={source.id} className="align-top">
                  <th scope="row" className="px-4 py-4 font-display text-base font-bold">
                    {source.name}
                  </th>
                  <td className="px-4 py-4 text-muted-foreground">
                    {SOURCE_TYPE_LABELS[source.sourceType]}
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {SOURCE_PRIORITY_LABELS[source.priority]}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={source.status} />
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {formatDateTime(source.lastCheckedAt)}
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {formatDateTime(source.lastUpdatedAt)}
                  </td>
                  <td className={cn("px-4 py-4 font-bold", scoreTone(source.coverageScore))}>
                    {source.coverageScore}%
                  </td>
                  <td className="max-w-xs px-4 py-4 leading-relaxed text-muted-foreground">
                    {source.cautionNote}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 grid gap-4 md:hidden">
          {payload.sources.map((source) => (
            <SourceMobileCard key={source.id} source={source} />
          ))}
        </div>
      </section>

      <aside className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="font-display text-lg font-bold">Nota metodologica</h2>
            <p className="mt-2 text-sm leading-relaxed">{payload.methodologyNote}</p>
            <p className="mt-3 text-sm leading-relaxed">
              Stati tecnici come <strong>stale</strong>, <strong>warning</strong> o{" "}
              <strong>error</strong> indicano una possibile esigenza di controllo del
              processo di raccolta o arricchimento. Non indicano omissioni,
              irregolarità, responsabilità individuali o valutazioni sostanziali
              sulle fonti esterne.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
