export const SEMANTIC_PROFILE_VERSION = "1.1.0";
export const SEMANTIC_PROFILE_URL =
  "https://lamezia-trasparente.pages.dev/semantic/profile.jsonld";
export const SEMANTIC_CONTEXT_URL =
  "https://lamezia-trasparente.pages.dev/semantic/context.jsonld";
export const SEMANTIC_ONTOLOGY_URL =
  "https://lamezia-trasparente.pages.dev/semantic/ontology.ttl";

const LT = "https://lamezia-trasparente.pages.dev/ontology#";

export type SemanticMappingRelation =
  | "subClassOf"
  | "describes"
  | "observationPattern"
  | "reference";

export type SemanticMapping = {
  relation: SemanticMappingRelation;
  term: string;
  vocabulary: string;
  version: string | null;
};

export type SemanticDescriptor = {
  profile: string;
  context: string;
  ontology: string;
  profileVersion: string;
  entityType: string;
  mappings: SemanticMapping[];
};

const PROV_ENTITY: SemanticMapping = {
  relation: "subClassOf",
  term: "http://www.w3.org/ns/prov#Entity",
  vocabulary: "PROV-O",
  version: "2013-04-30",
};

const ADMINISTRATIVE_ACT_MAPPINGS: SemanticMapping[] = [
  {
    relation: "subClassOf",
    term: "http://xmlns.com/foaf/0.1/Document",
    vocabulary: "FOAF",
    version: null,
  },
  PROV_ENTITY,
  {
    relation: "reference",
    term: "https://w3id.org/italia/onto/Transparency/",
    vocabulary: "OntoPiA Transparency",
    version: "0.2-draft",
  },
];

const PROCUREMENT_RECORD_MAPPINGS: SemanticMapping[] = [
  PROV_ENTITY,
  {
    relation: "describes",
    term: "http://data.europa.eu/a4g/ontology#Contract",
    vocabulary: "eProcurement Ontology",
    version: "5.2.0",
  },
  {
    relation: "reference",
    term: "https://w3id.org/italia/onto/PublicContract",
    vocabulary: "OntoPiA Public Contracts (PC-AP_IT)",
    version: null,
  },
];

const CIVIC_THEME_MAPPINGS: SemanticMapping[] = [
  {
    relation: "subClassOf",
    term: "http://www.w3.org/2004/02/skos/core#Concept",
    vocabulary: "SKOS",
    version: "2009-08-18",
  },
];

const PERFORMANCE_MAPPINGS: SemanticMapping[] = [
  {
    relation: "subClassOf",
    term: "http://www.w3.org/2004/02/skos/core#Concept",
    vocabulary: "SKOS",
    version: "2009-08-18",
  },
  {
    relation: "observationPattern",
    term: "http://purl.org/linked-data/cube#Observation",
    vocabulary: "RDF Data Cube",
    version: "2014-01-16",
  },
  {
    relation: "reference",
    term: "https://w3id.org/italia/onto/Indicator",
    vocabulary: "OntoPiA Indicator",
    version: null,
  },
];

const PNRR_PROJECT_MAPPINGS: SemanticMapping[] = [
  {
    relation: "reference",
    term: "https://w3id.org/italia/PublicInvestment/onto/PublicInvestment",
    vocabulary: "Ontologia degli Investimenti Pubblici (DIPE/ISTAT)",
    version: "2026-07-13",
  },
  {
    relation: "subClassOf",
    term: "https://schema.org/Project",
    vocabulary: "Schema.org",
    version: null,
  },
  PROV_ENTITY,
];

export const SEMANTIC_RESOURCE_DESCRIPTORS = {
  documents: {
    entityType: `${LT}AdministrativeAct`,
    mappings: ADMINISTRATIVE_ACT_MAPPINGS,
  },
  document: {
    entityType: `${LT}AdministrativeAct`,
    mappings: ADMINISTRATIVE_ACT_MAPPINGS,
  },
  document_markdown: {
    entityType: `${LT}AdministrativeActTextRepresentation`,
    mappings: [PROV_ENTITY],
  },
  contracts: {
    entityType: `${LT}PublicProcurementRecord`,
    mappings: PROCUREMENT_RECORD_MAPPINGS,
  },
  contract: {
    entityType: `${LT}PublicProcurementRecord`,
    mappings: PROCUREMENT_RECORD_MAPPINGS,
  },
  themes: {
    entityType: `${LT}CivicTheme`,
    mappings: CIVIC_THEME_MAPPINGS,
  },
  theme: {
    entityType: `${LT}CivicTheme`,
    mappings: CIVIC_THEME_MAPPINGS,
  },
  performance: {
    entityType: `${LT}PerformanceIndicator`,
    mappings: PERFORMANCE_MAPPINGS,
  },
  pnrr: {
    entityType: `${LT}PnrrProject`,
    mappings: PNRR_PROJECT_MAPPINGS,
  },
} as const satisfies Record<
  string,
  { entityType: string; mappings: readonly SemanticMapping[] }
>;

export type SemanticResource = keyof typeof SEMANTIC_RESOURCE_DESCRIPTORS;

export function semanticDescriptor(resource: SemanticResource): SemanticDescriptor {
  const descriptor = SEMANTIC_RESOURCE_DESCRIPTORS[resource];
  return {
    profile: SEMANTIC_PROFILE_URL,
    context: SEMANTIC_CONTEXT_URL,
    ontology: SEMANTIC_ONTOLOGY_URL,
    profileVersion: SEMANTIC_PROFILE_VERSION,
    entityType: descriptor.entityType,
    mappings: descriptor.mappings.map((mapping) => ({ ...mapping })),
  };
}
