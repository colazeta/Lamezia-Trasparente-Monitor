import { useQuery } from "@tanstack/react-query";
import {
  municipalDemographicUrl,
  validateMunicipalSnapshot,
  type MunicipalDatasetKey,
} from "@/data/municipalDemographics";
export function useMunicipalDemographicSnapshot(key: MunicipalDatasetKey) {
  return useQuery({
    queryKey: ["canonical-municipal-demographics", key],
    queryFn: async ({ signal }) => {
      const r = await fetch(municipalDemographicUrl(key), {
        signal,
        cache: "no-cache",
      });
      if (!r.ok || !r.headers.get("content-type")?.includes("application/json"))
        throw new Error(
          "Il dataset canonico non è disponibile. Nessuna copia statica è stata sostituita ai dati del database.",
        );
      return validateMunicipalSnapshot(await r.json(), key);
    },
    staleTime: 60_000,
    retry: 1,
  });
}
