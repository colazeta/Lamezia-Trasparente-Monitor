import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
      "Cerca persone, organi, dataset o sezioni...",
    );
    fireEvent.change(input, { target: { value: "Paolo Mascaro" } });

    expect(
      screen.getByText("Ricerca nell'indice civico..."),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Paolo Mascaro")).toBeInTheDocument();
    });
    expect(screen.getByText("Dati e profili pubblici")).toBeInTheDocument();
    expect(
      screen.queryByText("Nessun risultato trovato."),
    ).not.toBeInTheDocument();
  });
});

