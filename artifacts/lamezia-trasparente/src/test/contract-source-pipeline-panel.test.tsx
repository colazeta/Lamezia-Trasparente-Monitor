import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ContractSourcePipelinePanel } from "@/components/contracts";
import { buildContractPipelineSnapshot } from "@/lib/contractsPipelineVisualization";

vi.mock("@workspace/api-client-react", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@workspace/api-client-react")>();

  return {
    ...actual,
    useListContracts: () => ({ data: [], isLoading: false }),
  };
});

describe("ContractSourcePipelinePanel", () => {
  it("renders the source pipeline without public ingestion claims", () => {
    render(<ContractSourcePipelinePanel />);

    expect(screen.getByText("Contratti protagonisti")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Stato dei fascicoli contrattuali",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Gate fonti e pubblicazione")).toBeInTheDocument();
    expect(screen.getByText("Dry-run ingestion")).toBeInTheDocument();
    expect(screen.getByText("Produzione chiusa")).toBeInTheDocument();
    expect(
      screen.getByText("0 record produzione, 0 scritture pubbliche"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/ANAC sincronizzata/i)).not.toBeInTheDocument();
  });

  it("keeps the public production gate closed from the dry-run report", () => {
    const snapshot = buildContractPipelineSnapshot();

    expect(snapshot.discoveryStatus).toBe("needs_manual_verification");
    expect(snapshot.dryRunGate).toBe("blocked_by_source_discovery");
    expect(snapshot.productionIngestionAllowed).toBe(false);
    expect(snapshot.productionRecordsWritten).toBe(false);
    expect(snapshot.publicAppDataWritten).toBe(false);
    expect(snapshot.databaseWrites).toBe(false);
  });
});
