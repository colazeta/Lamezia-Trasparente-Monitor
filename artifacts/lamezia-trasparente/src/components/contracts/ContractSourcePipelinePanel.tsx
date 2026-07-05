import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  FileText,
  Landmark,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Link } from "wouter";
import { useListContracts, type Contract } from "@workspace/api-client-react";

import { Badge } from "@/components/ui/badge";
import { asApiList } from "@/lib/apiList";
import {
  buildContractDossier,
  summarizeContractDossiers,
  type ContractDossier,
} from "@/lib/contractDossier";
import {
  buildContractPipelineSnapshot,
  type ContractPipelineStageState,
} from "@/lib/contractsPipelineVisualization";

type DossierStatusFilter = "all" | ContractDossier["lifecycleCompleteness"];

const STATE_META: Record<
  ContractPipelineStageState,
  { icon: LucideIcon; className: string; badgeClassName: string }
> = {
  complete: {
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    badgeClassName:
      "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  ready: {
    icon: ShieldCheck,
    className: "border-sky-200 bg-sky-50 text-sky-800",
    badgeClassName:
      "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300",
  },
  blocked: {
    icon: LockKeyhole,
    className: "border-amber-200 bg-amber-50 text-amber-800",
    badgeClassName:
      "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  },
  inactive: {
    icon: AlertTriangle,
    className: "border-border bg-muted text-muted-foreground",
    badgeClassName: "border-border bg-muted text-muted-foreground",
  },
};

const DOSSIER_STATUS_META: Record<
  ContractDossier["lifecycleCompleteness"],
  { label: string; className: string }
> = {
  complete: {
    label: "Completo",
    className:
      "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  partial: {
    label: "Parziale",
    className:
      "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300",
  },
  "needs-review": {
    label: "Da verificare",
    className:
      "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  },
};

const DOSSIER_STATUS_FILTERS: ReadonlyArray<{
  value: DossierStatusFilter;
  label: string;
}> = [
  { value: "all", label: "Tutti" },
  { value: "needs-review", label: DOSSIER_STATUS_META["needs-review"].label },
  { value: "partial", label: DOSSIER_STATUS_META.partial.label },
  { value: "complete", label: DOSSIER_STATUS_META.complete.label },
];

const DOSSIER_STATUS_WEIGHT: Record<
  ContractDossier["lifecycleCompleteness"],
  number
> = {
  "needs-review": 0,
  partial: 1,
  complete: 2,
};

export function ContractSourcePipelinePanel() {
  const [statusFilter, setStatusFilter] =
    useState<DossierStatusFilter>("all");
  const snapshot = buildContractPipelineSnapshot();
  const { data, isLoading } = useListContracts({});
  const contracts = asApiList<Contract>(data);
  const dossiers = contracts.map((contract) => buildContractDossier({ contract }));
  const summary = summarizeContractDossiers(contracts);
  const statusCounts = countDossierStatuses(dossiers);
  const sortedDossiers = [...dossiers].sort(compareDossiersByStatusPriority);
  const priorityDossiers = sortedDossiers
    .filter((dossier) => dossier.lifecycleCompleteness !== "complete")
    .slice(0, 3);
  const listedDossiers =
    statusFilter === "all"
      ? sortedDossiers
      : sortedDossiers.filter(
          (dossier) => dossier.lifecycleCompleteness === statusFilter,
        );
  const selectedStatusLabel =
    statusFilter === "all"
      ? "tutti gli stati"
      : DOSSIER_STATUS_META[statusFilter].label.toLowerCase();

  return (
    <section className="mb-10 rounded-2xl border border-card-border bg-card p-5 shadow-sm md:p-6">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.15fr]">
        <div className="space-y-4">
          <span className="eyebrow text-primary">
            <FileText className="h-3.5 w-3.5" />
            Contratti protagonisti
          </span>
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              Stato dei fascicoli contrattuali
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              La sezione parte dai singoli contratti: per ogni fascicolo conta
              quali fasi sono documentate, quali restano parziali e dove serve
              un collegamento piu forte a BDNCP, CUP o atti locali.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <PanelMetric
              icon={FileText}
              label="Contratti"
              value={isLoading ? "..." : String(summary.total)}
              sub="fascicoli monitorati"
            />
            <PanelMetric
              icon={AlertTriangle}
              label="Stato da verificare"
              value={isLoading ? "..." : String(statusCounts["needs-review"])}
              sub="fascicoli con fasi mancanti"
            />
            <PanelMetric
              icon={Landmark}
              label="Ponte BDNCP"
              value={isLoading ? "..." : String(summary.withBdncpSearchBridge)}
              sub="contratti con ricerca ufficiale"
            />
            <PanelMetric
              icon={RefreshCw}
              label="Esecuzione da integrare"
              value={isLoading ? "..." : String(summary.missingExecutionEvidence)}
              sub="SAL, varianti o liquidazioni"
            />
          </div>

          <div className="rounded-xl border border-border bg-muted/25 px-4 py-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Lettura immediata dello stato
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusCountBadge status="complete" count={statusCounts.complete} />
              <StatusCountBadge status="partial" count={statusCounts.partial} />
              <StatusCountBadge
                status="needs-review"
                count={statusCounts["needs-review"]}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/25 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Contratti da guardare per primi
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Priorita basata sullo stato del dossier: prima fasi mancanti,
                  poi fascicoli parziali.
                </p>
              </div>
              <Badge
                className={`shadow-none ${DOSSIER_STATUS_META["needs-review"].className}`}
              >
                {isLoading ? "..." : `${statusCounts["needs-review"]} da verificare`}
              </Badge>
            </div>

            {isLoading ? (
              <div className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                Calcolo dello stato dei contratti in corso...
              </div>
            ) : priorityDossiers.length > 0 ? (
              <ul className="space-y-2">
                {priorityDossiers.map((dossier) => (
                  <PriorityContractItem
                    key={dossier.contractId}
                    dossier={dossier}
                  />
                ))}
              </ul>
            ) : (
              <div className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                Nessun fascicolo con stato critico nei dati attuali.
              </div>
            )}
          </div>

          <ol className="grid gap-3 sm:grid-cols-2">
            {snapshot.stages.map((stage, index) => {
              const meta = STATE_META[stage.state];
              const Icon = meta.icon;

              return (
                <li
                  key={stage.id}
                  className="rounded-xl border border-border bg-muted/25 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${meta.className}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          Fonte {index + 1}
                        </span>
                        <Badge
                          className={`text-[10px] shadow-none ${meta.badgeClassName}`}
                        >
                          {stage.label}
                        </Badge>
                      </div>
                      <div className="mt-1 font-display font-bold tracking-tight text-foreground">
                        {stage.title}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {stage.description}
                      </p>
                      <p className="mt-2 text-[11px] font-medium text-foreground">
                        {stage.detail}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            <div className="font-semibold">Gate fonti e pubblicazione</div>
            <p className="mt-1 text-xs leading-relaxed">
              {snapshot.nextAction}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Lista completa dei fascicoli contrattuali
            </div>
            <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground">
              Tutti i contratti espongono il proprio stato
            </h3>
          </div>
          <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
            La vista ordina tutti i fascicoli con lacune informative, poi quelli
            parziali e infine quelli completi, mantenendo CIG, CUP e ponte BDNCP
            accanto allo stato del contratto.
          </p>
        </div>

        <div className="mb-4 rounded-xl border border-border bg-muted/20 p-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Stato fascicoli
            </div>
            <Badge variant="outline" className="shadow-none">
              {isLoading
                ? "..."
                : `${listedDossiers.length}/${sortedDossiers.length} ${selectedStatusLabel}`}
            </Badge>
          </div>
          <div
            role="group"
            aria-label="Filtra fascicoli contrattuali per stato"
            className="grid gap-2 sm:grid-cols-4"
          >
            {DOSSIER_STATUS_FILTERS.map((filter) => {
              const active = statusFilter === filter.value;
              const count =
                filter.value === "all"
                  ? sortedDossiers.length
                  : statusCounts[filter.value];

              return (
                <button
                  key={filter.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`flex min-h-12 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  <span>{filter.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] tabular-nums ${
                      active
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isLoading ? "..." : count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-40 rounded-xl border border-dashed border-border bg-muted/25"
              />
            ))}
          </div>
        ) : listedDossiers.length > 0 ? (
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {listedDossiers.map((dossier) => (
              <ContractDossierCard key={dossier.contractId} dossier={dossier} />
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
            {statusFilter === "all"
              ? "Nessun fascicolo contrattuale disponibile nei dati attuali."
              : `Nessun fascicolo con stato ${selectedStatusLabel} nei dati attuali.`}
          </div>
        )}
      </div>
    </section>
  );
}

function countDossierStatuses(dossiers: readonly ContractDossier[]) {
  return dossiers.reduce(
    (acc, dossier) => {
      acc[dossier.lifecycleCompleteness] += 1;
      return acc;
    },
    { complete: 0, partial: 0, "needs-review": 0 } satisfies Record<
      ContractDossier["lifecycleCompleteness"],
      number
    >,
  );
}

function compareDossiersByStatusPriority(
  a: ContractDossier,
  b: ContractDossier,
) {
  const statusDelta =
    DOSSIER_STATUS_WEIGHT[a.lifecycleCompleteness] -
    DOSSIER_STATUS_WEIGHT[b.lifecycleCompleteness];

  if (statusDelta !== 0) return statusDelta;
  if (a.missingExecutionEvidence !== b.missingExecutionEvidence) {
    return a.missingExecutionEvidence ? -1 : 1;
  }
  if (a.missingEvaluationEvidence !== b.missingEvaluationEvidence) {
    return a.missingEvaluationEvidence ? -1 : 1;
  }
  return a.title.localeCompare(b.title, "it");
}

function StatusCountBadge({
  status,
  count,
}: {
  status: ContractDossier["lifecycleCompleteness"];
  count: number;
}) {
  const meta = DOSSIER_STATUS_META[status];

  return (
    <Badge className={`shadow-none ${meta.className}`}>
      {count} {meta.label.toLowerCase()}
    </Badge>
  );
}

function PriorityContractItem({ dossier }: { dossier: ContractDossier }) {
  const meta = DOSSIER_STATUS_META[dossier.lifecycleCompleteness];
  const missingLabels = dossier.phases
    .filter((phase) => phase.status === "missing")
    .map((phase) => phase.label);
  const priorityText = missingLabels.length
    ? `Da integrare: ${missingLabels.slice(0, 2).join(", ")}`
    : dossier.missingExecutionEvidence
      ? "Esecuzione da integrare"
      : dossier.missingEvaluationEvidence
        ? "Valutazione da integrare"
        : "Fasi parziali da verificare";

  return (
    <li className="rounded-lg border border-border bg-background px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
            {dossier.title}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {priorityText}
          </p>
        </div>
        <Badge className={`shrink-0 text-[10px] shadow-none ${meta.className}`}>
          {meta.label}
        </Badge>
      </div>
      <Link
        href={`/contratti/${dossier.contractId}`}
        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
      >
        Vedi stato del contratto
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </li>
  );
}

function ContractDossierCard({ dossier }: { dossier: ContractDossier }) {
  const meta = DOSSIER_STATUS_META[dossier.lifecycleCompleteness];
  const cig = dossier.identifiers.find(
    (identifier) => identifier.kind === "cig" && identifier.value,
  );
  const cup = dossier.identifiers.find(
    (identifier) => identifier.kind === "cup" && identifier.value,
  );
  const hasBdncpBridge = dossier.evidence.some(
    (evidence) =>
      evidence.sourceKind === "bdncp" &&
      evidence.sourceStatus === "search-bridge",
  );
  const missingCount = dossier.phases.filter(
    (phase) => phase.status === "missing",
  ).length;
  const partialCount = dossier.phases.filter(
    (phase) => phase.status === "partial",
  ).length;
  const priorityPhase =
    dossier.phases.find((phase) => phase.status === "missing") ??
    dossier.phases.find((phase) => phase.status === "partial") ??
    dossier.phases[dossier.phases.length - 1];

  return (
    <li className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="line-clamp-2 font-display font-bold leading-snug text-foreground">
            {dossier.title}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {priorityPhase
              ? `Priorita: ${priorityPhase.label}`
              : "Priorita non disponibile"}
          </p>
        </div>
        <Badge className={`shrink-0 text-[10px] shadow-none ${meta.className}`}>
          {meta.label}
        </Badge>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <DossierMiniMetric
          label="Fasi mancanti"
          value={String(missingCount)}
          tone="text-amber-700 dark:text-amber-300"
        />
        <DossierMiniMetric
          label="Da verificare"
          value={String(partialCount)}
          tone="text-sky-700 dark:text-sky-300"
        />
      </dl>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {cig?.value ? (
          <Badge variant="outline" className="font-mono text-[10px] shadow-none">
            CIG {cig.value}
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[10px] shadow-none">
            CIG mancante
          </Badge>
        )}
        {cup?.value ? (
          <Badge variant="outline" className="font-mono text-[10px] shadow-none">
            CUP {cup.value}
          </Badge>
        ) : null}
        {hasBdncpBridge ? (
          <Badge className="border-transparent bg-indigo-100 text-indigo-800 text-[10px] shadow-none dark:bg-indigo-500/20 dark:text-indigo-300">
            BDNCP/PVL
          </Badge>
        ) : null}
        {dossier.workAxis.isPublicWork ? (
          <Badge variant="outline" className="text-[10px] shadow-none">
            Opera/progetto
          </Badge>
        ) : null}
      </div>

      <Link
        href={`/contratti/${dossier.contractId}`}
        className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
      >
        Apri fascicolo e stato
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </li>
  );
}

function DossierMiniMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/25 px-3 py-2">
      <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className={`mt-1 font-display text-lg font-bold tabular-nums ${tone}`}>
        {value}
      </dd>
    </div>
  );
}

function PanelMetric({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="font-display text-lg font-bold tabular-nums text-foreground">
          {value}
        </div>
        <div className="text-xs font-medium text-foreground">{label}</div>
        <div className="text-[11px] leading-tight text-muted-foreground">
          {sub}
        </div>
      </div>
    </div>
  );
}
