const MULTI_SOURCE_SCHEMA = "lamezia-contracts-multisource.v1";
const AUTHORITY_SCHEMA = "anac-authority-discovery.v1";

function assertNonNegativeInteger(value, label) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer.`);
  }
}

function assertStringArray(value, label) {
  if (
    !Array.isArray(value) ||
    value.some((entry) => typeof entry !== "string" || !entry.trim()) ||
    new Set(value).size !== value.length
  ) {
    throw new Error(`${label} must be a unique non-empty string array.`);
  }
}

export function assertMultiSourceContractsDataset(dataset, datasetPath) {
  if (
    !dataset ||
    typeof dataset !== "object" ||
    Array.isArray(dataset) ||
    dataset.schemaVersion !== MULTI_SOURCE_SCHEMA ||
    dataset.source?.scope !== "known-public-sources" ||
    dataset.source?.publicClaim !==
      "contratti individuati dalle fonti pubbliche integrate" ||
    !Array.isArray(dataset.source?.limitations) ||
    dataset.source.limitations.length === 0 ||
    !Array.isArray(dataset.procurementEvents) ||
    !Array.isArray(dataset.contractEntities) ||
    !Array.isArray(dataset.unresolvedEvents) ||
    !Array.isArray(dataset.contracts) ||
    dataset.anacConnection?.schemaVersion !== "anac-bdncp-connection.v1" ||
    !dataset.storylines ||
    typeof dataset.storylines !== "object" ||
    !dataset.authorityDiscovery ||
    typeof dataset.authorityDiscovery !== "object" ||
    dataset.authorityDiscovery.schemaVersion !== AUTHORITY_SCHEMA ||
    !dataset.reconciliation ||
    typeof dataset.reconciliation !== "object"
  ) {
    throw new Error(
      `Multi-source contracts dataset has an invalid schema: ${datasetPath}`,
    );
  }

  const coverage = dataset.coverage;
  const connection = dataset.anacConnection;
  if (
    !["pending", "current", "stale", "degraded"].includes(connection.status) ||
    !Number.isInteger(connection.coverage?.directCigLinks) ||
    !Number.isInteger(connection.coverage?.structuredMatches) ||
    connection.coverage.directCigLinks < 0 ||
    connection.coverage.structuredMatches < 0 ||
    connection.coverage.directCigLinks > dataset.contracts.length ||
    connection.coverage.structuredMatches > connection.coverage.directCigLinks
  ) {
    throw new Error(`Invalid ANAC/BDNCP connection coverage: ${datasetPath}`);
  }
  if (!coverage || typeof coverage !== "object" || Array.isArray(coverage)) {
    throw new Error(
      `Multi-source contracts coverage is missing: ${datasetPath}`,
    );
  }

  for (const key of [
    "sourceItemsObserved",
    "publicOfficialItems",
    "procurementEvents",
    "procurementConfirmed",
    "procurementPossible",
    "eventsWithCig",
    "eventsWithoutCig",
    "multiCigEvents",
    "canonicalContracts",
    "contractEventLinks",
    "unresolvedEvents",
    "withCup",
    "withExplicitAmount",
    "withExplicitSupplier",
    "multiSourceContracts",
    "overlapContracts",
    "alboOnlyContracts",
    "anacOnlyContracts",
    "anacAuthorityDiscoveredContracts",
    "authorityRequestedYears",
    "authorityCompletedYears",
  ]) {
    assertNonNegativeInteger(coverage[key], `coverage.${key}`);
  }

  const reconciliation = dataset.reconciliation;
  for (const key of [
    "requestedYears",
    "completedYears",
    "localCanonicalCigs",
    "anacAuthorityCigs",
    "unionCigs",
    "unresolvedAlboEvents",
  ]) {
    assertNonNegativeInteger(reconciliation[key], `reconciliation.${key}`);
  }
  for (const key of ["overlapCigs", "alboOnlyCigs", "anacOnlyCigs"]) {
    assertStringArray(reconciliation[key], `reconciliation.${key}`);
  }
  if (
    !Array.isArray(reconciliation.missingYears) ||
    reconciliation.missingYears.some(
      (year) => !Number.isInteger(year) || year < 2000 || year > 2100,
    ) ||
    new Set(reconciliation.missingYears).size !==
      reconciliation.missingYears.length
  ) {
    throw new Error(
      `Multi-source reconciliation has invalid missing years: ${datasetPath}`,
    );
  }

  if (
    coverage.procurementEvents !== dataset.procurementEvents.length ||
    coverage.canonicalContracts !== dataset.contractEntities.length ||
    coverage.multiSourceContracts !== dataset.contracts.length ||
    coverage.unresolvedEvents !== dataset.unresolvedEvents.length ||
    coverage.eventsWithoutCig !== dataset.unresolvedEvents.length ||
    coverage.eventsWithCig + coverage.eventsWithoutCig !==
      coverage.procurementEvents ||
    coverage.procurementConfirmed + coverage.procurementPossible !==
      coverage.procurementEvents ||
    coverage.overlapContracts !== reconciliation.overlapCigs.length ||
    coverage.alboOnlyContracts !== reconciliation.alboOnlyCigs.length ||
    coverage.anacOnlyContracts !== reconciliation.anacOnlyCigs.length ||
    coverage.anacAuthorityDiscoveredContracts !==
      reconciliation.anacAuthorityCigs ||
    coverage.authorityRequestedYears !== reconciliation.requestedYears ||
    coverage.authorityCompletedYears !== reconciliation.completedYears ||
    coverage.authorityHistoricalBackfillComplete !==
      reconciliation.historicalBackfillComplete ||
    reconciliation.localCanonicalCigs !== coverage.canonicalContracts ||
    reconciliation.unionCigs !== dataset.contracts.length ||
    reconciliation.unresolvedAlboEvents !== dataset.unresolvedEvents.length ||
    reconciliation.sourceResolutionInvariantSatisfied !== true ||
    coverage.eventCoverageInvariantSatisfied !== true ||
    coverage.resolutionInvariantSatisfied !== true ||
    coverage.unionInvariantSatisfied !== true ||
    dataset.feedStatus?.itemsTotal !== dataset.contracts.length
  ) {
    throw new Error(
      `Multi-source contracts coverage invariants are inconsistent: ${datasetPath}`,
    );
  }

  const localCigs = new Set([
    ...reconciliation.overlapCigs,
    ...reconciliation.alboOnlyCigs,
  ]);
  const authorityCigs = new Set([
    ...reconciliation.overlapCigs,
    ...reconciliation.anacOnlyCigs,
  ]);
  const unionCigs = new Set([...localCigs, ...authorityCigs]);
  if (
    localCigs.size !== reconciliation.localCanonicalCigs ||
    authorityCigs.size !== reconciliation.anacAuthorityCigs ||
    unionCigs.size !== reconciliation.unionCigs ||
    reconciliation.overlapCigs.some(
      (cig) =>
        reconciliation.alboOnlyCigs.includes(cig) ||
        reconciliation.anacOnlyCigs.includes(cig),
    )
  ) {
    throw new Error(
      `Multi-source contracts set reconciliation is inconsistent: ${datasetPath}`,
    );
  }

  const authority = dataset.authorityDiscovery;
  if (
    authority.targetAuthority?.taxId !== reconciliation.authorityTaxId ||
    authority.targetAuthority?.label !== reconciliation.authorityLabel ||
    authority.status !== reconciliation.authorityDiscoveryStatus ||
    authority.generatedAt !== reconciliation.authorityDiscoveryGeneratedAt ||
    !Array.isArray(authority.requestedYears) ||
    !Array.isArray(authority.completedYears) ||
    !Array.isArray(authority.completedPeriods) ||
    !Array.isArray(authority.records) ||
    authority.records.length !== reconciliation.anacAuthorityCigs ||
    authority.requestedYears.length !== reconciliation.requestedYears ||
    authority.completedYears.length !== reconciliation.completedYears
  ) {
    throw new Error(
      `ANAC authority discovery and reconciliation disagree: ${datasetPath}`,
    );
  }

  const eventIds = new Set();
  for (const event of dataset.procurementEvents) {
    if (
      typeof event.eventId !== "string" ||
      !event.eventId ||
      eventIds.has(event.eventId) ||
      !["possible", "confirmed"].includes(event.procurementRelevance) ||
      !Array.isArray(event.cigs) ||
      !Array.isArray(event.contractIdentityCigs) ||
      !Array.isArray(event.relatedCigs) ||
      !Array.isArray(event.contractIds)
    ) {
      throw new Error(`Canonical procurement event is invalid: ${datasetPath}`);
    }
    eventIds.add(event.eventId);

    if (event.resolutionStatus === "unresolved_no_cig") {
      if (
        event.contractIdentityCigs.length !== 0 ||
        event.contractIds.length !== 0
      ) {
        throw new Error(
          `Unresolved procurement event was assigned a contract identity: ${event.eventId}`,
        );
      }
    } else if (event.contractIdentityCigs.length === 0) {
      throw new Error(
        `Resolved procurement event is missing its contract identity: ${event.eventId}`,
      );
    }
  }

  for (const event of dataset.unresolvedEvents) {
    if (
      event.resolutionStatus !== "unresolved_no_cig" ||
      !eventIds.has(event.eventId)
    ) {
      throw new Error(
        `Unresolved-event projection is inconsistent: ${event.eventId ?? "unknown"}`,
      );
    }
  }

  const contractIds = new Set();
  const contractCigs = new Set();
  for (const contract of dataset.contracts) {
    if (
      !Number.isSafeInteger(contract.id) ||
      contract.id <= 0 ||
      contractIds.has(contract.id) ||
      !/^[A-Z0-9]{10}$/u.test(contract.cig ?? "") ||
      contractCigs.has(contract.cig) ||
      !unionCigs.has(contract.cig) ||
      typeof contract.title !== "string" ||
      !contract.title.trim() ||
      typeof contract.amount !== "number" ||
      contract.amount < 0 ||
      contract.withoutMepa !== false ||
      !dataset.storylines[String(contract.id)]
    ) {
      throw new Error(
        `Multi-source contracts dataset contains an invalid contract record: ${datasetPath}`,
      );
    }
    contractIds.add(contract.id);
    contractCigs.add(contract.cig);
  }

  for (const entity of dataset.contractEntities) {
    if (
      typeof entity.canonicalId !== "string" ||
      entity.canonicalId !== `contract:cig:${entity.cig}` ||
      !localCigs.has(entity.cig) ||
      !contractIds.has(entity.id) ||
      !contractCigs.has(entity.cig) ||
      !Array.isArray(entity.eventIds) ||
      entity.eventIds.length === 0 ||
      entity.eventIds.some((eventId) => !eventIds.has(eventId))
    ) {
      throw new Error(
        `Canonical Albo contract entity projection is inconsistent: ${entity.canonicalId ?? "unknown"}`,
      );
    }
  }

  for (const cig of reconciliation.anacOnlyCigs) {
    const contract = dataset.contracts.find(
      (candidate) => candidate.cig === cig,
    );
    const storyline = contract && dataset.storylines[String(contract.id)];
    if (
      !contract ||
      !storyline ||
      !Array.isArray(storyline.timeline) ||
      storyline.timeline.length !== 1 ||
      storyline.timeline[0]?.progressivo !== `ANAC:${cig}` ||
      storyline.timeline[0]?.tipologia !== "Record strutturato ANAC/BDNCP"
    ) {
      throw new Error(
        `ANAC-only contract is missing its explicit discovery provenance: ${cig}`,
      );
    }
  }

  return {
    schemaVersion: dataset.schemaVersion,
    procurementEvents: dataset.procurementEvents.length,
    canonicalAlboContracts: dataset.contractEntities.length,
    multiSourceContracts: dataset.contracts.length,
    anacOnlyContracts: reconciliation.anacOnlyCigs.length,
    unresolvedEvents: dataset.unresolvedEvents.length,
    historicalBackfillComplete: reconciliation.historicalBackfillComplete,
  };
}
