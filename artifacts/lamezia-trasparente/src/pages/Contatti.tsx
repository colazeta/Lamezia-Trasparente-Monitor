import {
  ExternalLink,
  Info,
  MailQuestion,
  Megaphone,
  ShieldAlert,
} from "lucide-react";
import { Link } from "wouter";

const CONTACT_PATHS = [
  {
    title: "Segnalazioni civiche al progetto",
    text: "Per proporre un tema di monitoraggio o indicare un possibile data gap usa la sezione Segnalazioni. Le segnalazioni sono richieste di attenzione e verifica, non accuse.",
    href: "/segnalazioni",
    label: "Vai alle segnalazioni",
    icon: Megaphone,
  },
  {
    title: "Richieste formali verso l'ente",
    text: "Per accesso civico, accesso documentale o comunicazioni amministrative usa i canali ufficiali dell'ente competente. Il progetto non sostituisce protocolli o uffici pubblici.",
    href: "/accesso-civico",
    label: "Consulta Accesso civico",
    icon: ShieldAlert,
  },
];

export function Contatti() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
      <header className="max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          <MailQuestion className="h-3.5 w-3.5" aria-hidden="true" />
          Contatti e canali corretti
        </span>
        <h1 className="mt-4 text-3xl font-display font-bold tracking-tight md:text-4xl">
          Contatti
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Questa pagina distingue i canali civici del progetto dai canali
          ufficiali degli enti pubblici. Non sono pubblicati recapiti personali
          o indirizzi redazionali non verificati.
        </p>
      </header>

      <section aria-labelledby="canali" className="mt-10">
        <h2 id="canali" className="text-2xl font-display font-bold">
          Scegli il canale corretto
        </h2>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          {CONTACT_PATHS.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <h3 className="flex items-center gap-2 text-xl font-display font-bold">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
                <Link
                  href={item.href}
                  className="mt-5 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {item.label}
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section
        aria-labelledby="placeholder"
        className="mt-8 rounded-2xl border border-dashed border-border bg-card p-6 shadow-sm"
      >
        <h2 id="placeholder" className="text-2xl font-display font-bold">
          Recapito redazionale
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Placeholder esplicito: un recapito redazionale verificato non è
          disponibile in questa versione del sito. Quando sarà definito e
          verificato, potrà essere pubblicato qui con indicazione del perimetro
          d'uso e delle responsabilità di risposta.
        </p>
      </section>

      <aside className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
        <div className="flex gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="font-display text-lg font-bold">
              Note legali e contatti sono distinti
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              Le{" "}
              <Link
                href="/note-legali"
                className="font-semibold underline underline-offset-4"
              >
                note legali
              </Link>{" "}
              spiegano cautele, limiti e uso responsabile dei dati. I contatti
              servono invece a orientare verso il canale corretto per
              segnalazioni civiche o richieste formali.
            </p>
            <a
              href="https://www.comune.lamezia-terme.cz.it/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold underline underline-offset-4"
            >
              Canali istituzionali del Comune di Lamezia Terme
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}
