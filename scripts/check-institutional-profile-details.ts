import { readFile } from "node:fs/promises";

import {
  CURRENT_GIUNTA_MEMBER_SLUGS,
  CURRENT_INSTITUTIONAL_OFFICIALS,
  CURRENT_PROFILE_DETAILS,
  INSTITUTIONAL_POLITICI_SOURCE,
} from "../lib/db/src/institutional-officials-data";

type ProfileDetailsSnapshot = {
  checkedAt: string;
  scope: string;
  coverageNote: string;
  sources: {
    politici: string;
  };
  profiles: {
    slug: string;
    name: string;
    profileUrl: string;
    incarichi: string[];
    deleghe: string;
    contactPhone?: string;
    contactEmail?: string;
  }[];
};

type SeedProfileDetail = {
  deleghe: string;
  contactPhone?: string;
  contactEmail?: string;
};

function argValue(name: string): string | null {
  const index = process.argv.indexOf(name);
  if (index < 0) return null;
  return process.argv[index + 1] ?? null;
}

function normalizeUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

async function loadSnapshot(path: string): Promise<ProfileDetailsSnapshot> {
  const raw = await readFile(path, "utf8");
  return JSON.parse(raw) as ProfileDetailsSnapshot;
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
const detailBySlug = new Map(
  Object.entries(CURRENT_PROFILE_DETAILS) as [string, SeedProfileDetail][],
);

if (snapshot.scope !== "giunta-current-profile-details") {
  failures.push(`Unexpected profile details snapshot scope: ${snapshot.scope}`);
}
if (
  normalizeUrl(snapshot.sources.politici) !==
  normalizeUrl(INSTITUTIONAL_POLITICI_SOURCE.url)
) {
  failures.push("Profile details Politici source URL does not match dataset source URL.");
}
if (!/PEC generale dell'ente/i.test(snapshot.coverageNote)) {
  failures.push("Profile details snapshot must state the PEC materialisation limit.");
}

for (const slug of CURRENT_GIUNTA_MEMBER_SLUGS) {
  if (!detailBySlug.has(slug)) {
    failures.push(`${slug}: missing profile details for current Giunta member.`);
  }
}

for (const [slug, detail] of detailBySlug) {
  const official = officialsBySlug.get(slug);
  const snapshotProfile = snapshotBySlug.get(slug);
  if (!official) {
    failures.push(`${slug}: profile details reference an unknown official.`);
    continue;
  }
  if (!snapshotProfile) {
    failures.push(`${slug}: profile details are missing from snapshot.`);
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
  if (detail.deleghe !== snapshotProfile.deleghe) {
    failures.push(`${slug}: delegated functions mismatch between seed and snapshot.`);
  }
  if (!detail.deleghe.trim()) {
    failures.push(`${slug}: delegated functions cannot be blank.`);
  }
  if ((detail.contactEmail ?? null) !== (snapshotProfile.contactEmail ?? null)) {
    failures.push(`${slug}: contact email mismatch between seed and snapshot.`);
  }
  if ((detail.contactPhone ?? null) !== (snapshotProfile.contactPhone ?? null)) {
    failures.push(`${slug}: contact phone mismatch between seed and snapshot.`);
  }
  if (/pec/i.test(detail.contactEmail ?? "")) {
    failures.push(`${slug}: PEC cannot be materialised as personal email.`);
  }
}

const snapshotExtra = snapshot.profiles
  .map((profile) => profile.slug)
  .filter((slug) => !detailBySlug.has(slug));
if (snapshotExtra.length) {
  failures.push(
    `Profile details snapshot contains unused slugs [${snapshotExtra.join(", ")}].`,
  );
}

if (failures.length) {
  console.error("\nInstitutional profile details QA failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    [
      "Institutional profile details QA passed:",
      `${detailBySlug.size} Giunta/Sindaco profiles`,
      "checked against current profile details snapshot.",
    ].join(" "),
  );
}
