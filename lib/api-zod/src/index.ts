export * from "./generated/api";
export * from "./generated/types";
// Orval uses the same name for path validators and query-parameter types when
// an operation has both. Prefer the validator and name the query types explicitly.
export {
  GetMunicipalDemographicSnapshotParams,
  GetDatabaseInspectionRowsParams,
  GetDatabaseInspectionRecordParams,
} from "./generated/api";
export type {
  GetMunicipalDemographicSnapshotParams as MunicipalDemographicSnapshotQueryParams,
  GetDatabaseInspectionRowsParams as DatabaseInspectionRowsQueryParams,
  GetDatabaseInspectionRecordParams as DatabaseInspectionRecordQueryParams,
} from "./generated/types";
export * from "./semanticContract";
