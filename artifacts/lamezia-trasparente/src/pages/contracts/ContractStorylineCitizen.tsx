import { type ComponentType } from "react";
import { Link, useRoute } from "wouter";
import {
  getGetContractStorylineQueryKey,
  useGetContractStoryline,
  type Contract,
  type StorylineEvent,
  type StorylineIndicators,
  type StorylineStatus,
} from "@workspace/api-client-react";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  Euro,
  ExternalLink,
  FileSearch,
  FileText,
  Gavel,
  History,
  Landmark,
  Layers,
  MapPin,
  ShoppingCart,
  Telescope,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { MonitoringReportsSection } from "@/components/MonitoringReportsSection";
import {
  ContractEvidencePanel,
  ContractIdentifiersCard,
  ContractLifecycleRail,
  ContractPublicLimitsBox,
  ContractWorkAxisCard,
} from "@/components/contracts";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { buildContractDossier } from "@/lib/contractDossier";
import { quartiereLabel } from "@/lib/gis";
import { MACROTEMA_LABELS } from "@/lib/macrotema";
import { ContractTimeline, ProgressSection } from "./ContractTimelineCitizen";

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
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : format(date, "dd MMMM yyyy", { locale: it });
}

const STATUS_META: Record<StorylineStatus, { label: string; className: string }> = {
  liquidato: {
    label: "Liquidato",
    className:
      "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  in_corso: {
    label: "In documentazione",
    className:
      "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300",
  },
  nessuna_liquidazione: {
    label: "Liquidazione non documentata",
    className:
      "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  },
};

type DetailSignal = {
  key: "direct-award" | "outside-mepa" | "cost-change";
  label: string;
  detail: string;
};

function detailSignals(
  contract: Contract,
  indicators: StorylineIndicators,
): DetailSignal[] {
  const signals: DetailSignal[] = [];
  if (contract.withoutTender) {
    signals.push({
      key: "direct-award",
      label: "Affidamento diretto dichiarato",
      detail: "La modalità è riportata negli atti associati al fascicolo.",
    });
  }
  if (contract.withoutMepa) {
    signals.push({
      key: "outside-mepa",
      label: "Fuori MePA dichiarato",
      detail: "L’informazione è riportata negli atti disponibili.",
    });
  }
  if (indicators.extraAmount != null && indicators.extraAmount > 0) {
    signals.push({
      key: "cost-change",
      label: `Aumento di costo ${formatEuro(indicators.extraAmount, true)}`,
      detail: indicators.extraAmountIsEstimate
        ? "Valore stimato automaticamente dal testo degli atti: richiede verifica documentale."
        : "Variazione ricostruita dagli atti collegati.",
    });
  }
  return signals;
}

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
    <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
      <Link
        href="/contratti"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Torna ai contratti
      </Link>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-56 w-full rounded-3xl" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      ) : isError || !data ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><FileText className="h-6 w-6" /></EmptyMedia>
            <EmptyTitle>Contratto non trovato</EmptyTitle>
            <EmptyDescription>
              Il contratto richiesto non esiste o non è disponibile nel perimetro corrente.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <StorylineContent contract={data.contract} timeline={data.timeline} indicators={data.indicators} />
      )}
    </div>
  );
}

function StorylineContent({
  contract,
  timeline,
  indicators,
}: {
  contract: Contract;
  timeline: StorylineEvent[];
  indicators: StorylineIndicators;
}) {
  const status = STATUS_META[indicators.status];
  const signals = detailSignals(contract, indicators);
  const dossier = buildContractDossier({ contract, timeline, indicators });
  const primaryOfficialLink = dossier.officialLinks[0] ?? null;
  const macrotemaLabel = contract.macrotema
    ? (MACROTEMA_LABELS[contract.macrotema] ?? null)
    : null;
  const locationLabel = contract.geoAddress
    ? contract.geoAddress
    : contract.geoQuartiere
      ? quartiereLabel(contract.geoQuartiere)
      : null;

  return (
    <div className="space-y-8">
      <header data-tour="contract-detail" className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={`text-xs shadow-none ${status.className}`}>{status.label}</Badge>
          {macrotemaLabel ? <Badge variant="outline" className="text-xs font-normal shadow-none">{macrotemaLabel}</Badge> : null}
        </div>
        <h1 className="mt-3 max-w-4xl font-display text-2xl font-bold leading-snug tracking-tight md:text-4xl">
          {contract.title}
        </h1>
        {contract.description ? (
          <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">{contract.description}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="#timeline-contratto" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <History className="h-4 w-4" />
            Segui la storia del contratto
          </a>
          <Link href={`/monitoraggio/nuovo?contractId=${contract.id}`} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted" data-testid="link-monitora-contratto">
            <Telescope className="h-4 w-4" />
            Monitora questo contratto
          </Link>
        </div>
      </header>

      <section aria-labelledby="contract-summary-title">
        <div className="mb-4">
          <span className="eyebrow text-primary">In breve</span>
          <h2 id="contract-summary-title" className="mt-1 font-display text-2xl font-bold tracking-tight">Le informazioni essenziali</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FactCard icon={Euro} label="Importo" value={contract.amount > 0 ? formatEuro(contract.amount) : "Non disponibile"} />
          <FactCard icon={Building2} label="Operatore" value={contract.supplier || "Non indicato"} />
          <FactCard icon={Calendar} label="Data" value={formatDate(contract.awardDate)} />
          <FactCard icon={Gavel} label="Modalità" value={contract.procedureType || "Non indicata"} />
        </div>
        {locationLabel ? (
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            {locationLabel}
          </div>
        ) : null}
      </section>

      {signals.length > 0 ? <SignalsSection signals={signals} /> : null}
      <ContractTimeline title={contract.title} timeline={timeline} indicators={indicators} />
      <ProgressSection contract={contract} indicators={indicators} />
      <MonitoringReportsSection subjectType="contract" contractId={contract.id} />

      <details className="group rounded-2xl border border-border bg-card shadow-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 sm:p-6">
          <div>
            <span className="eyebrow text-muted-foreground">Verifica</span>
            <h2 className="mt-1 font-display text-xl font-bold tracking-tight">Dati tecnici, identificativi e fonti</h2>
            <p className="mt-1 max-w-3xl text-sm font-normal leading-relaxed text-muted-foreground">
              Apri questa sezione se vuoi controllare codici, provenienza,
              documentazione disponibile e limiti del fascicolo.
            </p>
          </div>
          <FileSearch className="h-5 w-5 shrink-0 text-primary" />
        </summary>

        <div className="space-y-6 border-t border-border p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            {contract.cig ? <Badge variant="outline" className="font-mono text-xs shadow-none">CIG {contract.cig}</Badge> : null}
            {contract.cup ? <Badge variant="outline" className="font-mono text-xs shadow-none">CUP {contract.cup}</Badge> : null}
            {primaryOfficialLink ? (
              <a href={primaryOfficialLink.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                Verifica nella fonte ufficiale
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </div>

          <div className="rounded-2xl border border-card-border bg-muted/20 p-5">
            <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
              <MetaRow icon={Landmark} label="Stazione appaltante" value={contract.stazioneAppaltante ?? "Comune di Lamezia Terme"} />
              <MetaRow icon={ShoppingCart} label="Strumento di acquisizione" value={contract.acquisitionTool} />
              <MetaRow icon={Layers} label="Ambito di spesa" value={macrotemaLabel} />
              <MetaRow icon={MapPin} label="Localizzazione" value={locationLabel} />
            </dl>
          </div>

          <ContractLifecycleRail dossier={dossier} />
          <div className="grid gap-4 lg:grid-cols-2">
            <ContractIdentifiersCard dossier={dossier} />
            <ContractWorkAxisCard dossier={dossier} />
          </div>
          <ContractEvidencePanel dossier={dossier} />
          <ContractPublicLimitsBox limits={dossier.publicLimits} />
        </div>
      </details>
    </div>
  );
}

function FactCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-card-border bg-card p-5 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
      <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-lg font-bold leading-snug text-foreground">{value}</div>
    </div>
  );
}

function SignalsSection({ signals }: { signals: DetailSignal[] }) {
  return (
    <section aria-labelledby="contract-signals-title">
      <div className="mb-4 max-w-3xl">
        <span className="eyebrow text-primary"><AlertTriangle className="h-3.5 w-3.5" />Da contestualizzare</span>
        <h2 id="contract-signals-title" className="mt-1 font-display text-2xl font-bold tracking-tight">Segnali di attenzione</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Questi elementi servono a orientare la lettura del fascicolo. Non sono
          un punteggio di rischio e non indicano, da soli, irregolarità o responsabilità.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {signals.map((signal) => (
          <div key={signal.key} className="rounded-2xl border border-amber-300/60 bg-amber-50/60 p-5 dark:border-amber-500/30 dark:bg-amber-500/10">
            <div className="font-display font-bold text-foreground">{signal.label}</div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{signal.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 text-sm text-foreground">{value}</dd>
      </div>
    </div>
  );
}
