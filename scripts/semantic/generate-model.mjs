import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const assets = "artifacts/lamezia-trasparente/public/semantic";
const literal = (value) => JSON.stringify(value);
const UUID7 =
  "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$";
const local = /^lt:[A-Za-z][A-Za-z0-9]*$/;

export function validateSemanticModel(model) {
  const errors = [];
  const classes = new Set();
  const ids = new Set(model.concepts.map((c) => c.id));
  for (const concept of model.concepts) {
    if (concept.semanticCoverage === "outside") {
      if (concept.rdfClass !== null || concept.rdfValidation !== null)
        errors.push(`outside concept has RDF identity: ${concept.id}`);
      continue;
    }
    if (
      !local.test(concept.rdfClass ?? "") ||
      !concept.terms.includes(concept.rdfClass)
    )
      errors.push(`missing primary RDF class: ${concept.id}`);
    if (classes.has(concept.rdfClass))
      errors.push(`collapsed RDF identity: ${concept.id}`);
    classes.add(concept.rdfClass);
    if (typeof concept.rdfValidation?.provenanceRequired !== "boolean")
      errors.push(`missing RDF validation policy: ${concept.id}`);
    const { subjectKind, domainType } = concept.rdfValidation ?? {};
    if (
      Boolean(subjectKind) !== Boolean(domainType) ||
      (subjectKind && !["entity", "event"].includes(subjectKind))
    )
      errors.push(`invalid qualified subject: ${concept.id}`);
    if (subjectKind && !concept.rdfParents?.includes("lt:CanonicalSubject"))
      errors.push(
        `qualified subject lacks identity constraints: ${concept.id}`,
      );
  }
  for (const concept of model.concepts)
    for (const parent of concept.rdfParents ?? [])
      if (!classes.has(parent))
        errors.push(`unknown RDF parent: ${concept.id}`);
  const properties = new Set();
  for (const relation of model.relationships) {
    if (
      !local.test(relation.rdfProperty ?? "") ||
      properties.has(relation.rdfProperty)
    )
      errors.push(`missing/duplicate RDF relation: ${relation.label}`);
    properties.add(relation.rdfProperty);
    for (const endpoint of [relation.source, relation.target])
      if (!model.concepts.find((c) => c.id === endpoint)?.rdfClass)
        errors.push(`unmapped relation endpoint: ${endpoint}`);
  }
  for (const [name, table] of Object.entries(model.tables))
    if (!ids.has(table.concept)) errors.push(`unmapped table: ${name}`);
  if (
    !/^\d+\.\d+\.\d+$/.test(model.semanticProfile?.version ?? "") ||
    !/^\d{4}-\d{2}-\d{2}$/.test(model.semanticProfile?.modifiedAt ?? "") ||
    model.semanticProfile?.namespace !==
      "https://lamezia-trasparente.pages.dev/ontology#"
  )
    errors.push("invalid semantic profile metadata");
  return errors;
}

function property(path, body) {
  return `  sh:property [ sh:path ${path} ; ${body} ]`;
}

export function modelProjections(model, ontologyTemplate, shapesTemplate) {
  const errors = validateSemanticModel(model);
  if (errors.length) throw new Error(errors.join("; "));
  const profile = model.semanticProfile;
  const civic = model.concepts.filter((c) => c.rdfClass);
  const classFor = (id) => model.concepts.find((c) => c.id === id).rdfClass;
  const template = (text) =>
    text
      .replaceAll("{{VERSION}}", profile.version)
      .replaceAll("{{MODIFIED}}", profile.modifiedAt);
  const generated =
    "# Generated from architecture/data-domain-registry.v1.json. Run node scripts/semantic/generate-model.mjs --write.\n";
  const annotations = [
    "conceptKey",
    "identityRule",
    "modelCardinality",
    "implementationStatus",
  ]
    .map((name) => `lt:${name} a owl:AnnotationProperty .`)
    .join("\n");
  const properties = [
    "lt:subjectKind a owl:DatatypeProperty ; rdfs:range xsd:string .",
    "lt:domainType a owl:DatatypeProperty ; rdfs:range xsd:string .",
    "lt:publicationVisibility a owl:DatatypeProperty ; rdfs:range xsd:string .",
    "lt:resolutionStatus a owl:DatatypeProperty ; rdfs:range xsd:string .",
    "lt:resolvedSubject a owl:ObjectProperty ; rdfs:range lt:CanonicalSubject .",
    "lt:classificationStatus a owl:DatatypeProperty ; rdfs:range xsd:string .",
    "lt:assignedConcept a owl:ObjectProperty ; rdfs:range lt:TaxonomyConcept .",
    "lt:classificationMethod a owl:DatatypeProperty ; rdfs:range xsd:string .",
    "lt:classificationFacet a owl:DatatypeProperty ; rdfs:range xsd:string .",
    "lt:publicationPolicyVersion a owl:DatatypeProperty ; rdfs:range xsd:string .",
  ].join("\n");
  const ontology =
    template(ontologyTemplate) +
    "\n" +
    generated +
    annotations +
    "\n" +
    properties +
    "\n\n" +
    civic
      .map(
        (c) =>
          [
            `${c.rdfClass} a owl:Class`,
            `  rdfs:label ${literal(c.label)}@it`,
            `  rdfs:comment ${literal(c.definition)}@it`,
            `  lt:conceptKey ${literal(c.id)}`,
            `  lt:identityRule ${literal(c.identityRule)}@it`,
            ...(c.rdfParents?.length
              ? [`  rdfs:subClassOf ${c.rdfParents.join(" , ")}`]
              : []),
          ].join(" ;\n") + " .",
      )
      .join("\n\n") +
    "\n\n" +
    model.relationships
      .map(
        (r) =>
          [
            `${r.rdfProperty} a owl:ObjectProperty`,
            `  rdfs:label ${literal(r.label)}@it`,
            `  rdfs:domain ${classFor(r.source)}`,
            `  rdfs:range ${classFor(r.target)}`,
            `  lt:modelCardinality ${literal(r.cardinality)}`,
            `  lt:implementationStatus ${literal(r.status)}`,
          ].join(" ;\n") + " .",
      )
      .join("\n\n") +
    "\n";

  const separated = [
    "lt:PublicationEvent",
    "lt:AdministrativeDecision",
    "lt:DocumentResource",
  ];
  const procurement = [
    "lt:ProcurementProcedure",
    "lt:ProcurementLot",
    "lt:ProcurementContract",
    "lt:ProcurementMention",
    "lt:ProcurementFinancialEvent",
  ];
  const shapeFor = (c) => {
    const clauses = [
      `  sh:targetClass ${c.rdfClass}`,
      property(
        "dct:identifier",
        "sh:minCount 1 ; sh:maxCount 1 ; sh:datatype xsd:string ; sh:minLength 1",
      ),
    ];
    if (c.rdfValidation.provenanceRequired)
      clauses.push(
        property("prov:wasDerivedFrom", "sh:minCount 1 ; sh:nodeKind sh:IRI"),
      );
    if (c.id === "identity") {
      clauses.push(property("dct:identifier", `sh:pattern ${literal(UUID7)}`));
      clauses.push(
        property(
          "lt:subjectKind",
          'sh:minCount 1 ; sh:maxCount 1 ; sh:in ( "entity" "event" )',
        ),
      );
      clauses.push(
        property(
          "lt:domainType",
          "sh:minCount 1 ; sh:maxCount 1 ; sh:datatype xsd:string ; sh:minLength 1",
        ),
      );
    }
    if (c.rdfValidation.subjectKind) {
      clauses.push(
        property(
          "lt:subjectKind",
          `sh:hasValue ${literal(c.rdfValidation.subjectKind)}`,
        ),
      );
      clauses.push(
        property(
          "lt:domainType",
          `sh:hasValue ${literal(c.rdfValidation.domainType)}`,
        ),
      );
    }
    for (const group of [separated, procurement])
      if (group.includes(c.rdfClass))
        for (const other of group.filter((cls) => cls !== c.rdfClass))
          clauses.push(`  sh:not [ sh:class ${other} ]`);
    if (c.id === "procurement_mention")
      clauses.push(property("lt:describesContract", "sh:maxCount 0"));
    if (c.id === "publication_version") {
      clauses.push(
        property(
          "lt:publicationVisibility",
          'sh:minCount 1 ; sh:maxCount 1 ; sh:in ( "publishable" "metadata_only" "do_not_publish" )',
        ),
      );
      clauses.push(
        `  sh:or ( [ ${property("lt:publicationVisibility", 'sh:hasValue "publishable"').trim()} ; ${property("lt:publicationPolicyVersion", "sh:minCount 1 ; sh:maxCount 1 ; sh:datatype xsd:string ; sh:minLength 1").trim()} ] [ ${property("lt:publicationVisibility", 'sh:not [ sh:in ( "publishable" ) ]').trim()} ; ${property("dct:title", "sh:maxCount 0").trim()} ] )`,
      );
    }
    if (c.id === "resolution") {
      clauses.push(
        property(
          "lt:resolutionStatus",
          'sh:minCount 1 ; sh:maxCount 1 ; sh:in ( "resolved" "unresolved" "not_applicable" "no_canonical_target" "insufficient_evidence" "review_required" )',
        ),
      );
      clauses.push(
        `  sh:xone ( [ ${property("lt:resolutionStatus", 'sh:hasValue "resolved"').trim()} ; ${property("lt:resolvedSubject", "sh:minCount 1 ; sh:maxCount 1 ; sh:class lt:CanonicalSubject").trim()} ] [ ${property("lt:resolutionStatus", 'sh:not [ sh:in ( "resolved" ) ]').trim()} ; ${property("lt:resolvedSubject", "sh:maxCount 0").trim()} ] )`,
      );
    }
    if (c.id === "classification") {
      clauses.push(
        property(
          "lt:classificationStatus",
          'sh:minCount 1 ; sh:maxCount 1 ; sh:in ( "classified" "unknown" "not_applicable" "insufficient_evidence" "review_required" )',
        ),
      );
      clauses.push(
        property(
          "lt:classificationMethod",
          "sh:minCount 1 ; sh:maxCount 1 ; sh:datatype xsd:string ; sh:minLength 1",
        ),
      );
      clauses.push(
        property(
          "lt:classificationFacet",
          "sh:minCount 1 ; sh:maxCount 1 ; sh:datatype xsd:string ; sh:minLength 1",
        ),
      );
      clauses.push(
        `  sh:xone ( [ ${property("lt:classificationStatus", 'sh:hasValue "classified"').trim()} ; ${property("lt:assignedConcept", "sh:minCount 1 ; sh:maxCount 1 ; sh:class lt:TaxonomyConcept").trim()} ] [ ${property("lt:classificationStatus", 'sh:not [ sh:in ( "classified" ) ]').trim()} ; ${property("lt:assignedConcept", "sh:maxCount 0").trim()} ] )`,
      );
    }
    if (c.id === "public_projection")
      clauses.push(
        property(
          "lt:publicationPolicyVersion",
          "sh:minCount 1 ; sh:maxCount 1 ; sh:datatype xsd:string ; sh:minLength 1",
        ),
      );
    return `${c.rdfClass}ModelShape a sh:NodeShape ;\n${clauses.join(" ;\n")} .`;
  };
  const shapes =
    template(shapesTemplate) +
    "\n@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n\n" +
    generated +
    civic.map(shapeFor).join("\n\n") +
    "\n";
  const mapping = {
    schemaVersion: "lt-semantic-model-mapping.v1",
    profileVersion: profile.version,
    modelVersion: model.version,
    scope: profile.scope,
    concepts: model.concepts.map((c) => ({
      id: c.id,
      rdfClass: c.rdfClass,
      definition: c.definition,
      identityRule: c.identityRule,
      validation: c.rdfValidation,
      parents: c.rdfParents ?? [],
    })),
    tables: Object.fromEntries(
      Object.entries(model.tables)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, t]) => [name, { ...t, rdfClass: classFor(t.concept) }]),
    ),
    relationships: model.relationships,
  };
  return new Map([
    [`${assets}/ontology.ttl`, ontology],
    [`${assets}/shapes.ttl`, shapes],
    [`${assets}/model-mapping.json`, JSON.stringify(mapping, null, 2) + "\n"],
  ]);
}

export async function checkSemanticProjections(repoRoot, model) {
  const [ontology, shapes] = await Promise.all(
    ["ontology", "shapes"].map((name) =>
      readFile(
        path.join(
          repoRoot,
          `scripts/semantic/templates/${name}-compatibility.ttl`,
        ),
        "utf8",
      ),
    ),
  );
  for (const [relative, expected] of modelProjections(model, ontology, shapes))
    if ((await readFile(path.join(repoRoot, relative), "utf8")) !== expected)
      throw new Error(
        `Stale semantic projection: ${relative}. Run node scripts/semantic/generate-model.mjs --write`,
      );
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const model = JSON.parse(
    await readFile(
      path.join(root, "architecture/data-domain-registry.v1.json"),
      "utf8",
    ),
  ).conceptualCatalog;
  if (process.argv.includes("--write")) {
    const [ontology, shapes] = await Promise.all(
      ["ontology", "shapes"].map((name) =>
        readFile(
          path.join(
            root,
            `scripts/semantic/templates/${name}-compatibility.ttl`,
          ),
          "utf8",
        ),
      ),
    );
    for (const [relative, content] of modelProjections(model, ontology, shapes))
      await writeFile(path.join(root, relative), content);
    console.log(`Generated semantic model: ${model.semanticProfile.version}`);
  } else {
    await checkSemanticProjections(root, model);
    console.log("Semantic projections are current.");
  }
}
