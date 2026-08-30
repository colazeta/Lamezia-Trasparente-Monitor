import { useEffect, useMemo, useRef } from "react";
import { useListDelibere, type Publication } from "@workspace/api-client-react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileArchive,
  FileText,
  Gavel,
  RotateCcw,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Link, useLocation, useSearch } from "wouter";

import { AlboLink } from "@/components/AlboLink";
import { PageMeta } from "@/components/seo/PageMeta";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DELIBERE_ARCHIVE_ITEMS,
  DELIBERE_ARCHIVE_SUMMARY,
} from "@/data/delibereArchive";
import { ALBO_VERIFICATION_LABELS } from "@/data/alboStatus";
import { asApiList } from "@/lib/apiList";
import {
  ALL_DELIBERE_THEMES,
  DEFAULT_DELIBERA_FILTERS,
  deliberaDocumentSummary,
  deliberaOrganCounts,
  deliberaThemeOptions,
  deliberaYearOptions,
  filterDelibere,
  mergeDelibere,
  paginateDelibere,
  parseDeliberaReaderState,
  updateDeliberaReaderSearch,
  type DeliberaFilterState,
  type DeliberaListItem,
  type DeliberaOrgan,
  type DeliberaOrganFilter,
  type DeliberaReaderStatePatch,
} from "@/lib/delibereView";
import { cn } from "@/lib/utils";

const TABS: Array<{ value: DeliberaOrganFilter; label: string }> = [
  { value: "all", label: "Tutte" },
  { value: "giunta", label: "Giunta" },
  { value: "consiglio", label: "Consiglio" },
];
const PAGE_SIZE = 20;
const LONG_TITLE_LENGTH = 150;
const SELECT_CLASS =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring";

function formatDate(value: string | null | undefined) {
  if (!value) return "Data non disponibile";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Data non disponibile"
    : format(date, "dd MMM yyyy", { locale: it });
}

function organLabel(organ: DeliberaOrgan) {
  if (organ === "giunta") return "Giunta comunale";
  if (organ === "consiglio") return "Consiglio comunale";
  return "Altro organo";
}

function activeFilterCount(filters: DeliberaFilterState): number {
  return (
    Number(Boolean(filters.query.trim())) +
    Number(filters.organ !== "all") +
    Number(filters.theme !== ALL_DELIBERE_THEMES) +
    Number(Boolean(filters.year)) +
    Number(Boolean(filters.dateFrom || filters.dateTo))
  );
}

function DeliberaCard({ item }: { item: DeliberaListItem }) {
  const documents = deliberaDocumentSummary(item);
  const longTitle = item.subject.length > LONG_TITLE_LENGTH;
  const titleId = `delibera-${item.publicId.replace(/[^a-z0-9-]/giu, "-")}`;

  return (
    <Card
      data-testid="delibera-card"
      aria-labelledby={titleId}
      className="group p-4 transition-colors hover:border-brand/40 sm:p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{organLabel(item.organ)}</Badge>
          {item.actNumber && (
            <span className="font-mono text-xs font-semibold text-foreground">
              Delibera n. {item.actNumber}
            </span>
          )}
          <Badge variant="outline">
            {item.themeLabel ?? "Area non disponibile"}
          </Badge>
          <Badge
            variant={
              documents.status === "archived"
                ? "success"
                : documents.status === "available"
                  ? "secondary"
                  : "outline"
            }
          >
            {documents.label}
          </Badge>
          {item.publicVisibility !== "publishable" && (
            <Badge variant="warning">
              {item.publicVisibility === "metadata_only"
                ? "Solo metadati"
                : "Dati minimizzati"}
            </Badge>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5 font-mono text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
          {formatDate(item.actDate ?? item.publicationStart)}
        </div>
      </div>

      <h2
        id={titleId}
        className="mt-3 line-clamp-2 font-display text-base font-bold leading-snug text-foreground transition-colors group-hover:text-brand sm:text-lg"
      >
        {item.subject}
      </h2>

      {longTitle && (
        <details className="mt-2 text-sm text-muted-foreground">
          <summary className="w-fit cursor-pointer font-semibold text-primary hover:underline">
            Leggi il titolo completo
          </summary>
          <p className="mt-2 max-w-3xl leading-6">{item.subject}</p>
        </details>
      )}

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
        {item.publicationNumber && (
          <span className="inline-flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            Pubblicazione {item.publicationNumber}
          </span>
        )}
        {item.isNew && <span className="font-semibold text-brand">Nuovo</span>}
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {item.internalHref && (
            <Link
              href={item.internalHref}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Scheda pubblica
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          )}
          {item.archivedDocumentPath && (
            <a
              href={item.archivedDocumentPath}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              PDF archiviato
            </a>
          )}
          {item.sourceUrl && (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              Fonte ufficiale
            </a>
          )}
        </div>
        {item.attachments.length > 0 && (
          <AlboLink attachments={item.attachments} className="sm:max-w-[55%]" />
        )}
      </div>

      {(item.verificationStatus || item.lastObservedAt) && (
        <details className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
          <summary className="w-fit cursor-pointer font-semibold">
            Tracciabilità del record
          </summary>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <span>Identificativo: {item.publicId}</span>
            {item.verificationStatus && (
              <span>
                Stato: {ALBO_VERIFICATION_LABELS[item.verificationStatus]}
              </span>
            )}
            {item.lastObservedAt && (
              <span>Osservato fino al {formatDate(item.lastObservedAt)}</span>
            )}
          </div>
        </details>
      )}
    </Card>
  );
}

export function Delibere() {
  const search = useSearch();
  const [location, navigate] = useLocation();
  const readerState = useMemo(() => parseDeliberaReaderState(search), [search]);
  const resultsHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const previousPageRef = useRef(readerState.page);
  const focusResultsAfterPageChangeRef = useRef(false);

  const { data: delibereData, isLoading, isError } = useListDelibere();

  const delibere = useMemo(
    () =>
      mergeDelibere(
        DELIBERE_ARCHIVE_ITEMS,
        asApiList<Publication>(delibereData),
      ),
    [delibereData],
  );
  const themeOptions = useMemo(
    () => deliberaThemeOptions(delibere),
    [delibere],
  );
  const yearOptions = useMemo(() => deliberaYearOptions(delibere), [delibere]);
  const selectedThemeIsValid =
    readerState.theme === ALL_DELIBERE_THEMES ||
    themeOptions.some((option) => option.id === readerState.theme);
  const filters: DeliberaFilterState = {
    query: readerState.query,
    organ: readerState.organ,
    theme: selectedThemeIsValid ? readerState.theme : ALL_DELIBERE_THEMES,
    year: readerState.year,
    dateFrom: readerState.dateFrom,
    dateTo: readerState.dateTo,
  };
  const filteredDelibere = useMemo(
    () => filterDelibere(delibere, filters),
    [
      delibere,
      filters.dateFrom,
      filters.dateTo,
      filters.organ,
      filters.query,
      filters.theme,
      filters.year,
    ],
  );
  const organCounts = useMemo(
    () => deliberaOrganCounts(delibere, filters),
    [
      delibere,
      filters.dateFrom,
      filters.dateTo,
      filters.query,
      filters.theme,
      filters.year,
    ],
  );
  const organTabs =
    organCounts.altro > 0 || filters.organ === "altro"
      ? [...TABS, { value: "altro" as const, label: "Altro" }]
      : TABS;
  const pagination = paginateDelibere(
    filteredDelibere,
    readerState.page,
    PAGE_SIZE,
  );
  const selectedTheme = themeOptions.find(
    (option) => option.id === filters.theme,
  );
  const filterCount = activeFilterCount(filters);
  const showLoadingState = isLoading && delibere.length === 0;

  function updateReaderState(
    patch: DeliberaReaderStatePatch,
    options: { replace?: boolean } = {},
  ) {
    const nextSearch = updateDeliberaReaderSearch(search, patch);
    navigate(`${location}${nextSearch ? `?${nextSearch}` : ""}`, options);
  }

  function resetFilters() {
    updateReaderState({ ...DEFAULT_DELIBERA_FILTERS, page: 1 });
    searchInputRef.current?.focus();
  }

  function changePage(page: number) {
    focusResultsAfterPageChangeRef.current = true;
    updateReaderState({ page });
  }

  useEffect(() => {
    if (!selectedThemeIsValid) {
      updateReaderState(
        { theme: ALL_DELIBERE_THEMES, page: 1 },
        { replace: true },
      );
    }
  }, [selectedThemeIsValid]);

  useEffect(() => {
    if (readerState.page !== pagination.currentPage) {
      updateReaderState({ page: pagination.currentPage }, { replace: true });
    }
  }, [pagination.currentPage, readerState.page]);

  useEffect(() => {
    if (previousPageRef.current !== pagination.currentPage) {
      if (focusResultsAfterPageChangeRef.current) {
        resultsHeadingRef.current?.focus();
      }
      focusResultsAfterPageChangeRef.current = false;
      previousPageRef.current = pagination.currentPage;
    }
  }, [pagination.currentPage]);

  return (
    <>
      <PageMeta
        title="Archivio delle delibere"
        description="Delibere di Giunta e Consiglio di Lamezia Terme con titoli standardizzati, filtri tematici e collegamenti alla fonte ufficiale."
        path="/delibere"
      />
      <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
        <header className="mb-6 max-w-3xl">
          <span className="eyebrow text-primary">
            <Gavel className="h-3.5 w-3.5" aria-hidden="true" />
            Atti deliberativi
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Archivio delle delibere
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground md:text-lg">
            Delibere di Giunta e Consiglio, ordinate e filtrabili con titoli
            uniformi e rinvio alla fonte ufficiale.
          </p>
        </header>

        <section
          aria-label="Copertura dell'archivio"
          className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <FileArchive className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <div className="font-display text-lg font-bold text-foreground">
                  {DELIBERE_ARCHIVE_SUMMARY.counts.total} atti osservati
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {DELIBERE_ARCHIVE_SUMMARY.counts.giunta} Giunta ·{" "}
                  {DELIBERE_ARCHIVE_SUMMARY.counts.consiglio} Consiglio ·{" "}
                  {DELIBERE_ARCHIVE_SUMMARY.counts.archived_documents} PDF
                  {DELIBERE_ARCHIVE_SUMMARY.counts.archived_documents === 1
                    ? " archiviato"
                    : " archiviati"}
                </p>
              </div>
            </div>
            <a
              href={DELIBERE_ARCHIVE_SUMMARY.source_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Fonte ufficiale
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Copertura{" "}
            {formatDate(DELIBERE_ARCHIVE_SUMMARY.coverage.first_act_date)} –{" "}
            {formatDate(DELIBERE_ARCHIVE_SUMMARY.coverage.last_act_date)}.
            Storico osservato, non completo; i documenti sono mostrati solo se
            autorizzati dal manifest pubblico.
          </p>
          <details className="mt-2 text-xs text-muted-foreground">
            <summary className="w-fit cursor-pointer font-semibold">
              Metodo e limiti
            </summary>
            <ul className="mt-2 list-disc space-y-1 pl-5 leading-5">
              {DELIBERE_ARCHIVE_SUMMARY.known_limits.map((limit) => (
                <li key={limit}>{limit}</li>
              ))}
            </ul>
          </details>
        </section>

        {isError && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-foreground"
          >
            Aggiornamento online non disponibile. L&apos;archivio statico resta
            consultabile con gli stessi filtri.
          </div>
        )}

        <section aria-labelledby="delibere-filter-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                id="delibere-filter-heading"
                className="font-display text-xl font-bold text-foreground"
              >
                Cerca e filtra
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Ricerca per titolo o numero, poi restringi per area e data.
              </p>
            </div>
            {filterCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetFilters}
              >
                <RotateCcw className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                Azzera filtri
              </Button>
            )}
          </div>

          <div className="mt-4 grid gap-3 rounded-xl border border-border bg-muted/20 p-4 md:grid-cols-[1.4fr_1fr_0.65fr]">
            <label className="text-xs font-semibold text-muted-foreground">
              Ricerca
              <span className="relative mt-1 block">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  ref={searchInputRef}
                  value={filters.query}
                  onChange={(event) =>
                    updateReaderState(
                      { query: event.target.value, page: 1 },
                      { replace: true },
                    )
                  }
                  placeholder="Titolo, numero o parola chiave…"
                  className="mt-1 bg-background pl-9"
                />
              </span>
            </label>

            <label className="text-xs font-semibold text-muted-foreground">
              Area tematica
              <select
                aria-label="Filtra per area tematica"
                className={cn(SELECT_CLASS, "mt-1")}
                value={filters.theme}
                onChange={(event) =>
                  updateReaderState({ theme: event.target.value, page: 1 })
                }
              >
                <option value={ALL_DELIBERE_THEMES}>Tutte le aree</option>
                {themeOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-semibold text-muted-foreground">
              Anno
              <select
                aria-label="Filtra per anno"
                className={cn(SELECT_CLASS, "mt-1")}
                value={filters.year}
                onChange={(event) =>
                  updateReaderState({
                    year: event.target.value,
                    dateFrom: "",
                    dateTo: "",
                    page: 1,
                  })
                }
              >
                <option value="">Tutti gli anni</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <details
            className="mt-3 rounded-lg border border-border bg-background px-4 py-3"
            open={filters.dateFrom || filters.dateTo ? true : undefined}
          >
            <summary className="cursor-pointer text-sm font-semibold text-foreground">
              Intervallo personalizzato
            </summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-muted-foreground">
                Dal
                <Input
                  type="date"
                  value={filters.dateFrom}
                  max={filters.dateTo || undefined}
                  onChange={(event) =>
                    updateReaderState({
                      dateFrom: event.target.value,
                      year: "",
                      page: 1,
                    })
                  }
                  className="mt-1"
                />
              </label>
              <label className="text-xs font-semibold text-muted-foreground">
                Al
                <Input
                  type="date"
                  value={filters.dateTo}
                  min={filters.dateFrom || undefined}
                  onChange={(event) =>
                    updateReaderState({
                      dateTo: event.target.value,
                      year: "",
                      page: 1,
                    })
                  }
                  className="mt-1"
                />
              </label>
            </div>
          </details>

          <div
            className="mt-4 inline-flex max-w-full overflow-x-auto rounded-lg border border-border bg-muted/40 p-1"
            role="group"
            aria-label="Filtra per organo"
          >
            {organTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                aria-pressed={filters.organ === tab.value}
                onClick={() => updateReaderState({ organ: tab.value, page: 1 })}
                className={cn(
                  "whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                  filters.organ === tab.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label} ({organCounts[tab.value]})
              </button>
            ))}
          </div>

          {filterCount > 0 && (
            <div
              className="mt-3 flex flex-wrap items-center gap-2"
              role="group"
              aria-label="Filtri attivi"
            >
              <span className="text-xs font-semibold text-muted-foreground">
                Filtri attivi:
              </span>
              {filters.query.trim() && (
                <Badge variant="outline" className="max-w-full truncate">
                  Ricerca: {filters.query.trim()}
                </Badge>
              )}
              {filters.organ !== "all" && (
                <Badge variant="outline">
                  Organo: {organLabel(filters.organ)}
                </Badge>
              )}
              {selectedTheme && (
                <Badge variant="outline">Area: {selectedTheme.label}</Badge>
              )}
              {filters.year && (
                <Badge variant="outline">Anno: {filters.year}</Badge>
              )}
              {(filters.dateFrom || filters.dateTo) && (
                <Badge variant="outline">
                  Periodo: {filters.dateFrom || "inizio"} –{" "}
                  {filters.dateTo || "oggi"}
                </Badge>
              )}
            </div>
          )}
        </section>

        <section className="mt-6" aria-labelledby="delibere-results-heading">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2
                id="delibere-results-heading"
                ref={resultsHeadingRef}
                tabIndex={-1}
                className="font-display text-xl font-bold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Risultati
              </h2>
              <p
                className="mt-1 text-sm text-muted-foreground"
                aria-live="polite"
                aria-atomic="true"
              >
                {filteredDelibere.length} di {delibere.length}{" "}
                {delibere.length === 1 ? "atto" : "atti"}.
              </p>
            </div>
            {filteredDelibere.length > 0 && (
              <span className="text-xs text-muted-foreground">
                Dal più recente
              </span>
            )}
          </div>

          <div className="space-y-3">
            {showLoadingState ? (
              Array.from({ length: 6 }, (_, index) => (
                <Card key={index} className="p-5">
                  <Skeleton className="mb-3 h-4 w-32" />
                  <Skeleton className="h-5 w-full" />
                </Card>
              ))
            ) : delibere.length === 0 ? (
              <Empty className="border bg-muted/20" role="alert">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Gavel />
                  </EmptyMedia>
                  <EmptyTitle>
                    Archivio temporaneamente non disponibile
                  </EmptyTitle>
                  <EmptyDescription>
                    Non risultano record consultabili. Verifica la fonte
                    ufficiale e riprova più tardi.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : pagination.items.length > 0 ? (
              pagination.items.map((item) => (
                <DeliberaCard key={item.publicId} item={item} />
              ))
            ) : (
              <Empty className="border bg-muted/20">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Search />
                  </EmptyMedia>
                  <EmptyTitle>Nessun risultato con questi filtri</EmptyTitle>
                  <EmptyDescription>
                    Prova una ricerca più breve oppure azzera i filtri.
                  </EmptyDescription>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetFilters}
                  >
                    Azzera filtri
                  </Button>
                </EmptyHeader>
              </Empty>
            )}
          </div>

          {pagination.totalPages > 1 && (
            <nav
              className="mt-6 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between"
              aria-label="Paginazione archivio delibere"
            >
              <p className="text-sm text-muted-foreground">
                Risultati {pagination.firstVisible}–{pagination.lastVisible} ·
                Pagina {pagination.currentPage} di {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage === 1}
                  onClick={() => changePage(pagination.currentPage - 1)}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                  Precedente
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => changePage(pagination.currentPage + 1)}
                >
                  Successiva
                  <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </nav>
          )}
        </section>
      </div>
    </>
  );
}
