import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OpenDataThemeLibrary } from "@/components/opendata/OpenDataThemeLibrary";
import { buildOpenDataCatalogStatistics } from "@/data/openDataDatasetRegistry";
import { LAMEZIA_OPEN_DATA_SERIES_BY_ID } from "@/data/lameziaOpenDataSeriesStatus";

const catalogStats = buildOpenDataCatalogStatistics(
  new Date("2026-09-03T00:00:00.000Z"),
);

function themeCount(id: string) {
  return catalogStats.byTheme.find((theme) => theme.id === id)?.count ?? 0;
}

describe("Open Data discovery surface", () => {
  it("starts with the available themes and keeps freshness secondary", () => {
    render(
      <OpenDataThemeLibrary onSelectTheme={vi.fn()} selectedThemeId={null} />,
    );

    expect(
      screen.getByRole("heading", { name: "Esplora i dati" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: new RegExp(
          `tutti i dataset: ${catalogStats.totalDatasets} dataset`,
          "i",
        ),
      }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", {
        name: new RegExp(
          `popolazione e societa: ${themeCount("population-society")} dataset`,
          "i",
        ),
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: new RegExp(
          `clima e territorio: ${themeCount("climate-territory")} dataset`,
          "i",
        ),
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: new RegExp(
          `mobilita e collegamenti: ${themeCount("mobility-connections")} dataset`,
          "i",
        ),
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: new RegExp(
          `investimenti e PNRR: ${themeCount("investments-pnrr")} dataset`,
          "i",
        ),
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: new RegExp(
          `patrimonio e beni confiscati: ${themeCount("assets-confiscated-property")} dataset`,
          "i",
        ),
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /contratti/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /atti/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /accesso/i }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByText(
        new RegExp(
          `${catalogStats.documentedStatusDatasets}\/${catalogStats.totalDatasets} con stato documentato`,
          "i",
        ),
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        new RegExp(`${catalogStats.automatedDatasets} aggiornati automaticamente`, "i"),
      ),
    ).toBeInTheDocument();
    const disclosure = screen
      .getByText("Aggiornamento e fonti")
      .closest("details");
    expect(disclosure).not.toBeNull();
    expect(disclosure).not.toHaveAttribute("open");
  });

  it("reveals source freshness only when requested", () => {
    render(
      <OpenDataThemeLibrary onSelectTheme={vi.fn()} selectedThemeId={null} />,
    );

    const summary = screen.getByText("Aggiornamento e fonti");
    fireEvent.click(summary);

    const details = summary.closest("details");
    expect(details).not.toBeNull();
    expect(details).toHaveAttribute("open");
    const scope = within(details as HTMLElement);

    expect(
      scope.getByText(
        `Ultimo dato: ${
          LAMEZIA_OPEN_DATA_SERIES_BY_ID.get("lamezia-climate-daily")
            ?.latest_observation_label ?? "Dato non disponibile"
        }`,
      ),
    ).toBeInTheDocument();
    const airTraffic = LAMEZIA_OPEN_DATA_SERIES_BY_ID.get(
      "lamezia-air-traffic-monthly",
    );
    expect(airTraffic).toBeDefined();
    expect(
      scope.getByText(`Ultimo dato: ${airTraffic!.latest_observation_label}`),
    ).toBeInTheDocument();
    expect(
      scope.getByText("Ultimo dato: Risorsa corrente"),
    ).toBeInTheDocument();
    expect(scope.getByText("Ultimo dato: 2023")).toBeInTheDocument();
    expect(
      scope.getByText(/Rilascio ISTAT · Materializzazione verificata/i),
    ).toBeInTheDocument();
    expect(
      scope.getAllByRole("link", { name: "Fonte ufficiale" }),
    ).toHaveLength(catalogStats.documentedStatusDatasets);
    expect(scope.getByText(/non un dato in tempo reale/i)).toBeInTheDocument();
  });
});
