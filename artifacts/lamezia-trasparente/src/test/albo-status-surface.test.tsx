import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ALBO_OPERATIONAL_STATUS } from "@/data/alboStatus";
import { StatoMonitoraggio } from "@/pages/StatoMonitoraggio";
import { renderPage } from "./pages-harness";

describe("Albo Pretorio source status surface", () => {
  it("renders source, update, verification, counts, limits and official disclaimer", () => {
    renderPage(StatoMonitoraggio);

    const heading = screen.getByRole("heading", {
      name: /Albo Pretorio.*stato fonte/,
    });
    const section = heading.closest("section");

    expect(section).not.toBeNull();

    const panel = within(section as HTMLElement);

    expect(panel.getByText("Fonte")).toBeInTheDocument();
    expect(panel.getByText(ALBO_OPERATIONAL_STATUS.source)).toBeInTheDocument();
    expect(panel.getByText("Ultimo aggiornamento")).toBeInTheDocument();
    expect(panel.getByText("Verifica")).toBeInTheDocument();
    expect(panel.getByText("Fonte ufficiale acquisita")).toBeInTheDocument();
    expect(
      panel.getByRole("link", { name: /Fonte ufficiale/i }),
    ).toHaveAttribute("href", ALBO_OPERATIONAL_STATUS.source_url);

    for (const label of [
      "Acquisiti",
      "Nuovi",
      "Modificati",
      "Rimossi",
      "Pubblicabili",
      "Minimizzati",
      "Solo metadato",
      "Esclusi",
    ]) {
      expect(panel.getByText(label)).toBeInTheDocument();
    }

    for (const limit of ALBO_OPERATIONAL_STATUS.known_limits) {
      expect(panel.getByText(limit)).toBeInTheDocument();
    }

    expect(
      panel.getByText(/non sostituisce l'Albo Pretorio ufficiale/i),
    ).toBeInTheDocument();
  });

  it("shows complete Open Data coverage, status reasons and evidence history", () => {
    renderPage(StatoMonitoraggio);

    const coverageHeading = screen.getByRole("heading", {
      name: "Copertura del catalogo Open Data",
    });
    const coverage = coverageHeading.closest("section");
    expect(coverage).not.toBeNull();

    const panel = within(coverage as HTMLElement);
    expect(panel.getByText(/5 dei 5 dataset pubblicati/i)).toBeInTheDocument();
    expect(panel.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100",
    );

    expect(
      screen.getAllByText(/cadenza tecnica|manifest versionato/i).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Cronologia evidenze \(/i).length,
    ).toBeGreaterThan(0);
  });
});
