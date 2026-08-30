import assert from "node:assert/strict";
import test from "node:test";

import {
  classifyAlboPublicSafety,
  makeAlboPublicSafetyDecision,
  projectPublicAct,
  publicActProgressivoFromPublicId,
  publicActPublicId,
  publicActProjectionFailureReason,
  type PublicActProjectionInput,
} from "@workspace/publication-standardisation/public-act";

function input(
  overrides: Partial<PublicActProjectionInput> = {},
): PublicActProjectionInput {
  const oggetto =
    overrides.oggetto ?? "APPROVAZIONE DEL PROGRAMMA PNRR DEL COMUNE";
  return {
    id: 42,
    progressivo: "2026/42",
    tipologia: "DELIBERAZIONE DI GIUNTA",
    category: "delibera",
    subcategory: "giunta",
    provenienza: "Segreteria generale",
    oggetto,
    data_atto: "2026-08-30",
    publication_start: "2026-08-30",
    publication_end: "2026-09-15",
    registry_section_number: "42",
    registry_general_number: "1042",
    cups: [],
    pnrr_mission: null,
    is_pnrr: true,
    is_new: true,
    first_seen_at: "2026-08-30T09:00:00.000Z",
    macrotema: "fondi_europei_pnrr",
    decision: classifyAlboPublicSafety({
      subject: oggetto,
      act_type: "DELIBERAZIONE DI GIUNTA",
      office: "Segreteria generale",
    }),
    ...overrides,
  };
}

test("fails closed with an observable reason for absent or stale decisions", () => {
  const absent = input({ decision: null });
  assert.equal(projectPublicAct(absent), null);
  assert.equal(
    publicActProjectionFailureReason(absent),
    "invalid_or_stale_decision",
  );

  const stale = input({
    decision: {
      ...(input().decision as Record<string, unknown>),
      policy_version: "stale",
    },
  });
  assert.equal(projectPublicAct(stale), null);
  assert.equal(
    publicActProjectionFailureReason(stale),
    "invalid_or_stale_decision",
  );
});

test("a limited canary cannot reappear in title, artifacts or search text", () => {
  const canary = "CANARY-NON-PUBBLICO-765";
  const oggetto = `CONTENZIOSO ${canary}`;
  const projected = projectPublicAct(
    input({
      oggetto,
      provenienza: `Ufficio ${canary}`,
      decision: classifyAlboPublicSafety({
        subject: oggetto,
        act_type: "DELIBERAZIONE",
        office: `Ufficio ${canary}`,
      }),
      attachments: [
        {
          name: `${canary}.pdf`,
          tipo: "P",
          official_url: `https://example.invalid/${canary}.pdf`,
          archived_url: null,
          content_type: "application/pdf",
          size: 123,
          public_safe: true,
        },
      ],
      markdown: {
        text: `# ${canary}`,
        source: `${canary}.pdf`,
        extracted_at: "2026-08-30T10:00:00.000Z",
        public_safe: true,
      },
    }),
  );

  assert.ok(projected);
  assert.equal(
    projected.public_safety.public_visibility,
    "publishable_with_minimisation",
  );
  assert.deepEqual(projected.attachments, []);
  assert.equal(projected.markdown, null);
  assert.doesNotMatch(JSON.stringify(projected), new RegExp(canary, "iu"));
});

test("snapshot and API adapters receive the same presentation from one projector", () => {
  const decision = classifyAlboPublicSafety({
    subject: "APPROVAZIONE DEL PROGRAMMA PNRR DEL COMUNE",
    act_type: "DELIBERAZIONE DI GIUNTA",
    office: "Segreteria generale",
  });
  const snapshotProjection = projectPublicAct(input({ decision }));
  const apiProjection = projectPublicAct(input({ id: 99, decision }));
  assert.ok(snapshotProjection);
  assert.ok(apiProjection);
  assert.equal(snapshotProjection.public_id, "albo-2026-42");
  assert.equal(apiProjection.public_id, snapshotProjection.public_id);
  assert.deepEqual(apiProjection.presentation, snapshotProjection.presentation);
  assert.equal(
    apiProjection.presentation.display_title,
    "Approvazione del programma PNRR del comune",
  );
});

test("public ids cannot collapse distinct raw progressivo values", () => {
  const progressivi = [
    "2026/42",
    "2026-42",
    "2026_42",
    "2026/042",
    " 2026/42 ",
  ];
  const ids = progressivi.map((value) => publicActPublicId(value));

  assert.equal(ids[0], "albo-2026-42");
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.every(Boolean));
  assert.deepEqual(
    ids.map((value) => publicActProgressivoFromPublicId(value!)),
    progressivi,
  );
  assert.equal(publicActProgressivoFromPublicId("albo-2026-0"), null);
  assert.equal(publicActProgressivoFromPublicId("albo-raw-002f0"), null);
});

test("artifacts are emitted only with an explicit low-risk attestation", () => {
  const baseAttachment = {
    name: "delibera.pdf",
    tipo: "P",
    official_url: "https://example.invalid/delibera.pdf",
    archived_url: "/api/storage/public-objects/delibera.pdf",
    content_type: "application/pdf",
    size: 123,
  };
  const notAttested = projectPublicAct(
    input({ attachments: [{ ...baseAttachment, public_safe: false }] }),
  );
  const attested = projectPublicAct(
    input({ attachments: [{ ...baseAttachment, public_safe: true }] }),
  );
  assert.ok(notAttested);
  assert.ok(attested);
  assert.deepEqual(notAttested.attachments, []);
  assert.equal(attested.attachments.length, 1);
  assert.equal(attested.public_safety.attachments_attested, true);
});

test("free-form policy reasons are not copied into the public projection", () => {
  const canary = "CANARY-POLICY-REASON-765";
  const decision = makeAlboPublicSafetyDecision(
    "publishable_with_minimisation",
    "medium",
    canary,
  );
  assert.ok(decision);
  const projected = projectPublicAct(
    input({
      decision,
      subcategory: canary,
      macrotema: canary,
    }),
  );

  assert.ok(projected);
  assert.equal(projected.subcategory, null);
  assert.equal(projected.macrotema, null);
  assert.doesNotMatch(JSON.stringify(projected), new RegExp(canary, "u"));
});
