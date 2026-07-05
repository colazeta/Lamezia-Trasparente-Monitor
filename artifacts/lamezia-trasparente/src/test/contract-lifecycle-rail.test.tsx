import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Contract } from "@workspace/api-client-react";

import { ContractLifecycleRail } from "@/components/contracts";
import { buildContractDossier } from "@/lib/contractDossier";

describe("ContractLifecycleRail", () => {
  it("renders a compact graphical state strip for all dossier phases", () => {
    const dossier = buildContractDossier({
      contract: contractFixture({
        title: "Riqualificazione scuola comunale",
        description: "Intervento di manutenzione e riqualificazione edificio scolastico.",
        cig: "B123456789",
        macrotema: "scuole",
      }),
    });

    render(<ContractLifecycleRail dossier={dossier} />);

    expect(screen.getByText("Stato grafico delle fasi")).toBeInTheDocument();
    const phaseStrip = screen.getByLabelText(
      "Stato fasi del fascicolo Riqualificazione scuola comunale",
    );

    expect(
      within(phaseStrip).getByText("Programmazione: Non documentata"),
    ).toBeInTheDocument();
    expect(
      within(phaseStrip).getByText("Progettazione: Da verificare"),
    ).toBeInTheDocument();
    expect(
      within(phaseStrip).getByText("Gara / pubblicazione: Da verificare"),
    ).toBeInTheDocument();
    expect(
      within(phaseStrip).getByText("Esecuzione del contratto: Non documentata"),
    ).toBeInTheDocument();
  });
});

function contractFixture(overrides: Partial<Contract> = {}): Contract {
  return {
    id: 202,
    title: "Riqualificazione scuola comunale",
    description: "Intervento di manutenzione e riqualificazione edificio scolastico.",
    supplier: "Operatore economico demo",
    amount: 180000,
    status: "in_corso",
    procedureType: "Affidamento diretto",
    acquisitionTool: "MEPA",
    awardDate: "2026-02-10T00:00:00.000Z",
    cig: null,
    cup: null,
    anacUrl: null,
    themeId: null,
    withoutTender: false,
    withoutMepa: false,
    stazioneAppaltante: "Comune di Lamezia Terme",
    macrotema: null,
    latitude: null,
    longitude: null,
    geoAddress: null,
    geoQuartiere: null,
    geoVerify: false,
    ...overrides,
  } as Contract;
}
