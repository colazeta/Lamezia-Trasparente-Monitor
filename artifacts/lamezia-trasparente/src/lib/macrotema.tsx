import { Layers } from "lucide-react";

// Etichette leggibili degli ambiti di spesa (macrotema), condivise da tutte le
// pagine che mostrano i badge dei temi (Albo, Convocazioni, Delibere, dettagli…).
export const MACROTEMA_LABELS: Record<string, string> = {
  ambiente: "Ambiente e rifiuti",
  scuole: "Scuole e istruzione",
  strade: "Strade e lavori pubblici",
  sociale: "Sociale e servizi alla persona",
  cultura: "Cultura, sport e turismo",
  mobilita: "Mobilità e trasporti",
  altro: "Altri servizi e forniture",
};

// Classi colore (Tailwind) per ciascun macrotema. Includono sempre un bordo
// trasparente così che il badge mantenga la stessa dimensione con o senza
// bordo visibile.
export const MACROTEMA_COLORS: Record<string, string> = {
  ambiente:
    "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  scuole:
    "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
  strade:
    "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  sociale:
    "border-transparent bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300",
  cultura:
    "border-transparent bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300",
  mobilita:
    "border-transparent bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300",
  altro: "border-transparent bg-muted text-muted-foreground",
};

// Opzioni per i filtri "Filtra per tema" (includono la voce "Tutti i temi").
export const MACROTEMA_OPTS: { key: string; label: string }[] = [
  { key: "all", label: "Tutti i temi" },
  { key: "ambiente", label: "Ambiente e rifiuti" },
  { key: "scuole", label: "Scuole e istruzione" },
  { key: "strade", label: "Strade e lavori pubblici" },
  { key: "sociale", label: "Sociale e servizi" },
  { key: "cultura", label: "Cultura, sport e turismo" },
  { key: "mobilita", label: "Mobilità e trasporti" },
  { key: "altro", label: "Altri servizi e forniture" },
];

export function macrotemaLabel(macrotema: string | null | undefined): string {
  if (!macrotema) return "";
  return MACROTEMA_LABELS[macrotema] ?? macrotema;
}

export function macrotemaColors(macrotema: string | null | undefined): string {
  if (!macrotema) return MACROTEMA_COLORS.altro;
  return MACROTEMA_COLORS[macrotema] ?? MACROTEMA_COLORS.altro;
}

export function MacrotemaBadge({
  macrotema,
  size = "sm",
}: {
  macrotema: string | null | undefined;
  size?: "sm" | "lg";
}) {
  if (!macrotema || macrotema === "altro") return null;
  const colors = macrotemaColors(macrotema);
  const sizeClasses =
    size === "lg"
      ? "gap-1.5 px-3 py-1 text-xs"
      : "gap-1 px-2 py-0.5 text-[10px]";
  const iconClasses = size === "lg" ? "h-3.5 w-3.5" : "h-3 w-3";
  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${sizeClasses} ${colors}`}
    >
      <Layers className={iconClasses} />
      {macrotemaLabel(macrotema)}
    </span>
  );
}
