import { readFile } from "node:fs/promises";

import {
  CURRENT_2025_ELECTORAL_CONTEXT,
  CURRENT_2025_ELECTORAL_CONTEXT_SOURCE,
  CURRENT_COUNCIL_MEMBER_SLUGS,
  CURRENT_GIUNTA_MEMBER_SLUGS,
  CURRENT_INSTITUTIONAL_OFFICIALS,
  type Current2025ElectoralContext,
} from "../lib/db/src/institutional-officials-data";

type ElectoralContextSnapshot = {
  checkedAt: string;
  scope: string;
  coverageNote: string;
  sources: {
    comunePage: string;
    sourceDocumentsCsv: string;
  };
  contexts: {
    slug: string;
    name: string;
    contextType: "candidato_sindaco" | "candidato_consigliere";
    candidateName: string;
    listName?: string;
    sourceDocId: string;
  }[];
  unmatchedCurrentGiuntaSlugs: string[];
};

function argValue(name: string): string | null {
  const index = process.argv.indexOf(name);
  if (index < 0) return null;
  return process.argv[index + 1] ?? null;
}

function sorted(values: readonly string[]): string[] {
  return [...values].sort((a, b) => a.localeCompare(b, "it"));
}

async function loadSnapshot(path: string): Promise<ElectoralContextSnapshot> {
  const raw = await readFile(path, "utf8");
  return JSON.parse(raw) as ElectoralContextSnapshot;
}

const snapshotPath = argValue("--snapshot");
if (!snapshotPath) {
  console.error("Missing --snapshot path.");
  process.exit(1);
}

const snapshot = await loadSnapshot(snapshotPath);
const failures: string[] = [];

if (snapshot.scope !== "current-electoral-context-2025") {
  failures.push(`Unexpected electoral context scope: ${snapshot.scope}`);
}
if (snapshot.checkedAt !== CURRENT_2025_ELECTORAL_CONTEXT_SOURCE.checkedAt) {
  failures.push(
    `Snapshot checkedAt ${snapshot.checkedAt} does not match source ${CURRENT_2025_ELECTORAL_CONTEXT_SOURCE.checkedAt}.`,
  );
}
if (snapshot.sources.comunePage !== CURRENT_2025_ELECTORAL_CONTEXT_SOURCE.url) {
  failures.push("Snapshot Comune page URL does not match source constant.");
}
if (!snapshot.coverageNote.includes("non gruppo consiliare")) {
  failures.push("Coverage note must preserve the electoral-context limit.");
}

const officialsBySlug = new Map(
  CURRENT_INSTITUTIONAL_OFFICIALS.map((official) => [official.slug, official]),
);
const contextEntries = Object.entries(CURRENT_2025_ELECTORAL_CONTEXT) as [
  string,
  Current2025ElectoralContext,
][];
const contextBySlug = new Map(contextEntries);
const snapshotBySlug = new Map(
  snapshot.contexts.map((context) => [context.slug, context]),
);

if (snapshot.contexts.length !== contextEntries.length) {
  failures.push(
    `Snapshot context count ${snapshot.contexts.length} does not match seed count ${contextEntries.length}.`,
  );
}
if (contextEntries.length !== 28) {
  failures.push(`Expected 28 current electoral context rows, got ${contextEntries.length}.`);
}

for (const [slug, context] of contextEntries) {
  const official = officialsBySlug.get(slug);
  const snapshotContext = snapshotBySlug.get(slug);
  if (!official) {
    failures.push(`Electoral context references unknown official slug ${slug}.`);
    continue;
  }
  if (!snapshotContext) {
    failures.push(`Snapshot missing electoral context for ${slug}.`);
    continue;
  }
  if (snapshotContext.name !== official.name) {
    failures.push(
      `Snapshot name for ${slug} is ${snapshotContext.name}, expected ${official.name}.`,
    );
  }
  if (snapshotContext.contextType !== context.contextType) {
    failures.push(`Context type mismatch for ${slug}.`);
  }
  if (snapshotContext.candidateName !== context.candidateName) {
    failures.push(`Candidate name mismatch for ${slug}.`);
  }
  if (snapshotContext.listName !== context.listName) {
    failures.push(`List name mismatch for ${slug}.`);
  }
  if (snapshotContext.sourceDocId !== context.sourceDocId) {
    failures.push(`Source document mismatch for ${slug}.`);
  }
  if (context.contextType === "candidato_consigliere" && !context.listName) {
    failures.push(`Council candidate context ${slug} must have a list name.`);
  }
  if (context.contextType === "candidato_sindaco" && context.listName) {
    failures.push(`Mayor candidate context ${slug} must not have a list name.`);
  }
  if (!official.biographyNote?.includes("Dato elettorale di contesto")) {
    failures.push(`Official ${slug} must expose the electoral context note.`);
  }
}

const councilMissing = CURRENT_COUNCIL_MEMBER_SLUGS.filter(
  (slug) => !contextBySlug.has(slug),
);
if (councilMissing.length) {
  failures.push(
    `Current council members missing electoral context: ${councilMissing.join(", ")}.`,
  );
}

const giuntaUnmatched = CURRENT_GIUNTA_MEMBER_SLUGS.filter(
  (slug) => !contextBySlug.has(slug),
);
const expectedGiuntaUnmatched = [
  "maria-nardo",
  "michelangelo-cardamone",
  "salvatore-pirelli",
];
if (
  sorted(giuntaUnmatched).join("|") !== sorted(expectedGiuntaUnmatched).join("|")
) {
  failures.push(
    `Unexpected current Giunta unmatched slugs: ${giuntaUnmatched.join(", ")}.`,
  );
}
if (
  sorted(snapshot.unmatchedCurrentGiuntaSlugs).join("|") !==
  sorted(expectedGiuntaUnmatched).join("|")
) {
  failures.push("Snapshot unmatched Giunta slugs do not match expected gaps.");
}

const murone = CURRENT_2025_ELECTORAL_CONTEXT["mario-murone"];
if (murone.contextType !== "candidato_sindaco") {
  failures.push("Mario Murone must be recorded as candidate mayor context.");
}
const grandinetti = CURRENT_2025_ELECTORAL_CONTEXT["maria-grandinetti"];
if (
  grandinetti.contextType !== "candidato_consigliere" ||
  grandinetti.listName !== "FORZA ITALIA"
) {
  failures.push("Maria Grandinetti electoral context must preserve Forza Italia.");
}

if (failures.length) {
  console.error("Institutional electoral context QA failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Institutional electoral context QA passed: ${contextEntries.length} current contexts checked.`,
);
