import { useRoute, Link } from "wouter";
import {
  useGetContractStoryline,
  getGetContractStorylineQueryKey,
  type StorylineEvent,
  type StorylineIndicators,
  type LifecyclePhase,
  type StorylineStatus,
} from "@workspace/api-client-react";
import {
  ArrowLeft,
  ExternalLink,
  Euro,
  Building2,
  Gavel,
  Calendar,
  Landmark,
  FileText,
  Gavel as GavelIcon,
  FileSignature,
  GitBranch,
  Banknote,
  CheckCircle2,
  Circle,
  Clock,
  TrendingUp,
  AlertTriangle,
  Telescope,
  ShoppingCart,
  Layers,
  MapPin,
  FileCheck,
  FileSearch,
  ShieldAlert,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlboLink } from "@/components/AlboLink";
import { MonitoringReportsSection } from "@/components/MonitoringReportsSection";
import { quartiereLabel } from "@/lib/gis";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

function formatEuro(value: number, compact = false): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? "compact" : "standard",
  }).format(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : format(d, "dd MMMM yyyy", { locale: it });
}

// Etichette degli ambiti di spesa (macrotema), allineate alla pagina Appalti.
const MACROTEMA_LABELS: Record<string, string> = {
  ambiente: "Ambiente e rifiuti",
  scuole: "Scuole e istruzione",
  strade: "Strade e lavori pubblici",
  sociale: "Sociale e servizi alla persona",
  cultura: "Cultura, sport e turismo",
  mobilita: "Mobilità e trasporti",
  altro: "Altri servizi e forniture",
};

const PHASE_META: Record<
  LifecyclePhase,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  affidamento: { label: "Affidamento", icon: GavelIcon },
  contratto: { label: "Contratto", icon: FileSignature },
  variante: { label: "Variante", icon: GitBranch },
  liquidazione: { label: "Liquidazione", icon: Banknote },
  collaudo: { label: "Collaudo / chiusura", icon: CheckCircle2 },
  altro: { label: "Altro atto", icon: Circle },
};

// Ordine canonico del ciclo di vita di una spesa, usato per lo stepper.
const LIFECYCLE_ORDER: LifecyclePhase[] = [
  "affidamento",
  "contratto",
  "variante",
  "liquidazione",
  "collaudo",
];

const STATUS_META: Record<
  StorylineStatus,
  { label: string; className: string }
> = {
  liquidato: {
    label: "Liquidato",
    className:
      "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  in_corso: {
    label: "In corso",
    className:
      "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300",
  },
  nessuna_liquidazione: {
    label: "Nessuna liquidazione registrata",
    className:
      "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  },
};

export function ContractStoryline() {
  const [, params] = useRoute("/contratti/:id");
  const id = params?.id ? Number(params.id) : NaN;

  const { data, isLoading, isError } = useGetContractStoryline(id, {
    query: {
      enabled: !Number.isNaN(id),
      queryKey: getGetContractStorylineQueryKey(id),
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <Link
        href="/contratti"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Torna agli appalti
      </Link>

      {isLoading ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-muted/30 p-6 md:p-8 space-y-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      ) : isError || !data ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Appalto non trovato</EmptyTitle>
            <EmptyDescription>
              Il contratto richiesto non esiste o non è più disponibile.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <StorylineContent
          contract={data.contract}
          timeline={data.timeline}
          indicators={data.indicators}
        />
      )}
    </div>
  );
}

function StorylineContent({
  contract,
  timeline,
  indicators,
}: {
  contract: import("@workspace/api-client-react").Contract;
  timeline: StorylineEvent[];
  indicators: StorylineIndicators;
}) {
  const status = STATUS_META[indicators.status];
  const macrotemaLabel = contract.macrotema
    ? MACROTEMA_LABELS[contract.macrotema] ?? null
    : null;
  const locationLabel = contract.geoAddress
    ? contract.geoAddress
    : contract.geoQuartiere
      ? quartiereLabel(contract.geoQuartiere)
      : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header
        data-tour="contract-detail"
        className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {contract.cig ? (
            <Badge variant="brand" className="font-mono text-xs shadow-none">
              CIG {contract.cig}
            </Badge>
          ) : null}
          {contract.cup ? (
            <Badge variant="outline" className="font-mono text-xs shadow-none">
              CUP {contract.cup}
            </Badge>
          ) : null}
          {contract.withoutTender ? (
            <Badge className="border-transparent bg-amber-100 text-amber-800 text-xs shadow-none dark:bg-amber-500/20 dark:text-amber-300">
              Senza gara
            </Badge>
          ) : null}
          {contract.withoutMepa ? (
            <Badge className="border-transparent bg-amber-100 text-amber-800 text-xs shadow-none dark:bg-amber-500/20 dark:text-amber-300">
              Fuori MEPA
            </Badge>
          ) : null}
          <Badge className={`text-xs shadow-none ${status.className}`}>
            {status.label}
          </Badge>
        </div>
        <h1 className="mt-3 font-display text-2xl md:text-3xl font-bold tracking-tight leading-snug">
          {contract.title}
        </h1>
        {contract.description ? (
          <p className="mt-3 max-w-3xl text-muted-foreground">
            {contract.description}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-4">
          {contract.anacUrl ? (
            <a
              href={contract.anacUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Scheda ufficiale su ANAC
            </a>
          ) : null}
          <Link
            href={`/monitoraggio/nuovo?contractId=${contract.id}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-brand/40 bg-brand/10 px-3 py-1.5 text-sm font-semibold text-brand transition-colors hover:bg-brand/20"
            data-testid="link-monitora-contratto"
          >
            <Telescope className="h-4 w-4" />
            Monitora questo progetto
          </Link>
        </div>
      </header>

      {/* Caratteristiche dell'appalto */}
      <section>
        <h2 className="mb-1 font-display text-xl font-bold tracking-tight">
          Caratteristiche dell'appalto
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          I dati identificativi della spesa, così come pubblicati dalla stazione
          appaltante.
        </p>
        <div className="rounded-2xl border border-card-border bg-card p-6 shadow-sm">
          <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 text-sm">
            <MetaRow
              icon={Euro}
              label="Importo aggiudicato"
              value={
                contract.amount > 0
                  ? formatEuro(contract.amount)
                  : "Non disponibile"
              }
            />
            <MetaRow
              icon={Building2}
              label="Beneficiario"
              value={contract.supplier}
            />
            <MetaRow
              icon={Gavel}
              label="Modalità di scelta"
              value={contract.procedureType}
            />
            <MetaRow
              icon={ShoppingCart}
              label="Strumento di acquisizione"
              value={contract.acquisitionTool}
            />
            <MetaRow
              icon={Landmark}
              label="Stazione appaltante"
              value={contract.stazioneAppaltante ?? "Comune di Lamezia Terme"}
            />
            <MetaRow
              icon={Calendar}
              label="Data di aggiudicazione"
              value={formatDate(contract.awardDate)}
            />
            <MetaRow
              icon={Layers}
              label="Ambito di spesa"
              value={macrotemaLabel}
            />
            <MetaRow icon={MapPin} label="Localizzazione" value={locationLabel} />
          </dl>
        </div>
      </section>

      <MonitoringReportsSection
        subjectType="contract"
        contractId={contract.id}
      />

      {/* Indicators */}
      <section>
        <h2 className="mb-4 font-display text-xl font-bold tracking-tight">
          Indicatori sintetici
        </h2>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <IndicatorCard
            icon={FileText}
            label="Atti collegati"
            value={String(indicators.evidenceCount)}
          />
          <IndicatorCard
            icon={Clock}
            label="Giorni alla 1ª liquidazione"
            value={
              indicators.daysToFirstLiquidazione != null
                ? `${indicators.daysToFirstLiquidazione} gg`
                : "—"
            }
            sub="dall'aggiudicazione"
          />
          <IndicatorCard
            icon={Banknote}
            label="Importo liquidato"
            value={
              indicators.liquidatedAmount != null
                ? formatEuro(indicators.liquidatedAmount, true)
                : "—"
            }
            sub={indicators.liquidatedAmountIsEstimate ? "stima" : undefined}
          />
          <IndicatorCard
            icon={TrendingUp}
            label="Aumento di costo"
            value={
              indicators.extraAmount != null
                ? `+${formatEuro(indicators.extraAmount, true)}`
                : "Nessuno"
            }
            sub={
              indicators.costOverrunPct != null
                ? `+${indicators.costOverrunPct.toFixed(1)}% · stima`
                : undefined
            }
            highlight={
              indicators.extraAmount != null && indicators.extraAmount > 0
            }
          />
        </div>

        {indicators.liquidatedAmount != null && contract.amount > 0 ? (
          <FundProgress
            awarded={contract.amount}
            liquidated={indicators.liquidatedAmount}
          />
        ) : null}

        {indicators.extraAmountIsEstimate ||
        indicators.liquidatedAmountIsEstimate ? (
          <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Gli importi contrassegnati come "stima" sono dedotti in modo
            automatico dal testo degli atti dell'Albo Pretorio e possono
            differire dai valori ufficiali.
          </p>
        ) : null}
      </section>

      {/* Cronistoria degli atti */}
      <section>
        <h2 className="mb-1 font-display text-xl font-bold tracking-tight">
          Cronistoria degli atti
        </h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Ricostruita dagli atti dell'Albo Pretorio collegati a questo appalto
          tramite CIG o CUP.
        </p>

        {timeline.length === 0 ? (
          <Empty className="rounded-2xl border border-dashed border-border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileText className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>Nessun atto collegato</EmptyTitle>
              <EmptyDescription>
                Non sono state trovate pubblicazioni dell'Albo Pretorio
                collegabili a questo appalto tramite CIG o CUP. La cronistoria si
                arricchirà con le nuove pubblicazioni.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <PhaseStepper indicators={indicators} />
            <AttiLegend timeline={timeline} />
            <ol className="relative space-y-6 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-border">
              {timeline.map((event) => (
                <TimelineItem key={event.publicationId} event={event} />
              ))}
            </ol>
          </>
        )}
      </section>
    </div>
  );
}

// Stepper orizzontale che evidenzia le fasi del ciclo di vita raggiunte.
function PhaseStepper({ indicators }: { indicators: StorylineIndicators }) {
  return (
    <ol className="mb-6 grid grid-cols-5 gap-1.5">
      {LIFECYCLE_ORDER.map((phase) => {
        const meta = PHASE_META[phase];
        const Icon = meta.icon;
        const count = indicators.phaseCounts?.[phase] ?? 0;
        const reached = count > 0;
        return (
          <li
            key={phase}
            className="flex flex-col items-center gap-1.5 text-center"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                reached
                  ? "border-brand/30 bg-brand/10 text-brand"
                  : "border-border bg-muted/40 text-muted-foreground/50"
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span
              className={`text-[11px] leading-tight ${
                reached ? "font-medium text-foreground" : "text-muted-foreground"
              }`}
            >
              {meta.label}
            </span>
            {reached ? (
              <span className="text-[10px] tabular-nums text-muted-foreground">
                {count} {count === 1 ? "atto" : "atti"}
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground/60">—</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

// Riepilogo "atti noti vs reperibili" sopra la timeline.
function AttiLegend({ timeline }: { timeline: StorylineEvent[] }) {
  const total = timeline.length;
  const reperibili = timeline.filter((e) => e.attachments.length > 0).length;
  const noti = total - reperibili;
  return (
    <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-card-border bg-muted/30 px-4 py-3 text-xs">
      <span className="font-medium text-foreground">
        {total} {total === 1 ? "atto collegato" : "atti collegati"}
      </span>
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <FileCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
        {reperibili} {reperibili === 1 ? "reperibile" : "reperibili"} (con
        documento)
      </span>
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <FileSearch className="h-3.5 w-3.5" />
        {noti} {noti === 1 ? "noto" : "noti"} (solo riferimento)
      </span>
    </div>
  );
}

function TimelineItem({ event }: { event: StorylineEvent }) {
  const meta = PHASE_META[event.phase] ?? PHASE_META.altro;
  const Icon = meta.icon;
  const reperibile = event.attachments.length > 0;
  return (
    <li className="relative flex gap-4">
      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-brand shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 rounded-xl border border-card-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-[10px] shadow-none">
            {meta.label}
          </Badge>
          {reperibile ? (
            <Badge className="border-transparent bg-emerald-100 text-emerald-800 text-[10px] shadow-none dark:bg-emerald-500/20 dark:text-emerald-300">
              <FileCheck className="mr-1 h-3 w-3" />
              Atto reperibile
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-[10px] font-normal shadow-none text-muted-foreground"
            >
              <FileSearch className="mr-1 h-3 w-3" />
              Atto noto
            </Badge>
          )}
          <Badge
            variant="outline"
            className="text-[10px] font-normal shadow-none text-muted-foreground"
          >
            via {event.matchedBy.toUpperCase()}
          </Badge>
          <span className="ml-auto font-mono text-xs text-muted-foreground">
            {formatDate(event.date)}
          </span>
        </div>
        <div className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
          {event.tipologia}
        </div>
        <p className="mt-1 text-sm text-foreground">{event.oggetto}</p>
        {event.estimatedAmount != null ? (
          <div className="mt-2 text-sm font-medium text-foreground">
            Importo citato: {formatEuro(event.estimatedAmount)}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              (stima)
            </span>
          </div>
        ) : null}
        {reperibile ? (
          <AlboLink attachments={event.attachments} className="mt-3" />
        ) : (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
            Documento non ancora reperibile online: atto noto dal riferimento
            nell'Albo Pretorio.
          </p>
        )}
      </div>
    </li>
  );
}

// Barra di avanzamento dell'importo liquidato rispetto all'aggiudicato.
function FundProgress({
  awarded,
  liquidated,
}: {
  awarded: number;
  liquidated: number;
}) {
  const pct = Math.min(100, Math.round((liquidated / awarded) * 100));
  return (
    <div className="mt-4 rounded-xl border border-card-border bg-card p-5 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <span className="eyebrow text-muted-foreground">Avanzamento dei pagamenti</span>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {pct}%
        </span>
      </div>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-brand transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          Liquidato (stima):{" "}
          <span className="font-medium text-foreground">
            {formatEuro(liquidated)}
          </span>
        </span>
        <span>
          Aggiudicato:{" "}
          <span className="font-medium text-foreground">
            {formatEuro(awarded)}
          </span>
        </span>
      </div>
    </div>
  );
}

function IndicatorCard({
  icon: Icon,
  label,
  value,
  sub,
  highlight = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-card p-5 shadow-sm ${
        highlight ? "border-amber-400/50" : "border-card-border"
      }`}
    >
      <div
        className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${
          highlight
            ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-xl md:text-2xl font-display font-bold tracking-tight tabular-nums text-foreground">
        {value}
      </div>
      <div className="mt-1 eyebrow text-muted-foreground">{label}</div>
      {sub ? (
        <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>
      ) : null}
    </div>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </dt>
        <dd className="text-sm text-foreground">{value}</dd>
      </div>
    </div>
  );
}
