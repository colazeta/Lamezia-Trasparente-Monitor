import { readFile } from "node:fs/promises";

import {
  COMMISSION_2025_DOCUMENT_URL,
  COMMISSION_2025_SOURCE,
  HISTORICAL_2025_COMMISSION_COMPOSITIONS,
  HISTORICAL_2025_COMMISSION_MEMBERSHIPS,
  HISTORICAL_2025_COMMISSION_OFFICIALS,
  INSTITUTIONAL_COMMISSION_ORGANI,
  INSTITUTIONAL_OFFICIALS,
} from "../lib/db/src/institutional-officials-data";

type CommissionSnapshot = {
  checkedAt: string;
  scope: string;
  coverageNote: string;
  sources: {
    documentPage: string;
    documentFile: string;
  };
  document: {
    protocol: string;
    date: string;
    title: string;
    issuer: string;
  };
  commissions: {
    organoSlug: string;
    sourceTitle: string;
    members: {
      sourceName: string;
      group: string;
      sourceNumber: number;
    }[];
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

function memberKey(member: {
  organoSlug: string;
  sourceName: string;
  group: string;
  sourceNumber: number;
}): string {
  return [
    member.organoSlug,
    member.sourceName,
    member.group,
    String(member.sourceNumber),
  ].join("|");
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

async function loadSnapshot(path: string): Promise<CommissionSnapshot> {
  const raw = await readFile(path, "utf8");
  return JSON.parse(raw) as CommissionSnapshot;
}

const snapshotPath = argValue("--snapshot");
if (!snapshotPath) {
  console.error("Missing --snapshot path.");
  process.exit(1);
}

const snapshot = await loadSnapshot(snapshotPath);
const failures: string[] = [];

if (snapshot.scope !== "commissioni-consiliari-lamezia-2025") {
  failures.push(`Unexpected snapshot scope: ${snapshot.scope}`);
}
if (!/non va presentata come composizione corrente 2026/i.test(snapshot.coverageNote)) {
  failures.push("Commission snapshot must keep the historical coverage note.");
}
if (
  normalizeUrl(snapshot.sources.documentPage) !==
  normalizeUrl(COMMISSION_2025_SOURCE.url)
) {
  failures.push("Commission source page URL does not match dataset source URL.");
}
if (
  normalizeUrl(snapshot.sources.documentFile) !==
  normalizeUrl(COMMISSION_2025_DOCUMENT_URL)
) {
  failures.push("Commission document file URL does not match dataset source URL.");
}
if (
  snapshot.document.protocol !== "7264" ||
  snapshot.document.date !== "2025-01-27"
) {
  failures.push("Commission document metadata is not prot. 7264 del 27/01/2025.");
}

assertSameSet(
  "commission organi",
  INSTITUTIONAL_COMMISSION_ORGANI.map((commission) => commission.slug),
  snapshot.commissions.map((commission) => commission.organoSlug),
  failures,
);

const snapshotRows = snapshot.commissions.flatMap((commission) =>
  commission.members.map((member) => ({
    organoSlug: commission.organoSlug,
    sourceName: member.sourceName,
    group: member.group,
    sourceNumber: member.sourceNumber,
  })),
);
const codeRows = HISTORICAL_2025_COMMISSION_COMPOSITIONS.flatMap((commission) =>
  commission.members.map((member) => ({
    organoSlug: commission.organoSlug,
    sourceName: member.sourceName,
    group: member.group,
    sourceNumber: member.sourceNumber,
  })),
);

assertSameSet(
  "commission composition rows",
  snapshotRows.map(memberKey),
  codeRows.map(memberKey),
  failures,
);

for (const commission of snapshot.commissions) {
  if (commission.members.length !== 12) {
    failures.push(
      `${commission.organoSlug}: expected 12 members, got ${commission.members.length}.`,
    );
  }
}
if (snapshotRows.length !== 84 || HISTORICAL_2025_COMMISSION_MEMBERSHIPS.length !== 84) {
  failures.push(
    [
      "Expected 84 commission memberships",
      `snapshot=${snapshotRows.length}`,
      `seed=${HISTORICAL_2025_COMMISSION_MEMBERSHIPS.length}`,
    ].join(", "),
  );
}

const officialSlugs = new Set(INSTITUTIONAL_OFFICIALS.map((official) => official.slug));
for (const membership of HISTORICAL_2025_COMMISSION_MEMBERSHIPS) {
  if (!officialSlugs.has(membership.officialSlug)) {
    failures.push(`${membership.officialSlug}: commission member has no official profile.`);
  }
  if (membership.startDate !== "2025-01-27" || membership.endDate !== null) {
    failures.push(`${membership.officialSlug}: unexpected commission date bounds.`);
  }
  if (membership.sourceUrl !== COMMISSION_2025_SOURCE.url) {
    failures.push(`${membership.officialSlug}: commission source URL mismatch.`);
  }
  if (!/non certifica una data di cessazione/i.test(membership.notes)) {
    failures.push(`${membership.officialSlug}: commission note must state date limit.`);
  }
  if (membership.termLabel === "Mandato corrente") {
    failures.push(`${membership.officialSlug}: 2025 commission row cannot be current.`);
  }
}

if (HISTORICAL_2025_COMMISSION_OFFICIALS.length !== 12) {
  failures.push(
    `Expected 12 new historical commission profiles, got ${HISTORICAL_2025_COMMISSION_OFFICIALS.length}.`,
  );
}
if (
  HISTORICAL_2025_COMMISSION_OFFICIALS.some(
    (official) => official.status !== "cessato" || official.profileUrl !== null,
  )
) {
  failures.push("New historical commission profiles must be cessato without current person URL.");
}

if (failures.length) {
  console.error("\nInstitutional commission QA failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    [
      "Institutional commission QA passed:",
      `${INSTITUTIONAL_COMMISSION_ORGANI.length} commission organi`,
      `${HISTORICAL_2025_COMMISSION_MEMBERSHIPS.length} memberships`,
      "checked against Comune prot. 7264/2025 snapshot.",
    ].join(" "),
  );
}
