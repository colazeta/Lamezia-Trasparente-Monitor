import type { EvidenceIntervention } from "./evidenceInterventions";

/** Verified 2026-11-05: ACT 2017 randomised letters; trial ITT vs control, no proven superiority of treatments. */
export const EVIDENCE_INTERVENTIONS_2026_11_05_ACT_FINES: readonly EvidenceIntervention[] = [
{
  "id": "act-canberra-overdue-traffic-parking-fine-letters-rct-2017",
  "title": "Canberra: lettere mirate per la riscossione di sanzioni stradali e di sosta arretrate",
  "authority": "Australian Capital Territory Government — Access Canberra, autorità di gestione delle infrazioni",
  "territory": "Canberra e Australian Capital Territory (ACT), inclusi debitori residenti in New South Wales",
  "country": "Australia",
  "implementationYear": "Novembre 2017 (intervento sperimentale); studio pubblicato in versione definitiva nel 2023",
  "problem": "Accumulo di sanzioni per traffico e sosta non pagate da oltre sei mesi; elevati costi delle procedure di riscossione e incertezza su efficacia delle comunicazioni, specie verso debitori non residenti.",
  "measure": "Esperimento su due lettere integrative inviate a persone con una sola sanzione arretrata: una comunicazione di enforcement rendeva visibile che l'autorità conosceva il debito e che il mancato intervento non lo estingueva; l'altra comunicazione richiamava la norma sociale del pagamento e invitava alla regolarizzazione. Gruppo di controllo senza lettera aggiuntiva oltre agli atti ordinari già ricevuti.",
  "mechanism": "Rendere salienti la tracciabilità di un debito preesistente e le conseguenze già previste dalla legge, oppure la conformità alla norma sociale; ridurre dimenticanza e bassa percezione della probabilità di riscossione senza modificare importo o disciplina della sanzione.",
  "population": "10.702 sanzioni inizialmente eleggibili: titolari 18–65 anni al momento dell'infrazione, una sola sanzione scaduta da oltre 6 mesi e, in principio, meno di 5 anni al 5 novembre 2017, patente ACT o NSW. Campione analitico 10.404 casi, dei quali 875 enforcement, 895 norme sociali, 8.634 controllo; circa 17% con patente e targa ACT.",
  "primaryArea": "fiscalita_entrate_riscossione",
  "secondaryAreas": [
    "mobilita_spazio_pubblico",
    "capacita_amministrativa_personale",
    "trasparenza_integrita_anticorruzione"
  ],
  "interventionTypes": [
    "nudging_comunicazione",
    "informazione_trasparenza",
    "modifica_organizzativa_processo"
  ],
  "tools": [
    "lettere cartacee personalizzate di sollecito",
    "estrazione casuale stratificata dai registri sanzionatori",
    "registri amministrativi dei pagamenti",
    "confronti con controllo senza lettera aggiuntiva",
    "comunicazione accurata di azioni e rimedi consentiti"
  ],
  "territorialScale": "Autorità territoriale ACT; unità di randomizzazione singolo caso/sanzione, con platea ACT e NSW",
  "interventionStatus": "Esperimento concluso nel 2017; esistono ancora procedure ordinarie ACT di promemoria, piani di pagamento e richieste di riesame, ma non è verificato che le due specifiche lettere sperimentali siano oggi in uso.",
  "evaluationMethod": "Natural randomized field experiment, randomizzazione stratificata e analisi dei registri ACT (RCT non annunciato ai destinatari); stime di differenza in media/linear probability models con e senza covariate su pagamenti entro circa 45 giorni. Allocazione iniziale: enforcement 972, norme sociali 986, controllo 8.744; campione analitico 875, 895, 8.634 dopo esclusioni. Studio peer-reviewed del 2023; dettagli puntuali da working paper originale IZA 2021.",
  "comparator": "Debitori comparabili estratti casualmente che avevano già ricevuto gli ordinari avvisi previsti dalla legge, ma non una lettera sperimentale aggiuntiva nel periodo dello studio.",
  "outcomes": [
    "probabilità di pagamento integrale entro fine esperimento",
    "probabilità di pagamento parziale o integrale",
    "importo effettivamente riscosso in AUD",
    "eterogeneità per età, tipo di infrazione, anzianità e importo del debito, residenza",
    "effetti sulla sicurezza stradale non misurati"
  ],
  "results": "Entrambe le lettere aumentano statisticamente i pagamenti rispetto al controllo, ma la partecipazione al pagamento rimane bassa in termini assoluti. Nella versione IZA, specificazione con covariate: enforcement +2,3 punti percentuali pagamenti integrali, +3,2 punti parziali/integrali, +4,99 AUD riscossi per caso; norme sociali +1,7 punti, +1,9 punti e +3,46 AUD. Tutte le stime medie riportate nella Tabella 3 sono significative all'1%. Il controllo registra circa 0,4% di pagamenti parziali/integrali. Nessun miglioramento della sicurezza stradale è stato valutato. Il confronto diretto fra efficacia delle due lettere non ha potenza sufficiente per provare superiorità statistica.",
  "effectSize": "Sinning e Zhang, IZA DP 14252 (2021), Tabella 3 aggiustata, contro nessuna lettera aggiuntiva: enforcement +0,023 pagamenti integrali; +0,032 pagamenti parziali/integrali; +AUD 4,992 per caso (n=9.509 nei confronti). Norme sociali +0,017 integrali; +0,019 parziali/integrali; +AUD 3,462 per caso (n=9.529). p<0,01 per sei coefficienti. I numeri sono tratti dal working paper; il paper peer-reviewed definitivo (2023) conferma qualitativamente i risultati.",
  "evidenceStrength": "forte",
  "costsRequirements": "Il working paper assume 1,15 AUD per lettera per una simulazione di costo-beneficio; non è una spesa comunale italiana accertata. Estrapolazione ipotetica all'intero campione: gettito netto addizionale simulato circa 39.223 AUD per enforcement e 24.553 AUD per norme sociali, non un incasso effettivamente osservato dall'intervento sperimentale. Richiede anagrafica affidabile, tracciamento delle notifiche e pagamenti, verifica degli indirizzi, basi giuridiche per comunicazioni successive, personale e procedure di assistenza/rateazione.",
  "limitations": [
    "Campione selezionato di debitori con una sola sanzione già arretrata; non riguarda le prime notifiche, i contribuenti in generale o persone con numerose sanzioni.",
    "Il controllo ha quota di pagamenti molto bassa (~0,4%): aumenti percentuali relativi elevati non implicano maggioranza di persone adempienti.",
    "Solo ~17% del campione possiede patente e registrazione ACT; per i residenti ACT i risultati non sono significativi. Estensione ad altro contesto non garantita.",
    "Le osservazioni coprono circa 45 giorni dopo le lettere; non è dimostrata persistenza dell'effetto, aumento definitivo del gettito o beneficio sulla sicurezza stradale.",
    "Differenza puntuale tra lettera enforcement e norme sociali NON è dimostrata statisticamente in un confronto diretto sufficientemente potente.",
    "Esclusioni successive all'assegnazione, incluse 147 lettere restituite, 59 piani di pagamento e 18 revoche; interpretare con prudenza eventuale selezione post-randomizzazione.",
    "Le conseguenze legali, poteri di recupero, prescrizione e diritti di ricorso ACT non sono equivalenti al Codice della strada italiano; non trasferire minacce o regimi sanzionatori.",
    "Il rapporto costo-beneficio riportato dagli autori è una proiezione basata sul costo assunto di 1,15 AUD per lettera, non una valutazione fiscale italiana."
  ],
  "unintendedEffects": "Non si identificano causalmente effetti psicologici o distributivi. Rischi plausibili non quantificati: pressione su persone in difficoltà, comunicazioni erronee su debiti prescritti o contestati, costi di notifica inutili, false impressioni di sanzioni ulteriori e spostamento dell'attenzione dalle garanzie di impugnazione.",
  "primarySource": {
    "label": "ACT Government — Access Canberra, disciplina istituzionale delle notifiche, dei pagamenti e dei rimedi delle infrazioni (contesto ufficiale; non documento autonomo della randomizzazione)",
    "url": "https://www.accesscanberra.act.gov.au/driving-transport-and-parking/traffic-and-parking/traffic-and-parking-fines-infringements"
  },
  "evaluationStudies": [
    {
      "label": "Journal of Economic Behavior & Organization — articolo definitivo peer-reviewed (2023)",
      "url": "https://doi.org/10.1016/j.jebo.2023.03.029",
      "citation": "Sinning, M. & Zhang, Y. (2023), Social norms or enforcement? A natural field experiment to improve traffic and parking fine compliance, Journal of Economic Behavior & Organization, 210, 43–60.",
      "doi": "10.1016/j.jebo.2023.03.029"
    },
    {
      "label": "IZA Discussion Paper 14252 — testo integrale della versione precedente, tabelle e appendici",
      "url": "https://docs.iza.org/dp14252.pdf",
      "citation": "Sinning, M. & Zhang, Y. (2021), Social Norms or Enforcement? A Natural Field Experiment to Improve Traffic and Parking Fine Compliance, IZA Discussion Paper 14252."
    },
    {
      "label": "ACT Government — modalità di pagamento/rateizzazione/rimedi",
      "url": "https://www.accesscanberra.act.gov.au/driving-transport-and-parking/traffic-and-parking/ways-to-pay-a-fine-infringement",
      "citation": "Access Canberra, Ways to pay a fine (infringement), documentazione amministrativa consultata il 5 novembre 2026."
    }
  ],
  "lastVerifiedAt": "2026-11-05",
  "transferabilityItaly": "Medio-alta per la progettazione di comunicazioni chiare su sanzioni e crediti locali legittimamente esigibili, NON per replicare poteri di enforcement ACT. Prima verificare Codice della strada, notifica, prescrizione, art. 202 e art. 203, termini di ricorso, normativa privacy e competenze degli agenti di riscossione. Una lettera informativa non deve creare nuove conseguenze legali.",
  "lameziaAdaptation": "Con Ufficio Sanzioni e Contenzioso e Polizia Locale, verificare qualità dei dati sui verbali arretrati e separare crediti esigibili, contestati, rateizzati, definiti/estinti o affidati alla riscossione. Sperimentare, solo sui casi legalmente idonei, un promemoria chiaro con importo aggiornato, identificativo, modalità pagoPA già attive, canali di assistenza, eventuali strumenti di rateizzazione legittimi e diritti di contestazione; confrontare randomicamente due formulazioni informative con il regime ordinario quando giuridicamente possibile. Misurare pagamenti netti entro 45/90 giorni, contestazioni, errori, costo per pagamento e oneri per persone vulnerabili. Verificare le agevolazioni comunali 2026 e i relativi termini prima di qualsiasi messaggio.",
  "implementability": "medio_termine",
  "capacityDataNeeds": [
    "registro delle sanzioni, stato di esigibilità, ricorsi, pagamenti e rimessi alla riscossione",
    "canali notifiche, domicili digitali e indirizzi utilizzabili legittimamente",
    "validazione giuridica di testo, termini, prescrizione e diritto di difesa",
    "tracciamento pagamento pagoPA per coorti e costi unitari del sollecito",
    "eventuale disegno sperimentale preregistrato e controllo equità/discriminazioni",
    "monitoraggio reclami, rimborsi e pagamenti non dovuti"
  ],
  "tags": [
    "Canberra",
    "ACT",
    "Australia",
    "sanzioni stradali",
    "parcheggi",
    "riscossione",
    "arretrati",
    "RCT",
    "nudge",
    "norme sociali",
    "enforcement salience",
    "diritti di ricorso",
    "pagoPA",
    "trasferibilità italiana",
    "Sinning Zhang"
  ],
  "revisionHistory": [
    {
      "date": "2026-11-05",
      "note": "Primo censimento. Verificati studio definitivo Sinning & Zhang (2023), tabella 3 del testo originale IZA (2021), contesto primario Access Canberra e PagoPA Lamezia. Conservate differenze tra effetti sperimentali e proiezioni, potenza insufficiente del confronto diretto, limiti campione e garanzie legali italiane."
    }
  ]
}
];
