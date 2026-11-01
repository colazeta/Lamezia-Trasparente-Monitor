import type { EvidenceIntervention } from "./evidenceInterventions";

/** Madrid Central, EvAU and NO2, academic and city sources checked 2026-11-01. */
export const EVIDENCE_INTERVENTIONS_2026_11_01_MADRID: readonly EvidenceIntervention[] = [
  {
  "id": "madrid-central-lez-2018-evau-scores-did-2025",
  "title": "Madrid Central: zona a basse emissioni, riduzione di NO₂ e miglioramento dei risultati scolastici EvAU",
  "authority": "Ayuntamiento de Madrid (Municipio di Madrid), nell'ambito del Plan A; successiva disciplina Madrid 360",
  "territory": "Distretto Centro di Madrid, Spagna; area originaria di 4,72 km² e scuole superiori del municipio",
  "country": "Spagna",
  "implementationYear": "30 novembre 2018 (restrizioni avviate); sanzioni dal 16 marzo 2019; valutazione 2015–2022; disciplina successiva Madrid 360 dal 2021",
  "problem": "Inquinamento atmosferico da traffico nel centro cittadino e potenziali ripercussioni sulla salute e sull'apprendimento degli studenti; necessità di ridurre le emissioni e il traffico di attraversamento.",
  "measure": "Il Comune ha introdotto Madrid Central, una zona urbana a basse emissioni con limiti all'accesso e al traffico di attraversamento in base alla categoria ambientale dei veicoli, con esenzioni e controlli. Il perimetro originale comprendeva 472 ettari; la disciplina è cambiata nel 2021 con Madrid 360, pur mantenendo le principali limitazioni nel Distretto Centro.",
  "mechanism": "Limitare l'accesso dei veicoli più inquinanti e ridurre il traffico di attraversamento può diminuire l'esposizione a NO₂. La riduzione dell'esposizione potrebbe favorire l'apprendimento e la performance negli esami; sono plausibili anche canali alternativi tramite rumore, stress e mobilità. Lo studio non identifica separatamente tali meccanismi.",
  "population": "Residenti, automobilisti, persone che frequentano il centro; valutazione educativa basata su 261 istituti superiori che offrivano Bachillerato, dei quali solo 10 entro la zona e 251 all'esterno. L'outcome è la media per scuola degli esami EvAU, non il risultato individuale di ogni studente.",
  "primaryArea": "ambiente_clima_energia",
  "secondaryAreas": [
    "istruzione_giovani",
    "mobilita_spazio_pubblico",
    "salute_pubblica_locale",
    "capacita_amministrativa_personale"
  ],
  "interventionTypes": [
    "regolazione",
    "enforcement_controllo",
    "infrastruttura_digitale",
    "targeting_data_analytics",
    "informazione_trasparenza"
  ],
  "tools": [
    "delimitazione di una zona a traffico limitato in base alle classi di emissione",
    "regole di accesso ed esenzioni, comunicazione e controlli",
    "serie storiche giornaliere NO₂ delle centraline cittadine",
    "risultati medi EvAU per istituto e anno",
    "valutazione difference-in-differences, event study e synthetic difference-in-differences"
  ],
  "territorialScale": "Zona urbana centrale di 4,72 km² all'interno di una grande città; effetti comparati con scuole e centraline collocate in altre aree della stessa città.",
  "interventionStatus": "Intervento originale attuato dal 2018, con modifiche amministrative e giudiziarie; dal settembre 2021 sostituito/ricondotto a Madrid 360. I risultati quantitativi riportati riguardano esclusivamente il 2019–2022; l'attuale regime esatto e gli effetti nel 2026 non sono inferiti dallo studio.",
  "evaluationMethod": "Esperimento naturale non randomizzato con difference-in-differences (effetti fissi di scuola e anno, controlli socioeconomici distrettuali variabili nel tempo, medie EvAU standardizzate e pesate) su 2015–2022; 10 scuole trattate e 251 di confronto, test dei pre-trend, event study, wild-bootstrap, synthetic DiD. Per NO₂: una centralina dentro e 23 all'esterno, con confronto territoriale e temporale.",
  "comparator": "Per EvAU, 251 scuole superiori fuori dal Distretto Centro rispetto alle 10 all'interno, prima (2015–2018) e dopo (2019–2022). Per NO₂, media osservata nella stazione Plaza del Carmen nel centro rispetto a 23 stazioni esterne. Le scuole non sono state assegnate casualmente; trend paralleli e assenza di shock locali differenziali restano ipotesi identificative.",
  "outcomes": [
    "concentrazione annuale NO₂ in µg/m³, nelle stazioni monitorate",
    "media scolastica della fase generale EvAU, standardizzata entro anno",
    "punteggio medio EvAU nella scala originaria 0–10",
    "eterogeneità temporale per durata di esposizione e differenze vicino al perimetro",
    "effetti su spesa commerciale, traffico spostato, salute clinica e costi complessivi non identificati da questa valutazione"
  ],
  "results": "Nella specificazione preferita lo studio rileva una riduzione media di NO₂ di 5,94 µg/m³ nella stazione dentro la zona rispetto alle altre 23, durante i quattro anni successivi. Le 10 scuole dentro la zona mostrano un aumento medio della performance EvAU di 0,198 deviazioni standard rispetto alle 251 esterne, equivalente a 0,157 punti sulla scala 0–10. Risultati coerenti con vari controlli di robustezza inclusi wild bootstrap e synthetic DiD; nel raggio di 0,5 km l'effetto spillover scolastico è solo marginalmente significativo (p≤0,10), e non permane nel buffer a 1 km.",
  "effectSize": "NO₂: −5,94 µg/m³ (p<0,001) media 2019–2022 rispetto al controfattuale DiD; nell'anno 2019 −6,7 µg/m³; nel 2022 −5,1 µg/m³. EvAU: +0,198 deviazioni standard (p≤0,001) e +0,157 punti nella scala 0–10 (p≤0,05); specificazioni: trend lineare +0,119 SD, synthetic DiD +0,291 SD (p≤0,05). Buffer ≤0,5 km +0,064 SD (p≤0,10); 1 km +0,002 SD, non significativo. Le stime non sono aumenti percentuali di promossi né risultati individuali.",
  "evidenceStrength": "moderata",
  "costsRequirements": "Necessari diagnosi delle emissioni e flussi, base giuridica e ordinanze comunali competenti, segnaletica, gestione di deroghe, enforcement e sistema di valutazione di qualità dell'aria; raccolta e linkage di risultati educativi aggregati. L'articolo non misura il costo municipale complessivo né il rapporto costi-benefici o gli oneri distributivi.",
  "limitations": [
    "Solo 10 scuole direttamente trattate e una stazione NO₂ entro il perimetro; il piccolo numero di cluster trattati riduce la precisione e la generalizzabilità anche se sono presentati wild bootstrap e synthetic DiD.",
    "Disegno non randomizzato: potenziale selezione scolastica, mutamenti di composizione e politiche concomitanti; test pre-trend e controlli aiutano ma non dimostrano il controfattuale.",
    "Periodo post-trattamento attraversato dal COVID-19, che ha alterato traffico, lezioni ed esami; gli autori eseguono una specificazione senza il 2020, ma residuano rischi di confondimento.",
    "Gli outcome scolastici sono medie per istituto; mancano la residenza e le caratteristiche individuali degli studenti e non è isolato il contributo di qualità dell'aria rispetto a rumore, stress o traffico.",
    "Le regole della zona hanno subito cambiamenti legali e amministrativi dal 2018 al 2021; il trattamento è un pacchetto di politiche, non un singolo requisito semplice.",
    "Le stime economiche, distributive e sanitarie complessive e la persistenza oltre il 2022 non sono identificate."
  ],
  "unintendedEffects": "Possibili costi per residenti e pendolari con mezzi più vecchi, effetti su accessibilità per persone vulnerabili e redistribuzione del traffico. Uno studio correlato su Madrid Central (Galdón-Sánchez et al., JEEA 2023, DOI 10.1093/jeea/jvac064) riporta effetti negativi sulla spesa commerciale nell'area; il paper EvAU non li quantifica, quindi l'archivio non sostiene un beneficio netto complessivo.",
  "primarySource": {
    "label": "Ayuntamiento de Madrid — Madrid Central entra en vigor (30 novembre 2018)",
    "url": "https://diario.madrid.es/blog/notas-de-prensa/madrid-central-entra-en-vigor/"
  },
  "evaluationStudies": [
    {
      "label": "Population and Environment — studio peer-reviewed originale open access",
      "url": "https://doi.org/10.1007/s11111-025-00477-8",
      "citation": "Valdés, M. T., Espadafor, M. C. e Conte Keivabu, R. (2025), Can a low emission zone improve academic performance? Evidence from a natural experiment in the city of Madrid, Population and Environment, 47, article 8.",
      "doi": "10.1007/s11111-025-00477-8"
    }
  ],
  "lastVerifiedAt": "2026-11-01",
  "transferabilityItaly": "Trasferibile soprattutto il principio di integrare nel PGTU la valutazione di qualità dell'aria, sicurezza/mobilità e condizioni attorno alle scuole, anche come outcome educativi secondari. La ZBE madrilena non è automaticamente replicabile a Lamezia: servono diagnosi locale, verifica di competenze, Codice della strada e disciplina ZTL, alternative di mobilità, esenzioni e analisi d'equità.",
  "lameziaAdaptation": "Collegare il nuovo Piano Generale del Traffico Urbano di Lamezia a una ricognizione dei flussi e dell'esposizione presso plessi scolastici e principali corridoi (Nicastro, Sambiase, Sant'Eufemia). Con Comune, scuole, ARPACAL e autorità competenti, definire misure proporzionate di riduzione del traffico presso 3–5 aree scolastiche (orari, moderazione velocità, accessi e mobilità pedonale) senza assumere come necessaria una ZTL con pedaggio. Registrare prima/dopo NO₂, flussi, rumore, sicurezza; pianificare comparatori e monitorare eventuali esiti educativi soltanto se disponibilità di dati aggregati e base giuridica lo consentono. Separare indicatori ambientali dagli esiti scolastici, che richiedono più anni.",
  "implementability": "medio_termine",
  "capacityDataNeeds": [
    "cartografia degli accessi e delle scuole e dati PGTU",
    "serie storiche omogenee su traffico, NO₂ e rumore con ARPACAL e/o monitoraggi integrativi",
    "dati sulla mobilità casa-scuola e alternative accessibili",
    "disegno di confronto ex ante, calendario dell'implementazione e analisi degli shock concomitanti",
    "eventuali statistiche scolastiche aggregate e gestione della privacy",
    "stima costi, oneri distributivi, tempi e responsabilità istituzionali"
  ],
  "tags": [
    "Madrid Central",
    "zone a basse emissioni",
    "NO2",
    "EvAU",
    "istruzione",
    "mobilità urbana",
    "difference-in-differences",
    "synthetic DiD",
    "PGTU",
    "outcome ambientali",
    "trade-off"
  ],
  "revisionHistory": [
    {
      "date": "2026-11-01",
      "note": "Primo inserimento dopo discovery con Parallel Search, verifica del testo integrale peer-reviewed e della fonte comunale; qualificati il numero limitato di scuole, i confondenti, le significatività degli spillover e i potenziali costi commerciali."
    }
  ]
}
];
