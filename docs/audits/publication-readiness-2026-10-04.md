# Audit di maturità per pubblicazione — 4 ottobre 2026

Issue: #1649. Progetto: `colazeta/Lamezia-Trasparente-Monitor`, distinto dall'archivio `colazeta/LameziaTrasparente` sulle misure alle imprese.

## Verdetto

**NO GO per presentare il monitoraggio come maturo, corrente e completo.** La versione statica è tecnicamente distribuibile con limiti dichiarati. Questo audit corregge difetti riproducibili, ma non attesta disponibilità end-to-end dei servizi né completezza delle fonti.

Baseline ispezionata: `main` **7ca8fd605e46cc6d6bd7fe44595fe495a2a9541e**. La provenienza pubblica a `https://lamezia-trasparente.pages.dev/deploy-provenance.json` riporta la medesima SHA. CI [37134391367](https://github.com/colazeta/Lamezia-Trasparente-Monitor/actions/runs/37134391367) e deploy [37134391357](https://github.com/colazeta/Lamezia-Trasparente-Monitor/actions/runs/37134391357) sono riusciti. Non è stato trovato un ramo `dev` fra i riferimenti remoti interrogati; il README descrive pertanto una strategia che non dimostra lo stato operativo attuale.

## Finding e risoluzioni

| Priorità | Questione ed evidenza | Intervento / condizione residua |
| --- | --- | --- |
| P0 | PNRR: run [37180933886](https://github.com/colazeta/Lamezia-Trasparente-Monitor/actions/runs/37180933886) fallisce prima della raccolta. Il gate locale riproduce `albo-2026-2723` con percorso PDF non autorizzato. | Il builder controlla l'autorizzazione anche per le evidenze reimportate, oltre a quelle conservate. Rigenerazione locale con clock originario, senza simulare una nuova acquisizione. Una regressione verifica revoca, conservazione della scheda e allowlist valida. Il workflow riconcilia prima del gate, evitando che una futura revoca blocchi ogni refresh. |
| P1 | Albo/PNRR/ANAC tentano push diretti a `main`. ANAC [37150474403](https://github.com/colazeta/Lamezia-Trasparente-Monitor/actions/runs/37150474403) termina con GH013: PR e tre check richiesti. | I tre workflow propongono branch e PR, senza bypass. CI, hook guard e smoke sono dispatchati esplicitamente perché le normali scritture con GITHUB_TOKEN non generano quei workflow. Test con Git reale e remote locale dimostra che `main` resta invariato. Verificare il primo ciclo remoto dopo merge; PR creation deve essere abilitata nelle impostazioni Actions. |
| P1 | ANAC: nei log CKAN e risorse mensili restituiscono HTTP 403; snapshot degraded, 0/24 CIG arricchiti e 0/20 anni completi. | Il problema di consegna del workflow è corretto; l'accesso alla fonte non è risolto. Non convertire indisponibilità in assenza di contratti. Servono acquisizione ufficiale riuscita, riconciliazione e pubblicazione verificata. |
| P1 | La home pubblica mostra controllo Albo del 3 settembre e prossimo controllo del 4 settembre, come attività recente. | Oltre alla correzione del percorso PR, la home segnala snapshot senza controllo nelle ultime 24 ore e distingue un controllo previsto già trascorso da un futuro controllo. Il contenuto acquisito rimane accessibile; la data non è aggiornata artificialmente. Ripristinare un'acquisizione corrente e seguirla sino al deploy. |
| P1 | Statistics sostituisce missing/error con `0`; timeline assente interpretata come nessuna pubblicazione. | Missing diventa “Non disponibile”; errori dichiarati; zeri osservati conservati; limiti e fonte espliciti. Regressioni per indisponibilità e zero reale. Nessun tasso di partecipazione rappresentativo o censimento comunale è inferito. |
| P1 | La home pubblica segnala contratti, PNRR e importi “Fonte in attivazione”. Il bundle statico contiene invece 24 contratti e 30 progetti. | Non è prova di zero attività: metriche API e dataset statici non hanno ancora parità operativa verificata. Condizione di rilascio: verificare backend/origine API/CORS e riconciliare gli stessi perimetri, oppure definire indicatori statici separati con provenienza. Questo audit non cambia origine API o DB di produzione. |
| P1 | Readiness precedente ferma al 7 luglio; solo 12 route del vecchio contratto, controlli manuali irrisolti. | Rigenerato il rapporto. Restano 23 P1 e 3 P2; `GO_WITH_LIMITS` riguarda il detector locale, non la maturità del prodotto. Lo smoke verifica 40 route sitemap e il worker emesso, ma non certifica tutti i dettagli dinamici né la verità dei dati. |
| P1 | PR aperte contengono migrazioni e nuove rappresentazioni ancora non integrate. | Nessun merge cumulativo. In particolare #1214 è draft e include #1211: le prove storiche nel body non equivalgono a readiness del codice corrente o import produttivo. Valutare separatamente #1026/#1049 per contratti, #1051/#1053 per LTCEDS, #1385 per proposte e #1640 per geocoding. |
| P2 | Smoke pubblico senza timeout per richiesta: un endpoint lento può occupare tutto il job. | Timeout di 30 secondi sulle richieste del sito e di GitHub; retry esistente preservato. La mancata risposta resta un errore, non un successo. |
| P2 | Home mostra 56 sedute di commissione più una di Consiglio: notevole carico di navigazione. | Follow-up UX: anteprima breve con archivio completo, ordinamento dichiarato e verifica mobile. Non rimuovere evidenze né inventare svolgimento. Nessuna certificazione visuale mobile in questa tranche. |

## Verifiche e limiti

- Installazione frozen lockfile; nessuna modifica alle dipendenze/lockfile.
- Root typecheck e root build riusciti sulla baseline di audit; web build ripetuta dopo gli interventi.
- Suite web: 209 file / 1.181 test passati prima delle nuove regressioni; Statistics: 2 regressioni passate; test pertinenti Home/Statistics: 7 passati.
- Suite scripts: 315 test passati prima della nuova regressione PNRR; PNRR: 17 passati; consegna refresh: un test con Git reale passato.
- Architecture inventory: 75 tabelle / 47 moduli, inventario corrente.
- Smoke del bundle corretto: worker eseguito, API assente risponde 503, contratti statici 200; 40 route sitemap, 189 asset bundle. Censimento statico: 36 eventi procurement, 24 contratti canonici, 11 eventi irrisolti, backfill storico non completo.
- PNRR riconciliato: 30 progetti comunali, 30 record OpenCUP, 12 evidenze Albo, 286 allegati. “Fresh” è lo stato registrato all'acquisizione, non una verifica odierna della fonte; timestamp originali conservati.
- `pnpm test` aggregato incontra EPERM nel socket IPC del CLI tsx in questo ambiente. La suite DB eseguita con il loader Node richiede input già committati e inizialmente rifiuta correttamente il feed modificato (`UNCOMMITTED_SOURCE_CONTENT`). Ripetere sul commit candidato; non disattivare il controllo.
- Verifica browser della home e del caricamento delle statistiche sulla baseline pubblica; i cambiamenti candidati hanno QA a componenti e bundle, non sign-off visuale live.

## Condizioni per chiudere il rilascio

1. CI e tre check richiesti verdi sull'esatto candidato; merge ordinario, senza bypass.
2. Deploy con SHA candidata verificabile e smoke riuscito sulle pagine e sul worker pubblicati.
3. Un ciclo corrente Albo e PNRR acquisito, consegnato tramite PR e pubblicato; timestamp della fonte verificato, non solo job verde.
4. ANAC acquisibile o limitazione persistente chiaramente presentata; nessun claim di copertura totale.
5. Parità delle metriche pubbliche e delle sorgenti statiche/API, con origine backend e CORS verificati.
6. Review editoriale delle route critiche e QA mobile/accessibilità dei flussi effettivamente disponibili. Nessuna attestazione umana fittizia.

Le condizioni aperte restano nel ledger #1649. Il codice può essere revisionato e integrato senza dichiarare conclusa la maturazione dell'intero progetto.

## Verifiche aggiuntive sul candidato

- Root typecheck finale riuscito; build web e smoke del bundle finale riusciti.
- Suite API: 13 file, 80 test passati.
- Suite DB sul feed committato, eseguita con `node --import tsx --test`: 45 passati, zero skipped. Il vincolo sugli input Git è conservato.
- Browser live `/statistiche/`: la baseline mostra effettivamente quattro KPI a zero e zero pubblicazioni quando i dati non sono disponibili, confermando il difetto corretto a componenti.
- La coda di refresh è limitata a una proposta aperta per famiglia; un ciclo non sovrascrive una PR già in review e non ne apre altre sovrapposte. Il test copre anche questo caso. Dopo merge, il ciclo successivo riacquisisce la fonte.
- Primo head remoto `510b343c4c508ad76bd4f633eb602e791ff28220`: gate PNRR, hook guard e zero-cost policy riusciti; CI/smoke generali ancora in corso al momento di questo aggiornamento. Fare riferimento allo stato dell'ultimo head della PR #1650 per il risultato definitivo.
- I refresh accettano soltanto i percorsi della rispettiva famiglia di snapshot e richiedono auto-merge ordinario per i branch `data/*`, già ammessi dalla policy trusted del repository. GitHub conserva check e review obbligatori; se auto-merge non è disponibile, la PR resta aperta con avviso esplicito. Il test verifica anche il rifiuto di un percorso workflow e la richiesta di auto-merge senza bypass.
