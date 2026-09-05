import assert from "node:assert/strict";
import test from "node:test";

import {
  buildIstatIccsManifest,
  buildIstatIccsSnapshot,
  parseIstatIccsHtml,
  validateIccsNodes,
} from "./ltceds-taxonomy-iccs";

const syntheticHtml = `
<!doctype html>
<html>
<body>
  <table>
    <thead>
      <tr>
        <th></th><th></th><th></th>
        <th>ID</th><th>DESCRIZIONE</th><th>DESCRIZIONE EN</th><th>ID PADRE</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>+</td><td></td><td></td><td>01</td><td>Categoria uno</td><td>Category one</td><td>01</td></tr>
      <tr><td>+</td><td></td><td></td><td>01.01</td><td>Voce &amp; uno</td><td>Item &amp; one</td><td>01</td></tr>
      <tr><td>+</td><td></td><td></td><td>01.01.1</td><td>Voce specifica</td><td>Specific item</td><td>01.01</td></tr>
      <tr><td>+</td><td></td><td></td><td>02</td><td>Categoria due</td><td>Category two</td><td>02</td></tr>
    </tbody>
  </table>
</body>
</html>`;

test("parser extracts only source-provided ICCS codes and hierarchy", () => {
  const nodes = parseIstatIccsHtml(syntheticHtml);
  assert.deepEqual(nodes, [
    {
      code: "01",
      labelIt: "Categoria uno",
      labelEn: "Category one",
      parentCode: "01",
      depth: 1,
    },
    {
      code: "01.01",
      labelIt: "Voce & uno",
      labelEn: "Item & one",
      parentCode: "01",
      depth: 2,
    },
    {
      code: "01.01.1",
      labelIt: "Voce specifica",
      labelEn: "Specific item",
      parentCode: "01.01",
      depth: 3,
    },
    {
      code: "02",
      labelIt: "Categoria due",
      labelEn: "Category two",
      parentCode: "02",
      depth: 1,
    },
  ]);
});

test("validator preserves source hierarchy and fails closed on missing parents", () => {
  const nodes = parseIstatIccsHtml(syntheticHtml);
  validateIccsNodes(nodes, {
    minimumNodeCount: 4,
    expectedRootCodes: ["01", "02"],
  });

  assert.throws(
    () =>
      validateIccsNodes(
        [
          ...nodes.filter((node) => node.code !== "01.01"),
        ],
        { minimumNodeCount: 3, expectedRootCodes: ["01", "02"] },
      ),
    /missing parent 01\.01/,
  );
});

test("duplicate source codes are rejected rather than overwritten", () => {
  const duplicateHtml = syntheticHtml.replace(
    "</tbody>",
    '<tr><td></td><td></td><td></td><td>01.01</td><td>Duplicate</td><td>Duplicate</td><td>01</td></tr></tbody>',
  );
  assert.throws(() => parseIstatIccsHtml(duplicateHtml), /Duplicate ICCS code/);
});

test("missing expected table headers fail closed", () => {
  assert.throws(
    () => parseIstatIccsHtml("<table><tr><td>01</td></tr></table>"),
    /Istat ICCS table not found/,
  );
});

test("snapshot separates source hash, parser version and taxonomy namespace", () => {
  const snapshot = buildIstatIccsSnapshot({
    html: syntheticHtml,
    retrievedAt: "2026-09-05T20:00:00Z",
    minimumNodeCount: 4,
    expectedRootCodes: ["01", "02"],
  });

  assert.equal(snapshot.taxonomy_namespace, "iccs");
  assert.equal(snapshot.parser_version, "1.0.0");
  assert.equal(snapshot.node_count, 4);
  assert.deepEqual(snapshot.root_codes, ["01", "02"]);
  assert.match(snapshot.source.source_content_sha256, /^[a-f0-9]{64}$/);
  assert.equal(snapshot.source.licence, "CC BY 4.0");
});

test("manifest is deterministic for the same snapshot", () => {
  const snapshot = buildIstatIccsSnapshot({
    html: syntheticHtml,
    retrievedAt: "2026-09-05T20:00:00Z",
    minimumNodeCount: 4,
    expectedRootCodes: ["01", "02"],
  });

  const first = buildIstatIccsManifest(snapshot);
  const second = buildIstatIccsManifest(structuredClone(snapshot));
  assert.deepEqual(first, second);
  assert.match(first.snapshot_sha256, /^[a-f0-9]{64}$/);
  assert.equal(first.publication_policy, "source-faithful-no-manual-remapping");
});

test("production sanity rules detect truncated source material", () => {
  const nodes = parseIstatIccsHtml(syntheticHtml);
  assert.throws(() => validateIccsNodes(nodes), /expected at least 300 nodes/);
});
