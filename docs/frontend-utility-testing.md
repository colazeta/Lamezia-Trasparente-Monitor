# Frontend utility testing

Questa nota tecnica descrive il pattern minimo per aggiungere o mantenere test Vitest su utility frontend pure del workspace `@workspace/lamezia-trasparente`.

Lo scope è intenzionalmente documentale e ristretto: non richiede modifiche a codice runtime, route, pagine, dataset, API, workflow o test esistenti.

## Collocazione e naming

- Le utility pure vivono in `artifacts/lamezia-trasparente/src/lib/*.ts`.
- I test mirati vivono in `artifacts/lamezia-trasparente/src/test/*.test.ts`.
- Il nome del test dovrebbe richiamare il modulo testato, ad esempio `nomeUtility.test.ts` per `src/lib/nomeUtility.ts`.
- Evitare test generici o cumulativi se la utility può essere verificata con casi piccoli, espliciti e ripetibili.

## Cosa testare

Usare questo pattern solo per helper puri che:

- ricevono input espliciti e restituiscono output deterministici;
- non leggono route, stato React, DOM, storage, rete o ambiente runtime;
- non modificano dataset, fixture ufficiali o contratti API;
- possono essere validati con dati sintetici o demo chiaramente non presentati come completi.

I test dovrebbero coprire almeno:

- caso nominale con input minimo ma realistico;
- valori mancanti, `null`/`undefined` quando ammessi dal tipo, stringhe vuote o array vuoti;
- ordinamenti, deduplicazioni, normalizzazioni o fallback dichiarati dalla utility;
- limiti noti senza trasformarli in affermazioni su completezza o qualità dei dati reali.

## Cautele su dati demo e assenza dati

Nei test usare dati demo piccoli e auto-contenuti. I nomi, gli importi, gli identificativi e le descrizioni devono essere trattati come esempi tecnici, non come dati ufficiali o completi.

Quando una utility gestisce dati assenti o incompleti, preferire aspettative esplicite su fallback e stati vuoti. Non trasformare un `data gap`, un valore mancante o una ricorrenza sintetica in un indicatore pubblico, in una valutazione editoriale o in un segnale di responsabilità individuale.

## Test mirati

Per eseguire un singolo file di test dal root del monorepo:

```bash
pnpm --filter @workspace/lamezia-trasparente exec vitest run src/test/nomeUtility.test.ts
```

Sostituire `nomeUtility.test.ts` con il file effettivo. Il comando deve restare mirato quando la modifica riguarda una sola utility pura, così da rendere la verifica ripetibile e facilmente revisionabile.

## Quando fermarsi

Fermare la modifica e segnalare il fuori scope se il comportamento da verificare richiede:

- montaggio di componenti React, routing, metadata, sitemap o navigazione;
- accesso a DOM, browser storage, rete, feature flag o ambiente di build;
- modifica di dataset demo civici, dati ufficiali, API, OpenAPI, DB o migrazioni;
- aggiornamento di workflow, governance Codex, script di automazione o documenti sotto altra ownership;
- test di integrazione UI/runtime invece di una verifica isolata della utility.

In questi casi la utility non deve essere forzata dentro un test puro: l’integrazione runtime va trattata come attività separata, con scope e review dedicati.

## Validazione standard

Dopo la modifica documentale o tecnica, dal root del repository eseguire:

```bash
git diff --check
pnpm run typecheck
pnpm run build
```

Se `typecheck` o `build` falliscono per un blocker fuori scope, riportare il comando e il log minimo utile senza ampliare la modifica a codice runtime, route, dati o workflow.
