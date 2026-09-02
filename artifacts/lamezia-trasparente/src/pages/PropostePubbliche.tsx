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
import { ProposalArchiveTimeline } from "@/components/ProposalArchiveTimeline";
import { ProposalDossierCard } from "@/components/ProposalDossierCard";
import { ProposalMap } from "@/components/ProposalMap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageMeta } from "@/components/seo/PageMeta";
import { CIVIC_PRACTICES } from "@/data/civicPractices";
import {
  proposalMatchesTimelineRange,
  type ProposalTimelineMode,
  type ProposalTimelineRange,
} from "@/data/proposalArchiveTimeline";
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
  const [timelineMode, setTimelineMode] = useState<ProposalTimelineMode>("origins");
  const [timelineRange, setTimelineRange] = useState<ProposalTimelineRange | null>(null);

  const themes = useMemo(() => getProposalThemes(), []);
  const promoters = useMemo(() => getProposalPromoters(), []);
  const years = useMemo(() => getProposalYears(), []);
  const geoAreas = useMemo(() => getProposalLocalGeoAreas(), []);

  const baseFilteredProposals = useMemo(() => {
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
          isProposalGeoreferenced(proposal.id) && proposalMatchesGeoArea(proposal.id, geoArea),
      );
    }

    return filtered;
  }, [channel, geoArea, geoMode, promoter, status, theme, year]);

  const filteredProposals = useMemo(
    () =>
      baseFilteredProposals.filter((proposal) =>
        proposalMatchesTimelineRange(proposal, timelineRange, timelineMode),
      ),
    [baseFilteredProposals, timelineMode, timelineRange],
  );

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
  const promoterCount = new Set(PUBLIC_PROPOSALS.map((proposal) => proposal.promoterId)).size;
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
    setTimelineRange(null);
  };

  return (
    <>
      <PageMeta
        title="Proposte civiche"
        description="Archivio verificabile delle proposte civiche rivolte a Lamezia Terme, organizzate per promotore, tema, percorso documentale, tempo e, quando pertinente, riferimento geografico verificabile."
        path="/proposte-civiche"
      />

      <div className="container mx-auto max-w-6xl px-4 py-7 md:py-9">
        <header>
          <span className="eyebrow text-primary">
            <Archive className="h-3.5 w-3.5" aria-hidden="true" />
            Archivio civico evolutivo
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Proposte civiche
          </h1>
          <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Un dossier per proposta, esplorabile per tempo, promotore, tema e territorio.
            Le proposte riferite genericamente a tutta Lamezia non ricevono coordinate artificiali.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <strong className="text-foreground">Stato documentale, non politico.</strong>
            <span>Geografia solo quando esiste un luogo o un’area realmente identificabile.</span>
          </div>
        </header>

        <Card className="mt-4 p-3">
          <div className="grid grid-cols-2 divide-x-0 divide-y divide-border sm:grid-cols-4 sm:divide-x sm:divide-y-0">
            <div className="px-3 py-2 sm:py-0">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Proposte
              </div>
              <p className="mt-1 text-xl font-bold">{PUBLIC_PROPOSALS.length}</p>
              <p className="text-[10px] text-muted-foreground">{externalProposals.length} con fonti esterne</p>
            </div>
            <div className="px-3 py-2 sm:py-0">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPinned className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Georeferenziate
              </div>
              <p className="mt-1 text-xl font-bold">{georeferencedCount}</p>
              <p className="text-[10px] text-muted-foreground">luogo, più sedi o area</p>
            </div>
            <div className="px-3 py-2 sm:py-0">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Landmark className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Intera città
              </div>
              <p className="mt-1 text-xl font-bold">{citywideCount}</p>
              <p className="text-[10px] text-muted-foreground">senza coordinate</p>
            </div>
            <div className="px-3 py-2 sm:py-0">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <UsersRound className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Promotori
              </div>
              <p className="mt-1 text-xl font-bold">{promoterCount}</p>
              <p className="text-[10px] text-muted-foreground">soggetti normalizzati</p>
            </div>
          </div>
        </Card>

        <section
          aria-labelledby="filtri-proposte"
          className="mt-4 rounded-2xl border border-border bg-card p-3 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" aria-hidden="true" />
              <h2 id="filtri-proposte" className="text-sm font-bold">Filtri</h2>
              <Badge variant="secondary">{filteredProposals.length}/{PUBLIC_PROPOSALS.length}</Badge>
            </div>
            <div className="flex flex-wrap gap-1.5" aria-label="Modalità di visualizzazione">
              <Button type="button" variant={view === "proposte" ? "default" : "outline"} size="sm" onClick={() => setView("proposte")}>Proposte</Button>
              <Button type="button" variant={view === "promotori" ? "default" : "outline"} size="sm" onClick={() => setView("promotori")}>Promotori</Button>
              <Button type="button" variant={view === "filoni" ? "default" : "outline"} size="sm" onClick={() => setView("filoni")}>Filoni</Button>
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <label className="space-y-1 text-xs font-medium">
              Localizzazione
              <select className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs" value={geoMode} onChange={(event) => setGeoMode(event.target.value as GeoMode)}>
                <option value="all">Tutte</option>
                <option value="georeferenced">Georeferenziate</option>
                <option value="citywide">Intera città / non georeferenziate</option>
              </select>
            </label>
            <label className="space-y-1 text-xs font-medium">
              Area locale
              <select
                className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs"
                value={geoArea}
                onChange={(event) => {
                  const value = event.target.value as SelectFilter<ProposalGeoArea>;
                  setGeoArea(value);
                  if (value !== ALL) setGeoMode("georeferenced");
                }}
              >
                <option value={ALL}>Tutte le aree</option>
                {geoAreas.map((item) => <option key={item} value={item}>{PROPOSAL_GEO_AREA_LABELS[item]}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-xs font-medium">
              Tema
              <select className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs" value={theme} onChange={(event) => setTheme(event.target.value)}>
                <option value={ALL}>Tutti i temi</option>
                {themes.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-xs font-medium">
              Promotore
              <select className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs" value={promoter} onChange={(event) => setPromoter(event.target.value)}>
                <option value={ALL}>Tutti i promotori</option>
                {promoters.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-xs font-medium">
              Anno
              <select className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs" value={year} onChange={(event) => setYear(event.target.value)}>
                <option value={ALL}>Tutti gli anni</option>
                {years.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-xs font-medium">
              Stato
              <select className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs" value={status} onChange={(event) => setStatus(event.target.value as SelectFilter<ProposalStatus>)}>
                <option value={ALL}>Tutti gli stati</option>
                {PROPOSAL_STATUSES.map((item) => <option key={item} value={item}>{PROPOSAL_STATUS_LABELS[item]}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-xs font-medium">
              Canale
              <select className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs" value={channel} onChange={(event) => setChannel(event.target.value as SelectFilter<ProposalChannel>)}>
                <option value={ALL}>Tutti i canali</option>
                {PROPOSAL_CHANNELS.map((item) => <option key={item} value={item}>{PROPOSAL_CHANNEL_LABELS[item]}</option>)}
              </select>
            </label>
            <div className="flex items-end">
              <Button type="button" variant="outline" size="sm" className="w-full" onClick={resetFilters}>
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                Reimposta
              </Button>
            </div>
          </div>

          <p className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground" aria-live="polite">
            <span>{filteredProposals.length} proposte visualizzate su {PUBLIC_PROPOSALS.length}.</span>{" "}
            <span>{filteredGeoreferenced.length} georeferenziate nei filtri correnti.</span>
          </p>
        </section>

        <div className="mt-4">
          <ProposalArchiveTimeline
            proposals={baseFilteredProposals}
            mode={timelineMode}
            activeRange={timelineRange}
            onModeChange={setTimelineMode}
            onRangeChange={setTimelineRange}
          />
        </div>

        <details className="mt-4 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
          <summary className="cursor-pointer list-none">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPinned className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-sm font-bold text-foreground">Mappa</span>
                <span className="text-xs text-muted-foreground">solo proposte realmente georeferenziate</span>
              </div>
              <Badge variant="secondary">{filteredGeoreferenced.length}</Badge>
            </div>
          </summary>
          <div className="mt-3">
            {filteredGeoreferenced.length > 0 ? (
              <ProposalMap proposals={filteredGeoreferenced} />
            ) : (
              <p className="text-xs text-muted-foreground">Nessun record georeferenziato nei filtri correnti.</p>
            )}
          </div>
        </details>

        <section className="mt-5" aria-labelledby="archivio-proposte">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 id="archivio-proposte" className="font-display text-xl font-bold">Dossier</h2>
              <p className="text-xs text-muted-foreground">Schede compatte; apri solo la proposta che vuoi approfondire.</p>
            </div>
            {timelineRange ? <Badge variant="outline" className="capitalize">Periodo: {timelineRange.label}</Badge> : null}
          </div>

          {filteredProposals.length === 0 ? (
            <Card className="mt-3 p-5 text-center">
              <p className="font-semibold text-foreground">Nessun risultato</p>
              <p className="mt-1 text-xs text-muted-foreground">Modifica i filtri o azzera il periodo selezionato.</p>
            </Card>
          ) : null}

          {view === "proposte" ? (
            <div className="mt-3 grid gap-2.5">
              {sortByLatestUpdate(filteredProposals).map((proposal) => <ProposalDossierCard key={proposal.id} proposal={proposal} />)}
            </div>
          ) : null}

          {view === "promotori" ? (
            <div className="mt-4 space-y-5">
              {promoterGroups.map((group) => (
                <section key={group.promoterId} className="space-y-2">
                  <div className="flex flex-wrap items-baseline gap-2 border-b border-border pb-1.5">
                    <h3 className="font-display text-lg font-bold">{group.promoter}</h3>
                    <Badge variant="secondary">{group.proposals.length}</Badge>
                  </div>
                  <div className="grid gap-2.5">
                    {sortByLatestUpdate(group.proposals).map((proposal) => <ProposalDossierCard key={proposal.id} proposal={proposal} />)}
                  </div>
                </section>
              ))}
            </div>
          ) : null}

          {view === "filoni" ? (
            <div className="mt-4 space-y-5">
              {threadGroups.map((group) => (
                <section key={group.threadId} className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 border-b border-border pb-1.5">
                    <Layers3 className="h-4 w-4 text-primary" aria-hidden="true" />
                    <h3 className="font-display text-lg font-bold">{group.threadLabel}</h3>
                    <Badge variant="secondary">{group.proposals.length}</Badge>
                  </div>
                  <div className="grid gap-2.5">
                    {sortByLatestUpdate(group.proposals).map((proposal) => <ProposalDossierCard key={proposal.id} proposal={proposal} />)}
                  </div>
                </section>
              ))}
            </div>
          ) : null}
        </section>

        <details className="mt-7 border-t border-border pt-4">
          <summary className="cursor-pointer list-none">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" aria-hidden="true" />
              <span className="text-sm font-bold">Ispirazioni esterne</span>
              <span className="text-xs text-muted-foreground">separate dalle proposte formulate a Lamezia</span>
            </div>
          </summary>
          <div className="mt-4 grid gap-3">
            {CIVIC_PRACTICES.map((practice) => <CivicPracticeCard key={practice.id} practice={practice} />)}
          </div>
        </details>
      </div>
    </>
  );
}
