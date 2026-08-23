import { render, screen, within } from "@testing-library/react";
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
      screen.getByText("3 articoli contestuali revisionati"),
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
        name: "II Commissione consiliare permanente",
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
      screen.getByText(
        /La convocazione non prova lo svolgimento della seduta/i,
      ),
    ).toBeInTheDocument();

    const navigation = screen.getByRole("navigation", {
      name: "Sezioni della scheda",
    });
    expect(
      within(navigation).getByRole("link", { name: "Ordine del giorno" }),
    ).toHaveAttribute("href", "#ordine-del-giorno");
    expect(
      within(navigation).getByRole("link", { name: "Articoli e video" }),
    ).toHaveAttribute("href", "#contenuti-collegati");
    expect(
      within(navigation).getByRole("link", { name: "Documenti" }),
    ).toHaveAttribute("href", "#documenti-ufficiali");
    expect(
      within(navigation).getByRole("link", { name: "Fonti" }),
    ).toHaveAttribute("href", "#fonti-limiti-v0");
    expect(
      screen.getByText("Nessun video verificabile trovato."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Nessun documento successivo disponibile."),
    ).toBeInTheDocument();
  });

  it("keeps contextual articles separate from official session fields", () => {
    const session = reviewedRecord("albo-2026-2648-commissione-ii-2026-08-10");

    render(<CouncilSessionV0Detail session={session} />);

    expect(
      screen.getByRole("heading", { name: "Articoli e video" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Articoli e video non sostituiscono le fonti ufficiali/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("2 collegamenti")).toBeInTheDocument();
    expect(screen.getAllByText("Tema all'ordine del giorno")).toHaveLength(2);
    expect(screen.getAllByText("Perché è collegato")).toHaveLength(2);
    expect(
      screen.getByRole("link", {
        name: /Approvato in giunta l'assestamento generale di bilancio/i,
      }),
    ).toHaveAttribute("href", expect.stringContaining("lameziainforma.it"));
  });

  it("labels press coverage as a possible council match without completing official fields", () => {
    const session = reviewedRecord("albo-2026-2673-consiglio-comunale");

    render(<CouncilSessionV0Detail session={session} />);

    expect(screen.getAllByText("Possibile corrispondenza")).toHaveLength(3);
    expect(
      screen.getByRole("link", {
        name: /Convocato Consiglio Comunale di Lamezia Terme/i,
      }),
    ).toHaveAttribute("href", expect.stringContaining("cityonelamezia.it"));
    expect(
      screen.getByRole("link", {
        name: /Consiglio comunale prima di Ferragosto/i,
      }),
    ).toHaveAttribute("href", expect.stringContaining("lameziainforma.it"));
    expect(screen.getByText("Data da verificare")).toBeInTheDocument();
    expect(
      screen.getByText("Ordine del giorno non disponibile."),
    ).toBeInTheDocument();
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
            url: "https://example.test/city-one-consiglio-2026-08-13",
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

    expect(screen.getByRole("heading", { name: "Video" })).toBeInTheDocument();
    expect(
      screen.getByText(/Diretta editoriale.*Replay disponibile/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Articoli e video non sostituiscono le fonti ufficiali/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: /Consiglio Comunale 13 Agosto 2026/i,
      }),
    ).toHaveAttribute(
      "href",
      "https://example.test/city-one-consiglio-2026-08-13",
    );
    expect(screen.getAllByText("Perché è collegato")).toHaveLength(4);
  });

  it("uses concise one-line empty states", () => {
    const base = reviewedRecord("albo-2026-2648-commissione-ii-2026-08-10");
    const session = {
      ...base,
      contextResearch: {
        status: "checked_no_match" as const,
        checkedAt: "2026-08-23T10:00:00Z",
        searchNote: "Nessuna corrispondenza precisa trovata.",
        articles: [],
        media: [],
      },
    };

    render(<CouncilSessionV0Detail session={session} />);

    expect(screen.getByText("Nessun risultato")).toBeInTheDocument();
    expect(
      screen.getByText("Nessun articolo o video pertinente trovato."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Video" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Articoli" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Nessun documento successivo disponibile."),
    ).toBeInTheDocument();
  });
});
