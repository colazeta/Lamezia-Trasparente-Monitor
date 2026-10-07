import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { councilSessionV0ReviewedRecords } from "@/data/councilSessionV0Reviewed";
import { SessionAgenda } from "./SessionAgenda";

describe("SessionAgenda", () => {
  it("keeps every reviewed occurrence available and narrows search without losing the archive", () => {
    const { container } = render(
      <SessionAgenda sessions={councilSessionV0ReviewedRecords} />,
    );
    const count = councilSessionV0ReviewedRecords.length;
    expect(container.querySelectorAll("[data-session-id]")).toHaveLength(count);
    expect(
      screen.getByRole("heading", { name: "ottobre 2026" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "settembre 2026" }),
    ).toBeInTheDocument();
    fireEvent.change(
      screen.getByRole("textbox", { name: "Cerca nelle sedute" }),
      { target: { value: "2026/3190" } },
    );
    // A single official notice can convene multiple occurrences: retain both.
    expect(container.querySelectorAll("[data-session-id]")).toHaveLength(2);
    expect(
      screen.getByText("6 ottobre 2026 alle ore 11:00"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Azzera i filtri" }));
    expect(container.querySelectorAll("[data-session-id]")).toHaveLength(count);
  });

  it("opens documents on demand and preserves the existing detail route", () => {
    const session = councilSessionV0ReviewedRecords.find(
      (row) => row.id === "albo-2026-3190-commissione-iii-2026-10-06",
    )!;
    render(<SessionAgenda sessions={[session]} />);
    const button = screen.getByRole("button", {
      name: "Documenti e ordine del giorno",
    });
    expect(button).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("link", { name: "Apri la scheda completa" }),
    ).toHaveAttribute("href", `/convocazioni/${session.id}`);
    expect(
      screen.getByRole("link", { name: "Convocazione PDF" }),
    ).toHaveAttribute("href", session.provenance?.archivedDocumentUrl);
  });

  it("shows unknown dates explicitly and provides recovery from an empty search", () => {
    const fixture = councilSessionV0ReviewedRecords[0];
    const session = {
      ...fixture,
      scheduledAt: { ...fixture.scheduledAt, value: null },
    };
    render(<SessionAgenda sessions={[session]} />);
    expect(
      screen.getByRole("heading", { name: "Data da verificare" }),
    ).toBeInTheDocument();
    fireEvent.change(
      screen.getByRole("textbox", { name: "Cerca nelle sedute" }),
      { target: { value: "unmatched search text" } },
    );
    expect(
      screen.getByText("Nessuna seduta corrisponde ai filtri."),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Mostra tutte le sedute" }),
    );
    expect(
      screen.getByRole("heading", { name: "Data da verificare" }),
    ).toBeInTheDocument();
  });
});
