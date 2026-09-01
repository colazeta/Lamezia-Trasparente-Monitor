import { useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
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
  ChevronDown,
  ChevronLeft,
  Copy,
  History,
  Share2,
  type LucideIcon,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  buildPnrrEvidenceTimeline,
  type PnrrEvidenceEvent,
} from "@/lib/pnrrEvidenceTimeline";
import { withPublicBasePath } from "@/lib/publicBasePath";
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

function normaliseCup(value: string | null | undefined) {
  return value?.replace(/[^a-z0-9]/gi, "").toUpperCase() ?? "";
}

function pnrrProjectPath(cup: string) {
  return `/pnrr/${encodeURIComponent(normaliseCup(cup))}` as const;
}

async function copyText(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  if (typeof document === "undefined" || !document.execCommand) {
    throw new Error("Clipboard API unavailable");
  }

  const area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(area);
  if (!copied) throw new Error("Copy command failed");
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
  if (url.includes("opencup.gov.it/")) {
    return "OpenCUP — Sistema CUP";
  }
  return url.includes("openpnrr.it")
    ? "OpenPNRR — progetti/localizzazioni per Comune"
    : fallback;
}

function dataStatus(project: PnrrViewProject) {
  if (project.dataOrigin === "static-municipal")
    return project.openCup
      ? "ufficiale (Comune + OpenCUP)"
      : project.openCupAcquisition?.status === "pending"
        ? "ufficiale (Comune; OpenCUP in acquisizione)"
        : "ufficiale (scheda Comune acquisita)";
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
  const [isProjectRoute, routeParams] = useRoute("/pnrr/:cup");
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
  const requestedCup = isProjectRoute ? normaliseCup(routeParams?.cup) : null;
  const requestedProject = useMemo(
    () =>
      requestedCup
        ? (projects.find(
            (project) => normaliseCup(project.cup) === requestedCup,
          ) ?? null)
        : null,
    [projects, requestedCup],
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
          project.openCup?.title,
          project.openCup?.description,
          project.openCup?.infrastructure,
          project.openCup?.reference_address,
          project.openCup?.classification.nature,
          project.openCup?.classification.typology,
          project.openCup?.classification.sector,
          project.openCup?.classification.subsector,
          project.openCup?.classification.category,
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

  if (isProjectRoute) {
    return (
      <PnrrProjectPermalinkPage
        project={requestedProject}
        requestedCup={requestedCup ?? ""}
        sourceLoading={sourceLoading}
        sourceUnavailable={sourceUnavailable}
      />
    );
  }

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
              arricchite con l'anagrafica ufficiale OpenCUP e i collegamenti
              alle fonti disponibili. La lettura resta documentale: non deduce
              avanzamento, ritardi o criticità non presenti nelle fonti.
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
                ? "Le schede ufficiali del Comune e i corredi OpenCUP sono materializzati nella pubblicazione con provenienza separata e collegamenti verificabili."
                : "Le schede comunali sono integrate con i dati disponibili dal servizio PNRR, mantenendo provenienza e regole di riconciliazione esplicite."
          }
          findItems={[
            "Schede acquisite, CUP univoci, missioni e misure condivise tra più progetti.",
            "Anagrafica OpenCUP con costi previsti, localizzazione e classificazione del progetto.",
            "Collegamenti a schede comunali, Albo Pretorio, contratti e allegati quando rilevati.",
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
              coincide. OpenCUP descrive la decisione di investimento: il suo
              stato non equivale allo stato dei lavori o alla conferma del
              finanziamento PNRR.
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
          {LAMEZIA_PNRR_STATIC_DATA.coverage.projects_with_opencup > 0 && (
            <p className="flex flex-wrap items-center gap-1.5">
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
              Arricchimento anagrafico:{" "}
              <a
                href={LAMEZIA_PNRR_STATIC_DATA.metadata.opencup_source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                {LAMEZIA_PNRR_STATIC_DATA.metadata.opencup_source}
              </a>
              <span>
                · {LAMEZIA_PNRR_STATIC_DATA.coverage.projects_with_opencup} CUP
                verificati · costo e finanziamento pubblico esposti in{" "}
                {
                  LAMEZIA_PNRR_STATIC_DATA.coverage
                    .projects_with_opencup_public_funding
                }{" "}
                schede
              </span>
            </p>
          )}
          <p>
            {LAMEZIA_PNRR_STATIC_DATA.metadata.coverage_note}{" "}
            {LAMEZIA_PNRR_STATIC_DATA.metadata.reconciliation_rule}
          </p>
        </div>

        <section
          aria-labelledby="pnrr-code-guide"
          className="mb-8 rounded-xl border border-sky-200 bg-sky-50/70 p-4 text-sm dark:border-sky-500/30 dark:bg-sky-500/10"
        >
          <div className="flex items-start gap-3">
            <Hash
              className="mt-0.5 h-5 w-5 shrink-0 text-sky-700 dark:text-sky-300"
              aria-hidden="true"
            />
            <div>
              <h2
                id="pnrr-code-guide"
                className="font-display font-bold text-foreground"
              >
                Come leggere i codici
              </h2>
              <p className="mt-1 leading-relaxed text-muted-foreground">
                Il <strong className="text-foreground">CUP</strong> identifica
                il singolo progetto d'investimento. Missione, componente e
                misura sono invece livelli del PNRR condivisi: più progetti con
                CUP diversi possono quindi riportare, correttamente, lo stesso
                codice di missione o investimento.
              </p>
            </div>
          </div>
        </section>

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
                <div data-tour="pnrr-list" className="mb-12 space-y-6">
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

function PnrrProjectPermalinkPage({
  project,
  requestedCup,
  sourceLoading,
  sourceUnavailable,
}: {
  project: PnrrViewProject | null;
  requestedCup: string;
  sourceLoading: boolean;
  sourceUnavailable: boolean;
}) {
  const canonicalPath = requestedCup ? pnrrProjectPath(requestedCup) : "/pnrr";

  return (
    <>
      <PageMeta
        title={
          project
            ? `${project.title} — CUP ${project.cup ?? requestedCup}`
            : requestedCup
              ? `Progetto PNRR — CUP ${requestedCup}`
              : "Progetto PNRR"
        }
        description={
          project
            ? `Scheda civica del progetto PNRR con CUP ${project.cup ?? requestedCup}, fonti disponibili e cronologia delle evidenze pubblicate.`
            : "Scheda civica puntuale di un progetto PNRR, da verificare sulle fonti pubbliche disponibili."
        }
        path={canonicalPath}
      />
      <div
        className="container mx-auto max-w-6xl px-4 py-8 md:py-12"
        data-testid="pnrr-permalink-page"
      >
        <Link
          href="/pnrr#pnrr-elenco"
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Torna a tutti i progetti PNRR
        </Link>

        {sourceLoading ? (
          <div className="space-y-4" role="status">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        ) : sourceUnavailable ? (
          <SourceAvailabilityNotice
            description="Il servizio dati PNRR non risponde con un payload verificabile e non è disponibile una scheda materializzata per il CUP richiesto. Questo stato non dimostra l'assenza del progetto."
            sourceHref={COMUNE_PNRR_URL}
            sourceLabel="Consulta la sezione PNRR del Comune"
          />
        ) : project ? (
          <>
            <div className="mb-5 rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 text-sm text-sky-950 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100">
              Questa è la scheda stabile del CUP {project.cup}. Il collegamento
              identifica lo stesso progetto presente nell'elenco generale e non
              crea una seconda registrazione.
            </div>
            <PnrrCard
              project={project}
              headingLevel="h1"
              isPermalink
              defaultDossierOpen
            />
          </>
        ) : (
          <Empty className="border border-dashed border-border bg-muted/20">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-brand/10 text-brand">
                <Hash className="h-6 w-6" aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle className="font-display">
                CUP non trovato nel perimetro pubblicato
              </EmptyTitle>
              <EmptyDescription>
                {requestedCup
                  ? `Il CUP ${requestedCup} non corrisponde a una scheda del censimento disponibile.`
                  : "Il collegamento non contiene un CUP valido."}{" "}
                L'assenza dalla pagina non dimostra che il progetto non esista.
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
                      CUP · ID progetto {card.cup}
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

export function OpenCupProjectDetails({
  project,
}: {
  project: PnrrViewProject;
}) {
  const openCup = project.openCup;
  const acquisition = project.openCupAcquisition;
  if (!openCup) {
    if (acquisition?.status !== "pending") return null;
    return (
      <div
        className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100"
        data-testid={`pnrr-opencup-pending-${project.id}`}
      >
        <p className="font-semibold">OpenCUP in acquisizione automatica</p>
        <p className="mt-1 text-xs">
          Il CUP è presente nella scheda comunale, ma il corredo OpenCUP non era
          disponibile quando lo stato è stato registrato il{" "}
          {formatDate(acquisition.status_observed_at)}. Il flusso lo ritenterà
          automaticamente al prossimo controllo.
        </p>
      </div>
    );
  }

  const amountsDiffer =
    project.importoFinanziato != null &&
    openCup.public_funding_eur != null &&
    Math.abs(project.importoFinanziato - openCup.public_funding_eur) > 0.01;
  const location = joinOpenCupValues([
    openCup.reference_address,
    openCup.location.municipality,
    openCup.location.province,
    openCup.location.region,
  ]);
  const holderClassification = joinOpenCupValues([
    openCup.holder.area,
    openCup.holder.category,
    openCup.holder.subcategory,
  ]);
  const cipessResolution = joinOpenCupValues([
    openCup.cipess.resolution_number
      ? `n. ${openCup.cipess.resolution_number}`
      : null,
    openCup.cipess.resolution_year != null
      ? String(openCup.cipess.resolution_year)
      : null,
  ]);

  return (
    <details
      className="group overflow-hidden rounded-lg border border-sky-200/80 bg-sky-50/40 dark:border-sky-500/30 dark:bg-sky-500/5"
      data-testid={`pnrr-opencup-${project.id}`}
    >
      <summary className="flex cursor-pointer list-none items-start gap-3 px-4 py-3 marker:content-none hover:bg-sky-100/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset dark:hover:bg-sky-500/10">
        <ExternalLink
          className="mt-0.5 h-4 w-4 shrink-0 text-sky-700 dark:text-sky-300"
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">
            Anagrafica ufficiale OpenCUP
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            CUP {openCup.cup}
            {openCup.decision_year != null
              ? ` · decisione ${openCup.decision_year}`
              : ""}
            {openCup.cup_status ? ` · stato CUP ${openCup.cup_status}` : ""}
          </span>
        </span>
        <span className="shrink-0 text-xs font-semibold text-primary group-open:hidden">
          Apri
        </span>
        <span className="hidden shrink-0 text-xs font-semibold text-primary group-open:inline">
          Chiudi
        </span>
      </summary>

      <div className="border-t border-sky-200/70 px-4 py-4 dark:border-sky-500/20">
        {acquisition?.status === "stale" && (
          <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            OpenCUP non era disponibile quando lo stato è stato registrato il{" "}
            {formatDate(acquisition.status_observed_at)}. È mostrato l'ultimo
            corredo valido, acquisito il{" "}
            {acquisition.acquired_at
              ? `${formatDate(acquisition.acquired_at)}.`
              : "data non disponibile."}{" "}
            Il flusso proverà di nuovo automaticamente.
          </p>
        )}
        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
          {LAMEZIA_PNRR_STATIC_DATA.metadata.opencup_caveat} I valori OpenCUP
          restano distinti da quelli esposti nella scheda comunale.
        </p>

        <dl className="grid gap-x-6 gap-y-3 md:grid-cols-2 lg:grid-cols-3">
          <MetaRow label="Denominazione OpenCUP" value={openCup.title} />
          <MetaRow label="Descrizione OpenCUP" value={openCup.description} />
          <MetaRow
            label="Struttura / infrastruttura"
            value={openCup.infrastructure}
          />
          <MetaRow
            label="Anno della decisione"
            value={
              openCup.decision_year != null
                ? String(openCup.decision_year)
                : null
            }
          />
          <MetaRow label="Stato del CUP" value={openCup.cup_status} />
          <MetaRow
            label="Acquisizione del corredo OpenCUP"
            value={
              acquisition?.acquired_at
                ? formatDate(acquisition.acquired_at)
                : null
            }
          />
          <MetaRow
            label="Data di generazione CUP"
            value={
              openCup.generated_at ? formatDate(openCup.generated_at) : null
            }
          />
          <MetaRow
            label="Costo totale previsto — OpenCUP"
            value={formatImporto(openCup.total_cost_eur)}
            fallback="Non disponibile nella scheda OpenCUP"
          />
          <MetaRow
            label="Finanziamento pubblico previsto — OpenCUP"
            value={formatImporto(openCup.public_funding_eur)}
            fallback="Non disponibile nella scheda OpenCUP"
          />
          <MetaRow
            label="Copertura finanziaria — OpenCUP"
            value={openCup.financial.coverage}
          />
          <MetaRow label="Titolare OpenCUP" value={openCup.holder.name} />
          <MetaRow
            label="CF / Partita IVA titolare"
            value={openCup.holder.tax_code}
          />
          <MetaRow
            label="Classificazione del titolare"
            value={holderClassification}
          />
          <MetaRow
            label="CF / Partita IVA beneficiario"
            value={openCup.beneficiary_tax_code}
          />
          <MetaRow label="Indirizzo / localizzazione" value={location} />
          <MetaRow
            label="Natura del progetto"
            value={openCup.classification.nature}
          />
          <MetaRow
            label="Tipologia OpenCUP"
            value={openCup.classification.typology}
          />
          <MetaRow
            label="Area d'intervento"
            value={openCup.classification.intervention_area}
          />
          <MetaRow label="Settore" value={openCup.classification.sector} />
          <MetaRow
            label="Sottosettore"
            value={openCup.classification.subsector}
          />
          <MetaRow
            label="Categoria OpenCUP"
            value={openCup.classification.category}
          />
          <MetaRow
            label="Strumento di programmazione"
            value={openCup.programming_instrument}
          />
          <MetaRow
            label="Infrastruttura unica"
            value={formatOpenCupBoolean(openCup.unique_infrastructure)}
          />
          <MetaRow label="CUP master" value={openCup.master_cup} />
          <MetaRow
            label="Numero di CUP collegati"
            value={
              openCup.linked_cups_count != null
                ? String(openCup.linked_cups_count)
                : null
            }
          />
          <MetaRow
            label="Atti di concessione o finanza"
            value={formatOpenCupBoolean(
              openCup.financial.concession_or_finance_acts,
            )}
          />
          <MetaRow
            label="Sponsorizzazioni"
            value={openCup.financial.sponsorships}
          />
          <MetaRow label="Delibera CIPESS" value={cipessResolution} />
          <MetaRow
            label="Legge obiettivo"
            value={formatOpenCupBoolean(
              openCup.cipess.strategic_infrastructure_law,
            )}
          />
        </dl>

        {amountsDiffer && (
          <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            L'importo finanziato esposto dal Comune e il finanziamento pubblico
            previsto in OpenCUP non coincidono. Sono riportati entrambi con la
            rispettiva fonte, senza stabilire automaticamente quale sia il
            valore più aggiornato o la ragione della differenza.
          </p>
        )}

        <a
          href={openCup.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          Apri la scheda ufficiale OpenCUP
        </a>
      </div>
    </details>
  );
}

function joinOpenCupValues(values: Array<string | null | undefined>) {
  const uniqueValues = Array.from(new Set(values.filter(Boolean)));
  return uniqueValues.length > 0 ? uniqueValues.join(" · ") : null;
}

function formatOpenCupBoolean(value: boolean | null) {
  return value == null ? null : value ? "Sì" : "No";
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
      className="group overflow-hidden rounded-lg border border-border/70 bg-muted/10"
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

function PnrrCard({
  project,
  headingLevel = "h3",
  isPermalink = false,
  defaultDossierOpen = false,
}: {
  project: PnrrViewProject;
  headingLevel?: "h1" | "h3";
  isPermalink?: boolean;
  defaultDossierOpen?: boolean;
}) {
  const attachmentsCount = asApiList<PnrrViewAttachment>(
    project.attachments,
  ).length;
  const linkedContractsCount = asApiList<
    PnrrViewProject["linkedContracts"][number]
  >(project.linkedContracts).length;
  const acquisitionStatus = project.openCupAcquisition?.status;
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [dossierOpen, setDossierOpen] = useState(defaultDossierOpen);
  const ProjectHeading = headingLevel;
  const projectPermalink = project.cup ? pnrrProjectPath(project.cup) : null;

  const handleCopy = async (value: string, successMessage: string) => {
    try {
      await copyText(value);
      setCopyFeedback(successMessage);
    } catch {
      setCopyFeedback(
        "Copia non riuscita: usa il collegamento o la barra del browser.",
      );
    }
  };

  const handleCopyLink = () => {
    if (!projectPermalink) return;
    const publicPath = withPublicBasePath(projectPermalink);
    const value =
      typeof window === "undefined"
        ? publicPath
        : new URL(publicPath, window.location.origin).toString();
    void handleCopy(value, "Link stabile copiato negli appunti.");
  };

  return (
    <article
      id={`pnrr-project-${normaliseCup(project.cup) || project.id}`}
      data-tour="pnrr-detail"
      className="relative overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <span
        className="absolute inset-y-0 left-0 w-1 bg-brand"
        aria-hidden="true"
      />

      <div className="bg-gradient-to-br from-brand/10 via-card to-card px-5 py-5 md:px-6 md:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {project.cup ? (
                <Badge
                  variant="brand"
                  className="font-mono text-xs shadow-none"
                >
                  CUP · ID progetto {project.cup}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs shadow-none">
                  CUP non disponibile
                </Badge>
              )}
              {project.mission && (
                <Badge variant="outline" className="text-xs shadow-none">
                  Missione {project.mission.split(" ")[0]}
                </Badge>
              )}
              {project.component && (
                <Badge
                  variant="outline"
                  className="font-mono text-xs shadow-none"
                >
                  Componente {project.component.split(" ")[0]}
                </Badge>
              )}
              <Badge
                variant="outline"
                className="font-mono text-xs text-muted-foreground shadow-none"
              >
                {project.dataOrigin === "static-municipal"
                  ? "Scheda Comune"
                  : "ID interno"}{" "}
                {project.id}
              </Badge>
            </div>

            <ProjectHeading className="max-w-4xl text-lg font-display font-bold leading-snug text-foreground md:text-xl">
              {project.title}
            </ProjectHeading>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 lg:max-w-xs lg:justify-end">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800 ring-1 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-200 dark:ring-sky-500/30">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {acquisitionStatus === "fresh"
                ? "OpenCUP acquisito"
                : acquisitionStatus === "stale"
                  ? "OpenCUP: ultimo dato valido"
                  : acquisitionStatus === "pending"
                    ? "OpenCUP in acquisizione"
                    : dataStatus(project)}
            </span>
            {project.freshnessAssessment !== "current" && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${
                  project.freshnessAssessment === "stale"
                    ? "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/30"
                    : "bg-muted text-muted-foreground ring-border"
                }`}
              >
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {project.freshnessAssessment === "stale"
                  ? "Aggiornamento da verificare"
                  : "Data non indicata"}
              </span>
            )}
          </div>
        </div>

        <div
          className="mt-5 flex flex-col gap-2 rounded-xl border border-border/60 bg-card/80 px-4 py-3 sm:flex-row sm:items-start sm:justify-between"
          data-testid={`pnrr-declared-status-${project.id}`}
        >
          <div className="flex min-w-0 items-start gap-2.5">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Hammer className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Stato dichiarato del progetto
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                {project.status || "Non disponibile nelle fonti acquisite."}
              </p>
            </div>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground sm:text-right">
            Separato dallo stato tecnico di acquisizione e dallo stato
            anagrafico del CUP: non viene dedotto dai documenti collegati.
          </p>
        </div>

        <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ProjectFact
            icon={Euro}
            label="Importo esposto"
            value={formatImporto(project.importoFinanziato)}
            fallback="Non disponibile"
            highlight
          />
          <ProjectFact
            icon={Building2}
            label="Soggetto attuatore"
            value={project.attuatore ?? project.holder}
            fallback="Non disponibile"
          />
          <ProjectFact
            icon={MapPin}
            label="Localizzazione"
            value={project.location}
            fallback="Non disponibile"
          />
          <ProjectFact
            icon={Calendar}
            label={
              project.freshnessAssessment === "not_assessed"
                ? "Pubblicazione scheda"
                : "Ultimo aggiornamento"
            }
            value={
              project.freshnessAssessment === "not_assessed"
                ? formatDate(project.publishedAt)
                : formatDate(project.lastUpdatedAt)
            }
          />
        </dl>

        <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-xl border border-border/60 bg-card/80">
          <ProjectEvidenceCount
            icon={Paperclip}
            value={attachmentsCount}
            label="Allegati comunali"
          />
          <ProjectEvidenceCount
            icon={FileText}
            value={project.documentsCount}
            label="Atti collegati"
          />
          <ProjectEvidenceCount
            icon={Link2}
            value={linkedContractsCount}
            label="Contratti collegati"
          />
        </div>

        {project.cup && projectPermalink && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/50 pt-4">
            {!isPermalink && (
              <Link
                href={projectPermalink}
                aria-label={`Apri la scheda stabile del CUP ${project.cup}: ${project.title}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-semibold transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Link2 className="h-4 w-4" aria-hidden="true" />
                Apri scheda CUP
              </Link>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9"
              aria-label={`Copia CUP ${project.cup} di ${project.title}`}
              onClick={() =>
                void handleCopy(
                  project.cup ?? "",
                  `CUP ${project.cup} copiato negli appunti.`,
                )
              }
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              Copia CUP
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9"
              aria-label={`Copia il link della scheda CUP ${project.cup}: ${project.title}`}
              onClick={handleCopyLink}
            >
              <Share2 className="h-4 w-4" aria-hidden="true" />
              Copia link
            </Button>
            {copyFeedback && (
              <span
                className="text-sm font-medium text-muted-foreground"
                role="status"
              >
                {copyFeedback}
              </span>
            )}
          </div>
        )}
      </div>

      <details
        className="group/dossier border-t border-border/60"
        open={dossierOpen}
        onToggle={(event) => setDossierOpen(event.currentTarget.open)}
      >
        <summary
          className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 marker:content-none hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset md:px-6"
          data-testid={`pnrr-dossier-toggle-${project.id}`}
          aria-label={`Dossier completo del progetto: ${project.title}${
            project.cup ? ` — CUP ${project.cup}` : ""
          }`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <FolderKanban className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground">
              Dossier completo del progetto
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
              Anagrafica, fonti, OpenCUP, documenti, atti e contratti
            </span>
          </span>
          <span className="hidden text-xs font-semibold text-primary sm:inline group-open/dossier:hidden">
            Apri la scheda
          </span>
          <span className="hidden text-xs font-semibold text-primary sm:group-open/dossier:inline">
            Riduci
          </span>
          <ChevronDown
            className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open/dossier:rotate-180"
            aria-hidden="true"
          />
        </summary>

        <div
          className="space-y-4 border-t border-border/60 bg-muted/10 p-4 md:p-5"
          data-testid={`pnrr-dossier-${project.id}`}
        >
          <section
            className="rounded-xl border border-border/70 bg-card p-4"
            aria-labelledby={`pnrr-overview-${project.id}`}
          >
            <h4
              id={`pnrr-overview-${project.id}`}
              className="mb-3 flex items-center gap-2 text-sm font-display font-bold text-foreground"
            >
              <Layers className="h-4 w-4 text-brand" aria-hidden="true" />
              Quadro del progetto
            </h4>
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
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
              <MetaRow label="Disponibilità dati" value={dataStatus(project)} />
            </dl>
          </section>

          <SourceTraceability project={project} />

          <ProjectEvidenceTimeline project={project} />

          <OpenCupProjectDetails project={project} />

          {project.dataOrigin !== "static-municipal" && (
            <section className="rounded-xl border border-border/70 bg-card p-4">
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
            </section>
          )}

          <MunicipalDocumentArchive project={project} />

          <section
            className="rounded-xl border border-border/70 bg-card p-4"
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
      </details>
    </article>
  );
}

function ProjectEvidenceTimeline({ project }: { project: PnrrViewProject }) {
  const timeline = useMemo(() => buildPnrrEvidenceTimeline(project), [project]);
  const visibleEvents = timeline.events.slice(0, 8);
  const remainingEvents = timeline.events.slice(8);

  return (
    <section
      className="rounded-xl border border-border/70 bg-card p-4"
      aria-labelledby={`pnrr-timeline-title-${project.id}`}
      data-testid={`pnrr-evidence-timeline-${project.id}`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <History className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h4
            id={`pnrr-timeline-title-${project.id}`}
            className="text-sm font-display font-bold text-foreground"
          >
            Cronologia delle evidenze pubblicate
          </h4>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Ordina soltanto schede, acquisizioni e documenti per le date
            disponibili. Non rappresenta l'avanzamento fisico, amministrativo o
            finanziario del progetto.
          </p>
        </div>
      </div>

      {visibleEvents.length > 0 ? (
        <div className="mt-4">
          <EvidenceTimelineList events={visibleEvents} />
          {remainingEvents.length > 0 && (
            <details className="group/timeline mt-3 border-t border-border/60 pt-3">
              <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-primary marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <ChevronDown
                  className="h-4 w-4 transition-transform group-open/timeline:rotate-180"
                  aria-hidden="true"
                />
                Mostra altri {remainingEvents.length} eventi datati
              </summary>
              <div className="mt-3">
                <EvidenceTimelineList events={remainingEvents} />
              </div>
            </details>
          )}
        </div>
      ) : (
        <p className="mt-4 rounded-lg bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          Nessuna evidenza con una data utilizzabile è disponibile per questa
          scheda.
        </p>
      )}

      {timeline.undatedEvidenceCount > 0 && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {timeline.undatedEvidenceCount}{" "}
          {timeline.undatedEvidenceCount === 1
            ? "documento privo"
            : "documenti privi"}{" "}
          di una data sufficientemente precisa restano consultabili
          nell'archivio documentale, ma non vengono ordinati nella cronologia.
        </p>
      )}
    </section>
  );
}

function EvidenceTimelineList({ events }: { events: PnrrEvidenceEvent[] }) {
  return (
    <ol className="space-y-0">
      {events.map((event) => {
        const Icon =
          event.kind === "municipal_attachment"
            ? Paperclip
            : event.kind === "albo_publication"
              ? FileText
              : event.kind === "contract_award"
                ? Link2
                : event.kind === "opencup_generation" ||
                    event.kind === "opencup_acquisition"
                  ? ExternalLink
                  : RefreshCw;
        const title = (
          <>
            <Icon
              className="mt-0.5 h-4 w-4 shrink-0 text-brand"
              aria-hidden="true"
            />
            <span>{event.title}</span>
          </>
        );

        return (
          <li
            key={event.id}
            className="grid gap-2 border-l-2 border-brand/20 pb-4 pl-4 last:pb-0 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-4"
            data-event-date={event.date}
            data-event-precision={event.datePrecision}
          >
            <div>
              <time
                dateTime={
                  event.datePrecision === "day" ? event.date : undefined
                }
                className="text-sm font-semibold tabular-nums text-foreground"
              >
                {event.datePrecision === "year"
                  ? event.date
                  : formatDate(event.date)}
              </time>
              {event.datePrecision === "year" && (
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  solo anno
                </span>
              )}
            </div>
            <div className="min-w-0">
              {event.href ? (
                event.href.startsWith("/") ? (
                  <Link
                    href={event.href}
                    className="flex items-start gap-2 text-sm font-semibold leading-snug text-primary hover:underline"
                  >
                    {title}
                  </Link>
                ) : (
                  <a
                    href={event.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 text-sm font-semibold leading-snug text-primary hover:underline"
                  >
                    {title}
                  </a>
                )
              ) : (
                <p className="flex items-start gap-2 text-sm font-semibold leading-snug text-foreground">
                  {title}
                </p>
              )}
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {event.sourceLabel}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {event.description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
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
      className="rounded-lg border border-border/60 bg-muted/20 p-3"
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
              ? project.locationSourceUrl?.includes("opencup.gov.it/")
                ? "Indirizzo o area dichiarati nel corredo OpenCUP; non equivalgono a una geocodifica verificata del cantiere."
                : project.dataOrigin === "static-municipal"
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
      className="rounded-xl border border-border/70 bg-card p-4"
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

function ProjectFact({
  icon: Icon,
  label,
  value,
  fallback,
  highlight = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string | null | undefined;
  fallback?: string;
  highlight?: boolean;
}) {
  const displayValue = value || fallback || "—";
  return (
    <div
      className={`min-w-0 rounded-xl border px-3.5 py-3 ${
        highlight ? "border-brand/25 bg-brand/5" : "border-border/60 bg-card/80"
      }`}
    >
      <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon
          className={`h-3.5 w-3.5 ${highlight ? "text-brand" : ""}`}
          aria-hidden="true"
        />
        {label}
      </dt>
      <dd
        className={`mt-1 break-words text-sm font-semibold leading-snug ${
          value ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {displayValue}
      </dd>
    </div>
  );
}

function ProjectEvidenceCount({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: number;
  label: string;
}) {
  return (
    <div className="flex min-w-0 items-center justify-center gap-2 border-r border-border/60 px-2 py-3 last:border-r-0 sm:px-4">
      <Icon className="hidden h-4 w-4 text-brand sm:block" aria-hidden="true" />
      <span className="min-w-0 text-center sm:text-left">
        <span className="block text-base font-display font-bold tabular-nums text-foreground">
          {value}
        </span>
        <span className="block text-[11px] font-medium leading-tight text-muted-foreground sm:text-xs">
          {label}
        </span>
      </span>
    </div>
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
