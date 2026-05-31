import {
  Euro,
  Landmark,
  Gavel,
  Users,
  CalendarClock,
  Compass,
  Megaphone,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

/**
 * Mappa euristica argomento → icona. Gli argomenti sono curati liberamente
 * dalla redazione, quindi abbiniamo l'icona per parola chiave con un fallback
 * neutro per argomenti non riconosciuti.
 */
const TOPIC_ICON_RULES: { match: RegExp; icon: LucideIcon }[] = [
  { match: /appalt|spend|spesa|soldi|contratt|fornitor/i, icon: Euro },
  { match: /pnrr|fond|finanziam/i, icon: Landmark },
  { match: /atti|delib|decision|voto|voti/i, icon: Gavel },
  { match: /governa|amministrat|sindaco|giunta|consiglio/i, icon: Users },
  { match: /agenda|convoca|seduta|istituzional/i, icon: CalendarClock },
  { match: /tem|cronistoria|opera|vicend/i, icon: Compass },
  { match: /partecip|segnal|cittadin/i, icon: Megaphone },
];

export function iconForTopic(topic: string): LucideIcon {
  for (const rule of TOPIC_ICON_RULES) {
    if (rule.match.test(topic)) return rule.icon;
  }
  return HelpCircle;
}
