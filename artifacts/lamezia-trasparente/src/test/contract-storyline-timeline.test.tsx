import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type {
  StorylineEvent,
  StorylineIndicators,
} from "@workspace/api-client-react";

import { ContractTimeline } from "@/pages/ContractStoryline";

const indicators: StorylineIndicators = {
  evidenceCount: 3,
  phaseCounts: {
    affidamento: 1,
    contratto: 1,
    liquidazione: 1,
  },
  firstEvidenceDate: "2025-01-01T00:00:00.000Z",
  lastEvidenceDate: "2025-03-03T00:00:00.000Z",
  daysToFirstLiquidazione: 61,
  daysToLastLiquidazione: 61,
  awardedAmount: 120000,
  extraAmount: null,
  extraAmountIsEstimate: false,
  costOverrunPct: null,
  liquidatedAmount: 60000,
  liquidatedAmountIsEstimate: true,
  status: "in_corso",
};

describe("ContractTimeline", () => {
  it("puts the documentary story first and orders events by date", () => {
    render(
      <ContractTimeline
        title="Manutenzione scuola comunale"
        indicators={indicators}
        timeline={[
          eventFixture({
            publicationId: 3,
            date: "2025-03-03T00:00:00.000Z",
            phase: "liquidazione",
            oggetto: "Liquidazione del primo stato di avanzamento",
          }),
          eventFixture({
            publicationId: 1,
            date: "2025-01-01T00:00:00.000Z",
            phase: "affidamento",
            oggetto: "Affidamento iniziale",
          }),
          eventFixture({
            publicationId: 2,
            date: "2025-02-10T00:00:00.000Z",
            phase: "contratto",
            oggetto: "Sottoscrizione del contratto",
            attachments: [
              {
                name: "contratto.pdf",
                tipo: "documento",
                officialUrl: "https://example.test/contratto.pdf",
                storagePath: null,
                contentType: "application/pdf",
                size: 1024,
              },
            ],
          }),
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "La storia documentale del contratto",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("61 giorni")).toBeInTheDocument();
    expect(
      screen.getByText("Fasi presenti nella cronistoria"),
    ).toBeInTheDocument();

    const list = screen.getByRole("list", {
      name: "Cronologia documentale di Manutenzione scuola comunale",
    });
    const items = within(list).getAllByTestId("timeline-event");

    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("Affidamento iniziale");
    expect(items[1]).toHaveTextContent("Sottoscrizione del contratto");
    expect(items[2]).toHaveTextContent(
      "Liquidazione del primo stato di avanzamento",
    );
    expect(items[1]).toHaveTextContent("Atto reperibile");
  });

  it("states the documentary limitation when no event is linked", () => {
    render(
      <ContractTimeline
        title="Fascicolo senza atti"
        indicators={{
          ...indicators,
          evidenceCount: 0,
          phaseCounts: {},
          firstEvidenceDate: null,
          lastEvidenceDate: null,
        }}
        timeline={[]}
      />,
    );

    expect(screen.getByText("Nessun atto collegato")).toBeInTheDocument();
    expect(
      screen.getByText(/limite della documentazione disponibile/i),
    ).toBeInTheDocument();
    expect(screen.queryByText("Atti collegati")).not.toBeInTheDocument();
  });
});

function eventFixture(overrides: Partial<StorylineEvent>): StorylineEvent {
  return {
    publicationId: 1,
    progressivo: "1/2025",
    phase: "altro",
    matchedBy: "cig",
    tipologia: "Determinazione",
    oggetto: "Atto collegato",
    date: null,
    estimatedAmount: null,
    attachments: [],
    ...overrides,
  };
}
