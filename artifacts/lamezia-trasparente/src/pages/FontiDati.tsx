import {
  AlertTriangle,
  Database,
  ExternalLink,
  Info,
  ShieldCheck,
} from "lucide-react";
import { Link } from "wouter";
import { PageMeta } from "@/components/seo/PageMeta";

interface DataSource {
  name: string;
  description: string;
  href: string;
  dataType: "Ufficiale" | "Estratto" | "Arricchito" | "Da verificare";
  updateFrequency: string;
  limitations: string;
}

interface DataQualityIndicator {
  sourceName: string;
  lastKnownUpdate: string;
  sourceTraceability: "Calcolato" | "Documentato";
  sourceLinkAvailability: string;
  identifierCoverage: string;
  attachmentAvailability: string;
  coverageLimits: string;
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
    name: "Promessometro amministrativo — seed manuale",
    description:
      "Struttura redazionale locale per collegare promesse programmatiche, fonti della promessa e atti amministrativi pertinenti quando verificati.",
    href: "https://www.comune.lamezia-terme.cz.it/",
    dataType: "Da verificare",
    updateFrequency:
      "Aggiornamento manuale nella v0: ogni promessa reale richiede fonte programmatica, data, mandato di riferimento, nota di cautela e ultima verifica.",
    limitations:
      "La v0 contiene un record modello non conteggiato quando non sono disponibili promesse verificate nel repository. I collegamenti ad atti non equivalgono automaticamente a completamento o realizzazione osservabile.",
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

const MAIN_MONITORED_SOURCE_NAMES = [
  "Albo Pretorio del Comune di Lamezia Terme",
  "Bandi di gara e contratti — feed Legge 190/2012",
  "Portale ANAC / BDNCP sui contratti pubblici",
  "Catalogo Open Data del Comune di Lamezia Terme",
  "Italia Domani — Open data PNRR",
  "ANBSC — Open data beni sequestrati e confiscati",
  "Registro comunale degli accessi civici",
] as const;

const DOCUMENTED_QUALITY_NOTES: Record<
  (typeof MAIN_MONITORED_SOURCE_NAMES)[number],
  Pick<
    DataQualityIndicator,
    "lastKnownUpdate" | "identifierCoverage" | "attachmentAvailability"
  >
> = {
  "Albo Pretorio del Comune di Lamezia Terme": {
    lastKnownUpdate:
      "Documentato: monitoraggio automatico periodico; questa pagina non espone un timestamp di ultimo snapshot.",
    identifierCoverage:
      "Documentato/manuale: numero atto, tipo e date dipendono dalla pubblicazione ufficiale; copertura aggregata non calcolata qui.",
    attachmentAvailability:
      "Documentato/manuale: allegati presenti quando pubblicati dall'Albo e recuperabili nella finestra pubblica; quota non calcolata qui.",
  },
  "Bandi di gara e contratti — feed Legge 190/2012": {
    lastKnownUpdate:
      "Documentato: sincronizzazione periodica del feed; il valore puntuale dipende dall'ultima pubblicazione del gestore.",
    identifierCoverage:
      "Documentato/manuale: CIG e operatori possono essere presenti o estratti dal testo; percentuale non calcolata senza uno snapshot strutturato.",
    attachmentAvailability:
      "Documentato/manuale: gli allegati vanno verificati sugli atti collegati; quota non calcolata dal feed sintetico.",
  },
  "Portale ANAC / BDNCP sui contratti pubblici": {
    lastKnownUpdate:
      "Documentato: aggiornamento secondo flussi nazionali ANAC; nessun timestamp locale calcolato in questa sezione.",
    identifierCoverage:
      "Documentato/manuale: il CIG è l'identificativo di consultazione, ma la disponibilità puntuale varia per scheda e trasmissione.",
    attachmentAvailability:
      "Non applicabile in questa matrice: la sezione monitora il collegamento alle schede, non la presenza di allegati locali.",
  },
  "Catalogo Open Data del Comune di Lamezia Terme": {
    lastKnownUpdate:
      "Documentato: sincronizzazione periodica del catalogo; le date effettive restano nei metadati delle singole schede.",
    identifierCoverage:
      "Documentato/manuale: identificativi e campi chiave variano per dataset; copertura aggregata non confrontabile tra risorse eterogenee.",
    attachmentAvailability:
      "Documentato/manuale: risorse CSV, JSON o altri formati sono collegate nelle schede quando pubblicate; quota aggregata non calcolata qui.",
  },
  "Italia Domani — Open data PNRR": {
    lastKnownUpdate:
      "Documentato: aggiornamento secondo calendario nazionale PNRR; questa pagina conserva solo la regola di consultazione.",
    identifierCoverage:
      "Documentato/manuale: il CUP è l'identificativo principale; la copertura va verificata sugli open data nazionali filtrati.",
    attachmentAvailability:
      "Non applicabile in questa matrice: i dataset PNRR sono basi tabellari nazionali, non fascicoli con allegati locali.",
  },
  "ANBSC — Open data beni sequestrati e confiscati": {
    lastKnownUpdate:
      "Documentato: sincronizzazione periodica del CSV nazionale; il timestamp puntuale dipende dalla pubblicazione ANBSC.",
    identifierCoverage:
      "Documentato/manuale: localizzazione e stato amministrativo sono campi del CSV nazionale; copertura locale non calcolata qui.",
    attachmentAvailability:
      "Non applicabile in questa matrice: fonte tabellare nazionale senza allegati locali monitorati dal portale.",
  },
  "Registro comunale degli accessi civici": {
    lastKnownUpdate:
      "Documentato/manuale: aggiornamento in base alla disponibilità del registro ufficiale o dei file importati.",
    identifierCoverage:
      "Documentato/manuale: date, oggetti ed esiti dipendono dal formato del registro; copertura aggregata non calcolata qui.",
    attachmentAvailability:
      "Documentato/manuale: eventuali file o documenti di provenienza vanno letti con il registro ufficiale; quota non calcolata qui.",
  },
};

const DATA_QUALITY_MATRIX: DataQualityIndicator[] =
  MAIN_MONITORED_SOURCE_NAMES.map((sourceName) => {
    const source = DATA_SOURCES.find((item) => item.name === sourceName);
    const documented = DOCUMENTED_QUALITY_NOTES[sourceName];

    return {
      sourceName,
      lastKnownUpdate: documented.lastKnownUpdate,
      sourceTraceability: source?.href ? "Calcolato" : "Documentato",
      sourceLinkAvailability: source?.href
        ? "Disponibile: la scheda fonte contiene un link pubblico verificabile."
        : "Documentato/manuale: link non presente nella scheda fonte.",
      identifierCoverage: documented.identifierCoverage,
      attachmentAvailability: documented.attachmentAvailability,
      coverageLimits:
        source?.limitations ??
        "Limiti da documentare nella scheda fonte prima dell'uso analitico.",
    };
  });

const QUALITY_LEGEND = [
  {
    label: "Calcolato",
    text: "valore derivato direttamente da campi già presenti in questa pagina, ad esempio la presenza di un link pubblico nella scheda fonte.",
  },
  {
    label: "Documentato/manuale",
    text: "nota metodologica ricavata dalle schede fonte esistenti: segnala che l'aggregato non è ancora calcolato da uno snapshot strutturato.",
  },
  {
    label: "Non applicabile",
    text: "indicatore non confrontabile per quella fonte, ad esempio allegati locali su dataset tabellari nazionali.",
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
  return (
    <>
      <PageMeta
        title="Fonti dati pubbliche e stato dei dataset"
        description="Elenco delle fonti ufficiali, estratte, arricchite o da verificare usate dal portale civico, con osservatorio prudente sulla qualità informativa dei dataset monitorati."
        path="/fonti-dati"
      />
      <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
        <header className="mb-8 max-w-3xl">
          <span className="eyebrow text-primary">
            <Database className="h-3.5 w-3.5" aria-hidden="true" />
            Trasparenza delle fonti
          </span>
          <h1 className="mt-2 text-3xl font-display font-bold tracking-tight md:text-4xl">
            Fonti dati
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Questa pagina documenta le principali fonti usate dal sito, il loro
            stato informativo, la frequenza di aggiornamento attesa e i limiti
            da considerare prima di usare i dati per analisi civiche.
          </p>
        </header>

        <section
          aria-labelledby="tipi-dato"
          className="mb-10 rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <h2 id="tipi-dato" className="text-2xl font-display font-bold">
            Tipi di dato e stato informativo
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {DATA_TYPE_DESCRIPTIONS.map((item) => (
              <article
                key={item.label}
                className="rounded-xl border border-border bg-muted/30 p-4"
              >
                <h3 className="font-display text-base font-bold">
                  {item.label}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="osservatorio-qualita"
          className="mb-10 rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <span className="eyebrow text-primary">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Osservatorio qualità informativa
              </span>
              <h2
                id="osservatorio-qualita"
                className="mt-2 text-2xl font-display font-bold"
              >
                Matrice minima di completezza, aggiornamento e tracciabilità
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                La matrice riguarda solo la qualità delle basi informative già
                censite dal portale: aggiornamento documentato, disponibilità di
                link sorgente, copertura degli identificativi chiave, presenza
                di allegati o risorse e limiti noti. I valori non disponibili
                come aggregati sono indicati come note documentate/manuali,
                senza inventare percentuali o soglie.
              </p>
            </div>
            <Link
              href="/metodologia"
              className="inline-flex w-fit items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/15"
            >
              Metodo di lettura
            </Link>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {QUALITY_LEGEND.map((item) => (
              <article
                key={item.label}
                className="rounded-xl border border-border bg-muted/30 p-4"
              >
                <h3 className="font-display text-sm font-bold">{item.label}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="min-w-[980px] divide-y divide-border text-sm">
              <caption className="sr-only">
                Matrice degli indicatori di qualità informativa per le
                principali fonti monitorate
              </caption>
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Fonte
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Ultimo aggiornamento noto
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Link sorgente
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Identificativi chiave
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Allegati o risorse
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Limiti di copertura
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {DATA_QUALITY_MATRIX.map((indicator) => (
                  <tr key={indicator.sourceName} className="align-top">
                    <th
                      scope="row"
                      className="px-4 py-4 text-left font-semibold text-foreground"
                    >
                      {indicator.sourceName}
                    </th>
                    <td className="px-4 py-4 leading-relaxed text-muted-foreground">
                      {indicator.lastKnownUpdate}
                    </td>
                    <td className="px-4 py-4 leading-relaxed text-muted-foreground">
                      <span className="mb-1 inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                        {indicator.sourceTraceability}
                      </span>
                      <br />
                      {indicator.sourceLinkAvailability}
                    </td>
                    <td className="px-4 py-4 leading-relaxed text-muted-foreground">
                      {indicator.identifierCoverage}
                    </td>
                    <td className="px-4 py-4 leading-relaxed text-muted-foreground">
                      {indicator.attachmentAvailability}
                    </td>
                    <td className="px-4 py-4 leading-relaxed text-muted-foreground">
                      {indicator.coverageLimits}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
            <div className="flex gap-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p className="text-sm leading-relaxed">
                Completezza, assenza di allegati, ritardi di aggiornamento o
                mancanza di identificativi sono segnali di qualità informativa e
                bisogni di verifica documentale. Non indicano automaticamente
                irregolarità, responsabilità individuali o valutazioni
                sull'operato dell'ente.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="elenco-fonti" className="space-y-4">
          <h2 id="elenco-fonti" className="text-2xl font-display font-bold">
            Elenco delle fonti monitorate
          </h2>
          <div className="grid gap-4">
            {DATA_SOURCES.map((source) => (
              <article
                key={source.name}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-xl font-display font-bold">
                      {source.name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {source.description}
                    </p>
                  </div>
                  <span className="inline-flex w-fit rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {source.dataType}
                  </span>
                </div>

                <dl className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <dt className="text-sm font-semibold text-foreground">
                      Link alla fonte
                    </dt>
                    <dd className="mt-1 text-sm">
                      <a
                        href={source.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary underline underline-offset-4 hover:text-primary/80"
                      >
                        Apri la fonte ufficiale o il dataset
                        <ExternalLink
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-semibold text-foreground">
                      Tipo di dato
                    </dt>
                    <dd className="mt-1 text-sm text-muted-foreground">
                      {source.dataType}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-semibold text-foreground">
                      Frequenza di aggiornamento
                    </dt>
                    <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {source.updateFrequency}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-semibold text-foreground">
                      Limiti principali
                    </dt>
                    <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {source.limitations}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <aside className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
          <div className="flex gap-3">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />
            <div>
              <h2 className="font-display text-lg font-bold">
                Uso prudente dei dati
              </h2>
              <p className="mt-2 text-sm leading-relaxed">
                Gli indicatori pubblici sono segnali amministrativi e
                documentali: possono evidenziare concentrazione, ricorrenza,
                rotazione debole, documentazione mancante o altri elementi che
                richiedono ulteriore verifica. Non sono prova di illegalità,
                corruzione, favoritismo, collusione o infiltrazione criminale.
              </p>
              <p className="mt-3 text-sm">
                Per il metodo di lettura consulta anche la pagina{" "}
                <Link
                  href="/metodologia"
                  className="font-semibold underline underline-offset-4"
                >
                  Metodologia
                </Link>{" "}
                e le{" "}
                <Link
                  href="/note-legali"
                  className="font-semibold underline underline-offset-4"
                >
                  Note legali e cautele interpretative
                </Link>
                .
              </p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
