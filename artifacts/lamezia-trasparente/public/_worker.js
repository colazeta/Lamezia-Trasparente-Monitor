const API_PREFIX = "/api/";
const FEED_PREFIX = "/feeds/";
const API_FEED_PREFIX = "/api/feeds/";

function unavailableJson(request) {
  const body = JSON.stringify({
    status: "source-unavailable",
    scope: "static-frontend",
    path: new URL(request.url).pathname,
    message:
      "Il servizio dati non è collegato a questa pubblicazione statica. Consulta lo stato delle fonti nel sito.",
  });

  return new Response(request.method === "HEAD" ? null : body, {
    status: 503,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "Retry-After": "3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function unavailableFeed(request) {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<serviceUnavailable xmlns="https://lamezia-trasparente.pages.dev/ns/status">
  <status>source-unavailable</status>
  <message>Il feed non è collegato a questa pubblicazione statica.</message>
</serviceUnavailable>`;

  return new Response(request.method === "HEAD" ? null : body, {
    status: 503,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/xml; charset=utf-8",
      "Retry-After": "3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export default {
  fetch(request, env) {
    const pathname = new URL(request.url).pathname;

    if (
      (pathname.startsWith(FEED_PREFIX) ||
        pathname.startsWith(API_FEED_PREFIX)) &&
      pathname.endsWith(".xml")
    ) {
      return unavailableFeed(request);
    }

    if (pathname === "/api" || pathname.startsWith(API_PREFIX)) {
      return unavailableJson(request);
    }

    return env.ASSETS.fetch(request);
  },
};
