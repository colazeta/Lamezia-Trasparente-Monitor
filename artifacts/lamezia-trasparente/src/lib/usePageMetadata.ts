import { useEffect } from "react";

interface PageMetadata {
  title: string;
  description: string;
}

function ensureMeta(name: string): { element: HTMLMetaElement; created: boolean } {
  const existing = document.querySelector<HTMLMetaElement>(
    `meta[name="${name}"]`,
  );
  if (existing) return { element: existing, created: false };

  const element = document.createElement("meta");
  element.setAttribute("name", name);
  document.head.appendChild(element);
  return { element, created: true };
}

function ensurePropertyMeta(property: string): {
  element: HTMLMetaElement;
  created: boolean;
} {
  const existing = document.querySelector<HTMLMetaElement>(
    `meta[property="${property}"]`,
  );
  if (existing) return { element: existing, created: false };

  const element = document.createElement("meta");
  element.setAttribute("property", property);
  document.head.appendChild(element);
  return { element, created: true };
}

function restoreMeta(
  element: HTMLMetaElement,
  previousContent: string | null,
  created: boolean,
) {
  if (created) {
    element.remove();
    return;
  }

  if (previousContent == null) {
    element.removeAttribute("content");
  } else {
    element.setAttribute("content", previousContent);
  }
}

export function usePageMetadata({ title, description }: PageMetadata) {
  useEffect(() => {
    const previousTitle = document.title;
    const descriptionMeta = ensureMeta("description");
    const ogTitleMeta = ensurePropertyMeta("og:title");
    const ogDescriptionMeta = ensurePropertyMeta("og:description");
    const twitterTitleMeta = ensureMeta("twitter:title");
    const twitterDescriptionMeta = ensureMeta("twitter:description");

    const previousDescription =
      descriptionMeta.element.getAttribute("content");
    const previousOgTitle = ogTitleMeta.element.getAttribute("content");
    const previousOgDescription =
      ogDescriptionMeta.element.getAttribute("content");
    const previousTwitterTitle =
      twitterTitleMeta.element.getAttribute("content");
    const previousTwitterDescription =
      twitterDescriptionMeta.element.getAttribute("content");

    document.title = title;
    descriptionMeta.element.setAttribute("content", description);
    ogTitleMeta.element.setAttribute("content", title);
    ogDescriptionMeta.element.setAttribute("content", description);
    twitterTitleMeta.element.setAttribute("content", title);
    twitterDescriptionMeta.element.setAttribute("content", description);

    return () => {
      document.title = previousTitle;
      restoreMeta(
        descriptionMeta.element,
        previousDescription,
        descriptionMeta.created,
      );
      restoreMeta(ogTitleMeta.element, previousOgTitle, ogTitleMeta.created);
      restoreMeta(
        ogDescriptionMeta.element,
        previousOgDescription,
        ogDescriptionMeta.created,
      );
      restoreMeta(
        twitterTitleMeta.element,
        previousTwitterTitle,
        twitterTitleMeta.created,
      );
      restoreMeta(
        twitterDescriptionMeta.element,
        previousTwitterDescription,
        twitterDescriptionMeta.created,
      );
    };
  }, [description, title]);
}
