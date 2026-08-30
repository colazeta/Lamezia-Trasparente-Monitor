import { logger } from "./logger";
import { runDemographicIngestion } from "./demographics";
import { runSelfDescribingDemographicBalanceIngestion } from "./demographicBalanceIngestion";
import { runRbdBackfill } from "./demographicRbd";

// Prefisso comune delle sorgenti automatiche della sezione Performance. La
// popolazione mantiene l'identificativo storico `performance:istat-popolazione`
// nello stato fonti per compatibilità, ma la sua acquisizione canonica avviene
// ora nell'archivio demografico versionato.
export const PERFORMANCE_FEED_PREFIX = "performance:";

// Il ciclo schedulato continua a passare da questo entrypoint per compatibilità
// con l'orchestratore esistente. La popolazione aggiorna anche la proiezione
// legacy Performance; bilancio annuale e mensile restano invece serie canoniche
// demografiche, usate dal pannello "Perché cambia Lamezia".
export async function runPerformanceIngestion(): Promise<void> {
  const population = await runDemographicIngestion();
  logger.info(
    {
      inserted: population.inserted,
      projectionChanges: population.projectionChanges,
    },
    "Performance population refreshed through demographic archive",
  );

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
