import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_10_05 = [
  {
    id: "mexico-city-pasos-seguros-pedestrian-intersections",
    title: "Pasos Seguros: ridisegno multicomponente degli incroci ad alto rischio",
    authority: "Gobierno de la Ciudad de México / Secretaría de Movilidad",
    territory: "Città del Messico",
    country: "Messico",
    implementationYear: "2015–2017",
    problem:
      "Elevata concentrazione di collisioni con pedoni in intersezioni complesse lungo arterie e strade primarie.",
    measure:
      "Intervento su incroci prioritari mediante attraversamenti pedonali più visibili, ampliamento dei marciapiedi, isole salvagente, riduzione delle corsie, semafori e segnali pedonali, con combinazioni diverse in funzione della geometria dell'intersezione.",
    mechanism:
      "Ridurre distanza e tempo di esposizione dei pedoni, abbassare la velocità e il numero di conflitti veicolo-pedone, rendere più leggibili le traiettorie e concentrare più componenti nei nodi più complessi.",
    population:
      "Pedoni e utenti della strada nelle intersezioni trattate lungo 12 corridoi urbani; la valutazione include 91 intersezioni Pasos Seguros e intersezioni non trattate selezionate come controlli comparabili.",
    primaryArea: "mobilita_spazio_pubblico",
    secondaryAreas: ["salute_pubblica_locale", "sicurezza_urbana_prevenzione"],
    interventionTypes: ["infrastruttura_fisica", "targeting_data_analytics", "modifica_organizzativa_processo"],
    tools: [
      "attraversamenti ad alta visibilità",
      "ampliamento dei marciapiedi",
      "isole salvagente",
      "riduzione delle corsie",
      "semafori e segnali pedonali",
      "prioritizzazione degli incroci a rischio",
    ],
    territorialScale: "Intersezione / corridoi urbani",
    interventionStatus:
      "Programma storico 2015–2017. Il successivo Programma Integral de Seguridad Vial 2021–2024 della SEMOVI documenta 109 incroci già interessati da Pasos Seguros e prosegue una strategia di intervento sugli incroci ad alta sinistrosità, senza assumere continuità integrale del medesimo programma.",
    evaluationMethod:
      "Quasi-esperimento a due gruppi con difference-in-differences. Le 91 intersezioni trattate sono osservate per 12 mesi prima e 12 mesi dopo; le intersezioni di controllo non trattate sono selezionate sulla stessa rete stradale con propensity-score matching e criteri spaziali. Modelli binomiali negativi con random intercept; verifica dell'assunzione di trend paralleli.",
    comparator:
      "Intersezioni non trattate sulla stessa rete viaria, a 100–800 metri dai siti trattati e con stesso limite di velocità, selezionate tramite matching; escluse quelle immediatamente adiacenti per ridurre spillover.",
    outcomes: [
      "collisioni pedone-veicolo complessive",
      "collisioni con pedoni feriti",
      "collisioni mortali con pedoni",
      "collisioni stradali complessive nella sensitivity analysis",
    ],
    results:
      "Le collisioni con pedoni diminuiscono in media del 21% rispetto al controfattuale; la stima è quasi identica per le collisioni con feriti. La riduzione stimata delle collisioni mortali è del 39% ma non statisticamente significativa. La sensitivity analysis sulle collisioni complessive resta coerente con un effetto favorevole.",
    effectSize:
      "Collisioni con pedoni: RR 0,79 (IC95% 0,62–0,99), circa −21%; collisioni con pedoni feriti: RR 0,79 (IC95% 0,62–1,00); collisioni mortali: RR 0,61 (IC95% 0,13–2,92), non significativa; collisioni complessive nella sensitivity analysis: RR 0,86 (IC95% 0,74–0,98).",
    evidenceStrength: "forte",
    costsRequirements:
      "Lo studio non fornisce un costo unitario trasferibile. Servono progettazione geometrica, lavori stradali, segnaletica e impianti semaforici, dati georeferenziati sugli incidenti, manutenzione e capacità di coordinare progettazione, mobilità e sicurezza stradale.",
    limitations: [
      "Solo 12 mesi pre e 12 mesi post per ciascuna intersezione.",
      "La data esatta dei lavori non era registrata in modo completo e viene ricostruita anche tramite immagini storiche Google Street View.",
      "Mancano misure dirette dei volumi pedonali e veicolari; vengono usate proxy nel matching.",
      "I dati non includono gli incidenti lievi non registrati e possono sottorappresentare decessi avvenuti successivamente all'evento.",
      "La stima sulle collisioni mortali è molto imprecisa e non statisticamente significativa.",
    ],
    unintendedEffects:
      "La valutazione non identifica un effetto indesiderato dominante, ma non misura in modo completo redistribuzione del traffico, tempi di percorrenza o possibili spillover su altre intersezioni.",
    primarySource: {
      label: "SEMOVI CDMX — Programa Integral de Seguridad Vial 2021–2024",
      url: "https://www.semovi.cdmx.gob.mx/storage/app/media/PISVI-2021-2024_.pdf",
    },
    evaluationStudies: [
      {
        label: "Journal of Epidemiology and Community Health — Pasos Seguros",
        url: "https://jech.bmj.com/content/77/3/140",
        citation:
          "Cárdenas-Cárdenas LM et al. (2023), One-year impact of a multicomponent, street-level design intervention in Mexico City on pedestrian crashes: a quasi-experimental study, Journal of Epidemiology and Community Health 77(3):140–146",
        doi: "10.1136/jech-2022-219335",
      },
    ],
    lastVerifiedAt: "2026-10-05",
    transferabilityItaly:
      "Alta sul meccanismo e sulla scala d'intervento. Un Comune italiano può intervenire su geometria, attraversamenti, marciapiedi, isole e segnaletica nei limiti delle proprie competenze; la selezione dei siti deve basarsi su sinistrosità e velocità osservate, non su sola percezione.",
    lameziaAdaptation:
      "Costruire un ranking degli incroci di Lamezia usando incidenti geocodificati, feriti, velocità p85, scuole, fermate TPL e flussi pedonali. Selezionare un primo gruppo di 3–5 incroci ad alto rischio e applicare pacchetti multicomponente, mantenendo incroci comparabili per un rollout scaglionato e misurando collisioni, near-miss, velocità e deviazioni del traffico.",
    implementability: "medio_termine",
    capacityDataNeeds: [
      "microdati georeferenziati su incidenti e feriti",
      "velocità e volumi veicolari",
      "conteggi pedonali",
      "geometria degli incroci e attraversamenti",
      "cronologia esatta dei lavori",
      "piano di valutazione predefinito",
    ],
    tags: ["Città del Messico", "Pasos Seguros", "sicurezza stradale", "pedoni", "difference-in-differences"],
    revisionHistory: [
      {
        date: "2026-10-05",
        note:
          "Prima verifica e inserimento; mantenuto esplicitamente il risultato non significativo sulle collisioni mortali e i limiti relativi a date di intervento e volumi di traffico.",
      },
    ],
  },
  {
    id: "glasgow-transformational-regeneration-areas-crime-did",
    title: "Transformational Regeneration Areas: rigenerazione integrata dei grandi complessi residenziali",
    authority: "Glasgow City Council / Transforming Communities Glasgow",
    territory: "Glasgow",
    country: "Regno Unito",
    implementationYear: "Dal 2009; rollout differenziato tra aree",
    problem:
      "Grandi complessi di edilizia sociale caratterizzati da degrado fisico, deprivazione concentrata, scarsa qualità dello spazio pubblico e alti livelli locali di criminalità.",
    measure:
      "Programmi di rigenerazione su otto Transformational Regeneration Areas con demolizione e sostituzione di parte del patrimonio esistente, nuova edilizia a tenure mista e riqualificazione di spazi pubblici, verde e amenities.",
    mechanism:
      "Rimuovere ambienti fisici fortemente degradati, migliorare spazio pubblico e amenities e modificare la struttura residenziale e l'uso degli spazi può ridurre opportunità e concentrazione locale di alcuni reati.",
    population:
      "Residenti e aree circostanti le otto Transformational Regeneration Areas di Glasgow, osservate su dati di criminalità di dettaglio dal 2007 al 2020.",
    primaryArea: "urbanistica_rigenerazione",
    secondaryAreas: ["housing_politiche_abitative", "sicurezza_urbana_prevenzione"],
    interventionTypes: [
      "infrastruttura_fisica",
      "partnership_pubblico_privato_terzo_settore",
      "modifica_organizzativa_processo",
    ],
    tools: [
      "masterplan di rigenerazione",
      "demolizione e nuova costruzione",
      "housing a tenure mista",
      "verde e amenities",
      "partnership tra Comune e soggetti dell'housing",
    ],
    territorialScale: "Quartiere / area di rigenerazione",
    interventionStatus:
      "Programma di rigenerazione pluriennale; Glasgow City Council mantiene una sezione dedicata alle Transformational Regeneration Areas e ai relativi masterplan.",
    evaluationMethod:
      "Quasi-esperimento spaziale con staggered difference-in-differences sul diverso timing di implementazione e sulla distanza dai siti. Stime TWFE affiancate da DiD2S per eterogeneità del trattamento e spillover; panel di criminalità 2007–2020 e robustness checks che escludono l'area immediatamente trasformata.",
    comparator:
      "Anelli territoriali più esterni alle TRA e periodi pre-intervento, con confronti aggiuntivi su aree residenziali non-TRA e specificazioni che escludono il nucleo direttamente demolito/ricostruito.",
    outcomes: [
      "numero di reati nelle immediate vicinanze",
      "furti e altre categorie di reato",
      "crime rate locale",
      "criminalità a livello cittadino",
      "possibili spillover spaziali",
    ],
    results:
      "Le specificazioni standard mostrano riduzioni locali fino al 36% entro 400 metri; la specificazione DiD2S preferita riduce l'effetto a circa 19%, pari a circa 15 reati in meno per sito TRA e anno. I furti calano del 20–31% in prossimità dei siti. Tuttavia non emerge una riduzione della criminalità a livello cittadino: il beneficio resta fortemente localizzato.",
    effectSize:
      "Crime locale entro 400 m: fino a −36% nelle stime TWFE; circa −19% nella specificazione DiD2S principale, ≈15 reati in meno per sito/anno o 19,7 reati per 1.000 residenti. Furti: circa −20/−31% localmente. Effetto aggregato cittadino: nessuna riduzione rilevabile.",
    evidenceStrength: "forte",
    costsRequirements:
      "Intervento strutturale ad alta intensità di capitale, con acquisizione/demolizione o riqualificazione del patrimonio, nuova edilizia, opere di spazio pubblico, gestione dei trasferimenti dei residenti e governance pluriennale.",
    limitations: [
      "Il trattamento è multi-componente e non consente di separare l'effetto di demolizione, nuova edilizia, verde, amenities o cambiamento della composizione residenziale.",
      "Parte della riduzione locale può essere meccanica: la trasformazione elimina o sostituisce fisicamente luoghi nei quali i reati avvenivano.",
      "Gli effetti si attenuano rapidamente con la distanza dal sito e non producono una riduzione osservabile della criminalità cittadina.",
      "La tempistica non è randomizzata; l'identificazione dipende da trend pre-intervento comparabili e dalla strategia spaziale.",
      "Il contesto di grandi housing estates di Glasgow non è direttamente sovrapponibile alla struttura urbana di Lamezia Terme.",
    ],
    unintendedEffects:
      "La mancata riduzione city-wide è compatibile con spostamento o redistribuzione dei reati e con cambiamenti nella composizione dei residenti; qualunque replica deve monitorare displacement, sostituzione sociale e accessibilità abitativa.",
    primarySource: {
      label: "Glasgow City Council — Transforming Communities Glasgow",
      url: "https://www.glasgow.gov.uk/article/2561/Transforming-Communities-Glasgow",
    },
    evaluationStudies: [
      {
        label: "Journal of Economic Geography — Urban regeneration projects and crime",
        url: "https://academic.oup.com/joeg/article/23/6/1273/7288973",
        citation:
          "Borbely D, Rossi G (2023), Urban regeneration projects and crime: evidence from Glasgow, Journal of Economic Geography 23(6):1273–1301",
        doi: "10.1093/jeg/lbad021",
      },
    ],
    lastVerifiedAt: "2026-10-05",
    transferabilityItaly:
      "Media. È trasferibile il principio di valutare la rigenerazione come pacchetto territoriale e di misurare outcome sia nel sito sia nel resto della città; non è trasferibile una logica di demolizione come strumento autonomo di sicurezza.",
    lameziaAdaptation:
      "Usare il caso soprattutto per i futuri progetti di rigenerazione di complessi o ambiti degradati: definire baseline su occupazione degli immobili, servizi, uso dello spazio, segnalazioni e sicurezza; misurare buffer a 200/400/800 metri e l'intero territorio comunale per distinguere miglioramento reale da semplice spostamento. Privilegiare riuso, qualità abitativa e servizi prima di ipotesi demolitive.",
    implementability: "strutturale",
    capacityDataNeeds: [
      "inventario del patrimonio e stato di occupazione",
      "cronologia di cantieri e rilocalizzazioni",
      "microdati territoriali su segnalazioni e sicurezza",
      "indicatori di deprivazione e servizi",
      "monitoraggio di displacement residenziale e criminale",
    ],
    tags: ["Glasgow", "rigenerazione", "housing", "criminalità", "spatial DiD", "spillover"],
    revisionHistory: [
      {
        date: "2026-10-05",
        note:
          "Prima verifica e inserimento; la riduzione locale è registrata insieme al risultato nullo city-wide e al rischio di effetti meccanici o displacement.",
      },
    ],
  },
  {
    id: "barcelona-eixample-green-corridors-public-space-did",
    title: "Eixos verds dell'Eixample: corridoi verdi e nuove piazze nello spazio stradale",
    authority: "Ajuntament de Barcelona",
    territory: "Eixample, Barcellona",
    country: "Spagna",
    implementationYear: "Prima fase implementata dal 2022; valutazione pre 2022 / post 2024",
    problem:
      "Scarsità di spazio verde e di luoghi di permanenza nel tessuto denso dell'Eixample, forte occupazione dello spazio pubblico da parte del traffico e qualità disomogenea dell'ambiente pedonale.",
    measure:
      "Trasformazione di tratti di Consell de Cent, Rocafort, Comte Borrell e Girona in assi verdi e realizzazione di nuove piazze agli incroci, con priorità pedonale, maggiore verde, arredo e ridefinizione dello spazio prima destinato prevalentemente ai veicoli.",
    mechanism:
      "Riallocare superficie stradale a pedoni, verde e permanenza può aumentare naturalità, comfort, manutenzione percepita, sicurezza e qualità ambientale dello spazio pubblico.",
    population:
      "Residenti e utilizzatori degli assi verdi e delle nuove piazze dell'Eixample; la valutazione osserva sezioni stradali trattate e due sezioni di una strada vicina come comparatore.",
    primaryArea: "urbanistica_rigenerazione",
    secondaryAreas: ["mobilita_spazio_pubblico", "ambiente_clima_energia", "salute_pubblica_locale"],
    interventionTypes: ["infrastruttura_fisica", "modifica_organizzativa_processo"],
    tools: [
      "pedonalizzazione e priorità pedonale",
      "nuovo verde urbano",
      "nuove piazze",
      "arredo e ridisegno dello spazio pubblico",
      "riorganizzazione della mobilità locale",
    ],
    territorialScale: "Assi stradali e piazze di quartiere",
    interventionStatus:
      "Prima fase realizzata nell'Eixample; il programma Superilla Barcelona definisce una rete più ampia di eixos verds e piazze, mentre la valutazione 2026 riguarda specificamente gli interventi osservati nel 2022–2024.",
    evaluationMethod:
      "Quasi-esperimento pre/post con gruppo di confronto e difference-in-differences. Qualità dello spazio pubblico misurata nel 2022 e nel 2024 su sezioni trattate e due sezioni di Carrer de València mediante uno strumento ad hoc ispirato a strumenti precedenti.",
    comparator:
      "Due sezioni di Carrer de València, strada vicina con caratteristiche comparabili, osservate negli stessi periodi pre e post.",
    outcomes: [
      "qualità complessiva dello spazio pubblico",
      "aree naturali",
      "manutenzione e pulizia",
      "caratteristiche architettoniche",
      "sicurezza",
      "caratteristiche ambientali",
    ],
    results:
      "Le strade e piazze trattate migliorano significativamente in tutte le dimensioni valutate rispetto al comparatore. Le differenze maggiori riguardano naturalità, manutenzione/pulizia, caratteristiche architettoniche, sicurezza e caratteristiche ambientali. Lo studio non misura direttamente morbilità o mortalità e non consente di tradurre questi punteggi in effetti sanitari.",
    effectSize:
      "Differenze DiD: aree naturali +4,94 punti; manutenzione e pulizia +2,55; caratteristiche architettoniche +2,28; sicurezza +1,61; caratteristiche ambientali +1,00.",
    evidenceStrength: "moderata",
    costsRequirements:
      "Richiede progettazione e opere di spazio pubblico, gestione del traffico, verde e manutenzione continuativa. Lo studio non fornisce un costo per punto di miglioramento trasferibile.",
    limitations: [
      "Lo strumento di valutazione è stato progettato ad hoc e non era ancora validato formalmente.",
      "Diverse componenti della misura si basano su osservazioni con componente soggettiva.",
      "Il gruppo di confronto comprende soltanto due sezioni stradali, con potenza statistica limitata.",
      "Alcune strade avevano già ricevuto miglioramenti urbanistici prima dell'intervento.",
      "Non vengono misurati direttamente outcome di salute, morbilità o mortalità.",
      "La valutazione non copre in modo esaustivo gli spillover di traffico sull'intera rete urbana.",
    ],
    unintendedEffects:
      "Il paper richiama il rischio teorico di redistribuzione di traffico, aria e rumore nelle strade circostanti; nel piccolo comparatore osservato non emerge un peggioramento, ma questo non equivale a escludere spillover a scala più ampia.",
    primarySource: {
      label: "Ajuntament de Barcelona — Superilla Eixample",
      url: "https://ajuntament.barcelona.cat/superilles/es/superilla/eixample",
    },
    evaluationStudies: [
      {
        label: "European Journal of Public Health — Green Corridor evaluation",
        url: "https://academic.oup.com/eurpub/article/doi/10.1093/eurpub/ckag126/8761274",
        citation:
          "Novoa AM et al. (2026), Evaluation of the Barcelona Superblocks 'Green Corridor' project on the quality of public space from a health determinants perspective, European Journal of Public Health 36(5):ckag126",
        doi: "10.1093/eurpub/ckag126",
      },
    ],
    lastVerifiedAt: "2026-10-05",
    transferabilityItaly:
      "Alta per interventi circoscritti di spazio pubblico e mobilità, con la cautela che l'evidenza riguarda qualità urbana osservata e non dimostra direttamente benefici clinici. Il valore trasferibile è il ridisegno integrato e la valutazione con strada comparatrice.",
    lameziaAdaptation:
      "Selezionare un asse centrale di Nicastro o Sambiase dove esistano domanda pedonale, attività di prossimità e deficit di verde/ombra; progettare una prima trasformazione reversibile o per fasi con più verde, ombra, sedute e sicurezza degli attraversamenti. Misurare prima e dopo qualità dello spazio, footfall, traffico, sosta, temperatura superficiale, rumore e spillover su una strada comparabile.",
    implementability: "medio_termine",
    capacityDataNeeds: [
      "rilievo dello spazio pubblico",
      "conteggi pedonali e traffico",
      "sosta e accessibilità commerciale",
      "rumore e temperatura/ombra",
      "indicatori standardizzati di qualità urbana",
      "strada comparatrice e calendario di rollout",
    ],
    tags: ["Barcellona", "Eixample", "Superblocks", "green corridors", "spazio pubblico", "difference-in-differences"],
    revisionHistory: [
      {
        date: "2026-10-05",
        note:
          "Prima verifica e inserimento; i miglioramenti di qualità urbana sono mantenuti separati da outcome sanitari non misurati e dai possibili spillover di rete.",
      },
    ],
  },
] as const satisfies readonly EvidenceIntervention[];
