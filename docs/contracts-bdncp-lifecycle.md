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
- `Da verificare`: sono presenti dati o identificativi, ma la fonte completa non e ancora collegata.
- `Non documentata`: la fase non e documentata nelle fonti disponibili.

## Fonti

- BDNCP/ANAC: usata oggi come `link/search bridge`, non come record sincronizzato.
- PVL ANAC: collegamento ufficiale di ricerca per pubblicita legale.
- Albo Pretorio: fonte locale collegabile agli eventi di affidamento, esecuzione e collaudo quando gli atti citano CIG o CUP.
- Dataset locale: dato derivato dalla base applicativa, da non confondere con verifica sostanziale.

## Limiti pubblici

La UI usa formule come `da verificare`, `collegamento parziale`, `fonte ufficiale`, `dato derivato` e `limite informativo`. Non usa il collegamento BDNCP per dichiarare regolarita, completezza o sincronizzazione completa.

Quando non esiste una fonte stabile ingerita, la piattaforma mostra un ponte di ricerca e conserva il limite informativo. Il prossimo passo tecnico potra collegare API o dump stabili BDNCP/PCP/OpenCUP solo quando disponibili e verificabili.
