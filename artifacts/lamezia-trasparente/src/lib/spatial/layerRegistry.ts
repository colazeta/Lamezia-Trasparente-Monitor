import type {
  SpatialGeometry,
  SpatialGeometryRole,
  SpatialVerificationStatus,
} from "./contract";

export type SpatialLayerStatus =
  | "existing"
  | "pilot"
  | "in_development"
  | "planned";

export type SpatialAtlasStatus = "active" | "planned";

export type SpatialLayerGroup =
  | "reference"
  | "population"
  | "legality"
  | "public-investment"
  | "public-assets"
  | "services"
  | "culture"
  | "procurement";

export type SpatialGeometryType = SpatialGeometry["type"];

export type SpatialLayerDefinition = {
  id: string;
  title: string;
  description: string;
  group: SpatialLayerGroup;
  status: SpatialLayerStatus;
  atlasStatus: SpatialAtlasStatus;
  geometryTypes: SpatialGeometryType[];
  allowedGeometryRoles: SpatialGeometryRole[];
  entityTypes: string[];
  sourceLabel: string;
  dataPath?: string | null;
  defaultVisible: boolean;
  minimumVerification?: SpatialVerificationStatus | null;
  publicationRule: string;
  caveats: string[];
};

/**
 * Registro iniziale dei layer territoriali.
 *
 * È intenzionalmente indipendente dal viewer: Leaflet, GeoLibre o altri client
 * devono leggere la stessa definizione logica e gli stessi dati canonici.
 * `atlasStatus` descrive la disponibilità nella superficie Atlante, non il
 * motore cartografico usato per renderizzare il layer.
 */
export const SPATIAL_LAYER_REGISTRY: SpatialLayerDefinition[] = [
  {
    id: "municipal-boundary",
    title: "Confine comunale",
    description: "Perimetro geografico di riferimento del Comune di Lamezia Terme.",
    group: "reference",
    status: "existing",
    atlasStatus: "active",
    geometryTypes: ["Polygon", "MultiPolygon"],
    allowedGeometryRoles: ["administrative_boundary"],
    entityTypes: ["municipality"],
    sourceLabel: "OpenStreetMap / Nominatim",
    dataPath: "/api/gis/comune",
    defaultVisible: true,
    publicationRule:
      "Usare esclusivamente come perimetro amministrativo di riferimento; conservare attribuzione e provenienza e non associare al confine significati non presenti nella fonte.",
    caveats: [
      "Il layer è una geometria di riferimento derivata da OpenStreetMap/Nominatim e non sostituisce eventuali basi cartografiche ufficiali comunali o nazionali più autorevoli che dovessero diventare disponibili.",
    ],
  },
  {
    id: "census-sections",
    title: "Sezioni censuarie",
    description:
      "Geometrie ufficiali ISTAT 2021 con indicatori del Censimento permanente 2023 selezionabili nell'Atlante.",
    group: "population",
    status: "existing",
    atlasStatus: "active",
    geometryTypes: ["Polygon", "MultiPolygon"],
    allowedGeometryRoles: ["census_area"],
    entityTypes: ["census_section"],
    sourceLabel: "ISTAT — Basi territoriali 2021 e dati per sezioni di censimento 2023",
    dataPath:
      "/data/processed/territorio/istat_sezioni_censimento_lamezia.geojson",
    defaultVisible: true,
    publicationRule:
      "Usare le geometrie ISTAT processate e gli indicatori validati dichiarati nei metadati del dataset, mantenendo distinto un valore mancante dallo zero.",
    caveats: [
      "Le geometrie sono riferite al 2021, mentre gli indicatori associati sono riferiti al 2023.",
      "Non tutte le geometrie ufficiali dispongono di un valore per gli indicatori 2023: la copertura deve restare visibile e i valori mancanti non vanno imputati.",
      "Non confondere sezioni censuarie con sezioni catastali, zone OMI, CAP o altre partizioni territoriali.",
    ],
  },
  {
    id: "confiscated-assets",
    title: "Beni confiscati",
    description:
      "Beni confiscati con localizzazione sufficientemente documentata e collegamento alla scheda pubblica.",
    group: "legality",
    status: "pilot",
    atlasStatus: "active",
    geometryTypes: ["Point", "Polygon", "MultiPolygon"],
    allowedGeometryRoles: ["asset_location", "parcel"],
    entityTypes: ["confiscated_asset"],
    sourceLabel: "ANBSC / localizzazioni redazionali qualificate",
    dataPath: "/api/beni-confiscati/geojson",
    defaultVisible: false,
    minimumVerification: "machine_geocoded",
    publicationRule:
      "Fail-closed: pubblicare soltanto coordinate valide con provenienza geografica coerente e geoVerify=false; i record approssimati o ancora da verificare restano esclusi dal layer pubblico.",
    caveats: [
      "Le coordinate già presenti nei record non bastano da sole: devono essere accompagnate da provenienza e stato di verifica coerenti.",
      "Il GeoJSON espone la copertura e i motivi di esclusione, così i beni non mappabili non vengono occultati né geocodificati artificialmente.",
      "Mantenere la mappa Leaflet esistente finché il layer canonico non è validato nell'Atlante.",
    ],
  },
  {
    id: "public-works",
    title: "Opere pubbliche",
    description: "Opere e interventi pubblici con luogo di esecuzione verificabile.",
    group: "public-investment",
    status: "planned",
    atlasStatus: "planned",
    geometryTypes: ["Point", "LineString", "MultiLineString", "Polygon", "MultiPolygon"],
    allowedGeometryRoles: ["intervention_site", "intervention_area", "route"],
    entityTypes: ["public_work", "project"],
    sourceLabel: "BDAP-MOP, Comune di Lamezia Terme e altre fonti pubbliche validate",
    defaultVisible: false,
    publicationRule:
      "Pubblicare soltanto la geometria del luogo o dell'area di intervento, non la sede del soggetto attuatore o dell'affidatario.",
    caveats: [
      "La granularità della localizzazione può variare tra edificio, strada, area e intero comune.",
    ],
  },
  {
    id: "pnrr-projects",
    title: "Progetti PNRR",
    description: "Progetti PNRR territorialmente localizzabili nel Comune di Lamezia Terme.",
    group: "public-investment",
    status: "planned",
    atlasStatus: "planned",
    geometryTypes: ["Point", "LineString", "MultiLineString", "Polygon", "MultiPolygon"],
    allowedGeometryRoles: ["intervention_site", "intervention_area", "route"],
    entityTypes: ["pnrr_project"],
    sourceLabel: "ReGiS / Italia Domani / fonti amministrative collegate",
    defaultVisible: false,
    publicationRule:
      "La mappa deve rappresentare il luogo dell'intervento quando documentato; un'associazione al solo Comune non deve essere trasformata in un punto preciso.",
    caveats: [
      "Per progetti comunali senza localizzazione infra-comunale usare, se utile, un riferimento a livello comunale chiaramente dichiarato.",
    ],
  },
  {
    id: "public-assets",
    title: "Patrimonio pubblico",
    description: "Immobili, aree e strutture pubbliche con geometria verificabile.",
    group: "public-assets",
    status: "planned",
    atlasStatus: "planned",
    geometryTypes: ["Point", "Polygon", "MultiPolygon"],
    allowedGeometryRoles: ["asset_location", "facility_location", "parcel"],
    entityTypes: ["public_asset", "public_facility"],
    sourceLabel: "Comune di Lamezia Terme e altre fonti patrimoniali pubbliche validate",
    defaultVisible: false,
    publicationRule:
      "Associare ogni geometria al bene corretto e conservare la data di osservazione per evitare di presentare come attuale una situazione storica.",
    caveats: [],
  },
  {
    id: "schools-services",
    title: "Scuole e servizi",
    description: "Strutture scolastiche e servizi pubblici territorialmente identificabili.",
    group: "services",
    status: "planned",
    atlasStatus: "planned",
    geometryTypes: ["Point", "Polygon", "MultiPolygon"],
    allowedGeometryRoles: ["facility_location"],
    entityTypes: ["school", "public_service"],
    sourceLabel: "Fonti istituzionali e comunali validate",
    defaultVisible: false,
    publicationRule:
      "Usare la localizzazione della struttura o del servizio, con identificativo stabile e collegamento alla relativa entità.",
    caveats: [],
  },
  {
    id: "cultural-assets",
    title: "Beni culturali",
    description: "Beni e luoghi culturali collegabili alla lettura territoriale della città.",
    group: "culture",
    status: "planned",
    atlasStatus: "planned",
    geometryTypes: ["Point", "Polygon", "MultiPolygon"],
    allowedGeometryRoles: ["asset_location", "facility_location", "parcel"],
    entityTypes: ["cultural_asset"],
    sourceLabel: "Fonti culturali e istituzionali validate",
    defaultVisible: false,
    publicationRule:
      "Conservare separatamente localizzazione, fonte descrittiva e fonte della geometria quando non coincidono.",
    caveats: [],
  },
  {
    id: "localised-contract-interventions",
    title: "Contratti con intervento localizzato",
    description:
      "Contratti collegati a un luogo di esecuzione o a un'opera territorialmente verificabile.",
    group: "procurement",
    status: "planned",
    atlasStatus: "planned",
    geometryTypes: ["Point", "LineString", "MultiLineString", "Polygon", "MultiPolygon"],
    allowedGeometryRoles: ["intervention_site", "intervention_area", "route"],
    entityTypes: ["contract"],
    sourceLabel: "ANAC e documentazione amministrativa collegata",
    defaultVisible: false,
    publicationRule:
      "Non usare supplier_registered_office o contracting_authority_office come sostituti del luogo di esecuzione. Se il contratto eredita la posizione da un'opera, conservare il collegamento all'entità territoriale sorgente.",
    caveats: [
      "Il numero di contratti mappabili sarà inferiore al numero totale di contratti: questa differenza deve essere mostrata come copertura, non colmata con geocodifiche improprie.",
    ],
  },
];

export function getSpatialLayer(layerId: string): SpatialLayerDefinition | null {
  return SPATIAL_LAYER_REGISTRY.find((layer) => layer.id === layerId) ?? null;
}

export function getSpatialLayersByGroup(
  group: SpatialLayerGroup,
): SpatialLayerDefinition[] {
  return SPATIAL_LAYER_REGISTRY.filter((layer) => layer.group === group);
}

export function getActiveAtlasSpatialLayers(): SpatialLayerDefinition[] {
  return SPATIAL_LAYER_REGISTRY.filter(
    (layer) => layer.atlasStatus === "active" && Boolean(layer.dataPath),
  );
}

export function getInitialAtlasLayerIds(requestedLayerIds: string[] = []): string[] {
  const activeLayers = getActiveAtlasSpatialLayers();
  const activeIds = new Set(activeLayers.map((layer) => layer.id));
  const visibleIds = new Set(
    activeLayers.filter((layer) => layer.defaultVisible).map((layer) => layer.id),
  );

  for (const layerId of requestedLayerIds) {
    if (activeIds.has(layerId)) visibleIds.add(layerId);
  }

  return Array.from(visibleIds);
}
