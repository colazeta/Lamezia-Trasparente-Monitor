/** Public configuration for the owner's initial Clerk Development login test.
 * No secret or administrator identity belongs in this module.
 */
export function getDatabaseAdminDeployment(origin: string) {
  if (origin !== "https://lamezia-trasparente.pages.dev") return null;
  return {
    publishableKey: "pk_test_c3F1YXJlLW1vdXNlLTM1NC5jbGVyay5hY2NvdW50cy5kZXYk",
    apiBaseUrl: "https://lamezia-trasparente-api.onrender.com",
  };
}

export const databaseAdminDeployment = getDatabaseAdminDeployment(
  typeof window === "undefined" ? "" : window.location.origin,
);
