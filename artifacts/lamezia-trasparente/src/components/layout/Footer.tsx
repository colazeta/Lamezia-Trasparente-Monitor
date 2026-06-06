import { Link } from "wouter";
import { AlertTriangle, CalendarClock } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { MONITORING_FOOTER_NOTICE } from "@/lib/monitoring";

export function Footer() {
  return (
    <footer className="border-t border-border bg-sidebar text-sidebar-foreground">
      <div className="container mx-auto px-4 md:px-6 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <LogoMark className="h-9 w-9" />
              <span className="font-display font-bold text-lg tracking-tight">
                rendiamo<span className="text-brand">Lamezia</span>Trasparente
              </span>
            </div>
            <div className="space-y-3 text-sm text-sidebar-foreground/70 max-w-sm">
              <p className="flex gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-brand" />
                <span>
                  <strong className="text-sidebar-foreground">Attenzione:</strong> progetto civico
                  indipendente gestito da cittadini. Non è un sito istituzionale e non ha alcun
                  legame con il Comune di Lamezia Terme.
                </span>
              </p>
              <p>
                Il nostro obiettivo è promuovere la trasparenza, la partecipazione e il controllo
                democratico sull'operato dell'amministrazione pubblica.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="eyebrow text-brand">Risorse</h4>
            <ul className="space-y-2.5 text-sm text-sidebar-foreground/70">
              <li><Link href="/temi" className="hover:text-primary transition-colors">Tutti i Temi</Link></li>
              <li><Link href="/contratti" className="hover:text-primary transition-colors">Appalti Pubblici</Link></li>
              <li><Link href="/albo" className="hover:text-primary transition-colors">Albo Pretorio</Link></li>
              <li><Link href="/statistiche" className="hover:text-primary transition-colors">Statistiche</Link></li>
              <li><Link href="/fonti-dati" className="hover:text-primary transition-colors">Fonti dati</Link></li>
              <li><Link href="/feeds" className="hover:text-primary transition-colors">Feed e abbonamenti</Link></li>
              <li><Link href="/sviluppatori" className="hover:text-primary transition-colors">API e sviluppatori</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="eyebrow text-brand">Partecipa</h4>
            <ul className="space-y-2.5 text-sm text-sidebar-foreground/70">
              <li><Link href="/segnalazioni" className="hover:text-primary transition-colors">Invia Segnalazione</Link></li>
              <li><Link href="/iscrizioni" className="hover:text-primary transition-colors">Centro Iscrizioni</Link></li>
              <li><Link href="/metodologia" className="hover:text-primary transition-colors">Metodologia</Link></li>
              <li><Link href="/note-legali" className="hover:text-primary transition-colors">Note legali</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">Chi Siamo</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contattaci</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-sidebar-border flex flex-col gap-2 text-xs text-sidebar-foreground/70 sm:flex-row sm:items-center">
          <CalendarClock className="h-4 w-4 shrink-0 text-brand" />
          <p>
            {MONITORING_FOOTER_NOTICE}{" "}
            <Link href="/metodologia" className="font-medium text-sidebar-foreground hover:text-primary transition-colors underline underline-offset-2">
              Leggi la Metodologia
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-sidebar-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-sidebar-foreground/60">
          <p>© {new Date().getFullYear()} Iniziativa Civica Lamezia Terme. Tutti i dati sono raccolti da fonti pubbliche.</p>
          <div className="flex gap-4">
            <Link href="/note-legali" className="hover:text-primary transition-colors">Note legali</Link>
            <Link href="/fonti-dati" className="hover:text-primary transition-colors">Fonti dati</Link>
            <Link href="/redazione" className="hover:text-primary transition-colors">Area Redazione</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
