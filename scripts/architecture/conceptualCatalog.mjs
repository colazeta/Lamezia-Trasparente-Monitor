import { readFile, access, readdir } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";
import { checkConceptualProjections } from "./renderConceptualCatalog.mjs";

export function routerPaths(source) {
  const file = ts.createSourceFile(
    "Router.tsx",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const paths = new Set();
  const visit = (node) => {
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      ["Route", "PublicRouteWithMeta"].includes(node.tagName.getText(file))
    ) {
      const attribute = node.attributes.properties.find(
        (a) => ts.isJsxAttribute(a) && a.name.getText(file) === "path",
      );
      if (attribute) {
        const initializer = attribute.initializer;
        const value =
          initializer && ts.isJsxExpression(initializer)
            ? initializer.expression
            : initializer;
        if (
          value &&
          (ts.isStringLiteral(value) ||
            ts.isNoSubstitutionTemplateLiteral(value))
        )
          paths.add(value.text);
        else {
          let parent = node.parent;
          while (parent && !ts.isFunctionDeclaration(parent))
            parent = parent.parent;
          const forwardedPath =
            parent?.name?.text === "PublicRouteWithMeta" &&
            value &&
            ts.isIdentifier(value) &&
            value.text === "path";
          if (!forwardedPath)
            throw new Error(
              "Unsupported dynamic route path: classify the route explicitly before extending the scanner",
            );
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return [...paths];
}

export function validateConceptualCatalog(
  model,
  tableNames,
  routeNames,
  localClasses,
) {
  const problems = [];
  const unique = (items, label) => {
    const ids = items.map((x) => x.id);
    if (new Set(ids).size !== ids.length) problems.push(`duplicate ${label}`);
    return new Set(ids);
  };
  const domains = unique(model.domains, "domain"),
    concepts = unique(model.concepts, "concept");
  unique(model.siteSections, "site section");
  unique(model.overlaps, "overlap decision");
  const kinds = new Set([
    "entity",
    "source",
    "relation",
    "projection",
    "legacy",
    "editorial",
    "operation",
    "application",
  ]);
  const semanticStates = new Set([
    "local",
    "partial",
    "reference",
    "gap",
    "outside",
  ]);
  const storageStates = new Set([
    "files",
    "api",
    "api_and_files",
    "files_with_snapshot_ledger",
    "files_with_domain_projection",
    "editorial",
    "redirect",
  ]);
  const tables = model.tables;
  for (const name of tableNames)
    if (!tables[name]) problems.push(`unclassified table: ${name}`);
  for (const [name, entry] of Object.entries(tables)) {
    if (!tableNames.includes(name)) problems.push(`unknown table: ${name}`);
    if (!domains.has(entry.domain) || !concepts.has(entry.concept))
      problems.push(`invalid classification: ${name}`);
    if (!entry.label || !entry.grain)
      problems.push(`missing grain or label: ${name}`);
    if (!kinds.has(entry.kind)) problems.push(`invalid table role: ${name}`);
  }
  for (const c of model.concepts) {
    if (!c.definition || !c.identityRule)
      problems.push(`undefined concept: ${c.id}`);
    if (!semanticStates.has(c.semanticCoverage))
      problems.push(`invalid semantic coverage: ${c.id}`);
    for (const term of c.terms)
      if (term.startsWith("lt:") && !localClasses.includes(term))
        problems.push(`undeclared RDF class: ${term}`);
  }
  const routes = model.siteSections.flatMap((s) => [
    ...s.routes,
    ...(s.staticPaths ?? []),
  ]);
  if (new Set(routes).size !== routes.length)
    problems.push("route has multiple owners");
  for (const route of routeNames)
    if (!routes.includes(route)) problems.push(`unclassified route: ${route}`);
  for (const route of routes)
    if (!routeNames.includes(route)) problems.push(`stale route: ${route}`);
  for (const section of model.siteSections) {
    if (
      !domains.has(section.domain) ||
      section.concepts.some((c) => !concepts.has(c))
    )
      problems.push(`invalid section concepts: ${section.id}`);
    if (section.tables.some((t) => !tables[t]))
      problems.push(`unknown section table: ${section.id}`);
    if (!section.note || !section.evidence.length)
      problems.push(`missing section evidence: ${section.id}`);
    if (
      !storageStates.has(section.storage) ||
      !semanticStates.has(section.semanticCoverage) ||
      !section.navigationGroup
    )
      problems.push(`invalid section coverage: ${section.id}`);
  }
  for (const relation of model.relationships) {
    if (!concepts.has(relation.source) || !concepts.has(relation.target))
      problems.push("unknown relationship endpoint");
    if (
      !["1:N", "N:1", "N:M", "1:1"].includes(relation.cardinality) ||
      !["implemented", "partial", "target"].includes(relation.status) ||
      !relation.label
    )
      problems.push("invalid relationship meaning");
  }
  for (const overlap of model.overlaps)
    if (overlap.tables.some((t) => !tables[t]))
      problems.push(`unknown overlap table: ${overlap.id}`);
  return problems;
}

export async function checkConceptualCatalog(root, registry, tableNames) {
  const router = await readFile(
    path.join(root, "artifacts/lamezia-trasparente/src/Router.tsx"),
    "utf8",
  );
  const ontology = await readFile(
    path.join(
      root,
      "artifacts/lamezia-trasparente/public/semantic/ontology.ttl",
    ),
    "utf8",
  );
  const routes = routerPaths(router);
  const publicFiles = await readdir(
    path.join(root, "artifacts/lamezia-trasparente/public"),
    { recursive: true },
  );
  routes.push(
    ...publicFiles
      .filter((file) => file.endsWith(".html"))
      .map((file) => `/${file.replace(/index\.html$/, "")}`),
  );
  const classes = [...ontology.matchAll(/(lt:\w+) a owl:Class/g)].map(
    (m) => m[1],
  );
  const model = registry.conceptualCatalog;
  if (!model) throw new Error("Missing conceptual catalog");
  const problems = validateConceptualCatalog(
    model,
    tableNames,
    routes,
    classes,
  );
  for (const file of new Set(model.siteSections.flatMap((s) => s.evidence))) {
    if (file.startsWith("/") || file.split("/").includes("..")) {
      problems.push(`unsafe evidence path: ${file}`);
      continue;
    }
    try {
      await access(path.join(root, file));
    } catch {
      problems.push(`missing evidence file: ${file}`);
    }
  }
  if (problems.length)
    throw new Error(`Conceptual catalog: ${problems.join("; ")}`);
  await checkConceptualProjections(root, model);
}
