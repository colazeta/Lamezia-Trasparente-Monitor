import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AtlanteTerritoriale } from "../pages/AtlanteTerritoriale";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Atlante territoriale", () => {
  it("renders an explicit demo fallback when the processed ISTAT file is missing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      }),
    );

    render(<AtlanteTerritoriale />);

    expect(
      screen.getByRole("heading", { name: "Atlante territoriale" }),
    ).toBeInTheDocument();
    expect(
      await screen.findAllByText(/Dato dimostrativo/i),
    ).not.toHaveLength(0);
    expect(
      screen.getByText(/non contiene sezioni censuarie reali/i),
    ).toBeInTheDocument();
    expect(screen.getByText("popolazione")).toBeInTheDocument();
    expect(screen.getAllByText("Indicatore in preparazione").length).toBeGreaterThan(0);
    expect(screen.getByText("Fonte istituzionale")).toBeInTheDocument();
    expect(screen.getByText("Layer Zornade resta un livello accessorio/non censuario", {
      exact: false,
    })).toBeInTheDocument();
  });
});
