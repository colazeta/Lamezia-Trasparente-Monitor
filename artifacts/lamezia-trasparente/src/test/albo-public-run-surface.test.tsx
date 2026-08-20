import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ALBO_PUBLIC_DIFF_SUMMARY,
  ALBO_PUBLIC_RUN_ITEMS,
  ALBO_PUBLIC_RUN_SUMMARY,
  alboPublicSearchText,
} from "@/data/alboPublicRun";
import { ALBO_OPERATIONAL_STATUS } from "@/data/alboStatus";
import { Albo } from "@/pages/Albo";
import { renderPage } from "./pages-harness";

describe("Albo public run surface", () => {
  it("renders a citizen-first pulse backed by the public-safe Albo run", () => {
    renderPage(Albo);

    expect(
      screen.getByRole("heading", { name: /Cosa è successo nell'Albo/i }),
    ).toBeInTheDocument();

    const pulseHeading = screen.getByRole("heading", {
      name: /Cosa è cambiato dall'ultimo controllo/i,
    });
    const pulseSection = pulseHeading.closest("section");
    expect(pulseSection).not.toBeNull();
    const pulse = within(pulseSection as HTMLElement);

    for (const [label, value] of [
      ["Nuovi", ALBO_PUBLIC_DIFF_SUMMARY.counts.new],
      ["Aggiornati", ALBO_PUBLIC_DIFF_SUMMARY.counts.changed],
      ["Non più presenti", ALBO_PUBLIC_DIFF_SUMMARY.counts.removed],
    ] as const) {
      const labelNode = pulse.getByText(label);
      const card = labelNode.parentElement;
      expect(card).not.toBeNull();
      expect(within(card as HTMLElement).getByText(String(value))).toBeInTheDocument();
    }

    expect(
      screen.getByRole("heading", { name: /Oggi nell'Albo/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Cerca negli atti disponibili/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `${ALBO_PUBLIC_RUN_ITEMS.length} di ${ALBO_PUBLIC_RUN_ITEMS.length} record pubblici mostrati.`,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Fonte e metodo")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Fonte ufficiale/i }),
    ).toHaveAttribute("href", ALBO_PUBLIC_RUN_SUMMARY.source_url);

    expect(screen.queryByText("Sintesi documento")).toBeNull();
    expect(screen.queryByText(/Placeholder.*OCR/i)).toBeNull();
    expect(screen.queryByText(/Sintesi documenti di giornata/i)).toBeNull();
    expect(
      screen.getByText(/Nessun contenuto PDF viene interpretato o riassunto/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/assegno di matern|assistenza domiciliare|persona fisica/i),
    ).toBeNull();
  }, 15000);

  it("filters the current public archive with the search field", async () => {
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
        `${expectedMatches} di ${ALBO_PUBLIC_RUN_ITEMS.length} record pubblici mostrati.`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(`Pubbl. ${firstPublicationNumber}`).length,
    ).toBeGreaterThan(0);
  });

  it("opens a metadata-only sheet without promising future OCR summaries", async () => {
    renderPage(Albo);

    fireEvent.click(screen.getAllByRole("button", { name: /Apri scheda/i })[0]);

    const dialog = await screen.findByRole("dialog");
    const sheet = within(dialog);

    expect(sheet.getByText("Informazioni disponibili")).toBeInTheDocument();
    expect(sheet.getByText("Metadati essenziali")).toBeInTheDocument();
    expect(sheet.getByText("Documento e fonte")).toBeInTheDocument();
    expect(sheet.getByText("Come leggere questa scheda")).toBeInTheDocument();
    expect(
      sheet.getByRole("link", { name: /Verifica fonte ufficiale/i }),
    ).toBeInTheDocument();
    expect(
      sheet.getByText(
        /Il contenuto del documento non viene interpretato, sottoposto a OCR o riassunto automaticamente/i,
      ),
    ).toBeInTheDocument();
    expect(sheet.queryByText("Sintesi documento")).toBeNull();
    expect(sheet.queryByText(/Placeholder/i)).toBeNull();
    expect(sheet.queryByText(/document_url/i)).toBeNull();
  });

  it("keeps public adapter records free from direct document URLs", () => {
    expect(ALBO_PUBLIC_RUN_ITEMS.length).toBeGreaterThan(0);
    for (const item of ALBO_PUBLIC_RUN_ITEMS) {
      expect("document_url" in item).toBe(false);
    }
  });

  it("keeps the pulse tied to the operational source state", () => {
    expect(ALBO_OPERATIONAL_STATUS.diff_baseline).not.toBeNull();
    expect(ALBO_OPERATIONAL_STATUS.last_update).toBeTruthy();
    expect(ALBO_OPERATIONAL_STATUS.source_url).toBe(
      ALBO_PUBLIC_RUN_SUMMARY.source_url,
    );
  });
});
