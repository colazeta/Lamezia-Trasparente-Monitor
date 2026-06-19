# Gate QA UX/copy per readiness v0

Questo gate collega #528 alla readiness v0. È una checklist manuale, locale e documentale: non introduce nuove fonti, non cambia UI, non fa scraping e non trasforma segnali amministrativi in conclusioni.

Eseguire il gate per ogni route pubblica o sperimentale indicata in `docs/launch-v0/v0-routes.json` quando `humanCheckRequired` è `true`. Usare insieme:

- tassonomia sezioni: `docs/launch-v0/section-taxonomy-v0.md`;
- guida copy prudente: `docs/launch-v0/civic-copy-style-guide.md`;
- contratto route: `docs/launch-v0/route-contract.md`.

## Esito del gate

Una route supera la QA UX/copy solo se tutti i punti sotto sono verificati. Se un punto non è verificabile, segnare la route come `GO_WITH_LIMITS` e aprire un follow-up circoscritto invece di correggere a intuito.

| Controllo | Cosa verificare | Esito atteso |
| --- | --- | --- |
| Label pubblica chiara | Il titolo o la label della sezione sono comprensibili fuori dal team e coerenti con la tassonomia v0. | L'utente capisce il tema senza acronimi non spiegati o promesse di completezza. |
| Stato v0 comunicato | Demo, fixture, sezione sperimentale, area riservata o pubblicabile sono dichiarati quando rilevanti. | L'utente distingue contenuti pubblicabili, sperimentali, dimostrativi e non disponibili. |
| Nota fonti/limiti | La pagina o il percorso collegato mostra fonte, perimetro, data/stato di verifica o limite informativo quando applicabile. | La lettura resta documentale e non promette copertura totale. |
| CTA non fuorviante | Pulsanti e link descrivono l'azione reale disponibile. | La CTA non suggerisce dati ufficiali, completi, live o verificati se il perimetro non lo consente. |
| Linguaggio dati mancanti | Empty state, dati assenti o valori non rilevati usano formule prudenti. | L'assenza è descritta come `dato non rilevato`, `fonte non ancora collegata` o limite equivalente, non come prova di omissione. |
| Guardrail copy cauto | Non compaiono claim definitivi o termini accusatori non attribuiti a una fonte competente. | Indicatori, pattern e ricorrenze restano segnali documentali da verificare. |

## Formule operative consigliate

- Per stati vuoti: `Dato non rilevato nella fonte consultata al perimetro indicato.`
- Per fixture/demo: `Contenuto dimostrativo, non riferito a un atto reale salvo diversa indicazione.`
- Per sezioni sperimentali: `Sezione sperimentale: struttura e contenuti servono a orientare la consultazione, non rappresentano ancora copertura consolidata.`
- Per CTA: preferire `Consulta`, `Apri`, `Leggi`, `Verifica nella fonte` a formule che promettono completamento o ufficialità.

## Registrazione nella readiness

`pnpm run v0:readiness` deve mantenere visibile questo gate nel report corrente e nel JSON machine-readable come riferimento per le route con revisione umana. Il detector può verificare solo la presenza locale della checklist; la valutazione del testo resta manuale e deve essere registrata in review.
