import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomeInstitutionalSessions } from "@/pages/Home";

describe("HomeInstitutionalSessions", () => {
  it("keeps previews bounded and the full archive reachable", () => {
    render(<HomeInstitutionalSessions />);
    const region = screen.getByRole("region", {
      name: "Segui Consiglio comunale e Commissioni",
    });
    const links = within(region).getAllByRole("link");
    const sheets = links.filter((link) =>
      link.getAttribute("href")?.startsWith("/convocazioni/"),
    );
    expect(sheets).toHaveLength(6);
    expect(
      screen.getByRole("link", { name: /Tutte le schede: Consiglio comunale/ }),
    ).toHaveAttribute("href", "/convocazioni");
    expect(
      screen.getByRole("link", {
        name: /Tutte le schede: Commissioni consiliari/,
      }),
    ).toHaveAttribute("href", "/convocazioni");
    expect(
      screen.getByText(/Consiglio comunale aperto su Scordovillo/).closest("a"),
    ).toHaveAttribute(
      "href",
      "/convocazioni/editorial-consiglio-aperto-scordovillo-2026-11",
    );
    expect(
      screen.getByText("9 ottobre 2026 alle ore 09:30"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("13 ottobre 2026 alle ore 09:00"),
    ).toBeInTheDocument();
    expect(screen.queryByText("10 agosto 2026")).not.toBeInTheDocument();
  });

  it("preserves uncertainty and source context in the shorter preview", () => {
    render(<HomeInstitutionalSessions />);
    expect(screen.getAllByText(/Data e ora da verificare/)).toHaveLength(4);
    expect(screen.getByText(/Seduta sospesa/)).toBeInTheDocument();
    expect(
      screen.getAllByText(/Stato della seduta non verificato/),
    ).toHaveLength(5);
    expect(
      screen.getAllByText(/non indicano una prossima seduta/),
    ).toHaveLength(2);
    expect(
      screen.getAllByText(/Albo Pretorio e copertura editoriale separata/),
    ).toHaveLength(2);
    expect(screen.getByText(/32 articoli · 1 video/)).toBeInTheDocument();
    expect(
      screen.getByText(/fonte istituzionale successiva lo conferma/),
    ).toBeInTheDocument();
  });
});
