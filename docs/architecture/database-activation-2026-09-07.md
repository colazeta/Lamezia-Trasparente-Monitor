# Stato operativo dopo l'assessment

Aggiornamento dell'issue #1101, collegata a #1096 e #1055. Rilevazione del 7 settembre 2026, **19:24:32 UTC**, successiva alla baseline dell'assessment delle 17:47:58 UTC.

## Risultato verificato in produzione

| Elemento | Stato osservato |
|---|---|
| PostgreSQL | 18.6, database `neondb` del progetto Neon `empty-cherry-93566793` |
| Tabelle e colonne applicative | 70 tabelle, 718 colonne nello schema public |
| Migrazioni registrate | 21, incluse 0019 e 0020 |
| Registro delle fonti | 5 fonti, 5 artefatti, 5 release |
| Record di fonte | 260 osservazioni conservate e riconciliate |
| PNRR di compatibilità | 30 schede in `attuazione_pnrr_projects` |
| Dimensione database | 14.442.496 byte al momento della misura |
| `publications.brief_manual` | NOT NULL, default false |

I 260 record comprendono 138 elementi e 2 esclusioni dell'Albo corrente, 79 elementi dell'archivio delibere, 30 schede PNRR e 11 evidenze Albo. I due snapshot ANAC hanno zero record: i rispettivi stati `degraded` e `pending`, i limiti e le date dichiarate sono conservati. La data epoch della fonte pending resta una data grezza dichiarata, non un'attestazione di aggiornamento.

Ogni tentativo di questa importazione risulta `succeeded` con conteggio verificato uguale all'atteso. Sono stati confrontati payload, ordine, chiavi, hash, metadati e collezioni con il testo originale. Per il PNRR sono stati verificati tutti i campi della mappatura. I file importati appartengono al commit integrato `fe6cb1e23dc6bbf39e3d25c9e6135334e0b7b9da` e hanno gli stessi hash dei file collaudati nella copia isolata.

Questo risultato è una prima tranche di persistenza. Non certifica che tutte le fonti del repository o tutti gli universi ufficiali siano già nel database; non equivale alla normalizzazione completa dei domini o a un benchmark di prestazioni.

## Modalità di applicazione

La [PR #1100](https://github.com/colazeta/Lamezia-Trasparente-Monitor/pull/1100), con assessment, modello e console, è stata integrata dopo la CI verde al commit `c5b5f1584fdf857e51dd012113336f80c0ef4e0c`. La migrazione 0019 risultava già applicata nel controllo della produzione delle 19:16:54 UTC; l'osservazione non attribuisce l'esecuzione a uno specifico processo di deploy.

La [PR #1103](https://github.com/colazeta/Lamezia-Trasparente-Monitor/pull/1103), con il registro e l'importatore, è stata integrata dopo la CI verde al commit `fe6cb1e23dc6bbf39e3d25c9e6135334e0b7b9da`.

La migrazione 0020 è stata applicata tramite il connettore Neon in una singola transazione: blocco del registro migrazioni, confronto esatto delle 20 coppie hash/timestamp precedenti, controllo di assenza del nuovo registro, esecuzione dei 16 statement originali e registrazione dell'hash `5558d4c53dfe17d861f9049e7c0bf5ecb6e87565717ecef2d875f5a60fd54746` con timestamp `1788806852141`. Timeout di lock 3 secondi e di statement 15 secondi. Nessun hash storico è stato cambiato.

Le cinque importazioni sono state eseguite con gli statement prodotti dalle funzioni versionate dell'importatore, usando il connettore come trasporto e guardie transazionali sulle query di riconciliazione. I tentativi sono registrati prima delle transazioni dei dati. Non viene dichiarata un'esecuzione completa del CLI via TCP in questo ambiente. Le [evidenze operative JSON](audits/2026-09-07/database-activation.json) contengono conteggi, hash e stati, senza segreti o valori dei record applicativi.

## Collegamenti ancora da attivare

**Aggiornamento automatico:** il [primo workflow su main](https://github.com/colazeta/Lamezia-Trasparente-Monitor/actions/runs/34155259023) è fallito al controllo preliminare perché il secret GitHub `DATABASE_URL` non è configurato. Non ha eseguito l'importazione. Il popolamento verificato sopra è stato eseguito separatamente attraverso Neon. Occorre configurare la connessione nel contesto server di GitHub e osservare un'esecuzione completa verificata prima di dichiarare operativa la cadenza giornaliera.

**Accesso personale alla console:** codice, controlli di autorizzazione e interfaccia `/admin/database` sono integrati. Il sito pubblico viene distribuito da Cloudflare Pages; questo non dimostra la connessione all'API o l'autenticazione del proprietario. Il backend individuato nel contesto del progetto è il servizio Render `lamezia-trasparente-api` (ID `srv-d8mmv6urnols73cr5qa0`). Al momento di questa prima registrazione era stato richiesto il collegamento a Render. La [verifica successiva del runtime](render-runtime-activation.md) conferma 21/21 migrazioni e identifica l'assenza della chiave Clerk. Restano da verificare la sessione Clerk del proprietario, `DATABASE_ADMIN_USER_ID`, le chiavi previste e il percorso frontend → API → PostgreSQL. Senza tali prove l'admin non è dichiarato utilizzabile.

Non occorre chiedere al proprietario di recuperare identificativi tecnici: una volta collegati gli account necessari, la configurazione va recuperata e verificata dai servizi. Nessuna credenziale deve entrare nel repository o nei report.

## Prossime priorità

1. Completare i due collegamenti operativi e verificare accesso del proprietario e rifiuto degli altri account.
2. Estendere il censimento e la riconciliazione agli altri flussi, con perimetri fonte dichiarati e nessun valore obbligatorio inventato.
3. Proseguire la normalizzazione e le identità canoniche secondo le fasi esistenti; quelle 3–4 restano parziali.
4. Passare le letture pubbliche al database solo dopo confronto di equivalenza; misurare le query reali prima di aggiungere indici candidati.
