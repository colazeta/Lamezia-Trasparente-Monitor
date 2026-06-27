import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ContractSourceBadge } from "@/components/contracts";

describe("ContractSourceBadge", () => {
  it("renders the public source status label for official evidence", () => {
    render(<ContractSourceBadge status="official-source" />);

    expect(screen.getByText("Fonte ufficiale collegata")).toBeInTheDocument();
  });

  it("renders the public source status label for ingested official evidence", () => {
    render(<ContractSourceBadge status="official-ingested-source" />);

    expect(screen.getByText("Fonte ufficiale ingerita")).toBeInTheDocument();
  });

  it("renders the public source status label for BDNCP search bridges", () => {
    render(<ContractSourceBadge status="search-bridge" />);

    expect(screen.getByText("Ponte di ricerca")).toBeInTheDocument();
  });
});
