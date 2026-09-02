import { Info } from "lucide-react";

export function ContractPublicLimitsBox({ limits }: { limits: string[] }) {
  if (limits.length === 0) {
    return null;
  }

  return (
    <details className="rounded-2xl border border-border bg-muted/20 text-foreground shadow-sm">
      <summary className="flex cursor-pointer list-none items-start gap-3 p-5 marker:content-none">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div>
          <h2 className="font-display text-sm font-bold tracking-tight">
            Cosa manca o va letto con cautela
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Apri per vedere i limiti delle informazioni disponibili in questa
            scheda.
          </p>
        </div>
      </summary>
      <div className="border-t border-border px-5 pb-5 pt-4">
        <ul className="space-y-1.5 text-sm leading-relaxed text-muted-foreground">
          {limits.map((limit) => (
            <li key={limit}>{limit}</li>
          ))}
        </ul>
      </div>
    </details>
  );
}
