import { useQuery } from "@tanstack/react-query";
import { apiUrl } from "@/lib/apiBaseUrl";
import {
  buildSourceHealth,
  type CanonicalPopulationHealth,
} from "@/data/sourceHealth";
import { useMunicipalDemographicSnapshot } from "./useMunicipalDemographics";
export function useCanonicalSourceHealth() {
  const population = useMunicipalDemographicSnapshot("population"),
    foreign = useMunicipalDemographicSnapshot("foreign-age-sex"),
    families = useMunicipalDemographicSnapshot("families-children");
  const istat = useQuery({
    queryKey: ["canonical-source-health", "population-resident-jan1"],
    queryFn: async ({ signal }) => {
      const r = await fetch(
        apiUrl("/api/demographics/series/population-resident-jan1"),
        { signal },
      );
      if (!r.ok || !r.headers.get("content-type")?.includes("application/json"))
        throw new Error("Serie ISTAT non disponibile");
      const data = (await r.json()) as CanonicalPopulationHealth;
      if (
        data.series?.seriesKey !== "population-resident-jan1" ||
        data.series.source !== "ISTAT" ||
        !Array.isArray(data.current) ||
        !Array.isArray(data.releases)
      )
        throw new Error("Serie ISTAT non verificabile");
      if (
        data.series.sourceUrl &&
        !data.series.sourceUrl.startsWith("https://")
      )
        throw new Error("Fonte ISTAT non verificabile");
      return data;
    },
    staleTime: 60_000,
    retry: 1,
  });
  const failed = [
    population.isError ? "population" : "",
    foreign.isError ? "foreign-age-sex" : "",
    families.isError ? "families-children" : "",
    istat.isError ? "istat" : "",
  ].filter(Boolean);
  return buildSourceHealth(
    {
      population: population.data,
      "foreign-age-sex": foreign.data,
      "families-children": families.data,
    },
    istat.data,
    failed,
  );
}
