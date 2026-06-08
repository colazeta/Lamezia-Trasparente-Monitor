import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useListPnrrProjects } from "@workspace/api-client-react";
import {
  Landmark,
  FileText,
  Calendar,
  Layers,
  FolderKanban,
  Euro,
  Building2,
  ExternalLink,
  Paperclip,
  AlertTriangle,
  ShieldCheck,
  Clock,
  Hash,
  Telescope,
  RefreshCw,
  Search,
  Link2,
  MapPin,
} from "lucide-react";
import { PnrrProject, Publication } from "@workspace/api-client-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { AlboLink } from "@/components/AlboLink";
import { MonitoringReportsSection } from "@/components/MonitoringReportsSection";
import { PageMeta } from "@/components/seo/PageMeta";
import { CivicMonitorReturn } from "@/components/CivicMonitorReturn";

const ITALIA_DOMANI_PROJECTS_DATASET_URL =
  "https://www.italiadomani.gov.it/content/dam/italiadomani/opendata/Progetti_del_PNRR/Progetti_PNRR.csv";
const ITALIA_DOMANI_LOCATION_DATASET_URL =
  "https://www.italiadomani.gov.it/content/dam/italiadomani/opendata/localizzazione-dei-progetti-del-pnrr/localizzazione-progetti-pnrr.csv";
const COMUNE_PNRR_URL =
  "https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr";

type AmountFilter = "all" | "under-100k" | "100k-500k" | "500k-1m" | "over-1m";
type PresenceFilter = "all" | "yes" | "no";
type LocationQuality = PnrrProject["locationQuality"];

const amountFilters: { value: AmountFilter; label: string }[] = [
  { value: "all", label: "Tutti gli importi" },
  { value: "under-100k", label: "Fino a 100.000 €" },
  { value: "100k-500k", label: "100.000–500.000 €" },
  { value: "500k-1m", label: "500.000–1 mln €" },
  { value: "over-1m", label: "Oltre 1 mln €" },
];

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : format(d, "dd MMM yyyy", { locale: it });
}

function formatImporto(value: number | null | undefined): string | null {
  return value != null && !Number.isNaN(value)
    ? new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 2,
      }).format(value)
    : null;
}

function formatImportoShort(value: number): string {
  return value > 0
    ? new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(value)
    : "—";
}

function projectMatchesAmount(project: PnrrProject, filter: AmountFilter) {
  if (filter === "all") return true;
  const amount = project.importoFinanziato;
  if (amount == null || Number.isNaN(amount)) return false;
  if (filter === "under-100k") return amount < 100_000;
  if (filter === "100k-500k") return amount >= 100_000 && amount < 500_000;
  if (filter === "500k-1m") return amount >= 500_000 && amount < 1_000_000;
  return amount >= 1_000_000;
}

const locationQualityLabels: Record<LocationQuality, string> = {
  ufficiale: "localizzazione ufficiale",
  dedotta: "localizzazione dedotta",
  da_verificare: "localizzazione da verificare",
  non_disponibile: "localizzazione non disponibile",
};

function locationQualityLabel(value: LocationQuality | null | undefined) {
  return value
    ? locationQualityLabels[value]
    : "localizzazione non disponibile";
}

function dataStatus(project: PnrrProject) {
  if (project.aggiornamentoVecchio)
    return "da verificare sulla fonte ufficiale";
  if (project.documentsCount > 0 || project.attachments.length > 0)
    return "arricchito con collegamenti rilevati";
  if (project.trasparenzaCompleta) return "ufficiale (Comune rilevato)";
  return "ufficiale (censimento Italia Domani)";
}

export function Pnrr() {
  const { data, isLoading } = useListPnrrProjects();

  const projects: PnrrProject[] = data?.projects ?? [];
  const uncensored: Publication[] | undefined = data?.uncensored;
  const censusLastUpdatedAt: string | null | undefined =
    data?.censusLastUpdatedAt;

  const [search, setSearch] = useState("");
  const [amountFilter, setAmountFilter] = useState<AmountFilter>("all");
  const [missionFilter, setMissionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cupFilter, setCupFilter] = useState<PresenceFilter>("all");
  const [actsFilter, setActsFilter] = useState<PresenceFilter>("all");
  const [staleFilter, setStaleFilter] = useState<PresenceFilter>("all");

  const census = useMemo(() => {
    const missionMap = new Map<string, number>();
    let totalImporto = 0;
    let cupCount = 0;
    let linkedActsCount = 0;
    let staleCount = 0;

    for (const p of projects) {
      if (p.mission) {
        const code = p.mission.split(" ")[0];
        missionMap.set(code, (missionMap.get(code) ?? 0) + 1);
      }
      if (p.importoFinanziato != null && !Number.isNaN(p.importoFinanziato)) {
        totalImporto += p.importoFinanziato;
      }
      if (p.cup) cupCount += 1;
      if (p.documentsCount > 0) linkedActsCount += 1;
      if (p.aggiornamentoVecchio) staleCount += 1;
    }

    return {
      projectsCount: projects.length,
      cupCount,
      linkedActsCount,
      staleCount,
      totalImporto,
      missions: Array.from(missionMap.entries())
        .map(([mission, count]) => ({ mission, count }))
        .sort((a, b) => a.mission.localeCompare(b.mission)),
    };
  }, [projects]);

  const filterOptions = useMemo(() => {
    const missions = new Set<string>();
    const statuses = new Set<string>();

    for (const project of projects) {
      if (project.mission) missions.add(project.mission);
      if (project.component) missions.add(project.component);
      if (project.investment) missions.add(project.investment);
      if (project.status) statuses.add(project.status);
    }

    return {
      missions: Array.from(missions).sort((a, b) => a.localeCompare(b)),
      statuses: Array.from(statuses).sort((a, b) => a.localeCompare(b)),
    };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return projects.filter((project) => {
      if (normalizedSearch) {
        const searchable = [
          project.title,
          project.cup,
          project.mission,
          project.component,
          project.investment,
          project.intervention,
          project.holder,
          project.attuatore,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!searchable.includes(normalizedSearch)) return false;
      }

      if (!projectMatchesAmount(project, amountFilter)) return false;

      if (
        missionFilter !== "all" &&
        project.mission !== missionFilter &&
        project.component !== missionFilter &&
        project.investment !== missionFilter
      ) {
        return false;
      }

      if (statusFilter !== "all" && project.status !== statusFilter)
        return false;
      if (cupFilter !== "all" && Boolean(project.cup) !== (cupFilter === "yes"))
        return false;
      if (
        actsFilter !== "all" &&
        Boolean(project.documentsCount > 0) !== (actsFilter === "yes")
      ) {
        return false;
      }
      if (
        staleFilter !== "all" &&
        project.aggiornamentoVecchio !== (staleFilter === "yes")
      ) {
        return false;
      }

      return true;
    });
  }, [
    amountFilter,
    actsFilter,
    cupFilter,
    missionFilter,
    projects,
    search,
    staleFilter,
    statusFilter,
  ]);

  return (
    <>
      <PageMeta
        title="Progetti PNRR a Lamezia Terme"
        description="Consultazione civica dei progetti PNRR collegati a Lamezia Terme, con importi, stati e collegamenti alle fonti ufficiali disponibili."
        path="/pnrr"
      />
      <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
        <header className="mb-8">
          <span className="eyebrow text-primary">
            <Landmark className="h-3.5 w-3.5" aria-hidden="true" />
            Piano Nazionale di Ripresa e Resilienza
          </span>
          <h1 className="mt-2 text-3xl font-display font-bold tracking-tight md:text-4xl">
            PNRR Tracker civico
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
            Schede pubbliche dei progetti PNRR localizzati a Lamezia Terme,
            basate sul censimento ufficiale{" "}
            <a
              href={ITALIA_DOMANI_PROJECTS_DATASET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              Italia Domani — dataset Progetti PNRR
            </a>{" "}
            e sul dataset di{" "}
            <a
              href={ITALIA_DOMANI_LOCATION_DATASET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              localizzazione dei progetti PNRR
            </a>
            {". "}
            Quando disponibili, la pagina collega la scheda comunale{" "}
            <a
              href={COMUNE_PNRR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              Attuazione Misure PNRR
            </a>
            {", "}
            i documenti dell'Albo Pretorio e i contratti/affidamenti collegati
            tramite CUP, senza dedurre ritardi o criticità non documentate dalle
            fonti.
          </p>
          <CivicMonitorReturn context="I progetti PNRR possono essere collegati a report civici, atti, affidamenti e richieste di accesso civico come elementi documentali da verificare." />
          {censusLastUpdatedAt && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <RefreshCw className="h-3 w-3" aria-hidden="true" />
              Ultimo aggiornamento dati rilevato:{" "}
              {formatDate(censusLastUpdatedAt)}
            </p>
          )}
        </header>

        {isLoading ? (
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-card-border bg-card p-6 shadow-sm"
                >
                  <Skeleton className="mb-4 h-9 w-9 rounded-lg" />
                  <Skeleton className="mb-2 h-9 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
          </div>
        ) : projects.length > 0 ? (
          <>
            <section aria-labelledby="pnrr-summary" className="mb-10">
              <h2 id="pnrr-summary" className="sr-only">
                Indicatori sintetici PNRR
              </h2>
              <div
                data-tour="pnrr-stats"
                className="grid grid-cols-2 gap-4 lg:grid-cols-5"
              >
                <StatCard
                  label="Progetti monitorati"
                  value={String(census.projectsCount)}
                  icon={FolderKanban}
                  highlight
                />
                <StatCard
                  label="Valore monitorato"
                  value={formatImportoShort(census.totalImporto)}
                  icon={Euro}
                />
                <StatCard
                  label="Progetti con CUP"
                  value={String(census.cupCount)}
                  icon={Hash}
                />
                <StatCard
                  label="Con atti Albo collegati"
                  value={String(census.linkedActsCount)}
                  icon={Link2}
                />
                <StatCard
                  label="Stato non aggiornato"
                  value={String(census.staleCount)}
                  icon={Clock}
                />
              </div>
            </section>

            {census.missions.length > 0 && (
              <section aria-labelledby="pnrr-missions" className="mb-10">
                <div className="mb-4 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-brand" aria-hidden="true" />
                  <h2
                    id="pnrr-missions"
                    className="text-xl font-display font-bold tracking-tight"
                  >
                    Ripartizione per missione
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {census.missions.map((m) => (
                    <div
                      key={m.mission}
                      className="inline-flex items-center gap-2 rounded-lg border border-card-border bg-card px-3 py-2 shadow-sm"
                    >
                      <Badge
                        variant="brand"
                        className="font-mono text-xs shadow-none"
                      >
                        {m.mission}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        <span className="font-display font-bold tabular-nums text-foreground">
                          {m.count}
                        </span>{" "}
                        {m.count === 1 ? "progetto" : "progetti"}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section
              aria-labelledby="pnrr-filters"
              className="mb-8 rounded-xl border border-card-border bg-card p-4 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-2">
                <Search className="h-5 w-5 text-brand" aria-hidden="true" />
                <h2
                  id="pnrr-filters"
                  className="text-xl font-display font-bold tracking-tight"
                >
                  Filtra i progetti
                </h2>
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <label className="flex flex-col gap-1 text-sm font-medium">
                  Cerca per titolo, CUP, missione o soggetto
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm font-normal"
                    placeholder="es. scuola, CUP, M2, Comune"
                    type="search"
                  />
                </label>
                <FilterSelect
                  label="Importo"
                  value={amountFilter}
                  onChange={(value) => setAmountFilter(value as AmountFilter)}
                  options={amountFilters}
                />
                <FilterSelect
                  label="Missione / componente / misura"
                  value={missionFilter}
                  onChange={setMissionFilter}
                  options={[
                    { value: "all", label: "Tutte" },
                    ...filterOptions.missions.map((value) => ({
                      value,
                      label: value,
                    })),
                  ]}
                />
                <FilterSelect
                  label="Stato progetto"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: "all", label: "Tutti gli stati" },
                    ...filterOptions.statuses.map((value) => ({
                      value,
                      label: value,
                    })),
                  ]}
                />
                <FilterSelect
                  label="Presenza CUP"
                  value={cupFilter}
                  onChange={(value) => setCupFilter(value as PresenceFilter)}
                  options={presenceOptions("Tutti")}
                />
                <FilterSelect
                  label="Atti Albo collegati"
                  value={actsFilter}
                  onChange={(value) => setActsFilter(value as PresenceFilter)}
                  options={presenceOptions("Tutti")}
                />
                <FilterSelect
                  label="Stato aggiornato"
                  value={staleFilter}
                  onChange={(value) => setStaleFilter(value as PresenceFilter)}
                  options={[
                    { value: "all", label: "Tutti" },
                    { value: "no", label: "Dato aggiornato o concluso" },
                    { value: "yes", label: "Dato non aggiornato" },
                  ]}
                />
              </div>
              <p
                className="mt-4 text-sm text-muted-foreground"
                aria-live="polite"
              >
                {filteredProjects.length} progetti visualizzati su{" "}
                {projects.length} monitorati.
              </p>
            </section>

            <section aria-labelledby="pnrr-projects">
              <div className="mb-4 flex items-center gap-2">
                <FolderKanban
                  className="h-5 w-5 text-brand"
                  aria-hidden="true"
                />
                <h2
                  id="pnrr-projects"
                  className="text-xl font-display font-bold tracking-tight"
                >
                  Progetti PNRR — schede civiche
                </h2>
              </div>

              {filteredProjects.length > 0 ? (
                <div data-tour="pnrr-list" className="mb-12 space-y-4">
                  {filteredProjects.map((project) => (
                    <PnrrCard key={project.key} project={project} />
                  ))}
                </div>
              ) : (
                <Empty className="mb-12 border border-dashed border-border bg-muted/20">
                  <EmptyHeader>
                    <EmptyMedia
                      variant="icon"
                      className="bg-brand/10 text-brand"
                    >
                      <Search className="h-6 w-6" aria-hidden="true" />
                    </EmptyMedia>
                    <EmptyTitle className="font-display">
                      Nessun progetto per i filtri selezionati
                    </EmptyTitle>
                    <EmptyDescription>
                      Modifica i filtri per consultare altre schede PNRR
                      disponibili.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </section>

            {uncensored && uncensored.length > 0 && (
              <section
                className="rounded-xl border border-amber-300/60 bg-amber-50/60 p-5 dark:border-amber-500/30 dark:bg-amber-500/10"
                aria-labelledby="pnrr-uncensored"
              >
                <h2
                  id="pnrr-uncensored"
                  className="mb-1 flex items-center gap-2 text-xl font-serif font-bold text-amber-700 dark:text-amber-400"
                >
                  <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                  Documenti Albo PNRR non associati al censimento
                </h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  Documenti PNRR rilevati sull'Albo Pretorio il cui CUP non
                  corrisponde a una scheda del censimento disponibile. Il
                  collegamento richiede verifica sulla fonte ufficiale.
                </p>
                <div className="space-y-2">
                  {uncensored.map((doc) => (
                    <div
                      key={doc.id}
                      className="rounded-lg border border-amber-200/60 bg-card p-3 dark:border-amber-500/20"
                    >
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <Badge className="border-transparent bg-amber-100 text-amber-800 shadow-none dark:bg-amber-500/20 dark:text-amber-300">
                          Da verificare
                        </Badge>
                        {doc.cups?.map((c: string) => (
                          <Badge
                            key={c}
                            variant="outline"
                            className="font-mono text-xs shadow-none"
                          >
                            <Hash className="mr-1 h-3 w-3" aria-hidden="true" />
                            {c}
                          </Badge>
                        ))}
                        {doc.pnrrMission && (
                          <Badge
                            variant="outline"
                            className="text-xs shadow-none"
                          >
                            {doc.pnrrMission}
                          </Badge>
                        )}
                        <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" aria-hidden="true" />
                          {formatDate(doc.pubStart)}
                        </span>
                      </div>
                      <p className="text-sm font-medium leading-snug">
                        {doc.oggetto}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">
                          {doc.tipologia}
                        </span>
                        <AlboLink attachments={doc.attachments} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <Empty className="border border-dashed border-border bg-muted/20">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-brand/10 text-brand">
                <Landmark className="h-6 w-6" aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle className="font-display">
                Nessun progetto PNRR nel censimento
              </EmptyTitle>
              <EmptyDescription>
                Il censimento Italia Domani non è ancora stato importato. I
                progetti compariranno al completamento della prima ingestione.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </>
  );
}

function presenceOptions(allLabel: string) {
  return [
    { value: "all", label: allLabel },
    { value: "yes", label: "Presenti" },
    { value: "no", label: "Non presenti" },
  ];
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-input bg-background px-3 py-2 text-sm font-normal"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function PnrrCard({ project }: { project: PnrrProject }) {
  return (
    <article
      data-tour="pnrr-detail"
      className="overflow-hidden rounded-xl border border-card-border bg-card shadow-sm"
    >
      <div
        className={`h-1 w-full ${project.documentsCount > 0 ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`}
      />

      <div className="p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs shadow-none">
            ID interno {project.id}
          </Badge>
          {project.cup ? (
            <Badge variant="brand" className="font-mono text-xs shadow-none">
              CUP {project.cup}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs shadow-none">
              CUP non disponibile
            </Badge>
          )}
          {project.mission && (
            <Badge variant="outline" className="text-xs shadow-none">
              {project.mission.split(" ")[0]}
            </Badge>
          )}
          {project.component && (
            <Badge variant="outline" className="font-mono text-xs shadow-none">
              {project.component.split(" ")[0]}
            </Badge>
          )}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30">
              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
              {dataStatus(project)}
            </span>
            {project.aggiornamentoVecchio && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
                <Clock className="h-3 w-3" aria-hidden="true" />
                Dato non aggiornato
              </span>
            )}
          </div>
        </div>

        <h3 className="mb-3 font-display font-bold leading-snug text-foreground">
          {project.title}
        </h3>

        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          {formatImporto(project.importoFinanziato) && (
            <span className="flex items-center gap-1 font-semibold text-foreground">
              <Euro className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
              {formatImporto(project.importoFinanziato)}
            </span>
          )}
          {(project.attuatore ?? project.holder) && (
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
              {project.attuatore ?? project.holder}
            </span>
          )}
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {project.location ?? "Localizzazione non disponibile"} —{" "}
            {locationQualityLabel(project.locationQuality)}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            Aggiornato {formatDate(project.lastUpdatedAt)}
          </span>
        </div>

        <dl className="mb-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <MetaRow
            label="Missione"
            value={project.mission}
            fallback="Non disponibile"
          />
          <MetaRow
            label="Componente"
            value={project.component}
            fallback="Non disponibile"
          />
          <MetaRow
            label="Misura / investimento"
            value={project.investment}
            fallback="Non disponibile"
          />
          <MetaRow
            label="Intervento"
            value={project.intervention}
            fallback="Non disponibile"
          />
          <MetaRow
            label="Importo finanziato"
            value={formatImporto(project.importoFinanziato)}
            fallback="Importo non disponibile"
          />
          <MetaRow
            label="Fonte finanziamento"
            value="PNRR — censimento Italia Domani"
          />
          <MetaRow
            label="Soggetto titolare"
            value={project.holder}
            fallback="Non disponibile"
          />
          <MetaRow
            label="Soggetto attuatore"
            value={project.attuatore}
            fallback="Non disponibile"
          />
          <MetaRow
            label="Localizzazione"
            value={project.location}
            fallback="Localizzazione non disponibile"
          />
          <MetaRow
            label="Qualità localizzazione"
            value={locationQualityLabel(project.locationQuality)}
          />
          <MetaRow
            label="Stato procedurale / lavori"
            value={project.status}
            fallback="Stato non disponibile"
          />
          <MetaRow
            label="Scadenza / milestone"
            value={project.endDate ? formatDate(project.endDate) : null}
            fallback="Scadenza non disponibile"
          />
          <MetaRow label="Data status" value={dataStatus(project)} />
        </dl>

        <SourceTraceability project={project} />

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Link
            href={`/monitoraggio/nuovo?pnrrProjectId=${project.id}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-brand/40 bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand transition-colors hover:bg-brand/20"
            data-testid={`link-monitora-pnrr-${project.id}`}
          >
            <Telescope className="h-3.5 w-3.5" aria-hidden="true" />
            Monitora questo progetto
          </Link>
        </div>

        <MonitoringReportsSection
          subjectType="pnrr"
          pnrrProjectId={project.id}
        />

        {project.attachments.length > 0 && (
          <section
            className="mt-4 border-t border-border/60 pt-4"
            aria-labelledby={`pnrr-attachments-${project.id}`}
          >
            <h4
              id={`pnrr-attachments-${project.id}`}
              className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
              Allegati ufficiali Comune
            </h4>
            <ul className="space-y-1.5">
              {project.attachments.map((att) => (
                <li key={att.url}>
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-1.5 text-sm text-primary hover:underline"
                  >
                    <FileText
                      className="mt-0.5 h-3.5 w-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="break-all">{att.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section
          className="mt-4 border-t border-border/60 pt-4"
          aria-labelledby={`pnrr-acts-${project.id}`}
        >
          <h4
            id={`pnrr-acts-${project.id}`}
            className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            Atti Albo Pretorio collegati per CUP
            <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-bold tabular-nums text-foreground">
              {project.documentsCount}
            </span>
          </h4>
          {project.documents.length > 0 ? (
            <div className="space-y-2">
              {project.documents.map((doc) => (
                <div key={doc.id} className="rounded-lg bg-muted/30 p-3">
                  <div className="flex items-start gap-3">
                    <FileText
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug">
                        {doc.oggetto}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>{doc.tipologia}</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="h-3 w-3" aria-hidden="true" />
                          {formatDate(doc.pubStart)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 pl-7">
                    <AlboLink attachments={doc.attachments} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Atto collegato non rilevato nei dati disponibili. Le prossime
              versioni potranno collegare CUP, pubblicazioni Albo,
              determinazioni, liquidazioni e contratti quando il dato sarà
              disponibile.
            </p>
          )}
        </section>

        <LinkedContractsSection project={project} />
      </div>
    </article>
  );
}

function SourceTraceability({ project }: { project: PnrrProject }) {
  return (
    <section
      className="mb-4 rounded-lg border border-border/60 bg-muted/20 p-3"
      aria-labelledby={`pnrr-sources-${project.id}`}
    >
      <h4
        id={`pnrr-sources-${project.id}`}
        className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
      >
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        Tracciabilità fonti e localizzazione
      </h4>
      <div className="grid gap-2 text-sm md:grid-cols-3">
        <div className="rounded-md bg-card p-2">
          <Badge variant="outline" className="mb-1 text-xs shadow-none">
            Fonte nazionale specifica
          </Badge>
          <a
            href={
              project.projectSourceUrl || ITALIA_DOMANI_PROJECTS_DATASET_URL
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-primary hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            Dataset ufficiale Italia Domani — Progetti PNRR
          </a>
          <p className="mt-1 text-xs text-muted-foreground">
            Dataset nazionale usato per leggere anagrafica, importi, missione e
            stato dei CUP selezionati.
          </p>
        </div>
        <div className="rounded-md bg-card p-2">
          <Badge variant="outline" className="mb-1 text-xs shadow-none">
            Fonte localizzazione territoriale
          </Badge>
          <a
            href={
              project.locationSourceUrl || ITALIA_DOMANI_LOCATION_DATASET_URL
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-primary hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            Dataset ufficiale Italia Domani — Localizzazione progetti PNRR
          </a>
          <p className="mt-1 text-xs text-muted-foreground">
            Dataset usato per filtrare i CUP associati al Comune di Lamezia
            Terme prima dell'unione con il dataset nazionale progetti.
          </p>
        </div>
        <div className="rounded-md bg-card p-2">
          <Badge
            variant={project.url ? "brand" : "outline"}
            className="mb-1 text-xs shadow-none"
          >
            {project.url
              ? "Fonte comunale puntuale"
              : "Fonte comunale non disponibile"}
          </Badge>
          {project.url ? (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              Scheda Attuazione Misure PNRR del Comune
            </a>
          ) : (
            <p className="text-muted-foreground">
              Link comunale puntuale non rilevato nei dati disponibili.
            </p>
          )}
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {project.locationNote ||
          "La qualità della localizzazione richiede verifica sulla fonte ufficiale."}
      </p>
    </section>
  );
}

function LinkedContractsSection({ project }: { project: PnrrProject }) {
  const linkedContracts = project.linkedContracts ?? [];

  return (
    <section
      className="mt-4 border-t border-border/60 pt-4"
      aria-labelledby={`pnrr-contracts-${project.id}`}
    >
      <h4
        id={`pnrr-contracts-${project.id}`}
        className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
      >
        <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
        Contratti / affidamenti collegati
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-bold tabular-nums text-foreground">
          {linkedContracts.length}
        </span>
      </h4>
      {linkedContracts.length > 0 ? (
        <div className="space-y-2">
          {linkedContracts.map((item) => (
            <div
              key={`${item.relationKey}-${item.relationValue}-${item.contract.id}`}
              className="rounded-lg bg-muted/30 p-3"
            >
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <Badge
                  variant="brand"
                  className="font-mono text-xs shadow-none"
                >
                  Collegato per {item.relationKey} {item.relationValue}
                </Badge>
                {item.contract.cig && (
                  <Badge
                    variant="outline"
                    className="font-mono text-xs shadow-none"
                  >
                    CIG {item.contract.cig}
                  </Badge>
                )}
                {item.contract.cup && (
                  <Badge
                    variant="outline"
                    className="font-mono text-xs shadow-none"
                  >
                    CUP {item.contract.cup}
                  </Badge>
                )}
              </div>
              <Link
                href={`/contratti/${item.contract.id}`}
                className="text-sm font-medium leading-snug text-primary hover:underline"
              >
                {item.contract.title}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>{item.contract.supplier}</span>
                <span>{formatImporto(item.contract.amount)}</span>
                <span>{item.contract.procedureType}</span>
                <span>{formatDate(item.contract.awardDate)}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {item.relationNote}
              </p>
              {item.contract.anacUrl && (
                <a
                  href={item.contract.anacUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  Fonte ANAC del contratto
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nessun contratto o affidamento collegato tramite CUP nei dati
          disponibili. La sezione resta predisposta per mostrare solo relazioni
          verificabili, senza dedurre collegamenti da CIG, titolo, importo o
          somiglianza descrittiva.
        </p>
      )}
    </section>
  );
}

function MetaRow({
  label,
  value,
  fallback,
}: {
  label: string;
  value: string | null | undefined;
  fallback?: string;
}) {
  const displayValue = value || fallback;
  if (!displayValue) return null;
  return (
    <div className="flex flex-col">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd
        className={
          value ? "text-sm text-foreground" : "text-sm text-muted-foreground"
        }
      >
        {displayValue}
      </dd>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  highlight = false,
}: {
  label: string;
  value: string;
  icon: any;
  highlight?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm ${highlight ? "border-brand/40" : "border-card-border"}`}
    >
      {highlight && (
        <span className="absolute left-0 top-0 h-full w-1 bg-brand" />
      )}
      <div
        className={`mb-4 flex h-9 w-9 items-center justify-center rounded-lg ${highlight ? "bg-brand/15 text-brand" : "bg-muted text-muted-foreground"}`}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div
        className={`break-words text-2xl font-display font-bold tracking-tight tabular-nums md:text-3xl ${highlight ? "text-brand" : "text-foreground"}`}
      >
        {value}
      </div>
      <div className="mt-1 eyebrow text-muted-foreground">{label}</div>
    </div>
  );
}
