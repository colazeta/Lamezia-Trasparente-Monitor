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
} from "@/data/delibereArchive";
import {
  apiDeliberaNumber,
  filterDelibere,
  mergeDelibere,
} from "@/lib/delibereView";
import { Delibere } from "@/pages/Delibere";

function apiPublication(overrides: Partial<Publication> = {}): Publication {
  return {
    id: 2751,
    progressivo: "2026/2751",
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

describe("archivio pubblico delle delibere", () => {
  it("materializza il seed public-safe con conteggi e documenti coerenti", () => {
    expect(DELIBERE_ARCHIVE_SUMMARY.counts).toMatchObject({
      total: 63,
      giunta: 43,
      consiglio: 20,
      archived_documents: 32,
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
  });

  it("unisce API e archivio senza duplicati e mantiene il numero generale prioritario", () => {
    const duplicate = apiPublication();
    const merged = mergeDelibere(DELIBERE_ARCHIVE_ITEMS, [duplicate]);

    expect(apiDeliberaNumber(duplicate)).toBe("216");
    expect(merged).toHaveLength(63);
    expect(
      merged.find((item) => item.publicationNumber === "2026/2751"),
    ).toMatchObject({
      origin: "archive+api",
      subject:
        "Approvazione Piano Attuativo Unitario ad iniziativa privata denominato “P.A.U. Raso Teresa” finalizzato alla realizzazione di capannone adibito a deposito e usi direzionali, proposto da Raso Teresa, proprietaria, ai sensi dell'art. 30 L.R. n. 19/2002.",
      internalHref: "/albo/2751",
    });
  });

  it("filtra localmente per organo, oggetto, numero atto e pubblicazione", () => {
    const merged = mergeDelibere(DELIBERE_ARCHIVE_ITEMS, []);

    expect(filterDelibere(merged, "giunta", "")).toHaveLength(43);
    expect(filterDelibere(merged, "consiglio", "")).toHaveLength(20);
    expect(filterDelibere(merged, "all", "2026/2567")).toHaveLength(1);
    expect(
      filterDelibere(merged, "consiglio", "TARI 2026").length,
    ).toBeGreaterThan(0);
    expect(filterDelibere(merged, "giunta", "TARI 2026")).toHaveLength(0);
  });

  it("mostra subito l'archivio statico quando l'API è vuota", () => {
    apiState.data = [];
    render(<Delibere />);

    expect(
      screen.getByRole("heading", { name: "Archivio delle delibere" }),
    ).toBeInTheDocument();
    expect(screen.getByText("63 atti osservati")).toBeInTheDocument();
    expect(screen.getAllByTestId("delibera-card")).toHaveLength(20);
    expect(
      screen.getByRole("button", { name: "Mostra altri 20 atti" }),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Mostra altri 20 atti" }),
    );
    expect(screen.getAllByTestId("delibera-card")).toHaveLength(40);
    expect(
      screen.queryByText("Nessuna delibera trovata"),
    ).not.toBeInTheDocument();
  });
});
