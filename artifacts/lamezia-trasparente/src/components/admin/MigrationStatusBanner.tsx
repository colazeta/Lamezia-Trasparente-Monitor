import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AlertTriangle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiFetch } from "@/lib/apiBaseUrl";

/**
 * Shape of `GET /api/healthz/migrations`.
 *
 * Read-only ops endpoint (not part of the OpenAPI surface, so it has no
 * generated client hook). `status` is "ok" when nothing is pending, "pending"
 * when the database is behind the shipped migrations, and "error" when the
 * status could not be read at all (the endpoint answers 503 in that case).
 */
interface MigrationHealth {
  status: "ok" | "pending" | "error";
  migration?: {
    lastAppliedTag: string | null;
    appliedCount: number;
    journalCount: number;
    pendingTags: string[];
  };
  error?: string;
}

const MIGRATION_HEALTH_URL = "/api/healthz/migrations";

/** Poll roughly every 30s so the banner clears soon after the DB is fixed. */
const POLL_INTERVAL_MS = 30_000;

const REMEDY_COMMAND = "pnpm --filter @workspace/db run migrate";

async function fetchMigrationHealth(): Promise<MigrationHealth> {
  const response = await apiFetch(MIGRATION_HEALTH_URL, {
    headers: { Accept: "application/json" },
  });

  // The endpoint answers 503 with `{ status: "error", ... }` when it cannot
  // read the migration state. Parse the body either way so we can surface a
  // banner rather than silently swallowing a real problem.
  const data = (await response
    .json()
    .catch(() => null)) as MigrationHealth | null;

  if (data && typeof data.status === "string") {
    return data;
  }

  return { status: "error", error: `HTTP ${response.status}` };
}

/**
 * Shows a prominent banner in the editorial/admin area when the database
 * migration state is not "ok" after a deploy — i.e. the database upgrade did
 * not finish. The banner names the pending migration(s) and spells out the
 * remediation steps, and disappears automatically once the database is up to
 * date (the query keeps polling).
 *
 * Renders nothing outside the `/admin` area and nothing while the status is
 * "ok", so it is safe to mount once in the shared layout.
 */
export function MigrationStatusBanner() {
  const [location] = useLocation();
  const isAdminArea = location === "/admin" || location.startsWith("/admin/");

  const { data } = useQuery({
    queryKey: ["healthz", "migrations"],
    queryFn: fetchMigrationHealth,
    enabled: isAdminArea,
    refetchInterval: POLL_INTERVAL_MS,
    refetchOnWindowFocus: true,
    retry: false,
    staleTime: 0,
  });

  if (!isAdminArea) return null;
  if (!data || data.status === "ok") return null;

  const pending = data.migration?.pendingTags ?? [];
  const isPending = data.status === "pending";

  return (
    <div className="container mx-auto px-4 pt-6">
      <Alert variant="destructive" data-testid="banner-migration-status">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>
          {isPending
            ? "Aggiornamento del database non completato"
            : "Stato del database non verificabile"}
        </AlertTitle>
        <AlertDescription className="space-y-2">
          {isPending ? (
            <>
              <p>
                L'ultimo deploy non ha applicato tutte le migrazioni: il
                database è rimasto indietro. L'ingestione e le funzioni che
                dipendono dallo schema potrebbero non funzionare finché non
                viene aggiornato.
              </p>
              <p>
                <span className="font-medium">
                  Migrazione/i in sospeso ({pending.length}):
                </span>{" "}
                <span
                  className="font-mono"
                  data-testid="text-pending-migrations"
                >
                  {pending.length > 0
                    ? pending.join(", ")
                    : "(non disponibili)"}
                </span>
              </p>
            </>
          ) : (
            <p>
              Non è stato possibile leggere lo stato delle migrazioni del
              database
              {data.error ? ` (${data.error})` : ""}. Verifica che l'API server
              sia attivo e raggiungibile.
            </p>
          )}
          <div>
            <p className="font-medium">Come risolvere:</p>
            <ol className="ml-4 list-decimal space-y-1">
              <li>
                Esegui la migrazione del database:{" "}
                <code className="rounded bg-destructive/10 px-1 py-0.5 font-mono text-xs">
                  {REMEDY_COMMAND}
                </code>
              </li>
              <li>Riavvia l'API server.</li>
            </ol>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
