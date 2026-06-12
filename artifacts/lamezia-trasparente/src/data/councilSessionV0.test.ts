import { describe, expect, it } from "vitest";

import {
  COUNCIL_SESSION_V0_FIELD_STATUSES,
  COUNCIL_SESSION_V0_STATUSES,
  councilSessionV0DemoFixture,
  councilSessionV0FieldStatusLabels,
  councilSessionV0PublicFields,
  councilSessionV0StatusLabels,
  getCouncilSessionV0PublicFieldNote,
  isCouncilSessionV0DemoFixture,
  type CouncilSessionV0Field,
  type CouncilSessionV0FieldStatus,
  type CouncilSessionV0Status,
} from "./councilSessionV0";

const expectedSessionStatuses: readonly CouncilSessionV0Status[] = [
  "programmata",
  "svolta",
  "rinviata",
  "non_verificata",
];

const expectedFieldStatuses: readonly CouncilSessionV0FieldStatus[] = [
  "verificato",
  "parziale",
  "assente",
  "da_verificare",
  "fixture_dimostrativa",
];

const forbiddenAccusatoryTerms = [
  "corruzione",
  "illecito",
  "illegalità",
  "omissione",
  "colpevole",
] as const;

describe("councilSessionV0", () => {
  it("declares the required session and source states", () => {
    expect(COUNCIL_SESSION_V0_STATUSES).toEqual(expectedSessionStatuses);
    expect(COUNCIL_SESSION_V0_FIELD_STATUSES).toEqual(expectedFieldStatuses);

    for (const status of expectedSessionStatuses) {
      expect(councilSessionV0StatusLabels[status]).toEqual(expect.any(String));
    }

    for (const status of expectedFieldStatuses) {
      expect(councilSessionV0FieldStatusLabels[status]).toEqual(expect.any(String));
    }
  });

  it("keeps the demo fixture explicitly marked as demonstrative", () => {
    expect(isCouncilSessionV0DemoFixture(councilSessionV0DemoFixture)).toBe(true);
    expect(councilSessionV0DemoFixture.isDemoFixture).toBe(true);
    expect(councilSessionV0DemoFixture.id).toContain("demo");
    expect(councilSessionV0DemoFixture.title.value).toContain("esempio dimostrativo");
    expect(councilSessionV0DemoFixture.sourceLink.value).toBeNull();
  });

  it("exposes all public fields with a source state and a data limit", () => {
    expect(councilSessionV0PublicFields).toEqual([
      "title",
      "scheduledAt",
      "sessionStatus",
      "agenda",
      "sourceLink",
      "liveStreaming",
      "recording",
      "minutesOrReport",
      "lastCheckedAt",
      "dataLimits",
    ]);

    const fields = councilSessionV0PublicFields.map((fieldKey) => councilSessionV0DemoFixture[fieldKey]);

    for (const field of fields) {
      expect(field.key).toEqual(expect.any(String));
      expect(field.label).toEqual(expect.any(String));
      expect(COUNCIL_SESSION_V0_FIELD_STATUSES).toContain(field.sourceStatus);
      expect(field.limit.length).toBeGreaterThan(0);
    }
  });

  it("allows missing and partial data without presenting them as verified", () => {
    const missingFields: readonly CouncilSessionV0Field<unknown>[] = [
      councilSessionV0DemoFixture.sourceLink,
      councilSessionV0DemoFixture.liveStreaming,
      councilSessionV0DemoFixture.recording,
      councilSessionV0DemoFixture.minutesOrReport,
    ];

    for (const field of missingFields) {
      expect(field.value).toBeNull();
      expect(field.sourceStatus).not.toBe("verificato");
      expect(getCouncilSessionV0PublicFieldNote(field)).toMatch(/non|Nessun|Informazione/);
    }
  });

  it("uses cautious public notes without accusatory language", () => {
    const notes = councilSessionV0PublicFields.map((fieldKey) =>
      getCouncilSessionV0PublicFieldNote(councilSessionV0DemoFixture[fieldKey]),
    );

    for (const note of notes) {
      const lower = note.toLocaleLowerCase("it-IT");
      for (const term of forbiddenAccusatoryTerms) {
        expect(lower).not.toContain(term);
      }
    }
  });
});
