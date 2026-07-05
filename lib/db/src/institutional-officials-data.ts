const COMUNE_BASE_URL = "https://www.comune.lamezia-terme.cz.it";

export const INSTITUTIONAL_COMMISSION_ORGANI = [
  {
    slug: "commissione-affari-generali-istituzionali",
    name: "I Commissione - Affari Generali ed Istituzionali",
    description:
      "Commissione consiliare permanente su affari generali, istituzionali, decentramento e personale.",
  },
  {
    slug: "commissione-servizi-economici-finanziari",
    name: "II Commissione - Servizi economici e finanziari",
    description:
      "Commissione consiliare permanente sui servizi economici e finanziari.",
  },
  {
    slug: "commissione-servizi-sociali-sanita-ambiente",
    name: "III Commissione - Servizi sociali, sanita' e ambiente",
    description:
      "Commissione consiliare permanente su servizi sociali, sanita' e ambiente.",
  },
  {
    slug: "commissione-educazione-cultura-sport",
    name: "IV Commissione - Educazione, cultura e sport",
    description:
      "Commissione consiliare permanente su educazione, cultura e sport.",
  },
  {
    slug: "commissione-pianificazione-territorio",
    name: "V Commissione - Pianificazione e governo del territorio",
    description:
      "Commissione consiliare permanente su pianificazione, sviluppo e governo del territorio.",
  },
  {
    slug: "commissione-sviluppo-economico-attivita-produttive",
    name: "VI Commissione - Sviluppo economico e attivita' produttive",
    description:
      "Commissione consiliare permanente su sviluppo economico e attivita' produttive.",
  },
  {
    slug: "commissione-politiche-occupazionali-giovanili",
    name: "VII Commissione - Politiche occupazionali e giovanili",
    description:
      "Commissione consiliare permanente su politiche occupazionali e politiche giovanili.",
  },
] as const;

export type InstitutionalOrganoSlug =
  | "consiglio-comunale"
  | "giunta-comunale"
  | "commissioni-consiliari"
  | (typeof INSTITUTIONAL_COMMISSION_ORGANI)[number]["slug"];

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
  profileIncarichi?: readonly string[];
  profileOrganizations?: readonly string[];
  profileLastUpdated?: string;
  deleghe?: string;
  contactEmail?: string;
  contactPhone?: string;
};

export type InstitutionalMembershipSeed = {
  officialSlug: string;
  organoSlug: InstitutionalOrganoSlug;
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

export const COMMISSION_2025_SOURCE: InstitutionalSource = {
  label:
    "Comune di Lamezia Terme - Commissioni consiliari permanenti prot. 7264 del 27.1.2025",
  url: `${COMUNE_BASE_URL}/it/documenti_pubblici/commissioni-consiliari-permanenti-prot-7264-del-27-1-2025`,
  checkedAt: "2026-07-05",
};

export const COMMISSION_2025_DOCUMENT_URL =
  "https://lamezia-terme-api.municipiumapp.it/s3/3458/allegati/commiss-cons-perm-prot-7264-27-01-2025.pdf";

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

export const CURRENT_PROFILE_DETAILS = {
  "mario-murone": {
    deleghe:
      "Opere pubbliche, Servizi cimiteriali, Manutenzione straordinaria, Programmazione strategica e programmi complessi, Mobilita' urbana, Protezione Civile, Affari Legali, Partecipate e controllo analogo, Polizia municipale, Programmazione nazionale e comunitaria, Rapporti con enti sovraordinati.",
    contactEmail: "m.murone@comune.lamezia-terme.cz.it",
    contactPhone: "09682071",
  },
  "michelangelo-cardamone": {
    deleghe:
      "Cooperazione internazionale e Internazionalizzazione, Patrimonio, Urbanistica",
  },
  "tranquillo-paradiso": {
    deleghe: "Rapporti con il Consiglio, Sistemi informativi e transizione al Digitale",
  },
  "salvatore-pirelli": {
    deleghe: "Sport, Attivita' produttive",
  },
  "annalisa-spinelli": {
    deleghe:
      "Cultura, Turismo, Politiche giovanili, Pari opportunita', Pubblica istruzione, Spettacolo e promozione del territorio, Comunicazione istituzionale, Musei e Biblioteche",
  },
  "donatella-amicarelli": {
    deleghe:
      "Verde pubblico e parchi, Ambiente e Sicurezza Ambientale, Agricoltura, Riqualificazione periferie, Manutenzione ordinaria, Randagismo",
  },
  "maria-nardo": {
    deleghe: "Bilancio e Programmazione Finanziaria, Tributi e Personale",
  },
  "gennaro-gianturco": {
    deleghe: "Welfare e politiche sociali, Politiche abitative e social housing",
  },
} as const;

export const CURRENT_COUNCIL_PROFILE_SECTIONS = {
  "mario-murone": {
    profileIncarichi: ["Sindaco"],
    profileLastUpdated: "12 giugno 2026, 11:24",
  },
  "alessandro-saullo": {
    profileOrganizations: ["Consiglio Comunale"],
    profileLastUpdated: "23 giugno 2025, 13:29",
  },
  "annita-vitale": {
    profileOrganizations: ["Consiglio Comunale"],
    profileLastUpdated: "23 giugno 2025, 13:32",
  },
  "antonio-lorena": {
    profileOrganizations: ["Consiglio Comunale"],
    profileLastUpdated: "23 giugno 2025, 13:28",
  },
  "antonio-mastroianni": {
    profileOrganizations: ["Consiglio Comunale"],
    profileLastUpdated: "23 giugno 2025, 13:28",
  },
  "bernadette-serratore": {
    profileOrganizations: ["Consiglio Comunale"],
    profileLastUpdated: "23 giugno 2025, 13:29",
  },
  "doris-lo-moro": {
    profileOrganizations: ["Consiglio Comunale"],
    profileLastUpdated: "23 giugno 2025, 13:28",
  },
  "fabrizio-muraca": {
    profileOrganizations: ["Consiglio Comunale"],
    profileLastUpdated: "23 giugno 2025, 13:28",
  },
  "francesco-caruso": {
    profileOrganizations: ["Consiglio Comunale"],
    profileLastUpdated: "23 giugno 2025, 14:31",
  },
  "gennarino-masi": {
    profileOrganizations: ["Consiglio Comunale"],
    profileLastUpdated: "23 giugno 2025, 13:28",
  },
  "giancarlo-nicotera": {
    profileOrganizations: ["Consiglio Comunale"],
    profileLastUpdated: "23 giugno 2025, 13:29",
  },
  "giovanni-manuel-raso": {
    profileOrganizations: ["Consiglio Comunale"],
    profileLastUpdated: "23 giugno 2025, 13:29",
  },
  "lidia-vescio": {
    profileOrganizations: ["Consiglio Comunale"],
    profileLastUpdated: "23 giugno 2025, 13:32",
  },
  "maria-grandinetti": {
    profileIncarichi: ["Presidente del Consiglio Comunale"],
    profileOrganizations: ["Consiglio Comunale"],
    profileLastUpdated: "18 novembre 2025, 13:06",
  },
  "maria-lucia-raso": {
    profileOrganizations: ["Consiglio Comunale"],
    profileLastUpdated: "23 giugno 2025, 13:29",
  },
  "massimo-cristiano": {
    profileOrganizations: ["Consiglio Comunale"],
    profileLastUpdated: "23 giugno 2025, 13:27",
  },
  "matteo-folino": {
    profileOrganizations: ["Consiglio Comunale"],
    profileLastUpdated: "23 giugno 2025, 13:27",
  },
  "michele-rosato": {
    profileOrganizations: ["Consiglio Comunale"],
    profileLastUpdated: "23 giugno 2025, 13:29",
  },
  "oscar-branca": {
    profileOrganizations: ["Consiglio Comunale"],
    profileLastUpdated: "23 giugno 2025, 13:26",
  },
  "titina-caruso": {
    profileOrganizations: ["Consiglio Comunale"],
    profileLastUpdated: "23 giugno 2025, 13:31",
  },
  "davide-mastroianni": {
    profileOrganizations: ["Consiglio Comunale"],
    profileLastUpdated: "16 luglio 2025, 12:30",
  },
  "carmine-villella": {
    profileOrganizations: ["Consiglio Comunale"],
    profileLastUpdated: "16 luglio 2025, 12:24",
  },
  "adelaide-colosimo": {
    profileOrganizations: ["Consiglio Comunale"],
    profileLastUpdated: "16 luglio 2025, 12:26",
  },
  "carmelina-isa-muraca": {
    profileOrganizations: ["Consiglio Comunale"],
    profileLastUpdated: "25 febbraio 2026, 11:20",
  },
} as const;

export const CURRENT_GIUNTA_PROFILE_SECTIONS = {
  "mario-murone": {
    profileIncarichi: ["Sindaco"],
    profileLastUpdated: "12 giugno 2026, 11:24",
  },
  "michelangelo-cardamone": {
    profileIncarichi: ["Vice Sindaco"],
    profileOrganizations: ["Giunta Comunale"],
    profileLastUpdated: "16 luglio 2025, 11:25",
  },
  "tranquillo-paradiso": {
    profileOrganizations: ["Giunta Comunale"],
    profileLastUpdated: "18 novembre 2025, 08:30",
  },
  "salvatore-pirelli": {
    profileOrganizations: ["Giunta Comunale"],
    profileLastUpdated: "16 luglio 2025, 11:34",
  },
  "annalisa-spinelli": {
    profileOrganizations: ["Giunta Comunale"],
    profileLastUpdated: "16 luglio 2025, 11:37",
  },
  "donatella-amicarelli": {
    profileOrganizations: ["Giunta Comunale"],
    profileLastUpdated: "27 marzo 2026, 12:21",
  },
  "maria-nardo": {
    profileOrganizations: ["Giunta Comunale"],
    profileLastUpdated: "22 maggio 2026, 09:50",
  },
  "gennaro-gianturco": {
    profileOrganizations: ["Giunta Comunale"],
    profileLastUpdated: "1 giugno 2026, 14:41",
  },
} as const;

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
    profileUrl: `${COMUNE_BASE_URL}/it/persone/${personPath}`,
    status: "in_carica",
    source: INSTITUTIONAL_POLITICI_SOURCE,
    ...CURRENT_PROFILE_DETAILS[slug as keyof typeof CURRENT_PROFILE_DETAILS],
    ...CURRENT_COUNCIL_PROFILE_SECTIONS[
      slug as keyof typeof CURRENT_COUNCIL_PROFILE_SECTIONS
    ],
    ...CURRENT_GIUNTA_PROFILE_SECTIONS[
      slug as keyof typeof CURRENT_GIUNTA_PROFILE_SECTIONS
    ],
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

export const HISTORICAL_2019_INSTITUTIONAL_OFFICIALS: InstitutionalOfficialSeed[] =
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

export const HISTORICAL_2025_COMMISSION_OFFICIALS: InstitutionalOfficialSeed[] =
  [
    ["Dario Arcieri", "dario-arcieri-2025"],
    ["Anna Caruso", "anna-caruso-2025"],
    ["Lucia Alessandra Cittadino", "lucia-alessandra-cittadino-2025"],
    ["Enrico Costantino", "enrico-costantino-2025"],
    ["Antonietta D'Amico", "antonietta-damico-2025"],
    ["Pietro Gallo", "pietro-gallo-2025"],
    ["Danilo Gatto", "danilo-gatto-2025"],
    ["Giovanni Pulice", "giovanni-pulice-2025"],
    ["Alessandro Santo Raso", "alessandro-santo-raso-2025"],
    ["Rosy Rubino", "rosy-rubino-2025"],
    ["Giovanni Saladini", "giovanni-saladini-2025"],
    ["Peppino Zaffina", "peppino-zaffina-2025"],
  ].map(([name, slug]) => ({
    name,
    slug,
    role: "consigliere",
    roleTitle: "Consigliere comunale - commissioni permanenti 2025",
    profileUrl: null,
    status: "cessato",
    source: COMMISSION_2025_SOURCE,
    biographyNote: [
      "Anagrafica storica minima derivata dal provvedimento comunale",
      "sulle Commissioni consiliari permanenti prot. 7264 del 27/01/2025.",
      "La scheda personale istituzionale non risulta nel registro corrente",
      "dei politici comunali.",
    ].join(" "),
  }));

export const HISTORICAL_INSTITUTIONAL_OFFICIALS: InstitutionalOfficialSeed[] = [
  ...HISTORICAL_2019_INSTITUTIONAL_OFFICIALS,
  ...HISTORICAL_2025_COMMISSION_OFFICIALS,
];

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

const commission2025TermLabel =
  "Commissioni consiliari permanenti 2025 - amministrazione precedente";

const commission2025OfficialSlugBySourceName: Record<string, string> = {
  "ARCIERI DARIO": "dario-arcieri-2025",
  "CARUSO ANNA": "anna-caruso-2025",
  "CITTADINO LUCIA ALESSANDRA": "lucia-alessandra-cittadino-2025",
  "COSTANTINO ENRICO": "enrico-costantino-2025",
  "D'AMICO ANTONIETTA": "antonietta-damico-2025",
  "FOLINO MATTEO": "matteo-folino",
  "GALLO PIETRO": "pietro-gallo-2025",
  "GATTO DANILO": "danilo-gatto-2025",
  "GIANTURCO GENNARO": "gennaro-gianturco",
  "GRANDINETTI MARIA": "maria-grandinetti",
  "LORENA ANTONIO": "antonio-lorena",
  "MASTROIANNI ANTONIO": "antonio-mastroianni",
  "MASTROIANNI DAVIDE": "davide-mastroianni",
  "PARADISO TRANQUILLO": "tranquillo-paradiso",
  "PEGNA RUGGERO": "ruggero-pegna",
  "PICCIONI ROSARIO": "rosario-piccioni",
  "PULICE GIOVANNI": "giovanni-pulice-2025",
  "RASO ALESSANDRO SANTO": "alessandro-santo-raso-2025",
  "RUBINO ROSY": "rosy-rubino-2025",
  "SALADINI GIOVANNI": "giovanni-saladini-2025",
  "SAULLO ALESSANDRO": "alessandro-saullo",
  "ZAFFINA PEPPINO": "peppino-zaffina-2025",
};

export const COMMISSION_2025_OFFICIAL_SLUG_BY_SOURCE_NAME =
  commission2025OfficialSlugBySourceName;

type Commission2025Member = {
  sourceName: keyof typeof commission2025OfficialSlugBySourceName;
  group: string;
  sourceNumber: number;
};

type Historical2025CouncilMember = {
  sourceName: keyof typeof commission2025OfficialSlugBySourceName;
  groups: string[];
};

export const HISTORICAL_2025_COMMISSION_COMPOSITIONS: Array<{
  organoSlug: (typeof INSTITUTIONAL_COMMISSION_ORGANI)[number]["slug"];
  sourceTitle: string;
  members: Commission2025Member[];
}> = [
  {
    organoSlug: "commissione-affari-generali-istituzionali",
    sourceTitle:
      "I Affari Generali ed Istituzionali, decentramento, personale",
    members: [
      { sourceName: "ARCIERI DARIO", group: "Gruppo Misto", sourceNumber: 2 },
      { sourceName: "CARUSO ANNA", group: "Forza Azzurri", sourceNumber: 2 },
      {
        sourceName: "CITTADINO LUCIA ALESSANDRA",
        group: "Una Nuova Era",
        sourceNumber: 2,
      },
      {
        sourceName: "COSTANTINO ENRICO",
        group: "Assieme Mascaro Sindaco",
        sourceNumber: 1,
      },
      {
        sourceName: "D'AMICO ANTONIETTA",
        group: "Lega Salvini Premier",
        sourceNumber: 2,
      },
      { sourceName: "FOLINO MATTEO", group: "Forza Italia", sourceNumber: 3 },
      { sourceName: "PEGNA RUGGERO", group: "UDC - Nuovo CDU", sourceNumber: 2 },
      {
        sourceName: "PICCIONI ROSARIO",
        group: "Lamezia Bene Comune",
        sourceNumber: 1,
      },
      {
        sourceName: "PULICE GIOVANNI",
        group: "Lamezia Responsabile",
        sourceNumber: 2,
      },
      { sourceName: "RUBINO ROSY", group: "Noi Moderati", sourceNumber: 3 },
      {
        sourceName: "SAULLO ALESSANDRO",
        group: "Fratelli d'Italia",
        sourceNumber: 3,
      },
      { sourceName: "ZAFFINA PEPPINO", group: "Orgoglio Lamezia", sourceNumber: 1 },
    ],
  },
  {
    organoSlug: "commissione-servizi-economici-finanziari",
    sourceTitle: "II Servizi economici e finanziari",
    members: [
      {
        sourceName: "CITTADINO LUCIA ALESSANDRA",
        group: "Una Nuova Era",
        sourceNumber: 2,
      },
      {
        sourceName: "COSTANTINO ENRICO",
        group: "Assieme Mascaro Sindaco",
        sourceNumber: 1,
      },
      { sourceName: "GIANTURCO GENNARO", group: "Gruppo Misto", sourceNumber: 2 },
      { sourceName: "GRANDINETTI MARIA", group: "Forza Azzurri", sourceNumber: 2 },
      {
        sourceName: "LORENA ANTONIO",
        group: "Fratelli d'Italia",
        sourceNumber: 3,
      },
      {
        sourceName: "MASTROIANNI ANTONIO",
        group: "Lega Salvini Premier",
        sourceNumber: 2,
      },
      { sourceName: "PARADISO TRANQUILLO", group: "Forza Italia", sourceNumber: 3 },
      { sourceName: "PEGNA RUGGERO", group: "UDC - Nuovo CDU", sourceNumber: 2 },
      {
        sourceName: "PICCIONI ROSARIO",
        group: "Lamezia Bene Comune",
        sourceNumber: 1,
      },
      {
        sourceName: "PULICE GIOVANNI",
        group: "Lamezia Responsabile",
        sourceNumber: 2,
      },
      { sourceName: "RASO ALESSANDRO SANTO", group: "Noi Moderati", sourceNumber: 3 },
      { sourceName: "ZAFFINA PEPPINO", group: "Orgoglio Lamezia", sourceNumber: 1 },
    ],
  },
  {
    organoSlug: "commissione-servizi-sociali-sanita-ambiente",
    sourceTitle: "III Servizi sociali, sanita', ambiente",
    members: [
      {
        sourceName: "CITTADINO LUCIA ALESSANDRA",
        group: "Una Nuova Era",
        sourceNumber: 2,
      },
      {
        sourceName: "COSTANTINO ENRICO",
        group: "Assieme Mascaro Sindaco",
        sourceNumber: 1,
      },
      {
        sourceName: "D'AMICO ANTONIETTA",
        group: "Lega Salvini Premier",
        sourceNumber: 2,
      },
      { sourceName: "GATTO DANILO", group: "Lamezia Responsabile", sourceNumber: 2 },
      { sourceName: "GIANTURCO GENNARO", group: "Gruppo Misto", sourceNumber: 2 },
      { sourceName: "GRANDINETTI MARIA", group: "Forza Azzurri", sourceNumber: 3 },
      { sourceName: "MASTROIANNI DAVIDE", group: "Forza Italia", sourceNumber: 3 },
      { sourceName: "PEGNA RUGGERO", group: "UDC - Nuovo CDU", sourceNumber: 2 },
      {
        sourceName: "PICCIONI ROSARIO",
        group: "Lamezia Bene Comune",
        sourceNumber: 1,
      },
      { sourceName: "SALADINI GIOVANNI", group: "Noi Moderati", sourceNumber: 3 },
      {
        sourceName: "SAULLO ALESSANDRO",
        group: "Fratelli d'Italia",
        sourceNumber: 3,
      },
      { sourceName: "ZAFFINA PEPPINO", group: "Orgoglio Lamezia", sourceNumber: 1 },
    ],
  },
  {
    organoSlug: "commissione-educazione-cultura-sport",
    sourceTitle: "IV Servizi all'educazione, cultura e sport",
    members: [
      {
        sourceName: "CITTADINO LUCIA ALESSANDRA",
        group: "Una Nuova Era",
        sourceNumber: 2,
      },
      {
        sourceName: "COSTANTINO ENRICO",
        group: "Assieme Mascaro Sindaco",
        sourceNumber: 1,
      },
      {
        sourceName: "D'AMICO ANTONIETTA",
        group: "Lega Salvini Premier",
        sourceNumber: 2,
      },
      { sourceName: "GATTO DANILO", group: "Lamezia Responsabile", sourceNumber: 2 },
      { sourceName: "GIANTURCO GENNARO", group: "Gruppo Misto", sourceNumber: 2 },
      { sourceName: "GRANDINETTI MARIA", group: "Forza Azzurri", sourceNumber: 2 },
      {
        sourceName: "LORENA ANTONIO",
        group: "Fratelli d'Italia",
        sourceNumber: 3,
      },
      { sourceName: "MASTROIANNI DAVIDE", group: "Forza Italia", sourceNumber: 3 },
      { sourceName: "PEGNA RUGGERO", group: "UDC - Nuovo CDU", sourceNumber: 2 },
      {
        sourceName: "PICCIONI ROSARIO",
        group: "Lamezia Bene Comune",
        sourceNumber: 1,
      },
      { sourceName: "SALADINI GIOVANNI", group: "Noi Moderati", sourceNumber: 3 },
      { sourceName: "ZAFFINA PEPPINO", group: "Orgoglio Lamezia", sourceNumber: 1 },
    ],
  },
  {
    organoSlug: "commissione-pianificazione-territorio",
    sourceTitle: "V Pianificazione, sviluppo e governo del territorio",
    members: [
      { sourceName: "ARCIERI DARIO", group: "Gruppo Misto", sourceNumber: 2 },
      { sourceName: "CARUSO ANNA", group: "Forza Azzurri", sourceNumber: 2 },
      {
        sourceName: "CITTADINO LUCIA ALESSANDRA",
        group: "Una Nuova Era",
        sourceNumber: 2,
      },
      {
        sourceName: "COSTANTINO ENRICO",
        group: "Assieme Mascaro Sindaco",
        sourceNumber: 1,
      },
      { sourceName: "FOLINO MATTEO", group: "Forza Italia", sourceNumber: 3 },
      {
        sourceName: "GALLO PIETRO",
        group: "Fratelli d'Italia",
        sourceNumber: 3,
      },
      {
        sourceName: "MASTROIANNI ANTONIO",
        group: "Lega Salvini Premier",
        sourceNumber: 2,
      },
      { sourceName: "PEGNA RUGGERO", group: "UDC - Nuovo CDU", sourceNumber: 2 },
      {
        sourceName: "PICCIONI ROSARIO",
        group: "Lamezia Bene Comune",
        sourceNumber: 1,
      },
      {
        sourceName: "PULICE GIOVANNI",
        group: "Lamezia Responsabile",
        sourceNumber: 2,
      },
      { sourceName: "RASO ALESSANDRO SANTO", group: "Noi Moderati", sourceNumber: 3 },
      { sourceName: "ZAFFINA PEPPINO", group: "Orgoglio Lamezia", sourceNumber: 1 },
    ],
  },
  {
    organoSlug: "commissione-sviluppo-economico-attivita-produttive",
    sourceTitle: "VI Sviluppo economico ed attivita' produttive",
    members: [
      { sourceName: "CARUSO ANNA", group: "Forza Azzurri", sourceNumber: 2 },
      {
        sourceName: "CITTADINO LUCIA ALESSANDRA",
        group: "Una Nuova Era",
        sourceNumber: 2,
      },
      {
        sourceName: "COSTANTINO ENRICO",
        group: "Assieme per Mascaro Sindaco",
        sourceNumber: 1,
      },
      {
        sourceName: "GALLO PIETRO",
        group: "Fratelli d'Italia",
        sourceNumber: 3,
      },
      { sourceName: "GATTO DANILO", group: "Lamezia Responsabile", sourceNumber: 2 },
      { sourceName: "GIANTURCO GENNARO", group: "Gruppo Misto", sourceNumber: 2 },
      {
        sourceName: "MASTROIANNI ANTONIO",
        group: "Lega Salvini Premier",
        sourceNumber: 2,
      },
      { sourceName: "PARADISO TRANQUILLO", group: "Forza Italia", sourceNumber: 3 },
      { sourceName: "PEGNA RUGGERO", group: "UDC - Nuovo CDU", sourceNumber: 2 },
      {
        sourceName: "PICCIONI ROSARIO",
        group: "Lamezia Bene Comune",
        sourceNumber: 1,
      },
      { sourceName: "RUBINO ROSY", group: "Noi Moderati", sourceNumber: 3 },
      { sourceName: "ZAFFINA PEPPINO", group: "Orgoglio Lamezia", sourceNumber: 1 },
    ],
  },
  {
    organoSlug: "commissione-politiche-occupazionali-giovanili",
    sourceTitle: "VII Politiche occupazionali e politiche giovanili",
    members: [
      { sourceName: "ARCIERI DARIO", group: "Gruppo Misto", sourceNumber: 2 },
      { sourceName: "CARUSO ANNA", group: "Forza Azzurri", sourceNumber: 2 },
      {
        sourceName: "CITTADINO LUCIA ALESSANDRA",
        group: "Una Nuova Era",
        sourceNumber: 2,
      },
      {
        sourceName: "COSTANTINO ENRICO",
        group: "Assieme per Mascaro Sindaco",
        sourceNumber: 1,
      },
      {
        sourceName: "D'AMICO ANTONIETTA",
        group: "Lega Salvini Premier",
        sourceNumber: 2,
      },
      { sourceName: "GATTO DANILO", group: "Lamezia Responsabile", sourceNumber: 2 },
      {
        sourceName: "LORENA ANTONIO",
        group: "Fratelli d'Italia",
        sourceNumber: 3,
      },
      { sourceName: "FOLINO MATTEO", group: "Forza Italia", sourceNumber: 3 },
      { sourceName: "PEGNA RUGGERO", group: "UDC - Nuovo CDU", sourceNumber: 2 },
      {
        sourceName: "PICCIONI ROSARIO",
        group: "Lamezia Bene Comune",
        sourceNumber: 1,
      },
      { sourceName: "RUBINO ROSY", group: "Noi Moderati", sourceNumber: 3 },
      { sourceName: "ZAFFINA PEPPINO", group: "Orgoglio Lamezia", sourceNumber: 1 },
    ],
  },
];

function commission2025Notes(member: Commission2025Member): string {
  return [
    "Composizione storica della commissione permanente riportata nel",
    "provvedimento comunale prot. 7264 del 27/01/2025.",
    `Gruppo indicato dalla fonte: ${member.group}.`,
    `Ultima colonna della fonte: ${member.sourceNumber}.`,
    "Il provvedimento prova la composizione alla data indicata e non",
    "certifica una data di cessazione.",
  ].join(" ");
}

export const HISTORICAL_2025_COMMISSION_MEMBERSHIPS: InstitutionalMembershipSeed[] =
  HISTORICAL_2025_COMMISSION_COMPOSITIONS.flatMap((commission) =>
    commission.members.map((member, index) => ({
      officialSlug: commission2025OfficialSlugBySourceName[member.sourceName],
      organoSlug: commission.organoSlug,
      membershipRole: `Componente (${member.group})`,
      termLabel: commission2025TermLabel,
      startDate: "2025-01-27",
      endDate: null,
      sourceLabel: COMMISSION_2025_SOURCE.label,
      sourceUrl: COMMISSION_2025_SOURCE.url,
      notes: commission2025Notes(member),
      position: index,
    })),
  );

const historical2025CouncilTermLabel =
  "Consiglio comunale 2025 - amministrazione precedente (da commissioni permanenti)";

function uniqueHistorical2025CouncilMembers(): Historical2025CouncilMember[] {
  const bySourceName = new Map<
    keyof typeof commission2025OfficialSlugBySourceName,
    Set<string>
  >();
  for (const commission of HISTORICAL_2025_COMMISSION_COMPOSITIONS) {
    for (const member of commission.members) {
      const groups = bySourceName.get(member.sourceName) ?? new Set<string>();
      groups.add(member.group);
      bySourceName.set(member.sourceName, groups);
    }
  }
  return Array.from(bySourceName, ([sourceName, groups]) => ({
    sourceName,
    groups: Array.from(groups),
  }));
}

function historical2025CouncilNotes(member: Historical2025CouncilMember): string {
  return [
    "Appartenenza storica al Consiglio desunta dalla presenza nel",
    "provvedimento comunale prot. 7264 del 27/01/2025 sulle Commissioni",
    "consiliari permanenti.",
    `Gruppo/i indicati dalla fonte: ${member.groups.join("; ")}.`,
    "Copertura fonte-limitata: il provvedimento prova la presenza del",
    "consigliere nelle commissioni alla data indicata, ma non certifica",
    "la composizione completa del Consiglio ne' una data di cessazione.",
  ].join(" ");
}

export const HISTORICAL_2025_COUNCIL_MEMBERSHIPS: InstitutionalMembershipSeed[] =
  uniqueHistorical2025CouncilMembers().map((member, index) => ({
    officialSlug: commission2025OfficialSlugBySourceName[member.sourceName],
    organoSlug: "consiglio-comunale",
    membershipRole: `Consigliere comunale (${member.groups.join("; ")})`,
    termLabel: historical2025CouncilTermLabel,
    startDate: "2025-01-27",
    endDate: null,
    sourceLabel: COMMISSION_2025_SOURCE.label,
    sourceUrl: COMMISSION_2025_SOURCE.url,
    notes: historical2025CouncilNotes(member),
    position: index,
  }));

export const INSTITUTIONAL_MEMBERSHIPS: InstitutionalMembershipSeed[] = [
  ...CURRENT_INSTITUTIONAL_MEMBERSHIPS,
  ...HISTORICAL_2019_INSTITUTIONAL_MEMBERSHIPS,
  ...HISTORICAL_2025_COUNCIL_MEMBERSHIPS,
  ...HISTORICAL_2025_COMMISSION_MEMBERSHIPS,
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
