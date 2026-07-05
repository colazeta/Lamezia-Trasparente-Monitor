import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  ClipboardList,
  ClipboardCheck,
  DraftingCompass,
  FileSearch,
  Gavel,
  Landmark,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type {
  ContractDossier,
  ContractLifecyclePhase,
  ContractLifecyclePhaseKey,
  ContractLifecycleStatus,
} from "@/lib/contractDossier";

const PHASE_ICONS: Record<ContractLifecyclePhaseKey, LucideIcon> = {
  programmazione: ClipboardList,
  progettazione: DraftingCompass,
  gara_pubblicazione: Landmark,
  svolgimento_gara: ClipboardCheck,
  affidamento: Gavel,
  esecuzione: RefreshCw,
  valutazione: CheckCircle2,
};

const STATUS_META: Record<
  ContractLifecycleStatus,
  { label: string; className: string; dotClassName: string; stripClassName: string }
> = {
  documented: {
    label: "Documentata",
    className:
      "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
    dotClassName: "border-brand/30 bg-brand/10 text-brand",
    stripClassName: "bg-emerald-500",
  },
  partial: {
    label: "Da verificare",
    className:
      "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300",
    dotClassName: "border-sky-300 bg-sky-100 text-sky-700",
    stripClassName: "bg-sky-500",
  },
  missing: {
    label: "Non documentata",
    className: "border-border bg-muted text-muted-foreground",
    dotClassName: "border-border bg-muted/40 text-muted-foreground",
    stripClassName: "bg-amber-400",
  },
};

const DOSSIER_STATUS_META: Record<
  ContractDossier["lifecycleCompleteness"],
  {
    label: string;
    description: string;
    className: string;
    icon: LucideIcon;
  }
> = {
  complete: {
    label: "Fascicolo completo",
    description:
      "Tutte le fasi del percorso risultano documentate nel dossier civico.",
    className:
      "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
    icon: CheckCircle2,
  },
  partial: {
    label: "Fascicolo parziale",
    description:
      "Le fasi principali sono presenti, ma restano passaggi da verificare o collegare meglio.",
    className:
      "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300",
    icon: FileSearch,
  },
  "needs-review": {
    label: "Stato da verificare",
    description:
      "Una o più fasi non sono documentate nelle fonti disponibili e diventano priorità di integrazione.",
    className:
      "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
    icon: AlertTriangle,
  },
};

const PHASE_SHORT_LABELS: Record<ContractLifecyclePhaseKey, string> = {
  programmazione: "Prog",
  progettazione: "Proj",
  gara_pubblicazione: "Pub",
  svolgimento_gara: "Gara",
  affidamento: "Aff",
  esecuzione: "Esec",
  valutazione: "Val",
};

export function ContractLifecycleRail({
  dossier,
}: {
  dossier: ContractDossier;
}) {
  const counts = countPhaseStatuses(dossier.phases);
  const statusMeta = DOSSIER_STATUS_META[dossier.lifecycleCompleteness];
  const StatusIcon = statusMeta.icon;
  const priorityPhase = getPriorityPhase(dossier.phases);
  const priorityMeta = priorityPhase ? STATUS_META[priorityPhase.status] : null;

  return (
    <section className="rounded-2xl border border-card-border bg-card p-5 shadow-sm md:p-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
        <div>
          <span className="eyebrow text-primary">
            <Circle className="h-3.5 w-3.5" />
            Stato del contratto
          </span>
          <h2 className="mt-2 font-display text-xl font-bold tracking-tight md:text-2xl">
            Il fascicolo civico segue il contratto, fase per fase
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Qui il contratto è il protagonista: lo stato non è solo una voce
            amministrativa, ma la lettura del suo percorso da programmazione e
            progettazione fino a esecuzione, collaudo e verifiche.
          </p>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-foreground">
            {dossier.title}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-muted/25 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background text-primary">
              <StatusIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <Badge className={`shadow-none ${statusMeta.className}`}>
                {statusMeta.label}
              </Badge>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {statusMeta.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-3">
        <StatusMetric
          label="Fasi documentate"
          value={counts.documented}
          tone="text-emerald-700 dark:text-emerald-300"
        />
        <StatusMetric
          label="Fasi da verificare"
          value={counts.partial}
          tone="text-sky-700 dark:text-sky-300"
        />
        <StatusMetric
          label="Fasi non documentate"
          value={counts.missing}
          tone="text-amber-700 dark:text-amber-300"
        />
      </dl>

      <div className="mt-5 rounded-xl border border-border bg-muted/20 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Stato grafico delle fasi
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
            <PhaseLegendItem status="documented" />
            <PhaseLegendItem status="partial" />
            <PhaseLegendItem status="missing" />
          </div>
        </div>
        <DossierPhaseStrip dossier={dossier} />
      </div>

      {priorityPhase && priorityMeta ? (
        <div className="mt-4 rounded-xl border border-border bg-muted/25 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Prossima priorità del dossier
            </span>
            <Badge className={`text-[10px] shadow-none ${priorityMeta.className}`}>
              {priorityMeta.label}
            </Badge>
          </div>
          <div className="mt-1 font-display font-bold tracking-tight text-foreground">
            {priorityPhase.label}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {priorityPhase.missing.length > 0
              ? `Da integrare: ${priorityPhase.missing.join(", ")}.`
              : priorityPhase.summary}
          </p>
        </div>
      ) : null}

      <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {dossier.phases.map((phase, index) => {
          const Icon = PHASE_ICONS[phase.key];
          const meta = STATUS_META[phase.status];

          return (
            <li
              key={phase.key}
              className="rounded-xl border border-border bg-muted/25 p-4"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${meta.dotClassName}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Fase {index + 1}
                    </span>
                    <Badge
                      className={`text-[10px] shadow-none ${meta.className}`}
                    >
                      {meta.label}
                    </Badge>
                  </div>
                  <div className="mt-1 font-display font-bold tracking-tight text-foreground">
                    {phase.label}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {phase.summary}
                  </p>
                  {phase.missing.length > 0 ? (
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Da integrare: {phase.missing.join(", ")}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function countPhaseStatuses(phases: readonly ContractLifecyclePhase[]) {
  return phases.reduce(
    (acc, phase) => {
      acc[phase.status] += 1;
      return acc;
    },
    { documented: 0, partial: 0, missing: 0 } satisfies Record<
      ContractLifecycleStatus,
      number
    >,
  );
}

function getPriorityPhase(phases: readonly ContractLifecyclePhase[]) {
  const fallbackPhase = phases.length > 0 ? phases[phases.length - 1] : null;

  return (
    phases.find((phase) => phase.status === "missing") ??
    phases.find((phase) => phase.status === "partial") ??
    fallbackPhase
  );
}

function DossierPhaseStrip({ dossier }: { dossier: ContractDossier }) {
  return (
    <ol
      aria-label={`Stato fasi del fascicolo ${dossier.title}`}
      className="grid grid-cols-7 gap-1.5"
    >
      {dossier.phases.map((phase) => {
        const meta = STATUS_META[phase.status];

        return (
          <li key={phase.key} className="min-w-0">
            <span
              className={`block h-2.5 rounded-full ${meta.stripClassName}`}
              title={`${phase.label}: ${meta.label}`}
            />
            <span
              aria-hidden="true"
              className="mt-1 block truncate text-center text-[10px] font-medium text-muted-foreground"
            >
              {PHASE_SHORT_LABELS[phase.key]}
            </span>
            <span className="sr-only">
              {phase.label}: {meta.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function PhaseLegendItem({ status }: { status: ContractLifecycleStatus }) {
  const meta = STATUS_META[status];

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${meta.stripClassName}`} />
      {meta.label}
    </span>
  );
}

function StatusMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/25 px-4 py-3">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className={`mt-1 font-display text-2xl font-bold tabular-nums ${tone}`}>
        {value}
      </dd>
    </div>
  );
}
