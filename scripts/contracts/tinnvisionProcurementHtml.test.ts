import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  parseItalianMoney,
  parseTinnvisionProcurementPage,
} from "./tinnvisionProcurementHtml";

describe("Tinnvision procurement HTML parser", () => {
  it("parses rich procurement fields and formal identifiers from the official table shape", () => {
    const result = parseTinnvisionProcurementPage(fixture(), 1);

    assert.equal(result.reportedTotalElements, 947);
    assert.equal(result.reportedTotalPages, 32);
    assert.equal(result.records.length, 2);
    assert.deepEqual(result.records[0], {
      sourceId: "tinn:2026:248",
      recordYear: 2026,
      recordId: "248",
      detailUrl:
        "https://trasparenza.tinnvision.cloud/traspamm/bandodigara/00301390795/2/2026/248/?idsezione=216",
      proposer: "Comune di Lamezia Terme",
      choiceProcedure: "Affidamento diretto",
      object: "Servizio di manutenzione applicativa",
      rawCig: "B123456789",
      cigCandidates: ["B123456789"],
      cigs: ["B123456789"],
      invalidCigs: [],
      invitedOperators: "Operatore A; Operatore B",
      awardee: "Società Alfa S.r.l.",
      startDate: "2026-01-15",
      endDate: "2026-12-31",
      awardAmount: 12345.67,
      liquidatedAmount: 5000,
      procedureType: "Servizi",
      procedureNumber: "FTE-248",
      sourcePage: 1,
    });
  });

  it("preserves invalid CIG placeholders without promoting them to contract identity", () => {
    const result = parseTinnvisionProcurementPage(fixture(), 1);
    assert.deepEqual(result.records[1].cigCandidates, ["0000000000"]);
    assert.deepEqual(result.records[1].cigs, []);
    assert.deepEqual(result.records[1].invalidCigs, ["0000000000"]);
  });

  it("parses Italian monetary notation conservatively", () => {
    assert.equal(parseItalianMoney("€ 1.234,56"), 1234.56);
    assert.equal(parseItalianMoney("0,00"), 0);
    assert.equal(parseItalianMoney("-"), null);
  });
});

function fixture(): string {
  return `
    <html>
      <body>
        <div>947 elementi</div>
        <div>Pagina 1 / 32</div>
        <table>
          <thead>
            <tr>
              <th>Struttura proponente</th>
              <th>Procedura di scelta del contraente</th>
              <th>Oggetto del bando</th>
              <th>CIG/Smartcig</th>
              <th>Elenco degli operatori invitati a presentare offerte/Numero di offerenti che hanno partecipato al procedimento</th>
              <th>Aggiudicatario</th>
              <th>Tempi di completamento</th>
              <th>Importo di aggiudicazione</th>
              <th>Importo delle somme liquidate</th>
              <th>Tipologia di procedura</th>
              <th>Numero FTE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Comune di Lamezia Terme</td>
              <td>Affidamento diretto</td>
              <td><a href="/traspamm/bandodigara/00301390795/2/2026/248/?idsezione=216">Servizio di manutenzione applicativa</a></td>
              <td>B123456789</td>
              <td>Operatore A; Operatore B</td>
              <td>Societ&agrave; Alfa S.r.l.</td>
              <td>15/01/2026 - 31/12/2026</td>
              <td>&euro; 12.345,67</td>
              <td>5.000,00</td>
              <td>Servizi</td>
              <td>FTE-248</td>
            </tr>
            <tr>
              <td>Comune di Lamezia Terme</td>
              <td>Procedura aperta</td>
              <td><a href="https://trasparenza.tinnvision.cloud/traspamm/bandodigara/00301390795/2/2017/7/?idsezione=216">Procedura storica</a></td>
              <td>0000000000</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>Lavori</td>
              <td>7</td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>`;
}
