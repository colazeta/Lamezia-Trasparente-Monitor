import { describe, expect, it } from "vitest";

import {
  COUNCIL_SESSION_V0_CONTEXT_MEDIA_AVAILABILITY,
  COUNCIL_SESSION_V0_CONTEXT_MEDIA_TYPES,
  COUNCIL_SESSION_V0_CONTEXT_RELATIONSHIPS,
  COUNCIL_SESSION_V0_CONTEXT_RESEARCH_STATUSES,
  COUNCIL_SESSION_V0_FIELD_STATUSES,
  COUNCIL_SESSION_V0_STATUSES,
  councilSessionV0ContextMediaAvailabilityLabels,
  councilSessionV0ContextMediaTypeLabels,
  councilSessionV0ContextRelationshipLabels,
  councilSessionV0DemoFixture,
  councilSessionV0FieldStatusLabels,
  councilSessionV0KindLabels,
  councilSessionV0PublicFields,
  councilSessionV0StatusLabels,
  getCouncilSessionV0PublicFieldNote,
  isCouncilSessionV0DemoFixture,
  type CouncilSessionV0Field,
  type CouncilSessionV0FieldStatus,
  type CouncilSessionV0ContextMediaAvailability,
  type CouncilSessionV0ContextMediaType,
  type CouncilSessionV0ContextRelationship,
  type CouncilSessionV0ContextResearchStatus,
  type CouncilSessionV0Status,
} from "./councilSessionV0";
import {
  councilSessionV0ReviewedRecords,
  findCouncilSessionV0ReviewedRecord,
} from "./councilSessionV0Reviewed";

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

const expectedContextRelationships: readonly CouncilSessionV0ContextRelationship[] =
  ["same_session", "possible_same_session", "agenda_item"];

const expectedContextMediaTypes: readonly CouncilSessionV0ContextMediaType[] = [
  "live_stream",
  "full_recording",
  "excerpt",
  "interview",
];

const expectedContextMediaAvailability: readonly CouncilSessionV0ContextMediaAvailability[] =
  ["scheduled", "live", "replay_available", "unavailable"];

const expectedContextResearchStatuses: readonly CouncilSessionV0ContextResearchStatus[] =
  ["not_run", "checked_no_match", "reviewed_matches"];

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
    expect(COUNCIL_SESSION_V0_CONTEXT_RELATIONSHIPS).toEqual(
      expectedContextRelationships,
    );
    expect(COUNCIL_SESSION_V0_CONTEXT_RESEARCH_STATUSES).toEqual(
      expectedContextResearchStatuses,
    );
    expect(COUNCIL_SESSION_V0_CONTEXT_MEDIA_TYPES).toEqual(
      expectedContextMediaTypes,
    );
    expect(COUNCIL_SESSION_V0_CONTEXT_MEDIA_AVAILABILITY).toEqual(
      expectedContextMediaAvailability,
    );

    for (const status of expectedSessionStatuses) {
      expect(councilSessionV0StatusLabels[status]).toEqual(expect.any(String));
    }

    for (const status of expectedFieldStatuses) {
      expect(councilSessionV0FieldStatusLabels[status]).toEqual(
        expect.any(String),
      );
    }

    for (const relationship of expectedContextRelationships) {
      expect(councilSessionV0ContextRelationshipLabels[relationship]).toEqual(
        expect.any(String),
      );
    }

    for (const mediaType of expectedContextMediaTypes) {
      expect(councilSessionV0ContextMediaTypeLabels[mediaType]).toEqual(
        expect.any(String),
      );
    }

    for (const availability of expectedContextMediaAvailability) {
      expect(
        councilSessionV0ContextMediaAvailabilityLabels[availability],
      ).toEqual(expect.any(String));
    }

    expect(councilSessionV0KindLabels).toEqual({
      council: "Consiglio comunale",
      commission: "Commissione consiliare",
    });
  });

  it("keeps the demo fixture explicitly marked as demonstrative", () => {
    expect(isCouncilSessionV0DemoFixture(councilSessionV0DemoFixture)).toBe(
      true,
    );
    expect(councilSessionV0DemoFixture.isDemoFixture).toBe(true);
    expect(councilSessionV0DemoFixture.id).toContain("demo");
    expect(councilSessionV0DemoFixture.title.value).toContain(
      "esempio dimostrativo",
    );
    expect(councilSessionV0DemoFixture.sourceLink.value).toBeNull();
    expect(councilSessionV0DemoFixture.contextResearch.status).toBe("not_run");
    expect(councilSessionV0DemoFixture.contextResearch.articles).toEqual([]);
    expect(councilSessionV0DemoFixture.contextResearch.media).toEqual([]);
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

    const fields = councilSessionV0PublicFields.map(
      (fieldKey) => councilSessionV0DemoFixture[fieldKey],
    );

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
      expect(getCouncilSessionV0PublicFieldNote(field)).toMatch(
        /non|Nessun|Informazione/,
      );
    }
  });

  it("uses cautious public notes without accusatory language", () => {
    const notes = [
      councilSessionV0DemoFixture,
      ...councilSessionV0ReviewedRecords,
    ].flatMap((session) =>
      councilSessionV0PublicFields.map((fieldKey) =>
        getCouncilSessionV0PublicFieldNote(session[fieldKey]),
      ),
    );

    for (const note of notes) {
      const lower = note.toLocaleLowerCase("it-IT");
      for (const term of forbiddenAccusatoryTerms) {
        expect(lower).not.toContain(term);
      }
    }
  });

  it("publishes source-traceable records for both council and commission notices", () => {
    expect(councilSessionV0ReviewedRecords).toHaveLength(3);
    expect(
      new Set(councilSessionV0ReviewedRecords.map((item) => item.kind)),
    ).toEqual(new Set(["council", "commission"]));

    for (const session of councilSessionV0ReviewedRecords) {
      expect(session.isDemoFixture).toBe(false);
      expect(session.provenance?.noticeId).toMatch(/^albo-2026-/);
      expect(session.provenance?.publicationNumber).toMatch(/^2026\//);
      expect(session.provenance?.sourceUrl).toContain("albo.tinnvision.cloud");
      expect(session.provenance?.sourceContentHash).toMatch(/^[a-f0-9]{64}$/);
      expect(session.lastCheckedAt.value).toBeTruthy();
      expect(session.contextResearch.status).toBe("reviewed_matches");
      expect(session.contextResearch.checkedAt).toBeTruthy();
      expect(session.contextResearch.articles.length).toBeGreaterThan(0);
      for (const article of session.contextResearch.articles) {
        expect(article.url).toMatch(/^https:\/\//);
        expect(article.publisher.length).toBeGreaterThan(0);
        expect(article.relevanceNote.length).toBeGreaterThan(0);
        expect(Date.parse(article.reviewedAt)).not.toBeNaN();
      }
      for (const media of session.contextResearch.media) {
        expect(media.url).toMatch(/^https:\/\//);
        expect(COUNCIL_SESSION_V0_CONTEXT_MEDIA_TYPES).toContain(
          media.mediaType,
        );
        expect(COUNCIL_SESSION_V0_CONTEXT_MEDIA_AVAILABILITY).toContain(
          media.availability,
        );
        expect(media.relevanceNote.length).toBeGreaterThan(0);
        expect(Date.parse(media.reviewedAt)).not.toBeNaN();
      }
    }
  });

  it("keeps the council notice metadata-only when the official attachment is unavailable", () => {
    const council = findCouncilSessionV0ReviewedRecord(
      "albo-2026-2673-consiglio-comunale",
    );

    expect(council?.kind).toBe("council");
    expect(council?.scheduledAt.value).toBeNull();
    expect(council?.scheduledAt.sourceStatus).toBe("da_verificare");
    expect(council?.agenda.value).toBeNull();
    expect(council?.provenance?.documentUrl).toBeNull();
    expect(council?.dataLimits.value?.join(" ")).toMatch(
      /finestra di pubblicazione.*non è la data della seduta/i,
    );
    expect(
      council?.contextResearch.articles.map((article) => article.relationship),
    ).toEqual(["possible_same_session", "possible_same_session"]);
    expect(council?.contextResearch.searchNote).toMatch(
      /impedisce di stabilire.*stessa seduta/i,
    );
  });

  it("expands the reviewed commission calendar into two sourced occurrences", () => {
    const commissionSessions = councilSessionV0ReviewedRecords.filter(
      (session) => session.kind === "commission",
    );

    expect(
      commissionSessions.map((session) => session.scheduledAt.value),
    ).toEqual(["2026-08-11T09:30:00+02:00", "2026-08-10T09:30:00+02:00"]);
    expect(
      new Set(
        commissionSessions.map(
          (session) => session.provenance?.publicationNumber,
        ),
      ),
    ).toEqual(new Set(["2026/2648"]));
    for (const session of commissionSessions) {
      expect(session.scheduledAt.sourceStatus).toBe("verificato");
      expect(session.agenda.sourceStatus).toBe("verificato");
      expect(session.agenda.value).toHaveLength(2);
      expect(session.sessionStatus.value).toBe("non_verificata");
      expect(
        session.contextResearch.articles.every(
          (article) => article.relationship === "agenda_item",
        ),
      ).toBe(true);
      expect(session.contextResearch.searchNote).toMatch(
        /non ha restituito articoli.*sedute della II Commissione/i,
      );
    }
  });
});
