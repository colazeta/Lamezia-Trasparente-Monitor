import { describe, expect, it } from "vitest";

import {
  buildCouncilTransparencyCoverageReport,
  COUNCIL_NOT_DETECTED_NOTE,
  type CouncilPublicationChannel,
  type CouncilSession,
  type CouncilSourceReference,
} from "./councilTransparencyCoverage";

const source: CouncilSourceReference = {
  label: "Sezione Consiglio comunale",
  url: "https://example.test/consiglio",
  checkedAt: "2026-05-15T10:00:00.000Z",
};

const agendaItem = {
  id: "odg-1",
  title: "Comunicazioni e atti di indirizzo",
  source,
};

const baseChannels: CouncilPublicationChannel[] = [
  { kind: "albo_pretorio", source },
  { kind: "institutional_section", source },
];

function session(overrides: Partial<CouncilSession> = {}): CouncilSession {
  return {
    id: "seduta-1",
    kind: "council",
    title: "Seduta del Consiglio comunale",
    source,
    notice: {
      id: "convocazione-1",
      kind: "council",
      title: "Convocazione del Consiglio comunale",
      source,
    },
    agendaItems: [agendaItem],
    publicationChannels: baseChannels,
    mediaEvidence: [
      { kind: "streaming_live", source },
      { kind: "recording_archive", source },
      { kind: "minutes", source },
      { kind: "full_report", source },
    ],
    lastCheckedAt: "2026-05-15T12:00:00.000Z",
    ...overrides,
  };
}

describe("council transparency coverage helper", () => {
  it("marks a complete council session as verified from documented fields", () => {
    const report = buildCouncilTransparencyCoverageReport(session());

    expect(report.overallStatus).toBe("verified");
    expect(report.noticeDetected.status).toBe("verified");
    expect(report.agendaDetected.status).toBe("verified");
    expect(report.alboPublication.status).toBe("verified");
    expect(report.institutionalSection.status).toBe("verified");
    expect(report.streamingLive.status).toBe("verified");
    expect(report.recordingArchive.status).toBe("verified");
    expect(report.minutes.status).toBe("verified");
    expect(report.fullReport.status).toBe("verified");
    expect(report.incompletenessNotes).toEqual([]);
  });

  it("uses cautious wording for a council session without streaming evidence", () => {
    const report = buildCouncilTransparencyCoverageReport(
      session({
        mediaEvidence: [
          { kind: "recording_archive", source },
          { kind: "minutes", source },
          { kind: "full_report", source },
        ],
      }),
    );

    expect(report.overallStatus).toBe("partial");
    expect(report.streamingLive).toEqual({
      status: "not_found_in_monitored_sources",
      note: COUNCIL_NOT_DETECTED_NOTE,
    });
    expect(report.incompletenessNotes).toContain(
      `streamingLive: ${COUNCIL_NOT_DETECTED_NOTE}`,
    );
  });

  it("reports no full transcript as not found in monitored sources, not as misconduct", () => {
    const report = buildCouncilTransparencyCoverageReport(
      session({
        mediaEvidence: [
          { kind: "streaming_live", source },
          { kind: "recording_archive", source },
          { kind: "minutes", source },
        ],
      }),
    );

    expect(report.fullReport.status).toBe("not_found_in_monitored_sources");
    expect(report.fullReport.note).toBe(COUNCIL_NOT_DETECTED_NOTE);
    expect(report.incompletenessNotes.join(" ")).not.toMatch(/mancante/i);
  });

  it("treats commission notices as covered while media channels can be not applicable", () => {
    const report = buildCouncilTransparencyCoverageReport(
      session({
        id: "commissione-1",
        kind: "commission",
        title: "Convocazione commissione consiliare",
        notice: {
          id: "convocazione-commissione-1",
          kind: "commission",
          title: "Convocazione commissione consiliare",
          source,
        },
        mediaEvidence: [{ kind: "minutes", source }],
      }),
    );

    expect(report.sessionKind).toBe("commission");
    expect(report.noticeDetected.status).toBe("verified");
    expect(report.streamingLive.status).toBe("not_applicable");
    expect(report.recordingArchive.status).toBe("not_applicable");
  });

  it("requires review when no source is available for the session", () => {
    const report = buildCouncilTransparencyCoverageReport(
      session({
        source: undefined,
        notice: {
          id: "convocazione-senza-fonte",
          kind: "council",
          title: "Convocazione senza riferimento fonte",
        },
        agendaItems: [{ id: "odg-senza-fonte", title: "Punto da verificare" }],
        publicationChannels: [],
        mediaEvidence: [],
      }),
    );

    expect(report.overallStatus).toBe("needs_review");
    expect(report.source.status).toBe("needs_review");
    expect(report.source.note).toContain("fonte da verificare");
    expect(report.noticeDetected.status).toBe("partial");
    expect(report.agendaDetected.status).toBe("partial");
  });
});
