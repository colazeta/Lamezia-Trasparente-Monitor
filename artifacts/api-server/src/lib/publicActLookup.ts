import { db, publicationsTable, type Publication } from "@workspace/db";
import { eq } from "drizzle-orm";
import { publicActProgressivoFromPublicId } from "@workspace/publication-standardisation/public-act";

export type PublicActIdentifier = number | string;

type ResolvedPublicActIdentifier =
  | { kind: "database_id"; value: number }
  | { kind: "progressivo"; value: string };

export function resolvePublicActIdentifier(
  identifier: PublicActIdentifier,
): ResolvedPublicActIdentifier | null {
  if (
    typeof identifier === "number" &&
    Number.isSafeInteger(identifier) &&
    identifier > 0
  ) {
    return { kind: "database_id", value: identifier };
  }
  if (typeof identifier !== "string" || !identifier) return null;

  if (/^[1-9]\d*$/u.test(identifier)) {
    const databaseId = Number(identifier);
    return Number.isSafeInteger(databaseId)
      ? { kind: "database_id", value: databaseId }
      : null;
  }

  const progressivo = publicActProgressivoFromPublicId(identifier);
  return progressivo ? { kind: "progressivo", value: progressivo } : null;
}

export async function findPublicationByPublicIdentifier(
  identifier: PublicActIdentifier,
): Promise<Publication | null> {
  const resolved = resolvePublicActIdentifier(identifier);
  if (!resolved) return null;
  const [publication] = await db
    .select()
    .from(publicationsTable)
    .where(
      resolved.kind === "database_id"
        ? eq(publicationsTable.id, resolved.value)
        : eq(publicationsTable.progressivo, resolved.value),
    )
    .limit(1);
  return publication ?? null;
}
