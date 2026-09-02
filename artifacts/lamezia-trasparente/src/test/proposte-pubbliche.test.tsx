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

function renderProposteCiviche() {
  return render(
    <WouterRouter>
      <PropostePubbliche />
    </WouterRouter>,
  );
}

describe("proposte civiche", () => {
  it("separa le proposte documentate dai quattro seed progettuali interni", () => {
    const internalSeeds = PUBLIC_PROPOSALS.filter(
      (proposal) => proposal.sourceUrl === undefined,
    );
    expect(internalSeeds).toHaveLength(4);
    expect(
      internalSeeds.every((proposal) => proposal.promoter === "Lamezia Trasparente"),
    ).toBe(true);
    expect(
      internalSeeds.every((proposal) => proposal.channel === "iniziativa_popolare"),
    ).toBe(true);
    expect(
      internalSeeds.every(
        (proposal) => proposal.theme === "Trasparenza e partecipazione democratica",
      ),
    ).toBe(true);
    expect(PUBLIC_PROPOSALS.filter((proposal) => proposal.sourceUrl)).toHaveLength(
      PUBLIC_PROPOSALS.length - internalSeeds.length,
    );
  });

  it("filtra le proposte per stato, promotore e tema con utility pure", () => {
    expect(getProposalThemes()).toContain("Trasparenza e partecipazione democratica");
    expect(getProposalPromoters()).toContain("Lamezia Trasparente");

    const filtered = filterPublicProposals(PUBLIC_PROPOSALS, {
      theme: "trasparenza e partecipazione democratica",
      promoter: "lamezia trasparente",
      status: "proposta_emersa",
    });

    expect(filtered).toHaveLength(4);
    expect(filterPublicProposals(PUBLIC_PROPOSALS, { status: "discussa" })).toHaveLength(0);
  });

  it("renderizza archivio compatto, filtri, timeline e titoli canonici", () => {
    renderProposteCiviche();

    expect(screen.getByRole("heading", { name: "Proposte civiche" })).toBeInTheDocument();
    expect(screen.getByText("Stato documentale, non politico.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Distribuzione temporale" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nascita" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sviluppi" })).toBeInTheDocument();
    expect(screen.getByLabelText("Localizzazione")).toBeInTheDocument();
    expect(screen.getByLabelText("Area locale")).toBeInTheDocument();
    expect(screen.getByLabelText("Tema")).toBeInTheDocument();
    expect(screen.getByLabelText("Promotore")).toBeInTheDocument();
    expect(screen.getByLabelText("Anno")).toBeInTheDocument();
    expect(screen.getByLabelText("Stato")).toBeInTheDocument();
    expect(screen.getByLabelText("Canale")).toBeInTheDocument();
    expect(
      screen.getByText("Pubblicazione digitale di convocazioni e ordini del giorno"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Sottoscrizione digitale di iniziative, istanze e petizioni"),
    ).toBeInTheDocument();
  });

  it("aggiorna il conteggio quando un filtro non contiene risultati", () => {
    renderProposteCiviche();

    fireEvent.change(screen.getByLabelText("Stato"), {
      target: { value: "discussa" },
    });

    expect(
      screen.getByText(new RegExp(`0 proposte visualizzate su ${PUBLIC_PROPOSALS.length}\\.`)),
    ).toBeInTheDocument();
  });

  it("distingue esplicitamente le proposte georeferenziate dalle citywide", () => {
    renderProposteCiviche();

    fireEvent.change(screen.getByLabelText("Localizzazione"), {
      target: { value: "citywide" },
    });

    expect(screen.getAllByText(/Intera città · non georeferenziata/i).length).toBeGreaterThan(0);
  });

  it("non include dati personali non necessari nei contenuti descrittivi", () => {
    const serialized = JSON.stringify(PUBLIC_PROPOSALS, (key, value) =>
      key === "sourceUrl" ? undefined : value,
    );

    expect(serialized).not.toMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    expect(serialized).not.toMatch(/\b\+?\d{2,4}[\s.-]?\d{5,}\b/);
    expect(serialized).not.toMatch(
      /\b[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]\b/i,
    );
  });
});
