import { render, screen } from "@testing-library/react";
import { Router as WouterRouter } from "wouter";
import { describe, expect, it, vi } from "vitest";
import type { LegalityTimelineEvent } from "@/content/legalitaTimeline";

const publishedEvent: LegalityTimelineEvent = {
  id: "scheda-pubblicata",
  title: "Scheda pubblicata verificata",
  slug: "scheda-pubblicata-verificata",
  dateLabel: "2026",
  startDate: "2026-05-01",
  eventType: "relazione_istituzionale",
  shortDescription:
    "Sintesi documentale neutra collegata a una fonte verificata.",
  status: "fatto_storico_istituzionale",
  primarySource: {
    label: "Fonte primaria verificata",
    url: "/fonti-dati",
    kind: "altro",
  },
  secondarySources: [
    {
      label: "Fonte aggiuntiva verificata",
      url: "https://example.test/fonte-aggiuntiva",
      kind: "comunicato_istituzionale",
    },
  ],
  organisations: ["Ente citato nell'atto"],
  places: ["Lamezia Terme"],
  civicEffect:
    "Effetto civico descritto dalla fonte senza inferenze ulteriori.",
  internalLinks: [],
  cautionNote:
    "Nota di cautela che delimita la lettura della scheda verificata.",
  lastVerification: "2026-06-08",
  published: true,
};

vi.mock("@/content/legalitaTimeline", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/content/legalitaTimeline")>();
  return {
    ...actual,
    getPublishedLegalityTimelineEvents: () => [publishedEvent],
    timelineSchemaExample: {
      ...actual.timelineSchemaExample,
      secondarySources: [],
    },
  };
});

const { LegalitaTimeline } = await import("@/pages/LegalitaTimeline");

function renderTimeline() {
  return render(
    <WouterRouter>
      <LegalitaTimeline />
    </WouterRouter>,
  );
}

describe("LegalitaTimeline", () => {
  it("renders the public status text and additional source links", () => {
    renderTimeline();

    expect(
      screen.getByText("Scheda pubblicata verificata"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/1 scheda verificata è pubblicata nella lista pubblica/),
    ).toBeInTheDocument();
    expect(screen.getByText("Fonti aggiuntive")).toBeInTheDocument();
    expect(screen.getByText("Fonte aggiuntiva verificata")).toBeInTheDocument();
    expect(
      screen.queryByText("Nessun evento pubblicato nella v0"),
    ).not.toBeInTheDocument();
  });
});
