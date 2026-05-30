/**
 * Resolve an image source embedded in a Cronistoria post body.
 *
 * Only images hosted in our own object storage are allowed: the upload endpoint
 * returns an object path like `/objects/uploads/<id>`, which is served at
 * `/api/storage/objects/<id>`. Both the raw object path and the already-served
 * `/api/storage/...` path are accepted. Any other source (arbitrary external
 * URLs, `javascript:` etc.) is rejected so nothing unsafe is ever rendered.
 */
export function resolvePostImageSrc(src: string | undefined): string | null {
  if (!src) return null;
  if (src.startsWith("/objects/")) return `/api/storage${src}`;
  if (
    src.startsWith("/api/storage/objects/") ||
    src.startsWith("/api/storage/public-objects/")
  ) {
    return src;
  }
  return null;
}
