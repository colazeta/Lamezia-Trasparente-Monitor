import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  CivicOnboardingPanel,
  type CivicOnboardingPanelProps,
} from "@/components/civic/CivicOnboardingPanel";
import { civicOnboardingDemoPanels } from "@/data/civicOnboarding";

const fullPanelProps: CivicOnboardingPanelProps = {
  title: "Registro dimostrativo",
  description:
    "Introduce lo scopo informativo del modulo e chiarisce il perimetro documentale della lettura.",
  status: "documentato",
  caution:
    "Il contenuto evidenzia indicatori e possibili data gap; non formula valutazioni su responsabilità individuali o intenzioni.",
  methodologyLink: {
    label: "Consulta il metodo",
    href: "/metodologia",
  },
  relatedSections: [
    {
      title: "Fonti disponibili",
      description: "Richiamo neutrale alla tracciabilità delle fonti.",
      href: "/fonti-dati",
    },
  ],
  variant: "full",
};

describe("CivicOnboardingPanel", () => {
  it("renders the full variant with status, caution, methodology and related sections", () => {
    render(<CivicOnboardingPanel {...fullPanelProps} />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: fullPanelProps.title,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Documentato")).toBeInTheDocument();
    expect(screen.getByText(/Nota di cautela:/)).toBeInTheDocument();
    expect(screen.getByText(fullPanelProps.caution)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: fullPanelProps.methodologyLink?.label }),
    ).toHaveAttribute("href", "/metodologia");
    expect(
      screen.getByRole("link", { name: "Fonti disponibili" }),
    ).toHaveAttribute("href", "/fonti-dati");
  });

  it("keeps the compact variant concise while preserving the civic caution", () => {
    render(
      <CivicOnboardingPanel
        title="Modulo compatto"
        description="Descrizione sintetica del perimetro informativo."
        status="demo"
        caution="Esempio statico senza dataset reale e senza inferenze reputazionali."
        methodologyLink={{ label: "Metodo", href: "/metodologia" }}
        relatedSections={[{ title: "Sezione compatta", href: "/demo" }]}
        variant="compact"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Modulo compatto" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Demo")).toBeInTheDocument();
    expect(screen.getByText(/senza dataset reale/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Metodo" })).toHaveAttribute(
      "href",
      "/metodologia",
    );
    expect(
      screen.getByRole("link", { name: "Sezione compatta" }),
    ).toHaveAttribute("href", "/demo");
  });

  it("exposes neutral static examples for documentation and demos", () => {
    expect(civicOnboardingDemoPanels).toHaveLength(2);
    expect(civicOnboardingDemoPanels.map((panel) => panel.status)).toEqual([
      "demo",
      "sperimentale",
    ]);
    expect(
      civicOnboardingDemoPanels.every((panel) => panel.caution.length > 0),
    ).toBe(true);
  });
});
