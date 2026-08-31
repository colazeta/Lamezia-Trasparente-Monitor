import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomeInstitutionalSessions } from "@/pages/Home";

describe("HomeInstitutionalSessions", () => {
  it("presents council and commission work as a sourced civic path", () => {
    render(<HomeInstitutionalSessions />);

    expect(
      screen.getByRole("heading", {
        name: "Segui Consiglio comunale e Commissioni",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Consiglio comunale" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Commissioni consiliari" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Fonte successiva controllata"),
    ).toBeInTheDocument();
    expect(screen.getByText(/13 agosto 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/11 agosto 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/10 agosto 2026/i)).toBeInTheDocument();
    expect(
      screen.getAllByText(/stato della seduta non verificato/i),
    ).toHaveLength(3);
    expect(screen.getByText("Verifica mista")).toBeInTheDocument();
    expect(screen.getByText(/Data non disponibile/i)).toBeInTheDocument();
    expect(
      screen.getByText(/pubblicazioni 2026\/2788, 2026\/2648/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/7 articoli · 3 video · 7 stessa seduta/i),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/2 articoli · 2 sui temi in agenda/i),
    ).toHaveLength(2);
    expect(
      screen.getByText(/fonte istituzionale successiva lo conferma/i),
    ).toBeInTheDocument();
  });

  it("links each source-reviewed occurrence to its public session sheet", () => {
    render(<HomeInstitutionalSessions />);

    expect(screen.getByText(/13 agosto 2026/i).closest("a")).toHaveAttribute(
      "href",
      "/convocazioni/albo-2026-2673-consiglio-comunale",
    );
    expect(screen.getByText(/11 agosto 2026/i).closest("a")).toHaveAttribute(
      "href",
      "/convocazioni/albo-2026-2648-commissione-ii-2026-08-11",
    );
    expect(screen.getByText(/10 agosto 2026/i).closest("a")).toHaveAttribute(
      "href",
      "/convocazioni/albo-2026-2648-commissione-ii-2026-08-10",
    );
    expect(screen.getByText(/Data non disponibile/i).closest("a")).toHaveAttribute(
      "href",
      "/convocazioni/albo-2026-2788-commissione-vi-calendario",
    );
    expect(
      screen.getByRole("link", { name: /Apri l'archivio delle sedute/i }),
    ).toHaveAttribute("href", "/convocazioni");
  });
});
