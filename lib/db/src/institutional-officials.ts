import { sql } from "drizzle-orm";
import { db } from "./client";
import { officialsTable } from "./schema";
import {
  INSTITUTIONAL_OFFICIALS,
  type InstitutionalOfficialSeed,
} from "./institutional-officials-data";

export * from "./institutional-officials-data";

function profileNote(official: InstitutionalOfficialSeed): string {
  const lines = [
    `Anagrafica minima: ${official.name}, ${official.roleTitle}.`,
  ];
  if (official.profileUrl) {
    lines.push(`Scheda personale istituzionale: ${official.profileUrl}.`);
  } else {
    lines.push(
      [
        "Scheda personale istituzionale non disponibile nel registro",
        "corrente; anagrafica collegata alla fonte storica indicata.",
      ].join(" "),
    );
  }
  lines.push(
    [
      `Fonte registro: ${official.source.label},`,
      `consultata il ${official.source.checkedAt}.`,
    ].join(" "),
  );
  if (official.deleghe) {
    lines.push(
      `Deleghe dichiarate nella scheda personale istituzionale: ${official.deleghe}`,
    );
  }
  const contacts = [
    official.contactPhone ? `telefono ${official.contactPhone}` : null,
    official.contactEmail ? `email ${official.contactEmail}` : null,
  ].filter((contact): contact is string => contact !== null);
  if (contacts.length) {
    lines.push(
      `Punti di contatto dichiarati nella scheda personale istituzionale: ${contacts.join("; ")}.`,
    );
  }
  if (official.biographyNote) lines.push(official.biographyNote);
  lines.push(
    [
      "Gruppi consiliari, compensi e dichiarazioni restano da collegare",
      "a fonti pubbliche specifiche.",
    ].join(" "),
  );
  return lines.join("\n");
}

export async function ensureInstitutionalOfficials(): Promise<void> {
  for (const official of INSTITUTIONAL_OFFICIALS) {
    const biography = profileNote(official);
    await db
      .insert(officialsTable)
      .values({
        name: official.name,
        slug: official.slug,
        role: official.role,
        roleTitle: official.roleTitle,
        group: null,
        status: official.status,
        appointmentDate: official.appointmentDate
          ? new Date(official.appointmentDate)
          : null,
        biography,
      })
      .onConflictDoUpdate({
        target: officialsTable.slug,
        set: {
          name: official.name,
          role: official.role,
          roleTitle: official.roleTitle,
          status: official.status,
          appointmentDate: official.appointmentDate
            ? new Date(official.appointmentDate)
            : null,
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
