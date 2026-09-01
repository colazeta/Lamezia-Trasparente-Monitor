import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
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
import { buildPnrrEvidenceTimeline } from "@/lib/pnrrEvidenceTimeline";
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
    expect(screen.getAllByTestId(/^pnrr-declared-status-/)).toHaveLength(
      LAMEZIA_PNRR_STATIC_DATA.coverage.projects,
    );
    expect(
      screen.getAllByRole("link", {
        name: /Apri la scheda stabile del CUP/i,
      }),
    ).toHaveLength(LAMEZIA_PNRR_STATIC_DATA.coverage.projects);
    const dossierToggles = screen.getAllByTestId(/^pnrr-dossier-toggle-/);
    expect(dossierToggles).toHaveLength(
      LAMEZIA_PNRR_STATIC_DATA.coverage.projects,
    );
    const firstDossier = dossierToggles[0].closest("details");
    expect(firstDossier).not.toHaveAttribute("open");
    expect(dossierToggles[0]).toHaveAccessibleName(
      `Dossier completo del progetto: ${LAMEZIA_PNRR_STATIC_DATA.projects[0].title} — CUP ${LAMEZIA_PNRR_STATIC_DATA.projects[0].cup}`,
    );
    fireEvent.click(dossierToggles[0]);
    expect(firstDossier).toHaveAttribute("open");
    expect(screen.getAllByTestId(/^pnrr-evidence-timeline-/)).toHaveLength(
      LAMEZIA_PNRR_STATIC_DATA.coverage.projects,
    );
    expect(screen.getAllByText("Dossier completo del progetto")).toHaveLength(
      LAMEZIA_PNRR_STATIC_DATA.coverage.projects,
    );
    expect(
      screen.getAllByText(/non rappresenta lo stato di avanzamento/i).length,
    ).toBeGreaterThan(0);
  });

  it("opens one stable project view per CUP and copies its identifiers", async () => {
    const source = LAMEZIA_PNRR_STATIC_VIEW.projects[0];
    const location = memoryLocation({
      path: `/pnrr/${source.cup}`,
    });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(
      <Router hook={location.hook}>
        <Pnrr />
      </Router>,
    );

    expect(screen.getByTestId("pnrr-permalink-page")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: source.title }),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId(/^pnrr-dossier-toggle-/)).toHaveLength(1);
    expect(
      screen.getByTestId(`pnrr-dossier-toggle-${source.id}`).closest("details"),
    ).toHaveAttribute("open");
    expect(
      screen.getByRole("link", { name: "Torna a tutti i progetti PNRR" }),
    ).toHaveAttribute("href", "/pnrr#pnrr-elenco");
    expect(
      screen.getByText("Non disponibile nelle fonti acquisite."),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: `Copia CUP ${source.cup} di ${source.title}`,
      }),
    );
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(source.cup));
    expect(
      screen.getByText(`CUP ${source.cup} copiato negli appunti.`),
    ).toHaveAttribute("role", "status");

    fireEvent.click(
      screen.getByRole("button", {
        name: `Copia il link della scheda CUP ${source.cup}: ${source.title}`,
      }),
    );
    await waitFor(() =>
      expect(writeText).toHaveBeenLastCalledWith(
        expect.stringMatching(new RegExp(`/pnrr/${source.cup}$`)),
      ),
    );
  });

  it("orders only dated evidence and keeps year-only dates explicit", () => {
    const source = LAMEZIA_PNRR_STATIC_VIEW.projects[0];
    const timeline = buildPnrrEvidenceTimeline({
      ...source,
      lastUpdatedAt: "2025-05-01",
      openCupAcquisition: null,
      attachments: [
        {
          ...source.attachments[0],
          documentDate: "2024-03-15",
          documentYear: 2024,
          datePrecision: "day",
        },
        {
          ...source.attachments[1],
          documentDate: null,
          documentYear: 2023,
          datePrecision: "year",
        },
        {
          ...source.attachments[2],
          documentDate: null,
          documentYear: null,
          datePrecision: null,
        },
      ],
      documents: [
        {
          id: "timeline-test",
          publicId: "timeline-test",
          oggetto: "Determina collegata al CUP",
          tipologia: "Determinazione",
          pubStart: "2024-04-01",
          cups: source.cup ? [source.cup] : [],
        },
      ],
      documentsCount: 1,
    });

    expect(timeline.events.slice(0, 4).map((event) => event.date)).toEqual([
      "2025-05-01",
      "2024-04-01",
      "2024-03-15",
      "2023",
    ]);
    expect(timeline.events[3].datePrecision).toBe("year");
    expect(timeline.undatedEvidenceCount).toBe(1);
    expect(
      timeline.events.find((event) => event.kind === "albo_publication")?.href,
    ).toBe("/albo/timeline-test");
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
