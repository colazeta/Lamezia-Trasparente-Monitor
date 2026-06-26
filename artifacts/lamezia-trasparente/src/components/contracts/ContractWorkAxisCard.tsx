import { Building2, HardHat } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ContractDossier } from "@/lib/contractDossier";

export function ContractWorkAxisCard({
  dossier,
}: {
  dossier: ContractDossier;
}) {
  const { workAxis } = dossier;
  const Icon = workAxis.isPublicWork ? HardHat : Building2;

  return (
    <section className="rounded-2xl border border-card-border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg font-bold tracking-tight">
              {workAxis.label}
            </h2>
            <Badge
              className={
                workAxis.cupStatus === "present"
                  ? "border-transparent bg-emerald-100 text-emerald-800 text-[10px] shadow-none dark:bg-emerald-500/20 dark:text-emerald-300"
                  : "border-border bg-muted text-muted-foreground text-[10px] shadow-none"
              }
            >
              {workAxis.cupStatus === "present"
                ? "CUP presente"
                : "CUP non rilevato"}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {workAxis.message}
          </p>
          {workAxis.cupValue ? (
            <div className="mt-3 font-mono text-sm font-semibold text-foreground">
              CUP {workAxis.cupValue}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
