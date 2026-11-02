import type { EvidenceIntervention } from "./evidenceInterventions";

/** Říčany municipal speeding-ticket salience RCT; verified 2026-11-02 from primary sources. */
export const EVIDENCE_INTERVENTIONS_2026_11_02_RICANY: readonly EvidenceIntervention[] = [
  {
    "id": "ricany-czechia-speeding-ticket-payment-salience-rct",
    "title": "Říčany: comunicazioni chiare su termini e conseguenze delle sanzioni stradali",
    "authority": "Městský úřad Říčany — autorità municipale competente per i verbali da sistemi automatici di controllo velocità",
    "territory": "Říčany e comuni circostanti a sud-est di Praga, Boemia Centrale",
    "country": "Repubblica Ceca",
    "implementationYear": "2017–2019 (esperimento); successiva adozione stabile della lettera più efficace, dichiarata dagli autori nel 2022",
    "problem": "Comunicazioni sanzionatorie formalistiche rendono poco evidenti termini, importi e conseguenze effettive del mancato pagamento, causando pagamenti tardivi, costi di recupero e oneri aggiuntivi per i destinatari.",
    "measure": "Sperimentazione su verbali di eccesso di velocità rilevati da telecamere automatiche: alla comunicazione legale ordinaria viene allegato un foglio sintetico che evidenzia solo la scadenza, solo le conseguenze reali del ritardo, oppure entrambi; quarto gruppo con verbale ordinario. In seguito l'autorità ha adottato stabilmente il foglio più efficace, come dichiarano i ricercatori.",
    "mechanism": "Aumentare la salienza delle effettive conseguenze amministrative ed economiche del ritardo corregge la sottovalutazione iniziale delle sanzioni successive e favorisce il pagamento nei termini senza introdurre nuovi obblighi o aggravamenti.",
    "population": "78.882 verbali per superamento dei limiti di velocità trattati dall'autorità locale tra novembre 2017 e agosto 2019; le unità randomizzate sono verbali, non necessariamente 78.882 persone diverse. I sistemi automatici riguardavano una rete arrivata a 29 postazioni.",
    "primaryArea": "fiscalita_entrate_riscossione",
    "secondaryAreas": [
      "capacita_amministrativa_personale",
      "mobilita_spazio_pubblico",
      "digitalizzazione_servizi_online"
    ],
    "interventionTypes": [
      "nudging_comunicazione",
      "informazione_trasparenza",
      "modifica_organizzativa_processo"
    ],
    "tools": [
      "foglio di accompagnamento di una pagina",
      "scadenza di 15 giorni e penalità successiva effettivamente prevista nell'ordinamento ceco",
      "assegnazione casuale di quattro versioni del messaggio",
      "registri amministrativi di recapito e pagamento",
      "modelli con effetti fissi per settimana e telecamera",
      "survey sperimentale separata sulle percezioni"
    ],
    "territorialScale": "Comune e area sovracomunale amministrata dall'ufficio di Říčany; unità di intervento: comunicazione individuale relativa a verbale.",
    "interventionStatus": "Esperimento concluso; gli autori riferiscono nel 2022 che l'autorità aveva adottato permanentemente la versione più efficace. Operatività immutata al novembre 2026 non indipendentemente accertata.",
    "evaluationMethod": "Randomized controlled field trial preregistrato (novembre 2017–agosto 2019) con N=78.882 verbali assegnati a controllo o tre varianti di lettera; modello di probabilità lineare, errori standard clusterizzati per veicolo e controlli/effetti fissi per settimana d'invio e postazione. Correzioni per imperfezioni nell'assegnazione nel 2018. Survey esperimentale complementare su 1.609 patentati per investigare meccanismi percettivi, non sostitutiva del trial amministrativo.",
    "comparator": "Verbale standard dell'autorità senza foglio sintetico aggiuntivo. Trattamento D: sola scadenza; P: sola conseguenza del ritardo; D&P: entrambe.",
    "outcomes": [
      "pagamento integrale entro 15 giorni",
      "pagamento cumulativo fino a 100 giorni",
      "tempistica della riscossione",
      "stima amministrativa di costi di sollecito e maggiori entrate",
      "percezione di scadenza e maggiorazioni nella survey",
      "sicurezza stradale e recidiva non valutate causalmente in questo studio"
    ],
    "results": "Nel controllo il 77,9% dei verbali viene pagato entro 15 giorni. Evidenziare solamente la scadenza non determina un aumento statisticamente significativo (+0,2 punti). Rendere saliente la penalità per il ritardo aumenta i pagamenti puntuali di circa 0,9 punti; combinare penalità e scadenza aumenta di circa 2,0 punti, con una differenza statisticamente significativa rispetto alla sola penalità. L'effetto migliore permane a 100 giorni (+1,6 punti). La survey distinta rileva che i destinatari tendono a sottostimare i costi del ritardo. Gli autori dichiarano che la versione combinata è stata resa permanente.",
    "effectSize": "Entro 15 giorni: 77,9% controllo; +0,2 punti percentuali sola scadenza (non significativo); circa +0,9/1,0 punti sola penalità; +2,0 punti (circa +2,6% in termini relativi) scadenza+penalità. Entro 100 giorni: +1,6 punti per trattamento combinato. Analisi economica modellizzata: beneficio fiscale netto incrementale 12,62 CZK per verbale (circa 0,50 USD all'epoca), sufficiente nel contesto studiato a coprire circa il 25% del costo del personale amministrativo dedicato ai verbali; non è risparmio osservato nel bilancio di Lamezia.",
    "evidenceStrength": "forte",
    "costsRequirements": "Costi marginali di preparazione e allegazione di un foglio alla comunicazione già inviata; serve revisione legale del contenuto, workflow documentale, misurazione delle date effettive di notifica/pagamento e capacità di testare varianti. La stima degli autori di 12,62 CZK netti per verbale è un calcolo economico contestuale; non si dispone di un costo amministrativo certificato trasferibile all'Italia.",
    "limitations": [
      "La randomizzazione ebbe un errore informatico tra agosto e novembre 2018 e una successiva ripesatura dei gruppi: squilibri temporali e fra telecamere corretti statisticamente, ma non equivalenti a una randomizzazione perfetta lungo tutto il periodo.",
      "Gli effetti causali sono limitati ai pagamenti di verbali da eccesso di velocità in un ente ceco; non dimostrano riduzione delle infrazioni, maggiore sicurezza stradale o maggiore equità.",
      "Il beneficio fiscale è calcolato su ipotesi dei costi di recupero e su maggiori pagamenti osservati; l'analisi non è una valutazione completa del benessere sociale.",
      "Il meccanismo percettivo proviene da una survey randomizzata diversa dai destinatari dei verbali; non è una misurazione psicologica diretta sugli autori delle infrazioni.",
      "Il contesto giuridico ceco prevede una scadenza di 15 giorni e conseguenze diverse da quelle previste dal Codice della strada italiano; risultati e materiali non sono copiabili letteralmente."
    ],
    "unintendedEffects": "Gli autori non stimano direttamente stress o effetti distributivi. Comunicare più visibilmente conseguenze effettive può ridurre sorprese e costi di sollecito ma aumentare pressione sui nuclei con difficoltà di pagamento; messaggi erronei o intimidatori danneggerebbero le garanzie difensive. Nessuna evidenza prodotta sugli effetti della misura sulla sicurezza stradale.",
    "primarySource": {
      "label": "Město Říčany — pagina istituzionale sul controllo della velocità media (Úsekové měření rychlosti)",
      "url": "https://www.ricany.cz/mesto/mestska-policie-ricany/usekove-mereni-rychlosti/"
    },
    "evaluationStudies": [
      {
        "label": "Journal of Policy Analysis and Management — articolo originale open access",
        "url": "https://doi.org/10.1002/pam.22387",
        "citation": "Dušek, L., Pardo, N., & Traxler, C. (2022). Salience and Timely Compliance: Evidence from Speeding Tickets. Journal of Policy Analysis and Management, 41(2), 426–449.",
        "doi": "10.1002/pam.22387"
      }
    ],
    "lastVerifiedAt": "2026-11-02",
    "transferabilityItaly": "Buona per il principio di semplificare senza alterare l'atto sanzionatorio. L'art. 202 del Codice della strada prevede in generale 60 giorni per il pagamento in misura ridotta e, ove applicabile, riduzione del 30% nei primi cinque giorni; esistono eccezioni. Modelli, termini, modalità di ricorso, importi e altre garanzie devono essere verificati dall'ufficio competente; non introdurre nuove sanzioni né privare i destinatari di informazioni obbligatorie. Sviluppare un foglio esplicativo neutro, sempre accompagnato dal verbale legale e con collegamento a pagoPA.",
    "lameziaAdaptation": "Lamezia dispone di un portale Pagamento Infrazioni con ricerca per verbale/targa/data, consultazione dettagli e pagamento pagoPA. Su un campione appropriato di notifiche della Polizia Locale, mantenere invariato e completo il contenuto legale per tutti e randomizzare solo il formato di un foglio informativo aggiuntivo: evidenziare le scadenze italiane realmente applicabili, eventuale sconto 30% entro 5 giorni solo dove previsto, modalità e diritti di ricorso, conseguenze effettive del ritardo e modalità di pagamento tramite portale/pagoPA. Preregistrare esiti a 5/60/100 giorni, tassi di ricorso, reclami, costi e impatti distributivi. Nessun nuovo autovelox necessario, nessuna minaccia eccedente la legge.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "inventario modelli di verbali e revisione del Servizio di Polizia Locale/ufficio legale",
      "date di accertamento, contestazione/notifica, recapito, pagamento e ricorsi in dati minimizzati",
      "accesso a log amministrativi del portale pagoPA e tempi/costi di sollecito",
      "randomizzazione del solo allegato informativo e preregistrazione di outcome e comparatore",
      "accessibilità linguistica e digitale, analisi degli errori di comprensione e salvaguardia dei diritti",
      "audit su pagamenti tempestivi, reclami, ricorsi e differenze socioeconomiche aggregate"
    ],
    "tags": [
      "Říčany",
      "Repubblica Ceca",
      "sanzioni stradali",
      "comunicazioni municipali",
      "riscossione",
      "salience nudge",
      "randomized controlled trial",
      "pre-registrazione",
      "pagamenti puntuali",
      "pagoPA",
      "equità",
      "costi amministrativi"
    ],
    "revisionHistory": [
      {
        "date": "2026-11-02",
        "note": "Nuovo record dopo lettura diretta di studio open access e documentazione municipale. Distinte percentuali relative e punti percentuali, modello fiscale e outcome osservati, glitch della randomizzazione 2018, mancata misura di sicurezza e specificità dell'art. 202 CdS italiano; deduplicazione dei moduli dell'archivio."
      }
    ]
  }
];
