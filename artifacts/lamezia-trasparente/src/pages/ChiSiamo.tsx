import { Link } from "wouter";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  FileSearch,
  Info,
  Scale3D,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { PageMeta } from "@/components/seo/PageMeta";

const DOES = [
  "organizza collegamenti, schede e percorsi di lettura basati su documenti e dati pubblici disponibili;",
  "segnala limiti, aggiornamenti e cautele metodologiche quando i dati sono incompleti o richiedono verifica;",
  "aiuta cittadine, cittadini, associazioni e operatori civici a orientarsi tra fonti, atti e strumenti di partecipazione.",
];

const DOES_NOT = [
  "non è un sito istituzionale del Comune di Lamezia Terme e non sostituisce gli albi, i portali o gli uffici competenti;",
  "non certifica completezza, validità giuridica o aggiornamento ufficiale degli atti;",
  "non formula accuse, attribuzioni di responsabilità personale o conclusioni su illeciti: gli indicatori sono segnali da verificare sulle fonti.",
];

const PROJECT_LINKS = [
  {
    href: "/fonti-dati",
    label: "Fonti dati",
    description: "Origine, stato e limiti delle fonti pubbliche monitorate.",
    icon: BookOpen,
  },
  {
    href: "/metodologia",
    label: "Metodologia",
    description: "Metodo di raccolta, normalizzazione e lettura prudente degli indicatori.",
    icon: FileSearch,
  },
  {
    href: "/note-legali",
    label: "Note legali",
    description: "Cautele interpretative, riuso dei dati e distinzione dalle fonti ufficiali.",
    icon: Scale3D,
  },
];

export function ChiSiamo() {
  return (
    <>
      <PageMeta
        title="Chi siamo"
        description="Informazioni sulla natura civica e indipendente di rendiamoLameziaTrasparente, su cosa il portale fa e non fa e sui rimandi metodologici."
        path="/chi-siamo"
      />
      <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
        <header className="mb-8 max-w-3xl">
          <span className="eyebrow text-primary">
            <Info className="h-3.5 w-3.5" aria-hidden="true" />
            Progetto civico indipendente
          </span>
          <h1 className="mt-2 text-3xl font-display font-bold tracking-tight md:text-4xl">
            Chi siamo
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
            rendiamoLameziaTrasparente è un progetto civico indipendente che
            aggrega e spiega informazioni amministrative di interesse pubblico
            per facilitarne la consultazione. Non è un sito istituzionale e non
            rappresenta il Comune di Lamezia Terme.
          </p>
        </header>

        <section
          aria-labelledby="natura-indipendente"
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <h2 id="natura-indipendente" className="text-2xl font-display font-bold">
            Natura e responsabilità del progetto
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Il portale nasce come iniziativa civica di monitoraggio e
              orientamento alla trasparenza. Le informazioni sono presentate con
              linguaggio prudente, rimandi alle fonti e caveat metodologici per
              evitare interpretazioni improprie o accusatorie.
            </p>
            <p>
              I dettagli redazionali nominativi, la governance formale e gli
              eventuali referenti pubblicabili non sono presenti in questo
              repository. Finché non saranno verificati e autorizzati, questa
              pagina usa una descrizione neutra del progetto e non pubblica
              identità personali o recapiti non confermati.
            </p>
          </div>
        </section>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section aria-labelledby="cosa-fa" className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 id="cosa-fa" className="flex items-center gap-2 text-xl font-display font-bold">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
              Cosa fa il portale
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {DOES.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="cosa-non-fa" className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 id="cosa-non-fa" className="flex items-center gap-2 text-xl font-display font-bold">
              <XCircle className="h-5 w-5 text-amber-600" aria-hidden="true" />
              Cosa non fa
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {DOES_NOT.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section
          aria-labelledby="fonti-comune"
          className="mt-8 rounded-2xl border border-border bg-muted/30 p-6"
        >
          <h2 id="fonti-comune" className="text-2xl font-display font-bold">
            Rapporto con fonti pubbliche e Comune
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Le schede del portale rinviano, quando disponibili, a documenti,
            pagine o dataset pubblici. La verifica ufficiale resta sempre presso
            le fonti istituzionali competenti: questo progetto facilita la
            navigazione civica, ma non sostituisce pubblicazioni ufficiali,
            procedimenti amministrativi o risposte dell'ente.
          </p>
        </section>

        <aside className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <h2 className="font-display text-lg font-bold">Cautele di lettura</h2>
              <p className="mt-2 text-sm leading-relaxed">
                Pattern, ricorrenze e indicatori sono strumenti di orientamento
                civico. Non provano irregolarità e devono essere letti insieme
                a fonte, data di aggiornamento, contesto amministrativo e limiti
                documentati.
              </p>
            </div>
          </div>
        </aside>

        <section aria-labelledby="rimandi" className="mt-8">
          <h2 id="rimandi" className="text-2xl font-display font-bold">
            Pagine correlate
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {PROJECT_LINKS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h3 className="mt-3 font-display text-lg font-bold">{item.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <section
          aria-labelledby="contatti-rimando"
          className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <h2 id="contatti-rimando" className="flex items-center gap-2 text-2xl font-display font-bold">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            Contatti e segnalazioni
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            I canali di contatto, le segnalazioni civiche e le note legali sono
            tenuti separati per evitare ambiguità. Consulta la pagina contatti
            per scegliere il percorso appropriato.
          </p>
          <Link
            href="/contatti"
            className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Vai ai contatti
          </Link>
        </section>
      </div>
    </>
  );
}
