#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const contractPath = path.join(root, "docs/launch-v0/v0-routes.json");
const reportPath = path.join(root, "docs/launch-v0/current-readiness.md");
const jsonPath = path.join(root, "artifacts/v0-readiness.json");
const uxCopyGatePath = path.join(root, "docs/launch-v0/ux-copy-qa-gate.md");
const routerPath = path.join(root, "artifacts/lamezia-trasparente/src/Router.tsx");
const appPath = path.join(root, "artifacts/lamezia-trasparente/src/App.tsx");
const redirectsPath = path.join(root, "artifacts/lamezia-trasparente/public/_redirects");
const healthzPath = path.join(root, "artifacts/lamezia-trasparente/public/healthz.json");
const pagesDir = path.join(root, "artifacts/lamezia-trasparente/src/pages");

const requiredRoutes = [
  "/",
  "/convocazioni",
  "/convocazioni/demo-consiglio-comunale-v0",
  "/contratti",
  "/pnrr",
  "/redazione",
  "/healthz.json",
  "/fonti-dati",
  "/metodologia",
  "/note-legali",
];
const allowedStatuses = new Set(["pubblicabile", "sperimentale", "in-preparazione", "riservata", "static-marker"]);
const allowedDataModes = new Set(["real", "fixture", "manual", "none", "mixed"]);
const uxCopyManualChecks = [
  "public label clarity",
  "v0 state communication",
  "source/limit note",
  "non-misleading CTA",
  "missing-data language",
  "cautious-copy guardrails",
];

function read(file) {
  return readFileSync(file, "utf8");
}

function issue(severity, code, message, action, route = null) {
  return { severity, code, route, message, action };
}

function countBySeverity(issues, severity) {
  return issues.filter((item) => item.severity === severity).length;
}

function routePattern(pathname) {
  if (pathname === "/") return 'path="/"';
  if (pathname === "/healthz.json") return null;
  if (pathname === "/convocazioni/demo-consiglio-comunale-v0") return 'path="/convocazioni/:id"';
  return `path="${pathname}"`;
}

const issues = [];
if (!existsSync(uxCopyGatePath)) {
  issues.push(issue("P1", "ux-copy-gate-doc-missing", "Checklist QA UX/copy v0 non trovata.", "Creare docs/launch-v0/ux-copy-qa-gate.md e collegarla alla readiness."));
}
if (!existsSync(contractPath)) {
  issues.push(issue("P0", "contract-missing", "Contratto route v0 mancante.", "Creare docs/launch-v0/v0-routes.json."));
}

const contract = existsSync(contractPath) ? JSON.parse(read(contractPath)) : [];
const routesByPath = new Map(contract.map((route) => [route.path, route]));
for (const required of requiredRoutes) {
  if (!routesByPath.has(required)) {
    issues.push(issue("P0", "required-route-undocumented", `Route minima ${required} assente dal contratto.`, "Aggiungere la route al contratto v0.", required));
  }
}

for (const route of contract) {
  for (const key of ["path", "status", "v0Critical", "expectedDataMode", "mustNotErrorBoundary", "requiresSourceAndLimits", "humanCheckRequired", "notes"]) {
    if (!(key in route)) {
      issues.push(issue("P0", "route-field-missing", `Campo ${key} mancante per ${route.path ?? "route senza path"}.`, "Completare il contratto route.", route.path ?? null));
    }
  }
  if (!allowedStatuses.has(route.status)) {
    issues.push(issue("P0", "route-status-invalid", `Stato non valido per ${route.path}: ${route.status}.`, "Usare uno degli stati ammessi.", route.path));
  }
  if (!allowedDataModes.has(route.expectedDataMode)) {
    issues.push(issue("P0", "route-data-mode-invalid", `expectedDataMode non valido per ${route.path}: ${route.expectedDataMode}.`, "Usare real, fixture, manual, none o mixed.", route.path));
  }
}

const router = existsSync(routerPath) ? read(routerPath) : "";
const app = existsSync(appPath) ? read(appPath) : "";
const redirects = existsSync(redirectsPath) ? read(redirectsPath) : "";
const routeResults = contract.map((route) => {
  const checks = [];
  const pattern = routePattern(route.path);
  const present = route.path === "/healthz.json" ? existsSync(healthzPath) : pattern ? router.includes(pattern) || app.includes(pattern) : false;
  checks.push({ name: "routing/static presence", result: present ? "PASS" : "FAIL" });
  if (!present && route.status === "pubblicabile") {
    issues.push(issue("P0", "public-route-not-routed", `${route.path} è pubblicabile ma non risulta nel routing/static fallback.`, "Aggiungere routing o correggere il contratto.", route.path));
  }
  if (route.status === "riservata") {
    const protectedFallback = app.includes('path="/redazione/*?"') && app.includes("RedazioneUnavailablePage");
    checks.push({ name: "reserved preview fallback", result: protectedFallback ? "PASS" : "WARN" });
    if (!protectedFallback) {
      issues.push(issue("P1", "reserved-route-public-risk", `${route.path} richiede verifica: fallback riservato non rilevato.`, "Verificare che la preview pubblica non esponga contenuti ordinari.", route.path));
    }
  }
  if (route.mustNotErrorBoundary) {
    const hasSafetyNet = router.includes("<PublicErrorBoundary>");
    checks.push({ name: "error-boundary policy documented", result: hasSafetyNet ? "PASS" : "WARN" });
  }
  if (route.requiresSourceAndLimits || route.humanCheckRequired) {
    checks.push({ name: "source/limits human review", result: route.humanCheckRequired ? "MANUAL" : "PASS" });
    if (route.humanCheckRequired) {
      for (const checkName of uxCopyManualChecks) {
        checks.push({ name: `UX/copy QA: ${checkName}`, result: "MANUAL" });
      }
      issues.push(issue("P1", "manual-ux-copy-qa", `${route.path} richiede gate QA UX/copy: label pubblica, stato v0, fonte/limiti, CTA, dati mancanti e guardrail cauti.`, "Compilare docs/launch-v0/ux-copy-qa-gate.md per la route e correggere copy fuorviante o accusatorio prima della pubblicazione.", route.path));
    }
  }
  return { ...route, checks, result: checks.some((check) => check.result === "FAIL") ? "FAIL" : checks.some((check) => check.result === "WARN" || check.result === "MANUAL") ? "LIMITED" : "PASS" };
});

if (!existsSync(redirectsPath) || !redirects.includes("/index.html") || !redirects.includes("200")) {
  issues.push(issue("P0", "spa-redirects-missing", "Fallback SPA _redirects assente o incompleto.", "Ripristinare artifacts/lamezia-trasparente/public/_redirects."));
} else {
  issues.push(issue("INFO", "spa-redirects-present", "Fallback SPA _redirects presente.", "Nessuna azione."));
}

if (!existsSync(healthzPath)) {
  issues.push(issue("P0", "healthz-missing", "healthz.json statico assente.", "Ripristinare il marker statico di health."));
} else {
  const healthz = JSON.parse(read(healthzPath));
  if (healthz?.checks?.api !== "not-checked" || healthz?.checks?.worker !== "not-checked" || healthz?.checks?.liveData !== "not-checked") {
    issues.push(issue("P1", "healthz-live-scope-risk", "healthz.json sembra suggerire controlli live fuori scope v0.", "Mantenere il marker statico e documentare i limiti."));
  }
  issues.push(issue("INFO", "healthz-static-marker", "healthz.json presente come marker statico con limiti espliciti.", "Nessuna azione."));
}

const dataDrivenPages = ["Convocazioni.tsx", "Contracts.tsx", "Pnrr.tsx", "Home.tsx"];
for (const page of dataDrivenPages) {
  const file = path.join(pagesDir, page);
  if (existsSync(file)) {
    const body = read(file);
    const riskyOps = (body.match(/\.(map|filter|slice|length)\b/g) ?? []).length;
    const hasEmptyCopy = /non disponibile|non ancora|verifica|fonte|limiti|nessun/i.test(body);
    if (riskyOps > 0 && !hasEmptyCopy) {
      issues.push(issue("P1", "data-empty-state-review", `${page} usa operazioni su liste senza copy evidente di empty state o limiti.`, "Normalizzare dati API e aggiungere stato vuoto prudente.", `/${page.replace(/\.tsx$/, "").toLowerCase()}`));
    } else if (riskyOps > 0) {
      issues.push(issue("P2", "data-operations-reviewed", `${page} usa ${riskyOps} operazioni su liste: verificare che input non normalizzati non producano error boundary.`, "Mantenere fallback/normalizzazione e test di render.", null));
    }
  }
}

issues.push(issue("INFO", "no-live-dependencies", "Il detector legge solo file versionati locali e non richiede backend, segreti, provider o servizi esterni.", "Eseguibile in CI senza costi."));

const p0 = countBySeverity(issues, "P0");
const p1 = countBySeverity(issues, "P1");
const p2 = countBySeverity(issues, "P2");
const outcome = p0 > 0 ? "NO_GO" : p1 > 0 || p2 > 0 ? "GO_WITH_LIMITS" : "GO";
const generatedAt = new Date().toISOString();
const payload = { schemaVersion: "v0-readiness/1", generatedAt, outcome, counts: { P0: p0, P1: p1, P2: p2, INFO: countBySeverity(issues, "INFO") }, reportPath: path.relative(root, reportPath), routeContractPath: path.relative(root, contractPath), uxCopyGatePath: path.relative(root, uxCopyGatePath), uxCopyManualChecks, routeResults, issues };

const table = routeResults.map((route) => `| \`${route.path}\` | ${route.status} | ${route.result} | ${route.checks.map((check) => `${check.name}: ${check.result}`).join("<br>")} |`).join("\n");
const issueTable = issues.map((item) => `| ${item.severity} | ${item.route ? `\`${item.route}\`` : "—"} | ${item.code} | ${item.message} | ${item.action} |`).join("\n");
const report = `# V0 readiness corrente\n\nGenerato: ${generatedAt}\n\n## Esito\n\n**V0 readiness: ${outcome}**\n\n- P0 blockers: ${p0}\n- P1 issues: ${p1}\n- P2 notes: ${p2}\n- INFO: ${payload.counts.INFO}\n\nIl detector è un controllo locale e versionato. Non introduce nuovi dati civici, non effettua scraping, non contatta backend/worker/provider e non pubblica automaticamente.\n\n## Tabella route → stato → risultato\n\n| Route | Stato | Risultato | Controlli |\n| --- | --- | --- | --- |\n${table}\n\n## Issue e azioni consigliate\n\n| Severità | Route | Codice | Evidenza | Azione |\n| --- | --- | --- | --- | --- |\n${issueTable}\n\n## Politiche v0 registrate\n\n- **Error boundary:** ammesso come safety net; una route critica che finisce nel fallback generico è un blocco P0.\n- **Dati mancanti:** una pagina pubblica deve mostrare stato vuoto prudente o messaggio di dato non disponibile/non ancora verificato/fonte non rilevata.\n- **Fonti, limiti e copy:** le route con revisione umana richiesta devono preservare fonti, limiti, stato di verifica e linguaggio non accusatorio.\n- **Gate QA UX/copy:** compilare \`${path.relative(root, uxCopyGatePath)}\` per label pubblica chiara, stato v0, nota fonti/limiti, CTA non fuorviante, linguaggio sui dati mancanti e guardrail cauti.\n- **Deploy/static fallback:** _redirects e healthz.json sono controlli statici; API, worker, live data, DNS e segreti restano fuori scope v0.\n\n## Output machine-readable\n\nJSON: \`${path.relative(root, jsonPath)}\`\n\nChecklist QA UX/copy: \`${path.relative(root, uxCopyGatePath)}\`\n`;

mkdirSync(path.dirname(reportPath), { recursive: true });
mkdirSync(path.dirname(jsonPath), { recursive: true });
writeFileSync(reportPath, report);
writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`);

console.log(`V0 readiness: ${outcome}`);
console.log(`P0 blockers: ${p0}`);
console.log(`P1 issues: ${p1}`);
console.log(`P2 notes: ${p2}`);
console.log(`Report: ${path.relative(root, reportPath)}`);
console.log(`JSON: ${path.relative(root, jsonPath)}`);

process.exit(p0 > 0 ? 1 : 0);
