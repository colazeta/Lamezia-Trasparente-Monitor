import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CommandPalette } from "@/components/search/CommandPalette";

describe("CommandPalette civic search", () => {
  it("loads real civic records on demand after two query characters", async () => {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });
    render(<CommandPalette onOpenChange={vi.fn()} open />);

    const input = screen.getByPlaceholderText(
      "Cerca un tema, una seduta, una persona...",
    );
    fireEvent.change(input, { target: { value: "Paolo Mascaro" } });

    expect(
      screen.getByText("Ricerca nell'indice civico..."),
    ).toBeInTheDocument();

    expect(
      await screen.findByText("Paolo Mascaro", {}, { timeout: 5_000 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Sedute, dati e profili pubblici"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Nessun risultato trovato."),
    ).not.toBeInTheDocument();
  });
  it("finds the published Scordovillo session and offers archives for a miss", async () => {
    render(<CommandPalette onOpenChange={vi.fn()} open />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "Scordovillo" } });
    expect(
      await screen.findByText(/Consiglio comunale aperto su Scordovillo/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Contesto da fonti editoriali/),
    ).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "zzzzinesistente" } });
    expect(
      await screen.findByText(/Nessuna corrispondenza nell’indice/),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Consulta tutte le sedute e gli ordini del giorno"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Cerca un atto nell’Albo civico"),
    ).toBeInTheDocument();
  });
});
