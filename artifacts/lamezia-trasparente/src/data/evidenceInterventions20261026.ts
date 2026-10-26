import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_10_26: readonly EvidenceIntervention[] = [
  {
    "id": "minneapolis-guaranteed-basic-income-pilot-rct",
    "title": "Sostegno monetario mensile senza vincoli di spesa per nuclei a basso reddito: esperimento cittadino",
    "authority": "City of Minneapolis (Community Planning and Economic Development); valutazione indipendente Federal Reserve Bank of Minneapolis",
    "territory": "Minneapolis, Minnesota",
    "country": "Stati Uniti",
    "implementationYear": "Giugno 2022–giugno 2024",
    "problem": "Insicurezza alimentare, instabilità economica e abitativa di nuclei a basso reddito; incertezza circa l'efficacia di pagamenti flessibili non vincolati a specifiche spese.",
    "measure": "Il Comune ha selezionato mediante randomizzazione 200 nuclei eleggibili per ricevere 500 USD mensili per 24 mesi, senza vincoli sulla destinazione delle somme. Il gruppo di confronto di 329 persone ha ricevuto soltanto compensi per la compilazione delle rilevazioni periodiche.",
    "mechanism": "Trasferimento di liquidità ricorrente e prevedibile che consente alle famiglie di gestire spese prioritarie, bollette, alimenti e alloggio riducendo i vincoli di cassa; l'assenza di vincoli d'uso preserva discrezionalità dei destinatari.",
    "population": "Adulti residenti in nove ZIP code eleggibili della città, con reddito familiare entro la soglia municipale (non oltre il 50% dell'area median income); campione randomizzato di 529 unità: 200 trattamento e 329 controllo.",
    "primaryArea": "welfare_inclusione_servizi_sociali",
    "secondaryAreas": [
      "housing_politiche_abitative",
      "salute_pubblica_locale",
      "capacita_amministrativa_personale"
    ],
    "interventionTypes": [
      "incentivo_economico",
      "servizio_diretto",
      "targeting_data_analytics"
    ],
    "tools": [
      "pagamenti mensili da 500 USD",
      "selezione su requisiti di reddito e residenza",
      "lotteria randomizzata tra richiedenti",
      "survey baseline e follow-up semestrali",
      "piano di analisi preregistrato"
    ],
    "territorialScale": "Comunale; nove zone postali eleggibili; 200 nuclei beneficiari.",
    "interventionStatus": "Pilot concluso a giugno 2024. Al 26 ottobre 2026 risulta documentata la valutazione fino a 24 mesi; non è stata verificata la prosecuzione del medesimo schema a regime né una valutazione post-pagamento conclusiva.",
    "evaluationMethod": "Randomized controlled trial; randomizzazione stratificata tra richiedenti eleggibili, comparazioni aggiustate rispetto alla baseline, alternative difference-in-differences e correzioni per confronti multipli. Piano di analisi preregistrato AEA RCT Registry; criticità significativa di attrition differenziale nel follow-up.",
    "comparator": "329 partecipanti assegnati al controllo senza trasferimento mensile, con compenso di 150 USD per singole survey; outcomes osservati anche prima del trattamento.",
    "outcomes": [
      "sicurezza alimentare (USDA six-item screener)",
      "sicurezza finanziaria",
      "stabilità abitativa",
      "offerta di lavoro",
      "benessere soggettivo",
      "disagio psicologico",
      "accesso ai servizi sanitari"
    ],
    "results": "La valutazione Federal Reserve del 2024 conclude che il trattamento migliora in modo significativo gli indici di sicurezza alimentare e finanziaria; segnala risultati positivi sulla stabilità abitativa con evidenza meno uniforme. Non rileva un effetto statisticamente distinguibile da zero sull'offerta di lavoro. Gli effetti su benessere soggettivo e disagio psicologico cambiano secondo il momento osservato: nella sintesi a 24 mesi non sono classificati come risultati stabilmente significativi. Non emergono miglioramenti robusti su utilizzo sanitario o accesso ai trasporti. La risposta alle survey è selettiva e gli autori adottano specificazioni predefinite per mitigarne i problemi.",
    "effectSize": "Trattamento nominale: 500 USD/mese per 24 mesi = 12.000 USD per nucleo assegnato al trattamento (se tutti i pagamenti sono ricevuti). Grafico descrittivo a 24 mesi tra rispondenti verificati eleggibili: 50,6% food-secure nel gruppo pagamenti contro 35,0% nel controllo, differenza grezza +15,6 punti percentuali: NON è la stima causale aggiustata e non va presentata come tale. Per gli indici di sicurezza alimentare e finanziaria, lo studio riporta miglioramenti nella valutazione randomizzata aggiustata; l'abstract non fornisce un'unica stima percentuale trasferibile.",
    "evidenceStrength": "forte",
    "costsRequirements": "Impegno teorico lordo dei trasferimenti: 200 × 500 × 24 = 2.400.000 USD, prima dei costi amministrativi. Il working paper calcola un budget indicativo di studio pari a circa 2.677.500 USD includendo compensi delle survey, non un consuntivo verificato. Necessari risorse dedicate, processo di eleggibilità, infrastruttura pagamenti, valutazione indipendente e presidio dei benefici già spettanti.",
    "limitations": [
      "Elevata attrition alle survey e differenze di risposta tra assegnati a trattamento e controllo; per l'inferenza occorrono assunzioni e aggiustamenti preregistrati.",
      "Campione limitato a residenti volontari di nove ZIP code con soglia reddituale: validità esterna limitata.",
      "Outcome primari in prevalenza autodichiarati; differenza grezza tra gruppi non equivale all'effetto causale aggiustato.",
      "Non è dimostrata equivalenza rispetto all'offerta di lavoro: la non significatività non prova effetto nullo per tutte le popolazioni.",
      "La sintesi a 24 mesi non prova permanenza dei benefici dopo la sospensione dei pagamenti.",
      "La ricerca è pubblicata come working paper della Federal Reserve, non come articolo definitivo peer reviewed verificato in questa ricerca."
    ],
    "unintendedEffects": "Non sono documentati effetti indesiderati robusti nel pilot. Una replica deve comunque valutare potenziali variazioni nell'accesso alle prestazioni nazionali, rischi distributivi derivanti da restrizioni territoriali e possibili effetti diversi sulla partecipazione al lavoro.",
    "primarySource": {
      "label": "City of Minneapolis — Guaranteed Basic Income Pilot (2022–2024)",
      "url": "https://www.minneapolismn.gov/government/programs-initiatives/basic-income/"
    },
    "evaluationStudies": [
      {
        "label": "Federal Reserve Bank of Minneapolis — working paper 108",
        "url": "https://www.minneapolisfed.org/research/institute-working-papers/how-do-lowincome-households-respond-to-basic-income-experimental-evidence-from-minneapolis",
        "citation": "Goodman-Bacon, A. e Palmer, V. (2024), How Do Low-Income Households Respond to Basic Income? Experimental Evidence from Minneapolis, Institute Working Paper 108.",
        "doi": "10.21034/iwp.108"
      },
      {
        "label": "Federal Reserve Bank of Minneapolis — cumulative results, 24 months",
        "url": "https://www.minneapolisfed.org/-/media/assets/topics/labor-market-policies/24-month-results-overview.pdf",
        "citation": "Goodman-Bacon, A. e Palmer, V. (14 novembre 2024), Minneapolis Guaranteed Basic Income Pilot: Program Evaluation Cumulative Working Results (24 months)."
      },
      {
        "label": "Federal Reserve Bank of Minneapolis — pre-analysis plan",
        "url": "https://www.minneapolisfed.org/research/community-development-working-papers/evaluation-plan-minneapolis-guaranteed-basic-income-pilot",
        "citation": "Goodman-Bacon, A., Nunn, R. e Palmer, V. (2023), Evaluation Plan: Minneapolis Guaranteed Basic Income Pilot; preregistrato AEA RCT Registry #11369."
      }
    ],
    "lastVerifiedAt": "2026-10-26",
    "transferabilityItaly": "Trasferibile come sperimentazione comunale di contributi monetari integrativi a nuclei vulnerabili, non come reddito di base universale. Servono verifica delle competenze e fonti di finanziamento, coordinamento con ADI e altre misure nazionali, gestione ISEE, motivazione trasparente di criteri e controlli, disciplina dei dati personali e assenza di compressione di diritti esistenti.",
    "lameziaAdaptation": "Nell'Ambito Territoriale Sociale di Lamezia valutare, con gli enti competenti, un pilot circoscritto di contributo temporaneo non vincolato per nuclei vulnerabili, definendo un campione eleggibile e una possibile assegnazione randomizzata soltanto fra richiedenti senza diritto soggettivo alla prestazione e in presenza di risorse limitate. Confrontare, a baseline e ogni sei mesi, sicurezza alimentare, arretrati di affitto/utenze, disagio abitativo e accesso ai servizi; predisporre dati anonimizzati e valutatore esterno. Non convertire impropriamente la sperimentazione in sostituzione delle misure nazionali.",
    "implementability": "strutturale",
    "capacityDataNeeds": [
      "ricognizione dei contributi municipali e ATS disponibili",
      "base giuridica e risorse dedicate senza sottrarre diritti già spettanti",
      "criteri ISEE e controlli di eleggibilità",
      "infrastruttura pagamenti e gestione del consenso/informative",
      "strumenti validati di misurazione sicurezza alimentare e stabilità abitativa",
      "disegno RCT o rollout valutabile e approvazione metodologica",
      "protocollo GDPR per dati dei nuclei vulnerabili",
      "monitoraggio degli effetti su altre prestazioni sociali"
    ],
    "tags": [
      "welfare",
      "reddito garantito mirato",
      "contributi monetari",
      "minneapolis",
      "RCT",
      "insicurezza alimentare",
      "housing stability",
      "implementazione comunale",
      "attrition",
      "trasferibilità condizionata"
    ],
    "revisionHistory": [
      {
        "date": "2026-10-26",
        "note": "Nuovo intervento municipale distinto dai pilot di Barcellona, Rochester e Stockton; verifica studio e documentazione municipale. Precisate attrition, natura descrittiva del confronto 50,6%/35,0% e assenza di verifica della durata post-pagamento."
      }
    ]
  }
];
