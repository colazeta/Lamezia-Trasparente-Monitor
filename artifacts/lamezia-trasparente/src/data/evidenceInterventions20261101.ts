import type { EvidenceIntervention } from "./evidenceInterventions";

/** Evaluazione verificata il 1 novembre 2026: CAZ Birmingham, stime ML + controllo sintetico. */
export const EVIDENCE_INTERVENTIONS_2026_11_01: readonly EvidenceIntervention[] = [
  {
    "id": "birmingham-clean-air-zone-2021-no2-nox-synthetic-control",
    "title": "Birmingham: tariffazione dei veicoli più inquinanti nella Clean Air Zone e qualità dell'aria",
    "authority": "Birmingham City Council, su mandato del Governo del Regno Unito",
    "territory": "Birmingham — centro urbano entro la A4540 Middleway (Middleway esclusa)",
    "country": "Regno Unito",
    "implementationYear": "1 giugno 2021 avvio formale; applicazione effettiva dei pagamenti dal 14 giugno 2021; valutazione giugno 2021–maggio 2022",
    "problem": "Concentrazioni di NO₂ da emissioni veicolari superiori agli obiettivi di qualità dell'aria e esposizione ai gas di scarico nei corridoi stradali del centro cittadino.",
    "measure": "Introduzione di una Clean Air Zone (classe D): veicoli non conformi agli standard emissivi possono entrare, ma sono soggetti a un addebito giornaliero; previste esenzioni e misure transitorie. Nessun divieto generale di accesso. La misura è rimasta in funzione dopo il periodo valutato.",
    "mechanism": "Aumento del costo marginale di circolazione dei veicoli più inquinanti e incentivo a usare mezzi meno emissivi, sostituire il veicolo, modificare percorso o modalità di trasporto; il cambiamento del parco veicolare e dei flussi può ridurre le emissioni locali di ossidi di azoto.",
    "population": "Conducenti di veicoli non conformi che entrano nella zona; residenti, lavoratori e utenti delle strade urbane esposti alle emissioni; lo studio misura inquinanti nelle stazioni, non outcome clinici individuali.",
    "primaryArea": "ambiente_clima_energia",
    "secondaryAreas": [
      "mobilita_spazio_pubblico",
      "salute_pubblica_locale",
      "capacita_amministrativa_personale"
    ],
    "interventionTypes": [
      "regolazione",
      "incentivo_economico",
      "enforcement_controllo",
      "targeting_data_analytics",
      "informazione_trasparenza"
    ],
    "tools": [
      "perimetro urbano definito e standard emissivi per classe di veicolo",
      "tariffe giornaliere differenziate ed esenzioni",
      "segnaletica e controlli amministrativi degli accessi",
      "monitoraggi orari di NO₂, NOₓ e PM₂,₅",
      "normalizzazione meteo random forest e augmented synthetic control per la valutazione"
    ],
    "territorialScale": "Centro urbano e corridoi stradali interni/esterni alla zona; monitoraggio anche su siti di fondo urbano.",
    "interventionStatus": "Attuata dal 2021; il Comune documenta l'operatività della CAZ, mentre lo studio qui citato valuta soltanto il primo anno dopo l'introduzione.",
    "evaluationMethod": "Quasi-esperimento con normalizzazione meteorologica tramite random forest e augmented synthetic control method (ridge ASCM), costruito con concentrazioni orarie (poi aggregate) da 39 stazioni del Regno Unito tra gennaio 2021 e maggio 2022; osservazioni di otto siti a Birmingham, confrontate con siti comparabili di altre città senza CAZ nel periodo.",
    "comparator": "Serie temporali sintetiche controfattuali per ciascuna stazione di Birmingham, ottenute ponderando siti di controllo di altre città britanniche, in assenza di una CAZ comparabile; non assegnazione casuale dei veicoli o delle aree.",
    "outcomes": [
      "concentrazione di NO₂ ai bordi strada e nei siti di fondo urbano",
      "concentrazione di NOₓ ai bordi strada",
      "concentrazione di PM₂,₅ in tre stazioni disponibili",
      "differenze tra stazioni dentro e fuori la zona; possibili spillover",
      "esiti sanitari, distribuzione del costo e benefici netti non misurati causalmente"
    ],
    "results": "Nel primo anno, la CAZ ha determinato riduzioni statisticamente significative ma modeste di NO₂ e NOₓ soprattutto presso alcune stazioni stradali interne alla zona e, per alcuni siti stradali, esterne. La significatività è più chiara nei primi sette mesi; non sono stati identificati miglioramenti significativi per PM₂,₅ o per le stazioni di fondo urbano fuori dalla CAZ. Le stime sono effetti di sito, non una riduzione uniforme nell'intera città.",
    "effectSize": "Riduzioni massime stimate ai siti stradali interni: NO₂ fino a −3,4%, NOₓ fino a −5,4%; ai siti stradali esterni: NO₂ fino a −6,6%, NOₓ fino a −11,9% nel primo anno. Non si osserva un effetto statisticamente significativo su PM₂,₅. Sono variazioni relative nelle concentrazioni rispetto al controllo sintetico, NON riduzioni in punti percentuali né riduzioni di patologie.",
    "evidenceStrength": "moderata",
    "costsRequirements": "La tariffa storica indicata nello studio era di 8 GBP al giorno per auto/furgoni non conformi e 50 GBP per autobus/mezzi pesanti non conformi, con esenzioni; sono costi a carico di categorie di utenti, non il costo di attuazione complessivo. Richiesti perimetrazione, segnaletica, controlli, gestione pagamenti ed esenzioni, monitoraggi ambientali antecedenti e successivi. L'articolo non stima il costo-beneficio netto dell'intervento.",
    "limitations": [
      "Studio non randomizzato, con pre-periodo di soli circa cinque mesi (gennaio–maggio 2021) e periodo fortemente influenzato dalle variazioni delle restrizioni pandemiche; la normalizzazione meteo e il controllo sintetico riducono ma non eliminano questi rischi.",
      "Otto punti di misura in Birmingham, con copertura più limitata per PM₂,₅ e per il fondo urbano; risultati puntuali non rappresentativi di tutte le strade o di tutta l'esposizione della popolazione.",
      "Effetti più marcati nel 2021 e parziale attenuazione/rimbalzo nel 2022 in alcune località; non dimostrati gli effetti pluriennali.",
      "Il PM₂,₅ non presenta riduzioni statisticamente rilevabili; nessuna valutazione causale su mortalità, salute individuale o spesa sanitaria.",
      "Il paper esamina una CAZ britannica e non attribuisce separatamente l'effetto a tariffa, esenzioni, cambiamenti della flotta o altri interventi.",
      "Non si identifica una riduzione dei costi sociali maggiore del costo amministrativo, né una convenienza finanziaria del sistema di pedaggio."
    ],
    "unintendedEffects": "Lo studio non documenta aumenti significativi di NO₂ ai siti esterni monitorati, ma la copertura è incompleta e non esclude spostamenti del traffico altrove. Rischio distributivo plausibile: oneri relativamente elevati per persone con auto vecchie e minore capacità economica; lo studio non quantifica tale impatto né effetti sulle attività commerciali.",
    "primarySource": {
      "label": "Birmingham City Council / Brum Breathes — Charging Order ufficiale 2021",
      "url": "https://www.brumbreathes.co.uk/info/32/charges-operation/35/clean-air-zone-charging-order"
    },
    "evaluationStudies": [
      {
        "label": "Environmental and Resource Economics — articolo originale open access",
        "url": "https://doi.org/10.1007/s10640-023-00794-2",
        "citation": "Liu, B., Bryson, J. R., Sevinc, D., Cole, M., Elliott, R. J. R., Bartington, S. E., Bloss, W. J. e Shi, Z. (2023), Assessing the Impacts of Birmingham's Clean Air Zone on Air Quality: Estimates from a Machine Learning and Synthetic Control Approach, Environmental and Resource Economics, 86, 203–231.",
        "doi": "10.1007/s10640-023-00794-2"
      }
    ],
    "lastVerifiedAt": "2026-11-01",
    "transferabilityItaly": "Trasferibile soprattutto il metodo di diagnosi, monitoraggio e valutazione causale delle emissioni e delle misure di traffico. La tariffa britannica non è replicabile automaticamente: il Comune italiano deve svolgere un'istruttoria sulle proprie competenze ai sensi dell'art. 7 del Codice della strada, sui provvedimenti/criteri e autorizzazioni applicabili, su proporzionalità, alternative di mobilità ed equità. Non vi sono evidenze qui che giustifichino l'introduzione immediata di una zona tariffata a Lamezia.",
    "lameziaAdaptation": "Integrazione nel nuovo Piano Generale del Traffico Urbano: chiedere ad ARPACAL dati e copertura dei punti di monitoraggio di NO₂ e PM₂,₅, selezionare assi stradali trafficati da analizzare e stimare l'esposizione e i flussi prima di proporre misure. Valutare interventi meno onerosi, con eventuale introduzione per fasi, misurando in parallelo qualità dell'aria in siti stradali e di fondo, volume/composizione del traffico, accessibilità, incidenza su lavoratori/commercianti e gruppi vulnerabili. Nessun automatismo per nuove tariffe o restrizioni.",
    "implementability": "strutturale",
    "capacityDataNeeds": [
      "dati georeferenziati qualità dell'aria ARPACAL e copertura dei monitor esistenti",
      "rilevazioni di traffico, categorie di veicoli ed emissioni per asse stradale",
      "dataset meteo e serie storiche antecedenti a qualunque policy",
      "siti di controllo idonei e protocollo causale preregistrato",
      "istruttoria giuridica su art. 7 Codice della strada e riparto competenze",
      "analisi impatti distributivi e alternative di trasporto pubblico",
      "stima costi di istituzione e gestione, monitoraggio di NO₂, NOₓ, PM₂,₅ e spostamenti di traffico"
    ],
    "tags": [
      "Birmingham",
      "Regno Unito",
      "clean air zone",
      "emissioni stradali",
      "NO2",
      "NOx",
      "PM2.5",
      "augmented synthetic control",
      "normalizzazione meteorologica",
      "politica urbana",
      "equità",
      "valutazione quasi-sperimentale"
    ],
    "revisionHistory": [
      {
        "date": "2026-11-01",
        "note": "Inserimento dopo verifica diretta dell'ordinanza/annuncio municipale, dello studio originale open access e della distinzione fra effetti di sito, assenza di effetto su PM₂,₅, periodo Covid, incertezza causale e limiti italiani."
      }
    ]
  }
];
