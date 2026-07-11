const PROTECTED_ROUTE_ROOTS = [
  "/redazione",
  "/admin",
  "/sign-in",
  "/sign-up",
] as const;

export function isProtectedAppPath(location: string): boolean {
  const pathname = location.split(/[?#]/, 1)[0] || "/";
  return PROTECTED_ROUTE_ROOTS.some(
    (root) => pathname === root || pathname.startsWith(`${root}/`),
  );
}
