# ltm-pr-babysitter

## Quando usarla

Usare questa skill per controllare PR aperte, stato CI, feedback di review, scope dei file modificati, issue reference e prossimo passo sicuro.

## Quando non usarla

Non usarla per approvare, mergiare, chiudere issue, forzare push su branch altrui o riscrivere una PR aperta senza richiesta esplicita e nuovo scope dedicato.

## Input attesi

- Numero o link della PR.
- Titolo, branch, base branch, commit e stato CI.
- Review e commenti rilevanti.
- Issue collegate e acceptance criteria.
- Elenco file modificati o diff sintetico.

## Output atteso

Un report operativo che dica se la PR è monitorabile, bloccata, fuori scope o richiede intervento umano, con prossimo passo non distruttivo.

## Guardrail

- Verificare che la PR non interferisca con PR esplicitamente escluse.
- Segnalare modifiche a route, deploy, workflow o frontend pubblico se fuori scope.
- Distinguere failure CI reali da limitazioni di ambiente.
- Non trattare assenza di commenti come approvazione.

## Divieti espliciti

- No merge.
- No approval.
- No auto-close.
- No pubblicazione sensibile.
- No bypass di human gate.
- No modifica di PR aperte non assegnate.

## Formato di risposta

```text
PR babysitting #<numero>: <stato>
CI/check: <pass/fail/pending/non pertinente>
Review: <richieste aperte o nessuna>
Scope: <coerente / rischio>
Issue linkage: <presente / mancante>
Prossimo passo sicuro: <azione>
Stop condition: <quando non procedere>
```
