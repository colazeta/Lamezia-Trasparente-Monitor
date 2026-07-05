import { useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  Database,
  ExternalLink,
  FileArchive,
  Filter,
  Info,
  Landmark,
  RefreshCw,
  Search,
  ShieldAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FeedSubscribeButton } from "@/components/FeedSubscribeButton";
import { Input } from "@/components/ui/input";
import { PageMeta } from "@/components/seo/PageMeta";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ALBO_ARCHIVED_DOCUMENTS_BY_ID,
  ALBO_DOCUMENTS_MANIFEST,
  ALBO_PRIVACY_RISK_LABELS,
  ALBO_PUBLIC_RUN_ITEMS,
  ALBO_PUBLIC_RUN_SUMMARY,
  ALBO_PUBLIC_VISIBILITY_LABELS,
  alboPublicSearchText,
  type AlboPublicRunItem,
  type AlboPrivacyRisk,
  type AlboPublicVisibility,
} from "@/data/alboPublicRun";
import { ALBO_OPERATIONAL_STATUS, ALBO_VERIFICATION_LABELS } from "@/data/alboStatus";
import { MONITORING_DOCS_NOTICE } from "@/lib/monitoring";
import { formatPublicTimeField } from "@/lib/time";

type VisibilityFilter = AlboPublicVisibility | "all";
type RiskFilter = AlboPrivacyRisk | "all";
type DocumentFilter = "all" | "archived" | "without_archive";

const ALL_OFFICES = "all";

function shortDate(value: string | null): string {
  return value ? formatPublicTimeField(value, "dd/MM/yyyy") : "Data non disponibile";
}

function fullDateTime(value: string | null | undefined): string {
  return value ? formatPublicTimeField(value, "dd MMMM yyyy 'alle' HH:mm") : "Non disponibile";
}

function formatBytes(value: number): string {
  if (!value) return "0 B";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeQuery(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function visibilityClass(visibility: AlboPublicVisibility): string {
  if (visibility === "publishable") return "bg-emerald-50 text-emerald-800 border-emerald-200";
  if (visibility === "publishable_with_minimisation") return "bg-amber-50 text-amber-800 border-amber-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function AlboPublicItemCard({ item }: { item: AlboPublicRunItem }) {
  const archivedDocument = ALBO_ARCHIVED_DOCUMENTS_BY_ID.get(item.id);

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {item.act_type ?? "Atto Albo"}
            </Badge>
            <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${visibilityClass(item.public_visibility)}`}>
              {ALBO_PUBLIC_VISIBILITY_LABELS[item.public_visibility]}
            </span>
            <span className="text-xs text-muted-foreground">{ALBO_PRIVACY_RISK_LABELS[item.privacy_risk]}</span>
            {archivedDocument && (
              <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-800">
                PDF interno
              </span>
            )}
          </div>

          <h3 className="font-display text-base font-bold leading-snug text-foreground">{item.subject}</h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {item.publication_number && <span className="font-mono">Pubbl. {item.publication_number}</span>}
            {item.act_number && <span className="font-mono">Atto {item.act_number}</span>}
            {item.office && (
              <span className="inline-flex items-center gap-1">
                <Landmark className="h-3.5 w-3.5" aria-hidden="true" />
                {item.office}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              Dal {shortDate(item.publication_start)}
            </span>
            {item.publication_end && <span>fino al {shortDate(item.publication_end)}</span>}
          </div>

          {item.public_note && <p className="mt-2 text-xs text-muted-foreground">{item.public_note}</p>}
          {!archivedDocument && (
            <p className="mt-2 text-xs text-muted-foreground">
              Nessuna copia PDF interna archiviata per questo record nello snapshot corrente.
            </p>
          )}
        </div>

        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:shrink-0">
          {archivedDocument && (
            <a
              href={archivedDocument.platform_path}
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-800 transition-colors hover:border-sky-300 hover:bg-sky-100 sm:flex-none"
            >
              Apri PDF interno
              <FileArchive className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          )}
          <a
            href={item.source_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-brand/40 hover:text-brand sm:flex-none"
          >
            Verifica fonte
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </Card>
  );
}

export function Albo() {
  const [query, setQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("all");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");
  const [officeFilter, setOfficeFilter] = useState(ALL_OFFICES);
  const [documentFilter, setDocumentFilter] = useState<DocumentFilter>("all");

  const firstLimit = ALBO_PUBLIC_RUN_SUMMARY.known_limits[0];
  const baselineLimit = ALBO_PUBLIC_RUN_SUMMARY.known_limits.find((limit) =>
    limit.toLowerCase().includes("first-run diff"),
  );

  const officeOptions = useMemo(
    () =>
      Array.from(new Set(ALBO_PUBLIC_RUN_ITEMS.map((item) => item.office).filter((office): office is string => Boolean(office))))
        .sort((a, b) => a.localeCompare(b, "it")),
    [],
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeQuery(query);

    return ALBO_PUBLIC_RUN_ITEMS.filter((item) => {
      const hasArchivedDocument = ALBO_ARCHIVED_DOCUMENTS_BY_ID.has(item.id);
      return (
        (!normalizedQuery || alboPublicSearchText(item).includes(normalizedQuery)) &&
        (visibilityFilter === "all" || item.public_visibility === visibilityFilter) &&
        (riskFilter === "all" || item.privacy_risk === riskFilter) &&
        (officeFilter === ALL_OFFICES || item.office === officeFilter) &&
        (documentFilter === "all" ||
          (documentFilter === "archived" && hasArchivedDocument) ||
          (documentFilter === "without_archive" && !hasArchivedDocument))
      );
    });
  }, [documentFilter, officeFilter, query, riskFilter, visibilityFilter]);

  const archivedInFilteredItems = filteredItems.filter((item) =>
    ALBO_ARCHIVED_DOCUMENTS_BY_ID.has(item.id),
  ).length;
  const canResetFilters =
    Boolean(query) ||
    visibilityFilter !== "all" ||
    riskFilter !== "all" ||
    officeFilter !== ALL_OFFICES ||
    documentFilter !== "all";

  return (
    <>
      <PageMeta
        title="Albo Pretorio civico navigabile"
        description="Archivio civico consultabile degli atti pubblici dell'Albo Pretorio di Lamezia Terme, con limiti, documenti interni e fonte ufficiale dichiarati."
        path="/albo"
      />
      <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <span className="eyebrow text-primary">
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
              Fonte ufficiale acquisita
            </span>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">Albo Pretorio Civico</h1>
            <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
              Atti correnti acquisiti dalla fonte pubblica Albo, mostrati con minimizzazione prudente e rinvio alla fonte
              ufficiale per la verifica.
            </p>
          </div>
          <FeedSubscribeButton
            feedPath="/feeds/albo.xml"
            title="Albo Pretorio Civico - Lamezia Trasparente"
            className="w-full justify-center md:w-auto md:shrink-0"
          />
        </div>

        <section
          aria-labelledby="albo-status-heading"
          className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-4"
        >
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <RefreshCw className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Ultimo aggiornamento
              </div>
              <h2 id="albo-status-heading" className="mt-1 text-sm font-bold text-foreground">
                {fullDateTime(ALBO_OPERATIONAL_STATUS.last_update ?? ALBO_PUBLIC_RUN_SUMMARY.retrieved_at)}
              </h2>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Prossimo controllo
              </div>
              <div className="mt-1 text-sm font-bold text-foreground">
                {fullDateTime(ALBO_OPERATIONAL_STATUS.next_scheduled_check)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Database className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Cadenza
              </div>
              <div className="mt-1 text-sm font-bold text-foreground">
                {ALBO_OPERATIONAL_STATUS.schedule?.monitoring_window ?? "Finestra non disponibile"}
              </div>
              {ALBO_OPERATIONAL_STATUS.schedule?.github_actions_cron_utc && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Cron UTC {ALBO_OPERATIONAL_STATUS.schedule.github_actions_cron_utc}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <ShieldAlert className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Verifica
              </div>
              <div className="mt-1 text-sm font-bold text-foreground">
                {ALBO_VERIFICATION_LABELS[ALBO_OPERATIONAL_STATUS.verification_status]}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Metodo {ALBO_OPERATIONAL_STATUS.method ?? "n/d"}
                {ALBO_OPERATIONAL_STATUS.raw_format ? `, formato ${ALBO_OPERATIONAL_STATUS.raw_format}` : ""}
              </div>
            </div>
          </div>
        </section>

        <div className="mb-8 flex items-start gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
          <p>
            {MONITORING_DOCS_NOTICE} Questa vista non sostituisce l'Albo Pretorio ufficiale; le copie PDF interne sono
            mostrate solo quando risultano archiviate dalla piattaforma.
          </p>
        </div>

        <section
          aria-labelledby="albo-run-ufficiale"
          className="mb-8 rounded-xl border border-border bg-background p-4 shadow-sm md:p-5"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <span className="eyebrow text-primary">
                <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                Layer pubblico
              </span>
              <h2 id="albo-run-ufficiale" className="mt-2 font-display text-xl font-bold tracking-tight">
                Atti correnti dalla fonte pubblica Albo
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {ALBO_PUBLIC_RUN_SUMMARY.official_albo_disclaimer}
              </p>
            </div>
            <a
              href={ALBO_PUBLIC_RUN_SUMMARY.source_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:border-brand/40 hover:text-brand"
            >
              Fonte ufficiale
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Acquisiti", ALBO_PUBLIC_RUN_SUMMARY.counts.acquired],
              ["In lista pubblica", ALBO_PUBLIC_RUN_ITEMS.length],
              ["Minimizzati", ALBO_PUBLIC_RUN_SUMMARY.counts.minimised],
              ["Solo metadato", ALBO_PUBLIC_RUN_SUMMARY.counts.metadata_only],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
                <div className="mt-1 font-display text-2xl font-bold tabular-nums text-foreground">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2 rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
            {firstLimit && <p>{firstLimit}</p>}
            {baselineLimit && <p>{baselineLimit}</p>}
            {ALBO_PUBLIC_RUN_SUMMARY.counts.excluded > 0 && (
              <p>
                {ALBO_PUBLIC_RUN_SUMMARY.counts.excluded} record esclusi non vengono mostrati nella lista civica per
                prudenza privacy.
              </p>
            )}
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            {ALBO_PUBLIC_RUN_ITEMS.length} record pubblici mostrati
          </div>
        </section>

        <section
          aria-labelledby="albo-documents-heading"
          className="mb-8 rounded-xl border border-border bg-background p-4 shadow-sm md:p-5"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <span className="eyebrow text-primary">
                <FileArchive className="h-3.5 w-3.5" aria-hidden="true" />
                Documenti interni
              </span>
              <h2 id="albo-documents-heading" className="mt-2 font-display text-xl font-bold tracking-tight">
                PDF preservati nella piattaforma
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {ALBO_DOCUMENTS_MANIFEST.policy.eligibility} Nessun PDF viene analizzato, sottoposto a OCR o riassunto.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-right">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Archiviati</div>
              <div className="mt-1 font-display text-2xl font-bold tabular-nums text-foreground">
                {ALBO_DOCUMENTS_MANIFEST.counts.archived}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Considerati", ALBO_DOCUMENTS_MANIFEST.counts.considered],
              ["Senza copia interna", ALBO_DOCUMENTS_MANIFEST.counts.skipped],
              ["Revisione richiesta", ALBO_DOCUMENTS_MANIFEST.counts.human_review_required],
              ["Esclusi", ALBO_DOCUMENTS_MANIFEST.counts.excluded],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
                <div className="mt-1 font-display text-2xl font-bold tabular-nums text-foreground">{value}</div>
              </div>
            ))}
          </div>

          {ALBO_DOCUMENTS_MANIFEST.documents.length > 0 ? (
            <div className="mt-4 space-y-2">
              {ALBO_DOCUMENTS_MANIFEST.documents.map((document) => (
                <a
                  key={document.sha256}
                  href={document.platform_path}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-3 text-sm transition-colors hover:border-brand/40"
                >
                  <span className="font-semibold text-foreground">{document.publication_number}</span>
                  <span className="text-muted-foreground">
                    {document.content_type}, {formatBytes(document.size_bytes)}
                  </span>
                </a>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
              In questo snapshot non ci sono ancora copie PDF interne consultabili. Il manifest registra le decisioni di
              conservazione e continuerà a esporre solo copie interne quando saranno archiviate.
            </p>
          )}
        </section>

        <section
          aria-labelledby="albo-search-heading"
          className="mb-5 rounded-xl border border-border bg-background p-4 shadow-sm md:p-5"
        >
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow text-primary">
                <Filter className="h-3.5 w-3.5" aria-hidden="true" />
                Ricerca
              </span>
              <h2 id="albo-search-heading" className="mt-2 font-display text-xl font-bold tracking-tight">
                Ricerca e filtri
              </h2>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredItems.length} di {ALBO_PUBLIC_RUN_ITEMS.length} record
              {archivedInFilteredItems > 0 ? `, ${archivedInFilteredItems} con PDF interno` : ""}
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                aria-label="Cerca atti Albo"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cerca per oggetto, ufficio, atto, numero"
                className="pl-9"
              />
            </div>

            <Select value={visibilityFilter} onValueChange={(value) => setVisibilityFilter(value as VisibilityFilter)}>
              <SelectTrigger aria-label="Filtra per visibilità">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le visibilità</SelectItem>
                <SelectItem value="publishable">Pubblicabili</SelectItem>
                <SelectItem value="publishable_with_minimisation">Minimizzati</SelectItem>
                <SelectItem value="metadata_only">Solo metadato</SelectItem>
              </SelectContent>
            </Select>

            <Select value={riskFilter} onValueChange={(value) => setRiskFilter(value as RiskFilter)}>
              <SelectTrigger aria-label="Filtra per rischio privacy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i rischi</SelectItem>
                <SelectItem value="low">Rischio basso</SelectItem>
                <SelectItem value="medium">Rischio medio</SelectItem>
                <SelectItem value="high">Rischio alto</SelectItem>
              </SelectContent>
            </Select>

            <Select value={officeFilter} onValueChange={setOfficeFilter}>
              <SelectTrigger aria-label="Filtra per ufficio">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_OFFICES}>Tutti gli uffici</SelectItem>
                {officeOptions.map((office) => (
                  <SelectItem key={office} value={office}>
                    {office}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={documentFilter} onValueChange={(value) => setDocumentFilter(value as DocumentFilter)}>
              <SelectTrigger aria-label="Filtra per documenti interni">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i documenti</SelectItem>
                <SelectItem value="archived">Con PDF interno</SelectItem>
                <SelectItem value="without_archive">Senza PDF interno</SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              disabled={!canResetFilters}
              onClick={() => {
                setQuery("");
                setVisibilityFilter("all");
                setRiskFilter("all");
                setOfficeFilter(ALL_OFFICES);
                setDocumentFilter("all");
              }}
            >
              Azzera
            </Button>
          </div>
        </section>

        <div className="space-y-3">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => <AlboPublicItemCard key={item.id} item={item} />)
          ) : (
            <div className="rounded-xl border border-border bg-muted/30 p-6 text-sm text-muted-foreground">
              Nessun record corrisponde ai filtri selezionati.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
