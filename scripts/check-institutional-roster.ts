import { readFile } from "node:fs/promises";

import {
  CURRENT_COUNCIL_MEMBER_SLUGS,
  CURRENT_COUNCIL_SOURCE,
  CURRENT_GIUNTA_MEMBER_SLUGS,
  CURRENT_GIUNTA_SOURCE,
  CURRENT_INSTITUTIONAL_OFFICIALS,
  INSTITUTIONAL_POLITICI_SOURCE,
} from "../lib/db/src/institutional-officials-data";

type RemoteOfficial = {
  name: string;
  roleTitle: string;
  profileUrl: string;
};

type RemoteOrganoMember = {
  name: string;
  profileUrl: string;
  slug: string | null;
};

type SourceSnapshot = {
  checkedAt: string;
  sources: {
    politici: string;
    consiglio: string;
    giunta: string;
  };
  politici: RemoteOfficial[];
  consiglio: Omit<RemoteOrganoMember, "slug">[];
  giunta: Omit<RemoteOrganoMember, "slug">[];
};

const POLITICI_PAGES = [
  INSTITUTIONAL_POLITICI_SOURCE.url,
  `${INSTITUTIONAL_POLITICI_SOURCE.url}?fromService=1&page=2`,
];

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Lamezia-Trasparente-Monitor";

function argValue(name: string): string | null {
  const index = process.argv.indexOf(name);
  if (index < 0) return null;
  return process.argv[index + 1] ?? null;
}

function normalizeText(value: string): string {
  return decodeHtml(value).replace(/\s+/g, " ").trim();
}

function normalizeComparable(value: string): string {
  return normalizeText(value).toLocaleLowerCase("it-IT");
}

function normalizeUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

function decodeHtml(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number(code)),
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'");
}

async function fetchHtml(url: string): Promise<string> {
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "user-agent": USER_AGENT,
          accept: "text/html,application/xhtml+xml",
        },
      });
      if (response.status === 429 && attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 10000));
        continue;
      }
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 3000));
      }
    }
  }
  throw new Error(`Could not fetch ${url}: ${lastError?.message ?? "unknown"}`);
}

async function loadSnapshot(path: string): Promise<SourceSnapshot> {
  const raw = await readFile(path, "utf8");
  const snapshot = JSON.parse(raw) as SourceSnapshot;
  return {
    ...snapshot,
    politici: snapshot.politici.map((official) => ({
      ...official,
      profileUrl: normalizeUrl(official.profileUrl),
    })),
    consiglio: snapshot.consiglio.map((member) => ({
      ...member,
      profileUrl: normalizeUrl(member.profileUrl),
    })),
    giunta: snapshot.giunta.map((member) => ({
      ...member,
      profileUrl: normalizeUrl(member.profileUrl),
    })),
  };
}

function parsePolitici(html: string): RemoteOfficial[] {
  const cardPattern = new RegExp(
    [
      '<a\\s+href="([^"]+)"[^>]*class="[^"]*custom-link-reference[^"]*"',
      '[\\s\\S]*?<p class="card-title[^"]*"[^>]*>\\s*([^<]+?)\\s*</p>',
      '\\s*</a>[\\s\\S]*?<div class="card-text[^"]*"[^>]*>',
      "\\s*<p>([^<]+)</p>",
    ].join(""),
    "gi",
  );
  return Array.from(html.matchAll(cardPattern), (match) => ({
    profileUrl: normalizeUrl(decodeHtml(match[1] ?? "")),
    name: normalizeText(match[2] ?? ""),
    roleTitle: normalizeText(match[3] ?? ""),
  }));
}

function parseOrganoMembers(html: string): RemoteOrganoMember[] {
  const heading = /<h2[^>]*>\s*Persone che compongono la struttura\s*<\/h2>/i;
  const headingMatch = heading.exec(html);
  if (!headingMatch) {
    throw new Error("Missing 'Persone che compongono la struttura' section");
  }

  const sectionStart = headingMatch.index + headingMatch[0].length;
  const rest = html.slice(sectionStart);
  const nextHeading = rest.search(/<h2[^>]*>/i);
  const section = nextHeading >= 0 ? rest.slice(0, nextHeading) : rest;
  const cardPattern = new RegExp(
    [
      '<a\\s+href="([^"]+)"[^>]*class="[^"]*custom-link-reference[^"]*"',
      '[\\s\\S]*?<p class="card-title[^"]*"[^>]*>\\s*([^<]+?)\\s*</p>',
    ].join(""),
    "gi",
  );

  return Array.from(section.matchAll(cardPattern), (match) => {
    const profileUrl = normalizeUrl(decodeHtml(match[1] ?? ""));
    return {
      profileUrl,
      name: normalizeText(match[2] ?? ""),
      slug: expectedSlugForProfileUrl(profileUrl),
    };
  });
}

const expectedByProfileUrl = new Map(
  CURRENT_INSTITUTIONAL_OFFICIALS.map((official) => [
    normalizeUrl(requiredProfileUrl(official)),
    official,
  ]),
);

function requiredProfileUrl(
  official: (typeof CURRENT_INSTITUTIONAL_OFFICIALS)[number],
): string {
  if (!official.profileUrl) {
    throw new Error(`Current official ${official.slug} has no profile URL.`);
  }
  return official.profileUrl;
}

function expectedSlugForProfileUrl(profileUrl: string): string | null {
  return expectedByProfileUrl.get(normalizeUrl(profileUrl))?.slug ?? null;
}

function diffSets(
  expected: string[],
  actual: string[],
): { missing: string[]; extra: string[] } {
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);
  return {
    missing: expected.filter((item) => !actualSet.has(item)),
    extra: actual.filter((item) => !expectedSet.has(item)),
  };
}

function assertOrderedList(
  label: string,
  expected: readonly string[],
  actual: string[],
  failures: string[],
): void {
  const { missing, extra } = diffSets([...expected], actual);
  if (missing.length || extra.length) {
    failures.push(
      `${label}: missing [${missing.join(", ")}], extra [${extra.join(", ")}]`,
    );
    return;
  }

  const firstOrderMismatch = expected.findIndex((slug, index) => {
    return actual[index] !== slug;
  });
  if (firstOrderMismatch >= 0) {
    failures.push(
      [
        `${label}: order mismatch at position ${firstOrderMismatch + 1}`,
        `expected ${expected[firstOrderMismatch]}`,
        `got ${actual[firstOrderMismatch]}`,
      ].join("; "),
    );
  }
}

async function checkPolitici(failures: string[]): Promise<void> {
  const remote = snapshot
    ? snapshot.politici
    : (await fetchPoliticiPages()).flatMap(parsePolitici);
  const expected = CURRENT_INSTITUTIONAL_OFFICIALS;

  const remoteByProfileUrl = new Map(
    remote.map((official) => [normalizeUrl(official.profileUrl), official]),
  );

  const { missing, extra } = diffSets(
    expected.map((official) => normalizeUrl(requiredProfileUrl(official))),
    remote.map((official) => normalizeUrl(official.profileUrl)),
  );
  if (missing.length || extra.length) {
    failures.push(
      [
        "Politici roster profile URLs differ",
        `missing [${missing.join(", ")}]`,
        `extra [${extra.join(", ")}]`,
      ].join("; "),
    );
  }

  for (const expectedOfficial of expected) {
    const remoteOfficial = remoteByProfileUrl.get(
      normalizeUrl(requiredProfileUrl(expectedOfficial)),
    );
    if (!remoteOfficial) continue;
    if (
      normalizeComparable(remoteOfficial.name) !==
      normalizeComparable(expectedOfficial.name)
    ) {
      failures.push(
        `Politici name mismatch for ${expectedOfficial.slug}: expected ` +
          `${expectedOfficial.name}, got ${remoteOfficial.name}`,
      );
    }
    if (
      normalizeComparable(remoteOfficial.roleTitle) !==
      normalizeComparable(expectedOfficial.roleTitle)
    ) {
      failures.push(
        `Politici role mismatch for ${expectedOfficial.slug}: expected ` +
          `${expectedOfficial.roleTitle}, got ${remoteOfficial.roleTitle}`,
      );
    }
  }

  console.log(
    `Politici: ${remote.length} remote profiles checked against ${expected.length} expected profiles.`,
  );
}

async function fetchPoliticiPages(): Promise<string[]> {
  const pages: string[] = [];
  for (const pageUrl of POLITICI_PAGES) {
    pages.push(await fetchHtml(pageUrl));
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  return pages;
}

async function checkOrgano(
  label: string,
  sourceUrl: string,
  expectedSlugs: readonly string[],
  failures: string[],
): Promise<void> {
  const members =
    snapshot && sourceUrl === CURRENT_COUNCIL_SOURCE.url
      ? snapshot.consiglio.map((member) => ({
          ...member,
          slug: expectedSlugForProfileUrl(member.profileUrl),
        }))
      : snapshot && sourceUrl === CURRENT_GIUNTA_SOURCE.url
        ? snapshot.giunta.map((member) => ({
            ...member,
            slug: expectedSlugForProfileUrl(member.profileUrl),
          }))
        : parseOrganoMembers(await fetchHtml(sourceUrl));
  const unknown = members.filter((member) => member.slug === null);
  if (unknown.length) {
    failures.push(
      `${label}: unknown profile URLs [${unknown
        .map((member) => member.profileUrl)
        .join(", ")}]`,
    );
  }
  const actualSlugs = members
    .map((member) => member.slug)
    .filter((slug): slug is string => slug !== null);
  assertOrderedList(label, expectedSlugs, actualSlugs, failures);
  console.log(
    `${label}: ${actualSlugs.length} remote members checked against ${expectedSlugs.length} expected members.`,
  );
}

const snapshotPath = argValue("--snapshot");
const snapshot = snapshotPath ? await loadSnapshot(snapshotPath) : null;

async function main(): Promise<void> {
  const failures: string[] = [];
  if (snapshot) {
    console.log(
      `Using institutional roster source snapshot from ${snapshot.checkedAt}.`,
    );
    if (
      normalizeUrl(snapshot.sources.politici) !==
      normalizeUrl(INSTITUTIONAL_POLITICI_SOURCE.url)
    ) {
      failures.push(
        "Snapshot Politici source URL does not match dataset source URL.",
      );
    }
    if (
      normalizeUrl(snapshot.sources.consiglio) !==
      normalizeUrl(CURRENT_COUNCIL_SOURCE.url)
    ) {
      failures.push(
        "Snapshot Consiglio source URL does not match dataset source URL.",
      );
    }
    if (
      normalizeUrl(snapshot.sources.giunta) !==
      normalizeUrl(CURRENT_GIUNTA_SOURCE.url)
    ) {
      failures.push(
        "Snapshot Giunta source URL does not match dataset source URL.",
      );
    }
  }

  await checkPolitici(failures);
  await checkOrgano(
    "Consiglio Comunale",
    CURRENT_COUNCIL_SOURCE.url,
    CURRENT_COUNCIL_MEMBER_SLUGS,
    failures,
  );
  await checkOrgano(
    "Giunta Comunale",
    CURRENT_GIUNTA_SOURCE.url,
    CURRENT_GIUNTA_MEMBER_SLUGS,
    failures,
  );

  if (failures.length) {
    console.error("\nInstitutional roster QA failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("Institutional roster QA passed.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
