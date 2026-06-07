import { Link } from "wouter";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleDotDashed,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageMeta } from "@/components/seo/PageMeta";

const STATUS_STYLES = {
  pubblicato:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200",
  v0: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-200",
  "in refinement":
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200",
  pianificato:
    "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-200",
  "dipendente da dati esterni":
    "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-200",
  "in valutazione":
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200",
} as const;

type RoadmapStatus = keyof typeof STATUS_STYLES;

type RoadmapModule = {
  name: string;
  status: RoadmapStatus;
  description: string;
  dependencies: string;
  limits: string;
  nextSteps: string;
  hrefs: Array<{ href: string; label: string }>;
  issue?: string;
};

const MODULES: RoadmapModule[] = [
  {
    name: "Albo Monitor",
    status: "pubblicato",
    description:
      "Indice pubblico degli atti dell'Albo Pretorio, organizzato per aiutare ricerca, orientamento e verifica sui documenti disponibili.",
    dependencies:
      "Dipende dalla continuità di pubblicazione dell'Albo ufficiale e dalla reperibilità degli allegati nella finestra pubblica.",
    limits:
      "Non sostituisce l'Albo ufficiale; date, allegati e contenuti devono essere verificati sulla fonte originaria quando necessario.",
    nextSteps:
      "Mantenere leggibilità, rinvii alla fonte e controlli conservativi sulla qualità dei metadati.",
    hrefs: [{ href: "/albo", label: "Vai ad Albo Pretorio" }],
    issue: "issue #43 per questa roadmap pubblica",
  },
  {
    name: "PNRR Tracker",
    status: "dipendente da dati esterni",
    description:
      "Vista civica sui progetti PNRR collegati al territorio, con filtri e segnali di consultazione da leggere insieme agli atti locali e nazionali.",
    dependencies:
      "Dipende dagli aggiornamenti dei dataset nazionali, dai CUP disponibili e dai documenti locali pubblicati.",
    limits:
      "Stato, importi e cronoprogrammi possono cambiare nelle fonti; la pagina evita di presentare il dato come completo o definitivo.",
    nextSteps:
      "Rafforzare collegamenti documentali e note di qualità quando le fonti espongono dati verificabili.",
    hrefs: [
      { href: "/pnrr", label: "Vai al PNRR Tracker" },
      { href: "/fonti-dati", label: "Fonti dati" },
    ],
  },
  {
    name: "Incarichimetro",
    status: "v0",
    description:
      "Modulo di lettura su incarichi, affidamenti e ricorrenze amministrative, pensato per evidenziare indicatori da verificare sugli atti.",
    dependencies:
      "Dipende da feed, determine, CIG/CUP quando presenti e da classificazioni conservative.",
    limits:
      "Ricorrenze e pattern sono segnali di monitoraggio, non evidenze di irregolarità o responsabilità individuale.",
    nextSteps:
      "Proseguire con refinement tecnico e metodologico sulle etichette, sui filtri e sulla tracciabilità delle fonti.",
    hrefs: [{ href: "/incarichimetro", label: "Vai a Incarichimetro" }],
  },
  {
    name: "FOIA Machine",
    status: "in refinement",
    description:
      "Area per orientare richieste di accesso civico e raccolta di elementi informativi utili a una domanda documentata.",
    dependencies:
      "Dipende dalla chiarezza dell'oggetto richiesto, dalle fonti già consultate e dall'eventuale registro pubblico degli accessi.",
    limits:
      "La pagina non fornisce consulenza legale e non assicura esiti o tempi delle risposte istituzionali.",
    nextSteps:
      "Migliorare testi guida, esempi prudenti e collegamenti alle note metodologiche senza automatismi non verificati.",
    hrefs: [{ href: "/accesso-civico", label: "Vai ad Accesso civico" }],
  },
  {
    name: "Capacità amministrativa / macchina comunale",
    status: "in valutazione",
    description:
      "Area di analisi sulle condizioni organizzative che possono incidere sulla capacità amministrativa, letta tramite indicatori pubblici e caveat.",
    dependencies:
      "Richiede basi dati documentate, definizioni stabili e confronti coerenti tra fonti eterogenee.",
    limits:
      "Gli indicatori non spiegano da soli cause, intenti o responsabilità; servono come supporto per domande di monitoraggio.",
    nextSteps:
      "Consolidare glossario, metriche ammissibili e soglie descrittive prima di ampliare la pubblicazione.",
    hrefs: [
      { href: "/performance", label: "Indicatori performance" },
      { href: "/metodologia", label: "Metodologia" },
    ],
  },
  {
    name: "Trasparenza organizzativa",
    status: "pubblicato",
    description:
      "Percorsi di consultazione su organi, amministratori e informazioni pubbliche organizzative già presenti nel sito.",
    dependencies:
      "Dipende dalla pubblicazione e dalla manutenzione delle informazioni disponibili nelle fonti pubbliche.",
    limits:
      "Le schede sono informative e vanno lette con riferimento agli atti e alle sezioni istituzionali aggiornate.",
    nextSteps:
      "Mantenere accessibilità, metadata e rinvii alle fonti senza introdurre valutazioni personali.",
    hrefs: [
      { href: "/organi", label: "Organi istituzionali" },
      { href: "/amministratori", label: "Amministratori" },
    ],
  },
  {
    name: "Registro criticità pubbliche",
    status: "v0",
    description:
      "Spazio di monitoraggio civico per raccogliere elementi verificabili, bisogni informativi e segnalazioni documentali.",
    dependencies:
      "Dipende dalla qualità delle fonti allegate, dalla moderazione redazionale e dalla distinzione tra fatto, richiesta e interpretazione.",
    limits:
      "Una criticità registrata è un bisogno di verifica o una questione di trasparenza, non una conclusione su condotte o responsabilità.",
    nextSteps:
      "Rendere più espliciti stato di verifica, fonte disponibile e percorso di aggiornamento per ciascun elemento.",
    hrefs: [{ href: "/monitoraggio", label: "Vai a Monitoraggio civico" }],
  },
  {
    name: "Dashboard capacità amministrativa",
    status: "pianificato",
    description:
      "Sintesi futura di indicatori amministrativi selezionati, da pubblicare solo quando metrica, fonte e limiti saranno documentati.",
    dependencies:
      "Richiede dataset affidabili, criteri di aggiornamento e note metodologiche prima della diffusione pubblica.",
    limits:
      "Non sono indicate date di rilascio; ogni visualizzazione dovrà evitare ranking impropri o letture accusatorie.",
    nextSteps:
      "Valutare un v0 con poche metriche spiegate, collegamenti alle fonti e avvisi di interpretazione.",
    hrefs: [
      { href: "/statistiche", label: "Statistiche esistenti" },
      { href: "/performance", label: "Performance" },
    ],
  },
  {
    name: "Open data / API",
    status: "in refinement",
    description:
      "Catalogo e strumenti per riuso civico dei dati disponibili, inclusi dataset, risorse e documentazione per sviluppatori.",
    dependencies:
      "Dipende dai cataloghi sorgente, dagli endpoint disponibili e dalla coerenza tra API, client e validazioni generate.",
    limits:
      "Snapshot e API possono riflettere trasformazioni tecniche; per usi ufficiali occorre controllare la fonte primaria.",
    nextSteps:
      "Migliorare chiarezza su formati, limiti, frequenza di aggiornamento e differenza tra dato ufficiale ed elaborazione civica.",
    hrefs: [
      { href: "/opendata", label: "Open data" },
      { href: "/sviluppatori", label: "API e sviluppatori" },
    ],
  },
  {
    name: "Metodologia / glossario",
    status: "pubblicato",
    description:
      "Note di metodo, cautele linguistiche e glossario operativo per leggere indicatori, fonti e limiti del progetto.",
    dependencies:
      "Dipende dall'allineamento continuo con nuove pagine, dataset e moduli pubblicati.",
    limits:
      "Le note metodologiche non trasformano dati incompleti in conclusioni definitive; servono a rendere espliciti limiti e verifiche.",
    nextSteps:
      "Aggiornare il glossario quando nuovi indicatori vengono resi pubblici o quando emergono ambiguità interpretative.",
    hrefs: [
      { href: "/metodologia", label: "Metodologia" },
      { href: "/note-legali", label: "Note legali" },
    ],
  },
];

const STATUS_SUMMARY: Array<{ status: RoadmapStatus; description: string }> = [
  {
    status: "pubblicato",
    description:
      "Pagina o modulo già raggiungibile, con limiti e fonti da verificare.",
  },
  {
    status: "v0",
    description:
      "Prima versione pubblica utile, ancora soggetta a miglioramenti mirati.",
  },
  {
    status: "in refinement",
    description:
      "Funzione esistente o impostata, in miglioramento tecnico/metodologico.",
  },
  {
    status: "pianificato",
    description: "Area prevista, senza promessa di date o copertura completa.",
  },
  {
    status: "dipendente da dati esterni",
    description:
      "Modulo condizionato da disponibilità, qualità o aggiornamento delle fonti.",
  },
  {
    status: "in valutazione",
    description:
      "Ambito da definire con ulteriori verifiche prima di una pubblicazione stabile.",
  },
];

function StatusBadge({ status }: { status: RoadmapStatus }) {
  return (
    <Badge
      variant="outline"
      className={`rounded-full ${STATUS_STYLES[status]}`}
    >
      {status}
    </Badge>
  );
}

export function Roadmap() {
  return (
    <>
      <PageMeta
        title="Roadmap pubblica"
        description="Stato prudente dei moduli di Lamezia Trasparente Monitor, con dipendenze, limiti e prossimi passi senza promesse non verificate."
        path="/roadmap"
      />
      <div className="container mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <header className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            <CircleDotDashed className="h-3.5 w-3.5" aria-hidden="true" />
            Roadmap pubblica v0 · collegata a issue #43
          </div>
          <div className="max-w-3xl space-y-4">
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              Roadmap pubblica del monitor
            </h1>
            <p className="text-lg leading-8 text-muted-foreground">
              Questa pagina descrive lo stato attuale dei moduli di Lamezia
              Trasparente Monitor con linguaggio prudente, senza promettere
              date, coperture o funzionalità non verificate.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
            <div className="flex gap-3">
              <AlertTriangle
                className="mt-0.5 h-5 w-5 shrink-0"
                aria-hidden="true"
              />
              <p>
                Gli stati indicano maturità e dipendenze del progetto civico.
                Non costituiscono valutazioni sull'operato di persone o uffici e
                vanno letti insieme a fonti, metodologia e note legali.
              </p>
            </div>
          </div>
        </header>

        <section className="mt-10" aria-labelledby="criteri-stato">
          <h2
            id="criteri-stato"
            className="font-display text-2xl font-semibold tracking-tight"
          >
            Criteri di lettura degli stati
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {STATUS_SUMMARY.map((item) => (
              <article
                key={item.status}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <h3 className="flex items-center gap-2 text-base font-semibold">
                  <StatusBadge status={item.status} />
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12" aria-labelledby="moduli-monitor">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2
                id="moduli-monitor"
                className="font-display text-2xl font-semibold tracking-tight"
              >
                Stato dei moduli e delle aree pubbliche
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Ogni scheda indica descrizione, dipendenze, limiti e prossimi
                passi in forma cauta. Le issue sono riportate solo come
                riferimento di lavoro, non come promessa di rilascio.
              </p>
            </div>
            <Link
              href="/metodologia"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Leggi la metodologia
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {MODULES.map((module) => (
              <article
                key={module.name}
                className="flex h-full flex-col rounded-3xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-display text-xl font-semibold tracking-tight">
                      {module.name}
                    </h3>
                    {module.issue && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Riferimento: {module.issue}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={module.status} />
                </div>

                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {module.description}
                </p>

                <dl className="mt-5 grid gap-4 text-sm">
                  <div>
                    <dt className="font-semibold text-foreground">
                      Dipendenze principali
                    </dt>
                    <dd className="mt-1 leading-6 text-muted-foreground">
                      {module.dependencies}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">
                      Cautele e limiti
                    </dt>
                    <dd className="mt-1 leading-6 text-muted-foreground">
                      {module.limits}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">
                      Prossimi passi prudenti
                    </dt>
                    <dd className="mt-1 leading-6 text-muted-foreground">
                      {module.nextSteps}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 flex flex-wrap gap-2 pt-1">
                  {module.hrefs.map((link) => (
                    <Link
                      key={`${module.name}-${link.href}`}
                      href={link.href}
                      className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <CheckCircle2
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="mt-12 rounded-3xl border border-border bg-muted/30 p-5 md:p-6"
          aria-labelledby="limiti-roadmap"
        >
          <h2
            id="limiti-roadmap"
            className="font-display text-2xl font-semibold tracking-tight"
          >
            Limiti della roadmap v0
          </h2>
          <div className="mt-4 grid gap-4 text-sm leading-6 text-muted-foreground md:grid-cols-3">
            <div>
              <h3 className="font-semibold text-foreground">
                Nessuna data promessa
              </h3>
              <p className="mt-1">
                Le priorità possono cambiare in base a dati, manutenzione e
                verifiche. La pagina non annuncia scadenze.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Fonti prima delle funzioni
              </h3>
              <p className="mt-1">
                Nuovi moduli pubblici richiedono fonti tracciabili, limiti
                dichiarati e aggiornamenti sostenibili.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Linguaggio non accusatorio
              </h3>
              <p className="mt-1">
                Indicatori, ricorrenze e data gap restano segnali di
                monitoraggio e non prove di condotte illecite.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
