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

  it("renders a simple thematic dataset archive before opening the climate detail", () => {
    render(<Opendata />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Opendata" }),
    ).toBeInTheDocument();
    const libraryHeading = screen.getByRole("heading", {
      name: "Categorie tematiche dei dati",
    });
    expect(libraryHeading).toBeInTheDocument();
    expect(screen.getAllByText("Clima e territorio").length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText("Contratti e spesa pubblica")).toBeInTheDocument();
    expect(screen.getByText("Amministrazione e atti")).toBeInTheDocument();
    expect(
      screen.getByText("Patrimonio e beni confiscati"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Partecipazione e accesso civico"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Tutti i dataset/i }),
    ).toHaveAttribute("aria-pressed", "true");

    const archiveHeading = screen.getByRole("heading", {
      name: "Archivio dataset",
    });
    expect(archiveHeading).toBeInTheDocument();
    expect(
      screen.getAllByText(/Anomalie climatiche.*Lamezia Terme/).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("Serie temporale giornaliera")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Apri dataset/i }),
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

    fireEvent.click(screen.getByRole("button", { name: /Apri dataset/i }));

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
      screen.getAllByText(
        /Temperatura media giornaliera rispetto alla normale/,
      ).length,
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
        name: "Nessun dataset pubblicato in questa categoria tematica",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        name: /Anomalie climatiche.*Lamezia Terme/,
      }),
    ).not.toBeInTheDocument();
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

    fireEvent.click(screen.getByRole("button", { name: /Apri dataset/i }));

    fireEvent.click(screen.getByText("Dettagli del dataset"));

    expect(screen.getByRole("link", { name: /Scarica JSON/i })).toHaveAttribute(
      "download",
    );
  });
});
