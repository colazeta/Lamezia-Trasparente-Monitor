# CI validation notes v0

Nota tecnica breve per rendere più leggibile la validazione minima di micro-fix frontend, documentali e di manutenzione. Non sostituisce workflow CI, prompt operativi o regole di governance: serve solo a riportare in modo verificabile i comandi eseguiti e gli eventuali blocker fuori scope.

## Comandi repo-wide

Quando richiesti dalla issue o dal reviewer, riportare l'esito dei comandi eseguiti dalla root del repository:

```bash
git diff --check
pnpm run typecheck
pnpm run build
pnpm run test
```

- `git diff --check` verifica whitespace e marker di conflitto nella diff locale.
- `pnpm run typecheck` controlla i tipi sul workspace secondo gli script esistenti.
- `pnpm run build` verifica che la build root completi con la configurazione corrente.
- `pnpm run test` va riportato quando richiesto o pertinente alla modifica.

## Comandi mirati

Per modifiche piccole può essere utile aggiungere comandi mirati, se esistono script o test specifici per il package coinvolto. Esempi:

```bash
pnpm --filter @lamezia/api test
pnpm --filter @lamezia/web typecheck
pnpm --filter @lamezia/web test -- src/path/to/test.test.ts
```

I comandi mirati devono essere riportati con la forma esatta usata. Quando la issue richiede anche validazioni repo-wide, i comandi mirati non le sostituiscono: aiutano solo a chiarire quale area è stata controllata in modo più specifico.

## Blocker fuori scope

Se un comando repo-wide fallisce per un problema preesistente o fuori dallo scope della issue, non mascherare il fallimento e non correggere aree non richieste. Nel commento finale o nel corpo della PR riportare in modo minimo e riproducibile:

- comando eseguito;
- errore essenziale osservato;
- file, package o area che blocca;
- nota che il blocker è fuori scope, se verificabile dalla diff.

## Nota di consegna

Per review e triage, indicare sempre file modificati, head SHA, comandi eseguiti con esito e eventuali blocker. Per modifiche solo documentali, segnalare se non esistono test mirati pertinenti invece di dichiarare copertura completa.
