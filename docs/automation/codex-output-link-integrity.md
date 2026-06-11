# Codex output link integrity guard

## Perché serve

Alcuni output Codex possono contenere link `github.com/.../blob/<sha>/...` generati a partire da uno stato locale o da un commit GitHub non pertinente. Il link può sembrare una prova, ma il commit può appartenere a un'altra PR o non contenere i file dichiarati.

Questo documento rafforza il materialization gateway: i link nel Summary non sono prova sufficiente finché non sono verificati contro GitHub.

## Regola anti-link fantasma

Un link `blob/<sha>/<path>` è valido solo se tutti questi controlli passano:

1. il commit `<sha>` è recuperabile nel repository corretto;
2. il commit message o la PR associata è coerente con la issue corrente;
3. il path dichiarato esiste davvero a quel commit;
4. il file a quel path contiene le modifiche o simboli dichiarati nel Summary;
5. il commit non è il merge di un'altra PR/issue non correlata.

Se uno di questi controlli fallisce, classificare l'output come `invalid-output`, anche se il commit esiste.

## Regola per Codex

Quando Codex non ha remote Git o non può verificare una PR pubblica, non deve generare link GitHub `blob/...` come prova del lavoro locale.

In quel caso deve dichiarare:

```text
Materialization:
- PR URL: none
- PR number: none
- Remote branch: none
- Full commit SHA: <local SHA, if useful>
- GitHub verification: not available, local-only workspace
- If no PR: <patch completa oppure contenuto completo dei file modificati>
```

## Controlli obbligatori delle automazioni

Per ogni Summary che cita commit o link `blob`:

1. eseguire `fetch_commit` o ricerca commit sullo SHA;
2. confrontare commit message/PR con la issue corrente;
3. eseguire `fetch_file` sul path dichiarato e sullo SHA;
4. se il file non esiste o non contiene il contenuto dichiarato, commentare `invalid-output`;
5. non invocare recovery in loop senza patch/file completi.

## Esempio di fallimento

Se un Summary della issue `#240` cita un commit che GitHub identifica come merge della PR `#258`, quel commit non può attestare `#240`, anche se lo SHA esiste. Il caso va classificato come `invalid-output`, non come lavoro completato.

## Decisione operativa

Il materialization gateway controlla l'esistenza dell'artefatto. Questo guardrail controlla anche la sua identità: l'artefatto deve appartenere alla issue giusta e contenere davvero i file dichiarati.