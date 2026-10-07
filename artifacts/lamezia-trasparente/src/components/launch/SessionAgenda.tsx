import { useMemo, useState } from "react";
import { Link } from "wouter";
import { CalendarClock, Clock, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  type CouncilSessionV0,
  councilSessionV0StatusLabels,
} from "@/data/councilSessionV0";
import {
  sessionDate,
  sessionDateLabel,
  sessionDateIsUpcoming,
  sessionOrgan,
  sortAgendaSessions,
} from "@/lib/sessionAgenda";

export function SessionAgendaRow({ session }: { session: CouncilSessionV0 }) {
  const scheduled = sessionDate(session.scheduledAt.value);
  const agenda = session.agenda.value ?? [];
  const dateNumber = scheduled
    ? new Intl.DateTimeFormat("it-IT", {
        timeZone: scheduled.timezone,
        day: "2-digit",
      }).format(scheduled.date)
    : "—";
  const dateMonth = scheduled
    ? new Intl.DateTimeFormat("it-IT", {
        timeZone: scheduled.timezone,
        month: "short",
      }).format(scheduled.date)
    : "Data";
  const title =
    agenda[0] ||
    session.title.value?.split(" — ").slice(1).join(" — ") ||
    sessionOrgan(session);
  const status =
    councilSessionV0StatusLabels[
      session.sessionStatus.value ?? "non_verificata"
    ];
  return (
    <article
      data-session-id={session.id}
      className="flex min-w-0 gap-4 border-b border-border py-5 last:border-b-0 sm:gap-6"
    >
      <div
        aria-hidden="true"
        className="flex h-20 w-16 shrink-0 flex-col items-center justify-center rounded-xl border border-primary/20 bg-primary/5 text-primary"
      >
        <span className="font-display text-3xl font-bold leading-none tabular-nums">
          {dateNumber}
        </span>
        <span className="mt-1 text-sm font-semibold capitalize">
          {dateMonth}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-primary">
          {sessionOrgan(session)}
        </p>
        <Link
          href={`/convocazioni/${session.id}`}
          className="mt-1 line-clamp-2 rounded-sm font-display text-lg font-bold leading-snug text-foreground hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          {title}
        </Link>
        <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
          <Clock aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <time dateTime={scheduled ? session.scheduledAt.value! : undefined}>
            {sessionDateLabel(session)}
          </time>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{status}</p>
        <Accordion type="single" collapsible className="mt-1">
          <AccordionItem value="details" className="border-0">
            <AccordionTrigger className="justify-start gap-2 py-2 font-semibold text-primary">
              Documenti e ordine del giorno
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-1 text-sm leading-6">
              {agenda.length > 0 ? (
                <ol className="list-decimal space-y-1 pl-5">
                  {agenda.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ol>
              ) : (
                <p className="text-muted-foreground">
                  Ordine del giorno da verificare sulla fonte ufficiale.
                </p>
              )}
              <p className="text-muted-foreground">{session.agenda.limit}</p>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                <Link
                  className="font-semibold text-primary hover:underline"
                  href={`/convocazioni/${session.id}`}
                >
                  Apri la scheda completa
                </Link>
                {session.sourceLink.sourceUrl && (
                  <a
                    className="font-semibold text-primary hover:underline"
                    href={session.sourceLink.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Fonte ufficiale
                  </a>
                )}
                {session.provenance?.archivedDocumentUrl && (
                  <a
                    className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
                    href={session.provenance.archivedDocumentUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FileText className="h-4 w-4" aria-hidden="true" />
                    Convocazione PDF
                  </a>
                )}
              </div>
              {session.provenance?.publicationNumber && (
                <p className="text-muted-foreground">
                  Albo Pretorio · pubblicazione{" "}
                  {session.provenance.publicationNumber}
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </article>
  );
}

export function SessionAgenda({
  sessions,
}: {
  sessions: readonly CouncilSessionV0[];
}) {
  const [month, setMonth] = useState("all");
  const [organ, setOrgan] = useState("all");
  const [period, setPeriod] = useState("all");
  const [query, setQuery] = useState("");
  const publicSessions = useMemo(
    () => sessions.filter((session) => !session.isDemoFixture),
    [sessions],
  );
  const months = [
    ...new Set(
      publicSessions
        .map((session) => sessionDate(session.scheduledAt.value)?.month)
        .filter((value): value is string => Boolean(value)),
    ),
  ]
    .sort()
    .reverse();
  const organs = [...new Set(publicSessions.map(sessionOrgan))].sort((a, b) =>
    a.localeCompare(b, "it"),
  );
  const now = new Date();
  const normalise = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("it");
  const filtered = sortAgendaSessions(publicSessions, now).filter((session) => {
    const scheduled = sessionDate(session.scheduledAt.value);
    if (month !== "all" && scheduled?.month !== month) return false;
    if (organ !== "all" && sessionOrgan(session) !== organ) return false;
    if (
      period === "upcoming" &&
      !sessionDateIsUpcoming(session.scheduledAt.value, now)
    )
      return false;
    if (
      period === "past" &&
      (!scheduled || sessionDateIsUpcoming(session.scheduledAt.value, now))
    )
      return false;
    return normalise(
      [
        session.title.value,
        ...(session.agenda.value ?? []),
        session.provenance?.publicationNumber,
      ].join(" "),
    ).includes(normalise(query.trim()));
  });
  const groups = new Map<string, CouncilSessionV0[]>();
  for (const session of filtered) {
    const scheduled = sessionDate(session.scheduledAt.value);
    const group = scheduled
      ? `${sessionDateIsUpcoming(session.scheduledAt.value, now) ? "upcoming" : "past"}:${scheduled.month}`
      : "undated";
    groups.set(group, [...(groups.get(group) ?? []), session]);
  }
  const monthLabel = (value: string) =>
    new Intl.DateTimeFormat("it-IT", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${value}-01T00:00:00Z`));
  const reset = () => {
    setMonth("all");
    setOrgan("all");
    setPeriod("all");
    setQuery("");
  };
  const active =
    month !== "all" ||
    organ !== "all" ||
    period !== "all" ||
    query.trim() !== "";
  return (
    <section
      id="agenda-sedute"
      aria-labelledby="agenda-title"
      className="scroll-mt-24"
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <h2 id="agenda-title" className="font-display text-2xl font-bold">
          Agenda delle sedute
        </h2>
        <p role="status" className="text-sm text-muted-foreground">
          {filtered.length} di {publicSessions.length} sedute disponibili
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1.3fr_1fr_1.5fr]">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger aria-label="Mese" className="bg-background">
              <SelectValue placeholder="Tutti i mesi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i mesi</SelectItem>
              {months.map((value) => (
                <SelectItem key={value} value={value}>
                  {monthLabel(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={organ} onValueChange={setOrgan}>
            <SelectTrigger aria-label="Organo" className="bg-background">
              <SelectValue placeholder="Tutti gli organi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti gli organi</SelectItem>
              {organs.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger aria-label="Periodo" className="bg-background">
              <SelectValue placeholder="Tutte le date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte le date</SelectItem>
              <SelectItem value="upcoming">Date in arrivo</SelectItem>
              <SelectItem value="past">Date trascorse</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"
            />
            <Input
              aria-label="Cerca nelle sedute"
              placeholder="Cerca un tema o una pubblicazione"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="bg-background pl-9"
            />
          </div>
        </div>
        {active && (
          <Button variant="ghost" size="sm" className="mt-2" onClick={reset}>
            Azzera i filtri
          </Button>
        )}
      </div>
      {filtered.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center">
          <CalendarClock
            aria-hidden="true"
            className="mx-auto mb-3 h-6 w-6 text-muted-foreground"
          />
          <p className="font-semibold">Nessuna seduta corrisponde ai filtri.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Le date in arrivo dipendono dalle convocazioni acquisite; l'archivio
            non è completo.
          </p>
          <Button variant="outline" className="mt-4" onClick={reset}>
            Mostra tutte le sedute
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {[...groups].map(([key, items]) => {
            const [periodKey, monthKey] = key.split(":");
            return (
              <section
                key={key}
                aria-label={
                  monthKey
                    ? `${monthLabel(monthKey)} · ${periodKey === "upcoming" ? "date in arrivo" : "date trascorse"}`
                    : "Data da verificare"
                }
              >
                <div className="mb-2 flex flex-wrap items-baseline gap-3 border-b-2 border-primary/20 pb-3">
                  <h3 className="font-display text-xl font-bold capitalize">
                    {monthKey ? monthLabel(monthKey) : "Data da verificare"}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {items.length} {items.length === 1 ? "seduta" : "sedute"}
                    {monthKey &&
                      ` · ${periodKey === "upcoming" ? "date in arrivo" : "date trascorse"}`}
                  </span>
                </div>
                {items.map((session) => (
                  <SessionAgendaRow key={session.id} session={session} />
                ))}
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}
