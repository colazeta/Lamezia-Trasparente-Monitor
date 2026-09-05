import {
  CRIME_EVENTS_DISCLAIMER,
  CRIME_EVENTS_PUBLIC_SCHEMA_VERSION,
} from "./publicCrimeEventsCore";

const LTCEDS_SCHEMA_ID =
  "https://lameziatrasparente.it/schema/ltceds/public-event/1.0-draft.1/schema.json";

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

const pageParameters = [
  {
    name: "page",
    in: "query",
    description: "Numero di pagina (1-based).",
    schema: { type: "integer", minimum: 1, default: 1 },
  },
  {
    name: "pageSize",
    in: "query",
    description: "Elementi per pagina (max 100).",
    schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
  },
] as const;

const crimeFilterParameters = [
  {
    name: "from",
    in: "query",
    description: "Include eventi con intervallo documentato sovrapposto alla data iniziale.",
    schema: { type: "string", format: "date" },
  },
  {
    name: "to",
    in: "query",
    description: "Include eventi con intervallo documentato sovrapposto alla data finale.",
    schema: { type: "string", format: "date" },
  },
  {
    name: "iccs",
    in: "query",
    description:
      "Codice ICCS. Il filtro include il codice esatto e i suoi discendenti gerarchici separati da punto.",
    schema: { type: "string" },
  },
  {
    name: "istat",
    in: "query",
    description:
      "Codice Istat esatto presente nel catalogo, nella classificazione sintetica o analitica del payload pubblico.",
    schema: { type: "string" },
  },
  {
    name: "eventForm",
    in: "query",
    description: "Forma temporale/incidentale dell'evento.",
    schema: {
      type: "string",
      enum: ["discrete", "continuous_episode", "course_of_conduct"],
    },
  },
  {
    name: "neighbourhood",
    in: "query",
    description: "Quartiere già presente nel payload pubblico LTCEDS.",
    schema: { type: "string" },
  },
  {
    name: "context",
    in: "query",
    description: "Situational context pubblico associato a una offence instance.",
    schema: { type: "string" },
  },
  {
    name: "mappable",
    in: "query",
    description:
      "true = almeno una localizzazione occurrence ammessa dalla public map policy; false = nessuna.",
    schema: { type: "boolean" },
  },
] as const;

const methodologySchema = {
  type: "object",
  properties: {
    schemaVersion: { type: "string", const: CRIME_EVENTS_PUBLIC_SCHEMA_VERSION },
    disclaimer: { type: "string", const: CRIME_EVENTS_DISCLAIMER },
  },
  required: ["schemaVersion", "disclaimer"],
} as const;

const crimeEventPayloadSchema = {
  type: "object",
  description:
    "Payload pubblico già validato secondo LTCEDS. Questa descrizione OpenAPI è intenzionalmente minima: il contratto machine-readable canonico resta il JSON Schema LTCEDS identificato da x-ltceds-schema-id.",
  required: [
    "event_id",
    "schema_version",
    "record_status",
    "event_form",
    "title",
    "temporal",
    "privacy_tier",
    "offences",
    "sources",
    "updated_at",
  ],
  properties: {
    event_id: { type: "string", format: "uuid" },
    schema_version: { type: "string", const: CRIME_EVENTS_PUBLIC_SCHEMA_VERSION },
    record_status: { type: "string", const: "published" },
    event_form: { type: "string" },
    title: { type: "string" },
    temporal: { type: "object", additionalProperties: true },
    privacy_tier: { type: "string" },
    locations: { type: "array", items: { type: "object", additionalProperties: true } },
    offences: { type: "array", items: { type: "object", additionalProperties: true } },
    sources: { type: "array", items: { type: "object", additionalProperties: true } },
    updated_at: { type: "string", format: "date-time" },
  },
  additionalProperties: true,
  "x-ltceds-schema-id": LTCEDS_SCHEMA_ID,
} as const;

export function withCrimeEventsOpenApi(
  specification: Record<string, unknown>,
): Record<string, unknown> {
  const paths = asRecord(specification.paths);
  const components = asRecord(specification.components);
  const schemas = asRecord(components.schemas);
  const tags = Array.isArray(specification.tags) ? specification.tags : [];

  return {
    ...specification,
    tags: [
      ...tags,
      {
        name: "crime-events",
        description:
          "Registro documentale LTCEDS degli eventi criminali censiti. Non è una misura esaustiva dell'incidenza criminale né un indicatore di rischio territoriale.",
      },
    ],
    paths: {
      ...paths,
      "/crime-events": {
        get: {
          operationId: "listPublicCrimeEvents",
          tags: ["crime-events"],
          summary: "Elenca gli eventi criminali documentati",
          description: CRIME_EVENTS_DISCLAIMER,
          parameters: [...crimeFilterParameters, ...pageParameters],
          responses: {
            "200": {
              description: "Pagina di eventi LTCEDS pubblici",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CrimeEventList" },
                },
              },
            },
          },
        },
      },
      "/crime-events/{eventId}": {
        get: {
          operationId: "getPublicCrimeEvent",
          tags: ["crime-events"],
          summary: "Dettaglio di un evento criminale documentato",
          parameters: [
            {
              name: "eventId",
              in: "path",
              required: true,
              description: "Identificatore canonico UUIDv7 dell'evento.",
              schema: {
                type: "string",
                pattern:
                  "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$",
              },
            },
          ],
          responses: {
            "200": {
              description: "Evento LTCEDS pubblico",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CrimeEventPublicPayload" },
                },
              },
            },
            "404": {
              description: "Evento non disponibile nella proiezione pubblica",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },
      "/crime-events.geojson": {
        get: {
          operationId: "getPublicCrimeEventsGeoJson",
          tags: ["crime-events"],
          summary: "GeoJSON delle sole occurrence pubblicamente mappabili",
          description:
            `${CRIME_EVENTS_DISCLAIMER} La geometria proviene esclusivamente dal payload pubblico LTCEDS già sottoposto a geoprivacy; arresti, perquisizioni, ritrovamenti e luoghi procedurali non diventano marker di default.`,
          parameters: [...crimeFilterParameters],
          responses: {
            "200": {
              description: "FeatureCollection GeoJSON",
              content: {
                "application/geo+json": {
                  schema: { $ref: "#/components/schemas/CrimeEventFeatureCollection" },
                },
                "application/json": {
                  schema: { $ref: "#/components/schemas/CrimeEventFeatureCollection" },
                },
              },
            },
          },
        },
      },
      "/crime-events/coverage": {
        get: {
          operationId: "getPublicCrimeEventsCoverage",
          tags: ["crime-events"],
          summary: "Copertura e limiti metodologici del registro",
          description: CRIME_EVENTS_DISCLAIMER,
          responses: {
            "200": {
              description: "Metadata di copertura del registro documentale",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CrimeEventsCoverage" },
                },
              },
            },
          },
        },
      },
    },
    components: {
      ...components,
      schemas: {
        ...schemas,
        CrimeEventPublicPayload: crimeEventPayloadSchema,
        CrimeEventList: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/CrimeEventPublicPayload" },
            },
            pagination: { $ref: "#/components/schemas/Pagination" },
            methodology: methodologySchema,
          },
          required: ["data", "pagination", "methodology"],
        },
        CrimeEventFeatureCollection: {
          type: "object",
          properties: {
            type: { type: "string", const: "FeatureCollection" },
            features: { type: "array", items: { type: "object", additionalProperties: true } },
            metadata: {
              type: "object",
              properties: {
                schemaVersion: { type: "string" },
                featureCount: { type: "integer", minimum: 0 },
                disclaimer: { type: "string" },
              },
              required: ["schemaVersion", "featureCount", "disclaimer"],
            },
          },
          required: ["type", "features", "metadata"],
        },
        CrimeEventsCoverage: {
          type: "object",
          properties: {
            documentedEventCount: { type: "integer", minimum: 0 },
            mappableEventCount: { type: "integer", minimum: 0 },
            publicMapFeatureCount: { type: "integer", minimum: 0 },
            earliestDocumentedDate: { type: ["string", "null"], format: "date" },
            latestDocumentedDate: { type: ["string", "null"], format: "date" },
            lastUpdatedAt: { type: ["string", "null"], format: "date-time" },
            schemaVersions: { type: "array", items: { type: "string" } },
            methodology: {
              type: "object",
              properties: {
                unit: { type: "string", const: "documented_event" },
                completeness: { type: "string", const: "not_exhaustive" },
                riskInterpretation: { type: "string", const: "prohibited" },
                disclaimer: { type: "string", const: CRIME_EVENTS_DISCLAIMER },
              },
              required: ["unit", "completeness", "riskInterpretation", "disclaimer"],
            },
          },
          required: [
            "documentedEventCount",
            "mappableEventCount",
            "publicMapFeatureCount",
            "earliestDocumentedDate",
            "latestDocumentedDate",
            "lastUpdatedAt",
            "schemaVersions",
            "methodology",
          ],
        },
      },
    },
  };
}
