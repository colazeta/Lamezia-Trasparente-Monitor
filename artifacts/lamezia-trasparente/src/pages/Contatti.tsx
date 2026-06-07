import { Link } from "wouter";
import {
  AlertTriangle,
  FileSearch,
  LifeBuoy,
  Mail,
  Megaphone,
  Scale3D,
} from "lucide-react";
import { PageMeta } from "@/components/seo/PageMeta";

const CONTACT_PATHS = [
  {
    title: "Segnalazioni civiche",
    description:
      "Per proporre un tema di monitoraggio, indicare un dato da verificare o suggerire un approfondimento documentale.",
    href: "/segnalazioni",
    cta: "Vai alle segnalazioni",
    icon: Megaphone,
  },
  {
    title: "Accesso civico verso l'ente",
    description:
      "Per richieste formali di documenti, dati o chiarimenti agli uffici competenti, seguendo le indicazioni istituzionali.",
    href: "/accesso-civico",
    cta: "Consulta la guida",
    icon: FileSearch,
  },
  {
    title: "Note legali e riuso",
    description:
      "Per cautele di lettura, limiti delle informazioni e uso responsabile dei dati pubblicati dal progetto.",
    href: "/note-legali",
    cta: "Leggi le note legali",
    icon: Scale3D,
  },
];

export function Contatti() {
  return (
    <>
      <PageMeta
        title="Contatti"
        description="Canali e percorsi distinti per contatti redazionali, segnalazioni civiche, accesso civico e note legali del progetto."
        path="/contatti"
      />
      <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
        <header className="mb-8 max-w-3xl">
          <span className="eyebrow text-primary">
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            Contatti del progetto
          </span>
          <h1 className="mt-2 text-3xl font-display font-bold tracking-tight md:text-4xl">
            Contatti
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
            Questa pagina separa i contatti redazionali del progetto dalle
            segnalazioni civiche, dalle richieste di accesso civico e dalle note
            legali. Dove mancano recapiti verificati, il limite è indicato in
            modo esplicito.
          </p>
        </header>

        <section
          aria-labelledby="canale-redazionale"
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <h2 id="canale-redazionale" className="flex items-center gap-2 text-2xl font-display font-bold">
            <LifeBuoy className="h-5 w-5 text-primary" aria-hidden="true" />
            Canale redazionale
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Placeholder redazionale: un recapito pubblico verificato del
            progetto non è ancora configurato in questo repository. Non vengono
            quindi pubblicati indirizzi email, numeri telefonici, nomi personali
            o riferimenti di governance non confermati.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Quando sarà disponibile un canale ufficiale del progetto, dovrà
            essere aggiunto con indicazione del titolare, dello scopo del
            trattamento dei messaggi, dei tempi di gestione attesi e degli
            eventuali limiti di risposta.
          </p>
        </section>

        <section aria-labelledby="percorsi" className="mt-8">
          <h2 id="percorsi" className="text-2xl font-display font-bold">
            Percorsi distinti
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {CONTACT_PATHS.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.href} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h3 className="mt-3 font-display text-lg font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                  <Link
                    href={item.href}
                    className="mt-4 inline-flex text-sm font-semibold text-primary underline underline-offset-4"
                  >
                    {item.cta}
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <h2 className="font-display text-lg font-bold">Non usare questa pagina come fonte ufficiale</h2>
              <p className="mt-2 text-sm leading-relaxed">
                Per comunicazioni amministrative formali, verifiche sugli atti,
                protocolli o richieste che producono effetti verso l'ente,
                occorre usare i canali istituzionali indicati dal Comune o dagli
                uffici competenti. Questo progetto non protocolla istanze e non
                sostituisce risposte ufficiali.
              </p>
            </div>
          </div>
        </aside>

        <section
          aria-labelledby="progetto"
          className="mt-8 rounded-2xl border border-border bg-muted/30 p-6"
        >
          <h2 id="progetto" className="text-2xl font-display font-bold">
            Informazioni sul progetto
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Per conoscere natura indipendente, limiti e responsabilità
            redazionale del portale, consulta la pagina Chi siamo.
          </p>
          <Link
            href="/chi-siamo"
            className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Vai a Chi siamo
          </Link>
        </section>
      </div>
    </>
  );
}
