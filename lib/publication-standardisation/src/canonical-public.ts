export const CIVIC_PUBLIC_SNAPSHOT_PATH =
  "data/public/canonical/civic-snapshot.json";
export const CIVIC_PUBLIC_SNAPSHOT_API = "/api/public/v1/civic-snapshot";
export type CivicPublicSnapshot = {
  schema_version: "canonical-civic-public.v1";
  policy_version: string;
  scope: "registered_municipal_albo_and_pnrr_snapshots";
  body_hash: string;
  sources: Array<{
    source_key: string;
    release_id: string;
    byte_hash: string;
    repository_commit: string;
    repository_path: string;
  }>;
  reconciliation: {
    status: "verified";
    unexplained_differences: 0;
    albo_records: number;
    pnrr_projects: number;
    withheld_albo_records: number;
    withheld_pnrr_evidence: number;
  };
  albo: Record<string, unknown> & { items: Array<Record<string, unknown>> };
  alboArchive: Record<string, unknown> & {
    items: Array<Record<string, unknown>>;
  };
  pnrr: Record<string, unknown> & {
    projects: Array<Record<string, unknown>>;
    albo_evidence: Array<Record<string, unknown>>;
  };
};
export function civicCanonicalJson(value: unknown): string {
  if (value === null || ["string", "number", "boolean"].includes(typeof value))
    return JSON.stringify(value);
  if (Array.isArray(value))
    return `[${value.map(civicCanonicalJson).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.entries(value)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([k, v]) => `${JSON.stringify(k)}:${civicCanonicalJson(v)}`)
      .join(",")}}`;
  throw new Error("Invalid civic snapshot value");
}
export function assertCivicPublicSnapshot(
  value: unknown,
): asserts value is CivicPublicSnapshot {
  const x = value as CivicPublicSnapshot;
  if (
    !x ||
    x.schema_version !== "canonical-civic-public.v1" ||
    x.scope !== "registered_municipal_albo_and_pnrr_snapshots" ||
    !/^[a-f0-9]{64}$/.test(x.body_hash) ||
    x.reconciliation?.status !== "verified" ||
    x.reconciliation.unexplained_differences !== 0 ||
    !Array.isArray(x.sources) ||
    x.sources.length !== 3 ||
    !Array.isArray(x.albo?.items) ||
    !Array.isArray(x.alboArchive?.items) ||
    !Array.isArray(x.pnrr?.projects) ||
    !Array.isArray(x.pnrr?.albo_evidence)
  )
    throw new Error("Invalid canonical civic public snapshot");
  if (
    x.pnrr.projects.length !== x.reconciliation.pnrr_projects ||
    x.sources.some(
      (s) =>
        !/^[a-f0-9]{64}$/.test(s.byte_hash) ||
        !/^[a-f0-9]{40}$/.test(s.repository_commit),
    )
  )
    throw new Error("Invalid civic snapshot provenance");
  const sourceKeys = new Set(x.sources.map((s) => s.source_key));
  if (
    x.policy_version !== "canonical-albo-pnrr-public.2026-10-04.1" ||
    sourceKeys.size !== 3 ||
    ![
      "lamezia.albo.current",
      "lamezia.albo.delibere",
      "lamezia.pnrr.municipal",
    ].every((k) => sourceKeys.has(k))
  )
    throw new Error("Invalid civic snapshot source set");
  if (
    Object.values(x.reconciliation).some(
      (v) => typeof v === "number" && (!Number.isSafeInteger(v) || v < 0),
    ) ||
    x.albo.items.length +
      x.alboArchive.items.length +
      x.reconciliation.withheld_albo_records !==
      x.reconciliation.albo_records
  )
    throw new Error("Invalid civic snapshot counts");
  const releases = new Set(x.sources.map((s) => s.release_id));
  for (const row of [
    ...x.albo.items,
    ...x.alboArchive.items,
    ...x.pnrr.projects,
  ]) {
    const c = row.canonical as Record<string, unknown>;
    if (
      !c ||
      !releases.has(String(c.release_id)) ||
      !/^[a-f0-9]{8}-[a-f0-9]{4}-7[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(
        String(c.publication_id ?? c.project_id),
      )
    )
      throw new Error("Invalid civic snapshot identity");
  }
  for (const row of [...x.albo.items, ...x.alboArchive.items])
    if (
      !["publishable", "metadata_only"].includes(String(row.public_visibility))
    )
      throw new Error("Invalid civic snapshot policy");
  for (const row of [...x.albo.items, ...x.alboArchive.items])
    if (
      row.public_visibility === "metadata_only" &&
      (row.office !== null ||
        row.act_type !== null ||
        row.document_url !== null ||
        row.archived_document !== undefined)
    )
      throw new Error("Invalid civic snapshot minimisation");
  const allowedEvidence = new Set(
    [...x.albo.items, ...x.alboArchive.items]
      .filter((r) => r.public_visibility === "publishable")
      .map((r) => r.id),
  );
  if (
    x.pnrr.albo_evidence.some(
      (r) =>
        !allowedEvidence.has(r.id) ||
        r.public_visibility !== "publishable" ||
        r.privacy_risk !== "low",
    )
  )
    throw new Error("Invalid civic snapshot evidence");
}
export function civicPublicSnapshotBody(x: CivicPublicSnapshot) {
  return { albo: x.albo, alboArchive: x.alboArchive, pnrr: x.pnrr };
}
export async function verifyCivicPublicSnapshot(
  value: unknown,
  digest: (text: string) => Promise<string>,
): Promise<CivicPublicSnapshot> {
  assertCivicPublicSnapshot(value);
  const hash = await digest(civicCanonicalJson(civicPublicSnapshotBody(value)));
  if (hash !== value.body_hash)
    throw new Error("Civic snapshot digest mismatch");
  return value;
}
