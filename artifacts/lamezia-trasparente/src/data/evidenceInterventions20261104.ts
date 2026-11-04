import type { EvidenceIntervention } from "./evidenceInterventions";

/** Evidence checked on 2026-11-04: mixed DID results are not a general benefit claim. */
export const EVIDENCE_INTERVENTIONS_2026_11_04: readonly EvidenceIntervention[] = [
{
  "id": "brazil-intermunicipal-solid-waste-consortia-health-expenditure-did-2005-2019",
  "title": "Brasile: consorzi intercomunali per la gestione dei rifiuti, esiti sanitari e spesa ambientale",
  "authority": "Consorzi pubblici intermunicipali (consórcios públicos de resíduos sólidos) e comuni aderenti, Brasile; quadro federale della Lei 11.107/2005",
  "territory": "Molteplici municipalità brasiliane, adesioni in anni differenti; studio su dati municipali nazionali, non un singolo comune",
  "country": "Brasile",
  "implementationYear": "2005–2019 (adesioni e operatività scaglionate nel periodo della valutazione; legge quadro 11.107/2005)",
  "problem": "Comuni isolati con limitata scala tecnica e contrattuale per raccolta, trattamento e smaltimento, rischi ambientali e di salute pubblica e pressioni sulla spesa locale.",
  "measure": "Comuni brasiliani hanno aderito progressivamente a consorzi pubblici intermunicipali per l'erogazione totale o parziale di servizi di gestione dei rifiuti solidi urbani. Il trattamento dello studio è l'appartenenza a un consorzio operativo nel settore; non una specifica tecnologia o una riforma uniforme applicata contemporaneamente.",
  "mechanism": "Coordinamento tra enti, economie di scala nella contrattazione e nella gestione di impianti e servizi, maggiore capacità tecnica, gestione più efficace dei flussi di rifiuti; possibili benefici sanitari indiretti tramite migliore igiene ambientale. I meccanismi non sono identificati separatamente nel disegno econometrico.",
  "population": "Residenti dei comuni brasiliani che hanno aderito a consorzi di servizi rifiuti nel 2005–2019, con sottoanalisi degli esiti sanitari per fasce d'età; comuni non aderenti come comparatori.",
  "primaryArea": "capacita_amministrativa_personale",
  "secondaryAreas": [
    "rifiuti_pulizia_urbana",
    "salute_pubblica_locale",
    "ambiente_clima_energia",
    "procurement_spesa_pubblica"
  ],
  "interventionTypes": [
    "modifica_organizzativa_processo",
    "procurement_contract_design",
    "targeting_data_analytics"
  ],
  "tools": [
    "accordi e governance intercomunale in base alla Lei 11.107/2005",
    "gestione associata di servizi di raccolta/trattamento/smaltimento",
    "dati amministrativi SNIS, DATASUS/SINAN, Tesoro nazionale (STN)",
    "monitoraggio di spesa e indicatori sanitari per municipalità"
  ],
  "territorialScale": "Intercomunale / consortile, con outcome misurati a livello di singolo comune.",
  "interventionStatus": "Servizi consortili realmente adottati da municipalità nel periodo 2005–2019; lo studio non verifica che ogni consorzio e assetto organizzativo del campione sia tuttora operativo.",
  "evaluationMethod": "Quasi-esperimento con staggered difference-in-differences su dati panel municipali (2005–2019); modelli con/senza covariate, errori raggruppati per comune oppure per consorzio, verifica descritta delle pre-tendenze. Adozione NON randomizzata. La spiegazione tecnica degli stimatori va letta con cautela rispetto alle usuali ipotesi di parallel trends.",
  "comparator": "Municipalità brasiliane non aderenti a consorzi di gestione dei rifiuti nel periodo analizzato (never treated); confronto nel tempo con comuni che adottano la gestione consortile in anni diversi.",
  "outcomes": [
    "ricoveri per diarrea/gastroenterite per classi di età",
    "notifiche di schistosomiasi",
    "ricoveri per altre patologie intestinali",
    "spesa ambientale municipale",
    "spesa per servizi igienico-sanitari",
    "indicatori di qualità dell'acqua e altri outcome epidemiologici"
  ],
  "results": "Nella specificazione con covariate, si rilevano diminuzioni statisticamente significative delle notifiche di schistosomiasi, dei ricoveri per diarrea/gastroenterite nei bambini sotto i 5 anni e della spesa ambientale registrata. Le stesse tabelle riportano però aumenti significativi dei ricoveri per diarrea/gastroenterite in alcune altre fasce (5–9, 10–14 e 30–39 anni), assenza di risultati significativi per numerose malattie e assenza di prova robusta di riduzione della spesa per sanitation. Non è dimostrato un beneficio sanitario generale o un saldo costo-beneficio netto. I coefficienti sono riportati nelle unità del modello, non in punti percentuali o euro.",
  "effectSize": "Tabella 4, modelli con covariate (3–4): schistosomiasi −0,000156 (p<0,05); ricoveri diarrea/gastroenterite <5 anni −0,000127 (p<0,05); spesa ambientale −3,626831 (p<0,05, unità non sufficientemente chiarita dall'articolo); ricoveri 5–9 anni +0,000066, 10–14 anni +0,000052 e 30–39 anni +0,000103 (p<0,05). NON tradurre questi coefficienti in riduzioni percentuali della spesa o della morbilità.",
  "evidenceStrength": "moderata",
  "costsRequirements": "Servono accordi fra enti, titolo giuridico, deleghe chiare, governance, personale tecnico, sistema di contabilità analitica, dati comparabili su costi/volumi/qualità e capacità di controllare le prestazioni. La ricerca rileva una variazione della spesa ambientale ma non fornisce un costo di avvio omogeneo, un costo per tonnellata validato per il trasferimento o un beneficio netto affidabile.",
  "limitations": [
    "Adozione volontaria e non randomizzata: il disegno DID dipende da trend paralleli condizionati e non esclude fattori locali concomitanti; pre-trend e composizione dei gruppi non eliminano ogni confondimento.",
    "Molteplici outcome testati e sottogruppi d'età senza chiara correzione per confronti multipli; aumenta il rischio di falsi positivi.",
    "La Tabella 4 presenta segni opposti statisticamente significativi nei ricoveri per fasce d'età diverse; non si può riassumere come riduzione generalizzata dei ricoveri.",
    "I consorzi aggregano servizi parziali e completi con tecnologie, cronologie, competenze e qualità differenti: l'effetto non è attribuibile a un singolo processo.",
    "Unità e scaling di alcune variabili di spesa e incidenza non sono descritti in modo sufficiente per convertire i coefficienti in % o euro; nessuna stima certificata del saldo economico netto.",
    "Il controllo sulle infezioni dipende anche da approvvigionamento idrico, rete fognaria, sorveglianza epidemiologica e accesso ai servizi sanitari; contesto brasiliano diverso da Calabria.",
    "Non è documentato un audit indipendente della replicazione dei coefficienti sullo stesso dataset."
  ],
  "unintendedEffects": "Aumenti statisticamente significativi dei ricoveri per diarrea/gastroenterite in alcune fasce d'età (5–9, 10–14, 30–39 anni) nelle specificazioni controllate. L'indicatore di coliformi presenta un peggioramento nei modelli privi di covariate, non robusto nei modelli controllati; può dipendere da cambiamenti nella segnalazione. Possibili rischi non misurati: distanza decisionale, opacità dei costi consortili, distribuzione diseguale delle prestazioni.",
  "primarySource": {
    "label": "Ministério das Cidades — Resíduos Sólidos: interventi accessibili a municipi e consorzi pubblici",
    "url": "https://www.gov.br/cidades/pt-br/novo-pac-selecoes/residuos-solidos"
  },
  "evaluationStudies": [
    {
      "label": "Heliyon 2024 — articolo originale open access",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC10906158/",
      "citation": "Cattani, Y. N., Pontes, R. P., Botassio, D. C., Komesu, D. K., Benevenuto, R. G., & Ogasavara, M. H. (2024). Measuring the health and fiscal outcomes of solid waste management operations by intergovernmental arrangements: The case of public consortia in Brazil. Heliyon, 10(4), e26032.",
      "doi": "10.1016/j.heliyon.2024.e26032"
    },
    {
      "label": "Ministério das Cidades — progetti di concessione/consorzi intercomunali di gestione rifiuti",
      "url": "https://www.gov.br/cidades/pt-br/carteira-de-projetos/concessoes-1/residuos-solidos",
      "citation": "Ministério das Cidades (2021), documentazione amministrativa di consorzi e gestione regionalizzata dei rifiuti (fonte istituzionale, NON valutazione causale)."
    }
  ],
  "lastVerifiedAt": "2026-11-04",
  "transferabilityItaly": "Rilevante per un comune italiano come prova condizionata dell'utilità possibile del coordinamento sovracomunale; non giustifica la creazione automatica di un nuovo consorzio. In Calabria la governance d'ambito è già concentrata in ARRICAL con partecipazione obbligatoria dei comuni: serve prima misurare le prestazioni dell'assetto vigente e rispettare le competenze regionali, i contratti e la disciplina nazionale dei servizi e degli affidamenti.",
  "lameziaAdaptation": "Proporre a Lamezia Multiservizi, ARRICAL e Comune un protocollo con indicatori condivisi di raccolta, conferimento agli impianti, continuità del servizio, qualità dei materiali, costi unitari e allocazione del rischio contrattuale. Usare il Piano d'Ambito rifiuti ARRICAL 2026 per identificare ipotesi di economie di scala e servizi da coordinare; pubblicare confronti documentati tra comuni comparabili senza classificare divergenze come prova di inefficienza o illeciti. Eventuale studio quasi-sperimentale sulle modifiche organizzative realmente realizzate, con controllo per qualità del servizio e differenze territoriali.",
  "implementability": "medio_termine",
  "capacityDataNeeds": [
    "accordi con ARRICAL e gestore nei limiti delle rispettive competenze",
    "registri pubblici o condivisi degli impianti e flussi conferiti per frazione",
    "serie storiche comparabili di tonnellate, costi per tonnellata, tempi di raccolta, interruzioni e recupero effettivo",
    "classificazione delle modifiche organizzative e date di entrata in vigore",
    "indicatori di salute solo aggregati, proporzionati e con adeguata base giuridica",
    "protocollo di confronto con comuni simili e validazione indipendente degli outcome"
  ],
  "tags": [
    "Brasile",
    "consorzi intercomunali",
    "rifiuti urbani",
    "gestione associata",
    "capacità amministrativa",
    "staggered difference-in-differences",
    "Heliyon 2024",
    "qualità della spesa",
    "sanità pubblica",
    "outcome eterogenei",
    "test multipli",
    "ARRICAL",
    "Lamezia Multiservizi"
  ],
  "revisionHistory": [
    {
      "date": "2026-11-04",
      "note": "Primo censimento su articolo Heliyon open access, Tabella 4 e fonti istituzionali brasiliane; mantenuti esplicitamente outcome sanitari negativi/misti, scaling incerto della spesa, non randomizzazione, assenza di correzione nota per test multipli e competenze ARRICAL."
    }
  ]
}
];
