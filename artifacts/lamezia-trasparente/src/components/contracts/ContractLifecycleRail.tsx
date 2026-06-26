import {
  CheckCircle2,
  Circle,
  ClipboardList,
  DraftingCompass,
  Gavel,
  Landmark,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type {
  ContractDossier,
  ContractLifecyclePhaseKey,
  ContractLifecycleStatus,
} from "@/lib/contractDossier";

const PHASE_ICONS: Record<ContractLifecyclePhaseKey, LucideIcon> = {
  programmazione: ClipboardList,
  progettazione: DraftingCompass,
  gara_pubblicazione: Landmark,
  affidamento: Gavel,
  esecuzione: RefreshCw,
  valutazione: CheckCircle2,
};

const STATUS_META: Record<
  ContractLifecycleStatus,
  { label: string; className: string; dotClassName: string }
> = {
  documented: {
    label: "Documentata",
    className:
      "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
    dotClassName: "border-brand/30 bg-brand/10 text-brand",
  },
  partial: {
    label: "Da verificare",
    className:
      "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300",
    dotClassName: "border-sky-300 bg-sky-100 text-sky-700",
  },
  missing: {
    label: "Non documentata",
    className: "border-border bg-muted text-muted-foreground",
    dotClassName: "border-border bg-muted/40 text-muted-foreground",
  },
};

export function ContractLifecycleRail({
  dossier,
}: {
  dossier: ContractDossier;
}) {
  return (
    <section className="rounded-2xl border border-card-border bg-card p-5 shadow-sm md:p-6">
      <div className="mb-5">
        <span className="eyebrow text-primary">
          <Circle className="h-3.5 w-3.5" />
          Ciclo di vita
        </span>
        <h2 className="mt-2 font-display text-xl font-bold tracking-tight">
          Fascicolo civico del contratto/opera
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Ogni fase mostra il dato disponibile e quello ancora da collegare alle
          fonti ufficiali o agli atti locali.
        </p>
      </div>

      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
