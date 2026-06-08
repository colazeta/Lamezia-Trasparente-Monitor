import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  AlertTriangle,
  BookOpenCheck,
  ExternalLink,
  FileCheck2,
  FileText,
  Filter,
  GanttChartSquare,
  HelpCircle,
  Link2,
  SearchCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageMeta } from "@/components/seo/PageMeta";
import {
  DOCUMENTARY_LEVELS,
  IMPLEMENTATION_STATUSES,
  PROGRAMME_PROMISES,
  PROMISE_ACT_LINKS,
  PROMISE_AREAS,
  STATUS_DESCRIPTIONS,
  STATUS_LABELS,
  type ImplementationStatus,
  type ProgrammePromise,
  type PromiseArea,
} from "@/data/promessometro";

type AreaFilter = "all" | PromiseArea;
type StatusFilter = "all" | ImplementationStatus;
type LinkedActsFilter = "all" | "with" | "without";

const LINKED_ACT_FILTERS: { value: LinkedActsFilter; label: string }[] = [
  { value: "all", label: "Tutte" },
  { value: "with", label: "Con atti collegati" },
  { value: "without", label: "Senza atti collegati" },
];

function formatArea(area: PromiseArea) {
  return area.charAt(0).toLocaleUpperCase("it") + area.slice(1);
}

function countByStatus(promises: ProgrammePromise[], status: ImplementationStatus) {
  return promises.filter((promise) => promise.implementationStatus === status)
    .length;
}

function hasRealLinkedActs(promiseId: string) {
  return PROMISE_ACT_LINKS.some(
    (link) => link.promiseId === promiseId && !link.isPlaceholder,
  );
}

function linksForPromise(promiseId: string) {
  return PROMISE_ACT_LINKS.filter((link) => link.promiseId === promiseId);
}

export function Promessometro() {
  const [area, setArea] = useState<AreaFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [linkedActs, setLinkedActs] = useState<LinkedActsFilter>("all");

  const realPromises = useMemo(
    () => PROGRAMME_PROMISES.filter((promise) => !promise.isPlaceholder),
    [],
  );

  const visiblePromises = useMemo(() => {
    return PROGRAMME_PROMISES.filter((promise) => {
      const matchesArea = area === "all" || promise.area === area;
      const matchesStatus =
        status === "all" || promise.implementationStatus === status;
      const promiseHasActs = hasRealLinkedActs(promise.id);
      const matchesLinkedActs =
        linkedActs === "all" ||
        (linkedActs === "with" && promiseHasActs) ||
        (linkedActs === "without" && !promiseHasActs);

      return matchesArea && matchesStatus && matchesLinkedActs;
    });
  }, [area, linkedActs, status]);

  const realLinkedPromiseCount = realPromises.filter((promise) =>
    hasRealLinkedActs(promise.id),
  ).length;
  const realOnlyAddressActCount = realPromises.filter((promise) => {
    const links = linksForPromise(promise.id).filter((link) => !link.isPlaceholder);
    return (
      links.length > 0 &&
      links.every((link) => link.contributionType === "indirizzo politico")
    );
  }).length;

  const aggregates = [
    {
      label: "Promesse censite",
      value: realPromises.length,
      note: "Record reali con fonte programmatica verificata.",
    },
    {
      label: "Senza atti collegati",
      value: Math.max(realPromises.length - realLinkedPromiseCount, 0),
      note: "Assenza di atti nella base locale, non prova di mancata attività.",
    },
    {
      label: "Solo indirizzo",
      value: realOnlyAddressActCount,
      note: "Atto di indirizzo presente senza atto gestionale collegato.",
    },
    {
      label: "Finanziate",
      value: countByStatus(realPromises, "finanziata"),
      note: "Copertura o canale di finanziamento documentato.",
    },
    {
      label: "Completate documentate",
      value: countByStatus(realPromises, "completata"),
      note: "Realizzazione da verificare sempre sulla fonte.",
    },
    {
      label: "Non verificabili",
      value: countByStatus(realPromises, "non_verificabile"),
      note: "Fonti insufficienti per classificare l'avanzamento.",
    },
  ];

  return (
    <>
      <PageMeta
        title="Promessometro amministrativo"
        description="Modulo civico prudente per collegare promesse programmatiche, atti amministrativi e livelli documentali di avanzamento senza scoring politico."
        path="/promessometro"
      />
      <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
        <header className="mb-8 space-y-4">
          <span className="eyebrow text-primary">
            <BookOpenCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Programma sotto verifica
          </span>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                Promessometro amministrativo
              </h1>
              <p className="mt-3 max-w-3xl text-lg leading-relaxed text-muted-foreground">
                Una v0 descrittiva per mappare promesse programmatiche e atti
                amministrativi collegati. La pagina non assegna voti politici:
                distingue fonte della promessa, atto di indirizzo, atto
                attuativo/gestionale e realizzazione osservabile.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <p className="text-sm leading-relaxed">
                  Le classificazioni sono indicatori documentali. Una delibera o
                  un comunicato non dimostrano automaticamente attuazione,
                  completamento o responsabilità individuali.
                </p>
              </div>
            </div>
          </div>
        </header>

        <section aria-labelledby="indicatori-promessometro" className="mb-8">
          <h2 id="indicatori-promessometro" className="sr-only">
            Indicatori sintetici del Promessometro
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {aggregates.map((item) => (
              <Card key={item.label} className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-2 font-display text-3xl font-bold text-foreground">
                  {item.value}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {item.note}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section aria-labelledby="livelli-documentali" className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <GanttChartSquare className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 id="livelli-documentali" className="font-display text-2xl font-bold">
              Quattro livelli da non confondere
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {DOCUMENTARY_LEVELS.map((level, index) => (
              <article key={level.title} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {index + 1}
                </div>
                <h3 className="mt-3 font-display text-base font-bold">
                  {level.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {level.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="filtri-promessometro" className="mb-6 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 id="filtri-promessometro" className="font-display text-xl font-bold">
              Filtri
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="space-y-1 text-sm font-semibold">
              Ambito
              <select
                value={area}
                onChange={(event) => setArea(event.target.value as AreaFilter)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal text-foreground"
              >
                <option value="all">Tutti gli ambiti</option>
                {PROMISE_AREAS.map((item) => (
                  <option key={item} value={item}>
                    {formatArea(item)}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm font-semibold">
              Stato
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as StatusFilter)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal text-foreground"
              >
                <option value="all">Tutti gli stati</option>
                {IMPLEMENTATION_STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {STATUS_LABELS[item]}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm font-semibold">
              Atti collegati
              <select
                value={linkedActs}
                onChange={(event) =>
                  setLinkedActs(event.target.value as LinkedActsFilter)
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal text-foreground"
              >
                {LINKED_ACT_FILTERS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section aria-labelledby="schede-promesse" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="schede-promesse" className="font-display text-2xl font-bold">
              Schede promessa
            </h2>
            <p className="text-sm text-muted-foreground">
              {visiblePromises.length} schede visibili, inclusi eventuali modelli
              non conteggiati.
            </p>
          </div>

          {visiblePromises.map((promise) => (
            <PromiseCard key={promise.id} promise={promise} />
          ))}
        </section>

        <section aria-labelledby="fonti-collegate" className="mt-8 rounded-2xl border border-border bg-muted/30 p-5">
          <div className="flex gap-3">
            <SearchCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <h2 id="fonti-collegate" className="font-display text-xl font-bold">
                Fonti da collegare nella fase successiva
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Per ogni promessa reale la redazione dovrà verificare programma
                elettorale o linee di mandato, poi collegare eventuali delibere,
                pubblicazioni dell'Albo, bandi, contratti, schede PNRR,
                Incarichimetro, criticità pubbliche e atti fondamentali. I link
                vanno classificati per funzione documentale, senza trasformare
                automaticamente una fonte in prova di completamento.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  ["Delibere", "/delibere"],
                  ["Albo", "/albo"],
                  ["Contratti", "/contratti"],
                  ["PNRR", "/pnrr"],
                  ["Incarichimetro", "/incarichimetro"],
                  ["Atti fondamentali", "/atti-fondamentali"],
                  ["Metodologia", "/metodologia"],
                  ["Fonti dati", "/fonti-dati"],
                ].map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function PromiseCard({ promise }: { promise: ProgrammePromise }) {
  const links = linksForPromise(promise.id);
  const statusDescription = STATUS_DESCRIPTIONS[promise.implementationStatus];

  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              {formatArea(promise.area)}
            </Badge>
            <Badge variant="outline">{STATUS_LABELS[promise.implementationStatus]}</Badge>
            {promise.isPlaceholder ? (
              <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-700 shadow-none dark:text-amber-300">
                Modello non conteggiato
              </Badge>
            ) : null}
          </div>
          <h3 className="font-display text-xl font-bold text-foreground">
            {promise.neutralTitle}
          </h3>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {promise.editorialSummary}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm md:w-64">
          <p className="font-semibold text-foreground">Ultima verifica</p>
          <p className="mt-1 text-muted-foreground">{promise.lastVerification}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
            <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
            Promessa dichiarata
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {promise.sourcePromiseSummary}
          </p>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="font-semibold text-foreground">Fonte promessa</dt>
              <dd className="mt-1 text-muted-foreground">{promise.sourceLabel}</dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Data fonte</dt>
              <dd className="mt-1 text-muted-foreground">{promise.sourceDate}</dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Mandato/amministrazione</dt>
              <dd className="mt-1 text-muted-foreground">{promise.mandateReference}</dd>
            </div>
            {promise.documentedPriority ? (
              <div>
                <dt className="font-semibold text-foreground">Priorità documentata</dt>
                <dd className="mt-1 text-muted-foreground">{promise.documentedPriority}</dd>
              </div>
            ) : null}
          </dl>
          <a
            href={promise.sourceLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary underline underline-offset-4"
          >
            Apri fonte o pagina istituzionale
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>

        <div className="rounded-xl border border-border bg-background p-4">
          <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
            <FileCheck2 className="h-4 w-4 text-primary" aria-hidden="true" />
            Stato documentale
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {statusDescription}
          </p>
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
            <div className="flex gap-2">
              <HelpCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p className="text-sm leading-relaxed">{promise.cautionNote}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="font-semibold text-foreground">
              Cosa manca per considerarla realizzazione osservabile
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {promise.missingForObservableImplementation}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-3 flex items-center gap-2 font-semibold text-foreground">
          <Link2 className="h-4 w-4 text-primary" aria-hidden="true" />
          Atti e fonti collegati
        </div>
        <div className="space-y-3">
          {links.map((link) => (
            <div key={`${link.promiseId}-${link.title}`} className="rounded-xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{link.actType}</Badge>
                <Badge variant="secondary">{link.contributionType}</Badge>
                {link.isPlaceholder ? (
                  <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-700 shadow-none dark:text-amber-300">
                    Esempio strutturale
                  </Badge>
                ) : null}
              </div>
              <h4 className="mt-2 font-display text-base font-bold">{link.title}</h4>
              <p className="mt-1 text-xs text-muted-foreground">Data atto: {link.date}</p>
              {link.internalId ? (
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  ID interno: {link.internalId}
                </p>
              ) : null}
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {link.technicalComment}
              </p>
              {link.externalUrl ? (
                <a
                  href={link.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary underline underline-offset-4"
                >
                  Apri collegamento
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ) : null}
            </div>
          ))}
          {links.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
              Nessun atto collegato nella base locale. Questa assenza indica un
              bisogno di verifica documentale, non una conclusione sulla mancata
              attuazione.
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
