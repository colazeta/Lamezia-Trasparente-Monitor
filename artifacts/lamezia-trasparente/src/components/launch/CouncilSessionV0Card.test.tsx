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
      screen.getByRole("link", { name: /Fonte ufficiale/i }),
    ).toHaveAttribute(
      "href",
      "https://albo.tinnvision.cloud/?ente=00301390795",
    );
  });

  it("renders the reviewed commission occurrence with agenda and archived evidence", () => {
    const session = reviewedRecord("albo-2026-2648-commissione-ii-2026-08-10");

    render(<CouncilSessionV0Detail session={session} />);

    expect(
      screen.getByRole("heading", {
        name: "II Commissione consiliare permanente — seduta del 10 agosto 2026",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/proposta di deliberazione.*2259/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/debiti fuori bilancio/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Copia archiviata/i }),
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
});
