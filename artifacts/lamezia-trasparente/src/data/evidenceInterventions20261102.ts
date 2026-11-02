import type { EvidenceIntervention } from "./evidenceInterventions";

/** Oakland SSBT sources directly verified 2026-11-02; retains contradictory evaluations and transfer limits. */
export const EVIDENCE_INTERVENTIONS_2026_11_02: readonly EvidenceIntervention[] = [
{
  "id": "oakland-sugar-sweetened-beverage-distribution-tax-2017",
  "title": "Oakland: imposta municipale sulla distribuzione di bevande zuccherate e acquisti al dettaglio",
  "authority": "City of Oakland (California) — Finance Department / Sugar-Sweetened Beverage Tax Community Advisory Board",
  "territory": "Oakland, California",
  "country": "Stati Uniti",
  "implementationYear": "Approvata con Measure HH l'8 novembre 2016; in vigore dal 1 luglio 2017; effetti valutati 2015–2019",
  "problem": "Elevato consumo di bevande con zuccheri aggiunti e rischi sanitari associati, con disparità di salute e costi sociali; necessità di informare i comportamenti di acquisto e generare risorse municipali.",
  "measure": "Imposta di distribuzione di 1 centesimo di dollaro per oncia fluida di bevande zuccherate, dovuta dal distributore, con esclusioni definite e obblighi di registrazione/versamento. Le entrate confluiscono nel bilancio comunale; una commissione consultiva formula raccomandazioni sull'impiego di risorse per prevenzione e salute.",
  "mechanism": "Il prelievo sui distributori può trasferirsi in parte al prezzo al dettaglio e ridurre la quantità acquistata di bevande tassate. Le entrate possono sostenere programmi sanitari attraverso decisioni comunali separate. Trasmissione prezzo→acquisti→consumo→salute non osservata integralmente nel medesimo disegno.",
  "population": "Acquirenti di bevande zuccherate e operatori distributivi/retail a Oakland; nello studio scanner 2023, 316 negozi e 11.627 prodotti, principalmente catene; il confronto su consumo 2020 include clienti e nuclei domestici intervistati.",
  "primaryArea": "salute_pubblica_locale",
  "secondaryAreas": [
    "fiscalita_entrate_riscossione",
    "welfare_inclusione_servizi_sociali",
    "sviluppo_economico_commercio_lavoro",
    "capacita_amministrativa_personale"
  ],
  "interventionTypes": [
    "incentivo_economico",
    "regolazione",
    "enforcement_controllo",
    "targeting_data_analytics"
  ],
  "tools": [
    "imposta per oncia sulle distribuzioni",
    "dichiarazioni e controlli fiscali sui distributori",
    "registrazioni scanner dei volumi retail",
    "confronti longitudinali DID con Richmond",
    "controllo sintetico su negozi di Los Angeles",
    "consiglio consultivo sulle entrate"
  ],
  "territorialScale": "Città; tassazione della distribuzione e analisi di negozi e comunità di confronto",
  "interventionStatus": "Misura adottata nel 2017; la City of Oakland pubblica tuttora la pagina amministrativa della Sugar Sweetened Beverage Distribution Tax. Non si assume la permanenza immutata di regole, gettito o destinazioni oltre i documenti verificati.",
  "evaluationMethod": "White et al. (2023), difference-in-differences longitudinale su scansioni retail 2015–2019 fra Oakland e Richmond, con test pre-trend e synthetic control su negozi di Los Angeles. Cawley et al. (2020), altra DID su prezzi, acquisti agli store e consumo autodichiarato di clienti/adulti/bambini con negozi e aree limitrofe comparabili. Studi non randomizzati, indicatori e campioni differenti.",
  "comparator": "Per White et al. (2023), negozi in Richmond senza tassa e controllo sintetico ricavato da negozi di Los Angeles. Per Cawley et al. (2020), negozi e clienti di contee confinanti; assenza di assegnazione casuale e differenze di campionamento.",
  "outcomes": [
    "volumi di bevande tassate venduti al dettaglio",
    "acquisti presso negozi esterni alla città",
    "prezzi al dettaglio e trasmissione del tributo",
    "acquisti di bevande non tassate e snack dolci",
    "consumo totale di bevande zuccherate dichiarato da adulti e bambini",
    "QALY e costi sanitari simulati, non osservati"
  ],
  "results": "White et al. (2023) rilevano una riduzione significativa delle vendite di bevande zuccherate nei negozi scanner di Oakland rispetto a Richmond, confermata in direzione dal controllo sintetico, senza evidenza nel loro campione di sostituzioni verso bevande non tassate/snack o di aumenti nel buffer di confine. Cawley et al. (2020), con interviste ai clienti e consumi familiari, non trovano diminuzioni statisticamente significative del consumo totale o dello zucchero da bevande e segnalano possibili acquisti fuori città. Le stime di salute/risparmi del 2023 provengono da microsimulazioni, non da outcome clinici rilevati.",
  "effectSize": "White et al. (2023): volumi acquistati −26,8% vs Richmond (IC95% −39,0%/−14,7%; p<0,001); synthetic control −22,4% (IC95% −41,7%/−3,0%; p=0,04). Supermercati −38,4%, ma nessun effetto significativo in convenience stores o farmacie. Cawley et al. (2020): acquisti per viaggio −11,33 once (non significativo), pass-through al prezzo ~60%, nessun effetto robusto sul consumo complessivo. White et al. stimano 94 QALY/10.000 abitanti in 10 anni: proiezione, non risultato sanitario misurato.",
  "evidenceStrength": "moderata",
  "costsRequirements": "Richiede base legale per il tributo, anagrafe distributori, dichiarazioni, sistema di riscossione e controllo, capacità di monitorare prezzi/acquisti e valutare l'equità; non è verificato un costo amministrativo netto trasferibile. Le stime di >100.000 USD di risparmi sociali/10.000 abitanti sono microsimulazioni decennali e non risparmi consuntivi del Comune.",
  "limitations": [
    "DID non randomizzata con soltanto due città nel confronto principale: possibile shock differenziale e standard error raggruppati per ZIP code anziché per città.",
    "Campione scanner prevalentemente di catene commerciali; gli acquisti registrati non equivalgono ai consumi dei residenti e non coprono integralmente esercizi indipendenti.",
    "Le due valutazioni originali dello stesso intervento differiscono: White et al. (2023) rilevano forti diminuzioni dei volumi scanner; Cawley et al. (2020) non identifica effetti significativi sul consumo totale.",
    "Le stime economiche e sanitarie derivano da simulazione basata su conversione acquisti→consumi; non documentano riduzioni osservate di diabete, mortalità o costi sanitari.",
    "La tassa è stata introdotta nel 2017 e gli studi non consentono di attribuire isolatamente a questa tutte le variazioni di acquisto o di isolare effetti post-2019/2026."
  ],
  "unintendedEffects": "Possibile onere regressivo sui consumatori se il tributo si riflette nei prezzi, effetti distributivi da analizzare insieme all'uso delle entrate. Cawley et al. (2020) segnalano alcuni acquisti extraurbani; White et al. (2023) non osservano variazioni rilevabili nel proprio campione ai confini. Effetti commerciali e distributivi non quantificati in modo concorde.",
  "primarySource": {
    "label": "City of Oakland — Sugar Sweetened Beverage Distribution Tax (SSBT)",
    "url": "https://www.oaklandca.gov/Business/For-Business-Owners/Business-Taxes/Sugar-Sweetened-Beverage-Distribution-Tax-SSBT"
  },
  "evaluationStudies": [
    {
      "label": "PLOS Medicine — DID su vendite scanner e controllo sintetico",
      "url": "https://doi.org/10.1371/journal.pmed.1004212",
      "citation": "White, J. S., Basu, S., Kaplan, S., Madsen, K. A., Villas-Boas, S. B., & Schillinger, D. (2023). Evaluation of the sugar-sweetened beverage tax in Oakland, United States, 2015–2019: A quasi-experimental and cost-effectiveness study. PLOS Medicine, 20(4), e1004212.",
      "doi": "10.1371/journal.pmed.1004212"
    },
    {
      "label": "Economics & Human Biology — DID su prezzi, acquisti e consumi",
      "url": "https://doi.org/10.1016/j.ehb.2020.100865",
      "citation": "Cawley, J., Frisvold, D., Hill, A., & Jones, D. (2020). Oakland's sugar-sweetened beverage tax: Impacts on prices, purchases and consumption by adults and children. Economics & Human Biology, 37, 100865.",
      "doi": "10.1016/j.ehb.2020.100865"
    }
  ],
  "lastVerifiedAt": "2026-11-02",
  "transferabilityItaly": "Limitata per la replica diretta del tributo. L'art. 23 della Costituzione e l'art. 52 del D.Lgs. 446/1997 non consentono al singolo Comune di inventare autonomamente una nuova fattispecie impositiva sulle bevande senza specifica base legislativa. Trasferibile il principio di monitorare prezzi, acquisti, sostituzioni e disuguaglianze; con verifica competenze, esplorare leve di procurement/ristorazione e accesso all'acqua.",
  "lameziaAdaptation": "Partire dal servizio comunale di refezione scolastica 2026/2027: ricognizione di menu, accesso all'acqua potabile e, ove di competenza, distributori/concessioni negli edifici comunali. Valutare con scuole, gestore della mensa e ASP standard e alternative a basso contenuto di zuccheri conformi ai contratti esistenti; nessuna tassa comunale improvvisata. Pilot non fiscale con misurazione delle quantità acquistate/scelte, zucchero complessivo, accettazione ed eventuali sostituzioni, dati aggregati e comparatori; possibile sperimentazione futura di capitolati e offerta di acqua gratuita.",
  "implementability": "strutturale",
  "capacityDataNeeds": [
    "verifica competenze tributarie e vincoli dei contratti di refezione/concessione",
    "inventario degli spazi e servizi comunali coinvolti",
    "dati aggregati di vendite/scelte e alternative disponibili",
    "indicatori di accessibilità ed equità per nuclei vulnerabili",
    "protocollo controfattuale, tutela dei minori e minimizzazione dei dati"
  ],
  "tags": [
    "salute pubblica",
    "politica fiscale locale",
    "bevande zuccherate",
    "sugar sweetened beverage tax",
    "difference-in-differences",
    "synthetic control",
    "acquisti versus consumi",
    "evidenza contrastante",
    "equità",
    "procurement alimentare"
  ],
  "revisionHistory": [
    {
      "date": "2026-11-02",
      "note": "Primo inserimento. Verificati legge e stato amministrativo municipale, White et al. 2023 e valutazione con risultati non confermativi di Cawley et al. 2020; classificazione prudente moderata e limitata trasferibilità tributaria italiana."
    }
  ]
}
];
