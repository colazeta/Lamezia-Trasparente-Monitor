import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  diffAlboItems,
  normalizeAlboRecords,
  parseTinnvisionHtml,
  parseTinnvisionXml,
  runAlboIngestion,
  type AlboRawSnapshot,
} from "./albo-tinnvision";
import { ALBO_PRETORIO_LAMEZIA_SOURCE } from "./albo-source-config";

const FIXTURE_RETRIEVED_AT = "2026-06-19T10:00:00.000Z";

test("parses Tinnvision XML export and normalises minimal albo_item fields", () => {
  const records = parseTinnvisionXml(xmlFixture());
  assert.equal(records.length, 4);
  assert.equal(records[0].publication_number, "2026/1001");
  assert.equal(records[0].publication_start, "2026-06-19");
  assert.equal(records[0].publication_end, "2026-07-04");
  assert.equal(records[0].act_number, "966");
  assert.equal(records[0].act_date, "2026-06-16");

  const items = normalizeAlboRecords(snapshot(records));
  assert.equal(items[0].id, "albo-2026-1001");
  assert.equal(items[0].source, ALBO_PRETORIO_LAMEZIA_SOURCE.source);
  assert.equal(items[0].source_url, ALBO_PRETORIO_LAMEZIA_SOURCE.sourceUrl);
  assert.equal(items[0].verification_status, "official_source_acquired");
  assert.equal(items[0].public_visibility, "publishable");
  assert.match(items[0].content_hash, /^[a-f0-9]{64}$/);

  assert.equal(items[1].public_visibility, "metadata_only");
  assert.equal(items[1].privacy_risk, "high");
  assert.equal(items[2].public_visibility, "publishable_with_minimisation");
  assert.equal(items[2].privacy_risk, "medium");
  assert.equal(items[3].public_visibility, "do_not_publish");
  assert.equal(items[3].privacy_risk, "high");
});

test("parses controlled print HTML fallback table", () => {
  const records = parseTinnvisionHtml(`
    <table id="pubblicazioni_table">
      <tbody>
        <tr>
          <td></td>
          <td class="text-center">2026/2001</td>
          <td class="text-lowercase"> SETTORE TECNICO </td>
          <td class="text-lowercase">DETERMINAZIONE DIRIGENZIALE NR. 12 DEL 18/06/2026</td>
          <td class="text-lowercase"><a data-id="2026-2001">Affidamento servizio verde pubblico</a></td>
          <td><span data-value="12">12</span></td>
          <td><span data-value="3">3</span></td>
          <td><span data-value="0">0</span></td>
          <td class="no-wrap">19/06/2026 - 04/07/2026</td>
        </tr>
      </tbody>
    </table>
  `);

  assert.equal(records.length, 1);
  assert.equal(records[0].publication_number, "2026/2001");
  assert.equal(records[0].act_type, "DETERMINAZIONE DIRIGENZIALE");
  assert.equal(records[0].act_number, "12");
  assert.equal(records[0].act_date, "2026-06-18");
});

test("diffs new, changed, removed and unchanged records by item id and content hash", () => {
  const previous = normalizeAlboRecords(
    snapshot(
      parseTinnvisionXml(`
        ${xmlRecord("2026/1", "DETERMINAZIONE DIRIGENZIALE", "SETTORE TECNICO", "Affidamento servizio A", "1")}
        ${xmlRecord("2026/2", "CONVOCAZIONI COMMISSIONI CONSILIARI", "SEGRETERIA", "Convocazione commissione", "")}
        ${xmlRecord("2026/4", "AVVISO PUBBLICO", "SEGRETERIA", "Avviso rimosso", "")}
      `),
    ),
  );
  const next = normalizeAlboRecords(
    snapshot(
      parseTinnvisionXml(`
        ${xmlRecord("2026/1", "DETERMINAZIONE DIRIGENZIALE", "SETTORE TECNICO", "Affidamento servizio A aggiornato", "1")}
        ${xmlRecord("2026/2", "CONVOCAZIONI COMMISSIONI CONSILIARI", "SEGRETERIA", "Convocazione commissione", "")}
        ${xmlRecord("2026/3", "AVVISO PUBBLICO", "SEGRETERIA", "Nuovo avviso pubblico", "")}
      `),
    ),
  );

  const diff = diffAlboItems(previous, next);

  assert.deepEqual(diff.new.map((item) => item.publication_number), ["2026/3"]);
  assert.deepEqual(diff.changed.map((entry) => entry.after.publication_number), [
    "2026/1",
  ]);
  assert.deepEqual(diff.removed.map((item) => item.publication_number), [
    "2026/4",
  ]);
  assert.deepEqual(diff.unchanged.map((item) => item.publication_number), [
    "2026/2",
  ]);
});

test("run command writes snapshots and public outputs without mirroring sensitive subjects", async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), "albo-tinnvision-"));
  const fixturePath = path.join(tmp, "albo.xml");
  const outDir = path.join(tmp, "data");
  await writeFile(fixturePath, xmlFixture(), "utf8");

  const result = await runAlboIngestion({
    outDir,
    fromFile: fixturePath,
    inputFormat: "xml",
    retrievedAt: FIXTURE_RETRIEVED_AT,
  });

  assert.equal(result.snapshot.records.length, 4);
  assert.equal(result.publicLatest.counts.acquired, 4);
  assert.equal(result.publicLatest.counts.publishable, 1);
  assert.equal(result.publicLatest.counts.minimised, 1);
  assert.equal(result.publicLatest.counts.metadata_only, 1);
  assert.equal(result.publicLatest.counts.excluded, 1);

  const publicLatest = await readFile(result.paths.publicLatest, "utf8");
  assert.doesNotMatch(publicLatest, /ROSSI MARIO|BIANCHI LUCIA|VERDI ANNA/i);
  assert.match(publicLatest, /Oggetto minimizzato per prudenza privacy/);
  assert.match(publicLatest, /Metadato minimo/);

  for (const publicRecord of [
    ...result.publicLatest.items,
    ...result.publicLatest.excluded,
  ]) {
    assert.equal(publicRecord.source, ALBO_PRETORIO_LAMEZIA_SOURCE.source);
    assert.equal(publicRecord.retrieved_at, FIXTURE_RETRIEVED_AT);
    assert.ok(publicRecord.known_limits.length > 0);
    assert.ok(publicRecord.verification_status);
  }

  const runLog = await readFile(result.paths.runLog, "utf8");
  assert.match(runLog, /Atti acquisiti: 4/);
  assert.match(runLog, /Minimizzati: 1/);
  assert.match(runLog, /Solo metadato: 1/);
  assert.match(runLog, /Esclusi dal public layer: 1/);
});

test("run command compares against the previous current snapshot", async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), "albo-tinnvision-diff-"));
  const previousPath = path.join(tmp, "previous.xml");
  const nextPath = path.join(tmp, "next.xml");
  const outDir = path.join(tmp, "data");

  await writeFile(
    previousPath,
    [
      xmlRecord("2026/1", "DETERMINAZIONE DIRIGENZIALE", "SETTORE TECNICO", "Affidamento servizio A", "1"),
      xmlRecord("2026/2", "AVVISO PUBBLICO", "SEGRETERIA", "Avviso stabile", ""),
      xmlRecord("2026/4", "AVVISO PUBBLICO", "SEGRETERIA", "Avviso non piu presente", ""),
    ].join("\n"),
    "utf8",
  );
  await writeFile(
    nextPath,
    [
      xmlRecord("2026/1", "DETERMINAZIONE DIRIGENZIALE", "SETTORE TECNICO", "Affidamento servizio A aggiornato", "1"),
      xmlRecord("2026/2", "AVVISO PUBBLICO", "SEGRETERIA", "Avviso stabile", ""),
      xmlRecord("2026/3", "AVVISO PUBBLICO", "SEGRETERIA", "Nuovo avviso", ""),
    ].join("\n"),
    "utf8",
  );

  await runAlboIngestion({
    outDir,
    fromFile: previousPath,
    inputFormat: "xml",
    retrievedAt: "2026-06-19T08:00:00.000Z",
  });
  const result = await runAlboIngestion({
    outDir,
    fromFile: nextPath,
    inputFormat: "xml",
    retrievedAt: "2026-06-19T09:00:00.000Z",
  });

  assert.equal(result.publicDiff.counts.new, 1);
  assert.equal(result.publicDiff.counts.changed, 1);
  assert.equal(result.publicDiff.counts.removed, 1);
  assert.equal(result.publicDiff.counts.unchanged, 1);

  const publicDiff = await readFile(result.paths.publicDiff, "utf8");
  assert.match(publicDiff, /"new"/);
  assert.match(publicDiff, /"changed"/);
  assert.match(publicDiff, /"removed"/);
  assert.match(publicDiff, /"unchanged"/);
});

function snapshot(records: ReturnType<typeof parseTinnvisionXml>): AlboRawSnapshot {
  return {
    source: ALBO_PRETORIO_LAMEZIA_SOURCE.source,
    source_url: ALBO_PRETORIO_LAMEZIA_SOURCE.sourceUrl,
    provider: ALBO_PRETORIO_LAMEZIA_SOURCE.provider,
    retrieved_at: FIXTURE_RETRIEVED_AT,
    fetch_method: "xml",
    raw_format: "xml",
    structured_export_attempts: [],
    records,
    warnings: [],
    known_limits: [...ALBO_PRETORIO_LAMEZIA_SOURCE.knownLimits],
  };
}

function xmlFixture(): string {
  return [
    xmlRecord(
      "2026/1001",
      "DETERMINAZIONE DIRIGENZIALE",
      "SETTORE GESTIONE DEL TERRITORIO",
      "Affidamento servizio manutenzione verde pubblico CIG ABC1234567",
      "966",
    ),
    xmlRecord(
      "2026/1002",
      "PUBBLICAZIONE DI MATRIMONIO",
      "SERVIZI DEMOGRAFICI",
      "PUBBLICAZIONE DI MATRIMONIO DEI SIG.RI ROSSI MARIO E BIANCHI LUCIA",
      "",
    ),
    xmlRecord(
      "2026/1003",
      "DETERMINAZIONE DIRIGENZIALE",
      "SETTORE AVVOCATURA",
      "Proposta transattiva risarcimento danni VERDI ANNA",
      "22",
    ),
    xmlRecord(
      "2026/1004",
      "DETERMINAZIONE DIRIGENZIALE",
      "SERVIZI SOCIALI",
      "Contributo economico straordinario per nucleo con minore",
      "23",
    ),
  ].join("\n");
}

function xmlRecord(
  progressivo: string,
  tipologia: string,
  provenienza: string,
  oggetto: string,
  numRegGen: string,
): string {
  return `
    <pubblicazione>
      <progressivo>${progressivo}</progressivo>
      <tipologia>${tipologia}</tipologia>
      <provenienza>${provenienza}</provenienza>
      <periodo-pubblicazione>19/06/2026 - 04/07/2026</periodo-pubblicazione>
      <data-atto>16/06/2026</data-atto>
      <num-reg-set>240</num-reg-set>
      <num-reg-gen>${numRegGen}</num-reg-gen>
      <data-reg-gen>19/06/2026</data-reg-gen>
      <oggetto>${oggetto}</oggetto>
    </pubblicazione>
  `;
}
