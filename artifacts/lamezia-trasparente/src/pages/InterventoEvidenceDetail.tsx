import { Link, useRoute } from "wouter";
import {
  AlertTriangle,
  ArrowLeft,
  Beaker,
  CalendarDays,
  ExternalLink,
  Globe2,
  Landmark,
  ListChecks,
  Scale,
  Wrench,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PageMeta } from "@/components/seo/PageMeta";
import {
  EVIDENCE_AREA_LABELS,
  EVIDENCE_IMPLEMENTABILITY_LABELS,
  EVIDENCE_INTERVENTION_TYPE_LABELS,
  EVIDENCE_STRENGTH_LABELS,
  findEvidenceIntervention,
  type EvidenceStrength,
} from "@/data/evidenceInterventions";

function evidenceBadgeVariant(strength: EvidenceStrength) {
  if (strength === "molto_forte") return "default" as const;
  if (strength === "forte") return "secondary" as const;
  return "outline" as const;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
      <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function LabelValue({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-relaxed text-foreground">{value}</dd>
    </div>
  );
}

export function InterventoEvidenceDetail() {
  const [, params] = useRoute("/interventi-locali/:id");
  const item = params?.id ? findEvidenceIntervention(params.id) : null;

  if (!item || item.evidenceStrength === "da_verificare") {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <PageMeta
          title="Intervento non disponibile"
          description="La scheda richiesta non è disponibile nella versione pubblica dell'archivio."
          path="/interventi-locali"
        />
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
          <AlertTriangle className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden="true" />
          <h1 className="mt-3 font-display text-2xl font-semibold">Scheda non disponibile</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Il record non esiste oppure è ancora in verifica e non viene presentato come
            intervento evidence-based consolidato.
          </p>
          <Link
            href="/interventi-locali"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Torna all'archivio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
      <PageMeta
        title={item.title}
        description={`${item.authority}, ${item.territory}: misura, valutazione empirica, risultati, limiti e trasferibilità potenziale.`}
        path={`/interventi-locali/${item.id}`}
      />

      <Link
        href="/interventi-locali"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Torna all'archivio
      </Link>

      <header className="max-w-4xl">
        <div className="flex flex-wrap gap-2">
          <Badge variant={evidenceBadgeVariant(item.evidenceStrength)}>
            Evidenza {EVIDENCE_STRENGTH_LABELS[item.evidenceStrength].toLocaleLowerCase("it")}
          </Badge>
          <Badge variant="outline">
            {EVIDENCE_IMPLEMENTABILITY_LABELS[item.implementability]}
          </Badge>
          <Badge variant="secondary">{EVIDENCE_AREA_LABELS[item.primaryArea]}</Badge>
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-5xl">
          {item.title}
        </h1>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Landmark className="h-4 w-4" aria-hidden="true" />
            {item.authority}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Globe2 className="h-4 w-4" aria-hidden="true" />
            {item.territory} · {item.country}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            {item.implementationYear}
          </span>
        </div>
      </header>

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.8fr)]">
        <div className="space-y-5">
          <Section title="Problema, misura e meccanismo">
            <dl className="space-y-5">
              <LabelValue label="Problema affrontato" value={item.problem} />
              <LabelValue label="Misura adottata" value={item.measure} />
              <LabelValue label="Meccanismo operativo" value={item.mechanism} />
              <LabelValue label="Popolazione interessata" value={item.population} />
            </dl>
          </Section>

          <Section title="Come è stato valutato">
            <div className="mb-4 flex items-center gap-2 text-foreground">
              <Beaker className="h-4 w-4 text-primary" aria-hidden="true" />
              <span className="font-semibold">Disegno empirico</span>
            </div>
            <dl className="space-y-5">
              <LabelValue label="Metodo di valutazione" value={item.evaluationMethod} />
              <LabelValue label="Comparatore" value={item.comparator} />
              <LabelValue
                label="Outcome"
                value={
                  <ul className="flex flex-wrap gap-2">
                    {item.outcomes.map((outcome) => (
                      <li key={outcome}>
                        <Badge variant="outline">{outcome}</Badge>
                      </li>
                    ))}
                  </ul>
                }
              />
            </dl>
          </Section>

          <Section title="Risultati osservati">
            <div className="rounded-xl border border-border bg-muted/25 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Dimensione dell'effetto
              </p>
              <p className="mt-2 font-semibold leading-relaxed text-foreground">{item.effectSize}</p>
            </div>
            <p className="mt-4">{item.results}</p>
          </Section>

          <Section title="Limiti e cautele">
            <ul className="space-y-3">
              {item.limitations.map((limitation) => (
                <li key={limitation} className="flex gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                  <span>{limitation}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 border-t border-border pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Effetti indesiderati o rischi
              </p>
              <p className="mt-2">{item.unintendedEffects}</p>
            </div>
          </Section>

          <Section title="Trasferibilità a Lamezia Terme">
            <dl className="space-y-5">
              <LabelValue label="Trasferibilità a un comune italiano" value={item.transferabilityItaly} />
              <LabelValue label="Possibile adattamento a Lamezia" value={item.lameziaAdaptation} />
              <LabelValue
                label="Capacità o dati necessari"
                value={
                  <ul className="space-y-2">
                    {item.capacityDataNeeds.map((need) => (
                      <li key={need} className="flex gap-2">
                        <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                        <span>{need}</span>
                      </li>
                    ))}
                  </ul>
                }
              />
            </dl>
          </Section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="font-display text-lg font-semibold">Scheda operativa</h2>
            <dl className="mt-4 space-y-4">
              <LabelValue label="Scala territoriale" value={item.territorialScale} />
              <LabelValue label="Stato" value={item.interventionStatus} />
              <LabelValue label="Costi / requisiti" value={item.costsRequirements} />
              <LabelValue label="Ultima verifica" value={item.lastVerifiedAt} />
            </dl>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-primary" aria-hidden="true" />
              <h2 className="font-display text-lg font-semibold">Tipo di intervento</h2>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {item.interventionTypes.map((value) => (
                <Badge key={value} variant="outline">
                  {EVIDENCE_INTERVENTION_TYPE_LABELS[value]}
                </Badge>
              ))}
            </div>
            <div className="mt-5 border-t border-border pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Strumenti
              </p>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                {item.tools.map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary" aria-hidden="true" />
              <h2 className="font-display text-lg font-semibold">Fonti e studi</h2>
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Fonte primaria
              </p>
              <a
                href={item.primarySource.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-start gap-1.5 text-sm font-semibold leading-relaxed text-primary underline-offset-4 hover:underline"
              >
                {item.primarySource.label}
                <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              </a>
            </div>
            <div className="mt-5 border-t border-border pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Studi di valutazione
              </p>
              <ul className="mt-3 space-y-4">
                {item.evaluationStudies.map((study) => (
                  <li key={study.url}>
                    <a
                      href={study.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-start gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                    >
                      {study.label}
                      <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    </a>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {study.citation}
                    </p>
                    {study.doi ? (
                      <p className="mt-1 text-xs text-muted-foreground">DOI: {study.doi}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-muted/20 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Nota metodologica
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              La forza dell'evidenza riguarda il disegno e la leggibilità della valutazione nel
              contesto osservato. Non misura automaticamente la replicabilità a Lamezia Terme e
              non sostituisce una diagnosi locale, una verifica giuridica o una valutazione ex ante.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
