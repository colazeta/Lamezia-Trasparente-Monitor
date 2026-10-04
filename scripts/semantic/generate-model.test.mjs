import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { modelProjections, validateSemanticModel } from "./generate-model.mjs";

const registry = JSON.parse(
  await readFile(
    new URL("../../architecture/data-domain-registry.v1.json", import.meta.url),
    "utf8",
  ),
);
const model = registry.conceptualCatalog;
test("semantic model refuses collapsed identity, unowned relations and civic/application conflation", () => {
  assert.deepEqual(validateSemanticModel(model), []);
  const changed = structuredClone(model);
  changed.concepts.find((c) => c.id === "document").rdfClass =
    "lt:PublicationEvent";
  changed.concepts.find((c) => c.id === "application").rdfClass =
    "lt:Application";
  changed.relationships[0].rdfProperty = changed.relationships[1].rdfProperty;
  changed.concepts.find((c) => c.id === "publication").rdfParents = [];
  assert.ok(
    validateSemanticModel(changed).some((e) =>
      e.startsWith("collapsed RDF identity"),
    ),
  );
  assert.ok(
    validateSemanticModel(changed).some((e) => e.startsWith("outside concept")),
  );
  assert.ok(
    validateSemanticModel(changed).some((e) =>
      e.startsWith("missing/duplicate RDF relation"),
    ),
  );
  assert.ok(
    validateSemanticModel(changed).some((e) =>
      e.startsWith("qualified subject lacks identity"),
    ),
  );
});
test("every runtime table is bound to an explicit concept without an invented RDF export", () => {
  const projections = modelProjections(model, "", "");
  const mapping = JSON.parse(
    projections.get(
      "artifacts/lamezia-trasparente/public/semantic/model-mapping.json",
    ),
  );
  assert.equal(
    Object.keys(mapping.tables).length,
    Object.keys(model.tables).length,
  );
  assert.equal(
    mapping.tables.document_publications.rdfClass,
    "lt:PublicationEvent",
  );
  assert.equal(
    mapping.tables.document_acts.rdfClass,
    "lt:AdministrativeDecision",
  );
  assert.equal(
    mapping.tables.document_documents.rdfClass,
    "lt:DocumentResource",
  );
  assert.equal(
    mapping.tables.procurement_mentions.rdfClass,
    "lt:ProcurementMention",
  );
  assert.equal(
    mapping.tables.procurement_contracts.rdfClass,
    "lt:ProcurementContract",
  );
  assert.equal(mapping.tables.conversations.rdfClass, null);
  assert.match(mapping.scope, /not record population/);
});
