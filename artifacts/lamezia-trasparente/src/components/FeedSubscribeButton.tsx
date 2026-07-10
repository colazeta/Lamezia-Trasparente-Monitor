import { useEffect } from "react";
import { Rss } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/apiBaseUrl";

type FeedSubscribeButtonProps = {
  /** Percorso del feed relativo all'API, es. "/feeds/albo.xml". */
  feedPath: string;
  /** Titolo del feed, usato per l'autodiscovery e l'accessibilità. */
  title: string;
  /** Etichetta visibile del pulsante. */
  label?: string;
  variant?: "outline" | "ghost" | "secondary" | "brand" | "link";
  size?: "default" | "sm" | "lg";
  className?: string;
};

/**
 * Pulsante "Abbonati al feed" RSS/Atom. Apre il feed in una nuova scheda e
 * inserisce un tag di autodiscovery `<link rel="alternate">` nell'head della
 * pagina, così i lettori RSS rilevano automaticamente il feed.
 *
 * I feed sono serviti dall'API sotto `/api/feeds/...`. `apiUrl` mantiene il
 * percorso same-origin oppure applica l'origine API configurata per deploy
 * separati.
 */
export function FeedSubscribeButton({
  feedPath,
  title,
  label = "Abbonati al feed",
  variant = "outline",
  size = "sm",
  className,
}: FeedSubscribeButtonProps) {
  const href = apiUrl(
    `/api${feedPath.startsWith("/") ? feedPath : `/${feedPath}`}`,
  );

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "alternate";
    link.type = "application/rss+xml";
    link.title = title;
    link.href = href;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [href, title]);

  return (
    <Button asChild variant={variant} size={size} className={className}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${label}: ${title}`}
      >
        <Rss className="h-4 w-4" />
        {label}
      </a>
    </Button>
  );
}
