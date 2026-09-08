import type {
  SnapshotPlan,
  SnapshotQueryClient,
  SnapshotStatement,
  JsonObject,
} from "./sourceSnapshotPersistence";

function optionalText(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== "string" || !value.trim())
    throw new Error("PNRR_INVALID_FIELD");
  return value;
}
function requiredText(value: unknown): string {
  const result = optionalText(value);
  if (result === null) throw new Error("PNRR_REQUIRED_FIELD_MISSING");
  return result;
}
function date(value: unknown): string | null {
  if (value === null) return null;
  const input = requiredText(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input))
    throw new Error("PNRR_DATE_PRECISION");
  const parsed = new Date(`${input}T00:00:00.000Z`);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== input
  )
    throw new Error("PNRR_INVALID_DATE");
  return parsed.toISOString();
}
function amount(value: unknown): string | null {
  if (value === null) return null;
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value >= 1e12 ||
    Math.abs(value * 100 - Math.round(value * 100)) > 1e-4
  )
    throw new Error("PNRR_AMOUNT_PRECISION");
  return value.toFixed(2);
}
export function pnrrCompatibilityRows(p: SnapshotPlan): JsonObject[] {
  if (p.source.key !== "lamezia.pnrr.municipal")
    throw new Error("PNRR_SOURCE_REQUIRED");
  const ids = new Set<string>();
  return p.records
    .filter((r) => r.collection_key === "projects")
    .map(({ payload: x }) => {
      const id = requiredText(x.source_id);
      if (ids.has(id)) throw new Error("PNRR_DUPLICATE_SOURCE_KEY");
      ids.add(id);
      const url = requiredText(x.source_url);
      if (new URL(url).origin !== "https://www.comune.lamezia-terme.cz.it")
        throw new Error("PNRR_SOURCE_ORIGIN");
      if (!Array.isArray(x.attachments))
        throw new Error("PNRR_ATTACHMENTS_REQUIRED");
      for (const attachment of x.attachments) {
        if (!attachment || typeof attachment !== "object")
          throw new Error("PNRR_INVALID_ATTACHMENT");
        requiredText((attachment as JsonObject).title);
        requiredText((attachment as JsonObject).url);
      }
      return {
        source_id: id,
        url,
        title: requiredText(x.title),
        mission: optionalText(x.mission),
        component: optionalText(x.component),
        investment: optionalText(x.investment),
        intervention: optionalText(x.intervention),
        holder: optionalText(x.holder),
        attuatore: optionalText(x.attuatore),
        cup: optionalText(x.cup),
        importo_finanziato: amount(x.amount_eur),
        status: optionalText(x.status),
        start_date: date(x.start_date),
        end_date: date(x.end_date),
        published_at: date(x.published_at),
        attachments: x.attachments,
      };
    });
}
const fields = [
  "source_id",
  "url",
  "title",
  "mission",
  "component",
  "investment",
  "intervention",
  "holder",
  "attuatore",
  "cup",
  "importo_finanziato",
  "status",
  "start_date",
  "end_date",
  "published_at",
  "attachments",
];
const declarations = fields
  .map(
    (f) =>
      `${f} ${f === "attachments" ? "jsonb" : f === "importo_finanziato" ? "numeric(14,2)" : f.endsWith("_date") || f === "published_at" ? "timestamptz" : "text"}`,
  )
  .join(",");
export function pnrrManagedUpdateStatement(
  p: SnapshotPlan,
  previous: JsonObject[],
): SnapshotStatement {
  return {
    text: `WITH expected AS (SELECT * FROM jsonb_to_recordset($1::jsonb) x(${declarations})),
      previous AS (SELECT * FROM jsonb_to_recordset($2::jsonb) x(${declarations}))
      UPDATE public.attuazione_pnrr_projects actual SET ${fields
        .filter((f) => f !== "source_id")
        .map((f) => `${f}=expected.${f}`)
        .join(",")},last_seen_at=now()
      FROM expected,previous WHERE actual.source_id=expected.source_id AND previous.source_id=actual.source_id
      AND ${fields.map((f) => `actual.${f} IS NOT DISTINCT FROM previous.${f}`).join(" AND ")}
      AND (${fields.map((f) => `actual.${f}`).join(",")}) IS DISTINCT FROM (${fields.map((f) => `expected.${f}`).join(",")})`,
    values: [
      JSON.stringify(pnrrCompatibilityRows(p)),
      JSON.stringify(previous),
    ],
  };
}
export function pnrrCompatibilityStatements(p: SnapshotPlan): {
  insert: SnapshotStatement;
  verify: SnapshotStatement;
} {
  const rows = pnrrCompatibilityRows(p),
    values = [JSON.stringify(rows)];
  return {
    insert: {
      text: `WITH inserted AS (INSERT INTO public.attuazione_pnrr_projects(${fields.join(",")}) SELECT ${fields.join(",")} FROM jsonb_to_recordset($1::jsonb) expected(${declarations}) ON CONFLICT(source_id) DO NOTHING RETURNING id) SELECT count(*)::integer AS inserted FROM inserted`,
      values,
    },
    verify: {
      text: `SELECT count(*)::integer AS expected,count(actual.id)::integer AS present,
      COALESCE(bool_and(actual.id IS NOT NULL AND ${fields.map((f) => `actual.${f} IS NOT DISTINCT FROM expected.${f}`).join(" AND ")}),true) AS verified
      FROM jsonb_to_recordset($1::jsonb) expected(${declarations}) LEFT JOIN public.attuazione_pnrr_projects actual USING(source_id)`,
      values,
    },
  };
}
export async function reconcilePnrrSnapshot(
  client: SnapshotQueryClient,
  p: SnapshotPlan,
) {
  // Refresh a compatibility row only when its entire current content matches
  // the preceding successfully registered source version. Unexplained/manual
  // edits continue to fail closed; source records and prior bytes are retained.
  const previousRecords = (
    await client.query(
      `SELECT r.id,r.collection_key,r.ordinal,r.native_key,r.record_hash,r.payload FROM public.source_records r WHERE r.collection_key='projects' AND r.release_id=(
    SELECT rel.id FROM public.source_releases rel
    JOIN public.source_artifacts a ON a.id=rel.artifact_id
    JOIN public.source_endpoints e ON e.id=rel.endpoint_id
    JOIN public.source_sources s ON s.id=e.source_id
    JOIN public.source_acquisition_runs run ON run.release_id=rel.id AND run.status='succeeded'
    WHERE s.source_key=$1 AND a.byte_hash<>$2 ORDER BY run.started_at DESC,run.id DESC LIMIT 1)`,
      [p.source.key, p.byteHash],
    )
  ).rows;
  if (previousRecords.length) {
    const previous = pnrrCompatibilityRows({
      ...p,
      records: previousRecords as SnapshotPlan["records"],
    });
    const update = pnrrManagedUpdateStatement(p, previous);
    await client.query(update.text, update.values);
  }
  const statements = pnrrCompatibilityStatements(p);
  const inserted = Number(
    (await client.query(statements.insert.text, statements.insert.values))
      .rows[0]?.inserted ?? 0,
  );
  const result = (
    await client.query(statements.verify.text, statements.verify.values)
  ).rows[0];
  if (result?.verified !== true || result.present !== result.expected)
    throw new Error("PNRR_EXISTING_VALUE_CONFLICT");
  return { inserted, matched: Number(result.present) };
}
