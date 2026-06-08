import { Link } from "wouter";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleDotDashed,
} from "lucide-react";
import { PageMeta } from "@/components/seo/PageMeta";

import {
  ROADMAP_LIMIT_NOTES,
  ROADMAP_MODULES,
  ROADMAP_MODULES_NOTE,
  ROADMAP_READING_CRITERIA,
  ROADMAP_STATUS_SUMMARY,
  type RoadmapStatus,
} from "@/data/roadmap";

const STATUS_STYLES = {
  "pianificato":
    "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-200",
  "in sviluppo":
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200",
  "v0 disponibile":
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200",
  sperimentale:
    "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-200",
  "da validare":
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200",
} satisfies Record<RoadmapStatus, string>;

function StatusBadge({ status }: { status: RoadmapStatus }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold text-foreground [border-color:var(--badge-outline)] ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

export function Roadmap() {
  return (
    <>
      <PageMeta
        title="Roadmap pubblica"
        description="Stato prudente dei moduli di Lamezia Trasparente Monitor, con fonti, limiti e priorità senza promesse non verificate."
        path="/roadmap"
      />
      <div className="container mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <header className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            <CircleDotDashed className="h-3.5 w-3.5" aria-hidden="true" />
            Roadmap pubblica v0 · issue #42
          </div>
          <div className="max-w-3xl space-y-4">
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              Roadmap pubblica del monitor civico
            </h1>
            <p className="text-lg leading-8 text-muted-foreground">
              Questa pagina descrive lo stato dei moduli di Lamezia Trasparente
              Monitor con linguaggio prudente. Serve a distinguere ciò che è
              già consultabile, ciò che è sperimentale e ciò che richiede
              ulteriori verifiche, senza promettere date o copertura completa.
            </p>
          </div>
          <aside
            className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100"
            aria-labelledby="criterio-lettura-roadmap"
          >
            <div className="flex gap-3">
              <AlertTriangle
                className="mt-0.5 h-5 w-5 shrink-0"
                aria-hidden="true"
              />
              <div className="space-y-2">
                <h2
                  id="criterio-lettura-roadmap"
                  className="text-sm font-semibold"
                >
                  {ROADMAP_READING_CRITERIA.title}
                </h2>
                <p className="leading-6">
                  {ROADMAP_READING_CRITERIA.description}
                </p>
              </div>
            </div>
          </aside>
        </header>

        <section className="mt-10" aria-labelledby="stati-roadmap">
          <h2
            id="stati-roadmap"
            className="font-display text-2xl font-semibold tracking-tight"
          >
            Stati usati nella roadmap
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {ROADMAP_STATUS_SUMMARY.map((item, index) => (
              <article
                key={item.status}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm"
                aria-labelledby={`stato-roadmap-${index}`}
              >
                <h3
                  id={`stato-roadmap-${index}`}
                  className="flex items-center gap-2 text-base font-semibold"
                >
                  <StatusBadge status={item.status} />
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12" aria-labelledby="moduli-monitor">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2
                id="moduli-monitor"
                className="font-display text-2xl font-semibold tracking-tight"
              >
                Moduli inclusi in questa versione
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {ROADMAP_MODULES_NOTE}
              </p>
            </div>
            <Link
              href="/metodologia"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Leggi la metodologia
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {ROADMAP_MODULES.map((module, index) => (
              <article
                key={module.name}
                className="flex h-full flex-col rounded-3xl border border-border bg-card p-5 shadow-sm"
                aria-labelledby={`modulo-roadmap-${index}`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <h3
                    id={`modulo-roadmap-${index}`}
                    className="font-display text-xl font-semibold tracking-tight"
                  >
                    {module.name}
                  </h3>
                  <StatusBadge status={module.status} />
                </div>

                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {module.description}
                </p>

                <dl className="mt-5 grid gap-4 text-sm">
                  <div>
                    <dt className="font-semibold text-foreground">
                      Fonti dati previste o usate
                    </dt>
                    <dd className="mt-1 leading-6 text-muted-foreground">
                      {module.sources}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">
                      Limiti noti
                    </dt>
                    <dd className="mt-1 leading-6 text-muted-foreground">
                      {module.limits}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">
                      Priorità prudente
                    </dt>
                    <dd className="mt-1 leading-6 text-muted-foreground">
                      {module.priority}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 flex flex-wrap gap-2 pt-1">
                  {module.hrefs.map((link) => (
                    <Link
                      key={`${module.name}-${link.href}`}
                      href={link.href}
                      className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <CheckCircle2
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="mt-12 rounded-3xl border border-border bg-muted/30 p-5 md:p-6"
          aria-labelledby="limiti-roadmap"
        >
          <h2
            id="limiti-roadmap"
            className="font-display text-2xl font-semibold tracking-tight"
          >
            Limiti e moduli esclusi dalla roadmap v0
          </h2>
          <div className="mt-4 grid gap-4 text-sm leading-6 text-muted-foreground md:grid-cols-3">
            {ROADMAP_LIMIT_NOTES.map((note, index) => (
              <div key={note.title} aria-labelledby={`limite-roadmap-${index}`}>
                <h3
                  id={`limite-roadmap-${index}`}
                  className="font-semibold text-foreground"
                >
                  {note.title}
                </h3>
                <p className="mt-1">{note.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
