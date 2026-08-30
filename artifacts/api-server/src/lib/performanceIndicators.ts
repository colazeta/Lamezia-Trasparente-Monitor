import { logger } from "./logger";
import { runDemographicIngestion } from "./demographics";
import { runSelfDescribingDemographicBalanceIngestion } from "./demographicBalanceIngestion";

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

  // Il bilancio usa un adapter self-describing: legge il form ISTAT prima di
  // ogni ciclo, riproduce i campi hidden realmente dichiarati e conserva
  // separatamente revisioni provvisorie e definitive. Un suo errore non annulla
  // l'aggiornamento della popolazione: ogni fonte registra il proprio stato.
  await runSelfDescribingDemographicBalanceIngestion().catch((err) => {
    logger.error({ err }, "Demographic balance refresh failed");
  });
}
