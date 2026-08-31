import { logger } from "./logger";
import { runDemographicIngestion } from "./demographics";
import { runSelfDescribingDemographicBalanceIngestion } from "./demographicBalanceIngestion";
import { runRbdBackfill } from "./demographicRbd";
import { runPopulationStructureIngestion } from "./populationStructure";
import { runPopulationCitizenshipIngestion } from "./populationCitizenship";

// Prefisso comune delle sorgenti automatiche della sezione Performance. La
// popolazione mantiene l'identificativo storico `performance:istat-popolazione`
// nello stato fonti per compatibilità, ma la sua acquisizione canonica avviene
// ora nell'archivio demografico versionato.
export const PERFORMANCE_FEED_PREFIX = "performance:";

// Il ciclo schedulato continua a passare da questo entrypoint per compatibilità
// con l'orchestratore esistente. La popolazione aggiorna anche la proiezione
// legacy Performance; le altre serie restano invece canoniche demografiche.
export async function runPerformanceIngestion(): Promise<void> {
  const population = await runDemographicIngestion();
  logger.info(
    {
      inserted: population.inserted,
      projectionChanges: population.projectionChanges,
    },
    "Performance population refreshed through demographic archive",
  );

  // Età e sesso vivono nella stessa architettura versionata ma non sono una
  // dipendenza del vecchio indicatore Performance. Un problema della fonte
  // strutturale viene quindi registrato senza impedire gli altri refresh.
  await runPopulationStructureIngestion().catch((err) => {
    logger.error({ err }, "Population structure refresh failed");
  });

  // Cittadinanza e popolazione straniera hanno feed indipendenti. Il modulo
  // applica internamente una strategia di cold-start che mantiene l'intero
  // ciclo entro il rate limit SDMX ISTAT anche quando manca il backfill storico.
  await runPopulationCitizenshipIngestion().catch((err) => {
    logger.error({ err }, "Population citizenship refresh failed");
  });

  // Il bilancio corrente inizializza le serie annuali canoniche. Solo dopo
  // questa fase innestiamo il backfill RBD 2002–2018 sulle stesse serie: in
  // questo modo la semantica resta unica mentre release e sourceStatus
  // distinguono chiaramente ricostruzione storica e dato post-2019.
  let currentBalanceReady = true;
  await runSelfDescribingDemographicBalanceIngestion().catch((err) => {
    currentBalanceReady = false;
    logger.error({ err }, "Demographic balance refresh failed");
  });

  if (currentBalanceReady) {
    await runRbdBackfill().catch((err) => {
      logger.error({ err }, "Reconstructed demographic backfill failed");
    });
  }
}
