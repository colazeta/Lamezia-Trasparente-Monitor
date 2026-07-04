import { sql } from "drizzle-orm";
import { db } from "./client";
import { officialsTable } from "./schema";

const COMUNE_BASE_URL = "https://www.comune.lamezia-terme.cz.it";

export type InstitutionalSource = {
  label: string;
  url: string;
  checkedAt: string;
};

export type InstitutionalOfficialSeed = {
  name: string;
  slug: string;
  role: "sindaco" | "assessore" | "consigliere";
  roleTitle: string;
  profileUrl: string;
};

export type InstitutionalMembershipSeed = {
  officialSlug: string;
  organoSlug: "consiglio-comunale" | "giunta-comunale";
  membershipRole: string;
  termLabel: string;
  sourceLabel: string;
  sourceUrl: string;
  notes: string;
  position: number;
};

type OfficialRow = [
  name: string,
  slug: string,
  role: InstitutionalOfficialSeed["role"],
  roleTitle: string,
  personPath: string,
];

export const INSTITUTIONAL_POLITICI_SOURCE: InstitutionalSource = {
  label: "Comune di Lamezia Terme - Politici",
  url: `${COMUNE_BASE_URL}/it/page/politici`,
  checkedAt: "2026-07-04",
};

export const CURRENT_COUNCIL_SOURCE: InstitutionalSource = {
  label: "Comune di Lamezia Terme - Consiglio Comunale",
  url: `${COMUNE_BASE_URL}/it/organizational_unit/consiglio-comunale`,
  checkedAt: "2026-07-04",
};

export const CURRENT_GIUNTA_SOURCE: InstitutionalSource = {
  label: "Comune di Lamezia Terme - Giunta Comunale",
  url: `${COMUNE_BASE_URL}/it/organizational_unit/giunta-comunale`,
  checkedAt: "2026-07-04",
};

const currentOfficialRows: OfficialRow[] = [
  [
    "Adelaide Colosimo",
    "adelaide-colosimo",
    "consigliere",
    "Consigliere comunale",
    "colosimo-adelaide",
  ],
  [
    "Alessandro Saullo",
    "alessandro-saullo",
    "consigliere",
    "Consigliere comunale",
    "saullo-alessandro",
  ],
  [
    "Annalisa Spinelli",
    "annalisa-spinelli",
    "assessore",
    "Assessore comunale",
    "spinelli-annalisa",
  ],
  [
    "Annita Vitale",
    "annita-vitale",
    "consigliere",
    "Consigliere comunale",
    "vitale-annita",
  ],
  [
    "Antonio Lorena",
    "antonio-lorena",
    "consigliere",
    "Consigliere comunale",
    "lorena-antonio",
  ],
  [
    "Antonio Mastroianni",
    "antonio-mastroianni",
    "consigliere",
    "Consigliere comunale",
    "mastroianni-antonio",
  ],
  [
    "Bernadette Serratore",
    "bernadette-serratore",
    "consigliere",
    "Consigliere comunale",
    "serratore-bernadette",
  ],
  [
    "Carmelina Isa Muraca",
    "carmelina-isa-muraca",
    "consigliere",
    "Consigliere comunale",
    "muraca-carmelina-isa",
  ],
  [
    "Carmine Villella",
    "carmine-villella",
    "consigliere",
    "Consigliere comunale",
    "villella-carmine",
  ],
  [
    "Davide Mastroianni",
    "davide-mastroianni",
    "consigliere",
    "Consigliere comunale",
    "mastroianni-davide",
  ],
  [
    "Donatella Amicarelli",
    "donatella-amicarelli",
    "assessore",
    "Assessore comunale",
    "amicarelli-donatella",
  ],
  [
    "Doris Lo Moro",
    "doris-lo-moro",
    "consigliere",
    "Consigliere comunale",
    "lo-moro-doris",
  ],
  [
    "Fabrizio Muraca",
    "fabrizio-muraca",
    "consigliere",
    "Consigliere comunale",
    "muraca-fabrizio",
  ],
  [
    "Francesco Caruso",
    "francesco-caruso",
    "consigliere",
    "Consigliere comunale",
    "caruso-francesco",
  ],
  [
    "Gennarino Masi",
    "gennarino-masi",
    "consigliere",
    "Consigliere comunale",
    "masi-gennarino",
  ],
  [
    "Gennaro Gianturco",
    "gennaro-gianturco",
    "assessore",
    "Assessore comunale",
    "gianturco-gennaro",
  ],
  [
    "Giancarlo Nicotera",
    "giancarlo-nicotera",
    "consigliere",
    "Consigliere comunale",
    "nicotera-giancarlo",
  ],
  [
    "Giovanni Manuel Raso",
    "giovanni-manuel-raso",
    "consigliere",
    "Consigliere comunale",
    "raso-giovanni-manuel",
  ],
  [
    "Lidia Vescio",
    "lidia-vescio",
    "consigliere",
    "Consigliere comunale",
    "vescio-lidia",
  ],
  [
    "Maria Grandinetti",
    "maria-grandinetti",
    "consigliere",
    "Presidente del Consiglio Comunale",
    "grandinetti-maria",
  ],
  [
    "Maria Lucia Raso",
    "maria-lucia-raso",
    "consigliere",
    "Consigliere comunale",
    "raso-maria-lucia",
  ],
  [
    "Maria Nardo",
    "maria-nardo",
    "assessore",
    "Assessore comunale",
    "nardo-maria",
  ],
  ["Mario Murone", "mario-murone", "sindaco", "Sindaco", "murone-mario"],
  [
    "Massimo Cristiano",
    "massimo-cristiano",
    "consigliere",
    "Consigliere comunale",
    "cristiano-massimo",
  ],
  [
    "Matteo Folino",
    "matteo-folino",
    "consigliere",
    "Consigliere comunale",
    "folino-matteo",
  ],
  [
    "Michelangelo Cardamone",
    "michelangelo-cardamone",
    "assessore",
    "Vicesindaco",
    "cardamone-michelangelo",
  ],
  [
    "Michele Rosato",
    "michele-rosato",
    "consigliere",
    "Consigliere comunale",
    "rosato-michele",
  ],
  [
    "Oscar Branca",
    "oscar-branca",
    "consigliere",
    "Consigliere comunale",
    "branca-oscar",
  ],
  [
    "Salvatore Pirelli",
    "salvatore-pirelli",
    "assessore",
    "Assessore comunale",
    "pirelli-salvatore",
  ],
  [
    "Titina Caruso",
    "titina-caruso",
    "consigliere",
    "Consigliere comunale",
    "caruso-titina",
  ],
  [
    "Tranquillo Paradiso",
    "tranquillo-paradiso",
    "assessore",
    "Assessore comunale",
    "paradiso-tranquillo-56341",
  ],
];

export const CURRENT_COUNCIL_MEMBER_SLUGS = [
  "mario-murone",
  "alessandro-saullo",
  "annita-vitale",
  "antonio-lorena",
  "antonio-mastroianni",
  "bernadette-serratore",
  "doris-lo-moro",
  "fabrizio-muraca",
  "francesco-caruso",
  "gennarino-masi",
  "giancarlo-nicotera",
  "giovanni-manuel-raso",
  "lidia-vescio",
  "maria-grandinetti",
  "maria-lucia-raso",
  "massimo-cristiano",
  "matteo-folino",
  "michele-rosato",
  "oscar-branca",
  "titina-caruso",
  "davide-mastroianni",
  "carmine-villella",
  "adelaide-colosimo",
  "carmelina-isa-muraca",
] as const;

export const CURRENT_GIUNTA_MEMBER_SLUGS = [
  "mario-murone",
  "michelangelo-cardamone",
  "tranquillo-paradiso",
  "salvatore-pirelli",
  "annalisa-spinelli",
  "donatella-amicarelli",
  "maria-nardo",
  "gennaro-gianturco",
] as const;

export const CURRENT_INSTITUTIONAL_OFFICIALS: InstitutionalOfficialSeed[] =
  currentOfficialRows.map(([name, slug, role, roleTitle, personPath]) => ({
    name,
    slug,
    role,
    roleTitle,
    profileUrl: `${COMUNE_BASE_URL}/it/person/${personPath}`,
  }));

const officialsBySlug = new Map(
  CURRENT_INSTITUTIONAL_OFFICIALS.map((official) => [
    official.slug,
    official,
  ]),
);

const institutionalOfficialPositions = new Map(
  CURRENT_INSTITUTIONAL_OFFICIALS.map((official, index) => [
    official.slug,
    index,
  ]),
);

const institutionalOfficialSlugs = new Set(
  institutionalOfficialPositions.keys(),
);

function sourceNotes(source: InstitutionalSource): string {
  return [
    `Composizione corrente derivata dalla pagina ${source.label},`,
    `consultata il ${source.checkedAt}.`,
    "Deleghe, gruppi e atti di nomina vanno collegati a fonti specifiche",
    "quando disponibili.",
  ].join(" ");
}

function membershipRoleFor(
  official: InstitutionalOfficialSeed,
  organoSlug: InstitutionalMembershipSeed["organoSlug"],
): string {
  if (organoSlug === "giunta-comunale") {
    if (official.role === "sindaco") return "Sindaco (Presidente)";
    if (/vicesindaco/i.test(official.roleTitle)) return "Vicesindaco";
    return "Assessore";
  }
  if (official.role === "sindaco") return "Sindaco";
  if (/presidente del consiglio/i.test(official.roleTitle)) {
    return "Presidente del Consiglio";
  }
  return "Consigliere";
}

function membershipSeed(
  officialSlug: string,
  organoSlug: InstitutionalMembershipSeed["organoSlug"],
  position: number,
): InstitutionalMembershipSeed {
  const official = officialsBySlug.get(officialSlug);
  if (!official) {
    throw new Error(`Unknown institutional official slug: ${officialSlug}`);
  }
  const source =
    organoSlug === "giunta-comunale"
      ? CURRENT_GIUNTA_SOURCE
      : CURRENT_COUNCIL_SOURCE;
  return {
    officialSlug,
    organoSlug,
    membershipRole: membershipRoleFor(official, organoSlug),
    termLabel: "Mandato corrente",
    sourceLabel: source.label,
    sourceUrl: source.url,
    notes: sourceNotes(source),
    position,
  };
}

export const CURRENT_INSTITUTIONAL_MEMBERSHIPS: InstitutionalMembershipSeed[] = [
  ...CURRENT_COUNCIL_MEMBER_SLUGS.map((slug, index) =>
    membershipSeed(slug, "consiglio-comunale", index),
  ),
  ...CURRENT_GIUNTA_MEMBER_SLUGS.map((slug, index) =>
    membershipSeed(slug, "giunta-comunale", index),
  ),
];

const currentMembershipsByOfficialSlug = new Map<
  string,
  InstitutionalMembershipSeed[]
>();

for (const membership of CURRENT_INSTITUTIONAL_MEMBERSHIPS) {
  const existing =
    currentMembershipsByOfficialSlug.get(membership.officialSlug) ?? [];
  existing.push(membership);
  currentMembershipsByOfficialSlug.set(membership.officialSlug, existing);
}

function profileNote(official: InstitutionalOfficialSeed): string {
  return [
    `Anagrafica minima: ${official.name}, ${official.roleTitle}.`,
    `Scheda personale istituzionale: ${official.profileUrl}.`,
    [
      `Fonte registro: ${INSTITUTIONAL_POLITICI_SOURCE.label},`,
      `consultata il ${INSTITUTIONAL_POLITICI_SOURCE.checkedAt}.`,
    ].join(" "),
    [
      "Deleghe, gruppi consiliari, compensi e dichiarazioni restano da",
      "collegare a fonti pubbliche specifiche.",
    ].join(" "),
  ].join("\n");
}

export function isCurrentInstitutionalOfficialSlug(slug: string): boolean {
  return institutionalOfficialSlugs.has(slug);
}

export function currentInstitutionalOfficialPosition(slug: string): number {
  return institutionalOfficialPositions.get(slug) ?? Number.MAX_SAFE_INTEGER;
}

export function currentInstitutionalMembershipsForOfficial(
  slug: string,
): InstitutionalMembershipSeed[] {
  return currentMembershipsByOfficialSlug.get(slug) ?? [];
}

export async function ensureInstitutionalOfficials(): Promise<void> {
  for (const official of CURRENT_INSTITUTIONAL_OFFICIALS) {
    const biography = profileNote(official);
    await db
      .insert(officialsTable)
      .values({
        name: official.name,
        slug: official.slug,
        role: official.role,
        roleTitle: official.roleTitle,
        group: null,
        status: "in_carica",
        appointmentDate: null,
        biography,
      })
      .onConflictDoUpdate({
        target: officialsTable.slug,
        set: {
          name: official.name,
          role: official.role,
          roleTitle: official.roleTitle,
          status: "in_carica",
          biography: sql`case
            when ${officialsTable.biography} is null
              or ${officialsTable.biography} like 'Anagrafica minima:%'
            then ${biography}
            else ${officialsTable.biography}
          end`,
          updatedAt: new Date(),
        },
      });
  }
}
