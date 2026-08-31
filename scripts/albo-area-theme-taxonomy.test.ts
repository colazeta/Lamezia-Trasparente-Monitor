import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  classifyPublicationAreaTheme,
  type PublicationAreaThemeNullReason,
  type PublicationAreaThemeTaxonomy,
} from "@workspace/publication-standardisation";

import {
  ALBO_PUBLIC_AREA_THEME_TAXONOMY,
  classifyAlboPublicAreaTheme,
} from "./albo-area-theme-taxonomy";
import {
  ALBO_ACTION_REVIEWED_METRICS,
  ALBO_AREA_THEME_REVIEWED_METRICS,
  assessAlboNavigationFacetReadiness,
} from "./albo-navigation-facet-readiness";
import { standardiseAlboPublicSubject } from "./albo-publication-standardisation";

interface GoldFixture {
  fixture_id: string;
  source_record_id: string;
  subject: string;
  availability: "available" | "withheld_for_privacy" | "missing";
  expected_theme_id: string | null;
  expected_null_reason: PublicationAreaThemeNullReason | null;
  expected_action_id: string | null;
}

interface GoldSet {
  gold_set_id: string;
  version: string;
  taxonomy_id: string;
  taxonomy_version: string;
  records: GoldFixture[];
}

const goldSet = JSON.parse(
  readFileSync(
    fileURLToPath(
      new URL(
        "./fixtures/albo-area-theme-gold-set.2026-08-30.1.json",
        import.meta.url,
      ),
    ),
    "utf8",
  ),
) as GoldSet;

test("meets the versioned reader-navigation quality gates", () => {
  assert.equal(goldSet.taxonomy_id, ALBO_PUBLIC_AREA_THEME_TAXONOMY.id);
  assert.equal(
    goldSet.taxonomy_version,
    ALBO_PUBLIC_AREA_THEME_TAXONOMY.version,
  );

  const available = goldSet.records.filter(
    (fixture) => fixture.availability === "available",
  );
  const predictions = available.map((fixture) => ({
    fixture,
    assignment: classifyAlboPublicAreaTheme(
      fixture.subject,
      fixture.availability,
    ),
  }));
  const correct = predictions.filter(
    ({ fixture, assignment }) =>
      assignment.theme_id === fixture.expected_theme_id,
  );
  const highConfidence = predictions.filter(
    ({ assignment }) => assignment.confidence === "high",
  );
  const highConfidenceCorrect = highConfidence.filter(
    ({ fixture, assignment }) =>
      assignment.theme_id === fixture.expected_theme_id,
  );
  const fallback = predictions.filter(
    ({ assignment }) => assignment.theme_id === null,
  );

  assert.ok(correct.length / available.length >= 0.9, "theme accuracy < 90%");
  assert.ok(
    highConfidenceCorrect.length / highConfidence.length >= 0.97,
    "high-confidence precision < 97%",
  );
  assert.ok(fallback.length / available.length <= 0.1, "fallback > 10%");

  const actionPredictions = available.map((fixture) => ({
    fixture,
    action_id: standardiseAlboPublicSubject(fixture.subject)?.action_id ?? null,
  }));
  const assignedActions = actionPredictions.filter(
    ({ action_id }) => action_id !== null,
  );
  const correctAssignedActions = assignedActions.filter(
    ({ fixture, action_id }) => action_id === fixture.expected_action_id,
  );
  assert.equal(
    assignedActions.length,
    ALBO_ACTION_REVIEWED_METRICS.assigned_records,
  );
  assert.equal(
    correctAssignedActions.length,
    ALBO_ACTION_REVIEWED_METRICS.correct_assigned_records,
  );
  assert.equal(
    correctAssignedActions.length / assignedActions.length,
    ALBO_ACTION_REVIEWED_METRICS.precision,
  );
  assert.equal(
    correct.length,
    ALBO_AREA_THEME_REVIEWED_METRICS.correct_records,
  );
});

test("reproduces the versioned assessment from its immutable historical input", () => {
  const historical = JSON.parse(
    readFileSync(
      fileURLToPath(
        new URL(
          "./fixtures/albo-navigation-facet-input.2026-08-30.1.json",
          import.meta.url,
        ),
      ),
      "utf8",
    ),
  ) as {
    source_snapshot: string;
    source_retrieved_at: string;
    groups: Array<{
      count: number;
      public_visibility: string;
      act_category_id: string | null;
      sector_id: string | null;
      area_theme: Record<string, unknown> | null;
      action_id: string | null;
    }>;
  };
  // Only the fields read by the assessor are retained; live ingestion is not
  // required to keep the counts of this dated, reviewed assessment forever.
  const records = historical.groups.flatMap((group) => {
    assert.ok(Number.isInteger(group.count) && group.count > 0);
    return Array.from({ length: group.count }, () => ({
      public_visibility: group.public_visibility,
      classification: {
        act_category: { id: group.act_category_id },
        sector: { id: group.sector_id },
      },
      presentation: {
        area_theme: group.area_theme,
        action_id: group.action_id,
      },
    }));
  });
  const readiness = assessAlboNavigationFacetReadiness(records);
  const persistedReadiness = JSON.parse(
    readFileSync(
      fileURLToPath(
        new URL(
          "./fixtures/albo-navigation-facet-readiness.2026-08-30.1.json",
          import.meta.url,
        ),
      ),
      "utf8",
    ),
  ) as Record<string, unknown>;

  assert.deepEqual(readiness.corpus, {
    visible_records: 74,
    publishable_records: 58,
  });
  assert.equal(readiness.facets.act_family.contract_status, "missing");
  assert.equal(
    readiness.facets.act_family.proxy_field,
    "classification.act_category",
  );
  assert.equal(readiness.facets.act_family.proxy_populated_records, 69);
  assert.equal(readiness.facets.act_family.proxy_coverage_pass, false);
  assert.equal(readiness.facets.issuer_organ.contract_status, "missing");
  assert.equal(
    readiness.facets.issuer_organ.proxy_field,
    "classification.sector",
  );
  assert.equal(readiness.facets.issuer_organ.proxy_populated_records, 68);
  assert.equal(readiness.facets.issuer_organ.proxy_coverage_pass, false);

  assert.equal(readiness.facets.area_theme.accuracy_pass, true);
  assert.equal(readiness.facets.area_theme.materialised_records, 0);
  assert.equal(readiness.facets.area_theme.materialisation_pass, false);
  assert.equal(readiness.facets.action.assigned_records, 3);
  assert.equal(readiness.facets.action.coverage_pass, false);
  assert.equal(readiness.facets.action.precision_pass, true);
  assert.deepEqual(readiness.facets.action.option_counts, {
    approvazione: 2,
    presa_atto: 1,
  });
  assert.equal(readiness.facets.action.minimum_per_option_pass, false);

  assert.deepEqual(
    Object.values(readiness.facets).map((facet) => facet.public_filter_ready),
    [false, false, false, false],
  );
  assert.deepEqual(persistedReadiness, {
    source_snapshot: historical.source_snapshot,
    source_retrieved_at: historical.source_retrieved_at,
    ...readiness,
  });
});

test("validates current snapshot gates without freezing ingestion totals", () => {
  const latest = JSON.parse(
    readFileSync(
      fileURLToPath(
        new URL("../data/public/albo/latest.json", import.meta.url),
      ),
      "utf8",
    ),
  ) as { items: Array<Record<string, unknown>> };
  const readiness = assessAlboNavigationFacetReadiness(latest.items);
  const visible = latest.items.filter(
    (record) => record.public_visibility !== "do_not_publish",
  );
  const publishable = visible.filter(
    (record) => record.public_visibility === "publishable",
  );

  assert.ok(
    visible.length > 0,
    "the current public snapshot must not be empty",
  );
  assert.deepEqual(readiness.corpus, {
    visible_records: visible.length,
    publishable_records: publishable.length,
  });
  for (const facet of [
    readiness.facets.act_family,
    readiness.facets.issuer_organ,
  ]) {
    assert.equal(facet.contract_status, "missing");
    assert.equal(facet.public_filter_ready, false);
    assert.ok(facet.proxy_populated_records <= visible.length);
  }

  const areaTheme = readiness.facets.area_theme;
  assert.equal(areaTheme.eligible_records, publishable.length);
  assert.ok(areaTheme.materialised_records <= publishable.length);
  assert.equal(
    areaTheme.public_filter_ready,
    areaTheme.materialisation_pass &&
      areaTheme.accuracy_pass &&
      areaTheme.high_confidence_precision_pass &&
      areaTheme.reviewed_fallback_rate_pass &&
      areaTheme.corpus_fallback_rate_pass,
  );
  const action = readiness.facets.action;
  assert.equal(action.eligible_records, publishable.length);
  assert.ok(action.assigned_records <= publishable.length);
  assert.equal(
    action.assigned_records,
    Object.values(action.option_counts).reduce((sum, count) => sum + count, 0),
  );
  assert.equal(
    action.public_filter_ready,
    action.coverage_pass &&
      action.precision_pass &&
      action.minimum_per_option_pass,
  );
});

test("does not promote coverage proxies into missing facet contracts", () => {
  const fullyPopulatedProxies = Array.from({ length: 100 }, () => ({
    public_visibility: "publishable",
    classification: {
      act_category: { id: "deliberazioni" },
      sector: { id: "governo_territorio" },
    },
    presentation: {
      area_theme: { theme_id: "territorio_edilizia" },
      action_id: "approvazione",
    },
  }));
  const readiness = assessAlboNavigationFacetReadiness(fullyPopulatedProxies);

  assert.equal(readiness.facets.act_family.proxy_coverage_pass, true);
  assert.equal(readiness.facets.act_family.public_filter_ready, false);
  assert.equal(readiness.facets.issuer_organ.proxy_coverage_pass, true);
  assert.equal(readiness.facets.issuer_organ.public_filter_ready, false);
});

test("matches every reviewed gold fixture and preserves distinct null reasons", () => {
  for (const fixture of goldSet.records) {
    const assignment = classifyAlboPublicAreaTheme(
      fixture.subject,
      fixture.availability,
    );
    assert.equal(
      assignment.theme_id,
      fixture.expected_theme_id,
      fixture.fixture_id,
    );
    assert.equal(
      assignment.null_reason,
      fixture.expected_null_reason,
      fixture.fixture_id,
    );
  }

  assert.equal(
    classifyAlboPublicAreaTheme(null, "missing").null_reason,
    "input_missing",
  );
  const missingPresentation = standardiseAlboPublicSubject(null, {
    area_theme_availability: "missing",
  });
  assert.equal(
    missingPresentation?.display_title,
    "Oggetto non disponibile nella fonte acquisita.",
  );
  assert.equal(missingPresentation?.standardisation.status, "review_required");
  assert.ok(
    missingPresentation?.standardisation.review_reasons.includes(
      "missing_public_subject",
    ),
  );
  assert.equal(missingPresentation?.area_theme.null_reason, "input_missing");
  assert.equal(
    classifyAlboPublicAreaTheme("Comunicazione istituzionale generica")
      .null_reason,
    "not_classified",
  );
});

test("does not derive an area theme from text withheld for privacy", () => {
  const assignment = classifyAlboPublicAreaTheme(
    "Modifica temporanea della circolazione stradale e scuola dell'infanzia",
    "withheld_for_privacy",
  );
  assert.equal(assignment.theme_id, null);
  assert.equal(assignment.rule_id, null);
  assert.deepEqual(assignment.evidence, []);
  assert.equal(assignment.null_reason, "input_withheld_for_privacy");

  const presentation = standardiseAlboPublicSubject(
    "Metadato minimo; oggetto non ripubblicato per prudenza privacy.",
    { area_theme_availability: "withheld_for_privacy" },
  );
  assert.equal(presentation?.area_theme.theme_id, null);
  assert.equal(
    presentation?.area_theme.null_reason,
    "input_withheld_for_privacy",
  );
});

test("is deterministic and idempotent across all reviewed public titles", () => {
  for (const fixture of goldSet.records) {
    const first = classifyAlboPublicAreaTheme(
      fixture.subject,
      fixture.availability,
    );
    const second = classifyAlboPublicAreaTheme(
      fixture.subject,
      fixture.availability,
    );
    assert.deepEqual(second, first, fixture.fixture_id);

    if (fixture.availability === "available") {
      const presentation = standardiseAlboPublicSubject(fixture.subject);
      const repeated = presentation
        ? standardiseAlboPublicSubject(presentation.display_title)
        : null;
      assert.equal(
        repeated?.area_theme.theme_id,
        presentation?.area_theme.theme_id,
        fixture.fixture_id,
      );
    }
  }
});

test("keeps stable ids when reader-facing labels change", () => {
  const renamed = {
    ...ALBO_PUBLIC_AREA_THEME_TAXONOMY,
    version: "test-label-change",
    themes: ALBO_PUBLIC_AREA_THEME_TAXONOMY.themes.map((theme) =>
      theme.id === "mobilita_sicurezza"
        ? { ...theme, label: "Viabilità e mobilità" }
        : theme,
    ),
  } satisfies PublicationAreaThemeTaxonomy;
  const assignment = classifyPublicationAreaTheme({
    taxonomy: renamed,
    texts: [{ field: "subject", value: "Circolazione stradale" }],
  });
  assert.equal(assignment.theme_id, "mobilita_sicurezza");
  assert.equal(assignment.theme_label, "Viabilità e mobilità");
});

test("falls back on a real ambiguity instead of choosing by rule order", () => {
  const ambiguousTaxonomy = {
    id: "ambiguous-test",
    version: "1",
    locale: "it-IT",
    themes: [
      { id: "one", label: "Uno", description: "Tema uno" },
      { id: "two", label: "Due", description: "Tema due" },
    ],
    rules: [
      {
        id: "rule-one",
        theme_id: "one",
        confidence: "high",
        priority: 1,
        match: { any: ["titolo ambiguo"] },
      },
      {
        id: "rule-two",
        theme_id: "two",
        confidence: "high",
        priority: 1,
        match: { any: ["titolo ambiguo"] },
      },
    ],
  } as const satisfies PublicationAreaThemeTaxonomy;
  const assignment = classifyPublicationAreaTheme({
    taxonomy: ambiguousTaxonomy,
    texts: [{ field: "subject", value: "Titolo ambiguo" }],
  });
  assert.equal(assignment.theme_id, null);
  assert.equal(assignment.null_reason, "ambiguous_match");
  assert.deepEqual(assignment.evidence.map((entry) => entry.rule_id).sort(), [
    "rule-one",
    "rule-two",
  ]);
});

test("records manual overrides without erasing automatic evidence", () => {
  const assignment = classifyPublicationAreaTheme({
    taxonomy: ALBO_PUBLIC_AREA_THEME_TAXONOMY,
    texts: [
      {
        field: "subject",
        value: "Modifica temporanea della circolazione stradale",
      },
    ],
    override: {
      id: "review-2026-001",
      theme_id: "cultura_sport_turismo",
      confidence: "high",
      rationale: "Fixture di tracciamento dell'override editoriale.",
    },
  });
  assert.equal(assignment.basis, "manual_override");
  assert.equal(assignment.theme_id, "cultura_sport_turismo");
  assert.equal(assignment.rule_id, "mobility-circulation");
  assert.equal(assignment.override?.previous_theme_id, "mobilita_sicurezza");
  assert.equal(assignment.override?.previous_rule_id, "mobility-circulation");
  assert.ok(assignment.evidence.length > 0);
});

test("does not conflate area theme with action, act type, family or issuer", () => {
  const presentation = standardiseAlboPublicSubject(
    "APPROVAZIONE DEL PIANO DELLA MOBILITA",
  );
  assert.equal(presentation?.action_id, "approvazione");
  assert.equal(presentation?.area_theme.theme_id, "mobilita_sicurezza");
  assert.equal("act_type" in (presentation ?? {}), false);
  assert.equal("act_family" in (presentation ?? {}), false);
  assert.equal("issuer" in (presentation ?? {}), false);
  assert.equal("macrotema" in (presentation ?? {}), false);
});