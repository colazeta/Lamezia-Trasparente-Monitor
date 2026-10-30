import type { EvidenceIntervention } from "./evidenceInterventions";

/** Original evaluations and institutional implementation verified 2026-10-30. */
export const EVIDENCE_INTERVENTIONS_2026_10_30_GERMANY: readonly EvidenceIntervention[] = [
{
  "id": "germany-urban-low-emission-zones-cardiovascular-health-did",
  "title": "Città tedesche: zone urbane a basse emissioni e riduzione dei problemi cardiovascolari",
  "authority": "Amministrazioni cittadine e autorità competenti in Germania; prime zone a Berlino, Hannover e Colonia, nel quadro normativo federale",
  "territory": "Numerose città tedesche, tra cui Berlino, Hannover e Colonia; confronto nazionale tra aree interessate e non interessate",
  "country": "Germania",
  "implementationYear": "Prime Umweltzonen dal 1 gennaio 2008; adozione e irrigidimento graduali in città diverse negli anni successivi; dati valutati fino al 2017",
  "problem": "Esposizione della popolazione urbana a particolato e altri inquinanti prodotti dal traffico, superamenti dei limiti europei sulla qualità dell'aria e possibili conseguenze cardiovascolari.",
  "measure": "Introduzione, in fasi e in aree urbane delimitate, di restrizioni all'accesso per veicoli con classi emissive più inquinanti. Le Umweltzonen sono segnalate; l'accesso richiede un contrassegno coerente con la classe emissiva, con eccezioni previste dalla disciplina tedesca.",
  "mechanism": "Limitare la circolazione dei veicoli più inquinanti all'interno delle zone e favorire l'adeguamento del parco veicolare; ridurre l'esposizione urbana a particolato da traffico e, potenzialmente, le manifestazioni di patologie cardiovascolari.",
  "population": "Residenti delle città tedesche, con particolare interesse per persone anziane e soggetti vulnerabili. La valutazione impiega registri sanitari, non il solo campione di automobilisti in possesso del contrassegno.",
  "primaryArea": "salute_pubblica_locale",
  "secondaryAreas": [
    "mobilita_spazio_pubblico",
    "ambiente_clima_energia",
    "capacita_amministrativa_personale"
  ],
  "interventionTypes": [
    "regolazione",
    "enforcement_controllo",
    "targeting_data_analytics"
  ],
  "tools": [
    "perimetrazione e segnaletica delle Umweltzonen",
    "classificazione emissiva e contrassegni per i veicoli",
    "divieti con esenzioni e vigilanza",
    "monitoraggio delle centraline PM10/NO2",
    "registri amministrativi sanitari e composizione del parco veicolare"
  ],
  "territorialScale": "Aree delimitate delle città, con valutazione comparativa fra località e periodi di attivazione differenti.",
  "interventionStatus": "Politiche introdotte dal 2008 e gradualmente modificate; non è verificata la permanenza nel 2026 di ogni singola zona analizzata nel campione storico. L'Umweltbundesamt segnala che l'efficacia marginale dell'attuale sistema di contrassegni è diminuita al mutare del parco circolante.",
  "evaluationMethod": "Esperimento naturale non randomizzato con differenze-nelle-differenze su introduzione scaglionata delle LEZ in città sopra 100.000 abitanti e variazioni nel tempo/territorio. Margaryan (2021) usa misurazioni di PM10 e NO2 (2004–2016), dati di pazienti ambulatoriali assicurati nel sistema pubblico (2009–2017) e ricoveri (2004–2014), controlli temporali/territoriali, event studies, placebo e robustness checks. Sarmiento et al. (2023) applicano DID per adozioni scaglionate robusti all'eterogeneità degli effetti e valutano anche benessere soggettivo e spillover.",
  "comparator": "Città/aree non ancora interessate o non interessate dalle restrizioni negli stessi periodi, e misure delle medesime aree prima dell'introduzione; il confronto non deriva da randomizzazione e può risentire di politiche urbane concomitanti.",
  "outcomes": [
    "concentrazione media mensile PM10",
    "concentrazione di NO2",
    "numero di pazienti con diagnosi cardiovascolari ambulatoriali",
    "diagnosi cerebrovascolari e ricoveri",
    "composizione emissiva del parco auto",
    "ozono, spillover spaziali e soddisfazione di vita in valutazioni successive"
  ],
  "results": "Margaryan (2021) trova un calo del PM10 e del numero di pazienti con diagnosi cardiovascolari nelle aree trattate, con benefici più evidenti tra gli anziani; il NO2 e le stime sui ricoveri sono meno robusti. Sarmiento, Wägner e Zaklan (2023) confermano benefici su inquinanti legati al traffico ma segnalano incremento dell'ozono al suolo, spostamenti spaziali dell'inquinamento e riduzioni della soddisfazione di vita. Non è stimato un beneficio netto universale né un effetto causale identico per ogni città.",
  "effectSize": "Margaryan (2021): PM10 medio mensile circa −0,9 µg/m³, equivalente a circa −3% (stima sintetica 2–3%); numero di pazienti ambulatoriali con diagnosi cardiovascolari −2%/−3% rispetto al controfattuale DID. In sottogruppi di patologie cerebrovascolari le stime sono più elevate (circa 7–12,6%), non generalizzabili alla totalità delle diagnosi; NO2: diminuzioni più piccole e frequentemente non significative. I valori sono variazioni relative, non punti percentuali di prevalenza.",
  "evidenceStrength": "forte",
  "costsRequirements": "Occorrono basi giuridiche per limitare la circolazione, rilevazioni locali affidabili, classificazione del parco veicolare, segnaletica, controlli, esenzioni, alternative di trasporto e valutazione delle ripercussioni economiche. Non emerge dallo studio una stima trasferibile di costo per caso cardiovascolare evitato né un bilancio costi-benefici netto per una città italiana.",
  "limitations": [
    "Adozione territoriale e temporale non randomizzata; condizioni iniziali, altre politiche urbane e trend differenziati possono influenzare le stime nonostante i controlli ed event studies.",
    "Il DID storico precede parte della letteratura sui possibili bias in disegni staggered con effetti eterogenei; la ricerca successiva considera metodi robusti ma non replica necessariamente lo stesso outcome sanitario.",
    "Le stime di salute riguardano il numero registrato di pazienti con diagnosi, non un trial clinico individuale e non un'identificazione separata di ogni fonte emissiva.",
    "I risultati su NO2 e ricoveri sono meno precisi; i benefici differiscono per età e sottotipo patologico.",
    "Il parco veicolare tedesco 2008–2017 e il suo adeguamento differiscono dalla composizione attuale e da quello di Lamezia; l'Umweltbundesamt rileva una diminuzione del potenziale marginale delle restrizioni tradizionali.",
    "Non sono quantificati nello studio principale tutti i costi di compliance, gli effetti distributivi, le deviazioni di traffico e gli effetti su mobilità e attività economiche."
  ],
  "unintendedEffects": "Una successiva valutazione pubblicata nel 2023 individua aumenti dell'ozono al suolo, spillover spaziali di inquinamento e riduzioni della soddisfazione di vita dopo l'introduzione delle zone. Possibili costi di adeguamento dei veicoli per famiglie e imprese e spostamenti del traffico verso quartieri limitrofi; non attribuire a questi risultati una quantificazione monetaria non documentata.",
  "primarySource": {
    "label": "Ministero federale tedesco dell'ambiente — Umweltplakette und Umweltzone (disciplina e attuazione)",
    "url": "https://www.bundesumweltministerium.de/themen/luft/umweltzonen-und-umweltplakette"
  },
  "evaluationStudies": [
    {
      "label": "Journal of Health Economics — valutazione principale di salute e qualità dell'aria",
      "url": "https://doi.org/10.1016/j.jhealeco.2020.102402",
      "citation": "Margaryan, S. (2021), Low emission zones and population health, Journal of Health Economics, 76, 102402.",
      "doi": "10.1016/j.jhealeco.2020.102402"
    },
    {
      "label": "Journal of Public Economics — risultati complementari su inquinamento e benessere soggettivo",
      "url": "https://doi.org/10.1016/j.jpubeco.2023.105014",
      "citation": "Sarmiento, L., Wägner, N. e Zaklan, A. (2023), The air quality and well-being effects of low emission zones, Journal of Public Economics, 227, 105014.",
      "doi": "10.1016/j.jpubeco.2023.105014"
    }
  ],
  "lastVerifiedAt": "2026-10-30",
  "transferabilityItaly": "È trasferibile il metodo di valutazione integrata (dati di mobilità, emissioni, effetti sulla salute, distribuzione di costi e impatti). L'istituzione di nuove restrizioni di accesso richiederebbe uno specifico esame delle competenze nel Codice della strada, dei piani regionali per la qualità dell'aria, delle esigenze di mobilità, del principio di proporzionalità e degli effetti su famiglie e imprese. Non equiparare automaticamente Umweltzone tedesca a una ZTL italiana.",
  "lameziaAdaptation": "Integrare nella preparazione del PGTU di Lamezia una baseline di PM10/NO2 con ARPACAL, dati di traffico, distribuzione delle classi Euro del parco veicolare e individuazione delle aree di esposizione sensibile (scuole, ospedali). Prima di proporre una zona a basse emissioni, testare fattibilità e alternative meno restrittive (gestione sosta, percorsi bus, logistica merci, mitigazione dei punti critici). Predisporre una valutazione ex ante della distribuzione dei costi e, per eventuali misure introdotte per fasi, una strategia di confronto con aree simili e monitoraggio degli effetti/possibili spostamenti.",
  "implementability": "strutturale",
  "capacityDataNeeds": [
    "serie storiche georeferenziate PM10 e NO2 e qualità delle centraline ARPACAL",
    "flussi, velocità e provenienza del traffico, inclusa la logistica merci",
    "composizione per classe emissiva del parco circolante",
    "identificazione delle aree vulnerabili e alternative di trasporto pubblico",
    "verifica della ripartizione di competenze tra Comune, Regione e gestori stradali",
    "studio di impatto distributivo ed economico per cittadini e attività",
    "protocollo di valutazione con comparatori, dati pubblici e monitoraggio possibili spillover"
  ],
  "tags": [
    "Germania",
    "Berlino",
    "Hannover",
    "Colonia",
    "Umweltzone",
    "LEZ",
    "basse emissioni",
    "salute cardiovascolare",
    "PM10",
    "NO2",
    "difference-in-differences",
    "anziani",
    "air quality",
    "PGTU",
    "mobilità sostenibile"
  ],
  "revisionHistory": [
    {
      "date": "2026-10-30",
      "note": "Nuovo record verificato direttamente su studio principale peer-reviewed di Margaryan (2021), studio successivo Sarmiento et al. (2023), fonte primaria del ministero tedesco e Umweltbundesamt. Distinti PM10 da NO2, ambulatoriali da ricoveri, beneficio sanitario e costi/spillover; nessuna proposta di istituire subito una LEZ a Lamezia."
    }
  ]
}
];
