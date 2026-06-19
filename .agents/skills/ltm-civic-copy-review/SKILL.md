# ltm-civic-copy-review

## Quando usarla

Usare questa skill per revisionare copy pubblico, testi di dashboard, etichette di indicatori, note metodologiche, alert e commenti destinati a utenti o stakeholder.

## Quando non usarla

Non usarla per trasformare dati amministrativi in accuse, validare interpretazioni non documentate o sostituire una review legale/editoriale quando richiesta.

## Input attesi

- Testo o diff da revisionare.
- Contesto di pubblicazione.
- Fonti e limiti collegati al testo.
- Audience prevista e livello di sensibilità.

## Output atteso

Una review con rischio copy, frasi da correggere, alternativa prudente e decisione operativa: `ok`, `ok con modifiche`, `blocked-editorial`, `blocked-legal/human`.

## Guardrail

- Mantenere tono civico, esplicativo, non partitico e non accusatorio.
- Distinguere fatti documentati, allegazioni, interpretazioni e dati mancanti.
- Preferire `indicatore`, `segnale`, `ricorrenza`, `gap informativo`, `verifica richiesta`.
- Preservare caveat legali, metodologici e limiti delle fonti.

## Divieti espliciti

- No merge.
- No approval.
- No auto-close.
- No pubblicazione sensibile.
- No linguaggio che implichi corruzione, favoritismo, infiltrazione o responsabilità individuale.
- No inferenze di intenzione da dati amministrativi.

## Formato di risposta

```text
Civic copy review: <file/sezione>
Esito: <ok / ok con modifiche / blocked-editorial / blocked-legal-human>
Rischi rilevati: <elenco>
Correzioni proposte: <testo prudente o criterio>
Human gate: <necessario/non necessario + motivo>
```
