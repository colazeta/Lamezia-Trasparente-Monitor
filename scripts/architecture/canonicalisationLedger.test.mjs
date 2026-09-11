import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  root,
  validateLedger,
  forbiddenMunicipalReferences,
  inspectCanonicalisation,
} from "./canonicalisationLedger.mjs";
import { validateConceptualCatalog } from "./conceptualCatalog.mjs";
test("old runtime source authority is blocked in imports, re-exports, dynamic imports and URLs", () => {
  for (const s of [
    'import data from "./generated/lameziaFamiliesChildren.json";',
    'export {default} from "./generated/lameziaForeignResidentsAgeSex.json";',
    'const data=import("./generated/lameziaDemographicTrend.json");',
    'const x=new URL("./generated/lameziaFamiliesChildren.json?url",import.meta.url);',
    'const x="/data/lameziaFamiliesChildren.json";',
  ])
    assert.equal(forbiddenMunicipalReferences(s, "src/example.ts").length, 1);
  assert.equal(
    forbiddenMunicipalReferences(
      'import data from "./generated/lameziaFamiliesChildren.json";',
      "src/test/example.ts",
    ).length,
    0,
  );
});
test("completion cannot be claimed from code or tests alone", async () => {
  const ledger = JSON.parse(
    await readFile(
      path.join(root, "architecture/canonicalisation-ledger.v1.json"),
      "utf8",
    ),
  );
  assert.deepEqual(validateLedger(ledger), []);
  ledger.assets[0].status = "CANONICAL_AND_CONSUMED";
  assert.ok(
    validateLedger(ledger).some((e) => e.startsWith("UNSUPPORTED_COMPLETION:")),
  );
  ledger.assets[0].status = "mostly migrated";
  assert.ok(
    validateLedger(ledger).some((e) => e.startsWith("INVALID_STATUS:")),
  );
});
test("discovery preserves unreviewed files without invented semantic statuses", async () => {
  const r = await inspectCanonicalisation();
  assert.deepEqual(r.errors, []);
  assert.ok(r.counts.unreviewedFiles > 0);
  assert.equal(
    r.counts.discoveredFiles,
    r.counts.unreviewedFiles + r.counts.filesLinkedToReviewedAssets,
  );
  assert.ok(
    r.inventory
      .filter((x) => x.review === "unreviewed")
      .every((x) => x.semanticStatus === null),
  );
  assert.equal(r.productionObservation.writesPerformed, false);
});
test("duplicate evidence is rejected at the registry", async () => {
  const { conceptualCatalog: m } = JSON.parse(
    await readFile(
      path.join(root, "architecture/data-domain-registry.v1.json"),
      "utf8",
    ),
  );
  m.siteSections[0].evidence.push(m.siteSections[0].evidence[0]);
  const errors = validateConceptualCatalog(
    m,
    Object.keys(m.tables),
    m.siteSections.flatMap((s) => [...s.routes, ...s.staticPaths]),
    m.concepts.flatMap((c) => c.terms).filter((t) => t.startsWith("lt:")),
  );
  assert.ok(errors.some((e) => e.startsWith("duplicate section evidence:")));
});
