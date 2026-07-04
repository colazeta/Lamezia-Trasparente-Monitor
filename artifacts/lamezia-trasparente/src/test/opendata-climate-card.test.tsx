import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useListOpendataDatasets } from "@workspace/api-client-react";
import { Opendata } from "../pages/Opendata";
import { LAMEZIA_CLIMATE_LATEST_YEAR } from "../data/lameziaClimate";

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
    vi.mocked(useListOpendataDatasets).mockReturnValue({
      data: [],
      isLoading: false,
    } as ReturnType<typeof useListOpendataDatasets>);
  });

  it("renders the climate chart first and keeps catalog details on request", () => {
    render(<Opendata />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Opendata" }),
    ).toBeInTheDocument();

    const climateSection = screen
      .getByRole("heading", {
        name: /Anomalie climatiche.*Lamezia Terme/,
      })
      .closest("section");
    expect(climateSection).not.toBeNull();

    const section = within(climateSection as HTMLElement);
    expect(
      section.getByText(/Temperatura media giornaliera rispetto alla normale/),
    ).toBeInTheDocument();
    expect(section.getByLabelText("Anno del dataset climatico")).toHaveValue(
      String(LAMEZIA_CLIMATE_LATEST_YEAR),
    );
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

    fireEvent.click(screen.getByText("Catalogo e modelli dati"));

    expect(
      screen.getByRole("heading", { name: "Dataset con lettura visuale" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Prossimi dataset")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Apri scheda/i })).toHaveAttribute(
      "href",
      "#clima-territorio",
    );
    expect(
      screen.getByRole("heading", { name: "Tipi di dati disponibili" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Serie temporali giornaliere")).toBeInTheDocument();
    expect(screen.getByText("Dataset tabellari")).toBeInTheDocument();
    expect(screen.getByText("Layer territoriali")).toBeInTheDocument();
    expect(
      screen.getByText("Indicatori civici aggregati"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Apri dato/i })).toHaveAttribute(
      "href",
      "#clima-territorio",
    );
  });

  it("keeps the static climate dataset visible when the remote catalog payload is unavailable", () => {
    vi.mocked(useListOpendataDatasets).mockReturnValue({
      data: { error: "catalog unavailable in static preview" },
      isLoading: false,
    } as unknown as ReturnType<typeof useListOpendataDatasets>);

    render(<Opendata />);

    expect(
      screen.getByRole("heading", {
        name: /Anomalie climatiche.*Lamezia Terme/,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: /Grafico delle anomalie climatiche giornaliere/i,
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Dettagli del dataset"));

    expect(screen.getByRole("link", { name: /Scarica JSON/i })).toHaveAttribute(
      "download",
    );
  });
});
