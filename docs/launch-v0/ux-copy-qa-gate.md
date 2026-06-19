# Gate QA UX/copy per readiness v0

Questo gate materializza #528 come controllo manuale collegato a `pnpm run v0:readiness`. Non introduce nuove fonti, non modifica route pubbliche e non sostituisce la revisione legale/metodologica: rende verificabile, con criteri espliciti, se una pagina v0 comunica in modo chiaro, prudente e non fuorviante.

## Quando si applica

Applicare il gate a ogni route del contratto v0 con `humanCheckRequired: true` o `requiresSourceAndLimits: true` in `docs/launch-v0/v0-routes.json`.

Il gate usa come riferimenti:

- tassonomia sezioni e stati v0: `docs/launch-v0/section-taxonomy-v0.md`;
- guida copy civico prudente: `docs/launch-v0/civic-copy-style-guide.md`;
- contratto route v0: `docs/launch-v0/route-contract.md` e `docs/launch-v0/v0-routes.json`.

## Checklist manuale richiesta

Per ogni route applicabile, segnare `PASS`, `LIMITED` o `BLOCKED` per questi controlli:

| Controllo | Criterio PASS | LIMITED/BLOCKED quando |
| --- | --- | --- |
| Label pubblica chiara | Il titolo o label pubblico è comprensibile senza conoscere il codice interno e coincide con la tassonomia v0. | La label usa gergo tecnico, promette più copertura di quella disponibile o non distingue sezioni tecniche/riservate. |
| Stato v0 comunicato | La pagina rende chiaro se il contenuto è pubblicabile, sperimentale, in preparazione, riservato o solo marker tecnico. | Demo, fixture o sezioni incomplete appaiono come dati ufficiali completi. |
| Nota su fonti e limiti | Sono visibili fonte/perimetro, limiti di aggiornamento o indicazione che il dato va verificato. | La pagina presenta dati o indicatori senza caveat, perimetro o rinvio a fonti/metodo/note legali. |
| CTA non fuorviante | L'azione promessa dalla CTA corrisponde a ciò che l'utente può fare davvero nella v0. | La CTA promette consultazione completa, verifica definitiva, denuncia, prova o funzioni non disponibili. |
| Linguaggio dati mancanti | Empty state, assenze e lacune usano formule prudenti come dato non disponibile, non ancora verificato o fonte non rilevata. | Dati mancanti sono descritti come omissioni, irregolarità, anomalie certe o responsabilità individuali. |
| Guardrail copy cauto | Il testo evita accuse, intenti, responsabilità personali e conclusioni giuridiche; usa indicatori, segnali, pattern o verifiche richieste. | Il copy implica corruzione, favoritismo, infiltrazione, colpa o prova di illecito senza documentazione e revisione appropriata. |

## Esito del gate

- `PASS`: tutti i controlli sono passati e non sono emersi rischi comunicativi.
- `LIMITED`: uno o più controlli richiedono nota esplicita in review, ma non bloccano la v0 se la limitazione è documentata e non fuorviante.
- `BLOCKED`: il copy può indurre letture accusatorie, promettere copertura completa non verificata o nascondere limiti essenziali; correggere prima della pubblicazione.

## Evidenza da riportare in review

Per ciascuna route con esito diverso da `PASS`, indicare:

1. route e componente/pagina osservata;
2. controllo non passato;
3. frase o elemento UI da correggere;
4. proposta di copy prudente o rimando a fonte/metodo/limiti;
5. eventuale follow-up issue se la correzione è fuori scope.

## Scope di #528

Questo gate è solo una soglia QA documentale e locale. Restano fuori scope route UI per `/convocazioni`, `/contratti`, `/pnrr`, `/fonti-dati`, `/metodologia`, `/note-legali`, homepage narrative/cards, sistema completo di empty state, data ingestion, backend, provider, deploy, scraping e redesign.
