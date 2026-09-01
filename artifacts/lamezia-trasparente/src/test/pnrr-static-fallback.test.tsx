import { render, screen } from "@testing-library/react";
import { Router } from "wouter";
import { describe, expect, it, vi } from "vitest";

vi.mock("@workspace/api-client-react", () => ({
  useListPnrrProjects: () => ({
    data: undefined,
    isLoading: false,
    isError: true,
  }),
}));

vi.mock("@/components/MonitoringReportsSection", () => ({
  MonitoringReportsSection: () => null,
}));

import { LAMEZIA_PNRR_STATIC_DATA } from "@/data/lameziaPnrr";
import { Pnrr } from "@/pages/Pnrr";

describe("PNRR page static feed", () => {
  it("keeps municipal project sheets visible when the runtime API fails", () => {
    render(
      <Router>
        <Pnrr />
      </Router>,
    );

    expect(screen.getByText("Feed comunale disponibile")).toBeInTheDocument();
    expect(
      screen.getByText(
        new RegExp(
          `${LAMEZIA_PNRR_STATIC_DATA.coverage.projects} progetti visualizzati`,
        ),
      ),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(LAMEZIA_PNRR_STATIC_DATA.projects[0].title).length,
    ).toBeGreaterThan(0);
    expect(
      screen.queryByText(/Il servizio dati PNRR non risponde/i),
    ).not.toBeInTheDocument();
    expect(
      screen.getAllByText("Archivio documentale ufficiale").length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("Come leggere i codici")).toBeInTheDocument();
    expect(screen.getAllByText("Anagrafica ufficiale OpenCUP").length).toBe(
      LAMEZIA_PNRR_STATIC_DATA.coverage.projects_with_opencup,
    );
    expect(screen.getAllByText(/CUP · ID progetto/i).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/non rappresenta lo stato di avanzamento/i).length,
    ).toBeGreaterThan(0);
  });
});
