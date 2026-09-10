import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "..");
const smokeScript = readFileSync(
  path.join(repoRoot, "scripts/check-public-contracts-page.mjs"),
  "utf8",
);
const workflow = readFileSync(
  path.join(repoRoot, ".github/workflows/cloudflare-pages-deploy.yml"),
  "utf8",
);
const provenance = JSON.parse(
  readFileSync(
    path.join(
      repoRoot,
      "artifacts/lamezia-trasparente/public/deploy-provenance.json",
    ),
    "utf8",
  ),
);

const stableContractMarkers = [
  "contracts-search",
  "contracts-list",
  "Contratti nel perimetro",
  "I dati mancanti non sono trattati come zero",
];

const obsoleteCopyMarkers = [
  "Contratti protagonisti",
  "La storia documentale del contratto",
  "Attiva · perimetro corrente",
  "Albo Pretorio corrente",
  "Filtro pubblico e privacy",
  "Stato dei fascicoli contrattuali",
  "Copertura fasi",
  "Ponte BDNCP",
  "Dataset ANAC",
];

test("production smoke permits supersession only after GitHub ancestry checks", () => {
  assert.match(smokeScript, /--allow-newer-main/);
  assert.match(
    smokeScript,
    /compare\/\$\{(?:expectedCommit|expected)\}\.\.\.\$\{(?:observedCommit|observed)\}/,
  );
  assert.match(
    smokeScript,
    /compare\/\$\{(?:observedCommit|observed)\}\.\.\.\$\{mainCommit\}/,
  );
  assert.match(
    smokeScript,
    /(?:expectedToObserved|comparison)\.status !== "ahead"/,
  );
  assert.match(
    smokeScript,
    /(?:observedToMain|productionToMain)\.status !== "ahead"/,
  );
  assert.match(workflow, /GITHUB_TOKEN: \$\{\{ github\.token \}\}/);
  assert.match(workflow, /--expected-commit "\$GITHUB_SHA" --allow-newer-main/);
});

test("deployment contract uses stable structural and civic markers instead of retired copy", () => {
  for (const marker of stableContractMarkers) {
    assert.ok(
      provenance.requiredMarkers.includes(marker),
      `missing stable provenance marker: ${marker}`,
    );
    assert.ok(smokeScript.includes(marker), `missing smoke marker: ${marker}`);
  }

  for (const marker of obsoleteCopyMarkers) {
    assert.ok(
      !provenance.requiredMarkers.includes(marker),
      `obsolete copy must not remain a deployment marker: ${marker}`,
    );
    assert.ok(
      !smokeScript.includes(marker),
      `obsolete copy must not remain a smoke requirement: ${marker}`,
    );
  }
});

test("workflow keeps the live smoke post-deploy and exact expected SHA as its baseline", () => {
  assert.match(workflow, /concurrency:[\s\S]*cancel-in-progress: true/);
  assert.match(workflow, /Smoke generated static fallback/);
  assert.match(workflow, /Smoke public contracts and organi routes/);
  assert.match(workflow, /--attempts 60 --delay-ms 10000/);
});
