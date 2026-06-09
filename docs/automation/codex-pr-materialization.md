# Codex PR materialization gateway

## Problema

Alcuni task Codex producono un `Summary` che dichiara branch, commit o PR, ma GitHub non espone alcun artefatto verificabile. In quei casi il lavoro può essere rimasto nel workspace Codex locale oppure il passaggio `make_pr` può avere prodotto solo un record interno non raggiungibile da GitHub.

Il risultato non deve essere trattato come completato finché non esiste una prova GitHub pubblica e verificabile.

## Regola di attestazione

Un output Codex è reviewable solo se contiene almeno uno dei seguenti elementi, verificato nel repository corretto:

1. URL di una Pull Request GitHub aperta o chiusa nel repository.
2. Numero di Pull Request GitHub recuperabile nel repository.
3. Branch remoto esistente nel repository.
4. Commit SHA completo recuperabile da GitHub.
5. Evidenza che la modifica è già presente su `main`.

La prova deve inoltre superare questi controlli minimi:

- la PR deve avere base `main` o altra base esplicitamente autorizzata;
- la PR, branch o commit deve riferirsi alla issue corretta nel titolo, body, nome branch o commit message;
- il branch remoto deve essere coerente con la issue e non generico o riusato;
- il commit recuperabile deve toccare file coerenti con lo scope dichiarato;
- un artefatto relativo a un'altra issue non può attestare il task corrente.

Non sono prove sufficienti:

- un commit breve non recuperabile;
- un branch dichiarato ma non presente su GitHub;
- `created PR via make_pr` senza URL o numero PR;
- link `blob` verso un commit incoerente o relativo ad altra issue;
- un semplice `Summary` senza artefatto;
- una PR reale ma non collegata allo scope o alla issue del task.

## Classificazione dei fallimenti

Se manca la prova GitHub, classificare il caso come segue:

- `local-only`: Codex dichiara commit/branch locale ma nessun artefatto remoto.
- `output-without-PR`: Summary prodotto, ma nessuna PR o branch verificabile.
- `invalid-output`: il commit o i file citati non sono coerenti con la issue.
- `blocked`: esiste un blocker tecnico esplicito e non superabile dal task.
- `needs-human-decision`: serve una decisione non meccanica.

## Protocollo obbligatorio per i task Codex

Ogni task Codex deve chiudere il proprio output con una sezione `Materialization` contenente:

```text
Materialization:
- PR URL: <url oppure none>
- PR number: <numero oppure none>
- Remote branch: <branch remoto oppure none>
- Full commit SHA: <sha completo oppure none>
- GitHub verification: <comando/verifica eseguita oppure blocker>
- Issue linkage: <come PR/branch/commit riferisce la issue corrente>
- Scope check: <file toccati e coerenza con scope>
- If no PR: <unified diff completo oppure lista file con contenuto completo, se il cambio è recuperabile>
```

Se il task non può creare una PR GitHub visibile, deve dichiararlo esplicitamente e fornire un fallback materializzabile: patch completa o contenuto completo dei file modificati.

## Materializzatore GitHub

Il PR governor o un'automazione autorizzata può materializzare un output solo se riceve:

- patch completa e applicabile; oppure
- percorso file + contenuto completo per ogni file modificato; oppure
- branch remoto già esistente e coerente con la issue.

Il materializzatore deve:

1. partire da `main` aggiornato;
2. creare branch `materialize/<issue>-<slug>`;
3. applicare solo i file dichiarati;
4. aprire una PR piccola verso `main`;
5. citare nel corpo PR la issue origine e la ragione del fallback;
6. non materializzare modifiche sensibili senza review umana.

## Aree escluse dalla materializzazione automatica

Non materializzare automaticamente modifiche che toccano:

- API server;
- database o migrazioni;
- OpenAPI o generated client/Zod;
- workflow GitHub Actions;
- secrets o deploy;
- dati reali;
- copy civic/legal sensibile;
- registry critici o privacy.

Questi casi devono restare `needs-human-decision` o passare da PR reale prodotta dal task.

## Regola operativa per le automazioni

Le automazioni devono smettere di contare come slot attivo qualunque task che abbia solo Summary. Devono prima eseguire l'attestation gate e poi scegliere una sola azione:

- PR governor su PR reale;
- materializzazione da patch completa;
- recovery controllata;
- blocked stabile;
- needs-human-decision;
- archiviazione/superseded.

## Decisione

Il collo di bottiglia non è il merge. Il collo di bottiglia è la materializzazione GitHub dell'output Codex. La pipeline è corretta solo quando ogni lavoro produce un artefatto GitHub verificabile e coerente con la issue, oppure un fallback completo materializzabile.