import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ALBO_PUBLIC_RUN_ITEMS,
  ALBO_PUBLIC_RUN_SUMMARY,
  alboPublicSearchText,
} from "@/data/alboPublicRun";
import { Albo } from "@/pages/Albo";
import { renderPage } from "./pages-harness";

describe("Albo public run surface", () => {
  it("renders the public-safe Albo run on the civic Albo page", () => {
    renderPage(Albo);

    const heading = screen.getByRole("heading", {
      name: /Atti correnti dalla fonte pubblica Albo/i,
    });
    const section = heading.closest("section");

    expect(section).not.toBeNull();
    const panel = within(section as HTMLElement);

    expect(panel.getByText("Layer pubblico")).toBeInTheDocument();
    expect(panel.getByText("Acquisiti")).toBeInTheDocument();
    expect(panel.getByText(String(ALBO_PUBLIC_RUN_SUMMARY.counts.acquired))).toBeInTheDocument();
    expect(panel.getByText(`${ALBO_PUBLIC_RUN_ITEMS.length} record pubblici mostrati`)).toBeInTheDocument();
    expect(panel.getByText(/non sostituisce l'Albo Pretorio ufficiale/i)).toBeInTheDocument();
    expect(panel.getByRole("link", { name: /Fonte ufficiale/i })).toHaveAttribute(
      "href",
      ALBO_PUBLIC_RUN_SUMMARY.source_url,
    );

    expect(screen.getAllByText(/Oggetto minimizzato per prudenza privacy/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Metadato minimo/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: /PDF preservati nella piattaforma/i })).toBeInTheDocument();
    expect(screen.getByText(/Prossimo controllo/i)).toBeInTheDocument();
    expect(screen.queryByText(/assegno di matern|assistenza domiciliare|persona fisica/i)).toBeNull();
  }, 15000);

  it("filters public records with the search field", async () => {
    renderPage(Albo);

    const firstPublicationNumber = ALBO_PUBLIC_RUN_ITEMS[0]?.publication_number;
    if (!firstPublicationNumber) {
      throw new Error("Expected the public Albo fixture to expose a publication number.");
    }

    fireEvent.change(screen.getByLabelText("Cerca atti Albo"), {
      target: { value: firstPublicationNumber },
    });

    const expectedMatches = ALBO_PUBLIC_RUN_ITEMS.filter((item) =>
      alboPublicSearchText(item).includes(firstPublicationNumber.toLowerCase()),
    ).length;

    expect(
      await screen.findByText(
        new RegExp(`^${expectedMatches} di ${ALBO_PUBLIC_RUN_ITEMS.length} record`),
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(`Pubbl. ${firstPublicationNumber}`)).toBeInTheDocument();
  });

  it("does not expose direct document URLs through the app adapter", () => {
    expect(ALBO_PUBLIC_RUN_ITEMS.length).toBeGreaterThan(0);
    for (const item of ALBO_PUBLIC_RUN_ITEMS) {
      expect("document_url" in item).toBe(false);
    }
  });
});
