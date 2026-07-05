const COMUNE_BASE_URL = "https://www.comune.lamezia-terme.cz.it";

export type InstitutionalSource = {
  label: string;
  url: string;
  checkedAt: string;
};

export type InstitutionalOfficialStatus = "in_carica" | "cessato";

export type InstitutionalOfficialSeed = {
  name: string;
  slug: string;
  role: "sindaco" | "assessore" | "consigliere";
  roleTitle: string;
  profileUrl: string | null;
  status: InstitutionalOfficialStatus;
  source: InstitutionalSource;
  appointmentDate?: string | null;
  biographyNote?: string;
};

export type InstitutionalMembershipSeed = {
  officialSlug: string;
  organoSlug: "consiglio-comunale" | "giunta-comunale";
  membershipRole: string;
  termLabel: string;
  startDate?: string | null;
  endDate?: string | null;
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
  url: `${COMUNE_BASE_URL}/it/unita_organizzative/consiglio-comunale`,
  checkedAt: "2026-07-04",
};

export const CURRENT_GIUNTA_SOURCE: InstitutionalSource = {
  label: "Comune di Lamezia Terme - Giunta Comunale",
  url: `${COMUNE_BASE_URL}/it/unita_organizzative/giunta-comunale`,
  checkedAt: "2026-07-04",
};

export const ELIGENDO_2019_LAMEZIA_SOURCE: InstitutionalSource = {
  label: "Ministero dell'Interno - Eligendo comunali Lamezia Terme 2019",
  url: [
    "https://elezionistorico.interno.gov.it/index.php?",
    "dtel=10%2F11%2F2019&es0=S&es1=S&es2=S&es3=N",
    "&lev0=0&lev1=18&lev2=22&lev3=641",
    "&levsut0=0&levsut1=1&levsut2=2&levsut3=3",
    "&ms=S&ne1=18&ne2=22&ne3=220641",
    "&tpa=I&tpe=C&tpel=G",
  ].join(""),
  checkedAt: "2026-07-05",
};

export const ELIGENDO_2019_OPEN_DATA_SOURCE: InstitutionalSource = {
  label: "Ministero dell'Interno - Open data comunali 10 novembre 2019",
  url: [
    "https://elezionistorico.interno.gov.it",
    "/daithome/documenti/opendata/comunali/comunali-20191110.zip",
  ].join(""),
  checkedAt: "2026-07-05",
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
    status: "in_carica",
    source: INSTITUTIONAL_POLITICI_SOURCE,
  }));

export const HISTORICAL_2019_ELECTED_CANDIDATES = [
  {
    name: "Paolo Mascaro",
    slug: "paolo-mascaro",
    electedCode: "S",
    electedLabel: "Sindaco eletto",
    role: "sindaco",
    roleTitle: "Sindaco eletto nel 2019",
  },
  {
    name: "Ruggero Pegna",
    slug: "ruggero-pegna",
    electedCode: "C",
    electedLabel: "Candidato sindaco eletto consigliere",
    role: "consigliere",
    roleTitle: "Candidato sindaco eletto consigliere comunale",
  },
  {
    name: "Eugenio Guarascio",
    slug: "eugenio-guarascio-2019",
    electedCode: "C",
    electedLabel: "Candidato sindaco eletto consigliere",
    role: "consigliere",
    roleTitle: "Candidato sindaco eletto consigliere comunale",
  },
  {
    name: "Rosario Piccioni",
    slug: "rosario-piccioni",
    electedCode: "C",
    electedLabel: "Candidato sindaco eletto consigliere",
    role: "consigliere",
    roleTitle: "Candidato sindaco eletto consigliere comunale",
  },
] as const;

export const HISTORICAL_INSTITUTIONAL_OFFICIALS: InstitutionalOfficialSeed[] =
  HISTORICAL_2019_ELECTED_CANDIDATES.map((candidate) => ({
    name: candidate.name,
    slug: candidate.slug,
    role: candidate.role,
    roleTitle: candidate.roleTitle,
    profileUrl: null,
    status: "cessato",
    source: ELIGENDO_2019_LAMEZIA_SOURCE,
    biographyNote: [
      `${candidate.electedLabel} secondo Eligendo comunali 2019.`,
      "Anagrafica storica minima: la scheda personale istituzionale non",
      "risulta nel registro corrente dei politici comunali.",
    ].join(" "),
  }));

export const INSTITUTIONAL_OFFICIALS: InstitutionalOfficialSeed[] = [
  ...CURRENT_INSTITUTIONAL_OFFICIALS,
  ...HISTORICAL_INSTITUTIONAL_OFFICIALS,
];

const officialsBySlug = new Map(
  INSTITUTIONAL_OFFICIALS.map((official) => [
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

const historical2019TermLabel =
  "Esito elettorale 2019 - amministrazione precedente (copertura parziale)";

function historical2019Notes(scope: "consiglio" | "giunta"): string {
  const common = [
    "Riga storica derivata da Eligendo/Open data Ministero dell'Interno",
    "per le comunali del 10/11/2019.",
    "La data indicata e' la data elettorale, non l'atto di proclamazione",
    "o insediamento.",
  ];
  if (scope === "giunta") {
    return [
      ...common,
      "Copertura parziale: la fonte prova il sindaco eletto, ma non la",
      "composizione nominativa della Giunta precedente.",
    ].join(" ");
  }
  return [
    ...common,
    "Copertura parziale: la fonte prova sindaco eletto e candidati sindaco",
    "eletti consiglieri, ma non contiene i nominativi completi dei",
    "consiglieri assegnati dalle liste.",
  ].join(" ");
}

const historical2019BaseMemberships: Array<
  Pick<
    InstitutionalMembershipSeed,
    "officialSlug" | "organoSlug" | "membershipRole" | "position" | "notes"
  >
> = [
    {
      officialSlug: "paolo-mascaro",
      organoSlug: "consiglio-comunale",
      membershipRole: "Sindaco",
      position: 0,
      notes: historical2019Notes("consiglio"),
    },
    {
      officialSlug: "ruggero-pegna",
      organoSlug: "consiglio-comunale",
      membershipRole: "Candidato sindaco eletto consigliere",
      position: 1,
      notes: historical2019Notes("consiglio"),
    },
    {
      officialSlug: "eugenio-guarascio-2019",
      organoSlug: "consiglio-comunale",
      membershipRole: "Candidato sindaco eletto consigliere",
      position: 2,
      notes: historical2019Notes("consiglio"),
    },
    {
      officialSlug: "rosario-piccioni",
      organoSlug: "consiglio-comunale",
      membershipRole: "Candidato sindaco eletto consigliere",
      position: 3,
      notes: historical2019Notes("consiglio"),
    },
    {
      officialSlug: "paolo-mascaro",
      organoSlug: "giunta-comunale",
      membershipRole: "Sindaco (Presidente)",
      position: 0,
      notes: historical2019Notes("giunta"),
    },
  ];

export const HISTORICAL_2019_INSTITUTIONAL_MEMBERSHIPS: InstitutionalMembershipSeed[] =
  historical2019BaseMemberships.map((membership) => ({
    ...membership,
    termLabel: historical2019TermLabel,
    startDate: "2019-11-10",
    endDate: null,
    sourceLabel: ELIGENDO_2019_LAMEZIA_SOURCE.label,
    sourceUrl: ELIGENDO_2019_LAMEZIA_SOURCE.url,
  }));

export const INSTITUTIONAL_MEMBERSHIPS: InstitutionalMembershipSeed[] = [
  ...CURRENT_INSTITUTIONAL_MEMBERSHIPS,
  ...HISTORICAL_2019_INSTITUTIONAL_MEMBERSHIPS,
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

const membershipsByOfficialSlug = new Map<
  string,
  InstitutionalMembershipSeed[]
>();

for (const membership of INSTITUTIONAL_MEMBERSHIPS) {
  const existing = membershipsByOfficialSlug.get(membership.officialSlug) ?? [];
  existing.push(membership);
  membershipsByOfficialSlug.set(membership.officialSlug, existing);
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

export function institutionalMembershipsForOfficial(
  slug: string,
): InstitutionalMembershipSeed[] {
  return membershipsByOfficialSlug.get(slug) ?? [];
}
