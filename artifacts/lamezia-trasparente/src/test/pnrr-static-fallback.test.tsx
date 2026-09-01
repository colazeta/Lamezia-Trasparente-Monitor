import { fireEvent, render, screen } from "@testing-library/react";
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

import {
  LAMEZIA_PNRR_STATIC_DATA,
  LAMEZIA_PNRR_STATIC_VIEW,
} from "@/data/lameziaPnrr";
import { OpenCupProjectDetails, Pnrr } from "@/pages/Pnrr";

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
    const dossierToggles = screen.getAllByTestId(/^pnrr-dossier-toggle-/);
    expect(dossierToggles).toHaveLength(
      LAMEZIA_PNRR_STATIC_DATA.coverage.projects,
    );
    const firstDossier = dossierToggles[0].closest("details");
    expect(firstDossier).not.toHaveAttribute("open");
    fireEvent.click(dossierToggles[0]);
    expect(firstDossier).toHaveAttribute("open");
    expect(screen.getAllByText("Dossier completo del progetto")).toHaveLength(
      LAMEZIA_PNRR_STATIC_DATA.coverage.projects,
    );
    expect(
      screen.getAllByText(/non rappresenta lo stato di avanzamento/i).length,
    ).toBeGreaterThan(0);
  });

  it("discloses pending and retained OpenCUP acquisition states", () => {
    const source = LAMEZIA_PNRR_STATIC_VIEW.projects[0];
    const observedAt = "2026-09-01T06:00:00.000Z";
    const { rerender } = render(
      <OpenCupProjectDetails
        project={{
          ...source,
          openCup: null,
          openCupAcquisition: {
            status: "pending",
            acquired_at: null,
            status_observed_at: observedAt,
            fallback_used: false,
          },
        }}
      />,
    );

    expect(
      screen.getByText("OpenCUP in acquisizione automatica"),
    ).toBeInTheDocument();
    expect(screen.getByText(/ritenterà automaticamente/i)).toBeInTheDocument();

    rerender(
      <OpenCupProjectDetails
        project={{
          ...source,
          openCupAcquisition: {
            status: "stale",
            acquired_at: "2026-08-31T12:00:00.000Z",
            status_observed_at: observedAt,
            fallback_used: true,
          },
        }}
      />,
    );

    expect(screen.getByText(/ultimo corredo valido/i)).toBeInTheDocument();
    expect(
      screen.getByText("Acquisizione del corredo OpenCUP"),
    ).toBeInTheDocument();
  });
});
