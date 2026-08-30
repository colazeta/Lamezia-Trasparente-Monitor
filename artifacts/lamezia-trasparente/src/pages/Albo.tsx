import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useLocation, useSearch } from "wouter";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileArchive,
  FileText,
  Info,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
} from "lucide-react";

import { FeedSubscribeButton } from "@/components/FeedSubscribeButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageMeta } from "@/components/seo/PageMeta";
import {
  ALBO_ARCHIVED_DOCUMENTS_BY_ID,
  ALBO_DOCUMENTS_MANIFEST,
  ALBO_PUBLIC_DIFF_CHANGED_ITEMS,
  ALBO_PUBLIC_DIFF_NEW_ITEMS,
  ALBO_PUBLIC_DIFF_REMOVED_ITEMS,
  ALBO_PUBLIC_DIFF_SUMMARY,
  ALBO_PUBLIC_RUN_ITEMS,
  ALBO_PUBLIC_RUN_SUMMARY,
  alboPublicSearchText,
  normalizeAlboPublicSearchText,
  type AlboPublicRunItem,
} from "@/data/alboPublicRun";
import {
  ALBO_OPERATIONAL_STATUS,
  ALBO_VERIFICATION_LABELS,
} from "@/data/alboStatus";
import { MONITORING_DOCS_NOTICE } from "@/lib/monitoring";
import {
  parseAlboReaderState,
  updateAlboReaderSearch,
  type AlboReaderStatePatch,
} from "@/lib/alboReaderState";

type PulseKind = "new" | "changed" | "removed" | "context";

type PulseItem = {
  kind: PulseKind;
  item: AlboPublicRunItem;
};

type ClassificationStat = {
  id: string;
  label: string;
  count: number;
};

const ALL_SECTORS = "all";
const ALL_ACT_CATEGORIES = "all";
const CIVIC_TIMEZONE = "Europe/Rome";
const PULSE_LIMIT = 6;
const PAGE_SIZE = 25;

const PULSE_LABELS: Record<PulseKind, string> = {
  new: "Nuovo",
  changed: "Aggiornato",
  removed: "Non più presente",
  context: "Recente",
};

function normalizeQuery(value: string) {
  return normalizeAlboPublicSearchText(value);
}

function formatCivicDate(value: string | null | undefined) {
  if (!value) return "Data non disponibile";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data non disponibile";

  return new Intl.DateTimeFormat("it-IT", {
    timeZone: CIVIC_TIMEZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatCivicDateTime(value: string | null | undefined) {
  if (!value) return "Non disponibile";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Non disponibile";

  return new Intl.DateTimeFormat("it-IT", {
    timeZone: CIVIC_TIMEZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function civicDateKey(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CIVIC_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return year && month && day ? `${year}-${month}-${day}` : null;
}

function sortByPublication(items: AlboPublicRunItem[]) {
  return [...items].sort((a, b) => {
    const left = `${a.publication_start ?? ""}-${a.publication_number ?? ""}`;
    const right = `${b.publication_start ?? ""}-${b.publication_number ?? ""}`;
    return right.localeCompare(left, "it");
  });
}

function classificationStats(
  items: AlboPublicRunItem[],
  selector: (item: AlboPublicRunItem) => { id: string; label: string },
): ClassificationStat[] {
  const stats = new Map<string, ClassificationStat>();

  for (const item of items) {
    const selected = selector(item);
    const existing = stats.get(selected.id);
    if (existing) {
      existing.count += 1;
    } else {
      stats.set(selected.id, { ...selected, count: 1 });
    }
  }

  return [...stats.values()].sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label, "it"),
  );
}

function buildPulseItems(): PulseItem[] {
  const activity: PulseItem[] = [
    ...ALBO_PUBLIC_DIFF_NEW_ITEMS.map((item) => ({
      kind: "new" as const,
      item,
    })),
    ...ALBO_PUBLIC_DIFF_CHANGED_ITEMS.map((entry) => ({
      kind: "changed" as const,
      item: entry.after,
    })),
    ...ALBO_PUBLIC_DIFF_REMOVED_ITEMS.map((item) => ({
      kind: "removed" as const,
      item,
    })),
  ];

  if (activity.length > 0) return activity.slice(0, PULSE_LIMIT);

  return sortByPublication(ALBO_PUBLIC_RUN_ITEMS)
    .slice(0, PULSE_LIMIT)
    .map((item) => ({ kind: "context" as const, item }));
}

function PulseCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-display text-3xl font-bold tabular-nums text-foreground">
        {value}
      </div>
    </div>
  );
}

function AlboRecordDialog({
  item,
  onClose,
}: {
  item: AlboPublicRunItem | null;
  onClose: () => void;
}) {
  const archivedDocument = item
    ? ALBO_ARCHIVED_DOCUMENTS_BY_ID.get(item.id)
    : null;

  return (
    <Dialog
      open={Boolean(item)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      {item && (
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="pr-6 font-display text-xl leading-snug">
              {item.presentation.display_title}
            </DialogTitle>
            <DialogDescription>
              Metadati acquisiti dalla fonte pubblica il{" "}
              {formatCivicDateTime(item.retrieved_at)}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap items-center gap-2">
            {item.presentation.labels.map((label) => (
              <Badge key={label} variant="outline" className="text-xs">
                {label}
              </Badge>
            ))}
            <Badge variant="secondary" className="text-xs">
              {item.classification.act_category.label}
            </Badge>
            <span className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs font-semibold">
              {item.classification.sector.label}
            </span>
          </div>

          <section className="rounded-xl border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-bold text-foreground">
              Informazioni disponibili
            </h3>
            {item.presentation.summary && (
              <p className="mt-2 text-sm font-semibold leading-6 text-foreground">
                {item.presentation.summary}
              </p>
            )}
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Questa scheda riporta esclusivamente i metadati acquisiti dalla
              fonte ufficiale. Il contenuto del documento non viene
              interpretato, sottoposto a OCR o riassunto automaticamente.
            </p>
            {item.public_note && (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.public_note}
              </p>
            )}
          </section>

          <section>
            <h3 className="mb-3 text-sm font-bold text-foreground">
              Metadati essenziali
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <MetadataField
                label="Pubblicazione"
                value={
                  item.publication_number
                    ? `n. ${item.publication_number}`
                    : "Non disponibile"
                }
              />
              <MetadataField
                label="Periodo"
                value={`${formatCivicDate(item.publication_start)} – ${formatCivicDate(item.publication_end)}`}
              />
              <MetadataField
                label="Atto"
                value={
                  [
                    item.act_type,
                    item.act_number ? `n. ${item.act_number}` : null,
                    item.act_date
                      ? `del ${formatCivicDate(item.act_date)}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" ") || "Non disponibile"
                }
              />
              <MetadataField
                label="Ufficio"
                value={item.office ?? "Non disponibile"}
              />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <FileArchive
                className="h-4 w-4 text-primary"
                aria-hidden="true"
              />
              Documento e fonte
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              {archivedDocument && (
                <a
                  href={archivedDocument.platform_path}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
                >
                  Apri documento archiviato
                  <FileArchive className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
              <a
                href={item.source_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground hover:border-primary/30 hover:text-primary"
              >
                Verifica fonte ufficiale
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
            {!archivedDocument && (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Nessuna copia interna del documento risulta archiviata per
                questo record nello snapshot corrente.
              </p>
            )}
          </section>

          <section className="rounded-xl border border-border bg-muted/20 p-4">
            <h3 className="text-sm font-bold text-foreground">
              Come leggere questa scheda
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Classificazione per settore e tipologia derivata dai metadati
              dell'atto. Per contenuto, allegati, termini e valore legale fa
              fede la fonte istituzionale.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border bg-background px-2 py-1">
                {
                  ALBO_VERIFICATION_LABELS[
                    ALBO_OPERATIONAL_STATUS.verification_status
                  ]
                }
              </span>
              <span className="rounded-full border border-border bg-background px-2 py-1">
                {item.classification.sector.label}
              </span>
              <span className="rounded-full border border-border bg-background px-2 py-1">
                {item.classification.act_category.label}
              </span>
            </div>
          </section>
        </DialogContent>
      )}
    </Dialog>
  );
}

function MetadataField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold leading-snug text-foreground">
        {value}
      </div>
    </div>
  );
}

function PulseItemCard({
  pulse,
  onSelect,
}: {
  pulse: PulseItem;
  onSelect: (item: AlboPublicRunItem, trigger: HTMLElement) => void;
}) {
  return (
    <button
      type="button"
      onClick={(event) => onSelect(pulse.item, event.currentTarget)}
      className="w-full rounded-xl border border-border bg-background p-4 text-left transition-colors hover:border-primary/30 hover:bg-primary/5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
          {PULSE_LABELS[pulse.kind]}
        </span>
        <span className="text-xs font-semibold text-muted-foreground">
          {pulse.item.classification.act_category.label}
        </span>
        {pulse.item.presentation.labels.slice(0, 1).map((label) => (
          <span key={label} className="text-xs font-semibold text-primary">
            {label}
          </span>
        ))}
      </div>
      <h3
        className="mt-2 line-clamp-3 text-sm font-bold leading-snug text-foreground"
        data-long-title={
          pulse.item.presentation.flags.includes("display_title_too_long") ||
          undefined
        }
      >
        {pulse.item.presentation.display_title}
      </h3>
      {pulse.item.presentation.summary && (
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {pulse.item.presentation.summary}
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>{pulse.item.classification.sector.label}</span>
        {pulse.item.publication_number && (
          <span>Pubbl. {pulse.item.publication_number}</span>
        )}
        <span>Dal {formatCivicDate(pulse.item.publication_start)}</span>
      </div>
    </button>
  );
}

function CurrentItemCard({
  item,
  onSelect,
}: {
  item: AlboPublicRunItem;
  onSelect: (item: AlboPublicRunItem, trigger: HTMLElement) => void;
}) {
  const archived = ALBO_ARCHIVED_DOCUMENTS_BY_ID.has(item.id);

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {item.classification.act_category.label}
            </Badge>
            <span className="text-xs font-semibold text-muted-foreground">
              {item.classification.sector.label}
            </span>
            {item.presentation.labels.slice(0, 1).map((label) => (
              <span key={label} className="text-xs font-semibold text-primary">
                {label}
              </span>
            ))}
            {archived && (
              <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                Documento archiviato
              </span>
            )}
          </div>
          <h3
            className="mt-2 line-clamp-3 font-display text-base font-bold leading-snug text-foreground"
            data-long-title={
              item.presentation.flags.includes("display_title_too_long") ||
              undefined
            }
          >
            {item.presentation.display_title}
          </h3>
          {item.presentation.summary && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {item.presentation.summary}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {item.publication_number && (
              <span>Pubbl. {item.publication_number}</span>
            )}
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              Dal {formatCivicDate(item.publication_start)}
            </span>
          </div>
          {item.public_note && (
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {item.public_note}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(event) => onSelect(item, event.currentTarget)}
          className="shrink-0"
        >
          Apri scheda
          <FileText className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>
    </Card>
  );
}

function AlboArchive({
  query,
  sectorFilter,
  actCategoryFilter,
  sectorOptions,
  categoryOptions,
  activeFilterCount,
  totalAvailable,
  filteredCount,
  items,
  currentPage,
  totalPages,
  headingRef,
  onQueryChange,
  onSectorChange,
  onActCategoryChange,
  onReset,
  onPageChange,
  onSelect,
}: {
  query: string;
  sectorFilter: string;
  actCategoryFilter: string;
  sectorOptions: ClassificationStat[];
  categoryOptions: ClassificationStat[];
  activeFilterCount: number;
  totalAvailable: number;
  filteredCount: number;
  items: AlboPublicRunItem[];
  currentPage: number;
  totalPages: number;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onQueryChange: (value: string) => void;
  onSectorChange: (value: string) => void;
  onActCategoryChange: (value: string) => void;
  onReset: () => void;
  onPageChange: (page: number) => void;
  onSelect: (item: AlboPublicRunItem, trigger: HTMLElement) => void;
}) {
  const selectedSector = sectorOptions.find(
    (option) => option.id === sectorFilter,
  );
  const selectedCategory = categoryOptions.find(
    (option) => option.id === actCategoryFilter,
  );
  const firstVisible =
    filteredCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const lastVisible = Math.min(currentPage * PAGE_SIZE, filteredCount);

  return (
    <section className="mt-8" aria-labelledby="archivio-corrente-heading">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="eyebrow text-primary">Archivio corrente</span>
          <h2
            id="archivio-corrente-heading"
            ref={headingRef}
            tabIndex={-1}
            className="mt-2 font-display text-2xl font-bold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-primary md:text-3xl"
          >
            Cerca negli atti disponibili
          </h2>
          <p
            className="mt-2 text-sm leading-6 text-muted-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            {filteredCount} di {totalAvailable} record pubblici mostrati.
          </p>
        </div>
        <a
          href={ALBO_PUBLIC_RUN_SUMMARY.source_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          Fonte ufficiale
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      <div className="mt-5 grid gap-3 rounded-xl border border-border bg-muted/20 p-4 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            aria-label="Cerca atti Albo"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Cerca titolo, numero, ufficio…"
            className="pl-9"
          />
        </div>

        <Select value={sectorFilter} onValueChange={onSectorChange}>
          <SelectTrigger aria-label="Filtra per settore">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_SECTORS}>Tutti i settori</SelectItem>
            {sectorOptions.map((sector) => (
              <SelectItem key={sector.id} value={sector.id}>
                {sector.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={actCategoryFilter} onValueChange={onActCategoryChange}>
          <SelectTrigger aria-label="Filtra per tipologia">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ACT_CATEGORIES}>
              Tutte le tipologie
            </SelectItem>
            {categoryOptions.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {activeFilterCount > 0 && (
        <div
          className="mt-3 flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filtri attivi"
        >
          <span className="text-xs font-semibold text-muted-foreground">
            Filtri attivi:
          </span>
          {query.trim() && (
            <Badge variant="outline" className="max-w-full truncate">
              Ricerca: {query.trim()}
            </Badge>
          )}
          {selectedSector && (
            <Badge variant="outline">Settore: {selectedSector.label}</Badge>
          )}
          {selectedCategory && (
            <Badge variant="outline">Tipologia: {selectedCategory.label}</Badge>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            Azzera filtri
          </Button>
        </div>
      )}

      {totalAvailable === 0 ? (
        <div className="mt-4 rounded-xl border border-border bg-muted/30 p-6">
          <h3 className="font-display text-lg font-bold text-foreground">
            Archivio temporaneamente non disponibile
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Lo snapshot pubblico non contiene record consultabili. Puoi
            verificare direttamente la fonte ufficiale.
          </p>
        </div>
      ) : filteredCount === 0 ? (
        <div className="mt-4 rounded-xl border border-border bg-muted/30 p-6">
          <h3 className="font-display text-lg font-bold text-foreground">
            Nessun risultato con questi filtri
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Prova una ricerca più breve oppure azzera i filtri selezionati.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReset}
            className="mt-4"
          >
            Azzera filtri
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-4 space-y-3" aria-label="Risultati Albo">
            {items.map((item) => (
              <CurrentItemCard key={item.id} item={item} onSelect={onSelect} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between"
              aria-label="Paginazione archivio Albo"
            >
              <p className="text-sm text-muted-foreground">
                Risultati {firstVisible}–{lastVisible} · Pagina {currentPage} di{" "}
                {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => onPageChange(currentPage - 1)}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                  Precedente
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => onPageChange(currentPage + 1)}
                >
                  Successiva
                  <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </nav>
          )}
        </>
      )}
    </section>
  );
}

export function Albo() {
  const search = useSearch();
  const [location, navigate] = useLocation();
  const readerState = useMemo(() => parseAlboReaderState(search), [search]);
  const lastDialogTriggerRef = useRef<HTMLElement | null>(null);
  const resultsHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const previousSelectedActRef = useRef<string | null>(
    readerState.selectedActId,
  );

  const pulseItems = useMemo(() => buildPulseItems(), []);
  const sortedItems = useMemo(
    () => sortByPublication(ALBO_PUBLIC_RUN_ITEMS),
    [],
  );
  const snapshotDay = civicDateKey(ALBO_PUBLIC_RUN_SUMMARY.retrieved_at);
  const dailyItems = useMemo(
    () =>
      sortedItems.filter(
        (item) => civicDateKey(item.publication_start) === snapshotDay,
      ),
    [snapshotDay, sortedItems],
  );
  const dailySectorStats = useMemo(
    () => classificationStats(dailyItems, (item) => item.classification.sector),
    [dailyItems],
  );
  const sectorOptions = useMemo(
    () =>
      classificationStats(
        ALBO_PUBLIC_RUN_ITEMS,
        (item) => item.classification.sector,
      ),
    [],
  );
  const categoryOptions = useMemo(
    () =>
      classificationStats(
        ALBO_PUBLIC_RUN_ITEMS,
        (item) => item.classification.act_category,
      ),
    [],
  );
  const query = readerState.q;
  const sectorFilter = sectorOptions.some(
    (option) => option.id === readerState.sector,
  )
    ? readerState.sector
    : ALL_SECTORS;
  const actCategoryFilter = categoryOptions.some(
    (option) => option.id === readerState.actType,
  )
    ? readerState.actType
    : ALL_ACT_CATEGORIES;

  const filteredItems = useMemo(() => {
    const normalized = normalizeQuery(query);

    return sortedItems.filter((item) => {
      return (
        (!normalized || alboPublicSearchText(item).includes(normalized)) &&
        (sectorFilter === ALL_SECTORS ||
          item.classification.sector.id === sectorFilter) &&
        (actCategoryFilter === ALL_ACT_CATEGORIES ||
          item.classification.act_category.id === actCategoryFilter)
      );
    });
  }, [actCategoryFilter, query, sectorFilter, sortedItems]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const currentPage = Math.min(readerState.page, totalPages);
  const pagedItems = filteredItems.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const itemById = useMemo(() => {
    const items = new Map<string, AlboPublicRunItem>();
    for (const item of sortedItems) items.set(item.id, item);
    for (const pulse of pulseItems) items.set(pulse.item.id, pulse.item);
    return items;
  }, [pulseItems, sortedItems]);
  const selectedItem = readerState.selectedActId
    ? (itemById.get(readerState.selectedActId) ?? null)
    : null;
  const activeFilterCount =
    Number(Boolean(query.trim())) +
    Number(sectorFilter !== ALL_SECTORS) +
    Number(actCategoryFilter !== ALL_ACT_CATEGORIES);
  const previousPageRef = useRef(currentPage);

  function updateReaderState(
    patch: AlboReaderStatePatch,
    options: { replace?: boolean } = {},
  ) {
    const nextSearch = updateAlboReaderSearch(search, patch);
    navigate(`${location}${nextSearch ? `?${nextSearch}` : ""}`, options);
  }

  function openItem(item: AlboPublicRunItem, trigger: HTMLElement) {
    lastDialogTriggerRef.current = trigger;
    updateReaderState({ selectedActId: item.id });
  }

  function resetFilters() {
    updateReaderState({
      q: "",
      sector: ALL_SECTORS,
      actType: ALL_ACT_CATEGORIES,
      page: 1,
      selectedActId: null,
    });
  }

  useEffect(() => {
    if (previousPageRef.current !== currentPage) {
      resultsHeadingRef.current?.focus();
      previousPageRef.current = currentPage;
    }
  }, [currentPage]);

  useEffect(() => {
    if (readerState.page !== currentPage) {
      updateReaderState({ page: currentPage }, { replace: true });
    }
  }, [currentPage, readerState.page]);

  useEffect(() => {
    if (readerState.selectedActId && !selectedItem) {
      updateReaderState({ selectedActId: null }, { replace: true });
    }
  }, [readerState.selectedActId, selectedItem]);

  useEffect(() => {
    if (previousSelectedActRef.current && !readerState.selectedActId) {
      lastDialogTriggerRef.current?.focus();
    }
    previousSelectedActRef.current = readerState.selectedActId;
  }, [readerState.selectedActId]);

  const pulseCounts = ALBO_PUBLIC_DIFF_SUMMARY.counts;
  const hasDiff =
    pulseCounts.new + pulseCounts.changed + pulseCounts.removed > 0;
  const baselineIsPublicSafe =
    ALBO_OPERATIONAL_STATUS.diff_baseline?.public_safe === true;

  return (
    <>
      <PageMeta
        title="Albo Pretorio civico — cosa è cambiato oggi"
        description="Ultimi atti e variazioni dell'Albo Pretorio di Lamezia Terme, organizzati per capire cosa è cambiato e risalire sempre alla fonte ufficiale."
        path="/albo"
      />

      <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
        <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl">
            <span className="eyebrow text-primary">
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
              Albo Pretorio · fonte ufficiale acquisita
            </span>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-5xl">
              Cosa è successo nell&apos;Albo
            </h1>
            <p className="mt-3 text-base leading-7 text-muted-foreground md:text-lg">
              Un punto rapido sugli atti pubblicati e sulle variazioni rilevate
              dal monitor. Per contenuto, allegati e valore legale resta sempre
              disponibile la fonte istituzionale.
            </p>
          </div>
          <FeedSubscribeButton
            feedPath="/feeds/albo.xml"
            title="Albo Pretorio Civico - Lamezia Trasparente"
            className="w-full justify-center md:w-auto md:shrink-0"
          />
        </header>

        <AlboArchive
          query={query}
          sectorFilter={sectorFilter}
          actCategoryFilter={actCategoryFilter}
          sectorOptions={sectorOptions}
          categoryOptions={categoryOptions}
          activeFilterCount={activeFilterCount}
          totalAvailable={ALBO_PUBLIC_RUN_ITEMS.length}
          filteredCount={filteredItems.length}
          items={pagedItems}
          currentPage={currentPage}
          totalPages={totalPages}
          headingRef={resultsHeadingRef}
          onQueryChange={(value) =>
            updateReaderState(
              {
                q: value,
                page: 1,
                selectedActId: null,
              },
              { replace: true },
            )
          }
          onSectorChange={(value) =>
            updateReaderState({
              sector: value,
              page: 1,
              selectedActId: null,
            })
          }
          onActCategoryChange={(value) =>
            updateReaderState({
              actType: value,
              page: 1,
              selectedActId: null,
            })
          }
          onReset={resetFilters}
          onPageChange={(page) =>
            updateReaderState({ page, selectedActId: null })
          }
          onSelect={openItem}
        />

        <section className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <span className="eyebrow text-primary">Ultimo controllo</span>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
                Cosa è cambiato dall&apos;ultimo controllo
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Controllo del{" "}
                {formatCivicDateTime(ALBO_OPERATIONAL_STATUS.last_update)}.
                {baselineIsPublicSafe
                  ? " Confronto effettuato con la precedente baseline pubblica del monitor."
                  : " Il confronto precedente non è disponibile: i conteggi vanno letti come primo punto osservato."}
              </p>
            </div>
            <div className="flex flex-col gap-1 text-sm text-muted-foreground lg:text-right">
              <span className="inline-flex items-center gap-1.5 lg:justify-end">
                <RefreshCw
                  className="h-4 w-4 text-primary"
                  aria-hidden="true"
                />
                Prossimo controllo{" "}
                {formatCivicDateTime(
                  ALBO_OPERATIONAL_STATUS.next_scheduled_check,
                )}
              </span>
              <span>
                {ALBO_OPERATIONAL_STATUS.schedule?.monitoring_window ??
                  "Finestra di monitoraggio non disponibile"}
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <PulseCount label="Nuovi" value={pulseCounts.new} />
            <PulseCount label="Aggiornati" value={pulseCounts.changed} />
            <PulseCount label="Non più presenti" value={pulseCounts.removed} />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {pulseItems.map((pulse) => (
              <PulseItemCard
                key={`${pulse.kind}-${pulse.item.id}`}
                pulse={pulse}
                onSelect={openItem}
              />
            ))}
          </div>

          {!hasDiff && (
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Nessuna variazione rilevata rispetto al controllo precedente: come
              contesto sono mostrati gli atti correnti più recenti.
            </p>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-background p-5 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow text-primary">Digest documentale</span>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">
                Oggi nell&apos;Albo
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Aggregazione dei soli metadati degli atti con inizio
                pubblicazione nella giornata dello snapshot. Nessun contenuto
                PDF viene interpretato o riassunto.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-right">
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Atti del giorno
              </div>
              <div className="mt-1 font-display text-2xl font-bold tabular-nums">
                {dailyItems.length}
              </div>
            </div>
          </div>

          {dailySectorStats.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {dailySectorStats.slice(0, 5).map((stat) => (
                <span
                  key={stat.id}
                  className="rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs font-semibold text-foreground"
                >
                  {stat.label} · {stat.count}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              Nessun atto con inizio pubblicazione nella giornata
              dell&apos;ultimo snapshot.
            </p>
          )}

          {dailyItems.length > 0 && (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {dailyItems.slice(0, 4).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={(event) => openItem(item, event.currentTarget)}
                  className="rounded-xl border border-border bg-muted/20 p-4 text-left transition-colors hover:border-primary/30 hover:bg-primary/5"
                >
                  <div className="text-xs font-semibold text-primary">
                    {item.classification.sector.label}
                  </div>
                  <div
                    className="mt-1 line-clamp-3 text-sm font-bold leading-snug text-foreground"
                    data-long-title={
                      item.presentation.flags.includes(
                        "display_title_too_long",
                      ) || undefined
                    }
                  >
                    {item.presentation.display_title}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-muted/20 p-5 md:p-6">
          <details>
            <summary className="cursor-pointer font-display text-lg font-bold text-foreground">
              Fonte e metodo
            </summary>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Stato della fonte
                </h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <MethodRow
                    label="Fonte"
                    value={ALBO_OPERATIONAL_STATUS.source}
                  />
                  <MethodRow
                    label="Ultimo aggiornamento"
                    value={formatCivicDateTime(
                      ALBO_OPERATIONAL_STATUS.last_update,
                    )}
                  />
                  <MethodRow
                    label="Verifica"
                    value={
                      ALBO_VERIFICATION_LABELS[
                        ALBO_OPERATIONAL_STATUS.verification_status
                      ]
                    }
                  />
                  <MethodRow
                    label="Metodo"
                    value={ALBO_OPERATIONAL_STATUS.method ?? "Non disponibile"}
                  />
                  <MethodRow
                    label="Documenti archiviati"
                    value={`${ALBO_DOCUMENTS_MANIFEST.counts.archived} su ${ALBO_DOCUMENTS_MANIFEST.counts.considered} considerati`}
                  />
                </dl>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Limiti da ricordare
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                  {ALBO_OPERATIONAL_STATUS.known_limits
                    .slice(0, 4)
                    .map((limit) => (
                      <li key={limit}>• {limit}</li>
                    ))}
                </ul>
              </div>
            </div>

            {ALBO_OPERATIONAL_STATUS.warnings.length > 0 && (
              <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                <strong>Avviso tecnico:</strong>{" "}
                {ALBO_OPERATIONAL_STATUS.warnings.join(" ")}
              </div>
            )}

            <div className="mt-5 flex items-start gap-3 rounded-lg border border-border bg-background p-4 text-sm leading-6 text-muted-foreground">
              <Info
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <p>
                {MONITORING_DOCS_NOTICE}{" "}
                {ALBO_OPERATIONAL_STATUS.official_albo_disclaimer}
              </p>
            </div>
          </details>
        </section>
      </div>

      <AlboRecordDialog
        item={selectedItem}
        onClose={() =>
          updateReaderState({ selectedActId: null }, { replace: true })
        }
      />
    </>
  );
}

function MethodRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-3 border-b border-border/70 pb-2 last:border-0">
      <dt className="font-semibold text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
