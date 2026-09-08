import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  numeric,
  date,
  timestamp,
  jsonb,
  integer,
  check,
  index,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { canonicalSubjectsTable } from "./canonicalIdentity";
import { coreAssertionsTable } from "./assertions";

export const projectsTable = pgTable(
  "project_projects",
  {
    id: uuid("id")
      .primaryKey()
      .references(() => canonicalSubjectsTable.subjectId, {
        onDelete: "restrict",
      }),
    title: text("title"),
    mission: text("mission"),
    component: text("component"),
    investment: text("investment"),
    intervention: text("intervention"),
    programmeHolder: text("programme_holder"),
    implementer: text("implementer"),
    financedAmount: numeric("financed_amount", { precision: 14, scale: 2 }),
    executionStatus: text("execution_status"),
    startDate: date("start_date"),
    endDate: date("end_date"),
    publishedAt: date("published_at"),
    sourceUrl: text("source_url"),
    attachments: jsonb("attachments"),
    // Different measures and lifecycles: never replace execution status or the
    // municipality's financed amount with CUP status or OpenCUP total cost.
    cupStatus: text("cup_status"),
    opencupTotalCost: numeric("opencup_total_cost", {
      precision: 14,
      scale: 2,
    }),
    opencupPublicFunding: numeric("opencup_public_funding", {
      precision: 14,
      scale: 2,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("project_projects_mission_idx").on(t.mission),
    index("project_projects_execution_status_idx").on(t.executionStatus),
    check(
      "project_projects_amounts",
      sql`(${t.financedAmount} IS NULL OR ${t.financedAmount} >= 0) AND (${t.opencupTotalCost} IS NULL OR ${t.opencupTotalCost} >= 0) AND (${t.opencupPublicFunding} IS NULL OR ${t.opencupPublicFunding} >= 0)`,
    ),
    check(
      "project_projects_attachments",
      sql`${t.attachments} IS NULL OR jsonb_typeof(${t.attachments}) = 'array'`,
    ),
  ],
);

export const projectIdentifiersTable = pgTable(
  "project_identifiers",
  {
    id: uuid("id").primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "restrict" }),
    scheme: text("scheme").notNull(),
    issuer: text("issuer").notNull(),
    value: text("value").notNull(),
    qualification: text("qualification").notNull(),
    evidenceAssertionId: uuid("evidence_assertion_id")
      .notNull()
      .references(() => coreAssertionsTable.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("project_identifiers_qualified_value_uq").on(
      t.scheme,
      t.issuer,
      t.value,
    ),
    index("project_identifiers_project_idx").on(t.projectId),
    index("project_identifiers_evidence_idx").on(t.evidenceAssertionId),
    check(
      "project_identifiers_id_v7",
      sql`${t.id}::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'`,
    ),
    check(
      "project_identifiers_cup",
      sql`${t.scheme} = 'CUP' AND ${t.issuer} = 'it.dipe' AND ${t.value} ~ '^[A-Z0-9]{15}$'`,
    ),
    check(
      "project_identifiers_qualification",
      sql`${t.qualification} = 'source_reported_format_checked'`,
    ),
  ],
);

export const projectFieldResolutionsTable = pgTable(
  "project_field_resolutions",
  {
    id: uuid("id").primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "restrict" }),
    field: text("field").notNull(),
    selectedAssertionId: uuid("selected_assertion_id")
      .notNull()
      .references(() => coreAssertionsTable.id, { onDelete: "restrict" }),
    alternativeCount: integer("alternative_count").notNull(),
    decisionRule: text("decision_rule").notNull(),
    resolverVersion: text("resolver_version").notNull(),
    validFrom: timestamp("valid_from", { withTimezone: true })
      .notNull()
      .defaultNow(),
    validTo: timestamp("valid_to", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("project_field_resolutions_current_uq")
      .on(t.projectId, t.field)
      .where(sql`${t.validTo} IS NULL`),
    index("project_field_resolutions_assertion_idx").on(t.selectedAssertionId),
    index("project_field_resolutions_history_idx").on(
      t.projectId,
      t.field,
      t.validFrom,
    ),
    check(
      "project_field_resolutions_id_v7",
      sql`${t.id}::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'`,
    ),
    check(
      "project_field_resolutions_field",
      sql`${t.field} IN ('title','mission','component','investment','intervention','programme_holder','implementer','financed_amount','execution_status','start_date','end_date','published_at','source_url','attachments','cup_status','opencup_total_cost','opencup_public_funding')`,
    ),
    check("project_field_resolutions_count", sql`${t.alternativeCount} >= 0`),
    check(
      "project_field_resolutions_period",
      sql`${t.validTo} IS NULL OR ${t.validTo} >= ${t.validFrom}`,
    ),
  ],
);
