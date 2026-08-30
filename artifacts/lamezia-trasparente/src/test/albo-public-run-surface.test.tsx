import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import {
  ALBO_PUBLIC_DIFF_CHANGED_ITEMS,
  ALBO_PUBLIC_DIFF_NEW_ITEMS,
  ALBO_PUBLIC_DIFF_REMOVED_ITEMS,
  ALBO_PUBLIC_DIFF_SUMMARY,
  ALBO_PUBLIC_RUN_ITEMS,
  ALBO_PUBLIC_RUN_SUMMARY,
  alboPublicSearchText,
  normalizeAlboPublicSearchText,
  normalizeAlboPublicationPresentation,
} from "@/data/alboPublicRun";
import { ALBO_OPERATIONAL_STATUS } from "@/data/alboStatus";
import { Albo } from "@/pages/Albo";
import { Home } from "@/pages/Home";
import { renderPage } from "./pages-harness";

beforeEach(() => {
  window.history.replaceState({}, "", "/albo");
});

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
      expect(
        within(card as HTMLElement).getByText(String(value)),
      ).toBeInTheDocument();
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
      screen.queryByText(
        /assegno di matern|assistenza domiciliare|persona fisica/i,
      ),
    ).toBeNull();
    expect(document.title).toContain("Albo Pretorio civico");
    expect(
      document.head
        .querySelector('link[rel="canonical"]')
        ?.getAttribute("href"),
    ).toMatch(/\/albo$/);
  }, 15000);

  it("places search and a real result before the contextual digest", () => {
    renderPage(Albo);

    const search = screen.getByLabelText("Cerca atti Albo");
    const firstResult = screen.getAllByRole("button", {
      name: /Apri scheda/i,
    })[0];
    const pulseHeading = screen.getByRole("heading", {
      name: /Cosa è cambiato dall'ultimo controllo/i,
    });

    expect(
      search.compareDocumentPosition(pulseHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      firstResult.compareDocumentPosition(pulseHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("filters the current public archive with the search field", async () => {
    renderPage(Albo);

    const firstPublicationNumber = ALBO_PUBLIC_RUN_ITEMS[0]?.publication_number;
    if (!firstPublicationNumber) {
      throw new Error(
        "Expected the public Albo fixture to expose a publication number.",
      );
    }

    fireEvent.change(screen.getByLabelText("Cerca atti Albo"), {
      target: { value: firstPublicationNumber },
    });

    const normalizedPublicationNumber = normalizeAlboPublicSearchText(
      firstPublicationNumber,
    );
    const expectedMatches = ALBO_PUBLIC_RUN_ITEMS.filter((item) =>
      alboPublicSearchText(item).includes(normalizedPublicationNumber),
    ).length;

    expect(
      await screen.findByText(
        `${expectedMatches} di ${ALBO_PUBLIC_RUN_ITEMS.length} record pubblici mostrati.`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(`Pubbl. ${firstPublicationNumber}`).length,
    ).toBeGreaterThan(0);
    expect(new URLSearchParams(window.location.search).get("q")).toBe(
      firstPublicationNumber,
    );
    expect(
      screen.getByRole("group", { name: "Filtri attivi" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Azzera filtri/i }));
    expect(new URLSearchParams(window.location.search).get("q")).toBeNull();
    expect(
      await screen.findByText(
        `${ALBO_PUBLIC_RUN_ITEMS.length} di ${ALBO_PUBLIC_RUN_ITEMS.length} record pubblici mostrati.`,
      ),
    ).toBeInTheDocument();
  });

  it("normalises copied punctuation exactly like the presentation search index", async () => {
    const punctuatedItem = ALBO_PUBLIC_RUN_ITEMS.find((item) =>
      /[’']/u.test(item.presentation.display_title),
    );
    if (!punctuatedItem) {
      throw new Error("Expected a public title containing an apostrophe.");
    }

    const copiedFragment = punctuatedItem.presentation.display_title.match(
      /\p{L}+[’']\p{L}+/u,
    )?.[0];
    if (!copiedFragment) {
      throw new Error("Expected an apostrophe-bearing title fragment.");
    }

    expect(normalizeAlboPublicSearchText(copiedFragment)).not.toContain("'");
    expect(punctuatedItem.presentation.search_text).toContain(
      normalizeAlboPublicSearchText(copiedFragment),
    );

    renderPage(Albo);
    fireEvent.change(screen.getByLabelText("Cerca atti Albo"), {
      target: { value: copiedFragment },
    });

    const expectedMatches = ALBO_PUBLIC_RUN_ITEMS.filter((item) =>
      alboPublicSearchText(item).includes(
        normalizeAlboPublicSearchText(copiedFragment),
      ),
    ).length;
    expect(
      await screen.findByText(
        `${expectedMatches} di ${ALBO_PUBLIC_RUN_ITEMS.length} record pubblici mostrati.`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(punctuatedItem.presentation.display_title, {
        exact: true,
      }),
    ).toBeInTheDocument();
  });

  it("uses the standardised presentation for every visible title", () => {
    const standardisedItem = ALBO_PUBLIC_RUN_ITEMS.find(
      (item) => item.presentation.display_title !== item.subject,
    );
    if (!standardisedItem?.publication_number) {
      throw new Error(
        "Expected a standardised Albo fixture with a publication number.",
      );
    }

    renderPage(Albo);
    fireEvent.change(screen.getByLabelText("Cerca atti Albo"), {
      target: { value: standardisedItem.publication_number },
    });

    expect(
      screen.getByText(standardisedItem.presentation.display_title, {
        exact: true,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(standardisedItem.subject, { exact: true }),
    ).not.toBeInTheDocument();
    expect(standardisedItem.presentation.legacy_fallback).toBe(false);
    expect(
      ALBO_PUBLIC_RUN_ITEMS.every((item) => !item.presentation.legacy_fallback),
    ).toBe(true);
    expect(
      ALBO_PUBLIC_RUN_ITEMS.every(
        (item) => item.presentation.validation_status === "valid",
      ),
    ).toBe(true);
    expect(
      alboPublicSearchText(standardisedItem).startsWith(
        standardisedItem.presentation.search_text,
      ),
    ).toBe(true);
  });

  it("keeps at most 25 results per page and restores focus after paging", async () => {
    renderPage(Albo);

    expect(
      screen.getAllByRole("button", { name: /Apri scheda/i }),
    ).toHaveLength(25);
    fireEvent.click(screen.getByRole("button", { name: /Successiva/i }));

    await waitFor(() => {
      expect(new URLSearchParams(window.location.search).get("pagina")).toBe(
        "2",
      );
    });
    expect(
      screen.getAllByRole("button", { name: /Apri scheda/i }),
    ).toHaveLength(25);
    expect(
      screen.getByRole("heading", { name: /Cerca negli atti disponibili/i }),
    ).toHaveFocus();
  });

  it("deep-links the selected act and follows browser back/forward navigation", async () => {
    renderPage(Albo);

    const trigger = screen.getAllByRole("button", { name: /Apri scheda/i })[0];
    fireEvent.click(trigger);
    const selectedId = new URLSearchParams(window.location.search).get("atto");
    expect(selectedId).toBeTruthy();
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    await act(async () => {
      window.history.back();
    });
    await waitFor(() => {
      expect(
        new URLSearchParams(window.location.search).get("atto"),
      ).toBeNull();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();

    await act(async () => {
      window.history.forward();
    });
    await waitFor(() => {
      expect(new URLSearchParams(window.location.search).get("atto")).toBe(
        selectedId,
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("restores trigger focus when the reader closes the sheet with the keyboard", async () => {
    renderPage(Albo);

    const trigger = screen.getAllByRole("button", { name: /Apri scheda/i })[0];
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = await screen.findByRole("dialog");

    fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  });

  it("does not expose all-uppercase raw office names in result cards", () => {
    renderPage(Albo);
    const archiveSection = screen
      .getByRole("heading", { name: /Cerca negli atti disponibili/i })
      .closest("section");
    expect(archiveSection).not.toBeNull();
    const archive = within(archiveSection as HTMLElement);
    const uppercaseOffices = ALBO_PUBLIC_RUN_ITEMS.map((item) => item.office)
      .filter((office): office is string => Boolean(office))
      .filter((office) => office === office.toLocaleUpperCase("it-IT"));

    for (const office of uppercaseOffices) {
      expect(
        archive.queryByText(office, { exact: true }),
      ).not.toBeInTheDocument();
    }
  });

  it("opens Home pulse items through the same shareable Albo sheet", () => {
    window.history.replaceState({}, "", "/");
    const homePulseItems = [
      ...ALBO_PUBLIC_DIFF_NEW_ITEMS,
      ...ALBO_PUBLIC_DIFF_CHANGED_ITEMS.map((entry) => entry.after),
      ...ALBO_PUBLIC_DIFF_REMOVED_ITEMS,
    ].slice(0, 5);
    const item =
      homePulseItems.find(
        (candidate) =>
          candidate.presentation.display_title !== candidate.subject,
      ) ?? homePulseItems[0];
    if (!item) throw new Error("Expected a public Home pulse fixture.");

    renderPage(Home);
    const expectedHref = `/albo?atto=${encodeURIComponent(item.id)}`;
    const itemLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href") === expectedHref);
    expect(itemLinks).toHaveLength(1);
    expect(
      within(itemLinks[0] as HTMLElement).getByText(
        item.presentation.display_title,
        { exact: true },
      ),
    ).toBeInTheDocument();
    expect(itemLinks[0]).toHaveAttribute(
      "href",
      expectedHref,
    );
  });

  it("keeps a deterministic compatibility fallback for legacy snapshots", () => {
    const presentation = normalizeAlboPublicationPresentation(
      undefined,
      "Titolo disponibile solo nel vecchio snapshot",
    );

    expect(presentation.display_title).toBe(
      "Titolo disponibile solo nel vecchio snapshot",
    );
    expect(presentation.search_text).toBe(
      "titolo disponibile solo nel vecchio snapshot",
    );
    expect(presentation.legacy_fallback).toBe(true);
    expect(presentation.validation_status).toBe("legacy_fallback");
    expect(presentation.standardisation.status).toBe("legacy_fallback");
  });

  it("preserves valid presentation fields exactly without synthesising optional copy", () => {
    const presentation = normalizeAlboPublicationPresentation(
      {
        display_title: "Titolo già normalizzato",
        search_text: "indice esatto fornito dalla pipeline",
        standardisation: { status: "unchanged", layout_flags: [] },
      },
      "TITOLO RAW DA NON USARE",
    );

    expect(presentation.display_title).toBe("Titolo già normalizzato");
    expect(presentation.search_text).toBe(
      "indice esatto fornito dalla pipeline",
    );
    expect(presentation.summary).toBeNull();
    expect(presentation.labels).toEqual([]);
    expect(presentation.validation_status).toBe("valid");
    expect(presentation.legacy_fallback).toBe(false);
  });

  it("marks a partial presentation invalid instead of silently using the raw fallback", () => {
    const presentation = normalizeAlboPublicationPresentation(
      { display_title: "Titolo disponibile" },
      "TITOLO RAW DA NON USARE",
    );

    expect(presentation.display_title).toBe("Titolo disponibile");
    expect(presentation.search_text).toBe("");
    expect(presentation.validation_status).toBe("invalid");
    expect(presentation.invalid_fields).toEqual(["search_text"]);
    expect(presentation.legacy_fallback).toBe(false);
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
