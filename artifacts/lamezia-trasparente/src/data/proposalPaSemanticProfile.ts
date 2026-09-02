import type { PublicProposal } from "./propostePubblicheCore";

/**
 * Semantic profile for civic proposals.
 *
 * Primary classification reuses the official controlled vocabulary
 * "Materie dei servizi pubblici" published in the national semantic-asset
 * catalogue (schema.gov.it / dati-semantic-assets). When that 15-item scheme
 * has a genuine domain gap, the profile falls back to another official concept
 * already linked from the Italian semantic assets. No local thematic concept is
 * currently required.
 */
export const PA_PUBLIC_SERVICE_SUBJECT_SCHEME = {
  label: "Vocabolario Controllato sulle Materie dei Servizi Pubblici",
  uri: "https://w3id.org/italia/controlled-vocabulary/classifications-for-public-services/public-services-subject-matters",
  sourceUrl:
    "https://schema.gov.it/semantic-assets/details/?uri=https%3A%2F%2Fw3id.org%2Fitalia%2Fcontrolled-vocabulary%2Fclassifications-for-public-services%2Fpublic-services-subject-matters",
  ontologyUri: "https://w3id.org/italia/onto/CPSV",
} as const;

export const EU_DATA_THEME_SCHEME = {
  label: "Data Theme",
  uri: "http://publications.europa.eu/resource/authority/data-theme",
  authority: "Publications Office of the European Union",
} as const;

export const PA_TRANSPARENCY_SUBJECT_SCHEME_URI =
  "https://w3id.org/italia/controlled-vocabulary/classifications-for-transparency/transparency-subject" as const;

export const PA_PUBLIC_SERVICE_SUBJECTS = {
  "1": { code: "1", label: "Educazione e formazione" },
  "2": { code: "2", label: "Salute, benessere e assistenza" },
  "3": { code: "3", label: "Vita lavorativa" },
  "4": { code: "4", label: "Mobilità e trasporti" },
  "5": { code: "5", label: "Catasto e urbanistica" },
  "6": { code: "6", label: "Anagrafe e stato civile" },
  "7": { code: "7", label: "Turismo" },
  "8": { code: "8", label: "Giustizia e sicurezza pubblica" },
  "9": { code: "9", label: "Tributi, finanze e contravvenzioni" },
  "10": { code: "10", label: "Cultura e tempo libero" },
  "11": { code: "11", label: "Ambiente" },
  "12": { code: "12", label: "Impresa e commercio" },
  "13": { code: "13", label: "Autorizzazioni" },
  "14": { code: "14", label: "Appalti pubblici" },
  "15": { code: "15", label: "Agricoltura e pesca" },
} as const;

export const OFFICIAL_FALLBACK_DATA_THEMES = {
  GOVE: {
    code: "GOVE",
    label: "Governo e settore pubblico",
    uri: "http://publications.europa.eu/resource/authority/data-theme/GOVE",
    schemeUri: EU_DATA_THEME_SCHEME.uri,
    authority: EU_DATA_THEME_SCHEME.authority,
    relatedOfficialUris: [PA_TRANSPARENCY_SUBJECT_SCHEME_URI],
  },
} as const;

export type PaPublicServiceSubjectCode = keyof typeof PA_PUBLIC_SERVICE_SUBJECTS;
export type OfficialFallbackDataThemeCode = keyof typeof OFFICIAL_FALLBACK_DATA_THEMES;
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

export type ProposalPaSemanticProfile = {
  officialSubjectCodes: readonly PaPublicServiceSubjectCode[];
  officialFallbackDataThemes?: readonly OfficialFallbackDataThemeCode[];
  mappingNote?: string;
};

const THEME_TO_PA_PROFILE: Record<string, ProposalPaSemanticProfile> = {
  "Sicurezza e decoro urbano": {
    officialSubjectCodes: ["8", "5"],
    mappingNote: "Sicurezza pubblica come materia primaria; urbanistica per lo spazio urbano interessato.",
  },
  "Decoro urbano e manutenzione": {
    officialSubjectCodes: ["5"],
  },
  "Welfare e servizi per l'infanzia": {
    officialSubjectCodes: ["1", "2"],
    mappingNote: "Il vocabolario nazionale include esplicitamente i nidi in Educazione e formazione e i servizi ai minori in Salute, benessere e assistenza.",
  },
  "Spazio pubblico e mobilità": {
    officialSubjectCodes: ["4", "5"],
  },
  "Welfare e disabilità": {
    officialSubjectCodes: ["2"],
  },
  "Scuola e inclusione": {
    officialSubjectCodes: ["1"],
  },
  "Rigenerazione urbana e patrimonio": {
    officialSubjectCodes: ["5", "10"],
  },
  "Ambiente e sicurezza urbana": {
    officialSubjectCodes: ["11", "8"],
  },
  "Ambiente, costa e spazio pubblico": {
    officialSubjectCodes: ["11", "5"],
  },
  "Mobilità ciclopedonale e sicurezza stradale": {
    officialSubjectCodes: ["4", "8"],
  },
  "Sanità e rete ospedaliera": {
    officialSubjectCodes: ["2"],
  },
  "Scuola, clima e sicurezza": {
    officialSubjectCodes: ["1", "8"],
  },
  "Tutela animale e servizi civici": {
    officialSubjectCodes: ["2"],
    mappingNote: "La definizione ufficiale di Salute, benessere e assistenza include esplicitamente i servizi relativi agli animali.",
  },
  "Manutenzione urbana e prevenzione del rischio": {
    officialSubjectCodes: ["5", "8"],
  },
  "Mobilità, aeroporto e sviluppo territoriale": {
    officialSubjectCodes: ["4", "7"],
  },
  "Trasparenza e partecipazione democratica": {
    officialSubjectCodes: [],
    officialFallbackDataThemes: ["GOVE"],
    mappingNote:
      "Le 15 materie nazionali dei servizi pubblici non contengono una voce specifica per pubblicità dell'attività istituzionale e partecipazione civica. Il profilo usa quindi il concetto ufficiale EU Data Theme GOVE — Governo e settore pubblico, già presente nei mapping delle risorse semantiche italiane — e mantiene il vocabolario nazionale della trasparenza come risorsa ufficiale correlata.",
  },
};

function officialPublicServiceConcept(
  code: PaPublicServiceSubjectCode,
): PaSemanticConcept {
  const concept = PA_PUBLIC_SERVICE_SUBJECTS[code];
  return {
    code,
    label: concept.label,
    uri: `${PA_PUBLIC_SERVICE_SUBJECT_SCHEME.uri}/${code}`,
    schemeUri: PA_PUBLIC_SERVICE_SUBJECT_SCHEME.uri,
    authority: "Agenzia per l'Italia Digitale",
    source: "schema.gov.it / AgID",
  };
}

function officialFallbackConcept(
  code: OfficialFallbackDataThemeCode,
): PaSemanticConcept {
  const concept = OFFICIAL_FALLBACK_DATA_THEMES[code];
  return {
    ...concept,
    source: "EU Data Theme",
  };
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

export function getProposalOfficialPaSubjects(
  proposal: Pick<PublicProposal, "id" | "theme">,
): readonly PaSemanticConcept[] {
  const profile = getProposalPaSemanticProfile(proposal);
  return [
    ...profile.officialSubjectCodes.map(officialPublicServiceConcept),
    ...(profile.officialFallbackDataThemes ?? []).map(officialFallbackConcept),
  ];
}

export function getAvailablePaSubjects(proposals: readonly PublicProposal[]) {
  const conceptMap = new Map<string, PaSemanticConcept>();
  for (const proposal of proposals) {
    for (const concept of getProposalOfficialPaSubjects(proposal)) {
      conceptMap.set(concept.uri, concept);
    }
  }
  return [...conceptMap.values()].sort((a, b) => {
    const aNumber = Number(a.code);
    const bNumber = Number(b.code);
    if (Number.isFinite(aNumber) && Number.isFinite(bNumber)) return aNumber - bNumber;
    if (Number.isFinite(aNumber)) return -1;
    if (Number.isFinite(bNumber)) return 1;
    return a.label.localeCompare(b.label, "it");
  });
}

export function proposalMatchesPaSubject(
  proposal: Pick<PublicProposal, "id" | "theme">,
  code: ProposalPaSubjectCode,
) {
  return getProposalOfficialPaSubjects(proposal).some(
    (concept) => concept.code === code,
  );
}

export function getMappedProposalThemes() {
  return Object.keys(THEME_TO_PA_PROFILE).sort((a, b) => a.localeCompare(b, "it"));
}
