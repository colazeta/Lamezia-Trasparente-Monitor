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
    expect(councilSessionV0ReviewedRecords).toHaveLength(19);
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
      expect(["reviewed_matches", "checked_no_match"]).toContain(
        session.contextResearch.status,
      );
      expect(session.contextResearch.checkedAt).toBeTruthy();
      if (session.contextResearch.status === "reviewed_matches") {
        expect(session.contextResearch.articles.length).toBeGreaterThan(0);
      } else {
        expect(session.contextResearch.articles).toEqual([]);
        expect(session.contextResearch.media).toEqual([]);
      }
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

  it("enriches the council record from a later official source without inventing time or agenda", () => {
    const council = findCouncilSessionV0ReviewedRecord(
      "albo-2026-2673-consiglio-comunale",
    );

    expect(council?.kind).toBe("council");
    expect(council?.scheduledAt.value).toBe("2026-08-13");
    expect(council?.scheduledAt.sourceStatus).toBe("verificato");
    expect(council?.scheduledAt.sourceUrl).toContain("2026_2755_6_ALLEG");
    expect(council?.scheduledAt.limit).toMatch(/orario.*non è presente/i);
    expect(council?.sessionStatus.value).toBe("svolta");
    expect(council?.sessionStatus.sourceStatus).toBe("verificato");
    expect(council?.agenda.value).toBeNull();
    expect(council?.provenance?.documentUrl).toBeNull();
    expect(council?.provenance?.sourceReviewStatus).toBe(
      "reviewed_against_later_official_source",
    );
    expect(council?.provenance?.supplementalEvidence).toEqual([
      expect.objectContaining({
        publicationNumber: "2026/2755",
        sourceUrl: expect.stringContaining("2026_2755_6_ALLEG"),
        archivedDocumentUrl: expect.stringContaining(
          "e008e83a4d7ae0a4672146b73ebc62e64d565a26eeb043cafaf9e45d92ecf2c5.pdf",
        ),
        documentSha256:
          "e008e83a4d7ae0a4672146b73ebc62e64d565a26eeb043cafaf9e45d92ecf2c5",
      }),
    ]);
    expect(council?.dataLimits.value?.join(" ")).toMatch(
      /ordine del giorno completo/i,
    );
    expect(
      council?.contextResearch.articles.map((article) => article.relationship),
    ).toEqual([
      "same_session",
      "same_session",
      "same_session",
      "same_session",
      "same_session",
      "same_session",
      "same_session",
    ]);
    expect(council?.contextResearch.searchNote).toMatch(
      /pubblicazione istituzionale 2026\/2755.*13 agosto/i,
    );
    expect(council?.contextResearch.articles).toContainEqual(
      expect.objectContaining({
        publisher: "Comune di Lamezia Terme",
        relationship: "same_session",
        url: expect.stringContaining(
          "comune.lamezia-terme.cz.it/it/news/115163",
        ),
      }),
    );
    expect(council?.contextResearch.media).toEqual([
      expect.objectContaining({
        publisher: "City One",
        mediaType: "full_recording",
        availability: "replay_available",
        relationship: "same_session",
      }),
      expect.objectContaining({
        publisher: "Liberali Calabria",
        mediaType: "excerpt",
        availability: "replay_available",
        relationship: "same_session",
      }),
      expect.objectContaining({
        publisher: "Annita Vitale",
        mediaType: "excerpt",
        availability: "replay_available",
        relationship: "same_session",
        url: "https://www.instagram.com/reel/DcGRDc8o1qI/",
      }),
    ]);
    expect(council?.contextResearch.searchNote).toMatch(
      /pagina editoriale stabile.*registrazione integrale.*City One.*due estratti.*Salvatore Vescio.*Annita Vitale.*non è contato una seconda volta/i,
    );
    expect(council?.contextResearch.editorialAgenda).toHaveLength(9);
    expect(council?.contextResearch.editorialAgenda?.[0]).toEqual(
      expect.objectContaining({
        confidence: "high",
        sourceUrls: expect.arrayContaining([
          expect.stringContaining("cityonelamezia.it"),
          expect.stringContaining("lametino.it"),
        ]),
      }),
    );
    expect(council?.contextResearch.editorialAgenda).toContainEqual(
      expect.objectContaining({
        title: "Piano di riequilibrio finanziario pluriennale",
        confidence: "medium",
        sourceUrls: ["https://www.instagram.com/reel/DcGRDc8o1qI/"],
      }),
    );
  });

  it("expands the reviewed VI Commission calendar into two sourced occurrences", () => {
    const commissionSessions = councilSessionV0ReviewedRecords.filter(
      (session) =>
        session.kind === "commission" &&
        session.provenance?.publicationNumber === "2026/2788",
    );

    expect(
      commissionSessions.map((session) => session.scheduledAt.value),
    ).toEqual(["2026-09-04T12:00:00+02:00", "2026-09-01T12:00:00+02:00"]);
    for (const session of commissionSessions) {
      expect(session.provenance?.sourceContentHash).toBe(
        "32af1fef2fdc84892259f836c0cc6c1aa70d1e404d664a91f7cad339e3c24629",
      );
      expect(session.provenance?.documentUrl).toContain("2026_2788_2_P");
      expect(session.provenance?.archivedDocumentUrl).toBe(
        "/data/public/albo/documents/2026/165152190ac39451d35caf5815bfb4d7d6d7ee66c20abe630c98b47d62858c72.pdf",
      );
      expect(session.provenance?.documentSha256).toBe(
        "165152190ac39451d35caf5815bfb4d7d6d7ee66c20abe630c98b47d62858c72",
      );
      expect(session.provenance?.embeddedDocumentSha256).toBe(
        "c09e7aacd7d22f77f8e72db5b5198203748b5f032dfd604b236f46fe8a28197d",
      );
      expect(session.provenance?.sourceReviewStatus).toBe(
        "reviewed_against_official_attachment",
      );
      expect(session.scheduledAt.sourceStatus).toBe("verificato");
      expect(session.agenda.sourceStatus).toBe("verificato");
      expect(session.agenda.value).toEqual([
        "Denominazione comunale d'origine (De.Co.).",
        "Regolamento chioschi.",
      ]);
      expect(session.sessionStatus.value).toBe("non_verificata");
      expect(session.contextResearch.status).toBe("checked_no_match");
      expect(session.contextResearch.articles).toEqual([]);
      expect(session.contextResearch.media).toEqual([]);
      expect(session.dataLimits.value?.join(" ")).toMatch(
        /sede non è indicata.*non viene inferita/i,
      );
    }
  });

  it("expands the September IV Commission calendars without inferring occurrence", () => {
    const earlySessions = councilSessionV0ReviewedRecords.filter(
      (session) => session.provenance?.publicationNumber === "2026/2840",
    );
    const laterSessions = councilSessionV0ReviewedRecords.filter(
      (session) => session.provenance?.publicationNumber === "2026/2860",
    );

    expect(earlySessions.map((session) => session.scheduledAt.value)).toEqual([
      "2026-09-04T11:00:00+02:00",
      "2026-09-03T11:00:00+02:00",
    ]);
    expect(laterSessions.map((session) => session.scheduledAt.value)).toEqual([
      "2026-09-11T11:00:00+02:00",
      "2026-09-10T11:00:00+02:00",
      "2026-09-09T11:00:00+02:00",
      "2026-09-08T12:00:00+02:00",
    ]);

    for (const session of [...earlySessions, ...laterSessions]) {
      expect(session.agenda.value).toEqual([
        "Regolamento comunale per la promozione della Street Art.",
      ]);
      expect(session.agenda.sourceStatus).toBe("verificato");
      expect(session.scheduledAt.sourceStatus).toBe("verificato");
      expect(session.sessionStatus.value).toBe("non_verificata");
      expect(session.contextResearch.status).toBe("checked_no_match");
      expect(session.contextResearch.articles).toEqual([]);
      expect(session.contextResearch.media).toEqual([]);
      expect(session.contextResearch.searchNote).toMatch(/Parallel Search/i);
      expect(session.dataLimits.value?.join(" ")).toMatch(
        /sede non è indicata.*non viene inferita/i,
      );
    }

    expect(earlySessions[0]?.provenance).toEqual(
      expect.objectContaining({
        sourceContentHash:
          "29b8c30dc8fcfe6e73229bf4b46917876ef46dd3dcc7be4b3a6d277a4e220efc",
        documentSha256:
          "365976826d174821dfcd69c4c02710fcc8eb324c24ccefe2549d3fce932abd0b",
        embeddedDocumentSha256:
          "d642b7171bc1494ffcdb500eb3e30fd88883fbb166f3ebcd80da83a03d32d768",
      }),
    );
    expect(laterSessions[0]?.provenance).toEqual(
      expect.objectContaining({
        documentUrl: expect.stringContaining("2026_2860_1_X"),
        documentSha256:
          "dee314eb1f7e9133848be4b48c1c0b5e06ddd60371a92acc40ef9e290a62e411",
      }),
    );
  });

  it("publishes the September VI and joint III-IV Commission notices as separate sessions", () => {
    const commissionVi = councilSessionV0ReviewedRecords.find(
      (session) => session.provenance?.publicationNumber === "2026/2859",
    );
    const jointSession = councilSessionV0ReviewedRecords.find(
      (session) => session.provenance?.publicationNumber === "2026/2861",
    );

    expect(commissionVi?.scheduledAt.value).toBe("2026-09-08T11:00:00+02:00");
    expect(commissionVi?.agenda.value).toEqual([
      "Denominazione comunale d'origine (De.Co.).",
    ]);
    expect(commissionVi?.provenance).toEqual(
      expect.objectContaining({
        documentUrl: expect.stringContaining("2026_2859_1_X"),
        documentSha256:
          "a1dad36522921833ac71b994a73032d3454227d0a2c00f57156a8d7059d94baf",
      }),
    );

    expect(jointSession?.scheduledAt.value).toBe("2026-09-07T12:00:00+02:00");
    expect(jointSession?.title.value).toMatch(/III e IV Commissioni/i);
    expect(jointSession?.agenda.value).toEqual([
      "Progetto Sport e Disabilità. Audizione dell'assessore al ramo Gennaro Gianturco.",
    ]);
    expect(jointSession?.provenance).toEqual(
      expect.objectContaining({
        documentUrl: expect.stringContaining("2026_2861_1_X"),
        documentSha256:
          "feb500c847880bf03ab1cd09190b961828f5b3873d60bea800e93367a3c74468",
      }),
    );

    for (const session of [commissionVi, jointSession]) {
      expect(session?.sessionStatus.value).toBe("non_verificata");
      expect(session?.contextResearch.status).toBe("checked_no_match");
      expect(session?.contextResearch.articles).toEqual([]);
      expect(session?.contextResearch.media).toEqual([]);
    }
  });

  it("materializes the 11–16 September III and IV Commission calendars from three official notices", () => {
    const guarantorSingle = councilSessionV0ReviewedRecords.filter(
      (session) => session.provenance?.publicationNumber === "2026/2879",
    );
    const commissionIv = councilSessionV0ReviewedRecords.filter(
      (session) => session.provenance?.publicationNumber === "2026/2925",
    );
    const guarantorCalendar = councilSessionV0ReviewedRecords.filter(
      (session) => session.provenance?.publicationNumber === "2026/2926",
    );

    expect(guarantorSingle.map((session) => session.scheduledAt.value)).toEqual(
      ["2026-09-11T12:00:00+02:00"],
    );
    expect(commissionIv.map((session) => session.scheduledAt.value)).toEqual([
      "2026-09-16T11:00:00+02:00",
      "2026-09-15T12:00:00+02:00",
      "2026-09-14T11:00:00+02:00",
    ]);
    expect(
      guarantorCalendar.map((session) => session.scheduledAt.value),
    ).toEqual(["2026-09-15T11:00:00+02:00", "2026-09-14T12:00:00+02:00"]);

    for (const session of [...guarantorSingle, ...guarantorCalendar]) {
      expect(session.title.value).toMatch(/III Commissione/i);
      expect(session.agenda.value).toEqual([
        'Regolamento per l\'istituzione della figura del "Garante delle persone con disabilità".',
      ]);
      expect(session.contextResearch.searchNote).toMatch(/Parallel Search/i);
    }

    expect(commissionIv.map((session) => session.agenda.value)).toEqual([
      [
        "Regolamento comunale per la promozione della Street Art. Audizione dell'Associazione Icica.",
      ],
      [
        "Asili Nido Comunali. Audizione dell'assessore al ramo Gennaro Gianturco.",
      ],
      [
        "Trasporto Pubblico Scolastico Locale. Audizione del dirigente della Lamezia Multiservizi, ing. Alessandro Vescio.",
      ],
    ]);

    const municipalNurseriesSession = commissionIv.find(
      (session) => session.scheduledAt.value === "2026-09-15T12:00:00+02:00",
    );
    expect(municipalNurseriesSession?.contextResearch).toEqual(
      expect.objectContaining({
        status: "reviewed_matches",
        checkedAt: "2026-09-12T21:51:17Z",
        media: [],
      }),
    );
    expect(municipalNurseriesSession?.contextResearch.articles).toEqual([
      expect.objectContaining({
        title: "Avvio del servizio di Asilo Nido comunale",
        publisher: "Comune di Lamezia Terme",
        publishedAt: "2026-09-11",
        relationship: "agenda_item",
        url: "https://www.comune.lamezia-terme.cz.it/it/news/avvio-del-servizio-di-asilo-nido-comunale",
      }),
      expect.objectContaining({
        title: "Asili nido comunali aperti dal 15 settembre",
        publisher: "LameziaInforma",
        publishedAt: "2026-09-11",
        relationship: "agenda_item",
        url: "https://www.lameziainforma.it/scuola-e-universita/2026/09/11/asili-nido-comunali-aperti-dal-15-settembre/69226/",
      }),
    ]);
    expect(municipalNurseriesSession?.lastCheckedAt.value).toBe(
      "2026-09-12T21:51:17Z",
    );
    expect(municipalNurseriesSession?.dataLimits.value?.join(" ")).toMatch(
      /collegamenti di contesto non certificano svolgimento/i,
    );

    expect(guarantorSingle[0]?.provenance).toEqual(
      expect.objectContaining({
        documentUrl: expect.stringContaining("2026_2879_1_X"),
        sourceContentHash:
          "04f12caf167315030334618ea41d7e5091cf271b75baf33da58cccb1e35326c9",
        documentSha256:
          "b3f2d6a2b5884cd5e17b77b03289abeff7ab1f9994d7b70aa0d66ade22abdb09",
      }),
    );
    expect(commissionIv[0]?.provenance).toEqual(
      expect.objectContaining({
        documentUrl: expect.stringContaining("2026_2925_1_X"),
        sourceContentHash:
          "5a9d168246b9a4ed62e13c53e6a1106415f2c5d7c8825ea8d439ce165deaa500",
        documentSha256:
          "671bbd99e42677437d3c2b424d2ffd1794c8b1195efbf867591e3550480d31d1",
      }),
    );
    expect(guarantorCalendar[0]?.provenance).toEqual(
      expect.objectContaining({
        documentUrl: expect.stringContaining("2026_2926_1_X"),
        sourceContentHash:
          "fc6d1aaf789ee6902f85d537cd5b8dde937ea9e62573eacf8c75fd84d0c14117",
        documentSha256:
          "3de7a9e3185b36116474d8ecb3bed1c425b7395af5e85c9bb83bb16ca082e8d0",
      }),
    );

    for (const session of [
      ...guarantorSingle,
      ...commissionIv.filter(
        (entry) => entry.id !== municipalNurseriesSession?.id,
      ),
      ...guarantorCalendar,
    ]) {
      expect(session.sessionStatus.value).toBe("non_verificata");
      expect(session.contextResearch.status).toBe("checked_no_match");
      expect(session.contextResearch.articles).toEqual([]);
      expect(session.contextResearch.media).toEqual([]);
      expect(session.lastCheckedAt.value).toBe("2026-09-12T10:18:08Z");
      expect(session.dataLimits.value?.join(" ")).toMatch(
        /sede non è indicata.*non viene inferita/i,
      );
    }
  });

  it("expands the reviewed II Commission calendar into two sourced occurrences", () => {
    const commissionSessions = councilSessionV0ReviewedRecords.filter(
      (session) =>
        session.kind === "commission" &&
        session.provenance?.publicationNumber === "2026/2648",
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
        /non ha restituito contenuti.*sedute della II Commissione/i,
      );
    }
  });
});
