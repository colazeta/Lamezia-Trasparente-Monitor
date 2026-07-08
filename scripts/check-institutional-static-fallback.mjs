import assert from "node:assert/strict";

const {
  getStaticOfficial,
  getStaticOrgano,
  listStaticOfficials,
  listStaticOrgani,
} = await import(
  "../artifacts/lamezia-trasparente/src/lib/institutionalStaticData.ts"
);

const organi = listStaticOrgani();
const consiglio = getStaticOrgano("consiglio-comunale");
const giunta = getStaticOrgano("giunta-comunale");
const commissioni = getStaticOrgano("commissioni-consiliari");
const officials = listStaticOfficials();
const firstOfficialProfile = getStaticOfficial(officials[0]?.id ?? "");

assert.ok(
  organi.length >= 10,
  `Expected at least 10 static organi, got ${organi.length}.`,
);
assert.ok(consiglio, "Static Consiglio Comunale detail is missing.");
assert.ok(giunta, "Static Giunta Comunale detail is missing.");
assert.ok(commissioni, "Static Commissioni Consiliari detail is missing.");
assert.ok(
  consiglio.memberCount >= 24,
  `Expected at least 24 current Consiglio members, got ${consiglio.memberCount}.`,
);
assert.ok(
  consiglio.historyCount > 0,
  "Static Consiglio Comunale detail must include historical rows.",
);
assert.ok(
  giunta.members.length >= 8,
  `Expected at least 8 current Giunta members, got ${giunta.members.length}.`,
);
assert.ok(
  officials.length >= 31,
  `Expected at least 31 static officials, got ${officials.length}.`,
);
assert.ok(firstOfficialProfile, "Static official profile is missing.");
assert.ok(
  firstOfficialProfile.biography?.includes("Anagrafica minima"),
  "Static official profile must include anagraphic biography text.",
);
assert.ok(
  firstOfficialProfile.organi.length > 0,
  "Static official profile must include organo memberships.",
);

console.log(
  [
    "Institutional static fallback QA passed:",
    `${organi.length} organi`,
    `${consiglio.memberCount} current Consiglio members`,
    `${consiglio.historyCount} Consiglio history rows`,
    `${giunta.members.length} current Giunta members`,
    `${officials.length} profiles`,
  ].join(" "),
);
