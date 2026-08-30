import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const GENERATED_DIR = path.join(
  REPO_ROOT,
  "artifacts/lamezia-trasparente/src/data/generated",
);
const OUTPUT_PATH = path.join(GENERATED_DIR, "lameziaOpenDataSeriesStatus.json");

async function main() {
  const [climate, airport, foreignResidents, families] = await Promise.all([
    readJson("lameziaClimateDaily.metadata.json"),
    readJson("lameziaAirTrafficMonthly.metadata.json"),
    readJson("lameziaForeignResidentsAgeSex.json"),
    readJson("lameziaFamiliesChildren.json"),
  ]);

  const manifest = {
    schema_version: 1,
    series: [
      buildSeries({
        id: "lamezia-climate-daily",
        themeId: "climate-territory",
        label: "Anomalie climatiche · Lamezia Terme",
        source: climate.source,
        sourceUrl: climate.source_url,
        latestObservation: climate.latest_data_point,
        latestObservationLabel: formatObservation(climate.latest_data_point),
        sourceModifiedAt: null,
        materialisedAt: climate.generated_at,
        sourceCadence: "daily",
        sourceCadenceLabel: "Fonte giornaliera",
        updatePolicy: climate.update_policy,
      }),
      buildSeries({
        id: "lamezia-air-traffic-monthly",
        themeId: "mobility-connections",
        label: "Traffico aeroportuale mensile - Lamezia Terme",
        source: airport.source,
        sourceUrl: airport.source_url,
        latestObservation: airport.latest_data_point,
        latestObservationLabel: formatObservation(airport.latest_data_point),
        sourceModifiedAt: null,
        materialisedAt: airport.generated_at,
        sourceCadence: "monthly",
        sourceCadenceLabel: "Fonte mensile",
        updatePolicy: airport.update_policy,
      }),
      buildSeries({
        id: "lamezia-demographic-trend",
        themeId: "population-society",
        label: "Osservatorio demografico - Lamezia Terme",
        source: "ISTAT - Demo e servizi SDMX",
        sourceUrl: "https://demo.istat.it/",
        latestObservation: null,
        latestObservationLabel: "Serie corrente via API",
        latestObservationNote:
          "Il periodo più recente è letto dall'API demografica canonica; questo manifest statico non duplica il valore.",
        sourceModifiedAt: null,
        materialisedAt: null,
        sourceCadence: "release-driven",
        sourceCadenceLabel: "Rilascio ISTAT",
        updatePolicy:
          "Aggiornamento automatico sulle fonti ISTAT: le nuove release vengono acquisite nel layer demografico versionato e le versioni precedenti restano conservate.",
      }),
      buildSeries({
        id: "lamezia-foreign-residents-age-sex",
        themeId: "population-society",
        label: "Stranieri per sesso ed eta - Lamezia Terme",
        source: foreignResidents.metadata.source,
        sourceUrl: foreignResidents.metadata.source_url,
        latestObservation: String(foreignResidents.metadata.latest_year),
        latestObservationLabel: String(foreignResidents.metadata.latest_year),
        sourceModifiedAt: foreignResidents.metadata.resource_last_modified,
        materialisedAt: foreignResidents.metadata.generated_at,
        sourceCadence: "weekly",
        sourceCadenceLabel: "Fonte settimanale",
        updatePolicy: foreignResidents.metadata.update_policy,
      }),
      buildSeries({
        id: "lamezia-families-children",
        themeId: "population-society",
        label: "Famiglie per numero di figli - Lamezia Terme",
        source: families.metadata.source,
        sourceUrl: families.metadata.source_url,
        latestObservation: null,
        latestObservationLabel: "Risorsa corrente",
        latestObservationNote:
          "La fonte non espone un anno di riferimento per questa distribuzione.",
        sourceModifiedAt: families.metadata.resource_last_modified,
        materialisedAt: families.metadata.generated_at,
        sourceCadence: "weekly",
        sourceCadenceLabel: "Fonte settimanale",
        updatePolicy: families.metadata.update_policy,
      }),
    ],
  };

  await writeFile(OUTPUT_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Wrote ${manifest.series.length} Open Data series states.`);
}

function buildSeries({
  id,
  themeId,
  label,
  source,
  sourceUrl,
  latestObservation,
  latestObservationLabel,
  latestObservationNote = null,
  sourceModifiedAt,
  materialisedAt,
  sourceCadence,
  sourceCadenceLabel,
  updatePolicy,
}) {
  return {
    id,
    theme_id: themeId,
    label,
    source,
    source_url: sourceUrl,
    latest_observation: latestObservation,
    latest_observation_label: latestObservationLabel,
    latest_observation_note: latestObservationNote,
    source_modified_at: sourceModifiedAt,
    materialised_at: materialisedAt,
    cadence: sourceCadence,
    cadence_label: sourceCadenceLabel,
    source_cadence: sourceCadence,
    source_cadence_label: sourceCadenceLabel,
    monitoring_cadence: "daily",
    monitoring_cadence_label: "Controllo giornaliero",
    automation_status: "active",
    automation_status_label: "Aggiornamento automatico",
    update_policy: updatePolicy,
  };
}

function formatObservation(value) {
  const match = String(value ?? "").match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (!match) return String(value ?? "");

  const [, year, month, day] = match;
  const monthNames = [
    "gen",
    "feb",
    "mar",
    "apr",
    "mag",
    "giu",
    "lug",
    "ago",
    "set",
    "ott",
    "nov",
    "dic",
  ];
  const monthLabel = monthNames[Number(month) - 1] ?? month;
  return day ? `${Number(day)} ${monthLabel} ${year}` : `${monthLabel} ${year}`;
}

async function readJson(fileName) {
  return JSON.parse(await readFile(path.join(GENERATED_DIR, fileName), "utf8"));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
