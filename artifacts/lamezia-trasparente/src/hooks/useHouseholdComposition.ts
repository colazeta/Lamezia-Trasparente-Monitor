import { useQuery } from "@tanstack/react-query";
import {
  householdCompositionUrl,
  validateHouseholdComposition,
} from "@/data/lameziaHouseholdComposition2023";

export function useHouseholdComposition() {
  return useQuery({
    queryKey: ["canonical-istat-household-composition-2023"],
    queryFn: async ({ signal }) => {
      const response = await fetch(householdCompositionUrl(), {
        signal,
        cache: "no-cache",
      });
      if (
        !response.ok ||
        !response.headers.get("content-type")?.includes("application/json")
      )
        throw new Error("Profilo censuario non disponibile");
      return validateHouseholdComposition(await response.json());
    },
    staleTime: 60_000,
    retry: 1,
  });
}
