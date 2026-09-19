import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HouseholdCompositionDatasetCard } from "@/components/opendata/HouseholdCompositionDatasetCard";
import { FamiliesChildrenDatasetCard } from "@/components/opendata/FamiliesChildrenDatasetCard";
import { validateHouseholdComposition } from "@/data/lameziaHouseholdComposition2023";
import { HOUSEHOLD_FIXTURE } from "./fixtures/householdComposition";
import { MUNICIPAL_FIXTURES } from "./fixtures/municipalDemographics";
const clients: QueryClient[] = [];
function view(child: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retryDelay: 0 } },
  });
  clients.push(client);
  render(<QueryClientProvider client={client}>{child}</QueryClientProvider>);
  return client;
}
const json = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json" },
  });
afterEach(() => {
  cleanup();
  clients.splice(0).forEach((c) => c.clear());
  vi.unstubAllGlobals();
});
describe("canonical ISTAT household consumers", () => {
  it("shows loading and unavailability without embedded counts, charts or zero substitutes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => json({}, 503)),
    );
    view(<HouseholdCompositionDatasetCard />);
    expect(
      screen.getByText(/Caricamento dei dati demografici/),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        /assenza di dati non indica un valore pari a zero/,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByText("27.591")).not.toBeInTheDocument();
  });
  it("pins downloads and marks cached data when refresh fails", async () => {
    const fetcher = vi.fn(async () => json(HOUSEHOLD_FIXTURE));
    vi.stubGlobal("fetch", fetcher);
    const client = view(<HouseholdCompositionDatasetCard />);
    const link = await screen.findByRole("link", { name: /Scarica JSON/ });
    expect(link.getAttribute("href")).toContain(
      `release=${HOUSEHOLD_FIXTURE.provenance.release_hash}&download=1`,
    );
    expect(screen.getByText("27.591")).toBeInTheDocument();
    fetcher.mockImplementation(async () => json({}, 503));
    void client.invalidateQueries({
      queryKey: ["canonical-istat-household-composition-2023"],
    });
    await waitFor(() =>
      expect(
        screen.getByText(/sono mostrati gli ultimi dati ricevuti/),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText("27.591")).toBeInTheDocument();
  });
  it("keeps municipal children counts available while the independent ISTAT benchmark is absent", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url) =>
        String(url).includes("municipal/families-children")
          ? json(MUNICIPAL_FIXTURES["families-children"])
          : json({}, 503),
      ),
    );
    view(<FamiliesChildrenDatasetCard />);
    await screen.findByRole("link", { name: /Scarica JSON/ });
    expect(
      await screen.findByText(/Benchmark ISTAT non disponibile/),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/27.591 famiglie totali/),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/figli.*componenti.*non sono la stessa variabile/),
    ).toBeInTheDocument();
  });
  it("rejects missing provenance, wrong census meaning and corrupted totals", () => {
    for (const change of [
      (x: any) => delete x.provenance,
      (x: any) =>
        (x.provenance.source_key = "lamezia.demographics.families-children"),
      (x: any) => (x.source.referenceDate = "2023-01-01"),
      (x: any) => (x.source.pageUrl = "javascript:alert(1)"),
      (x: any) => x.totalHouseholds++,
      (x: any) => (x.byComponents[0].sourceField = "PF4"),
    ]) {
      const data = structuredClone(HOUSEHOLD_FIXTURE);
      change(data);
      expect(() => validateHouseholdComposition(data)).toThrow();
    }
  });
});
