import { Router, type IRouter } from "express";
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
      error: "Dati sulle famiglie non ancora disponibili nell'archivio versionato",
    });
    return;
  }

  res.json({
    geography: {
      code: LAMEZIA_ISTAT_CODE,
      name: "Lamezia Terme",
      level: "municipality",
    },
    ...snapshot,
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
    },
  });
});

export default router;
