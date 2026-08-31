import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OpenDataThemeLibrary } from "@/components/opendata/OpenDataThemeLibrary";
import { LAMEZIA_OPEN_DATA_SERIES_BY_ID } from "@/data/lameziaOpenDataSeriesStatus";

describe("Open Data discovery surface", () => {
  it("starts with the available themes and keeps freshness secondary", () => {
    render(
      <OpenDataThemeLibrary onSelectTheme={vi.fn()} selectedThemeId={null} />,
    );

    expect(
      screen.getByRole("heading", { name: "Esplora i dati" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /tutti i dataset: 5 dataset/i }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: /popolazione e societa: 3 dataset/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /clima e territorio: 1 dataset/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /mobilita e collegamenti: 1 dataset/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /contratti/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /atti/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /patrimonio/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /accesso/i }),
    ).not.toBeInTheDocument();

    expect(screen.getByText("5 serie monitorate")).toBeInTheDocument();
    expect(
      screen.getByText(/fonti controllate ogni giorno/i),
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
    expect(
      scope.getAllByRole("link", { name: "Fonte ufficiale" }),
    ).toHaveLength(5);
    expect(scope.getByText(/non un dato in tempo reale/i)).toBeInTheDocument();
  });
});
