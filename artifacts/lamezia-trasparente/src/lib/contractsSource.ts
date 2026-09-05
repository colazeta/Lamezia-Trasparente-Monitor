export type AlboAreaTheme = {
  theme_id?: string | null;
};

export type AlboPublicItem = {
  public_id?: string;
  publication_number?: string;
  publication_start?: string | null;
  act_date?: string | null;
  subject?: string;
  document_url?: string | null;
  verification_status?: string;
  public_visibility?: string;
  presentation?: {
    display_title?: string | null;
    area_theme?: AlboAreaTheme | null;
  } | null;
};

export type AlboPublicSnapshot = {
  source?: string;
  source_url?: string;
  generated_at?: string;
  retrieved_at?: string;
  counts?: {
    acquired?: number;
    publishable?: number;
  };
  known_limits?: string[];
  items?: AlboPublicItem[];
};

export function parseExplicitAmount(value: string | null | undefined): number {
  const subject = value ?? "";
  const patterns = [
    /(?:€|EURO)\s*([0-9][0-9.\s]*(?:,[0-9]{1,2})?)/iu,
    /\bIMPORTO(?:\s+(?:COMPLESSIVO|TOTALE))?(?:\s+DI|\s+PARI\s+A)?\s*[:=€]?\s*([0-9][0-9.\s]*(?:,[0-9]{1,2})?)/iu,
    /([0-9][0-9.\s]*(?:,[0-9]{1,2})?)\s*(?:€|EURO)\b/iu,
  ];

  for (const pattern of patterns) {
    const parsed = parseItalianNumber(subject.match(pattern)?.[1]);
    if (parsed > 0) return parsed;
  }
  return 0;
}

function parseItalianNumber(value: string | undefined): number {
  if (!value) return 0;
  const normalized = value
    .replace(/\s+/gu, "")
    .replace(/\./gu, "")
    .replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}
