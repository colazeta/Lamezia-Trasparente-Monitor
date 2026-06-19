# ltm-issue-triage

## Quando usarla

Usare questa skill quando Codex deve leggere una issue LTM e proporre una classificazione operativa senza iniziare implementazioni automatiche. Le classi ammesse sono:

- `ready-for-agent`;
- `blocked-source`;
- `blocked-editorial`;
- `blocked-human`;
- `scope-risk`;
- `duplicate/overlap candidate`.

## Quando non usarla

Non usarla per chiudere issue, assegnare responsabilità personali, modificare milestone, cambiare label in modo irreversibile o sostituire una decisione editoriale, legale o di prodotto.

## Input attesi

- Link o numero della issue.
- Titolo, descrizione, acceptance criteria e commenti rilevanti.
- Stato di PR correlate, se già noto.
- Vincoli di scope, fonti e human gate.

## Output atteso

Un commento operativo breve con classificazione proposta, motivazione documentata, rischi di scope, dipendenze e prossimo passo sicuro.

## Guardrail

- Restare aderenti alla issue e alle fonti citate.
- Separare fatti documentati, dati mancanti e inferenze operative.
- Usare linguaggio prudente: `indicatore`, `segnale`, `dato mancante`, `verifica richiesta`.
- Evidenziare overlap con PR o issue esistenti prima di proporre nuovo lavoro.

## Divieti espliciti

- No merge.
- No approval.
- No auto-close.
- No pubblicazione sensibile.
- No modifica di PR aperte.
- No introduzione di fonti esterne non documentate.

## Formato di risposta

```text
Triage issue #<numero>: <classe>
Motivo: <evidenza sintetica>
Rischi/guardrail: <scope, fonti, copy, human gate>
Prossimo passo sicuro: <azione proposta>
Da non fare ora: <azioni bloccate o fuori scope>
```
