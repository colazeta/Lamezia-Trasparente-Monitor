import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Router as WouterRouter } from "wouter";

import { HomeCivicSystemMap } from "@/components/civic-section/HomeCivicSystemMap";

describe("HomeCivicSystemMap", () => {
  it("explains the home page as a civic monitoring system", () => {
    render(
      <WouterRouter>
        <HomeCivicSystemMap />
      </WouterRouter>,
    );

    expect(screen.getByTestId("home-civic-system-map")).toBeInTheDocument();
    expect(screen.getByText("Cosa puoi controllare")).toBeInTheDocument();
    expect(screen.getByText("Dati parziali")).toBeInTheDocument();
    expect(screen.getByText("Fonti mancanti")).toBeInTheDocument();
    expect(screen.getByText("Sezioni dimostrative")).toBeInTheDocument();
    expect(screen.getByText("Pronte per ingestion automatica")).toBeInTheDocument();
    expect(screen.getByText("Cosa puo fare un cittadino")).toBeInTheDocument();
    expect(screen.getByText("Fonti dati")).toBeInTheDocument();
  });
});
