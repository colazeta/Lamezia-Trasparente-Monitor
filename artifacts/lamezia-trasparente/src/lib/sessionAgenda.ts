import type { CouncilSessionV0 } from "@/data/councilSessionV0";

export function sessionDate(value: string | null) {
  if (!value) return null;
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(dateOnly ? `${value}T00:00:00Z` : value);
  if (!Number.isFinite(date.getTime())) return null;
  // Reject impossible calendar dates rather than silently moving them to March.
  if (dateOnly && date.toISOString().slice(0, 10) !== value) return null;
  const timezone = dateOnly ? "UTC" : "Europe/Rome";
  const day = new Intl.DateTimeFormat("sv-SE", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  return { date, dateOnly, timezone, day, month: day.slice(0, 7) };
}

export function sessionDateIsUpcoming(value: string | null, now = new Date()) {
  const scheduled = sessionDate(value);
  if (!scheduled) return false;
  if (!scheduled.dateOnly) return scheduled.date.getTime() >= now.getTime();
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return scheduled.day >= today;
}

export function sessionIsUpcoming(session: CouncilSessionV0, now = new Date()) {
  return (
    !["svolta", "rinviata"].includes(session.sessionStatus.value ?? "") &&
    sessionDateIsUpcoming(session.scheduledAt.value, now)
  );
}

export function sortAgendaSessions(
  sessions: readonly CouncilSessionV0[],
  now = new Date(),
) {
  return [...sessions].sort((a, b) => {
    const left = sessionDate(a.scheduledAt.value);
    const right = sessionDate(b.scheduledAt.value);
    if (!left || !right)
      return left ? -1 : right ? 1 : a.id.localeCompare(b.id);
    const upcomingA = sessionDateIsUpcoming(a.scheduledAt.value, now);
    const upcomingB = sessionDateIsUpcoming(b.scheduledAt.value, now);
    if (upcomingA !== upcomingB) return upcomingA ? -1 : 1;
    const difference = left.date.getTime() - right.date.getTime();
    return (upcomingA ? difference : -difference) || a.id.localeCompare(b.id);
  });
}

export function selectHomeSessions(
  sessions: readonly CouncilSessionV0[],
  now = new Date(),
) {
  const publicSessions = sessions.filter((session) => !session.isDemoFixture);
  const upcoming = sortAgendaSessions(
    publicSessions.filter((session) => sessionIsUpcoming(session, now)),
    now,
  );
  const recent = sortAgendaSessions(
    publicSessions.filter(
      (session) => !sessionDateIsUpcoming(session.scheduledAt.value, now),
    ),
    now,
  );
  return [...upcoming, ...recent].slice(0, 3);
}

export function sessionOrgan(session: CouncilSessionV0) {
  return (
    session.title.value?.split(" — ")[0] ||
    (session.kind === "council"
      ? "Consiglio comunale"
      : "Commissione consiliare")
  );
}

export function sessionDateLabel(session: CouncilSessionV0) {
  const scheduled = sessionDate(session.scheduledAt.value);
  if (!scheduled) return "Data da verificare";
  return new Intl.DateTimeFormat("it-IT", {
    timeZone: scheduled.timezone,
    dateStyle: "long",
    ...(scheduled.dateOnly ? {} : { timeStyle: "short" as const }),
  }).format(scheduled.date);
}
