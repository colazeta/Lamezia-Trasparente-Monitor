import type { EvidenceIntervention } from "./evidenceInterventions";

/** Studio originale Picchio (2023), WP dell'autore e atti Comune di Recanati verificati 2026-11-14. */
export const EVIDENCE_INTERVENTIONS_2026_11_14_MACERATA_MICROCHIPS: readonly EvidenceIntervention[] = [
{
  "id": "macerata-cosmari-microchipped-waste-bags-2013",
  "title": "COSMARI (provincia di Macerata): sacchetti identificabili con microchip per migliorare la raccolta differenziata",
  "authority": "COSMARI, gestore pubblico intercomunale dei rifiuti, con i comuni aderenti della provincia di Macerata",
  "territory": "Provincia di Macerata, Marche; avvio in alcuni comuni nel 2013, estensione limitata al centro della città di Macerata nel 2014",
  "country": "Italia",
  "implementationYear": "Progetti pilota 2011–2012; introduzione in più comuni nel secondo semestre 2013; centro di Macerata dal marzo 2014; valutazione 2010–2016",
  "problem": "Incrementare la separazione dei rifiuti e ridurre l'indifferenziato in comuni con sistema porta a porta già attivo e quota di raccolta separata elevata; migliorare la capacità di individuare conferimenti non conformi.",
  "measure": "Associazione del microchip applicato ai sacchi per multimateriale e rifiuto residuo alla singola utenza nella fase di distribuzione; i sacchi identificabili permettono verifiche sul corretto conferimento e sono accompagnati da comunicazioni agli utenti. Durante il periodo valutato NON era una tariffa pay-as-you-throw commisurata al peso o al numero di sacchi.",
  "mechanism": "La potenziale identificabilità del conferimento e il rischio credibile di verifica aumentano la responsabilizzazione delle utenze nell'effettuare la separazione, senza introdurre nell'esperimento un prezzo marginale del rifiuto.",
  "population": "Utenze domestiche e non domestiche nei comuni COSMARI trattati; panel comunale mensile con 44 comuni nei modelli DiD e 38 nel controllo sintetico, dopo esclusioni metodologiche; sette comuni effettivamente trattati compresi nell'analisi principale (non l'intera provincia).",
  "primaryArea": "rifiuti_pulizia_urbana",
  "secondaryAreas": [
    "ambiente_clima_energia",
    "digitalizzazione_servizi_online",
    "capacita_amministrativa_personale"
  ],
  "interventionTypes": [
    "infrastruttura_digitale",
    "enforcement_controllo",
    "modifica_organizzativa_processo",
    "targeting_data_analytics",
    "informazione_trasparenza"
  ],
  "tools": [
    "sacchi con microchip associati alle utenze",
    "gestione della distribuzione dei sacchi",
    "ispezioni selettive potenzialmente eseguibili dal gestore e dalla polizia locale",
    "registrazioni mensili comunali delle quantità separate e residue",
    "campagna informativa e verifica delle anomalie"
  ],
  "territorialScale": "Comuni della provincia di Macerata, con osservazioni mensili per comune; non un trial randomizzato per famiglia.",
  "interventionStatus": "Intervento storicamente attuato dal 2013; operatività generalizzata nel 2026 non accertata. Il Comune di Recanati ha annunciato il 3 dicembre 2024 l'eliminazione nel 2025 del chip dai sacchetti blu per multimateriale, per risparmio di costo: decisione locale che non va estesa automaticamente a tutti i comuni COSMARI.",
  "evaluationMethod": "Studio peer-reviewed osservazionale quasi-sperimentale su serie comunali mensili: difference-in-differences a effetti fissi, modelli con trend comunali, interactive fixed effects e synthetic control method; test di pretrend e di interferenza spaziale. Il programma non è assegnato casualmente, NON è un RCT. Picchio (pubblicato online 2022; volume 2023).",
  "comparator": "Comuni COSMARI senza introduzione del sacco con microchip nello stesso periodo, oppure controllo sintetico ponderato costruito da comuni non trattati, confrontando andamento pre/post dal 2010 al 2016 e aggiustando per covariate e trend.",
  "outcomes": [
    "quota di rifiuto urbano separato sul totale",
    "chilogrammi pro capite mensili di rifiuto residuo/indifferenziato",
    "persistenza e robustezza delle stime",
    "costo incrementale dei sacchi e risparmio di trattamento stimato",
    "possibili spillover nei comuni limitrofi"
  ],
  "results": "Dopo circa due anni, incremento statisticamente significativo della quota separata di 3–4,5 punti percentuali secondo le specificazioni; le stime più conservative IFE-DiD e SCM sono circa 3–3,3 punti. Riduzione dell'indifferenziato di circa 1–2 kg pro capite al mese. I risultati riguardano comuni che già nel 2012 separavano il 73,4% dei rifiuti; non sono evidenze di impatto sul riciclo effettivo a valle degli impianti. Il miglioramento osservato non dimostra che il sistema generi risparmi netti, né che i microchip vadano conservati indefinitamente.",
  "effectSize": "+3–3,3 punti percentuali stima più robusta della quota di raccolta separata dopo quattro semestri; +4,5 punti nel modello DiD con trend (massimo tra le stime); −1–2 kg per persona al mese di indifferenziato; baseline trattati 2012: 73,4% separato e 8,9 kg residui pro capite al mese.",
  "evidenceStrength": "moderata",
  "costsRequirements": "Dallo studio, +0,093 EUR per sacco con microchip rispetto a quello ordinario (preventivo COSMARI 2013); costo aggiuntivo previsto di circa 307.000 EUR per sette comuni; risparmio ipotizzato nel trattamento dell'indifferenziato 174.000–246.000 EUR annui; saldo annuale stimato NEGATIVO di 61.000–133.000 EUR (1,03–2,24 EUR per abitante). Sono stime basate su PREVENTIVI, non costi consuntivi accertati; benefici ambientali esterni esclusi. Nel 2024 il Comune di Recanati ha prospettato risparmi locali di 60.000–70.000 EUR eliminando i microchip dai sacchi blu a partire dal 2025; NON paragonabile automaticamente ai sette comuni del paper.",
  "limitations": [
    "Il programma non è randomizzato; l'adozione selettiva per comune e modifiche contemporanee della raccolta possono influenzare gli esiti pur con DiD/SCM.",
    "I dati riguardano quantitativi conferiti separatamente, non il tasso finale di riciclo industriale né la qualità merceologica verificata a impianto.",
    "Quota iniziale di raccolta separata del 73,4% nei comuni trattati; trasferibilità quantitativa scarsa a comuni con baseline molto diversa.",
    "Stime dei costi basate su un preventivo COSMARI e ipotesi sulla tariffa di trattamento, senza consuntivi per comune; non provata sostenibilità finanziaria.",
    "Dati storici 2010–2016 e adozione 2013; risultati non dimostrano persistenza pluridecennale né necessità di mantenere i microchip.",
    "La decisione del Comune di Recanati 2024–2025 di abbandonare il chip sui sacchetti blu non è una valutazione sperimentale ex post, ma evidenza primaria di riconsiderazione amministrativa.",
    "Identificabilità delle utenze richiede base giuridica appropriata, informativa, minimizzazione e controlli GDPR; nessuna raccolta indiscriminata."
  ],
  "unintendedEffects": "Lo studio non misura direttamente effetti su abbandono illecito dei rifiuti, sanzioni effettivamente irrogate o danni alla privacy; NON affermare che tali rischi siano assenti. Il caso Recanati evidenzia invece un possibile effetto finanziario negativo: costo operativo dei chip superiore al beneficio percepito dal Comune.",
  "primarySource": {
    "label": "Comune di Macerata — istruzioni istituzionali 29 ottobre 2024 per il ritiro dei sacchetti con microchip con RicicloCard nel centro storico",
    "url": "https://www.comune.macerata.it/novita/distribuzione-dei-sacchetti-per-la-raccolta-differenziata/"
  },
  "evaluationStudies": [
    {
      "label": "Articolo originale peer-reviewed, Springer",
      "url": "https://link.springer.com/article/10.1007/s10018-021-00338-2",
      "citation": "Picchio, M. (2023), Microchipped bags and waste sorting, Environmental Economics and Policy Studies 25, 1–30; pubblicato online 5 gennaio 2022.",
      "doi": "10.1007/s10018-021-00338-2"
    },
    {
      "label": "Testo integrale working paper dell'autore — Università Politecnica delle Marche",
      "url": "https://docs.dises.univpm.it/web/quaderni/pdf/449.pdf",
      "citation": "Picchio, M. (2021), Microchip Bags and Waste Sorting, Quaderno di ricerca n. 449, Università Politecnica delle Marche."
    },
    {
      "label": "COSMARI — gestore pubblico d'ambito e documentazione dei servizi",
      "url": "https://cosmariambiente.it/",
      "citation": "COSMARI, sito istituzionale del gestore del servizio rifiuti per l'ATO Macerata; bilanci preventivi 2013 e 2014 citati nello studio originale."
    },
    {
      "label": "Comune di Recanati — revisione amministrativa e annunciata eliminazione dei microchip dai sacchi blu nel 2025 (non valutazione scientifica)",
      "url": "https://www.comune.recanati.mc.it/it/news/dal-2025-si-cambia-via-il-microchip-sui-sacchetti-multimateriale-della-differenziata",
      "citation": "Comune di Recanati (3 dicembre 2024), Dal 2025 si cambia: via il microchip sui sacchetti multimateriale della differenziata."
    }
  ],
  "lastVerifiedAt": "2026-11-14",
  "transferabilityItaly": "Intervento effettivamente implementato in comuni italiani, con competenze di gestore d'ambito e comuni da verificare nei contratti e nella regolazione vigente. Trasferibile soprattutto il principio di tracciabilità mirata e verifica dei conferimenti; non è una prova a favore dell'introduzione obbligatoria del microchip o della TARIP.",
  "lameziaAdaptation": "Prima verificare con Comune di Lamezia Terme, gestore e autorità d'ambito i dati mensili di raccolta per quartiere, il modello di conferimento già utilizzato, le impurità delle frazioni, gli errori di separazione e i costi per flusso. Sperimentare inizialmente comunicazione, etichettatura e controlli legittimi a basso costo; solo se risulta un problema documentato e una base giuridica idonea valutare in aree confrontabili un pilota di tracciabilità dei sacchi con analisi costi-benefici, misurando quota separata, quantità residua, contaminazione, abbandoni, reclami ed esiti di conformità. Includere GDPR e verifica del DPO, consultazione degli utenti e protocollo di valutazione quasi-sperimentale; nessuna equiparazione automatica dei microchip alla tariffazione puntuale.",
  "implementability": "medio_termine",
  "capacityDataNeeds": [
    "serie mensili per quartiere/comune di rifiuto differenziato e indifferenziato, con popolazione/utenze denominator",
    "dati su contaminazione, qualità effettiva del riciclo e raccolta abusiva",
    "costi correnti e scenari per chip, distribuzione, lettori, controlli e trattamento",
    "contratti con gestore/ente d'ambito e competenze della polizia locale",
    "valutazione privacy, minimizzazione, informativa, DPO e base giuridica",
    "aree di confronto comparabili, baseline pre-intervento, protocollo di stima e indicatori di effetti collaterali"
  ],
  "tags": [
    "Macerata",
    "Marche",
    "COSMARI",
    "microchip",
    "sacchi identificabili",
    "raccolta differenziata",
    "rifiuti residui",
    "DiD",
    "interactive fixed effects",
    "synthetic control",
    "2023 peer-reviewed",
    "Recanati 2025",
    "costi incrementali",
    "non PAYT",
    "Lamezia Terme"
  ],
  "revisionHistory": [
    {
      "date": "2026-11-14",
      "note": "Nuovo record dopo Parallel Search obbligatoria e verifica diretta del paper peer-reviewed Springer, del working paper integrale Università Politecnica delle Marche (incluse tabelle dei risultati e costi) e della fonte primaria Comune di Recanati 03/12/2024. Confrontati direttamente i moduli canonici GitHub: non duplicare i casi PAYT Emilia-Romagna/Italia, che applicano meccanismi diversi. Evidenza non randomizzata classificata moderata, stime economiche chiaramente non consuntive, decisione comunale 2025 di eliminare i microchip distinta dal trial storico. Fonte primaria aggiuntiva Comune di Macerata (29/10/2024): accesso sacchi con microchip con RicicloCard limitato al centro storico."
    }
  ]
}
];
