import { desc, eq } from "drizzle-orm";

import { crimePublicEventsTable, db } from "@workspace/db";
import { isUuidV7, type LtcedsPublicEvent } from "@workspace/publication-standardisation/ltceds";

import {
  crimeEventFiltersFromQuery,
  paginatePublicCrimeEvents,
  parseCrimeEventPagination,
  parseReadablePublicCrimeEvent,
  publicCrimeEventMatchesFilters,
  publicCrimeEventsCoverage,
  publicCrimeEventsToGeoJson,
  sortPublicCrimeEvents,
  type CrimeEventFilters,
} from "./publicCrimeEventsCore";

/**
 * SECURITY BOUNDARY:
 * This module is the only DB reader used by the public LTCEDS HTTP surface.
 * It intentionally imports `crimePublicEventsTable` and no canonical LTCEDS
 * table. Corrupt public projections are omitted rather than repaired from
 * internal event/location/source records.
 */
async function readAllPublicCrimeEvents(): Promise<LtcedsPublicEvent[]> {
  const rows = await db
    .select({ payload: crimePublicEventsTable.payload })
    .from(crimePublicEventsTable)
    .orderBy(desc(crimePublicEventsTable.updatedAt));

  return sortPublicCrimeEvents(
    rows.flatMap((row) => {
      const event = parseReadablePublicCrimeEvent(row.payload);
      return event ? [event] : [];
    }),
  );
}

function filtered(
  events: readonly LtcedsPublicEvent[],
  filters: CrimeEventFilters,
): LtcedsPublicEvent[] {
  return events.filter((event) => publicCrimeEventMatchesFilters(event, filters));
}

export async function listPublicCrimeEvents(query: Record<string, unknown>) {
  const events = filtered(
    await readAllPublicCrimeEvents(),
    crimeEventFiltersFromQuery(query),
  );
  return paginatePublicCrimeEvents(events, parseCrimeEventPagination(query));
}

export async function getPublicCrimeEvent(eventId: string) {
  if (!isUuidV7(eventId)) return null;
  const [row] = await db
    .select({ payload: crimePublicEventsTable.payload })
    .from(crimePublicEventsTable)
    .where(eq(crimePublicEventsTable.eventId, eventId))
    .limit(1);
  return row ? parseReadablePublicCrimeEvent(row.payload) : null;
}

export async function publicCrimeEventsGeoJson(query: Record<string, unknown>) {
  const events = filtered(
    await readAllPublicCrimeEvents(),
    crimeEventFiltersFromQuery(query),
  );
  return publicCrimeEventsToGeoJson(events);
}

export async function getPublicCrimeEventsCoverage() {
  return publicCrimeEventsCoverage(await readAllPublicCrimeEvents());
}
