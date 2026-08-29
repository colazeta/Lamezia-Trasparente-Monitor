import { fireEvent, render, screen } from "@testing-library/react";
import { FileText } from "lucide-react";
import { describe, expect, it } from "vitest";
import { Router as WouterRouter } from "wouter";

import { V0SectionLanding } from "@/components/launch/V0SectionLanding";

function renderLanding() {
  return render(
    <WouterRouter>
      <V0SectionLanding
        eyebrow="Contratti pubblici"
        icon={FileText}
        title="Contratti pubblici sotto osservazione"
        subtitle="Consulta i dati disponibili nel perimetro dichiarato."
        stateLabel="Pubblicabile"
        stateDescription="Sezione consultabile con copertura da verificare."
        findItems={["Contratti e importi disponibili."]}
        missingItems={["Copertura completa delle fonti."]}
        sourceLimit="I dati mancanti non implicano irregolarità."
        cta={{ label: "Consulta i contratti", href: "#elenco" }}
        secondaryLink={{ label: "Metodo", href: "/metodologia" }}
      />
    </WouterRouter>,
  );
}

describe("V0SectionLanding content hierarchy", () => {
  it("keeps the page identity, state and primary action immediately visible", () => {
    renderLanding();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Contratti pubblici sotto osservazione",
      }),
    ).toBeVisible();
    expect(screen.getByText("Pubblicabile")).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Consulta i contratti" }),
    ).toHaveAttribute("href", "#elenco");
  });

  it("keeps coverage and caveats in one native disclosure closed by default", () => {
    const { container } = renderLanding();
    const details = container.querySelector("details");

    expect(details).toBeInstanceOf(HTMLDetailsElement);
    expect(details).not.toHaveAttribute("open");

    fireEvent.click(screen.getByText("Copertura, contenuti e limiti"));

    expect(details).toHaveAttribute("open");
    expect(screen.getByText("Cosa trovi qui")).toBeInTheDocument();
    expect(screen.getByText("Cosa manca ancora")).toBeInTheDocument();
    expect(
      screen.getByText("I dati mancanti non implicano irregolarità."),
    ).toBeInTheDocument();
  });
});
