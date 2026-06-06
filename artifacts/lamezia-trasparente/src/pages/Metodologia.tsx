import { AlertTriangle, CalendarClock, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import { Link } from "wouter";
import { usePageMetadata } from "@/lib/usePageMetadata";
import {
  MONITORING_START_LABEL,
  MONITORING_METHODOLOGY_PARAGRAPHS,
} from "@/lib/monitoring";

const METHOD_STEPS = [
  {
    title: "Raccolta dalle fonti pubbliche",
    text: "Il sito acquisisce atti, feed e dataset da portali pubblici del Comune o da banche dati nazionali. Quando possibile conserva il collegamento alla fonte ufficiale o al documento originale.",
  },
  {
    title: "Normalizzazione minima",
    text: "Date, importi, CIG, CUP, categorie e stati vengono uniformati per rendere i contenuti cercabili e confrontabili. La normalizzazione non modifica il significato del documento di partenza.",
  },
  {
    title: "Estrazione prudente",
    text: "Quando un campo non è strutturato, il sistema può estrarlo dal testo dell'atto con regole conservative. Questi dati sono marcati come estratti o da verificare e devono essere controllati sulla fonte.",
  },
  {
    title: "Arricchimento civico",
    text: "Collegamenti tra atti, temi, geocodifiche, cronologie e categorie servono a migliorare la consultazione. Sono arricchimenti tecnici e non sostituiscono gli atti ufficiali.",
  },
  {
    title: "Indicatori interpretativi",
    text: "Gli indicatori sintetizzano ricorrenze o possibili aree di attenzione, per esempio concentrazione, rotazione debole, documentazione mancante o ritardi amministrativi. Sono segnali da verificare, non conclusioni accusatorie.",
  },
];

const DATA_STATUSES = [
  {
    label: "Ufficiale",
    text: "dato pubblicato da un ente o da una piattaforma istituzionale, riportato con link alla fonte quando disponibile.",
  },
  {
    label: "Estratto",
    text: "dato ricavato da feed, file o testo ufficiale tramite parser e regole documentate; richiede controllo sul documento originale in caso di uso sensibile.",
  },
  {
    label: "Arricchito",
    text: "dato integrato con categorie, collegamenti, coordinate o normalizzazioni per rendere più chiara la consultazione pubblica.",
  },
  {
    label: "Interpretativo",
    text: "indicatore o sintesi civica che aiuta a leggere fenomeni amministrativi, senza attribuire responsabilità o provare irregolarità.",
  },
];

export function Metodologia() {
  usePageMetadata({
    title: "Metodologia — rendiamoLameziaTrasparente",
    description:
      "Metodo di raccolta, trattamento, verifica e lettura prudente degli indicatori del monitoraggio civico di Lamezia Terme.",
  });

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      <header className="mb-8">
        <span className="eyebrow text-primary">
          <Info className="h-3.5 w-3.5" />
          Come lavoriamo
        </span>
        <h1 className="mt-2 text-3xl font-display font-bold tracking-tight md:text-4xl">
          Metodologia
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
          Il monitoraggio civico organizza fonti pubbliche, estrazioni tecniche e
          indicatori interpretativi per rendere più leggibili atti, contratti,
          progetti e documenti amministrativi. Il metodo è pensato per favorire
          verifica, contestualizzazione e uso non accusatorio dei dati.
        </p>
      </header>

      <section aria-labelledby="avvio-monitoraggio" className="mb-8 rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <h2 id="avvio-monitoraggio" className="font-display text-xl font-bold text-foreground">
              Inizio e frequenza del monitoraggio
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Il monitoraggio continuativo parte dal {MONITORING_START_LABEL}.
              Da questa data il sistema controlla periodicamente le fonti
              pubbliche disponibili. La frequenza effettiva dipende sia dai job
              automatici del sito sia dalla pubblicazione dei dati da parte degli
              enti titolari.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="copertura" className="mb-8 space-y-4">
        <h2 id="copertura" className="text-2xl font-display font-bold">
          Copertura temporale e limiti di recupero
        </h2>
        <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
          {MONITORING_METHODOLOGY_PARAGRAPHS.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section aria-labelledby="processo" className="mb-8">
        <h2 id="processo" className="text-2xl font-display font-bold">
          Processo di trattamento dei dati
        </h2>
        <div className="mt-4 grid gap-4">
          {METHOD_STEPS.map((step, index) => (
            <article key={step.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="stati-informativi" className="mb-8 rounded-2xl border border-border bg-muted/30 p-6">
        <h2 id="stati-informativi" className="text-2xl font-display font-bold">
          Stato informativo: ufficiale, estratto, arricchito, interpretativo
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {DATA_STATUSES.map((status) => (
            <article key={status.label} className="rounded-xl border border-border bg-background p-4">
              <h3 className="font-display text-base font-bold">{status.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{status.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="criteri-indicatori" className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 id="criteri-indicatori" className="text-2xl font-display font-bold">
          Come leggere gli indicatori
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            Gli indicatori sono costruiti per aiutare cittadine, cittadini,
            giornalisti, associazioni e amministratori a individuare temi da
            approfondire. Esempi di lettura prudente sono: concentrazione di
            affidamenti, ricorrenza di fornitori, rotazione debole, scostamenti
            temporali, assenza di allegati, documentazione mancante o necessità
            di ulteriore verifica.
          </p>
          <p>
            Un indicatore non è una diagnosi giuridica o investigativa. Non è
            prova di illegalità, corruzione, favoritismo, collusione o
            infiltrazione criminale. Prima di trarre conclusioni occorre
            consultare le fonti ufficiali, verificare il contesto amministrativo
            e, se necessario, chiedere chiarimenti con strumenti formali come
            l'accesso civico.
          </p>
        </div>
      </section>

      <section aria-labelledby="qualita" className="mb-8">
        <h2 id="qualita" className="text-2xl font-display font-bold">
          Controlli di qualità e tracciabilità
        </h2>
        <ul className="mt-4 space-y-3">
          {[
            "I record pubblici mantengono, quando disponibile, il link alla fonte o al documento originale.",
            "Le pagine di dettaglio privilegiano collegamenti descrittivi e date di aggiornamento quando presenti nei dati.",
            "Le informazioni estratte o arricchite sono trattate come supporto alla consultazione, non come sostituzione della fonte ufficiale.",
            "Eventuali errori o dati obsoleti possono essere segnalati e corretti mantenendo la distinzione tra fonte, estrazione e interpretazione.",
          ].map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="font-display text-lg font-bold">Cautele essenziali</h2>
            <p className="mt-2 text-sm leading-relaxed">
              Usa i dati come punto di partenza per verifica civica e confronto
              documentale. Le visualizzazioni pubbliche possono evidenziare
              red flag amministrative, ma non formulano accuse e non accertano
              condotte illecite.
            </p>
            <p className="mt-3 text-sm">
              Vedi anche{" "}
              <Link href="/fonti-dati" className="font-semibold underline underline-offset-4">
                Fonti dati
              </Link>{" "}
              e{" "}
              <Link href="/note-legali" className="font-semibold underline underline-offset-4">
                Note legali e cautele interpretative
              </Link>
              .
            </p>
          </div>
        </div>
      </aside>

      <div className="mt-8 flex items-start gap-3 rounded-xl border border-border bg-muted/40 px-5 py-4">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">
          rendiamoLameziaTrasparente è un progetto civico indipendente gestito da
          cittadini. Non è un sito istituzionale e non ha alcun legame con il
          Comune di Lamezia Terme. Tutti i dati sono raccolti da fonti pubbliche
          o dichiarati come estratti, arricchiti o da verificare.
        </p>
      </div>
    </div>
  );
}
