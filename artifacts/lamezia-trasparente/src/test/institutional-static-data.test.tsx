import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@workspace/api-client-react", () => ({
  useListOrgani: () => ({
    data: "<!doctype html><html><body>SPA fallback</body></html>",
    isLoading: false,
  }),
  useListOfficials: () => ({
    data: "<!doctype html><html><body>SPA fallback</body></html>",
    isLoading: false,
  }),
}));

import { Amministratori } from "@/pages/Amministratori";
import { Organi } from "@/pages/Organi";
import {
  getStaticOfficial,
  getStaticOrgano,
  listStaticOfficials,
  listStaticOrgani,
} from "@/lib/institutionalStaticData";

describe("institutional static data fallback", () => {
  it("derives populated organi, historical memberships and profiles from the institutional seeds", () => {
    const organi = listStaticOrgani();
    const consiglio = getStaticOrgano("consiglio-comunale");
    const giunta = getStaticOrgano("giunta-comunale");
    const officials = listStaticOfficials();
    const firstProfile = getStaticOfficial(officials[0].id);

    expect(organi.length).toBeGreaterThanOrEqual(10);
    expect(consiglio?.memberCount).toBeGreaterThan(20);
    expect(consiglio?.historyCount).toBeGreaterThan(0);
    expect(giunta?.members.length).toBeGreaterThan(0);
    expect(officials.length).toBeGreaterThan(30);
    expect(firstProfile?.biography).toContain("Anagrafica minima");
    expect(firstProfile?.organi.length).toBeGreaterThan(0);
  });

  it("renders organi from static data when the public API route returns HTML", () => {
    render(<Organi />);

    expect(
      screen.getByRole("heading", { name: "Consiglio Comunale" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Giunta Comunale" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Commissioni Consiliari" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Nessun organo disponibile")).not.toBeInTheDocument();
  });

  it("renders officials from static data when the public API route returns HTML", () => {
    render(<Amministratori />);

    expect(screen.getByText("Mario Murone")).toBeInTheDocument();
    expect(screen.getByText("Paolo Mascaro")).toBeInTheDocument();
    expect(screen.queryByText("Nessun soggetto trovato")).not.toBeInTheDocument();
  });
});
