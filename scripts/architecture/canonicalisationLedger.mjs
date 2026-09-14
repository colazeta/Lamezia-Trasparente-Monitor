import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import ts from "typescript";
export const root = fileURLToPath(new URL("../../", import.meta.url));
export const municipalEvidenceNames = [
  "lameziaDemographicTrend.json",
  "lameziaForeignResidentsAgeSex.json",
  "lameziaFamiliesChildren.json",
];
const statuses = new Set([
  "CANONICAL_AND_CONSUMED",
  "CANONICAL_BUT_LEGACY_CONSUMER_REMAINS",
  "SOURCE_REGISTERED_BUT_NOT_CANONICALISED",
  "STRUCTURED_INFORMATION_OUTSIDE_DATABASE",
  "DERIVED_OUTPUT",
  "RAW_EVIDENCE",
  "APPLICATION_CONFIGURATION",
  "LEGACY_DUPLICATE",
  "REQUIRES_ENTITY_RESOLUTION",
  "UNRESOLVED — INSUFFICIENT EVIDENCE",
]);
export const isTestPath = (file) =>
  /(^|\/)tests?\//.test(file) || /\.(test|spec)\.[mc]?[jt]sx?$/.test(file);
export function literalReferences(source, file) {
  const tree = ts.createSourceFile(
      file,
      source,
      ts.ScriptTarget.Latest,
      true,
      file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    ),
    refs = [];
  function visit(node) {
    if (ts.isStringLiteralLike(node)) {
      const p = node.parent;
      const imported =
        (ts.isImportDeclaration(p) || ts.isExportDeclaration(p)) &&
        p.moduleSpecifier === node;
      const called =
        ts.isCallExpression(p) &&
        p.arguments[0] === node &&
        (p.expression.kind === ts.SyntaxKind.ImportKeyword ||
          (ts.isIdentifier(p.expression) && p.expression.text === "require"));
      refs.push({
        literal: node.text,
        kind: imported || called ? "module" : "literal",
        line: tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1,
      });
    }
    ts.forEachChild(node, visit);
  }
  visit(tree);
  return refs;
}
export function forbiddenMunicipalReferences(source, file) {
  return isTestPath(file)
    ? []
    : literalReferences(source, file).filter((ref) =>
        municipalEvidenceNames.some(
          (name) =>
            ref.literal.split(/[?#]/)[0].endsWith("/" + name) ||
            ref.literal === name,
        ),
      );
}
export function validateLedger(ledger) {
  const errors = [],
    ids = new Set();
  if (
    ledger.schemaVersion !== "lt-canonicalisation-ledger.v1" ||
    !Array.isArray(ledger.assets)
  )
    return ["INVALID_LEDGER"];
  for (const a of ledger.assets) {
    if (!a.id || ids.has(a.id)) errors.push(`DUPLICATE_ASSET:${a.id}`);
    ids.add(a.id);
    if (!statuses.has(a.status)) errors.push(`INVALID_STATUS:${a.id}`);
    if (!/^P[0-4]$/.test(a.priority)) errors.push(`INVALID_PRIORITY:${a.id}`);
    for (const field of [
      "domain",
      "statusBasis",
      "substantiveContent",
      "sourceRegistration",
      "typedCanonicalisation",
      "consumerCutover",
      "legacyWriteStatus",
      "legacyReadStatus",
      "provenanceStatus",
      "validationStatus",
      "productionStatus",
      "residualIssue",
    ])
      if (typeof a[field] !== "string" || !a[field].trim())
        errors.push(`MISSING_GATE:${a.id}:${field}`);
    for (const field of ["locations", "consumers", "canonicalDestination"])
      if (!Array.isArray(a[field]) || !a[field].length)
        errors.push(`MISSING_LOCATIONS:${a.id}:${field}`);
    if (
      a.status === "CANONICAL_AND_CONSUMED" &&
      (!a.productionEvidence || a.productionStatus !== "verified")
    )
      errors.push(`UNSUPPORTED_COMPLETION:${a.id}`);
    for (const p of [...(a.locations ?? []), ...(a.consumers ?? [])])
      if (path.isAbsolute(p) || p.split("/").includes(".."))
        errors.push(`INVALID_PATH:${a.id}`);
  }
  return errors;
}
/** File discovery and literal references are not a substitute for semantic review. */
export async function inspectCanonicalisation(base = root) {
  const ledger = JSON.parse(
      await readFile(
        path.join(base, "architecture/canonicalisation-ledger.v1.json"),
        "utf8",
      ),
    ),
    errors = validateLedger(ledger);
  for (const a of ledger.assets)
    for (const p of [...a.locations, ...a.consumers])
      try {
        await access(path.join(base, p));
      } catch {
        errors.push(`MISSING_ASSET_PATH:${a.id}:${p}`);
      }
  const files = execFileSync(
    "git",
    ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
    { cwd: base, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
  )
    .split("\0")
    .filter(Boolean);
  const within = (f, d) => f === d || f.startsWith(d + "/"),
    inventory = [],
    codeReferences = [];
  for (const f of [...new Set(files)].sort()) {
    if (ledger.scope.discoveryRoots.some((d) => within(f, d))) {
      const bytes = await readFile(path.join(base, f)),
        owners = ledger.assets.filter((a) =>
          a.locations.some((p) => within(f, p)),
        );
      inventory.push({
        path: f,
        bytes: bytes.byteLength,
        sha256: createHash("sha256").update(bytes).digest("hex"),
        reviewedAssetIds: owners.map((a) => a.id),
        semanticStatus: owners.length === 1 ? owners[0].status : null,
        review: owners.length ? "linked-to-bounded-asset-review" : "unreviewed",
      });
    }
    if (
      !f.startsWith("artifacts/") ||
      !f.includes("/src/") ||
      !/\.[mc]?[jt]sx?$/.test(f) ||
      isTestPath(f) ||
      f.includes("/generated/")
    )
      continue;
    const source = await readFile(path.join(base, f), "utf8");
    if (f.startsWith("artifacts/lamezia-trasparente/src/"))
      for (const ref of forbiddenMunicipalReferences(source, f))
        errors.push(
          `LEGACY_MUNICIPAL_CONSUMER:${f}:${ref.line}:${ref.literal}`,
        );
    for (const ref of literalReferences(source, f))
      if (
        /\.(json|geojson|csv|tsv|yaml|yml|xlsx|parquet|pdf)$/.test(
          ref.literal.split(/[?#]/)[0],
        ) &&
        !/^https?:/.test(ref.literal)
      )
        codeReferences.push({
          consumer: f,
          ...ref,
          note: "Literal reference observed; active execution and semantic authority require review.",
        });
  }
  const generator = await readFile(
    path.join(base, "scripts/build-lamezia-opendata-series-status.mjs"),
    "utf8",
  );
  if (municipalEvidenceNames.some((name) => generator.includes(name)))
    errors.push("LEGACY_MUNICIPAL_STATUS_GENERATOR");
  const queue = [...ledger.assets].sort(
    (a, b) => a.priority.localeCompare(b.priority) || a.id.localeCompare(b.id),
  );
  return {
    schemaVersion: "lt-canonicalisation-audit.v1",
    sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: base,
      encoding: "utf8",
    }).trim(),
    ledgerBaselineMain: ledger.baselineMain,
    scope: ledger.scope,
    counts: {
      discoveredFiles: inventory.length,
      filesLinkedToReviewedAssets: inventory.filter(
        (a) => a.review !== "unreviewed",
      ).length,
      unreviewedFiles: inventory.filter((a) => a.review === "unreviewed")
        .length,
      reviewedAssetGroups: queue.length,
      assetGroupsByStatus: Object.fromEntries(
        [...statuses].map((s) => [
          s,
          queue.filter((a) => a.status === s).length,
        ]),
      ),
      literalCodeReferences: codeReferences.length,
    },
    queue,
    inventory,
    codeReferences,
    errors,
    productionObservation: ledger.runtimeObservation,
    productionBlockers: ledger.productionBlockers,
  };
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const report = await inspectCanonicalisation();
  if (process.argv.includes("--write")) {
    const dir = path.join(root, "reports/canonicalisation");
    await mkdir(dir, { recursive: true });
    await writeFile(
      path.join(dir, "audit.json"),
      JSON.stringify(report, null, 2) + "\n",
    );
    await writeFile(
      path.join(dir, "queue.json"),
      JSON.stringify(
        {
          schemaVersion: report.schemaVersion,
          scope: report.scope,
          queue: report.queue,
        },
        null,
        2,
      ) + "\n",
    );
  }
  console.log(
    JSON.stringify({ ...report.counts, errors: report.errors }, null, 2),
  );
  if (report.errors.length) process.exitCode = 1;
}
