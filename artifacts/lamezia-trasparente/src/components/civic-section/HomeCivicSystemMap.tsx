import { CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

import { Button } from "@/components/ui/button";
import {
  SECTION_DATA_STATUS_LABELS,
  SECTION_LAUNCH_READINESS_LABELS,
  SECTION_STATUS_LABELS,
  getPriorityPageArchitectures,
  getSectionArchitecture,
  type SectionArchitecture,
} from "@/data/sectionArchitecture";

const HOME_CONTROL_PATHS = [
  "/convocazioni",
  "/delibere",
  "/albo",
  "/contratti",
  "/pnrr",
  "/organi",
  "/monitoraggio",
  "/atlante-territoriale",
  "/legalita",
] as const;

const HOME_CITIZEN_ACTIONS = [
  "scegliere un percorso per domanda civica",
  "aprire fonte, metodo e limiti prima di leggere un record",
  "distinguere dati parziali, demo e fonti non collegate",
  "segnalare un dato da verificare o preparare una richiesta di accesso civico",
] as const;

export function HomeCivicSystemMap() {
  const prioritySections = getPriorityPageArchitectures();
  const controlSections = HOME_CONTROL_PATHS.map((path) => getSectionArchitecture(path)).filter(
    (section): section is SectionArchitecture => section !== null,
  );
  const consultable = prioritySections.filter(
    (section) => section.launchReadiness !== "not-launch-ready",
  );
  const partial = prioritySections.filter(
    (section) => section.dataReadiness.dataStatus === "partial",
  );
  const missing = prioritySections.filter(
    (section) => section.dataReadiness.dataStatus === "missing",
  );
  const demo = prioritySections.filter(
    (section) =>
      section.status === "demo" || section.dataReadiness.dataStatus === "demo",
  );
  const ingestionReady = prioritySections.filter(
    (section) =>
      section.dataReadiness.dataStatus === "partial" &&
      section.dataReadiness.ingestionStatus.includes("Struttura pronta"),
  );

  const systemCards = [
    {
      title: "Cosa puoi controllare",
      description:
        "Sedute, atti, Albo, contratti, PNRR, ruoli pubblici, criticita, fonti, territorio e memoria civica.",
      sections: controlSections,
      label: "percorsi civici",
    },
    {
      title: "Dati gia consultabili",
      description:
        "Sezioni pubbliche leggibili con stato e cautele, senza promessa di copertura completa.",
      sections: consultable,
      label: "consultabili",
    },
    {
      title: "Dati parziali",
      description:
        "Pagine pronte a ricevere record reali o gia alimentate in modo incompleto.",
      sections: partial,
      label: SECTION_DATA_STATUS_LABELS.partial,
    },
    {
      title: "Fonti mancanti",
      description:
        "Canali o flussi che devono restare dichiarati come non collegati o in preparazione.",
      sections: missing,
      label: SECTION_DATA_STATUS_LABELS.missing,
    },
    {
      title: "Sezioni dimostrative",
      description:
        "Moduli che verificano formato e percorso, ma non rappresentano dati reali.",
      sections: demo,
      label: SECTION_STATUS_LABELS.demo,
    },
    {
      title: "Pronte per ingestion automatica",
      description:
        "Strutture con oggetto, fonte, filtri e limiti definiti, da collegare a import stabili.",
      sections: ingestionReady,
      label: "struttura pronta",
    },
  ];

  return (
    <section
      data-testid="home-civic-system-map"
      className="border-b border-border bg-background py-12 md:py-16"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <span className="eyebrow text-primary">Mappa operativa</span>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight md:text-4xl">
              Il monitor come sistema civico
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground md:text-base">
              La home orienta tra cosa si puo controllare, quali dati sono
              parziali, quali fonti mancano, quali moduli sono dimostrativi e
              quali sezioni sono pronte per ricevere ingestion automatica. I
              numeri e i record restano leggibili solo insieme a fonte, stato e
              limiti.
            </p>
            <div className="mt-5 rounded-lg border border-border bg-muted/25 p-4">
              <p className="text-[11px] font-bold uppercase text-primary">
                Cosa puo fare un cittadino
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-5 text-muted-foreground">
                {HOME_CITIZEN_ACTIONS.map((action) => (
                  <li key={action} className="flex gap-2">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/fonti-dati">
                  <Button variant="outline" size="sm">
                    Fonti dati
                  </Button>
                </Link>
                <Link href="/metodologia">
                  <Button variant="outline" size="sm">
                    Metodo
                  </Button>
                </Link>
                <Link href="/segnalazioni">
                  <Button variant="outline" size="sm">
                    Segnalazioni
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {systemCards.map((card) => (
              <HomeSystemCard
                key={card.title}
                title={card.title}
                description={card.description}
                sections={card.sections}
                label={card.label}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeSystemCard({
  title,
  description,
  sections,
  label,
}: {
  title: string;
  description: string;
  sections: readonly SectionArchitecture[];
  label: string;
}) {
  const visibleSections = sections.slice(0, 4);
  const remaining = Math.max(0, sections.length - visibleSections.length);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">
            {title}
          </h3>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-border bg-muted/40 px-2 py-1 text-[11px] font-semibold uppercase text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {visibleSections.map((section) => (
          <Link
            key={section.path}
            href={section.path}
            className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground transition-colors hover:border-primary/35 hover:text-primary"
          >
            {section.title}
          </Link>
        ))}
        {remaining > 0 ? (
          <span className="rounded-full border border-dashed border-border bg-muted/30 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            +{remaining} sezioni
          </span>
        ) : null}
      </div>
      {sections[0] ? (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Esempio di postura:{" "}
          {SECTION_LAUNCH_READINESS_LABELS[sections[0].launchReadiness]}.
        </p>
      ) : null}
    </div>
  );
}
