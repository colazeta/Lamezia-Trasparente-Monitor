# Contratti pubblici: dossier BDNCP/CUP lifecycle

Questa fondazione trasforma la sezione contratti in un fascicolo civico del contratto/opera. Il modulo non tratta il link ANAC come prova completa: distingue identificativi, fonti, fasi documentate e limiti informativi.

## Identificativi

- `CIG`: chiave primaria della procedura/contratto. Il controllo locale e solo formale normalizza il token e costruisce un ponte di ricerca verso il cruscotto BDNCP quando il formato e coerente.
- `CUP`: chiave progetto/investimento. Per lavori pubblici e opere e un asse di lettura distinto dal CIG; se manca, la UI mostra `CUP non rilevato nelle fonti disponibili`.
- `ID interno`: identificativo della piattaforma locale. Non sostituisce CIG o CUP.

## Fasi lifecycle

Ordine canonico usato in UI e test:

1. Programmazione
2. Progettazione
3. Gara / pubblicazione
4. Affidamento
5. Esecuzione
6. Valutazione / collaudo / esito

Ogni fase espone uno stato pubblico prudente:

- `Documentata`: esiste evidenza con fonte disponibile nel perimetro locale.
- `Da verificare`: sono presenti dati o identificativi, ma la fonte originaria non e ancora collegata o ingerita.
- `Non documentata`: la fase non e documentata nelle fonti disponibili.

## Fonti

- BDNCP/ANAC: usata oggi come `link/search bridge`, non come record sincronizzato.
- PVL ANAC: collegamento ufficiale di ricerca per pubblicita legale.
- Albo Pretorio: fonte locale collegabile agli eventi di affidamento, esecuzione e collaudo quando gli atti citano CIG o CUP.
- Dataset locale: dato derivato dalla base applicativa, da non confondere con verifica sostanziale.

## Limiti pubblici

La UI usa formule come `da verificare`, `ponte di ricerca`, `fonte ufficiale collegata`, `fonte ufficiale ingerita`, `dato derivato` e `limite informativo`. Non usa il collegamento BDNCP per dichiarare regolarita, completezza o sincronizzazione completa.

Quando non esiste una fonte stabile ingerita, la piattaforma mostra un ponte di ricerca e conserva il limite informativo. Il prossimo passo tecnico potra collegare API o dump stabili BDNCP/PCP/OpenCUP solo quando disponibili e verificabili.

## Dal ponte di ricerca all'ingestione

Dopo questa PR il modulo distingue tre livelli:

- `ponte di ricerca`: link ufficiale verso ANAC/BDNCP o PVL, senza record locale sincronizzato;
- `fonte ufficiale collegata`: documento o pagina ufficiale collegata alla scheda locale;
- `fonte ufficiale ingerita`: record letto da fixture parserizzata o, in futuro, da file ufficiale stabile con metadata di ingestione.

Lo skeleton in `scripts/contracts/` legge solo fixture JSON locali, normalizza record ANAC CIG/open-data style, allega metadata `ContractIngestionMetadata` e produce oggetti compatibili con il dossier. Le fixture sono esclusivamente test-only e non alimentano pagine pubbliche.

Lo skeleton non scarica dataset, non interroga API live, non fa scraping, non scrive nel database e non dichiara sincronizzazione BDNCP. Serve a fissare il contratto tecnico per parser futuri: identificativi, evidenze, metadata, stati di mapping e limiti pubblici.

L'ingestione parte da open data o layer OCDS-style perche sono fonti strutturate, versionabili e verificabili. Le pagine dinamiche ANAC/PVL restano punti di consultazione o ricerca: non devono essere raschiate e non devono essere trattate come dataset locale.

BDNCP/ANAC non completa automaticamente esecuzione e collaudo. Un record CIG puo sostenere gara/pubblicazione e, se contiene campi significativi di aggiudicazione, affidamento; esecuzione, SAL, liquidazioni, collaudo o esito restano `non documentato nelle fonti disponibili` finche non esiste una fonte esplicita.

CUP, OpenCUP e MOP restano un asse separato opera/progetto. Per lavori pubblici il CUP collega programmazione/progetto/investimento; MOP potra sostenere avanzamento e collaudo solo quando una pipeline documentata lo ingerira.

Prossime PR consigliate:

- discovery stabile dei dataset ufficiali ANAC/BDNCP/OCDS con versioni e URL;
- parser reali per CIG annuali, delta e aggiudicazioni;
- parser separati per CUP/OpenCUP e MOP;
- persistenza con freshness, source record id e deduplica;
- gate di revisione umana prima di pubblicare dati reali ingeriti.
