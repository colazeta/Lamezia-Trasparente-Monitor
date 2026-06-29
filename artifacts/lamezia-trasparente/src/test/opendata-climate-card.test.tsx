import { render, screen, within } from "@testing-library/react";
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

  it("renders the dataset-first climate card inside OpenData", () => {
    render(<Opendata />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Opendata" }),
    ).toBeInTheDocument();

    const climateSection = screen
      .getByRole("heading", { name: "Clima e territorio" })
      .closest("section");
    expect(climateSection).not.toBeNull();

    const section = within(climateSection as HTMLElement);
    expect(
      section.getByRole("heading", {
        name: "Anomalie climatiche · Lamezia Terme",
      }),
    ).toBeInTheDocument();
    expect(
      section.getByText(
        "Temperatura media giornaliera rispetto alla normale 1991–2020",
      ),
    ).toBeInTheDocument();
    expect(section.getByLabelText("Anno del dataset climatico")).toHaveValue(
      String(LAMEZIA_CLIMATE_LATEST_YEAR),
    );
    expect(
      section.getByRole("img", {
        name: /Grafico delle anomalie climatiche giornaliere/i,
      }),
    ).toBeInTheDocument();
    expect(section.getByText("Bilancio anomalie")).toBeInTheDocument();
    expect(section.getByText("Giorni sopra la normale")).toBeInTheDocument();
    expect(section.getByText("Picco caldo")).toBeInTheDocument();
    expect(section.getByText("Picco fresco")).toBeInTheDocument();
    expect(
      section.getByText("Scarto dalla normale 1991-2020"),
    ).toBeInTheDocument();
    expect(section.getByText("Linea zero")).toBeInTheDocument();
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
    expect(section.getByText("Metodologia")).toBeInTheDocument();
    expect(section.getByText("Limiti del dato")).toBeInTheDocument();
    expect(section.getByText("Riuso civico")).toBeInTheDocument();
  });

  it("keeps the static climate dataset visible when the remote catalog payload is unavailable", () => {
    vi.mocked(useListOpendataDatasets).mockReturnValue({
      data: { error: "catalog unavailable in static preview" },
      isLoading: false,
    } as unknown as ReturnType<typeof useListOpendataDatasets>);

    render(<Opendata />);

    expect(
      screen.getByRole("heading", { name: "Clima e territorio" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Anomalie climatiche · Lamezia Terme",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Scarica JSON/i })).toHaveAttribute(
      "download",
    );
  });
});
