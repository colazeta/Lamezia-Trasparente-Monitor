import type { PublicProposal } from "./propostePubblicheCore";

const BELLA_MASI_ID = "quartiere-bella-manutenzione-masi-2026";
const BELLA_MTL_ID = "quartiere-bella-pulizia-mtl-2026";
const FNA_ID = "fna-disabilita-gravissima-bando-futuro-nazionale-2026";

const BELLA_MULTISERVIZI_SOURCE_URL =
  "https://www.lametino.it/ultimora/interventi-programmati-a-ridosso-delle-feste-per-garantire-zone-pulite-e-decorose-le-precisazioni-della-lamezia-multiservizi.html";
const FNA_ADMIN_SOURCE_URL =
  "https://www.lametino.it/ultime/lamezia-gianturco-disabilita-gravissima-al-via-il-nuovo-percorso-del-servizio.html";
const FNA_PROMOTER_SOURCE_URL =
  "https://www.cityonelamezia.it/fna-cristiano-e-villella-i-fondi-ci-sono-ma-le-famiglie-non-possono-accedervi-e-questo-il-problema/";

function updateBella(
  proposal: PublicProposal,
  variant: "masi" | "mtl",
): PublicProposal {
  const eventId = `bella-${variant}-multiservizi-programmazione-4-settembre`;
  if (proposal.events.some((event) => event.id === eventId)) return proposal;

  const isMasi = variant === "masi";
  return {
    ...proposal,
    periodLabel: "2–4 settembre 2026",
    lastUpdated: "2026-09-04",
    verificationNote:
      `${proposal.verificationNote} ` +
      "Il 4 settembre Lamezia Multiservizi ha precisato che pulizia, spazzamento e cura del verde in occasione delle ricorrenze religiose rientrano in una programmazione ordinaria predisposta dai responsabili aziendali e che, per la Festa della Madonna di Porto Salvo del 9 settembre, gli interventi sulle strade interessate erano programmati per il 7 e l'8 settembre. La società riconosce le segnalazioni di cittadini, Amministrazione e consiglieri come contributi utili, ma esclude che le attività ricorrenti dipendano esclusivamente da tali segnalazioni. Il record tratta quindi la nota come programmazione annunciata, non come prova dell'avvenuta esecuzione e senza attribuire causalità alla proposta. " +
      (isMasi
        ? "Restano non documentati, rispetto alla diffida di Masi, il ripristino del manto stradale, la messa in sicurezza temporanea e il riscontro scritto richiesto."
        : "Non è stata ancora verificata l'esecuzione degli interventi programmati né il loro completamento."),
    events: [
      ...proposal.events,
      {
        id: eventId,
        date: "2026-09-04",
        type: "aggiornamento",
        title: "Multiservizi indica la programmazione degli interventi per la festa di Porto Salvo",
        summary:
          "Lamezia Multiservizi afferma che pulizia, spazzamento e cura del verde per le ricorrenze rientrano nella programmazione ordinaria e indica, per la Festa della Madonna di Porto Salvo del 9 settembre, interventi programmati il 7 e l'8 settembre. La nota non prova che gli interventi siano già stati eseguiti e non viene usata per attribuire un nesso causale alla proposta.",
        sourceLabel: "Lamezia Multiservizi via il Lametino",
        sourceUrl: BELLA_MULTISERVIZI_SOURCE_URL,
        evidenceLevel: "fonte_stampa",
      },
    ],
  };
}

function updateFna(proposal: PublicProposal): PublicProposal {
  const adminEventId = "fna-amministrazione-cronologia-nuovo-percorso-4-settembre";
  const promoterEventId = "fna-futuro-nazionale-ribadisce-accesso-beneficio-4-settembre";

  const events = [...proposal.events];
  if (!events.some((event) => event.id === adminEventId)) {
    events.push({
      id: adminEventId,
      date: "2026-09-04",
      type: "risposta_istituzionale",
      title: "L'Amministrazione ricostruisce il nuovo percorso FNA e gli adempimenti in corso",
      summary:
        "L'assessore al Welfare Mimmo Gianturco ricostruisce la sequenza regionale e comunale: linee di indirizzo del 9 giugno, Decreto Dirigenziale n. 11315 del 25 giugno, protocollo comunale della notifica e delle linee operative il 27 luglio e protocollo del successivo decreto sull'Accordo interistituzionale il 27 agosto. Precisa che il nuovo modello attribuisce un ruolo centrale agli ATS in raccordo con ASP e Distretto e richiede passaggi amministrativi e sociosanitari ancora in corso. La risposta non documenta la pubblicazione dell'avviso né l'accesso effettivo al beneficio.",
      sourceLabel: "Amministrazione comunale / il Lametino",
      sourceUrl: FNA_ADMIN_SOURCE_URL,
      evidenceLevel: "fonte_stampa",
    });
  }

  if (!events.some((event) => event.id === promoterEventId)) {
    events.push({
      id: promoterEventId,
      date: "2026-09-04",
      type: "aggiornamento",
      title: "Futuro Nazionale ribadisce la richiesta di rendere accessibile il beneficio",
      summary:
        "Massimo Cristiano e Carmine Villella prendono atto della risposta dell'Amministrazione ma ribadiscono che il punto della proposta è l'accesso concreto delle famiglie al beneficio; chiedono che la macchina amministrativa predisponga rapidamente gli atti necessari. La nota non viene registrata come nuova proposta, perché aggiorna lo stesso promotore, oggetto e filone del 3 settembre.",
      sourceLabel: "Futuro Nazionale via City One",
      sourceUrl: FNA_PROMOTER_SOURCE_URL,
      evidenceLevel: "fonte_stampa",
    });
  }

  if (events.length === proposal.events.length) return proposal;

  return {
    ...proposal,
    periodLabel: "3–4 settembre 2026",
    lastUpdated: "2026-09-04",
    verificationNote:
      `${proposal.verificationNote} ` +
      "Il 4 settembre l'Amministrazione comunale ha fornito una risposta pubblica sulla cronologia del nuovo modello FNA: il Comune ha protocollato il 27 luglio la notifica del D.D. n. 11315 e le linee operative e il 27 agosto il successivo decreto regionale relativo all'Accordo interistituzionale; gli adempimenti amministrativi e sociosanitari risultano dichiarati in itinere. La risposta conferma un seguito istituzionale ma non documenta la pubblicazione dell'avviso, l'apertura dell'accesso al beneficio, un'erogazione o altra evidenza di attuazione. Futuro Nazionale ha quindi ribadito la stessa richiesta, chiedendo la rapida predisposizione degli atti necessari: l'intervento è registrato nella medesima timeline e non come nuova proposta.",
    events,
  };
}

/**
 * Scouting del 5 settembre 2026: sviluppi emersi il 4 settembre.
 * Gli updater sono idempotenti e aggiornano le timeline esistenti senza creare
 * duplicati per promotore, oggetto e filone.
 */
export function applyScoutingUpdates20260905(
  proposal: PublicProposal,
): PublicProposal {
  if (proposal.id === BELLA_MASI_ID) return updateBella(proposal, "masi");
  if (proposal.id === BELLA_MTL_ID) return updateBella(proposal, "mtl");
  if (proposal.id === FNA_ID) return updateFna(proposal);
  return proposal;
}
