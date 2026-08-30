export type SpatialPosition = [number, number] | [number, number, number];

export type SpatialGeometry =
  | { type: "Point"; coordinates: SpatialPosition }
  | { type: "MultiPoint"; coordinates: SpatialPosition[] }
  | { type: "LineString"; coordinates: SpatialPosition[] }
  | { type: "MultiLineString"; coordinates: SpatialPosition[][] }
  | { type: "Polygon"; coordinates: SpatialPosition[][] }
  | { type: "MultiPolygon"; coordinates: SpatialPosition[][][] };

/**
 * Descrive che cosa rappresenta realmente una geometria.
 *
 * Questo campo non va dedotto dal solo fatto che esistano coordinate. Una sede
 * d'impresa, per esempio, non è automaticamente il luogo di esecuzione di un
 * contratto.
 */
export type SpatialGeometryRole =
  | "asset_location"
  | "facility_location"
  | "intervention_site"
  | "intervention_area"
  | "route"
  | "census_area"
  | "administrative_boundary"
  | "parcel"
  | "supplier_registered_office"
  | "contracting_authority_office"
  | "beneficiary_address"
  | "approximate_area"
  | "other";

export type SpatialPrecision =
  | "surveyed"
  | "parcel"
  | "building"
  | "address"
  | "street"
  | "census_section"
  | "neighbourhood"
  | "municipality"
  | "area"
  | "unknown";

export type SpatialMethod =
  | "source_geometry"
  | "source_coordinates"
  | "official_address_geocoded"
  | "other_address_geocoded"
  | "manual_verified"
  | "linked_entity"
  | "inferred_approximation"
  | "unknown";

export type SpatialConfidence = "high" | "medium" | "low" | "unknown";

export type SpatialVerificationStatus =
  | "verified"
  | "source_confirmed"
  | "machine_geocoded"
  | "needs_review"
  | "unverified";

export type SpatialSourceReference = {
  sourceId?: string | null;
  sourceLabel: string;
  sourceUrl?: string | null;
  sourceDataset?: string | null;
  sourceRecordId?: string | null;
  licence?: string | null;
  extractedAt?: string | null;
  observedAt?: string | null;
  validFrom?: string | null;
  validTo?: string | null;
};

export type DirectTerritorialReference = {
  kind: "direct";
  geometryId: string;
  geometry: SpatialGeometry;
  geometryRole: SpatialGeometryRole;
  precision: SpatialPrecision;
  method: SpatialMethod;
  confidence: SpatialConfidence;
  verificationStatus: SpatialVerificationStatus;
  source: SpatialSourceReference;
  isInferred: boolean;
  publicNote?: string | null;
};

/**
 * Un'entità documentale può essere territorialmente collegata senza possedere
 * una geometria autonoma. È il caso, ad esempio, di una determina riferita a
 * un'opera o a un edificio.
 */
export type LinkedTerritorialReference = {
  kind: "linked";
  viaEntityId: string;
  relation:
    | "about_entity"
    | "funds_entity"
    | "contracts_entity"
    | "implements_entity"
    | "authorises_entity"
    | "monitors_entity"
    | "other";
  note?: string | null;
};

export type TerritorialReference =
  | DirectTerritorialReference
  | LinkedTerritorialReference;

export type SpatialEntity = {
  entityId: string;
  entityType: string;
  title: string;
  publicUrl?: string | null;
  territorialReferences: TerritorialReference[];
};

export type SpatialFeatureProperties = {
  entity_id: string;
  entity_type: string;
  title: string;
  public_url?: string | null;
  geometry_id: string;
  geometry_role: SpatialGeometryRole;
  spatial_precision: SpatialPrecision;
  spatial_method: SpatialMethod;
  spatial_confidence: SpatialConfidence;
  verification_status: SpatialVerificationStatus;
  is_inferred: boolean;
  source_id?: string | null;
  source_label: string;
  source_url?: string | null;
  source_dataset?: string | null;
  source_record_id?: string | null;
  observed_at?: string | null;
  valid_from?: string | null;
  valid_to?: string | null;
  public_note?: string | null;
  [key: string]: unknown;
};

export type SpatialFeature = {
  type: "Feature";
  id?: string | number;
  geometry: SpatialGeometry;
  properties: SpatialFeatureProperties;
};

export type SpatialFeatureCollection = {
  type: "FeatureCollection";
  features: SpatialFeature[];
  metadata?: Record<string, unknown>;
};

export function isDirectTerritorialReference(
  reference: TerritorialReference,
): reference is DirectTerritorialReference {
  return reference.kind === "direct";
}

export function directReferenceToFeature(
  entity: Omit<SpatialEntity, "territorialReferences">,
  reference: DirectTerritorialReference,
  extraProperties: Record<string, unknown> = {},
): SpatialFeature {
  return {
    type: "Feature",
    id: reference.geometryId,
    geometry: reference.geometry,
    properties: {
      // Campi di dominio aggiuntivi sono ammessi, ma non possono sovrascrivere
      // i metadati canonici di provenienza e significato territoriale.
      ...extraProperties,
      entity_id: entity.entityId,
      entity_type: entity.entityType,
      title: entity.title,
      public_url: entity.publicUrl,
      geometry_id: reference.geometryId,
      geometry_role: reference.geometryRole,
      spatial_precision: reference.precision,
      spatial_method: reference.method,
      spatial_confidence: reference.confidence,
      verification_status: reference.verificationStatus,
      is_inferred: reference.isInferred,
      source_id: reference.source.sourceId,
      source_label: reference.source.sourceLabel,
      source_url: reference.source.sourceUrl,
      source_dataset: reference.source.sourceDataset,
      source_record_id: reference.source.sourceRecordId,
      observed_at: reference.source.observedAt,
      valid_from: reference.source.validFrom,
      valid_to: reference.source.validTo,
      public_note: reference.publicNote,
    },
  };
}
