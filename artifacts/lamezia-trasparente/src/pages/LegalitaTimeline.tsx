import { useMemo, useState, type ReactNode } from "react";
import { Link } from "wouter";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpenCheck,
  CalendarDays,
  ExternalLink,
  FileText,
  Filter,
  Landmark,
  MapPin,
  Scale,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getPublishedLegalityTimelineEvents,
  TIMELINE_EVENT_TYPE_LABELS,
  TIMELINE_SOURCE_KIND_LABELS,
  TIMELINE_STATUS_LABELS,
  timelineSchemaExample,
  type LegalityTimelineEvent,
  type TimelineEventType,
  type TimelineStatus,
} from "@/content/legalitaTimeline";

const STATUS_BADGE: Record<TimelineStatus, string> = {
  indagine:
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  misura_cautelare:
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  processo_in_corso:
    "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  condanna_non_definitiva:
    "border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  condanna_definitiva:
    "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300",
  assoluzione:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  archiviazione:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  misura_amministrativa:
    "border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  fatto_storico_istituzionale: "border-brand/40 bg-brand/10 text-brand",
  non_applicabile: "border-border bg-muted text-muted-foreground",
};

type FilterValue = "all" | string;

const PUBLIC_TIMELINE_EVENTS = getPublishedLegalityTimelineEvents();

const SORTED_EVENTS = [...PUBLIC_TIMELINE_EVENTS].sort((a, b) =>
  b.startDate.localeCompare(a.startDate),
);

function getYear(event: LegalityTimelineEvent) {
  return event.startDate.slice(0, 4);
}

function isInternalUrl(url: string) {
  return url.startsWith("/") && !url.startsWith("//");
}

export function LegalitaTimeline() {
  const [period, setPeriod] = useState<FilterValue>("all");
  const [eventType, setEventType] = useState<FilterValue>("all");
  const [status, setStatus] = useState<FilterValue>("all");

  const periods = useMemo(
    () => Array.from(new Set(SORTED_EVENTS.map(getYear))),
    [],
  );
  const eventTypes = useMemo(
    () => Array.from(new Set(SORTED_EVENTS.map((event) => event.eventType))),
    [],
  );
  const statuses = useMemo(
    () => Array.from(new Set(SORTED_EVENTS.map((event) => event.status))),
    [],
  );

  const publishedEventsCount = SORTED_EVENTS.length;

  const filteredEvents = useMemo(
    () =>
      SORTED_EVENTS.filter((event) => {
        const matchesPeriod = period === "all" || getYear(event) === period;
        const matchesType =
          eventType === "all" || event.eventType === eventType;
        const matchesStatus = status === "all" || event.status === status;
        return matchesPeriod && matchesType && matchesStatus;
      }),
    [period, eventType, status],
  );

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
      <Link
        href="/legalita"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Torna a Legalità
      </Link>

      <header className="mb-8 max-w-4xl space-y-4">
        <span className="eyebrow text-primary">
          <BookOpenCheck className="h-3.5 w-3.5" />
          Memoria civica verificabile
        </span>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Timeline legalità, antimafia e memoria istituzionale
        </h1>
        <p className="text-lg text-muted-foreground">
          Una struttura pubblica per ordinare eventi documentati da fonti
          istituzionali o amministrative, distinguendo sempre data, tipologia,
          status, fonte e limiti di lettura. La lista pubblica include solo
          schede esplicitamente abilitate alla pubblicazione dopo verifica
          redazionale di fonte primaria, cautela e ultimo controllo.
        </p>
      </header>

      <section className="mb-8 grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <Card className="border-brand/30 bg-brand/5 p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
            <div className="space-y-2">
              <h2 className="font-display text-lg font-semibold">
                Nota metodologica visibile
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                La timeline non formula accuse autonome, non sostituisce atti
                giudiziari o amministrativi e non attribuisce responsabilità a
                persone fisiche. Ogni scheda pubblicata deve essere letta come
                promemoria documentale, secondo la fonte indicata e con lo
                status riportato nella scheda.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div className="space-y-2">
              <h2 className="font-display text-lg font-semibold">
                Stato della versione pubblica
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {publishedEventsCount === 0
                  ? "Nessun evento reale è pubblicato in questa prima struttura: i record saranno aggiunti solo dopo verifica di fonte primaria, status giudiziario o amministrativo e ultimo controllo."
                  : `${publishedEventsCount} ${
                      publishedEventsCount === 1
                        ? "scheda verificata è pubblicata"
                        : "schede verificate sono pubblicate"
                    } nella lista pubblica. Eventuali record redazionali non abilitati restano esclusi dalla timeline.`}
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section aria-labelledby="timeline-filters" className="mb-8">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Filter className="h-4 w-4 text-brand" />
          <h2 id="timeline-filters">Filtri della timeline</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger
              className="w-[190px]"
              aria-label="Filtra per periodo o anno"
            >
              <SelectValue placeholder="Periodo o anno" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i periodi</SelectItem>
              {periods.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger
              className="w-[250px]"
              aria-label="Filtra per tipologia evento"
            >
              <SelectValue placeholder="Tipologia evento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte le tipologie</SelectItem>
              {eventTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {TIMELINE_EVENT_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger
              className="w-[250px]"
              aria-label="Filtra per status giudiziario o amministrativo"
            >
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti gli status</SelectItem>
              {statuses.map((item) => (
                <SelectItem key={item} value={item}>
                  {TIMELINE_STATUS_LABELS[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {filteredEvents.length > 0 ? (
        <section
          aria-label={`Eventi della timeline (${publishedEventsCount} pubblicati)`}
          className="space-y-4"
        >
          {filteredEvents.map((event) => (
            <TimelineEventCard key={event.id} event={event} />
          ))}
        </section>
      ) : (
        <Empty className="border border-dashed border-border bg-muted/20">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-brand/10 text-brand">
              <Scale className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Nessun evento pubblicato nella versione pubblica</EmptyTitle>
            <EmptyDescription>
              La struttura è pronta per schede verificate, ma non mostra eventi
              non confermati o esempi fittizi come se fossero fatti reali.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      <section className="mt-10" aria-labelledby="timeline-schema">
        <h2
          id="timeline-schema"
          className="font-display text-xl font-bold tracking-tight"
        >
          Schema redazionale prima della pubblicazione
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Questo riquadro è un modello di record, non un evento reale. Serve a
          rendere verificabili i campi minimi richiesti prima di pubblicare una
          scheda nella timeline.
        </p>
        <TimelineEventCard event={timelineSchemaExample} isSchemaPreview />
      </section>
    </div>
  );
}

function TimelineEventCard({
  event,
  isSchemaPreview = false,
}: {
  event: LegalityTimelineEvent;
  isSchemaPreview?: boolean;
}) {
  return (
    <Card className="mt-4 overflow-hidden p-0">
      <div className="border-l-4 border-brand p-5 md:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={STATUS_BADGE[event.status]}>
            {TIMELINE_STATUS_LABELS[event.status]}
          </Badge>
          <Badge variant="secondary">
            {TIMELINE_EVENT_TYPE_LABELS[event.eventType]}
          </Badge>
          {isSchemaPreview ? (
            <Badge
              variant="outline"
              className="border-border bg-muted text-muted-foreground"
            >
              Schema, non evento reale
            </Badge>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <div>
            <h3 className="font-display text-xl font-bold tracking-tight">
              {event.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {event.shortDescription}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground md:justify-end">
            <CalendarDays className="h-4 w-4" />
            {event.dateLabel}
          </div>
        </div>

        <dl className="mt-5 grid gap-4 md:grid-cols-2">
          <InfoBlock icon={FileText} label="Fonte primaria">
            <SourceLink
              label={event.primarySource.label}
              url={event.primarySource.url}
            />
            <div className="mt-1 text-xs text-muted-foreground">
              {TIMELINE_SOURCE_KIND_LABELS[event.primarySource.kind]}
            </div>
          </InfoBlock>

          {event.secondarySources.length > 0 ? (
            <InfoBlock icon={FileText} label="Fonti aggiuntive">
              <ul className="space-y-2">
                {event.secondarySources.map((source) => (
                  <li key={`${source.kind}-${source.url}`}>
                    <SourceLink label={source.label} url={source.url} />
                    <div className="mt-1 text-xs text-muted-foreground">
                      {TIMELINE_SOURCE_KIND_LABELS[source.kind]}
                    </div>
                  </li>
                ))}
              </ul>
            </InfoBlock>
          ) : null}

          <InfoBlock icon={Landmark} label="Effetto istituzionale o civico">
            {event.civicEffect}
          </InfoBlock>

          <InfoBlock icon={MapPin} label="Luoghi ed enti">
            <div className="space-y-1">
              <div>{event.places.join(", ") || "Non indicati"}</div>
              <div className="text-xs text-muted-foreground">
                {event.organisations.join(", ") || "Nessun ente indicato"}
              </div>
            </div>
          </InfoBlock>

          <InfoBlock icon={AlertTriangle} label="Cautela interpretativa">
            {event.cautionNote}
          </InfoBlock>
        </dl>

        {event.internalLinks.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {event.internalLinks.map((link) => (
              <Link
                key={`${link.relation}-${link.href}`}
                href={link.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:border-brand/50 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ) : null}

        <div className="mt-5 border-t border-border pt-3 text-xs text-muted-foreground">
          Ultima verifica redazionale: {event.lastVerification}
        </div>
      </div>
    </Card>
  );
}

function InfoBlock({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
      <dt className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </dt>
      <dd className="text-sm leading-relaxed text-foreground/90">{children}</dd>
    </div>
  );
}

function SourceLink({ label, url }: { label: string; url: string }) {
  if (isInternalUrl(url)) {
    return (
      <Link
        href={url}
        className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
      >
        {label}
      </Link>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
    >
      {label}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}
