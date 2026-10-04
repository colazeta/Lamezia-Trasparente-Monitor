import type { Pool } from "pg";
import {
  buildCanonicalAlboPlan,
  type AlboRegistryRecord,
  type ExistingAlboIdentity,
} from "./canonicalAlboPlan";
import {
  buildCanonicalPnrrPlan,
  type PnrrRegistryRecord,
} from "./canonicalPnrrPlan";
import {
  canonicalSnapshotJson,
  snapshotHash,
  type JsonObject,
} from "./sourceSnapshotPersistence";
import { canonicalPublicSnapshotSql } from "./canonicalPublicSnapshotSql";
import { sourceSnapshotManifest } from "./sourceSnapshotManifest";

export const CIVIC_PUBLIC_PROJECTION_VERSION = "canonical-civic-public.v1";
type Row = Record<string, any>;
export type CanonicalPublicBundle = Record<string, Row[]>;
const key = (r: Row, keys: string[]) =>
  canonicalSnapshotJson(keys.map((k) => r[k]));
function proof(
  expected: Row[],
  actual: Row[],
  keys: string[],
  ignore: string[] = [],
) {
  const index = new Map<string, Row>();
  for (const r of actual) {
    const k = key(r, keys);
    if (index.has(k)) throw new Error("PUBLIC_PROJECTION_DUPLICATE");
    index.set(k, r);
  }
  for (const r of expected) {
    const a = index.get(key(r, keys));
    const mismatch = a
      ? Object.keys(r).find(
          (c) =>
            !ignore.includes(c) &&
            (!Object.hasOwn(a, c) ||
              canonicalSnapshotJson(a[c]) !== canonicalSnapshotJson(r[c])),
        )
      : "missing";
    if (mismatch)
      throw new Error(
        `PUBLIC_PROJECTION_CANONICAL_DRIFT:${keys.join(",")}:${mismatch}`,
      );
  }
}

// Recursive, explicit allowlist. Unknown fields are discarded at every depth;
// source payloads and arbitrary metadata are never spread into public output.
type Shape = string | { [key: string]: Shape } | [Shape];
const textList: Shape = ["scalar"];
const tag: Shape = {
  id: "scalar",
  label: "scalar",
  description: "scalar",
  confidence: "scalar",
  basis: "scalar",
};
const standardisation: Shape = {
  schema_version: "scalar",
  profile_id: "scalar",
  profile_version: "scalar",
  input_field: "scalar",
  input_field_preserved: "scalar",
  status: "scalar",
  transformations: textList,
  layout_flags: textList,
  review_reasons: textList,
};
const presentation: Shape = {
  display_title: "scalar",
  summary: "scalar",
  labels: textList,
  search_text: "scalar",
  flags: textList,
  action_id: "scalar",
  action_label: "scalar",
  standardisation,
  area_theme: {
    schema_version: "scalar",
    taxonomy_id: "scalar",
    taxonomy_version: "scalar",
    theme_id: "scalar",
    theme_label: "scalar",
    confidence: "scalar",
    basis: "scalar",
    rule_id: "scalar",
    evidence: [
      { rule_id: "scalar", input_field: "scalar", matched_terms: textList },
    ],
    null_reason: "scalar",
    override: {
      id: "scalar",
      theme_id: "scalar",
      confidence: "scalar",
      rationale: "scalar",
      previous_theme_id: "scalar",
      previous_rule_id: "scalar",
    },
  },
};
const archived: Shape = {
  id: "scalar",
  publication_number: "scalar",
  source: "scalar",
  source_url: "scalar",
  public_visibility: "scalar",
  privacy_risk: "scalar",
  document_url: "scalar",
  preservation_status: "scalar",
  reason: "scalar",
  verified_at: "scalar",
  storage_path: "scalar",
  sha256: "scalar",
  size_bytes: "scalar",
  content_type: "scalar",
  retrieved_at: "scalar",
  verification_status: "scalar",
};
const alboItem: Shape = Object.fromEntries(
  "id public_id source source_url retrieved_at publication_number publication_start publication_end office act_type act_number act_date subject document_url public_note verification_status privacy_risk public_visibility content_hash first_observed_at last_observed_at deliberation_body"
    .split(" ")
    .map((k) => [k, "scalar"]),
);
Object.assign(alboItem, {
  classification: {
    dictionary_version: "scalar",
    sector: tag,
    act_category: tag,
  },
  presentation,
  known_limits: textList,
  privacy_attestation: {
    schema_version: "scalar",
    policy_version: "scalar",
    assessment_basis: "scalar",
    status: "scalar",
  },
  archived_document: archived,
});
const attachment: Shape = Object.fromEntries(
  "title url source_order sequence document_date document_year date_precision date_basis phase classification_basis"
    .split(" ")
    .map((k) => [k, "scalar"]),
);
const openCup: Shape = Object.fromEntries(
  "source_url cup title total_cost_eur public_funding_eur decision_year cup_status description infrastructure beneficiary_tax_code reference_address generated_at unique_infrastructure programming_instrument master_cup linked_cups_count verification_status source_record_hash"
    .split(" ")
    .map((k) => [k, "scalar"]),
);
Object.assign(openCup, {
  location: Object.fromEntries(
    "country macro_area region province municipality"
      .split(" ")
      .map((k) => [k, "scalar"]),
  ),
  holder: Object.fromEntries(
    "name tax_code area category subcategory"
      .split(" ")
      .map((k) => [k, "scalar"]),
  ),
  classification: Object.fromEntries(
    "nature typology intervention_area sector subsector category"
      .split(" ")
      .map((k) => [k, "scalar"]),
  ),
  financial: Object.fromEntries(
    "concession_or_finance_acts sponsorships coverage"
      .split(" ")
      .map((k) => [k, "scalar"]),
  ),
  cipess: Object.fromEntries(
    "resolution_number resolution_year strategic_infrastructure_law"
      .split(" ")
      .map((k) => [k, "scalar"]),
  ),
});
const pnrrItem: Shape = Object.fromEntries(
  "source_id source_url title mission component investment intervention holder attuatore sub_attuatore cup amount_eur status start_date end_date published_at verification_status source_record_hash"
    .split(" ")
    .map((k) => [k, "scalar"]),
);
Object.assign(pnrrItem, {
  attachments: [attachment],
  opencup: openCup,
  opencup_acquisition: {
    status: "scalar",
    acquired_at: "scalar",
    status_observed_at: "scalar",
    fallback_used: "scalar",
  },
  albo_evidence_ids: textList,
});
const pnrrEvidence: Shape = Object.fromEntries(
  "id public_id source source_url publication_number publication_start publication_end office act_type act_number act_date subject pnrr_mission verification_status public_visibility privacy_risk document_url archived_path document_content_type document_size_bytes first_observed_at last_observed_at evidence_status evidence_hash"
    .split(" ")
    .map((k) => [k, "scalar"]),
);
Object.assign(pnrrEvidence, {
  cups: textList,
  mission_codes: textList,
  match_basis: textList,
});
function pick(value: unknown, shape: Shape): any {
  if (value === null) return null;
  if (shape === "scalar") {
    if (!["string", "number", "boolean"].includes(typeof value))
      throw new Error("PUBLIC_PROJECTION_INVALID_FIELD");
    return value;
  }
  if (Array.isArray(shape)) {
    if (!Array.isArray(value))
      throw new Error("PUBLIC_PROJECTION_INVALID_ARRAY");
    return value.map((v) => pick(v, shape[0]));
  }
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("PUBLIC_PROJECTION_INVALID_OBJECT");
  const result: Row = {};
  for (const [k, s] of Object.entries(shape))
    if (Object.hasOwn(value, k)) result[k] = pick((value as Row)[k], s);
  return result;
}
const scalarShape = (keys: string): Shape =>
  Object.fromEntries(keys.split(" ").map((k) => [k, "scalar"]));
const alboMetadata: Shape = {
  ...(scalarShape(
    "generated_at source source_url retrieved_at verification_status",
  ) as Row),
  known_limits: textList,
  counts: scalarShape(
    "acquired new changed removed unchanged publishable minimised metadata_only excluded total giunta consiglio altro archived_documents",
  ),
  classification_dictionary: {
    version: "scalar",
    known_limits: textList,
    sectors: [tag],
    act_categories: [tag],
  },
  coverage: scalarShape(
    "scope scope_note earliest_publication_start latest_publication_start total_items first_observed_at last_observed_at first_act_date last_act_date",
  ),
};
const pnrrMetadata: Shape = {
  schema_version: "scalar",
  metadata: scalarShape(
    "dataset_id source source_url source_type materialized_at source_index_hash opencup_source opencup_source_url opencup_source_type opencup_source_hash albo_snapshot_generated_at update_policy opencup_update_policy reconciliation_rule coverage_note caveat opencup_caveat licence_or_terms_note",
  ),
  attachment_taxonomy: {
    schema_version: "scalar",
    order_policy: "scalar",
    classification_policy: "scalar",
    date_policy: "scalar",
    phases: [scalarShape("id label description")],
  },
  coverage: scalarShape(
    "projects projects_with_cup projects_with_amount projects_with_opencup projects_without_opencup projects_with_opencup_fresh projects_with_opencup_stale projects_pending_opencup projects_with_opencup_total_cost projects_with_opencup_public_funding projects_with_albo_evidence municipal_attachments municipal_attachments_classified municipal_attachments_with_year municipal_attachments_with_day albo_evidence linked_albo_evidence unmatched_albo_evidence",
  ),
};

/** Verify typed values and evidence before selecting any public field. */
export function projectCanonicalPublicSnapshot(bundle: CanonicalPublicBundle) {
  const releases = bundle.releases;
  if (
    releases.length !== 3 ||
    new Set(releases.map((r) => r.source_key)).size !== 3
  )
    throw new Error("PUBLIC_PROJECTION_SOURCE_SET");
  for (const release of releases) {
    const manifest = sourceSnapshotManifest.find(
      (s) => s.key === release.source_key,
    );
    if (
      !manifest ||
      manifest.path !== release.repository_path ||
      snapshotHash(release.content_text) !== release.byte_hash
    )
      throw new Error("PUBLIC_PROJECTION_ARTIFACT_DRIFT");
    const parsed = JSON.parse(release.content_text),
      metadata = { ...parsed };
    const rows = bundle.records.filter((r) => r.release_id === release.id);
    for (const collection of Object.keys(manifest.collections)) {
      const records = rows
        .filter((r) => r.collection_key === collection)
        .sort((a, b) => a.ordinal - b.ordinal);
      if (
        !Array.isArray(parsed[collection]) ||
        records.length !== parsed[collection].length ||
        release.collections[collection] !== records.length
      )
        throw new Error("PUBLIC_PROJECTION_COVERAGE_DRIFT");
      records.forEach((r, i) => {
        if (
          r.ordinal !== i ||
          canonicalSnapshotJson(r.payload) !==
            canonicalSnapshotJson(parsed[collection][i]) ||
          snapshotHash(canonicalSnapshotJson(r.payload)) !== r.record_hash
        )
          throw new Error("PUBLIC_PROJECTION_RECORD_DRIFT");
      });
      delete metadata[collection];
    }
    if (
      canonicalSnapshotJson(metadata) !==
        canonicalSnapshotJson(release.metadata) ||
      rows.length !==
        Object.values(release.collections).reduce(
          (a: number, b: any) => a + b,
          0,
        )
    )
      throw new Error("PUBLIC_PROJECTION_METADATA_DRIFT");
  }
  const alboRecords = bundle.records.filter((r) =>
    r.source_key.startsWith("lamezia.albo."),
  );
  const existing: ExistingAlboIdentity[] = [
    ...bundle.publications.map((r) => ({
      id: r.id,
      kind: "publication" as const,
      key: r.publication_number,
    })),
    ...bundle.acts.map((r) => ({
      id: r.id,
      kind: "act" as const,
      key: canonicalSnapshotJson([
        r.issuer_key,
        r.office,
        r.act_type,
        r.act_number,
        r.act_date,
      ]),
    })),
    ...bundle.documents.map((r) => ({
      id: r.id,
      kind: "document" as const,
      key: r.source_url,
    })),
  ];
  const albo = buildCanonicalAlboPlan(
    alboRecords as AlboRegistryRecord[],
    existing,
  );
  for (const [name, keys] of Object.entries({
    publications: ["id"],
    versions: ["source_record_id"],
    acts: ["id"],
    documents: ["id"],
    actLinks: ["source_record_id"],
    documentLinks: ["source_record_id", "document_id"],
    assertions: ["source_record_id", "source_pointer", "extractor_version"],
    outcomes: ["source_record_id", "candidate_key", "resolver_version"],
    classifications: ["source_record_id", "facet", "method"],
  }))
    proof(albo[name as keyof typeof albo] as Row[], bundle[name], keys, [
      ...(name === "assertions" ||
      name === "outcomes" ||
      name === "classifications"
        ? ["id"]
        : []),
    ]);
  const pnrrRecords = bundle.records.filter(
    (r) => r.source_key === "lamezia.pnrr.municipal",
  );
  const pnrr = buildCanonicalPnrrPlan(
    pnrrRecords as PnrrRegistryRecord[],
    bundle.identifiers.map((r) => ({
      value: r.value,
      project_id: r.project_id,
    })),
  );
  for (const [name, keys] of Object.entries({
    projects: ["id"],
    assertions: ["source_record_id", "source_pointer", "extractor_version"],
    outcomes: ["source_record_id", "candidate_key", "resolver_version"],
    fields: ["project_id", "field"],
    identifiers: ["project_id", "value"],
  }))
    proof(pnrr[name as keyof typeof pnrr] as Row[], bundle[name], keys, [
      ...(name !== "projects" ? ["id"] : []),
      ...(name === "identifiers"
        ? ["source_record_id", "assertion_pointer"]
        : []),
    ]);

  for (const i of bundle.identifiers) {
    if (
      i.scheme !== "CUP" ||
      i.issuer !== "it.dipe" ||
      i.qualification !== "source_reported_format_checked" ||
      i.evidence_source_key !== "lamezia.pnrr.municipal" ||
      i.assertion_pointer !== "/cup" ||
      i.evidence_property !== "project.cup" ||
      String(i.evidence_value).trim().toUpperCase() !== i.value ||
      String(i.evidence_record_cup).trim().toUpperCase() !== i.value
    )
      throw new Error("PUBLIC_PROJECTION_IDENTIFIER_EVIDENCE");
  }
  const ledger = { albo: [] as Row[], pnrr: [] as Row[] };
  const versions = new Map(bundle.versions.map((v) => [v.source_record_id, v]));
  function publicAlbo(source: string) {
    const release = releases.find((r) => r.source_key === source)!;
    const items: Row[] = [];
    for (const r of alboRecords.filter((r) => r.source_key === source)) {
      const v = versions.get(r.id)!;
      if (
        !v.publication_id ||
        v.public_visibility === "do_not_publish" ||
        r.collection_key === "excluded"
      ) {
        // Counts only: even identifiers of excluded source records stay private.
        ledger.albo.push({
          source,
          reason: "canonical_public_safety_withheld",
        });
        continue;
      }
      const item = pick(r.payload, alboItem) as Row;
      item.publication_start = v.publication_start;
      item.publication_end = v.publication_end;
      if (v.public_visibility === "publishable") item.subject = v.title;
      else {
        if (
          item.public_visibility !== "metadata_only" ||
          item.office !== null ||
          item.act_type !== null ||
          item.document_url !== null
        )
          throw new Error("PUBLIC_PROJECTION_METADATA_POLICY");
        delete item.archived_document;
      }
      // Stable source public IDs remain addresses. Canonical UUIDs describe the
      // publication, not the act or document, and are explicit separate fields.
      const baseline = pick(r.payload, alboItem);
      if (v.public_visibility === "metadata_only")
        delete baseline.archived_document;
      if (canonicalSnapshotJson(item) !== canonicalSnapshotJson(baseline))
        throw new Error("PUBLIC_PROJECTION_CONSUMER_DIFFERENCE");
      item.canonical = {
        publication_id: v.publication_id,
        source_record_id: r.id,
        release_id: release.id,
      };
      items.push(item);
    }
    const result = pick(release.metadata, alboMetadata) as Row;
    result.items = items;
    result.source_counts = result.counts;
    result.counts = {
      ...result.counts,
      publishable: items.filter((r) => r.public_visibility === "publishable")
        .length,
      metadata_only: items.filter(
        (r) => r.public_visibility === "metadata_only",
      ).length,
      minimised: 0,
      excluded: ledger.albo.filter((r) => r.source === source).length,
    };
    if (source === "lamezia.albo.delibere")
      Object.assign(result.counts, {
        total: items.length,
        giunta: items.filter((r) => r.deliberation_body === "giunta").length,
        consiglio: items.filter((r) => r.deliberation_body === "consiglio")
          .length,
        altro: items.filter((r) => r.deliberation_body === "altro").length,
        archived_documents: items.filter((r) => r.archived_document).length,
      });
    result.projection_counts = {
      source_records: alboRecords.filter((r) => r.source_key === source).length,
      public_items: items.length,
      withheld: ledger.albo.filter((r) => r.source === source).length,
    };
    return result;
  }
  const current = publicAlbo("lamezia.albo.current"),
    archive = publicAlbo("lamezia.albo.delibere");
  const publicAlboById = new Map(
    [...archive.items, ...current.items]
      .filter((r: Row) => r.public_visibility === "publishable")
      .map((r: Row) => [r.id, r] as const),
  );
  const release = releases.find(
    (r) => r.source_key === "lamezia.pnrr.municipal",
  )!;
  const pnrrPublic = pick(release.metadata, pnrrMetadata) as Row;
  const projectByCup = new Map(pnrr.projects.map((p) => [p.cup, p.id]));
  const typed = new Map(bundle.projects.map((p) => [p.id, p]));
  pnrrPublic.albo_evidence = pnrrRecords
    .filter((r) => r.collection_key === "albo_evidence")
    .flatMap((r) => {
      if (
        r.payload.public_visibility !== "publishable" ||
        r.payload.privacy_risk !== "low" ||
        !publicAlboById.has(r.payload.id)
      ) {
        ledger.pnrr.push({ reason: "canonical_albo_evidence_withheld" });
        return [];
      }
      const authorised = publicAlboById.get(r.payload.id)!;
      if (
        [
          "subject",
          "office",
          "act_type",
          "act_number",
          "act_date",
          "publication_number",
          "publication_start",
          "publication_end",
          "document_url",
        ].some((field) => r.payload[field] !== authorised[field])
      ) {
        ledger.pnrr.push({
          reason: "canonical_albo_evidence_version_withheld",
        });
        return [];
      }
      return [pick(r.payload, pnrrEvidence)];
    });
  const evidenceIds = new Set(pnrrPublic.albo_evidence.map((r: Row) => r.id));
  pnrrPublic.projects = pnrrRecords
    .filter((r) => r.collection_key === "projects")
    .map((r) => {
      const item = pick(r.payload, pnrrItem) as Row;
      const id = projectByCup.get(String(item.cup).trim().toUpperCase());
      if (!id) throw new Error("PUBLIC_PROJECTION_PROJECT_UNRESOLVED");
      const p = typed.get(id)!;
      for (const [out, field] of Object.entries({
        title: "title",
        mission: "mission",
        component: "component",
        investment: "investment",
        intervention: "intervention",
        holder: "programme_holder",
        attuatore: "implementer",
        status: "execution_status",
        start_date: "start_date",
        end_date: "end_date",
        published_at: "published_at",
        source_url: "source_url",
        attachments: "attachments",
      })) {
        if (
          canonicalSnapshotJson(item[out]) !== canonicalSnapshotJson(p[field])
        )
          throw new Error("PUBLIC_PROJECTION_CONSUMER_DIFFERENCE");
        item[out] =
          out === "attachments" ? pick(p[field], [attachment]) : p[field];
      }
      item.amount_eur =
        p.financed_amount === null ? null : Number(p.financed_amount);
      if (item.amount_eur !== r.payload.amount_eur)
        throw new Error("PUBLIC_PROJECTION_AMOUNT_DIFFERENCE");
      item.albo_evidence_ids = item.albo_evidence_ids.filter((id: string) =>
        evidenceIds.has(id),
      );
      item.canonical = {
        project_id: id,
        source_record_id: r.id,
        release_id: release.id,
      };
      return item;
    });
  pnrrPublic.unmatched_albo_evidence_ids = (
    release.metadata.unmatched_albo_evidence_ids ?? []
  ).filter((id: string) => evidenceIds.has(id));
  pnrrPublic.source_coverage = pnrrPublic.coverage;
  pnrrPublic.coverage = {
    ...pnrrPublic.coverage,
    albo_evidence: pnrrPublic.albo_evidence.length,
    linked_albo_evidence: new Set(
      pnrrPublic.projects.flatMap((p: Row) => p.albo_evidence_ids),
    ).size,
    unmatched_albo_evidence: pnrrPublic.unmatched_albo_evidence_ids.length,
    projects_with_albo_evidence: pnrrPublic.projects.filter(
      (p: Row) => p.albo_evidence_ids.length,
    ).length,
  };
  const body = { albo: current, alboArchive: archive, pnrr: pnrrPublic };
  return {
    schema_version: CIVIC_PUBLIC_PROJECTION_VERSION,
    policy_version: "canonical-albo-pnrr-public.2026-10-04.1",
    scope: "registered_municipal_albo_and_pnrr_snapshots",
    sources: releases.map((r) => ({
      source_key: r.source_key,
      release_id: r.id,
      byte_hash: r.byte_hash,
      repository_commit: r.repository_commit,
      repository_path: r.repository_path,
    })),
    reconciliation: {
      status: "verified",
      unexplained_differences: 0,
      albo_records: alboRecords.length,
      pnrr_projects: pnrrPublic.projects.length,
      withheld_albo_records: ledger.albo.length,
      withheld_pnrr_evidence: ledger.pnrr.length,
    },
    body_hash: snapshotHash(canonicalSnapshotJson(body)),
    ...body,
  };
}
export type CanonicalPublicSnapshot = ReturnType<
  typeof projectCanonicalPublicSnapshot
>;

export async function readCanonicalPublicSnapshot(
  pool: Pick<Pool, "connect">,
): Promise<CanonicalPublicSnapshot> {
  const client = await pool.connect();
  let discard = false;
  try {
    await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
    await client.query("SET LOCAL statement_timeout = '15000ms'");
    const { rows } = await client.query<{ bundle: CanonicalPublicBundle }>(
      canonicalPublicSnapshotSql,
    );
    const result = projectCanonicalPublicSnapshot(rows[0].bundle);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      discard = true;
    }
    throw error;
  } finally {
    client.release(discard);
  }
}
