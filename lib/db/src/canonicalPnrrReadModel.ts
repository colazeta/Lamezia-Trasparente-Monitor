import { getTableColumns, sql } from "drizzle-orm";
import { attuazionePnrrProjectsTable as legacy } from "./schema/attuazionePnrr";
import {
  projectsTable as project,
  projectIdentifiersTable as identifiers,
} from "./schema/projects";
import { legacySubjectMapTable as bridge } from "./schema/canonicalIdentity";

// During dual operation an older canonical decision must never be combined
// with a newly edited legacy CUP or payload. Reconciliation exposes that drift;
// the public compatibility reader uses the entire legacy row until resolved.
export const canonicalPnrrJoinCondition = sql`${project.id} = ${bridge.subjectId}
  AND EXISTS(SELECT 1 FROM ${identifiers} WHERE ${identifiers.projectId}=${project.id}
    AND ${identifiers.scheme}='CUP' AND ${identifiers.issuer}='it.dipe' AND ${identifiers.value}=upper(btrim(${legacy.cup})))
  AND (${project.title},${project.mission},${project.component},${project.investment},${project.intervention},${project.programmeHolder},${project.implementer},${project.financedAmount},${project.executionStatus},${project.startDate},${project.endDate},${project.publishedAt},${project.sourceUrl},${project.attachments})
  IS NOT DISTINCT FROM
    (${legacy.title},${legacy.mission},${legacy.component},${legacy.investment},${legacy.intervention},${legacy.holder},${legacy.attuatore},${legacy.importoFinanziato},${legacy.status},(${legacy.startDate} AT TIME ZONE 'UTC')::date,(${legacy.endDate} AT TIME ZONE 'UTC')::date,(${legacy.publishedAt} AT TIME ZONE 'UTC')::date,${legacy.url},${legacy.attachments})`;

// Stable public API shape and legacy numeric IDs during the additive cutover.
// Resolve filters, sorting and returned fields from the same SQL expressions.
// Unresolved legacy records remain visible instead of being dropped by a JOIN.
export const canonicalPnrrReadColumns = {
  ...getTableColumns(legacy),
  title:
    sql<string>`CASE WHEN ${project.id} IS NULL THEN ${legacy.title} ELSE ${project.title} END`.mapWith(
      legacy.title,
    ),
  mission: sql<
    string | null
  >`CASE WHEN ${project.id} IS NULL THEN ${legacy.mission} ELSE ${project.mission} END`.mapWith(
    legacy.mission,
  ),
  component: sql<
    string | null
  >`CASE WHEN ${project.id} IS NULL THEN ${legacy.component} ELSE ${project.component} END`.mapWith(
    legacy.component,
  ),
  investment: sql<
    string | null
  >`CASE WHEN ${project.id} IS NULL THEN ${legacy.investment} ELSE ${project.investment} END`.mapWith(
    legacy.investment,
  ),
  intervention: sql<
    string | null
  >`CASE WHEN ${project.id} IS NULL THEN ${legacy.intervention} ELSE ${project.intervention} END`.mapWith(
    legacy.intervention,
  ),
  holder: sql<
    string | null
  >`CASE WHEN ${project.id} IS NULL THEN ${legacy.holder} ELSE ${project.programmeHolder} END`.mapWith(
    legacy.holder,
  ),
  attuatore: sql<
    string | null
  >`CASE WHEN ${project.id} IS NULL THEN ${legacy.attuatore} ELSE ${project.implementer} END`.mapWith(
    legacy.attuatore,
  ),
  importoFinanziato: sql<
    string | null
  >`CASE WHEN ${project.id} IS NULL THEN ${legacy.importoFinanziato} ELSE ${project.financedAmount} END`.mapWith(
    legacy.importoFinanziato,
  ),
  status: sql<
    string | null
  >`CASE WHEN ${project.id} IS NULL THEN ${legacy.status} ELSE ${project.executionStatus} END`.mapWith(
    legacy.status,
  ),
  startDate:
    sql<Date | null>`CASE WHEN ${project.id} IS NULL THEN ${legacy.startDate} ELSE ${project.startDate}::timestamp AT TIME ZONE 'UTC' END`.mapWith(
      legacy.startDate,
    ),
  endDate:
    sql<Date | null>`CASE WHEN ${project.id} IS NULL THEN ${legacy.endDate} ELSE ${project.endDate}::timestamp AT TIME ZONE 'UTC' END`.mapWith(
      legacy.endDate,
    ),
  publishedAt:
    sql<Date | null>`CASE WHEN ${project.id} IS NULL THEN ${legacy.publishedAt} ELSE ${project.publishedAt}::timestamp AT TIME ZONE 'UTC' END`.mapWith(
      legacy.publishedAt,
    ),
  url: sql<string>`CASE WHEN ${project.id} IS NULL THEN ${legacy.url} ELSE ${project.sourceUrl} END`.mapWith(
    legacy.url,
  ),
  attachments: sql<
    typeof legacy.$inferSelect.attachments
  >`CASE WHEN ${project.id} IS NULL THEN ${legacy.attachments} ELSE ${project.attachments} END`.mapWith(
    legacy.attachments,
  ),
};
