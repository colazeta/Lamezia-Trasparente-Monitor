import sanitizeHtml from "sanitize-html";

// Base URL pubblico del sito (stesso criterio usato dalle notifiche email):
// preferisce PUBLIC_BASE_URL, poi il dominio Replit, infine stringa vuota
// (URL relativi). I link dei feed devono puntare alle pagine pubbliche del
// sito, non all'API, così i lettori RSS aprono le schede navigabili.
export function getPublicBaseUrl(): string {
  if (process.env.PUBLIC_BASE_URL) {
    return process.env.PUBLIC_BASE_URL.replace(/\/$/, "");
  }
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }
  return "";
}

export function siteUrl(path: string): string {
  const base = getPublicBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
}

export function feedUrl(path: string): string {
  return siteUrl(`/api${path.startsWith("/") ? path : `/${path}`}`);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Riduce un testo (eventualmente HTML/markdown) a testo semplice per la
// descrizione del feed, accorpando gli spazi e troncando in modo pulito.
export function toPlainText(value: string, maxLength = 500): string {
  const stripped = sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  })
    .replace(/\s+/g, " ")
    .trim();
  if (stripped.length <= maxLength) return stripped;
  return `${stripped.slice(0, maxLength - 1).trimEnd()}…`;
}

export type FeedItem = {
  title: string;
  link: string;
  guid: string;
  date: Date | null;
  description: string;
};

export type FeedChannel = {
  title: string;
  link: string;
  description: string;
  selfUrl: string;
  items: FeedItem[];
};

function rfc822(date: Date): string {
  return date.toUTCString();
}

// Costruisce un feed RSS 2.0 valido (con self-link Atom per l'autodiscovery e
// la validazione standard). RSS 2.0 è il formato più diffuso e supportato dai
// lettori, in linea con l'approccio di AlboPOP.
export function buildRssFeed(channel: FeedChannel): string {
  const lastBuild = channel.items.reduce<Date | null>((latest, item) => {
    if (!item.date) return latest;
    if (!latest || item.date > latest) return item.date;
    return latest;
  }, null);

  const items = channel.items
    .map((item) => {
      const parts = [
        `      <title>${escapeXml(item.title)}</title>`,
        `      <link>${escapeXml(item.link)}</link>`,
        `      <guid isPermaLink="false">${escapeXml(item.guid)}</guid>`,
      ];
      if (item.date) {
        parts.push(`      <pubDate>${rfc822(item.date)}</pubDate>`);
      }
      if (item.description) {
        parts.push(
          `      <description>${escapeXml(item.description)}</description>`,
        );
      }
      return `    <item>\n${parts.join("\n")}\n    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(channel.title)}</title>
    <link>${escapeXml(channel.link)}</link>
    <description>${escapeXml(channel.description)}</description>
    <language>it-IT</language>
    <atom:link href="${escapeXml(
      channel.selfUrl,
    )}" rel="self" type="application/rss+xml" />
    <lastBuildDate>${rfc822(lastBuild ?? new Date())}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}
