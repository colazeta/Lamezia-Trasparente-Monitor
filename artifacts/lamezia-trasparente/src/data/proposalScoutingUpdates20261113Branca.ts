import type { PublicProposal } from "./propostePubblicheCore";

const ID = "cinghiali-centro-misure-sicurezza-2026";
const EVENT_ID = "branca-capizzaglie-pulizia-prevenzione-2026-11-12";
const SOURCE_URL = "https://www.lametino.it/ultime/cinghiali-nelle-aree-urbane-a-lamezia-branca-pulizia-e-prevenzione-per-tutelare-i-cittadini.html";

/** Aggiorna l'identificativo preesistente di Branca, senza creare una nuova proposta. */
export function applyScoutingUpdates20261113Branca<T extends PublicProposal>(p: T): T {
  if (p.id !== ID || p.events.some(event => event.id === EVENT_ID)) return p;
  return {
    ...p,
    periodLabel: "6 agosto–12 novembre 2026",
    lastUpdated: "2026-11-12",
    summary: p.summary + " Il 12 novembre 2026 Oscar Branca torna a chiedere azioni continuative, anche per Capizzaglie: rimozione dei rifiuti abbandonati, sfalcio dell'erba, manutenzione delle aree pubbliche e pulizia delle caditoie, in aggiunta al coordinamento sulla fauna selvatica. Il promotore riferisce avvistamenti di cinghiali nel parco di via Giorgio Amendola e richiama una mozione pregressa. Avvistamenti e condizioni ambientali sono dichiarazioni del promotore; un nuovo deposito di mozione o interventi non sono documentati.",
    verificationNote: p.verificationNote +
      " La nota di Oscar Branca del 12 novembre 2026 specifica ulteriori richieste concrete di pulizia e manutenzione continuativa e segnala un nuovo episodio nel parco di via Giorgio Amendola, Capizzaglie. La presenza degli animali, le condizioni igieniche e l'eventuale rapporto causale con rifiuti sono dichiarazioni attribuite al consigliere, non verifiche indipendenti. La fonte richiama una precedente mozione ma non ne fornisce protocollo o testo ufficiale: questo aggiornamento NON prova il deposito della mozione, una risposta o l'avvio di misure. Resta lo stesso promotore e oggetto della proposta del 6 agosto, dunque il proposal ID si conserva. Il destinatario non è un assessment di competenza; quest'ultima non è inferita da altri enti menzionati.",
    events: [
      ...p.events,
      {
        id: EVENT_ID,
        date: "2026-11-12",
        type: "aggiornamento" as const,
        title: "Branca rinnova le richieste di pulizia continuativa e prevenzione dei cinghiali",
        summary: "Dopo un avvistamento riferito a Capizzaglie, il consigliere chiede rimozione dei rifiuti, sfalcio dell'erba, manutenzione degli spazi pubblici e pulizia delle caditoie, insieme a misure coordinate di prevenzione. La mozione richiamata non ha deposito ufficialmente verificato; nessuna attuazione documentata.",
        sourceLabel: "il Lametino — nota del consigliere Oscar Branca, 12 novembre 2026",
        sourceUrl: SOURCE_URL,
        evidenceLevel: "fonte_stampa" as const,
      },
    ],
  } as T;
}
