import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomeInstitutionalSessions } from "@/pages/Home";

describe("HomeInstitutionalSessions", () => {
  it("presents council and commission work as a sourced civic path", () => {
    render(<HomeInstitutionalSessions />);

    expect(
      screen.getByRole("heading", {
        name: "Segui Consiglio comunale e Commissioni",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Consiglio comunale" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Commissioni consiliari" }),
    ).toBeInTheDocument();

    expect(screen.getByText(/13 agosto 2026/i)).toBeInTheDocument();
    expect(
      screen.getByText("6 ottobre 2026 alle ore 11:00"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("9 ottobre 2026 alle ore 09:30"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("13 ottobre 2026 alle ore 09:00"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("12 ottobre 2026 alle ore 09:00"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("24 settembre 2026 alle ore 11:00"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("16 settembre 2026 alle ore 11:00"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("11 settembre 2026 alle ore 11:00"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("7 settembre 2026 alle ore 12:00"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("4 settembre 2026 alle ore 11:00"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("4 settembre 2026 alle ore 12:00"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("1 settembre 2026 alle ore 12:00"),
    ).toBeInTheDocument();
    expect(screen.getByText(/11 agosto 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/10 agosto 2026/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Ricerca contestuale eseguita/i)).toHaveLength(
      63,
    );
    expect(
      screen.getAllByText(/Stato della seduta non verificato/i),
    ).toHaveLength(61);
    expect(screen.getByText(/Seduta sospesa/i)).toBeInTheDocument();
    expect(screen.getByText(/Seduta svolta/i)).toBeInTheDocument();
    expect(
      screen.getAllByText("IV Commissione consiliare permanente"),
    ).toHaveLength(21);
    expect(
      screen.getByText("III e IV Commissioni consiliari permanenti"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Verifica mista")).toHaveLength(2);
    expect(
      screen.getByText(/Le date riportate nelle convocazioni sono verificate/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Data e ora da verificare/i)).toHaveLength(3);
    expect(
      screen.getByText(
        /pubblicazioni 2026\/3262, 2026\/3190, 2026\/3197, 2026\/3198, 2026\/3152, 2026\/3157, 2026\/3151, 2026\/3129, 2026\/3127, 2026\/3090, 2026\/3091, 2026\/3089, 2026\/3097, 2026\/3011, 2026\/3043, 2026\/3012, 2026\/3001, 2026\/2986, 2026\/2960, 2026\/2981, 2026\/2959, 2026\/2971, 2026\/2953, 2026\/2925, 2026\/2926, 2026\/2879, 2026\/2860, 2026\/2859, 2026\/2861, 2026\/2840, 2026\/2788, 2026\/2648/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/2026\/3221/i)).toBeInTheDocument();
    expect(screen.getByText(/23 articoli · 8 video/i)).toBeInTheDocument();
    expect(
      screen.getAllByText(/Albo Pretorio e copertura editoriale separata/i),
    ).toHaveLength(2);
    expect(screen.getByText(/7 articoli · 3 video/i)).toBeInTheDocument();
    expect(screen.getByText(/14 articoli · 0 video/i)).toBeInTheDocument();
    expect(screen.getByText(/5 articoli · 0 video/i)).toBeInTheDocument();
    expect(screen.getAllByText(/4 articoli · 0 video/i)).toHaveLength(2);
    expect(screen.getAllByText(/3 articoli · 0 video/i)).toHaveLength(2);
    expect(screen.getAllByText(/2 articoli · 0 video/i)).toHaveLength(3);
    expect(screen.getAllByText(/1 articolo · 0 video/i)).toHaveLength(6);
    expect(screen.getAllByText(/0 articoli · 0 video/i)).toHaveLength(47);
    expect(
      screen.getByText(/fonte istituzionale successiva lo conferma/i),
    ).toBeInTheDocument();
  });

  it("links each source-reviewed occurrence to its public session sheet", () => {
    render(<HomeInstitutionalSessions />);

    expect(
      screen.getByText("9 ottobre 2026 alle ore 09:30").closest("a"),
    ).toHaveAttribute(
      "href",
      "/convocazioni/albo-2026-3221-consiglio-comunale-2026-10-09",
    );

    expect(
      screen.getByText("13 ottobre 2026 alle ore 09:00").closest("a"),
    ).toHaveAttribute(
      "href",
      "/convocazioni/albo-2026-3262-commissione-v-2026-10-13",
    );

    const editorialLinks = screen
      .getAllByText(/Data e ora da verificare/i)
      .map((item) => item.closest("a")?.getAttribute("href"));
    expect(editorialLinks).toEqual(
      expect.arrayContaining([
        "/convocazioni/editorial-consiglio-aperto-scordovillo-2026-11",
        "/convocazioni/editorial-commissione-ii-ciclo-bilancio-2026-10",
        "/convocazioni/editorial-commissione-i-sfiducia-presidente-2026-10",
      ]),
    );

    expect(
      screen.getByText("6 ottobre 2026 alle ore 11:00").closest("a"),
    ).toHaveAttribute(
      "href",
      "/convocazioni/albo-2026-3190-commissione-iii-2026-10-06",
    );

    expect(screen.getByText(/13 agosto 2026/i).closest("a")).toHaveAttribute(
      "href",
      "/convocazioni/albo-2026-2673-consiglio-comunale",
    );
    expect(
      screen.getByText("24 settembre 2026 alle ore 11:00").closest("a"),
    ).toHaveAttribute(
      "href",
      "/convocazioni/albo-2026-3043-commissione-iii-2026-09-24",
    );
    expect(screen.getByText(/11 agosto 2026/i).closest("a")).toHaveAttribute(
      "href",
      "/convocazioni/albo-2026-2648-commissione-ii-2026-08-11",
    );
    expect(screen.getByText(/10 agosto 2026/i).closest("a")).toHaveAttribute(
      "href",
      "/convocazioni/albo-2026-2648-commissione-ii-2026-08-10",
    );
    expect(
      screen.getByText("4 settembre 2026 alle ore 12:00").closest("a"),
    ).toHaveAttribute(
      "href",
      "/convocazioni/albo-2026-2788-commissione-vi-2026-09-04",
    );
    expect(
      screen.getByText("4 settembre 2026 alle ore 11:00").closest("a"),
    ).toHaveAttribute(
      "href",
      "/convocazioni/albo-2026-2840-commissione-iv-2026-09-04",
    );
    expect(
      screen.getByText("11 settembre 2026 alle ore 11:00").closest("a"),
    ).toHaveAttribute(
      "href",
      "/convocazioni/albo-2026-2860-commissione-iv-2026-09-11",
    );
    expect(
      screen.getByText("7 settembre 2026 alle ore 12:00").closest("a"),
    ).toHaveAttribute(
      "href",
      "/convocazioni/albo-2026-2861-commissioni-iii-iv-2026-09-07",
    );
    expect(
      screen.getByText("1 settembre 2026 alle ore 12:00").closest("a"),
    ).toHaveAttribute(
      "href",
      "/convocazioni/albo-2026-2788-commissione-vi-2026-09-01",
    );
    expect(
      screen.getByRole("link", { name: /Apri l'archivio delle sedute/i }),
    ).toHaveAttribute("href", "/convocazioni");
  });
});
