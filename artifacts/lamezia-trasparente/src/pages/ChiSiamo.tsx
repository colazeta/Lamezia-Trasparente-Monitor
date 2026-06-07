import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Info,
  ShieldCheck,
} from "lucide-react";
import { Link } from "wouter";

const PROJECT_POINTS = [
  "raccoglie e organizza informazioni già pubbliche per renderle più leggibili;",
  "mantiene collegamenti e cautele verso le fonti disponibili;",
  "usa indicatori e sintesi come segnali di monitoraggio, non come conclusioni automatiche;",
  "invita sempre alla verifica sul documento originale o sul portale istituzionale competente.",
];

const NOT_PROJECT_POINTS = [
  "non è un sito del Comune di Lamezia Terme o di altri enti pubblici;",
  "non sostituisce certificazioni, notifiche, pubblicazioni legali o risposte ufficiali;",
  "non formula accuse, attribuzioni di responsabilità o valutazioni su intenzioni personali;",
  "non pubblica identità redazionali, recapiti personali o governance non verificati.",
];

export function ChiSiamo() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
      <header className="max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Progetto civico indipendente
        </span>
        <h1 className="mt-4 text-3xl font-display font-bold tracking-tight md:text-4xl">
          Chi siamo
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          rendiamoLameziaTrasparente è un'iniziativa civica indipendente che
          aiuta a consultare dati, atti e informazioni pubbliche riguardanti il
          Comune di Lamezia Terme. Il portale non è un canale istituzionale e
          non rappresenta il Comune o altri enti pubblici.
        </p>
      </header>

      <section
        aria-labelledby="cosa-fa"
        className="mt-10 grid gap-5 md:grid-cols-2"
      >
        <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2
            id="cosa-fa"
            className="flex items-center gap-2 text-xl font-display font-bold"
          >
            <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />
            Cosa fa il portale
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
            {PROJECT_POINTS.map((point) => (
              <li key={point} className="flex gap-2">
                <span aria-hidden="true">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-xl font-display font-bold">
            <AlertTriangle
              className="h-5 w-5 text-amber-600"
              aria-hidden="true"
            />
            Cosa non fa
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
            {NOT_PROJECT_POINTS.map((point) => (
              <li key={point} className="flex gap-2">
                <span aria-hidden="true">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section
        aria-labelledby="fonti-e-comune"
        className="mt-8 rounded-2xl border border-border bg-muted/30 p-6"
      >
        <h2 id="fonti-e-comune" className="text-2xl font-display font-bold">
          Rapporto con fonti pubbliche e Comune
        </h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            Le informazioni pubblicate derivano da fonti pubbliche o da dataset
            e documenti indicati nelle schede del sito. La fonte ufficiale resta
            sempre il portale o l'ente titolare della pubblicazione: questo sito
            facilita la lettura, ma non certifica la completezza o
            l'aggiornamento legale dei dati.
          </p>
          <p>
            Quando una scheda evidenzia ricorrenze, indicatori o data gap, il
            contenuto va letto come bisogno di monitoraggio o verifica
            ulteriore, non come prova di irregolarità o responsabilità
            individuale.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="governance"
        className="mt-8 rounded-2xl border border-dashed border-border bg-card p-6 shadow-sm"
      >
        <h2 id="governance" className="text-2xl font-display font-bold">
          Responsabilità redazionale e governance
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Le informazioni redazionali nominative e la governance operativa non
          sono pubblicate in questa versione perché non sono presenti dati
          verificati da esporre. Questo è un placeholder esplicito: non
          sostituisce un recapito personale, un organigramma o una
          responsabilità formale non documentata.
        </p>
      </section>

      <section
        aria-labelledby="percorsi"
        className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <h2 id="percorsi" className="text-2xl font-display font-bold">
          Percorsi utili
        </h2>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <Link
            href="/fonti-dati"
            className="rounded-xl border border-border p-4 font-semibold hover:border-primary hover:text-primary"
          >
            Fonti dati
          </Link>
          <Link
            href="/metodologia"
            className="rounded-xl border border-border p-4 font-semibold hover:border-primary hover:text-primary"
          >
            Metodologia
          </Link>
          <Link
            href="/note-legali"
            className="rounded-xl border border-border p-4 font-semibold hover:border-primary hover:text-primary"
          >
            Note legali
          </Link>
          <Link
            href="/contatti"
            className="rounded-xl border border-border p-4 font-semibold hover:border-primary hover:text-primary"
          >
            Contatti e segnalazioni
          </Link>
        </div>
      </section>

      <aside className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex gap-3">
          <Info
            className="mt-0.5 h-5 w-5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div className="text-sm leading-relaxed text-muted-foreground">
            <h2 className="font-display text-lg font-bold text-foreground">
              Hai bisogno di un canale ufficiale?
            </h2>
            <p className="mt-2">
              Per istanze, accesso agli atti, segnalazioni formali o richieste
              amministrative usa i canali istituzionali competenti. Puoi partire
              dalla sezione{" "}
              <Link
                href="/accesso-civico"
                className="font-semibold underline underline-offset-4"
              >
                Accesso civico
              </Link>{" "}
              o dal sito del Comune di Lamezia Terme.
            </p>
            <a
              href="https://www.comune.lamezia-terme.cz.it/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 font-semibold text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Sito istituzionale del Comune
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}
