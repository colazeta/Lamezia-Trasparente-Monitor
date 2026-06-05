import { useQuery } from "@tanstack/react-query";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

type SiteStringsMap = Record<string, string>;

export function useSiteStrings(namespace?: string) {
  const url = namespace
    ? `${basePath}/api/redazione/site-strings/${encodeURIComponent(namespace)}`
    : `${basePath}/api/redazione/site-strings`;

  const { data, isLoading } = useQuery<SiteStringsMap>({
    queryKey: ["site-strings", namespace ?? "__all__"],
    queryFn: async () => {
      const res = await fetch(url);
      if (!res.ok) return {};
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  function getString(key: string, defaultValue = ""): string {
    if (!data) return defaultValue;
    return (data as SiteStringsMap)[key] ?? defaultValue;
  }

  return { getString, isLoading };
}
