import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Router as WouterRouter } from "wouter";

import { SectionScaffold } from "@/components/civic-section/SectionScaffold";

function renderAt(path: string) {
  window.history.pushState({}, "", path);

  return render(
    <WouterRouter>
      <SectionScaffold />
    </WouterRouter>,
  );
}

describe("SectionScaffold page-level implementation", () => {
  it("shows source, status and limits structure for a priority public route", () => {
    renderAt("/contratti");

    expect(screen.getByText("Struttura della pagina")).toBeInTheDocument();
    expect(screen.getByText("Dato letto")).toBeInTheDocument();
    expect(screen.getByText("Fonte, stato e limiti")).toBeInTheDocument();
    expect(screen.getByText("Ordine di lettura")).toBeInTheDocument();
    expect(screen.getByText("Filtri e cautele")).toBeInTheDocument();
    expect(screen.getAllByText(/CIG/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/fonte ANAC/i).length).toBeGreaterThan(0);
  });

  it("keeps demo route status visible in public rendering", () => {
    renderAt("/convocazioni/demo-consiglio-comunale-v0");

    expect(screen.getByText("Demo dichiarata")).toBeInTheDocument();
    expect(screen.getByText("Demo/prototipo")).toBeInTheDocument();
    expect(screen.getByText("Dati reali non pubblicati")).toBeInTheDocument();
  });
});
