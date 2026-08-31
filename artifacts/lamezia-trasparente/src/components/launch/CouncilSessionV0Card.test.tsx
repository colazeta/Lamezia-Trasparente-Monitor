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
  it("renders the officially confirmed council date without inventing a time", () => {
    const session = reviewedRecord("albo-2026-2673-consiglio-comunale");

    render(<CouncilSessionV0SummaryCard session={session} />);

    expect(
      screen.getByRole("heading", {
        name: "Consiglio comunale — seduta del 13 agosto 2026",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Fonte istituzionale successiva controllata"),
    ).toBeInTheDocument();
    expect(screen.getByText("13 agosto 2026")).toBeInTheDocument();
    expect(
      screen.queryByText(/13 agosto 2026.*02:00/i),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Seduta svolta")).toBeInTheDocument();
    expect(
      screen.getByText(
        /7 articoli contestuali revisionati.*3 video revisionati/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Fonte ufficiale/i }),
    ).toHaveAttribute(
      "href",
      "https://albo.tinnvision.cloud/allegati/2026_2755_6_ALLEG?ente=00301390795",
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
    expect(screen.getByText("Non verificato")).toBeInTheDocument();
    expect(
      screen.queryByText("Stato della seduta non verificato"),
    ).not.toBeInTheDocument();

    const navigation = screen.getByRole("navigation", {
      name: "Sezioni della scheda",
    });
    expect(
      within(navigation).getByRole("link", { name: "Ordine del giorno" }),
    ).toHaveAttribute("href", "#ordine-del-giorno");
    expect(
      within(navigation).getByRole("link", { name: "Video e articoli" }),
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
      screen.getByRole("heading", { name: "Copertura della seduta" }),
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

  it("links precise press coverage to the verified council date without filling the agenda", () => {
    const session = reviewedRecord("albo-2026-2673-consiglio-comunale");

    render(<CouncilSessionV0Detail session={session} />);

    expect(screen.getAllByText("Stessa seduta")).toHaveLength(7);
    expect(
      screen.queryByText("Possibile corrispondenza"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: /Convocato Consiglio Comunale di Lamezia Terme/i,
      }),
    ).toHaveAttribute("href", expect.stringContaining("cityonelamezia.it"));
    expect(
      screen.getByRole("link", {
        name: /il Consiglio comunale approva l'assestamento/i,
      }),
    ).toHaveAttribute("href", expect.stringContaining("lametino.it"));
    expect(
      screen
        .getAllByRole("link", {
          name: /Sottoscritti 142 Progetti di Vita/i,
        })
        .some((link) =>
          link.getAttribute("href")?.includes("comune.lamezia-terme.cz.it"),
        ),
    ).toBe(true);
    expect(
      screen.getByRole("link", {
        name: "Consiglio comunale del 13 Agosto",
      }),
    ).toHaveAttribute(
      "href",
      "https://www.cityonelamezia.it/episodio/video/consiglio-comunale-del-13-agosto-consiglio-comunale/?format=video",
    );
    expect(
      screen.getByRole("link", {
        name: "Salvatore Vescio — Consiglio comunale del 13 agosto 2026",
      }),
    ).toHaveAttribute("href", "https://www.instagram.com/reel/DcB8mBgtILm/");
    expect(
      screen.getByRole("link", {
        name: "Annita Vitale — intervento sul Piano di riequilibrio finanziario",
      }),
    ).toHaveAttribute("href", "https://www.instagram.com/reel/DcGRDc8o1qI/");
    expect(
      screen.getByRole("heading", { name: "Temi emersi dalla copertura" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Ricostruzione editoriale distinta dall'ordine del giorno/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Copia archiviata 2026/2755",
        hidden: true,
      }),
    ).toHaveAttribute(
      "href",
      expect.stringContaining(
        "e008e83a4d7ae0a4672146b73ebc62e64d565a26eeb043cafaf9e45d92ecf2c5.pdf",
      ),
    );
    expect(screen.getByText("13 agosto 2026")).toBeInTheDocument();
    expect(screen.getByText("Svolta")).toBeInTheDocument();
    expect(
      screen.getByText("Ordine del giorno non disponibile."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/fonte successiva conferma un solo punto/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/fonte istituzionale successiva conferma la seduta/i),
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

    expect(
      screen.getByRole("heading", { name: "Video e interviste" }),
    ).toBeInTheDocument();
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
    expect(screen.getAllByText("Perché è collegato")).toHaveLength(8);
  });

  it("shows a VI Commission occurrence from the reviewed official attachment", () => {
    const session = reviewedRecord("albo-2026-2788-commissione-vi-2026-09-01");

    render(<CouncilSessionV0SummaryCard session={session} />);

    expect(
      screen.getByRole("heading", {
        name: "VI Commissione consiliare permanente — seduta del 1 settembre 2026",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Allegato ufficiale controllato"),
    ).toBeInTheDocument();
    expect(screen.getByText(/1 settembre 2026.*12:00/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        "Ricerca di contesto eseguita: nessuna corrispondenza sufficientemente precisa",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("31 agosto 2026")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Fonte ufficiale/i }),
    ).toHaveAttribute(
      "href",
      "https://albo.tinnvision.cloud/allegati/2026_2788_2_P?ente=00301390795",
    );
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
