import { readFile } from "node:fs/promises";

import {
  ELIGENDO_2019_LAMEZIA_SOURCE,
  ELIGENDO_2019_OPEN_DATA_SOURCE,
  HISTORICAL_2019_ELECTED_CANDIDATES,
  HISTORICAL_2019_INSTITUTIONAL_MEMBERSHIPS,
  HISTORICAL_INSTITUTIONAL_OFFICIALS,
} from "../lib/db/src/institutional-officials-data";

type HistoricalSnapshot = {
  checkedAt: string;
  scope: string;
  coverageNote: string;
  sources: {
    eligendoArchive: string;
    eligendoOpenData: string;
  };
  election: {
    date: string;
    municipality: string;
  };
  electedCandidates: {
    name: string;
    slug: string;
    electedCode: string;
    electedLabel: string;
  }[];
  listSeats: {
    candidate: string;
    list: string;
    seats: number;
  }[];
};

function argValue(name: string): string | null {
  const index = process.argv.indexOf(name);
  if (index < 0) return null;
  return process.argv[index + 1] ?? null;
}

function normalizeUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

function snapshotKey(candidate: {
  name: string;
  slug: string;
  electedCode: string;
  electedLabel: string;
}): string {
  return [
    candidate.name,
    candidate.slug,
    candidate.electedCode,
    candidate.electedLabel,
  ].join("|");
}

async function loadSnapshot(path: string): Promise<HistoricalSnapshot> {
  const raw = await readFile(path, "utf8");
  return JSON.parse(raw) as HistoricalSnapshot;
}

function assertSameSet(
  label: string,
  expected: string[],
  actual: string[],
  failures: string[],
): void {
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);
  const missing = expected.filter((item) => !actualSet.has(item));
  const extra = actual.filter((item) => !expectedSet.has(item));
  if (missing.length || extra.length) {
    failures.push(
      `${label}: missing [${missing.join(", ")}], extra [${extra.join(", ")}]`,
    );
  }
}

const snapshotPath = argValue("--snapshot");
if (!snapshotPath) {
  console.error("Missing --snapshot path.");
  process.exit(1);
}

const snapshot = await loadSnapshot(snapshotPath);
const failures: string[] = [];

if (snapshot.scope !== "comunali-lamezia-2019") {
  failures.push(`Unexpected snapshot scope: ${snapshot.scope}`);
}
if (!/copertura parziale/i.test(snapshot.coverageNote)) {
  failures.push("Historical snapshot must keep the partial coverage note.");
}
if (
  normalizeUrl(snapshot.sources.eligendoArchive) !==
  normalizeUrl(ELIGENDO_2019_LAMEZIA_SOURCE.url)
) {
  failures.push("Eligendo archive URL does not match dataset source URL.");
}
if (
  normalizeUrl(snapshot.sources.eligendoOpenData) !==
  normalizeUrl(ELIGENDO_2019_OPEN_DATA_SOURCE.url)
) {
  failures.push("Eligendo Open Data URL does not match dataset source URL.");
}
if (
  snapshot.election.date !== "2019-11-10" ||
  snapshot.election.municipality !== "LAMEZIA TERME"
) {
  failures.push("Historical snapshot election metadata is not Lamezia 2019.");
}

assertSameSet(
  "2019 elected candidates",
  HISTORICAL_2019_ELECTED_CANDIDATES.map(snapshotKey),
  snapshot.electedCandidates.map(snapshotKey),
  failures,
);

assertSameSet(
  "2019 historical officials",
  HISTORICAL_2019_ELECTED_CANDIDATES.map((candidate) => candidate.slug),
  HISTORICAL_INSTITUTIONAL_OFFICIALS.map((official) => official.slug),
  failures,
);

const historicalOfficialStatuses = new Set(
  HISTORICAL_INSTITUTIONAL_OFFICIALS.map((official) => official.status),
);
if (
  historicalOfficialStatuses.size !== 1 ||
  !historicalOfficialStatuses.has("cessato")
) {
  failures.push("Historical officials must be seeded as cessato.");
}

const historicalMembershipsByOrgano = new Map<string, number>();
for (const membership of HISTORICAL_2019_INSTITUTIONAL_MEMBERSHIPS) {
  historicalMembershipsByOrgano.set(
    membership.organoSlug,
    (historicalMembershipsByOrgano.get(membership.organoSlug) ?? 0) + 1,
  );
  if (!/copertura parziale/i.test(membership.notes)) {
    failures.push(
      `${membership.officialSlug}: membership notes must state partial coverage.`,
    );
  }
}

if (historicalMembershipsByOrgano.get("consiglio-comunale") !== 4) {
  failures.push("Expected 4 partial 2019 council memberships.");
}
if (historicalMembershipsByOrgano.get("giunta-comunale") !== 1) {
  failures.push("Expected 1 partial 2019 giunta membership.");
}

const totalListedSeats = snapshot.listSeats.reduce(
  (sum, row) => sum + row.seats,
  0,
);
if (totalListedSeats !== 21) {
  failures.push(
    `Expected listed seats documented in snapshot to sum to 21, got ${totalListedSeats}.`,
  );
}

if (failures.length) {
  console.error("\nInstitutional history QA failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    [
      "Institutional history QA passed:",
      `${HISTORICAL_INSTITUTIONAL_OFFICIALS.length} historical profiles`,
      `${HISTORICAL_2019_INSTITUTIONAL_MEMBERSHIPS.length} memberships`,
      "checked against Eligendo 2019 partial snapshot.",
    ].join(" "),
  );
}
