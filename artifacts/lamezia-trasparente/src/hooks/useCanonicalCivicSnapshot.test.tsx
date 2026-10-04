import { webcrypto, createHash } from "node:crypto";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import retained from "../../../../data/public/canonical/civic-snapshot.json";
import {
  civicCanonicalJson,
  civicPublicSnapshotBody,
  type CivicPublicSnapshot,
} from "@workspace/publication-standardisation/canonical-public";
import { useCanonicalCivicSnapshot } from "./useCanonicalCivicSnapshot";
import { apiFetch } from "@/lib/apiBaseUrl";

vi.mock("@/lib/apiBaseUrl", () => ({ apiFetch: vi.fn() }));
function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      {children}
    </QueryClientProvider>
  );
}
function rehash(snapshot: typeof retained) {
  snapshot.body_hash = createHash("sha256")
    .update(
      civicCanonicalJson(
        civicPublicSnapshotBody(snapshot as unknown as CivicPublicSnapshot),
      ),
    )
    .digest("hex");
  return snapshot;
}
beforeEach(() => {
  vi.stubGlobal("crypto", webcrypto);
  vi.mocked(apiFetch).mockReset();
});
afterEach(() => vi.unstubAllGlobals());
describe("canonical civic edition selection", () => {
  it("replaces the complete retained edition after validating the API digest", async () => {
    const next = structuredClone(retained);
    next.pnrr.projects[0].title = "Seconda edizione verificata";
    next.albo.items[0].subject = "Titolo della seconda edizione";
    rehash(next);
    vi.mocked(apiFetch).mockResolvedValue(new Response(JSON.stringify(next)));
    const { result } = renderHook(() => useCanonicalCivicSnapshot(), {
      wrapper,
    });
    expect(result.current.snapshot).toEqual(retained);
    await waitFor(() => expect(result.current.mode).toBe("api"));
    expect(result.current.snapshot).toEqual(next);
  });
  it.each(["unavailable", "corrupt digest", "disallowed visibility"])(
    "retains one full edition on %s",
    async (failure) => {
      const next = structuredClone(retained);
      next.pnrr.projects[0].title = "Rejected partial replacement";
      if (failure === "disallowed visibility") {
        next.albo.items[0].public_visibility = "do_not_publish";
        rehash(next);
      }
      vi.mocked(apiFetch).mockResolvedValue(
        new Response(failure === "unavailable" ? null : JSON.stringify(next), {
          status: failure === "unavailable" ? 503 : 200,
        }),
      );
      const { result } = renderHook(() => useCanonicalCivicSnapshot(), {
        wrapper,
      });
      await waitFor(() => expect(result.current.unavailable).toBe(true));
      expect(result.current.mode).toBe("snapshot");
      expect(result.current.snapshot).toEqual(retained);
    },
  );
});
