import { Link } from "wouter";
import { AlertTriangle, CalendarClock } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { MONITORING_FOOTER_NOTICE } from "@/lib/monitoring";

const FOOTER_GROUPS = [
  {
    label: "Esplora",
    links: [
      ["Sedute e ordini del giorno", "/convocazioni"],
      ["Delibere e atti", "/delibere"],
      ["Albo Pretorio", "/albo/"],
      ["Organi istituzionali", "/organi"],
      ["Contratti pubblici", "/contratti"],
      ["PNRR", "/pnrr"],
    ],
  },
  {
    label: "Dati e territorio",
    links: [
      ["Atlante territoriale", "/atlante-territoriale"],
      ["Open data", "/opendata"],
      ["Fonti dati", "/fonti-dati"],
      ["Stato delle fonti", "/stato-monitoraggio"],
      ["Performance", "/performance"],
      ["API e sviluppatori", "/sviluppatori"],
    ],
  },
  {
    label: "Partecipa",
    links: [
      ["Segnalazioni", "/segnalazioni"],
      ["Accesso civico", "/accesso-civico"],
      ["Proposte civiche", "/proposte-civiche"],
      ["Iscrizioni agli aggiornamenti", "/iscrizioni"],
      ["Feed e aggiornamenti", "/feeds"],
    ],
  },
  {
    label: "Progetto",
    links: [
      ["Metodologia", "/metodologia"],
      ["Guida", "/guida"],
      ["Roadmap", "/roadmap"],
      ["Chi siamo", "/chi-siamo"],
      ["Contatti", "/contatti"],
      ["Note legali", "/note-legali"],
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-sidebar text-sidebar-foreground">
      <div className="container mx-auto px-4 py-14 md:px-6">
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-6">
          <div className="space-y-4 xl:col-span-2">
            <div className="flex items-center gap-2.5">
              <LogoMark className="h-9 w-9" />
              <span className="font-display text-lg font-bold tracking-tight">
                rendiamo<span className="text-brand">Lamezia</span>Trasparente
              </span>
            </div>
            <div className="max-w-sm space-y-3 text-sm text-sidebar-foreground/70">
              <p className="flex gap-2">
                <AlertTriangle
                  className="mt-0.5 h-4 w-4 shrink-0 text-brand"
                  aria-hidden="true"
                />
                <span>
                  <strong className="text-sidebar-foreground">Attenzione:</strong>{" "}
                  progetto civico indipendente gestito da cittadini. Non è un
                  sito istituzionale e non ha alcun legame con il Comune di
                  Lamezia Terme.
                </span>
              </p>
              <p>
                Raccoglie e organizza informazioni di interesse pubblico per
                rendere più semplice consultare fonti, dati e atti
                amministrativi.
              </p>
            </div>
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

        <div className="mt-12 flex flex-col gap-2 border-t border-sidebar-border pt-8 text-xs text-sidebar-foreground/70 sm:flex-row sm:items-center">
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
              Leggi la metodologia
            </Link>
          </p>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-sidebar-border pt-6 text-xs text-sidebar-foreground/60 md:flex-row">
          <p>
            © {new Date().getFullYear()} Iniziativa Civica Lamezia Terme. I
            dati pubblicati sono raccolti da fonti pubbliche con i limiti
            indicati nelle singole sezioni.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/note-legali"
              className="transition-colors hover:text-primary"
            >
              Note legali
            </Link>
            <Link
              href="/metodologia"
              className="transition-colors hover:text-primary"
            >
              Metodologia
            </Link>
            <Link
              href="/contatti"
              className="transition-colors hover:text-primary"
            >
              Contatti
            </Link>
            <Link
              href="/redazione"
              className="transition-colors hover:text-primary"
            >
              Area redazione
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
