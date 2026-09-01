export function withPublicBasePath(
  pathname: `/${string}`,
  baseUrl = import.meta.env.BASE_URL,
) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  return `${normalizedBaseUrl}${pathname}`;
}
