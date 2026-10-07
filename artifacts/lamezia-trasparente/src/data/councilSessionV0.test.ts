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
    expect(councilSessionV0ReviewedRecords).toHaveLength(58);
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

  it("materializes the 9 October Council notice from the official attachment", () => {
    const council = findCouncilSessionV0ReviewedRecord(
      "albo-2026-3221-consiglio-comunale-2026-10-09",
    );

    expect(council).toEqual(
      expect.objectContaining({
        kind: "council",
        isDemoFixture: false,
        provenance: expect.objectContaining({
          publicationNumber: "2026/3221",
          documentUrl: expect.stringContaining("2026_3221_1_X"),
          documentSha256:
            "83aea5a29ea10b1e32c08649c8f9fc9d3e8c45e1d015c6ea902ca6e2214a7c97",
          archivedDocumentUrl: expect.stringContaining(
            "83aea5a29ea10b1e32c08649c8f9fc9d3e8c45e1d015c6ea902ca6e2214a7c97.pdf",
          ),
          sourceReviewStatus: "reviewed_against_official_attachment",
        }),
        contextResearch: expect.objectContaining({
          status: "reviewed_matches",
          checkedAt: "2026-10-07T10:16:27Z",
          articles: expect.arrayContaining([
            expect.objectContaining({
              publisher: "City One",
              publishedAt: "2026-10-06",
              relationship: "same_session",
              url: expect.stringContaining("cityonelamezia.it"),
            }),
            expect.objectContaining({
              publisher: "il Lametino",
              publishedAt: "2026-10-06",
              relationship: "same_session",
              url: expect.stringContaining("lametino.it"),
            }),
          ]),
          media: [],
        }),
      }),
    );
    expect(council?.scheduledAt.value).toBe("2026-10-09T09:30:00+02:00");
    expect(council?.scheduledAt.limit).toMatch(
      /seconda convocazione.*12 ottobre 2026.*10:30/i,
    );
    expect(council?.agenda.value).toHaveLength(21);
    expect(council?.agenda.sourceStatus).toBe("verificato");
    expect(council?.sessionStatus.value).toBe("non_verificata");
    expect(council?.dataLimits.value?.join(" ")).toMatch(
      /Sala Consiliare.*Renato Luisi.*via Sen\. Arturo Perugini/i,
    );
    expect(council?.dataLimits.value?.join(" ")).toMatch(
      /due articoli.*annunci precedenti.*non.*attestano.*svolgimento/i,
    );
    expect(council?.dataLimits.value?.join(" ")).not.toMatch(
      /non sono emersi collegamenti editoriali/i,
    );
    expect(council?.contextResearch.articles).toHaveLength(2);
    expect(council?.contextResearch.searchNote).toMatch(
      /Parallel Search.*annunci precedenti.*non provano.*svolgimento/is,
    );
    expect(council?.liveStreaming.value).toBeNull();
    expect(council?.recording.value).toBeNull();
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

    const schoolTransportSession = commissionIv.find(
      (session) => session.scheduledAt.value === "2026-09-14T11:00:00+02:00",
    );
    expect(schoolTransportSession?.contextResearch).toEqual(
      expect.objectContaining({
        status: "reviewed_matches",
        checkedAt: "2026-09-14T10:13:39Z",
        media: [],
      }),
    );
    expect(schoolTransportSession?.contextResearch.articles).toEqual([
      expect.objectContaining({
        publisher: "City One",
        publishedAt: "2026-09-11",
        relationship: "agenda_item",
        url: "https://www.cityonelamezia.it/lamezia-gianturco-assistenza-specialistica-si-parte-con-il-nuovo-anno-scolastico-piu-ore-per-gli-alunni-con-disabilita/",
      }),
    ]);
    expect(schoolTransportSession?.lastCheckedAt.value).toBe(
      "2026-09-14T10:13:39Z",
    );
    expect(schoolTransportSession?.dataLimits.value?.join(" ")).toMatch(
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
        (entry) =>
          entry.id !== municipalNurseriesSession?.id &&
          entry.id !== schoolTransportSession?.id,
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

  it("materializes the 16–21 September Commission notices with official dates and agendas", () => {
    const publicationContentHashes = new Map([
      [
        "2026/2953",
        "a0847f430a5d647392679397388a437ab59552a0c8703b1b53c7b1d7ad43e451",
      ],
      [
        "2026/2959",
        "91111c510f5fd5aa973bd579d24a595d3cf54e0ebb4a66fee237c167b599c237",
      ],
      [
        "2026/2960",
        "30980bcc9f5acb9173fe1bab42601c7999edfa30e72e0341ac8143c11fb59317",
      ],
      [
        "2026/2971",
        "6db758ff5ddab2f37c7db4442641b0e75481ddfd9b201d9738a7579cd414c1f5",
      ],
      [
        "2026/2981",
        "a6a45d08d063c993b69995557a4a82417c4fba918de3315260a189bb2a78c38f",
      ],
      [
        "2026/2986",
        "6b5898f02ec82e8f3a587c49491033d0945396b9589c5d1584da4d2002205ca6",
      ],
      [
        "2026/3001",
        "7d6e5cc50baeb9e9d79c2b668de35004a3134587fd714964170828c2228adee3",
      ],
    ]);
    const publications = [...publicationContentHashes.keys()];
    const sessions = councilSessionV0ReviewedRecords.filter((session) =>
      publications.includes(session.provenance?.publicationNumber ?? ""),
    );

    expect(sessions).toHaveLength(10);
    expect(sessions.map((session) => session.scheduledAt.value)).toEqual([
      "2026-09-21T10:30:00+02:00",
      "2026-09-21T09:30:00+02:00",
      "2026-09-18T12:00:00+02:00",
      "2026-09-18T11:00:00+02:00",
      "2026-09-18T10:00:00+02:00",
      "2026-09-17T16:30:00+02:00",
      "2026-09-17T15:30:00+02:00",
      "2026-09-17T12:00:00+02:00",
      "2026-09-17T11:00:00+02:00",
      "2026-09-16T12:00:00+02:00",
    ]);

    const wasteMotionSession = sessions.find(
      (session) => session.id === "albo-2026-3001-commissione-iii-2026-09-21",
    );
    expect(wasteMotionSession?.contextResearch).toEqual(
      expect.objectContaining({
        status: "reviewed_matches",
        checkedAt: "2026-09-19T15:49:21Z",
        media: [],
      }),
    );
    expect(wasteMotionSession?.contextResearch.articles).toEqual([
      expect.objectContaining({
        publisher: "il Lametino",
        publishedAt: "2026-09-14",
        relationship: "agenda_item",
        url: "https://www.lametino.it/ultime/lamezia-consigliera-serratore-presenta-mozione-su-rifiuti-e-sicurezza-in-localita-serra-e-annunziata.html",
      }),
    ]);
    expect(wasteMotionSession?.lastCheckedAt.value).toBe(
      "2026-09-19T15:49:21Z",
    );
    expect(wasteMotionSession?.sessionStatus.value).toBe("non_verificata");

    const commissionISeptember17 = sessions.find(
      (session) => session.id === "albo-2026-2971-commissione-i-2026-09-17",
    );
    expect(commissionISeptember17?.contextResearch).toEqual(
      expect.objectContaining({
        status: "reviewed_matches",
        checkedAt: "2026-09-23T22:14:41Z",
        media: [],
      }),
    );
    expect(commissionISeptember17?.contextResearch.articles).toEqual([
      expect.objectContaining({
        publisher: "il Lametino",
        publishedAt: "2026-09-23",
        relationship: "possible_same_session",
        url: "https://www.lametino.it/ultime/lamezia-mozioni-di-sfiducia-contro-cristiano-e-villella-tensioni-nelle-commissioni-consiliari.html",
      }),
    ]);
    expect(commissionISeptember17?.agenda.value).toEqual([
      "Trattazione della richiesta relativa allo studio e all'esame delle vertenze. Audizione del dirigente del Settore Avvocatura dott.ssa Alessandra Belvedere.",
    ]);
    expect(commissionISeptember17?.sessionStatus.value).toBe("non_verificata");
    expect(commissionISeptember17?.lastCheckedAt.value).toBe(
      "2026-09-23T22:14:41Z",
    );

    for (const session of sessions) {
      expect(session.provenance?.documentUrl).toMatch(
        /2026_(2953|2959|2960|2971|2981|2986|3001)_1_X/,
      );
      expect(session.provenance?.documentSha256).toMatch(/^[a-f0-9]{64}$/);
      expect(session.provenance?.sourceContentHash).toBe(
        publicationContentHashes.get(
          session.provenance?.publicationNumber ?? "",
        ),
      );
      expect(session.provenance?.sourceContentHash).not.toBe(
        session.provenance?.documentSha256,
      );
      expect(session.provenance?.archivedDocumentUrl).toContain(
        session.provenance?.documentSha256,
      );
      expect(session.provenance?.sourceReviewStatus).toBe(
        "reviewed_against_official_attachment",
      );
      expect(session.scheduledAt.sourceStatus).toBe("verificato");
      expect(session.agenda.sourceStatus).toBe("verificato");
      expect(session.agenda.value?.length).toBeGreaterThan(0);
      expect(session.sessionStatus.value).toBe("non_verificata");
      if (
        session.id !== wasteMotionSession?.id &&
        session.id !== commissionISeptember17?.id
      ) {
        expect(session.contextResearch).toEqual(
          expect.objectContaining({
            status: "checked_no_match",
            checkedAt: "2026-09-19T09:34:42Z",
            articles: [],
            media: [],
          }),
        );
      }
      expect(session.contextResearch.searchNote).toMatch(/Parallel Search/i);
      expect(session.dataLimits.value?.join(" ")).toMatch(
        /sede non è indicata.*non viene inferita/i,
      );
    }
  });

  it("materializes the 22–25 September IV and V Commission calendars", () => {
    const sessions = councilSessionV0ReviewedRecords.filter((session) =>
      ["2026/3011", "2026/3012"].includes(
        session.provenance?.publicationNumber ?? "",
      ),
    );

    expect(sessions).toHaveLength(6);
    expect(sessions.map((session) => session.scheduledAt.value)).toEqual([
      "2026-09-25T10:00:00+02:00",
      "2026-09-24T10:00:00+02:00",
      "2026-09-23T12:00:00+02:00",
      "2026-09-23T11:00:00+02:00",
      "2026-09-22T11:00:00+02:00",
      "2026-09-22T10:00:00+02:00",
    ]);

    const ivSeptember22 = sessions.find(
      (session) => session.id === "albo-2026-3012-commissione-iv-2026-09-22",
    );
    expect(ivSeptember22?.agenda.value).toEqual([
      "Regolamento comunale per la promozione della Street Art. Audizione del sig. Giacomo Marinaro, curatore e direttore artistico del progetto Giulia Urbana.",
    ]);
    expect(ivSeptember22?.contextResearch).toEqual(
      expect.objectContaining({
        status: "reviewed_matches",
        checkedAt: "2026-09-29T04:07:44Z",
        media: [],
      }),
    );
    expect(ivSeptember22?.contextResearch.articles).toEqual([
      expect.objectContaining({
        title: "Street art, prosegue il percorso per un regolamento comunale",
        publisher: "LameziaInforma",
        publishedAt: "2026-09-22",
        relationship: "same_session",
        url: "https://www.lameziainforma.it/arte-e-cultura/2026/09/22/street-art-prosegue-il-percorso-per-un-regolamento-comunale/69348/",
      }),
    ]);
    expect(ivSeptember22?.contextResearch.searchNote).toMatch(
      /organo, data.*coincidono.*non certifica/i,
    );
    expect(ivSeptember22?.liveStreaming.value).toBeNull();
    expect(ivSeptember22?.recording.value).toBeNull();
    expect(ivSeptember22?.lastCheckedAt.value).toBe("2026-09-29T04:07:44Z");

    const vSeptember25 = sessions.find(
      (session) => session.id === "albo-2026-3011-commissione-v-2026-09-25",
    );
    expect(vSeptember25?.contextResearch).toEqual(
      expect.objectContaining({
        status: "reviewed_matches",
        checkedAt: "2026-09-24T09:59:02Z",
        media: [],
      }),
    );
    expect(vSeptember25?.contextResearch.articles).toEqual([
      expect.objectContaining({
        publisher: "il Lametino",
        publishedAt: "2026-09-23",
        relationship: "agenda_item",
        url: "https://www.lametino.it/ultimora/lamezia-lavori-di-bitumazione-in-via-trento-limitazione-della-circolazione-stradale-il-25-settembre.html",
      }),
    ]);
    expect(vSeptember25?.contextResearch.searchNote).toMatch(
      /non nomina la Commissione.*non attesta/i,
    );
    expect(vSeptember25?.agenda.value).toEqual([
      "Disciplinare per interventi sulla rete stradale.",
    ]);
    expect(vSeptember25?.liveStreaming.value).toBeNull();
    expect(vSeptember25?.recording.value).toBeNull();
    expect(vSeptember25?.lastCheckedAt.value).toBe("2026-09-24T09:59:02Z");

    const vSeptember23 = sessions.find(
      (session) => session.id === "albo-2026-3011-commissione-v-2026-09-23",
    );
    expect(vSeptember23?.contextResearch).toEqual(
      expect.objectContaining({
        status: "checked_no_match",
        articles: [],
        media: [],
      }),
    );

    const unmatchedSeptemberSessions = [
      "albo-2026-3011-commissione-v-2026-09-22",
      "albo-2026-3011-commissione-v-2026-09-23",
      "albo-2026-3011-commissione-v-2026-09-24",
      "albo-2026-3012-commissione-iv-2026-09-23",
    ];
    for (const id of unmatchedSeptemberSessions) {
      const session = sessions.find((candidate) => candidate.id === id);
      expect(session?.contextResearch.searchNote).toMatch(
        /queste quattro sedute/i,
      );
      expect(session?.contextResearch.searchNote).not.toMatch(
        /IV e V Commissione dal 22 al 25 settembre/i,
      );
    }

    const expectedProvenance = new Map([
      [
        "2026/3011",
        {
          sourceContentHash:
            "8baf6844580bd1b54d2ee18a669183432df8c6512eb5cd5972e70d69fcdbeae9",
          documentSha256:
            "faa773ca9b02a88e8e7de334843e86dc20daa153f835f2acf50a2ca88a1754f5",
        },
      ],
      [
        "2026/3012",
        {
          sourceContentHash:
            "db8e6b45c1fc183b22c3d7aa421187efe779bd05c67b550038eb7712ac38fa3d",
          documentSha256:
            "85c4218e626ff552d3663519672675fd42d05a212a392f66683c3d1fba011492",
        },
      ],
    ]);

    for (const session of sessions) {
      const publicationNumber = session.provenance?.publicationNumber ?? "";
      const provenance = expectedProvenance.get(publicationNumber);
      expect(provenance).toBeDefined();
      if (!provenance)
        throw new Error(`Missing provenance for ${publicationNumber}`);
      expect(session.provenance).toEqual(
        expect.objectContaining({
          sourceContentHash: provenance.sourceContentHash,
          documentSha256: provenance.documentSha256,
          archivedDocumentUrl: expect.stringContaining(
            provenance.documentSha256,
          ),
          sourceReviewStatus: "reviewed_against_official_attachment",
        }),
      );
      expect(session.scheduledAt.sourceStatus).toBe("verificato");
      expect(session.agenda.sourceStatus).toBe("verificato");
      expect(session.sessionStatus.value).toBe("non_verificata");
      if (session.id !== vSeptember25?.id && session.id !== ivSeptember22?.id) {
        expect(session.contextResearch).toEqual(
          expect.objectContaining({
            status: "checked_no_match",
            checkedAt: "2026-09-21T22:07:23Z",
            articles: [],
            media: [],
          }),
        );
      }
      expect(session.contextResearch.searchNote).toMatch(/Parallel Search/i);
      expect(session.dataLimits.value?.join(" ")).toMatch(
        /sede non è indicata.*non viene inferita/i,
      );
    }
  });

  it("materializes the 24 September III Commission notice", () => {
    const session = councilSessionV0ReviewedRecords.find(
      (item) => item.id === "albo-2026-3043-commissione-iii-2026-09-24",
    );

    expect(session).toBeDefined();
    expect(session?.scheduledAt.value).toBe("2026-09-24T11:00:00+02:00");
    expect(session?.agenda.value).toEqual([
      "Servizio raccolta rifiuti nelle zone collinari e montane. Audizione del dirigente della Lamezia Multiservizi ing. Alessandro Vescio e del dirigente di Settore ing. Francesco Esposito.",
    ]);
    expect(session?.sessionStatus.value).toBe("non_verificata");
    expect(session?.provenance).toEqual(
      expect.objectContaining({
        publicationNumber: "2026/3043",
        documentUrl:
          "https://albo.tinnvision.cloud/allegati/2026_3043_1_X?ente=00301390795",
        sourceContentHash:
          "82e6f6fd989cf7e37ae8b4dd8e24a3d4e056a5b486d6fa68e6dd0d8c7f11f222",
        documentSha256:
          "bebe656039da9f7a4dd7b93f3baf530902ac0a1da3319e1bf3e063001845bbb8",
        archivedDocumentUrl: expect.stringContaining(
          "bebe656039da9f7a4dd7b93f3baf530902ac0a1da3319e1bf3e063001845bbb8",
        ),
        sourceReviewStatus: "reviewed_against_official_attachment",
      }),
    );
    expect(session?.contextResearch).toEqual(
      expect.objectContaining({
        status: "checked_no_match",
        checkedAt: "2026-09-23T10:14:27Z",
        articles: [],
        media: [],
      }),
    );
    expect(session?.contextResearch.searchNote).toMatch(/Parallel Search/i);
    expect(session?.dataLimits.value?.join(" ")).toMatch(
      /sede non è indicata.*non viene inferita/i,
    );
  });

  it("materializes the 24–30 September III, IV and V Commission notices", () => {
    const publications = ["2026/3089", "2026/3090", "2026/3091", "2026/3097"];
    const sessions = councilSessionV0ReviewedRecords.filter((session) =>
      publications.includes(session.provenance?.publicationNumber ?? ""),
    );

    expect(sessions).toHaveLength(7);
    expect(sessions.map((session) => session.scheduledAt.value)).toEqual([
      "2026-09-30T09:00:00+02:00",
      "2026-09-29T09:00:00+02:00",
      "2026-09-28T10:00:00+02:00",
      "2026-09-28T09:00:00+02:00",
      "2026-09-25T12:00:00+02:00",
      "2026-09-25T11:00:00+02:00",
      "2026-09-24T12:00:00+02:00",
    ]);

    expect(
      sessions.find(
        (session) => session.id === "albo-2026-3097-commissione-iv-2026-09-24",
      )?.agenda.value,
    ).toEqual([
      "Mozione prot. n. 68544/2026: tutela della salute e del benessere della comunità scolastica e piano di adeguamento climatico degli edifici scolastici comunali.",
    ]);
    expect(
      sessions.find(
        (session) => session.id === "albo-2026-3090-commissione-v-2026-09-28",
      )?.agenda.value,
    ).toEqual([
      "Regolamento sulla gestione e valorizzazione dei beni comunali.",
    ]);
    expect(
      sessions.find(
        (session) => session.id === "albo-2026-3090-commissione-v-2026-09-28",
      )?.contextResearch,
    ).toEqual({
      status: "reviewed_matches",
      checkedAt: "2026-09-28T15:27:08Z",
      searchNote: expect.stringContaining("possible_same_session"),
      articles: [
        expect.objectContaining({
          title:
            "Lamezia, verifica sul Regolamento edilizio e urbanistico: la V Commissione chiede adeguamento alle norme vigenti",
          url: "https://www.lametino.it/ultime/lamezia-verifica-sul-regolamento-edilizio-e-urbanistico-la-v-commissione-chiede-adeguamento-alle-norme-vigenti.html",
          publisher: "il Lametino",
          publishedAt: "2026-09-28",
          relationship: "possible_same_session",
          relevanceNote: expect.stringContaining(
            "tema diverso dall'ordine del giorno ufficiale",
          ),
          reviewedAt: "2026-09-28T15:27:08Z",
        }),
        expect.objectContaining({
          title:
            "Il Comune chiede a sè stesso di aggiornare il Regolamento Edilizio ed Urbanistico",
          url: "https://www.lameziainforma.it/politica/2026/09/28/il-comune-chiede-a-se-stesso-di-aggiornare-il-regolamento-edilizio-ed-urbanistico/69454/",
          publisher: "LameziaInforma",
          publishedAt: "2026-09-28",
          relationship: "possible_same_session",
          relevanceNote: expect.stringContaining(
            "tema è diverso dall'ordine del giorno ufficiale",
          ),
          reviewedAt: "2026-09-28T15:27:08Z",
        }),
        expect.objectContaining({
          title:
            "Nuovo rinnovo fino a fine 2028 per l’assegnazione alla Progetto Sud dell’immobile di via dei Bizantini",
          url: "https://www.lameziainforma.it/istituzione/2026/09/28/nuovo-rinnovo-fino-a-fine-2028-per-lassegnazione-alla-progetto-sud-dellimmobile-di-via-dei-bizantini/69453/",
          publisher: "LameziaInforma",
          publishedAt: "2026-09-28",
          relationship: "agenda_item",
          relevanceNote: expect.stringContaining(
            "gestione e valorizzazione dei beni comunali",
          ),
          reviewedAt: "2026-09-28T15:27:08Z",
        }),
      ],
      media: [],
    });
    expect(
      sessions.find(
        (session) => session.id === "albo-2026-3090-commissione-v-2026-09-30",
      )?.agenda.value,
    ).toEqual(["Disciplinare per interventi sulla rete stradale."]);

    const expectedProvenance = new Map([
      [
        "2026/3089",
        {
          sourceContentHash:
            "b621f17980514460f3620dfcae1fc8ad976072c73a2da36e1ced4164c8cbb179",
          documentSha256:
            "a4d38091b4b34ac513d25e6a7a200dcb0538f086ae29d2f4aa42e8f04b13cd62",
        },
      ],
      [
        "2026/3090",
        {
          sourceContentHash:
            "1ccc848648feb3895b8d94ee2f546862f919b6e46b1592da9d3f0575f100e3e2",
          documentSha256:
            "095b6802f339bc9bbf7279fc905e021ffd9a6867d2dcc1a465e28439d1ade6a2",
        },
      ],
      [
        "2026/3091",
        {
          sourceContentHash:
            "5664f02ecd0edb544711b691fbbb080732cb6e2e9c6cdea4f88f4052d9b225ba",
          documentSha256:
            "a8381207edd8c5ca1b7cacd2b3c006ebe4073ee3b22dd199fac616705031f23c",
        },
      ],
      [
        "2026/3097",
        {
          sourceContentHash:
            "4a6199e13ea5f62aff37318343b396776b6208511c9cdc12cc03d1b9eadaa708",
          documentSha256:
            "4f2d4c158f13f9239d1b5391f92315a7a7ef29a2e8769c8b04697f0a92f30b1d",
        },
      ],
    ]);

    for (const session of sessions) {
      const publicationNumber = session.provenance?.publicationNumber ?? "";
      const provenance = expectedProvenance.get(publicationNumber);
      expect(provenance).toBeDefined();
      if (!provenance)
        throw new Error(`Missing provenance for ${publicationNumber}`);
      expect(session.provenance).toEqual(
        expect.objectContaining({
          sourceContentHash: provenance.sourceContentHash,
          documentSha256: provenance.documentSha256,
          archivedDocumentUrl: expect.stringContaining(
            provenance.documentSha256,
          ),
          sourceReviewStatus: "reviewed_against_official_attachment",
        }),
      );
      expect(session.scheduledAt.sourceStatus).toBe("verificato");
      expect(session.agenda.sourceStatus).toBe("verificato");
      expect(session.sessionStatus.value).toBe("non_verificata");
      if (session.id !== "albo-2026-3090-commissione-v-2026-09-28") {
        expect(session.contextResearch).toEqual(
          expect.objectContaining({
            status: "checked_no_match",
            checkedAt: "2026-09-26T22:13:55Z",
            articles: [],
            media: [],
          }),
        );
      }
      expect(session.contextResearch.searchNote).toMatch(/Parallel Search/i);
      expect(session.liveStreaming.value).toBeNull();
      expect(session.recording.value).toBeNull();
      expect(session.dataLimits.value?.join(" ")).toMatch(
        /sede non è indicata.*non viene inferita/i,
      );
    }
  });

  it("materializes the 29 September–1 October III and IV Commission notices", () => {
    const publications = ["2026/3127", "2026/3129"];
    const sessions = councilSessionV0ReviewedRecords.filter((session) =>
      publications.includes(session.provenance?.publicationNumber ?? ""),
    );

    expect(sessions).toHaveLength(4);
    expect(sessions.map((session) => session.scheduledAt.value)).toEqual([
      "2026-10-01T11:00:00+02:00",
      "2026-09-30T10:00:00+02:00",
      "2026-09-29T11:00:00+02:00",
      "2026-09-29T10:00:00+02:00",
    ]);
    expect(
      sessions.find(
        (session) => session.id === "albo-2026-3129-commissione-iii-2026-09-29",
      )?.agenda.value,
    ).toEqual([
      "Misure di contrasto all'abbandono di rifiuti. Audizione del Vicecomandante Ten. Col. Aldo Rubino.",
    ]);
    expect(
      sessions.find(
        (session) => session.id === "albo-2026-3129-commissione-iii-2026-10-01",
      )?.agenda.value,
    ).toEqual([
      'Regolamento per l\'istituzione della figura del "Garante delle persone con disabilità".',
    ]);

    const expectedProvenance = new Map([
      [
        "2026/3127",
        {
          sourceContentHash:
            "597162d76e5aa5f1c63f56847e6d96e6418f07263b3c32bb6738b7946d0e9b52",
          documentSha256:
            "a0138aeebec3e21db1a1b922f91886dd186bad25ffc56542076ecbbb147ae5ae",
        },
      ],
      [
        "2026/3129",
        {
          sourceContentHash:
            "62415093f67010fd438f1c50356797e45627e166ad510bb0dd4c3ff60b230539",
          documentSha256:
            "3bad1431481f91442b163c8476275d492807e42bf2bd80807961dd80d2e7a972",
        },
      ],
    ]);

    for (const session of sessions) {
      const publicationNumber = session.provenance?.publicationNumber ?? "";
      const provenance = expectedProvenance.get(publicationNumber);
      expect(provenance).toBeDefined();
      if (!provenance)
        throw new Error(`Missing provenance for ${publicationNumber}`);
      expect(session.provenance).toEqual(
        expect.objectContaining({
          sourceContentHash: provenance.sourceContentHash,
          documentSha256: provenance.documentSha256,
          archivedDocumentUrl: expect.stringContaining(
            provenance.documentSha256,
          ),
          sourceReviewStatus: "reviewed_against_official_attachment",
        }),
      );
      expect(session.scheduledAt.sourceStatus).toBe("verificato");
      expect(session.agenda.sourceStatus).toBe("verificato");
      expect(session.sessionStatus.value).toBe("non_verificata");
      expect(session.contextResearch).toEqual(
        expect.objectContaining({
          status: "checked_no_match",
          checkedAt: "2026-09-28T15:27:08Z",
          articles: [],
          media: [],
        }),
      );
      expect(session.contextResearch.searchNote).toMatch(/Parallel Search/i);
      expect(session.liveStreaming.value).toBeNull();
      expect(session.recording.value).toBeNull();
      expect(session.dataLimits.value?.join(" ")).toMatch(
        /sede non è indicata.*non viene inferita/i,
      );
    }
  });

  it("materializes the 1–6 October Commission calendars from six official notices", () => {
    const publications = [
      "2026/3151",
      "2026/3152",
      "2026/3157",
      "2026/3190",
      "2026/3197",
      "2026/3198",
    ];
    const sessions = councilSessionV0ReviewedRecords.filter((session) =>
      publications.includes(session.provenance?.publicationNumber ?? ""),
    );

    expect(sessions).toHaveLength(10);
    expect(sessions.map((session) => session.scheduledAt.value)).toEqual([
      "2026-10-06T11:00:00+02:00",
      "2026-10-06T10:00:00+02:00",
      "2026-10-05T12:00:00+02:00",
      "2026-10-05T11:00:00+02:00",
      "2026-10-05T10:00:00+02:00",
      "2026-10-02T11:00:00+02:00",
      "2026-10-02T10:00:00+02:00",
      "2026-10-02T09:00:00+02:00",
      "2026-10-01T10:00:00+02:00",
      "2026-10-01T09:00:00+02:00",
    ]);

    const expectedProvenance = new Map([
      [
        "2026/3151",
        {
          sourceContentHash:
            "2f133ea15d7c0972572dff147299e6cdf337044a1cadfdaa0eaa872bc942a6e3",
          documentSha256:
            "22fda4e484df93fbc9983803b62e066a46201d094f601ee38cdcd2a730004000",
        },
      ],
      [
        "2026/3152",
        {
          sourceContentHash:
            "057df91b8abf8c7a3fcf0752c049b2035310fca58087dbe11603e6b7d66c4643",
          documentSha256:
            "5e9df217a9c8310fc25597070b99e01776e5a2b3b0993ef937e5b06fa95a6d93",
        },
      ],
      [
        "2026/3157",
        {
          sourceContentHash:
            "cd8e31c6f50d175d5a071f9c51c34c82589b1237b6675cf6c6b6f8c510a9c205",
          documentSha256:
            "6bbec3fb6360a5d8cfd40362d775e398bd0f4a80d41c49d5c375d8216bbc77d8",
        },
      ],
      [
        "2026/3190",
        {
          sourceContentHash:
            "e4746942f27d592cf2b3ce71705382bcd5935fe9203c5e28fe5d4bab0ba45b73",
          documentSha256:
            "5d607076e9146eaadb5bc23b83928c865e1007c010abbf77c6dacbdf4a17770d",
        },
      ],
      [
        "2026/3197",
        {
          sourceContentHash:
            "35477946eac942930eb5fc7be71afdc63505e07b4442416e703f6799f7d8e82e",
          documentSha256:
            "50dc729a39338b607925d93f7cf927a38ed75f88ec8ca8ebc7163a5166ae7cc1",
        },
      ],
      [
        "2026/3198",
        {
          sourceContentHash:
            "57af86ffd8640a7acf140edf2742e9b761022da32f8be076332c4e6145d2c090",
          documentSha256:
            "83fe0c8c9149f7fb01dd5ca0180d0c8d4decf59be9ef5c44a36baad7b1e6fbec",
        },
      ],
    ]);

    for (const session of sessions) {
      const publicationNumber = session.provenance?.publicationNumber ?? "";
      const provenance = expectedProvenance.get(publicationNumber);
      expect(provenance).toBeDefined();
      if (!provenance)
        throw new Error(`Missing provenance for ${publicationNumber}`);
      expect(session.provenance).toEqual(
        expect.objectContaining({
          sourceContentHash: provenance.sourceContentHash,
          documentSha256: provenance.documentSha256,
          archivedDocumentUrl: expect.stringContaining(
            provenance.documentSha256,
          ),
          sourceReviewStatus: "reviewed_against_official_attachment",
        }),
      );
      expect(session.scheduledAt.sourceStatus).toBe("verificato");
      expect(session.agenda.sourceStatus).toBe("verificato");
      expect(session.sessionStatus.value).toBe("non_verificata");
      if (session.id === "albo-2026-3197-commissione-ii-2026-10-06") {
        expect(session.contextResearch).toEqual(
          expect.objectContaining({
            status: "reviewed_matches",
            checkedAt: "2026-10-07T15:48:24Z",
            media: [],
            articles: expect.arrayContaining([
              expect.objectContaining({
                publisher: "il Lametino",
                publishedAt: "2026-09-30",
                relationship: "agenda_item",
                url: expect.stringContaining(
                  "piano-di-riequilibrio-il-comune-si-affida",
                ),
              }),
              expect.objectContaining({
                publisher: "il Lametino",
                publishedAt: "2026-10-01",
                relationship: "agenda_item",
                url: expect.stringContaining(
                  "supporto-giuridico-al-piano-di-riequilibrio",
                ),
              }),
              expect.objectContaining({
                publisher: "La Novità Online",
                publishedAt: "2026-10-01",
                relationship: "agenda_item",
                url: expect.stringContaining(
                  "pre-dissesto-affidamento-da-14-mila-euro",
                ),
              }),
              expect.objectContaining({
                publisher: "Corriere di Lamezia",
                publishedAt: "2026-10-01",
                relationship: "agenda_item",
                url: expect.stringContaining("siamo-in-pre-dissesto"),
              }),
              expect.objectContaining({
                publisher: "Notizie.it Catanzaro",
                publishedAt: "2026-10-01",
                relationship: "agenda_item",
                url: expect.stringContaining("scelta-contro-lifel"),
              }),
              expect.objectContaining({
                publisher: "il Lametino",
                publishedAt: "2026-10-02",
                relationship: "agenda_item",
                url: expect.stringContaining(
                  "crisi-finanziaria-dei-comuni-calabria-al-primo-posto",
                ),
              }),
              expect.objectContaining({
                publisher: "Gazzetta del Sud",
                publishedAt: "2026-10-02",
                relationship: "agenda_item",
                url: expect.stringContaining(
                  "piano-di-riequilibrio-sotto-accusa-mascaro",
                ),
              }),
              expect.objectContaining({
                publisher: "Il Quotidiano del Sud",
                publishedAt: "2026-10-04",
                relationship: "agenda_item",
                url: expect.stringContaining(
                  "comuni-in-crisi-lamezia-caso-emblematico",
                ),
              }),
              expect.objectContaining({
                publisher: "il Lametino",
                publishedAt: "2026-10-05",
                relationship: "agenda_item",
                url: expect.stringContaining(
                  "piano-di-riequilibrio-arrivano-i-primi-tagli",
                ),
              }),
              expect.objectContaining({
                publisher: "LameziaTerme.it",
                publishedAt: "2026-10-05",
                relationship: "agenda_item",
                url: expect.stringContaining(
                  "piano-di-riequilibrio-cristiano-villella-primi-tagli",
                ),
              }),
              expect.objectContaining({
                publisher: "Gazzetta del Sud",
                publishedAt: "2026-10-06",
                relationship: "agenda_item",
                url: expect.stringContaining(
                  "comune-di-lamezia-verso-il-predissesto",
                ),
              }),
              expect.objectContaining({
                publisher: "LameziaTerme.it",
                publishedAt: "2026-10-06",
                relationship: "agenda_item",
                url: expect.stringContaining(
                  "piano-di-riequilibrio-raso-branca-perche-un-incarico-esterno",
                ),
              }),
              expect.objectContaining({
                publisher: "Corriere di Lamezia",
                publishedAt: "2026-10-06",
                relationship: "agenda_item",
                url: expect.stringContaining(
                  "piano-di-riequilibrio-raso-e-branca",
                ),
              }),
              expect.objectContaining({
                publisher: "il Lametino",
                publishedAt: "2026-10-06",
                relationship: "agenda_item",
                url: expect.stringContaining(
                  "raso-e-branca-serve-chiarezza-sullincarico-esterno",
                ),
              }),
            ]),
          }),
        );
        expect(session.contextResearch.articles).toHaveLength(14);
        expect(session.contextResearch.searchNote).toMatch(
          /stessa nota.*non identificano la seduta.*I Commissione.*Commissione Bilancio.*Nessuna fonte attesta.*audizione/i,
        );
      } else {
        expect(session.contextResearch).toEqual(
          expect.objectContaining({
            status: "checked_no_match",
            checkedAt: "2026-10-02T22:19:30Z",
            articles: [],
            media: [],
          }),
        );
      }
      expect(session.contextResearch.searchNote).toMatch(/Parallel Search/i);
      expect(session.liveStreaming.value).toBeNull();
      expect(session.recording.value).toBeNull();
      expect(session.dataLimits.value?.join(" ")).toMatch(
        /sede non è indicata.*non viene inferita/i,
      );
    }
  });
});
