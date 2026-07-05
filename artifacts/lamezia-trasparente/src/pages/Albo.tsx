import { useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  Database,
  ExternalLink,
  FileArchive,
  FileText,
  Filter,
  Hash,
  Info,
  Landmark,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

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
  ALBO_PUBLIC_DIFF_CHANGED_ITEMS,
  ALBO_PUBLIC_DIFF_NEW_ITEMS,
  ALBO_PUBLIC_DIFF_REMOVED_ITEMS,
  ALBO_PUBLIC_DIFF_SUMMARY,
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
const ALL_SECTORS = "all";
const ALL_ACT_CATEGORIES = "all";
const RECENT_CONTEXT_LIMIT = 6;

type ClassificationStat = {
  id: string;
  label: string;
  count: number;
};

type NewsActivityKind = "new" | "changed" | "removed" | "context";

type NewsActivityItem = {
  kind: NewsActivityKind;
  item: AlboPublicRunItem;
};

type ClassificationConfidence = AlboPublicRunItem["classification"]["sector"]["confidence"];
type ClassificationBasis = AlboPublicRunItem["classification"]["sector"]["basis"];

const NEWS_ACTIVITY_LABELS: Record<NewsActivityKind, string> = {
  new: "Nuovo",
  changed: "Aggiornato",
  removed: "Rimosso",
  context: "Contesto recente",
};

const CLASSIFICATION_CONFIDENCE_LABELS: Record<ClassificationConfidence, string> = {
  high: "Alta",
  medium: "Media",
  low: "Bassa",
};

const CLASSIFICATION_BASIS_LABELS: Record<ClassificationBasis, string> = {
  office: "ufficio",
  act_type: "tipo atto",
  office_and_act_type: "ufficio e tipo atto",
  fallback: "fallback prudente",
};

function shortDate(value: string | null): string {
  return value ? formatPublicTimeField(value, "dd/MM/yyyy") : "Data non disponibile";
}

function fullDateTime(value: string | null | undefined): string {
  return value ? formatPublicTimeField(value, "dd MMMM yyyy 'alle' HH:mm") : "Non disponibile";
}

function displayValue(value: string | null | undefined): string {
  return value && value.trim().length > 0 ? value : "Non disponibile";
}

function verificationLabel(value: string): string {
  if (value in ALBO_VERIFICATION_LABELS) {
    return ALBO_VERIFICATION_LABELS[value as keyof typeof ALBO_VERIFICATION_LABELS];
  }
  return value;
}

function compactHash(value: string | null | undefined): string {
  if (!value) return "Non disponibile";
  if (value.length <= 24) return value;
  return `${value.slice(0, 12)}...${value.slice(-8)}`;
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

function publicationSortValue(item: AlboPublicRunItem): string {
  return [
    item.publication_start ?? "",
    item.publication_number ?? "",
  ].join(" ");
}

function mostRecentItems(items: AlboPublicRunItem[], limit = RECENT_CONTEXT_LIMIT): AlboPublicRunItem[] {
  return [...items]
    .sort((a, b) => publicationSortValue(b).localeCompare(publicationSortValue(a), "it"))
    .slice(0, limit);
}

function classificationStats<TItem>(
  items: TItem[],
  selector: (item: TItem) => { id: string; label: string },
): ClassificationStat[] {
  const stats = new Map<string, ClassificationStat>();
  for (const item of items) {
    const selected = selector(item);
    const current = stats.get(selected.id);
    if (current) {
      current.count += 1;
    } else {
      stats.set(selected.id, { ...selected, count: 1 });
    }
  }
  return [...stats.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "it"));
}

function newsStatusClass(kind: NewsActivityKind): string {
  if (kind === "new") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (kind === "changed") return "border-amber-200 bg-amber-50 text-amber-800";
  if (kind === "removed") return "border-slate-300 bg-slate-100 text-slate-700";
  return "border-sky-200 bg-sky-50 text-sky-800";
}

function diffActivityItems(recentItems: AlboPublicRunItem[]): NewsActivityItem[] {
  const activity: NewsActivityItem[] = [
    ...ALBO_PUBLIC_DIFF_NEW_ITEMS.map((item) => ({ kind: "new" as const, item })),
    ...ALBO_PUBLIC_DIFF_CHANGED_ITEMS.map((entry) => ({ kind: "changed" as const, item: entry.after })),
    ...ALBO_PUBLIC_DIFF_REMOVED_ITEMS.map((item) => ({ kind: "removed" as const, item })),
  ];

  if (activity.length > 0) return activity.slice(0, RECENT_CONTEXT_LIMIT);

  return recentItems.map((item) => ({ kind: "context" as const, item }));
}

function StatBars({ stats, total }: { stats: ClassificationStat[]; total: number }) {
  if (!stats.length || total <= 0) {
    return <p className="text-sm text-muted-foreground">Nessun dato classificabile nello snapshot corrente.</p>;
  }

  return (
    <div className="space-y-2">
      {stats.map((stat) => {
        const width = `${Math.max(8, Math.round((stat.count / total) * 100))}%`;
        return (
          <div key={stat.id}>
            <div className="mb-1 flex items-center justify-between gap-3 text-xs">
              <span className="min-w-0 truncate font-semibold text-foreground">{stat.label}</span>
              <span className="font-mono text-muted-foreground">{stat.count}</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary" style={{ width }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DetailField({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-1 break-words text-sm font-semibold text-foreground ${mono ? "font-mono" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function AlboRecordDetailDialog({ item, onClose }: { item: AlboPublicRunItem | null; onClose: () => void }) {
  const archivedDocument = item ? ALBO_ARCHIVED_DOCUMENTS_BY_ID.get(item.id) : null;

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
            <DialogTitle className="pr-6 font-display text-xl leading-snug">{item.subject}</DialogTitle>
            <DialogDescription>
              Scheda costruita dai metadati pubblici acquisiti il {fullDateTime(item.retrieved_at)}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {item.classification.act_category.label}
            </Badge>
            <span className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs font-semibold text-foreground">
              {item.classification.sector.label}
            </span>
            <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${visibilityClass(item.public_visibility)}`}>
              {ALBO_PUBLIC_VISIBILITY_LABELS[item.public_visibility]}
            </span>
            <span className="text-xs text-muted-foreground">{ALBO_PRIVACY_RISK_LABELS[item.privacy_risk]}</span>
          </div>

          <section className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
              <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
              Quadro dai metadati
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {displayValue(item.act_type)}
              {item.act_number ? ` n. ${item.act_number}` : ""}
              {item.act_date ? ` del ${shortDate(item.act_date)}` : ""}, pubblicazione{" "}
              {displayValue(item.publication_number)} dal {shortDate(item.publication_start)}
              {item.publication_end ? ` al ${shortDate(item.publication_end)}` : ""}. Ufficio:{" "}
              {displayValue(item.office)}.
            </p>
            {item.public_note && <p className="mt-2 text-xs text-muted-foreground">{item.public_note}</p>}
          </section>

          <section>
            <h3 className="mb-3 text-sm font-bold text-foreground">Metadati principali</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <DetailField label="Numero pubblicazione" value={displayValue(item.publication_number)} mono />
              <DetailField label="Periodo pubblicazione" value={`${shortDate(item.publication_start)} - ${shortDate(item.publication_end)}`} />
              <DetailField label="Tipo atto" value={displayValue(item.act_type)} />
              <DetailField label="Numero atto" value={displayValue(item.act_number)} mono />
              <DetailField label="Data atto" value={shortDate(item.act_date)} />
              <DetailField label="Ufficio" value={displayValue(item.office)} />
              <DetailField label="Verifica" value={verificationLabel(item.verification_status)} />
              <DetailField label="Hash contenuto" value={compactHash(item.content_hash)} mono />
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="text-sm font-bold text-foreground">Settore civico</div>
              <div className="mt-1 text-sm font-semibold text-foreground">{item.classification.sector.label}</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {item.classification.sector.description}
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                Confidenza {CLASSIFICATION_CONFIDENCE_LABELS[item.classification.sector.confidence].toLowerCase()},
                base {CLASSIFICATION_BASIS_LABELS[item.classification.sector.basis]}.
              </div>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="text-sm font-bold text-foreground">Tipologia atto</div>
              <div className="mt-1 text-sm font-semibold text-foreground">{item.classification.act_category.label}</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {item.classification.act_category.description}
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                Confidenza {CLASSIFICATION_CONFIDENCE_LABELS[item.classification.act_category.confidence].toLowerCase()},
                base {CLASSIFICATION_BASIS_LABELS[item.classification.act_category.basis]}.
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
              <FileArchive className="h-4 w-4 text-primary" aria-hidden="true" />
              Documento e fonte
            </div>
            <div className="flex flex-wrap gap-2">
              {archivedDocument && (
                <a
                  href={archivedDocument.platform_path}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-800 transition-colors hover:border-sky-300 hover:bg-sky-100 sm:flex-none"
                >
                  Apri PDF interno
                  <FileArchive className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
              <a
                href={item.source_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:border-brand/40 hover:text-brand sm:flex-none"
              >
                Verifica fonte ufficiale
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
            {archivedDocument ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <DetailField label="Tipo file" value={archivedDocument.content_type} />
                <DetailField label="Dimensione" value={formatBytes(archivedDocument.size_bytes)} />
                <DetailField label="Acquisito" value={fullDateTime(archivedDocument.retrieved_at)} />
                <DetailField label="SHA-256 PDF" value={compactHash(archivedDocument.sha256)} mono />
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Nessuna copia PDF interna consultabile risulta archiviata per questo record nello snapshot corrente.
              </p>
            )}
          </section>

          <section className="rounded-lg border border-border bg-background p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
              <Hash className="h-4 w-4 text-primary" aria-hidden="true" />
              Limiti dichiarati
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Il contenuto del PDF non viene analizzato, sottoposto a OCR o riassunto. La scheda espone solo metadati
              pubblici, stato di verifica e limiti del run.
            </p>
            {item.known_limits.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {item.known_limits.map((limit) => (
                  <li key={limit} className="break-words">
                    {limit}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </DialogContent>
      )}
    </Dialog>
  );
}

function AlboNewsItem({ activity, onSelect }: { activity: NewsActivityItem; onSelect: (item: AlboPublicRunItem) => void }) {
  const { item, kind } = activity;

  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${newsStatusClass(kind)}`}>
          {NEWS_ACTIVITY_LABELS[kind]}
        </span>
        <Badge variant="secondary" className="text-xs">
          {item.classification.act_category.label}
        </Badge>
        <span className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs font-semibold text-foreground">
          {item.classification.sector.label}
        </span>
      </div>
      <h3 className="text-sm font-bold leading-snug text-foreground">{item.subject}</h3>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {item.publication_number && <span className="font-mono">Pubbl. {item.publication_number}</span>}
        {item.act_type && <span>{item.act_type}</span>}
        <span>Dal {shortDate(item.publication_start)}</span>
      </div>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onSelect(item)}
          className="px-2.5 text-xs"
        >
          Apri scheda
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </span>
    </div>
  );
}

function AlboNewsOverview({
  recentItems,
  onSelect,
}: {
  recentItems: AlboPublicRunItem[];
  onSelect: (item: AlboPublicRunItem) => void;
}) {
  const activityItems = diffActivityItems(recentItems);
  const hasDiffActivity = activityItems.some((activity) => activity.kind !== "context");
  const sectorStats = classificationStats(activityItems, (activity) => activity.item.classification.sector);
  const actCategoryStats = classificationStats(activityItems, (activity) => activity.item.classification.act_category);
  const total = activityItems.length;

  return (
    <section
      aria-labelledby="albo-news-heading"
      className="mb-8 rounded-xl border border-border bg-background p-4 shadow-sm md:p-5"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <span className="eyebrow text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Novita Albo
          </span>
          <h2 id="albo-news-heading" className="mt-2 font-display text-xl font-bold tracking-tight">
            Appena pubblicate, per settore e tipologia
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {hasDiffActivity
              ? "Record nuovi, aggiornati o rimossi rispetto allo snapshot pubblico precedente, classificati con il dizionario civico Albo."
              : "Nell'ultimo confronto pubblico non risultano nuove pubblicazioni o variazioni; sotto sono mostrati gli ultimi atti correnti come contesto operativo."}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-right">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nuovi</div>
          <div className="mt-1 font-display text-2xl font-bold tabular-nums text-foreground">
            {ALBO_PUBLIC_DIFF_SUMMARY.counts.new}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Cambiati", ALBO_PUBLIC_DIFF_SUMMARY.counts.changed],
          ["Rimossi", ALBO_PUBLIC_DIFF_SUMMARY.counts.removed],
          ["Invariati", ALBO_PUBLIC_DIFF_SUMMARY.counts.unchanged],
          ["Confronto", fullDateTime(ALBO_PUBLIC_DIFF_SUMMARY.retrieved_at)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
            <div className="mt-1 text-sm font-bold text-foreground">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <h3 className="mb-3 text-sm font-bold text-foreground">Distribuzione per settore</h3>
          <StatBars stats={sectorStats} total={total} />
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <h3 className="mb-3 text-sm font-bold text-foreground">Distribuzione per tipologia</h3>
          <StatBars stats={actCategoryStats} total={total} />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {activityItems.length > 0 ? (
          activityItems.map((activity) => (
            <AlboNewsItem key={`${activity.kind}-${activity.item.id}`} activity={activity} onSelect={onSelect} />
          ))
        ) : (
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
            Nessun record pubblico disponibile per costruire il riepilogo delle novita.
          </div>
        )}
      </div>
    </section>
  );
}

function AlboPublicItemCard({ item, onSelect }: { item: AlboPublicRunItem; onSelect: (item: AlboPublicRunItem) => void }) {
  const archivedDocument = ALBO_ARCHIVED_DOCUMENTS_BY_ID.get(item.id);

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {item.classification.act_category.label}
            </Badge>
            <span className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs font-semibold text-foreground">
              {item.classification.sector.label}
            </span>
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
            {item.act_type && <span>{item.act_type}</span>}
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSelect(item)}
            className="flex-1 text-xs sm:flex-none"
          >
            Apri scheda
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
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
  const [sectorFilter, setSectorFilter] = useState(ALL_SECTORS);
  const [actCategoryFilter, setActCategoryFilter] = useState(ALL_ACT_CATEGORIES);
  const [documentFilter, setDocumentFilter] = useState<DocumentFilter>("all");
  const [selectedItem, setSelectedItem] = useState<AlboPublicRunItem | null>(null);

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
  const sectorOptions = useMemo(
    () =>
      classificationStats(ALBO_PUBLIC_RUN_ITEMS, (item) => item.classification.sector)
        .map((stat) => ({ id: stat.id, label: stat.label })),
    [],
  );
  const actCategoryOptions = useMemo(
    () =>
      classificationStats(ALBO_PUBLIC_RUN_ITEMS, (item) => item.classification.act_category)
        .map((stat) => ({ id: stat.id, label: stat.label })),
    [],
  );
  const recentItems = useMemo(() => mostRecentItems(ALBO_PUBLIC_RUN_ITEMS), []);

  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeQuery(query);

    return ALBO_PUBLIC_RUN_ITEMS.filter((item) => {
      const hasArchivedDocument = ALBO_ARCHIVED_DOCUMENTS_BY_ID.has(item.id);
      return (
        (!normalizedQuery || alboPublicSearchText(item).includes(normalizedQuery)) &&
        (visibilityFilter === "all" || item.public_visibility === visibilityFilter) &&
        (riskFilter === "all" || item.privacy_risk === riskFilter) &&
        (officeFilter === ALL_OFFICES || item.office === officeFilter) &&
        (sectorFilter === ALL_SECTORS || item.classification.sector.id === sectorFilter) &&
        (actCategoryFilter === ALL_ACT_CATEGORIES || item.classification.act_category.id === actCategoryFilter) &&
        (documentFilter === "all" ||
          (documentFilter === "archived" && hasArchivedDocument) ||
          (documentFilter === "without_archive" && !hasArchivedDocument))
      );
    });
  }, [actCategoryFilter, documentFilter, officeFilter, query, riskFilter, sectorFilter, visibilityFilter]);

  const archivedInFilteredItems = filteredItems.filter((item) =>
    ALBO_ARCHIVED_DOCUMENTS_BY_ID.has(item.id),
  ).length;
  const canResetFilters =
    Boolean(query) ||
    visibilityFilter !== "all" ||
    riskFilter !== "all" ||
    officeFilter !== ALL_OFFICES ||
    sectorFilter !== ALL_SECTORS ||
    actCategoryFilter !== ALL_ACT_CATEGORIES ||
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

        <AlboNewsOverview recentItems={recentItems} onSelect={setSelectedItem} />

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
              conservazione e continuera a esporre solo copie interne quando saranno archiviate.
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

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="relative md:col-span-2">
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
              <SelectTrigger aria-label="Filtra per visibilita">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le visibilita</SelectItem>
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

            <Select value={sectorFilter} onValueChange={setSectorFilter}>
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

            <Select value={actCategoryFilter} onValueChange={setActCategoryFilter}>
              <SelectTrigger aria-label="Filtra per tipologia">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_ACT_CATEGORIES}>Tutte le tipologie</SelectItem>
                {actCategoryOptions.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.label}
                  </SelectItem>
                ))}
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
                setSectorFilter(ALL_SECTORS);
                setActCategoryFilter(ALL_ACT_CATEGORIES);
                setDocumentFilter("all");
              }}
            >
              Azzera
            </Button>
          </div>
        </section>

        <div className="space-y-3">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => <AlboPublicItemCard key={item.id} item={item} onSelect={setSelectedItem} />)
          ) : (
            <div className="rounded-xl border border-border bg-muted/30 p-6 text-sm text-muted-foreground">
              Nessun record corrisponde ai filtri selezionati.
            </div>
          )}
        </div>
      </div>
      <AlboRecordDetailDialog item={selectedItem} onClose={() => setSelectedItem(null)} />
    </>
  );
}
