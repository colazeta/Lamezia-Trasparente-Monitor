import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Router as WouterRouter } from "wouter";

import {
  PUBLIC_PROPOSALS,
  filterPublicProposals,
  getProposalPromoters,
  getProposalThemes,
} from "@/data/propostePubbliche";
import { PropostePubbliche } from "@/pages/PropostePubbliche";

function renderArchive() {
  return render(
    <WouterRouter>
      <PropostePubbliche />
    </WouterRouter>,
  );
}

describe("archivio proposte pubbliche", () => {
  it("espone i quattro seed demo come iniziative popolari neutrali", () => {
    expect(PUBLIC_PROPOSALS).toHaveLength(4);
    expect(
      PUBLIC_PROPOSALS.every(
        (proposal) => proposal.promoter === "Lamezia Trasparente",
      ),
    ).toBe(true);
    expect(
      PUBLIC_PROPOSALS.every(
        (proposal) => proposal.channel === "iniziativa_popolare",
      ),
    ).toBe(true);
    expect(
      PUBLIC_PROPOSALS.every(
        (proposal) =>
          proposal.theme === "Trasparenza / partecipazione democratica",
      ),
    ).toBe(true);
    expect(
      PUBLIC_PROPOSALS.every((proposal) => proposal.sourceUrl === undefined),
    ).toBe(true);
  });

  it("filtra le proposte per stato, promotore e tema con utility pure", () => {
    expect(getProposalThemes()).toEqual([
      "Trasparenza / partecipazione democratica",
    ]);
    expect(getProposalPromoters()).toEqual(["Lamezia Trasparente"]);

    const filtered = filterPublicProposals(PUBLIC_PROPOSALS, {
      theme: "trasparenza / partecipazione democratica",
      promoter: "lamezia trasparente",
      status: "proposta_emersa",
    });

    expect(filtered).toHaveLength(4);
    expect(
      filterPublicProposals(PUBLIC_PROPOSALS, { status: "discussa" }),
    ).toHaveLength(0);
  });

  it("renderizza criteri metodologici, filtri minimi e cards delle proposte", () => {
    renderArchive();

    expect(
      screen.getByRole("heading", {
        name: "Archivio delle proposte pubbliche",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Archivio documentale, non endorsement/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Tema")).toBeInTheDocument();
    expect(screen.getByLabelText("Promotore")).toBeInTheDocument();
    expect(screen.getByLabelText("Anno")).toBeInTheDocument();
    expect(screen.getByLabelText("Stato")).toBeInTheDocument();
    expect(screen.getByLabelText("Canale")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Pubblicità digitale di convocazioni e ordini del giorno",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Firma digitale per iniziative popolari, istanze e petizioni",
      ),
    ).toBeInTheDocument();
  });

  it("aggiorna il conteggio quando un filtro non contiene risultati", () => {
    renderArchive();

    fireEvent.change(screen.getByLabelText("Stato"), {
      target: { value: "discussa" },
    });

    expect(
      screen.getByText("0 proposte visualizzate su 4 record seed."),
    ).toBeInTheDocument();
  });

  it("non include dati personali non necessari nei record seed", () => {
    const serialized = JSON.stringify(PUBLIC_PROPOSALS);

    expect(serialized).not.toMatch(
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
    );
    expect(serialized).not.toMatch(/\b\+?\d{2,4}[\s.-]?\d{5,}\b/);
    expect(serialized).not.toMatch(
      /\b[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]\b/i,
    );
  });
});
