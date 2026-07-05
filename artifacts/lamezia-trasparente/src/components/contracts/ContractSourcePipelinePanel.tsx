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

export function ContractSourcePipelinePanel() {
  const snapshot = buildContractPipelineSnapshot();
  const { data, isLoading } = useListContracts({});
  const contracts = asApiList<Contract>(data);
  const dossiers = contracts.map((contract) => buildContractDossier({ contract }));
  const summary = summarizeContractDossiers(contracts);
  const statusCounts = countDossierStatuses(dossiers);
  const priorityDossiers = dossiers
    .filter((dossier) => dossier.lifecycleCompleteness !== "complete")
    .slice(0, 3);

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
