import type { EvidenceIntervention } from "./evidenceInterventions";

/** Allegheny County DHS RCT 2022–2024 e valutazione originale Chizeck & Mbonu (2025), verificati 2026-11-15. */
export const EVIDENCE_INTERVENTIONS_2026_11_15_ALLEGHENY_TRANSIT: readonly EvidenceIntervention[] = [
  {
    "id": "allegheny-county-discounted-fares-pilot-2022",
    "title": "Allegheny County: trasporto pubblico gratuito o scontato per nuclei a basso reddito — valutazione randomizzata",
    "authority": "Allegheny County Department of Human Services (ACDHS) e Pittsburgh Regional Transit (PRT)",
    "territory": "Contea di Allegheny (inclusa Pittsburgh), Pennsylvania",
    "country": "Stati Uniti",
    "implementationYear": "Pilota novembre 2022–giugno 2024; programma permanente Allegheny Go al 50% avviato nel giugno 2024, distinto dal braccio sperimentale gratuito",
    "problem": "I costi monetari del trasporto pubblico possono aggravare l'insicurezza negli spostamenti e ostacolare accesso al lavoro e servizi dei nuclei a basso reddito; mancava evidenza causale sull'effetto di sconti parziali rispetto a gratuità totale.",
    "measure": "Programma Discounted Fares Pilot: assegnazione casuale per nucleo familiare a tre bracci per 16–19 mesi: corse PRT gratuite (100% di sconto), sconto del 50% oppure tariffa ordinaria (controllo, carta con 10 USD iniziali). Beneficiari adulti 18–64 anni in nuclei con SNAP; possibile inclusione di figli 6–17 anni. Il successivo programma permanente Allegheny Go applica invece una riduzione del 50%, non gratuità.",
    "mechanism": "La gratuità azzera il prezzo monetario marginale delle corse e gli oneri di ricarica, potenzialmente spostando domanda dall'auto privata al trasporto collettivo e allentando vincoli finanziari del pendolarismo; lo sconto a metà tariffa riduce costi ma conserva spese e frizioni di pagamento.",
    "population": "9.544 adulti appartenenti ad altrettanti nuclei SNAP, con 4.928 minori iscritti; randomizzazione a livello di nucleo, una persona adulta partecipante per nucleo. Risultati GPS derivati dal sottocampione consenziente e non dall'intera popolazione randomizzata.",
    "primaryArea": "mobilita_spazio_pubblico",
    "secondaryAreas": [
      "welfare_inclusione_servizi_sociali",
      "sviluppo_economico_commercio_lavoro",
      "ambiente_clima_energia"
    ],
    "interventionTypes": [
      "incentivo_economico",
      "servizio_diretto",
      "partnership_pubblico_privato_terzo_settore",
      "targeting_data_analytics",
      "modifica_organizzativa_processo"
    ],
    "tools": [
      "tariffe sperimentali 0%, 50% e 100% del prezzo ordinario",
      "ConnectCard / sistemi di bigliettazione PRT",
      "verifica di eleggibilità SNAP e assegnazione casuale per nucleo",
      "registri di convalida delle corse, dati GPS con consenso, diari di viaggio e indagini",
      "registri amministrativi di occupazione e retribuzione",
      "sostegno finanziario e gestione amministrativa ACDHS"
    ],
    "territorialScale": "Contea e rete PRT; RCT individuale con assegnazione a livello di nucleo familiare, non un confronto fra quartieri.",
    "interventionStatus": "Pilota concluso nel giugno 2024; l'intervento gratuito sperimentale NON è stato generalizzato. Dal giugno 2024 il programma permanente Allegheny Go concede sconto del 50% ai residenti idonei; sito istituzionale consultato il 15 novembre 2026.",
    "evaluationMethod": "Randomized controlled trial preregistrato (AEA RCT Registry AEARCTR-0011001), tre bracci con randomizzazione per nucleo; analisi intention-to-treat su flussi amministrativi e sottocampioni GPS/sondaggi. Chizeck e Mbonu (agosto 2025): working paper di ricerca applicata, non dichiarato peer-reviewed; analisi esplorative di sottogruppo per il lavoro.",
    "comparator": "Tariffa ordinaria PRT con carta da 10 USD una tantum nel gruppo controllo; confronto separato con sconto del 50% e corse gratuite. Gli effetti sono dell'assegnazione al trattamento nel periodo sperimentale, non del programma Allegheny Go post-2024.",
    "outcomes": [
      "corse di trasporto pubblico per settimana",
      "insicurezza percepita nei trasporti (Transportation Security Index)",
      "viaggi in auto e altre modalità di trasporto",
      "numero totale di spostamenti e varietà delle destinazioni",
      "occupazione e reddito da lavoro su sei trimestri",
      "spesa personale per trasporto",
      "costi diretti per ente e gestore e benefici sociali modellizzati"
    ],
    "results": "Le corse gratuite aumentano le corse PRT di 1,48/settimana (+43% da baseline GPS controllo di 3,47), principalmente sostituendo spostamenti prima effettuati in auto, ma anche parte degli spostamenti a piedi/in bicicletta. Il 50% non mostra incremento statisticamente identificabile delle corse. Sconto del 50% e gratuità riducono l'insicurezza percepita nei trasporti; né l'una né l'altra misura aumentano il numero totale di spostamenti o l'ampiezza geografica delle destinazioni. Nessun incremento rilevabile di occupazione o reddito medio nell'intero campione. Analisi esplorativa dei disoccupati iniziali: gratuità associata a +3,5 punti percentuali di probabilità di impiego e +2.845 USD di retribuzioni cumulative su sei trimestri; da non generalizzare a tutti e da interpretare con cautela per sottogruppi e confronti multipli.",
    "effectSize": "Gratuità: +1,48 viaggi PRT/persona-settimana (SE 0,716; +43% vs 3,47 corse controllo) nelle osservazioni GPS; −1,67 viaggi auto/settimana e −10,15 miglia auto/settimana (GPS). Insicurezza moderata/alta: −11,9 pp gratuità e −4,7 pp sconto 50% secondo il questionario (nel sottocampione rispondente). Disoccupati all'inizio (analisi esplorativa): +3,5 pp impiego e +2.845 USD redditi su sei trimestri. Sconto del 50%: nessun effetto statisticamente distinguibile da zero sul numero di corse PRT (non prova di effetto nullo).",
    "evidenceStrength": "forte",
    "costsRequirements": "Nella valutazione gli autori stimano per la gratuità 297,44 USD/partecipante/anno di ricavi tariffari non riscossi più 3,41 USD di amministrazione, circa 300,85 USD annuali; assumono costo operativo marginale nullo per un passeggero aggiuntivo. Sono stime modellizzate e parziali, non bilancio consuntivo né costo trasferibile automaticamente in Italia. Richiede accordo Comune/ente competente/gestore, risorse per compensare minori ricavi, sistemi bigliettazione, criterio di selezione non discriminatorio e protocolli privacy.",
    "limitations": [
      "Stima +43% sulle corse da sottocampione GPS consenziente: possibile selezione, copertura limitata e differenze rispetto a survey e convalide carta.",
      "La randomizzazione identifica effetti nel campione SNAP e sulla rete PRT, non in una popolazione generale o in contesti con frequenze del servizio diverse.",
      "Non vi è miglioramento misurabile del numero totale di spostamenti: gran parte del risultato è sostituzione modale, non nuova mobilità complessiva.",
      "Effetti sul lavoro medi nulli; quelli positivi per disoccupati iniziali provengono da analisi esplorative di sottogruppo e non devono essere presentati come effetti generali confermati.",
      "La stima dei benefici monetizzati dipende da assunzioni sulla valutazione del benessere, sulla sostituzione modale e sui costi marginali del gestore.",
      "Non è stato studiato l'effetto permanente della gratuità: dal giugno 2024 il programma ordinario offre invece il 50% di sconto.",
      "Possibili divergenze tra ridefinizione del campione tramite GPS e dati da bigliettazione; differenze nei dati di auto-dichiarazione.",
      "Le riduzioni tariffarie in Italia devono rispettare competenze, contratti di servizio, regole regionali e norme su aiuti e agevolazioni; assenza di garanzia che Comune possa disporle unilateralmente."
    ],
    "unintendedEffects": "La gratuità ha spostato anche parte degli spostamenti a piedi/in bici verso il trasporto collettivo (−4,6 pp nella probabilità giornaliera di camminare o pedalare, da diari di viaggio); non è un miglioramento netto automaticamente dimostrato di salute o clima. Potenziali maggiori costi a carico del gestore se si supera capacità residua non inclusi nel modello di costo marginale nullo. Il 42% dei rispondenti gratuità riportava comunque insicurezza moderata/alta nei trasporti: il prezzo non elimina barriere di offerta.",
    "primarySource": {
      "label": "Allegheny County DHS / Allegheny Analytics — risultati ufficiali del Discounted Fares Pilot (15 agosto 2025)",
      "url": "https://analytics.alleghenycounty.us/2025/08/15/allegheny-county-discounted-fares-pilot-program/"
    },
    "evaluationStudies": [
      {
        "label": "Chizeck e Mbonu (2025), testo originale completo e appendici — ACDHS",
        "url": "https://analytics.alleghenycounty.us/wp-content/uploads/2025/08/Discounted-Fares-Report_2025_ACDHS.pdf",
        "citation": "Chizeck, Seth e Oluchi Mbonu (agosto 2025), The Role of the Fare in Welfare: Public Transportation Subsidies and their Effects on Low-Income Households, working paper RCT preregistrato, Allegheny County DHS."
      },
      {
        "label": "Allegheny County DHS — sintesi ufficiale del pilota (agosto 2025)",
        "url": "https://analytics.alleghenycounty.us/wp-content/uploads/2025/08/Discounted-Fares-Summary_2025_ACDHS.pdf",
        "citation": "Allegheny County Department of Human Services (2025), Discounted Fares Pilot: Summary of Findings."
      },
      {
        "label": "Allegheny Go — stato attuale ufficiale del programma 50% (verificato novembre 2026)",
        "url": "https://discountedfares.alleghenycounty.us/",
        "citation": "Allegheny County Department of Human Services, Allegheny Go official eligibility and fare discount portal."
      },
      {
        "label": "Lamezia Multiservizi — tariffe e abbonamenti locali (consultato novembre 2026)",
        "url": "https://www.lameziamultiservizi.it/trasporti/",
        "citation": "Lamezia Multiservizi S.p.A., Servizio trasporti urbani: tipologie di biglietto e abbonamento."
      },
      {
        "label": "Città di Lamezia Terme — aggiornamento del Piano generale del traffico urbano (giugno 2026)",
        "url": "https://www.comune.lamezia-terme.cz.it/it/page/161099",
        "citation": "Comune di Lamezia Terme (18 giugno 2026), Piano generale del Traffico Urbano."
      }
    ],
    "lastVerifiedAt": "2026-11-15",
    "transferabilityItaly": "La misura riguarda il prezzo dei titoli di viaggio, non nuova infrastruttura; comparabile ai sistemi di agevolazioni già diffusi in Italia. Trasferibile come metodo di valutazione di un sostegno tariffario mirato, non come obbligo di gratuità. Sono determinanti attribuzioni del Comune, normativa/regolazione regionale TPL, gestore e copertura della perdita di ricavi, accessibilità del servizio.",
    "lameziaAdaptation": "Non proporre un nuovo sistema gratuito generalizzato senza analisi. Il gestore Lamezia Multiservizi pubblica 1,80 EUR per corsa 90 min, 41 EUR abbonamento mensile ordinario e 25 EUR studenti (tariffe da verificare al momento del pilota). Nel contesto dell'aggiornamento PGTU avviato nel 2026, mappare linee, frequenze, accesso effettivo ai poli Nicastro/Sambiase/Sant'Eufemia e costi/agevolazioni esistenti; con Comune, Regione Calabria e gestore valutare un pilota a platea circoscritta (persone in cerca di lavoro o nuclei ISEE basso), con rimborso temporaneo dei titoli e analisi costi-benefici. Distinguere sconto parziale e gratuità, senza presumere che il primo aumenti corse. Monitorare accesso al lavoro, trasporti risparmiati, puntualità, cambiamento modale, barriere di servizio e disponibilità economica; predisporre comparatore lecito senza negare prestazioni dovute e protezione GDPR.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "mappatura tariffe, titoli e agevolazioni vigenti, competenze e condizioni contrattuali Regione–Comune–gestore",
      "conteggio convalide per fascia oraria e tratta, con aggregazione e minimizzazione dati personali",
      "distribuzione domanda potenziale per criteri sociali ammissibili, con dati aggregati e valutazione GDPR",
      "costi unitari dei titoli e capacità residua dei mezzi, risorse per rimborsi e amministrazione",
      "indagine baseline su motivi di spostamento, accesso lavoro, barriere economiche e di offerta",
      "protocollo di valutazione con comparatore appropriato, follow-up e tracciamento effetti non voluti"
    ],
    "tags": [
      "Allegheny County",
      "Pittsburgh",
      "trasporto pubblico",
      "tariffe gratuite",
      "sconto 50%",
      "RCT",
      "SNAP",
      "ridership",
      "sicurezza dei trasporti",
      "mobilità sociale",
      "disoccupazione",
      "sostituzione modale",
      "costi",
      "Allegheny Go",
      "Lamezia Terme",
      "2025 working paper"
    ],
    "revisionHistory": [
      {
        "date": "2026-11-15",
        "note": "Nuovo record previa discovery obbligatoria con Parallel Search e confronto diretto delle fonti primarie ACDHS, dello studio originale integrale e del portale attuale Allegheny Go. Verificata la distinzione tra pilota gratuito concluso nel 2024 e programma attuale solo sconto 50%; evidenziati RCT preregistrato, stime GPS da sottocampione, assenza di effetto medio sull'occupazione, sottogruppo esplorativo, sostituzione da auto ma anche da mobilità attiva, assunzione di costo marginale nullo. Deduplicazione sui moduli e sulle PR GitHub."
      }
    ]
  }
];
