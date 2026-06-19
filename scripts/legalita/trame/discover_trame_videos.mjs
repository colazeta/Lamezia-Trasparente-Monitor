import path from "node:path";
import {
  accessDate,
  extractYtInitialData,
  fetchText,
  normalizeLabel,
  readCsv,
  trameDataDir,
  walkObjects,
  writeCsv,
  writeText
} from "./trame_utils.mjs";

const OFFICIAL_SITE = "https://www.tramefestival.it/";
const FALLBACK_PLAYLIST_ID = "PLC9oIvsXy4uFd-aXGDR8zMfYsSdBMh7q7";

const headers = [
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

function findFirstObject(value, predicate) {
  let found = null;
  walkObjects(value, (object) => {
    if (!found && predicate(object)) found = object;
  });
  return found;
}

function extractLockups(data) {
  const lockups = [];
  walkObjects(data, (object) => {
    if (object.lockupViewModel) lockups.push(object.lockupViewModel);
  });
  return lockups;
}

function extractVideoId(lockup) {
  const endpoint = findFirstObject(lockup, (object) => object.watchEndpoint?.videoId);
  if (endpoint?.watchEndpoint?.videoId) return endpoint.watchEndpoint.videoId;
  const text = JSON.stringify(lockup);
  return text.match(/vi\/([^/"]{11})\/hqdefault/)?.[1] ?? "";
}

function metadataRows(lockup) {
  return lockup.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows
    ?.map((row) => row.metadataParts?.map((part) => part.text?.content ?? "").filter(Boolean).join(" | "))
    .filter(Boolean) ?? [];
}

function extractPlaylistId(siteHtml) {
  return siteHtml.match(/youtube\.com\/embed\/videoseries\?list=([^&"']+)/)?.[1] ?? FALLBACK_PLAYLIST_ID;
}

function parseScheduledDate(metadata) {
  const match = metadata.match(/(\d{2})\/(\d{2})\/(\d{2,4})/);
  if (!match) return "";
  const year = match[3].length === 2 ? `20${match[3]}` : match[3];
  return `${year}-${match[2]}-${match[1]}`;
}

function parseDateFromTitle(title) {
  const match = title.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return "";
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function stripTramePrefix(title) {
  return title
    .replace(/^Trame\s*15\s*-\s*/i, "")
    .replace(/^Inaugurazione Festival Trame 15$/i, "Inaugurazione Festival")
    .trim();
}

async function loadEventIndex() {
  const file = path.join(trameDataDir, "trame_events.csv");
  try {
    const { records } = await readCsv(file);
    return records.map((event) => ({ ...event, key: normalizeLabel(event.event_title) }));
  } catch {
    return [];
  }
}

function matchEvent(videoTitle, events) {
  const key = normalizeLabel(stripTramePrefix(videoTitle));
  if (!key || /^day \d/.test(key) || key.startsWith("trame podcast")) return null;
  return events.find((event) => event.key === key) ?? events.find((event) => key.includes(event.key) || event.key.includes(key)) ?? null;
}

const siteHtml = await fetchText(OFFICIAL_SITE);
const playlistId = extractPlaylistId(siteHtml);
const playlistUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
const playlistHtml = await fetchText(playlistUrl);
const ytData = extractYtInitialData(playlistHtml);
const events = await loadEventIndex();
const seen = new Set();
const rows = [];
const snapshotVideos = [];

for (const lockup of extractLockups(ytData)) {
  const videoId = extractVideoId(lockup);
  const title = lockup.metadata?.lockupMetadataViewModel?.title?.content ?? "";
  if (!videoId || !title || seen.has(videoId)) continue;
  seen.add(videoId);

  const metadata = metadataRows(lockup).join(" || ");
  const event = matchEvent(title, events);
  const eventDate = event?.date || parseScheduledDate(metadata) || parseDateFromTitle(title);
  const notes = [
    metadata,
    event?.event_id ? `matched_event=${event.event_id}` : "matched_event=none",
    /Programmato/i.test(metadata) ? "possible_scheduled_placeholder" : ""
  ].filter(Boolean).join("; ");

  rows.push({
    video_id: videoId,
    title,
    youtube_url: `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}`,
    edition_year: "2026",
    event_date: eventDate,
    duration: "",
    description: "",
    playlist: `Trame 15 (${playlistId})`,
    speakers_raw: event?.speakers ?? "",
    moderator_raw: event?.moderator ?? "",
    topics_raw: event?.main_topics ?? stripTramePrefix(title),
    source_status: "official",
    transcript_status: "not_started",
    analysis_status: "not_started",
    last_checked: accessDate,
    known_limits: "Metadata da playlist YouTube; durata, transcript, descrizione e timestamp non verificati.",
    notes
  });

  snapshotVideos.push({ video_id: videoId, title, metadata, matched_event_id: event?.event_id ?? "" });
}

await writeCsv(path.join(trameDataDir, "trame_videos.csv"), headers, rows);
await writeText(
  path.join(trameDataDir, "sources", "trame15_youtube_playlist_snapshot.json"),
  `${JSON.stringify({ last_checked: accessDate, source_status: "official", playlist_id: playlistId, playlist_url: playlistUrl, videos_count: rows.length, videos: snapshotVideos }, null, 2)}\n`
);

console.log(`Playlist Trame.15 censita: ${rows.length} video da ${playlistUrl}.`);
