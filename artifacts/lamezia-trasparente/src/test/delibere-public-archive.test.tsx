import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Publication } from "@workspace/api-client-react";

const apiState = vi.hoisted(() => ({
  data: [] as Publication[],
}));

vi.mock("@workspace/api-client-react", () => ({
  useListDelibere: () => ({
    data: apiState.data,
    isLoading: false,
    isError: false,
  }),
}));

import {
  DELIBERE_ARCHIVE_ITEMS,
  DELIBERE_ARCHIVE_SUMMARY,
  type DeliberaArchiveItem,
} from "@/data/delibereArchive";
import {
  apiDeliberaNumber,
  filterDelibere,
  mergeDelibere,
} from "@/lib/delibereView";
import { Delibere } from "@/pages/Delibere";

function apiPublication(overrides: Partial<Publication> = {}): Publication {
  return {
    id: 9001,
    progressivo: "2026/9001",
    tipologia: "DELIBERAZIONE DI GIUNTA",
    category: "delibera",
    subcategory: "giunta",
    provenienza: "SETTORE GOVERNO DEL TERRITORIO",
    oggetto: "Versione API dello stesso atto",
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
    ...overrides,
  };
}

function archiveItem(
  overrides: Partial<DeliberaArchiveItem> & { displayTitle?: string } = {},
): DeliberaArchiveItem {
  const {
    displayTitle = "Approvazione del piano comunale per gli spazi pubblici.",
    ...itemOverrides
  } = overrides;
  return {
    id: "albo-2026-9001",
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

describe("archivio pubblico delle delibere", () => {
  it("mantiene coerente l'archivio public-safe cumulativo", () => {
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
          item.presentation.display_title.length > 0 &&
          item.presentation.search_text.length > 0 &&
          item.presentation.standardisation.input_field === "subject",
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
          item.archived_document === null,
      ),
    ).toBe(true);
  });

  it("unisce API e archivio senza duplicati e mantiene il numero generale prioritario", () => {
    const archived = archiveItem();
    const duplicate = apiPublication({
      isNew: true,
      attachments: [
        {
          name: "atto-api.pdf",
          tipo: "PDF",
          officialUrl: "https://example.test/atto-api.pdf",
          storagePath: null,
          contentType: "application/pdf",
          size: 100,
        },
      ],
    });
    const merged = mergeDelibere([archived], [duplicate]);

    expect(apiDeliberaNumber(duplicate)).toBe("216");
    expect(merged).toHaveLength(1);
    expect(
      merged.find((item) => item.publicationNumber === "2026/9001"),
    ).toMatchObject({
      origin: "archive+api",
      subject: archived.presentation.display_title,
      internalHref: null,
      attachments: [],
      isNew: false,
      macrotema: null,
      verificationStatus: "official_source_acquired",
    });
  });

  it("non reintroduce dettagli o allegati API nei record archiviati minimizzati", () => {
    const archived = archiveItem({
      id: "albo-2026-9003",
      publication_number: "2026/9003",
      office: null,
      act_type: null,
      content_hash: null,
      privacy_risk: "medium",
      public_visibility: "publishable_with_minimisation",
      public_note: "Record pubblicato con minimizzazione automatica.",
      displayTitle:
        "Oggetto minimizzato per prudenza privacy; consultare la fonte ufficiale.",
    });
    const duplicate = apiPublication({
      id: 9003,
      progressivo: "2026/9003",
      numRegGen: "217",
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
    });
    const merged = mergeDelibere([archived], [duplicate]);
    const item = merged.find(
      (candidate) => candidate.publicationNumber === "2026/9003",
    );

    expect(item).toMatchObject({
      origin: "archive+api",
      subject:
        "Oggetto minimizzato per prudenza privacy; consultare la fonte ufficiale.",
      internalHref: null,
      attachments: [],
      publicVisibility: "publishable_with_minimisation",
    });
  });

  it("filtra localmente per organo, oggetto, numero atto e pubblicazione", () => {
    const giunta = archiveItem({
      displayTitle: "Assestamento generale di bilancio per l'esercizio 2026.",
    });
    const consiglio = archiveItem({
      id: "albo-2026-9002",
      publication_number: "2026/9002",
      act_type: "DELIBERAZIONE DI CONSIGLIO",
      act_number: "202",
      deliberation_body: "consiglio",
      displayTitle:
        "Determinazione tariffe TARI 2026 e scadenze dei pagamenti.",
    });
    const merged = mergeDelibere([giunta, consiglio], []);

    expect(filterDelibere(merged, "giunta", "")).toHaveLength(1);
    expect(filterDelibere(merged, "consiglio", "")).toHaveLength(1);
    expect(filterDelibere(merged, "all", "2026/9002")).toHaveLength(1);
    expect(filterDelibere(merged, "consiglio", "TARI 2026")).toHaveLength(1);
    expect(filterDelibere(merged, "giunta", "TARI 2026")).toHaveLength(0);
    expect(merged.find((item) => item.id === giunta.id)?.subject).toContain(
      "l'esercizio 2026",
    );
    expect(merged.find((item) => item.id === consiglio.id)?.subject).toBe(
      consiglio.presentation.display_title,
    );
  });

  it("mostra subito l'archivio statico quando l'API è vuota", () => {
    apiState.data = [];
    render(<Delibere />);

    expect(
      screen.getByRole("heading", { name: "Archivio delle delibere" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `${DELIBERE_ARCHIVE_SUMMARY.counts.total} atti osservati`,
      ),
    ).toBeInTheDocument();
    const archivedDocuments =
      DELIBERE_ARCHIVE_SUMMARY.counts.archived_documents;
    const archivedDocumentsLabel = `${archivedDocuments} PDF ${
      archivedDocuments === 1 ? "archiviato" : "archiviati"
    }`;
    expect(
      screen.getByText((_, element) =>
        Boolean(
          element?.tagName === "P" &&
          element.textContent?.includes(archivedDocumentsLabel),
        ),
      ),
    ).toBeInTheDocument();
    const initiallyVisible = Math.min(20, DELIBERE_ARCHIVE_ITEMS.length);
    expect(screen.queryAllByTestId("delibera-card")).toHaveLength(
      initiallyVisible,
    );
    const remaining = DELIBERE_ARCHIVE_ITEMS.length - initiallyVisible;
    if (remaining > 0) {
      const buttonName = `Mostra altri ${Math.min(20, remaining)} atti`;
      const showMore = screen.getByRole("button", { name: buttonName });
      expect(showMore).toBeInTheDocument();
      fireEvent.click(showMore);
      expect(screen.getAllByTestId("delibera-card")).toHaveLength(
        Math.min(40, DELIBERE_ARCHIVE_ITEMS.length),
      );
    } else {
      expect(
        screen.queryByRole("button", { name: /Mostra altri/i }),
      ).not.toBeInTheDocument();
    }
    if (DELIBERE_ARCHIVE_ITEMS.length > 0) {
      expect(
        screen.queryByText("Nessuna delibera trovata"),
      ).not.toBeInTheDocument();
      expect(
        screen.getAllByText(/Ultima osservazione:/i).length,
      ).toBeGreaterThan(0);
      expect(screen.getAllByText(/Stato:/i).length).toBeGreaterThan(0);
      expect(
        screen.queryByText(/Verificato dal monitor/i),
      ).not.toBeInTheDocument();
    } else {
      expect(screen.getByText("Nessuna delibera trovata")).toBeInTheDocument();
    }
  });
});
