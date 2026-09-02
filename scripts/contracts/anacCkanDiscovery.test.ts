import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildAnacCigPackageIds,
  selectAnacCigArchiveCandidates,
} from "./anacCkanDiscovery";

describe("ANAC CKAN CIG discovery", () => {
  it("builds annual package ids for a cross-year lookback", () => {
    assert.deepEqual(
      buildAnacCigPackageIds(new Date("2026-02-15T00:00:00Z"), 4),
      ["cig-2026", "cig-2025"],
    );
  });

  it("selects official monthly CSV ZIP resources in newest-first order", () => {
    const payload = {
      success: true,
      result: {
        resources: [
          {
            name: "CIG CSV gennaio 2026",
            format: "ZIP",
            url: "https://dati.anticorruzione.it/opendata/download/dataset/cig-2026/filesystem/20260101-cig_csv.zip",
          },
          {
            name: "CIG JSON gennaio 2026",
            format: "ZIP",
            url: "https://dati.anticorruzione.it/opendata/download/dataset/cig-2026/filesystem/20260101-cig_json.zip",
          },
          {
            name: "CIG CSV dicembre 2025",
            format: "ZIP",
            url: "https://dati.anticorruzione.it/opendata/download/dataset/cig-2025/filesystem/20251201-cig_csv.zip",
          },
          {
            name: "untrusted",
            format: "ZIP",
            url: "https://example.org/20260201-cig_csv.zip",
          },
        ],
      },
    };

    assert.deepEqual(
      selectAnacCigArchiveCandidates(
        payload,
        new Date("2026-01-20T00:00:00Z"),
        2,
      ),
      [
        {
          period: "2026-01",
          url: "https://dati.anticorruzione.it/opendata/download/dataset/cig-2026/filesystem/20260101-cig_csv.zip",
        },
        {
          period: "2025-12",
          url: "https://dati.anticorruzione.it/opendata/download/dataset/cig-2025/filesystem/20251201-cig_csv.zip",
        },
      ],
    );
  });

  it("recognises Italian month names when a CKAN resource name has no numeric date", () => {
    const payload = {
      success: true,
      result: {
        resources: [
          {
            name: "CIG - agosto 2026 - CSV",
            format: "ZIP",
            url: "https://dati.anticorruzione.it/opendata/download/dataset/cig-2026/filesystem/cig_agosto_2026_csv.zip",
          },
        ],
      },
    };

    assert.deepEqual(
      selectAnacCigArchiveCandidates(
        payload,
        new Date("2026-08-20T00:00:00Z"),
        1,
      ),
      [
        {
          period: "2026-08",
          url: "https://dati.anticorruzione.it/opendata/download/dataset/cig-2026/filesystem/cig_agosto_2026_csv.zip",
        },
      ],
    );
  });

  it("fails closed on malformed CKAN payloads", () => {
    assert.deepEqual(
      selectAnacCigArchiveCandidates(
        { success: false },
        new Date("2026-08-20T00:00:00Z"),
        1,
      ),
      [],
    );
  });
});
