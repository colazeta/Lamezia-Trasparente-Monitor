import { sql } from "drizzle-orm";
import { db } from "./client";
import { officialsTable } from "./schema";
import {
  CURRENT_INSTITUTIONAL_OFFICIALS,
  INSTITUTIONAL_POLITICI_SOURCE,
  type InstitutionalOfficialSeed,
} from "./institutional-officials-data";

export * from "./institutional-officials-data";

function profileNote(official: InstitutionalOfficialSeed): string {
  return [
    `Anagrafica minima: ${official.name}, ${official.roleTitle}.`,
    `Scheda personale istituzionale: ${official.profileUrl}.`,
    [
      `Fonte registro: ${INSTITUTIONAL_POLITICI_SOURCE.label},`,
      `consultata il ${INSTITUTIONAL_POLITICI_SOURCE.checkedAt}.`,
    ].join(" "),
    [
      "Deleghe, gruppi consiliari, compensi e dichiarazioni restano da",
      "collegare a fonti pubbliche specifiche.",
    ].join(" "),
  ].join("\n");
}

export async function ensureInstitutionalOfficials(): Promise<void> {
  for (const official of CURRENT_INSTITUTIONAL_OFFICIALS) {
    const biography = profileNote(official);
    await db
      .insert(officialsTable)
      .values({
        name: official.name,
        slug: official.slug,
        role: official.role,
        roleTitle: official.roleTitle,
        group: null,
        status: "in_carica",
        appointmentDate: null,
        biography,
      })
      .onConflictDoUpdate({
        target: officialsTable.slug,
        set: {
          name: official.name,
          role: official.role,
          roleTitle: official.roleTitle,
          status: "in_carica",
          biography: sql`case
            when ${officialsTable.biography} is null
              or ${officialsTable.biography} like 'Anagrafica minima:%'
            then ${biography}
            else ${officialsTable.biography}
          end`,
          updatedAt: new Date(),
        },
      });
  }
}
