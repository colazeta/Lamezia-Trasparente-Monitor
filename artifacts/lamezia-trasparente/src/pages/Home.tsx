import { Link } from "wouter";
import { ArrowRight, Calendar, Landmark, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageMeta } from "@/components/seo/PageMeta";
import { ALBO_OPERATIONAL_STATUS } from "@/data/alboStatus";
import { councilSessionV0ReviewedRecords } from "@/data/councilSessionV0Reviewed";
import { councilSessionV0StatusLabels } from "@/data/councilSessionV0";

export const HOME_PRIMARY_GATEWAYS = [
  {
    title: "Sedute e decisioni",
    question: "Di cosa si discute in Comune?",
    description:
      "Consiglio e commissioni: argomenti, documenti e video disponibili.",
    href: "/convocazioni",
    icon: Calendar,
  },
  {
    title: "Spesa pubblica",
    question: "Come vengono spesi i soldi?",
    description:
      "Contratti, affidamenti e fornitori, con le fonti da consultare.",
    href: "/contratti",
    icon: Landmark,
  },
  {
    title: "Amministratori",
    question: "Chi amministra la città?",
    description: "Sindaco, Giunta, Consiglio e commissioni: persone e ruoli.",
    href: "/organi",
    icon: Users,
  },
] as const;

const OTHER_TOPICS = [
  ["Atti e documenti del Comune", "/albo"],
  ["Progetti PNRR", "/pnrr"],
  ["Mappe del territorio", "/atlante-territoriale"],
  ["Legalità e memoria", "/legalita"],
  ["Dati da consultare e scaricare", "/opendata"],
  ["Proposte dei cittadini", "/proposte-civiche"],
  ["Come chiedere un documento", "/accesso-civico"],
  ["Guida al sito", "/guida"],
] as const;

export function openGlobalSearch() {
  document.dispatchEvent(
    new KeyboardEvent("keydown", { key: "/", bubbles: true }),
  );
}

function formatSessionDate(value: string | null) {
  if (!value) return "Data da verificare";
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(dateOnly ? `${value}T00:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return "Data da verificare";
  return new Intl.DateTimeFormat("it-IT", {
    timeZone: dateOnly ? "UTC" : "Europe/Rome",
    dateStyle: "long",
    ...(dateOnly ? {} : { timeStyle: "short" as const }),
  }).format(date);
}

export function Home() {
  const lastCheck = ALBO_OPERATIONAL_STATUS.last_update;
  const parsedCheck = Date.parse(lastCheck ?? "");
  const stale =
    !Number.isFinite(parsedCheck) ||
    Date.now() - parsedCheck > 24 * 60 * 60 * 1000;
  return (
    <div className="civic-service-home mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 md:py-14">
      <PageMeta
        title="Lamezia Trasparente — orientarsi tra decisioni, spesa e amministratori"
        description="Cerca un argomento o scegli tra sedute del Comune, spesa pubblica e amministratori. Documenti e fonti per capire la città."
        path="/"
      />
      <section data-tour="home-hero" aria-labelledby="home-title">
        <h1
          id="home-title"
          className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
        >
          Cosa vuoi sapere su Lamezia?
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-7 text-muted-foreground sm:text-xl">
          Informazioni su decisioni, spesa e persone del Comune.
        </p>
        <Button
          onClick={openGlobalSearch}
          variant="outline"
          className="civic-service-search mt-7 h-auto w-full justify-start gap-3 whitespace-normal rounded-md border-2 border-primary px-5 py-4 text-left text-lg font-normal shadow-none sm:text-xl"
          aria-keyshortcuts="Control+K Meta+K"
        >
          <Search
            className="h-5 w-5 shrink-0 text-primary"
            aria-hidden="true"
          />
          Cerca un argomento o una persona
        </Button>
        <p className="mt-2 text-sm text-muted-foreground">
          Per esempio: Scordovillo, bilancio, il nome di un consigliere.
        </p>
      </section>

      <section
        data-tour="home-themes"
        aria-labelledby="home-choices"
        className="mt-12"
      >
        <h2 id="home-choices" className="sr-only">
          Oppure scegli da dove partire
        </h2>
        <div className="civic-service-paths grid gap-6 md:grid-cols-3 md:gap-0">
          {HOME_PRIMARY_GATEWAYS.map(
            ({ title, question, description, href }) => (
              <Link
                key={href}
                href={href}
                className="group py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:px-7 md:first:pl-0 md:last:pr-0"
              >
                <h3 className="font-display text-lg font-bold sm:text-xl">
                  {question}
                </h3>
                <p className="sr-only">{description}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  {title}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            ),
          )}
        </div>
      </section>

      <HomeInstitutionalSessions />

      <details className="civic-service-disclosure mt-9 border-y border-border py-4">
        <summary className="cursor-pointer rounded font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          Altri argomenti e strumenti
        </summary>
        <ul className="mt-4 grid gap-1 sm:grid-cols-2">
          {OTHER_TOPICS.map(([label, href]) => (
            <li key={href}>
              <Link
                href={href}
                className="block rounded px-2 py-3 text-sm text-primary hover:bg-primary/5 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </details>

      <details className="civic-service-disclosure border-b border-border py-4">
        <summary className="cursor-pointer rounded text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          Da dove arrivano le informazioni?
        </summary>
        <div className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
          <p>
            Le schede collegano documenti ufficiali e, quando indicato, articoli
            e video. Una notizia non conferma da sola una decisione del Comune.
          </p>
          <p>
            La copertura è parziale: se non trovi qualcosa, non significa che
            non esista.
          </p>
          <p>
            {stale
              ? "L’archivio Albo non ha un controllo confermato nelle ultime 24 ore."
              : "L’archivio Albo ha un controllo confermato nelle ultime 24 ore."}{" "}
            Ultimo controllo:{" "}
            {Number.isFinite(parsedCheck)
              ? formatSessionDate(lastCheck)
              : "non disponibile"}
            .
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            <Link
              href="/fonti-dati"
              className="font-semibold text-primary hover:underline"
            >
              Consulta le fonti
            </Link>
            <Link
              href="/stato-monitoraggio"
              className="font-semibold text-primary hover:underline"
            >
              Controlla gli aggiornamenti
            </Link>
            <Link
              href="/metodologia"
              className="font-semibold text-primary hover:underline"
            >
              Come lavoriamo
            </Link>
          </div>
        </div>
      </details>
    </div>
  );
}

export function HomeInstitutionalSessions() {
  // Keep the existing curated order within each group. These are archive
  // examples, not a calendar of the next meetings or a completeness claim.
  const records = councilSessionV0ReviewedRecords.filter(
    (session) => !session.isDemoFixture,
  );
  const selection = [
    records.find(
      (session) => session.kind === "council" && session.scheduledAt.value,
    ),
    records.find(
      (session) => session.kind === "council" && !session.scheduledAt.value,
    ),
    records.find(
      (session) => session.kind === "commission" && session.scheduledAt.value,
    ),
  ].filter((session) => session !== undefined);

  return (
    <section aria-labelledby="home-sessions" className="mt-12">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2
          id="home-sessions"
          className="font-display text-2xl font-bold sm:text-3xl"
        >
          Dall’archivio delle sedute
        </h2>
        <Link
          href="/convocazioni"
          className="text-sm font-semibold text-primary hover:underline"
        >
          Vedi tutte le sedute
        </Link>
      </div>
      <p className="sr-only">
        Tre schede per iniziare. Gli stati indicati distinguono ciò che è
        confermato da ciò che resta da verificare.
      </p>
      <ul className="mt-4 divide-y divide-border border-y border-border">
        {selection.map((session) => (
          <li key={session.id}>
            <Link
              href={`/convocazioni/${session.id}`}
              className="civic-service-session group grid gap-2 py-4 transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:grid-cols-[1.15fr_1fr] md:gap-x-8"
            >
              <h3 className="text-base font-semibold leading-6 group-hover:text-primary">
                {session.title.value ?? "Seduta senza titolo"}
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">
                {formatSessionDate(session.scheduledAt.value)} ·{" "}
                {
                  councilSessionV0StatusLabels[
                    session.sessionStatus.value ?? "non_verificata"
                  ]
                }
              </p>
              {!session.provenance && (
                <p className="text-xs text-muted-foreground md:col-start-2">
                  Solo fonti editoriali; convocazione ufficiale non acquisita.
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Selezione dall’archivio, non calendario delle prossime sedute. Fonti e
        limiti sono disponibili in ogni scheda.
      </p>
    </section>
  );
}
