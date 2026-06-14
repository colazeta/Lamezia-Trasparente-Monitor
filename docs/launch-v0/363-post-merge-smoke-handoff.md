# #363 — post-merge smoke handoff v0

Scopo: rendere eseguibile un controllo manuale minimo dopo l'assorbimento su `main` delle PR di lancio già mergeate, senza introdurre nuove promesse civiche, dati reali o configurazioni deploy irreversibili.

## Stato di partenza verificato

- #440 è stata mergeata: esiste lo smoke check static fallback `scripts/check-v0-static-fallback.mjs`.
- #443 è stata mergeata: il fix typecheck mobile su `InterventionsMap.web.tsx` è assorbito.
- #446 è stata mergeata: esiste l'handoff manuale per il residuo #437.
- #447 è stata mergeata: la route demo `/convocazioni/demo-consiglio-comunale-v0` è censita in inventario/sitemap e dichiarata come fixture.

## Controlli automatici da eseguire prima del go/no-go

```bash
pnpm run typecheck
pnpm run build
pnpm test
pnpm --filter @workspace/lamezia-trasparente run build
node scripts/check-v0-static-fallback.mjs \
  --route / \
  --route /convocazioni \
  --route /convocazioni/demo-consiglio-comunale-v0 \
  --route /fonti-dati \
  --route /metodologia
```

## Smoke manuale pubblico minimo

Aprire, in ordine:

1. `/`
2. `/convocazioni`
3. `/convocazioni/demo-consiglio-comunale-v0`
4. `/fonti-dati`
5. `/metodologia`
6. `/note-legali`

Verificare che:

- la navigazione minima Home → Convocazioni → scheda demo → Fonti e limiti/Metodologia sia comprensibile;
- la scheda demo non sia presentata come convocazione reale;
- fonti, limiti del dato e stato dimostrativo siano visibili prima di qualsiasi interpretazione civica;
- l'assenza o incompletezza di un dato non sia formulata come irregolarità dell'ente;
- non compaiano richieste di autenticazione, pannelli redazionali o dipendenze da API live per il percorso demo;
- il fallback statico restituisca un bundle navigabile anche senza dominio definitivo.

## Blocchi locali da non trasformare in lavoro Codex

- scelta provider o URL pubblico definitivo;
- review privacy/legal/copy;
- decisione se il residuo #437 richiede ancora un link UI sempre visibile dentro `/convocazioni`;
- merge/chiusura di PR duplicate o invalide;
- go/no-go finale #341.

Questi elementi restano Human Decision Ledger e non devono consumare slot produttivi.

## Criterio di uscita per #363

#363 può essere considerata operativamente pronta per review umana solo quando i comandi sopra risultano verdi oppure quando ogni errore residuo è classificato come:

- `launch-blocker`, se impedisce sito/build/percorso demo;
- `quality-enabler`, se riguarda QA/copy/accessibilità senza bloccare la raggiungibilità;
- `needs-human-decision`, se richiede scelta editoriale, privacy/legal o governance.

Nessun esito automatico deve implicare approvazione editoriale o pubblicazione definitiva.
