import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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

test("does not classify personal-service welfare records as low-risk publishable", async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), "albo-tinnvision-privacy-"));
  const fixturePath = path.join(tmp, "albo.xml");
  const outDir = path.join(tmp, "data");
  await writeFile(
    fixturePath,
    [
      xmlRecord(
        "2026/3001",
        "DETERMINAZIONE DIRIGENZIALE",
        "SETTORE WELFARE",
        "Approvazione delle domande di concessione dell' assegno di maternit&#224; - elenco n. 3 del 2026",
        "31",
      ),
      xmlRecord(
        "2026/3002",
        "DETERMINAZIONE DIRIGENZIALE",
        "SERVIZI ALLA PERSONA",
        "Servizio di assistenza domiciliare a valere sul FNA 2019/2020. Liquidazione periodo 01/03/2026 - 30/04/2026",
        "32",
      ),
      xmlRecord(
        "2026/3003",
        "DETERMINAZIONE DIRIGENZIALE",
        "SETTORE WELFARE",
        "Concessione contributo economico a favore di persona fisica",
        "33",
      ),
    ].join("\n"),
    "utf8",
  );

  const result = await runAlboIngestion({
    outDir,
    fromFile: fixturePath,
    inputFormat: "xml",
    retrievedAt: FIXTURE_RETRIEVED_AT,
  });

  assert.deepEqual(
    result.items.map((item) => item.public_visibility),
    ["metadata_only", "metadata_only", "publishable_with_minimisation"],
  );
  assert.equal(result.publicLatest.counts.publishable, 0);
  assert.equal(result.publicLatest.counts.metadata_only, 2);
  assert.equal(result.publicLatest.counts.minimised, 1);

  const publicLatest = await readFile(result.paths.publicLatest, "utf8");
  assert.doesNotMatch(publicLatest, /assegno di matern|assistenza domiciliare|persona fisica/i);
  assert.match(publicLatest, /Metadato minimo/);
  assert.match(publicLatest, /Oggetto minimizzato per prudenza privacy/);
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
  assert.equal(result.publicStatus.source, ALBO_PRETORIO_LAMEZIA_SOURCE.source);
  assert.equal(result.publicStatus.last_update, FIXTURE_RETRIEVED_AT);
  assert.equal(result.publicStatus.method, "xml");
  assert.equal(result.publicStatus.verification_status, "official_source_acquired");
  assert.equal(result.publicStatus.counts.acquired, 4);
  assert.equal(result.publicStatus.diff_baseline.status, "baseline_unavailable");
  assert.equal(result.publicStatus.diff_baseline.public_safe, false);
  assert.equal(result.publicDiff.diff_baseline.status, "baseline_unavailable");
  assert.ok(result.publicStatus.known_limits.includes(result.publicStatus.diff_baseline.note));
  assert.ok(result.publicStatus.known_limits.length > 0);
  assert.match(
    String(result.publicStatus.official_albo_disclaimer),
    /non sostituisce l'Albo Pretorio ufficiale/,
  );

  const publicLatest = await readFile(result.paths.publicLatest, "utf8");
  const publicStatus = await readFile(result.paths.publicStatus, "utf8");
  assert.doesNotMatch(publicLatest, /ROSSI MARIO|BIANCHI LUCIA|VERDI ANNA/i);
  assert.doesNotMatch(publicStatus, /ROSSI MARIO|BIANCHI LUCIA|VERDI ANNA/i);
  assert.match(publicLatest, /Oggetto minimizzato per prudenza privacy/);
  assert.match(publicLatest, /Metadato minimo/);
  assert.match(publicStatus, /08:00-20:00 Europe\/Rome/);
  assert.match(publicStatus, /ubuntu-latest/);

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
  assert.equal(result.publicStatus.diff_baseline.status, "public_safe");
  assert.equal(result.publicStatus.diff_baseline.public_safe, true);
  assert.equal(result.publicStatus.diff_baseline.previous_retrieved_at, "2026-06-19T08:00:00.000Z");
  assert.equal(result.publicDiff.diff_baseline.status, "public_safe");

  const publicDiff = await readFile(result.paths.publicDiff, "utf8");
  assert.match(publicDiff, /"new"/);
  assert.match(publicDiff, /"changed"/);
  assert.match(publicDiff, /"removed"/);
  assert.match(publicDiff, /"unchanged"/);
  assert.match(publicDiff, /"diff_baseline"/);
});

test("current snapshot baseline ignores raw-derived hashes for minimised records", async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), "albo-tinnvision-redacted-snapshot-baseline-"));
  const previousPath = path.join(tmp, "previous.xml");
  const nextPath = path.join(tmp, "next.xml");
  const outDir = path.join(tmp, "data");

  await writeFile(
    previousPath,
    xmlRecord(
      "2026/5",
      "DETERMINAZIONE DIRIGENZIALE",
      "SETTORE WELFARE",
      "Concessione contributo economico a favore di persona fisica A",
      "5",
    ),
    "utf8",
  );
  await writeFile(
    nextPath,
    xmlRecord(
      "2026/5",
      "DETERMINAZIONE DIRIGENZIALE",
      "SETTORE WELFARE",
      "Concessione contributo economico a favore di persona fisica B",
      "5",
    ),
    "utf8",
  );

  const previous = await runAlboIngestion({
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

  assert.notEqual(previous.items[0].content_hash, result.items[0].content_hash);
  assert.equal(result.publicLatest.items[0].public_visibility, "publishable_with_minimisation");
  assert.equal(result.publicDiff.counts.changed, 0);
  assert.equal(result.publicDiff.counts.unchanged, 1);
  assert.equal(result.publicStatus.diff_baseline.status, "public_safe");
});

test("run command can compare against committed public latest without raw snapshots", async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), "albo-tinnvision-public-baseline-"));
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
  await rm(path.join(outDir, "snapshots"), { recursive: true, force: true });

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
  assert.equal(result.publicStatus.diff_baseline.status, "public_safe");
  assert.equal(result.publicStatus.diff_baseline.previous_retrieved_at, "2026-06-19T08:00:00.000Z");
  assert.match(result.publicStatus.diff_baseline.note, /committed public\/albo\/latest\.json/);
});

test("public latest baseline ignores raw-derived hashes for minimised records", async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), "albo-tinnvision-redacted-baseline-"));
  const previousPath = path.join(tmp, "previous.xml");
  const nextPath = path.join(tmp, "next.xml");
  const outDir = path.join(tmp, "data");

  await writeFile(
    previousPath,
    xmlRecord(
      "2026/5",
      "DETERMINAZIONE DIRIGENZIALE",
      "SETTORE WELFARE",
      "Concessione contributo economico a favore di persona fisica A",
      "5",
    ),
    "utf8",
  );
  await writeFile(
    nextPath,
    xmlRecord(
      "2026/5",
      "DETERMINAZIONE DIRIGENZIALE",
      "SETTORE WELFARE",
      "Concessione contributo economico a favore di persona fisica B",
      "5",
    ),
    "utf8",
  );

  const previous = await runAlboIngestion({
    outDir,
    fromFile: previousPath,
    inputFormat: "xml",
    retrievedAt: "2026-06-19T08:00:00.000Z",
  });
  await rm(path.join(outDir, "snapshots"), { recursive: true, force: true });

  const result = await runAlboIngestion({
    outDir,
    fromFile: nextPath,
    inputFormat: "xml",
    retrievedAt: "2026-06-19T09:00:00.000Z",
  });

  assert.notEqual(previous.publicLatest.items[0].content_hash, result.publicLatest.items[0].content_hash);
  assert.equal(result.publicLatest.items[0].public_visibility, "publishable_with_minimisation");
  assert.equal(result.publicDiff.counts.changed, 0);
  assert.equal(result.publicDiff.counts.unchanged, 1);
  assert.equal(result.publicStatus.diff_baseline.status, "public_safe");
});

test("archives only official low-risk publishable PDFs into public documents storage", async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), "albo-tinnvision-pdf-"));
  const fixturePath = path.join(tmp, "albo.xml");
  const outDir = path.join(tmp, "data");
  const documentUrl = "https://albo.tinnvision.cloud/documenti/2026/1001.pdf";
  const pdfBytes = new TextEncoder().encode("%PDF-1.7\npublic test pdf\n");
  const expectedSha = createHash("sha256").update(pdfBytes).digest("hex");
  const fetchCalls: string[] = [];

  await writeFile(
    fixturePath,
    xmlRecord(
      "2026/1001",
      "DETERMINAZIONE DIRIGENZIALE",
      "SETTORE TECNICO",
      "Affidamento servizio verde pubblico CIG ABC1234567",
      "1",
      documentUrl,
    ),
    "utf8",
  );

  const result = await runAlboIngestion({
    outDir,
    fromFile: fixturePath,
    inputFormat: "xml",
    retrievedAt: FIXTURE_RETRIEVED_AT,
    pdfFetch: async (url) => {
      fetchCalls.push(String(url));
      return new Response(pdfBytes, {
        status: 200,
        headers: {
          "content-type": "application/pdf",
          "content-length": String(pdfBytes.byteLength),
        },
      });
    },
  });

  assert.deepEqual(fetchCalls, [documentUrl]);
  assert.equal(result.documentsManifest.counts.archived, 1);
  assert.equal(result.documentsManifest.counts.eligible, 1);
  assert.equal(result.documentsManifest.policy.requires_https, true);
  assert.equal(result.documentsManifest.documents[0].sha256, expectedSha);
  assert.equal(result.documentsManifest.documents[0].document_url, documentUrl);
  assert.equal(
    result.documentsManifest.documents[0].storage_path,
    `data/public/albo/documents/2026/${expectedSha}.pdf`,
  );

  const archivedPdf = await readFile(
    path.join(outDir, "public", "albo", "documents", "2026", `${expectedSha}.pdf`),
  );
  assert.deepEqual(new Uint8Array(archivedPdf), pdfBytes);

  const manifest = await readFile(result.paths.documentsManifest, "utf8");
  assert.match(manifest, /"no_pdf_parsing": true/);
  assert.match(manifest, /"paid_storage": false/);
  assert.doesNotMatch(manifest, /Affidamento servizio verde pubblico/i);
});

test("excludes metadata-only and high-risk records from PDF archiving without exposing document URLs", async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), "albo-tinnvision-pdf-excluded-"));
  const fixturePath = path.join(tmp, "albo.xml");
  const outDir = path.join(tmp, "data");
  const metadataOnlyUrl = "https://albo.tinnvision.cloud/documenti/2026/2001.pdf";
  const highRiskUrl = "https://albo.tinnvision.cloud/documenti/2026/2002.pdf";
  await writeFile(
    fixturePath,
    [
      xmlRecord(
        "2026/2001",
        "PUBBLICAZIONE DI MATRIMONIO",
        "SERVIZI DEMOGRAFICI",
        "PUBBLICAZIONE DI MATRIMONIO DEI SIG.RI ROSSI MARIO E BIANCHI LUCIA",
        "",
        metadataOnlyUrl,
      ),
      xmlRecord(
        "2026/2002",
        "DETERMINAZIONE DIRIGENZIALE",
        "SERVIZI SOCIALI",
        "Contributo economico straordinario per nucleo con minore",
        "2",
        highRiskUrl,
      ),
    ].join("\n"),
    "utf8",
  );

  const result = await runAlboIngestion({
    outDir,
    fromFile: fixturePath,
    inputFormat: "xml",
    retrievedAt: FIXTURE_RETRIEVED_AT,
    pdfFetch: async () => {
      throw new Error("excluded records must not be fetched");
    },
  });

  assert.equal(result.documentsManifest.counts.archived, 0);
  assert.equal(result.documentsManifest.counts.excluded, 2);
  assert.deepEqual(
    result.documentsManifest.decisions.map((decision) => decision.reason),
    ["privacy_excluded", "privacy_excluded"],
  );
  assert.ok(
    result.documentsManifest.decisions.every(
      (decision) => decision.preservation_status === "excluded" && !("document_url" in decision),
    ),
  );

  const manifest = await readFile(result.paths.documentsManifest, "utf8");
  assert.equal(manifest.includes(metadataOnlyUrl), false);
  assert.equal(manifest.includes(highRiskUrl), false);
  assert.equal(manifest.includes("original_document_url"), false);
});

test("skips otherwise eligible PDFs when content type or size limit fails", async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), "albo-tinnvision-pdf-content-"));
  const fixturePath = path.join(tmp, "albo.xml");
  const outDir = path.join(tmp, "data");
  const htmlUrl = "https://albo.tinnvision.cloud/documenti/2026/2501.pdf";
  const oversizeUrl = "https://albo.tinnvision.cloud/documenti/2026/2502.pdf";
  await writeFile(
    fixturePath,
    [
      xmlRecord("2026/2501", "AVVISO PUBBLICO", "SEGRETERIA", "Avviso pubblico ordinario", "", htmlUrl),
      xmlRecord("2026/2502", "AVVISO PUBBLICO", "SEGRETERIA", "Avviso pubblico ordinario bis", "", oversizeUrl),
    ].join("\n"),
    "utf8",
  );

  const result = await runAlboIngestion({
    outDir,
    fromFile: fixturePath,
    inputFormat: "xml",
    retrievedAt: FIXTURE_RETRIEVED_AT,
    pdfFetch: async (url) =>
      String(url) === htmlUrl
        ? new Response("<html></html>", {
            status: 200,
            headers: { "content-type": "text/html" },
          })
        : new Response("", {
            status: 200,
            headers: {
              "content-type": "application/pdf",
              "content-length": String(10 * 1024 * 1024 + 1),
            },
          }),
  });

  assert.equal(result.documentsManifest.counts.archived, 0);
  assert.equal(result.documentsManifest.counts.skipped, 2);
  assert.deepEqual(
    result.documentsManifest.decisions.map((decision) => decision.reason),
    ["content_type_not_pdf", "size_limit_exceeded"],
  );
  assert.ok(
    result.documentsManifest.decisions.every((decision) => !("document_url" in decision)),
  );
});

test("marks medium-risk minimised records as human_review_required without downloading or exposing the URL", async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), "albo-tinnvision-pdf-review-"));
  const fixturePath = path.join(tmp, "albo.xml");
  const outDir = path.join(tmp, "data");
  const documentUrl = "https://albo.tinnvision.cloud/documenti/2026/3001.pdf";
  await writeFile(
    fixturePath,
    xmlRecord(
      "2026/3001",
      "DETERMINAZIONE DIRIGENZIALE",
      "SETTORE AVVOCATURA",
      "Proposta transattiva risarcimento danni VERDI ANNA",
      "3",
      documentUrl,
    ),
    "utf8",
  );

  const result = await runAlboIngestion({
    outDir,
    fromFile: fixturePath,
    inputFormat: "xml",
    retrievedAt: FIXTURE_RETRIEVED_AT,
    pdfFetch: async () => {
      throw new Error("review-required records must not be fetched");
    },
  });

  assert.equal(result.items[0].public_visibility, "publishable_with_minimisation");
  assert.equal(result.items[0].privacy_risk, "medium");
  assert.equal(result.documentsManifest.counts.human_review_required, 1);
  assert.equal(result.documentsManifest.decisions[0].preservation_status, "human_review_required");
  assert.equal(result.documentsManifest.decisions[0].reason, "human_review_required");
  assert.ok(!("document_url" in result.documentsManifest.decisions[0]));

  const manifest = await readFile(result.paths.documentsManifest, "utf8");
  assert.equal(manifest.includes(documentUrl), false);
  assert.equal(manifest.includes("original_document_url"), false);
});

test("rejects official HTTP document URLs with a warning and without fetching", async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), "albo-tinnvision-pdf-http-"));
  const fixturePath = path.join(tmp, "albo.xml");
  const outDir = path.join(tmp, "data");
  const documentUrl = "http://albo.tinnvision.cloud/documenti/2026/4001.pdf";
  await writeFile(
    fixturePath,
    xmlRecord(
      "2026/4001",
      "AVVISO PUBBLICO",
      "SEGRETERIA",
      "Avviso pubblico ordinario",
      "",
      documentUrl,
    ),
    "utf8",
  );

  const result = await runAlboIngestion({
    outDir,
    fromFile: fixturePath,
    inputFormat: "xml",
    retrievedAt: FIXTURE_RETRIEVED_AT,
    pdfFetch: async () => {
      throw new Error("HTTP document URLs must not be fetched");
    },
  });

  assert.equal(result.items[0].public_visibility, "publishable");
  assert.equal(result.items[0].privacy_risk, "low");
  assert.equal(result.documentsManifest.counts.archived, 0);
  assert.equal(result.documentsManifest.counts.skipped, 1);
  assert.equal(result.documentsManifest.decisions[0].preservation_status, "skipped");
  assert.equal(result.documentsManifest.decisions[0].reason, "non_https_document_url");
  assert.ok(!("document_url" in result.documentsManifest.decisions[0]));
  assert.match(result.documentsManifest.warnings.join("\n"), /not HTTPS/);

  const manifest = await readFile(result.paths.documentsManifest, "utf8");
  assert.equal(manifest.includes(documentUrl), false);
  assert.match(manifest, /official document URL is not HTTPS/);
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
  documentUrl = "",
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
      ${documentUrl ? `<document-url>${documentUrl}</document-url>` : ""}
    </pubblicazione>
  `;
}
