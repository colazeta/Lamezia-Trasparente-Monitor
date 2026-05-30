import type { useColors } from "@/hooks/useColors";

type Colors = ReturnType<typeof useColors>;

export type Intent =
  | "alert"
  | "active"
  | "monitor"
  | "closed"
  | "info"
  | "warn";

export const THEME_STATUS: Record<string, { label: string; intent: Intent }> = {
  aperto: { label: "Aperto", intent: "alert" },
  in_corso: { label: "In Corso", intent: "active" },
  monitoraggio: { label: "In Monitoraggio", intent: "monitor" },
  chiuso: { label: "Risolto/Chiuso", intent: "closed" },
};

export const REPORT_STATUS: Record<string, { label: string; intent: Intent }> = {
  ricevuta: { label: "Ricevuta", intent: "info" },
  in_valutazione: { label: "In Valutazione", intent: "warn" },
  presa_in_carico: { label: "Presa in Carico", intent: "active" },
  archiviata: { label: "Archiviata", intent: "closed" },
};

export const REPORT_CATEGORIES: { value: string; label: string }[] = [
  { value: "lavori_pubblici", label: "Lavori Pubblici" },
  { value: "ambiente", label: "Ambiente e Rifiuti" },
  { value: "viabilita", label: "Viabilità" },
  { value: "trasparenza", label: "Trasparenza Amministrativa" },
  { value: "altro", label: "Altro" },
];

export const THEME_SORTS: { value: "recent" | "relevance" | "shares"; label: string }[] = [
  { value: "recent", label: "Recenti" },
  { value: "relevance", label: "Rilevanza" },
  { value: "shares", label: "Condivisioni" },
];

export function categoryLabel(value: string): string {
  return REPORT_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export const OFFICIAL_ROLES: { value: string; label: string }[] = [
  { value: "sindaco", label: "Sindaco" },
  { value: "assessore", label: "Assessori" },
  { value: "consigliere", label: "Consiglieri" },
  { value: "dirigente", label: "Dirigenti" },
  { value: "dipendente", label: "Dipendenti" },
];

export function officialRoleLabel(role: string): string {
  switch (role) {
    case "sindaco":
      return "Sindaco";
    case "assessore":
      return "Assessore";
    case "consigliere":
      return "Consigliere";
    case "dirigente":
      return "Dirigente";
    case "dipendente":
      return "Dipendente";
    default:
      return role;
  }
}

export function officialStatusInfo(status: string): { label: string; intent: Intent } {
  return status === "in_carica"
    ? { label: "In carica", intent: "active" }
    : { label: "Cessato", intent: "closed" };
}

export type VoteValue = "favorevole" | "contrario" | "astenuto" | "assente";

export function voteInfo(vote: string): {
  label: string;
  intent: Intent;
  icon: "check" | "x" | "minus" | "slash";
} {
  switch (vote) {
    case "favorevole":
      return { label: "Favorevole", intent: "active", icon: "check" };
    case "contrario":
      return { label: "Contrario", intent: "alert", icon: "x" };
    case "astenuto":
      return { label: "Astenuto", intent: "warn", icon: "minus" };
    default:
      return { label: "Assente", intent: "closed", icon: "slash" };
  }
}

export const DELIBERA_TIPI: { value: string | undefined; label: string }[] = [
  { value: undefined, label: "Tutte" },
  { value: "giunta", label: "Giunta" },
  { value: "consiglio", label: "Consiglio" },
];

export const CONVOCAZIONE_TIPI: { value: string | undefined; label: string }[] = [
  { value: undefined, label: "Tutte" },
  { value: "consiglio", label: "Consiglio" },
  { value: "commissione", label: "Commissioni" },
];

export function formatDateOpt(iso?: string | null): string {
  if (!iso) return "—";
  return formatDate(iso);
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function intentColors(
  intent: Intent,
  c: Colors,
): { bg: string; fg: string } {
  switch (intent) {
    case "alert":
      return { bg: hexToRgba(c.destructive, 0.14), fg: c.destructive };
    case "active":
      return { bg: hexToRgba(c.primary, 0.14), fg: c.primary };
    case "monitor":
      return { bg: c.secondary, fg: c.secondaryForeground };
    case "closed":
      return { bg: c.muted, fg: c.mutedForeground };
    case "info":
      return { bg: "rgba(37, 99, 235, 0.14)", fg: "#2563EB" };
    case "warn":
      return { bg: "rgba(217, 119, 6, 0.14)", fg: "#D97706" };
  }
}

const MONTHS = [
  "gen",
  "feb",
  "mar",
  "apr",
  "mag",
  "giu",
  "lug",
  "ago",
  "set",
  "ott",
  "nov",
  "dic",
];

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatAmount(n: number): string {
  if (!isFinite(n)) return "€ 0";
  const s = Math.round(n).toString();
  return "€ " + s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function compactAmount(n: number): string {
  if (!isFinite(n)) return "€ 0";
  if (n >= 1_000_000) return `€ ${(n / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (n >= 1_000) return `€ ${Math.round(n / 1000)}k`;
  return formatAmount(n);
}
