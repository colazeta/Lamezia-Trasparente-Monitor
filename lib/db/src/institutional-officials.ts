import { db } from "./client";
import { officialsTable } from "./schema";

export type InstitutionalOfficialSeed = {
  name: string;
  slug: string;
  role: "sindaco" | "assessore" | "consigliere";
  roleTitle: string;
};

export const INSTITUTIONAL_POLITICI_SOURCE = {
  label: "Comune di Lamezia Terme - Politici",
  url: "https://www.comune.lamezia-terme.cz.it/it/page/politici",
  checkedAt: "2026-07-03",
} as const;

export const CURRENT_INSTITUTIONAL_OFFICIALS: InstitutionalOfficialSeed[] = [
  {
    name: "Adelaide Colosimo",
    slug: "adelaide-colosimo",
    role: "consigliere",
    roleTitle: "Consigliere comunale",
  },
  {
    name: "Alessandro Saullo",
    slug: "alessandro-saullo",
    role: "consigliere",
    roleTitle: "Consigliere comunale",
  },
  {
    name: "Annalisa Spinelli",
    slug: "annalisa-spinelli",
    role: "assessore",
    roleTitle: "Assessore comunale",
  },
  {
    name: "Annita Vitale",
    slug: "annita-vitale",
    role: "consigliere",
    roleTitle: "Consigliere comunale",
  },
  {
    name: "Antonio Lorena",
    slug: "antonio-lorena",
    role: "consigliere",
    roleTitle: "Consigliere comunale",
  },
  {
    name: "Antonio Mastroianni",
    slug: "antonio-mastroianni",
    role: "consigliere",
    roleTitle: "Consigliere comunale",
  },
  {
    name: "Bernadette Serratore",
    slug: "bernadette-serratore",
    role: "consigliere",
    roleTitle: "Consigliere comunale",
  },
  {
    name: "Carmelina Isa Muraca",
    slug: "carmelina-isa-muraca",
    role: "consigliere",
    roleTitle: "Consigliere comunale",
  },
  {
    name: "Carmine Villella",
    slug: "carmine-villella",
    role: "consigliere",
    roleTitle: "Consigliere comunale",
  },
  {
    name: "Davide Mastroianni",
    slug: "davide-mastroianni",
    role: "consigliere",
    roleTitle: "Consigliere comunale",
  },
  {
    name: "Donatella Amicarelli",
    slug: "donatella-amicarelli",
    role: "assessore",
    roleTitle: "Assessore comunale",
  },
  {
    name: "Doris Lo Moro",
    slug: "doris-lo-moro",
    role: "consigliere",
    roleTitle: "Consigliere comunale",
  },
  {
    name: "Fabrizio Muraca",
    slug: "fabrizio-muraca",
    role: "consigliere",
    roleTitle: "Consigliere comunale",
  },
  {
    name: "Francesco Caruso",
    slug: "francesco-caruso",
    role: "consigliere",
    roleTitle: "Consigliere comunale",
  },
  {
    name: "Gennarino Masi",
    slug: "gennarino-masi",
    role: "consigliere",
    roleTitle: "Consigliere comunale",
  },
  {
    name: "Gennaro Gianturco",
    slug: "gennaro-gianturco",
    role: "assessore",
    roleTitle: "Assessore comunale",
  },
  {
    name: "Giancarlo Nicotera",
    slug: "giancarlo-nicotera",
    role: "consigliere",
    roleTitle: "Consigliere comunale",
  },
  {
    name: "Giovanni Manuel Raso",
    slug: "giovanni-manuel-raso",
    role: "consigliere",
    roleTitle: "Consigliere comunale",
  },
  {
    name: "Lidia Vescio",
    slug: "lidia-vescio",
    role: "consigliere",
    roleTitle: "Consigliere comunale",
  },
  {
    name: "Maria Grandinetti",
    slug: "maria-grandinetti",
    role: "consigliere",
    roleTitle: "Presidente del Consiglio Comunale",
  },
  {
    name: "Maria Lucia Raso",
    slug: "maria-lucia-raso",
    role: "consigliere",
    roleTitle: "Consigliere comunale",
  },
  {
    name: "Maria Nardo",
    slug: "maria-nardo",
    role: "assessore",
    roleTitle: "Assessore comunale",
  },
  {
    name: "Mario Murone",
    slug: "mario-murone",
    role: "sindaco",
    roleTitle: "Sindaco",
  },
  {
    name: "Massimo Cristiano",
    slug: "massimo-cristiano",
    role: "consigliere",
    roleTitle: "Consigliere comunale",
  },
  {
    name: "Matteo Folino",
    slug: "matteo-folino",
    role: "consigliere",
    roleTitle: "Consigliere comunale",
  },
  {
    name: "Michelangelo Cardamone",
    slug: "michelangelo-cardamone",
    role: "assessore",
    roleTitle: "Vicesindaco",
  },
  {
    name: "Michele Rosato",
    slug: "michele-rosato",
    role: "consigliere",
    roleTitle: "Consigliere comunale",
  },
  {
    name: "Oscar Branca",
    slug: "oscar-branca",
    role: "consigliere",
    roleTitle: "Consigliere comunale",
  },
  {
    name: "Salvatore Pirelli",
    slug: "salvatore-pirelli",
    role: "assessore",
    roleTitle: "Assessore comunale",
  },
  {
    name: "Titina Caruso",
    slug: "titina-caruso",
    role: "consigliere",
    roleTitle: "Consigliere comunale",
  },
  {
    name: "Tranquillo Paradiso",
    slug: "tranquillo-paradiso",
    role: "assessore",
    roleTitle: "Assessore comunale",
  },
];

const institutionalOfficialPositions = new Map(
  CURRENT_INSTITUTIONAL_OFFICIALS.map((official, index) => [
    official.slug,
    index,
  ]),
);

const institutionalOfficialSlugs = new Set(
  institutionalOfficialPositions.keys(),
);

function profileNote(official: InstitutionalOfficialSeed): string {
  return [
    `Anagrafica minima: ${official.name}, ${official.roleTitle}.`,
    `Fonte: ${INSTITUTIONAL_POLITICI_SOURCE.label}, consultata il ${INSTITUTIONAL_POLITICI_SOURCE.checkedAt}.`,
    "Deleghe, gruppi consiliari, compensi e dichiarazioni restano da collegare a fonti pubbliche specifiche.",
  ].join("\n");
}

export function isCurrentInstitutionalOfficialSlug(slug: string): boolean {
  return institutionalOfficialSlugs.has(slug);
}

export function currentInstitutionalOfficialPosition(slug: string): number {
  return institutionalOfficialPositions.get(slug) ?? Number.MAX_SAFE_INTEGER;
}

export async function ensureInstitutionalOfficials(): Promise<void> {
  for (const official of CURRENT_INSTITUTIONAL_OFFICIALS) {
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
        biography: profileNote(official),
      })
      .onConflictDoUpdate({
        target: officialsTable.slug,
        set: {
          name: official.name,
          role: official.role,
          roleTitle: official.roleTitle,
          status: "in_carica",
          updatedAt: new Date(),
        },
      });
  }
}
