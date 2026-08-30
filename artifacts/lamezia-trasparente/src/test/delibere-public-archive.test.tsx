import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Publication } from "@workspace/api-client-react";

const apiState = vi.hoisted(() => ({
  data: [] as Publication[],
  isLoading: false,
  isError: false,
}));

vi.mock("@workspace/api-client-react", () => ({
  useListDelibere: () => ({
    data: apiState.data,
    isLoading: apiState.isLoading,
    isError: apiState.isError,
  }),
}));

import {
  DELIBERE_ARCHIVE_ITEMS,
  DELIBERE_ARCHIVE_SUMMARY,
  type DeliberaArchiveItem,
} from "@/data/delibereArchive";
import {
  ALL_DELIBERE_THEMES,
  DEFAULT_DELIBERA_FILTERS,
  UNCLASSIFIED_DELIBERE_THEME,
  apiDeliberaNumber,
  deliberaDocumentSummary,
  deliberaOrganCounts,
  deliberaThemeOptions,
  filterDelibere,
  mergeDelibere,
  paginateDelibere,
  parseDeliberaReaderState,
  updateDeliberaReaderSearch,
} from "@/lib/delibereView";
import { Delibere } from "@/pages/Delibere";

function publicIdFromProgressivo(progressivo: string): string {
  return `albo-${progressivo.replace("/", "-")}`;
}

function apiPublication(overrides: Partial<Publication> = {}): Publication {
  const progressivo = overrides.progressivo ?? "2026/9001";
  const displayTitle = "Titolo API standardizzato e leggibile.";
  return {
    id: 9001,
    publicId: overrides.publicId ?? publicIdFromProgressivo(progressivo),
    progressivo,
    tipologia: "DELIBERAZIONE DI GIUNTA",
    category: "delibera",
    subcategory: "giunta",
    provenienza: "SETTORE GOVERNO DEL TERRITORIO",
    oggetto: "OGGETTO RAW API DA NON PUBBLICARE COME TITOLO",
    dataAtto: "2026-08-24",
    pubStart: "2026-08-24",
    pubEnd: "2026-09-08",
    numRegSet: "999",
    numRegGen: "216",
    cups: [],
    isPnrr: false,
    attachments: [],
    isNew: false,
    firstSeenAt: "2026-08-24T11:40:17.244Z",
    macrotema: "altro",
    presentation: {
      display_title: displayTitle,
      action_id: "approvazione",
      action_label: "Approvazione",
      search_text: displayTitle.toLowerCase(),
      area_theme: {
        schema_version: "publication-area-theme.v1",
        taxonomy_id: "municipal-public-act-area-theme-it",
        taxonomy_version: "2026-08-30.1",
        theme_id: "territorio_edilizia",
        theme_label: "Urbanistica, edilizia e territorio",
        confidence: "high",
        basis: "deterministic_rule",
        rule_id: "building-permits",
        evidence: [],
        null_reason: null,
        override: null,
      },
      standardisation: {
        schema_version: "publication-standardisation.v1",
        profile_id: "albo-public-title-it",
        profile_version: "2026-08-30.2",
        input_field: "subject",
        input_field_preserved: true,
        status: "standardised_automatically",
        transformations: [],
        layout_flags: [],
        review_reasons: [],
      },
    },
    publicSafety: {
      policy_id: "albo-public-safety",
      policy_version: "2026-08-30.1",
      standardisation_profile_id: "albo-public-title-it",
      standardisation_profile_version: "2026-08-30.2",
      public_visibility: "publishable",
      privacy_risk: "low",
      reason: null,
      projection_schema_version: "public-act-projection.v1",
      attachments_attested: false,
      markdown_attested: false,
      attestation_status: "valid",
      attestation_reason: null,
      attestation_source: "albo_ingestion",
      attested_at: "2026-08-24T11:40:17.244Z",
      source_fingerprint_verified: true,
    },
    ...overrides,
  };
}

function archiveItem(
  overrides: Partial<DeliberaArchiveItem> & {
    displayTitle?: string;
    themeId?: string | null;
    themeLabel?: string | null;
  } = {},
): DeliberaArchiveItem {
  const {
    displayTitle = "Approvazione del piano comunale per gli spazi pubblici.",
    themeId = "bilancio_tributi",
    themeLabel = "Bilancio, tributi e partecipate",
    ...itemOverrides
  } = overrides;
  const id = itemOverrides.id ?? "albo-2026-9001";
  return {
    id,
    public_id: itemOverrides.public_id ?? id,
    source: "Albo Pretorio Comune di Lamezia Terme",
    source_url: "https://albo.example.test",
    retrieved_at: "2026-08-24T11:40:17.244Z",
    publication_number: "2026/9001",
    publication_start: "2026-08-24",
    publication_end: "2026-09-08",
    office: "SEGRETERIA GENERALE",
    act_type: "DELIBERAZIONE DI GIUNTA",
    act_number: "101",
    act_date: "2026-08-24",
    subject: displayTitle,
    content_hash: "synthetic-public-safe-hash",
    verification_status: "official_source_acquired",
    privacy_risk: "low",
    public_visibility: "publishable",
    classification: {
      dictionary_version: "test.v1",
      sector: {
        id: "segreteria_generale",
        label: "Segreteria generale",
        description: "Fixture di test.",
        confidence: "high",
        basis: "office",
      },
      act_category: {
        id: "deliberazioni",
        label: "Deliberazioni",
        description: "Fixture di test.",
        confidence: "high",
        basis: "act_type",
      },
    },
    known_limits: [],
    public_note: null,
    deliberation_body: "giunta",
    presentation: {
      display_title: displayTitle,
      action_id: "approvazione",
      action_label: "Approvazione",
      search_text: displayTitle.toLowerCase(),
      area_theme: {
        schema_version: "publication-area-theme.v1",
        taxonomy_id: "municipal-public-act-area-theme-it",
        taxonomy_version: "2026-08-30.1",
        theme_id: themeId,
        theme_label: themeLabel,
        confidence: themeId ? "high" : null,
        basis: themeId ? "deterministic_rule" : "fallback",
        null_reason: themeId ? null : "input_withheld_for_privacy",
      },
      standardisation: {
        profile_id: "test",
        profile_version: "1",
        input_field: "subject",
      },
    },
    first_observed_at: "2026-08-24T11:40:17.244Z",
    last_observed_at: "2026-08-30T11:50:38.527Z",
    archived_document: null,
    ...itemOverrides,
  };
}

beforeEach(() => {
  apiState.data = [];
  apiState.isLoading = false;
  apiState.isError = false;
  window.history.replaceState({}, "", "/delibere");
});

describe("archivio pubblico delle delibere", () => {
  it("mantiene coerente l'archivio cumulativo, standardizzato e public-safe", () => {
    expect(DELIBERE_ARCHIVE_SUMMARY.counts).toMatchObject({
      total: DELIBERE_ARCHIVE_ITEMS.length,
      giunta: DELIBERE_ARCHIVE_ITEMS.filter(
        (item) => item.deliberation_body === "giunta",
      ).length,
      consiglio: DELIBERE_ARCHIVE_ITEMS.filter(
        (item) => item.deliberation_body === "consiglio",
      ).length,
      archived_documents: DELIBERE_ARCHIVE_ITEMS.filter(
        (item) => item.archived_document !== null,
      ).length,
    });
    expect(DELIBERE_ARCHIVE_ITEMS).toHaveLength(63);
    expect(
      DELIBERE_ARCHIVE_ITEMS.every(
        (item) => item.classification.act_category.id === "deliberazioni",
      ),
    ).toBe(true);
    expect(
      DELIBERE_ARCHIVE_ITEMS.some(
        (item) => item.public_visibility === ("do_not_publish" as never),
      ),
    ).toBe(false);
    expect(
      DELIBERE_ARCHIVE_ITEMS.filter((item) => item.archived_document).every(
        (item) =>
          item.public_visibility === "publishable" &&
          item.privacy_risk === "low" &&
          item.archived_document?.platform_path.startsWith(
            "/data/public/albo/documents/2026/",
          ),
      ),
    ).toBe(true);
    expect(
      DELIBERE_ARCHIVE_ITEMS.every(
        (item) =>
          item.public_id === item.id &&
          item.presentation.display_title.length > 0 &&
          item.presentation.search_text.length > 0 &&
          item.presentation.area_theme.taxonomy_id.length > 0 &&
          item.presentation.standardisation.input_field === "subject",
      ),
    ).toBe(true);
    expect(
      DELIBERE_ARCHIVE_ITEMS.some(
        (item) => item.presentation.area_theme.theme_id !== null,
      ),
    ).toBe(true);
    expect(
      DELIBERE_ARCHIVE_ITEMS.filter(
        (item) => item.public_visibility !== "publishable",
      ).every(
        (item) =>
          item.office === null &&
          item.act_type === null &&
          item.content_hash === null &&
          item.archived_document === null &&
          item.presentation.area_theme.theme_id === null,
      ),
    ).toBe(true);
  });

  it("deduplica esclusivamente sul publicId stabile e usa solo presentation per i titoli", () => {
    const archived = archiveItem();
    const duplicate = apiPublication({
      progressivo: "2026/DIFFERENTE",
      publicId: archived.id,
      isNew: true,
    });
    const sameProgressivoDifferentId = apiPublication({
      id: 9002,
      publicId: "albo-2026-9999",
      progressivo: archived.publication_number!,
      presentation: {
        ...apiPublication().presentation,
        display_title: "Secondo titolo da presentation.",
        search_text: "secondo titolo da presentation",
      },
    });
    const merged = mergeDelibere(
      [archived],
      [duplicate, sameProgressivoDifferentId],
    );

    expect(apiDeliberaNumber(duplicate)).toBe("216");
    expect(merged).toHaveLength(2);
    expect(merged.find((item) => item.publicId === archived.id)).toMatchObject({
      origin: "archive+api",
      subject: archived.presentation.display_title,
      internalHref: `/albo/${archived.id}`,
      attachments: [],
      isNew: true,
      verificationStatus: "official_source_acquired",
    });
    const apiOnly = merged.find(
      (item) => item.publicId === sameProgressivoDifferentId.publicId,
    );
    expect(apiOnly?.subject).toBe("Secondo titolo da presentation.");
    expect(apiOnly?.subject).not.toBe(sameProgressivoDifferentId.oggetto);
  });

  it("non reintroduce allegati API nei record archiviati minimizzati", () => {
    const archived = archiveItem({
      id: "albo-2026-9003",
      publication_number: "2026/9003",
      office: null,
      act_type: null,
      content_hash: null,
      privacy_risk: "medium",
      public_visibility: "publishable_with_minimisation",
      public_note: "Record pubblicato con minimizzazione automatica.",
      themeId: null,
      themeLabel: null,
      displayTitle:
        "Oggetto minimizzato per prudenza privacy; consultare la fonte ufficiale.",
    });
    const baseApi = apiPublication();
    const duplicate = apiPublication({
      id: 9003,
      publicId: archived.id,
      progressivo: "2026/9003",
      oggetto: "Dettaglio API da non reintrodurre",
      attachments: [
        {
          name: "atto.pdf",
          tipo: "PDF",
          officialUrl: "https://example.test/atto.pdf",
          storagePath: null,
          contentType: "application/pdf",
          size: 100,
        },
      ],
      publicSafety: {
        ...baseApi.publicSafety,
        attachments_attested: true,
      },
    });
    const item = mergeDelibere([archived], [duplicate])[0];

    expect(item).toMatchObject({
      origin: "archive+api",
      subject:
        "Oggetto minimizzato per prudenza privacy; consultare la fonte ufficiale.",
      internalHref: `/albo/${archived.id}`,
      attachments: [],
      publicVisibility: "publishable_with_minimisation",
    });
    expect(deliberaDocumentSummary(item!)).toMatchObject({
      status: "not_archived",
      count: 0,
    });
  });

  it("espone soltanto allegati API attestati con destinazioni sicure", () => {
    const base = apiPublication();
    const publication = apiPublication({
      publicSafety: {
        ...base.publicSafety,
        attachments_attested: true,
      },
      attachments: [
        {
          name: "atto-attestato.pdf",
          tipo: "PDF",
          officialUrl: "https://albo.example.test/atto.pdf",
          storagePath: "/objects/albo/atto-attestato.pdf",
          contentType: "application/pdf",
          size: 100,
        },
        {
          name: "destinazione-non-sicura.pdf",
          tipo: "PDF",
          officialUrl: "javascript:alert(1)",
          storagePath: null,
          contentType: "application/pdf",
          size: 100,
        },
        {
          name: "percorso-non-sicuro.pdf",
          tipo: "PDF",
          officialUrl: "https://albo.example.test/altro.pdf",
          storagePath: "/objects/../privato.pdf",
          contentType: "application/pdf",
          size: 100,
        },
      ],
    });
    const item = mergeDelibere([], [publication])[0]!;

    expect(item.attachments.map((attachment) => attachment.name)).toEqual([
      "atto-attestato.pdf",
    ]);
    expect(deliberaDocumentSummary(item)).toMatchObject({
      status: "available",
      count: 1,
    });
  });

  it("filtra per organo, testo, tema, anno e intervallo con conteggi coerenti", () => {
    const giunta = archiveItem({
      displayTitle: "Assestamento generale di bilancio per l'esercizio 2026.",
    });
    const consiglio = archiveItem({
      id: "albo-2025-9002",
      publication_number: "2025/9002",
      act_type: "DELIBERAZIONE DI CONSIGLIO",
      act_number: "202",
      act_date: "2025-07-15",
      deliberation_body: "consiglio",
      themeId: "ambiente_energia",
      themeLabel: "Ambiente, rifiuti ed energia",
      displayTitle:
        "Determinazione tariffe TARI 2025 e scadenze dei pagamenti.",
    });
    const withoutTheme = archiveItem({
      id: "albo-2024-9003",
      publication_number: "2024/9003",
      act_date: "2024-01-10",
      themeId: null,
      themeLabel: null,
      displayTitle: "Metadato minimo non classificato.",
    });
    const merged = mergeDelibere([giunta, consiglio, withoutTheme], []);

    expect(
      filterDelibere(merged, {
        ...DEFAULT_DELIBERA_FILTERS,
        organ: "consiglio",
      }),
    ).toHaveLength(1);
    expect(
      filterDelibere(merged, {
        ...DEFAULT_DELIBERA_FILTERS,
        query: "TARI 2025",
      }),
    ).toHaveLength(1);
    expect(
      filterDelibere(merged, {
        ...DEFAULT_DELIBERA_FILTERS,
        theme: "ambiente_energia",
      }),
    ).toHaveLength(1);
    expect(
      filterDelibere(merged, {
        ...DEFAULT_DELIBERA_FILTERS,
        theme: UNCLASSIFIED_DELIBERE_THEME,
      }),
    ).toHaveLength(1);
    expect(
      filterDelibere(merged, {
        ...DEFAULT_DELIBERA_FILTERS,
        year: "2026",
      }),
    ).toHaveLength(1);
    expect(
      filterDelibere(merged, {
        ...DEFAULT_DELIBERA_FILTERS,
        dateFrom: "2025-01-01",
        dateTo: "2025-12-31",
      }),
    ).toHaveLength(1);
    expect(
      deliberaOrganCounts(merged, {
        ...DEFAULT_DELIBERA_FILTERS,
        theme: "ambiente_energia",
      }),
    ).toEqual({ all: 1, giunta: 0, consiglio: 1, altro: 0 });
    expect(deliberaThemeOptions(merged)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "ambiente_energia", count: 1 }),
        expect.objectContaining({
          id: UNCLASSIFIED_DELIBERE_THEME,
          count: 1,
        }),
      ]),
    );
  });

  it("include l'intera data finale quando l'API restituisce timestamp ISO", () => {
    const timestamped = mergeDelibere(
      [],
      [
        apiPublication({
          id: 9100,
          publicId: "albo-2026-9100",
          progressivo: "2026/9100",
          dataAtto: "2026-08-24T23:59:59.000Z",
          pubStart: "2026-08-24T11:40:17.244Z",
        }),
      ],
    );

    expect(
      filterDelibere(timestamped, {
        ...DEFAULT_DELIBERA_FILTERS,
        dateFrom: "2026-08-24",
        dateTo: "2026-08-24",
      }),
    ).toHaveLength(1);
    expect(
      filterDelibere(timestamped, {
        ...DEFAULT_DELIBERA_FILTERS,
        dateTo: "2026-08-23",
      }),
    ).toHaveLength(0);
  });

  it("esegue il round-trip deterministico dello stato filtri nell'URL", () => {
    const encoded = updateDeliberaReaderSearch("", {
      query: " TARI 2026 ",
      organ: "consiglio",
      theme: "ambiente_energia",
      year: "",
      dateFrom: "2026-01-01",
      dateTo: "2026-06-30",
      page: 3,
    });

    expect(parseDeliberaReaderState(encoded)).toEqual({
      query: "TARI 2026",
      organ: "consiglio",
      theme: "ambiente_energia",
      year: "",
      dateFrom: "2026-01-01",
      dateTo: "2026-06-30",
      page: 3,
    });
    expect(
      parseDeliberaReaderState(
        "?organo=sconosciuto&tema=%3Cscript%3E&dal=2026-02-31&pagina=-2",
      ),
    ).toMatchObject({
      organ: "all",
      theme: ALL_DELIBERE_THEMES,
      dateFrom: "",
      page: 1,
    });
    expect(parseDeliberaReaderState("?anno=2026").year).toBe("2026");
    expect(
      parseDeliberaReaderState("?dal=2026-06-30&al=2026-01-01"),
    ).toMatchObject({ dateFrom: "", dateTo: "" });
  });

  it("pagina in blocchi stabili senza perdere o duplicare risultati", () => {
    const items = Array.from(
      { length: 45 },
      (_, index) =>
        mergeDelibere(
          [
            archiveItem({
              id: `albo-2026-${index + 1}`,
              publication_number: `2026/${index + 1}`,
            }),
          ],
          [],
        )[0]!,
    );
    const first = paginateDelibere(items, 1, 20);
    const second = paginateDelibere(items, 2, 20);
    const third = paginateDelibere(items, 3, 20);

    expect([
      first.items.length,
      second.items.length,
      third.items.length,
    ]).toEqual([20, 20, 5]);
    expect(
      new Set(
        [...first.items, ...second.items, ...third.items].map(
          (item) => item.publicId,
        ),
      ).size,
    ).toBe(45);
    expect(paginateDelibere(items, 99, 20).currentPage).toBe(3);
  });

  it("mostra subito il fallback statico e sposta il focus dopo la paginazione", async () => {
    render(<Delibere />);

    expect(
      screen.getByRole("heading", { name: "Archivio delle delibere" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `${DELIBERE_ARCHIVE_SUMMARY.counts.total} atti osservati`,
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId("delibera-card")).toHaveLength(
      Math.min(PAGE_SIZE_FOR_TEST, DELIBERE_ARCHIVE_ITEMS.length),
    );

    if (DELIBERE_ARCHIVE_ITEMS.length > PAGE_SIZE_FOR_TEST) {
      fireEvent.click(screen.getByRole("button", { name: /Successiva/i }));
      await waitFor(() =>
        expect(new URLSearchParams(window.location.search).get("pagina")).toBe(
          "2",
        ),
      );
      expect(screen.getAllByTestId("delibera-card")).toHaveLength(
        Math.min(
          PAGE_SIZE_FOR_TEST,
          DELIBERE_ARCHIVE_ITEMS.length - PAGE_SIZE_FOR_TEST,
        ),
      );
      expect(screen.getByRole("heading", { name: "Risultati" })).toHaveFocus();
    }
  });

  it("sincronizza ricerca, reset e navigazione indietro/avanti con l'URL", async () => {
    const publicationNumber = DELIBERE_ARCHIVE_ITEMS.find(
      (item) => item.publication_number,
    )?.publication_number;
    if (!publicationNumber)
      throw new Error("Fixture senza numero pubblicazione");
    render(<Delibere />);

    fireEvent.change(
      screen.getByPlaceholderText("Titolo, numero o parola chiave…"),
      { target: { value: publicationNumber } },
    );
    await waitFor(() =>
      expect(new URLSearchParams(window.location.search).get("q")).toBe(
        publicationNumber,
      ),
    );
    expect(
      screen.getByRole("group", { name: "Filtri attivi" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Azzera filtri/i }));
    expect(new URLSearchParams(window.location.search).get("q")).toBeNull();
    expect(
      screen.getByPlaceholderText("Titolo, numero o parola chiave…"),
    ).toHaveFocus();

    fireEvent.click(screen.getByRole("button", { name: /Giunta \(/i }));
    await waitFor(() =>
      expect(new URLSearchParams(window.location.search).get("organo")).toBe(
        "giunta",
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: /Consiglio \(/i }));
    await waitFor(() =>
      expect(new URLSearchParams(window.location.search).get("organo")).toBe(
        "consiglio",
      ),
    );

    await act(async () => window.history.back());
    await waitFor(() =>
      expect(new URLSearchParams(window.location.search).get("organo")).toBe(
        "giunta",
      ),
    );
    expect(screen.getByRole("button", { name: /Giunta \(/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await act(async () => window.history.forward());
    await waitFor(() =>
      expect(new URLSearchParams(window.location.search).get("organo")).toBe(
        "consiglio",
      ),
    );
  });

  it("conserva nell'URL un tema disponibile solo dopo il caricamento API", async () => {
    const base = apiPublication();
    const apiOnlyTheme = apiPublication({
      id: 9200,
      publicId: "albo-2026-9200",
      progressivo: "2026/9200",
      presentation: {
        ...base.presentation,
        display_title: "Piano della mobilità condivisa.",
        search_text: "piano della mobilita condivisa",
        area_theme: {
          ...base.presentation.area_theme,
          theme_id: "mobilita_condivisa",
          theme_label: "Mobilità condivisa",
        },
      },
    });
    window.history.replaceState({}, "", "/delibere?tema=mobilita_condivisa");
    apiState.isLoading = true;
    const view = render(<Delibere />);

    expect(new URLSearchParams(window.location.search).get("tema")).toBe(
      "mobilita_condivisa",
    );

    apiState.data = [apiOnlyTheme];
    apiState.isLoading = false;
    view.rerender(<Delibere />);

    await waitFor(() =>
      expect(screen.getByLabelText("Filtra per area tematica")).toHaveValue(
        "mobilita_condivisa",
      ),
    );
    expect(new URLSearchParams(window.location.search).get("tema")).toBe(
      "mobilita_condivisa",
    );
    expect(screen.getByText("1 di 64 atti.")).toBeInTheDocument();
  });

  it("distingue l'errore API dall'assenza di risultati", () => {
    apiState.isError = true;
    const firstRender = render(<Delibere />);

    expect(screen.getByRole("status", { name: "" })).toHaveTextContent(
      "Aggiornamento online non disponibile",
    );
    expect(screen.getAllByTestId("delibera-card").length).toBeGreaterThan(0);
    expect(
      screen.queryByText("Nessun risultato con questi filtri"),
    ).not.toBeInTheDocument();

    firstRender.unmount();
    apiState.isError = false;
    window.history.replaceState(
      {},
      "",
      "/delibere?q=nessun-risultato-possibile",
    );
    render(<Delibere />);
    expect(
      screen.getByText("Nessun risultato con questi filtri"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Aggiornamento online non disponibile"),
    ).not.toBeInTheDocument();
  });

  it("rende espandibili i titoli lunghi senza mostrare l'oggetto raw API", () => {
    const longItem = DELIBERE_ARCHIVE_ITEMS.find(
      (item) =>
        item.presentation.display_title.length > 150 && item.publication_number,
    );
    if (!longItem?.publication_number) {
      throw new Error("Fixture senza titolo lungo standardizzato");
    }
    window.history.replaceState(
      {},
      "",
      `/delibere?q=${encodeURIComponent(longItem.publication_number)}`,
    );
    apiState.data = [
      apiPublication({
        id: 9998,
        publicId: "albo-2026-9998",
        progressivo: "2026/9998",
      }),
    ];
    render(<Delibere />);

    expect(screen.getByText("Leggi il titolo completo")).toBeInTheDocument();
    expect(
      screen.getAllByText(longItem.presentation.display_title, { exact: true })
        .length,
    ).toBeGreaterThanOrEqual(2);
    expect(
      screen.queryByText("OGGETTO RAW API DA NON PUBBLICARE COME TITOLO"),
    ).not.toBeInTheDocument();
  });
});

const PAGE_SIZE_FOR_TEST = 20;
