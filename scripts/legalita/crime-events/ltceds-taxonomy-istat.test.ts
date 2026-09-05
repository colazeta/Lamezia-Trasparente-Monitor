import assert from "node:assert/strict";
import test from "node:test";

import {
  buildIstatAnalyticalSnapshot,
  buildIstatCrimeGroupsSnapshot,
  buildIstatSyntheticSnapshot,
  buildIstatTaxonomyManifest,
  parseIstatAnalyticalHtml,
  parseIstatCrimeGroupsHtml,
  parseIstatSyntheticHtml,
  validateIstatAnalyticalNodes,
  validateIstatCrimeGroups,
  validateIstatSyntheticNodes,
} from "./ltceds-taxonomy-istat";

function table(headers: string[], rows: string[][]): string {
  return `<html><body><table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows
    .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
    .join("")}</tbody></table></body></html>`;
}

function syntheticHtml(count = 20): string {
  const rows: string[][] = [["ROOT", "Radice", "Root", "2020-01-01", "", "ROOT"]];
  for (let index = 1; index < count; index += 1) {
    rows.push([
      `S${index}`,
      `Voce ${index}`,
      `Item ${index}`,
      "2020-01-01",
      index === 2 ? "2024-12-31" : "",
      "ROOT",
    ]);
  }
  return table(
    ["ID", "DESCRIZIONE", "DESCRIZIONE EN", "INIZIO VALIDITÀ", "FINE VALIDITÀ", "ID PADRE"],
    rows,
  );
}

function analyticalHtml(count = 50): string {
  const rows = Array.from({ length: count }, (_, index) => [
    `A${index + 1}`,
    `Analitica ${index + 1}`,
    `Analytical ${index + 1}`,
    "2020-01-01",
    index === 0 ? "2023-12-31" : "",
  ]);
  return table(
    ["ID", "DESCRIZIONE", "DESCRIZIONE EN", "INIZIO VALIDITÀ", "FINE VALIDITÀ"],
    rows,
  );
}

function groupsHtml(): string {
  const options = [
    ["Cy", "Cybercrime-related"],
    ["Cy1", "Computers as a means"],
    ["Cy2", "Computers as a target"],
    ["Cy3", "Not applicable"],
    ["Exp-Mig", "Exploitation of migrants"],
    ["Exp-Mig1", "Applicable"],
    ["Exp-Mig2", "Not applicable"],
    ["Lo", "Type of location"],
    ["Lo1", "Residential"],
    ["Lo2", "Commercial"],
    ["Lo3", "Public space"],
    ["Lo4", "Other"],
    ["Mot", "Motive"],
    ["Mot1", "Illicit gain"],
    ["Mot2", "Gender-based"],
    ["Mot3", "Other motive"],
    ["SiC", "Situational context"],
    ["SiC1", "Organised-crime related"],
    ["SiC2", "Gang-related"],
    ["SiC4", "Corporate-crime related"],
    ["Sexual-Crimes", "Sexual crimes"],
  ];
  return `<html><body><select id="unrelated"><option value="all">All</option></select><select id="crime-groups">${options
    .map(([code, label]) => `<option value="${code}">${code} - ${label}</option>`)
    .join("")}</select></body></html>`;
}

test("synthetic taxonomy preserves hierarchy and validity fields", () => {
  const nodes = parseIstatSyntheticHtml(syntheticHtml());
  validateIstatSyntheticNodes(nodes, 2);
  assert.equal(nodes[0]?.code, "ROOT");
  assert.equal(nodes.find((node) => node.code === "S2")?.validTo, "2024-12-31");
  assert.equal(nodes.find((node) => node.code === "S3")?.parentCode, "ROOT");
});

test("synthetic taxonomy fails closed on a missing parent", () => {
  const html = table(
    ["ID", "DESCRIZIONE", "DESCRIZIONE EN", "INIZIO VALIDITÀ", "FINE VALIDITÀ", "ID PADRE"],
    [
      ["ROOT", "Radice", "Root", "", "", "ROOT"],
      ["X", "Voce", "Item", "", "", "MISSING"],
    ],
  );
  assert.throws(() => validateIstatSyntheticNodes(parseIstatSyntheticHtml(html), 2), /missing parent/);
});

test("analytical taxonomy stays flat and preserves validity", () => {
  const nodes = parseIstatAnalyticalHtml(analyticalHtml());
  validateIstatAnalyticalNodes(nodes, 2);
  assert.equal(nodes.length, 50);
  assert.equal(nodes[0]?.validTo, "2023-12-31");
  assert.equal("parentCode" in (nodes[0] ?? {}), false);
});

test("crime groups are isolated from unrelated selects and keep source labels", () => {
  const items = parseIstatCrimeGroupsHtml(groupsHtml());
  validateIstatCrimeGroups(items, 5);
  assert.equal(items.some((item) => item.code === "all"), false);
  assert.equal(items.find((item) => item.code === "SiC1")?.sourceLabel, "Organised-crime related");
  assert.equal(items.find((item) => item.code === "Sexual-Crimes")?.sourceLabel, "Sexual crimes");
});

test("crime groups fail closed when anchor families disappear", () => {
  assert.throws(
    () => parseIstatCrimeGroupsHtml("<select><option value='Cy'>Cy - Cybercrime</option></select>"),
    /group-code anchors/,
  );
});

test("production snapshot builders preserve separate namespaces", () => {
  const retrievedAt = "2026-09-05T21:45:00Z";
  const synthetic = buildIstatSyntheticSnapshot({ html: syntheticHtml(20), retrievedAt });
  const analytical = buildIstatAnalyticalSnapshot({ html: analyticalHtml(50), retrievedAt });
  const groups = buildIstatCrimeGroupsSnapshot({ html: groupsHtml(), retrievedAt });
  assert.equal(synthetic.taxonomy_namespace, "istat_synthetic");
  assert.equal(analytical.taxonomy_namespace, "istat_analytical");
  assert.equal(groups.taxonomy_namespace, "istat_crime_groups");
  assert.equal(synthetic.source.source_content_sha256.length, 64);
});

test("manifest hashes the normalised snapshot and forbids manual remapping", () => {
  const snapshot = buildIstatCrimeGroupsSnapshot({
    html: groupsHtml(),
    retrievedAt: "2026-09-05T21:45:00Z",
  });
  const manifest = buildIstatTaxonomyManifest(snapshot);
  assert.equal(manifest.snapshot_sha256.length, 64);
  assert.equal(manifest.publication_policy, "source-faithful-no-manual-remapping");
  assert.match(manifest.limitations.join(" "), /does not infer catalogue-to-classification correspondence/);
});
