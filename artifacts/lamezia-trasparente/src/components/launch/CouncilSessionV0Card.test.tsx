import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  CouncilSessionV0Detail,
  CouncilSessionV0SummaryCard,
} from "@/components/launch/CouncilSessionV0Card";
import { findCouncilSessionV0ReviewedRecord } from "@/data/councilSessionV0Reviewed";

function reviewedRecord(id: string) {
  const session = findCouncilSessionV0ReviewedRecord(id);
  if (!session) throw new Error(`Missing reviewed record ${id}`);
  return session;
}

describe("CouncilSessionV0Card", () => {
  it("renders the council notice as official metadata without inventing a date", () => {
    const session = reviewedRecord("albo-2026-2673-consiglio-comunale");

    render(<CouncilSessionV0SummaryCard session={session} />);

    expect(
      screen.getByRole("heading", {
        name: "Consiglio comunale — avviso di seduta",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Data da verificare")).toBeInTheDocument();
    expect(
      screen.getByText(/data, ora e ordine del giorno restano da verificare/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText("2 articoli contestuali revisionati"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Fonte ufficiale/i }),
    ).toHaveAttribute(
      "href",
      "https://albo.tinnvision.cloud/?ente=00301390795",
    );
  });

  it("prioritises essential facts and agenda without repeating every field as a card", () => {
    const session = reviewedRecord("albo-2026-2648-commissione-ii-2026-08-10");

    render(<CouncilSessionV0Detail session={session} />);

    expect(
      screen.getByRole("heading", {
        name: "II Commissione consiliare permanente — seduta del 10 agosto 2026",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Ordine del giorno" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/proposta di deliberazione.*2259/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/debiti fuori bilancio/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Titolo" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        name: "Campi pubblicati e stato di verifica",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Copia archiviata/i, hidden: true }),
    ).toHaveAttribute(
      "href",
      expect.stringContaining(
        "842702b2044b4b6f9a7b21a65eac2ab59866ee3f321872e6b28fd481598be304.pdf",
      ),
    );
    expect(
      screen.getAllByText(/non prova.*seduta si sia svolta/i).length,
    ).toBeGreaterThan(0);
  });

  it("keeps contextual articles separate from official session fields", () => {
    const session = reviewedRecord("albo-2026-2648-commissione-ii-2026-08-10");

    render(<CouncilSessionV0Detail session={session} />);

    expect(
      screen.getByRole("heading", { name: "Articoli e contesto" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/non sostituiscono l'Albo/i)).toBeInTheDocument();
    expect(screen.getAllByText("Tema all'ordine del giorno")).toHaveLength(2);
    expect(
      screen.getByRole("link", {
        name: /Approvato in giunta l'assestamento generale di bilancio/i,
      }),
    ).toHaveAttribute("href", expect.stringContaining("lameziainforma.it"));
  });

  it("labels press coverage as a possible council match without completing official fields", () => {
    const session = reviewedRecord("albo-2026-2673-consiglio-comunale");

    render(<CouncilSessionV0Detail session={session} />);

    expect(screen.getAllByText("Possibile corrispondenza")).toHaveLength(2);
    expect(
      screen.getByRole("link", {
        name: /Consiglio comunale prima di Ferragosto/i,
      }),
    ).toHaveAttribute("href", expect.stringContaining("lameziainforma.it"));
    expect(screen.getByText("Data da verificare")).toBeInTheDocument();
    expect(
      screen.getByText(/manca l'allegato ufficiale.*collegamento/i),
    ).toBeInTheDocument();
  });

  it("presents editorial live coverage separately from official streaming", () => {
    const base = reviewedRecord("albo-2026-2673-consiglio-comunale");
    const session = {
      ...base,
      contextResearch: {
        ...base.contextResearch,
        media: [
          {
            title: "Consiglio Comunale 13 Agosto 2026",
            url: "https://www.cityonelamezia.it/",
            publisher: "City One",
            publishedAt: "2026-08-13",
            relationship: "possible_same_session" as const,
            mediaType: "live_stream" as const,
            availability: "replay_available" as const,
            relevanceNote:
              "Video editoriale compatibile con organo e giornata; il test non lo usa come fonte ufficiale della seduta.",
            reviewedAt: "2026-08-23T10:00:00Z",
          },
        ],
      },
    };

    render(<CouncilSessionV0Detail session={session} />);

    expect(
      screen.getByRole("heading", { name: "Diretta e video" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Diretta editoriale")).toBeInTheDocument();
    expect(screen.getByText("Replay disponibile")).toBeInTheDocument();
    expect(
      screen.getByText(/non equivale allo streaming istituzionale/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: /Consiglio Comunale 13 Agosto 2026/i,
      }),
    ).toHaveAttribute("href", "https://www.cityonelamezia.it/");
  });
});
