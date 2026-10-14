import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_10_14_CLEAN_HEAT = [{
  "id": "nyc-clean-heat-oil-boilers-pollution",
  "title": "Clean Heat: conversione delle caldaie a combustibili meno inquinanti",
  "authority": "New York City Department of Environmental Protection / Department of Buildings",
  "territory": "New York City",
  "country": "Stati Uniti",
  "implementationYear": "2011–2015 (prima fase); cronoprogramma originario per olio n. 4 fino al 2030",
  "problem": "Emissioni locali da combustibili petroliferi pesanti usati per riscaldamento degli edifici.",
  "measure": "Divieti graduali sui combustibili n. 6 e n. 4, procedure semplificate e accompagnamento alla conversione delle caldaie.",
  "mechanism": "Sostituire combustibili ad alta emissione riducendo i costi procedurali delle autorizzazioni.",
  "population": "Proprietari di edifici con caldaie interessate e popolazione esposta all'inquinamento urbano.",
  "primaryArea": "ambiente_clima_energia",
  "secondaryAreas": [
    "salute_pubblica_locale",
    "capacita_amministrativa_personale"
  ],
  "interventionTypes": [
    "regolazione",
    "modifica_organizzativa_processo",
    "targeting_data_analytics"
  ],
  "tools": [
    "registro caldaie",
    "permessi semplificati",
    "monitoraggio inquinanti NYCCAS",
    "modello spaziale"
  ],
  "territorialScale": "Città / census tract",
  "interventionStatus": "Prima fase realizzata; la successiva eliminazione dell'olio n. 4 era prevista entro il 2030 nella normativa originale.",
  "evaluationMethod": "Studio osservazionale spaziale 2011–2016: spatial lag regression per intensità di conversione, aggiustata per reddito, età edifici, traffico e altri combustibili.",
  "comparator": "Aree urbane con diversa intensità di conversione, a parità dei covariati del modello; nessuna randomizzazione o città di controllo.",
  "outcomes": [
    "SO2 atmosferico",
    "PM2.5 atmosferico",
    "NO2 atmosferico",
    "eterogeneità per quartiere"
  ],
  "results": "La conversione dall'olio combustibile n. 6 è associata a concentrazioni inferiori di SO2, PM2.5 e NO2. Le stime riguardano dieci edifici convertiti in un census tract, non l'effetto percentuale sull'intera città. Lo studio non misura outcome sanitari individuali.",
  "effectSize": "Per 10 edifici convertiti: SO2 −0,28 ppb (IC95% −0,34 a −0,22); PM2.5 −0,12 µg/m³ (−0,15 a −0,09); NO2 −0,29 ppb (−0,41 a −0,17).",
  "evidenceStrength": "moderata",
  "costsRequirements": "Inventario impianti, capitale di conversione, competenze autorizzative e monitoraggio; NYC comunicò risparmi sui soli permessi fino a 3.000 USD per caldaia.",
  "limitations": [
    "La valutazione osservazionale non esclude confondimento residuo.",
    "Le stime per 10 edifici non sono variazioni percentuali cittadine.",
    "Non sono evidenze dirette sulla riduzione di ricoveri o mortalità.",
    "Competenze italiane diverse; i costi di conversione non sono osservati nel trial."
  ],
  "unintendedEffects": "Oneri eccessivi per proprietari vulnerabili; possibili differenze distributive e scelta di combustibili non ottimali per il clima.",
  "primarySource": {
    "label": "NYC DEP: semplificazione conversione caldaie (2011)",
    "url": "https://www.nyc.gov/html/dep/html/press_releases/11-39pr.shtml"
  },
  "evaluationStudies": [
    {
      "label": "Environmental Health Perspectives (2021)",
      "url": "https://ehp.niehs.nih.gov/EHP9976",
      "citation": "Zhang et al. (2021), Evaluating the Impact of the Clean Heat Program on Air Pollution Levels in New York City",
      "doi": "10.1289/EHP9976"
    },
    {
      "label": "PLOS ONE monitoring (2018)",
      "url": "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0199783",
      "citation": "Soot and the city: impacts of Clean Heat policies on indoor and outdoor air quality in NYC apartments",
      "doi": "10.1371/journal.pone.0199783"
    }
  ],
  "lastVerifiedAt": "2026-10-14",
  "transferabilityItaly": "Utile come diagnosi delle fonti emissive e conversione di impianti pubblici; richiede verifica delle competenze nazionali e regionali.",
  "lameziaAdaptation": "Con Regione, ARPACAL e altri enti pertinenti, censire le fonti emissive e i combustibili degli immobili comunali, valutando solo conversioni con motivazione ambientale e finanziaria.",
  "implementability": "strutturale",
  "capacityDataNeeds": [
    "inventario caldaie",
    "monitoraggio aria",
    "competenza giuridica",
    "costi impianti",
    "analisi distribuzione benefici"
  ],
  "tags": [
    "New York",
    "Clean Heat",
    "qualità aria",
    "caldaie",
    "PM2.5",
    "valutazione osservazionale"
  ],
  "revisionHistory": [
    {
      "date": "2026-10-14",
      "note": "Inserimento con stime spaziali e caveat causali e sanitari."
    }
  ]
}] as const satisfies readonly EvidenceIntervention[];
