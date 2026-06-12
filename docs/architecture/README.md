# Architettura delle integrazioni

Questa cartella documenta come le fonti esterne, i dati locali, le API pubbliche e le superfici di consultazione alimentano **Lamezia Trasparente Monitor**.

La documentazione ha uno scopo operativo: rendere verificabile da maintainer, revisori civici, sviluppatori e riusatori quali dati entrano nel sistema, come vengono trattati, quali limiti hanno e dove vengono esposti.

## Documenti

- [`integrations-overview.md`](integrations-overview.md) — architettura logica delle integrazioni, pipeline dati, controlli e regole di pubblicazione.
- [`integration-source-catalog.md`](integration-source-catalog.md) — catalogo delle fonti che alimentano o possono alimentare il prodotto, con ruolo, stato, superficie pubblica e caveat.
- [`cruscotto-italia-integration.md`](cruscotto-italia-integration.md) — integrazione di Cruscotto Italia come fonte federata nazionale per il comune di Lamezia Terme.
- [`agid-alignment.md`](agid-alignment.md) — applicazione pratica di best practice AgID/Developers Italia/Designers Italia a documentazione, API, riuso, open data, accessibilità e manutenzione.

## Principio fondamentale

Ogni integrazione deve distinguere sempre:

1. **fonte primaria**: l'ente o il sistema che produce il dato;
2. **fonte federatrice o intermediaria**: eventuale piattaforma che aggrega o normalizza dati di terzi;
3. **trasformazione locale**: parsing, pulizia, normalizzazione, arricchimento, classificazione o collegamento editoriale fatto da Lamezia Trasparente Monitor;
4. **superficie pubblica**: web, mobile, REST, MCP, open data o esportazioni.

La piattaforma non deve presentare un dato derivato come se fosse un dato ufficiale primario, né deve presentare una lacuna informativa come prova di irregolarità.

## Regole non negoziabili

- Le API pubbliche restano **read-only**.
- REST e MCP devono leggere dallo stesso data-access layer quando espongono gli stessi domini.
- Ogni nuovo dominio dati deve avere fonte, licenza, data di estrazione, granularità e caveat.
- Gli endpoint pubblici devono essere versionati o inseriti in una superficie già versionata.
- Gli aggiornamenti automatici non devono sovrascrivere silenziosamente evidenze locali già acquisite.
- I dati federati vanno usati per contesto, audit e confronto, non per sostituire le ingestion locali senza istruttoria.
- Nessun punteggio di rischio, legalità, opacità o anomalia deve essere generato automaticamente senza una metodologia separata, discussa e documentata.

## Relazioni con la documentazione esistente

Questa cartella integra, ma non sostituisce:

- [`artifacts/api-server/PUBLIC_API.md`](../../artifacts/api-server/PUBLIC_API.md), che resta la documentazione utente della superficie REST/MCP pubblica;
- [`replit.md`](../../replit.md), che resta il riferimento operativo sintetico del monorepo;
- la specifica OpenAPI pubblica auto-ospitata dall'applicazione;
- le issue e PR operative, che restano il luogo di tracciamento delle decisioni puntuali.

## Riferimenti esterni principali

- Cruscotto Italia: `https://cruscotto-italia.dati.gov.it/about.html`
- Repository Cruscotto Italia: `https://github.com/AgID/cruscotto-italia`
- Linee guida AgID su acquisizione e riuso software per le PA: `https://docs.italia.it/italia/developers-italia/lg-acquisizione-e-riuso-software-per-pa-docs/it/stabile/`
- Guida Developers Italia alla pubblicazione open source: `https://docs.italia.it/italia/developers-italia/lg-acquisizione-e-riuso-software-per-pa-docs/it/stabile/attachments/allegato-a-guida-alla-pubblicazione-open-source-di-software-realizzato-per-la-pa.html`
- Guida Developers Italia alla manutenzione open source: `https://docs.italia.it/italia/developers-italia/lg-acquisizione-e-riuso-software-per-pa-docs/it/stabile/attachments/allegato-b-guida-alla-manutenzione-di-software-open-source.html`
- Designers Italia / design system: `https://designers.italia.it/argomenti/design-system/`
