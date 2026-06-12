# Allineamento a best practice AgID, Developers Italia e Designers Italia

Questo documento traduce in regole operative per Lamezia Trasparente Monitor alcune prassi rilevanti per software pubblico, riuso, interoperabilità, open data, manutenzione e accessibilità.

Non è un parere legale e non sostituisce verifiche formali di conformità. Serve come checklist architetturale per progettare integrazioni più robuste, riusabili e trasparenti.

## Fonti di riferimento

- Linee guida AgID su acquisizione e riuso di software per le pubbliche amministrazioni: `https://docs.italia.it/italia/developers-italia/lg-acquisizione-e-riuso-software-per-pa-docs/it/stabile/`
- Guida alla pubblicazione di software open source: `https://docs.italia.it/italia/developers-italia/lg-acquisizione-e-riuso-software-per-pa-docs/it/stabile/attachments/allegato-a-guida-alla-pubblicazione-open-source-di-software-realizzato-per-la-pa.html`
- Guida alla manutenzione di software open source: `https://docs.italia.it/italia/developers-italia/lg-acquisizione-e-riuso-software-per-pa-docs/it/stabile/attachments/allegato-b-guida-alla-manutenzione-di-software-open-source.html`
- Designers Italia / design system del Paese: `https://designers.italia.it/argomenti/design-system/`
- Fondamento accessibilità del design system: `https://designers.italia.it/design-system/fondamenti/accessibilita/`
- PDND Interoperabilità, come riferimento operativo per concetti di interoperabilità, e-service, catalogo e accesso controllato: `https://docs.pagopa.it/interoperabilita-1/`

## 1. Documentazione pubblica e riuso

### Regola

Ogni integrazione deve essere comprensibile da un soggetto esterno che voglia verificare, riusare o manutenere il software.

### Applicazione nella repository

- La decisione architetturale va documentata in `docs/architecture/`, non solo nel testo di una issue.
- Le API pubbliche vanno documentate in `artifacts/api-server/PUBLIC_API.md` e, quando applicabile, nella specifica OpenAPI.
- Le fonti dati vanno elencate nel catalogo fonti con ruolo, licenza, granularità e caveat.
- Le PR devono dichiarare ambito, file toccati, esclusioni e validazioni eseguite.
- Non inserire segreti, credenziali, token o dati personali non necessari in documenti o fixture.

### Checklist

- [ ] Un nuovo maintainer capisce dove nasce il dato.
- [ ] Un riusatore capisce quali endpoint usare.
- [ ] Un revisore capisce quali limiti ha la fonte.
- [ ] Un operatore capisce cosa fare se la fonte si rompe.

## 2. API-first e contratti espliciti

### Regola

Le superfici pubbliche devono essere documentate, versionate e prevedibili.

### Applicazione

- REST pubblica sotto `/api/public/v1`.
- OpenAPI 3.1 auto-ospitata quando la superficie REST è pubblica.
- MCP pubblico separato su `/api/mcp`, read-only e stateless.
- Stesso data-access layer per REST e MCP quando espongono lo stesso dominio.
- Envelope uniforme per liste e paginazione.
- Errori coerenti: HTTP per REST, `isError: true` per tool MCP di dettaglio quando l'entità manca.

### Da evitare

- endpoint non versionati per dati stabili;
- tool MCP con logica diversa dalla REST per lo stesso dominio;
- breaking change non documentati;
- endpoint pubblici che dipendono da scraping live in page view;
- esposizione di payload grezzi eccedenti.

## 3. Interoperabilità e separazione dei ruoli

### Regola

L'integrazione non deve confondere produttore del dato, aggregatore del dato e applicazione che lo pubblica.

### Applicazione

Per ogni dato esposto, mantenere almeno:

```txt
fonte primaria -> eventuale fonte federata -> trasformazione locale -> superficie pubblica
```

Esempio Cruscotto Italia:

```txt
ANAC / BDAP-MOP / SIOPE / ISTAT -> Cruscotto Italia -> cache Lamezia -> Dossier Comune / diff / API
```

### Checklist

- [ ] La fonte primaria è visibile.
- [ ] La fonte federata è visibile, se presente.
- [ ] La trasformazione locale è dichiarata.
- [ ] È chiaro se il dato è ufficiale, normalizzato, derivato, editoriale o solo di audit.

## 4. Open data e metadati

### Regola

Quando Lamezia Trasparente pubblica dataset riusabili, deve favorire formati aperti, metadati, licenze, tracciabilità e accesso leggibile da macchine.

### Applicazione

- Catalogo locale DCAT-AP_IT dove applicabile.
- API CKAN compatibile dove già prevista.
- Risorse con identificativi stabili.
- Dataset con licenza, descrizione, data di aggiornamento, fonte e caveat.
- Collegamento tra dataset e risorsa effettiva.
- Nessun dataset deve promettere completezza se la pipeline non la garantisce.

### Checklist dataset

- [ ] Titolo chiaro.
- [ ] Descrizione non promozionale.
- [ ] Fonte primaria.
- [ ] Licenza.
- [ ] Data ultimo aggiornamento o estrazione.
- [ ] Formato.
- [ ] Granularità.
- [ ] Caveat.
- [ ] Endpoint o URL di download.

## 5. Manutenzione e source health

### Regola

Una fonte integrata è un impegno di manutenzione. Se non è monitorabile, non va presentata come affidabile.

### Applicazione

- Ogni adapter deve distinguere assenza dati, errore tecnico e fonte non raggiungibile.
- Le ingestion devono essere idempotenti.
- Gli errori devono essere osservabili nei log o nei controlli di source health.
- Gli snapshot validi precedenti possono essere usati come fallback solo se la UI dichiara che il dato è stale.
- Le fonti obsolete devono essere deprecate con nota documentale, non rimosse silenziosamente.

### Stati consigliati

| Stato | Uso |
| --- | --- |
| `ok` | fonte raggiunta e dati validati |
| `partial` | fonte raggiunta ma payload incompleto |
| `missing` | nessun dato disponibile dalla fonte |
| `stale` | ultimo snapshot valido oltre soglia |
| `error` | errore tecnico di acquisizione |
| `disabled` | fonte sospesa deliberatamente |

## 6. Accessibilità e chiarezza del servizio

### Regola

L'accessibilità va considerata dal disegno dell'integrazione, non come correzione finale della UI.

### Applicazione

- Badge fonte e caveat devono essere leggibili da tastiera e screen reader.
- I dati non devono dipendere solo dal colore.
- Le mappe devono avere alternative testuali o tabelle equivalenti per i contenuti essenziali.
- Le tabelle devono mantenere intestazioni chiare e ordinamento comprensibile.
- Gli stati vuoti devono spiegare assenza dato, errore o fonte non configurata.
- I testi devono distinguere “dato non disponibile” da “evento non avvenuto”.

### Copy prudente

Preferire:

```txt
Il dato federato non risulta presente nello snapshot locale. Verificare fonte e data di aggiornamento.
```

Evitare:

```txt
Il Comune non ha pubblicato il dato.
```

La seconda frase può essere falsa se il dato esiste altrove, se la pipeline è rotta o se la fonte federata ha una diversa cadenza.

## 7. Privacy e minimizzazione

### Regola

Pubblicare solo ciò che serve alla finalità civica dichiarata e che è già pubblicabile in base alla fonte e al contesto.

### Applicazione

- Non esporre dati personali contenuti incidentalmente in allegati se non necessari.
- Non pubblicare raw snapshot se includono campi eccedenti.
- Non usare AI o classificazioni automatiche per profilare persone fisiche.
- Non collegare dataset in modo da creare inferenze personali non necessarie.
- Per dati puntuali o subcomunali, valutare sempre granularità, reidentificazione e finalità.

## 8. Sicurezza e separazione delle superfici

### Regola

Le superfici pubbliche devono essere read-only e prive di segreti. Le scritture restano su canali protetti.

### Applicazione

- REST pubblica senza autenticazione solo per dati già pubblicabili.
- MCP pubblico senza strumenti di scrittura.
- Ingestion, moderazione e pubblicazione editoriale dietro controlli interni.
- Nessun token o credenziale in repository.
- Object storage raggiunto tramite meccanismi di piattaforma documentati, non credenziali hard-coded.

## 9. Valutazione comparativa e riuso

### Regola

Prima di introdurre una nuova fonte o un nuovo componente, verificare se esiste già una soluzione pubblica, riusabile o istituzionale.

### Applicazione

Cruscotto Italia è un caso tipico: invece di ricostruire da zero tutte le integrazioni nazionali, Lamezia Trasparente può usarlo come fonte federata e benchmark, preservando però ingestion locali dove hanno maggiore dettaglio o rilevanza civica.

Domande da chiudere:

- la fonte ufficiale primaria è più adatta della fonte federata?
- la fonte federata ha aggiornamento, licenza e formato adeguati?
- esiste un identificativo stabile per collegare i dati?
- la dipendenza introduce rischio di lock-in o fragilità?
- il dato serve alla UI pubblica o solo ad audit interno?

## 10. Criteri di revisione PR per integrazioni

Una PR che introduce o modifica una fonte dati dovrebbe dichiarare:

- fonte e licenza;
- dati trattati;
- file toccati;
- schema o modello dati;
- migrazioni, se presenti;
- endpoint REST/MCP, se presenti;
- impatti su open data;
- impatti su privacy/accessibilità/copy;
- validazioni eseguite;
- fallback e source health;
- cosa resta fuori scope.

## Tabella di conformità pratica

| Ambito | Applicazione concreta nel progetto |
| --- | --- |
| Riuso software | repository pubblica, documentazione, PR tracciabili, comandi di build e typecheck |
| Manutenzione | source health, fallback, deprecazione, checklist operative |
| Interoperabilità | API REST versionata, OpenAPI, MCP stateless, data-access layer condiviso |
| Open data | DCAT-AP_IT, CKAN compatibile, licenze, metadati, dataset/risorse |
| Accessibilità | design by default, alternative a mappe/grafici, testi chiari, focus e stati vuoti |
| Privacy | minimizzazione, no raw eccedente, no profiling, no dati personali inutili |
| Trasparenza civica | fonte primaria, fonte federata, caveat, nessuna inferenza accusatoria automatica |

## Checklist finale per Cruscotto Italia

- [ ] Documentare Cruscotto Italia come fonte federata, non primaria.
- [ ] Conservare fonte primaria per ogni metrica.
- [ ] Preferire cache locale read-only a chiamate live in UI.
- [ ] Pubblicare solo KPI con licenza, data e granularità chiari.
- [ ] Usare diff locale/federato come audit, non come anomalia.
- [ ] Aggiornare OpenAPI e PUBLIC_API.md se si aggiungono endpoint.
- [ ] Aggiornare MCP con tool read-only e coerenti con REST.
- [ ] Aggiungere caveat accessibili e visibili nella UI.
- [ ] Non introdurre score di rischio o legalità.
