# ltm-ledger-update

## Quando usarla

Usare questa skill per aggiornare o sintetizzare human gate ledger e founder control panel con stato leggibile da mobile su PR, issue, fonti, decisioni editoriali e blocchi.

## Quando non usarla

Non usarla per duplicare responsabilità del founder control panel, prendere decisioni al posto degli umani, nascondere blocchi o pubblicare contenuti sensibili.

## Input attesi

- Ledger o control panel corrente.
- Elenco PR/issue da sintetizzare.
- Stato CI, review, fonte, gate editoriale e prossimo passo.
- Vincoli di priorità P0/P1 e dipendenze.

## Output atteso

Aggiornamento sintetico, mobile-friendly, con sezioni per mergeabile, richiede decisione, fonte mancante, può procedere autonomamente e stop condition.

## Guardrail

- Mantenere tracciabilità di PR, issue e decisioni.
- Evidenziare blocchi senza trasformarli in accuse o giudizi personali.
- Separare stato tecnico, stato editoriale e stato fonte.
- Segnalare incompatibilità o overlap prima di proporre avanzamento.

## Divieti espliciti

- No merge.
- No approval.
- No auto-close.
- No pubblicazione sensibile.
- No rimozione di human gate.
- No dichiarazione di completamento senza evidenza verificabile.

## Formato di risposta

```text
Ledger update: <data>
Mergeabile: <PR/issue + condizione>
Richiede decisione umana: <elementi>
Fonte mancante/verifica richiesta: <elementi>
Può procedere autonomamente: <elementi>
Stop condition: <quando fermarsi>
```
