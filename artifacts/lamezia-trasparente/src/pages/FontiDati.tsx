import { AlertTriangle, Database, ExternalLink, Info } from "lucide-react";
import { Link } from "wouter";
import { usePageMetadata } from "@/lib/usePageMetadata";

interface DataSource {
  name: string;
  description: string;
  href: string;
  dataType: "Ufficiale" | "Estratto" | "Arricchito" | "Da verificare";
  updateFrequency: string;
  limitations: string;
}

const DATA_SOURCES: DataSource[] = [
  {
    name: "Albo Pretorio del Comune di Lamezia Terme",
    description:
      "Pubblicazioni, determine, ordinanze, delibere e convocazioni rese disponibili dal portale ufficiale dell'Albo Pretorio comunale.",
    href: "https://albo.tinnvision.cloud/?ente=00301390795",
    dataType: "Ufficiale",
    updateFrequency:
      "Monitoraggio automatico periodico; le nuove pubblicazioni dipendono dalla frequenza di aggiornamento del portale ufficiale.",
    limitations:
      "L'Albo ufficiale conserva gli atti per finestre temporali limitate. I documenti precedenti all'avvio del monitoraggio continuativo potrebbero non essere recuperabili se non più pubblici.",
  },
  {
    name: "Bandi di gara e contratti — feed Legge 190/2012",
    description:
      "Feed pubblico collegato alla sezione comunale sui contratti, usato per ricostruire affidamenti, CIG, importi e operatori quando presenti nel testo dell'atto.",
    href: "https://albo.tinnvision.cloud/export/xml?wich=190&ente=00301390795",
    dataType: "Estratto",
    updateFrequency:
      "Monitoraggio automatico periodico; gli aggiornamenti seguono la pubblicazione del feed da parte del gestore del servizio.",
    limitations:
      "Alcuni campi non sono sempre strutturati nel feed e vengono estratti dal testo con regole conservative. Importi, operatori e classificazioni possono richiedere verifica sull'atto originale o sulla BDNCP.",
  },
  {
    name: "Portale ANAC / BDNCP sui contratti pubblici",
    description:
      "Fonte nazionale di consultazione sui contratti pubblici e sulle schede collegate ai CIG quando disponibili.",
    href: "https://dati.anticorruzione.it/superset/dashboard/appalti/",
    dataType: "Ufficiale",
    updateFrequency:
      "Aggiornata secondo i flussi nazionali ANAC; il sito mostra i dati quando trasmessi dalle stazioni appaltanti e pubblicati dalla piattaforma.",
    limitations:
      "La disponibilità puntuale per singolo CIG può variare. Il collegamento ANAC non sostituisce la verifica degli atti di gara, degli allegati e delle determine pubblicate dall'ente.",
  },
  {
    name: "Catalogo Open Data del Comune di Lamezia Terme",
    description:
      "Catalogo comunale di dataset riutilizzabili, con risorse CSV, JSON o altri formati pubblicati dall'ente.",
    href: "https://opendata.comune.lamezia-terme.cz.it",
    dataType: "Ufficiale",
    updateFrequency:
      "Sincronizzazione periodica del catalogo e delle risorse tabellari; la frequenza effettiva dipende dagli aggiornamenti pubblicati dall'ente.",
    limitations:
      "I dataset possono avere granularità, completezza e periodicità diverse. Le trasformazioni tabellari e gli snapshot locali servono alla consultazione civica e vanno confrontati con la scheda ufficiale del dataset.",
  },
  {
    name: "Italia Domani — Open data PNRR",
    description:
      "Dataset nazionali sui progetti PNRR, filtrati per il Comune di Lamezia Terme e collegati ai CUP quando presenti.",
    href: "https://www.italiadomani.gov.it/it/catalogo-open-data.html",
    dataType: "Ufficiale",
    updateFrequency:
      "Aggiornata secondo il calendario nazionale di pubblicazione dei dati PNRR; il sito effettua controlli periodici e conserva l'ultima sincronizzazione riuscita.",
    limitations:
      "I dati nazionali possono essere aggiornati con ritardi rispetto agli atti locali. Stato, importi e cronoprogrammi vanno letti insieme agli atti comunali e alle eventuali variazioni di progetto.",
  },
  {
    name: "OpenPNRR — Openpolis",
    description:
      "Fonte civica usata come fallback tecnico per consultare progetti PNRR quando i CSV nazionali non sono raggiungibili.",
    href: "https://openpnrr.it/",
    dataType: "Arricchito",
    updateFrequency:
      "Consultata solo come fonte di supporto/fallback; gli aggiornamenti dipendono dal servizio OpenPNRR e dalle basi dati nazionali sottostanti.",
    limitations:
      "È una rielaborazione civica di dati PNRR e non sostituisce il catalogo ufficiale Italia Domani né gli atti dell'ente attuatore.",
  },
  {
    name: "ANBSC — Open data beni sequestrati e confiscati",
    description:
      "Dataset nazionale sui beni immobili destinati o in gestione, filtrato per il territorio comunale quando disponibile.",
    href: "https://www.anbsc.it/opendata/beni-immobili-destinati.csv",
    dataType: "Ufficiale",
    updateFrequency:
      "Sincronizzazione periodica del CSV nazionale; la frequenza effettiva dipende dalla pubblicazione ANBSC.",
    limitations:
      "Localizzazione, stato amministrativo e destinazione possono cambiare o richiedere verifica documentale. Le geocodifiche e le aggregazioni territoriali sono arricchimenti da trattare con cautela.",
  },
  {
    name: "Registro comunale degli accessi civici",
    description:
      "Registro ufficiale delle richieste di accesso civico e generalizzato quando pubblicato dall'ente o importato da documenti comunali.",
    href: "https://www.comune.lamezia-terme.cz.it/",
    dataType: "Estratto",
    updateFrequency:
      "Aggiornamento manuale o periodico in base alla disponibilità del registro ufficiale e dei file pubblicati dal Comune.",
    limitations:
      "Oggetti, esiti e date possono provenire da CSV o documenti ufficiali con formati non uniformi. Ogni riga deve essere letta insieme al registro o all'atto di provenienza.",
  },
  {
    name: "Atti fondamentali, performance, legalità e pareri",
    description:
      "Documenti istituzionali come Statuto, regolamenti, PIAO, bilanci, indicatori di performance, requisiti di trasparenza e pareri di organismi di controllo.",
    href: "https://www.comune.lamezia-terme.cz.it/",
    dataType: "Da verificare",
    updateFrequency:
      "Aggiornamento redazionale o automatico dove disponibile; la periodicità varia per tipologia di documento e per pubblicazione istituzionale.",
    limitations:
      "Le schede possono includere collegamenti, note e sintesi civiche. La valutazione di completezza documentale richiede sempre il confronto con l'ultimo documento ufficiale pubblicato dall'ente.",
  },
];

const DATA_TYPE_DESCRIPTIONS = [
  {
    label: "Dati ufficiali",
    text: "informazioni pubblicate da enti pubblici o piattaforme istituzionali, riportate con link alla fonte quando disponibile.",
  },
  {
    label: "Dati estratti",
    text: "campi ricavati da feed, file o testi ufficiali con regole documentate; possono richiedere verifica sul documento originale.",
  },
  {
    label: "Dati arricchiti",
    text: "normalizzazioni, geocodifiche, categorie o collegamenti aggiunti per rendere i dati più leggibili e navigabili.",
  },
  {
    label: "Indicatori interpretativi",
    text: "misure di sintesi che aiutano a individuare ricorrenze, concentrazioni o documentazione mancante, senza attribuire responsabilità o intenzioni.",
  },
];

export function FontiDati() {
  usePageMetadata({
    title: "Fonti dati — rendiamoLameziaTrasparente",
    description:
      "Fonti, frequenza di aggiornamento, limiti e stato informativo dei dati usati dal monitoraggio civico di Lamezia Terme.",
  });

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
      <header className="mb-8 max-w-3xl">
        <span className="eyebrow text-primary">
          <Database className="h-3.5 w-3.5" />
          Trasparenza delle fonti
        </span>
        <h1 className="mt-2 text-3xl font-display font-bold tracking-tight md:text-4xl">
          Fonti dati
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Questa pagina documenta le principali fonti usate dal sito, il loro
          stato informativo, la frequenza di aggiornamento attesa e i limiti da
          considerare prima di usare i dati per analisi civiche.
        </p>
      </header>

      <section aria-labelledby="tipi-dato" className="mb-10 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 id="tipi-dato" className="text-2xl font-display font-bold">
          Tipi di dato e stato informativo
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {DATA_TYPE_DESCRIPTIONS.map((item) => (
            <article key={item.label} className="rounded-xl border border-border bg-muted/30 p-4">
              <h3 className="font-display text-base font-bold">{item.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="elenco-fonti" className="space-y-4">
        <h2 id="elenco-fonti" className="text-2xl font-display font-bold">
          Elenco delle fonti monitorate
        </h2>
        <div className="grid gap-4">
          {DATA_SOURCES.map((source) => (
            <article key={source.name} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-xl font-display font-bold">{source.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{source.description}</p>
                </div>
                <span className="inline-flex w-fit rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {source.dataType}
                </span>
              </div>

              <dl className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <dt className="text-sm font-semibold text-foreground">Link alla fonte</dt>
                  <dd className="mt-1 text-sm">
                    <a
                      href={source.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary underline underline-offset-4 hover:text-primary/80"
                    >
                      Apri la fonte ufficiale o il dataset
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-foreground">Tipo di dato</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{source.dataType}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-foreground">Frequenza di aggiornamento</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{source.updateFrequency}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-foreground">Limiti principali</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{source.limitations}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <aside className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="font-display text-lg font-bold">Uso prudente dei dati</h2>
            <p className="mt-2 text-sm leading-relaxed">
              Gli indicatori pubblici sono segnali amministrativi e documentali:
              possono evidenziare concentrazione, ricorrenza, rotazione debole,
              documentazione mancante o altri elementi che richiedono ulteriore
              verifica. Non sono prova di illegalità, corruzione, favoritismo,
              collusione o infiltrazione criminale.
            </p>
            <p className="mt-3 text-sm">
              Per il metodo di lettura consulta anche la pagina{" "}
              <Link href="/metodologia" className="font-semibold underline underline-offset-4">
                Metodologia
              </Link>{" "}
              e le{" "}
              <Link href="/note-legali" className="font-semibold underline underline-offset-4">
                Note legali e cautele interpretative
              </Link>
              .
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
