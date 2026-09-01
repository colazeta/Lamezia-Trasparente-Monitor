import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AirTrafficDatasetCard } from "../components/opendata/AirTrafficDatasetCard";
import { LAMEZIA_AIR_TRAFFIC_LATEST_YEAR } from "../data/lameziaAirTraffic";

describe("AirTrafficDatasetCard year-over-year comparison", () => {
  it("shows only comparable previous-year months for the partial latest year", () => {
    render(<AirTrafficDatasetCard />);

    const chart = screen.getByRole("img", {
      name: /Grafico del traffico aeroportuale mensile/i,
    });
    const previousYear = LAMEZIA_AIR_TRAFFIC_LATEST_YEAR - 1;

    expect(screen.getByText(`Totale ${previousYear}`)).toBeInTheDocument();
    expect(
      within(chart).getByText(
        `barre ${LAMEZIA_AIR_TRAFFIC_LATEST_YEAR} · linea ${previousYear}`,
      ),
    ).toBeInTheDocument();
    expect(chart.querySelectorAll("circle")).toHaveLength(7);
    expect(
      within(chart).getByRole("group", {
        name: /luglio 2026: 426\.310 passeggeri; 349\.618 nello stesso mese dell'anno precedente; variazione \+21,9%/i,
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Dettagli del dataset"));
    expect(
      screen.getByText(/luglio 2026 · \+21,9% sullo stesso mese del 2025/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/sullo stesso periodo del 2025/i)).toHaveLength(
      3,
    );
  });

  it("handles the first year without drawing an artificial comparison", () => {
    render(<AirTrafficDatasetCard />);

    fireEvent.change(
      screen.getByLabelText("Anno del dataset sul traffico aeroportuale"),
      { target: { value: "2000" } },
    );

    const chart = screen.getByRole("img", {
      name: /Grafico del traffico aeroportuale mensile/i,
    });
    expect(within(chart).getByText("barre 2000")).toBeInTheDocument();
    expect(chart.querySelectorAll("circle")).toHaveLength(0);
    expect(
      screen.getByText("Confronto con 1999 non disponibile"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Totale 1999")).not.toBeInTheDocument();
  });
});
