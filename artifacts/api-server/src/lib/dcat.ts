import type {
  opendataDatasetsTable,
  opendataResourcesTable,
} from "@workspace/db";
import { OPENDATA_LABEL, OPENDATA_PORTAL_URL } from "./opendata";

type DatasetRow = typeof opendataDatasetsTable.$inferSelect;
type ResourceRow = typeof opendataResourcesTable.$inferSelect;

// ---------------------------------------------------------------------------
// Publisher / catalog constants
// ---------------------------------------------------------------------------

// Codice IPA del Comune di Lamezia Terme (Indice dei domicili digitali della PA).
export const PUBLISHER_IPA = "c_m208";
export const PUBLISHER_NAME = "Comune di Lamezia Terme";
export const DCAT_AP_IT_PROFILE = "http://dati.gov.it/onto/dcatapit";

const EU = "http://publications.europa.eu/resource/authority";
const DATASET_TYPE = ["dcatapit:Dataset", "dcat:Dataset"];
const DISTRIBUTION_TYPE = ["dcatapit:Distribution", "dcat:Distribution"];

// EU data-theme authority codes (DCAT-AP_IT `dcat:theme`).
const EU_THEMES = new Set([
  "AGRI",
  "ECON",
  "EDUC",
  "ENER",
  "ENVI",
  "GOVE",
  "HEAL",
  "INTR",
  "JUST",
  "REGI",
  "SOCI",
  "TECH",
  "TRAN",
  "OP_DATPRO",
]);

// Map common periodicity values (CKAN/Italian) to the EU frequency authority.
const FREQUENCY_MAP: Record<string, string> = {
  ANNUAL: "ANNUAL",
  YEARLY: "ANNUAL",
  ANNUALE: "ANNUAL",
  BIENNIAL: "BIENNIAL",
  BIENNALE: "BIENNIAL",
  SEMIANNUAL: "ANNUAL_2",
  SEMESTRALE: "ANNUAL_2",
  QUARTERLY: "QUARTERLY",
  TRIMESTRALE: "QUARTERLY",
  MONTHLY: "MONTHLY",
  MENSILE: "MONTHLY",
  WEEKLY: "WEEKLY",
  SETTIMANALE: "WEEKLY",
  DAILY: "DAILY",
  GIORNALIERA: "DAILY",
  GIORNALIERO: "DAILY",
  CONTINUOUS: "CONT",
  CONTINUO: "CONT",
  IRREGULAR: "IRREG",
  IRREGOLARE: "IRREG",
  AS_NEEDED: "IRREG",
  UNKNOWN: "UNKNOWN",
};

// Map common resource formats to the EU file-type authority.
const FILE_TYPE_MAP: Record<string, string> = {
  CSV: "CSV",
  TSV: "TSV",
  JSON: "JSON",
  GEOJSON: "GEOJSON",
  XML: "XML",
  RDF: "RDF_XML",
  PDF: "PDF",
  XLS: "XLS",
  XLSX: "XLSX",
  ODS: "ODS",
  ZIP: "ZIP",
  HTML: "HTML",
  TXT: "TXT",
  KML: "KML",
  SHP: "SHP",
  WMS: "WMS",
};

export type DcatApItIssueCode =
  | "missing_identifier"
  | "missing_title"
  | "missing_description"
  | "missing_modified"
  | "missing_or_invalid_theme"
  | "missing_or_invalid_frequency"
  | "missing_distribution"
  | "missing_or_invalid_distribution_format"
  | "missing_or_invalid_distribution_license"
  | "missing_or_invalid_access_url";

export type DcatApItValidationIssue = {
  code: DcatApItIssueCode;
  field: string;
  resourceId?: number;
  message: string;
};

export type DcatApItValidation = {
  profile: string;
  conforms: boolean;
  issues: DcatApItValidationIssue[];
};

function nonEmpty(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function httpUrl(value: string | null | undefined): boolean {
  if (!nonEmpty(value)) return false;
  try {
    const url = new URL(value!);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function langValue(value: string) {
  return { "@language": "it", "@value": value };
}

function dateValue(d: Date | null) {
  if (!d) return undefined;
  return { "@type": "xsd:date", "@value": d.toISOString().slice(0, 10) };
}

function themeNode(theme: string | null) {
  if (!theme) return undefined;
  const code = theme.trim().toUpperCase();
  if (!EU_THEMES.has(code)) return undefined;
  return { "@id": `${EU}/data-theme/${code}` };
}

function frequencyNode(frequency: string | null) {
  if (!frequency) return undefined;
  const code = FREQUENCY_MAP[frequency.trim().toUpperCase()];
  if (!code) return undefined;
  return { "@id": `${EU}/frequency/${code}` };
}

function formatNode(format: string | null) {
  if (!format) return undefined;
  const code = FILE_TYPE_MAP[format.trim().toUpperCase()];
  if (code) return { "@id": `${EU}/file-type/${code}` };
  // Keep the source format visible in best-effort DCAT output, but this fallback
  // does not satisfy the DCAT-AP_IT controlled-vocabulary conformance gate.
  return { "rdfs:label": format.toUpperCase() };
}

function publisherNode() {
  return {
    "@id": `https://dati.gov.it/view-dataset/agent/${PUBLISHER_IPA}`,
    "@type": ["dcatapit:Agent", "foaf:Agent"],
    "dct:identifier": PUBLISHER_IPA,
    "foaf:name": langValue(PUBLISHER_NAME),
  };
}

function licenseNode(d: DatasetRow) {
  if (!d.licenseId && !d.licenseTitle) return undefined;
  const node: Record<string, unknown> = {
    "@type": ["dcatapit:LicenseDocument", "dct:LicenseDocument"],
  };
  if (d.licenseId && /^https?:\/\//.test(d.licenseId)) {
    node["@id"] = d.licenseId;
  }
  if (d.licenseTitle) node["foaf:name"] = langValue(d.licenseTitle);
  else if (d.licenseId) node["foaf:name"] = langValue(d.licenseId);
  return node;
}

function distributionNode(r: ResourceRow, license: unknown) {
  const node: Record<string, unknown> = {
    "@type": DISTRIBUTION_TYPE,
    "@id": r.url,
    "dct:title": langValue(r.name || `Risorsa ${r.id}`),
    "dcat:accessURL": { "@id": r.url },
    "dcat:downloadURL": { "@id": r.url },
  };
  if (r.description) node["dct:description"] = langValue(r.description);
  const fmt = formatNode(r.format);
  if (fmt) node["dct:format"] = fmt;
  const modified = dateValue(r.lastModified);
  if (modified) node["dct:modified"] = modified;
  if (license) node["dct:license"] = license;
  return node;
}

/**
 * Validate the mandatory DCAT-AP_IT metadata that can be established from the
 * local Open Data projection without inventing missing source facts.
 *
 * This is intentionally stricter than the serializer: the serializer remains
 * best-effort so public metadata is still inspectable, while `conforms` is true
 * only when the source-backed mandatory fields are present and use the required
 * controlled-vocabulary/URI forms.
 */
export function validateDcatApItDataset(
  d: DatasetRow,
  resources: ResourceRow[],
): DcatApItValidation {
  const issues: DcatApItValidationIssue[] = [];

  if (!nonEmpty(d.sourceId)) {
    issues.push({
      code: "missing_identifier",
      field: "dct:identifier",
      message: "Identificativo dataset mancante.",
    });
  }
  if (!nonEmpty(d.title)) {
    issues.push({
      code: "missing_title",
      field: "dct:title",
      message: "Titolo dataset mancante.",
    });
  }
  if (!nonEmpty(d.description)) {
    issues.push({
      code: "missing_description",
      field: "dct:description",
      message: "Descrizione dataset mancante: il titolo non viene accettato come sostituto ai fini della conformità.",
    });
  }
  if (!d.metadataModified) {
    issues.push({
      code: "missing_modified",
      field: "dct:modified",
      message: "Data ultima modifica del dataset mancante.",
    });
  }
  if (!themeNode(d.theme)) {
    issues.push({
      code: "missing_or_invalid_theme",
      field: "dcat:theme",
      message: "Tema mancante o non riconducibile al vocabolario europeo data-theme.",
    });
  }
  if (!frequencyNode(d.frequency)) {
    issues.push({
      code: "missing_or_invalid_frequency",
      field: "dct:accrualPeriodicity",
      message: "Frequenza mancante o non riconducibile al vocabolario europeo frequency.",
    });
  }
  if (resources.length === 0) {
    issues.push({
      code: "missing_distribution",
      field: "dcat:distribution",
      message: "Nessuna distribuzione disponibile per il dataset aperto.",
    });
  }

  const hasValidLicense = httpUrl(d.licenseId);
  for (const resource of resources) {
    const format = resource.format?.trim().toUpperCase() ?? "";
    if (!FILE_TYPE_MAP[format]) {
      issues.push({
        code: "missing_or_invalid_distribution_format",
        field: "dct:format",
        resourceId: resource.id,
        message: "Formato distribuzione mancante o non mappato al vocabolario europeo file-type.",
      });
    }
    if (!hasValidLicense) {
      issues.push({
        code: "missing_or_invalid_distribution_license",
        field: "dct:license",
        resourceId: resource.id,
        message: "Licenza della distribuzione mancante o priva di URI HTTP(S) verificabile.",
      });
    }
    if (!httpUrl(resource.url)) {
      issues.push({
        code: "missing_or_invalid_access_url",
        field: "dcat:accessURL",
        resourceId: resource.id,
        message: "URL di accesso della distribuzione mancante o non HTTP(S).",
      });
    }
  }

  return {
    profile: DCAT_AP_IT_PROFILE,
    conforms: issues.length === 0,
    issues,
  };
}

/**
 * Build a single DCAT / DCAT-AP_IT candidate dataset node (without the
 * surrounding catalog). `origin` is the public origin used to build the stable
 * landing-page URL. A `dct:conformsTo` assertion is emitted only when the
 * mandatory source-backed DCAT-AP_IT gate passes.
 */
export function buildDcatDataset(
  d: DatasetRow,
  resources: ResourceRow[],
  origin: string,
): Record<string, unknown> {
  const license = licenseNode(d);
  const validation = validateDcatApItDataset(d, resources);
  const node: Record<string, unknown> = {
    "@id": `${origin}/api/opendata/datasets/${d.id}/dcat.jsonld#dataset`,
    "@type": DATASET_TYPE,
    "dct:identifier": d.sourceId,
    "dct:title": langValue(d.title),
    "dct:description": langValue(d.description || d.title),
    "dct:publisher": publisherNode(),
    "dct:rightsHolder": publisherNode(),
    "dcat:landingPage": { "@id": `${origin}/opendata/${d.id}` },
  };

  if (validation.conforms) {
    node["dct:conformsTo"] = { "@id": DCAT_AP_IT_PROFILE };
  }

  const modified = dateValue(d.metadataModified);
  if (modified) node["dct:modified"] = modified;

  const theme = themeNode(d.theme);
  if (theme) node["dcat:theme"] = theme;

  const frequency = frequencyNode(d.frequency);
  if (frequency) node["dct:accrualPeriodicity"] = frequency;

  if (d.tags && d.tags.length > 0) {
    node["dcat:keyword"] = d.tags;
  }

  if (d.portalUrl) {
    node["foaf:page"] = { "@id": d.portalUrl };
  }

  const dists = resources
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((r) => distributionNode(r, license));
  if (dists.length > 0) node["dcat:distribution"] = dists;

  return node;
}

const DCAT_CONTEXT = {
  dcat: "http://www.w3.org/ns/dcat#",
  dct: "http://purl.org/dc/terms/",
  foaf: "http://xmlns.com/foaf/0.1/",
  skos: "http://www.w3.org/2004/02/skos/core#",
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
  dcatapit: "http://dati.gov.it/onto/dcatapit#",
  xsd: "http://www.w3.org/2001/XMLSchema#",
};

/**
 * Build a full DCAT catalog. The historical dcatapit classes remain in the
 * representation for compatibility, but catalog-level `dct:conformsTo` is
 * asserted only when every included dataset passes the explicit mandatory gate.
 */
export function buildDcatCatalog(
  datasets: { dataset: DatasetRow; resources: ResourceRow[] }[],
  origin: string,
  modified: Date,
): Record<string, unknown> {
  const allConform = datasets.every(({ dataset, resources }) =>
    validateDcatApItDataset(dataset, resources).conforms,
  );

  const catalog: Record<string, unknown> = {
    "@context": DCAT_CONTEXT,
    "@id": `${origin}/api/opendata/catalog.jsonld`,
    "@type": ["dcatapit:Catalog", "dcat:Catalog"],
    "dct:title": langValue(OPENDATA_LABEL),
    "dct:description": langValue(
      `Catalogo dei dati aperti del ${PUBLISHER_NAME}, esposto in JSON-LD ` +
        "DCAT con profilo italiano dichiarato soltanto per i record che superano il gate DCAT-AP_IT.",
    ),
    "dct:publisher": publisherNode(),
    "dct:modified": dateValue(modified),
    "dct:language": { "@id": `${EU}/language/ITA` },
    "foaf:homepage": { "@id": OPENDATA_PORTAL_URL },
    "dcat:dataset": datasets.map(({ dataset, resources }) =>
      buildDcatDataset(dataset, resources, origin),
    ),
  };

  if (datasets.length > 0 && allConform) {
    catalog["dct:conformsTo"] = { "@id": DCAT_AP_IT_PROFILE };
  }

  return catalog;
}

// Wrap a single dataset node as a self-contained JSON-LD document.
export function wrapDatasetDocument(
  node: Record<string, unknown>,
): Record<string, unknown> {
  return { "@context": DCAT_CONTEXT, ...node };
}

// ---------------------------------------------------------------------------
// CKAN-compatible (read-only) serialization
// ---------------------------------------------------------------------------

const CKAN_DOC_URL =
  "https://docs.ckan.org/en/latest/api/index.html#action-api-reference";

export function ckanSuccess(result: unknown, action: string) {
  return {
    help: `${CKAN_DOC_URL} (${action})`,
    success: true,
    result,
  };
}

export function ckanError(message: string, type = "Not Found Error") {
  return {
    help: CKAN_DOC_URL,
    success: false,
    error: { __type: type, message },
  };
}

export function ckanResource(r: ResourceRow) {
  return {
    id: String(r.id),
    package_id: String(r.datasetId),
    name: r.name,
    description: r.description,
    format: r.format,
    url: r.url,
    position: r.position,
    last_modified: r.lastModified ? r.lastModified.toISOString() : null,
    created: r.firstSeenAt ? r.firstSeenAt.toISOString() : null,
  };
}

export function ckanPackage(d: DatasetRow, resources: ResourceRow[]) {
  const sorted = resources.slice().sort((a, b) => a.position - b.position);
  return {
    id: String(d.id),
    identifier: d.sourceId,
    name: d.slug ?? String(d.id),
    title: d.title,
    notes: d.description,
    type: "dataset",
    state: "active",
    metadata_modified: d.metadataModified
      ? d.metadataModified.toISOString()
      : null,
    metadata_created: d.firstSeenAt ? d.firstSeenAt.toISOString() : null,
    license_id: d.licenseId,
    license_title: d.licenseTitle,
    frequency: d.frequency,
    theme: d.theme,
    holder_name: d.holderName,
    holder_identifier: PUBLISHER_IPA,
    url: d.portalUrl,
    organization: {
      name: "comune-di-lamezia-terme",
      title: PUBLISHER_NAME,
    },
    groups: d.category
      ? [{ name: d.category, display_name: d.category, title: d.category }]
      : [],
    tags: (d.tags ?? []).map((t) => ({ name: t, display_name: t })),
    num_tags: (d.tags ?? []).length,
    num_resources: sorted.length,
    resources: sorted.map(ckanResource),
  };
}
