#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { checkCivicPublicSnapshot } from "./check-civic-public-snapshot.mjs";

// Called only after the source-sync checkpoint has matched the current commit.
// The API runs the same read-only canonical proof as the direct DB exporter.
const response = await fetch(
  "https://lamezia-trasparente-api.onrender.com/api/public/v1/civic-snapshot",
  {
    redirect: "error",
    headers: { Accept: "application/json", "Cache-Control": "no-cache" },
    signal: AbortSignal.timeout(60000),
  },
);
if (
  !response.ok ||
  response.headers.get("X-Civic-Projection-Origin") !== "canonical-database"
)
  throw new Error("CANONICAL_DATABASE_EXPORT_UNAVAILABLE");
const chunks = [];
let bytes = 0;
for await (const chunk of response.body) {
  bytes += chunk.byteLength;
  if (bytes > 8 * 1024 * 1024) throw new Error("CIVIC_EXPORT_SIZE_LIMIT");
  chunks.push(chunk);
}
const snapshot = await checkCivicPublicSnapshot(
  JSON.parse(Buffer.concat(chunks).toString("utf8")),
  { requireCurrentSources: true },
);
await writeFile(
  fileURLToPath(
    new URL("../data/public/canonical/civic-snapshot.json", import.meta.url),
  ),
  JSON.stringify(snapshot, null, 2) + "\n",
);
console.log(
  JSON.stringify({ body_hash: snapshot.body_hash, ...snapshot.reconciliation }),
);
