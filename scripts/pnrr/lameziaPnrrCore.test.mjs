import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAlboEvidenceArchive,
  buildOpenCupProjectUrl,
  buildStaticPnrrDataset,
  deriveMunicipalAttachmentMetadata,
  extractCups,
  extractProjectLinks,
  parseMunicipalPnrrProject,
  parseOpenCupProject,
  stableDatasetPayload,
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
      <a href="/files/avviso.pdf">Avviso 2022</a>
    `,
  });

  assert.equal(project.title, "Qualità dell'abitare");
  assert.equal(project.cup, CUP);
  assert.equal(project.amount_eur, 10_374_159.48);
  assert.equal(project.published_at, "2025-10-17");
  assert.deepEqual(project.attachments, [
    {
      classification_basis: "title_keyword",
      date_basis: null,
      date_precision: null,
      document_date: null,
      document_year: null,
      phase: "planning_authorisations",
      sequence: null,
      source_order: 0,
      title: "Approvazione progetto",
      url: "https://www.comune.lamezia-terme.cz.it/files/atto.pdf",
    },
    {
      classification_basis: "title_keyword",
      date_basis: "title_or_filename_year",
      date_precision: "year",
      document_date: null,
      document_year: 2022,
      phase: "programme_funding",
      sequence: null,
      source_order: 1,
      title: "Avviso 2022",
      url: "https://www.comune.lamezia-terme.cz.it/files/avviso.pdf",
    },
  ]);
  assert.match(project.source_record_hash, /^[a-f0-9]{64}$/);
});

test("parseOpenCupProject keeps official fields separate from municipal data", () => {
  const sourceUrl = buildOpenCupProjectUrl(CUP);
  const project = parseOpenCupProject({
    cup: CUP,
    sourceUrl,
    html: `
      <div id="resRicerca">
        <h2>PIÙ SERVIZI AL TERRITORIO*VIA SAMBIASE</h2>
        CUP: <span><strong>${CUP}</strong></span>
        <span>Totale costo previsto</span><br><span>8645133.0 &euro;</span>
        <span>Totale Finanziamento pubblico previsto</span><br><span>8000000.0 &euro;</span>
      </div>
      <div class="datiCup">
        <span class="tltDett">Anno decisione</span><br><span class="tltLabel">2021</span>
        <span class="tltDett">Stato</span><br><span class="tltLabelAtt">ATTIVO</span>
        <span class="tltDett">Soggetto titolare</span><br><span class="tltLabel">COMUNE DI LAMEZIA TERME</span>
        <span class="tltDett">Descrizione intervento</span><br><span class="tltLabel">RIQUALIFICAZIONE DI SPAZI URBANI</span>
        <span class="tltDett">Struttura/Infrastruttura oggetto dell'intervento</span><span class="tltLabel">PIÙ SERVIZI AL TERRITORIO</span>
        <span class="tltDett">Partita IVA/Codice Fiscale beneficiario</span><br><span class="tltLabel">DATO NON PRESENTE</span>
        <span class="tltDett">Indirizzo o area di riferimento</span><br><span class="tltLabel">VIA SAMBIASE</span>
      </div>
      <script>var _callInteroperabilitaURL = true;</script>
      ${openCupPanel("Localizzazione progetto", [
        ["Stato", "ITALIA"],
        ["Area Geografica", "SUD"],
        ["Regione", "CALABRIA"],
        ["Provincia", "CATANZARO"],
        ["Comune", "LAMEZIA TERME"],
      ])}
      ${openCupPanel("Soggetto titolare", [
        ["Denominazione", "COMUNE DI LAMEZIA TERME - CZ -"],
        ["CF/Partita IVA", "00301390795"],
        ["Area", "AMMINISTRAZIONI LOCALI"],
        ["Categoria", "ENTI TERRITORIALI"],
        ["Sotto Categoria", "AMMINISTRAZIONI COMUNALI"],
      ])}
      ${openCupPanel("Classificazione Progetto", [
        ["Classificazione", "LAVORI PUBBLICI"],
        ["Tipologia", "NUOVA REALIZZAZIONE"],
        ["Area d'intervento", "IMMOBILI"],
        ["Settore", "INFRASTRUTTURE SOCIALI"],
        ["Sottosettore", "SPORT, SPETTACOLO E TEMPO LIBERO"],
        ["Categoria", "ALTRE STRUTTURE RICREATIVE"],
      ])}
      ${openCupPanel("Dati aggiuntivi del progetto", [
        ["Data di generazione", "12/04/2021"],
        ["Struttura/Infrastruttura Unica", "SI"],
        ["Strumento di Programmazione", "PROGRAMMA QUALITÀ DELL'ABITARE"],
        ["CUP Master", "NON PRESENTE"],
        ["Numero di CUP collegati", "0"],
      ])}
      ${openCupPanel("Dati finanziari", [
        ["Atti di concessione o finanza del Progetto", "NO"],
        ["Sponsorizzazioni", "NON PREVISTE"],
        ["Copertura Finanziaria", "STATALE"],
      ])}
      ${openCupPanel("Dati CIPESS", [
        ["N° Delibera CIPESS", "DATO NON PRESENTE"],
        ["Anno Delibera", "DATO NON PRESENTE"],
        ["Legge Obiettivo", "NO"],
      ])}
    `,
  });

  assert.deepEqual(project, {
    source_url: sourceUrl,
    cup: CUP,
    title: "PIÙ SERVIZI AL TERRITORIO*VIA SAMBIASE",
    total_cost_eur: 8_645_133,
    public_funding_eur: 8_000_000,
    decision_year: 2021,
    cup_status: "ATTIVO",
    description: "RIQUALIFICAZIONE DI SPAZI URBANI",
    infrastructure: "PIÙ SERVIZI AL TERRITORIO",
    beneficiary_tax_code: null,
    reference_address: "VIA SAMBIASE",
    location: {
      country: "ITALIA",
      macro_area: "SUD",
      region: "CALABRIA",
      province: "CATANZARO",
      municipality: "LAMEZIA TERME",
    },
    holder: {
      name: "COMUNE DI LAMEZIA TERME - CZ -",
      tax_code: "00301390795",
      area: "AMMINISTRAZIONI LOCALI",
      category: "ENTI TERRITORIALI",
      subcategory: "AMMINISTRAZIONI COMUNALI",
    },
    classification: {
      nature: "LAVORI PUBBLICI",
      typology: "NUOVA REALIZZAZIONE",
      intervention_area: "IMMOBILI",
      sector: "INFRASTRUTTURE SOCIALI",
      subsector: "SPORT, SPETTACOLO E TEMPO LIBERO",
      category: "ALTRE STRUTTURE RICREATIVE",
    },
    generated_at: "2021-04-12",
    unique_infrastructure: true,
    programming_instrument: "PROGRAMMA QUALITÀ DELL'ABITARE",
    master_cup: null,
    linked_cups_count: 0,
    financial: {
      concession_or_finance_acts: false,
      sponsorships: "NON PREVISTE",
      coverage: "STATALE",
    },
    cipess: {
      resolution_number: null,
      resolution_year: null,
      strategic_infrastructure_law: false,
    },
    verification_status: "official_opencup_project_page",
    source_record_hash: project.source_record_hash,
  });
  assert.match(project.source_record_hash, /^[a-f0-9]{64}$/);
});

test("OpenCUP URL construction rejects a non-canonical CUP", () => {
  assert.throws(() => buildOpenCupProjectUrl("M5C2"), /invalid CUP/);
});

test("OpenCUP provenance hashes are validated against the acquired payload", () => {
  const opencup = parseOpenCupProject({
    cup: CUP,
    sourceUrl: buildOpenCupProjectUrl(CUP),
    html: `<div id="resRicerca"><h2>Progetto OpenCUP</h2>CUP: <strong>${CUP}</strong></div>`,
  });
  const dataset = buildStaticPnrrDataset({
    projects: [
      {
        source_id: "3281",
        source_url:
          "https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr/3281",
        source_record_hash: "a".repeat(64),
        title: "Progetto comunale",
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
        opencup,
        verification_status: "official_municipal_project_page",
      },
    ],
    alboEvidence: [],
    materializedAt: "2026-08-31T12:00:00.000Z",
  });

  assert.doesNotThrow(() => validateStaticPnrrDataset(dataset));
  dataset.projects[0].opencup.title = "Valore alterato";
  assert.throws(
    () => validateStaticPnrrDataset(dataset),
    /invalid OpenCUP provenance/,
  );
});

test("municipal attachment metadata discloses phase, source order and date precision", () => {
  assert.deepEqual(
    deriveMunicipalAttachmentMetadata({
      title:
        "27 - Approvazione e Liquidazione SAL n. 3 atto n.157 del 04.11.2025",
      url: "https://example.test/sal.pdf",
      sourceOrder: 6,
    }),
    {
      title:
        "27 - Approvazione e Liquidazione SAL n. 3 atto n.157 del 04.11.2025",
      url: "https://example.test/sal.pdf",
      source_order: 6,
      sequence: 27,
      document_date: "2025-11-04",
      document_year: 2025,
      date_precision: "day",
      date_basis: "title_explicit_date",
      phase: "execution_spending",
      classification_basis: "title_keyword",
    },
  );

  const ambiguousYear = deriveMunicipalAttachmentMetadata({
    title: "Avviso 2022 aggiornato nel 2023",
    url: "https://example.test/avviso.pdf",
    sourceOrder: 0,
  });
  assert.equal(ambiguousYear.document_year, null);
  assert.equal(ambiguousYear.date_precision, null);
  assert.equal(ambiguousYear.phase, "programme_funding");
});

test("municipal attachment metadata recognizes cautious title variants", () => {
  const planning = deriveMunicipalAttachmentMetadata({
    title: "Approvazione progetti definitivi e conferenza di servizi",
    url: "https://example.test/progetti.pdf",
    sourceOrder: 0,
  });
  assert.equal(planning.phase, "planning_authorisations");
  assert.equal(planning.classification_basis, "title_keyword");

  const funding = deriveMunicipalAttachmentMetadata({
    title: "Decreto con elenco dei comuni ammessi al finanziamento",
    url: "https://example.test/decreto.pdf",
    sourceOrder: 1,
  });
  assert.equal(funding.phase, "programme_funding");
  assert.equal(funding.classification_basis, "title_keyword");
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
  assert.equal(dataset.schema_version, 3);
  assert.equal(dataset.coverage.projects_with_opencup, 0);
  assert.equal(
    stableDatasetPayload(dataset).attachment_taxonomy.schema_version,
    "pnrr-attachment-phase.v1",
  );
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

test("validateStaticPnrrDataset rejects duplicate project CUPs", () => {
  const project = {
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
    opencup: null,
    verification_status: "official_municipal_project_page",
  };
  const dataset = buildStaticPnrrDataset({
    projects: [
      project,
      {
        ...project,
        source_id: "3282",
        source_url:
          "https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr/3282",
      },
    ],
    alboEvidence: [],
    materializedAt: "2026-08-31T12:00:00.000Z",
  });

  assert.throws(
    () => validateStaticPnrrDataset(dataset),
    /duplicate project CUP/,
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

function openCupPanel(title, fields) {
  return `
    <div class="panel panel-default">
      <span class="title-text">${title}</span>
      <div class="panel-body">
        ${fields
          .map(
            ([label, value]) =>
              `<span class="tltDett">${label}</span><br><span class="tltLabel">${value}</span>`,
          )
          .join("\n")}
      </div>
    </div>
  `;
}

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
