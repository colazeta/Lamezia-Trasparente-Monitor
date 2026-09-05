import type { PublicProposal } from "./propostePubblicheCore";

const BELLA_MASI_ID = "quartiere-bella-manutenzione-masi-2026";
const BELLA_MTL_ID = "quartiere-bella-pulizia-mtl-2026";
const SCHOOL_REDUCED_HOURS_ID = "scuole-orario-ridotto-caldo-settembre-2026";
const SCHOOL_POSTPONEMENT_ID = "scuole-posticipo-apertura-petizione-2026";

const BELLA_SOURCE_URL =
  "https://www.lametino.it/ultime/lamezia-maggioranza-su-polemiche-quartiere-bella-interventi-sono-gia-stati-disposti.html";
const SCHOOL_REGION_SOURCE_URL =
  "https://www.regione.calabria.it/avvio-delle-lezioni-e-alte-temperature-micheli-il-calendario-e-definito-ma-lautonomia-scolastica-consente-di-affrontare-anche-situazioni-imprevedibili/";

function updateBellaMasi(proposal: PublicProposal): PublicProposal {
  const eventId = "bella-masi-maggioranza-mandato-multiservizi-3-settembre";
  if (proposal.events.some((event) => event.id === eventId)) return proposal;

  return {
    ...proposal,
    periodLabel: "2–3 settembre 2026",
    lastUpdated: "2026-09-03",
    verificationNote:
      `${proposal.verificationNote} ` +
      "Il 3 settembre i gruppi di maggioranza consiliare hanno dichiarato che il Comune aveva già dato mandato a Lamezia Multiservizi per pulizia, igiene urbana, sfalcio e cura del decoro nel quartiere Bella. La dichiarazione costituisce un aggiornamento politico sullo stesso oggetto, non un atto amministrativo di affidamento né evidenza dell'esecuzione. Non documenta inoltre interventi sul manto stradale, la messa in sicurezza temporanea o il riscontro scritto richiesti nella diffida di Masi. Non viene inferito un nesso causale tra la diffida e gli interventi annunciati.",
    events: [
      ...proposal.events,
      {
        id: eventId,
        date: "2026-09-03",
        type: "aggiornamento",
        title: "La maggioranza riferisce un mandato a Multiservizi per pulizia e sfalcio",
        summary:
          "I gruppi di maggioranza consiliare dichiarano che il Comune aveva già dato mandato a Lamezia Multiservizi per pulizia, igiene urbana, sfalcio e cura del decoro nel quartiere. La fonte non è un atto amministrativo e non prova l'esecuzione degli interventi; non copre le ulteriori misure viarie e di sicurezza richieste da Masi.",
        sourceLabel: "il Lametino",
        sourceUrl: BELLA_SOURCE_URL,
        evidenceLevel: "fonte_stampa",
      },
    ],
  };
}

function updateBellaMtl(proposal: PublicProposal): PublicProposal {
  const eventId = "bella-mtl-maggioranza-mandato-multiservizi-3-settembre";
  if (proposal.events.some((event) => event.id === eventId)) return proposal;

  return {
    ...proposal,
    periodLabel: "2–3 settembre 2026",
    lastUpdated: "2026-09-03",
    verificationNote:
      `${proposal.verificationNote} ` +
      "Il 3 settembre i gruppi di maggioranza consiliare hanno dichiarato che il Comune aveva già dato mandato a Lamezia Multiservizi per pulizia, igiene urbana, sfalcio e cura del decoro. MTL ha successivamente riferito di avere appreso che gli interventi sarebbero partiti il giorno seguente. Queste dichiarazioni vengono registrate come aggiornamento, senza inferire attuazione, completamento o causalità rispetto alla segnalazione: nello scouting non è stato reperito un atto amministrativo o un riscontro ufficiale dell'esecuzione.",
    events: [
      ...proposal.events,
      {
        id: eventId,
        date: "2026-09-03",
        type: "aggiornamento",
        title: "Annunciati interventi di pulizia e sfalcio nel quartiere Bella",
        summary:
          "I gruppi di maggioranza consiliare dichiarano che il Comune aveva già disposto a Lamezia Multiservizi pulizia, igiene urbana, sfalcio e cura del decoro; MTL riferisce poi che gli interventi sarebbero iniziati il giorno seguente. Il dataset non tratta l'annuncio come evidenza di attuazione o completamento.",
        sourceLabel: "il Lametino",
        sourceUrl: BELLA_SOURCE_URL,
        evidenceLevel: "fonte_stampa",
      },
    ],
  };
}

function updateSchoolReducedHours(proposal: PublicProposal): PublicProposal {
  const eventId = "scuole-regione-chiarimento-autonomia-3-settembre";
  if (proposal.events.some((event) => event.id === eventId)) return proposal;

  return {
    ...proposal,
    periodLabel: "31 agosto–3 settembre 2026",
    lastUpdated: "2026-09-03",
    linkedActs: Array.from(
      new Set([
        ...proposal.linkedActs,
        "DPGR Calabria n. 32 del 27/04/2026 — calendario scolastico 2026/2027",
      ]),
    ),
    verificationNote:
      `${proposal.verificationNote} ` +
      "Il 3 settembre la Regione Calabria ha confermato il 15 settembre come data regionale di avvio delle lezioni e ha chiarito che le singole istituzioni scolastiche possono deliberare adattamenti motivati del proprio calendario nell'esercizio dell'autonomia, nel rispetto del monte ore e con le comunicazioni previste. Il chiarimento è rilevante per la fattibilità della proposta di orario ridotto, ma non costituisce una decisione sulla specifica richiesta lametina e non prova che scuole cittadine abbiano adottato la misura.",
    events: [
      ...proposal.events,
      {
        id: eventId,
        date: "2026-09-03",
        type: "aggiornamento",
        title: "La Regione chiarisce il ruolo dell'autonomia scolastica negli adattamenti",
        summary:
          "La Regione conferma il calendario con avvio il 15 settembre e ricorda che le singole istituzioni scolastiche possono deliberare adattamenti motivati del calendario d'istituto. Il chiarimento non equivale all'adozione di un orario ridotto nelle scuole di Lamezia.",
        sourceLabel: "Regione Calabria",
        sourceUrl: SCHOOL_REGION_SOURCE_URL,
        evidenceLevel: "fonte_ufficiale",
      },
    ],
  };
}

function updateSchoolPostponement(proposal: PublicProposal): PublicProposal {
  const eventId = "scuole-petizione-regione-calendario-3-settembre";
  if (proposal.events.some((event) => event.id === eventId)) return proposal;

  return {
    ...proposal,
    periodLabel: "1–3 settembre 2026",
    lastUpdated: "2026-09-03",
    linkedActs: Array.from(
      new Set([
        ...proposal.linkedActs,
        "DPGR Calabria n. 32 del 27/04/2026 — calendario scolastico 2026/2027",
      ]),
    ),
    verificationNote:
      `${proposal.verificationNote} ` +
      "Il 3 settembre la Regione Calabria ha confermato che il calendario regionale resta fissato con avvio delle lezioni il 15 settembre, distinguendo una modifica generalizzata — che richiederebbe un nuovo intervento regionale — dagli adattamenti deliberabili dalle singole scuole. La comunicazione regionale non cita la petizione lametina e non viene quindi registrata come rigetto della petizione o come risposta formale al promotore. Non è stato verificato l'avvenuto deposito o trasmissione della raccolta firme.",
    events: [
      ...proposal.events,
      {
        id: eventId,
        date: "2026-09-03",
        type: "aggiornamento",
        title: "La Regione conferma il 15 settembre per il calendario generale",
        summary:
          "La Regione conferma il 15 settembre come data generale di avvio e precisa che una modifica generalizzata richiederebbe un nuovo intervento regionale, mentre le singole scuole possono valutare adattamenti nell'ambito della propria autonomia. La comunicazione non cita né decide la petizione lametina.",
        sourceLabel: "Regione Calabria",
        sourceUrl: SCHOOL_REGION_SOURCE_URL,
        evidenceLevel: "fonte_ufficiale",
      },
    ],
  };
}

/**
 * Incremental updates to proposals already present before the 4 September
 * scouting. Each updater is idempotent and extends the original timeline rather
 * than creating a second proposal for the same promoter/object/thread.
 */
export function applyScoutingUpdates20260904(
  proposal: PublicProposal,
): PublicProposal {
  if (proposal.id === BELLA_MASI_ID) return updateBellaMasi(proposal);
  if (proposal.id === BELLA_MTL_ID) return updateBellaMtl(proposal);
  if (proposal.id === SCHOOL_REDUCED_HOURS_ID) {
    return updateSchoolReducedHours(proposal);
  }
  if (proposal.id === SCHOOL_POSTPONEMENT_ID) {
    return updateSchoolPostponement(proposal);
  }
  return proposal;
}
