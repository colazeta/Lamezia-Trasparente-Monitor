import { readFile } from "node:fs/promises";

import {
  CURRENT_COUNCIL_MEMBER_SLUGS,
  CURRENT_COUNCIL_PROFILE_SECTIONS,
  CURRENT_COUNCIL_SOURCE,
  CURRENT_INSTITUTIONAL_OFFICIALS,
  INSTITUTIONAL_POLITICI_SOURCE,
} from "../lib/db/src/institutional-officials-data";

type CouncilProfileSectionsSnapshot = {
  checkedAt: string;
  scope: string;
  coverageNote: string;
  sources: {
    politici: string;
    consiglio: string;
  };
  profiles: {
    slug: string;
    name: string;
    profileUrl: string;
    incarichi: string[];
    organizations: string[];
    lastUpdated: string;
  }[];
};

type CouncilProfileSectionSeed = {
  profileIncarichi?: readonly string[];
  profileOrganizations?: readonly string[];
  profileLastUpdated?: string;
};

function argValue(name: string): string | null {
  const index = process.argv.indexOf(name);
  if (index < 0) return null;
  return process.argv[index + 1] ?? null;
}

function normalizeUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

function valuesKey(values: readonly string[] | undefined): string {
  return (values ?? []).join("|");
}

async function loadSnapshot(
  path: string,
): Promise<CouncilProfileSectionsSnapshot> {
  const raw = await readFile(path, "utf8");
  return JSON.parse(raw) as CouncilProfileSectionsSnapshot;
}

const snapshotPath = argValue("--snapshot");
if (!snapshotPath) {
  console.error("Missing --snapshot path.");
  process.exit(1);
}

const snapshot = await loadSnapshot(snapshotPath);
const failures: string[] = [];
const officialsBySlug = new Map(
  CURRENT_INSTITUTIONAL_OFFICIALS.map((official) => [official.slug, official]),
);
const snapshotBySlug = new Map(
  snapshot.profiles.map((profile) => [profile.slug, profile]),
);
const sectionBySlug = new Map(
  Object.entries(CURRENT_COUNCIL_PROFILE_SECTIONS) as [
    string,
    CouncilProfileSectionSeed,
  ][],
);

if (snapshot.scope !== "council-current-profile-sections") {
  failures.push(`Unexpected council profile sections scope: ${snapshot.scope}`);
}
if (
  normalizeUrl(snapshot.sources.politici) !==
  normalizeUrl(INSTITUTIONAL_POLITICI_SOURCE.url)
) {
  failures.push("Politici source URL does not match dataset source URL.");
}
if (
  normalizeUrl(snapshot.sources.consiglio) !==
  normalizeUrl(CURRENT_COUNCIL_SOURCE.url)
) {
  failures.push("Consiglio source URL does not match dataset source URL.");
}
if (
  !/PEC generale dell'ente/i.test(snapshot.coverageNote) ||
  !/non vengono trattati come contatti personali/i.test(snapshot.coverageNote)
) {
  failures.push("Snapshot must state the generic contact materialisation limit.");
}

for (const slug of CURRENT_COUNCIL_MEMBER_SLUGS) {
  if (!sectionBySlug.has(slug)) {
    failures.push(`${slug}: missing council profile section seed.`);
  }
  if (!snapshotBySlug.has(slug)) {
    failures.push(`${slug}: missing council profile section snapshot row.`);
  }
}

for (const [slug, section] of sectionBySlug) {
  const official = officialsBySlug.get(slug);
  const snapshotProfile = snapshotBySlug.get(slug);
  if (!official) {
    failures.push(`${slug}: council profile sections reference an unknown official.`);
    continue;
  }
  if (!snapshotProfile) {
    failures.push(`${slug}: council profile sections are missing from snapshot.`);
    continue;
  }
  if (official.name !== snapshotProfile.name) {
    failures.push(`${slug}: snapshot name mismatch.`);
  }
  if (
    !official.profileUrl ||
    normalizeUrl(official.profileUrl) !== normalizeUrl(snapshotProfile.profileUrl)
  ) {
    failures.push(`${slug}: snapshot profile URL mismatch.`);
  }
  if (valuesKey(section.profileIncarichi) !== valuesKey(snapshotProfile.incarichi)) {
    failures.push(`${slug}: Incarichi mismatch between seed and snapshot.`);
  }
  if (
    valuesKey(section.profileOrganizations) !==
    valuesKey(snapshotProfile.organizations)
  ) {
    failures.push(`${slug}: Organizzazioni mismatch between seed and snapshot.`);
  }
  if ((section.profileLastUpdated ?? null) !== snapshotProfile.lastUpdated) {
    failures.push(`${slug}: last updated mismatch between seed and snapshot.`);
  }
}

const snapshotExtra = snapshot.profiles
  .map((profile) => profile.slug)
  .filter((slug) => !sectionBySlug.has(slug));
if (snapshotExtra.length) {
  failures.push(
    `Council profile sections snapshot contains unused slugs [${snapshotExtra.join(", ")}].`,
  );
}

const grandinetti = sectionBySlug.get("maria-grandinetti");
if (
  !grandinetti?.profileIncarichi?.includes("Presidente del Consiglio Comunale")
) {
  failures.push("Maria Grandinetti profile sections must preserve the president role.");
}
const murone = sectionBySlug.get("mario-murone");
if (!murone?.profileIncarichi?.includes("Sindaco")) {
  failures.push("Mario Murone profile sections must preserve the mayor role.");
}
const councilOrganizationCount = Array.from(sectionBySlug.values()).filter(
  (section) => section.profileOrganizations?.includes("Consiglio Comunale"),
).length;
if (councilOrganizationCount !== 23) {
  failures.push(
    `Expected 23 profile rows with Consiglio Comunale organization, got ${councilOrganizationCount}.`,
  );
}

if (failures.length) {
  console.error("\nInstitutional council profile sections QA failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    [
      "Institutional council profile sections QA passed:",
      `${sectionBySlug.size} current Council profiles`,
      "checked against current council profile sections snapshot.",
    ].join(" "),
  );
}
