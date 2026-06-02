import { CalendarClock, ShieldAlert, Info } from "lucide-react";
import {
  MONITORING_START_LABEL,
  MONITORING_METHODOLOGY_PARAGRAPHS,
} from "@/lib/monitoring";

export function Metodologia() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
      <div className="mb-8">
        <span className="eyebrow text-primary">
          <Info className="h-3.5 w-3.5" />
          Come lavoriamo
        </span>
        <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold tracking-tight">
          Metodologia
        </h1>
        <p className="mt-3 text-muted-foreground text-lg">
          Da quando parte il monitoraggio e perché alcuni documenti precedenti
          potrebbero non essere presenti.
        </p>
      </div>

      <div className="mb-8 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
        <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="font-display font-bold text-foreground">
            Inizio del monitoraggio: {MONITORING_START_LABEL}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Da questa data raccogliamo e archiviamo in modo continuativo gli atti
            pubblici del Comune.
          </p>
        </div>
      </div>

      <div className="space-y-5 text-base leading-relaxed text-foreground/90">
        {MONITORING_METHODOLOGY_PARAGRAPHS.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-10 flex items-start gap-3 rounded-xl border border-border bg-muted/40 px-5 py-4">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
        <p className="text-sm text-muted-foreground">
          rendiamoLameziaTrasparente è un progetto civico indipendente gestito da
          cittadini. Non è un sito istituzionale e non ha alcun legame con il
          Comune di Lamezia Terme. Tutti i dati sono raccolti da fonti pubbliche.
        </p>
      </div>
    </div>
  );
}
