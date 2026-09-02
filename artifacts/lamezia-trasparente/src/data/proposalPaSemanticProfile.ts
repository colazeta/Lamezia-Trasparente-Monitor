import type { PublicProposal } from "./propostePubblicheCore";

/**
 * Semantic profile for civic proposals.
 *
 * Primary classification reuses the official controlled vocabulary
 * "Materie dei servizi pubblici" published in the national semantic-asset
 * catalogue (schema.gov.it / dati-semantic-assets). LT-specific concepts are
 * allowed only when the national vocabulary does not cover the semantic need.
 */
export const PA_PUBLIC_SERVICE_SUBJECT_SCHEME = {
  label: "Vocabolario Controllato sulle Materie dei Servizi Pubblici",
  uri: "https://w3id.org/italia/controlled-vocabulary/classifications-for-public-services/public-services-subject-matters",
  sourceUrl:
    "https://schema.gov.it/semantic-assets/details/?uri=https%3A%2F%2Fw3id.org%2Fitalia%2Fcontrolled-vocabulary%2Fclassifications-for-public-services%2Fpublic-services-subject-matters",
  ontologyUri: "https://w3id.org/italia/onto/CPSV",
} as const;

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

export type PaPublicServiceSubjectCode = keyof typeof PA_PUBLIC_SERVICE_SUBJECTS;

export type PaSemanticConcept = {
  code: PaPublicServiceSubjectCode;
  label: string;
  uri: string;
  schemeUri: typeof PA_PUBLIC_SERVICE_SUBJECT_SCHEME.uri;
  authority: "schema.gov.it / AgID";
};

export const LT_SEMANTIC_EXTENSIONS = {
  civic_governance_participation: {
    id: "civic_governance_participation",
    label: "Governo aperto, trasparenza e partecipazione civica",
    definition:
      "Estensione locale usata esclusivamente per proposte su accessibilità dell'attività consiliare e strumenti di partecipazione civica che non ricadono in modo corretto nelle 15 materie nazionali dei servizi pubblici.",
    relatedOfficialUris: [
      "http://publications.europa.eu/resource/authority/data-theme/GOVE",
      "https://w3id.org/italia/controlled-vocabulary/classifications-for-transparency/transparency-subject",
    ],
  },
} as const;

export type LtSemanticExtensionId = keyof typeof LT_SEMANTIC_EXTENSIONS;

export type ProposalPaSemanticProfile = {
  officialSubjectCodes: readonly PaPublicServiceSubjectCode[];
  localExtensions?: readonly LtSemanticExtensionId[];
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
    localExtensions: ["civic_governance_participation"],
    mappingNote:
      "Le 15 materie nazionali dei servizi pubblici non contengono una voce corretta per partecipazione civica e pubblicità dell'attività consiliare. L'estensione LT è collegata al Data Theme GOVE e al vocabolario nazionale della trasparenza.",
  },
};

function officialConcept(code: PaPublicServiceSubjectCode): PaSemanticConcept {
  const concept = PA_PUBLIC_SERVICE_SUBJECTS[code];
  return {
    code,
    label: concept.label,
    uri: `${PA_PUBLIC_SERVICE_SUBJECT_SCHEME.uri}/${code}`,
    schemeUri: PA_PUBLIC_SERVICE_SUBJECT_SCHEME.uri,
    authority: "schema.gov.it / AgID",
  };
}

export function getProposalPaSemanticProfile(
  proposal: Pick<PublicProposal, "id" | "theme">,
): ProposalPaSemanticProfile {
  const profile = THEME_TO_PA_PROFILE[proposal.theme];
  if (!profile) {
    throw new Error(
      `Missing schema.gov.it semantic mapping for proposal ${proposal.id} (theme: ${proposal.theme})`,
    );
  }
  return profile;
}

export function getProposalOfficialPaSubjects(
  proposal: Pick<PublicProposal, "id" | "theme">,
): readonly PaSemanticConcept[] {
  return getProposalPaSemanticProfile(proposal).officialSubjectCodes.map(officialConcept);
}

export function getProposalLocalSemanticExtensions(
  proposal: Pick<PublicProposal, "id" | "theme">,
) {
  const ids = getProposalPaSemanticProfile(proposal).localExtensions ?? [];
  return ids.map((id) => LT_SEMANTIC_EXTENSIONS[id]);
}

export function getAvailablePaSubjects(proposals: readonly PublicProposal[]) {
  const codes = new Set<PaPublicServiceSubjectCode>();
  for (const proposal of proposals) {
    for (const code of getProposalPaSemanticProfile(proposal).officialSubjectCodes) {
      codes.add(code);
    }
  }
  return [...codes]
    .map(officialConcept)
    .sort((a, b) => Number(a.code) - Number(b.code));
}

export function proposalMatchesPaSubject(
  proposal: Pick<PublicProposal, "id" | "theme">,
  code: PaPublicServiceSubjectCode,
) {
  return getProposalPaSemanticProfile(proposal).officialSubjectCodes.includes(code);
}

export function getMappedProposalThemes() {
  return Object.keys(THEME_TO_PA_PROFILE).sort((a, b) => a.localeCompare(b, "it"));
}
