import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HouseholdCompositionDatasetCard } from "@/components/opendata/HouseholdCompositionDatasetCard";
import { LAMEZIA_HOUSEHOLD_COMPOSITION_2023_DATA_URL } from "@/data/lameziaHouseholdComposition2023";
import { Opendata } from "@/pages/Opendata";

vi.mock("@workspace/api-client-react", () => ({
  useListOpendataDatasets: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
  useGetOpendataFeedStatus: vi.fn(() => ({
    data: undefined,
  })),
}));

describe("HouseholdCompositionDatasetCard", () => {
  it("renders the real counts, chart, QA and canonical JSON download", () => {
    render(<HouseholdCompositionDatasetCard />);

    expect(
      screen.getByRole("heading", {
        name: "Distribuzione 2023 per numero di componenti",
      }),
    ).toBeInTheDocument();
    const total = screen.getByText("Famiglie totali").closest("dl");
    expect(total).not.toBeNull();
    expect(
      within(total as HTMLElement).getByText("27.591"),
    ).toBeInTheDocument();

    const chart = screen.getByRole("img", {
      name: /Famiglie di Lamezia Terme per numero di componenti nel 2023/i,
    });
    expect(
      within(chart).getByRole("group", {
        name: /1 componente: 8\.713 famiglie, 31,6%/i,
      }),
    ).toBeInTheDocument();
    expect(
      within(chart).getByRole("group", {
        name: /6 o più componenti: 340 famiglie, 1,2%/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/PF3 \+ PF4 \+ PF5 \+ PF6 \+ PF7 \+ PF8 = PF1/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Uso come benchmark/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Apri la fonte comunale/i }),
    ).toHaveAttribute(
      "href",
      "/opendata?tema=population-society&dataset=lamezia-families-children",
    );

    const download = screen.getByRole("link", { name: /Scarica JSON/i });
    expect(download).toHaveAttribute(
      "href",
      LAMEZIA_HOUSEHOLD_COMPOSITION_2023_DATA_URL,
    );
    expect(download).toHaveAttribute(
      "download",
      "lamezia-famiglie-componenti-2023.json",
    );

    fireEvent.click(screen.getByText("Fonte, controlli e limiti del dato"));
    expect(screen.getByText("Sezioni reali incluse")).toBeInTheDocument();
    expect(screen.getByText("246")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Pagina fonte ISTAT" }),
    ).toHaveAttribute(
      "href",
      "https://www.istat.it/notizia/dati-per-sezioni-di-censimento/",
    );
    expect(
      screen.getByText(/Famiglia anagrafica.*nucleo familiare/i),
    ).toBeInTheDocument();
  });
});

describe("Open Data household-composition deep-link", () => {
  beforeEach(() => {
    window.history.replaceState(
      {},
      "",
      "/opendata?tema=population-society&dataset=lamezia-household-composition-2023",
    );
  });

  it("opens the static 2023 dataset without requesting the demographic API", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<Opendata />);

    await screen.findByRole(
      "img",
      {
        name: /Famiglie di Lamezia Terme per numero di componenti nel 2023/i,
      },
      { timeout: 5_000 },
    );

    expect(
      screen.getAllByRole("heading", {
        name: /Famiglie per numero di componenti 2023.*Lamezia Terme/i,
      }).length,
    ).toBeGreaterThan(0);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(window.location.search).toContain(
      "dataset=lamezia-household-composition-2023",
    );

    fetchSpy.mockRestore();
  });
});
