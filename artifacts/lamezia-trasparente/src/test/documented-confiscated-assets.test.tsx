import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DocumentedConfiscatedAssetsRegistry } from "@/components/DocumentedConfiscatedAssetsRegistry";
import {
  DOCUMENTED_CONFISCATED_ASSETS_DATA_PATH,
  documentedConfiscatedAssetsRegistry,
  parseDocumentedConfiscatedAssetsRegistry,
} from "@/data/documentedConfiscatedAssets";

describe("documented confiscated-assets registry", () => {
  it("keeps evidence, map eligibility and ANBSC matching separate", () => {
    expect(documentedConfiscatedAssetsRegistry.records).toHaveLength(2);

    for (const record of documentedConfiscatedAssetsRegistry.records) {
      expect(record.address.verification_status).toBe("documented");
      expect(record.location.publication_status).toBe(
        "withheld_pending_verification",
      );
      expect(record.location.coordinates).toBeNull();
      expect(record.anbsc_match.status).toBe("not_established");
      expect(record.anbsc_match.record_ids).toEqual([]);
      expect(
        record.sources.some((source) => source.source_kind === "institutional"),
      ).toBe(true);
      expect(
        record.sources.some((source) => source.source_kind === "manager"),
      ).toBe(true);
    }
  });

  it("rejects unpublished coordinates and unsupported ANBSC identifiers", () => {
    const withCoordinates = structuredClone(
      documentedConfiscatedAssetsRegistry,
    ) as unknown as {
      records: Array<{
        location: { coordinates: [number, number] | null };
      }>;
    };
    withCoordinates.records[0].location.coordinates = [16.3, 38.97];

    expect(() =>
      parseDocumentedConfiscatedAssetsRegistry(withCoordinates),
    ).toThrow(/coordinates must remain null/);

    const withAnbscId = structuredClone(
      documentedConfiscatedAssetsRegistry,
    ) as unknown as {
      records: Array<{
        anbsc_match: { record_ids: string[] };
      }>;
    };
    withAnbscId.records[0].anbsc_match.record_ids = ["unverified-id"];

    expect(() => parseDocumentedConfiscatedAssetsRegistry(withAnbscId)).toThrow(
      /ANBSC record identifiers require an established/,
    );
  });

  it("shows both contextual records, their sources and the mapping caveat", () => {
    render(<DocumentedConfiscatedAssetsRegistry />);

    expect(
      screen.getByRole("heading", { name: "Primi siti di riuso documentati" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(2);

    const pensieri = screen.getByTestId(
      "documented-asset-pensieri-e-parole-via-dei-bizantini",
    );
    expect(
      within(pensieri).getByRole("heading", { name: "Pensieri e Parole" }),
    ).toBeInTheDocument();
    expect(
      within(pensieri).getByText(/Via dei Bizantini 97–101/),
    ).toBeVisible();
    expect(within(pensieri).getByText(/570\.000/)).toBeVisible();

    const lucky = screen.getByTestId(
      "documented-asset-mamas-lucky-friends-center-via-guzzi",
    );
    expect(within(lucky).getByText(/Via Sebastiano Guzzi 70/)).toBeVisible();
    expect(within(lucky).getByText(/599\.900/)).toBeVisible();

    const coordinateLabels = screen.getAllByText("Coordinate:");
    expect(coordinateLabels).toHaveLength(2);
    for (const label of coordinateLabels) {
      expect(label.closest("p")).toHaveTextContent(
        /Coordinate: non pubblicate; verifica puntuale aperta/i,
      );
    }
    expect(
      screen.getAllByText(/nessun identificativo individuale attribuito/i),
    ).toHaveLength(2);
    expect(
      screen.getByRole("link", { name: "Scarica il registro JSON" }),
    ).toHaveAttribute("href", DOCUMENTED_CONFISCATED_ASSETS_DATA_PATH);
    expect(
      screen.getAllByRole("link", {
        name: /Lamezia Terme, conclusi due interventi/i,
      }),
    ).toHaveLength(2);
  });
});
