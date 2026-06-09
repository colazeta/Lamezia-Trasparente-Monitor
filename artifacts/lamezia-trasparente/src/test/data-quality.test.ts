import { describe, expect, it } from "vitest";

import { DATA_SOURCES } from "@/data/dataSources";
import {
  DATA_QUALITY_EXCLUDED_SOURCE_NAMES,
  DATA_QUALITY_MATRIX,
} from "@/data/dataQuality";

describe("data quality matrix coverage", () => {
  it("covers every censused data source or documents an explicit exclusion", () => {
    const sourceNames = DATA_SOURCES.map((source) => source.name);
    const matrixNames = DATA_QUALITY_MATRIX.map((row) => row.sourceName);
    const excludedNames = [...DATA_QUALITY_EXCLUDED_SOURCE_NAMES];
    const representedNames = new Set([...matrixNames, ...excludedNames]);

    const missingNames = sourceNames.filter(
      (name) => !representedNames.has(name),
    );
    const unknownMatrixNames = matrixNames.filter(
      (name) => !sourceNames.includes(name),
    );
    const unknownExcludedNames = excludedNames.filter(
      (name) => !sourceNames.includes(name),
    );
    const duplicateMatrixNames = matrixNames.filter(
      (name, index) => matrixNames.indexOf(name) !== index,
    );
    const excludedButCoveredNames = excludedNames.filter((name) =>
      matrixNames.includes(name),
    );

    expect(
      missingNames,
      "Sources without a quality row or explicit exclusion",
    ).toEqual([]);
    expect(
      unknownMatrixNames,
      "Quality rows not present in DATA_SOURCES",
    ).toEqual([]);
    expect(
      unknownExcludedNames,
      "Exclusions not present in DATA_SOURCES",
    ).toEqual([]);
    expect(duplicateMatrixNames, "Duplicate quality rows").toEqual([]);
    expect(
      excludedButCoveredNames,
      "Sources must be either covered or excluded, not both",
    ).toEqual([]);
  });
});
