# Checklist manuale v0 launch

Questa checklist supporta un Go/No-Go manuale e prudente per la v0. Non sostituisce verifiche legali, privacy, editoriali o di dominio: ogni punto che riguarda responsabilità, conformità, provider o contenuti pubblici resta un gate umano.

## Ambito e principio di cautela

- Usare la checklist solo come supporto operativo per #359, #361, #362, #363 e #364.
- Non interpretare indicatori, ricorrenze, pattern o data gap come prova di irregolarità o responsabilità individuale.
- Procedere al lancio solo se le verifiche manuali confermano che fonti, limiti del dato e stato di verifica sono visibili e comprensibili.
- In caso di dubbio su contenuti, privacy, legalità, dominio o provider, fermare il lancio e richiedere decisione umana documentata.

## Go/No-Go minimo

### 1. Build, CI e controlli tecnici

- Confermare che la pipeline CI più recente sulla branch/release candidate sia verde.
- Eseguire o verificare l'esito di `pnpm run typecheck`.
- Eseguire o verificare l'esito di `pnpm run build`.
- Annotare commit, branch, ambiente e orario della verifica.
- Se un controllo fallisce o non è riproducibile, dichiarare No-Go fino a correzione o decisione umana esplicita.

### 2. Fallback statico, deep-link e reload

- Aprire la home e almeno una pagina interna direttamente da URL.
- Ricaricare le stesse pagine con browser refresh e verificare che non appaiano errori di routing.
- Verificare che i deep-link principali continuino a funzionare dopo build/deploy.
- Confermare che il fallback statico previsto sia disponibile e documentato per il provider usato.
- Se reload, deep-link o fallback non sono affidabili, dichiarare No-Go tecnico.

### 3. Fonti, limiti del dato e stato di verifica

- Verificare che le pagine pubbliche rilevanti mostrino fonti o riferimenti documentali quando presentano dati amministrativi.
- Verificare che limiti del dato, aggiornamento, incompletezze o necessità di verifica siano indicati in modo prudente.
- Controllare che nessun testo presenti dati incompleti come ufficiali, esaustivi o automaticamente aggiornati se non documentato.
- Controllare che indicatori, segnali e ricorrenze siano descritti come elementi di monitoraggio, non come conclusioni accusatorie.
- In caso di fonte assente o stato di verifica ambiguo, dichiarare No-Go contenutistico fino a revisione manuale.

### 4. Privacy, legal e copy come gate umano

- Richiedere controllo manuale privacy/legal/copy prima del Go finale.
- Non usare questa checklist come attestazione di conformità legale o privacy.
- Verificare manualmente che note, caveat e limitazioni metodologiche già previste non siano state rimosse o indebolite.
- Verificare manualmente che il copy pubblico resti civico, non-partisan, non sensazionalistico e non accusatorio.
- Se il controllo umano non è completato o produce dubbi, dichiarare No-Go fino a decisione documentata.

### 5. Dominio, canonical e provider

- Verificare manualmente dominio, URL pubblici, canonical e configurazione provider prima del lancio.
- Confermare che eventuali redirect siano intenzionali e reversibili.
- Confermare che il provider serva la build corretta e non una versione precedente.
- Non modificare DNS, provider o canonical durante questa checklist senza decisione umana separata.
- Se dominio, canonical o provider non sono verificati, dichiarare No-Go operativo.

### 6. Rollback e fallback statico

- Identificare il commit o artefatto precedente a cui tornare in caso di problema.
- Confermare chi può eseguire rollback e con quale procedura minima.
- Verificare che sia disponibile una pagina o build statica di fallback se il deploy principale non risponde correttamente.
- Definire un criterio semplice di rollback: errore pubblico bloccante, contenuto potenzialmente fuorviante, problema privacy/legal da verificare o regressione di accessibilità critica.
- Se rollback o fallback non sono chiari, dichiarare No-Go.

## Dopo il lancio

### Monitorare manualmente

- Disponibilità della home e delle pagine principali.
- Errori di routing su refresh e deep-link.
- Presenza di fonti, limiti del dato e caveat sulle pagine pubbliche rilevanti.
- Segnalazioni di contenuti ambigui, incompleti o potenzialmente fuorvianti.
- Eventuali regressioni di accessibilità, leggibilità mobile o metadata essenziali.

### Non fare automaticamente

- Non chiudere issue collegate senza revisione umana.
- Non cambiare copy legale/privacy o caveat metodologici senza verifica dedicata.
- Non introdurre nuove fonti o nuovi dati senza documentarne origine, aggiornamento, limiti e uso pubblico lecito.
- Non interpretare indicatori o pattern come evidenza di wrongdoing, favoritismi, corruzione o responsabilità individuali.
- Non modificare dominio, provider, DNS o configurazioni irreversibili come reazione automatica a un warning.

## Esito da registrare

Per ogni Go/No-Go annotare:

- data e ora della verifica;
- branch, commit e ambiente controllati;
- esito di CI, typecheck e build;
- eventuali controlli manuali privacy/legal/copy completati o bloccanti;
- decisione finale: Go, No-Go o Go condizionato;
- persona o ruolo che ha preso la decisione umana;
- eventuali follow-up necessari prima o dopo il lancio.
