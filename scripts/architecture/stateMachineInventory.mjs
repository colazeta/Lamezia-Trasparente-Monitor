import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = fileURLToPath(new URL("../../", import.meta.url));
const output = path.join(
  root,
  "docs/architecture/state-machine-inventory.json",
);
const excluded =
  /(?:^|\/)(?:node_modules|dist|build|static-build|\.expo|generated|__generated__|fixtures|__fixtures__)(?:\/|$)|\.(?:test|spec)\.[cm]?[jt]sx?$/;
const hooks =
  /^(?:useState|useReducer|useQuery|useInfiniteQuery|useMutation|useSyncExternalStore|use[A-Z].*(?:Query|Mutation))$/;
const timers = new Set(["setTimeout", "setInterval", "AbortController"]);

function files(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name, "en"))
    .flatMap((entry) => {
      const full = path.join(directory, entry.name);
      const relative = path.relative(root, full).split(path.sep).join("/");
      if (excluded.test(relative) || entry.isSymbolicLink()) return [];
      if (entry.isDirectory()) return files(full);
      return /\.[cm]?[jt]sx?$/.test(entry.name) && !/\.d\.ts$/.test(entry.name)
        ? [full]
        : [];
    });
}

// Evidence of state ownership/coordination, not a proof that every hit is a machine.
function inspect(file) {
  const text = fs.readFileSync(file, "utf8");
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const evidence = [];
  function add(node, kind, symbol) {
    evidence.push({
      line:
        source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
      kind,
      symbol,
    });
  }
  function visit(node) {
    if (ts.isCallExpression(node) || ts.isNewExpression(node)) {
      const callee = node.expression;
      const name = ts.isIdentifier(callee)
        ? callee.text
        : ts.isPropertyAccessExpression(callee)
          ? callee.name.text
          : "";
      if (hooks.test(name)) {
        const owner = ts.isVariableDeclaration(node.parent)
          ? node.parent.name.getText(source)
          : name;
        add(
          node,
          name === "useReducer"
            ? "reducer"
            : name === "useState"
              ? "local-state"
              : "async-state",
          owner,
        );
      } else if (timers.has(name)) {
        add(node, "temporal-control", name);
      } else if (
        ts.isPropertyAccessExpression(callee) &&
        /(?:localStorage|sessionStorage|AsyncStorage)/.test(
          callee.expression.getText(source),
        )
      ) {
        add(node, "persisted-state", callee.getText(source));
      }
    }
    if (
      (ts.isPropertySignature(node) || ts.isPropertyAssignment(node)) &&
      node.name &&
      /^(?:status|state|phase|stage|mode)$/.test(
        node.name.getText(source).replace(/["']/g, ""),
      )
    ) {
      const value = ts.isPropertySignature(node) ? node.type : node.initializer;
      if (
        value &&
        (ts.isStringLiteral(value) ||
          ts.isLiteralTypeNode(value) ||
          ts.isUnionTypeNode(value))
      ) {
        add(
          node,
          "state-discriminant",
          `${node.name.getText(source)}: ${value.getText(source).replace(/\s+/g, " ").slice(0, 200)}`,
        );
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return evidence.length
    ? { file: path.relative(root, file).split(path.sep).join("/"), evidence }
    : null;
}

const scanned = ["artifacts", "lib", "scripts"]
  .flatMap((dir) => files(path.join(root, dir)))
  .filter((file) => file !== fileURLToPath(import.meta.url));
const entries = scanned.map(inspect).filter(Boolean);
const inventory = {
  schemaVersion: 1,
  scope:
    "Tracked-style source trees: artifacts, lib, scripts; excludes dependencies, build outputs, generated directories, tests and fixtures. Static candidates require semantic review; dynamically computed or external/provider-owned machines may be absent.",
  regenerate: "node scripts/architecture/stateMachineInventory.mjs --write",
  scannedFiles: scanned.length,
  candidateFiles: entries.length,
  evidenceCount: entries.reduce((sum, item) => sum + item.evidence.length, 0),
  entries,
};
const serialised = `${JSON.stringify(inventory, null, 2)}\n`;
if (process.argv.includes("--write")) fs.writeFileSync(output, serialised);
else if (fs.readFileSync(output, "utf8") !== serialised) {
  console.error("State-machine inventory is stale; regenerate with --write.");
  process.exitCode = 1;
}
console.log(
  `${inventory.candidateFiles} candidate files; ${inventory.evidenceCount} evidence sites in ${inventory.scannedFiles} source files.`,
);
