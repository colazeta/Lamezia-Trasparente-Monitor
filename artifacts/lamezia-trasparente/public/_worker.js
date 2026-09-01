const API_PREFIX = "/api/";
const FEED_PREFIX = "/feeds/";
const API_FEED_PREFIX = "/api/feeds/";
const STATIC_CONTRACTS_DATA_PATH =
  "/data/processed/contracts/lamezia-contracts-current.json";
const CONTRACTS_API_PATH = "/api/contracts";
const PUBLIC_CONTRACTS_API_PATH = "/api/public/v1/contracts";
const CONTRACTS_FEED_PATHS = new Set([
  "/feeds/contratti.xml",
  "/api/feeds/contratti.xml",
]);

let contractsDatasetCache = null;

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

function jsonResponse(request, value, status = 200) {
  return new Response(
    request.method === "HEAD" ? null : JSON.stringify(value),
    {
      status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control":
          status === 200 ? "public, max-age=300, s-maxage=900" : "no-store",
        "Content-Type": "application/json; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

function methodNotAllowed(request) {
  const response = jsonResponse(
    request,
    {
      status: "method-not-allowed",
      message: "Questa superficie pubblica è disponibile in sola lettura.",
    },
    405,
  );
  response.headers.set("Allow", "GET, HEAD");
  return response;
}

async function loadContractsDataset(request, env) {
  if (contractsDatasetCache) return contractsDatasetCache;
  if (!env?.ASSETS?.fetch) {
    throw new Error("Static asset binding unavailable");
  }

  const assetUrl = new URL(request.url);
  assetUrl.pathname = STATIC_CONTRACTS_DATA_PATH;
  assetUrl.search = "";
  assetUrl.hash = "";
  const response = await env.ASSETS.fetch(
    new Request(assetUrl.toString(), { method: "GET" }),
  );
  if (!response.ok) {
    throw new Error(`Static contracts dataset returned ${response.status}`);
  }

  const dataset = await response.json();
  if (
    dataset?.schemaVersion !== "lamezia-contracts-current.v1" ||
    !Array.isArray(dataset.contracts) ||
    !dataset.feedStatus ||
    !dataset.storylines ||
    typeof dataset.storylines !== "object"
  ) {
    throw new Error("Static contracts dataset has an invalid schema");
  }
  contractsDatasetCache = dataset;
  return dataset;
}

function filterContracts(contracts, url) {
  const query = url.searchParams;
  const search = normalized(query.get("search"));
  const supplier = normalized(query.get("supplier"));
  const procedureType = normalized(query.get("procedureType"));
  const acquisitionTool = normalized(query.get("acquisitionTool"));
  const minAmount = finiteQueryNumber(query.get("minAmount"));
  const maxAmount = finiteQueryNumber(query.get("maxAmount"));
  const themeId = finiteQueryNumber(query.get("themeId"));
  const quartiere = normalized(query.get("quartiere"));
  const from = dateQuery(query.get("from"));
  const to = dateQuery(query.get("to"));
  const hasLocation = query.get("hasLocation");

  return contracts
    .filter((contract) => {
      const searchable = normalized(
        [
          contract.title,
          contract.description,
          contract.supplier,
          contract.cig,
          contract.cup,
        ].join(" "),
      );
      if (search && !searchable.includes(search)) return false;
      if (supplier && normalized(contract.supplier) !== supplier) return false;
      if (
        procedureType &&
        normalized(contract.procedureType) !== procedureType
      ) {
        return false;
      }
      if (
        acquisitionTool &&
        normalized(contract.acquisitionTool) !== acquisitionTool
      ) {
        return false;
      }

      const hasAmount = Number(contract.amount) > 0;
      if (minAmount !== null && (!hasAmount || contract.amount < minAmount)) {
        return false;
      }
      if (maxAmount !== null && (!hasAmount || contract.amount > maxAmount)) {
        return false;
      }
      if (themeId !== null && Number(contract.themeId) !== themeId) {
        return false;
      }
      if (quartiere && normalized(contract.geoQuartiere) !== quartiere) {
        return false;
      }
      if (
        hasLocation === "true" &&
        !(
          typeof contract.latitude === "number" &&
          typeof contract.longitude === "number"
        )
      ) {
        return false;
      }

      const referenceDate = String(contract.awardDate ?? "").slice(0, 10);
      if (from && referenceDate < from) return false;
      if (to && referenceDate > to) return false;
      return true;
    })
    .sort(
      (a, b) =>
        Date.parse(b.awardDate) - Date.parse(a.awardDate) || b.id - a.id,
    );
}

function buildAnalytics(contracts) {
  const totalCount = contracts.length;
  const totalAmount = contracts.reduce(
    (sum, contract) =>
      sum + (Number(contract.amount) > 0 ? Number(contract.amount) : 0),
    0,
  );
  const withoutTenderCount = contracts.filter(
    (contract) => contract.withoutTender === true,
  ).length;
  const withoutMepaCount = contracts.filter(
    (contract) => contract.withoutMepa === true,
  ).length;
  const supplierCounts = countBy(
    contracts.filter((contract) => !isUnknownSupplier(contract.supplier)),
    (contract) => contract.supplier,
  );
  const mostRecurrentBeneficiary =
    Array.from(supplierCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .filter((entry) => entry.count > 1)
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))[0] ??
    null;
  const beneficiaryAmounts = new Map();

  for (const contract of contracts) {
    if (isUnknownSupplier(contract.supplier) || Number(contract.amount) <= 0) {
      continue;
    }
    beneficiaryAmounts.set(
      contract.supplier,
      (beneficiaryAmounts.get(contract.supplier) ?? 0) +
        Number(contract.amount),
    );
  }

  const monthly = new Map();
  for (const contract of contracts) {
    if (Number(contract.amount) <= 0) continue;
    const period = String(contract.awardDate ?? "").slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(period)) continue;
    const current = monthly.get(period) ?? { amount: 0, count: 0 };
    current.amount += Number(contract.amount);
    current.count += 1;
    monthly.set(period, current);
  }

  return {
    totalCount,
    totalAmount,
    withoutTenderCount,
    withoutTenderPct:
      totalCount > 0 ? (withoutTenderCount / totalCount) * 100 : 0,
    withoutMepaCount,
    withoutMepaPct: totalCount > 0 ? (withoutMepaCount / totalCount) * 100 : 0,
    topBeneficiaries: Array.from(beneficiaryAmounts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
      .slice(0, 10),
    mostRecurrentBeneficiary,
    byProcedure: countEntries(contracts, (contract) => contract.procedureType),
    byAcquisitionTool: countEntries(
      contracts.filter((contract) => Boolean(contract.acquisitionTool)),
      (contract) => contract.acquisitionTool,
    ),
    amountOverTime: Array.from(monthly.entries())
      .map(([period, values]) => ({ period, ...values }))
      .sort((a, b) => a.period.localeCompare(b.period)),
  };
}

function countEntries(items, keyOf) {
  return Array.from(countBy(items, keyOf).entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function countBy(items, keyOf) {
  const counts = new Map();
  for (const item of items) {
    const key = String(keyOf(item) ?? "").trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function buildContractsFeed(request, contracts, feedStatus) {
  const origin = new URL(request.url).origin;
  const items = contracts.slice(0, 50).map((contract) => {
    const link = `${origin}/contratti/${contract.id}`;
    const date = new Date(contract.awardDate);
    const pubDate = Number.isNaN(date.getTime())
      ? ""
      : `<pubDate>${escapeXml(date.toUTCString())}</pubDate>`;
    return `<item>
      <title>${escapeXml(contract.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      ${pubDate}
      <description>${escapeXml(
        `CIG ${contract.cig ?? "non disponibile"} · ${contract.status}`,
      )}</description>
    </item>`;
  });
  const updated = feedStatus?.lastUpdatedAt
    ? new Date(feedStatus.lastUpdatedAt)
    : null;
  const lastBuildDate =
    updated && !Number.isNaN(updated.getTime())
      ? `<lastBuildDate>${escapeXml(updated.toUTCString())}</lastBuildDate>`
      : "";
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Contratti pubblici sotto osservazione — Lamezia Terme</title>
    <link>${escapeXml(`${origin}/contratti`)}</link>
    <description>Atti correnti dell'Albo Pretorio del Comune di Lamezia Terme che riportano un CIG. Perimetro non storico.</description>
    <language>it</language>
    ${lastBuildDate}
    ${items.join("\n    ")}
  </channel>
</rss>`;

  return new Response(request.method === "HEAD" ? null : body, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300, s-maxage=900",
      "Content-Type": "application/xml; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function handleContractsRequest(request, env, url) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return methodNotAllowed(request);
  }

  let dataset;
  try {
    dataset = await loadContractsDataset(request, env);
  } catch {
    return unavailableJson(request);
  }

  const pathname = url.pathname;
  if (pathname === `${CONTRACTS_API_PATH}/feed-status`) {
    return jsonResponse(request, dataset.feedStatus);
  }
  if (pathname === `${CONTRACTS_API_PATH}/analytics`) {
    return jsonResponse(
      request,
      buildAnalytics(filterContracts(dataset.contracts, url)),
    );
  }
  if (
    pathname === CONTRACTS_API_PATH ||
    pathname === PUBLIC_CONTRACTS_API_PATH
  ) {
    return jsonResponse(request, filterContracts(dataset.contracts, url));
  }

  const storylineMatch = pathname.match(/^\/api\/contracts\/(\d+)\/storyline$/);
  if (storylineMatch) {
    const storyline = dataset.storylines[storylineMatch[1]];
    return storyline
      ? jsonResponse(request, storyline)
      : jsonResponse(
          request,
          { status: "not-found", message: "Fascicolo non trovato." },
          404,
        );
  }

  const detailMatch = pathname.match(
    /^\/api\/(?:contracts|public\/v1\/contracts)\/(\d+)$/,
  );
  if (detailMatch) {
    const id = Number(detailMatch[1]);
    const contract = dataset.contracts.find((entry) => entry.id === id);
    return contract
      ? jsonResponse(request, contract)
      : jsonResponse(
          request,
          { status: "not-found", message: "Fascicolo non trovato." },
          404,
        );
  }

  return jsonResponse(
    request,
    { status: "not-found", message: "Endpoint contratti non trovato." },
    404,
  );
}

function normalized(value) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("it");
}

function finiteQueryNumber(value) {
  if (value === null || String(value).trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function dateQuery(value) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function isUnknownSupplier(value) {
  return normalized(value).startsWith("non disponibile");
}

function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (CONTRACTS_FEED_PATHS.has(pathname)) {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return methodNotAllowed(request);
      }
      try {
        const dataset = await loadContractsDataset(request, env);
        return buildContractsFeed(
          request,
          filterContracts(dataset.contracts, url),
          dataset.feedStatus,
        );
      } catch {
        return unavailableFeed(request);
      }
    }

    if (
      pathname === CONTRACTS_API_PATH ||
      pathname.startsWith(`${CONTRACTS_API_PATH}/`) ||
      pathname === PUBLIC_CONTRACTS_API_PATH ||
      pathname.startsWith(`${PUBLIC_CONTRACTS_API_PATH}/`)
    ) {
      return handleContractsRequest(request, env, url);
    }

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
