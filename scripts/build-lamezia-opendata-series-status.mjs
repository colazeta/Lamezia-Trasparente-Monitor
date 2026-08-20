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
  const [climate, airport, demographic, foreignResidents, families] =
    await Promise.all([
      readJson("lameziaClimateDaily.metadata.json"),
      readJson("lameziaAirTrafficMonthly.metadata.json"),
      readJson("lameziaDemographicTrend.json"),
      readJson("lameziaForeignResidentsAgeSex.json"),
      readJson("lameziaFamiliesChildren.json"),
    ]);

  const manifest = {
    schema_version: 1,
    series: [
      {
        id: "lamezia-climate-daily",
        theme_id: "climate-territory",
        label: "Anomalie climatiche · Lamezia Terme",
        source: climate.source,
        source_url: climate.source_url,
        latest_observation: climate.latest_data_point,
        latest_observation_label: climate.latest_data_point,
        source_modified_at: null,
        generated_at: climate.generated_at,
        cadence: "daily",
        cadence_label: "Giornaliero",
        update_policy: climate.update_policy,
      },
      {
        id: "lamezia-air-traffic-monthly",
        theme_id: "mobility-connections",
        label: "Traffico aeroportuale mensile - Lamezia Terme",
        source: airport.source,
        source_url: airport.source_url,
        latest_observation: airport.latest_data_point,
        latest_observation_label: airport.latest_data_point,
        source_modified_at: null,
        generated_at: airport.generated_at,
        cadence: "monthly",
        cadence_label: "Mensile",
        update_policy: airport.update_policy,
      },
      {
        id: "lamezia-demographic-trend",
        theme_id: "population-society",
        label: "Trend demografico - Lamezia Terme",
        source: demographic.metadata.source,
        source_url: demographic.metadata.source_url,
        latest_observation: String(demographic.metadata.latest_year),
        latest_observation_label: String(demographic.metadata.latest_year),
        source_modified_at: demographic.metadata.resource_last_modified,
        generated_at: demographic.metadata.generated_at,
        cadence: "weekly",
        cadence_label: "Controllo settimanale",
        update_policy: demographic.metadata.update_policy,
      },
      {
        id: "lamezia-foreign-residents-age-sex",
        theme_id: "population-society",
        label: "Stranieri per sesso ed eta - Lamezia Terme",
        source: foreignResidents.metadata.source,
        source_url: foreignResidents.metadata.source_url,
        latest_observation: String(foreignResidents.metadata.latest_year),
        latest_observation_label: String(foreignResidents.metadata.latest_year),
        source_modified_at: foreignResidents.metadata.resource_last_modified,
        generated_at: foreignResidents.metadata.generated_at,
        cadence: "weekly",
        cadence_label: "Controllo settimanale",
        update_policy: foreignResidents.metadata.update_policy,
      },
      {
        id: "lamezia-families-children",
        theme_id: "population-society",
        label: "Famiglie per numero di figli - Lamezia Terme",
        source: families.metadata.source,
        source_url: families.metadata.source_url,
        latest_observation: null,
        latest_observation_label:
          "Risorsa corrente · la fonte non espone un anno di riferimento",
        source_modified_at: families.metadata.resource_last_modified,
        generated_at: families.metadata.generated_at,
        cadence: "weekly",
        cadence_label: "Controllo settimanale",
        update_policy: families.metadata.update_policy,
      },
    ],
  };

  await writeFile(OUTPUT_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Wrote ${manifest.series.length} Open Data series states.`);
}

async function readJson(fileName) {
  return JSON.parse(await readFile(path.join(GENERATED_DIR, fileName), "utf8"));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
