# Standard LT per le proposte civiche

## Obiettivo

Separare il record di acquisizione dalla rappresentazione editoriale pubblica. Le fonti possono usare linguaggi, enfasi e strutture diverse; il sito deve invece presentare ogni proposta secondo uno schema stabile, confrontabile e verificabile.

## Due layer distinti

### 1. Record di acquisizione
Conserva i campi ricostruiti durante lo scouting (`title`, `summary`, promotore, fonte, eventi, atti, note di verifica). Serve per audit e tracciabilità e non determina direttamente la formulazione principale mostrata all'utente.

### 2. Presentazione canonica LT
Ogni proposta pubblicata deve avere una voce in `proposalCanonicalPresentation.ts` con:

- `title`: titolo breve, neutrale e orientato all'oggetto della misura;
- `request`: una sola frase che descrive la richiesta principale, senza formule come “X chiede”, “mozione per”, “petizione contro”;
- `actionTypes`: classificazione controllata dei tipi di intervento;
- `measures`: misure atomiche, una richiesta operativa per voce;
- `expectedOutcome`: risultato atteso espresso senza attribuire efficacia non dimostrata;
- `version`: versione dello standard editoriale.

## Regole redazionali

1. Il promotore non entra nel titolo canonico: è un metadato separato.
2. Il canale (petizione, mozione, comunicato, interrogazione) non entra nella richiesta canonica: è un metadato separato.
3. Eliminare slogan, giudizi politici, aggettivi valutativi e ricostruzioni causali non dimostrate.
4. Usare verbi operativi e specifici: attivare, pubblicare, ripristinare, coordinare, verificare, realizzare, aggiornare.
5. Separare misure diverse in voci distinte.
6. Non trasformare una richiesta di chiarimento in una richiesta di adozione se la fonte non lo consente.
7. Non trasformare il risultato desiderato in un effetto accertato.
8. Geografia, stato documentale, destinatario e percorso istituzionale restano dimensioni separate dalla formulazione della proposta.
9. Se la proposta non può essere standardizzata senza introdurre inferenze, il record deve restare in revisione e non essere pubblicato.

## Gate di pubblicazione

I test richiedono una presentazione canonica per ogni record contenuto in `PUBLIC_PROPOSALS`. Un nuovo record senza standardizzazione fa fallire la suite, impedendo che il sito torni a dipendere dalla formulazione contingente della fonte.
