#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { verifyCivicPublicSnapshot } from "../lib/publication-standardisation/src/canonical-public.ts";

export const civicSourcePaths = {
  "lamezia.albo.current": "data/public/albo/latest.json",
  "lamezia.albo.delibere": "data/public/albo/delibere-archive.json",
  "lamezia.pnrr.municipal":
    "artifacts/lamezia-trasparente/src/data/generated/lameziaPnrrProjects.json",
};
export const digest = async (text) =>
  createHash("sha256").update(text).digest("hex");

export function checkCivicPublicSupport(snapshot, support) {
  const counts = support.documentsManifest.counts;
  if (
    counts.archived !== support.documentsManifest.documents.length ||
    counts.archived +
      counts.skipped +
      counts.excluded +
      counts.human_review_required !==
      counts.considered
  )
    throw new Error("CIVIC_SUPPORT_DOCUMENT_COUNTS_MISMATCH");
  if (
    support.schema_version !== "canonical-albo-public-support.v1" ||
    support.body_hash !== snapshot.body_hash
  )
    throw new Error("CIVIC_SUPPORT_EDITION_MISMATCH");
  const rows = new Map(snapshot.albo.items.map((row) => [row.id, row]));
  for (const row of support.diff.diff.new)
    if (Object.keys(row).join() !== "id" || !rows.has(row.id))
      throw new Error("CIVIC_SUPPORT_UNAUTHORISED_DELTA");
  for (const row of support.diff.diff.changed)
    if (
      Object.keys(row).join() !== "after" ||
      Object.keys(row.after).join() !== "id" ||
      !rows.has(row.after.id)
    )
      throw new Error("CIVIC_SUPPORT_UNAUTHORISED_DELTA");
  if (support.diff.diff.removed.length)
    throw new Error("CIVIC_SUPPORT_REMOVED_DESCRIPTION");
  for (const doc of support.documentsManifest.documents) {
    const row = rows.get(doc.id);
    if (
      !row ||
      row.public_visibility !== "publishable" ||
      row.privacy_risk !== "low" ||
      row.document_url !== doc.document_url ||
      doc.public_visibility !== "publishable" ||
      doc.privacy_risk !== "low" ||
      doc.preservation_status !== "archived" ||
      doc.content_type !== "application/pdf" ||
      !/^data\/public\/albo\/documents\/[0-9]{4}\/[a-f0-9]{64}\.pdf$/.test(
        doc.storage_path,
      ) ||
      !doc.storage_path.endsWith(`/${doc.sha256}.pdf`)
    )
      throw new Error("CIVIC_SUPPORT_UNAUTHORISED_DOCUMENT");
    if (
      Object.keys(doc).some(
        (key) =>
          !"id publication_number source source_url retrieved_at public_visibility privacy_risk verification_status document_url preservation_status reason storage_path sha256 size_bytes content_type verified_at"
            .split(" ")
            .includes(key),
      )
    )
      throw new Error("CIVIC_SUPPORT_UNKNOWN_DOCUMENT_FIELD");
  }
}

export async function checkCivicPublicSnapshot(
  value,
  { requireCurrentSources = false } = {},
) {
  const snapshot = await verifyCivicPublicSnapshot(value, digest);
  const root = fileURLToPath(new URL("../", import.meta.url));
  for (const source of snapshot.sources) {
    if (civicSourcePaths[source.source_key] !== source.repository_path)
      throw new Error("CIVIC_SOURCE_PATH_MISMATCH");
    // A retained edition may precede a new acquisition. Refresh jobs require
    // exact current source bytes before proposing a replacement edition.
    if (
      requireCurrentSources &&
      (await digest(await readFile(resolve(root, source.repository_path)))) !==
        source.byte_hash
    )
      throw new Error("CIVIC_SOURCE_CUTOFF_MISMATCH");
  }
  return snapshot;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file =
    process.argv[2] ??
    fileURLToPath(
      new URL("../data/public/canonical/civic-snapshot.json", import.meta.url),
    );
  const snapshot = await checkCivicPublicSnapshot(
    JSON.parse(await readFile(file, "utf8")),
  );
  const support = JSON.parse(
    await readFile(
      new URL(
        "../artifacts/lamezia-trasparente/src/data/generated/canonicalAlboSupport.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  checkCivicPublicSupport(snapshot, support);
  console.log(
    JSON.stringify({
      body_hash: snapshot.body_hash,
      ...snapshot.reconciliation,
    }),
  );
}
