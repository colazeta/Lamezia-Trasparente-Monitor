# Gate UX/copy readiness v0

Questo gate materializza #528 nel perimetro della issue madre #522. Serve a trasformare la revisione comunicativa della v0 in una checklist eseguibile da Giovanni o da una review manuale, senza introdurre scraping, nuove fonti, backend, database, provider, worker, DNS o segreti.

Il gate si appoggia ai documenti già versionati:

- `docs/launch-v0/section-taxonomy-v0.md`;
- `docs/launch-v0/civic-copy-style-guide.md`;
- `docs/launch-v0/route-contract.md`;
- `docs/launch-v0/current-readiness.md`.

## Esito atteso

Una route pubblica può restare `GO_WITH_LIMITS`, ma non deve lasciare ambigua la ragione del limite. I P1 del detector devono diventare azioni verificabili: label, stato v0, fonti/limiti, CTA, empty state e linguaggio prudente.

## Checklist per route pubbliche

Applicare la checklist a `/`, `/convocazioni`, `/contratti`, `/pnrr`, `/fonti-dati`, `/metodologia`, `/note-legali` e alla demo convocazione quando visibile.

| Controllo | PASS | LIMITED / MANUAL |
| --- | --- | --- |
| Label pubblica | La label è comprensibile a un utente non tecnico e coerente con la tassonomia v0. | La label è tecnica, generica o non chiarisce il valore civico della sezione. |
| Stato v0 | Lo stato è leggibile in linguaggio umano: pubblicabile, sperimentale, demo, in preparazione o riservato. | Lo stato è implicito, tecnico o può far sembrare completa una sezione ancora non alimentata. |
| Fonte e limite | La pagina rimanda a fonte, metodo o limite informativo quando il contenuto lo richiede. | La pagina presenta dati, assenze o fixture senza chiarire perimetro e cautele. |
| Empty state | L’assenza di dati è spiegata come fonte non collegata, dato non rilevato, verifica in corso o sezione pronta a ricevere dati verificati. | La pagina dice solo “nessun dato” o sembra rotta/vuota. |
| CTA | La CTA porta a un percorso sensato e non promette copertura completa o verifica definitiva. | La CTA suggerisce disponibilità piena, aggiornamento live o risultato non garantito. |
| Copy prudente | Il testo evita conclusioni accusatorie e distingue fatto, fonte, limite e verifica. | Il testo usa parole ad alto rischio senza fonte o decisione umana. |

## Parole ad alto rischio da cercare

La presenza di questi termini non è automaticamente un blocker, ma richiede verifica puntuale e attribuzione alla fonte competente:

- `anomalia`;
- `criticità`, se non qualificata come documentale o informativa;
- `irregolarità`;
- `responsabilità` o `colpa`;
- `mancata trasparenza`;
- `omissione`;
- `favoritismo`, `clientelismo`, `corruzione`, `infiltrazione`;
- `monitoraggio completo`.

## Formule preferite per dati mancanti

Usare formule compatibili con la guida copy civica:

- `Dato non rilevato nella fonte consultata al perimetro indicato.`
- `Fonte non ancora collegata per questa sezione.`
- `La struttura è disponibile; l’alimentazione dati sarà attivata dopo verifica.`
- `Contenuto dimostrativo, non riferito a un atto reale salvo diversa indicazione.`
- `Stato di verifica: coerenza e aggiornamento ancora da confermare.`

## Come usare il gate nel report readiness

Quando `pnpm run v0:readiness` segnala `manual-source-limit-review`, la review umana deve controllare anche questo gate. Per ogni route P1 va lasciato un esito interno:

- `PASS`: copy e stato coerenti con tassonomia, guida copy e perimetro fonti/limiti;
- `LIMITED`: pubblicabile con caveat espliciti;
- `BLOCKED`: copy fuorviante, stato ambiguo, CTA ingannevole o linguaggio accusatorio non attribuito.

## Limiti del gate

Il gate non certifica accuratezza fattuale, completezza del dato, conformità legale, deploy o correttezza delle fonti. Serve solo a rendere ripetibile la QA comunicativa della v0 e a ridurre il rischio che sezioni non ancora alimentate sembrino complete, rotte o accusatorie.
