import {
  AlertTriangle,
  Database,
  ExternalLink,
  Info,
  ShieldCheck,
} from "lucide-react";
import { Link } from "wouter";
import { PageMeta } from "@/components/seo/PageMeta";
import { V0SectionLanding } from "@/components/launch/V0SectionLanding";
import { DATA_QUALITY_MATRIX, QUALITY_LEGEND } from "@/data/dataQuality";

import { DATA_SOURCES } from "@/data/dataSources";

const LINK_SCOPE_LABELS = {
  specifico: "Collegamento specifico",
  consultazione: "Portale di consultazione",
  fallback: "Fallback/documentazione",
  generico: "Collegamento generico",
} as const;

const LINK_SCOPE_CLASSES = {
  specifico:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  consultazione:
    "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  fallback:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  generico:
    "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300",
} as const;

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
        <V0SectionLanding
          eyebrow="Trasparenza delle fonti"
          icon={Database}
          title="Fonti e limiti dei dati"
          subtitle="Registro narrativo delle fonti pubbliche, delle frequenze attese, dei perimetri e dei limiti informativi usati dal portale civico."
          stateLabel="Pubblicabile v0"
          stateDescription="Sezione manuale/documentale: aiuta a capire cosa può e non può dimostrare ogni base informativa."
          findItems={[
            "Principali fonti censite e loro stato informativo.",
            "Legenda su dati ufficiali, estratti, arricchiti e indicatori interpretativi.",
            "Matrice prudente su completezza, aggiornamento e tracciabilità.",
          ]}
          missingItems={[
            "Mappatura più granulare per ogni fonte e sincronizzatore.",
            "Automazione completa degli aggiornamenti e dello storico tecnico.",
            "Verifiche umane periodiche sui collegamenti di fonte.",
          ]}
          sourceLimit="Le fonti possono essere incomplete, non aggiornate o non ancora collegate. Questa pagina documenta il perimetro disponibile, non certifica completezza sostanziale."
          cta={{ label: "Leggi fonti e limiti", href: "#contenuto-principale" }}
          secondaryLink={{ label: "Sezione collegata", href: "/metodologia" }}
        />

        <section
          id="contenuto-principale"
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
                      Collegamento documentato
                    </dt>
                    <dd className="mt-1 space-y-2 text-sm">
                      <span
                        className={`inline-flex w-fit rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                          LINK_SCOPE_CLASSES[source.linkScope]
                        }`}
                      >
                        {LINK_SCOPE_LABELS[source.linkScope]}
                      </span>
                      <a
                        href={source.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-fit items-center gap-1 text-primary underline underline-offset-4 hover:text-primary/80"
                        aria-label={`${source.linkLabel} (apre in una nuova scheda)`}
                      >
                        {source.linkLabel}
                        <ExternalLink
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </a>
                      <p className="leading-relaxed text-muted-foreground">
                        {source.linkNote}
                      </p>
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
