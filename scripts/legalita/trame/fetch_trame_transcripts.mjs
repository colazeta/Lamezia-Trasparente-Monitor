import path from "node:path";
import { accessDate, fetchText, readCsv, trameDataDir, writeCsv } from "./trame_utils.mjs";

const videoFile = path.join(trameDataDir, "trame_videos.csv");
const reportFile = path.join(trameDataDir, "qa", "trame_transcript_probe.csv");
const headers = ["video_id", "title", "youtube_url", "caption_probe_status", "transcript_status_suggestion", "checked_at", "known_limits", "notes"];

const { records: videos } = await readCsv(videoFile);
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : videos.length;
const rows = [];

for (const video of videos.slice(0, Number.isFinite(limit) ? limit : videos.length)) {
  const probeUrl = `https://www.youtube.com/api/timedtext?type=list&v=${encodeURIComponent(video.video_id)}`;
  try {
    const xml = await fetchText(probeUrl);
    const tracks = [...xml.matchAll(/<track\b/gi)].length;
    rows.push({
      video_id: video.video_id,
      title: video.title,
      youtube_url: video.youtube_url,
      caption_probe_status: tracks > 0 ? "caption_tracks_listed" : "no_caption_tracks_listed",
      transcript_status_suggestion: tracks > 0 ? "auto_available" : "blocked",
      checked_at: accessDate,
      known_limits: "Probe tecnico non equivalente a transcript verificato; lingua e qualita' richiedono controllo umano.",
      notes: tracks > 0 ? `${tracks} track possibili rilevate` : "Nessun track rilevato via endpoint pubblico timedtext."
    });
  } catch (error) {
    rows.push({
      video_id: video.video_id,
      title: video.title,
      youtube_url: video.youtube_url,
      caption_probe_status: "blocked_source_access",
      transcript_status_suggestion: "blocked",
      checked_at: accessDate,
      known_limits: "Accesso transcript non disponibile dal runtime.",
      notes: error.message
    });
  }
}

await writeCsv(reportFile, headers, rows);
console.log(`Probe transcript completato: ${rows.length} video controllati. Nessun transcript e' stato pubblicato.`);
