# CI validation notes v0

Breve nota tecnica per ricordare i comandi minimi da eseguire su micro-fix tecnici, documentali o di utility frontend prima di aprire una pull request.

Queste note sono operative e non introducono nuove policy: per modifiche più ampie restano validi i criteri di accettazione della issue, la configurazione CI del repository e gli eventuali test specifici del modulo toccato.

## Comandi repo-wide minimi

| Comando | Quando usarlo | Cosa verifica |
| --- | --- | --- |
| `git diff --check` | Prima del commit e della PR | Evidenzia whitespace problematico nel diff. |
| `pnpm run typecheck` | Per micro-fix tecnici, documentali e utility frontend | Esegue il controllo TypeScript configurato a livello repository. |
| `pnpm run build` | Prima di consegnare la PR, quando l'ambiente lo consente | Replica il build repository-wide atteso dalla validazione ordinaria. |

## Test mirati

Quando esistono test mirati per il file, pacchetto o flusso modificato, eseguire anche il comando più vicino allo scope della modifica e riportarlo nella PR. Esempi:

- test del pacchetto o workspace toccato;
- test unitari o componenti associati alla utility modificata;
- controlli di lint o validazione documentale già presenti nello stesso modulo.

Se un test mirato non esiste o non è applicabile a una modifica solo documentale, indicarlo nelle note di validazione invece di introdurre nuovi test fuori scope.

## Note di consegna

Nel body della PR o nel commento finale riportare:

- file modificati;
- head SHA del commit consegnato;
- comandi eseguiti e relativo esito;
- eventuali blocker ambientali o preesistenti, con il comando minimo che li riproduce.
