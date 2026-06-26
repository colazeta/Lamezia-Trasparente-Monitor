import { Info } from "lucide-react";

export function ContractPublicLimitsBox({ limits }: { limits: string[] }) {
  if (limits.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-amber-950 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <h2 className="font-display text-sm font-bold tracking-tight">
            Limiti informativi
          </h2>
          <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
            {limits.map((limit) => (
              <li key={limit}>{limit}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
