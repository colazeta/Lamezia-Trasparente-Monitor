import path from "node:path";
import {
  accessDate,
  fetchText,
  htmlToText,
  normalizeLabel,
  slugify,
  trameDataDir,
  walkObjects,
  writeCsv,
  writeText
} from "./trame_utils.mjs";

const PROGRAM_DAYS = [
  { date: "2026-06-16", label: "martedi-16-giugno-2026", url: "https://www.tramefestival.it/marted%C3%AC-16-giugno-2026" },
  { date: "2026-06-17", label: "mercoledi-17-giugno-2026", url: "https://www.tramefestival.it/mercoled%C3%AC-17-giugno-2026" },
  { date: "2026-06-18", label: "giovedi-18-giugno-2026", url: "https://www.tramefestival.it/gioved%C3%AC-18-giugno-2026" },
  { date: "2026-06-19", label: "venerdi-19-giugno-2026", url: "https://www.tramefestival.it/venerd%C3%AC-19-giugno-2026" },
  { date: "2026-06-20", label: "sabato-20-giugno-2026", url: "https://www.tramefestival.it/sabato-20-giugno-2026" },
  { date: "2026-06-21", label: "domenica-21-giugno-2026", url: "https://www.tramefestival.it/domenica-21-giugno-2026" }
];

const eventHeaders = [
  "event_id",
  "edition_year",
  "event_title",
  "video_id",
  "date",
  "location",
  "speakers",
  "moderator",
  "main_topics",
  "territorial_relevance",
  "civic_relevance_score",
  "analysis_status",
  "notes"
];

const peopleHeaders = [
  "person_id",
  "name",
  "role_raw",
  "affiliation_raw",
  "speaker_type",
  "events_count",
  "verification_status",
  "notes"
];

function extractArticles(html) {
  return html.split('<div class="journal-content-article "').slice(1).map((chunk) => `<div class="journal-content-article "${chunk}`);
}

function extractAttribute(block, name) {
  return htmlToText(block.match(new RegExp(`${name}="([^"]*)"`))?.[1] ?? "");
}

function extractFirst(block, pattern) {
  return htmlToText(block.match(pattern)?.[1] ?? "");
}

function extractDescriptionHtml(block) {
  return block.match(/<div class="col event-description">([\s\S]*?)<span class="badge badge-secondary">/)?.[1] ?? "";
}

function extractStrongPeople(descriptionHtml) {
  const people = [];
  const regex = /<strong>([\s\S]*?)<\/strong>\s*(?:\(([^<]+)\))?/gi;
  for (const match of descriptionHtml.matchAll(regex)) {
    const name = htmlToText(match[1]);
    if (!name || name.length < 3) continue;
    if (/^(libera|confcommercio|camera di commercio|legambiente)$/i.test(name)) continue;
    const role = htmlToText(match[2] ?? "");
    people.push({ name, role });
  }
  return people;
}

function classifySpeaker(roleRaw, name) {
  const role = normalizeLabel(`${roleRaw} ${name}`);
  if (role.includes("giornalista") || role.includes("repubblica") || role.includes("avvenire")) return "giornalista";
  if (role.includes("magistrat") || role.includes("procurator") || role.includes("pm ")) return "magistrato";
  if (role.includes("univers") || role.includes("prof")) return "accademico";
  if (role.includes("sindac") || role.includes("ministro") || role.includes("istituz")) return "rappresentante_istituzionale";
  if (role.includes("associa") || role.includes("libera") || role.includes("legambiente")) return "attivista";
  if (role.includes("familiare") || role.includes("vittima")) return "familiare_vittima";
  if (role.includes("cooperativ") || role.includes("social")) return "operatore_sociale";
  if (role.includes("imprenditor") || role.includes("confcommercio")) return "imprenditore";
  if (role.includes("autor") || role.includes("scrittr")) return "autore";
  return "unknown";
}

function territorialRelevance(title, description, location) {
  const text = normalizeLabel(`${title} ${description} ${location}`);
  if (/(lamezia|lametino|scordovillo|nicotera)/.test(text)) return "Lamezia";
  if (/(calabria|calabres|san luca|locri|catanzaro|crotone|vibo valentia|goel)/.test(text)) return "Calabria";
  if (/(mezzogiorno|sud|campania|sicilia|napoli|palermo)/.test(text)) return "Mezzogiorno";
  if (/(albanes|sarajevo|germania|internazional|transnazional)/.test(text)) return "transnational";
  if (/(italia|italian)/.test(text)) return "Italia";
  if (/(mafia|mafie|legalita|ecomafie|beni confiscati|corruzione|criminalita)/.test(text)) return "Italia";
  return "general";
}

function civicScore(title, description, relevance) {
  const text = normalizeLabel(`${title} ${description}`);
  let score = relevance === "Lamezia" ? 5 : relevance === "Calabria" ? 4 : relevance === "Mezzogiorno" ? 4 : 3;
  if (/(beni comuni|bene in comune|ecomafie|etica aziendale|legalita|mafie|territorio|amministratori|lametino|scordovillo)/.test(text)) score += 1;
  if (/(podcast|spettacolo|visioni|mostra)/.test(text)) score -= 1;
  return Math.max(1, Math.min(5, score));
}

function cleanSpeakersFromDescription(description) {
  return description
    .replace(/^con\s+/i, "")
    .replace(/\s+in collaborazione con\s+.*$/i, "")
    .replace(/\s+presentazione\s+.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

const events = [];
const peopleByName = new Map();
const snapshots = [];

for (const day of PROGRAM_DAYS) {
  const html = await fetchText(day.url);
  const articles = extractArticles(html);
  snapshots.push({ ...day, articles_found: articles.length });

  for (const block of articles) {
    const rawTitle = extractAttribute(block, "data-analytics-asset-title");
    const time = extractFirst(block, /<h2>([\s\S]*?)<\/h2>/i);
    const location = extractFirst(block, /<div class="col-3 event-date-location">[\s\S]*?<p>([\s\S]*?)<\/p>/i);
    const descriptionHtml = extractDescriptionHtml(block);
    const description = htmlToText(descriptionHtml);
    const title = rawTitle || extractFirst(block, /<h5[^>]*>([\s\S]*?)<\/h5>/i);
    if (!title || !time) continue;

    const eventId = `trame15_${day.date.replaceAll("-", "")}_${slugify(title)}`;
    const relevance = territorialRelevance(title, description, location);
    const eventPeople = extractStrongPeople(descriptionHtml);

    events.push({
      event_id: eventId,
      edition_year: "2026",
      event_title: title,
      video_id: "",
      date: day.date,
      location,
      speakers: cleanSpeakersFromDescription(description),
      moderator: "",
      main_topics: title,
      territorial_relevance: relevance,
      civic_relevance_score: civicScore(title, description, relevance),
      analysis_status: "not_started",
      notes: `Programma ufficiale ${day.label}; orario ${time}; fonte ${day.url}`
    });

    for (const person of eventPeople) {
      const key = normalizeLabel(person.name);
      if (!peopleByName.has(key)) {
        peopleByName.set(key, {
          person_id: `person_${slugify(person.name)}`,
          name: person.name,
          role_raw: person.role,
          affiliation_raw: person.role,
          speaker_type: classifySpeaker(person.role, person.name),
          events: new Set(),
          verification_status: "official_program_raw",
          notes: new Set()
        });
      }
      const entry = peopleByName.get(key);
      if (!entry.role_raw && person.role) entry.role_raw = person.role;
      if (!entry.affiliation_raw && person.role) entry.affiliation_raw = person.role;
      entry.events.add(eventId);
      entry.notes.add(title);
    }
  }
}

events.sort((a, b) => `${a.date} ${a.event_title}`.localeCompare(`${b.date} ${b.event_title}`, "it"));

const people = [...peopleByName.values()]
  .map((person) => ({
    person_id: person.person_id,
    name: person.name,
    role_raw: person.role_raw,
    affiliation_raw: person.affiliation_raw,
    speaker_type: person.speaker_type,
    events_count: person.events.size,
    verification_status: person.verification_status,
    notes: `Eventi: ${[...person.notes].slice(0, 5).join(" | ")}`
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "it"));

await writeCsv(path.join(trameDataDir, "trame_events.csv"), eventHeaders, events);
await writeCsv(path.join(trameDataDir, "trame_people.csv"), peopleHeaders, people);
await writeText(
  path.join(trameDataDir, "sources", "trame15_program_snapshot.json"),
  `${JSON.stringify({ last_checked: accessDate, source_status: "official", days: snapshots, events_count: events.length, people_count: people.length }, null, 2)}\n`
);

console.log(`Programma Trame.15 censito: ${events.length} eventi, ${people.length} interlocutori grezzi.`);
