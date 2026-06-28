import {
  AlertTriangle,
  CheckCircle2,
  Database,
  FileJson,
  LockKeyhole,
  ShieldCheck,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
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

export function ContractSourcePipelinePanel() {
  const snapshot = buildContractPipelineSnapshot();

  return (
    <section className="mb-10 rounded-2xl border border-card-border bg-card p-5 shadow-sm md:p-6">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.25fr]">
        <div className="space-y-4">
          <span className="eyebrow text-primary">
            <Workflow className="h-3.5 w-3.5" />
            Pipeline fonti
          </span>
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              Dalla fonte nazionale al fascicolo civico
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Lo stato operativo distingue catalogo fonti, discovery ANAC,
              dry-run tecnico e gate pubblico. La piattaforma mostra il percorso
              di ingestion senza trattare il dry-run come record ufficiale
              pubblicato.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <PipelineMetric
              icon={FileJson}
              label="Manifesto fonti"
              value={String(snapshot.manifestSourcesTotal)}
              sub="famiglie censite"
            />
            <PipelineMetric
              icon={AlertTriangle}
              label="Discovery manuale"
              value={String(snapshot.manualDiscoveryRequired)}
              sub="fonti da verificare"
            />
            <PipelineMetric
              icon={Workflow}
              label="Fixture dry-run"
              value={`${snapshot.parsedFixtureRecords}/${snapshot.fixtureRecordsTotal}`}
              sub="record sintetici parsed"
            />
            <PipelineMetric
              icon={Database}
              label="Scritture pubbliche"
              value={
                snapshot.productionRecordsWritten ||
                snapshot.publicAppDataWritten ||
                snapshot.databaseWrites
                  ? "attive"
                  : "0"
              }
              sub="DB, public data, UI"
            />
          </div>
        </div>

        <div className="space-y-4">
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
                          Passo {index + 1}
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
            <div className="font-semibold">Gate produzione</div>
            <p className="mt-1 text-xs leading-relaxed">
              {snapshot.nextAction}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PipelineMetric({
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
