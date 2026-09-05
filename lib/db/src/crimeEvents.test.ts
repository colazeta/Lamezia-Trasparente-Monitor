import assert from "node:assert/strict";
import test from "node:test";

import { getTableColumns } from "drizzle-orm";

import {
  crimeEventClusterMembersTable,
  crimeEventClustersTable,
  crimeEventLocationsTable,
  crimeEventOffencesTable,
  crimeEventSourcesTable,
  crimeEventsTable,
  crimePublicEventsTable,
  crimeSourcesTable,
} from "./schema/crimeEvents";

function columnNames(table: Parameters<typeof getTableColumns>[0]): string[] {
  return Object.keys(getTableColumns(table)).sort();
}

test("LTCEDS canonical persistence exposes the expected normalized entities", () => {
  assert.ok(columnNames(crimeEventsTable).includes("eventId"));
  assert.ok(columnNames(crimeEventOffencesTable).includes("offenceInstanceId"));
  assert.ok(columnNames(crimeEventLocationsTable).includes("locationId"));
  assert.ok(columnNames(crimeSourcesTable).includes("sourceId"));
  assert.ok(columnNames(crimeEventSourcesTable).includes("supportRole"));
  assert.ok(columnNames(crimeEventClustersTable).includes("clusterId"));
  assert.ok(columnNames(crimeEventClusterMembersTable).includes("eventId"));
});

test("internal event locations may retain canonical coordinates", () => {
  const columns = columnNames(crimeEventLocationsTable);
  assert.ok(columns.includes("longitude"));
  assert.ok(columns.includes("latitude"));
  assert.ok(columns.includes("evidencePrecision"));
  assert.ok(columns.includes("resolvedPrecision"));
  assert.ok(columns.includes("publicationRisk"));
  assert.ok(columns.includes("streetScopeKey"));
});

test("public projection table is physically separated from internal coordinates and address fields", () => {
  const columns = columnNames(crimePublicEventsTable);
  assert.deepEqual(columns, [
    "eventId",
    "payload",
    "payloadSha256",
    "publicationGateVersion",
    "publishedAt",
    "schemaVersion",
    "updatedAt",
  ].sort());

  for (const forbidden of [
    "longitude",
    "latitude",
    "address",
    "placeName",
    "neighbourhood",
    "streetScopeKey",
    "basisSourceId",
    "contentSha256",
    "provider",
  ]) {
    assert.equal(columns.includes(forbidden), false, `${forbidden} leaked into public projection columns`);
  }
});

test("person, victim and suspect identity are absent from the first LTCEDS persistence tranche", () => {
  const allColumns = [
    crimeEventsTable,
    crimeEventOffencesTable,
    crimeEventLocationsTable,
    crimeSourcesTable,
    crimeEventSourcesTable,
    crimeEventClustersTable,
    crimeEventClusterMembersTable,
    crimePublicEventsTable,
  ].flatMap((table) => columnNames(table));

  const joined = allColumns.join(" ").toLowerCase();
  for (const token of ["person", "victim", "suspect", "indagato", "imputato", "nome", "surname"]) {
    assert.equal(joined.includes(token), false, `unexpected identity column token: ${token}`);
  }
});
