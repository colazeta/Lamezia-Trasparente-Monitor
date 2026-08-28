import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Archive,
  CalendarDays,
  ExternalLink,
  FileText,
  Filter,
  History,
  Landmark,
  Layers3,
  Lightbulb,
  MapPinned,
  MapPin,
  RefreshCw,
  SearchCheck,
  UsersRound,
} from "lucide-react";

import { CivicPracticeCard } from "@/components/civic-practices/CivicPracticeCard";
import { ProposalMap } from "@/components/ProposalMap";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageMeta } from "@/components/seo/PageMeta";
import { CIVIC_PRACTICES } from "@/data/civicPractices";
import {
  PROPOSAL_GEO_AREA_LABELS,
  PROPOSAL_GEO_PRECISION_LABELS,
  PROPOSAL_GEO_SCOPE_LABELS,
  getProposalGeoAreas,
  getProposalGeography,
  proposalMatchesGeoArea,
  type ProposalGeoArea,
} from "@/data/proposalGeography";
import {
  PUBLIC_PROPOSALS,
  PROPOSAL_CHANNEL_LABELS,
  PROPOSAL_CHANNELS,
  PROPOSAL_EVIDENCE_LABELS,
  PROPOSAL_EVENT_LABELS,
  PROPOSAL_PROMOTER_TYPE_LABELS,
  PROPOSAL_STATUS_LABELS,
  PROPOSAL_STATUSES,
  filterPublicProposals,
  getLatestProposalEvents,
  getProposalPromoters,
  getProposalThemes,
  getProposalYears,
  groupProposalsByPromoter,
  groupProposalsByThread,
  type PublicProposal,
  type ProposalChannel,
  type ProposalStatus,
} from "@/data/propostePubbliche";

const ALL = "all";

type SelectFilter<T extends string> = typeof ALL | T;
type ArchiveView = "proposte" | "promotori" | "filoni";

function statusBadgeVariant(status: ProposalStatus) {
  switch (status) {
    case "presentata_formalmente":
    case "discussa":
      return "default";
    case "recepita_parzialmente":
    case "recepita_integralmente":
      return "secondary";
    case "non_verificabile":
    case "senza_seguito_noto":
      return "outline";
    default:
      return "secondary";
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function ProposalGeographyBlock({ proposal }: { proposal: PublicProposal }) {
  const geography = getProposalGeography(proposal.id);
  if (!geography) return null;

  return (
    <section className="mt-5 rounded-2xl border border-border bg-muted/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MapPinned className="h-4 w-4 text-primary" aria-hidden="true" />
            <p className="text-sm font-semibold text-foreground">
              Riferimento geografico
            </p>
            <Badge variant="outline">
              {PROPOSAL_GEO_SCOPE_LABELS[geography.scope]}
            </Badge>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {geography.label}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {geography.areas.map((area) => (
              <Badge key={area} variant="secondary">
                <MapPin className="mr-1 h-3 w-3" aria-hidden="true" />
                {PROPOSAL_GEO_AREA_LABELS[area]}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {geography.points.map((point) => (
          <div
            key={point.id}
            className="rounded-xl border border-border bg-background p-3"
          >
            <p className="text-xs font-semibold leading-relaxed text-foreground">
              {point.label}
            </p>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              {PROPOSAL_GEO_PRECISION_LABELS[point.precision]}
            </p>
            {point.sourceUrl ? (
              <a
                href={point.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary underline-offset-4 hover:underline"
              >
                Fonte geografica
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            ) : null}
          </div>
        ))}
      </div>

      {geography.note ? (
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {geography.note}
        </p>
      ) : null}
    </section>
  );
}

function ProposalCard({ proposal }: { proposal: PublicProposal }) {
  const orderedEvents = [...proposal.events].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const geography = getProposalGeography(proposal.id);

  return (
    <article
      className="rounded-3xl border border-border bg-card p-5 shadow-sm md:p-6"
      aria-labelledby={`${proposal.id}-title`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge variant={statusBadgeVariant(proposal.status)}>
              {PROPOSAL_STATUS_LABELS[proposal.status]}
            </Badge>
            <Badge variant="outline">
              {PROPOSAL_CHANNEL_LABELS[proposal.channel]}
            </Badge>
            <Badge variant="secondary">{proposal.theme}</Badge>
            {geography?.areas.map((area) => (
              <Badge key={area} variant="outline">
                <MapPin className="mr-1 h-3 w-3" aria-hidden="true" />
                {PROPOSAL_GEO_AREA_LABELS[area]}
              </Badge>
            ))}
          </div>
          <h3
            id={`${proposal.id}-title`}
            className="font-display text-xl font-semibold tracking-tight md:text-2xl"
          >
            {proposal.title}
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {proposal.summary}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              Prima evidenza {formatDate(proposal.firstSeen)}
            </span>
            {geography ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {geography.label}
              </span>
            ) : proposal.territorialArea ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {proposal.territorialArea}
              </span>
            ) : null}
          </div>
        </div>

        <aside className="rounded-2xl border border-border bg-muted/30 p-4 text-sm lg:w-72 lg:shrink-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Soggetto proponente
          </p>
          <p className="mt-1 font-semibold text-foreground">{proposal.promoter}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {PROPOSAL_PROMOTER_TYPE_LABELS[proposal.promoterType]}
          </p>
          {proposal.coPromoters?.length ? (
            <div className="mt-3 border-t border-border pt-3">
              <p className="text-xs font-semibold text-foreground">
                Altri soggetti citati nelle fonti
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {proposal.coPromoters.join(", ")}
              </p>
            </div>
          ) : null}
        </aside>
      </div>

      <ProposalGeographyBlock proposal={proposal} />

      <dl className="mt-6 grid gap-4 text-sm md:grid-cols-2 xl:grid-cols-4">
        <div>
          <dt className="font-semibold text-foreground">Filone</dt>
          <dd className="mt-1 leading-relaxed text-muted-foreground">
            {proposal.threadLabel}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-foreground">Destinatario</dt>
          <dd className="mt-1 leading-relaxed text-muted-foreground">
            {proposal.institutionalRecipient ?? "Non indicato"}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-foreground">Evidenza</dt>
          <dd className="mt-1 leading-relaxed text-muted-foreground">
            {PROPOSAL_EVIDENCE_LABELS[proposal.evidenceLevel]}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-foreground">Ultimo sviluppo censito</dt>
          <dd className="mt-1 leading-relaxed text-muted-foreground">
            {formatDate(proposal.lastUpdated)}
          </dd>
        </div>
      </dl>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" aria-hidden="true" />
            <p className="text-sm font-semibold text-foreground">
              Storia della proposta
            </p>
          </div>
          <ol className="mt-4 space-y-4 border-l border-border pl-4">
            {orderedEvents.map((event) => (
              <li key={event.id} className="relative">
                <span
                  className="absolute -left-[1.31rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary"
                  aria-hidden="true"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {formatDate(event.date)}
                  </span>
                  <Badge variant="outline">
                    {PROPOSAL_EVENT_LABELS[event.type]}
                  </Badge>
                </div>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {event.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {event.summary}
                </p>
                {event.sourceUrl ? (
                  <a
                    href={event.sourceUrl}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-4 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {event.sourceLabel}
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {event.sourceLabel}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Fonte principale
            </p>
            {proposal.sourceUrl ? (
              <a
                href={proposal.sourceUrl}
                className="mt-2 inline-flex items-start gap-1 text-sm font-semibold leading-relaxed text-primary underline-offset-4 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                {proposal.sourceLabel}
                <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              </a>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                {proposal.sourceLabel}
              </p>
            )}
          </div>

          {proposal.linkedActs.length > 0 ? (
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Atti collegati
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {proposal.linkedActs.map((act) => (
                  <li key={act}>{act}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <details className="mt-5 rounded-2xl border border-border bg-muted/20 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-foreground">
          Nota di verifica redazionale
        </summary>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {proposal.verificationNote}
        </p>
      </details>
    </article>
  );
}

export function PropostePubbliche() {
  const [theme, setTheme] = useState(ALL);
  const [promoter, setPromoter] = useState(ALL);
  const [year, setYear] = useState(ALL);
  const [status, setStatus] = useState<SelectFilter<ProposalStatus>>(ALL);
  const [channel, setChannel] = useState<SelectFilter<ProposalChannel>>(ALL);
  const [geoArea, setGeoArea] = useState<SelectFilter<ProposalGeoArea>>(ALL);
  const [view, setView] = useState<ArchiveView>("proposte");

  const themes = useMemo(() => getProposalThemes(), []);
  const promoters = useMemo(() => getProposalPromoters(), []);
  const years = useMemo(() => getProposalYears(), []);
  const geoAreas = useMemo(() => getProposalGeoAreas(), []);

  const filteredProposals = useMemo(() => {
    const filtered = filterPublicProposals(PUBLIC_PROPOSALS, {
      theme: theme === ALL ? undefined : theme,
      promoter: promoter === ALL ? undefined : promoter,
      year: year === ALL ? undefined : year,
      status: status === ALL ? undefined : status,
      channel: channel === ALL ? undefined : channel,
    });

    if (geoArea === ALL) return filtered;
    return filtered.filter((proposal) =>
      proposalMatchesGeoArea(proposal.id, geoArea),
    );
  }, [channel, geoArea, promoter, status, theme, year]);

  const promoterGroups = useMemo(
    () => groupProposalsByPromoter(filteredProposals),
    [filteredProposals],
  );
  const threadGroups = useMemo(
    () => groupProposalsByThread(filteredProposals),
    [filteredProposals],
  );
  const latestEvents = useMemo(
    () =>
      getLatestProposalEvents(
        PUBLIC_PROPOSALS.filter(
          (proposal) => proposal.evidenceLevel !== "fonte_interna_documentale",
        ),
        5,
      ),
    [],
  );

  const externalProposals = PUBLIC_PROPOSALS.filter(
    (proposal) => proposal.evidenceLevel !== "fonte_interna_documentale",
  );
  const promoterCount = new Set(
    PUBLIC_PROPOSALS.map((proposal) => proposal.promoterId),
  ).size;
  const threadCount = new Set(
    PUBLIC_PROPOSALS.map((proposal) => proposal.threadId),
  ).size;
  const geographicallySpecific = filteredProposals.filter(
    (proposal) => getProposalGeography(proposal.id)?.scope !== "citywide",
  ).length;
  const citywide = filteredProposals.filter(
    (proposal) => getProposalGeography(proposal.id)?.scope === "citywide",
  ).length;

  const resetFilters = () => {
    setTheme(ALL);
    setPromoter(ALL);
    setYear(ALL);
    setStatus(ALL);
    setChannel(ALL);
    setGeoArea(ALL);
  };

  return (
    <>
      <PageMeta
        title="Proposte civiche"
        description="Archivio verificabile delle proposte civiche rivolte a Lamezia Terme, organizzate per promotore, tema, geografia e sviluppo nel tempo, con fonti e stato documentale."
        path="/proposte-civiche"
      />
      <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
        <header className="space-y-6">
          <span className="eyebrow text-primary">
            <Archive className="h-3.5 w-3.5" aria-hidden="true" />
            Archivio civico evolutivo e territoriale
          </span>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                Proposte civiche
              </h1>
              <p className="mt-3 max-w-3xl text-lg leading-relaxed text-muted-foreground">
                La memoria verificabile delle idee, petizioni, mozioni e richieste
                rivolte alla città. Ogni proposta conserva promotore, fonti,
                sviluppi e ora anche una referenziazione geografica esplicita, così
                da poter leggere nel tempo non solo che cosa viene proposto, ma
                anche dove si concentra l'iniziativa civica.
              </p>
            </div>
            <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
              <div className="flex gap-3">
                <AlertTriangle
                  className="mt-0.5 h-5 w-5 shrink-0"
                  aria-hidden="true"
                />
                <p className="text-sm leading-relaxed">
                  Coordinate e tag territoriali descrivono il riferimento geografico
                  della proposta. I centroidi e i riferimenti stradali approssimati
                  sono dichiarati come tali e non vanno interpretati come localizzazioni
                  catastali o perimetri amministrativi esatti.
                </p>
              </div>
            </aside>
          </div>
        </header>

        <section
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Sintesi archivio"
        >
          {[
            {
              label: "Proposte censite",
              value: PUBLIC_PROPOSALS.length,
              note: `${externalProposals.length} con fonti pubbliche esterne`,
              icon: FileText,
            },
            {
              label: "Soggetti proponenti",
              value: promoterCount,
              note: "normalizzati per evitare duplicati",
              icon: UsersRound,
            },
            {
              label: "Filoni civici",
              value: threadCount,
              note: "per seguire temi che evolvono nel tempo",
              icon: Layers3,
            },
            {
              label: "Copertura geografica",
              value: PUBLIC_PROPOSALS.length,
              note: "ogni proposta ha tag e coordinate di riferimento",
              icon: MapPinned,
            },
          ].map((item) => (
            <Card key={item.label} className="p-5">
              <item.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
                {item.value}
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {item.label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {item.note}
              </p>
            </Card>
          ))}
        </section>

        <section className="mt-8" aria-labelledby="ultimi-sviluppi-proposte">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2
              id="ultimi-sviluppi-proposte"
              className="font-display text-2xl font-bold"
            >
              Ultimi sviluppi
            </h2>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            La timeline trasversale rende visibile quando una proposta viene
            depositata, calendarizzata, discussa, riceve una risposta o viene
            recepita. Lo storico precedente non viene sovrascritto.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {latestEvents.map(
              ({ proposalId, proposalTitle, promoter: eventPromoter, event }) => (
                <Card key={`${proposalId}-${event.id}`} className="p-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold">{formatDate(event.date)}</span>
                    <Badge variant="outline">
                      {PROPOSAL_EVENT_LABELS[event.type]}
                    </Badge>
                  </div>
                  <p className="mt-2 font-semibold text-foreground">
                    {event.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {proposalTitle}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Promotore: {eventPromoter}
                  </p>
                  {event.sourceUrl ? (
                    <a
                      href={event.sourceUrl}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-4 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Apri la fonte
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  ) : null}
                </Card>
              ),
            )}
          </div>
        </section>

        <section
          className="mt-8 grid gap-4 md:grid-cols-3"
          aria-labelledby="criteri-archivio-proposte"
        >
          <h2 id="criteri-archivio-proposte" className="sr-only">
            Criteri editoriali dell'archivio
          </h2>
          {[
            {
              icon: SearchCheck,
              title: "Una proposta, una storia",
              text: "Un nuovo articolo sullo stesso oggetto non crea un nuovo record: viene aggiunto come evento, salvo che cambi sostanzialmente contenuto o promotore.",
            },
            {
              icon: MapPinned,
              title: "Geografia con precisione dichiarata",
              text: "Luoghi puntuali, aree, più sedi e proposte cittadine sono distinti. Coordinate approssimate e centroidi restano esplicitamente qualificati.",
            },
            {
              icon: Landmark,
              title: "Stato documentale, non politico",
              text: "Emersa, depositata, discussa o recepita descrivono solo il percorso verificabile. Una risposta pubblica non viene confusa con un recepimento formale.",
            },
          ].map((item) => (
            <Card key={item.title} className="p-5">
              <item.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="mt-3 font-display text-lg font-semibold">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.text}
              </p>
            </Card>
          ))}
        </section>

        <section
          aria-labelledby="filtri-proposte"
          className="mt-8 rounded-2xl border border-border bg-card p-4 shadow-sm"
        >
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 id="filtri-proposte" className="font-display text-xl font-bold">
                Esplora l'archivio
              </h2>
            </div>
            <div
              className="flex flex-wrap gap-2"
              aria-label="Modalità di visualizzazione"
            >
              <Button
                type="button"
                variant={view === "proposte" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("proposte")}
              >
                Proposte
              </Button>
              <Button
                type="button"
                variant={view === "promotori" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("promotori")}
              >
                Per promotore
              </Button>
              <Button
                type="button"
                variant={view === "filoni" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("filoni")}
              >
                Per filone
              </Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <label className="space-y-2 text-sm font-medium">
              Area geografica
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={geoArea}
                onChange={(event) =>
                  setGeoArea(event.target.value as SelectFilter<ProposalGeoArea>)
                }
              >
                <option value={ALL}>Tutte le aree</option>
                {geoAreas.map((item) => (
                  <option key={item} value={item}>
                    {PROPOSAL_GEO_AREA_LABELS[item]}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium">
              Tema
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={theme}
                onChange={(event) => setTheme(event.target.value)}
              >
                <option value={ALL}>Tutti i temi</option>
                {themes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium">
              Promotore
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={promoter}
                onChange={(event) => setPromoter(event.target.value)}
              >
                <option value={ALL}>Tutti i promotori</option>
                {promoters.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium">
              Anno
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={year}
                onChange={(event) => setYear(event.target.value)}
              >
                <option value={ALL}>Tutti gli anni</option>
                {years.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium">
              Stato
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as SelectFilter<ProposalStatus>)
                }
              >
                <option value={ALL}>Tutti gli stati</option>
                {PROPOSAL_STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {PROPOSAL_STATUS_LABELS[item]}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium">
              Canale
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={channel}
                onChange={(event) =>
                  setChannel(event.target.value as SelectFilter<ProposalChannel>)
                }
              >
                <option value={ALL}>Tutti i canali</option>
                {PROPOSAL_CHANNELS.map((item) => (
                  <option key={item} value={item}>
                    {PROPOSAL_CHANNEL_LABELS[item]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {filteredProposals.length} proposte visualizzate su {PUBLIC_PROPOSALS.length}.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetFilters}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Reimposta filtri
            </Button>
          </div>
        </section>

        <section className="mt-8" aria-labelledby="mappa-proposte">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <MapPinned className="h-5 w-5 text-primary" aria-hidden="true" />
                <h2 id="mappa-proposte" className="font-display text-2xl font-bold">
                  Geografia delle proposte
                </h2>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                La mappa segue gli stessi filtri dell'archivio. Mostra soltanto
                riferimenti territoriali puntuali o areali; le proposte che riguardano
                l'intera città restano nel conteggio ma non vengono trasformate in un
                falso punto geografico.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {geographicallySpecific} localizzate
              </Badge>
              <Badge variant="outline">{citywide} cittadine</Badge>
            </div>
          </div>
          <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-sm">
            <ProposalMap proposals={filteredProposals} />
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            I cerchi tratteggiati indicano riferimenti approssimati o centroidi di
            area. Le coordinate puntuali e la loro precisione sono riportate anche in
            ciascuna scheda.
          </p>
        </section>

        <section className="mt-8" aria-labelledby="archivio-proposte">
          <div>
            <h2 id="archivio-proposte" className="font-display text-2xl font-bold">
              Archivio
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              La vista per promotore ricompone tutte le iniziative attribuite allo
              stesso soggetto; la vista per filone collega proposte diverse che
              partecipano alla stessa evoluzione civica o istituzionale.
            </p>
          </div>

          {filteredProposals.length === 0 ? (
            <Card className="mt-5 p-6 text-center">
              <p className="font-semibold text-foreground">Nessun risultato</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Modifica o reimposta i filtri per ampliare la ricerca.
              </p>
            </Card>
          ) : null}

          {view === "proposte" ? (
            <div className="mt-5 grid gap-5">
              {[...filteredProposals]
                .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
                .map((proposal) => (
                  <ProposalCard key={proposal.id} proposal={proposal} />
                ))}
            </div>
          ) : null}

          {view === "promotori" ? (
            <div className="mt-5 space-y-8">
              {promoterGroups.map((group) => (
                <section key={group.promoterId} className="space-y-4">
                  <div className="flex flex-wrap items-baseline gap-3 border-b border-border pb-3">
                    <h3 className="font-display text-xl font-bold">
                      {group.promoter}
                    </h3>
                    <Badge variant="secondary">
                      {group.proposals.length}{" "}
                      {group.proposals.length === 1 ? "proposta" : "proposte"}
                    </Badge>
                  </div>
                  <div className="grid gap-5">
                    {[...group.proposals]
                      .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
                      .map((proposal) => (
                        <ProposalCard key={proposal.id} proposal={proposal} />
                      ))}
                  </div>
                </section>
              ))}
            </div>
          ) : null}

          {view === "filoni" ? (
            <div className="mt-5 space-y-8">
              {threadGroups.map((group) => (
                <section key={group.threadId} className="space-y-4">
                  <div className="border-b border-border pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Layers3 className="h-5 w-5 text-primary" aria-hidden="true" />
                      <h3 className="font-display text-xl font-bold">
                        {group.threadLabel}
                      </h3>
                      <Badge variant="secondary">
                        {group.proposals.length}{" "}
                        {group.proposals.length === 1 ? "proposta" : "proposte"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {
                        new Set(
                          group.proposals.map((proposal) => proposal.promoterId),
                        ).size
                      }{" "}
                      soggetti proponenti distinti
                    </p>
                  </div>
                  <div className="grid gap-5">
                    {[...group.proposals]
                      .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
                      .map((proposal) => (
                        <ProposalCard key={proposal.id} proposal={proposal} />
                      ))}
                  </div>
                </section>
              ))}
            </div>
          ) : null}
        </section>

        <section
          className="mt-12 border-t border-border pt-8"
          aria-labelledby="pratiche-replicabili"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow text-primary">
                <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
                Ispirazioni esterne
              </span>
              <h2
                id="pratiche-replicabili"
                className="mt-2 font-display text-2xl font-bold"
              >
                Pratiche replicabili
              </h2>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Questa sezione resta distinta dall'archivio locale: raccoglie casi
                osservati altrove che possono generare domande o idee per Lamezia,
                senza presentarli come proposte già formulate nel contesto cittadino.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-5">
            {CIVIC_PRACTICES.map((practice) => (
              <CivicPracticeCard key={practice.id} practice={practice} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
