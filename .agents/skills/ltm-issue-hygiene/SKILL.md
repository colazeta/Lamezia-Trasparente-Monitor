# ltm-issue-hygiene

## Quando usarla

Usare questa skill per proporre pulizia non distruttiva della coda issue: collegamenti mancanti, duplicati potenziali, acceptance criteria incompleti, blocchi fonte/editoriali e note di follow-up.

## Quando non usarla

Non usarla per chiudere issue, cambiare priorità sostanziali, riscrivere obiettivi di prodotto o creare lavoro fuori scope senza conferma umana.

## Input attesi

- Lista di issue o query GitHub.
- Titoli, descrizioni, label, milestone e commenti rilevanti.
- PR correlate e stato di avanzamento.
- Dipendenze note con #553, #554, #555, #556 o #557 quando pertinenti.

## Output atteso

Proposta di hygiene con modifiche suggerite, commenti pronti da incollare e stop condition per decisione umana.

## Guardrail

- Mantenere issue history e tracciabilità.
- Segnalare duplicati come candidati, non come certezza, salvo evidenza chiara.
- Non ridurre caveat, limiti fonte o gate editoriali.
- Usare azioni reversibili e commenti esplicativi.

## Divieti espliciti

- No merge.
- No approval.
- No auto-close.
- No pubblicazione sensibile.
- No eliminazione di contenuti o label critiche senza human gate.
- No interferenza con PR aperte.

## Formato di risposta

```text
Issue hygiene: <ambito>
Azioni suggerite: <elenco reversibile>
Duplicati/overlap candidati: <issue + motivo>
Blocchi: <fonte/editoriale/umano/scope>
Commento operativo proposto: <testo>
Stop condition: <quando serve decisione umana>
```
