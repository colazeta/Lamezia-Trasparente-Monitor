import { Router, type IRouter } from "express";
import { GetDemographicHouseholdsResponse } from "@workspace/api-zod";
import householdComposition2023 from "../data/lameziaHouseholdComposition2023.json";
import { LAMEZIA_ISTAT_CODE } from "../lib/demographics";
import { getPopulationHouseholdSnapshot } from "../lib/populationHouseholds";

const router: IRouter = Router();

router.get("/demographics/households", async (req, res) => {
  const rawPeriod = Array.isArray(req.query.period)
    ? req.query.period[0]
    : req.query.period;
  const period = typeof rawPeriod === "string" ? rawPeriod : null;
  const snapshot = await getPopulationHouseholdSnapshot(period);
  if (!snapshot) {
    res.status(404).json({
      error:
        "Dati sulle famiglie non ancora disponibili nell'archivio versionato",
    });
    return;
  }

  const payload = {
    geography: {
      code: LAMEZIA_ISTAT_CODE,
      name: "Lamezia Terme",
      level: "municipality",
    },
    ...snapshot,
    composition: householdComposition2023,
    methodology: {
      household:
        "Famiglia è l'unità anagrafica di persone coabitanti legate da matrimonio, parentela, affinità, adozione, tutela o vincoli affettivi; può essere costituita anche da una sola persona.",
      referencePeriod:
        "Numero di famiglie e popolazione residente in famiglia sono stock al 31 dicembre dell'anno indicato.",
      averageHouseholdSize:
        "La dimensione media è calcolata come popolazione residente in famiglia / numero di famiglie. Il valore medio eventualmente pubblicato da P02 è usato solo come controllo e non come sostituto dei due stock.",
      provenance:
        "Le osservazioni sono proiettate dalle stesse release P02 immutabili già archiviate per il bilancio demografico annuale. Non viene effettuata una seconda chiamata ISTAT e la release derivata conserva il riferimento alla release sorgente.",
      coverage:
        "La popolazione residente in famiglia è distinta dalla popolazione residente in convivenza. Quando disponibile, viene confrontata con la popolazione residente totale dello stesso anno senza forzare la quadratura.",
      history:
        "La serie parte dalle annualità P02 effettivamente conservate nell'archivio. Non viene retrodatata usando la risorsa comunale sulle famiglie per numero di figli, perché quella risorsa non espone l'anno di riferimento e non include le famiglie senza figli.",
      childrenDataset:
        "La distribuzione comunale delle famiglie per numero di figli resta un arricchimento Open Data separato e non viene usata come denominatore della serie ISTAT finché il suo periodo di riferimento non è verificato.",
      composition:
        "La distribuzione per numero di componenti è una fotografia censuaria distinta, riferita al 31 dicembre 2023 e aggregata dalle sezioni ISTAT del comune. Non cambia quando si seleziona un altro anno della serie P02.",
      compositionQuality:
        "I conteggi PF3-PF8 quadrano esattamente con PF1. Le sezioni fittizie sono escluse, i mancanti non sono convertiti a zero e le quote sono arrotondate a un decimale soltanto dopo la quadratura sui conteggi interi.",
      familyRelationships:
        "La dimensione della famiglia anagrafica non consente di inferire coppie, figli, parentela o altre relazioni tra i componenti.",
    },
  };
  GetDemographicHouseholdsResponse.parse(payload);
  res.json(payload);
});

export default router;
