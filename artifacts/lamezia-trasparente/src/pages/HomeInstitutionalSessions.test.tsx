import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HomeInstitutionalSessions } from "@/pages/Home";

afterEach(() => vi.useRealTimers());

describe("HomeInstitutionalSessions", () => {
  it("limits the homepage to three recent sessions and keeps the complete archive reachable", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-07T04:30:00Z"));
    const { container } = render(<HomeInstitutionalSessions />);
    expect(
      screen.getByRole("heading", { name: "Ultime convocazioni" }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll("[data-session-id]")).toHaveLength(3);
    expect(
      screen.getByText("6 ottobre 2026 alle ore 11:00"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/13 agosto 2026/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Tutte le sedute/ }),
    ).toHaveAttribute("href", "/convocazioni");
    expect(
      screen.getByText(/nessuna data futura risulta nell'archivio acquisito/i),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("Stato della seduta non verificato"),
    ).toHaveLength(3);
    expect(screen.queryByText("Seduta svolta")).not.toBeInTheDocument();
  });

  it("links the newest occurrence to its existing public sheet", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-07T04:30:00Z"));
    render(<HomeInstitutionalSessions />);
    expect(
      screen.getByText("6 ottobre 2026 alle ore 11:00").closest("a"),
    ).toHaveAttribute(
      "href",
      "/convocazioni/albo-2026-3190-commissione-iii-2026-10-06",
    );
    expect(screen.getByText(/Fonte: Albo Pretorio/)).toBeInTheDocument();
  });
});
