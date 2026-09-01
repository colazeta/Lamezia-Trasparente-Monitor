import type { PublicProposal } from "./propostePubblicheCore";

const ASILI_ID = "asili-nido-continuita-servizio-2026";
const GRANDINETTI_ID = "ex-cinema-grandinetti-bonifica-2026";
const PROGETTO_VITA_ID = "politiche-sociali-progetto-vita-2026";

function updateAsili(proposal: PublicProposal): PublicProposal {
  const linkedActs = Array.from(
    new Set([
      ...proposal.linkedActs,
      "Determinazione dirigenziale R.G. n. 1308 del 13/08/2026 — Albo Pretorio n. 2026/2689 (presa d'atto)",
      "Determinazione dirigenziale R.G. n. 1326 del 17/08/2026 — Albo Pretorio n. 2026/2719 (impegno spesa; voce n. 246)",
    ]),
  );

  const alreadyUpdated = proposal.events.some(
    (event) => event.id === "asili-nido-masi-controreplica-29-agosto",
  );

  return {
    ...proposal,
    periodLabel: "26–29 agosto 2026",
    lastUpdated: "2026-08-29",
    linkedActs,
    verificationNote:
      `${proposal.verificationNote} ` +
      "Il 29 agosto Masi ha pubblicato una controreplica che amplia i quesiti già confluiti nell'interrogazione urgente. La verifica sull'Albo Pretorio richiede una cautela puntuale: la stampa richiama una 'Determinazione n. 246 del 13 agosto', mentre l'archivio ufficiale associa al 13 agosto la determinazione R.G. n. 1308 (pubblicazione 2026/2689, voce n. 245, presa d'atto) e al 17 agosto la determinazione R.G. n. 1326 (pubblicazione 2026/2719, voce n. 246, impegno spesa). Il dataset collega entrambi gli atti ufficiali e non tratta come verificata l'associazione numero-data riportata nel comunicato.",
    events: alreadyUpdated
      ? proposal.events
      : [
          ...proposal.events,
          {
            id: "asili-nido-masi-controreplica-29-agosto",
            date: "2026-08-29",
            type: "aggiornamento",
            title: "Masi amplia i quesiti dopo la risposta dell'Amministrazione",
            summary:
              "Nella controreplica alla nota di Gianturco, Masi chiede di chiarire la causa concreta del mancato avvio, il significato dell'“integrazione dell'efficacia dell'aggiudicazione” richiamata per il 25 agosto, i soggetti indicati come “più enti” coinvolti, la mancata informazione al Consiglio del 13 agosto e le misure di continuità effettivamente valutate o adottate. La nota richiama inoltre atti della procedura che vengono verificati separatamente sull'Albo Pretorio.",
            sourceLabel: "il Lametino",
            sourceUrl:
              "https://www.lametino.it/ultime/lamezia-masi-pd-su-asili-nido-comunali-non-un-incidente-tecnico-fallimento-di-programmazione-gestione-e-trasparenza.html",
            evidenceLevel: "fonte_stampa",
          },
        ],
  };
}

function updateGrandinetti(proposal: PublicProposal): PublicProposal {
  const approvalEventId = "grandinetti-mozione-approvata-13-agosto";
  const implementationEventId = "grandinetti-sicurezza-risorse-18-agosto";
  const hasApproval = proposal.events.some((event) => event.id === approvalEventId);
  const hasImplementation = proposal.events.some(
    (event) => event.id === implementationEventId,
  );

  const newEvents = [...proposal.events];
  if (!hasApproval) {
    newEvents.push({
      id: approvalEventId,
      date: "2026-08-13",
      type: "discussione",
      title: "La mozione viene approvata in Consiglio comunale",
      summary:
        "Una successiva comunicazione pubblica della proponente riferisce che il Consiglio comunale del 13 agosto ha approvato la mozione sull'ex Cinema Grandinetti. La fonte stampa descrive l'approvazione come unanime, ma non è stato reperito nello scouting il verbale o l'atto consiliare che consenta di ricostruire autonomamente il voto.",
      sourceLabel: "LameziaTerme.it",
      sourceUrl:
        "https://www.lameziaterme.it/ex-cinema-grandinetti-vescio-mozione-da-primi-risultati/",
      evidenceLevel: "fonte_stampa",
    });
  }
  if (!hasImplementation) {
    newEvents.push({
      id: implementationEventId,
      date: "2026-08-18",
      type: "recepimento",
      title: "Messa in sicurezza dell'area e aggiornamento sul progetto di recupero",
      summary:
        "Vescio riferisce che l'area è stata messa in sicurezza dopo la presentazione della mozione e che nel dibattito consiliare sono state illustrate risorse per la riqualificazione. Nello stesso quadro pubblico viene richiamata la fase operativa del programma PN Metro Plus per il recupero dell'ex Cinema Grandinetti. Il dataset non attribuisce alla mozione la genesi del finanziamento, già programmato.",
      sourceLabel: "City One",
      sourceUrl:
        "https://www.cityonelamezia.it/recupero-cinema-grandineti-sambiase-fdi-un-nuovo-tassello-per-valorizzare-il-patrimonio-comunale/",
      evidenceLevel: "fonte_stampa",
    });
  }

  return {
    ...proposal,
    status: "recepita_parzialmente",
    lastUpdated: "2026-08-18",
    verificationNote:
      `${proposal.verificationNote} ` +
      "Fonti stampa del 18 agosto riportano che la mozione è stata approvata nel Consiglio del 13 agosto e che l'area è stata messa in sicurezza. Le stesse fonti richiamano risorse e un percorso PN Metro Plus già destinato al recupero dell'immobile: il dataset registra questi fatti come sviluppo della traiettoria, senza inferire che il finanziamento sia conseguenza della mozione. Non è stato reperito in questo scouting il verbale consiliare con l'esito puntuale della votazione.",
    events: newEvents,
  };
}

function updateProgettoVita(proposal: PublicProposal): PublicProposal {
  const eventId = "progetto-vita-informativa-amministrazione-14-agosto";
  if (proposal.events.some((event) => event.id === eventId)) return proposal;

  return {
    ...proposal,
    lastUpdated: "2026-08-14",
    verificationNote:
      `${proposal.verificationNote} ` +
      "Il Comune ha pubblicato il 14 agosto un'informativa istituzionale sui Progetti di Vita, riferendo dati comunicati nel Consiglio del 13 agosto, risorse disponibili, il protocollo ATS-ASP e il percorso di revisione dei tavoli tematici. L'evento viene registrato come risposta istituzionale sul medesimo filone; la fonte non consente di attribuire tali attività causalmente alla mozione né di considerarla formalmente recepita.",
    events: [
      ...proposal.events,
      {
        id: eventId,
        date: "2026-08-14",
        type: "risposta_istituzionale",
        title: "Il Comune aggiorna su Progetti di Vita, risorse e rete territoriale",
        summary:
          "L'Amministrazione riferisce 142 Progetti di Vita già sottoscritti e attivati e 18 in attesa di sottoscrizione; comunica inoltre risorse regionali e nazionali disponibili, il protocollo ATS-ASP del 31 dicembre 2025 e l'avvio della revisione dei tavoli tematici con coinvolgimento di associazioni e Terzo settore.",
        sourceLabel: "Comune di Lamezia Terme",
        sourceUrl:
          "https://www.comune.lamezia-terme.cz.it/it/news/115163/lamezia-amministrazione-comunale-su-disabilita-sottoscritti-142-progetti-di-vita-ora-rafforziamo-la-rete-territoriale",
        evidenceLevel: "fonte_ufficiale",
      },
    ],
  };
}

/**
 * Incremental updates to already-censused proposals.
 *
 * This layer is intentionally separate from the core dataset: when new evidence
 * concerns the same promoter/object/thread, the proposal is enriched instead of
 * being duplicated. It also lets daily scouting remain reviewable in small diffs.
 */
export function applyScoutingUpdates(proposal: PublicProposal): PublicProposal {
  if (proposal.id === ASILI_ID) return updateAsili(proposal);
  if (proposal.id === GRANDINETTI_ID) return updateGrandinetti(proposal);
  if (proposal.id === PROGETTO_VITA_ID) return updateProgettoVita(proposal);
  return proposal;
}
