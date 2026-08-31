import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAlboEvidenceArchive,
  buildStaticPnrrDataset,
  extractCups,
  extractProjectLinks,
  parseMunicipalPnrrProject,
  validateCoverageRegression,
  validateStaticPnrrDataset,
} from "./lameziaPnrrCore.mjs";

const CUP = "C81B21003520001";

test("extractProjectLinks keeps one canonical official URL per source id", () => {
  const links = extractProjectLinks(`
    <a href="/it/attuazione-misure-pnrr/3281">A</a>
    <a href="https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr/3281?x=1">A again</a>
    <a href="/it/attuazione-misure-pnrr/3238">B</a>
  `);

  assert.deepEqual(links, [
    {
      source_id: "3238",
      source_url:
        "https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr/3238",
    },
    {
      source_id: "3281",
      source_url:
        "https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr/3281",
    },
  ]);
});

test("parseMunicipalPnrrProject extracts official fields, amount and attachments", () => {
  const project = parseMunicipalPnrrProject({
    sourceId: "3281",
    sourceUrl:
      "https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr/3281",
    html: `
      <h1 data-element="attuator-title">Qualità dell&#039;abitare</h1>
      <p>Data di Pubblicazione : 17 ott 2025</p>
      <div><p><b>Missione:</b> M5 - Inclusione e coesione</p>
      <p><b>Componente:</b> M5C2 - Infrastrutture sociali</p>
      <p><b>Investimento:</b> 2.3 - Qualità dell'abitare</p>
      <p><b>Soggetto Attuatore:</b> Comune di Lamezia Terme</p>
      <p><b>CUP:</b> ${CUP}</p></div>
      <a id="importo-finanziato"></a><h2>Importo Finanziato</h2><div>10.374.159,48 €</div>
      <a id="atti-legislativi-e-amministrativi"></a>
      <a href="/files/atto.pdf">Approvazione progetto</a>
    `,
  });

  assert.equal(project.title, "Qualità dell'abitare");
  assert.equal(project.cup, CUP);
  assert.equal(project.amount_eur, 10_374_159.48);
  assert.equal(project.published_at, "2025-10-17");
  assert.deepEqual(project.attachments, [
    {
      title: "Approvazione progetto",
      url: "https://www.comune.lamezia-terme.cz.it/files/atto.pdf",
    },
  ]);
  assert.match(project.source_record_hash, /^[a-f0-9]{64}$/);
});

test("Albo evidence uses explicit PNRR text or an official project CUP and removes revoked current records", () => {
  const previous = [
    {
      id: "albo-old",
      subject: "Old retained evidence",
      cups: [CUP],
    },
    {
      id: "albo-revoked",
      subject: "Previously visible",
      cups: [CUP],
    },
    {
      id: "albo-stale-document",
      subject: "Previously archived PNRR evidence",
      cups: [CUP],
      archived_path: "data/public/albo/documents/2026/no-longer-allowed.pdf",
      document_content_type: "application/pdf",
      document_size_bytes: 100,
      evidence_hash: "old",
    },
  ];
  const source = {
    generated_at: "2026-08-31T10:00:00.000Z",
    items: [
      publicRecord({
        id: "albo-cup",
        subject: `Liquidazione lavori CUP ${CUP}`,
      }),
      publicRecord({
        id: "albo-marker",
        subject: "PNRR M4C1I1.1 — atto senza CUP",
      }),
      publicRecord({
        id: "albo-unrelated",
        subject:
          "Atto con CUP C82D24000300005 non presente nelle schede comunali",
      }),
    ],
    excluded: [
      {
        ...publicRecord({
          id: "albo-revoked",
          subject: `PNRR CUP ${CUP}`,
        }),
        public_visibility: "metadata_only",
      },
    ],
  };

  const evidence = buildAlboEvidenceArchive({
    currentSources: [source],
    existingEvidence: previous,
    officialProjectCups: [CUP],
    documentManifest: {
      documents: [
        {
          id: "albo-cup",
          document_url: "https://albo.example/atto.pdf",
          storage_path: "data/public/albo/documents/2026/sha.pdf",
          size_bytes: 100,
          content_type: "application/pdf",
        },
      ],
    },
  });

  assert.deepEqual(evidence.map((item) => item.id).sort(), [
    "albo-cup",
    "albo-marker",
    "albo-old",
    "albo-stale-document",
  ]);
  assert.deepEqual(
    evidence.find((item) => item.id === "albo-cup")?.match_basis,
    ["official_project_cup"],
  );
  assert.equal(
    evidence.find((item) => item.id === "albo-cup")?.archived_path,
    "data/public/albo/documents/2026/sha.pdf",
  );
  assert.deepEqual(
    evidence.find((item) => item.id === "albo-marker")?.mission_codes,
    ["M4C1I1.1"],
  );
  assert.equal(
    evidence.find((item) => item.id === "albo-stale-document")?.archived_path,
    null,
  );
});

test("buildStaticPnrrDataset links only shared CUP evidence and reports unmatched records", () => {
  const project = {
    source_id: "3281",
    source_url: "https://example.test/pnrr/3281",
    source_record_hash: "a".repeat(64),
    title: "Progetto",
    mission: "M5",
    component: null,
    investment: null,
    intervention: null,
    holder: null,
    attuatore: "Comune",
    sub_attuatore: null,
    cup: CUP,
    amount_eur: 100,
    status: null,
    start_date: null,
    end_date: null,
    published_at: "2025-10-17",
    attachments: [],
    verification_status: "official_municipal_project_page",
  };
  const linked = { id: "linked", cups: [CUP] };
  const unmatched = { id: "unmatched", cups: [] };

  const dataset = buildStaticPnrrDataset({
    projects: [project],
    alboEvidence: [linked, unmatched],
    materializedAt: "2026-08-31T12:00:00.000Z",
  });

  assert.deepEqual(dataset.projects[0].albo_evidence_ids, ["linked"]);
  assert.deepEqual(dataset.unmatched_albo_evidence_ids, ["unmatched"]);
  assert.equal(dataset.coverage.projects_with_albo_evidence, 1);
  assert.equal(dataset.coverage.linked_albo_evidence, 1);
  assert.match(dataset.metadata.coverage_note, /non equivale/i);
});

test("extractCups accepts only canonical fifteen-character CUPs", () => {
  assert.deepEqual(
    extractCups(`CUP ${CUP}; corto C81B2100; duplicato ${CUP}`),
    [CUP],
  );
});

test("validateStaticPnrrDataset rejects an Albo relation without a shared CUP", () => {
  const dataset = buildStaticPnrrDataset({
    projects: [
      {
        source_id: "3281",
        source_url:
          "https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr/3281",
        source_record_hash: "a".repeat(64),
        title: "Progetto",
        mission: null,
        component: null,
        investment: null,
        intervention: null,
        holder: null,
        attuatore: null,
        sub_attuatore: null,
        cup: CUP,
        amount_eur: 100,
        status: null,
        start_date: null,
        end_date: null,
        published_at: null,
        attachments: [],
        verification_status: "official_municipal_project_page",
      },
    ],
    alboEvidence: [
      {
        id: "wrong-cup",
        cups: ["C82D24000300005"],
        public_visibility: "publishable",
        privacy_risk: "low",
        verification_status: "official_source_acquired",
      },
    ],
    materializedAt: "2026-08-31T12:00:00.000Z",
  });
  dataset.projects[0].albo_evidence_ids = ["wrong-cup"];

  assert.throws(
    () => validateStaticPnrrDataset(dataset),
    /without a shared CUP/,
  );
});

test("validateCoverageRegression keeps the previous feed on a parser collapse", () => {
  assert.throws(
    () =>
      validateCoverageRegression(
        {
          coverage: {
            projects: 10,
            projects_with_cup: 2,
            projects_with_amount: 1,
            municipal_attachments: 20,
          },
        },
        {
          coverage: {
            projects: 30,
            projects_with_cup: 30,
            projects_with_amount: 30,
            municipal_attachments: 279,
          },
        },
      ),
    /coverage regression/,
  );
});

function publicRecord({ id, subject }) {
  return {
    id,
    public_id: id,
    source: "Albo Pretorio Comune di Lamezia Terme",
    source_url: "https://albo.example",
    retrieved_at: "2026-08-31T10:00:00.000Z",
    publication_number: "2026/1",
    publication_start: "2026-08-31",
    publication_end: "2026-09-15",
    office: "Settore lavori pubblici",
    act_type: "Determinazione",
    act_number: "1",
    act_date: "2026-08-31",
    subject,
    document_url: null,
    verification_status: "official_source_acquired",
    privacy_risk: "low",
    public_visibility: "publishable",
  };
}
