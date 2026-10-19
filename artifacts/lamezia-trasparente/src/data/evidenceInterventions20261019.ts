import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_10_19 = [
  {
    "id": "germany-municipal-low-emission-zones-cardiovascular-health",
    "title": "Umweltzonen: restrizioni ai veicoli più inquinanti e miglioramenti della salute cardiovascolare",
    "authority": "Amministrazioni locali tedesche (tra cui Berlino, Hannover e Colonia), con autorità ambientali regionali e federali",
    "territory": "Città tedesche con Umweltzonen; prime introduzioni a Berlino, Hannover e Colonia",
    "country": "Germania",
    "implementationYear": "Dal 1° gennaio 2008; successive introduzioni e irrigidimenti scaglionati delle restrizioni",
    "problem": "Superamenti degli standard di qualità dell'aria urbana, esposizione a particolato e ossidi di azoto emessi dai veicoli più inquinanti, con rischi cardiovascolari.",
    "measure": "I comuni e le autorità competenti delimitano zone a basse emissioni e vietano l'accesso ai veicoli non conformi alle classi emissive prescritte; sistema di bollini sul parabrezza, segnaletica, eccezioni e controlli. Berlino ha introdotto la zona nel 2008 e richiesto il bollino verde dal 2010.",
    "mechanism": "Limitare l'accesso e incentivare la sostituzione/adeguamento dei mezzi ad alte emissioni, riducendo l'esposizione a emissioni stradali nocive. Le misure sono prevalentemente regolatorie con enforcement, non una tassa sulla congestione.",
    "population": "Residenti, lavoratori e utenti delle aree urbane coperte. La valutazione sanitaria principale utilizza dati assicurativi ambulatoriali tedeschi, dati sulle dimissioni ospedaliere e osservazioni della qualità dell'aria in città grandi.",
    "primaryArea": "ambiente_clima_energia",
    "secondaryAreas": [
      "salute_pubblica_locale",
      "mobilita_spazio_pubblico"
    ],
    "interventionTypes": [
      "regolazione",
      "enforcement_controllo",
      "informazione_trasparenza"
    ],
    "tools": [
      "zonizzazione con perimetri cartografici",
      "standard di emissione e bollini ambientali",
      "segnaletica e controlli",
      "deroghe ed esenzioni",
      "misure PM10 e NO2",
      "registri sanitari aggregati per valutazione"
    ],
    "territorialScale": "Zone sub-comunali in numerose città; valutazione multi-città",
    "interventionStatus": "Introdotte in numerose città dal 2008; la permanenza e le soglie variano oggi per città. La Umweltzone di Berlino è ancora documentata come operativa dal portale istituzionale.",
    "evaluationMethod": "Quasi-esperimento difference-in-differences/event study con adozione scaglionata delle Umweltzonen in città tedesche: Margaryan (2021) combina stazioni ambientali 2004–2016, dati sanitari ambulatoriali 2009–2017 e ricoveri 2004–2014; controlla effetti fissi, meteo e caratteristiche territoriali. Pestel e Wozny (2021) analizzano separatamente la distribuzione spaziale e temporale delle zone e le diagnosi delle strutture ospedaliere 2006–2016.",
    "comparator": "Aree/città tedesche senza zona nel periodo pertinente o non ancora trattate; confronti prima/dopo a parità di tempo e condizioni, con specificazioni e controlli diversi nei due studi.",
    "outcomes": [
      "concentrazione PM10",
      "concentrazione NO2",
      "numero di pazienti ambulatoriali con diagnosi cardiovascolari",
      "diagnosi cerebrovascolari",
      "ricoveri e composizione delle diagnosi ospedaliere"
    ],
    "results": "Margaryan (2021) stima una diminuzione del numero di pazienti con diagnosi cardiovascolare del 2–3%, specialmente sopra i 65 anni, insieme a una riduzione del PM10. Le riduzioni del NO2 e dei ricoveri cardiovascolari nel suo studio non sono stimate con precisione sufficiente. Un secondo studio (Pestel e Wozny, 2021), con dati ospedalieri e un diverso disegno spaziale, trova una minore quota di diagnosi circolatorie e respiratorie croniche nei nosocomi localizzati dentro le zone, ma il suo outcome è la composizione delle diagnosi ospedaliere, non il rischio individuale di malattia.",
    "effectSize": "Margaryan: pazienti con malattie cardiovascolari −2%/−3% (stima relativa); PM10 mensile circa −0,6/−0,9 µg/m³, pari fino a circa −3% rispetto al livello pre-zona; patologie cerebrovascolari −7%/−12,6% in alcune specificazioni/sottogruppi. Pestel e Wozny: quota di diagnosi ospedaliere per malattie respiratorie croniche inferiori circa −0,16 punti percentuali, a fronte di una quota di riferimento di circa 1%; questa è una variazione di composizione, non un calo dell'incidenza nella popolazione.",
    "evidenceStrength": "forte",
    "costsRequirements": "Richiede valutazione delle fonti emissive, perimetrazione, competenze legali, segnaletica e controlli, amministrazione delle deroghe, comunicazione e alternative di mobilità. Costi distributivi della sostituzione dei veicoli e costi amministrativi non quantificati uniformemente negli studi; non esiste una stima di costo trasferibile a Lamezia.",
    "limitations": [
      "Studi quasi-sperimentali su adozione non casuale; differenze iniziali tra città e modifiche concomitanti dei piani per la qualità dell'aria possono confondere le stime. I DiD con trattamento scaglionato richiedono attenzione anche all'eterogeneità degli effetti nel tempo.",
      "I benefici cardiovascolari di Margaryan sono solidi soprattutto nei dati ambulatoriali; le stime ospedaliere della medesima ricerca non sono statisticamente precise. Non confondere i due esiti.",
      "Il segnale per NO2 è meno robusto del PM10 e non va affermata una riduzione omogenea di tutti gli inquinanti.",
      "Il secondo studio misura la composizione delle diagnosi per ospedale, non la mortalità né direttamente l'incidenza di malattie nella popolazione residente; il bacino di utenza potrebbe modificarsi.",
      "Non è identificato l'effetto isolato su CO2; misure UE nazionali sui veicoli e piani urbani associati possono co-variare con l'istituzione delle zone.",
      "Misure e conseguenze non si trasferiscono automaticamente da grandi città tedesche a una città policentrica con trasporto pubblico e assetto emissivo differenti."
    ],
    "unintendedEffects": "Possibili costi di sostituzione del veicolo e oneri regressivi per famiglie e piccole imprese, restrizioni di accessibilità e deviazioni del traffico verso aree esterne. Gli studi citati non quantificano in modo comparabile tali effetti; richiedono valutazione distributiva e monitoraggio degli spillover.",
    "primarySource": {
      "label": "Land Berlin — Berliner Umweltzone: perimetro, standard e applicazione",
      "url": "https://www.berlin.de/sen/uvk/umwelt/luft/luftreinhaltung/umweltzone/"
    },
    "evaluationStudies": [
      {
        "label": "Journal of Health Economics — studio multi-città sui pazienti cardiovascolari",
        "url": "https://doi.org/10.1016/j.jhealeco.2020.102402",
        "citation": "Margaryan S (2021), Low emission zones and population health, Journal of Health Economics 76:102402",
        "doi": "10.1016/j.jhealeco.2020.102402"
      },
      {
        "label": "Journal of Environmental Economics and Management — dati ospedalieri",
        "url": "https://doi.org/10.1016/j.jeem.2021.102512",
        "citation": "Pestel N, Wozny F (2021), Health effects of Low Emission Zones: Evidence from German hospitals, Journal of Environmental Economics and Management 109:102512",
        "doi": "10.1016/j.jeem.2021.102512"
      },
      {
        "label": "Umweltbundesamt — quadro istituzionale delle Umweltzonen",
        "url": "https://www.umweltbundesamt.de/en/topics/air/particulate-matter-pm10/low-emission-zones-in-germany",
        "citation": "Umweltbundesamt, Low-emission zones in Germany (quadro e caratteristiche del programma)"
      }
    ],
    "lastVerifiedAt": "2026-10-19",
    "transferabilityItaly": "Media come principio regolatorio, non come applicazione immediata. ZTL ambientali e limitazioni locali richiedono competenze normative, proporzionalità, una diagnosi delle sorgenti e alternative modali. La principale lezione è misurare esiti sanitari/ambientali e costi distributivi con dati credibili.",
    "lameziaAdaptation": "Prima di ipotizzare una nuova ZTL ambientale, eseguire una diagnosi delle fonti di PM10/NO2 e mappare scuole, strutture sanitarie e strade ad alta esposizione a Nicastro, Sambiase e Sant'Eufemia. Se il traffico risulta un contributore significativo, valutare misure pilota limitate nello spazio/tempo (riduzione traffico davanti alle scuole, limitazioni mezzi più emissivi con eccezioni) e confrontare qualità dell'aria, flussi, accessibilità e impatti per fascia socioeconomica. Coinvolgere ARPACAL, ASP, Comune e autorità viabilistiche competenti. Non prevedere una riduzione sanitaria del 2–3% per Lamezia senza valutazione locale.",
    "implementability": "strutturale",
    "capacityDataNeeds": [
      "monitoraggi ambientali e centraline ARPACAL con serie storiche",
      "inventario sorgenti emissive e flussi di traffico",
      "dati aggregati sanitari e collaborazione ASP ove consentita",
      "quadro giuridico e competenze sulla viabilità",
      "analisi di accessibilità del TPL",
      "valutazione distributiva e comparatori territoriali",
      "protocollo di qualità dati e audit"
    ],
    "tags": [
      "Germania",
      "Umweltzone",
      "low-emission-zone",
      "PM10",
      "NO2",
      "salute cardiovascolare",
      "difference-in-differences",
      "monitoraggio ambientale",
      "mobilita",
      "politica locale"
    ],
    "revisionHistory": [
      {
        "date": "2026-10-19",
        "note": "Prima verifica delle fonti comunali, federali e dei due studi peer-reviewed; distinguere effetti ambulatoriali, ospedalieri e PM10, senza attribuire stime non dimostrate al singolo Comune."
      }
    ]
  }
] as const satisfies readonly EvidenceIntervention[];
