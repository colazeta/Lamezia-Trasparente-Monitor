import fs from "node:fs/promises";
import path from "node:path";
import { parseCsv, readCsv, readText, rootDir, trameDataDir } from "./trame_utils.mjs";

const requiredFiles = [
  "data/legalita/trame/trame_sources.yml",
  "data/legalita/trame/trame_videos.csv",
  "data/legalita/trame/trame_people.csv",
  "data/legalita/trame/trame_events.csv",
  "data/legalita/trame/public_cards/trame_public_cards.csv",
  "data/legalita/trame/qa/trame_editorial_review.csv",
  "docs/legalita/trame-festival.md",
  "docs/legalita/trame-festival-backlog.md",
  "artifacts/lamezia-trasparente/src/content/trameFestival.ts",
  "artifacts/lamezia-trasparente/src/pages/TrameFestival.tsx",
  "artifacts/lamezia-trasparente/src/Router.tsx",
  "artifacts/lamezia-trasparente/src/components/layout/navSections.ts"
];

const requiredVideoHeaders = [
  "video_id",
  "title",
  "youtube_url",
  "edition_year",
  "event_date",
  "duration",
  "description",
  "playlist",
  "speakers_raw",
  "moderator_raw",
  "topics_raw",
  "source_status",
  "transcript_status",
  "analysis_status",
  "last_checked",
  "known_limits",
  "notes"
];

const requiredPublicCardHeaders = [
  "card_id",
  "card_title",
  "content_type",
  "content_summary",
  "speaker_name",
  "speaker_role",
  "event_title",
  "event_date",
  "edition_year",
  "video_url",
  "video_minute",
  "source_label",
  "transcript_status",
  "verification_status",
  "territorial_relevance",
  "relevance_for_lamezia",
  "possible_civic_translation",
  "editorial_note",
  "analytical_depth",
  "non_obviousness",
  "territorial_relevance_score",
  "specificity",
  "civic_transformability",
  "source_verifiability",
  "editorial_priority",
  "publication_status",
  "last_reviewed"
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function exists(relativePath) {
  try {
    await fs.access(path.join(rootDir, relativePath));
    return true;
  } catch {
    return false;
  }
}

for (const file of requiredFiles) {
  assert(await exists(file), `File mancante: ${file}`);
}

const videos = await readCsv(path.join(trameDataDir, "trame_videos.csv"));
assert(videos.records.length > 0, "Il censimento video non contiene righe.");
for (const header of requiredVideoHeaders) {
  assert(videos.headers.includes(header), `Header video mancante: ${header}`);
}

const allowedTranscript = new Set(["not_started", "auto_available", "downloaded", "normalised", "review_required", "human_verified", "blocked"]);
const allowedAnalysis = new Set(["not_started", "candidate_extraction", "editorial_review", "approved_for_publication", "excluded", "needs_human_review"]);
for (const video of videos.records) {
  assert(video.youtube_url.includes("youtube.com/watch?v="), `URL YouTube non valida per ${video.video_id}`);
  assert(allowedTranscript.has(video.transcript_status), `Stato transcript non ammesso per ${video.video_id}`);
  assert(allowedAnalysis.has(video.analysis_status), `Stato analisi non ammesso per ${video.video_id}`);
}

const cardsRaw = await readText(path.join(trameDataDir, "public_cards", "trame_public_cards.csv"));
const cards = parseCsv(cardsRaw);
for (const header of requiredPublicCardHeaders) {
  assert(cards.headers.includes(header), `Header public card mancante: ${header}`);
}

const router = await readText(path.join(rootDir, "artifacts", "lamezia-trasparente", "src", "Router.tsx"));
assert(router.includes('path="/legalita/trame-festival"'), "Route Trame Festival non trovata nel router.");

const navigation = await readText(path.join(rootDir, "artifacts", "lamezia-trasparente", "src", "components", "layout", "navSections.ts"));
assert(navigation.includes("/legalita/trame-festival"), "Voce navigazione Trame Festival non trovata.");

const publicPage = await readText(path.join(rootDir, "artifacts", "lamezia-trasparente", "src", "pages", "TrameFestival.tsx"));
assert(publicPage.includes("Trame - Festival"), "Titolo pagina non trovato.");
assert(publicPage.includes("Nessuna scheda pubblica approvata"), "La pagina deve dichiarare che non ci sono schede approvate.");
assert(!publicPage.includes("# Transcript"), "La pagina pubblica non deve mostrare transcript integrali.");
assert(!publicPage.includes("trame_videos.csv"), "La pagina pubblica non deve esporre il censimento video grezzo.");

console.log("QA Trame superata: struttura, dati, pagina pubblica e safeguard verificati.");
