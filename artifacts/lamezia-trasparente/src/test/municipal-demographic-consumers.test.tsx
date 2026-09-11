import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FamiliesChildrenDatasetCard } from "@/components/opendata/FamiliesChildrenDatasetCard";
import { ForeignResidentsDatasetCard } from "@/components/opendata/ForeignResidentsDatasetCard";
import { validateMunicipalSnapshot } from "@/data/municipalDemographics";
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
  clients.splice(0).forEach((client) => client.clear());
  vi.unstubAllGlobals();
});
describe("canonical demographic consumers", () => {
  it("retains deep links without loading embedded counts or charts", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})),
    );
    view(<FamiliesChildrenDatasetCard />);
    expect(document.getElementById("famiglie-figli-lamezia")).not.toBeNull();
    expect(
      screen.getByText(/Caricamento dal database canonico/),
    ).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Scarica JSON/ }),
    ).not.toBeInTheDocument();
  });
  it("does not resurrect embedded data on failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => json({ error: "CANONICAL_DATA_UNAVAILABLE" }, 503)),
    );
    view(<ForeignResidentsDatasetCard />);
    expect(
      await screen.findByText(
        /assenza di dati non indica un valore pari a zero/,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Riprova" })).toBeInTheDocument();
  });
  it("pins downloads to the validated release displayed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => json(MUNICIPAL_FIXTURES["families-children"])),
    );
    view(<FamiliesChildrenDatasetCard />);
    const link = await screen.findByRole("link", { name: /Scarica JSON/ });
    expect(link.getAttribute("href")).toContain(
      `/api/demographics/municipal/families-children?release=${"a".repeat(64)}&download=1`,
    );
    expect(
      screen.getAllByText(/non espone l'anno di riferimento/).length,
    ).toBeGreaterThan(0);
  });
  it("labels an old canonical response after failed refresh", async () => {
    const fetcher = vi.fn(async () =>
      json(MUNICIPAL_FIXTURES["foreign-age-sex"]),
    );
    vi.stubGlobal("fetch", fetcher);
    const client = view(<ForeignResidentsDatasetCard />);
    await screen.findByRole("link", { name: /Scarica JSON/ });
    fetcher.mockImplementation(async () => json({}, 503));
    void client.invalidateQueries({
      queryKey: ["canonical-municipal-demographics", "foreign-age-sex"],
    });
    await waitFor(() =>
      expect(
        screen.getByText(/ultima risposta canonica ricevuta/),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("link", { name: /Scarica JSON/ }).getAttribute("href"),
    ).toContain("release=" + "a".repeat(64));
  });
  it("rejects wrong series, lost provenance and unsafe URLs", () => {
    for (const mutate of [
      (x: any) => {
        x.provenance.series_key = "population-resident-jan1";
      },
      (x: any) => {
        delete x.provenance;
      },
      (x: any) => {
        x.provenance.canonical_observations = 99;
      },
      (x: any) => {
        x.metadata.source_csv_url = "javascript:alert(1)";
      },
      (x: any) => {
        x.provenance.reference_period_unspecified = false;
      },
    ]) {
      const data = structuredClone(MUNICIPAL_FIXTURES["families-children"]);
      mutate(data);
      expect(() =>
        validateMunicipalSnapshot(data, "families-children"),
      ).toThrow();
    }
  });
});
