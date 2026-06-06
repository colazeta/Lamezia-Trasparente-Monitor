import { AlertTriangle, ExternalLink, Scale, ShieldAlert } from "lucide-react";
import { Link } from "wouter";

const PRINCIPLES = [
  "Il sito è un progetto civico indipendente e non sostituisce comunicazioni, atti o banche dati istituzionali.",
  "Ogni informazione va ricondotta alla fonte originaria quando è disponibile un link ufficiale o un documento pubblico.",
  "Le sintesi redazionali, le categorie e gli indicatori sono strumenti di orientamento: aiutano a leggere fenomeni amministrativi, ma non stabiliscono responsabilità personali o illiceità.",
  "Le eventuali anomalie devono essere trattate come red flag amministrative che richiedono ulteriore verifica documentale e, se necessario, interlocuzione con l'ente competente.",
];

const CAUTIONS = [
  {
    title: "Indicatori come segnali, non come prove",
    text: "Concentrazione di affidamenti, ricorrenza di operatori, rotazione debole, importi ripetuti o documentazione mancante possono suggerire aree da approfondire. Non dimostrano illegalità, corruzione, favoritismo, collusione o infiltrazione criminale.",
  },
  {
    title: "Limiti di completezza",
    text: "Alcune fonti pubblicano dati con ritardi, campi incompleti o finestre di pubblicazione limitate. L'assenza di un documento su questo sito non implica necessariamente che il documento non esista o non sia disponibile altrove.",
  },
  {
    title: "Limiti degli arricchimenti",
    text: "Geocodifiche, classificazioni tematiche, estrazioni da testo e collegamenti tra atti sono arricchimenti tecnici. Possono contenere errori e devono essere verificati sui documenti ufficiali prima di qualsiasi uso pubblico o decisionale.",
  },
  {
    title: "Uso pubblico responsabile",
    text: "Chi riutilizza i dati dovrebbe citare le fonti, conservare il contesto, evitare conclusioni accusatorie e distinguere chiaramente tra dati ufficiali, dati estratti, dati arricchiti e interpretazioni civiche.",
  },
];

export function NoteLegali() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      <header className="mb-8">
        <span className="eyebrow text-primary">
          <Scale className="h-3.5 w-3.5" />
          Cautele interpretative
        </span>
        <h1 className="mt-2 text-3xl font-display font-bold tracking-tight md:text-4xl">
          Note legali e cautele sugli indicatori
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
          Questa pagina chiarisce come interpretare dati, indicatori e sintesi
          pubblicate dal sito, con particolare attenzione a limiti, fonti e uso
          non accusatorio delle informazioni civiche.
        </p>
      </header>

      <section aria-labelledby="natura-progetto" className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 id="natura-progetto" className="text-2xl font-display font-bold">
          Natura del progetto
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          rendiamoLameziaTrasparente è un'iniziativa civica indipendente. Non è
          un sito istituzionale, non rappresenta il Comune di Lamezia Terme e non
          produce certificazioni ufficiali. I contenuti servono a facilitare la
          consultazione pubblica, la partecipazione e il controllo democratico
          sull'amministrazione, nel rispetto delle fonti e del contesto.
        </p>
        <ul className="mt-5 space-y-3">
          {PRINCIPLES.map((principle) => (
            <li key={principle} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span>{principle}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="cautele" className="mt-8">
        <h2 id="cautele" className="text-2xl font-display font-bold">
          Cautele di lettura
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {CAUTIONS.map((item) => (
            <article key={item.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h3 className="font-display text-lg font-bold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="distinzioni" className="mt-8 rounded-2xl border border-border bg-muted/30 p-6">
        <h2 id="distinzioni" className="text-2xl font-display font-bold">
          Distinzione tra dati e interpretazioni
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            I dati ufficiali provengono da enti pubblici o piattaforme istituzionali.
            I dati estratti sono campi ricavati da documenti o feed ufficiali. I
            dati arricchiti aggiungono normalizzazioni, categorie, geocodifiche o
            collegamenti per migliorare la consultazione. Gli indicatori
            interpretativi sono sintesi costruite dal progetto per evidenziare
            possibili aree di attenzione amministrativa.
          </p>
          <p>
            Un indicatore interpretativo non accerta condotte illecite e non può
            essere usato come prova di illegalità, corruzione, favoritismo,
            collusione o infiltrazione criminale. Può soltanto suggerire che un
            tema richiede ulteriore verifica, confronto con la fonte ufficiale e,
            quando opportuno, richiesta di chiarimenti tramite strumenti civici
            come l'accesso civico.
          </p>
        </div>
      </section>

      <aside className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="font-display text-lg font-bold">Prima di riutilizzare un dato</h2>
            <p className="mt-2 text-sm leading-relaxed">
              Controlla la data di aggiornamento, apri la fonte collegata,
              verifica se il dato è ufficiale, estratto, arricchito o da
              verificare, e conserva sempre il contesto del documento originale.
            </p>
            <p className="mt-3 text-sm">
              Consulta anche{" "}
              <Link href="/fonti-dati" className="font-semibold underline underline-offset-4">
                Fonti dati
              </Link>{" "}
              e{" "}
              <Link href="/metodologia" className="font-semibold underline underline-offset-4">
                Metodologia
              </Link>
              . Per segnalazioni formali o richieste documentali usa gli strumenti
              ufficiali dell'ente o la sezione{" "}
              <Link href="/accesso-civico" className="font-semibold underline underline-offset-4">
                Accesso Civico
              </Link>
              .
            </p>
          </div>
        </div>
      </aside>

      <section aria-labelledby="fonti-istituzionali" className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 id="fonti-istituzionali" className="text-2xl font-display font-bold">
          Riferimenti istituzionali
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Per il quadro normativo e gli obblighi di pubblicazione consulta sempre
          i siti istituzionali competenti. Il sito facilita la navigazione, ma le
          fonti ufficiali restano quelle pubblicate dagli enti titolari.
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          <li>
            <a
              href="https://www.normattiva.it/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Normattiva — testi normativi vigenti
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </li>
          <li>
            <a
              href="https://www.anticorruzione.it/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary underline underline-offset-4 hover:text-primary/80"
            >
              ANAC — trasparenza e contratti pubblici
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </li>
          <li>
            <a
              href="https://www.comune.lamezia-terme.cz.it/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Comune di Lamezia Terme — sito istituzionale
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
