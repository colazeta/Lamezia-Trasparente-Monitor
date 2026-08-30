import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  ALBO_PRIVACY_POLICY_VERSION,
  buildDelibereArchive,
  diffAlboItems,
  isDelibereArchive,
  normalizeAlboRecords,
  parseArgs,
  parseTinnvisionHtml,
  parseTinnvisionXml,
  reapplyAlboPublicSafety,
  runAlboIngestion,
  type AlboRawSnapshot,
  type PublicRecord,
} from "./albo-tinnvision";
import {
  ALBO_CLASSIFICATION_DICTIONARY_VERSION,
  ALBO_CLASSIFICATION_KNOWN_LIMIT,
  classifyAlboRecordCategory,
} from "./albo-classification-dictionary";
import { ALBO_PUBLICATION_STANDARDISATION_KNOWN_LIMIT } from "./albo-publication-standardisation";
import { ALBO_PRETORIO_LAMEZIA_SOURCE } from "./albo-source-config";
import {
  appendCurrentPublicLatest,
  assertDelibereSeedHistoryAvailable,
  assertDelibereSeedSourceCoverage,
} from "./seed-delibere-archive-history";
import {
  identifyInstitutionalSessionCandidate,
  identifyInstitutionalSessionCandidates,
  type InstitutionalSessionCandidateInput,
} from "./institutional-session-candidates";

const FIXTURE_RETRIEVED_AT = "2026-06-19T10:00:00.000Z";
const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

test("defaults CLI output to repository data directory", () => {
  assert.equal(parseArgs([]).outDir, path.join(REPO_ROOT, "data"));
});

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
  assert.equal(
    items[0].classification.dictionary_version,
    ALBO_CLASSIFICATION_DICTIONARY_VERSION,
  );
  assert.equal(items[0].classification.sector.id, "governo_territorio");
  assert.equal(items[0].classification.act_category.id, "determinazioni");
  assert.match(items[0].content_hash, /^[a-f0-9]{64}$/);

  assert.equal(items[1].public_visibility, "metadata_only");
  assert.equal(items[1].privacy_risk, "high");
  assert.equal(
    items[1].classification.sector.id,
    "servizi_cittadino_demografici",
  );
  assert.equal(items[1].classification.act_category.id, "stato_civile");
  assert.equal(items[2].public_visibility, "publishable_with_minimisation");
  assert.equal(items[2].privacy_risk, "medium");
  assert.equal(items[3].public_visibility, "do_not_publish");
  assert.equal(items[3].privacy_risk, "high");
});

test("classifies Albo records by civic sector and act category dictionary", () => {
  assert.deepEqual(
    pickClassificationIds(
      classifyAlboRecordCategory({
        office: "SETTORE VIGILANZA E SICUREZZA URBANA",
        act_type: "ORDINANZA",
        subject: "Ordinanza temporanea di viabilita",
      }),
    ),
    {
      sector: "vigilanza_sicurezza",
      act_category: "ordinanze",
    },
  );

  assert.deepEqual(
    pickClassificationIds(
      classifyAlboRecordCategory({
        office: null,
        act_type: "ART.143 CPC (CODICE PROCEDURA CIVILE)",
        subject: null,
      }),
    ),
    {
      sector: "notifiche_depositi",
      act_category: "notifiche_depositi",
    },
  );

  assert.deepEqual(
    pickClassificationIds(
      classifyAlboRecordCategory({
        office: "PREFETTURA DI CATANZARO UFFICIO TERRITORIALE DEL GOVERNO",
        act_type: "AVVISO",
        subject: "Comunicazione pubblica",
      }),
    ),
    {
      sector: "altri_enti",
      act_category: "avvisi",
    },
  );

  assert.equal(
    classifyAlboRecordCategory({
      office: "UOA SEGRETERIA GENERALE - ATTIVITA' ISTITUZIONALI",
      act_type: "CONVOCAZIONE CONSIGLIO COMUNALE",
      subject: "Avviso seduta di Consiglio Comunale.",
    }).act_category.id,
    "convocazioni_istituzionali",
  );
});

test("materialises a reviewable presentation and theme null reason when a public subject is missing", () => {
  const classification = classifyAlboRecordCategory({
    office: "SEGRETERIA GENERALE",
    act_type: "AVVISO",
    subject: null,
  });
  const projected = reapplyAlboPublicSafety({
    id: "albo-2026-9999",
    source: ALBO_PRETORIO_LAMEZIA_SOURCE.source,
    source_url: ALBO_PRETORIO_LAMEZIA_SOURCE.sourceUrl,
    retrieved_at: FIXTURE_RETRIEVED_AT,
    publication_number: "2026/9999",
    office: "SEGRETERIA GENERALE",
    act_type: "AVVISO",
    subject: null,
    verification_status: "official_source_acquired",
    privacy_risk: "low",
    public_visibility: "publishable",
    classification,
    known_limits: [],
  });
  const presentation = projected.presentation as NonNullable<
    PublicRecord["presentation"]
  > & {
    area_theme: { theme_id: string | null; null_reason: string | null };
  };

  assert.equal(
    presentation.display_title,
    "Oggetto non disponibile nella fonte acquisita.",
  );
  assert.equal(presentation.standardisation.status, "review_required");
  assert.equal(presentation.area_theme.theme_id, null);
  assert.equal(presentation.area_theme.null_reason, "input_missing");
});

test("keeps procedural notifications behind the metadata-only privacy gate", () => {
  const variants = [
    "ART.143 CPC",
    "ART. 143 C.P.C.",
    "ART 143 CPC",
    "ART.140 CPC",
    "ART. 140 C.P.C.",
    "ART 140 CPC",
  ];
  const records = variants.map((actType, index) => ({
    ...parseTinnvisionXml(
      xmlRecord(
        `2026/${4100 + index}`,
        actType,
        "UFFICIO NOTIFICHE",
        "Affissione all'albo nei confronti di PERSONA FITTIZIA",
        "",
      ),
    )[0],
  }));

  const items = normalizeAlboRecords(snapshot(records));
  assert.equal(items.length, variants.length);
  for (const item of items) {
    assert.equal(item.privacy_risk, "high");
    assert.equal(item.public_visibility, "metadata_only");
  }
});

test("scrubs names from secondary text fields in privacy-restricted records", async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), "albo-secondary-fields-"));
  const fixturePath = path.join(tmp, "albo.xml");
  const outDir = path.join(tmp, "data");

  await writeFile(
    fixturePath,
    [
      xmlRecord(
        "2026/4150",
        "NOTIFICA A PERSONA FITTIZIA",
        "UFFICIO PERSONA FITTIZIA",
        "Avviso procedurale",
        "",
      ),
      xmlRecord(
        "2026/4151",
        "CONTENZIOSO PERSONA FITTIZIA",
        "UFFICIO PERSONA FITTIZIA",
        "Atto amministrativo",
        "",
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
  const serialised = await readFile(result.paths.publicLatest, "utf8");

  assert.deepEqual(
    result.publicLatest.items.map((item) => item.public_visibility),
    ["metadata_only", "publishable_with_minimisation"],
  );
  assert.ok(
    result.publicLatest.items.every(
      (item) => item.office === null && item.act_type === null,
    ),
  );
  assert.doesNotMatch(serialised, /PERSONA FITTIZIA/i);
});

test("rebuilds legacy public records from an explicit field allow-list", () => {
  const raw = {
    publication_number: "2026/4160",
    publication_start: "2026-08-30",
    publication_end: "2026-09-14",
    office: "SETTORE TECNICO",
    act_type: "DETERMINAZIONE DIRIGENZIALE",
    act_number: "42",
    act_date: "2026-08-29",
    subject: "Affidamento manutenzione ordinaria",
    document_url: null,
    source_row: {},
  };
  const classification = classifyAlboRecordCategory(raw);
  const projected = reapplyAlboPublicSafety({
    id: "albo-2026-4160",
    source: ALBO_PRETORIO_LAMEZIA_SOURCE.source,
    source_url: ALBO_PRETORIO_LAMEZIA_SOURCE.sourceUrl,
    retrieved_at: FIXTURE_RETRIEVED_AT,
    verification_status: "official_source_acquired",
    privacy_risk: "low",
    public_visibility: "publishable",
    known_limits: [null, ""] as unknown as string[],
    ...raw,
    classification: {} as typeof classification,
    source_row: { private_name: "PERSONA FITTIZIA" },
    private_note: "PERSONA FITTIZIA",
  });

  assert.equal(projected.public_visibility, "publishable");
  assert.equal(
    projected.classification?.dictionary_version,
    classification.dictionary_version,
  );
  assert.equal("source_row" in projected, false);
  assert.equal("private_note" in projected, false);
  assert.doesNotMatch(JSON.stringify(projected), /PERSONA FITTIZIA/i);
});

test("identifies council and commission notices without inferring session dates", () => {
  const inputs = [
    sessionCandidateFixture({
      id: "albo-2026-2673",
      publication_number: "2026/2673",
      act_type: "CONVOCAZIONE CONSIGLIO COMUNALE",
      subject: "Avviso seduta di Consiglio Comunale.",
      document_url: null,
    }),
    sessionCandidateFixture({
      id: "albo-2026-2648",
      publication_number: "2026/2648",
      act_type: "CONVOCAZIONI COMMISSIONI CONSILIARI",
      subject: "Convocazione 2° Commissione Consiliare Permanente.",
      document_url:
        "https://albo.tinnvision.cloud/allegati/2026_2648_2_P?ente=00301390795",
    }),
  ];

  const candidates = identifyInstitutionalSessionCandidates(inputs);

  assert.deepEqual(
    candidates.map((candidate) => [candidate.kind, candidate.reviewStatus]),
    [
      ["council", "metadata_only"],
      ["commission", "attachment_review_required"],
    ],
  );
  for (const candidate of candidates) {
    assert.deepEqual(candidate.scheduledOccurrences, []);
    assert.deepEqual(candidate.agendaItems, []);
    assert.match(candidate.limitations[0], /non viene interpretata/);
    assert.equal(candidate.contextSearch.status, "required");
    assert.equal(candidate.contextSearch.rerunAfterOfficialEnrichment, true);
    assert.equal(candidate.contextSearch.mediaSearchRequired, true);
    assert.equal(candidate.contextSearch.querySeeds.length, 3);
    assert.ok(candidate.contextSearch.priorityPublishers.includes("City One"));
    assert.ok(
      candidate.contextSearch.priorityPublishers.includes("LameziaInforma"),
    );
    assert.equal(candidate.contextSearch.reviewMoments.length, 5);
    assert.ok(
      candidate.contextSearch.querySeeds.every((query) =>
        query.startsWith("Lamezia Terme"),
      ),
    );
    assert.match(
      candidate.contextSearch.limitations.join(" "),
      /non possono riempire campi ufficiali mancanti/i,
    );
  }
});

test("rejects unsafe, unsupported or untraceable session candidates", () => {
  const safe = sessionCandidateFixture();

  assert.equal(
    identifyInstitutionalSessionCandidate({
      ...safe,
      public_visibility: "metadata_only",
    }),
    null,
  );
  assert.equal(
    identifyInstitutionalSessionCandidate({
      ...safe,
      privacy_risk: "medium",
    }),
    null,
  );
  assert.equal(
    identifyInstitutionalSessionCandidate({
      ...safe,
      act_type: "DELIBERAZIONE DI CONSIGLIO",
    }),
    null,
  );
  assert.equal(
    identifyInstitutionalSessionCandidate({
      ...safe,
      source_url: "https://example.test/albo?ente=00301390795",
    }),
    null,
  );
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
    ["metadata_only", "metadata_only", "metadata_only"],
  );
  assert.equal(result.publicLatest.counts.publishable, 0);
  assert.equal(result.publicLatest.counts.metadata_only, 3);
  assert.equal(result.publicLatest.counts.minimised, 0);

  const publicLatest = await readFile(result.paths.publicLatest, "utf8");
  assert.doesNotMatch(
    publicLatest,
    /assegno di matern|assistenza domiciliare|persona fisica/i,
  );
  assert.match(publicLatest, /Metadato minimo/);
});

test("keeps ordinary administrative records publishable when broad words are not sensitive by themselves", async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), "albo-tinnvision-ordinary-"));
  const fixturePath = path.join(tmp, "albo.xml");
  const outDir = path.join(tmp, "data");
  await writeFile(
    fixturePath,
    [
      xmlRecord(
        "2026/3101",
        "DETERMINAZIONE DIRIGENZIALE",
        "SETTORE AVVOCATURA",
        "Autorita Nazionale Anticorruzione: liquidazione contributi A.N.A.C.",
        "41",
      ),
      xmlRecord(
        "2026/3102",
        "DETERMINAZIONE DIRIGENZIALE",
        "SETTORE TECNICO",
        "Liquidazione contributo A.N.A.C. per procedura di gara lavori pubblici",
        "42",
      ),
      xmlRecord(
        "2026/3103",
        "DETERMINAZIONE DIRIGENZIALE",
        "SETTORE SERVIZI AL CITTADINO AFFARI GENERALI",
        "Liquidazioni spese postali mese di maggio a favore della ditta SIPOSTA SRL Unipersonale",
        "43",
      ),
      xmlRecord(
        "2026/3104",
        "DETERMINAZIONE DIRIGENZIALE",
        "SETTORE GESTIONE E VALORIZZAZIONE DEL PATRIMONIO E DEL TERRITORIO COMUNALE",
        "Supporto al RUP per pratiche di aggiornamento edilizio e catastale di immobili comunali. Liquidazione rata al professionista incaricato.",
        "44",
      ),
      xmlRecord(
        "2026/3105",
        "DETERMINAZIONE DIRIGENZIALE",
        "SETTORE SERVIZI ALLA PERSONA",
        "Fornitura di pasti caldi nelle scuole dell'Infanzia e Primarie. Liquidazione periodo maggio 2026 alla ditta Scamar srl",
        "45",
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
    [
      "publishable_with_minimisation",
      "publishable",
      "publishable",
      "publishable",
      "publishable",
    ],
  );
  assert.equal(result.items[0].privacy_risk, "medium");
  assert.equal(result.items[1].privacy_risk, "low");
  assert.equal(result.items[2].privacy_risk, "low");
  assert.equal(result.items[3].privacy_risk, "low");
  assert.equal(result.items[4].privacy_risk, "low");
  assert.equal(result.publicLatest.counts.publishable, 4);
  assert.equal(result.publicLatest.counts.minimised, 1);
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

  assert.deepEqual(
    diff.new.map((item) => item.publication_number),
    ["2026/3"],
  );
  assert.deepEqual(
    diff.changed.map((entry) => entry.after.publication_number),
    ["2026/1"],
  );
  assert.deepEqual(
    diff.removed.map((item) => item.publication_number),
    ["2026/4"],
  );
  assert.deepEqual(
    diff.unchanged.map((item) => item.publication_number),
    ["2026/2"],
  );
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
  assert.equal(
    result.publicStatus.verification_status,
    "official_source_acquired",
  );
  assert.equal(result.publicStatus.counts.acquired, 4);
  assert.equal(
    result.publicStatus.diff_baseline.status,
    "baseline_unavailable",
  );
  assert.equal(result.publicStatus.diff_baseline.public_safe, false);
  assert.equal(
    result.publicStatus.classification_dictionary.version,
    ALBO_CLASSIFICATION_DICTIONARY_VERSION,
  );
  assert.ok(
    result.publicStatus.known_limits.includes(ALBO_CLASSIFICATION_KNOWN_LIMIT),
  );
  assert.ok(
    result.publicStatus.known_limits.includes(
      ALBO_PUBLICATION_STANDARDISATION_KNOWN_LIMIT,
    ),
  );
  assert.equal(result.publicDiff.diff_baseline.status, "baseline_unavailable");
  assert.ok(
    result.publicStatus.known_limits.includes(
      result.publicStatus.diff_baseline.note,
    ),
  );
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
  assert.match(publicLatest, /Governo del territorio e urbanistica/);
  assert.match(publicLatest, /Determinazioni dirigenziali/);
  assert.match(publicStatus, /08:00-20:00 Europe\/Rome/);
  assert.match(publicStatus, /ubuntu-latest/);
  assert.equal(
    result.publicLatest.classification_dictionary.version,
    ALBO_CLASSIFICATION_DICTIONARY_VERSION,
  );
  assert.equal(
    result.publicLatest.items[0].classification.sector.id,
    "governo_territorio",
  );
  assert.equal(
    result.publicLatest.items[0].classification.act_category.id,
    "determinazioni",
  );
  assert.equal(result.publicLatest.excluded[0].classification, undefined);
  assert.equal(
    result.publicLatest.standardisation.stage,
    "after_public_safety_before_publication",
  );
  assert.equal(result.publicLatest.standardisation.generative_rewriting, false);
  assert.equal(
    result.publicStatus.standardisation.profile_id,
    "albo-public-title-it",
  );

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

test("builds display titles only from the public-safe subject", async () => {
  const tmp = await mkdtemp(
    path.join(tmpdir(), "albo-tinnvision-standardisation-"),
  );
  const fixturePath = path.join(tmp, "albo.xml");
  const outDir = path.join(tmp, "data");

  await writeFile(
    fixturePath,
    [
      xmlRecord(
        "2026/3201",
        "DELIBERAZIONE DI GIUNTA",
        "SETTORE TECNICO",
        "APPROVAZIONE DEL PROGETTO PNRR PER IL COMUNE DI LAMEZIA TERME",
        "101",
      ),
      xmlRecord(
        "2026/3202",
        "DETERMINAZIONE DIRIGENZIALE",
        "SETTORE AVVOCATURA",
        "Proposta transattiva risarcimento danni VERDI ANNA",
        "102",
      ),
      xmlRecord(
        "2026/3203",
        "PUBBLICAZIONE DI MATRIMONIO",
        "SERVIZI DEMOGRAFICI",
        "PUBBLICAZIONE DI MATRIMONIO DEI SIG.RI ROSSI MARIO E BIANCHI LUCIA",
        "103",
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

  const [publishable, minimised, metadataOnly] = result.publicLatest.items;
  assert.equal(
    publishable.subject,
    "APPROVAZIONE DEL PROGETTO PNRR PER IL COMUNE DI LAMEZIA TERME",
  );
  assert.equal(
    publishable.presentation?.display_title,
    "Approvazione del progetto PNRR per il Comune di Lamezia Terme",
  );
  assert.equal(publishable.presentation?.action_id, "approvazione");
  assert.equal(publishable.presentation?.action_label, "Approvazione");

  assert.equal(
    minimised.subject,
    "Oggetto minimizzato per prudenza privacy; consultare la fonte ufficiale.",
  );
  assert.doesNotMatch(minimised.presentation?.search_text ?? "", /VERDI|ANNA/i);
  assert.equal(
    metadataOnly.subject,
    "Metadato minimo; oggetto non ripubblicato per prudenza privacy.",
  );
  assert.doesNotMatch(
    metadataOnly.presentation?.search_text ?? "",
    /ROSSI|MARIO|BIANCHI|LUCIA/i,
  );

  const publicLatest = await readFile(result.paths.publicLatest, "utf8");
  assert.doesNotMatch(publicLatest, /VERDI ANNA|ROSSI MARIO|BIANCHI LUCIA/i);
});

test("reapplies current privacy policy to the public baseline and revokes its PDF", async () => {
  const tmp = await mkdtemp(
    path.join(tmpdir(), "albo-tinnvision-policy-reapply-"),
  );
  const fixturePath = path.join(tmp, "albo.xml");
  const outDir = path.join(tmp, "data");
  const publicDir = path.join(outDir, "public", "albo");
  const documentUrl =
    "https://albo.tinnvision.cloud/allegati/2026_4201_2_P?ente=00301390795";
  const digest = "a".repeat(64);
  const storagePath = `data/public/albo/documents/2026/${digest}.pdf`;
  const absoluteDocumentPath = path.join(
    outDir,
    "public",
    "albo",
    "documents",
    "2026",
    `${digest}.pdf`,
  );
  const oldRecord = {
    id: "albo-2026-4201",
    source: ALBO_PRETORIO_LAMEZIA_SOURCE.source,
    source_url: ALBO_PRETORIO_LAMEZIA_SOURCE.sourceUrl,
    retrieved_at: "2026-06-18T10:00:00.000Z",
    publication_number: "2026/4201",
    publication_start: "2026-06-18",
    publication_end: "2026-07-03",
    office: "UFFICIO NOTIFICHE",
    act_type: "ART.143 CPC (CODICE PROCEDURA CIVILE)",
    act_number: null,
    act_date: null,
    content_hash: "b".repeat(64),
    verification_status: "official_source_acquired",
    privacy_risk: "low",
    public_visibility: "publishable",
    known_limits: [],
    subject:
      "AFFISSIONE ALL'ALBO NEI CONFRONTI DI PERSONA FITTIZIA ART. 143 C.P.C.",
    document_url: documentUrl,
    public_note: null,
  };

  await mkdir(path.dirname(absoluteDocumentPath), { recursive: true });
  await writeFile(absoluteDocumentPath, "previously archived", "utf8");
  await writeFile(
    path.join(publicDir, "latest.json"),
    JSON.stringify({
      retrieved_at: oldRecord.retrieved_at,
      counts: {},
      items: [oldRecord],
      excluded: [],
    }),
    "utf8",
  );
  await writeFile(
    path.join(publicDir, "documents-manifest.json"),
    JSON.stringify({
      documents: [
        {
          ...oldRecord,
          document_url: documentUrl,
          preservation_status: "archived",
          reason: "eligible_low_risk_publishable_pdf",
          storage_path: storagePath,
          sha256: digest,
          size_bytes: 19,
          content_type: "application/pdf",
        },
      ],
    }),
    "utf8",
  );
  await writeFile(
    fixturePath,
    xmlRecord(
      "2026/4201",
      "ART.143 CPC (CODICE PROCEDURA CIVILE)",
      "UFFICIO NOTIFICHE",
      "AFFISSIONE ALL'ALBO NEI CONFRONTI DI PERSONA FITTIZIA ART. 143 C.P.C.",
      "",
      documentUrl,
    ),
    "utf8",
  );

  try {
    const result = await runAlboIngestion({
      outDir,
      fromFile: fixturePath,
      inputFormat: "xml",
      retrievedAt: FIXTURE_RETRIEVED_AT,
      pdfFetch: async () => {
        throw new Error("metadata-only documents must not be fetched");
      },
    });
    const serialisedPublicOutputs = JSON.stringify({
      latest: result.publicLatest,
      diff: result.publicDiff,
      manifest: result.documentsManifest,
    });

    assert.equal(
      result.publicLatest.items[0]?.public_visibility,
      "metadata_only",
    );
    assert.equal(result.publicLatest.items[0]?.privacy_risk, "high");
    assert.deepEqual(result.publicLatest.items[0]?.privacy_attestation, {
      schema_version: "albo-privacy-policy-attestation.v1",
      policy_version: ALBO_PRIVACY_POLICY_VERSION,
      assessment_basis: "source_record",
      status: "current",
    });
    assert.equal("content_hash" in (result.publicLatest.items[0] ?? {}), false);
    assert.doesNotMatch(serialisedPublicOutputs, /PERSONA FITTIZIA/i);
    assert.doesNotMatch(serialisedPublicOutputs, /2026_4201_2_P/i);
    assert.equal(result.documentsManifest.counts.revoked, 1);
    assert.equal(result.documentsManifest.counts.archived, 0);
    assert.equal(
      result.documentsManifest.decisions[0]?.reason,
      "privacy_excluded",
    );
    await assert.rejects(readFile(absoluteDocumentPath));
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

test("keeps unattested restricted history metadata-only until source reacquisition", () => {
  const legacyRestricted = {
    id: "albo-2026-legacy-restricted",
    source: ALBO_PRETORIO_LAMEZIA_SOURCE.source,
    source_url: ALBO_PRETORIO_LAMEZIA_SOURCE.sourceUrl,
    retrieved_at: "2026-06-18T10:00:00.000Z",
    publication_number: "2026/legacy-restricted",
    publication_start: "2026-06-18",
    publication_end: "2026-07-03",
    office: null,
    act_type: null,
    act_number: "42",
    act_date: "2026-06-17",
    verification_status: "official_source_acquired",
    privacy_risk: "medium",
    public_visibility: "publishable_with_minimisation",
    classification: classifyAlboRecordCategory({
      office: "AVVOCATURA",
      act_type: "DELIBERAZIONE DI GIUNTA",
      subject: "CONTENZIOSO",
    }),
    deliberation_body: "giunta",
    known_limits: [],
    subject:
      "Oggetto minimizzato per prudenza privacy; consultare la fonte ufficiale.",
    document_url: null,
    public_note: "Record pubblicato con minimizzazione automatica.",
  } satisfies PublicRecord;

  const projected = reapplyAlboPublicSafety(legacyRestricted);
  assert.equal(projected.public_visibility, "metadata_only");
  assert.equal(projected.privacy_risk, "high");
  assert.equal(projected.office, null);
  assert.equal(projected.act_type, null);
  assert.equal(projected.act_number, null);
  assert.equal(projected.document_url, null);
  assert.equal(projected.deliberation_body, "giunta");
  assert.match(String(projected.subject), /Metadato minimo/i);
  assert.deepEqual(projected.privacy_attestation, {
    schema_version: "albo-privacy-policy-attestation.v1",
    policy_version: ALBO_PRIVACY_POLICY_VERSION,
    assessment_basis: "redacted_public_record",
    status: "reacquisition_required",
  });
  const replayed = reapplyAlboPublicSafety(projected);
  assert.equal(replayed.public_visibility, "metadata_only");
  assert.equal(
    (replayed.privacy_attestation as { status?: unknown })?.status,
    "reacquisition_required",
  );

  const stalePolicy = reapplyAlboPublicSafety({
    ...legacyRestricted,
    privacy_attestation: {
      schema_version: "albo-privacy-policy-attestation.v1",
      policy_version: "albo-privacy-policy.previous",
      assessment_basis: "source_record",
      status: "current",
    },
  });
  assert.equal(stalePolicy.public_visibility, "metadata_only");
  assert.equal(stalePolicy.privacy_risk, "high");
  assert.equal(
    (stalePolicy.privacy_attestation as { status?: unknown })?.status,
    "reacquisition_required",
  );
});

test("does not report presentation-profile changes as source-record changes", async () => {
  const tmp = await mkdtemp(
    path.join(tmpdir(), "albo-tinnvision-presentation-diff-"),
  );
  const fixturePath = path.join(tmp, "albo.xml");
  const outDir = path.join(tmp, "data");
  await writeFile(
    fixturePath,
    xmlRecord(
      "2026/3301",
      "DELIBERAZIONE DI GIUNTA",
      "SETTORE TECNICO",
      "APPROVAZIONE DEL PROGETTO PNRR PER IL COMUNE DI LAMEZIA TERME",
      "104",
    ),
    "utf8",
  );

  const first = await runAlboIngestion({
    outDir,
    fromFile: fixturePath,
    inputFormat: "xml",
    retrievedAt: "2026-06-19T08:00:00.000Z",
  });
  const baseline = JSON.parse(
    await readFile(first.paths.publicLatest, "utf8"),
  ) as {
    standardisation: { profile_version: string };
    items: Array<{
      presentation: { display_title: string };
    }>;
  };
  baseline.standardisation.profile_version = "previous-profile";
  baseline.items[0].presentation.display_title = "Titolo editoriale precedente";
  await writeFile(
    first.paths.publicLatest,
    `${JSON.stringify(baseline, null, 2)}\n`,
    "utf8",
  );
  await rm(path.join(outDir, "snapshots"), { recursive: true, force: true });

  const result = await runAlboIngestion({
    outDir,
    fromFile: fixturePath,
    inputFormat: "xml",
    retrievedAt: "2026-06-19T09:00:00.000Z",
  });

  assert.equal(result.publicDiff.counts.changed, 0);
  assert.equal(result.publicDiff.counts.unchanged, 1);
});

function pickClassificationIds(
  classification: ReturnType<typeof classifyAlboRecordCategory>,
): {
  sector: string;
  act_category: string;
} {
  return {
    sector: classification.sector.id,
    act_category: classification.act_category.id,
  };
}

test("run command compares against the previous current snapshot", async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), "albo-tinnvision-diff-"));
  const previousPath = path.join(tmp, "previous.xml");
  const nextPath = path.join(tmp, "next.xml");
  const outDir = path.join(tmp, "data");

  await writeFile(
    previousPath,
    [
      xmlRecord(
        "2026/1",
        "DETERMINAZIONE DIRIGENZIALE",
        "SETTORE TECNICO",
        "Affidamento servizio A",
        "1",
      ),
      xmlRecord(
        "2026/2",
        "AVVISO PUBBLICO",
        "SEGRETERIA",
        "Avviso stabile",
        "",
      ),
      xmlRecord(
        "2026/4",
        "AVVISO PUBBLICO",
        "SEGRETERIA",
        "Avviso non piu presente",
        "",
      ),
    ].join("\n"),
    "utf8",
  );
  await writeFile(
    nextPath,
    [
      xmlRecord(
        "2026/1",
        "DETERMINAZIONE DIRIGENZIALE",
        "SETTORE TECNICO",
        "Affidamento servizio A aggiornato",
        "1",
      ),
      xmlRecord(
        "2026/2",
        "AVVISO PUBBLICO",
        "SEGRETERIA",
        "Avviso stabile",
        "",
      ),
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
  assert.equal(
    result.publicStatus.diff_baseline.previous_retrieved_at,
    "2026-06-19T08:00:00.000Z",
  );
  assert.equal(result.publicDiff.diff_baseline.status, "public_safe");

  const publicDiff = await readFile(result.paths.publicDiff, "utf8");
  assert.match(publicDiff, /"new"/);
  assert.match(publicDiff, /"changed"/);
  assert.match(publicDiff, /"removed"/);
  assert.match(publicDiff, /"unchanged"/);
  assert.match(publicDiff, /"diff_baseline"/);
});

test("current snapshot baseline ignores raw-derived hashes for minimised records", async () => {
  const tmp = await mkdtemp(
    path.join(tmpdir(), "albo-tinnvision-redacted-snapshot-baseline-"),
  );
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
  assert.equal(result.publicLatest.items[0].public_visibility, "metadata_only");
  assert.equal(result.publicDiff.counts.changed, 0);
  assert.equal(result.publicDiff.counts.unchanged, 1);
  assert.equal(result.publicStatus.diff_baseline.status, "public_safe");
});

test("run command can compare against committed public latest without raw snapshots", async () => {
  const tmp = await mkdtemp(
    path.join(tmpdir(), "albo-tinnvision-public-baseline-"),
  );
  const previousPath = path.join(tmp, "previous.xml");
  const nextPath = path.join(tmp, "next.xml");
  const outDir = path.join(tmp, "data");

  await writeFile(
    previousPath,
    [
      xmlRecord(
        "2026/1",
        "DETERMINAZIONE DIRIGENZIALE",
        "SETTORE TECNICO",
        "Affidamento servizio A",
        "1",
      ),
      xmlRecord(
        "2026/2",
        "AVVISO PUBBLICO",
        "SEGRETERIA",
        "Avviso stabile",
        "",
      ),
      xmlRecord(
        "2026/4",
        "AVVISO PUBBLICO",
        "SEGRETERIA",
        "Avviso non piu presente",
        "",
      ),
    ].join("\n"),
    "utf8",
  );
  await writeFile(
    nextPath,
    [
      xmlRecord(
        "2026/1",
        "DETERMINAZIONE DIRIGENZIALE",
        "SETTORE TECNICO",
        "Affidamento servizio A aggiornato",
        "1",
      ),
      xmlRecord(
        "2026/2",
        "AVVISO PUBBLICO",
        "SEGRETERIA",
        "Avviso stabile",
        "",
      ),
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
  assert.equal(
    result.publicStatus.diff_baseline.previous_retrieved_at,
    "2026-06-19T08:00:00.000Z",
  );
  assert.match(
    result.publicStatus.diff_baseline.note,
    /committed public\/albo\/latest\.json/,
  );
});

test("public latest baseline omits raw-derived hashes for minimised records", async () => {
  const tmp = await mkdtemp(
    path.join(tmpdir(), "albo-tinnvision-redacted-baseline-"),
  );
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

  assert.equal("content_hash" in previous.publicLatest.items[0], false);
  assert.equal("content_hash" in result.publicLatest.items[0], false);
  assert.equal(result.publicLatest.items[0].public_visibility, "metadata_only");
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
    path.join(
      outDir,
      "public",
      "albo",
      "documents",
      "2026",
      `${expectedSha}.pdf`,
    ),
  );
  assert.deepEqual(new Uint8Array(archivedPdf), pdfBytes);

  const manifest = await readFile(result.paths.documentsManifest, "utf8");
  assert.match(manifest, /"no_pdf_parsing": true/);
  assert.match(manifest, /"paid_storage": false/);
  assert.doesNotMatch(manifest, /Affidamento servizio verde pubblico/i);

  const reused = await runAlboIngestion({
    outDir,
    fromFile: fixturePath,
    inputFormat: "xml",
    retrievedAt: "2026-06-19T11:00:00.000Z",
    pdfFetch: async (url) => {
      fetchCalls.push(`unexpected:${String(url)}`);
      throw new Error("archived PDF should be reused");
    },
  });

  assert.equal(reused.documentsManifest.counts.archived, 1);
  assert.equal(reused.documentsManifest.documents[0].sha256, expectedSha);
  assert.deepEqual(fetchCalls, [documentUrl]);
});

test("builds a cumulative public-safe deliberations archive and honours later exclusions", async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), "albo-delibere-archive-"));
  const firstPath = path.join(tmp, "first.xml");
  const secondPath = path.join(tmp, "second.xml");
  const excludedPath = path.join(tmp, "excluded.xml");
  const outDir = path.join(tmp, "data");
  const documentUrl = "https://albo.tinnvision.cloud/documenti/2026/10.pdf";
  const pdfBytes = new TextEncoder().encode("%PDF-1.7\ndelibera public-safe\n");

  await writeFile(
    firstPath,
    xmlRecord(
      "2026/10",
      "DELIBERAZIONE DI GIUNTA",
      "SEGRETERIA GENERALE",
      "Approvazione del bilancio di previsione",
      "10",
      documentUrl,
    ),
    "utf8",
  );
  await writeFile(
    secondPath,
    xmlRecord(
      "2026/11",
      "DELIBERAZIONE DI CONSIGLIO",
      "SEGRETERIA GENERALE",
      "Approvazione del regolamento comunale",
      "11",
    ),
    "utf8",
  );
  await writeFile(
    excludedPath,
    [
      xmlRecord(
        "2026/10",
        "DELIBERAZIONE DI GIUNTA",
        "SERVIZI SOCIALI",
        "Contributo economico riferito a minore",
        "10",
      ),
      xmlRecord(
        "2026/11",
        "DELIBERAZIONE DI CONSIGLIO",
        "SEGRETERIA GENERALE",
        "Approvazione del regolamento comunale",
        "11",
      ),
    ].join("\n"),
    "utf8",
  );

  const first = await runAlboIngestion({
    outDir,
    fromFile: firstPath,
    inputFormat: "xml",
    retrievedAt: "2026-06-19T08:00:00.000Z",
    pdfFetch: async () =>
      new Response(pdfBytes, {
        status: 200,
        headers: { "content-type": "application/pdf" },
      }),
  });
  assert.equal(first.delibereArchive.counts.total, 1);
  assert.equal(first.delibereArchive.counts.giunta, 1);
  assert.equal(first.delibereArchive.counts.archived_documents, 1);

  const second = await runAlboIngestion({
    outDir,
    fromFile: secondPath,
    inputFormat: "xml",
    retrievedAt: "2026-06-19T09:00:00.000Z",
  });
  assert.equal(second.delibereArchive.counts.total, 2);
  assert.equal(second.delibereArchive.counts.giunta, 1);
  assert.equal(second.delibereArchive.counts.consiglio, 1);
  assert.equal(second.delibereArchive.counts.archived_documents, 0);
  assert.equal(
    second.delibereArchive.items.find((item) => item.id === "albo-2026-10")
      ?.archived_document,
    null,
  );
  assert.ok(
    second.delibereArchive.items.every(
      (item) => item.presentation?.standardisation.input_field === "subject",
    ),
  );

  const third = await runAlboIngestion({
    outDir,
    fromFile: excludedPath,
    inputFormat: "xml",
    retrievedAt: "2026-06-19T10:00:00.000Z",
  });
  assert.equal(third.delibereArchive.counts.total, 1);
  assert.equal(third.delibereArchive.counts.giunta, 0);
  assert.equal(third.delibereArchive.counts.consiglio, 1);
  assert.deepEqual(
    third.delibereArchive.items.map((item) => item.id),
    ["albo-2026-11"],
  );

  const committedReplay = [{ sha: "committed", latest: second.publicLatest }];
  assert.equal(
    appendCurrentPublicLatest(committedReplay, second.publicLatest).length,
    1,
  );
  const replayWithWorktreeLatest = appendCurrentPublicLatest(
    committedReplay,
    third.publicLatest,
  );
  assert.equal(replayWithWorktreeLatest.length, 2);
  assert.equal(replayWithWorktreeLatest.at(-1)?.sha, "worktree");
  let replayedArchive = second.delibereArchive;
  for (const snapshot of replayWithWorktreeLatest) {
    replayedArchive = buildDelibereArchive(
      replayedArchive,
      snapshot.latest,
      third.documentsManifest,
    );
  }
  assert.deepEqual(
    replayedArchive.items.map((item) => item.id),
    ["albo-2026-11"],
  );

  const archiveJson = await readFile(third.paths.delibereArchive, "utf8");
  assert.match(archiveJson, /non certifica la completezza storica/i);
  assert.doesNotMatch(archiveJson, /riferito a minore/i);
});

test("preserves the public-safe deliberation body for newly restricted acts", async () => {
  const tmp = await mkdtemp(
    path.join(tmpdir(), "albo-delibere-restricted-body-"),
  );
  const fixturePath = path.join(tmp, "albo.xml");
  const outDir = path.join(tmp, "data");
  await writeFile(
    fixturePath,
    [
      xmlRecord(
        "2026/21",
        "DELIBERAZIONE DI GIUNTA",
        "AVVOCATURA",
        "Contenzioso e proposta di transazione",
        "21",
      ),
      xmlRecord(
        "2026/22",
        "DELIBERAZIONE DI CONSIGLIO",
        "SERVIZI DEMOGRAFICI",
        "Pubblicazione di matrimonio",
        "22",
      ),
    ].join("\n"),
    "utf8",
  );

  const result = await runAlboIngestion({
    outDir,
    fromFile: fixturePath,
    inputFormat: "xml",
    retrievedAt: "2026-06-19T11:00:00.000Z",
  });
  const giunta = result.publicLatest.items.find(
    (item) => item.id === "albo-2026-21",
  );
  const consiglio = result.publicLatest.items.find(
    (item) => item.id === "albo-2026-22",
  );

  assert.equal(giunta?.public_visibility, "publishable_with_minimisation");
  assert.equal(giunta?.deliberation_body, "giunta");
  assert.equal(consiglio?.public_visibility, "metadata_only");
  assert.equal(consiglio?.deliberation_body, "consiglio");
  assert.equal(
    (giunta?.privacy_attestation as { policy_version?: unknown })
      ?.policy_version,
    ALBO_PRIVACY_POLICY_VERSION,
  );
  assert.deepEqual(
    result.delibereArchive.items.map((item) => [
      item.id,
      item.deliberation_body,
    ]),
    [
      ["albo-2026-22", "consiglio"],
      ["albo-2026-21", "giunta"],
    ],
  );
  assert.equal(result.delibereArchive.counts.giunta, 1);
  assert.equal(result.delibereArchive.counts.consiglio, 1);
});

test("keeps an immutable 63-record baseline for the initial deliberations seed", async () => {
  const baseline = JSON.parse(
    await readFile(
      path.join(
        REPO_ROOT,
        "scripts",
        "fixtures",
        "delibere-archive-seed-baseline.json",
      ),
      "utf8",
    ),
  ) as {
    schema_version: string;
    counts: { total: number; giunta: number; consiglio: number };
    items: Array<{ id: string; deliberation_body: string }>;
  };
  const ids = new Set(baseline.items.map((item) => item.id));
  const giunta = baseline.items.filter(
    (item) => item.deliberation_body === "giunta",
  ).length;
  const consiglio = baseline.items.filter(
    (item) => item.deliberation_body === "consiglio",
  ).length;

  assert.equal(baseline.schema_version, "delibere-archive-seed-baseline.v1");
  assert.deepEqual(baseline.counts, {
    total: 63,
    giunta: 43,
    consiglio: 20,
  });
  assert.equal(baseline.items.length, baseline.counts.total);
  assert.equal(ids.size, baseline.counts.total);
  assert.equal(giunta, baseline.counts.giunta);
  assert.equal(consiglio, baseline.counts.consiglio);
});

test("fails closed when a deliberations seed lacks bootstrap or complete history", () => {
  assert.throws(
    () =>
      assertDelibereSeedHistoryAvailable({
        has_bootstrap: false,
        shallow_repository: true,
      }),
    /bootstrap assente.*cronologia Git shallow/i,
  );
  assert.doesNotThrow(() =>
    assertDelibereSeedHistoryAvailable({
      has_bootstrap: true,
      shallow_repository: true,
    }),
  );
  assert.throws(
    () =>
      assertDelibereSeedSourceCoverage(
        new Set(["albo-2026-2753", "albo-2026-2751"]),
        ["albo-2026-2753", "albo-2026-2751", "albo-2026-2567"],
      ),
    /Seed delibere incompleto.*albo-2026-2567/i,
  );
  assert.equal(
    isDelibereArchive({
      generated_at: "2026-08-30T00:00:00.000Z",
      source: "Fonte pubblica",
      source_url: "https://example.test/albo",
      verification_status: "verification_required",
      coverage: {},
      counts: {},
      known_limits: [],
      items: [
        {
          id: "albo-2026-2753",
          source: "Fonte pubblica",
          retrieved_at: "2026-08-30T00:00:00.000Z",
          verification_status: "verification_required",
          known_limits: [],
        },
      ],
    }),
    false,
  );
});

test("validates the live cumulative archive against dynamic safety and document invariants", async () => {
  const archive = JSON.parse(
    await readFile(
      path.join(REPO_ROOT, "data", "public", "albo", "delibere-archive.json"),
      "utf8",
    ),
  ) as {
    counts: Record<string, number>;
    items: Array<Record<string, unknown>>;
  };
  const manifest = JSON.parse(
    await readFile(
      path.join(REPO_ROOT, "data", "public", "albo", "documents-manifest.json"),
      "utf8",
    ),
  ) as { documents: Array<Record<string, unknown>> };
  const manifestById = new Map(
    manifest.documents.map((document) => [document.id, document]),
  );

  const giunta = archive.items.filter(
    (item) => item.deliberation_body === "giunta",
  ).length;
  const consiglio = archive.items.filter(
    (item) => item.deliberation_body === "consiglio",
  ).length;
  const altro = archive.items.filter(
    (item) => item.deliberation_body === "altro",
  ).length;
  const publishable = archive.items.filter(
    (item) => item.public_visibility === "publishable",
  ).length;
  const minimised = archive.items.filter(
    (item) => item.public_visibility === "publishable_with_minimisation",
  ).length;
  const metadataOnly = archive.items.filter(
    (item) => item.public_visibility === "metadata_only",
  ).length;
  const archived = archive.items.filter(
    (item) => item.archived_document !== null,
  );

  assert.equal(archive.counts.total, archive.items.length);
  assert.equal(archive.counts.giunta, giunta);
  assert.equal(archive.counts.consiglio, consiglio);
  assert.equal(archive.counts.altro, altro);
  assert.equal(archive.counts.publishable, publishable);
  assert.equal(archive.counts.minimised, minimised);
  assert.equal(archive.counts.metadata_only, metadataOnly);
  assert.equal(archive.counts.archived_documents, archived.length);
  assert.equal(giunta + consiglio + altro, archive.items.length);
  assert.ok(
    archive.items.every((item) => {
      const presentation = item.presentation as
        | Record<string, unknown>
        | undefined;
      const privacyAttestation = item.privacy_attestation as
        | Record<string, unknown>
        | undefined;
      return (
        item.public_visibility !== "do_not_publish" &&
        typeof presentation?.display_title === "string" &&
        typeof presentation.search_text === "string" &&
        privacyAttestation?.schema_version ===
          "albo-privacy-policy-attestation.v1" &&
        privacyAttestation.policy_version === ALBO_PRIVACY_POLICY_VERSION &&
        (privacyAttestation.status === "current" ||
          privacyAttestation.status === "reacquisition_required")
      );
    }),
  );

  const restricted = archive.items.filter(
    (item) => item.public_visibility !== "publishable",
  );
  assert.ok(
    restricted.every(
      (item) =>
        item.office == null &&
        item.act_type == null &&
        item.document_url == null &&
        item.content_hash == null &&
        item.archived_document == null,
    ),
  );

  for (const item of archived) {
    const document = item.archived_document as Record<string, unknown>;
    const authorised = manifestById.get(item.id) as
      | Record<string, unknown>
      | undefined;
    assert.equal(item.public_visibility, "publishable");
    assert.equal(item.privacy_risk, "low");
    assert.equal(authorised?.sha256, document.sha256);
    assert.equal(authorised?.storage_path, document.storage_path);

    const storagePath = String(document.storage_path);
    const bytes = await readFile(path.join(REPO_ROOT, storagePath));
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      document.sha256,
    );
    assert.equal(bytes.byteLength, document.size_bytes);
  }
});

test("discovers official Tinnvision PDF attachments only for low-risk publishable records", async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), "albo-tinnvision-detail-pdf-"));
  const fixturePath = path.join(tmp, "albo.xml");
  const outDir = path.join(tmp, "data");
  const pdfBytes = new TextEncoder().encode("%PDF-1.7\npublic detail pdf\n");
  const expectedDocumentUrl =
    "https://albo.tinnvision.cloud/allegati/2026_1001_3_ALLEG?ente=00301390795";
  const detailCalls: string[] = [];
  const pdfCalls: string[] = [];

  await writeFile(
    fixturePath,
    [
      xmlRecord(
        "2026/1001",
        "DETERMINAZIONE DIRIGENZIALE",
        "SETTORE TECNICO",
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
    ].join("\n"),
    "utf8",
  );

  const result = await runAlboIngestion({
    outDir,
    fromFile: fixturePath,
    inputFormat: "xml",
    retrievedAt: FIXTURE_RETRIEVED_AT,
    documentDiscovery: true,
    detailFetch: async (url) => {
      detailCalls.push(String(url));
      return new Response(
        JSON.stringify({
          pubblicazioneAlbo: { ANNO: 2026, PROGRESSIVO: 1001 },
          allegati: {
            totalItems: 3,
            items: [
              {
                DESCALLEGATO: "Nota di Pubblicazione",
                NOMEALLEGATO: "copia_NotaPubblicazione_n_1001.pdf",
                PROGRESSIVO: 7,
                tipoAllegato: "ALLEG",
              },
              {
                DESCALLEGATO: "Atto Esecutivo",
                NOMEALLEGATO: "AttoEsecutivo_n_1001.pdf.p7m",
                PROGRESSIVO: 4,
                tipoAllegato: "ALLEG",
              },
              {
                DESCALLEGATO: "Versione non Firmata - Atto Esecutivo",
                NOMEALLEGATO: "copia_AttoEsecutivo_n_1001.pdf",
                PROGRESSIVO: 3,
                tipoAllegato: "ALLEG",
              },
            ],
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    },
    pdfFetch: async (url) => {
      pdfCalls.push(String(url));
      return new Response(pdfBytes, {
        status: 200,
        headers: {
          "content-type": "application/pdf",
          "content-length": String(pdfBytes.byteLength),
        },
      });
    },
  });

  assert.deepEqual(detailCalls, [
    "https://albo.tinnvision.cloud/api/pubblicazioni/2026-1001?ente=00301390795",
  ]);
  assert.deepEqual(pdfCalls, [expectedDocumentUrl]);
  assert.equal(result.items[0].document_url, expectedDocumentUrl);
  assert.equal(result.publicLatest.items[0].document_url, expectedDocumentUrl);
  assert.equal(result.publicLatest.items[1].document_url, null);
  assert.equal(result.documentsManifest.counts.archived, 1);
  assert.equal(
    result.documentsManifest.documents[0].document_url,
    expectedDocumentUrl,
  );
  assert.match(
    result.snapshot.known_limits.join("\n"),
    /dettaglio ufficiale Tinnvision solo per record pubblicabili a basso rischio/,
  );
});

test("excludes metadata-only and high-risk records from PDF archiving without exposing document URLs", async () => {
  const tmp = await mkdtemp(
    path.join(tmpdir(), "albo-tinnvision-pdf-excluded-"),
  );
  const fixturePath = path.join(tmp, "albo.xml");
  const outDir = path.join(tmp, "data");
  const metadataOnlyUrl =
    "https://albo.tinnvision.cloud/documenti/2026/2001.pdf";
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
      (decision) =>
        decision.preservation_status === "excluded" &&
        !("document_url" in decision),
    ),
  );

  const manifest = await readFile(result.paths.documentsManifest, "utf8");
  assert.equal(manifest.includes(metadataOnlyUrl), false);
  assert.equal(manifest.includes(highRiskUrl), false);
  assert.equal(manifest.includes("original_document_url"), false);
});

test("skips otherwise eligible PDFs when content type or size limit fails", async () => {
  const tmp = await mkdtemp(
    path.join(tmpdir(), "albo-tinnvision-pdf-content-"),
  );
  const fixturePath = path.join(tmp, "albo.xml");
  const outDir = path.join(tmp, "data");
  const htmlUrl = "https://albo.tinnvision.cloud/documenti/2026/2501.pdf";
  const oversizeUrl = "https://albo.tinnvision.cloud/documenti/2026/2502.pdf";
  await writeFile(
    fixturePath,
    [
      xmlRecord(
        "2026/2501",
        "AVVISO PUBBLICO",
        "SEGRETERIA",
        "Avviso pubblico ordinario",
        "",
        htmlUrl,
      ),
      xmlRecord(
        "2026/2502",
        "AVVISO PUBBLICO",
        "SEGRETERIA",
        "Avviso pubblico ordinario bis",
        "",
        oversizeUrl,
      ),
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
    result.documentsManifest.decisions.every(
      (decision) => !("document_url" in decision),
    ),
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

  assert.equal(
    result.items[0].public_visibility,
    "publishable_with_minimisation",
  );
  assert.equal(result.items[0].privacy_risk, "medium");
  assert.equal(result.documentsManifest.counts.human_review_required, 1);
  assert.equal(
    result.documentsManifest.decisions[0].preservation_status,
    "human_review_required",
  );
  assert.equal(
    result.documentsManifest.decisions[0].reason,
    "human_review_required",
  );
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
  assert.equal(
    result.documentsManifest.decisions[0].preservation_status,
    "skipped",
  );
  assert.equal(
    result.documentsManifest.decisions[0].reason,
    "non_https_document_url",
  );
  assert.ok(!("document_url" in result.documentsManifest.decisions[0]));
  assert.match(result.documentsManifest.warnings.join("\n"), /not HTTPS/);

  const manifest = await readFile(result.paths.documentsManifest, "utf8");
  assert.equal(manifest.includes(documentUrl), false);
  assert.match(manifest, /official document URL is not HTTPS/);
});

function snapshot(
  records: ReturnType<typeof parseTinnvisionXml>,
): AlboRawSnapshot {
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

function sessionCandidateFixture(
  overrides: Partial<InstitutionalSessionCandidateInput> = {},
): InstitutionalSessionCandidateInput {
  return {
    id: "albo-2026-2648",
    source: "Albo Pretorio Comune di Lamezia Terme",
    source_url: ALBO_PRETORIO_LAMEZIA_SOURCE.sourceUrl,
    retrieved_at: FIXTURE_RETRIEVED_AT,
    publication_number: "2026/2648",
    publication_start: "2026-08-07",
    publication_end: "2026-08-14",
    act_type: "CONVOCAZIONI COMMISSIONI CONSILIARI",
    subject: "Convocazione 2° Commissione Consiliare Permanente.",
    document_url:
      "https://albo.tinnvision.cloud/allegati/2026_2648_2_P?ente=00301390795",
    content_hash:
      "f4301f15e2bfd99aecb79f25ceb4d1346a486ff1fe20e748f9bac89a818eee09",
    verification_status: "official_source_acquired",
    privacy_risk: "low",
    public_visibility: "publishable",
    ...overrides,
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
