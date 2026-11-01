import type { EvidenceIntervention } from "./evidenceInterventions";

/** Verified 2026-11-01: original RCT, long-run follow-up, and independent 2026 null-outcome trial. */
export const EVIDENCE_INTERVENTIONS_2026_11_01_UGANDA_HEALTH: readonly EvidenceIntervention[] = [
{
  "id": "uganda-rural-district-primary-care-report-cards-monitoring-2005",
  "title": "Uganda: schede di performance e piani condivisi per migliorare l'assistenza sanitaria di prossimità; evidenze contrastanti nella successiva replica",
  "authority": "Dispensari pubblici di nove distretti dell'Uganda; Ministero della Salute partner; intervento facilitato da ONG locali e ricercatori (non iniziativa municipale autonoma)",
  "territory": "Nove distretti rurali, Uganda (unità di intervento: bacini di utenza dei dispensari pubblici)",
  "country": "Uganda",
  "implementationYear": "Dal 2005 per l'esperimento originario; verifica a un anno e follow-up 2007–2009; studio successivo analogo in altri distretti, pubblicato nel 2026",
  "problem": "Scarsa accountability dei servizi sanitari primari: assenze del personale, lunghi tempi di attesa, informazioni limitate sui diritti e sulla performance dei dispensari, utilizzo inadeguato dei servizi preventivi e materno-infantili.",
  "measure": "In 50 dispensari pubblici selezionati in nove distretti, organizzazioni locali hanno presentato ai residenti informazioni confrontabili sulla performance dei servizi e sui diritti degli utenti. In assemblee separate e congiunte, pazienti e operatori hanno discusso criticità locali e concordato piani di miglioramento, verificandone l'attuazione. Un successivo secondo esperimento, in 25 dispensari ulteriori, ha testato una versione partecipativa senza schede di performance.",
  "mechanism": "Combinare informazioni verificabili sugli standard del servizio e momenti di confronto con il personale rende identificabili problemi risolvibili localmente (assenze, orari, code, relazione con i pazienti) e facilita impegni reciproci monitorabili. La sola mobilitazione senza informazioni strutturate può non modificare l'erogazione.",
  "population": "Utenti e operatori dei dispensari pubblici di nove distretti rurali: 50 dispensari nel trial originario e circa 5.000 famiglie oggetto di survey; altri 25 dispensari per il confronto della partecipazione priva di informazioni. Una successiva sperimentazione distinta ha coinvolto 376 centri sanitari in 16 distretti.",
  "primaryArea": "salute_pubblica_locale",
  "secondaryAreas": [
    "partecipazione_democrazia_locale",
    "trasparenza_integrita_anticorruzione",
    "capacita_amministrativa_personale"
  ],
  "interventionTypes": [
    "partecipazione_codesign",
    "informazione_trasparenza",
    "targeting_data_analytics",
    "modifica_organizzativa_processo",
    "partnership_pubblico_privato_terzo_settore"
  ],
  "tools": [
    "report card con risultati di performance e standard dei servizi",
    "assemblee di quartiere con utenti e operatori",
    "piani di azione condivisi e verifica dopo sei mesi",
    "survey di cittadini e dati dei dispensari",
    "monitoraggio di assenze, tempi di attesa, visite e salute infantile"
  ],
  "territorialScale": "Servizio sanitario primario locale e bacino di utenza entro circa cinque chilometri per ogni centro; nove distretti coinvolti.",
  "interventionStatus": "Esperimento originario concluso. La successiva ampia sperimentazione ACT Health è analoga, non identica e in altri centri: non dimostra benefici finali di salute. Non si presume che l'intervento originale sia tuttora in funzione.",
  "evaluationMethod": "Trial randomizzato a cluster in 50 dispensari di nove distretti (intervento informazioni+partecipazione vs controllo), con osservazioni a un anno e follow-up circa quattro anni dopo; secondo trial distinto su 25 dispensari per partecipazione senza informazioni. Evidenza esterna contrastante: Raffler, Posner e Parkerson (Journal of Politics 2026) hanno valutato un intervento analogo in 376 centri/16 distretti con un field experiment, osservando miglioramenti modesti del comportamento dei fornitori ma nessun effetto su utilizzo o salute. Non equiparare la replica esterna al follow-up della stessa popolazione.",
  "comparator": "Per il trial 2005, dispensari pubblici randomizzati al controllo senza intervento; per il trial successivo, gruppi con sola partecipazione e relativi controlli. Lo studio 2026 riguarda un diverso programma e un differente contesto, non lo stesso braccio randomizzato originario.",
  "outcomes": [
    "tasso di mortalità sotto cinque anni e infantile",
    "numero di consultazioni ambulatoriali e parti",
    "assenze del personale e tempi di attesa",
    "accesso a servizi prenatali e pianificazione familiare",
    "qualità organizzativa del dispensario e conoscenza dei diritti",
    "pressione/monitoraggio esercitato dagli utenti",
    "risultati discordanti nell'esperimento esterno pubblicato nel 2026"
  ],
  "results": "Nell'esperimento originario, schede di performance accompagnate da incontri e piani condivisi hanno aumentato l'uso dei servizi e migliorato indicatori organizzativi e di salute; alcuni effetti sono proseguiti circa quattro anni. Il trattamento con sole assemblee, senza informazioni sul servizio, non ha generato miglioramenti analoghi in qualità o outcome sanitari. Cruciale cautela: un esperimento esterno di maggiori dimensioni, pubblicato nel 2026, ha rilevato modesti miglioramenti della condotta dei provider ma non maggior utilizzo né miglioramenti degli esiti sanitari. Non è quindi dimostrata efficacia generalizzabile di questo modello.",
  "effectSize": "Trial originale a un anno: mortalità sotto i cinque anni 97 per 1.000 vs 144 per 1.000 nei controlli (−33% relativo, non −33 punti percentuali); assenteismo del personale −13 punti percentuali (baseline controllo 47%); tempi d'attesa −12 minuti (−9% su 131 minuti). Follow-up circa quattro anni: mortalità under-five −23% e infantile −28% relativamente al controllo; circa 100 visite ambulatoriali mensili aggiuntive (+16% su 650). Trial partecipazione-senza-informazioni: non evidenziati effetti analoghi; RCT esterno pubblicato nel 2026 (376 centri): nessun effetto statisticamente identificato su utilizzo o salute.",
  "evidenceStrength": "moderata",
  "costsRequirements": "Secondo la sintesi J-PAL, il pacchetto integrato originario è costato circa 10.000 USD per centro/comunità in quattro anni, soprattutto per la raccolta dati e la preparazione delle schede: non è il costo annuale di un sistema italiano. Servono accordi formali con autorità sanitarie competenti, dati affidabili, facilitatori imparziali, staff time, risorse per la pubblicazione aggregata e follow-up dei piani concordati.",
  "limitations": [
    "Validità interna del trial originario buona, ma evidenza esterna contrastante: un trial più grande e distinto, pubblicato nel 2026, non trova effetti su mortalità, utilizzo o altri esiti sanitari finali.",
    "Il follow-up a quattro anni riprende le comunità del primo trial e non costituisce una replica indipendente; il trattamento di sola partecipazione mostra effetti nulli nella seconda sperimentazione.",
    "Contesto di sanità rurale ugandese con elevato assenteismo e mortalità infantile non equiparabile alla sanità italiana; le variazioni relative di mortalità non sono previsioni per Lamezia.",
    "Pacchetto composito: informazione, assemblee, facilitazione e piani condivisi non permettono di isolare ogni singola componente; le dinamiche di attuazione contano.",
    "Non è stata verificata una valutazione di costo-efficacia trasferibile alle strutture italiane né la replicabilità degli effetti clinici in Italia.",
    "L'intervento fu facilitato da ONG in dispensari pubblici con Ministero della Salute partner, non progettato autonomamente da una municipalità."
  ],
  "unintendedEffects": "Possibili effetti di stigmatizzazione del personale, sovraccarico di segnalazioni, accessibilità diseguale alla partecipazione e rischi di divulgazione impropria di informazioni sanitarie; non è disponibile una quantificazione causale completa. Il grande trial esterno indica il rischio concreto di investimenti senza benefici finali misurabili.",
  "primarySource": {
    "label": "J-PAL — scheda istituzionale dell'intervento in dispensari pubblici e partnership con Uganda Ministry of Health",
    "url": "https://www.povertyactionlab.org/evaluation/community-based-monitoring-primary-healthcare-providers-uganda"
  },
  "evaluationStudies": [
    {
      "label": "Quarterly Journal of Economics — studio randomizzato originario, 2009",
      "url": "https://doi.org/10.1162/qjec.2009.124.2.735",
      "citation": "Björkman, M. e Svensson, J. (2009), Power to the People: Evidence from a Randomized Field Experiment on Community-Based Monitoring in Uganda, Quarterly Journal of Economics 124(2), 735–769.",
      "doi": "10.1162/qjec.2009.124.2.735"
    },
    {
      "label": "American Economic Journal: Applied Economics — follow-up originario e confronto di componenti, 2017",
      "url": "https://doi.org/10.1257/app.20150027",
      "citation": "Björkman Nyqvist, M., de Walque, D. e Svensson, J. (2017), Experimental Evidence on the Long-Run Impact of Community-Based Monitoring, AEJ: Applied Economics 9(1), 33–69.",
      "doi": "10.1257/app.20150027"
    },
    {
      "label": "Journal of Politics — esperimento più ampio con risultati nulli sugli outcome finali, pubblicato online nel giugno 2026",
      "url": "https://doi.org/10.1086/736577",
      "citation": "Raffler, P. J., Posner, D. N. e Parkerson, D. (2026), Can Citizen Pressure Be Induced to Improve Public Service Provision?, Journal of Politics 88(4), 1386–1402.",
      "doi": "10.1086/736577"
    }
  ],
  "lastVerifiedAt": "2026-11-01",
  "transferabilityItaly": "Media per introdurre schede pubbliche aggregate di qualità dei servizi e tavoli con utenti; bassa per estrapolare riduzioni della mortalità. Le prestazioni sanitarie italiane sono gestite dal SSR e da ASP/ASL, non direttamente dal Comune. Un adattamento richiede intesa istituzionale, rispetto della protezione dei dati e criteri di accessibilità e rappresentatività.",
  "lameziaAdaptation": "Con il Distretto sanitario di Lamezia Terme dell'ASP Catanzaro, URP e rappresentanze di utenti e operatori, sperimentare una scheda aggregata per presidi territoriali su orari, tempi di accesso, reclami risolti e continuità del servizio. Organizzare incontri con verbali, responsabilità e scadenze di soluzione. Avviare un pilota di fattibilità senza claim causali; solo in una fase successiva, su scala ASP e con strutture comparabili, disegnare una valutazione controfattuale degli outcome di servizio. Non utilizzare dati sanitari individuali in pubblicazione.",
  "implementability": "medio_termine",
  "capacityDataNeeds": [
    "accordo con ASP Catanzaro e Distretto di Lamezia Terme",
    "inventario dei presidi e servizi di competenza territoriale",
    "dataset aggregato e documentato su accesso/tempi/continuità",
    "facilitazione indipendente e rappresentanza equilibrata",
    "piano di misurazione con baseline e follow-up",
    "valutazione privacy e minimizzazione, segreto sanitario",
    "eventuale comparatore tra strutture e gestione dei fattori confondenti"
  ],
  "tags": [
    "Uganda",
    "sanità territoriale",
    "dispensari pubblici",
    "community scorecards",
    "accountability",
    "RCT",
    "follow-up",
    "replicazione contrastante",
    "pazienti",
    "partecipazione informata",
    "tempi di attesa",
    "salute infantile"
  ],
  "revisionHistory": [
    {
      "date": "2026-11-01",
      "note": "Nuovo caso: verificati trial 2009, follow-up 2017 e successivo esperimento esterno pubblicato nel 2026 con esiti finali nulli; forza complessiva moderata, senza generalizzazione della riduzione di mortalità."
    }
  ]
}
];
