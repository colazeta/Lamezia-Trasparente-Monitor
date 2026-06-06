import { useEffect } from "react";

const SITE_NAME = "rendiamoLameziaTrasparente";
const DEFAULT_IMAGE = "/opengraph.jpg";
const PUBLIC_SITE_URL = normalizePublicSiteUrl(
  import.meta.env.VITE_PUBLIC_SITE_URL ?? import.meta.env.VITE_PUBLIC_BASE_URL,
);

type PageMetaProps = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
};

function setMetaByName(name: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(
    `meta[name="${name}"]`,
  );
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setMetaByProperty(property: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(
    `meta[property="${property}"]`,
  );
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setCanonical(href: string) {
  let tag = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", "canonical");
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

function normalizePublicSiteUrl(value: string | undefined) {
  if (!value) return null;

  const candidate = value.trim();
  if (!candidate) return null;

  const withProtocol = /^https?:\/\//i.test(candidate)
    ? candidate
    : `https://${candidate}`;

  try {
    return new URL(withProtocol).toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function absoluteUrl(pathOrUrl: string) {
  const baseUrl = PUBLIC_SITE_URL ?? window.location.origin;

  try {
    if (/^https?:\/\//i.test(pathOrUrl)) {
      return new URL(pathOrUrl).toString();
    }

    const normalizedPath = pathOrUrl.startsWith("/")
      ? pathOrUrl
      : `/${pathOrUrl}`;
    return `${baseUrl}${normalizedPath}`;
  } catch {
    return `${baseUrl}/`;
  }
}

export function PageMeta({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  type = "website",
}: PageMetaProps) {
  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME)
      ? title
      : `${title} — ${SITE_NAME}`;
    const canonicalUrl = absoluteUrl(path ?? window.location.pathname);
    const imageUrl = absoluteUrl(image);

    document.title = fullTitle;
    setMetaByName("description", description);
    setMetaByName("robots", "index, follow");
    setMetaByProperty("og:site_name", SITE_NAME);
    setMetaByProperty("og:title", fullTitle);
    setMetaByProperty("og:description", description);
    setMetaByProperty("og:type", type);
    setMetaByProperty("og:url", canonicalUrl);
    setMetaByProperty("og:image", imageUrl);
    setMetaByName("twitter:card", "summary_large_image");
    setMetaByName("twitter:title", fullTitle);
    setMetaByName("twitter:description", description);
    setMetaByName("twitter:image", imageUrl);
    setCanonical(canonicalUrl);
  }, [description, image, path, title, type]);

  return null;
}
