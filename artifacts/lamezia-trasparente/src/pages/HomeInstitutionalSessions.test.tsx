import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomeInstitutionalSessions } from "@/pages/Home";

describe("HomeInstitutionalSessions", () => {
  it("shows three archive examples and links to the complete archive", () => {
    render(<HomeInstitutionalSessions />);
    const region = screen.getByRole("region", {
      name: "Dall’archivio delle sedute",
    });
    expect(within(region).getAllByRole("listitem")).toHaveLength(3);
    expect(
      screen.getByRole("link", { name: "Vedi tutte le sedute" }),
    ).toHaveAttribute("href", "/convocazioni");
    expect(
      screen
        .getByText("9 ottobre 2026 alle ore 09:30", { exact: false })
        .closest("a"),
    ).toHaveAttribute(
      "href",
      "/convocazioni/albo-2026-3221-consiglio-comunale-2026-10-09",
    );
    expect(
      screen.getByText(/13 ottobre 2026 alle ore 09:00/),
    ).toBeInTheDocument();
  });
  it("keeps uncertainty beside the record without operational counts", () => {
    render(<HomeInstitutionalSessions />);
    expect(screen.getByText(/Data da verificare/)).toBeInTheDocument();
    expect(screen.getByText(/Seduta sospesa/)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Solo fonti editoriali; convocazione ufficiale non acquisita/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/non calendario delle prossime sedute/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/articoli ·/)).not.toBeInTheDocument();
  });
});
