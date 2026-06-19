import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Archive,
  ExternalLink,
  FileText,
  Filter,
  Landmark,
  Lightbulb,
  RefreshCw,
  SearchCheck,
} from "lucide-react";

import { CivicPracticeCard } from "@/components/civic-practices/CivicPracticeCard";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageMeta } from "@/components/seo/PageMeta";
import { CIVIC_PRACTICES } from "@/data/civicPractices";
import {
  PUBLIC_PROPOSALS,
  PROPOSAL_CHANNEL_LABELS,
  PROPOSAL_CHANNELS,
  PROPOSAL_EVIDENCE_LABELS,
  PROPOSAL_PROMOTER_TYPE_LABELS,
  PROPOSAL_STATUS_LABELS,
  PROPOSAL_STATUSES,
  filterPublicProposals,
  getProposalPromoters,
  getProposalThemes,
  getProposalYears,
  type ProposalChannel,
  type ProposalStatus,
} from "@/data/propostePubbliche";

const ALL = "all";

type SelectFilter<T extends string> = typeof ALL | T;

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

export function PropostePubbliche() {
  const [theme, setTheme] = useState(ALL);
  const [promoter, setPromoter] = useState(ALL);
  const [year, setYear] = useState(ALL);
  const [status, setStatus] = useState<SelectFilter<ProposalStatus>>(ALL);
  const [channel, setChannel] = useState<SelectFilter<ProposalChannel>>(ALL);

  const themes = useMemo(() => getProposalThemes(), []);
  const promoters = useMemo(() => getProposalPromoters(), []);
  const years = useMemo(() => getProposalYears(), []);

  const filteredProposals = useMemo(
    () =>
      filterPublicProposals(PUBLIC_PROPOSALS, {
        theme: theme === ALL ? undefined : theme,
        promoter: promoter === ALL ? undefined : promoter,
        year: year === ALL ? undefined : year,
        status: status === ALL ? undefined : status,
        channel: channel === ALL ? undefined : channel,
      }),
    [channel, promoter, status, theme, year],
  );

  const resetFilters = () => {
    setTheme(ALL);
    setPromoter(ALL);
    setYear(ALL);
    setStatus(ALL);
    setChannel(ALL);
  };

  return (
    <>
      <PageMeta
        title="Archivio delle proposte pubbliche"
        description="Archivio documentale e metodologicamente neutro delle proposte di valore pubblico censite come memoria civica verificabile, senza endorsement politico."
        path="/archivio-proposte"
      />
      <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
        <header className="space-y-6">
          <span className="eyebrow text-primary">
            <Archive className="h-3.5 w-3.5" aria-hidden="true" />
            Memoria civica verificabile
          </span>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                Archivio delle proposte pubbliche
              </h1>
              <p className="mt-3 max-w-3xl text-lg leading-relaxed text-muted-foreground">
                Una sezione data-driven per raccogliere proposte di interesse pubblico
                e pratiche replicabili in modo ordinato, consultabile e prudente.
                La presenza in questo archivio indica rilevanza civica e
                verificabilità documentale, non adesione politica o valutazione di
                merito.
              </p>
            </div>
            <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
              <div className="flex gap-3">
                <AlertTriangle
                  className="mt-0.5 h-5 w-5 shrink-0"
                  aria-hidden="true"
                />
                <p className="text-sm leading-relaxed">
                  Archivio documentale, non endorsement: ogni scheda va letta con
                  fonti, limiti e stato dichiarato. I casi osservati altrove
                  servono a generare domande civiche, non confronti accusatori.
                </p>
              </div>
            </aside>
          </div>
        </header>

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
              title: "Criterio di inclusione",
              text: "Sono censite proposte e pratiche con valore pubblico: trasparenza, servizi, beni comuni, partecipazione, accessibilità o gestione delle risorse collettive.",
            },
            {
              icon: FileText,
              title: "Fonti e limiti",
              text: "La versione pubblica usa manifest tipizzati locali. Fonti social, screenshot o stampa servono solo allo scouting finché non sono riscontrate da fonti primarie.",
            },
            {
              icon: Landmark,
              title: "Lettura neutra",
              text: "Stato, canale, destinatario e replicabilità descrivono il percorso documentale noto; non implicano responsabilità, recepimento o giudizi politici.",
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

        <section className="mt-8" aria-labelledby="pratiche-replicabili">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow text-primary">
                <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
                Soluzioni osservate altrove
              </span>
              <h2
                id="pratiche-replicabili"
                className="mt-2 font-display text-2xl font-bold"
              >
                Pratiche replicabili
              </h2>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Casi civici osservati in comuni vicini o comparabili. Ogni scheda
                distingue pratica, problema, fonte, condizioni minime e domande
                per Lamezia, senza trasformare l'esempio in accusa o benchmark
                automatico.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-5">
            {CIVIC_PRACTICES.map((practice) => (
              <CivicPracticeCard key={practice.id} practice={practice} />
            ))}
          </div>
        </section>

        <section
          aria-labelledby="filtri-proposte"
          className="mt-8 rounded-2xl border border-border bg-card p-4 shadow-sm"
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 id="filtri-proposte" className="font-display text-xl font-bold">
                Filtri proposte
              </h2>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetFilters}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Reimposta
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-5">
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
          <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
            {filteredProposals.length} proposte visualizzate su {PUBLIC_PROPOSALS.length} record seed.
          </p>
        </section>

        <section className="mt-8" aria-labelledby="lista-proposte">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="lista-proposte" className="font-display text-2xl font-bold">
                Proposte censite
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Schede ordinate come memoria documentale. Eventuali collegamenti
                ad atti comunali saranno aggiunti solo quando verificati.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-5">
            {filteredProposals.map((proposal) => (
              <article
                key={proposal.id}
                className="rounded-3xl border border-border bg-card p-5 shadow-sm"
                aria-labelledby={`${proposal.id}-title`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="mb-3 flex flex-wrap gap-2">
                      <Badge variant={statusBadgeVariant(proposal.status)}>
                        {PROPOSAL_STATUS_LABELS[proposal.status]}
                      </Badge>
                      <Badge variant="outline">
                        {PROPOSAL_CHANNEL_LABELS[proposal.channel]}
                      </Badge>
                      <Badge variant="secondary">{proposal.theme}</Badge>
                    </div>
                    <h3
                      id={`${proposal.id}-title`}
                      className="font-display text-xl font-semibold tracking-tight"
                    >
                      {proposal.title}
                    </h3>
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                      {proposal.summary}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-muted/30 p-3 text-sm md:min-w-56">
                    <p className="font-semibold text-foreground">Promotore</p>
                    <p className="mt-1 text-muted-foreground">
                      {proposal.promoter}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {PROPOSAL_PROMOTER_TYPE_LABELS[proposal.promoterType]}
                    </p>
                  </div>
                </div>

                <dl className="mt-5 grid gap-4 text-sm md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <dt className="font-semibold text-foreground">Data / anno</dt>
                    <dd className="mt-1 leading-relaxed text-muted-foreground">
                      {proposal.periodLabel}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">Destinatario</dt>
                    <dd className="mt-1 leading-relaxed text-muted-foreground">
                      {proposal.institutionalRecipient ?? "Non indicato"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">Fonte</dt>
                    <dd className="mt-1 leading-relaxed text-muted-foreground">
                      {proposal.sourceUrl ? (
                        <a
                          href={proposal.sourceUrl}
                          className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {proposal.sourceLabel}
                          <ExternalLink
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                        </a>
                      ) : (
                        proposal.sourceLabel
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">Livello di evidenza</dt>
                    <dd className="mt-1 leading-relaxed text-muted-foreground">
                      {PROPOSAL_EVIDENCE_LABELS[proposal.evidenceLevel]}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">Atti collegati</dt>
                    <dd className="mt-1 leading-relaxed text-muted-foreground">
                      {proposal.linkedActs.length > 0
                        ? proposal.linkedActs.join(", ")
                        : "Nessun atto collegato nella versione pubblica"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">Ultimo aggiornamento</dt>
                    <dd className="mt-1 leading-relaxed text-muted-foreground">
                      {proposal.lastUpdated}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Nota di verifica redazionale
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {proposal.verificationNote}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
