import type { PublicProposal } from "./propostePubblicheCore";

/**
 * Semantic profile for civic proposals.
 *
 * The complete official taxonomy is retained in the data layer even when only a
 * subset is currently used by published proposals. Public presentation uses one
 * primary subject; secondary subjects and semantic metadata remain available for
 * analysis and audit without being pushed into the default UI.
 */
export const PA_PUBLIC_SERVICE_SUBJECT_SCHEME = {
  label: "Vocabolario Controllato sulle Materie dei Servizi Pubblici",
  uri: "https://w3id.org/italia/controlled-vocabulary/classifications-for-public-services/public-services-subject-matters",
  sourceUrl:
    "https://schema.gov.it/semantic-assets/details/?uri=https%3A%2F%2Fw3id.org%2Fitalia%2Fcontrolled-vocabulary%2Fclassifications-for-public-services%2Fpublic-services-subject-matters",
  ontologyUri: "https://w3id.org/italia/onto/CPSV",
  conceptCount: 15,
  numberOfLevels: 1,
} as const;

export const PA_PUBLIC_SERVICE_SUBJECT_CODES = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
] as const;

export type PaPublicServiceSubjectCode =
  (typeof PA_PUBLIC_SERVICE_SUBJECT_CODES)[number];

function publicServiceSubject(
  code: PaPublicServiceSubjectCode,
  label: string,
) {
  return {
    code,
    label,
    uri: `${PA_PUBLIC_SERVICE_SUBJECT_SCHEME.uri}/${code}`,
    schemeUri: PA_PUBLIC_SERVICE_SUBJECT_SCHEME.uri,
    authority: "Agenzia per l'Italia Digitale",
    source: "schema.gov.it / AgID" as const,
  };
}

/**
 * Complete 15-concept official vocabulary used as the backend reference catalogue.
 * A concept being present here does not imply that it must be displayed in the UI
 * or that the current archive already contains a proposal classified under it.
 */
export const PA_PUBLIC_SERVICE_SUBJECTS = {
  "1": publicServiceSubject("1", "Educazione e formazione"),
  "2": publicServiceSubject("2", "Salute, benessere e assistenza"),
  "3": publicServiceSubject("3", "Vita lavorativa"),
  "4": publicServiceSubject("4", "Mobilità e trasporti"),
  "5": publicServiceSubject("5", "Catasto e urbanistica"),
  "6": publicServiceSubject("6", "Anagrafe e stato civile"),
  "7": publicServiceSubject("7", "Turismo"),
  "8": publicServiceSubject("8", "Giustizia e sicurezza pubblica"),
  "9": publicServiceSubject("9", "Tributi, finanze e contravvenzioni"),
  "10": publicServiceSubject("10", "Cultura e tempo libero"),
  "11": publicServiceSubject("11", "Ambiente"),
  "12": publicServiceSubject("12", "Impresa e commercio"),
  "13": publicServiceSubject("13", "Autorizzazioni"),
  "14": publicServiceSubject("14", "Appalti pubblici"),
  "15": publicServiceSubject("15", "Agricoltura e pesca"),
} as const satisfies Record<
  PaPublicServiceSubjectCode,
  {
    code: PaPublicServiceSubjectCode;
    label: string;
    uri: string;
    schemeUri: string;
    authority: string;
    source: "schema.gov.it / AgID";
  }
>;

export const EU_DATA_THEME_SCHEME = {
  label: "Data Theme",
  uri: "http://publications.europa.eu/resource/authority/data-theme",
  authority: "Publications Office of the European Union",
} as const;

export const PA_TRANSPARENCY_SUBJECT_SCHEME_URI =
  "https://w3id.org/italia/controlled-vocabulary/classifications-for-transparency/transparency-subject" as const;

export const OFFICIAL_FALLBACK_DATA_THEMES = {
  GOVE: {
    code: "GOVE",
    label: "Governo e settore pubblico",
    uri: "http://publications.europa.eu/resource/authority/data-theme/GOVE",
    schemeUri: EU_DATA_THEME_SCHEME.uri,
    authority: EU_DATA_THEME_SCHEME.authority,
    source: "EU Data Theme" as const,
    relatedOfficialUris: [PA_TRANSPARENCY_SUBJECT_SCHEME_URI],
  },
} as const;

/** No thematic LT extension is currently needed. */
export const LT_SEMANTIC_EXTENSIONS = {} as const;
export type LtSemanticExtensionId = never;
export type LtSemanticExtension = {
  id: string;
  label: string;
  definition: string;
  relatedOfficialUris: readonly string[];
};

export type OfficialFallbackDataThemeCode =
  keyof typeof OFFICIAL_FALLBACK_DATA_THEMES;
export type ProposalPaSubjectCode =
  | PaPublicServiceSubjectCode
  | OfficialFallbackDataThemeCode;

export type PaSemanticConcept = {
  code: ProposalPaSubjectCode;
  label: string;
  uri: string;
  schemeUri: string;
  authority: string;
  source: "schema.gov.it / AgID" | "EU Data Theme";
  relatedOfficialUris?: readonly string[];
};

type ProposalPaSubjectRef =
  | { scheme: "public-service-subject"; code: PaPublicServiceSubjectCode }
  | { scheme: "eu-data-theme"; code: OfficialFallbackDataThemeCode };

export type ProposalPaSemanticProfile = {
  primary: ProposalPaSubjectRef;
  secondary?: readonly ProposalPaSubjectRef[];
  mappingNote?: string;
};

const ps = (code: PaPublicServiceSubjectCode): ProposalPaSubjectRef => ({
  scheme: "public-service-subject",
  code,
});

const eu = (code: OfficialFallbackDataThemeCode): ProposalPaSubjectRef => ({
  scheme: "eu-data-theme",
  code,
});

const THEME_TO_PA_PROFILE: Record<string, ProposalPaSemanticProfile> = {
  "Sicurezza e decoro urbano": {
    primary: ps("8"),
    secondary: [ps("5")],
    mappingNote:
      "Sicurezza pubblica come materia primaria; urbanistica come classificazione secondaria dello spazio urbano interessato.",
  },
  "Decoro urbano e manutenzione": {
    primary: ps("5"),
  },
  "Welfare e servizi per l'infanzia": {
    primary: ps("1"),
    secondary: [ps("2")],
    mappingNote:
      "Il vocabolario nazionale include esplicitamente i nidi in Educazione e formazione e i servizi ai minori in Salute, benessere e assistenza.",
  },
  "Spazio pubblico e mobilità": {
    primary: ps("4"),
    secondary: [ps("5")],
  },
  "Welfare e disabilità": {
    primary: ps("2"),
  },
  "Scuola e inclusione": {
    primary: ps("1"),
  },
  "Rigenerazione urbana e patrimonio": {
    primary: ps("5"),
    secondary: [ps("10")],
  },
  "Ambiente e sicurezza urbana": {
    primary: ps("11"),
    secondary: [ps("8")],
  },
  "Ambiente, costa e spazio pubblico": {
    primary: ps("11"),
    secondary: [ps("5")],
  },
  "Mobilità ciclopedonale e sicurezza stradale": {
    primary: ps("4"),
    secondary: [ps("8")],
  },
  "Sanità e rete ospedaliera": {
    primary: ps("2"),
  },
  "Scuola, clima e sicurezza": {
    primary: ps("1"),
    secondary: [ps("8")],
  },
  "Tutela animale e servizi civici": {
    primary: ps("2"),
    mappingNote:
      "La definizione ufficiale di Salute, benessere e assistenza include esplicitamente i servizi relativi agli animali.",
  },
  "Manutenzione urbana e prevenzione del rischio": {
    primary: ps("5"),
    secondary: [ps("8")],
  },
  "Mobilità, aeroporto e sviluppo territoriale": {
    primary: ps("4"),
    secondary: [ps("7")],
  },
  "Sport e impianti pubblici": {
    primary: ps("10"),
    secondary: [ps("5")],
    mappingNote:
      "La materia ufficiale Cultura e tempo libero include espressamente l'accesso a luoghi dello sport e, come etichetta alternativa, gli impianti sportivi. Catasto e urbanistica resta una classificazione secondaria per il contesto dell'infrastruttura pubblica.",
  },
  "Trasparenza e partecipazione democratica": {
    primary: eu("GOVE"),
    mappingNote:
      "Le 15 materie nazionali dei servizi pubblici non contengono una voce specifica per pubblicità dell'attività istituzionale e partecipazione civica. Si usa quindi il concetto ufficiale EU Data Theme GOVE — Governo e settore pubblico, mantenendo il vocabolario nazionale della trasparenza come risorsa ufficiale correlata.",
  },
};

function resolveOfficialConcept(ref: ProposalPaSubjectRef): PaSemanticConcept {
  if (ref.scheme === "public-service-subject") {
    return PA_PUBLIC_SERVICE_SUBJECTS[ref.code];
  }
  return OFFICIAL_FALLBACK_DATA_THEMES[ref.code];
}

export function getProposalPaSemanticProfile(
  proposal: Pick<PublicProposal, "id" | "theme">,
): ProposalPaSemanticProfile {
  const profile = THEME_TO_PA_PROFILE[proposal.theme];
  if (!profile) {
    throw new Error(
      `Missing official semantic mapping for proposal ${proposal.id} (theme: ${proposal.theme})`,
    );
  }
  return profile;
}

export function getProposalPrimaryPaSubject(
  proposal: Pick<PublicProposal, "id" | "theme">,
): PaSemanticConcept {
  return resolveOfficialConcept(getProposalPaSemanticProfile(proposal).primary);
}

export function getProposalSecondaryPaSubjects(
  proposal: Pick<PublicProposal, "id" | "theme">,
): readonly PaSemanticConcept[] {
  return (getProposalPaSemanticProfile(proposal).secondary ?? []).map(
    resolveOfficialConcept,
  );
}

export function getProposalOfficialPaSubjects(
  proposal: Pick<PublicProposal, "id" | "theme">,
): readonly PaSemanticConcept[] {
  return [
    getProposalPrimaryPaSubject(proposal),
    ...getProposalSecondaryPaSubjects(proposal),
  ];
}

export function getProposalLocalSemanticExtensions(
  proposal: Pick<PublicProposal, "id" | "theme">,
): readonly LtSemanticExtension[] {
  getProposalPaSemanticProfile(proposal);
  return [];
}

/** Complete backend catalogue, including subjects not yet used by proposals. */
export function getAllPaPublicServiceSubjects() {
  return PA_PUBLIC_SERVICE_SUBJECT_CODES.map(
    (code) => PA_PUBLIC_SERVICE_SUBJECTS[code],
  );
}

/** All official concepts used anywhere in the archive, including secondaries. */
export function getAvailablePaSubjects(proposals: readonly PublicProposal[]) {
  const conceptMap = new Map<string, PaSemanticConcept>();
  for (const proposal of proposals) {
    for (const concept of getProposalOfficialPaSubjects(proposal)) {
      conceptMap.set(concept.uri, concept);
    }
  }
  return sortConcepts([...conceptMap.values()]);
}

/** Only primary concepts: this is the intentionally compact public-navigation set. */
export function getAvailablePrimaryPaSubjects(
  proposals: readonly PublicProposal[],
) {
  const conceptMap = new Map<string, PaSemanticConcept>();
  for (const proposal of proposals) {
    const concept = getProposalPrimaryPaSubject(proposal);
    conceptMap.set(concept.uri, concept);
  }
  return sortConcepts([...conceptMap.values()]);
}

function sortConcepts(concepts: PaSemanticConcept[]) {
  return concepts.sort((a, b) => {
    const aNumber = Number(a.code);
    const bNumber = Number(b.code);
    if (Number.isFinite(aNumber) && Number.isFinite(bNumber)) return aNumber - bNumber;
    if (Number.isFinite(aNumber)) return -1;
    if (Number.isFinite(bNumber)) return 1;
    return a.label.localeCompare(b.label, "it");
  });
}

/** Analytical match: includes primary and secondary semantic classifications. */
export function proposalMatchesPaSubject(
  proposal: Pick<PublicProposal, "id" | "theme">,
  code: ProposalPaSubjectCode,
) {
  return getProposalOfficialPaSubjects(proposal).some(
    (concept) => concept.code === code,
  );
}

/** Public-navigation match: one proposal belongs to one primary matter. */
export function proposalMatchesPrimaryPaSubject(
  proposal: Pick<PublicProposal, "id" | "theme">,
  code: ProposalPaSubjectCode,
) {
  return getProposalPrimaryPaSubject(proposal).code === code;
}

export function getMappedProposalThemes() {
  return Object.keys(THEME_TO_PA_PROFILE).sort((a, b) =>
    a.localeCompare(b, "it"),
  );
}
