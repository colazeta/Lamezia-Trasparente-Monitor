import { describe, expect, it } from "vitest";
import { councilSessionV0ReviewedRecords } from "@/data/councilSessionV0Reviewed";
import {
  selectHomeSessions,
  sessionDate,
  sessionIsUpcoming,
  sortAgendaSessions,
} from "./sessionAgenda";

const fixture = councilSessionV0ReviewedRecords[0];
const make = (
  id: string,
  date: string | null,
  status = fixture.sessionStatus.value,
) => ({
  ...fixture,
  id,
  scheduledAt: { ...fixture.scheduledAt, value: date },
  sessionStatus: { ...fixture.sessionStatus, value: status },
});

describe("session agenda date and ordering rules", () => {
  it("puts nearest future dates first, then most recent past dates, retaining unknown dates", () => {
    const now = new Date("2026-10-07T12:00:00Z");
    const rows = [
      make("past-old", "2026-09-01"),
      make("future-later", "2026-10-20"),
      make("unknown", null),
      make("future-next", "2026-10-08"),
      make("past-recent", "2026-10-06"),
    ];
    expect(sortAgendaSessions(rows, now).map((row) => row.id)).toEqual([
      "future-next",
      "future-later",
      "past-recent",
      "past-old",
      "unknown",
    ]);
    expect(selectHomeSessions(rows, now).map((row) => row.id)).toEqual([
      "future-next",
      "future-later",
      "past-recent",
    ]);
    expect(rows[4].sessionStatus.value).toBe(fixture.sessionStatus.value);
  });

  it("uses the Italian calendar day for timestamps and preserves date-only values", () => {
    expect(sessionDate("2026-09-30T22:30:00Z")?.month).toBe("2026-10");
    expect(sessionDate("2026-09-30")?.month).toBe("2026-09");
    expect(
      sessionIsUpcoming(
        make("today", "2026-10-08"),
        new Date("2026-10-07T22:30:00Z"),
      ),
    ).toBe(true);
  });

  it("rejects invalid dates and never treats completed or postponed sessions as upcoming", () => {
    expect(sessionDate("invalid")).toBeNull();
    expect(sessionDate("2026-02-30")).toBeNull();
    const now = new Date("2026-10-07T12:00:00Z");
    expect(sessionIsUpcoming(make("held", "2026-10-20", "svolta"), now)).toBe(
      false,
    );
    expect(
      sessionIsUpcoming(make("postponed", "2026-10-20", "rinviata"), now),
    ).toBe(false);
    expect(
      selectHomeSessions(
        [{ ...make("demo", "2026-10-08"), isDemoFixture: true }],
        now,
      ),
    ).toEqual([]);
  });
});
