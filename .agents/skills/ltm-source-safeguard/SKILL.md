# ltm-source-safeguard

## Quando usarla

Usare questa skill prima di pubblicare o modificare feature, schede, banner, dataset o copy che dipendono da fonti amministrative o dati pubblici.

## Quando non usarla

Non usarla per validare contenuti privi di fonte, certificare completezza ufficiale non dimostrata o sostituire verifiche legali, editoriali o istituzionali.

## Input attesi

- File, route o sezione da verificare.
- Fonte dichiarata, URL o riferimento documentale.
- Data ultimo aggiornamento.
- Livello di verifica e stato dato: `demo`, `parziale`, `verificato`.
- Limiti noti e logica di aggiornamento.

## Output atteso

Checklist di conformità con eventuali blocchi prima della pubblicazione e testo prudente da usare per limiti o note metodologiche.

## Guardrail

- Ogni dato pubblico deve dichiarare fonte, aggiornamento, verifica, limiti e stato.
- I dati demo o parziali non devono apparire come completi o ufficiali.
- Le inferenze devono essere marcate come indicatori o segnali da verificare.
- Non introdurre nuove fonti senza documentarne provenienza, uso lecito, aggiornamento e limiti.

## Divieti espliciti

- No merge.
- No approval.
- No auto-close.
- No pubblicazione sensibile.
- No trattamento di dati demo come verificati.
- No affermazioni di completezza senza base documentale.

## Formato di risposta

```text
Source safeguard: <sezione/file>
Esito: <ok / blocco / verifica richiesta>
Fonte: <presente/mancante + riferimento>
Aggiornamento: <presente/mancante>
Stato dato: <demo/parziale/verificato/non dichiarato>
Limiti: <presenti/mancanti>
Azione richiesta: <passo minimo prima del rilascio>
```
