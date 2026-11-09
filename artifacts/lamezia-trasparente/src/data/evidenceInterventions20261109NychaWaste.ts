import type { EvidenceIntervention } from "./evidenceInterventions";

/** Verified 2026-11-09: NYCHA official action plan and peer-reviewed cluster-randomised field study. */
export const EVIDENCE_INTERVENTIONS_2026_11_09_NYCHA_WASTE: readonly EvidenceIntervention[] = [
{
  "id": "new-york-nycha-2019-convenient-waste-containers-signage-rct",
  "title": "New York: contenitori accessibili e segnaletica chiara riducono sacchi e rifiuti abbandonati nell'edilizia pubblica",
  "authority": "New York City Housing Authority (NYCHA), in collaborazione con ideas42",
  "territory": "New York City, complessi di edilizia pubblica NYCHA nei cinque borough",
  "country": "Stati Uniti",
  "implementationYear": "2019 (sperimentazione operativa; studio pubblicato il 7 maggio 2021)",
  "problem": "Accumulo di sacchi domestici e rifiuti visibili nelle aree comuni dei complessi di edilizia residenziale pubblica. Regole poco comprensibili, contenitori scomodi o distanti e attriti pratici ostacolavano il conferimento regolare.",
  "measure": "Collocazione di contenitori per sacchi domestici di maggiore capacità (tilt-truck bins da mezza iarda cubica) in punti più comodi, disponibilità di piccoli cestini per rifiuti minuti e poster chiari negli spazi interni ed esterni per spiegare dove e come conferire. Il pacchetto è stato assegnato casualmente a 27 complessi su 53, con 26 complessi di controllo.",
  "mechanism": "Ridurre i costi pratici, informativi e psicologici del comportamento corretto: la destinazione dei rifiuti è più raggiungibile e riconoscibile, con messaggi leggibili collegati all'infrastruttura reale. Intervento congiunto su contesto e istruzioni, non soltanto una campagna di comunicazione.",
  "population": "Residenti e personale operativo di 53 complessi NYCHA; osservazioni aggregate in 79 siti di misurazione; non è un esperimento randomizzato sui singoli residenti.",
  "primaryArea": "rifiuti_pulizia_urbana",
  "secondaryAreas": [
    "welfare_inclusione_servizi_sociali",
    "capacita_amministrativa_personale",
    "ambiente_clima_energia"
  ],
  "interventionTypes": [
    "infrastruttura_fisica",
    "nudging_comunicazione",
    "modifica_organizzativa_processo",
    "partecipazione_codesign",
    "partnership_pubblico_privato_terzo_settore"
  ],
  "tools": [
    "contenitori di grandi dimensioni collocati in punti di conferimento comodi",
    "cestini per piccoli rifiuti",
    "poster esplicativi in edifici e spazi esterni",
    "osservazioni settimanali standardizzate di sacchi e litter",
    "randomizzazione a livello di complesso e registrazione della settimana di installazione"
  ],
  "territorialScale": "Complessi di edilizia pubblica e relativi spazi comuni: 53 cluster residenziali, suddivisi in 79 siti osservati.",
  "interventionStatus": "Trial completato nel 2019 e valutato nel 2021. Il piano NYCHA 2021 ha recepito l'esigenza di facilitare i conferimenti e coinvolgere i residenti; non è accertato che il medesimo pacchetto sperimentale sia oggi attivo ovunque.",
  "evaluationMethod": "Cluster randomized controlled trial: 53 developments assegnati a trattamento (27) o controllo (26), osservati settimanalmente per 21 settimane in 79 sotto-siti. Le analisi del cambiamento osservato usano conteggi pre/post e una specificazione difference-in-differences per siti e settimane; l'installazione del trattamento non è avvenuta in tutti i cluster contemporaneamente.",
  "comparator": "26 complessi NYCHA assegnati casualmente al gruppo di controllo, con rilevazioni della stessa tipologia e periodo; confronto pre/post tra gruppi per conteggi osservabili.",
  "outcomes": [
    "numero medio di sacchi domestici visibili abbandonati negli spazi comuni",
    "numero medio di rifiuti minuti (litter) visibili a terra"
  ],
  "results": "Nei siti sottoposti al pacchetto di nuovi contenitori e poster, i conteggi medi di sacchi visibili sono risultati inferiori del 25% e quelli di rifiuti minuti del 16% rispetto al controfattuale stimato (per entrambi p<0,05). È un risultato relativo alla pulizia visibile dei complessi e NON equivale a una riduzione del 25% del totale dei rifiuti prodotti, della TARI o a un aumento della raccolta differenziata.",
  "effectSize": "Sacchi domestici visibili −25% (p<0,05); litter visibile −16% (p<0,05); dimensioni percentuali RELATIVE, non punti percentuali. 53 complessi (27 trattamento, 26 controllo), 79 siti di osservazione, serie settimanali su 21 settimane.",
  "evidenceStrength": "forte",
  "costsRequirements": "Costi unitari dell'esperimento non verificati nelle fonti originali consultate: NON imputare al trial gli stanziamenti pluriennali dell'intero piano NYCHA. Sono richiesti acquisto/posizionamento di contenitori compatibili con la logistica di ritiro, materiali informativi, sopralluoghi, manutenzione, personale di raccolta e misurazioni replicate; possibili adeguamenti a regolamenti condominiali e gestione contrattuale.",
  "limitations": [
    "La randomizzazione riguarda 53 complessi e non individui; l'inferenza deve considerare i cluster e le differenze fra complessi.",
    "I 21 cicli di osservazione documentano un effetto a breve periodo, non persistenza pluriennale.",
    "Contenitori e poster sono introdotti insieme: non si può attribuire causalmente l'effetto alla sola comunicazione o alla sola infrastruttura.",
    "La collocazione e il calendario reale di installazione potrebbero introdurre eterogeneità nell'effettiva esposizione al trattamento.",
    "Outcome misurati come rifiuti VISIBILI negli spazi comuni; non direttamente volume complessivo conferito, riciclo, costi, infestazioni o esiti sanitari.",
    "NYCHA gestisce complessi residenziali ad alta densità con sistemi di conferimento diversi dal porta a porta comunale di Lamezia: serve adattamento, non replica meccanica."
  ],
  "unintendedEffects": "Non quantificati con sufficiente affidabilità: possibili ostruzioni dei percorsi, accesso improprio ai contenitori e costi di manutenzione vanno misurati localmente. Nessuna prova causale sulle infestazioni o riduzioni dei costi del servizio.",
  "primarySource": {
    "label": "NYCHA — Pest and Waste Management Action Plan, 26 gennaio 2021, §V.B.2 (27 trattati, 26 controlli)",
    "url": "https://www.nyc.gov/assets/nycha/downloads/pdf/NYCHA-Pest-and-Waste-Management-Action-Plan-1.26.21.pdf"
  },
  "evaluationStudies": [
    {
      "label": "Journal of Behavioral Public Administration — studio originale open access",
      "url": "https://journal-bpa.org/index.php/jbpa/article/view/202",
      "citation": "Flanagan, S. V., Saho, N., Nagulapally, D. & Darling, M. (2021), Designing to minimize the administrative burden of trash disposal: Evidence from a randomized controlled trial in New York City public housing, Journal of Behavioral Public Administration, 4(2)",
      "doi": "10.30636/jbpa.42.202"
    }
  ],
  "lastVerifiedAt": "2026-11-09",
  "transferabilityItaly": "Trasferibile come principio di progettazione del servizio e di riduzione degli ostacoli al corretto conferimento, soprattutto in edilizia residenziale pubblica e condomìni con aree comuni. Necessari accordi con gestori e amministratori, coerenza con la raccolta per frazione, accessibilità e autorizzazioni per posizionare i contenitori.",
  "lameziaAdaptation": "In collaborazione con Lamezia Multiservizi e, dove rilevante, con ATERP/amministratori condominiali, verificare alcuni insediamenti con rifiuti frequentemente fuori dai punti consentiti. Mappare i tragitti dei residenti, giorni di raccolta e capacità dei contenitori; proporre segnaletica sintetica specifica per zona e un punto di deposito/attesa compatibile con il servizio (NON sostituire il porta a porta senza validazione). Introdurre il pacchetto gradualmente in micro-aree comparabili; osservare sacchi abbandonati, litter, raccolte straordinarie e costi con comparatore.",
  "implementability": "medio_termine",
  "capacityDataNeeds": [
    "mappa e titolarità dei punti di raccolta, spazi condominiali e accessibilità",
    "calendari ufficiali Multiservizi e regole sulle frazioni",
    "base line di sacchi e litter visibili per area e settimana",
    "registri di raccolta straordinaria, pulizia e reclami",
    "accordi gestore, ATERP e amministratori, approvvigionamento e manutenzione",
    "protocollo di valutazione controfattuale e controlli sui cambiamenti del servizio"
  ],
  "tags": [
    "NYCHA",
    "New York City",
    "rifiuti urbani",
    "decoro",
    "edilizia residenziale pubblica",
    "admin burden",
    "infrastruttura di conferimento",
    "co-design",
    "cluster RCT",
    "litter",
    "sacchi abbandonati"
  ],
  "revisionHistory": [
    {
      "date": "2026-11-09",
      "note": "Prima verifica su articolo scientifico originale, DOI e Action Plan ufficiale NYCHA; precisati controfattuale, outcome fisici e limiti di trasferibilità."
    }
  ]
}
];
