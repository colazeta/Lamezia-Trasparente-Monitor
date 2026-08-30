import assert from "node:assert/strict";
import test from "node:test";

import {
  normaliseSearchText,
  publicationStandardisationDescriptor,
  standardisePublicationTitle,
} from "@workspace/publication-standardisation";

import {
  ALBO_PUBLICATION_STANDARDISATION_PROFILE,
  standardiseAlboPublicSubject,
} from "./albo-publication-standardisation";

test("standardises an all-caps administrative title without changing its source", () => {
  const source =
    "  APPROVAZIONE   DEL PROGETTO PNRR PER IL COMUNE DI LAMEZIA TERME  ";
  const result = standardisePublicationTitle({
    input_text: source,
    input_field: "subject",
    profile: ALBO_PUBLICATION_STANDARDISATION_PROFILE,
  });

  assert.ok(result);
  assert.equal(
    result.display_title,
    "Approvazione del progetto PNRR per il Comune di Lamezia Terme",
  );
  assert.equal(result.action_id, "approvazione");
  assert.equal(result.action_label, "Approvazione");
  assert.equal(result.standardisation.input_field_preserved, true);
  assert.equal(result.standardisation.status, "standardised_automatically");
  assert.equal(
    result.standardisation.transformations.includes(
      "extract_action_prefix:approvazione",
    ),
    false,
  );
  assert.match(result.search_text, /approvazione/);
  assert.equal(source.startsWith("  APPROVAZIONE"), true);
});

test("normalises apostrophes and restores protected acronyms", () => {
  const result = standardisePublicationTitle({
    input_text: "presa d’atto della verifica sul cig per l' affidamento",
    input_field: "subject",
    profile: ALBO_PUBLICATION_STANDARDISATION_PROFILE,
  });

  assert.ok(result);
  assert.equal(
    result.display_title,
    "Presa d'atto della verifica sul CIG per l'affidamento",
  );
  assert.equal(result.action_id, "presa_atto");
  assert.equal(result.action_label, "Presa d'atto");
  assert.ok(
    result.standardisation.transformations.includes("normalise_apostrophes"),
  );
  assert.ok(
    result.standardisation.transformations.includes("tighten_apostrophe"),
  );
});

test("capitalises a mixed-case remainder and each new sentence", () => {
  const mixed = standardisePublicationTitle({
    input_text:
      "Approvazione del rendiconto della gestione ai sensi del d.Lgs. n. 267/2000.",
    input_field: "subject",
    profile: ALBO_PUBLICATION_STANDARDISATION_PROFILE,
  });
  const upper = standardisePublicationTitle({
    input_text:
      "APPROVAZIONE DEL DOCUMENTO PNRR. LINEE GUIDA PER IL COMUNE DI LAMEZIA TERME.",
    input_field: "subject",
    profile: ALBO_PUBLICATION_STANDARDISATION_PROFILE,
  });
  const legalAbbreviations = standardisePublicationTitle({
    input_text:
      "APPROVAZIONE DEL REGOLAMENTO AI SENSI DEL D.LGS. N. 267/2000. ENTRATA IN VIGORE.",
    input_field: "subject",
    profile: ALBO_PUBLICATION_STANDARDISATION_PROFILE,
  });

  assert.equal(
    mixed?.display_title,
    "Approvazione del rendiconto della gestione ai sensi del d.Lgs. n. 267/2000.",
  );
  assert.equal(
    upper?.display_title,
    "Approvazione del documento PNRR. Linee guida per il Comune di Lamezia Terme.",
  );
  assert.equal(
    legalAbbreviations?.display_title,
    "Approvazione del regolamento ai sensi del d.lgs. n. 267/2000. Entrata in vigore.",
  );
});

test("detects a bare action prefix without removing it and preserves compound actions", () => {
  const bare = standardisePublicationTitle({
    input_text: "PRESA D'ATTO DETERMINAZIONE DIRIGENZIALE N. 42",
    input_field: "subject",
    profile: ALBO_PUBLICATION_STANDARDISATION_PROFILE,
  });
  const compound = standardisePublicationTitle({
    input_text: "APPROVAZIONE E AUTORIZZAZIONE ALLA FIRMA",
    input_field: "subject",
    profile: ALBO_PUBLICATION_STANDARDISATION_PROFILE,
  });

  assert.equal(
    bare?.display_title,
    "Presa d'atto determinazione dirigenziale n. 42",
  );
  assert.equal(bare?.action_id, "presa_atto");
  assert.equal(bare?.action_label, "Presa d'atto");
  assert.equal(compound?.action_label, null);
  assert.equal(compound?.action_id, null);
  assert.equal(
    compound?.display_title,
    "Approvazione e autorizzazione alla firma",
  );
});

test("keeps ambiguous casing and long malformed titles visible for review", () => {
  const source = `${"PROGETTO ESECUTIVO PER IL COMUNE dI LAMEZIA TERME ".repeat(5)}(fase 1;;;;`;
  const result = standardisePublicationTitle({
    input_text: source,
    input_field: "subject",
    profile: ALBO_PUBLICATION_STANDARDISATION_PROFILE,
  });

  assert.ok(result);
  assert.equal(result.display_title.length > 180, true);
  assert.equal(result.standardisation.status, "review_required");
  assert.deepEqual(result.standardisation.layout_flags, [
    "display_title_too_long",
  ]);
  assert.deepEqual(result.standardisation.review_reasons.sort(), [
    "inconsistent_casing",
    "repeated_punctuation",
    "unbalanced_delimiters",
  ]);
});

test("tightens only recognised Italian elisions", () => {
  const validElisions = standardisePublicationTitle({
    input_text: "L' AFFIDAMENTO DELL' INTERVENTO IN UN' AREA DI SANT' EUFEMIA",
    input_field: "subject",
    profile: ALBO_PUBLICATION_STANDARDISATION_PROFILE,
  });
  const apostropheFinalWords = standardisePublicationTitle({
    input_text:
      "ATTIVITA' DI SUPPORTO IN LOCALITA' CAPIZZAGLIE, GIA' ISTITUZIONALIZZATA DA UN PO' DI TEMPO",
    input_field: "subject",
    profile: ALBO_PUBLICATION_STANDARDISATION_PROFILE,
  });

  assert.equal(
    validElisions?.display_title,
    "L'affidamento dell'intervento in un'area di Sant'Eufemia",
  );
  assert.equal(
    apostropheFinalWords?.display_title,
    "Attivita' di supporto in localita' capizzaglie, gia' istituzionalizzata da un po' di tempo",
  );
});

test("keeps action connectors in the complete display title", () => {
  const result = standardisePublicationTitle({
    input_text: "PRESA D'ATTO DELL'ELENCO DEGLI OGGETTI RINVENUTI",
    input_field: "subject",
    profile: ALBO_PUBLICATION_STANDARDISATION_PROFILE,
  });

  assert.equal(
    result?.display_title,
    "Presa d'atto dell'elenco degli oggetti rinvenuti",
  );
  assert.equal(result?.action_id, "presa_atto");
  assert.equal(result?.action_label, "Presa d'atto");
});

test("treats a long well-formed title as a layout concern", () => {
  const result = standardisePublicationTitle({
    input_text: `APPROVAZIONE DEL ${"PROGETTO DI MANUTENZIONE ORDINARIA ".repeat(6)}`,
    input_field: "subject",
    profile: ALBO_PUBLICATION_STANDARDISATION_PROFILE,
  });

  assert.ok(result);
  assert.equal(result.standardisation.status, "standardised_automatically");
  assert.deepEqual(result.standardisation.layout_flags, [
    "display_title_too_long",
  ]);
  assert.deepEqual(result.standardisation.review_reasons, []);
});

test("builds accent-insensitive search text and returns null for missing titles", () => {
  assert.equal(
    normaliseSearchText("Mobilità, città e PNRR"),
    "mobilita citta e pnrr",
  );
  assert.equal(
    standardisePublicationTitle({
      input_text: "  ",
      input_field: "subject",
      profile: ALBO_PUBLICATION_STANDARDISATION_PROFILE,
    }),
    null,
  );
});

test("keeps both canonical and source-safe spellings searchable", () => {
  const result = standardisePublicationTitle({
    input_text: "ADESIONE AL C.I.P.",
    input_field: "subject",
    profile: ALBO_PUBLICATION_STANDARDISATION_PROFILE,
  });

  assert.ok(result);
  assert.match(result.search_text, /\bcip\b/u);
  assert.match(result.search_text, /\bc i p\b/u);
});

test("keeps reader-facing title fields idempotent", () => {
  const first = standardiseAlboPublicSubject(
    "PRESA D'ATTO DELL'INTERVENTO PNRR PER IL COMUNE DI LAMEZIA TERME",
  );
  assert.ok(first);

  const second = standardiseAlboPublicSubject(first.display_title);
  assert.ok(second);
  assert.deepEqual(
    {
      display_title: second.display_title,
      action_id: second.action_id,
      action_label: second.action_label,
    },
    {
      display_title: first.display_title,
      action_id: first.action_id,
      action_label: first.action_label,
    },
  );
});

test("describes the publication boundary as deterministic and post-safety", () => {
  assert.deepEqual(
    publicationStandardisationDescriptor(
      ALBO_PUBLICATION_STANDARDISATION_PROFILE,
    ),
    {
      schema_version: "publication-standardisation.v1",
      profile_id: "albo-public-title-it",
      profile_version: "2026-08-30.2",
      locale: "it-IT",
      stage: "after_public_safety_before_publication",
      execution: "deterministic_rules",
      input_values_preserved: true,
      generative_rewriting: false,
      ambiguous_cases: "review_required",
    },
  );
});
