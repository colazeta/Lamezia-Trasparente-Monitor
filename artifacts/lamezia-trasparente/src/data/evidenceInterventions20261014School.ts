import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_10_14_SCHOOL = [{
  "id": "philadelphia-school-absence-family-mailing-rct",
  "title": "Comunicazioni personalizzate alle famiglie sulle assenze scolastiche",
  "authority": "School District of Philadelphia / Regional Educational Laboratory Mid-Atlantic",
  "territory": "Philadelphia, Pennsylvania",
  "country": "Stati Uniti",
  "implementationYear": "2014 e successivo esperimento pubblicato nel 2018",
  "problem": "Sottostima delle assenze scolastiche da parte delle famiglie e ostacoli a una frequenza regolare.",
  "measure": "Invio sperimentale di cartoline e comunicazioni ripetute alle famiglie con informazioni sull'importanza della frequenza e sul totale delle assenze dei figli.",
  "mechanism": "Ridurre la disattenzione e correggere la sottostima delle giornate di scuola perse.",
  "population": "Studenti delle scuole del distretto e loro famiglie; circa 38.000 nel trial del 2014 e 28.080 nel trial successivo.",
  "primaryArea": "istruzione_giovani",
  "secondaryAreas": [
    "welfare_inclusione_servizi_sociali",
    "capacita_amministrativa_personale"
  ],
  "interventionTypes": [
    "nudging_comunicazione",
    "informazione_trasparenza"
  ],
  "tools": [
    "cartoline",
    "registri delle presenze",
    "assegnazione randomizzata",
    "supporto alle famiglie"
  ],
  "territorialScale": "Distretto scolastico cittadino",
  "interventionStatus": "Esperimenti storici eseguiti; non verificata nel 2026 la prosecuzione degli stessi trattamenti.",
  "evaluationMethod": "Due randomised controlled trials distinti nella stessa area scolastica, con gruppi di controllo e outcome amministrativi. Replica su sei distretti pubblicata nel 2025.",
  "comparator": "Famiglie assegnate casualmente alla comunicazione ordinaria.",
  "outcomes": [
    "giorni di assenza",
    "assenteismo cronico",
    "eterogeneità per messaggio"
  ],
  "results": "Il trial 2014 trova −2,4% di assenze con singola cartolina e nessuna differenza significativa tra versioni. Il trial più ampio con informazioni ripetute trova una riduzione dell'assenteismo cronico superiore al 10% relativo nella versione migliore. Nel follow-up multicentrico 2025 su altri distretti, le assenze diminuiscono dell'1,9% relativo (IC95% 0,6–3,1%).",
  "effectSize": "Trial 2014 −2,4% assenze; trial 2018 >−10% assenteismo cronico relativo; replica 2025 −1,9% assenze relative (IC95% −3,1% a −0,6%).",
  "evidenceStrength": "molto_forte",
  "costsRequirements": "Registri presenze, contatti validi, stampa/invio, personale scolastico e assistenza familiare; spese contenute rispetto a programmi intensivi.",
  "limitations": [
    "Le repliche in distretti differenti mostrano effetti più piccoli.",
    "Non risolve ostacoli strutturali (salute, trasporto, povertà).",
    "Non identifica un aumento causale delle competenze scolastiche.",
    "Competenze e trattamento dei dati sono in capo alle scuole, non automaticamente al Comune."
  ],
  "unintendedEffects": "Possibili stigmatizzazione e problemi di privacy o recapiti errati.",
  "primarySource": {
    "label": "School District of Philadelphia — Attendance & Truancy",
    "url": "https://www.philasd.org/studentrights/attendance/"
  },
  "evaluationStudies": [
    {
      "label": "IES/REL Mid-Atlantic RCT",
      "url": "https://ies.ed.gov/use-work/resource-library/report/impact-study/randomized-experiment-using-absenteeism-information-nudge-attendance",
      "citation": "Rogers et al. (2017), REL 2017–252."
    },
    {
      "label": "Nature Human Behaviour RCT",
      "url": "https://www.nature.com/articles/s41562-018-0328-1",
      "citation": "Rogers and Feller (2018), Reducing student absences at scale by targeting parents' misbeliefs.",
      "doi": "10.1038/s41562-018-0328-1"
    },
    {
      "label": "Six-district RCT replication",
      "url": "https://www.tandfonline.com/doi/full/10.1080/19345747.2025.2537112",
      "citation": "Can Personalized Attendance Information Mitigate Student Absenteeism? Six Randomized Field Trials (2025).",
      "doi": "10.1080/19345747.2025.2537112"
    }
  ],
  "lastVerifiedAt": "2026-10-14",
  "transferabilityItaly": "Metodo trasferibile alle scuole, previa base giuridica e accordo per dati di minori; Comune può supportare comunicazione e servizi complementari.",
  "lameziaAdaptation": "Co-progettare con le scuole comunicazioni non colpevolizzanti ai genitori tramite canali scolastici; randomizzare invii ove appropriato e misurare assenze, reclami e barriere logistiche, senza dati nominativi sul sito.",
  "implementability": "medio_termine",
  "capacityDataNeeds": [
    "accordi con scuole",
    "base giuridica GDPR",
    "presenze e recapiti aggiornati",
    "valutazione sperimentale"
  ],
  "tags": [
    "Philadelphia",
    "scuola",
    "assenteismo",
    "RCT",
    "comunicazione"
  ],
  "revisionHistory": [
    {
      "date": "2026-10-14",
      "note": "Inserimento con trial 2014 e 2018 distinti e replica 2025 con effetti minori."
    }
  ]
}] as const satisfies readonly EvidenceIntervention[];
