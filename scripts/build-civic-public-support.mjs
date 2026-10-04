#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
  checkCivicPublicSnapshot,
  digest,
} from "./check-civic-public-snapshot.mjs";

const root = new URL("../", import.meta.url);
const snapshot = await checkCivicPublicSnapshot(
  JSON.parse(
    await readFile(
      new URL("data/public/canonical/civic-snapshot.json", root),
      "utf8",
    ),
  ),
);
const diff = JSON.parse(
  await readFile(new URL("data/public/albo/diff-latest.json", root), "utf8"),
);
const manifest = JSON.parse(
  await readFile(
    new URL("data/public/albo/documents-manifest.json", root),
    "utf8",
  ),
);
const rows = new Map(snapshot.albo.items.map((row) => [row.id, row]));
const documents = [];
const documentFields =
  "id publication_number source source_url retrieved_at public_visibility privacy_risk verification_status document_url preservation_status reason storage_path sha256 size_bytes content_type verified_at".split(
    " ",
  );
for (const doc of manifest.documents) {
  const row = rows.get(doc.id);
  if (
    !row ||
    row.public_visibility !== "publishable" ||
    row.privacy_risk !== "low" ||
    row.document_url !== doc.document_url ||
    doc.preservation_status !== "archived"
  )
    continue;
  if (
    !/^data\/public\/albo\/documents\/[0-9]{4}\/[a-f0-9]{64}\.pdf$/.test(
      doc.storage_path,
    ) ||
    !doc.storage_path.endsWith(`/${doc.sha256}.pdf`)
  )
    throw new Error("PUBLIC_DOCUMENT_PATH_INVALID");
  const bytes = await readFile(new URL(doc.storage_path, root));
  if (
    (await digest(bytes)) !== doc.sha256 ||
    bytes.length !== doc.size_bytes ||
    bytes.subarray(0, 5).toString() !== "%PDF-"
  )
    throw new Error("PUBLIC_DOCUMENT_BYTES_INVALID");
  documents.push(
    Object.fromEntries(
      documentFields
        .filter((key) => Object.hasOwn(doc, key))
        .map((key) => [key, doc[key]]),
    ),
  );
}
const allowed = new Set(snapshot.albo.items.map((row) => row.id));
const sameAcquisition = diff.retrieved_at === snapshot.albo.retrieved_at;
// Operational delta references carry only authorised public IDs. All displayed
// titles are selected from the canonical edition. Preservation metadata is
// independently checked against the authorised canonical URL and exact PDF bytes.
const output = {
  schema_version: "canonical-albo-public-support.v1",
  body_hash: snapshot.body_hash,
  diff: {
    source: snapshot.albo.source,
    source_url: snapshot.albo.source_url,
    retrieved_at: snapshot.albo.retrieved_at,
    verification_status: snapshot.albo.verification_status,
    known_limits: snapshot.albo.known_limits,
    counts: snapshot.albo.counts,
    diff: {
      new: sameAcquisition
        ? (diff.diff?.new ?? [])
            .filter((r) => allowed.has(r.id))
            .map((r) => ({ id: r.id }))
        : [],
      changed: sameAcquisition
        ? (diff.diff?.changed ?? [])
            .filter((r) => allowed.has(r.after?.id))
            .map((r) => ({ after: { id: r.after.id } }))
        : [],
      removed: [],
    },
  },
  documentsManifest: {
    generated_at: manifest.generated_at,
    retrieved_at: manifest.retrieved_at,
    verification_status: manifest.verification_status,
    policy: {
      eligibility: manifest.policy.eligibility,
      max_size_bytes: manifest.policy.max_size_bytes,
      no_ocr: true,
      no_pdf_parsing: true,
      no_summaries: true,
      no_rankings: true,
    },
    counts: {
      considered: manifest.counts.considered,
      eligible: documents.length,
      archived: documents.length,
      skipped: manifest.counts.skipped,
      excluded:
        manifest.counts.excluded + manifest.counts.archived - documents.length,
      human_review_required: manifest.counts.human_review_required,
    },
    warnings: manifest.warnings ?? [],
    documents,
  },
};
await writeFile(
  fileURLToPath(
    new URL(
      "artifacts/lamezia-trasparente/src/data/generated/canonicalAlboSupport.json",
      root,
    ),
  ),
  JSON.stringify(output, null, 2) + "\n",
);
