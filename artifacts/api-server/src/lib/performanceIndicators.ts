import { logger } from "./logger";
import { runDemographicIngestion } from "./demographics";

// Prefisso comune delle sorgenti automatiche della sezione Performance. La
// popolazione mantiene l'identificativo storico `performance:istat-popolazione`
// nello stato fonti per compatibilità, ma la sua acquisizione canonica avviene
// ora nell'archivio demografico versionato.
export const PERFORMANCE_FEED_PREFIX = "performance:";

// Il ciclo schedulato continua a passare da questo entrypoint per compatibilità
// con l'orchestratore esistente, ma l'acquisizione ISTAT è delegata al layer
// demografico. `runDemographicIngestion` salva la release append-only e poi
// aggiorna la proiezione corrente usata dalla UI Performance.
export async function runPerformanceIngestion(): Promise<void> {
  const result = await runDemographicIngestion();
  logger.info(
    {
      inserted: result.inserted,
      projectionChanges: result.projectionChanges,
    },
    "Performance population refreshed through demographic archive",
  );
}
