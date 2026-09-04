import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CensusSectionsDataView } from "@/components/atlas/CensusSectionsDataView";
import {
  ATLANTE_INDICATORS,
  type AtlanteFeature,
} from "@/data/atlanteTerritoriale";

const populationIndicator = ATLANTE_INDICATORS.find(
  (indicator) => indicator.id === "popolazione-residente",
)!;

const features: AtlanteFeature[] = [
  {
    type: "Feature",
    properties: {
      sezione_censimento_id: "0791600000198",
      area_territoriale: "Nicastro centro",
      matched_istat_2023_variables: true,
      indicators_istat_2023: { p1: 0, popolazione_totale: 0 },
    },
    geometry: null,
  },
  {
    type: "Feature",
    properties: {
      sezione_censimento_id: "0791600000199",
      matched_istat_2023_variables: true,
      indicators_istat_2023: { p1: 10, popolazione_totale: 10 },
    },
    geometry: null,
  },
  {
    type: "Feature",
    properties: {
      sezione_censimento_id: "0791600000204",
      matched_istat_2023_variables: false,
      indicators_istat_2023: { p1: null, popolazione_totale: null },
    },
    geometry: null,
  },
];

describe("Atlante census city summary", () => {
  it("shows population total, coverage, zero count and distribution shares without turning null into zero", () => {
    render(
      <CensusSectionsDataView
        activeIndicator={populationIndicator}
        availableIndicators={[populationIndicator]}
        features={features}
        onIndicatorSelect={vi.fn()}
        onSectionSelect={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Consulta i dati senza mappa"));

    const summary = screen.getByRole("region", { name: "Sintesi città" });
    expect(summary).toBeInTheDocument();
    expect(within(summary).getByText("Sezioni totali").parentElement).toHaveTextContent("3");
    expect(within(summary).getByText("Con dato").parentElement).toHaveTextContent("2");
    expect(within(summary).getByText("Senza dato").parentElement).toHaveTextContent("1");
    expect(within(summary).getByText("Valore zero").parentElement).toHaveTextContent("1");
    expect(
      within(summary).getByText("Totale popolazione nelle sezioni con dato").parentElement,
    ).toHaveTextContent("10 persone");
    expect(within(summary).getByText(/I valori mancanti non vengono trattati come zero/i)).toBeInTheDocument();

    fireEvent.click(
      within(summary).getByText("Distribuzione delle sezioni con dato"),
    );
    expect(within(summary).getAllByText(/1 sezione · 50%/u)).toHaveLength(2);
    expect(
      within(summary).getByText(/denominatore soltanto le sezioni con dato/i),
    ).toBeInTheDocument();
    expect(
      within(summary).getByText(/lo zero resta un valore osservato/i),
    ).toBeInTheDocument();
  });
});
