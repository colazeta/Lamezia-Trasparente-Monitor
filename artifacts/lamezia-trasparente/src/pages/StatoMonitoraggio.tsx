import { Link } from "wouter";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Database,
  ExternalLink,
  Info,
  ShieldCheck,
  Signal,
  XCircle,
} from "lucide-react";

import {
  ALBO_OPERATIONAL_STATUS,
  ALBO_VERIFICATION_LABELS,
} from "@/data/alboStatus";
import {
  SOURCE_HEALTH,
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

function AlboMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-background/70 px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-display font-bold">{value}</dd>
    </div>
  );
}

function AlboStatusPanel() {
  const status = ALBO_OPERATIONAL_STATUS;
  const counts = status.counts;

  return (
    <section
      aria-labelledby="albo-pretorio-stato"
      className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="eyebrow text-primary">
            <Database className="h-3.5 w-3.5" aria-hidden="true" />
            Fonte operativa
          </span>
          <h2
            id="albo-pretorio-stato"
            className="mt-2 font-display text-2xl font-bold"
          >
            Albo Pretorio — stato fonte
          </h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-foreground">Fonte</dt>
              <dd className="mt-1 text-muted-foreground">{status.source}</dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Ultimo aggiornamento</dt>
              <dd className="mt-1 text-muted-foreground">
                {formatDateTime(status.last_update)}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Verifica</dt>
              <dd className="mt-1 text-muted-foreground">
                {ALBO_VERIFICATION_LABELS[status.verification_status]}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Metodo</dt>
              <dd className="mt-1 text-muted-foreground">
                {status.method ?? "In attesa della prima esecuzione"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Prossimo controllo</dt>
              <dd className="mt-1 text-muted-foreground">
                {formatDateTime(status.next_scheduled_check)}
              </dd>
            </div>
          </dl>
        </div>
        <a
          href={status.source_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-primary hover:bg-muted"
        >
          Fonte ufficiale
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AlboMetric label="Acquisiti" value={counts.acquired} />
        <AlboMetric label="Nuovi" value={counts.new} />
        <AlboMetric label="Modificati" value={counts.changed} />
        <AlboMetric label="Rimossi" value={counts.removed} />
        <AlboMetric label="Pubblicabili" value={counts.publishable} />
        <AlboMetric label="Minimizzati" value={counts.minimised} />
        <AlboMetric label="Solo metadato" value={counts.metadata_only} />
        <AlboMetric label="Esclusi" value={counts.excluded} />
      </dl>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <h3 className="font-display text-lg font-bold">Limiti noti</h3>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
            {status.known_limits.map((limit) => (
              <li key={limit}>{limit}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
          <h3 className="font-display text-lg font-bold">Nota pubblica</h3>
          <p className="mt-3 text-sm leading-relaxed">
            {status.official_albo_disclaimer}
          </p>
          {status.warnings.length > 0 ? (
            <p className="mt-3 text-sm leading-relaxed">
              {status.warnings[0]}
            </p>
          ) : null}
        </div>
      </div>
    </section>
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
        <div className="grid gap-1">
          <dt className="font-semibold text-foreground">Evidenza disponibile</dt>
          <dd className="text-muted-foreground">{source.metricLabel}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {source.evidenceLabel}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {source.cautionNote}
      </p>
      <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
        <Link
          href={source.route}
          className="text-primary underline underline-offset-4 hover:text-primary/80"
        >
          Apri nella piattaforma
        </Link>
        <a
          href={source.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-primary underline underline-offset-4 hover:text-primary/80"
        >
          Fonte
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

export function StatoMonitoraggio() {
  const payload = SOURCE_HEALTH;
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
          Una vista verificabile sulle evidenze dati realmente integrate nella
          piattaforma: acquisizioni, snapshot versionati, copertura documentata,
          freschezza e limiti. Gli stati descrivono il monitor, non l'operato
          dell'ente e non certificano la completezza assoluta delle fonti esterne.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Registro costruito da manifesti e snapshot versionati. Ultima evidenza
          integrata:{" "}
          <strong className="font-semibold text-foreground">
            {formatDateTime(payload.generatedAt)}
          </strong>
          .
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
          label="Fonti integrate"
          value={String(payload.sources.length)}
          detail="Acquisizioni e dataset collegati a un'evidenza versionata, una fonte e un percorso pubblico."
          icon={Database}
        />
        <SummaryCard
          label="Copertura operativa"
          value={`${payload.coverageScore}%`}
          detail="Quota media di record o unità territoriali documentate nei manifesti integrati."
          icon={BarChart3}
        />
        <SummaryCard
          label="Freschezza controlli"
          value={`${payload.freshnessScore}%`}
          detail="Indicatore tecnico derivato dal timestamp dell'evidenza e dalla cadenza attesa per ciascun flusso."
          icon={Clock3}
        />
        <SummaryCard
          label="Da verificare"
          value={String(needsReview)}
          detail="Flussi con copertura parziale, avvisi, evidenza oltre soglia o controlli non disponibili."
          icon={ShieldCheck}
        />
      </section>

      <AlboStatusPanel />

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
              La tabella espone tipo, priorità, stato, timestamp dell'evidenza,
              aggiornamento della fonte, copertura documentata e limiti. Su
              schermi piccoli gli stessi dati sono presentati come schede compatte.
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
                <th scope="col" className="px-4 py-3 font-bold">Copertura documentata</th>
                <th scope="col" className="px-4 py-3 font-bold">Evidenza e limiti</th>
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
                    <span className="mt-1 block text-xs font-medium leading-relaxed text-muted-foreground">
                      {source.metricLabel}
                    </span>
                  </td>
                  <td className="max-w-sm px-4 py-4 leading-relaxed text-muted-foreground">
                    <p>{source.evidenceLabel}</p>
                    <p className="mt-2">{source.cautionNote}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold">
                      <Link
                        href={source.route}
                        className="text-primary underline underline-offset-4 hover:text-primary/80"
                      >
                        Apri nella piattaforma
                      </Link>
                      <a
                        href={source.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary underline underline-offset-4 hover:text-primary/80"
                      >
                        Fonte
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </div>
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
