import fs from "node:fs";
import path from "node:path";

import { getTableColumns } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { publicationsTable, type Publication } from "@workspace/db/schema";
import {
  ALBO_PUBLIC_SAFETY_POLICY_VERSION,
  isPublicActSafetyAttestation,
  makeAlboPublicSafetyDecision,
  projectPublicAct,
} from "@workspace/publication-standardisation/public-act";
import {
  attestPublicationAtIngestion,
  projectDatabasePublication,
  type PublicationSafetySource,
} from "./publicActProjection";

const EVALUATED_AT = new Date("2026-08-30T09:00:00.000Z");

function source(
  overrides: Partial<PublicationSafetySource> = {},
): PublicationSafetySource {
  return {
    progressivo: "2026/765",
    tipologia: "DELIBERAZIONE DI GIUNTA",
    category: "delibera",
    subcategory: "giunta",
    provenienza: "Segreteria generale",
    oggetto: "APPROVAZIONE DEL PROGRAMMA PNRR DEL COMUNE",
    dataAtto: new Date("2026-08-29T12:00:00.000Z"),
    pubStart: new Date("2026-08-30T12:00:00.000Z"),
    pubEnd: new Date("2026-09-15T12:00:00.000Z"),
    numRegSet: "765",
    numRegGen: "1765",
    cups: [],
    pnrrMission: null,
    isPnrr: false,
    ...overrides,
  };
}

function publication(
  canonical: PublicationSafetySource,
  publicSafetyDecision: Publication["publicSafetyDecision"],
  canary = "",
): Publication {
  return {
    id: 765,
    ...canonical,
    tipologia: canonical.tipologia ?? "ALTRO",
    oggetto: canonical.oggetto ?? "",
    dataAtto: canonical.dataAtto as Date | null,
    pubStart: canonical.pubStart as Date | null,
    pubEnd: canonical.pubEnd as Date | null,
    cups: [...canonical.cups],
    attachments: [
      {
        name: `${canary || "atto"}.pdf`,
        tipo: "P",
        officialUrl: `https://example.invalid/${canary || "atto"}.pdf`,
        storagePath: `/api/storage/public-objects/albo/${canary || "atto"}.pdf`,
        contentType: "application/pdf",
        size: 123,
      },
    ],
    detailFetchedAt: EVALUATED_AT,
    markdownText: `# ${canary || "Atto"}`,
    markdownSource: `${canary || "atto"}.pdf`,
    markdownExtractedAt: EVALUATED_AT,
    brief: `Sintesi ${canary}`,
    briefManual: false,
    briefGeneratedAt: EVALUATED_AT,
    publicSafetyDecision,
    macrotema: canary || "fondi_europei_pnrr",
    macrotemanManual: false,
    isNew: true,
    firstSeenAt: EVALUATED_AT,
    lastSeenAt: EVALUATED_AT,
  };
}

describe("persisted public-safety boundary", () => {
  it("attests a new ingestion and keeps an unchanged attestation stable", () => {
    const canonical = source();
    const first = attestPublicationAtIngestion({
      source: canonical,
      evaluatedAt: EVALUATED_AT,
      previous: null,
    });
    const second = attestPublicationAtIngestion({
      source: canonical,
      evaluatedAt: new Date("2026-08-31T09:00:00.000Z"),
      previous: first,
    });

    expect(isPublicActSafetyAttestation(first)).toBe(true);
    expect(first.presentation?.display_title).toBe(
      "Approvazione del programma PNRR del comune",
    );
    expect(second).toBe(first);
  });

  it("matches the snapshot projection without depending on the DB id", () => {
    const canonical = source();
    const attestation = attestPublicationAtIngestion({
      source: canonical,
      evaluatedAt: EVALUATED_AT,
      previous: null,
    });
    const databaseProjection = projectDatabasePublication(
      publication(canonical, attestation),
    );
    const snapshotProjection = projectPublicAct({
      id: "snapshot-row",
      progressivo: canonical.progressivo,
      tipologia: canonical.tipologia,
      category: canonical.category,
      subcategory: canonical.subcategory,
      provenienza: canonical.provenienza,
      oggetto: canonical.oggetto,
      data_atto: (canonical.dataAtto as Date).toISOString(),
      publication_start: (canonical.pubStart as Date).toISOString(),
      publication_end: (canonical.pubEnd as Date).toISOString(),
      registry_section_number: canonical.numRegSet,
      registry_general_number: canonical.numRegGen,
      cups: canonical.cups,
      pnrr_mission: canonical.pnrrMission,
      is_pnrr: canonical.isPnrr,
      is_new: false,
      first_seen_at: EVALUATED_AT.toISOString(),
      macrotema: "fondi_europei_pnrr",
      decision: attestation.decision,
    });

    expect(databaseProjection?.public_id).toBe(snapshotProjection?.public_id);
    expect(databaseProjection?.presentation).toEqual(
      snapshotProjection?.presentation,
    );
  });

  it("does not make a stale restrictive decision more permissive", () => {
    const canonical = source();
    const initial = attestPublicationAtIngestion({
      source: canonical,
      evaluatedAt: EVALUATED_AT,
      previous: null,
    });
    const restrictive = makeAlboPublicSafetyDecision(
      "metadata_only",
      "high",
      "Revisione prudenziale precedente.",
    );
    expect(restrictive).not.toBeNull();
    const stale = {
      ...initial,
      decision: {
        ...restrictive!,
        policy_version: "2025-legacy",
      },
    };

    const renewed = attestPublicationAtIngestion({
      source: canonical,
      evaluatedAt: new Date("2026-08-31T09:00:00.000Z"),
      previous: stale,
    });

    expect(renewed.decision.policy_version).toBe(
      ALBO_PUBLIC_SAFETY_POLICY_VERSION,
    );
    expect(renewed.decision.public_visibility).toBe("metadata_only");
    expect(renewed.presentation?.display_title).not.toContain(
      canonical.oggetto,
    );
  });

  it("preserves a stale restrictive decision even when the source changed", () => {
    const initialSource = source();
    const initial = attestPublicationAtIngestion({
      source: initialSource,
      evaluatedAt: EVALUATED_AT,
      previous: null,
    });
    const restrictive = makeAlboPublicSafetyDecision(
      "metadata_only",
      "high",
      "Revisione prudenziale precedente.",
    );
    expect(restrictive).not.toBeNull();
    const stale = {
      ...initial,
      decision: {
        ...restrictive!,
        policy_version: "2025-legacy",
      },
    };

    const renewed = attestPublicationAtIngestion({
      source: source({ oggetto: "OGGETTO CAMBIATO E NON SENSIBILE" }),
      evaluatedAt: new Date("2026-08-31T09:00:00.000Z"),
      previous: stale,
    });

    expect(renewed.decision.public_visibility).toBe("metadata_only");
    expect(renewed.presentation?.display_title).toBe(
      "Metadato minimo; oggetto non ripubblicato per prudenza privacy.",
    );
  });

  it("does not treat malformed legacy JSON as a new record", () => {
    const renewed = attestPublicationAtIngestion({
      source: source({ oggetto: "OGGETTO ORDINARIO" }),
      evaluatedAt: EVALUATED_AT,
      previous: "legacy-corrotto",
    });

    expect(renewed.decision.public_visibility).toBe("metadata_only");
    expect(renewed.decision.privacy_risk).toBe("high");
  });

  it("accepts a semantically equal presentation after a jsonb key reorder", () => {
    const canonical = source();
    const attestation = attestPublicationAtIngestion({
      source: canonical,
      evaluatedAt: EVALUATED_AT,
      previous: null,
    });
    const presentation = attestation.presentation!;
    const reordered = {
      standardisation: {
        review_reasons: presentation.standardisation.review_reasons,
        layout_flags: presentation.standardisation.layout_flags,
        transformations: presentation.standardisation.transformations,
        status: presentation.standardisation.status,
        input_field_preserved:
          presentation.standardisation.input_field_preserved,
        input_field: presentation.standardisation.input_field,
        profile_version: presentation.standardisation.profile_version,
        profile_id: presentation.standardisation.profile_id,
        schema_version: presentation.standardisation.schema_version,
      },
      area_theme: presentation.area_theme,
      search_text: presentation.search_text,
      action_label: presentation.action_label,
      action_id: presentation.action_id,
      display_title: presentation.display_title,
    };
    const jsonbRoundTrip = {
      ...attestation,
      presentation: reordered,
    } as typeof attestation;

    const projected = projectDatabasePublication(
      publication(canonical, jsonbRoundTrip),
    );

    expect(projected?.public_safety.attestation_status).toBe("valid");
    expect(projected?.public_safety.attestation_reason).toBeNull();
  });

  it("repairs an attestation that lacks the current area-theme contract", () => {
    const canonical = source();
    const initial = attestPublicationAtIngestion({
      source: canonical,
      evaluatedAt: EVALUATED_AT,
      previous: null,
    });
    const { area_theme: _removed, ...legacyPresentation } =
      initial.presentation!;
    const legacy = {
      ...initial,
      presentation: legacyPresentation,
    };

    const repaired = attestPublicationAtIngestion({
      source: canonical,
      evaluatedAt: new Date("2026-08-31T09:00:00.000Z"),
      previous: legacy,
    });

    expect(repaired.presentation?.area_theme.taxonomy_version).toBe(
      initial.presentation?.area_theme.taxonomy_version,
    );
    expect(repaired.decision).toEqual(initial.decision);
  });

  it("projects a legacy null record as generic metadata without raw canary", () => {
    const canary = "CANARY-LEGACY-765";
    const projected = projectDatabasePublication(
      publication(
        source({
          oggetto: `CONTENZIOSO ${canary}`,
          provenienza: `Ufficio ${canary}`,
          numRegSet: canary,
          numRegGen: canary,
        }),
        null,
        canary,
      ),
    );

    expect(projected).not.toBeNull();
    expect(projected?.public_id).toBe("albo-2026-765");
    expect(projected?.public_safety.attestation_status).toBe("legacy_missing");
    expect(projected?.public_safety.attestation_reason).toBe("missing");
    expect(projected?.attachments).toEqual([]);
    expect(projected?.markdown).toBeNull();
    expect(JSON.stringify(projected)).not.toContain(canary);
  });

  it("keeps a minimised attested canary out of every projected field", () => {
    const canary = "CANARY-ATTESTED-765";
    const canonical = source({
      oggetto: `CONTENZIOSO ${canary}`,
      provenienza: `Ufficio ${canary}`,
      subcategory: canary,
    });
    const attestation = attestPublicationAtIngestion({
      source: canonical,
      evaluatedAt: EVALUATED_AT,
      previous: null,
    });
    const projected = projectDatabasePublication(
      publication(canonical, attestation, canary),
    );

    expect(projected?.public_safety.attestation_status).toBe("valid");
    expect(projected?.public_safety.public_visibility).toBe(
      "publishable_with_minimisation",
    );
    expect(JSON.stringify(projected)).not.toContain(canary);
  });

  it("fails closed when source changes after the attestation", () => {
    const attestedSource = source();
    const attestation = attestPublicationAtIngestion({
      source: attestedSource,
      evaluatedAt: EVALUATED_AT,
      previous: null,
    });
    const canary = "CANARY-SOURCE-CHANGED-765";
    const changed = source({ oggetto: canary, provenienza: canary });
    const projected = projectDatabasePublication(
      publication(changed, attestation, canary),
    );

    expect(projected?.public_safety.attestation_status).toBe("source_changed");
    expect(projected?.public_safety.attestation_reason).toBe("source_changed");
    expect(JSON.stringify(projected)).not.toContain(canary);
  });

  it("never loosens a prior exclusion when the source changes", () => {
    const excluded = attestPublicationAtIngestion({
      source: source({ oggetto: "SERVIZIO DI TUTELA PER MINORI" }),
      evaluatedAt: EVALUATED_AT,
      previous: null,
    });

    const renewed = attestPublicationAtIngestion({
      source: source({ oggetto: "OGGETTO ORDINARIO" }),
      evaluatedAt: new Date("2026-08-31T09:00:00.000Z"),
      previous: excluded,
    });

    expect(renewed.decision.public_visibility).toBe("do_not_publish");
    expect(renewed.presentation).toBeNull();
  });

  it("reclassifies current source before repairing an invalid presentation", () => {
    const initial = attestPublicationAtIngestion({
      source: source({ oggetto: "OGGETTO ORDINARIO" }),
      evaluatedAt: EVALUATED_AT,
      previous: null,
    });
    const invalidPresentation = { ...initial, presentation: {} };

    const repaired = attestPublicationAtIngestion({
      source: source({ oggetto: "SERVIZIO DI TUTELA PER MINORI" }),
      evaluatedAt: new Date("2026-08-31T09:00:00.000Z"),
      previous: invalidPresentation,
    });

    expect(repaired.decision.public_visibility).toBe("do_not_publish");
    expect(repaired.presentation).toBeNull();
  });

  it("preserves a structural exclusion from an otherwise invalid envelope", () => {
    const excluded = attestPublicationAtIngestion({
      source: source({ oggetto: "SERVIZIO DI TUTELA PER MINORI" }),
      evaluatedAt: EVALUATED_AT,
      previous: null,
    });
    const invalidEnvelope = { ...excluded, decision_source: "sorgente-non-valida" };

    const repaired = attestPublicationAtIngestion({
      source: source({ oggetto: "OGGETTO ORDINARIO" }),
      evaluatedAt: new Date("2026-08-31T09:00:00.000Z"),
      previous: invalidEnvelope,
    });

    expect(repaired.decision.public_visibility).toBe("do_not_publish");
    expect(repaired.presentation).toBeNull();
  });

  it("fails closed at request time for a stale persisted policy", () => {
    const canary = "CANARY-STALE-POLICY-765";
    const canonical = source({ oggetto: canary, provenienza: canary });
    const current = attestPublicationAtIngestion({
      source: canonical,
      evaluatedAt: EVALUATED_AT,
      previous: null,
    });
    const stale = {
      ...current,
      decision: { ...current.decision, policy_version: "stale-policy" },
    } as Publication["publicSafetyDecision"];
    const projected = projectDatabasePublication(
      publication(canonical, stale, canary),
    );

    expect(projected?.public_safety.attestation_status).toBe("stale");
    expect(projected?.public_safety.attestation_reason).toBe("stale_policy");
    expect(JSON.stringify(projected)).not.toContain(canary);
  });

  it("never re-enumerates a structurally excluded prior decision", () => {
    const excludedSource = source({
      oggetto: "SERVIZIO DI TUTELA PER MINORI",
    });
    const excluded = attestPublicationAtIngestion({
      source: excludedSource,
      evaluatedAt: EVALUATED_AT,
      previous: null,
    });
    expect(excluded.decision.public_visibility).toBe("do_not_publish");

    const stale = {
      ...excluded,
      decision: { ...excluded.decision, policy_version: "stale-policy" },
    } as Publication["publicSafetyDecision"];
    expect(
      projectDatabasePublication(publication(excludedSource, stale)),
    ).toBeNull();

    const changedSource = source({ oggetto: "OGGETTO ORDINARIO" });
    expect(
      projectDatabasePublication(publication(changedSource, excluded)),
    ).toBeNull();

    const legacyIdentifiers = {
      ...excluded,
      decision: {
        ...excluded.decision,
        policy_id: "legacy-policy",
        standardisation_profile_id: "legacy-profile",
      },
    };
    const renewed = attestPublicationAtIngestion({
      source: changedSource,
      evaluatedAt: new Date("2026-08-31T09:00:00.000Z"),
      previous: legacyIdentifiers,
    });
    expect(renewed.decision.public_visibility).toBe("do_not_publish");
  });

  it("keeps migration and typed schema in sync", () => {
    const columns = getTableColumns(publicationsTable);
    expect(columns.publicSafetyDecision.name).toBe("public_safety_decision");
    const migration = fs.readFileSync(
      path.resolve(
        import.meta.dirname,
        "../../../../lib/db/migrations/0012_publications_public_safety_decision.sql",
      ),
      "utf8",
    );
    expect(migration).toContain('ADD COLUMN "public_safety_decision" jsonb');
    expect(migration.toUpperCase()).not.toContain("DROP ");
  });
});
