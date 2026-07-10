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

describe("OpenData climate territory card", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, "", "/opendata");
    vi.mocked(useListOpendataDatasets).mockReturnValue({
      data: [],
      isLoading: false,
    } as ReturnType<typeof useListOpendataDatasets>);
  });

  it("opens a shared dataset deep-link and preserves its theme on return", () => {
    window.history.replaceState(
      {},
      "",
      "/opendata?tema=population-society&dataset=lamezia-demographic-trend",
    );

    render(<Opendata />);

    expect(
      screen.getAllByRole("heading", {
        name: /Trend demografico - Lamezia Terme/i,
      }).length,
    ).toBeGreaterThan(0);
    expect(
      document.querySelectorAll("#trend-demografico-lamezia"),
    ).toHaveLength(1);
    expect(window.location.search).toContain(
      "dataset=lamezia-demographic-trend",
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Torna all'archivio dataset/i }),
    );

    expect(
      screen.getByRole("heading", { name: "Archivio dataset" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Popolazione e societa/i }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(window.location.search).toBe("?tema=population-society");
  });

  it("renders a simple thematic dataset archive before opening the climate detail", () => {
    render(<Opendata />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Opendata" }),
    ).toBeInTheDocument();
    const libraryHeading = screen.getByRole("heading", {
      name: "Scegli categoria",
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
      screen.getByRole("button", { name: /Contratti e spesa pubblica/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Amministrazione e atti/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Patrimonio e beni confiscati/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Partecipazione e accesso civico/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Tutti i dataset/i }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByText("Clima").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Mobilita").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Popolazione").length).toBeGreaterThan(0);
    expect(screen.getByText("Contratti")).toBeInTheDocument();
    expect(screen.getByText("Atti")).toBeInTheDocument();
    expect(screen.getByText("Patrimonio")).toBeInTheDocument();
    expect(screen.getByText("Accesso")).toBeInTheDocument();

    const archiveHeading = screen.getByRole("heading", {
      name: "Archivio dataset",
    });
    expect(archiveHeading).toBeInTheDocument();
    expect(
      screen.getAllByText(/Anomalie climatiche.*Lamezia Terme/).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("Serie temporale giornaliera")).toBeInTheDocument();
    expect(screen.getByText("Serie temporale mensile")).toBeInTheDocument();
    expect(screen.getByText("Serie temporale annuale")).toBeInTheDocument();
    expect(
      screen.getByText("Distribuzione per classi d'eta"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Distribuzione familiare aggregata"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Disponibile").length).toBeGreaterThan(0);
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
        name: /Apri scheda dataset Trend demografico/i,
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

    expect(
      screen.getByRole("button", { name: /Torna all'archivio dataset/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Archivio dataset" }),
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

    fireEvent.click(
      screen.getByRole("button", { name: /Torna all'archivio dataset/i }),
    );
    expect(
      screen.getByRole("heading", { name: "Archivio dataset" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("img", {
        name: /Grafico delle anomalie climatiche giornaliere/i,
      }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /Contratti e spesa pubblica/i }),
    );
    expect(
      screen.getByRole("heading", {
        name: "Nessun dataset pubblicato",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Mostra dataset disponibili" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        name: /Anomalie climatiche.*Lamezia Terme/,
      }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Mostra dataset disponibili" }),
    );
    expect(
      screen.getByRole("button", {
        name: /Apri scheda dataset Anomalie climatiche/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Tutti i dataset/i }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("keeps the static climate dataset visible when the remote catalog payload is unavailable", () => {
    vi.mocked(useListOpendataDatasets).mockReturnValue({
      data: { error: "catalog unavailable in static preview" },
      isLoading: false,
    } as unknown as ReturnType<typeof useListOpendataDatasets>);

    render(<Opendata />);

    expect(
      screen.getAllByText(/Anomalie climatiche.*Lamezia Terme/).length,
    ).toBeGreaterThan(0);
    expect(
      screen.queryByRole("img", {
        name: /Grafico delle anomalie climatiche giornaliere/i,
      }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: /Apri scheda dataset Anomalie climatiche/i,
      }),
    );

    fireEvent.click(screen.getByText("Dettagli del dataset"));

    expect(screen.getByRole("link", { name: /Scarica JSON/i })).toHaveAttribute(
      "download",
    );
  });

  it("opens the monthly air traffic dataset detail from the OpenData archive", () => {
    render(<Opendata />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Apri scheda dataset Traffico aeroportuale mensile/i,
      }),
    );

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
      "href",
      expect.stringContaining("lameziaAirTrafficMonthly"),
    );
    expect(screen.getByRole("link", { name: /Scarica JSON/i })).toHaveAttribute(
      "download",
    );
  });

  it("opens the municipal demographic trend dataset detail from the OpenData archive", () => {
    render(<Opendata />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Apri scheda dataset Trend demografico/i,
      }),
    );

    expect(
      screen.getAllByRole("heading", {
        name: /Trend demografico - Lamezia Terme/i,
      }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("img", {
        name: /Grafico del trend demografico di Lamezia Terme/i,
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Dettagli del dataset"));

    expect(screen.getByText("Popolazione residente")).toBeInTheDocument();
    expect(screen.getByText("Saldo sulla serie")).toBeInTheDocument();
    expect(screen.getByText("Scarto dal massimo")).toBeInTheDocument();
    expect(screen.getByText("Variazione ultimo anno")).toBeInTheDocument();
    expect(
      screen.getByText(/Serie aggregata pubblicata dal portale comunale/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Scarica JSON/i })).toHaveAttribute(
      "href",
      expect.stringContaining("lameziaDemographicTrend"),
    );
    expect(screen.getByRole("link", { name: /CSV sorgente/i })).toHaveAttribute(
      "href",
      expect.stringContaining("trend-demografico.csv"),
    );
  });

  it("opens the municipal foreign residents age-sex dataset detail from the OpenData archive", () => {
    render(<Opendata />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Apri scheda dataset Stranieri per sesso ed eta/i,
      }),
    );

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
      "href",
      expect.stringContaining("lameziaForeignResidentsAgeSex"),
    );
    expect(screen.getByRole("link", { name: /CSV sorgente/i })).toHaveAttribute(
      "href",
      expect.stringContaining("stranieri-per-sesso-ed-eta.csv"),
    );
  });

  it("opens the municipal families by children count dataset detail from the OpenData archive", () => {
    render(<Opendata />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Apri scheda dataset Famiglie per numero di figli/i,
      }),
    );

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
      "href",
      expect.stringContaining("lameziaFamiliesChildren"),
    );
    expect(screen.getByRole("link", { name: /CSV sorgente/i })).toHaveAttribute(
      "href",
      expect.stringContaining("famiglie-per-numero-figli.csv"),
    );
  });
});

