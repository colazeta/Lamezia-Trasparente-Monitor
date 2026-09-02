import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ContractSourceBadge } from "@/components/contracts";

describe("ContractSourceBadge", () => {
  it("uses a concise label for official evidence", () => {
    render(<ContractSourceBadge status="official-source" />);

    expect(screen.getByText("Fonte ufficiale")).toBeInTheDocument();
  });

  it("does not expose ingestion terminology for acquired official evidence", () => {
    render(<ContractSourceBadge status="official-ingested-source" />);

    expect(screen.getByText("Da fonte ufficiale")).toBeInTheDocument();
    expect(screen.queryByText(/ingerita/i)).not.toBeInTheDocument();
  });

  it("describes the ANAC route without internal bridge terminology", () => {
    render(<ContractSourceBadge status="search-bridge" />);

    expect(screen.getByText("Ricerca ANAC disponibile")).toBeInTheDocument();
    expect(screen.queryByText(/ponte/i)).not.toBeInTheDocument();
  });
});
