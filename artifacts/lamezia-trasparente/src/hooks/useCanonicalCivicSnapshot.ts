import { useQuery } from "@tanstack/react-query";
import canonicalSnapshot from "../../../../data/public/canonical/civic-snapshot.json";
import {
  CIVIC_PUBLIC_SNAPSHOT_API,
  verifyCivicPublicSnapshot,
  type CivicPublicSnapshot,
} from "@workspace/publication-standardisation/canonical-public";
import { apiFetch } from "@/lib/apiBaseUrl";

// One complete edition: never merge fields from runtime and retained snapshots.
export function useCanonicalCivicSnapshot() {
  const query = useQuery({
    queryKey: [CIVIC_PUBLIC_SNAPSHOT_API],
    queryFn: async ({ signal }) => {
      const response = await apiFetch(CIVIC_PUBLIC_SNAPSHOT_API, {
        signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]),
      });
      if (!response.ok) throw new Error("Canonical civic source unavailable");
      return verifyCivicPublicSnapshot(await response.json(), async (text) =>
        Array.from(
          new Uint8Array(
            await crypto.subtle.digest(
              "SHA-256",
              new TextEncoder().encode(text),
            ),
          ),
        )
          .map((v) => v.toString(16).padStart(2, "0"))
          .join(""),
      );
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  return {
    snapshot:
      query.data ?? (canonicalSnapshot as unknown as CivicPublicSnapshot),
    mode: query.data ? "api" : "snapshot",
    unavailable: query.isError,
  };
}
