import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_09_24 = [
  {
    id: "san-francisco-1994-rent-control-expansion",
    title: "Estensione del rent control agli edifici multifamiliari piccoli",
    authority: "City and County of San Francisco / San Francisco Rent Board",
    territory: "San Francisco, California",
    country: "Stati Uniti",
    implementationYear: "1994 (Proposition I; nuove unità coperte dal 22 dicembre 1994)",
    problem:
      "Rischio di forti aumenti dei canoni e di displacement degli inquilini già residenti in piccoli edifici multifamiliari che, fino al 1994, erano in parte esclusi dalle protezioni del Rent Ordinance.",
    measure:
      "Proposition I estese le protezioni del Rent Ordinance a unità precedentemente esenti in edifici con quattro unità o meno quando ricorrevano le condizioni previste dalla precedente owner-occupancy exemption. La riforma creò una discontinuità quasi-sperimentale tra piccoli edifici pre-1980 divenuti soggetti al rent control e immobili comparabili costruiti successivamente, rimasti fuori dal trattamento studiato.",
    mechanism:
      "Limitare la crescita del canone per gli inquilini incumbent e rafforzarne la stabilità abitativa dovrebbe ridurre gli incentivi economici a lasciare l'alloggio. Al tempo stesso, la regolazione modifica gli incentivi dei proprietari, che possono reagire convertendo, vendendo o riqualificando lo stock regolato.",
    population:
      "Inquilini e proprietari di piccoli edifici multifamiliari di San Francisco interessati dall'estensione del 1994; la valutazione segue individui e proprietà nel tempo sfruttando l'assegnazione normativa basata sull'età dell'edificio.",
    primaryArea: "housing_politiche_abitative",
    secondaryAreas: ["urbanistica_rigenerazione", "welfare_inclusione_servizi_sociali"],
    interventionTypes: ["regolazione", "informazione_trasparenza"],
    tools: [
      "limiti agli aumenti del canone nelle unità coperte",
      "protezioni previste dal Rent Ordinance",
      "registro e procedure del Rent Board",
      "regole di copertura definite per caratteristiche dell'immobile",
    ],
    territorialScale: "Cittadina, su una sottopopolazione di unità abitative private",
    interventionStatus:
      "La riforma del 1994 è storica ma il Rent Ordinance resta operativo. Il Rent Board continua nel 2026 a gestire le unità coperte, l'inventario abitativo e le regole sugli aumenti consentiti; il record riguarda l'effetto causale dell'estensione del 1994, non ogni successiva modifica normativa.",
    evaluationMethod:
      "Quasi-esperimento basato sull'inaspettata estensione del 1994: difference-in-differences/event-study su microdati di residenti e proprietà, confrontando piccoli edifici resi soggetti al rent control con immobili simili non coperti in funzione dell'anno di costruzione. Gli autori integrano inoltre le stime reduced-form con un modello strutturale per quantificare alcuni effetti di equilibrio generale.",
    comparator:
      "Inquilini e proprietà in piccoli edifici comparabili che, per l'anno di costruzione, non entrarono nel rent control con Proposition I.",
    outcomes: [
      "mobilità degli inquilini",
      "displacement da San Francisco",
      "offerta di alloggi in locazione",
      "conversioni/vendite e riqualificazioni da parte dei proprietari",
      "canoni di mercato a livello cittadino modellati",
    ],
    results:
      "L'estensione riduce la mobilità degli inquilini coperti di circa il 20% e diminuisce il displacement dalla città, documentando un beneficio sostanziale per gli incumbent. La stessa riforma induce però i proprietari a ridurre l'offerta di housing in locazione di circa il 15%, soprattutto tramite vendita a owner-occupiers e redevelopment. Il modello strutturale degli autori attribuisce alla contrazione dell'offerta una crescita di circa il 5,1% dei canoni cittadini nel lungo periodo. Il caso è quindi registrato come intervento con beneficio distributivo mirato ma importanti effetti di equilibrio avversi.",
    effectSize:
      "Mobilità degli inquilini coperti circa −20%; offerta di rental housing nelle proprietà trattate circa −15%. Stima strutturale dell'effetto di equilibrio sulla città: canoni di mercato circa +5,1%. Il +5,1% non è una semplice stima reduced-form e viene distinto dagli effetti quasi-sperimentali direttamente identificati.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede una base giuridica per la regolazione dei canoni, un'amministrazione capace di definire le unità coperte, gestire registri, petizioni e contenzioso e monitorare conversioni dello stock. I costi fiscali diretti possono essere inferiori a quelli di un sussidio, ma gli effetti sull'offerta privata e sulla composizione proprietaria sono un costo economico centrale da misurare.",
    limitations: [
      "Non è un RCT: l'identificazione sfrutta una variazione normativa quasi-sperimentale e dipende dalla comparabilità delle coorti di edifici attorno alla regola di copertura.",
      "La stima del +5,1% sui canoni cittadini deriva da un modello strutturale di equilibrio generale e non va trattata come un coefficiente DiD direttamente osservato.",
      "Il beneficio è concentrato sugli inquilini già insediati nelle unità coperte; nuovi entranti possono essere danneggiati da minore offerta e canoni di mercato più elevati.",
      "Competenze e limiti alla regolazione dei canoni in Italia differiscono radicalmente dal quadro municipale di San Francisco.",
    ],
    unintendedEffects:
      "Riduzione dello stock in locazione, conversione verso proprietà occupata dal proprietario o redevelopment e pressione al rialzo sui canoni non regolati. La policy può quindi ridurre il displacement degli incumbent e contemporaneamente peggiorare l'accessibilità per futuri inquilini.",
    primarySource: {
      label: "San Francisco Rent Board — definizione delle Newly Covered Units da Proposition I",
      url: "https://www.sf.gov/reports--december-2022--rent-board-rules-and-regulations-part-i-definitions",
    },
    evaluationStudies: [
      {
        label: "American Economic Review — effetti dell'estensione del rent control",
        url: "https://pubs.aeaweb.org/doi/10.1257/aer.20181289",
        citation:
          "Diamond R, McQuade T, Qian F (2019), The Effects of Rent Control Expansion on Tenants, Landlords, and Inequality: Evidence from San Francisco, American Economic Review 109(9):3365–3394",
        doi: "10.1257/aer.20181289",
      },
      {
        label: "San Francisco Rent Board — Rent Ordinance corrente",
        url: "https://www.sf.gov/reports--rent-ordinance/",
        citation: "City and County of San Francisco, Rent Board, The Rent Ordinance",
      },
    ],
    lastVerifiedAt: "2026-09-24",
    transferabilityItaly:
      "Bassa per una replica letterale: un Comune italiano non può presumere una potestà autonoma analoga sul rent control. Alta, invece, come evidenza sui trade-off da incorporare nella progettazione di politiche abitative: proteggere gli incumbent può avere effetti positivi reali ma anche spostare il costo su offerta e nuovi entranti.",
    lameziaAdaptation:
      "Non introdurre un tetto comunale ai canoni senza una chiara base normativa. Usare il caso per costruire un osservatorio locale dell'housing che distingua canoni, sfratti/displacement, durata delle locazioni, stock vuoto, conversioni e nuova offerta. Per interventi nella disponibilità comunale — ERP, contributi affitto, garanzie o accordi di locazione — specificare ex ante sia l'outcome di stabilità degli incumbent sia gli effetti sull'offerta e sull'accesso dei nuovi nuclei.",
    implementability: "strutturale",
    capacityDataNeeds: [
      "stock abitativo e tipologia di tenure",
      "canoni e durata delle locazioni",
      "sfratti e altre uscite involontarie aggregate",
      "conversioni/cambi d'uso e nuove unità",
      "base giuridica delle misure abitative comunali",
      "indicatori separati per incumbent e nuovi entranti",
    ],
    tags: ["San Francisco", "rent control", "housing", "displacement", "offerta", "difference-in-differences"],
    revisionHistory: [
      {
        date: "2026-09-24",
        note: "Prima verifica e inserimento; beneficio sugli incumbent mantenuto insieme alla riduzione dell'offerta e all'effetto strutturale sui canoni.",
      },
    ],
  },
  {
    id: "seattle-democracy-voucher-public-campaign-finance",
    title: "Democracy Vouchers per il finanziamento diffuso delle campagne comunali",
    authority: "Seattle Ethics and Elections Commission (SEEC) / City of Seattle",
    territory: "Seattle, Washington",
    country: "Stati Uniti",
    implementationYear: "Approvato nel 2015; prima distribuzione nel 2017; programma rinnovato nel 2025",
    problem:
      "Partecipazione al finanziamento delle campagne locali concentrata tra cittadini con maggiore disponibilità economica e forte dipendenza dei candidati da un numero relativamente ristretto di donatori privati.",
    measure:
      "Il programma distribuisce a residenti eleggibili voucher di valore pubblico da assegnare a candidati municipali che scelgono di aderire e rispettano specifiche regole di finanziamento. Nei cicli ordinari la struttura è di quattro voucher da 25 USD; per la speciale elezione 2026 del District 5 i residenti interessati ricevono due voucher da 50 USD. Nel 2025 gli elettori hanno rinnovato il finanziamento del programma per altri dieci anni.",
    mechanism:
      "Dare a ciascun residente una risorsa finanziaria uguale e spendibile solo per candidati aderenti abbassa il costo monetario della partecipazione come donatore e incentiva le campagne a cercare molti piccoli sostenitori invece di pochi grandi finanziatori.",
    population:
      "Residenti di Seattle eleggibili ai Democracy Vouchers e candidati alle cariche cittadine che scelgono di partecipare al programma; la valutazione causale osserva i primi due cicli dopo l'introduzione e li confronta con grandi città di Washington e California.",
    primaryArea: "partecipazione_democrazia_locale",
    secondaryAreas: ["trasparenza_integrita_anticorruzione"],
    interventionTypes: ["incentivo_economico", "informazione_trasparenza", "modifica_organizzativa_processo"],
    tools: [
      "voucher pubblici assegnabili ai candidati",
      "regole di qualificazione per i candidati",
      "limiti e disclosure del finanziamento elettorale",
      "portale online per assegnazione e dati pubblici",
      "valutazioni indipendenti del programma",
    ],
    territorialScale: "Cittadina; nel 2026 applicazione circoscritta alla speciale elezione del District 5",
    interventionStatus:
      "Operativo. Nel 2025 gli elettori hanno approvato un nuovo finanziamento decennale; nel marzo 2026 SEEC distribuisce due voucher da 50 USD ai residenti del District 5 per l'elezione speciale, mentre il ciclo ordinario cittadino riprenderà nel 2027.",
    evaluationMethod:
      "Difference-in-differences sui primi due cicli elettorali dopo l'introduzione, con città comparatrici selezionate tra grandi città di Washington e California. Una successiva analisi peer-reviewed sulla composizione dei partecipanti è usata come contro-evidenza per distinguere crescita quantitativa dei donatori da diversificazione socio-demografica.",
    comparator:
      "Elezioni municipali in grandi città comparabili di Washington e California prima e dopo l'introduzione dei voucher a Seattle.",
    outcomes: [
      "ammontare complessivo dei contributi",
      "numero di donatori unici",
      "quota e volume dei piccoli contributi",
      "composizione socio-demografica del donor pool",
      "partecipazione dei candidati al finanziamento pubblico",
    ],
    results:
      "La valutazione causale stima un aumento del 53% dei contributi complessivi e del 350% del numero di donatori unici, spiegato in larga misura da forti aumenti dei piccoli contributi sotto 200 USD. Questo è un risultato di espansione della partecipazione finanziaria, non una prova che il donor pool sia diventato rappresentativo della popolazione. Una successiva analisi su APSR conclude infatti che l'uso dei voucher resta più elevato tra gruppi già sovrarappresentati e non supporta il claim che il programma abbia eliminato la diseguaglianza socio-demografica nella partecipazione come donatore.",
    effectSize:
      "DiD nei primi due cicli: contributi totali +53%; numero di donatori unici +350%, con gran parte dell'aumento concentrato nei contributi inferiori a 200 USD. Nessun effect size positivo sulla diversità del donor pool viene registrato: l'evidenza successiva è cautelativa su questo outcome.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede finanziamento pubblico, amministrazione indipendente, sistemi di eleggibilità e antifrode, gestione dei candidati, disclosure e infrastruttura digitale. Nel 2025 Seattle ha approvato una property tax di 4,5 milioni USD l'anno per dieci anni; la città indica un costo medio di circa 13 USD annui per proprietà.",
    limitations: [
      "Il disegno causale è difference-in-differences, non randomizzato, e la comparabilità con le città di controllo dipende dai trend pre-intervento e dall'assenza di shock differenziali.",
      "Aumento del numero di donatori non equivale automaticamente a maggiore rappresentatività politica o maggiore turnout elettorale.",
      "La successiva evidenza peer-reviewed non trova che i voucher abbiano eliminato la sovrarappresentazione di gruppi più avvantaggiati tra i donatori.",
      "Le regole italiane sul finanziamento politico e sulle campagne comunali sono diverse e non consentono di presumere la legittimità di una replica municipale.",
    ],
    unintendedEffects:
      "Persistenza di diseguaglianze nella partecipazione nonostante la forte crescita numerica; oneri amministrativi e antifrode; pubblicità dei dati di assegnazione dei voucher che richiede una gestione chiara della privacy e della trasparenza elettorale.",
    primarySource: {
      label: "City of Seattle — Democracy Voucher Program",
      url: "https://www.seattle.gov/democracyvoucher/about-the-program",
    },
    evaluationStudies: [
      {
        label: "Journal of Public Economics — causal evaluation",
        url: "https://www.sciencedirect.com/science/article/abs/pii/S0047272722000780",
        citation:
          "Griffith A, Noonen T (2022), The effects of public campaign funding: Evidence from Seattle’s Democracy Voucher program, Journal of Public Economics 211:104676",
        doi: "10.1016/j.jpubeco.2022.104676",
      },
      {
        label: "American Political Science Review — donor diversity",
        url: "https://www.cambridge.org/core/journals/american-political-science-review/article/campaign-finance-vouchers-do-not-expand-the-diversity-of-donors-evidence-from-seattle/BD8E21A4B646DE4EA56BF8787DF0FF81",
        citation: "Campaign Finance Vouchers Do Not Expand the Diversity of Donors: Evidence from Seattle, American Political Science Review",
        doi: "10.1017/S0003055424000170",
      },
      {
        label: "Seattle Ethics and Elections Commission — external evaluations",
        url: "https://www.seattle.gov/ethics-and-elections/democracy-voucher-program/program-data/external-reports",
        citation: "SEEC, Democracy Voucher Program — External Reports",
      },
    ],
    lastVerifiedAt: "2026-09-24",
    transferabilityItaly:
      "Bassa per una copia del finanziamento elettorale, che richiederebbe una verifica nazionale e locale molto più ampia. Più alta come principio di design della partecipazione: distribuire capacità decisionale in modo uguale ex ante può ampliare il numero di partecipanti, ma non garantisce automaticamente inclusione socio-demografica.",
    lameziaAdaptation:
      "Non creare voucher elettorali comunali senza un parere giuridico specifico. Il meccanismo può però ispirare, come intervento distinto da valutare ex novo, un bilancio partecipativo o micro-fondo di quartiere nel quale ogni residente dispone dello stesso numero di crediti non monetizzabili da assegnare a progetti già dichiarati ammissibili. Misurare numero e profilo dei partecipanti separatamente, perché Seattle mostra che il primo può crescere senza correggere il secondo.",
    implementability: "strutturale",
    capacityDataNeeds: [
      "verifica giuridica su finanziamento politico e strumenti partecipativi",
      "anagrafe/eleggibilità dei partecipanti con minimizzazione dei dati",
      "regole pubbliche di qualificazione e assegnazione",
      "audit antifrode e tracciabilità",
      "indicatori di partecipazione e rappresentatività distinti",
    ],
    tags: ["Seattle", "democracy vouchers", "partecipazione", "campaign finance", "small donors", "difference-in-differences"],
    revisionHistory: [
      {
        date: "2026-09-24",
        note: "Prima verifica e inserimento; crescita di contributi/donatori separata dalla successiva evidenza nulla sulla diversificazione del donor pool.",
      },
    ],
  },
  {
    id: "stockton-seed-guaranteed-income-rct",
    title: "SEED: trasferimento monetario incondizionato per famiglie a basso reddito",
    authority: "City of Stockton / Stockton Economic Empowerment Demonstration (SEED)",
    territory: "Stockton, California",
    country: "Stati Uniti",
    implementationYear: "Febbraio 2019–gennaio 2021",
    problem:
      "Elevata volatilità del reddito e fragilità finanziaria in quartieri a reddito basso, con effetti su capacità di fronteggiare spese impreviste, salute e possibilità di investire tempo e risorse nella ricerca di lavoro.",
    measure:
      "SEED ha erogato 500 USD al mese per 24 mesi, senza condizioni di lavoro o destinazione della spesa, a residenti selezionati casualmente da aree censuarie con reddito mediano pari o inferiore alla mediana cittadina. Il progetto pubblico lo descrive come primo guaranteed-income demonstration mayor-led degli Stati Uniti.",
    mechanism:
      "Un flusso prevedibile e incondizionato di liquidità può ridurre la volatilità del reddito e il costo cognitivo dell'insicurezza finanziaria, aumentare la capacità di assorbire shock e rendere possibile investire in mobilità, cura, formazione o ricerca di un impiego più stabile.",
    population:
      "Adulti residenti in census tracts di Stockton con reddito mediano pari o inferiore alla mediana cittadina. Il sito del programma riporta 125 destinatari pagati; il paper peer-reviewed descrive un campione di valutazione con 131 assegnati al trattamento e 200 al controllo, distinzione conservata nel record.",
    primaryArea: "welfare_inclusione_servizi_sociali",
    secondaryAreas: ["sviluppo_economico_commercio_lavoro", "salute_pubblica_locale"],
    interventionTypes: ["incentivo_economico", "servizio_diretto", "partnership_pubblico_privato_terzo_settore"],
    tools: [
      "trasferimento mensile incondizionato",
      "randomizzazione dei partecipanti",
      "monitoraggio quantitativo a intervalli regolari",
      "interviste qualitative longitudinali",
      "finanziamento filantropico del pilot",
    ],
    territorialScale: "Pilot cittadino su una piccola popolazione eleggibile",
    interventionStatus:
      "Pilot concluso nel gennaio 2021. Il valore del caso per l'archivio è sperimentale: non implica che Stockton gestisca oggi lo stesso schema né che il modello sia stato finanziato come prestazione ordinaria del bilancio comunale.",
    evaluationMethod:
      "Mixed-methods randomized controlled trial. Il paper finale riporta 131 individui nel trattamento e 200 nel controllo, raccolta quantitativa iniziata tre mesi prima dell'allocazione e ripetuta ogni sei mesi fino a sei mesi dopo la fine del trasferimento, con 105 interviste qualitative. Il primo anno pre-COVID consente anche un confronto pulito delle traiettorie occupazionali prima dello shock pandemico.",
    comparator:
      "Residenti eleggibili assegnati casualmente al gruppo di controllo e seguiti nello stesso periodo.",
    outcomes: [
      "volatilità mensile del reddito",
      "psychological distress",
      "energia e funzionamento fisico",
      "financial wellbeing e capacità di fronteggiare spese",
      "occupazione full-time",
      "agency e capacità di pianificazione",
    ],
    results:
      "Il paper finale riporta per il gruppo trattato minore volatilità del reddito, minore psychological distress e migliori indicatori di energia/funzionamento fisico rispetto al controllo, con effetti che risultano più netti in condizioni economiche pre-pandemiche e più attenuati durante lo shock COVID-19. Nel primo anno, prima della pandemia, la quota in occupazione full-time passa dal 28% al 40% tra i destinatari e dal 32% al 37% nel controllo. Questo contrasto occupazionale viene mantenuto come risultato del primo anno e non generalizzato automaticamente ai 24 mesi.",
    effectSize:
      "Primo anno pre-COVID: full-time employment 28%→40% nel trattamento (+12 p.p.) contro 32%→37% nel controllo (+5 p.p.), differenza grezza nell'incremento circa +7 p.p. Il paper peer-reviewed a due anni documenta effetti favorevoli su volatilità del reddito, distress mentale e funzionamento fisico ma il record non inventa una singola magnitudine comune per outcome misurati con scale differenti.",
    evidenceStrength: "forte",
    costsRequirements:
      "500 USD al mese per destinatario per 24 mesi, più amministrazione, sistemi di pagamento, valutazione e coordinamento con altri benefit. Il pilot di Stockton fu finanziato da fondazioni/filantropia, principalmente Economic Security Project, quindi la sostenibilità di bilancio di un programma pubblico ordinario non è stata testata dal trial.",
    limitations: [
      "Campione relativamente piccolo e contesto di una singola città, con validità esterna limitata.",
      "Il secondo anno coincide con la pandemia COVID-19, uno shock macroeconomico che attenua e complica l'interpretazione di alcuni effetti rispetto al primo anno pre-pandemico.",
      "Il sito del programma parla di 125 destinatari, mentre il paper riporta 131 assegnati al trattamento nel campione di valutazione; il record mantiene esplicitamente le due definizioni invece di fonderle.",
      "Il pilot era finanziato filantropicamente: non identifica gli effetti fiscali, di crowd-out o di sostenibilità di una misura finanziata stabilmente dal Comune.",
      "Interazioni con trasferimenti nazionali, soglie ISEE o altri benefit italiani richiederebbero una valutazione giuridica e distributiva dedicata.",
    ],
    unintendedEffects:
      "Non emerge dal trial un disincentivo generalizzato al lavoro; tuttavia una replica potrebbe interagire con altre prestazioni means-tested, creare cliff effects o spostare risorse da servizi in-kind se finanziata entro un budget comunale fisso. Questi effetti non sono identificati dal pilot filantropico.",
    primarySource: {
      label: "Stockton Economic Empowerment Demonstration — programma e risultati",
      url: "https://www.stocktondemonstration.org/",
    },
    evaluationStudies: [
      {
        label: "Journal of Urban Health — RCT finale",
        url: "https://link.springer.com/article/10.1007/s11524-023-00723-0",
        citation:
          "West S, Castro A (2023), Impact of Guaranteed Income on Health, Finances, and Agency: Findings from the Stockton Randomized Controlled Trial, Journal of Urban Health",
        doi: "10.1007/s11524-023-00723-0",
      },
      {
        label: "SEED — risultati occupazionali del primo anno",
        url: "https://www.stocktondemonstration.org/employment",
        citation: "Stockton Economic Empowerment Demonstration, Employment — first-year findings",
      },
      {
        label: "Results for America — amministrazione e finanziamento del pilot",
        url: "https://catalog.results4america.org/case-studies/guaranteed-income-stockton",
        citation: "Results for America, Guaranteed income: Stockton, CA",
      },
    ],
    lastVerifiedAt: "2026-09-24",
    transferabilityItaly:
      "Media come pilot sociale, bassa come prestazione comunale permanente senza una verifica di competenze e bilancio. Il principio trasferibile è testare un trasferimento semplice e prevedibile su una platea ben definita, valutando contemporaneamente sicurezza economica, lavoro e interazioni con il welfare esistente.",
    lameziaAdaptation:
      "Prima mappare contributi economici comunali, platee, non-take-up, tempi e sovrapposizioni con prestazioni nazionali/regionali. Se esiste una base giuridica e finanziaria, valutare un piccolo top-up temporaneo e incondizionato per una platea vulnerabile, possibilmente finanziato da risorse dedicate e senza sottrarre servizi essenziali. Pre-specificare outcome su volatilità del reddito, arretrati, emergenze da 300–500 euro, occupazione/formazione, benessere e uso dei servizi; se la domanda supera i posti, usare una regola di assegnazione trasparente che consenta un controfattuale credibile.",
    implementability: "medio_termine",
    capacityDataNeeds: [
      "mappa dei contributi e delle platee già servite",
      "base giuridica e trattamento fiscale/ISEE del trasferimento",
      "budget dedicato e regole di eleggibilità",
      "sistema di pagamento e protezione dei dati",
      "baseline e follow-up economico/sociale",
      "analisi delle interazioni con altri benefit",
    ],
    tags: ["Stockton", "SEED", "guaranteed income", "cash transfer", "welfare", "RCT", "income volatility"],
    revisionHistory: [
      {
        date: "2026-09-24",
        note: "Prima verifica e inserimento; risultati pre-COVID distinti dal follow-up pandemico e finanziamento filantropico distinto dalla sostenibilità di bilancio comunale.",
      },
    ],
  },
] as const satisfies readonly EvidenceIntervention[];
