export type AlboReaderState = {
  q: string;
  sector: string;
  actType: string;
  page: number;
  selectedActId: string | null;
};

export type AlboReaderStatePatch = Partial<AlboReaderState>;

const DEFAULT_FILTER = "all";

export function parseAlboReaderState(search: string): AlboReaderState {
  const params = new URLSearchParams(search);
  const rawPage = Number(params.get("pagina"));

  return {
    q: params.get("q") ?? "",
    sector: params.get("settore") || DEFAULT_FILTER,
    actType: params.get("tipo") || DEFAULT_FILTER,
    page: Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1,
    selectedActId: params.get("atto") || null,
  };
}

export function updateAlboReaderSearch(
  search: string,
  patch: AlboReaderStatePatch,
): string {
  const next = { ...parseAlboReaderState(search), ...patch };
  const params = new URLSearchParams();

  if (next.q.trim()) params.set("q", next.q);
  if (next.sector !== DEFAULT_FILTER) params.set("settore", next.sector);
  if (next.actType !== DEFAULT_FILTER) params.set("tipo", next.actType);
  if (next.page > 1) params.set("pagina", String(next.page));
  if (next.selectedActId) params.set("atto", next.selectedActId);

  return params.toString();
}
