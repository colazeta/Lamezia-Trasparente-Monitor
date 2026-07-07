import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ALBO_PUBLIC_RUN_ITEMS,
  ALBO_PUBLIC_RUN_SUMMARY,
  alboPublicSearchText,
} from "@/data/alboPublicRun";
import { ALBO_OPERATIONAL_STATUS } from "@/data/alboStatus";
import { formatPublicTimeField } from "@/lib/time";
import { Albo } from "@/pages/Albo";
import { renderPage } from "./pages-harness";

const ROME_WEEKDAY_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Rome",
  weekday: "short",
});

const ROME_DATE_PART_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Rome",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function dateKeyInRome(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = ROME_DATE_PART_FORMATTER.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return year && month && day ? `${year}-${month}-${day}` : null;
}

function isWorkingDayInRome(value: string | null | undefined): boolean {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const weekday = ROME_WEEKDAY_FORMATTER.format(date);
  return weekday !== "Sat" && weekday !== "Sun";
}

function expectedNextScheduledCheckLabel(value: string | null | undefined): string {
  if (!value) return "Non disponibile";
  if (!isWorkingDayInRome(value)) {
    return "Nessun aggiornamento previsto nel fine settimana";
  }
  return formatPublicTimeField(value, "dd MMMM yyyy 'alle' HH:mm");
}

function dailyDigestEvidenceText(): string {
  const referenceDate = ALBO_PUBLIC_RUN_SUMMARY.retrieved_at;
  const referenceKey = dateKeyInRome(referenceDate);
  if (!isWorkingDayInRome(referenceDate)) {
    return "Nessuna sintesi di giornata e prevista sabato o domenica";
  }
  const dailyItem = referenceKey
    ? ALBO_PUBLIC_RUN_ITEMS.find((item) => dateKeyInRome(item.publication_start) === referenceKey)
    : undefined;
  return dailyItem?.subject ?? "Nessun documento con inizio pubblicazione nella giornata lavorativa dello snapshot";
}

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
    expect(
      screen.getByText(
        expectedNextScheduledCheckLabel(ALBO_OPERATIONAL_STATUS.next_scheduled_check),
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/Solo giorni lavorativi/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Sintesi documenti di giornata/i })).toBeInTheDocument();
    expect(screen.getByText(/Placeholder per la sintesi OCR/i)).toBeInTheDocument();
    expect(screen.getByText(dailyDigestEvidenceText())).toBeInTheDocument();
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
    expect(screen.getAllByText(`Pubbl. ${firstPublicationNumber}`).length).toBeGreaterThan(0);
  });

  it("opens a connected metadata sheet for a public Albo record", async () => {
    renderPage(Albo);

    fireEvent.click(screen.getAllByRole("button", { name: /Apri scheda/i })[0]);

    const dialog = await screen.findByRole("dialog");
    const sheet = within(dialog);

    expect(sheet.getByText("Quadro dai metadati")).toBeInTheDocument();
    expect(sheet.getByText("Sintesi documento")).toBeInTheDocument();
    expect(sheet.getByText(/Placeholder: la descrizione sara compilata/i)).toBeInTheDocument();
    expect(sheet.getByText("Metadati essenziali")).toBeInTheDocument();
    expect(sheet.getByText("Documento e fonte")).toBeInTheDocument();
    expect(sheet.getByRole("link", { name: /Verifica fonte ufficiale/i })).toBeInTheDocument();
    expect(sheet.getByText(/Il contenuto del PDF non viene analizzato/i)).toBeInTheDocument();
    expect(sheet.queryByText(/document_url/i)).toBeNull();
  });

  it("does not expose direct document URLs through the app adapter", () => {
    expect(ALBO_PUBLIC_RUN_ITEMS.length).toBeGreaterThan(0);
    for (const item of ALBO_PUBLIC_RUN_ITEMS) {
      expect("document_url" in item).toBe(false);
    }
  });
});
