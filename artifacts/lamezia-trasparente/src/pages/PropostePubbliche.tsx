import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Archive,
  FileText,
  Filter,
  Landmark,
  Layers3,
  Lightbulb,
  MapPinned,
  RefreshCw,
  UsersRound,
} from "lucide-react";

import { CivicPracticeCard } from "@/components/civic-practices/CivicPracticeCard";
import { ProposalDossierCard } from "@/components/ProposalDossierCard";
import { ProposalMap } from "@/components/ProposalMap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageMeta } from "@/components/seo/PageMeta";
import { CIVIC_PRACTICES } from "@/data/civicPractices";
import {
  PROPOSAL_GEO_AREA_LABELS,
  getProposalLocalGeoAreas,
  isProposalGeoreferenced,
  proposalMatchesGeoArea,
  type ProposalGeoArea,
} from "@/data/proposalGeography";
import {
  PUBLIC_PROPOSALS,
  PROPOSAL_CHANNEL_LABELS,
  PROPOSAL_CHANNELS,
  PROPOSAL_STATUS_LABELS,
  PROPOSAL_STATUSES,
  filterPublicProposals,
  getProposalPromoters,
  getProposalThemes,
  getProposalYears,
  groupProposalsByPromoter,
  groupProposalsByThread,
  type ProposalChannel,
  type ProposalStatus,
} from "@/data/propostePubbliche";

const ALL = "all";

type SelectFilter<T extends string> = typeof ALL | T;
type ArchiveView = "proposte" | "promotori" | "filoni";
type GeoMode = "all" | "georeferenced" | "citywide";

function sortByLatestUpdate<T extends { lastUpdated: string }>(items: readonly T[]) {
  return [...items].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));
}

export function PropostePubbliche() {
  const [theme, setTheme] = useState(ALL);
  const [promoter, setPromoter] = useState(ALL);
  const [year, setYear] = useState(ALL);
  const [status, setStatus] = useState<SelectFilter<ProposalStatus>>(ALL);
  const [channel, setChannel] = useState<SelectFilter<ProposalChannel>>(ALL);
  const [geoArea, setGeoArea] = useState<SelectFilter<ProposalGeoArea>>(ALL);
  const [geoMode, setGeoMode] = useState<GeoMode>("all");
  const [view, setView] = useState<ArchiveView>("proposte");

  const themes = useMemo(() => getProposalThemes(), []);
  const promoters = useMemo(() => getProposalPromoters(), []);
  const years = useMemo(() => getProposalYears(), []);
  const geoAreas = useMemo(() => getProposalLocalGeoAreas(), []);

  const filteredProposals = useMemo(() => {
    let filtered = filterPublicProposals(PUBLIC_PROPOSALS, {
      theme: theme === ALL ? undefined : theme,
      promoter: promoter === ALL ? undefined : promoter,
      year: year === ALL ? undefined : year,
      status: status === ALL ? undefined : status,
      channel: channel === ALL ? undefined : channel,
    });

    if (geoMode === "georeferenced") {
      filtered = filtered.filter((proposal) => isProposalGeoreferenced(proposal.id));
    }
    if (geoMode === "citywide") {
      filtered = filtered.filter((proposal) => !isProposalGeoreferenced(proposal.id));
    }
    if (geoArea !== ALL) {
      filtered = filtered.filter(
        (proposal) =>
          isProposalGeoreferenced(proposal.id) &&
          proposalMatchesGeoArea(proposal.id, geoArea),
      );
    }

    return filtered;
  }, [channel, geoArea, geoMode, promoter, status, theme, year]);

  const promoterGroups = useMemo(
    () => groupProposalsByPromoter(filteredProposals),
    [filteredProposals],
  );
  const threadGroups = useMemo(
    () => groupProposalsByThread(filteredProposals),
    [filteredProposals],
  );

  const externalProposals = PUBLIC_PROPOSALS.filter(
    (proposal) => proposal.evidenceLevel !== "fonte_interna_documentale",
  );
  const promoterCount = new Set(
    PUBLIC_PROPOSALS.map((proposal) => proposal.promoterId),
  ).size;
  const georeferencedCount = PUBLIC_PROPOSALS.filter((proposal) =>
    isProposalGeoreferenced(proposal.id),
  ).length;
  const citywideCount = PUBLIC_PROPOSALS.length - georeferencedCount;
  const filteredGeoreferenced = filteredProposals.filter((proposal) =>
    isProposalGeoreferenced(proposal.id),
  );

  const resetFilters = () => {
    setTheme(ALL);
    setPromoter(ALL);
    setYear(ALL);
    setStatus(ALL);
    setChannel(ALL);
    setGeoArea(ALL);
    setGeoMode("all");
  };

  return (
    <>
      <PageMeta
        title="Proposte civiche"
        description="Archivio verificabile delle proposte civiche rivolte a Lamezia Terme, organizzate per promotore, tema, percorso documentale e, quando pertinente, riferimento geografico verificabile."
        path="/proposte-civiche"
      />

      <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
        <header>
          <span className="eyebrow text-primary">
            <Archive className="h-3.5 w-3.5" aria-hidden="true" />
            Archivio civico evolutivo
          </span>
          <div className="mt-3 grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                Proposte civiche
              </h1>
              <p className="mt-3 max-w-3xl text-lg leading-relaxed text-muted-foreground">
                Ogni proposta è trattata come un dossier unico: chi l’ha avanzata,
                che cosa chiede, a chi è rivolta, come si è evoluta, quali fonti e
                atti la documentano e — solo quando esiste un luogo pertinente — dove
                si colloca sul territorio.
              </p>
            </div>
            <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <p className="text-sm leading-relaxed">
                  <strong>Georeferenziata</strong> significa che la proposta riguarda
                  un luogo o un’area identificabile. Una proposta che riguarda
                  genericamente tutta Lamezia è invece <strong>non georeferenziata</strong>:
                  non le vengono assegnate coordinate artificiali.
                </p>
              </div>
            </aside>
          </div>

          <details className="mt-5 rounded-xl border border-border bg-muted/15 px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold text-foreground">
              Come leggere l’archivio
            </summary>
            <div className="mt-3 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
              <p>
                <strong className="text-foreground">Una proposta, una storia.</strong>{" "}
                Nuovi articoli o risposte sullo stesso oggetto entrano nella timeline
                del record esistente.
              </p>
              <p>
                <strong className="text-foreground">Geografia solo se pertinente.</strong>{" "}
                Punto, più sedi o area vengono distinti; “intera città” non produce un
                pin né coordinate.
              </p>
              <p>
                <strong className="text-foreground">Stato documentale.</strong>{" "}
                Emersa, depositata, discussa o recepita descrivono il percorso
                verificabile e non un giudizio politico sulla proposta.
              </p>
            </div>
          </details>
        </header>

        <section
          className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Sintesi archivio"
        >
          <Card className="p-4">
            <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
            <p className="mt-2 text-2xl font-bold tracking-tight">{PUBLIC_PROPOSALS.length}</p>
            <p className="text-sm font-semibold">Proposte censite</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {externalProposals.length} con fonti pubbliche esterne
            </p>
          </Card>
          <Card className="p-4">
            <MapPinned className="h-5 w-5 text-primary" aria-hidden="true" />
            <p className="mt-2 text-2xl font-bold tracking-tight">{georeferencedCount}</p>
            <p className="text-sm font-semibold">Georeferenziate</p>
            <p className="mt-1 text-xs text-muted-foreground">
              con uno o più riferimenti territoriali effettivi
            </p>
          </Card>
          <Card className="p-4">
            <Landmark className="h-5 w-5 text-primary" aria-hidden="true" />
            <p className="mt-2 text-2xl font-bold tracking-tight">{citywideCount}</p>
            <p className="text-sm font-semibold">Ambito cittadino</p>
            <p className="mt-1 text-xs text-muted-foreground">
              senza coordinate perché non localizzabili in un punto
            </p>
          </Card>
          <Card className="p-4">
            <UsersRound className="h-5 w-5 text-primary" aria-hidden="true" />
            <p className="mt-2 text-2xl font-bold tracking-tight">{promoterCount}</p>
            <p className="text-sm font-semibold">Soggetti proponenti</p>
            <p className="mt-1 text-xs text-muted-foreground">
              normalizzati per evitare duplicazioni
            </p>
          </Card>
        </section>

        <section
          aria-labelledby="filtri-proposte"
          className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 id="filtri-proposte" className="font-display text-xl font-bold">
                Esplora l’archivio
              </h2>
            </div>
            <div className="flex flex-wrap gap-2" aria-label="Modalità di visualizzazione">
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

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-2 text-sm font-medium">
              Localizzazione
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={geoMode}
                onChange={(event) => setGeoMode(event.target.value as GeoMode)}
              >
                <option value="all">Tutte</option>
                <option value="georeferenced">Solo georeferenziate</option>
                <option value="citywide">Solo intera città / non georeferenziate</option>
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium">
              Area locale
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={geoArea}
                onChange={(event) => {
                  const value = event.target.value as SelectFilter<ProposalGeoArea>;
                  setGeoArea(value);
                  if (value !== ALL) setGeoMode("georeferenced");
                }}
              >
                <option value={ALL}>Tutte le aree localizzate</option>
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
                  <option key={item} value={item}>{item}</option>
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
                  <option key={item} value={item}>{item}</option>
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
                  <option key={item} value={item}>{item}</option>
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
                  <option key={item} value={item}>{PROPOSAL_STATUS_LABELS[item]}</option>
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
                  <option key={item} value={item}>{PROPOSAL_CHANNEL_LABELS[item]}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {filteredProposals.length} proposte visualizzate su {PUBLIC_PROPOSALS.length}.
              {" "}{filteredGeoreferenced.length} sono georeferenziate nei filtri correnti.
            </p>
            <Button type="button" variant="outline" size="sm" onClick={resetFilters}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Reimposta filtri
            </Button>
          </div>
        </section>

        <section className="mt-6" aria-labelledby="mappa-proposte">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <MapPinned className="h-5 w-5 text-primary" aria-hidden="true" />
                <h2 id="mappa-proposte" className="font-display text-xl font-bold">
                  Mappa delle proposte georeferenziate
                </h2>
              </div>
              <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                La mappa contiene esclusivamente record con un luogo, più sedi o
                un’area territoriale effettivamente identificabili.
              </p>
            </div>
            <Badge variant="secondary">{filteredGeoreferenced.length} sulla mappa</Badge>
          </div>

          {filteredGeoreferenced.length > 0 ? (
            <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-sm">
              <ProposalMap proposals={filteredGeoreferenced} />
            </div>
          ) : (
            <Card className="mt-4 p-5">
              <p className="text-sm font-semibold text-foreground">
                Nessuna proposta georeferenziata nei filtri correnti
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Le proposte che riguardano l’intera città restano nell’archivio ma non
                ricevono coordinate e non vengono mostrate sulla mappa.
              </p>
            </Card>
          )}
        </section>

        <section className="mt-7" aria-labelledby="archivio-proposte">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="archivio-proposte" className="font-display text-2xl font-bold">
                Dossier delle proposte
              </h2>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Tutte le informazioni essenziali sono concentrate nella scheda della
                singola proposta. Timeline, coordinate e note di verifica si espandono
                solo quando servono.
              </p>
            </div>
          </div>

          {filteredProposals.length === 0 ? (
            <Card className="mt-4 p-6 text-center">
              <p className="font-semibold text-foreground">Nessun risultato</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Modifica o reimposta i filtri per ampliare la ricerca.
              </p>
            </Card>
          ) : null}

          {view === "proposte" ? (
            <div className="mt-4 grid gap-3">
              {sortByLatestUpdate(filteredProposals).map((proposal) => (
                <ProposalDossierCard key={proposal.id} proposal={proposal} />
              ))}
            </div>
          ) : null}

          {view === "promotori" ? (
            <div className="mt-5 space-y-7">
              {promoterGroups.map((group) => (
                <section key={group.promoterId} className="space-y-3">
                  <div className="flex flex-wrap items-baseline gap-3 border-b border-border pb-2">
                    <h3 className="font-display text-xl font-bold">{group.promoter}</h3>
                    <Badge variant="secondary">
                      {group.proposals.length} {group.proposals.length === 1 ? "proposta" : "proposte"}
                    </Badge>
                  </div>
                  <div className="grid gap-3">
                    {sortByLatestUpdate(group.proposals).map((proposal) => (
                      <ProposalDossierCard key={proposal.id} proposal={proposal} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : null}

          {view === "filoni" ? (
            <div className="mt-5 space-y-7">
              {threadGroups.map((group) => (
                <section key={group.threadId} className="space-y-3">
                  <div className="border-b border-border pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Layers3 className="h-5 w-5 text-primary" aria-hidden="true" />
                      <h3 className="font-display text-xl font-bold">{group.threadLabel}</h3>
                      <Badge variant="secondary">
                        {group.proposals.length} {group.proposals.length === 1 ? "proposta" : "proposte"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Set(group.proposals.map((proposal) => proposal.promoterId)).size}{" "}
                      soggetti proponenti distinti
                    </p>
                  </div>
                  <div className="grid gap-3">
                    {sortByLatestUpdate(group.proposals).map((proposal) => (
                      <ProposalDossierCard key={proposal.id} proposal={proposal} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : null}
        </section>

        <details className="mt-10 border-t border-border pt-6">
          <summary className="cursor-pointer list-none">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <p className="font-display text-xl font-bold">Ispirazioni esterne</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pratiche osservate altrove, separate dall’archivio delle proposte
                  effettivamente formulate a Lamezia.
                </p>
              </div>
            </div>
          </summary>
          <div className="mt-5 grid gap-4">
            {CIVIC_PRACTICES.map((practice) => (
              <CivicPracticeCard key={practice.id} practice={practice} />
            ))}
          </div>
        </details>
      </div>
    </>
  );
}
