import { Link } from "wouter";
import { AlertTriangle, CalendarClock } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { MONITORING_FOOTER_NOTICE } from "@/lib/monitoring";

const FOOTER_GROUPS = [
  {
    label: "Consulta",
    links: [
      ["Sedute e ordini del giorno", "/convocazioni"],
      ["Albo Pretorio", "/albo/"],
      ["Contratti pubblici", "/contratti"],
      ["PNRR", "/pnrr"],
      ["Open data", "/opendata"],
    ],
  },
  {
    label: "Verifica",
    links: [
      ["Fonti dati", "/fonti-dati"],
      ["Stato delle fonti", "/stato-monitoraggio"],
      ["Note legali", "/note-legali"],
    ],
  },
  {
    label: "Partecipa",
    links: [
      ["Accesso civico", "/accesso-civico"],
      ["Proposte civiche", "/proposte-civiche"],
      ["Segnalazioni", "/segnalazioni"],
      ["Contatti", "/contatti"],
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-sidebar text-sidebar-foreground">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-4 xl:col-span-2">
            <div className="flex items-center gap-2.5">
              <LogoMark className="h-9 w-9" />
              <span className="font-display text-lg font-bold tracking-tight">
                rendiamo<span className="text-brand">Lamezia</span>Trasparente
              </span>
            </div>
            <p className="flex max-w-sm gap-2 text-sm leading-6 text-sidebar-foreground/70">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0 text-brand"
                aria-hidden="true"
              />
              <span>
                Progetto civico indipendente gestito da cittadini. Non è un sito
                istituzionale e non ha alcun legame con il Comune di Lamezia
                Terme.
              </span>
            </p>
          </div>

          {FOOTER_GROUPS.map((group) => (
            <div key={group.label} className="space-y-4">
              <h2 className="eyebrow text-brand">{group.label}</h2>
              <ul className="space-y-2.5 text-sm text-sidebar-foreground/70">
                {group.links.map(([label, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="transition-colors hover:text-primary"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-sidebar-border pt-6 text-xs text-sidebar-foreground/70 sm:flex-row sm:items-center">
          <CalendarClock
            className="h-4 w-4 shrink-0 text-brand"
            aria-hidden="true"
          />
          <p>
            {MONITORING_FOOTER_NOTICE}{" "}
            <Link
              href="/metodologia"
              className="font-medium text-sidebar-foreground underline underline-offset-2 transition-colors hover:text-primary"
            >
              Metodologia
            </Link>
          </p>
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-3 border-t border-sidebar-border pt-6 text-xs text-sidebar-foreground/60 md:flex-row md:items-center">
          <p>
            © {new Date().getFullYear()} Iniziativa Civica Lamezia Terme. Dati
            da fonti pubbliche, con i limiti indicati nelle singole sezioni.
          </p>
          <Link
            href="/redazione"
            className="transition-colors hover:text-primary"
          >
            Area redazione
          </Link>
        </div>
      </div>
    </footer>
  );
}
