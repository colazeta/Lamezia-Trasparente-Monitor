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
  Hammer,
} from "lucide-react";
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
import { V0SectionLanding } from "@/components/launch/V0SectionLanding";
import { SourceAvailabilityNotice } from "@/components/SourceAvailabilityNotice";
import {
  buildCantieriometroCards,
  defaultCantieriometroFilters,
  filterCantieriometroCards,
  type CantieriometroAmountFilter,
  type CantieriometroCard,
  type CantieriometroFilters,
  type CantieriometroFreshnessFilter,
  type CantieriometroLocationFilter,
  type CantieriometroPresenceFilter,
} from "@/lib/cantieriometro";
import { asApiList } from "@/lib/apiList";
import {
  LAMEZIA_PNRR_STATIC_DATA,
  LAMEZIA_PNRR_STATIC_DATA_URL,
  LAMEZIA_PNRR_STATIC_VIEW,
  adaptRuntimePnrrDocuments,
  adaptRuntimePnrrProjects,
  mergePnrrViewDocuments,
  mergePnrrViewProjects,
  type PnrrViewAttachment,
  type PnrrViewProject,
} from "@/data/lameziaPnrr";

const ITALIA_DOMANI_PROJECTS_DATASET_URL =
  "https://www.italiadomani.gov.it/content/dam/italiadomani/opendata/Progetti_del_PNRR/Progetti_PNRR.csv";
const ITALIA_DOMANI_LOCATION_DATASET_URL =
  "https://www.italiadomani.gov.it/content/dam/italiadomani/opendata/localizzazione-dei-progetti-del-pnrr/localizzazione-progetti-pnrr.csv";
const COMUNE_PNRR_URL =
  "https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr";

type AmountFilter = CantieriometroAmountFilter;
type PresenceFilter = CantieriometroPresenceFilter;
type LocationQuality = PnrrViewProject["locationQuality"];

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

function projectMatchesAmount(project: PnrrViewProject, filter: AmountFilter) {
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

function sourceLabelForUrl(url: string | null | undefined, fallback: string) {
  if (!url) return null;
  if (url.includes("comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr")) {
    return "Comune di Lamezia Terme — Attuazione Misure PNRR";
  }
  return url.includes("openpnrr.it")
    ? "OpenPNRR — progetti/localizzazioni per Comune"
    : fallback;
}

function dataStatus(project: PnrrViewProject) {
  if (project.dataOrigin === "static-municipal")
    return "ufficiale (scheda Comune acquisita)";
  if (project.aggiornamentoVecchio)
    return "da verificare sulla fonte ufficiale";
  if (
    project.documentsCount > 0 ||
    asApiList<PnrrViewProject["attachments"][number]>(project.attachments)
      .length > 0
  )
    return "arricchito con collegamenti rilevati";
  if (project.trasparenzaCompleta) return "ufficiale (Comune rilevato)";
  return "ufficiale (censimento Italia Domani)";
}

export function Pnrr() {
  const {
    data,
    isLoading,
    isError: apiSourceUnavailable,
  } = useListPnrrProjects();
  const runtimeProjects = useMemo(
    () => adaptRuntimePnrrProjects(data?.projects),
    [data?.projects],
  );
  const runtimeUnmatchedEvidence = useMemo(
    () => adaptRuntimePnrrDocuments(data?.uncensored),
    [data?.uncensored],
  );
  const projects = useMemo(
    () =>
      mergePnrrViewProjects(runtimeProjects, LAMEZIA_PNRR_STATIC_VIEW.projects),
    [runtimeProjects],
  );
  const uncensored = useMemo(
    () =>
      mergePnrrViewDocuments(
        runtimeUnmatchedEvidence,
        LAMEZIA_PNRR_STATIC_VIEW.unmatchedEvidence,
      ),
    [runtimeUnmatchedEvidence],
  );
  const usingStaticFeed = runtimeProjects.length === 0;
  const sourceUnavailable = apiSourceUnavailable && projects.length === 0;
  const sourceLoading = isLoading && projects.length === 0;
  const censusLastUpdatedAt = usingStaticFeed
    ? LAMEZIA_PNRR_STATIC_DATA.metadata.materialized_at
    : data?.censusLastUpdatedAt;
  const importSourceLabel = usingStaticFeed
    ? LAMEZIA_PNRR_STATIC_DATA.metadata.source
    : data?.importSourceLabel;
  const importSourceUrl = usingStaticFeed
    ? LAMEZIA_PNRR_STATIC_DATA.metadata.source_url
    : data?.importSourceUrl;
  const importSourceStatus = usingStaticFeed ? "ok" : data?.importSourceStatus;

  const [search, setSearch] = useState("");
  const [amountFilter, setAmountFilter] = useState<AmountFilter>("all");
  const [missionFilter, setMissionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cupFilter, setCupFilter] = useState<PresenceFilter>("all");
  const [actsFilter, setActsFilter] = useState<PresenceFilter>("all");
  const [staleFilter, setStaleFilter] = useState<PresenceFilter>("all");
  const [cantieriometroFilters, setCantieriometroFilters] =
    useState<CantieriometroFilters>(defaultCantieriometroFilters);

  const census = useMemo(() => {
    const missionMap = new Map<string, number>();
    let totalImporto = 0;
    let cupCount = 0;
    let linkedActsCount = 0;
    let freshnessVerificationCount = 0;

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
      if (p.freshnessAssessment !== "current") freshnessVerificationCount += 1;
    }

    return {
      projectsCount: projects.length,
      cupCount,
      linkedActsCount,
      freshnessVerificationCount,
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

  const cantieriometroCards = useMemo(
    () => buildCantieriometroCards(projects),
    [projects],
  );
  const filteredCantieriometroCards = useMemo(
    () => filterCantieriometroCards(cantieriometroCards, cantieriometroFilters),
    [cantieriometroCards, cantieriometroFilters],
  );

  const updateCantieriometroFilter = <K extends keyof CantieriometroFilters>(
    key: K,
    value: CantieriometroFilters[K],
  ) => {
    setCantieriometroFilters((current) => ({ ...current, [key]: value }));
  };

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
          ...project.attachments.map((attachment) => attachment.title),
          ...project.documents.map((document) => document.oggetto),
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
        (project.freshnessAssessment !== "current") !== (staleFilter === "yes")
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
        <V0SectionLanding
          eyebrow="Piano Nazionale di Ripresa e Resilienza"
          icon={Landmark}
          title="PNRR e progetti finanziati"
          subtitle={
            <>
              Schede pubblicate nella sezione PNRR del Comune di Lamezia Terme,
              con importi, stati e collegamenti alle fonti disponibili. La
              lettura resta documentale: non deduce ubicazioni puntuali, ritardi
              o criticità non presenti nelle fonti.
            </>
          }
          stateLabel={
            sourceUnavailable
              ? "Fonte in attivazione"
              : usingStaticFeed
                ? "Feed comunale disponibile"
                : "Feed comunale e API disponibili"
          }
          stateDescription={
            sourceUnavailable
              ? "Il collegamento al censimento PNRR non è disponibile in questa pubblicazione. Nessun totale viene rappresentato come zero."
              : usingStaticFeed
                ? "Le schede ufficiali del Comune sono materializzate nella pubblicazione con provenienza, data di acquisizione e collegamenti documentali verificabili."
                : "Le schede comunali sono integrate con i dati disponibili dal servizio PNRR, mantenendo provenienza e regole di riconciliazione esplicite."
          }
          findItems={[
            "Schede acquisite, importi, missioni, CUP e stato informativo disponibile.",
            "Collegamenti a schede comunali, Albo Pretorio, contratti e allegati quando rilevati.",
            "Filtri del Cantieriometro per individuare dati presenti, mancanti o da aggiornare.",
          ]}
          missingItems={[
            "Riconciliazione completa con il censimento nazionale Italia Domani/ReGiS.",
            "Date e stati di avanzamento quando non sono esposti nelle schede comunali.",
            "Collegamenti a contratti e affidamenti non dimostrabili tramite CUP.",
          ]}
          sourceLimit={
            <>
              Il perimetro minimo deriva dalle schede pubblicate nella sezione
              PNRR del Comune: non equivale al censimento nazionale completo.
              Gli atti Albo sono associati a un progetto soltanto quando il CUP
              coincide; assenze e campi vuoti restano dati da verificare.
            </>
          }
          cta={{ label: "Consulta lo stato PNRR", href: "#pnrr-elenco" }}
          secondaryLink={{ label: "Note legali", href: "/note-legali" }}
        />
        <div className="mb-8 space-y-2 text-xs text-muted-foreground">
          <CivicMonitorReturn context="I progetti PNRR possono essere collegati a report civici, atti, affidamenti e richieste di accesso civico come elementi documentali da verificare." />
          {importSourceLabel && (
            <p className="flex flex-wrap items-center gap-1.5">
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
              {usingStaticFeed
                ? "Fonte del feed statico: "
                : "Fonte dati usata dall'ultima importazione: "}
              {importSourceUrl ? (
                <a
                  href={importSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  {importSourceLabel}
                </a>
              ) : (
                <span className="font-medium text-foreground">
                  {importSourceLabel}
                </span>
              )}
              {importSourceStatus && importSourceStatus !== "ok" ? (
                <span>· stato importazione: {importSourceStatus}</span>
              ) : null}
            </p>
          )}
          {censusLastUpdatedAt && (
            <p className="flex items-center gap-1.5">
              <RefreshCw className="h-3 w-3" aria-hidden="true" />
              {usingStaticFeed
                ? "Feed statico materializzato: "
                : "Ultimo aggiornamento dati rilevato: "}
              {formatDate(censusLastUpdatedAt)}
            </p>
          )}
          <p className="flex items-center gap-1.5">
            <FileText className="h-3 w-3" aria-hidden="true" />
            <a
              href={LAMEZIA_PNRR_STATIC_DATA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              Apri il feed JSON materializzato
            </a>
          </p>
          <p>
            {LAMEZIA_PNRR_STATIC_DATA.metadata.coverage_note}{" "}
            {LAMEZIA_PNRR_STATIC_DATA.metadata.reconciliation_rule}
          </p>
        </div>

        <div id="pnrr-elenco" />
        {sourceUnavailable ? (
          <SourceAvailabilityNotice
            description="Il servizio dati PNRR non risponde con un payload verificabile. Schede, importi e indicatori restano nascosti finché la fonte non viene collegata; questo stato non significa che non esistano progetti."
            sourceHref={COMUNE_PNRR_URL}
            sourceLabel="Consulta la sezione PNRR del Comune"
          />
        ) : sourceLoading ? (
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
                  label="Schede progetto disponibili"
                  value={String(census.projectsCount)}
                  icon={FolderKanban}
                  highlight
                />
                <StatCard
                  label="Somma importi esposti"
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
                  label="Aggiornamento da verificare"
                  value={String(census.freshnessVerificationCount)}
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

            <CantieriometroSection
              cards={filteredCantieriometroCards}
              totalCards={cantieriometroCards.length}
              filters={cantieriometroFilters}
              onFilterChange={updateCantieriometroFilter}
            />

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
                  label="Verifica aggiornamento"
                  value={staleFilter}
                  onChange={(value) => setStaleFilter(value as PresenceFilter)}
                  options={[
                    { value: "all", label: "Tutti" },
                    { value: "no", label: "Aggiornamento disponibile" },
                    { value: "yes", label: "Da verificare sulla fonte" },
                  ]}
                />
              </div>
              <p
                className="mt-4 text-sm text-muted-foreground"
                aria-live="polite"
              >
                {filteredProjects.length} progetti visualizzati su{" "}
                {projects.length} schede disponibili.
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

            {uncensored.length > 0 && (
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
                        {asApiList<string>(doc.cups).map((c: string) => (
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

function CantieriometroSection({
  cards,
  totalCards,
  filters,
  onFilterChange,
}: {
  cards: CantieriometroCard[];
  totalCards: number;
  filters: CantieriometroFilters;
  onFilterChange: <K extends keyof CantieriometroFilters>(
    key: K,
    value: CantieriometroFilters[K],
  ) => void;
}) {
  return (
    <section
      aria-labelledby="cantieriometro-bridge"
      className="mb-10 overflow-hidden rounded-xl border border-brand/25 bg-card shadow-sm"
    >
      <div className="border-b border-border/60 bg-brand/5 p-5">
        <div className="mb-2 flex items-center gap-2">
          <Hammer className="h-5 w-5 text-brand" aria-hidden="true" />
          <h2
            id="cantieriometro-bridge"
            className="text-xl font-display font-bold tracking-tight"
          >
            Cantieriometro bridge
          </h2>
        </div>
        <p className="max-w-4xl text-sm text-muted-foreground">
          Vista leggera che riorganizza i progetti PNRR già presenti in schede
          opera/intervento e mostra solo collegamenti documentali disponibili
          verso PNRR, Albo Pretorio e contratti. Non certifica avanzamento
          fisico, ritardi o responsabilità: le assenze sono bisogni di verifica
          sulle fonti pubbliche.
        </p>
      </div>

      <div className="p-5">
        <div className="mb-4 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <FilterSelect
            label="Importo opera/intervento"
            value={filters.amount}
            onChange={(value) =>
              onFilterChange("amount", value as CantieriometroAmountFilter)
            }
            options={amountFilters}
          />
          <FilterSelect
            label="Presenza CUP"
            value={filters.cup}
            onChange={(value) =>
              onFilterChange("cup", value as CantieriometroPresenceFilter)
            }
            options={presenceOptions("Tutti")}
          />
          <FilterSelect
            label="Atti Albo collegati"
            value={filters.linkedActs}
            onChange={(value) =>
              onFilterChange(
                "linkedActs",
                value as CantieriometroPresenceFilter,
              )
            }
            options={presenceOptions("Tutti")}
          />
          <FilterSelect
            label="Localizzazione"
            value={filters.location}
            onChange={(value) =>
              onFilterChange("location", value as CantieriometroLocationFilter)
            }
            options={[
              { value: "all", label: "Tutte" },
              { value: "available", label: "Disponibile" },
              { value: "missing", label: "Non disponibile" },
            ]}
          />
          <FilterSelect
            label="Aggiornamento dato"
            value={filters.freshness}
            onChange={(value) =>
              onFilterChange(
                "freshness",
                value as CantieriometroFreshnessFilter,
              )
            }
            options={[
              { value: "all", label: "Tutti" },
              { value: "updated", label: "Aggiornato" },
              { value: "verify", label: "Da verificare" },
            ]}
          />
        </div>

        <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
          {cards.length} schede opera/intervento visualizzate su {totalCards}
          derivate dai dati PNRR disponibili.
        </p>

        {cards.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {cards.map((card) => (
              <article
                key={card.projectKey}
                className="rounded-lg border border-card-border bg-background p-4"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {card.cup ? (
                    <Badge
                      variant="brand"
                      className="font-mono text-xs shadow-none"
                    >
                      CUP {card.cup}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs shadow-none">
                      CUP da verificare
                    </Badge>
                  )}
                  <Badge
                    variant={card.hasLocation ? "outline" : "secondary"}
                    className="text-xs shadow-none"
                  >
                    {locationQualityLabel(card.locationQuality)}
                  </Badge>
                  {card.needsDataVerification && (
                    <Badge
                      variant="outline"
                      className="border-amber-300 text-xs text-amber-700 shadow-none dark:border-amber-500/40 dark:text-amber-300"
                    >
                      Dato da verificare
                    </Badge>
                  )}
                </div>
                <h3 className="font-display font-bold leading-snug">
                  {card.title}
                </h3>
                <dl className="mt-3 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
                  <MetaRow
                    label="Importo"
                    value={formatImporto(card.amount)}
                    fallback="Importo non disponibile"
                  />
                  <MetaRow
                    label="Localizzazione"
                    value={card.location}
                    fallback="Localizzazione non disponibile"
                  />
                  <MetaRow
                    label="Stato progetto"
                    value={card.projectStatus}
                    fallback="Stato non disponibile"
                  />
                  <MetaRow
                    label="Ultimo aggiornamento"
                    value={formatDate(card.lastUpdatedAt)}
                  />
                  <MetaRow
                    label="Atti Albo collegati"
                    value={`${card.linkedActsCount}`}
                  />
                  <MetaRow
                    label="Contratti collegati"
                    value={`${card.linkedContractsCount}`}
                  />
                </dl>
                <p className="mt-3 text-xs text-muted-foreground">
                  {card.locationNote ||
                    "La localizzazione richiede verifica sulla fonte ufficiale."}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <Empty className="border border-dashed border-border bg-muted/20">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-brand/10 text-brand">
                <Search className="h-6 w-6" aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle className="font-display">
                Nessuna scheda opera per i filtri selezionati
              </EmptyTitle>
              <EmptyDescription>
                Modifica i filtri del Cantieriometro bridge per consultare altre
                schede derivate dai dati PNRR disponibili.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </section>
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

const municipalAttachmentPhaseOrder =
  LAMEZIA_PNRR_STATIC_DATA.attachment_taxonomy.phases.map((phase) => phase.id);

function MunicipalDocumentArchive({ project }: { project: PnrrViewProject }) {
  const attachments = asApiList<PnrrViewAttachment>(project.attachments);
  if (attachments.length === 0) return null;

  const groups = municipalAttachmentPhaseOrder.flatMap((phase) => {
    const items = attachments
      .filter((attachment) => attachment.phase === phase)
      .sort((left, right) => left.sourceOrder - right.sourceOrder);
    return items.length > 0
      ? [
          {
            phase,
            label: items[0].phaseLabel,
            description: items[0].phaseDescription,
            items,
          },
        ]
      : [];
  });
  const years = Array.from(
    new Set(
      attachments.flatMap((attachment) =>
        attachment.documentYear == null ? [] : [attachment.documentYear],
      ),
    ),
  ).sort((left, right) => left - right);
  const yearRange =
    years.length === 0
      ? null
      : years[0] === years.at(-1)
        ? String(years[0])
        : `${years[0]}–${years.at(-1)}`;
  const classifiedPhases = groups.filter(
    (group) => group.phase !== "other",
  ).length;

  return (
    <details
      className="group mt-4 overflow-hidden rounded-lg border border-border/70 bg-muted/10"
      data-testid={`pnrr-document-archive-${project.id}`}
    >
      <summary className="flex cursor-pointer list-none items-start gap-3 px-4 py-3 marker:content-none hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
        <Paperclip
          className="mt-0.5 h-4 w-4 shrink-0 text-primary"
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">
            Archivio documentale ufficiale
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {attachments.length}{" "}
            {attachments.length === 1 ? "allegato" : "allegati"}
            {yearRange ? ` · anni rilevati ${yearRange}` : ""}
            {classifiedPhases > 0
              ? ` · ${classifiedPhases} fasi documentali`
              : ""}
          </span>
        </span>
        <span className="shrink-0 text-xs font-semibold text-primary group-open:hidden">
          Apri
        </span>
        <span className="hidden shrink-0 text-xs font-semibold text-primary group-open:inline">
          Chiudi
        </span>
      </summary>

      <div className="border-t border-border/60 px-4 py-4">
        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
          {LAMEZIA_PNRR_STATIC_DATA.attachment_taxonomy.classification_policy}{" "}
          {LAMEZIA_PNRR_STATIC_DATA.attachment_taxonomy.order_policy} Le date
          con precisione annuale non sono presentate come date dell'atto.
        </p>

        <div className="space-y-5">
          {groups.map((group) => (
            <section
              key={group.phase}
              aria-labelledby={`pnrr-archive-${project.id}-${group.phase}`}
            >
              <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <h5
                  id={`pnrr-archive-${project.id}-${group.phase}`}
                  className="text-sm font-semibold text-foreground"
                >
                  {group.label}
                </h5>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
                  {group.items.length}
                </span>
                <p className="basis-full text-xs text-muted-foreground">
                  {group.description}
                </p>
              </div>
              <ol className="space-y-2">
                {group.items.map((attachment) => (
                  <MunicipalDocumentItem
                    key={attachment.url}
                    attachment={attachment}
                  />
                ))}
              </ol>
            </section>
          ))}
        </div>
      </div>
    </details>
  );
}

function MunicipalDocumentItem({
  attachment,
}: {
  attachment: PnrrViewAttachment;
}) {
  return (
    <li className="rounded-md border border-border/50 bg-card px-3 py-2.5">
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-start gap-2 text-sm font-medium leading-snug text-primary hover:underline"
      >
        <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="break-words">{attachment.title}</span>
      </a>
      {(attachment.sequence != null || attachment.documentYear != null) && (
        <div className="mt-1.5 flex flex-wrap gap-1.5 pl-5 text-[11px] text-muted-foreground">
          {attachment.sequence != null && (
            <span className="rounded-full bg-muted px-2 py-0.5">
              n. {attachment.sequence} nel titolo
            </span>
          )}
          {attachment.documentDate ? (
            <span className="rounded-full bg-muted px-2 py-0.5">
              data nel titolo: {formatDate(attachment.documentDate)}
            </span>
          ) : attachment.documentYear != null ? (
            <span className="rounded-full bg-muted px-2 py-0.5">
              anno nel titolo/file: {attachment.documentYear}
            </span>
          ) : null}
        </div>
      )}
    </li>
  );
}

function PnrrCard({ project }: { project: PnrrViewProject }) {
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
            {project.dataOrigin === "static-municipal"
              ? "ID scheda Comune"
              : "ID interno"}{" "}
            {project.id}
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
            {project.freshnessAssessment !== "current" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {project.freshnessAssessment === "stale"
                  ? "Dato non aggiornato"
                  : "Data aggiornamento non indicata"}
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
            {project.freshnessAssessment === "not_assessed"
              ? `Scheda pubblicata ${formatDate(project.publishedAt)}`
              : `Aggiornato ${formatDate(project.lastUpdatedAt)}`}
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
            value={
              project.dataOrigin === "static-municipal"
                ? "PNRR — scheda ufficiale del Comune"
                : "PNRR — censimento e fonti disponibili"
            }
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
            label="Soggetto sub-attuatore"
            value={project.subAttuatore}
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

        {project.dataOrigin !== "static-municipal" && (
          <>
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
          </>
        )}

        <MunicipalDocumentArchive project={project} />

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
          {asApiList<PnrrViewProject["documents"][number]>(project.documents)
            .length > 0 ? (
            <div className="space-y-2">
              {asApiList<PnrrViewProject["documents"][number]>(
                project.documents,
              ).map((doc) => (
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

function SourceTraceability({ project }: { project: PnrrViewProject }) {
  const projectSourceLabel = sourceLabelForUrl(
    project.projectSourceUrl,
    "Dataset ufficiale Italia Domani — Progetti PNRR",
  );
  const locationSourceLabel = sourceLabelForUrl(
    project.locationSourceUrl,
    "Dataset ufficiale Italia Domani — Localizzazione progetti PNRR",
  );

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
            Fonte dati importata
          </Badge>
          {projectSourceLabel ? (
            <a
              href={project.projectSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              {projectSourceLabel}
            </a>
          ) : (
            <p className="text-muted-foreground">
              {project.importSourceLabel ||
                "Fonte effettiva dei dati pubblicati non determinabile"}
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            {projectSourceLabel
              ? project.dataOrigin === "static-municipal"
                ? "Scheda ufficiale usata per acquisire anagrafica, CUP, importo, missione e allegati esposti dal Comune."
                : "Fonte usata per leggere o verificare anagrafica, importi, missione e stato dei CUP selezionati."
              : "Il metadato dell'ultimo tentativo è separato dai dati già pubblicati: serve verifica tecnica prima di attribuire una fonte puntuale."}
          </p>
        </div>
        <div className="rounded-md bg-card p-2">
          <Badge variant="outline" className="mb-1 text-xs shadow-none">
            Fonte localizzazione territoriale
          </Badge>
          {locationSourceLabel ? (
            <a
              href={project.locationSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              {locationSourceLabel}
            </a>
          ) : (
            <p className="text-muted-foreground">
              Fonte localizzazione effettiva non determinabile dai metadati
              disponibili.
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            {locationSourceLabel
              ? project.dataOrigin === "static-municipal"
                ? "L'inclusione nella sezione comunale definisce il perimetro del feed, ma non prova l'ubicazione puntuale del singolo intervento."
                : "Fonte usata per filtrare o verificare i CUP associati al Comune di Lamezia Terme prima della pubblicazione nel tracker."
              : "Il metadato disponibile non permette di attribuire con certezza la fonte di localizzazione delle righe già pubblicate."}
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

function LinkedContractsSection({ project }: { project: PnrrViewProject }) {
  const linkedContracts = asApiList<PnrrViewProject["linkedContracts"][number]>(
    project.linkedContracts,
  );

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
