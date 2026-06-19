import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";

import { TrameFestival } from "@/pages/TrameFestival";
import { renderPage } from "./pages-harness";

describe("TrameFestival page", () => {
  it("renders the methodological empty state without raw archive content", () => {
    renderPage(TrameFestival);

    expect(
      screen.getByRole("heading", { name: "Trame - Festival" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Nessuna scheda pubblica approvata"),
    ).toBeInTheDocument();
    expect(screen.getByText("Metodo pubblico")).toBeInTheDocument();
    expect(screen.queryByText("Archivio completo")).not.toBeInTheDocument();
    expect(screen.queryByText("# Transcript")).not.toBeInTheDocument();
  });
});
