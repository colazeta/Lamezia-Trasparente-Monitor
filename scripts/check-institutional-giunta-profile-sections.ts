import { readFile } from "node:fs/promises";

import {
  CURRENT_GIUNTA_MEMBER_SLUGS,
  CURRENT_GIUNTA_PROFILE_SECTIONS,
  CURRENT_GIUNTA_SOURCE,
  CURRENT_INSTITUTIONAL_OFFICIALS,
  INSTITUTIONAL_POLITICI_SOURCE,
} from "../lib/db/src/institutional-officials-data";

type GiuntaProfileSectionsSnapshot = {
  checkedAt: string;
  scope: string;
  coverageNote: string;
  sources: {
    politici: string;
    giunta: string;
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

type GiuntaProfileSectionSeed = {
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
): Promise<GiuntaProfileSectionsSnapshot> {
  const raw = await readFile(path, "utf8");
  return JSON.parse(raw) as GiuntaProfileSectionsSnapshot;
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
  Object.entries(CURRENT_GIUNTA_PROFILE_SECTIONS) as [
    string,
    GiuntaProfileSectionSeed,
  ][],
);

if (snapshot.scope !== "giunta-current-profile-sections") {
  failures.push(`Unexpected Giunta profile sections scope: ${snapshot.scope}`);
}
if (
  normalizeUrl(snapshot.sources.politici) !==
  normalizeUrl(INSTITUTIONAL_POLITICI_SOURCE.url)
) {
  failures.push("Politici source URL does not match dataset source URL.");
}
if (
  normalizeUrl(snapshot.sources.giunta) !== normalizeUrl(CURRENT_GIUNTA_SOURCE.url)
) {
  failures.push("Giunta source URL does not match dataset source URL.");
}
if (
  !/PEC generale dell'ente/i.test(snapshot.coverageNote) ||
  !/non vengono trattati come contatti personali/i.test(snapshot.coverageNote)
) {
  failures.push("Snapshot must state the generic contact materialisation limit.");
}

for (const slug of CURRENT_GIUNTA_MEMBER_SLUGS) {
  if (!sectionBySlug.has(slug)) {
    failures.push(`${slug}: missing Giunta profile section seed.`);
  }
  if (!snapshotBySlug.has(slug)) {
    failures.push(`${slug}: missing Giunta profile section snapshot row.`);
  }
}

for (const [slug, section] of sectionBySlug) {
  const official = officialsBySlug.get(slug);
  const snapshotProfile = snapshotBySlug.get(slug);
  if (!official) {
    failures.push(`${slug}: Giunta profile sections reference an unknown official.`);
    continue;
  }
  if (!snapshotProfile) {
    failures.push(`${slug}: Giunta profile sections are missing from snapshot.`);
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
    `Giunta profile sections snapshot contains unused slugs [${snapshotExtra.join(", ")}].`,
  );
}

const cardamone = sectionBySlug.get("michelangelo-cardamone");
if (!cardamone?.profileIncarichi?.includes("Vice Sindaco")) {
  failures.push("Michelangelo Cardamone profile sections must preserve Vice Sindaco.");
}
const murone = sectionBySlug.get("mario-murone");
if (!murone?.profileIncarichi?.includes("Sindaco")) {
  failures.push("Mario Murone profile sections must preserve Sindaco.");
}
const giuntaOrganizationCount = Array.from(sectionBySlug.values()).filter(
  (section) => section.profileOrganizations?.includes("Giunta Comunale"),
).length;
if (giuntaOrganizationCount !== 7) {
  failures.push(
    `Expected 7 profile rows with Giunta Comunale organization, got ${giuntaOrganizationCount}.`,
  );
}

if (failures.length) {
  console.error("\nInstitutional Giunta profile sections QA failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    [
      "Institutional Giunta profile sections QA passed:",
      `${sectionBySlug.size} current Giunta/Sindaco profiles`,
      "checked against current Giunta profile sections snapshot.",
    ].join(" "),
  );
}
