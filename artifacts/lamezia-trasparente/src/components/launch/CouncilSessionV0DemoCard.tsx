import { Link } from "wouter";
import { AlertTriangle, CalendarClock, FileText, Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  councilSessionV0DemoFixture,
  councilSessionV0FieldStatusLabels,
  councilSessionV0PublicFields,
  councilSessionV0StatusLabels,
  getCouncilSessionV0PublicFieldNote,
  type CouncilSessionV0,
  type CouncilSessionV0Field,
} from "@/data/councilSessionV0";

function formatDemoDate(value: string | null) {
  if (!value) return "Data non disponibile";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

function formatFieldValue(field: CouncilSessionV0Field<unknown>) {
  if (field.key === "scheduledAt" && typeof field.value === "string") {
    return formatDemoDate(field.value);
  }

  if (field.key === "sessionStatus" && typeof field.value === "string") {
    return (
      councilSessionV0StatusLabels[
        field.value as keyof typeof councilSessionV0StatusLabels
      ] ?? field.value
    );
  }

  if (Array.isArray(field.value)) {
    return field.value.length > 0 ? field.value.join("; ") : "Non disponibile";
  }

  if (typeof field.value === "string" && field.value.trim()) {
    return field.value;
  }

  return "Non disponibile";
}

function V0StatusBadge({ field }: { field: CouncilSessionV0Field<unknown> }) {
  return (
    <Badge
      variant={
        field.sourceStatus === "fixture_dimostrativa" ? "outline" : "secondary"
      }
      className="whitespace-normal text-left"
    >
      {councilSessionV0FieldStatusLabels[field.sourceStatus]}
    </Badge>
  );
}

export function CouncilSessionV0DemoNotice({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-amber-300/50 bg-amber-50 p-4 text-amber-950 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div className="space-y-1 text-sm leading-relaxed">
          <p className="font-semibold">Fallback dimostrativo dichiarato</p>
          <p>
            Questa scheda usa una fixture tecnica perché dati/API verificati non
            sono disponibili in modo affidabile nel percorso pubblico. Non rappresenta
            una convocazione reale e non va usata come fonte civica.
          </p>
          {!compact && (
            <p>
              Le informazioni pubblicabili devono essere verificate sulle fonti
              originarie e accompagnate da stato del dato, limiti e data di
              controllo.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function CouncilSessionV0DemoSummaryCard() {
  const session = councilSessionV0DemoFixture;

  return (
    <Card className="border-amber-300/50 bg-amber-50/70 p-5 dark:border-amber-500/40 dark:bg-amber-500/10">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge variant="outline">Fixture dimostrativa</Badge>
        <Badge variant="secondary">Primo output civico</Badge>
      </div>
      <h2 className="font-display text-xl font-bold tracking-tight">
        {session.title.value}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Esempio tecnico per testare il percorso Home → Convocazioni → scheda →
        fonti e limiti quando una fonte verificata non è ancora collegata.
      </p>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-foreground">Data scheda</dt>
          <dd className="text-muted-foreground">
            {formatDemoDate(session.scheduledAt.value)}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-foreground">Stato fonte</dt>
          <dd className="text-muted-foreground">
            {councilSessionV0FieldStatusLabels[session.title.sourceStatus]}
          </dd>
        </div>
      </dl>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button asChild className="sm:w-auto">
          <Link href={`/convocazioni/${session.id}`}>Apri scheda demo</Link>
        </Button>
        <Button asChild variant="outline" className="sm:w-auto">
          <Link href="/fonti-dati">Fonti e limiti</Link>
        </Button>
      </div>
    </Card>
  );
}

export function CouncilSessionV0DemoDetail({
  session = councilSessionV0DemoFixture,
}: {
  session?: CouncilSessionV0;
}) {
  const fields = councilSessionV0PublicFields.map((key) => session[key]);

  return (
    <div className="space-y-8">
      <CouncilSessionV0DemoNotice />

      <header className="overflow-hidden rounded-2xl border border-border bg-muted/30">
        <span className="block h-1.5 w-full bg-amber-500" />
        <div className="p-6 md:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant="outline">Scheda demo</Badge>
            <Badge variant="secondary">
              {
                councilSessionV0StatusLabels[
                  session.sessionStatus.value ?? "non_verificata"
                ]
              }
            </Badge>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            {session.title.value}
          </h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            La scheda mostra il formato minimo previsto per sedute e
            convocazioni: stato del dato, eventuali assenze informative, limiti
            e rinvio alla fonte originaria quando disponibile.
          </p>
        </div>
      </header>

      <section aria-labelledby="demo-fields-title" className="space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand/10 text-brand">
            <FileText className="h-4 w-4" aria-hidden="true" />
          </span>
          <h2
            id="demo-fields-title"
            className="font-display text-2xl font-bold tracking-tight"
          >
            Campi pubblicabili e stato di verifica
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <Card key={field.key} className="p-4">
              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <h3 className="font-semibold">{field.label}</h3>
                <V0StatusBadge field={field} />
              </div>
              <p className="text-sm text-foreground">
                {formatFieldValue(field)}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {getCouncilSessionV0PublicFieldNote(field)}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section
        id="fonti-limiti-v0"
        aria-labelledby="fonti-limiti-v0-title"
        className="rounded-2xl border border-border bg-card p-5 md:p-6"
      >
        <div className="mb-3 flex items-center gap-2.5">
          <Info className="h-5 w-5 text-brand" aria-hidden="true" />
          <h2
            id="fonti-limiti-v0-title"
            className="font-display text-xl font-bold tracking-tight"
          >
            Fonti, limiti e cautele
          </h2>
        </div>
        <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>
            La fixture non contiene una fonte reale e non certifica copertura
            storica.
          </li>
          <li>
            Un campo assente o parziale indica un limite informativo o una
            verifica richiesta.
          </li>
          <li>
            Indicatori e ricorrenze sono segnali di monitoraggio, non
            conclusioni su condotte o responsabilità.
          </li>
          <li>
            Per contenuti reali resta necessario controllare la fonte pubblica
            originaria.
          </li>
        </ul>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="outline">
            <Link href="/fonti-dati">Apri indice fonti dati</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/metodologia">Leggi metodologia e cautele</Link>
          </Button>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="outline">
          <Link href="/convocazioni">
            <CalendarClock className="mr-2 h-4 w-4" aria-hidden="true" />
            Torna alle convocazioni
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/">Torna alla Home</Link>
        </Button>
      </div>
    </div>
  );
}
