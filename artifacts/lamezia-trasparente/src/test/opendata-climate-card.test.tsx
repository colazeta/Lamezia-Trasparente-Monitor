import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useListOpendataDatasets } from "@workspace/api-client-react";
import { Opendata } from "../pages/Opendata";
import { LAMEZIA_CLIMATE_LATEST_YEAR } from "../data/lameziaClimate";
import { LAMEZIA_AIR_TRAFFIC_LATEST_YEAR } from "../data/lameziaAirTraffic";
import { LAMEZIA_FOREIGN_RESIDENTS_LATEST_YEAR } from "../data/lameziaForeignResidents";

vi.mock("@workspace/api-client-react", () => ({
  useListOpendataDatasets: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
  useGetOpendataFeedStatus: vi.fn(() => ({
    data: {
      lastUpdatedAt: "2026-06-22T08:00:00Z",
      itemsTotal: 0,
      url: "https://opendata.comune.lamezia-terme.cz.it",
    },
  })),
}));

// This file tests the Open Data archive integration, not React Query itself.
// The canonical demographic panels have their own runtime data contract, so
// stub them here to keep this surface test independent from network/context.
vi.mock("@/components/demographics/PopulationHistoryPanel", () => ({
  PopulationHistoryPanel: () => (
    <section data-testid="population-history-panel">
      <h2>Lamezia nel tempo</h2>
      <p>Serie della popolazione residente con release versionate.</p>
    </section>
  ),
}));

vi.mock("@/components/demographics/ChangeDriversPanel", () => ({
  ChangeDriversPanel: () => (
    <section data-testid="change-drivers-panel">
      <h2>Perché cambia Lamezia</h2>
      <p>Saldo naturale e componenti migratorie del bilancio demografico.</p>
    </section>
  ),
}));

describe("OpenData climate territory card", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, "", "/opendata");
    vi.mocked(useListOpendataDatasets).mockReturnValue({
      data: [],
      isLoading: false,
    } as ReturnType<typeof useListOpendataDatasets>);
  });

  it("opens a shared demographic deep-link and preserves its theme on return", async () => {
    window.history.replaceState(
      {},
      "",
      "/opendata?tema=population-society&dataset=lamezia-demographic-trend",
    );

    render(<Opendata />);

    await screen.findByRole(
      "heading",
      { name: "Lamezia nel tempo" },
      { timeout: 5_000 },
    );

    expect(
      screen.getAllByRole("heading", {
        name: /Osservatorio demografico.*Lamezia Terme/i,
      }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("heading", { name: "Perché cambia Lamezia" }),
    ).toBeInTheDocument();
    expect(
      document.querySelectorAll("#trend-demografico-lamezia"),
    ).toHaveLength(1);
    expect(window.location.search).toContain(
      "dataset=lamezia-demographic-trend",
    );

    fireEvent.click(screen.getByRole("button", { name: /Torna ai dataset/i }));

    expect(
      screen.getByRole("heading", { name: "Dataset" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Popolazione e societa/i }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(window.location.search).toBe("?tema=population-society");
  });

  it("renders a simple thematic dataset archive before opening the climate detail", async () => {
    render(<Opendata />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Open Data" }),
    ).toBeInTheDocument();
    const libraryHeading = screen.getByRole("heading", {
      name: "Esplora i dati",
    });
    expect(libraryHeading).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Clima e territorio/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Mobilita e collegamenti/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Popolazione e societa/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Tutti i dataset/i }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByText("Clima").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Mobilita").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Popolazione").length).toBeGreaterThan(0);

    const archiveHeading = screen.getByRole("heading", { name: "Dataset" });
    expect(archiveHeading).toBeInTheDocument();
    expect(
      screen.getAllByText(/Anomalie climatiche.*Lamezia Terme/).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", {
        name: /Apri scheda dataset Anomalie climatiche/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /Apri scheda dataset Traffico aeroportuale mensile/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /Apri scheda dataset Osservatorio demografico/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /Apri scheda dataset Stranieri per sesso ed eta/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /Apri scheda dataset Famiglie per numero di figli/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("img", {
        name: /Grafico delle anomalie climatiche giornaliere/i,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("Anno del dataset climatico"),
    ).not.toBeInTheDocument();

    expect(
      Boolean(
        libraryHeading.compareDocumentPosition(archiveHeading) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    ).toBe(true);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Apri scheda dataset Anomalie climatiche/i,
      }),
    );

    await screen.findByLabelText(
      "Anno del dataset climatico",
      {},
      { timeout: 5_000 },
    );

    expect(
      screen.getByRole("button", { name: /Torna ai dataset/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Dataset" }),
    ).not.toBeInTheDocument();

    const climateHeadings = screen.getAllByRole("heading", {
      name: /Anomalie climatiche.*Lamezia Terme/,
    });
    const climateHeading = climateHeadings[climateHeadings.length - 1];
    expect(
      screen.getAllByText(/Temperatura media giornaliera rispetto alla normale/)
        .length,
    ).toBeGreaterThan(0);
    expect(screen.getByLabelText("Anno del dataset climatico")).toHaveValue(
      String(LAMEZIA_CLIMATE_LATEST_YEAR),
    );

    const climateSection = climateHeading.closest("section");
    expect(climateSection).not.toBeNull();
    const section = within(climateSection as HTMLElement);

    expect(
      section.getByRole("img", {
        name: /Grafico delle anomalie climatiche giornaliere/i,
      }),
    ).toBeInTheDocument();
    expect(
      section.getByText("Scarto dalla normale 1991-2020"),
    ).toBeInTheDocument();
    expect(section.getByText("Linea zero")).toBeInTheDocument();

    fireEvent.click(section.getByText("Dettagli del dataset"));

    expect(section.getByText("Ultimo giorno completo")).toBeInTheDocument();
    expect(section.getByText("Bilancio dell'anno")).toBeInTheDocument();
    expect(section.getByText("Quota sopra normale")).toBeInTheDocument();
    expect(section.getByText("Stress termico")).toBeInTheDocument();
    expect(
      section.getByText("Distribuzione delle anomalie"),
    ).toBeInTheDocument();
    expect(
      section.getAllByText(/ultimo giorno completo disponibile/i).length,
    ).toBeGreaterThan(0);
    expect(
      section.getByRole("link", { name: /Scarica JSON/i }),
    ).toHaveAttribute("href", expect.stringContaining("lameziaClimateDaily"));
    expect(
      section.getByRole("link", { name: /Scarica JSON/i }),
    ).toHaveAttribute("download");
    expect(
      section.getByText(/Aggiornamento giornaliero pianificato/i),
    ).toBeInTheDocument();
    expect(
      section.getByText("Fonte, metodo e limiti del dato"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Torna ai dataset/i }));
    expect(
      screen.getByRole("heading", { name: "Dataset" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Clima e territorio/i }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("keeps the static climate dataset visible when the remote catalog payload is unavailable", async () => {
    vi.mocked(useListOpendataDatasets).mockReturnValue({
      data: { error: "catalog unavailable in static preview" },
      isLoading: false,
    } as unknown as ReturnType<typeof useListOpendataDatasets>);

    render(<Opendata />);

    expect(
      screen.getAllByText(/Anomalie climatiche.*Lamezia Terme/).length,
    ).toBeGreaterThan(0);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Apri scheda dataset Anomalie climatiche/i,
      }),
    );
    fireEvent.click(await screen.findByText("Dettagli del dataset"));

    expect(screen.getByRole("link", { name: /Scarica JSON/i })).toHaveAttribute(
      "download",
    );
  });

  it("opens the monthly air traffic dataset detail from the OpenData archive", async () => {
    render(<Opendata />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Apri scheda dataset Traffico aeroportuale mensile/i,
      }),
    );

    await screen.findByLabelText("Anno del dataset sul traffico aeroportuale");

    expect(
      screen.getAllByRole("heading", {
        name: /Traffico aeroportuale mensile - Lamezia Terme/i,
      }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByLabelText("Anno del dataset sul traffico aeroportuale"),
    ).toHaveValue(String(LAMEZIA_AIR_TRAFFIC_LATEST_YEAR));
    expect(
      screen.getByRole("img", {
        name: /Grafico del traffico aeroportuale mensile/i,
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Dettagli del dataset"));
    expect(screen.getByText("Ultimo mese completo")).toBeInTheDocument();
    expect(screen.getByText("Passeggeri da gennaio")).toBeInTheDocument();
    expect(screen.getByText("Quota internazionale")).toBeInTheDocument();
    expect(screen.getByText("Mese piu trafficato")).toBeInTheDocument();
    expect(
      screen.getByText(/La fonte misura traffico aeroportuale mensile/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Scarica JSON/i })).toHaveAttribute(
      "download",
    );
  });

  it("opens the canonical demographic observatory from the OpenData archive", async () => {
    render(<Opendata />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Apri scheda dataset Osservatorio demografico/i,
      }),
    );

    await screen.findByRole(
      "heading",
      { name: "Lamezia nel tempo" },
      { timeout: 5_000 },
    );

    expect(
      screen.getAllByRole("heading", {
        name: /Osservatorio demografico.*Lamezia Terme/i,
      }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("heading", { name: "Perché cambia Lamezia" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("population-history-panel")).toBeInTheDocument();
    expect(screen.getByTestId("change-drivers-panel")).toBeInTheDocument();
    expect(
      screen.getByText(/non esiste più una copia statica separata/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Fonte canonica: ISTAT")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /API popolazione/i })).toHaveAttribute(
      "href",
      "/api/demographics/series/population-resident-jan1",
    );
    expect(screen.getByRole("link", { name: /API bilancio/i })).toHaveAttribute(
      "href",
      "/api/demographics/change-drivers?granularity=annual",
    );
    expect(
      screen.getByText(/precedente serie generata dal CSV del Portale OpenData comunale/i),
    ).toBeInTheDocument();
  });

  it("opens the municipal foreign residents age-sex dataset detail from the OpenData archive", async () => {
    render(<Opendata />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Apri scheda dataset Stranieri per sesso ed eta/i,
      }),
    );

    await screen.findByRole("img", {
      name: /Piramide per eta e sesso dei residenti stranieri/i,
    });

    expect(
      screen.getAllByRole("heading", {
        name: /Stranieri per sesso ed eta - Lamezia Terme/i,
      }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("img", {
        name: /Piramide per eta e sesso dei residenti stranieri/i,
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Dettagli del dataset"));
    expect(screen.getByText("Residenti stranieri")).toBeInTheDocument();
    expect(screen.getByText("Classe piu numerosa")).toBeInTheDocument();
    expect(screen.getByText("Eta 15-64")).toBeInTheDocument();
    expect(
      screen.getAllByText(String(LAMEZIA_FOREIGN_RESIDENTS_LATEST_YEAR)).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText(/Distribuzione aggregata per sesso e classi d'eta/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Scarica JSON/i })).toHaveAttribute(
      "download",
    );
  });

  it("opens the municipal families by children count dataset detail from the OpenData archive", async () => {
    render(<Opendata />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Apri scheda dataset Famiglie per numero di figli/i,
      }),
    );

    await screen.findByRole("img", {
      name: /Grafico delle famiglie per numero di figli/i,
    });

    expect(
      screen.getAllByRole("heading", {
        name: /Famiglie per numero di figli - Lamezia Terme/i,
      }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("img", {
        name: /Grafico delle famiglie per numero di figli/i,
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Dettagli del dataset"));
    expect(
      screen.getByText("Famiglie nella distribuzione"),
    ).toBeInTheDocument();
    expect(screen.getByText("Con 1 figlio")).toBeInTheDocument();
    expect(screen.getByText("Con 2 figli")).toBeInTheDocument();
    expect(screen.getByText("Con 3 o piu figli")).toBeInTheDocument();
    expect(
      screen.getByText(/non espone l'anno di riferimento/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Scarica JSON/i })).toHaveAttribute(
      "download",
    );
  });
});
