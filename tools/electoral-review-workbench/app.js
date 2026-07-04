const DATA_DIR = "./public/data";
const STORAGE_KEY = "electoral-review-workbench-decisions-civic-first-v1";
const MAX_TASK_CARDS = 700;
const MAX_TABLE_ROWS = 350;
const EXPORT_FIELDS = [
  "decision_id",
  "task_id",
  "decision_scope",
  "selected_access_ids",
  "odonimo_raw",
  "civic_from",
  "civic_to",
  "civic_parity",
  "includes_snc",
  "proposed_section_number",
  "decision_type",
  "decision_confidence",
  "reason",
  "street_register_rule_ids_used",
  "street_register_pages_used",
  "qgis_observation",
  "reviewed_by",
  "review_date",
  "requires_follow_up",
  "coordinate_decision_type",
  "original_lon",
  "original_lat",
  "proposed_lon",
  "proposed_lat",
  "coordinate_decision_confidence",
  "coordinate_reason",
  "exclude_from_geometry",
  "requires_external_coordinate_check",
  "relocation_support_snapshot",
  "notes",
  "evidence_snapshot",
];

const DECISION_TYPES = [
  "assign_civics_to_section",
  "confirm_existing_assignment",
  "keep_unresolved",
  "split_required",
  "needs_external_source",
  "exclude_from_geometry",
  "mark_as_non_residential_or_special",
];

const state = {
  data: {},
  tasks: [],
  filteredTasks: [],
  decisions: {},
  selectedTaskId: "",
  selectedCivicAccessId: "",
  selectedAccessIds: new Set(),
  activeTab: "summary",
  civicFilter: "all",
  dirtySinceExport: false,
  map: null,
  mapMode: "pending",
  osmLayer: null,
  leafletLayers: {},
  fallbackBBox: null,
  showNearby: false,
  showCompeting: false,
  showLabelIntegrity: false,
  relocationDrafts: {},
  relocationPickActive: false,
};

const el = {
  summaryStrip: document.getElementById("summaryStrip"),
  taskCountBadge: document.getElementById("taskCountBadge"),
  taskListMeta: document.getElementById("taskListMeta"),
  taskList: document.getElementById("taskList"),
  taskTitle: document.getElementById("taskTitle"),
  taskBadges: document.getElementById("taskBadges"),
  tabPanel: document.getElementById("tabPanel"),
  mapCanvas: document.getElementById("mapCanvas"),
  fallbackMap: document.getElementById("fallbackMap"),
  mapStatus: document.getElementById("mapStatus"),
  importDecisionFile: document.getElementById("importDecisionFile"),
  importDecisionButton: document.getElementById("importDecisionButton"),
  exportJsonButton: document.getElementById("exportJsonButton"),
  exportCsvButton: document.getElementById("exportCsvButton"),
  filters: {
    search: document.getElementById("searchFilter"),
    taskType: document.getElementById("taskTypeFilter"),
    priority: document.getElementById("priorityFilter"),
    status: document.getElementById("statusFilter"),
    suggestedSection: document.getElementById("suggestedSectionFilter"),
    competingSection: document.getElementById("competingSectionFilter"),
    street: document.getElementById("streetFilter"),
    reason: document.getElementById("reasonFilter"),
    streetEvidence: document.getElementById("streetEvidenceFilter"),
    labelIntegrity: document.getElementById("labelIntegrityFilter"),
    coordinateQuality: document.getElementById("coordinateQualityFilter"),
    coordinateBatch: document.getElementById("coordinateBatchFilter"),
    parity: document.getElementById("parityFilter"),
    decisionType: document.getElementById("decisionTypeFilter"),
    sort: document.getElementById("sortSelect"),
    highOnly: document.getElementById("highOnlyFilter"),
    manyCivics: document.getElementById("manyCivicsFilter"),
    visibleExtent: document.getElementById("visibleExtentFilter"),
    nearBoundary: document.getElementById("nearBoundaryFilter"),
  },
  toggles: {
    osm: document.getElementById("toggleOsm"),
    v3: document.getElementById("toggleV3"),
    v2: document.getElementById("toggleV2"),
    cells: document.getElementById("toggleCells"),
    reviewPoints: document.getElementById("toggleReviewPoints"),
    boundaryPoints: document.getElementById("toggleBoundaryPoints"),
    resolvedPoints: document.getElementById("toggleResolvedPoints"),
    deterministicPoints: document.getElementById("toggleDeterministicPoints"),
    coordinateSuspects: document.getElementById("toggleCoordinateSuspects"),
    labelIntegrity: document.getElementById("toggleLabelIntegrity"),
  },
  zoomSelectedButton: document.getElementById("zoomSelectedButton"),
  showNearbyButton: document.getElementById("showNearbyButton"),
  showCompetingButton: document.getElementById("showCompetingButton"),
};

async function fetchJson(name) {
  const response = await fetch(`${DATA_DIR}/${name}`);
  if (!response.ok) {
    throw new Error(`Could not load ${name}: ${response.status}`);
  }
  return response.json();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function asString(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asNumber(value, fallback = 0) {
  const parsed = Number(asString(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseCoordinate(value) {
  const parsed = Number(asString(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : NaN;
}

function asBool(value) {
  return value === true || value === "true" || value === "1";
}

function numberLabel(value, digits = 0) {
  if (value === "" || value === null || value === undefined) return "";
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return asString(value);
  return parsed.toLocaleString("it-IT", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function titleCase(value) {
  return asString(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function sectionSort(a, b) {
  const na = Number(a);
  const nb = Number(b);
  if (Number.isFinite(na) && Number.isFinite(nb) && na !== nb) return na - nb;
  return asString(a).localeCompare(asString(b), "it");
}

function splitSections(value) {
  return asString(value)
    .replaceAll(",", ";")
    .split(";")
    .map((part) => part.split(":", 1)[0].trim())
    .filter(Boolean);
}

function splitList(value) {
  return asString(value)
    .replaceAll(",", ";")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
}

function civicParity(civic) {
  if (asBool(civic.is_snc) || !asString(civic.civico)) return "snc";
  const match = asString(civic.civico).match(/\d+/);
  if (!match) return "unknown";
  return Number(match[0]) % 2 === 0 ? "even" : "odd";
}

function civicNumeric(civic) {
  const match = asString(civic.civico).match(/\d+/);
  return match ? Number(match[0]) : NaN;
}

function selectedTask() {
  return state.tasks.find((task) => task.task_id === state.selectedTaskId) || null;
}

function taskDecision(taskId) {
  return state.decisions[taskId] || null;
}

function decisionStatus(taskId) {
  const decision = taskDecision(taskId);
  if (!decision) return "undecided";
  return decision.requires_follow_up === true || decision.requires_follow_up === "true" ? "follow_up" : "decided";
}

function loadDecisions() {
  try {
    state.decisions = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    state.decisions = {};
  }
}

function persistDecisions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.decisions));
  state.dirtySinceExport = true;
}

function badge(label, tone = "") {
  return `<span class="badge ${escapeHtml(tone || asString(label).toLowerCase())}">${escapeHtml(label)}</span>`;
}

function taskStatusBadge(taskId) {
  const status = decisionStatus(taskId);
  if (status === "decided") return badge("Decided", "decided");
  if (status === "follow_up") return badge("Follow-up", "follow");
  return badge("Open", "undecided");
}

function evidenceBadge(task) {
  if (task.street_register_match_status === "direct_match") return badge("Direct rule", "strong");
  if (task.street_register_match_status === "multiple_sections") return badge("Multiple rules", "medium");
  if (task.has_street_register_evidence) return badge("Street match", "weak");
  return badge("No rule match", "none");
}

function labelIntegrityBadge(status) {
  const value = asString(status || "ok");
  if (!value || value === "ok") return badge("Label OK", "ok");
  return badge(titleCase(value), value);
}

function coordinateQualityFlag(record) {
  return asString(record?.coordinate_quality_flag || "ok") || "ok";
}

function hasCoordinateSuspect(record) {
  return coordinateQualityFlag(record) !== "ok" || asBool(record?.has_coordinate_suspect);
}

function coordinateQualityBadge(record) {
  const flag = coordinateQualityFlag(record);
  if (flag === "ok") return badge("Coord OK", "ok");
  if (flag === "coordinate_suspect") return badge("Coordinate suspect", "coordinate-suspect");
  return badge(`Coordinate ${titleCase(flag)}`, "coordinate-suspect");
}

function taskByTypeCounts() {
  const counts = {};
  for (const task of state.tasks) {
    counts[task.task_type] = (counts[task.task_type] || 0) + 1;
  }
  return counts;
}

function renderSummaryStrip() {
  const summary = state.data.summary || {};
  const total = state.tasks.length;
  const visible = state.filteredTasks.length;
  const decisions = Object.values(state.decisions).filter((decision) => state.tasks.some((task) => task.task_id === decision.task_id));
  const followUp = decisions.filter((decision) => decision.requires_follow_up === true || decision.requires_follow_up === "true").length;
  const highOpen = state.tasks.filter((task) => task.priority === "high" && decisionStatus(task.task_id) === "undecided").length;
  el.summaryStrip.innerHTML = [
    `<span>${numberLabel(total)} civic tasks</span>`,
    `<span>${numberLabel(visible)} visible</span>`,
    `<span>${numberLabel(decisions.length)} decided</span>`,
    `<span>${numberLabel(highOpen)} high open</span>`,
    `<span>${numberLabel(followUp)} follow-up</span>`,
    `<span>${numberLabel(summary.coordinate_suspect_points || 0)} coordinate suspects</span>`,
    `<span>${numberLabel(summary.coordinate_review_batch_1_rows || 0)} batch 1</span>`,
    `<span>${numberLabel(summary.tasks_with_street_register_evidence)} with street evidence</span>`,
    `<span>${numberLabel(summary.tasks_without_street_register_match)} no street match</span>`,
  ].join("");
}

function populateSelect(select, values, formatter = titleCase) {
  const current = select.value;
  const first = select.querySelector("option[value='']");
  select.innerHTML = "";
  select.appendChild(first || new Option("All", ""));
  for (const value of values) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = formatter(value);
    select.appendChild(option);
  }
  select.value = values.includes(current) ? current : "";
}

function populateFilters() {
  const labelStatuses = [
    "ok",
    "multi_street_task",
    "missing_source_record",
    "coordinate_outlier",
    "street_label_ambiguous",
    "needs_label_review",
  ];
  const coordinateQualityStatuses = [
    "ok",
    "missing_coordinate",
    "outside_boundary",
    "street_context_mismatch",
    "same_street_outlier",
    "isolated_point",
    "implausible_coordinate",
    "possible_xy_swap",
    "needs_manual_coordinate_review",
  ];
  populateSelect(el.filters.taskType, [...new Set(state.tasks.map((task) => task.task_type))].sort(), titleCase);
  populateSelect(el.filters.priority, [...new Set(state.tasks.map((task) => task.priority).filter(Boolean))].sort(), titleCase);
  populateSelect(
    el.filters.suggestedSection,
    [...new Set(state.tasks.map((task) => asString(task.suggested_section_number)).filter(Boolean))].sort(sectionSort),
    asString,
  );
  populateSelect(
    el.filters.competingSection,
    [...new Set(state.tasks.flatMap((task) => asArray(task.competing_sections)).filter(Boolean))].sort(sectionSort),
    asString,
  );
  populateSelect(
    el.filters.street,
    [...new Set(state.tasks.flatMap((task) => asArray(task.involved_streets)).filter(Boolean))].sort((a, b) => a.localeCompare(b, "it")),
    asString,
  );
  populateSelect(
    el.filters.reason,
    [...new Set(state.tasks.map((task) => task.unresolved_reason).filter(Boolean))].sort((a, b) => a.localeCompare(b, "it")),
    titleCase,
  );
  populateSelect(el.filters.decisionType, DECISION_TYPES, titleCase);
  populateSelect(el.filters.labelIntegrity, labelStatuses, titleCase);
  populateSelect(el.filters.coordinateQuality, coordinateQualityStatuses, titleCase);
  populateSelect(
    el.filters.coordinateBatch,
    [...new Set(Object.values(state.data.coordinateReviewBatchByAccess || {}).flat().map((row) => row.review_batch_id).filter(Boolean))].sort(),
    asString,
  );
}

function currentFilters() {
  return {
    search: el.filters.search.value.trim().toLowerCase(),
    taskType: el.filters.taskType.value,
    priority: el.filters.priority.value,
    status: el.filters.status.value,
    suggestedSection: el.filters.suggestedSection.value,
    competingSection: el.filters.competingSection.value,
    street: el.filters.street.value,
    reason: el.filters.reason.value,
    streetEvidence: el.filters.streetEvidence.value,
    labelIntegrity: el.filters.labelIntegrity.value,
    coordinateQuality: el.filters.coordinateQuality.value,
    coordinateBatch: el.filters.coordinateBatch.value,
    parity: el.filters.parity.value,
    decisionType: el.filters.decisionType.value,
    sort: el.filters.sort.value,
    highOnly: el.filters.highOnly.checked,
    manyCivics: el.filters.manyCivics.checked,
    visibleExtent: el.filters.visibleExtent.checked,
    nearBoundary: el.filters.nearBoundary.checked,
  };
}

function bboxIntersectsLeafletBounds(bbox, bounds) {
  if (!bbox || bbox.length !== 4 || !bounds) return false;
  const taskBounds = window.L.latLngBounds(
    [bbox[1], bbox[0]],
    [bbox[3], bbox[2]],
  );
  return bounds.intersects(taskBounds);
}

function taskVisibleInCurrentExtent(task) {
  if (!state.map || typeof window.L === "undefined") return true;
  return bboxIntersectsLeafletBounds(task.map_focus_bbox, state.map.getBounds());
}

function taskHasCoordinateBatch(task, batchId) {
  if (!batchId) return true;
  for (const civic of state.data.civicsByTask[task.task_id] || []) {
    if (coordinateReviewBatchRowsForCivic(civic).some((row) => row.review_batch_id === batchId)) return true;
  }
  return false;
}

function taskMatchesFilters(task, filters) {
  if (filters.taskType && task.task_type !== filters.taskType) return false;
  if (filters.priority && task.priority !== filters.priority) return false;
  if (filters.highOnly && task.priority !== "high") return false;
  if (filters.manyCivics && asNumber(task.civic_count) < 10) return false;
  if (filters.status && decisionStatus(task.task_id) !== filters.status) return false;
  if (filters.suggestedSection && asString(task.suggested_section_number) !== filters.suggestedSection) return false;
  if (filters.competingSection && !asArray(task.competing_sections).includes(filters.competingSection)) return false;
  if (filters.street && !asArray(task.involved_streets).includes(filters.street)) return false;
  if (filters.reason && task.unresolved_reason !== filters.reason) return false;
  if (filters.streetEvidence === "direct" && !task.has_direct_street_register_rule) return false;
  if (filters.streetEvidence === "multiple" && !task.has_multiple_street_register_rules) return false;
  if (filters.streetEvidence === "none" && !task.has_no_street_register_rule) return false;
  if (filters.labelIntegrity && asString(task.label_integrity_status || "ok") !== filters.labelIntegrity) return false;
  if (filters.coordinateQuality && !Object.prototype.hasOwnProperty.call(task.coordinate_quality_flags || {}, filters.coordinateQuality)) return false;
  if (filters.coordinateBatch && !taskHasCoordinateBatch(task, filters.coordinateBatch)) return false;
  if (filters.parity && !Object.prototype.hasOwnProperty.call(task.parity_mix || {}, filters.parity)) return false;
  if (filters.nearBoundary && task.task_type !== "boundary_civic_cluster") return false;
  const decision = taskDecision(task.task_id);
  if (filters.decisionType && (!decision || decision.decision_type !== filters.decisionType)) return false;
  if (filters.visibleExtent && !taskVisibleInCurrentExtent(task)) return false;
  if (!filters.search) return true;
  const haystack = [
    task.task_id,
    task.task_type,
    task.title,
    task.short_description,
    task.why_needs_review,
    task.suggested_section_number,
    asArray(task.competing_sections).join(" "),
    asArray(task.involved_streets).join(" "),
    asArray(task.representative_streets).join(" "),
    asArray(task.civic_values_sample).join(" "),
    asArray(task.representative_census_cells).join(" "),
    task.civic_min,
    task.civic_max,
    task.unresolved_reason,
    task.label_integrity_status,
    task.label_integrity_notes,
    Object.keys(task.coordinate_quality_flags || {}).join(" "),
    (state.data.civicsByTask[task.task_id] || []).flatMap((civic) => coordinateReviewBatchRowsForCivic(civic).map((row) => row.review_batch_id)).join(" "),
    task.coordinate_suspect_count,
    task.notes,
  ].join(" ").toLowerCase();
  return haystack.includes(filters.search);
}

function sortTasks(tasks, sortMode) {
  const priorityRank = { high: 0, medium: 1, low: 2 };
  const strengthRank = { strong: 0, medium: 1, weak: 2, none: 3 };
  const copy = [...tasks];
  copy.sort((a, b) => {
    if (sortMode === "civic_count_desc") return asNumber(b.civic_count) - asNumber(a.civic_count);
    if (sortMode === "evidence_strength") return (strengthRank[a.evidence_strength] ?? 9) - (strengthRank[b.evidence_strength] ?? 9);
    if (sortMode === "direct_rule_first") return Number(!a.has_direct_street_register_rule) - Number(!b.has_direct_street_register_rule);
    if (sortMode === "no_rule_first") return Number(!b.has_no_street_register_rule) - Number(!a.has_no_street_register_rule);
    if (sortMode === "competing_sections_desc") return asArray(b.competing_sections).length - asArray(a.competing_sections).length;
    if (sortMode === "street") return asString(a.street_name_normalised || asArray(a.involved_streets)[0]).localeCompare(asString(b.street_name_normalised || asArray(b.involved_streets)[0]), "it");
    if (sortMode === "suggested_section") return sectionSort(a.suggested_section_number, b.suggested_section_number);
    const priority = (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9);
    if (priority !== 0) return priority;
    return asNumber(b.civic_count) - asNumber(a.civic_count);
  });
  return copy;
}

function applyFilters({ keepSelection = true } = {}) {
  const filters = currentFilters();
  state.filteredTasks = sortTasks(state.tasks.filter((task) => taskMatchesFilters(task, filters)), filters.sort);
  if (!keepSelection || (state.selectedTaskId && !state.filteredTasks.some((task) => task.task_id === state.selectedTaskId))) {
    state.selectedTaskId = state.filteredTasks[0]?.task_id || state.tasks[0]?.task_id || "";
  }
  renderSummaryStrip();
  renderTaskList();
  renderSelectedTask();
  refreshMap();
}

function renderTaskList() {
  const visible = state.filteredTasks.slice(0, MAX_TASK_CARDS);
  const hidden = Math.max(state.filteredTasks.length - visible.length, 0);
  el.taskCountBadge.textContent = numberLabel(state.filteredTasks.length);
  el.taskListMeta.textContent = hidden
    ? `${numberLabel(state.filteredTasks.length)} matching tasks; showing first ${numberLabel(visible.length)}.`
    : `${numberLabel(state.filteredTasks.length)} matching tasks.`;
  el.taskList.innerHTML = visible.map((task) => {
    const selected = task.task_id === state.selectedTaskId ? " selected" : "";
    const streets = asArray(task.involved_streets).slice(0, 2).join(", ");
    return `
      <button class="task-card${selected}" type="button" data-task-id="${escapeHtml(task.task_id)}">
        <span class="task-card-top">
          <strong>${escapeHtml(task.title)}</strong>
          ${taskStatusBadge(task.task_id)}
        </span>
        <span class="task-card-line">${escapeHtml(task.short_description || task.why_needs_review || "")}</span>
        <span class="task-card-meta">
          ${badge(titleCase(task.task_type), "type")}
          ${badge(titleCase(task.priority || "none"), task.priority || "none")}
          ${task.suggested_section_number ? badge(`Sec ${task.suggested_section_number}`, "section") : ""}
          ${evidenceBadge(task)}
          ${labelIntegrityBadge(task.label_integrity_status)}
          ${task.has_coordinate_suspect ? coordinateQualityBadge({ coordinate_quality_flag: "coordinate_suspect" }) : ""}
        </span>
        <span class="task-card-foot">
          <span>${numberLabel(task.civic_count)} civics</span>
          <span>${escapeHtml(streets || task.unresolved_reason || "")}</span>
        </span>
      </button>
    `;
  }).join("");
}

function selectTask(taskId, { zoom = true } = {}) {
  if (!taskId || !state.tasks.some((task) => task.task_id === taskId)) return;
  state.selectedTaskId = taskId;
  state.selectedCivicAccessId = "";
  state.selectedAccessIds = new Set();
  state.showNearby = false;
  state.showCompeting = false;
  renderTaskList();
  renderSelectedTask();
  refreshMap();
  if (zoom) zoomToSelectedTask();
}

function renderSelectedTask() {
  const task = selectedTask();
  if (!task) {
    el.taskTitle.textContent = "No task selected";
    el.taskBadges.innerHTML = "";
    el.tabPanel.innerHTML = `<p class="empty-state">Select a review task.</p>`;
    return;
  }
  el.taskTitle.textContent = task.title;
  el.taskBadges.innerHTML = [
    badge(titleCase(task.task_type), "type"),
    badge(titleCase(task.priority || "none"), task.priority || "none"),
    task.suggested_section_number ? badge(`Suggested ${task.suggested_section_number}`, "section") : "",
    taskStatusBadge(task.task_id),
    evidenceBadge(task),
    labelIntegrityBadge(task.label_integrity_status),
    task.has_coordinate_suspect ? coordinateQualityBadge({ coordinate_quality_flag: "coordinate_suspect" }) : "",
  ].join("");
  renderActiveTab();
}

function factGrid(rows) {
  return `<dl class="fact-grid">${rows
    .filter(([, value]) => value !== "" && value !== undefined && value !== null)
    .map(([key, value]) => `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd></div>`)
    .join("")}</dl>`;
}

function civicStreet(civic) {
  return asString(civic?.odonimo_raw || civic?.ODONIMO || civic?.anncsu_odonimo || civic?.street_name_normalised);
}

function civicNumberLabel(civic) {
  const civicNumber = asString(civic?.civico || civic?.CIVICO);
  const exponent = asString(civic?.esponente || civic?.ESPONENTE);
  if (civicNumber && exponent) return `${civicNumber}/${exponent}`;
  if (civicNumber) return civicNumber;
  return asBool(civic?.is_snc) ? "SNC" : "";
}

function anncsuPointTitle(civic) {
  const stored = asString(civic?.map_popup_title || civic?.anncsu_address_label);
  if (stored) return stored;
  const street = civicStreet(civic);
  const civicNumber = civicNumberLabel(civic);
  if (!street && !civicNumber) return "";
  return `ANNCSU: ${street}${civicNumber ? ` ${civicNumber}` : ""}`.trim();
}

function formatSourceCoords(civic) {
  const lon = asString(civic?.source_coord_lon || civic?.coord_x);
  const lat = asString(civic?.source_coord_lat || civic?.coord_y);
  return lon && lat ? `${lon}, ${lat}` : "";
}

function coordinateFlagsLabel(task) {
  return Object.entries(task.coordinate_quality_flags || {})
    .map(([flag, count]) => `${flag}: ${count}`)
    .join(", ");
}

function distanceMetersBetween(lonA, latA, lonB, latB) {
  if (![lonA, latA, lonB, latB].every(Number.isFinite)) return NaN;
  const radius = 6371008.8;
  const toRad = (value) => value * Math.PI / 180;
  const dLat = toRad(latB - latA);
  const dLon = toRad(lonB - lonA);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(latA)) * Math.cos(toRad(latB)) * Math.sin(dLon / 2) ** 2;
  return 2 * radius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function pointInRing(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = Number(ring[i][0]);
    const yi = Number(ring[i][1]);
    const xj = Number(ring[j][0]);
    const yj = Number(ring[j][1]);
    const intersects = ((yi > lat) !== (yj > lat)) && (lon < ((xj - xi) * (lat - yi)) / ((yj - yi) || 1e-12) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
}

function pointInPolygon(lon, lat, polygon) {
  if (!polygon?.length || !pointInRing(lon, lat, polygon[0])) return false;
  return !polygon.slice(1).some((hole) => pointInRing(lon, lat, hole));
}

function sectionsAtCoordinate(lon, lat) {
  const sections = [];
  for (const feature of state.data.sectionsV3?.features || []) {
    const geometry = feature.geometry || {};
    const coords = geometry.coordinates || [];
    const contains = geometry.type === "Polygon"
      ? pointInPolygon(lon, lat, coords)
      : geometry.type === "MultiPolygon" && coords.some((polygon) => pointInPolygon(lon, lat, polygon));
    if (contains) sections.push(asString(feature.properties?.section_number));
  }
  return [...new Set(sections.filter(Boolean))].sort(sectionSort);
}

function deterministicPointRows(lon, lat, civic) {
  const rows = [];
  const street = civicStreet(civic);
  for (const feature of state.data.deterministicPoints?.features || []) {
    if (feature.geometry?.type !== "Point") continue;
    const [pointLon, pointLat] = feature.geometry.coordinates || [];
    const distance = distanceMetersBetween(lon, lat, parseCoordinate(pointLon), parseCoordinate(pointLat));
    if (!Number.isFinite(distance)) continue;
    const props = feature.properties || {};
    rows.push({
      access_id: asString(props.access_id),
      anncsu_address: anncsuPointTitle(props),
      street_name: civicStreet(props),
      section_number: asString(props.section_number),
      assignment_method: asString(props.assignment_method),
      distance_m: distance,
      same_street: civicStreet(props) === street,
    });
  }
  return rows.sort((a, b) => a.distance_m - b.distance_m);
}

function streetContextSummary(rows, selectedStreet, radiusM = 120) {
  const nearby = rows.filter((row) => row.distance_m <= radiusM && row.street_name);
  const counts = {};
  for (const row of nearby) counts[row.street_name] = (counts[row.street_name] || 0) + 1;
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "it"))[0] || ["", 0];
  const sameStreetCount = nearby.filter((row) => row.street_name === selectedStreet).length;
  return {
    radius_m: radiusM,
    dominant_street: dominant[0],
    dominant_count: dominant[1],
    nearby_count: nearby.length,
    same_street_count: sameStreetCount,
    mismatch: Boolean(dominant[0] && selectedStreet && dominant[0] !== selectedStreet && dominant[1] >= 3 && sameStreetCount === 0),
  };
}

function streetContextLabel(context) {
  if (!context?.nearby_count) return "no nearby validated deterministic civics";
  return `${context.dominant_street || "unknown"} (${context.dominant_count}/${context.nearby_count} within ${context.radius_m} m)`;
}

function streetRegisterLabelsForTask(task, civic) {
  const selectedStreet = civicStreet(civic);
  const rows = state.data.streetEvidenceByTask[task?.task_id || ""] || [];
  const labels = rows
    .filter((row) => !selectedStreet || asString(row.street_name_normalised) === selectedStreet)
    .map((row) => asString(row.street_name_normalised || row.street_name_raw))
    .filter(Boolean);
  return [...new Set(labels)].sort((a, b) => a.localeCompare(b, "it"));
}

function relocationKey(task, civic) {
  return `${task?.task_id || ""}:${asString(civic?.access_id)}`;
}

function relocationDraftFor(task, civic) {
  return state.relocationDrafts[relocationKey(task, civic)] || null;
}

function selectedCoordinateCivic(task) {
  return selectedDebugCivic(task);
}

function coordinateGeocodeCandidatesForCivic(civic) {
  const accessId = asString(civic?.access_id);
  return accessId ? asArray(state.data.coordinateGeocodeCandidatesByAccess?.[accessId]) : [];
}

function coordinateLocalAnchorCandidatesForCivic(civic) {
  const accessId = asString(civic?.access_id);
  return accessId ? asArray(state.data.coordinateLocalAnchorCandidatesByAccess?.[accessId]) : [];
}

function coordinateReviewBatchRowsForCivic(civic) {
  const accessId = asString(civic?.access_id);
  return accessId ? asArray(state.data.coordinateReviewBatchByAccess?.[accessId]) : [];
}

function setRelocationDraft(task, civic, lon, lat, source = "manual") {
  const parsedLon = parseCoordinate(lon);
  const parsedLat = parseCoordinate(lat);
  if (!task || !civic || !Number.isFinite(parsedLon) || !Number.isFinite(parsedLat)) return;
  state.relocationDrafts[relocationKey(task, civic)] = {
    access_id: asString(civic.access_id),
    lon: parsedLon,
    lat: parsedLat,
    source,
    updated_at: new Date().toISOString(),
  };
  updateCoordinateDecisionFields(task, civic);
  renderRelocationSupportPanel(task, civic);
  refreshMap();
}

function clearRelocationDraft(task, civic) {
  if (task && civic) delete state.relocationDrafts[relocationKey(task, civic)];
  updateCoordinateDecisionFields(task, civic, { clearProposed: true });
  renderRelocationSupportPanel(task, civic);
  refreshMap();
}

function relocationSupportModel(task, civic, draft) {
  const originalLon = parseCoordinate(civic?.source_coord_lon || civic?.coord_x);
  const originalLat = parseCoordinate(civic?.source_coord_lat || civic?.coord_y);
  const proposedLon = parseCoordinate(draft?.lon);
  const proposedLat = parseCoordinate(draft?.lat);
  if (!Number.isFinite(proposedLon) || !Number.isFinite(proposedLat)) {
    const originalRows = Number.isFinite(originalLon) && Number.isFinite(originalLat)
      ? deterministicPointRows(originalLon, originalLat, civic)
      : [];
    const originalContext = streetContextSummary(originalRows, civicStreet(civic));
    return {
      has_proposal: false,
      access_id: asString(civic?.access_id),
      anncsu_street: civicStreet(civic),
      original_lon: Number.isFinite(originalLon) ? originalLon : "",
      original_lat: Number.isFinite(originalLat) ? originalLat : "",
      coordinate_quality_flag: coordinateQualityFlag(civic),
      coordinate_suspect_reason: asString(civic?.coordinate_suspect_reason),
      nearest_validated_street_context: asString(civic?.nearest_validated_street_context),
      original_street_context: originalContext,
      original_street_context_label: streetContextLabel(originalContext),
      street_register_labels: streetRegisterLabelsForTask(task, civic),
      coordinate_review_batch: coordinateReviewBatchRowsForCivic(civic),
      external_geocode_candidates: coordinateGeocodeCandidatesForCivic(civic),
      local_anchor_candidates: coordinateLocalAnchorCandidatesForCivic(civic),
    };
  }
  const neighbours = deterministicPointRows(proposedLon, proposedLat, civic);
  const originalNeighbours = Number.isFinite(originalLon) && Number.isFinite(originalLat)
    ? deterministicPointRows(originalLon, originalLat, civic)
    : [];
  const nearest = neighbours.slice(0, 6);
  const sameStreet = neighbours.filter((row) => row.same_street).slice(0, 6);
  const selectedStreet = civicStreet(civic);
  const originalContext = streetContextSummary(originalNeighbours, selectedStreet);
  const proposedContext = streetContextSummary(neighbours, selectedStreet);
  const v3Sections = sectionsAtCoordinate(proposedLon, proposedLat);
  return {
    has_proposal: true,
    access_id: asString(civic?.access_id),
    anncsu_address: anncsuPointTitle(civic),
    anncsu_street: selectedStreet,
    original_lon: originalLon,
    original_lat: originalLat,
    proposed_lon: proposedLon,
    proposed_lat: proposedLat,
    move_distance_m: distanceMetersBetween(originalLon, originalLat, proposedLon, proposedLat),
    v3_candidate_sections_at_proposed_point: v3Sections,
    task_suggested_section: asString(task?.suggested_section_number),
    current_section: asString(civic?.current_section_number || civic?.section_number),
    nearest_validated_street_context: asString(civic?.nearest_validated_street_context),
    original_street_context: originalContext,
    original_street_context_label: streetContextLabel(originalContext),
    proposed_street_context: proposedContext,
    proposed_street_context_label: streetContextLabel(proposedContext),
    street_context_warning: originalContext.mismatch || proposedContext.mismatch
      ? "The civic label and nearby validated ANNCSU street context differ. Treat relocation as a traced coordinate decision, not a raw correction."
      : "",
    street_register_labels: streetRegisterLabelsForTask(task, civic),
    coordinate_review_batch: coordinateReviewBatchRowsForCivic(civic),
    external_geocode_candidates: coordinateGeocodeCandidatesForCivic(civic),
    local_anchor_candidates: coordinateLocalAnchorCandidatesForCivic(civic),
    nearest_deterministic_points: nearest,
    nearest_same_street_deterministic_points: sameStreet,
    support_warning: "Supporto informativo: non modifica ANNCSU raw e non assegna sezioni per prossimita.",
  };
}

function relocationSupportSnapshot(task, civic, draft) {
  return JSON.stringify(relocationSupportModel(task, civic, draft));
}

function renderRelocationRows(rows) {
  if (!rows.length) return `<p class="empty-state">No deterministic support points in the sample.</p>`;
  return renderTable(
    ["anncsu_address", "street_name", "section_number", "distance_m", "assignment_method"],
    rows.map((row) => ({ ...row, distance_m: numberLabel(row.distance_m, 1) })),
  );
}

function renderGeocodeCandidateRows(rows) {
  if (!rows.length) return `<p class="empty-state">No external geocoder candidate was exported for this civic.</p>`;
  return renderTable(
    ["provider", "query_variant", "candidate_status", "provider_confidence", "candidate_has_house_number", "candidate_lon", "candidate_lat", "distance_from_source_m", "candidate_display_name"],
    rows.map((row) => ({
      ...row,
      distance_from_source_m: numberLabel(row.distance_from_source_m, 1),
    })),
  );
}

function renderLocalAnchorCandidateRows(rows) {
  if (!rows.length) return `<p class="empty-state">No local ANNCSU anchor candidate was exported for this civic.</p>`;
  return renderTable(
    ["candidate_method", "candidate_status", "candidate_confidence", "candidate_lon", "candidate_lat", "distance_from_source_m", "anchor_count", "numeric_anchor_count", "candidate_explanation"],
    rows.map((row) => ({
      ...row,
      distance_from_source_m: numberLabel(row.distance_from_source_m, 1),
    })),
  );
}

function renderCoordinateReviewBatchRows(rows) {
  if (!rows.length) return `<p class="empty-state">This civic is not in the coordinate review priority queue.</p>`;
  return renderTable(
    ["review_rank", "review_batch_id", "review_priority_band", "candidate_review_status", "candidate_method", "candidate_confidence", "candidate_lon", "candidate_lat", "distance_from_source_m"],
    rows.map((row) => ({
      ...row,
      distance_from_source_m: numberLabel(row.distance_from_source_m, 1),
    })),
  );
}

function renderRelocationSupportHtml(task, civic, draft) {
  const support = relocationSupportModel(task, civic, draft);
  if (!support.has_proposal) {
    return `
      <div class="support-empty">
        <strong>Relocation support</strong>
        <p>Select a civic, then click "Pick proposed point on map" or type proposed coordinates. Support appears here before export.</p>
        ${factGrid([
          ["Selected access_id", support.access_id],
          ["ANNCSU street", support.anncsu_street],
          ["Coordinate quality", support.coordinate_quality_flag],
          ["Suspect reason", support.coordinate_suspect_reason],
          ["Audit street context", support.nearest_validated_street_context],
          ["Original nearby street context", support.original_street_context_label],
          ["Street-register labels", asArray(support.street_register_labels).join(", ")],
        ])}
        <h4>Local ANNCSU anchor candidates</h4>
        ${renderLocalAnchorCandidateRows(support.local_anchor_candidates)}
        <h4>Coordinate review batch</h4>
        ${renderCoordinateReviewBatchRows(support.coordinate_review_batch)}
        <h4>External geocoder candidates</h4>
        ${renderGeocodeCandidateRows(support.external_geocode_candidates)}
      </div>
    `;
  }
  return `
    <div class="relocation-support-panel">
      <strong>Relocation support</strong>
      ${factGrid([
        ["Selected access_id", support.access_id],
        ["ANNCSU street", support.anncsu_street],
        ["Original lon/lat", `${support.original_lon}, ${support.original_lat}`],
        ["Proposed lon/lat", `${support.proposed_lon.toFixed(7)}, ${support.proposed_lat.toFixed(7)}`],
        ["Move distance", `${numberLabel(support.move_distance_m, 1)} m`],
        ["V3 section at proposed point", support.v3_candidate_sections_at_proposed_point.join(", ") || "none"],
        ["Current/task section", [support.current_section, support.task_suggested_section].filter(Boolean).join(" / ")],
        ["Original nearby street context", support.original_street_context_label],
        ["Proposed nearby street context", support.proposed_street_context_label],
        ["Street-register labels", asArray(support.street_register_labels).join(", ")],
      ])}
      ${support.street_context_warning ? `<p class="coordinate-warning">${escapeHtml(support.street_context_warning)}</p>` : ""}
      <p class="form-note">Supporto informativo: non modifica ANNCSU raw e non assegna sezioni per prossimita.</p>
      <h4>Local ANNCSU anchor candidates</h4>
      ${renderLocalAnchorCandidateRows(support.local_anchor_candidates)}
      <h4>Coordinate review batch</h4>
      ${renderCoordinateReviewBatchRows(support.coordinate_review_batch)}
      <h4>External geocoder candidates</h4>
      ${renderGeocodeCandidateRows(support.external_geocode_candidates)}
      <h4>Nearest deterministic civics</h4>
      ${renderRelocationRows(support.nearest_deterministic_points)}
      <h4>Nearest deterministic civics on same ANNCSU street</h4>
      ${renderRelocationRows(support.nearest_same_street_deterministic_points)}
    </div>
  `;
}

function draftFromForm(form, source = "form") {
  const lon = parseCoordinate(form?.elements?.proposed_lon?.value);
  const lat = parseCoordinate(form?.elements?.proposed_lat?.value);
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
  return { lon, lat, source, updated_at: new Date().toISOString() };
}

function updateCoordinateDecisionFields(task, civic, options = {}) {
  const form = el.tabPanel.querySelector("#decisionForm");
  if (!form || !civic) return;
  form.elements.original_lon.value = asString(civic.source_coord_lon || civic.coord_x);
  form.elements.original_lat.value = asString(civic.source_coord_lat || civic.coord_y);
  if (options.clearProposed) {
    form.elements.proposed_lon.value = "";
    form.elements.proposed_lat.value = "";
    return;
  }
  const draft = relocationDraftFor(task, civic);
  if (!draft) return;
  form.elements.proposed_lon.value = Number(draft.lon).toFixed(7);
  form.elements.proposed_lat.value = Number(draft.lat).toFixed(7);
  if (form.elements.coordinate_decision_type.value === "keep_as_is" && draft.source !== "reset_to_original") {
    form.elements.coordinate_decision_type.value = "manual_coordinate_override";
  }
}

function renderRelocationSupportPanel(task, civic) {
  const panel = el.tabPanel.querySelector("#coordinateRelocationSupport");
  if (!panel) return;
  const draft = civic ? relocationDraftFor(task, civic) : null;
  panel.innerHTML = renderRelocationSupportHtml(task, civic, draft);
}

function syncRelocationDraftFromForm(form, source = "typed") {
  const task = selectedTask();
  const civic = task ? selectedCoordinateCivic(task) : null;
  const lonText = asString(form?.elements?.proposed_lon?.value);
  const latText = asString(form?.elements?.proposed_lat?.value);
  const draft = draftFromForm(form, source);
  if (!task || !civic) return null;
  if (!lonText && !latText) {
    delete state.relocationDrafts[relocationKey(task, civic)];
    renderRelocationSupportPanel(task, civic);
    refreshMap();
    return null;
  }
  if (!draft) {
    renderRelocationSupportPanel(task, civic);
    return null;
  }
  state.relocationDrafts[relocationKey(task, civic)] = {
    access_id: asString(civic.access_id),
    ...draft,
  };
  renderRelocationSupportPanel(task, civic);
  refreshMap();
  return draft;
}

function setMapStatus(message, timeoutMs = 0) {
  el.mapStatus.textContent = message;
  if (timeoutMs > 0) {
    window.setTimeout(() => {
      if (el.mapStatus.textContent === message) el.mapStatus.textContent = "";
    }, timeoutMs);
  }
}

function handleRelocationMapPick(latlng) {
  if (!state.relocationPickActive) return;
  const task = selectedTask();
  const civic = task ? selectedCoordinateCivic(task) : null;
  if (!task || !civic) {
    state.relocationPickActive = false;
    setMapStatus("Select a civic before picking a proposed coordinate.", 2400);
    return;
  }
  state.relocationPickActive = false;
  setRelocationDraft(task, civic, latlng.lng, latlng.lat, "map_click");
  state.activeTab = "decision";
  document.querySelectorAll(".tabs [data-tab]").forEach((item) => {
    item.classList.toggle("active", item.dataset.tab === "decision");
  });
  renderActiveTab();
  setMapStatus("Proposed coordinate captured. Review support evidence before saving.", 2600);
}

function geoFeatureForAccessId(accessId) {
  return state.data.geoFeatureByAccessId?.[asString(accessId)] || null;
}

function taskIdForAccessId(accessId) {
  return state.data.taskIdByAccessId?.[asString(accessId)] || "";
}

function indexGeoJsonByAccessId(...collections) {
  const out = {};
  for (const collection of collections) {
    for (const feature of collection?.features || []) {
      const accessId = asString(feature.properties?.access_id);
      if (accessId && !out[accessId]) out[accessId] = feature;
    }
  }
  return out;
}

function indexTaskIdsByAccessId(civicsByTask) {
  const out = {};
  for (const [taskId, rows] of Object.entries(civicsByTask || {})) {
    for (const row of rows || []) {
      const accessId = asString(row.access_id);
      if (accessId && !out[accessId]) out[accessId] = taskId;
    }
  }
  return out;
}

function selectedDebugCivic(task) {
  const rows = state.data.civicsByTask[task.task_id] || [];
  if (!rows.length) return null;
  if (state.selectedCivicAccessId) {
    const focused = rows.find((row) => asString(row.access_id) === asString(state.selectedCivicAccessId));
    if (focused) return focused;
  }
  const selected = rows.find((row) => state.selectedAccessIds.has(asString(row.access_id)));
  return selected || rows[0];
}

function sourceRecordForCopy(civic, task) {
  return {
    access_id: asString(civic.access_id),
    odonimo_raw: civicStreet(civic),
    localita: asString(civic.localita),
    civico: asString(civic.civico),
    esponente: asString(civic.esponente),
    source_coord_lon: asString(civic.source_coord_lon || civic.coord_x),
    source_coord_lat: asString(civic.source_coord_lat || civic.coord_y),
    current_section_number: asString(civic.current_section_number || civic.section_number),
    suggested_section_number: asString(civic.suggested_section_number || task.suggested_section_number),
    task_id: asString(task.task_id),
    rule_id: asString(civic.rule_id),
    label_integrity_status: asString(civic.label_integrity_status || task.label_integrity_status || "ok"),
    nearest_validated_street_context: asString(civic.nearest_validated_street_context),
    distance_to_nearest_different_street_m: asString(civic.distance_to_nearest_different_street_m),
  };
}

function firstStreetRuleForTask(task, civic) {
  const rows = state.data.streetEvidenceByTask[task.task_id] || [];
  const ruleId = asString(civic?.rule_id);
  return rows.find((row) => ruleId && asString(row.rule_id) === ruleId) || rows[0] || {};
}

function sourceRecordMismatches(civic, task) {
  const mismatches = [];
  const accessId = asString(civic.access_id);
  const geo = geoFeatureForAccessId(accessId);
  const geoProps = geo?.properties || {};
  const geoCoords = geo?.geometry?.coordinates || [];
  const sourceLon = parseCoordinate(civic.source_coord_lon || civic.coord_x);
  const sourceLat = parseCoordinate(civic.source_coord_lat || civic.coord_y);
  const geoLon = parseCoordinate(geoCoords[0]);
  const geoLat = parseCoordinate(geoCoords[1]);

  if (asString(civic.source_record_access_id) && asString(civic.source_record_access_id) !== accessId) {
    mismatches.push("Task payload source_record_access_id differs from access_id.");
  }
  if (!geo) {
    mismatches.push("No GeoJSON feature found for this access_id.");
  } else {
    if (asString(geoProps.access_id) !== accessId) mismatches.push("GeoJSON access_id differs from selected access_id.");
    if (civicStreet(geoProps) && civicStreet(geoProps) !== civicStreet(civic)) mismatches.push("GeoJSON odonimo differs from source payload.");
    if (asString(geoProps.civico || geoProps.CIVICO) && asString(geoProps.civico || geoProps.CIVICO) !== asString(civic.civico)) {
      mismatches.push("GeoJSON civico differs from source payload.");
    }
    if (Number.isFinite(sourceLon) && Number.isFinite(geoLon) && Math.abs(sourceLon - geoLon) > 0.0000015) {
      mismatches.push("GeoJSON longitude differs from source coordinate.");
    }
    if (Number.isFinite(sourceLat) && Number.isFinite(geoLat) && Math.abs(sourceLat - geoLat) > 0.0000015) {
      mismatches.push("GeoJSON latitude differs from source coordinate.");
    }
  }
  if (anncsuPointTitle(civic).toLowerCase().includes(asString(task.title).toLowerCase())) {
    mismatches.push("Marker label appears to reuse the task title.");
  }
  return mismatches;
}

function renderSourceRecordBlock(title, rows) {
  return `
    <section class="source-record-block">
      <h4>${escapeHtml(title)}</h4>
      ${factGrid(rows)}
    </section>
  `;
}

function renderLabelIntegrityPanel(task) {
  const civic = selectedDebugCivic(task);
  if (!civic) return `<div class="source-record-panel"><p class="empty-state">No civic source record for this task.</p></div>`;
  const accessId = asString(civic.access_id);
  const geo = geoFeatureForAccessId(accessId);
  const geoProps = geo?.properties || {};
  const geoCoords = geo?.geometry?.coordinates || [];
  const rule = firstStreetRuleForTask(task, civic);
  const mismatches = sourceRecordMismatches(civic, task);
  const status = asString(civic.label_integrity_status || task.label_integrity_status || "ok");

  return `
    <div class="source-record-panel">
      <div class="source-record-head">
        <div>
          <h3>Source record</h3>
          <p>${escapeHtml(anncsuPointTitle(civic))}</p>
        </div>
        <div class="inline-toolbar">
          <button type="button" data-copy-access-id>Copy access_id</button>
          <button type="button" data-copy-source-record>Copy source record</button>
        </div>
      </div>
      <div class="badge-row">
        ${labelIntegrityBadge(status)}
        ${mismatches.length ? badge(`${mismatches.length} mismatch`, "high") : badge("Debug checks OK", "ok")}
      </div>
      ${mismatches.length ? `<ul class="integrity-list">${mismatches.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
      ${renderSourceRecordBlock("Source CSV values", [
        ["access_id", accessId],
        ["ANNCSU address", `${civicStreet(civic)} ${civicNumberLabel(civic)}`.trim()],
        ["Localita", civic.localita],
        ["Source coords", formatSourceCoords(civic)],
        ["Current section", civic.current_section_number || civic.section_number],
        ["Proposed section", civic.suggested_section_number || task.suggested_section_number],
      ])}
      ${renderSourceRecordBlock("GeoJSON properties", [
        ["access_id", geoProps.access_id],
        ["ANNCSU address", anncsuPointTitle(geoProps)],
        ["Localita", geoProps.localita],
        ["GeoJSON coords", geoCoords.length >= 2 ? `${geoCoords[0]}, ${geoCoords[1]}` : ""],
        ["Section", geoProps.section_number],
        ["Task id", geoProps.task_id],
      ])}
      ${renderSourceRecordBlock("Task payload values", [
        ["Task id", task.task_id],
        ["Task title", task.title],
        ["Heading source", task.heading_source],
        ["Validated civics for heading", task.validated_civic_count],
        ["Multi-street task", asBool(task.is_multi_street_task) ? "yes" : "no"],
        ["Street count", task.street_count],
        ["Representative title", asBool(task.display_title_is_representative) ? "yes" : "no"],
        ["Candidate sections", task.candidate_section_count],
      ])}
      ${renderSourceRecordBlock("Coordinate quality", [
        ["coordinate_quality_flag", civic.coordinate_quality_flag || "ok"],
        ["coordinate_suspect_reason", civic.coordinate_suspect_reason],
        ["nearest_validated_street_context", civic.nearest_validated_street_context],
        ["nearest_validated_street_context_count", civic.nearest_validated_street_context_count],
        ["distance_to_nearest_different_street_m", civic.distance_to_nearest_different_street_m],
        ["suggested_coordinate_action", civic.suggested_coordinate_action],
        ["exclude_from_geometry_candidate", asBool(civic.exclude_from_geometry_candidate) ? "yes" : "no"],
      ])}
      ${renderSourceRecordBlock("Electoral street-register rule", [
        ["rule_id", rule.rule_id || civic.rule_id],
        ["section_number", rule.section_number],
        ["street_rule_raw", rule.street_rule_raw || rule.street_name_raw],
        ["civic_rule_raw", rule.civic_rule_raw],
        ["source_page", rule.source_page],
      ])}
      <p class="source-context-note">OpenStreetMap visual context: OSM \u00e8 solo sfondo visivo.</p>
    </div>
  `;
}

function renderSummaryTab(task) {
  const parityMix = Object.entries(task.parity_mix || {}).map(([key, value]) => `${key}: ${value}`).join(", ");
  const streets = asArray(task.representative_streets?.length ? task.representative_streets : task.involved_streets);
  return `
    ${factGrid([
      ["Task id", task.task_id],
      ["Task type", titleCase(task.task_type)],
      ["Priority", titleCase(task.priority)],
      ["Suggested section", task.suggested_section_number],
      ["Competing sections", asArray(task.competing_sections).join(", ")],
      ["Street register sections", asArray(task.street_register_sections).join(", ")],
      ["Representative census cells", asArray(task.representative_census_cells).join(", ")],
      ["Civics", numberLabel(task.civic_count)],
      ["Civic min", task.civic_min],
      ["Civic max", task.civic_max],
      ["Civic sample", asArray(task.civic_values_sample).join(", ")],
      ["Parity mix", parityMix],
      ["SNC count", task.snc_count],
      ["Heading source", titleCase(task.heading_source || "unknown")],
      ["Validated civics for heading", task.validated_civic_count],
      ["Unvalidated civics", task.unvalidated_civic_count],
      ["Multi-street task", asBool(task.is_multi_street_task) ? "yes" : "no"],
      ["Street count", task.street_count],
      ["Representative title", asBool(task.display_title_is_representative) ? "yes" : "no"],
      ["Civic intervals", task.civic_interval_count],
      ["Candidate section count", task.candidate_section_count],
      ["Label integrity", titleCase(task.label_integrity_status || "ok")],
      ["Coordinate suspects", task.coordinate_suspect_count],
      ["Coordinate flags", coordinateFlagsLabel(task)],
      ["Exclude from geometry candidates", task.exclude_from_geometry_candidate_count],
      ["Reason", titleCase(task.unresolved_reason)],
      ["Evidence strength", titleCase(task.evidence_strength)],
      ["Street-register status", titleCase(task.street_register_match_status)],
    ])}
    <div class="narrative-block">
      ${streets.length ? `<h3>ANNCSU streets in task</h3><ul class="compact-list">${streets.map((street) => `<li>${escapeHtml(street)}</li>`).join("")}</ul>` : ""}
      ${asArray(task.heading_streets).length ? `<h3>Heading built from validated civics</h3><ul class="compact-list">${asArray(task.heading_streets).map((street) => `<li>${escapeHtml(street)}</li>`).join("")}</ul>` : ""}
      ${asArray(task.unvalidated_heading_streets).length ? `<h3>Street labels needing coordinate validation</h3><ul class="compact-list">${asArray(task.unvalidated_heading_streets).map((street) => `<li>${escapeHtml(street)}</li>`).join("")}</ul>` : ""}
      ${asArray(task.street_register_context_streets).length ? `<h3>Street-register labels in evidence</h3><ul class="compact-list">${asArray(task.street_register_context_streets).map((street) => `<li>${escapeHtml(street)}</li>`).join("")}</ul>` : ""}
      <h3>Why it needs review</h3>
      <p>${escapeHtml(task.why_needs_review || "")}</p>
      <h3>Suggested action</h3>
      <p>${escapeHtml(task.suggested_action || "")}</p>
      <h3>Method guardrails</h3>
      <p>ANNCSU address is the source for each point label and coordinate. Electoral street-register rule is the normative source for section assignment. OpenStreetMap visual context: OSM \u00e8 solo sfondo visivo.</p>
      ${task.has_coordinate_suspect ? `<h3>Coordinate caution</h3><p>Coordinate ANNCSU suspect: il civico puo essere corretto come indirizzo ma non affidabile come punto geometrico. La sezione va decisa sullo stradario; la geometria futura puo escludere o correggere il punto solo con decisione tracciata.</p>` : ""}
      ${task.notes ? `<h3>Notes</h3><p>${escapeHtml(task.notes)}</p>` : ""}
      ${task.label_integrity_notes ? `<h3>Label integrity notes</h3><p>${escapeHtml(task.label_integrity_notes)}</p>` : ""}
    </div>
    ${state.showLabelIntegrity ? renderLabelIntegrityPanel(task) : ""}
  `;
}

function currentTaskCivics() {
  return state.data.civicsByTask[state.selectedTaskId] || [];
}

function selectedCivicsForTask() {
  return currentTaskCivics().filter((civic) => state.selectedAccessIds.has(asString(civic.access_id)));
}

function civicMatchesPanelFilter(civic, task) {
  if (state.civicFilter === "unassigned") {
    return !asString(civic.current_section_number || civic.section_number);
  }
  if (state.civicFilter === "competing") {
    const current = asString(civic.current_section_number || civic.section_number);
    const suggested = asString(task.suggested_section_number);
    return current && suggested && current !== suggested;
  }
  return true;
}

function civicRowHtml(civic) {
  const accessId = asString(civic.access_id);
  const checked = state.selectedAccessIds.has(accessId) ? " checked" : "";
  const focused = asString(state.selectedCivicAccessId) === accessId ? " class=\"focused-row\"" : "";
  return `
    <tr data-access-id="${escapeHtml(accessId)}"${focused}>
      <td><input class="civic-select" type="checkbox" data-access-id="${escapeHtml(accessId)}"${checked} /></td>
      <td>${escapeHtml(accessId)}</td>
      <td>${escapeHtml(civicStreet(civic))}</td>
      <td>${escapeHtml(civic.localita)}</td>
      <td>${escapeHtml(civicNumberLabel(civic))}</td>
      <td>${escapeHtml(civicParity(civic))}</td>
      <td>${escapeHtml(formatSourceCoords(civic))}</td>
      <td>${escapeHtml(civic.current_section_number)}</td>
      <td>${escapeHtml(civic.suggested_section_number)}</td>
      <td>${escapeHtml(civic.rule_id)}</td>
      <td>${escapeHtml(civic.label_integrity_status || "ok")}</td>
      <td>${escapeHtml(civic.coordinate_quality_flag || "ok")}</td>
      <td>${escapeHtml(civic.coordinate_suspect_reason)}</td>
      <td>${escapeHtml(civic.nearest_validated_street_context)}</td>
      <td>${escapeHtml(civic.notes)}</td>
    </tr>
  `;
}

function groupedCivicRowsHtml(rows) {
  let currentStreet = "";
  return rows.map((civic) => {
    const street = civicStreet(civic) || "Unknown ANNCSU street";
    const header = street !== currentStreet
      ? `<tr class="street-group-row"><th colspan="15">ANNCSU address: ${escapeHtml(street)}</th></tr>`
      : "";
    currentStreet = street;
    return `${header}${civicRowHtml(civic)}`;
  }).join("");
}

function renderCivicsTab(task) {
  const allRows = currentTaskCivics();
  const rows = allRows.filter((civic) => civicMatchesPanelFilter(civic, task));
  const sortedRows = [...rows].sort((a, b) => {
    const street = civicStreet(a).localeCompare(civicStreet(b), "it");
    if (street !== 0) return street;
    return asNumber(civicNumeric(a), 999999) - asNumber(civicNumeric(b), 999999);
  });
  const limited = sortedRows.slice(0, MAX_TABLE_ROWS);
  const selectedCount = selectedCivicsForTask().length;
  const controls = `
    <div class="inline-toolbar">
      <button class="${state.civicFilter === "all" ? "active" : ""}" type="button" data-civic-filter="all">All</button>
      <button class="${state.civicFilter === "unassigned" ? "active" : ""}" type="button" data-civic-filter="unassigned">Unassigned</button>
      <button class="${state.civicFilter === "competing" ? "active" : ""}" type="button" data-civic-filter="competing">Competing</button>
      <button type="button" data-select-civics="all">Select all</button>
      <button type="button" data-select-civics="even">Even</button>
      <button type="button" data-select-civics="odd">Odd</button>
      <button type="button" data-select-civics="snc">SNC</button>
      <button type="button" data-select-civics="range">Range</button>
      <button type="button" data-select-civics="unassigned">Unassigned</button>
      <button type="button" data-select-civics="competing">Competing</button>
      <button type="button" data-select-civics="clear">Clear</button>
    </div>
    <div class="range-toolbar">
      <label><span>From</span><input id="civicRangeFrom" type="text" inputmode="numeric" /></label>
      <label><span>To</span><input id="civicRangeTo" type="text" inputmode="numeric" /></label>
      <span>${numberLabel(selectedCount)} selected civics</span>
    </div>
  `;
  if (!rows.length) {
    return `${controls}<p class="empty-state">No civics for this filter.</p>`;
  }
  return `
    ${controls}
    <p class="table-note">Showing ${numberLabel(limited.length)} of ${numberLabel(rows.length)} civics. ${escapeHtml(task.civic_range_summary || "")}</p>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Select</th>
            <th>Access id</th>
            <th>ANNCSU street</th>
            <th>Localita</th>
            <th>Civic</th>
            <th>Parity</th>
            <th>Source coords</th>
            <th>Current section</th>
            <th>Suggested section</th>
            <th>Rule id</th>
            <th>Label status</th>
            <th>Coordinate quality</th>
            <th>Coordinate reason</th>
            <th>Nearby validated street</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>${groupedCivicRowsHtml(limited)}</tbody>
      </table>
    </div>
  `;
}

function renderStreetTab(task) {
  const rows = state.data.streetEvidenceByTask[task.task_id] || [];
  if (!rows.length) {
    return `
      <div class="evidence-empty">
        <h3>No clear street-register match</h3>
        <p>The parsed electoral street register has no direct or same-street rule for this task. Keep the task in review unless QGIS/PDF inspection resolves it.</p>
      </div>
    `;
  }
  const pdfPath = state.data.summary?.street_register_pdf || "";
  const fields = [
    "rule_id",
    "section_number",
    "street_name_raw",
    "civic_rule_raw",
    "compatibility_with_task",
    "source_page",
    "extraction_confidence",
    "match_reason",
    "relevance_score",
    "pdf",
  ];
  const enriched = rows.map((row) => ({
    ...row,
    pdf: pdfPath && row.source_page ? `<a href="${escapeHtml(pdfPath)}#page=${escapeHtml(row.source_page)}" target="_blank" rel="noreferrer">Open page ${escapeHtml(row.source_page)}</a>` : "PDF not copied",
  }));
  return `
    <div class="register-status">
      ${evidenceBadge(task)}
      <span>${numberLabel(rows.length)} relevant parsed rules</span>
    </div>
    <p class="table-note">Electoral street-register rule: normative section evidence from the parsed street register. It is separate from the ANNCSU address shown on each civic marker.</p>
    ${renderTable(fields, enriched, null, { allowHtmlFields: new Set(["pdf"]) })}
  `;
}

function renderSectionsTab(task) {
  const rows = state.data.candidateSectionsByTask[task.task_id] || [];
  if (!rows.length) return `<p class="empty-state">No candidate-section summary for this task.</p>`;
  const cards = rows.map((row) => `
    <article class="section-card">
      <div class="section-card-head">
        <strong>Section ${escapeHtml(row.section_number)}</strong>
        <span>${numberLabel(row.civic_support_count)} civics (${numberLabel(asNumber(row.civic_support_share) * 100, 1)}%)</span>
      </div>
      <div class="badge-row">
        ${row.is_suggested ? badge("Suggested", "section") : ""}
        ${row.is_competing ? badge("Competing", "medium") : ""}
        ${row.boundary_warning ? badge("Boundary warning", "high") : ""}
      </div>
      ${factGrid([
        ["Street-register rules", row.street_register_rule_count],
        ["Nearby deterministic points", row.nearby_deterministic_count],
      ])}
    </article>
  `).join("");
  return `<div class="section-grid">${cards}</div>`;
}

function renderNearbyTab(task) {
  const rows = state.data.nearbyByTask[task.task_id] || [];
  if (!rows.length) {
    return `<p class="empty-state">No nearby deterministic sample was exported for this task.</p>`;
  }
  const fields = ["access_id", "odonimo_raw", "civico", "section_number", "assignment_method", "assignment_confidence", "distance_m"];
  return `
    <div class="inline-toolbar">
      <button id="nearbyMapButton" type="button">Show on map</button>
    </div>
    ${renderTable(fields, rows)}
  `;
}

function renderDecisionTab(task) {
  const template = document.getElementById("decisionFormTemplate");
  const wrapper = document.createElement("div");
  wrapper.appendChild(template.content.cloneNode(true));
  const form = wrapper.querySelector("form");
  const decision = taskDecision(task.task_id);
  const coordinateCivic = selectedDebugCivic(task);
  if (decision) {
    for (const [key, value] of Object.entries(decision)) {
      const field = form.elements[key];
      if (!field) continue;
      if (field.type === "checkbox") field.checked = value === true || value === "true";
      else field.value = value ?? "";
    }
  } else {
    form.elements.review_date.valueAsDate = new Date();
    form.elements.proposed_section_number.value = task.suggested_section_number || "";
    form.elements.civic_from.value = task.civic_min || "";
    form.elements.civic_to.value = task.civic_max || "";
    form.elements.includes_snc.checked = asNumber(task.snc_count) > 0;
    if (coordinateCivic) {
      const suspect = hasCoordinateSuspect(coordinateCivic);
      form.elements.coordinate_decision_type.value = suspect ? "flag_coordinate_suspect" : "keep_as_is";
      form.elements.original_lon.value = asString(coordinateCivic.source_coord_lon || coordinateCivic.coord_x);
      form.elements.original_lat.value = asString(coordinateCivic.source_coord_lat || coordinateCivic.coord_y);
      form.elements.coordinate_decision_confidence.value = suspect ? "medium" : "";
      form.elements.coordinate_reason.value = asString(coordinateCivic.coordinate_suspect_reason);
      form.elements.exclude_from_geometry.checked = asBool(coordinateCivic.exclude_from_geometry_candidate);
      form.elements.requires_external_coordinate_check.checked = asString(coordinateCivic.suggested_coordinate_action).includes("external");
    }
  }
  if (coordinateCivic) {
    if (!form.elements.original_lon.value) form.elements.original_lon.value = asString(coordinateCivic.source_coord_lon || coordinateCivic.coord_x);
    if (!form.elements.original_lat.value) form.elements.original_lat.value = asString(coordinateCivic.source_coord_lat || coordinateCivic.coord_y);
    const savedDraft = draftFromForm(form, "saved_decision");
    if (savedDraft && !relocationDraftFor(task, coordinateCivic)) {
      state.relocationDrafts[relocationKey(task, coordinateCivic)] = {
        access_id: asString(coordinateCivic.access_id),
        ...savedDraft,
      };
    }
    const draft = relocationDraftFor(task, coordinateCivic);
    if (draft) {
      form.elements.proposed_lon.value = Number(draft.lon).toFixed(7);
      form.elements.proposed_lat.value = Number(draft.lat).toFixed(7);
    }
    const support = form.querySelector("#coordinateRelocationSupport");
    if (support) support.innerHTML = renderRelocationSupportHtml(task, coordinateCivic, draft || savedDraft);
  }
  return wrapper.innerHTML;
}

function renderProcessTab() {
  const phases = [
    "Review civici",
    "Export decisioni",
    "PR decisioni manuali",
    "Audit decisioni",
    "Generazione V4 candidata",
    "QGIS check V4",
    "Eventuale pubblicazione solo dopo human gate",
  ];
  return `
    <div class="process-panel">
      <ol>
        ${phases.map((phase) => `<li>${escapeHtml(phase)}</li>`).join("")}
      </ol>
      <div class="narrative-block">
        <p>Le celle censuarie sono supporto geometrico.</p>
        <p>ANNCSU address is the source record for every civic marker.</p>
        <p>La decisione primaria riguarda civici, gruppi di civici o regole dello stradario.</p>
        <p>Le decisioni verranno applicate in una futura V4 solo dopo controllo.</p>
        <p>OpenStreetMap visual context: OSM \u00e8 solo sfondo visivo.</p>
        <p>Lo stradario elettorale resta la fonte primaria.</p>
      </div>
    </div>
  `;
}

function renderActiveTab() {
  const task = selectedTask();
  if (!task) return;
  if (state.activeTab === "summary") el.tabPanel.innerHTML = renderSummaryTab(task);
  if (state.activeTab === "civics") el.tabPanel.innerHTML = renderCivicsTab(task);
  if (state.activeTab === "street") el.tabPanel.innerHTML = renderStreetTab(task);
  if (state.activeTab === "sections") el.tabPanel.innerHTML = renderSectionsTab(task);
  if (state.activeTab === "nearby") el.tabPanel.innerHTML = renderNearbyTab(task);
  if (state.activeTab === "process") el.tabPanel.innerHTML = renderProcessTab(task);
  if (state.activeTab === "decision") el.tabPanel.innerHTML = renderDecisionTab(task);
  wireTabPanelEvents();
}

function renderTable(fields, rows, rowAttrs = null, options = {}) {
  const allowHtmlFields = options.allowHtmlFields || new Set();
  const head = fields.map((field) => `<th>${escapeHtml(titleCase(field))}</th>`).join("");
  const body = rows.map((row) => {
    const attrs = rowAttrs ? rowAttrs(row) : "";
    const cells = fields.map((field) => {
      const value = row[field] ?? "";
      return `<td>${allowHtmlFields.has(field) ? value : escapeHtml(value)}</td>`;
    }).join("");
    return `<tr ${attrs}>${cells}</tr>`;
  }).join("");
  return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function decisionSnapshot(task) {
  const selectedCivic = selectedDebugCivic(task);
  const rules = (state.data.streetEvidenceByTask[task.task_id] || []).slice(0, 8).map((row) => ({
    rule_id: row.rule_id,
    section_number: row.section_number,
    source_page: row.source_page,
    compatibility_with_task: row.compatibility_with_task,
    match_reason: row.match_reason,
    relevance_score: row.relevance_score,
  }));
  const candidates = (state.data.candidateSectionsByTask[task.task_id] || []).slice(0, 12);
  return JSON.stringify({
    task_title: task.title,
    task_type: task.task_type,
    evidence_strength: task.evidence_strength,
    street_register_match_status: task.street_register_match_status,
    civic_count: task.civic_count,
    civic_min: task.civic_min,
    civic_max: task.civic_max,
    parity_mix: task.parity_mix,
    coordinate_quality_flags: task.coordinate_quality_flags,
    coordinate_suspect_count: task.coordinate_suspect_count,
    selected_civic_coordinate_quality: selectedCivic ? {
      access_id: selectedCivic.access_id,
      coordinate_quality_flag: selectedCivic.coordinate_quality_flag || "ok",
      coordinate_suspect_reason: selectedCivic.coordinate_suspect_reason || "",
      nearest_validated_street_context: selectedCivic.nearest_validated_street_context || "",
      distance_to_nearest_different_street_m: selectedCivic.distance_to_nearest_different_street_m || "",
      source_coord_lon: selectedCivic.source_coord_lon || selectedCivic.coord_x || "",
      source_coord_lat: selectedCivic.source_coord_lat || selectedCivic.coord_y || "",
      external_geocode_candidates: coordinateGeocodeCandidatesForCivic(selectedCivic).slice(0, 3),
      local_anchor_candidates: coordinateLocalAnchorCandidatesForCivic(selectedCivic).slice(0, 3),
      coordinate_review_batch: coordinateReviewBatchRowsForCivic(selectedCivic).slice(0, 3),
    } : null,
    representative_census_cells: task.representative_census_cells,
    street_rules: rules,
    candidate_sections: candidates,
  });
}

function selectedAccessIdsForDecision(task, data) {
  const scope = asString(data.get("decision_scope"));
  if (scope === "selected_civics") {
    return [...state.selectedAccessIds].sort().join(";");
  }
  if (scope === "civic_range") {
    const from = asNumber(data.get("civic_from"), -Infinity);
    const to = asNumber(data.get("civic_to"), Infinity);
    return currentTaskCivics()
      .filter((civic) => {
        const numeric = civicNumeric(civic);
        return Number.isFinite(numeric) && numeric >= from && numeric <= to;
      })
      .map((civic) => asString(civic.access_id))
      .sort()
      .join(";");
  }
  if (scope === "parity_subset") {
    const parity = asString(data.get("civic_parity"));
    return currentTaskCivics()
      .filter((civic) => parity && civicParity(civic) === parity)
      .map((civic) => asString(civic.access_id))
      .sort()
      .join(";");
  }
  if (scope === "snc_only") {
    return currentTaskCivics()
      .filter((civic) => civicParity(civic) === "snc")
      .map((civic) => asString(civic.access_id))
      .sort()
      .join(";");
  }
  return currentTaskCivics().map((civic) => asString(civic.access_id)).sort().join(";");
}

function saveDecision(event) {
  event.preventDefault();
  const task = selectedTask();
  if (!task) return;
  const form = event.currentTarget;
  const data = new FormData(form);
  const coordinateDecisionType = asString(data.get("coordinate_decision_type"));
  const coordinateCivic = selectedCoordinateCivic(task);
  const typedRelocationDraft = draftFromForm(form, "save_form");
  if (coordinateCivic && typedRelocationDraft) {
    state.relocationDrafts[relocationKey(task, coordinateCivic)] = {
      access_id: asString(coordinateCivic.access_id),
      ...typedRelocationDraft,
    };
  }
  const relocationDraft = coordinateCivic ? relocationDraftFor(task, coordinateCivic) || typedRelocationDraft : null;
  if (
    coordinateDecisionType === "manual_coordinate_override"
    && (!coordinateCivic || !typedRelocationDraft)
  ) {
    window.alert("manual_coordinate_override requires a selected civic plus valid proposed_lon and proposed_lat.");
    return;
  }
  const rules = state.data.streetEvidenceByTask[task.task_id] || [];
  const decision = {
    decision_id: `${task.task_id}:${Date.now()}`,
    task_id: task.task_id,
    decision_scope: asString(data.get("decision_scope")),
    selected_access_ids: selectedAccessIdsForDecision(task, data),
    odonimo_raw: asArray(task.involved_streets).join(";"),
    civic_from: asString(data.get("civic_from")),
    civic_to: asString(data.get("civic_to")),
    civic_parity: asString(data.get("civic_parity")),
    includes_snc: form.elements.includes_snc.checked,
    proposed_section_number: asString(data.get("proposed_section_number")),
    decision_type: asString(data.get("decision_type")),
    decision_confidence: asString(data.get("decision_confidence")),
    reason: asString(data.get("reason")),
    street_register_rule_ids_used: rules.map((row) => row.rule_id).filter(Boolean).join(";"),
    street_register_pages_used: [...new Set(rules.map((row) => row.source_page).filter(Boolean))].join(";"),
    qgis_observation: asString(data.get("qgis_observation")),
    reviewed_by: asString(data.get("reviewed_by")),
    review_date: asString(data.get("review_date")),
    requires_follow_up: form.elements.requires_follow_up.checked,
    coordinate_decision_type: coordinateDecisionType,
    original_lon: asString(data.get("original_lon")),
    original_lat: asString(data.get("original_lat")),
    proposed_lon: asString(data.get("proposed_lon")),
    proposed_lat: asString(data.get("proposed_lat")),
    coordinate_decision_confidence: asString(data.get("coordinate_decision_confidence")),
    coordinate_reason: asString(data.get("coordinate_reason")),
    exclude_from_geometry: form.elements.exclude_from_geometry.checked,
    requires_external_coordinate_check: form.elements.requires_external_coordinate_check.checked,
    relocation_support_snapshot: coordinateCivic ? relocationSupportSnapshot(task, coordinateCivic, relocationDraft) : "",
    notes: asString(data.get("notes")),
    evidence_snapshot: decisionSnapshot(task),
    saved_at: new Date().toISOString(),
  };
  state.decisions[task.task_id] = decision;
  persistDecisions();
  applyFilters();
}

function clearDecision() {
  const task = selectedTask();
  if (!task) return;
  delete state.decisions[task.task_id];
  persistDecisions();
  renderSelectedTask();
  renderTaskList();
  renderSummaryStrip();
}

function setSelectedCivics(mode) {
  const task = selectedTask();
  if (!task) return;
  const rows = currentTaskCivics().filter((civic) => civicMatchesPanelFilter(civic, task));
  if (mode === "clear") {
    state.selectedAccessIds = new Set();
  } else {
    let selected = rows;
    if (mode === "even" || mode === "odd" || mode === "snc") {
      selected = rows.filter((civic) => civicParity(civic) === mode);
    }
    if (mode === "unassigned" || mode === "competing") {
      const previous = state.civicFilter;
      state.civicFilter = mode;
      selected = currentTaskCivics().filter((civic) => civicMatchesPanelFilter(civic, task));
      state.civicFilter = previous;
    }
    if (mode === "range") {
      const from = asNumber(el.tabPanel.querySelector("#civicRangeFrom")?.value, -Infinity);
      const to = asNumber(el.tabPanel.querySelector("#civicRangeTo")?.value, Infinity);
      selected = rows.filter((civic) => {
        const numeric = civicNumeric(civic);
        return Number.isFinite(numeric) && numeric >= from && numeric <= to;
      });
    }
    state.selectedAccessIds = new Set(selected.map((civic) => asString(civic.access_id)).filter(Boolean));
  }
  renderActiveTab();
  refreshMap();
}

function wireTabPanelEvents() {
  const form = el.tabPanel.querySelector("#decisionForm");
  if (form) {
    const task = selectedTask();
    const civic = task ? selectedCoordinateCivic(task) : null;
    form.addEventListener("submit", saveDecision);
    for (const fieldName of ["proposed_lon", "proposed_lat"]) {
      form.elements[fieldName].addEventListener("input", () => syncRelocationDraftFromForm(form, "typed"));
      form.elements[fieldName].addEventListener("change", () => syncRelocationDraftFromForm(form, "typed"));
    }
    form.elements.coordinate_decision_type.addEventListener("change", () => {
      const type = form.elements.coordinate_decision_type.value;
      form.elements.proposed_lon.required = type === "manual_coordinate_override";
      form.elements.proposed_lat.required = type === "manual_coordinate_override";
      if (type === "exclude_from_geometry") form.elements.exclude_from_geometry.checked = true;
      if (type === "needs_external_verification") form.elements.requires_external_coordinate_check.checked = true;
      if (type === "manual_coordinate_override" && !draftFromForm(form)) {
        setMapStatus("Pick a proposed coordinate on the map or type lon/lat before saving.", 3200);
      }
    });
    const pickButton = form.querySelector("[data-coordinate-pick]");
    if (pickButton) {
      pickButton.addEventListener("click", () => {
        if (!task || !civic) {
          setMapStatus("Select a civic before picking a proposed coordinate.", 2600);
          return;
        }
        state.relocationPickActive = true;
        form.elements.coordinate_decision_type.value = "manual_coordinate_override";
        form.elements.proposed_lon.required = true;
        form.elements.proposed_lat.required = true;
        setMapStatus("Click the map where this civic should be reviewed as a proposed coordinate.");
      });
    }
    const useOriginalButton = form.querySelector("[data-coordinate-use-original]");
    if (useOriginalButton) {
      useOriginalButton.addEventListener("click", () => {
        const latlng = civic ? civicLatLng(civic) : null;
        if (!task || !civic || !latlng) return;
        form.elements.coordinate_decision_type.value = "keep_as_is";
        form.elements.proposed_lon.required = false;
        form.elements.proposed_lat.required = false;
        setRelocationDraft(task, civic, latlng[1], latlng[0], "reset_to_original");
      });
    }
    const clearCoordinateButton = form.querySelector("[data-coordinate-clear]");
    if (clearCoordinateButton) {
      clearCoordinateButton.addEventListener("click", () => {
        if (!task || !civic) return;
        state.relocationPickActive = false;
        form.elements.proposed_lon.required = false;
        form.elements.proposed_lat.required = false;
        clearRelocationDraft(task, civic);
      });
    }
  }
  const clearButton = el.tabPanel.querySelector("#clearDecisionButton");
  if (clearButton) clearButton.addEventListener("click", clearDecision);
  for (const button of el.tabPanel.querySelectorAll("[data-civic-filter]")) {
    button.addEventListener("click", () => {
      state.civicFilter = button.dataset.civicFilter;
      renderActiveTab();
    });
  }
  for (const button of el.tabPanel.querySelectorAll("[data-select-civics]")) {
    button.addEventListener("click", () => setSelectedCivics(button.dataset.selectCivics));
  }
  for (const input of el.tabPanel.querySelectorAll(".civic-select")) {
    input.addEventListener("click", (event) => event.stopPropagation());
    input.addEventListener("change", () => {
      if (input.checked) state.selectedAccessIds.add(input.dataset.accessId);
      else state.selectedAccessIds.delete(input.dataset.accessId);
      renderActiveTab();
      refreshMap();
    });
  }
  for (const row of el.tabPanel.querySelectorAll("tr[data-access-id]")) {
    row.addEventListener("click", () => focusCivic(row.dataset.accessId));
  }
  const nearbyButton = el.tabPanel.querySelector("#nearbyMapButton");
  if (nearbyButton) {
    nearbyButton.addEventListener("click", () => {
      state.showNearby = true;
      refreshMap();
    });
  }
  const copyAccessButton = el.tabPanel.querySelector("[data-copy-access-id]");
  if (copyAccessButton) {
    copyAccessButton.addEventListener("click", () => {
      const task = selectedTask();
      const civic = task ? selectedDebugCivic(task) : null;
      if (civic) copyText(asString(civic.access_id));
    });
  }
  const copySourceButton = el.tabPanel.querySelector("[data-copy-source-record]");
  if (copySourceButton) {
    copySourceButton.addEventListener("click", () => {
      const task = selectedTask();
      const civic = task ? selectedDebugCivic(task) : null;
      if (task && civic) copyText(JSON.stringify(sourceRecordForCopy(civic, task), null, 2));
    });
  }
}

async function copyText(value) {
  const text = asString(value);
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "readonly");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
}

function downloadFile(name, mime, content) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportDecision(decision) {
  const row = {};
  for (const field of EXPORT_FIELDS) {
    row[field] = decision[field] ?? "";
  }
  return row;
}

function exportJson() {
  const decisions = Object.values(state.decisions).map(exportDecision);
  const payload = {
    exported_at: new Date().toISOString(),
    source_commit: state.data.summary?.source_commit || "",
    decision_model_version: "civic-first-local-review-v1",
    decision_count: decisions.length,
    decisions,
  };
  downloadFile("electoral_sections_civic_review_decisions_v1.json", "application/json", JSON.stringify(payload, null, 2));
  state.dirtySinceExport = false;
}

function csvEscape(value) {
  const text = asString(value);
  if (/[",\r\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function exportCsv() {
  const rows = Object.values(state.decisions).map((decision) => {
    const exported = exportDecision(decision);
    return EXPORT_FIELDS.map((field) => csvEscape(exported[field])).join(",");
  });
  downloadFile("electoral_sections_civic_review_decisions_v1.csv", "text/csv", `${EXPORT_FIELDS.join(",")}\n${rows.join("\n")}\n`);
  state.dirtySinceExport = false;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted && char === '"' && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (!quoted && char === ",") {
      row.push(cell);
      cell = "";
    } else if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell);
  if (row.some((value) => value !== "")) rows.push(row);
  const [headers = [], ...records] = rows;
  return records.map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ""])));
}

async function importDecisions() {
  const file = el.importDecisionFile.files?.[0];
  if (!file) return;
  const text = await file.text();
  const parsed = file.name.toLowerCase().endsWith(".json") ? JSON.parse(text) : null;
  const rows = parsed ? parsed.decisions || parsed : parseCsv(text);
  for (const row of rows) {
    const taskId = row.task_id || row.review_id;
    if (!taskId) continue;
    state.decisions[taskId] = {
      ...row,
      review_id: row.review_id || taskId,
      task_id: taskId,
      requires_follow_up: row.requires_follow_up === true || asString(row.requires_follow_up).toLowerCase() === "true",
      imported_at: new Date().toISOString(),
    };
  }
  persistDecisions();
  applyFilters();
}

function leafletAvailable() {
  return typeof window.L !== "undefined" && el.mapCanvas;
}

function geoJsonBounds(collection) {
  if (!collection || !collection.features?.length || !leafletAvailable()) return null;
  return window.L.geoJSON(collection).getBounds();
}

function fitInitialMap() {
  if (!state.map) return;
  let bounds = geoJsonBounds(state.data.sectionsV3);
  const cellBounds = geoJsonBounds(state.data.reviewCells);
  if (cellBounds?.isValid()) bounds = bounds?.isValid() ? bounds.extend(cellBounds) : cellBounds;
  if (bounds?.isValid()) state.map.fitBounds(bounds.pad(0.05));
  else state.map.setView([38.96, 16.31], 12);
}

function initMap() {
  if (!leafletAvailable()) {
    state.mapMode = "fallback";
    el.mapCanvas.hidden = true;
    el.fallbackMap.hidden = false;
    renderFallbackMap();
    el.mapStatus.textContent = "Leaflet unavailable; showing local geometry fallback.";
    return;
  }
  state.mapMode = "leaflet";
  el.fallbackMap.hidden = true;
  el.mapCanvas.hidden = false;
  state.map = window.L.map(el.mapCanvas, { preferCanvas: true, zoomControl: true });
  state.osmLayer = window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  });
  if (el.toggles.osm.checked) state.osmLayer.addTo(state.map);
  state.leafletLayers = {
    sectionsV3: window.L.layerGroup().addTo(state.map),
    sectionsV2: window.L.layerGroup(),
    cells: window.L.layerGroup().addTo(state.map),
    reviewPoints: window.L.layerGroup().addTo(state.map),
    resolvedPoints: window.L.layerGroup(),
    deterministicPoints: window.L.layerGroup(),
    coordinateSuspects: window.L.layerGroup().addTo(state.map),
    selected: window.L.layerGroup().addTo(state.map),
    relocation: window.L.layerGroup().addTo(state.map),
    nearby: window.L.layerGroup(),
    competing: window.L.layerGroup(),
  };
  state.map.on("moveend", () => {
    if (el.filters.visibleExtent.checked) applyFilters({ keepSelection: true });
  });
  state.map.on("click", (event) => handleRelocationMapPick(event.latlng));
  fitInitialMap();
  refreshMap();
}

function layerVisible(name) {
  const layer = state.leafletLayers[name];
  return state.map && layer && state.map.hasLayer(layer);
}

function setLayerVisibility(name, visible) {
  const layer = state.leafletLayers[name];
  if (!state.map || !layer) return;
  if (visible && !state.map.hasLayer(layer)) layer.addTo(state.map);
  if (!visible && state.map.hasLayer(layer)) state.map.removeLayer(layer);
}

function popupForProperties(properties) {
  const rows = Object.entries(properties || {})
    .filter(([, value]) => value !== "" && value !== null && value !== undefined)
    .slice(0, 9)
    .map(([key, value]) => `<dt>${escapeHtml(titleCase(key))}</dt><dd>${escapeHtml(value)}</dd>`)
    .join("");
  return `<dl class="popup-facts">${rows}</dl>`;
}

function taskForId(taskId) {
  return state.tasks.find((task) => task.task_id === taskId) || null;
}

function popupForCivic(properties, task = null) {
  const taskRecord = task || taskForId(asString(properties?.task_id));
  const currentSection = asString(properties?.current_section_number || properties?.section_number);
  const proposedSection = asString(properties?.suggested_section_number || taskRecord?.suggested_section_number);
  const rule = taskRecord ? firstStreetRuleForTask(taskRecord, properties) : {};
  const ruleId = asString(properties?.rule_id || rule.rule_id);
  const facts = [
    ["Current section", currentSection],
    ["Proposed section", proposedSection],
    ["Task", taskRecord?.task_id || properties?.task_id],
    ["Electoral street-register rule", ruleId],
    ["Rule section", rule.section_number],
    ["Rule page", rule.source_page],
    ["Source coords", formatSourceCoords(properties)],
    ["Label status", properties?.label_integrity_status || taskRecord?.label_integrity_status || "ok"],
    ["Coordinate quality", properties?.coordinate_quality_flag || "ok"],
    ["Coordinate reason", properties?.coordinate_suspect_reason],
    ["Nearby validated street", properties?.nearest_validated_street_context],
    ["Coordinate action", properties?.suggested_coordinate_action],
  ];
  return `
    <div class="source-popup">
      <strong>${escapeHtml(anncsuPointTitle(properties))}</strong>
      <p class="popup-subtitle">${escapeHtml(asString(properties?.access_id))}</p>
      ${hasCoordinateSuspect(properties) ? `<p class="coordinate-warning">Coordinate ANNCSU suspect: il civico puo essere corretto come indirizzo ma non affidabile come punto geometrico.</p>` : ""}
      ${factGrid(facts)}
      <p class="popup-note">OSM \u00e8 solo sfondo visivo</p>
    </div>
  `;
}

function sectionStyle(feature) {
  const section = asString(feature.properties?.section_number);
  const task = selectedTask();
  const candidates = state.data.candidateSectionsByTask[task?.task_id || ""] || [];
  const selected = candidates.some((row) => asString(row.section_number) === section);
  return {
    color: selected ? "#244f8f" : "#18745f",
    weight: selected ? 3 : 1.4,
    fillOpacity: selected ? 0.16 : 0.08,
    fillColor: selected ? "#7fb0ff" : "#56b696",
  };
}

function v2Style() {
  return { color: "#7955b8", weight: 1.2, fillOpacity: 0, dashArray: "5 5" };
}

function cellStyle(feature) {
  const taskIds = splitList(feature.properties?.review_task_ids);
  const selected = taskIds.includes(state.selectedTaskId);
  return {
    color: selected ? "#a52e2e" : "#b75d1e",
    weight: selected ? 3 : 1.2,
    fillOpacity: selected ? 0.24 : 0.15,
    fillColor: "#f2a35e",
  };
}

function pointColor(feature) {
  if (hasCoordinateSuspect(feature.properties || {})) return "#b13b30";
  const pointType = asString(feature.properties?.point_type);
  if (pointType === "boundary_uncertainty_point") return "#d9573f";
  return "#6d7480";
}

function addGeoJsonLayer(group, collection, options) {
  group.clearLayers();
  window.L.geoJSON(collection, options).addTo(group);
}

function drawLeafletBaseLayers() {
  if (!state.map) return;
  if (el.toggles.osm.checked) {
    if (!state.map.hasLayer(state.osmLayer)) state.osmLayer.addTo(state.map);
  } else if (state.map.hasLayer(state.osmLayer)) {
    state.map.removeLayer(state.osmLayer);
  }
  addGeoJsonLayer(state.leafletLayers.sectionsV3, state.data.sectionsV3, {
    style: sectionStyle,
    onEachFeature: (feature, layer) => {
      layer.bindTooltip(`V3 section ${feature.properties?.section_number || ""}`);
      layer.bindPopup(popupForProperties(feature.properties));
      layer.on("click", () => {
        if (state.relocationPickActive) return;
        selectTaskForSection(feature.properties?.section_number);
      });
    },
  });
  addGeoJsonLayer(state.leafletLayers.sectionsV2, state.data.sectionsV2, {
    style: v2Style,
    onEachFeature: (feature, layer) => layer.bindTooltip(`V2 section ${feature.properties?.section_number || ""}`),
  });
  addGeoJsonLayer(state.leafletLayers.cells, state.data.reviewCells, {
    style: cellStyle,
    onEachFeature: (feature, layer) => {
      layer.bindTooltip(`Cell ${feature.properties?.census_cell_id || ""}`);
      layer.bindPopup(popupForProperties(feature.properties));
      layer.on("click", () => {
        if (state.relocationPickActive) return;
        const taskId = splitList(feature.properties?.review_task_ids)[0];
        if (taskId) selectTask(taskId);
      });
    },
  });
  addGeoJsonLayer(state.leafletLayers.reviewPoints, state.data.reviewPoints, {
    filter: (feature) => {
      const pointType = asString(feature.properties?.point_type);
      if (pointType === "boundary_uncertainty_point" && !el.toggles.boundaryPoints.checked) return false;
      if (pointType !== "boundary_uncertainty_point" && !el.toggles.reviewPoints.checked) return false;
      return true;
    },
    pointToLayer: (feature, latlng) => window.L.circleMarker(latlng, {
      radius: feature.properties?.task_id === state.selectedTaskId ? 7 : 4,
      color: "#ffffff",
      weight: 1,
      fillColor: pointColor(feature),
      fillOpacity: feature.properties?.task_id === state.selectedTaskId ? 0.95 : 0.72,
    }),
    onEachFeature: (feature, layer) => {
      const props = feature.properties || {};
      layer.bindTooltip(`${anncsuPointTitle(props)} sec ${props.section_number || ""}`);
      layer.bindPopup(popupForCivic(props));
      layer.on("click", () => {
        if (state.relocationPickActive) return;
        if (props.task_id) selectTask(props.task_id, { zoom: false });
        if (props.access_id) focusCivic(asString(props.access_id), { zoom: false });
      });
    },
  });
  addGeoJsonLayer(state.leafletLayers.resolvedPoints, state.data.resolvedPoints, {
    pointToLayer: (_feature, latlng) => window.L.circleMarker(latlng, {
      radius: 3,
      color: "#ffffff",
      weight: 0.8,
      fillColor: "#3273a8",
      fillOpacity: 0.55,
    }),
    onEachFeature: (feature, layer) => {
      layer.bindTooltip(`Resolved ${anncsuPointTitle(feature.properties || {})}`);
      layer.bindPopup(popupForCivic(feature.properties || {}));
    },
  });
  addGeoJsonLayer(state.leafletLayers.deterministicPoints, state.data.deterministicPoints, {
    pointToLayer: (_feature, latlng) => window.L.circleMarker(latlng, {
      radius: 2.6,
      color: "#ffffff",
      weight: 0.6,
      fillColor: "#25865f",
      fillOpacity: 0.48,
    }),
    onEachFeature: (feature, layer) => {
      layer.bindTooltip(`${anncsuPointTitle(feature.properties || {})} sec ${feature.properties?.section_number || ""}`);
      layer.bindPopup(popupForCivic(feature.properties || {}));
    },
  });
  addGeoJsonLayer(state.leafletLayers.coordinateSuspects, state.data.coordinateSuspectPoints, {
    pointToLayer: (feature, latlng) => window.L.circleMarker(latlng, {
      radius: feature.properties?.access_id === state.selectedCivicAccessId ? 8 : 5.8,
      color: "#111916",
      weight: 1.4,
      fillColor: "#b13b30",
      fillOpacity: 0.86,
    }),
    onEachFeature: (feature, layer) => {
      const props = feature.properties || {};
      layer.bindTooltip(`${anncsuPointTitle(props)} - ${props.coordinate_quality_flag || "coordinate suspect"}`);
      layer.bindPopup(popupForCivic(props));
      layer.on("click", () => {
        if (state.relocationPickActive) return;
        const taskId = taskIdForAccessId(asString(props.access_id));
        if (taskId) selectTask(taskId, { zoom: false });
        if (props.access_id) focusCivic(asString(props.access_id), { zoom: false });
      });
    },
  });
  setLayerVisibility("sectionsV3", el.toggles.v3.checked);
  setLayerVisibility("sectionsV2", el.toggles.v2.checked);
  setLayerVisibility("cells", el.toggles.cells.checked);
  setLayerVisibility("reviewPoints", el.toggles.reviewPoints.checked || el.toggles.boundaryPoints.checked);
  setLayerVisibility("resolvedPoints", el.toggles.resolvedPoints.checked);
  setLayerVisibility("deterministicPoints", el.toggles.deterministicPoints.checked);
  setLayerVisibility("coordinateSuspects", el.toggles.coordinateSuspects.checked);
}

function selectTaskForSection(sectionNumber) {
  const task = state.tasks.find((item) => {
    if (asString(item.suggested_section_number) === asString(sectionNumber)) return true;
    return asArray(item.competing_sections).includes(asString(sectionNumber));
  });
  if (task) selectTask(task.task_id);
}

function civicLatLng(civic) {
  const lon = parseCoordinate(civic.source_coord_lon || civic.coord_x);
  const lat = parseCoordinate(civic.source_coord_lat || civic.coord_y);
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
  return [lat, lon];
}

function renderRelocationLeaflet(task) {
  const layer = state.leafletLayers.relocation;
  const civic = task ? selectedCoordinateCivic(task) : null;
  const draft = civic ? relocationDraftFor(task, civic) : null;
  if (!layer || !civic || !draft || !Number.isFinite(draft.lon) || !Number.isFinite(draft.lat)) return;
  const proposedLatLng = [draft.lat, draft.lon];
  const originalLatLng = civicLatLng(civic);
  if (originalLatLng) {
    window.L.polyline([originalLatLng, proposedLatLng], {
      color: "#9b3f8f",
      dashArray: "7 7",
      opacity: 0.86,
      weight: 3,
    }).bindTooltip("ANNCSU original to proposed coordinate").addTo(layer);
    window.L.circleMarker(originalLatLng, {
      radius: 6,
      color: "#ffffff",
      fillColor: "#111827",
      fillOpacity: 0.85,
      weight: 1.5,
    }).bindTooltip("Original ANNCSU coordinate").addTo(layer);
  }
  const marker = window.L.marker(proposedLatLng, {
    draggable: true,
    autoPan: true,
    title: "Proposed coordinate override",
  }).addTo(layer);
  marker.bindTooltip("Proposed coordinate override", { permanent: false });
  marker.bindPopup(`
    <div class="source-popup">
      <strong>Proposed coordinate override</strong>
      ${factGrid([
        ["Access ID", civic.access_id],
        ["Proposed lon", Number(draft.lon).toFixed(7)],
        ["Proposed lat", Number(draft.lat).toFixed(7)],
        ["Source", draft.source],
      ])}
      <p class="popup-note">Drag to refine. This does not modify ANNCSU raw.</p>
    </div>
  `);
  marker.on("dragend", (event) => {
    const next = event.target.getLatLng();
    setRelocationDraft(task, civic, next.lng, next.lat, "marker_drag");
    renderActiveTab();
    setMapStatus("Proposed coordinate updated from dragged marker.", 2200);
  });
}

function renderSelectedLeaflet() {
  if (!state.map) return;
  state.leafletLayers.selected.clearLayers();
  state.leafletLayers.relocation.clearLayers();
  state.leafletLayers.nearby.clearLayers();
  state.leafletLayers.competing.clearLayers();
  const task = selectedTask();
  if (!task) return;
  const civics = currentTaskCivics();
  for (const civic of civics) {
    const latlng = civicLatLng(civic);
    if (!latlng) continue;
    const selected = state.selectedAccessIds.has(asString(civic.access_id));
    const focused = asString(civic.access_id) === asString(state.selectedCivicAccessId);
    const marker = window.L.circleMarker(latlng, {
      radius: focused ? 8 : selected ? 6.5 : 5,
      color: focused ? "#111827" : selected ? "#244f8f" : "#ffffff",
      weight: focused || selected ? 2 : 1,
      fillColor: hasCoordinateSuspect(civic) ? "#b13b30" : selected ? "#7fb0ff" : "#f05a45",
      fillOpacity: 0.9,
    });
    marker.bindTooltip(anncsuPointTitle(civic));
    marker.bindPopup(popupForCivic(civic, task));
    marker.on("click", () => focusCivic(civic.access_id, { zoom: false }));
    marker.addTo(state.leafletLayers.selected);
  }
  if (state.showNearby) {
    for (const civic of state.data.nearbyByTask[task.task_id] || []) {
      const latlng = civicLatLng(civic);
      if (!latlng) continue;
      window.L.circleMarker(latlng, {
        radius: 4,
        color: "#ffffff",
        weight: 1,
        fillColor: "#278260",
        fillOpacity: 0.7,
      }).bindTooltip(`${anncsuPointTitle(civic)} sec ${civic.section_number || ""}`).bindPopup(popupForCivic(civic)).addTo(state.leafletLayers.nearby);
    }
    setLayerVisibility("nearby", true);
  } else {
    setLayerVisibility("nearby", false);
  }
  if (state.showCompeting) {
    const candidateSections = new Set((state.data.candidateSectionsByTask[task.task_id] || []).map((row) => asString(row.section_number)));
    const features = {
      type: "FeatureCollection",
      features: (state.data.sectionsV3.features || []).filter((feature) => candidateSections.has(asString(feature.properties?.section_number))),
    };
    window.L.geoJSON(features, {
      style: { color: "#244f8f", weight: 4, fillColor: "#7fb0ff", fillOpacity: 0.18 },
      onEachFeature: (feature, layer) => layer.bindTooltip(`Candidate section ${feature.properties?.section_number || ""}`),
    }).addTo(state.leafletLayers.competing);
    setLayerVisibility("competing", true);
  } else {
    setLayerVisibility("competing", false);
  }
  renderRelocationLeaflet(task);
}

function zoomToSelectedTask() {
  const task = selectedTask();
  if (!task || !task.map_focus_bbox?.length) return;
  if (state.map && typeof window.L !== "undefined") {
    const [minX, minY, maxX, maxY] = task.map_focus_bbox;
    state.map.fitBounds(window.L.latLngBounds([minY, minX], [maxY, maxX]), { padding: [28, 28] });
  } else {
    renderFallbackMap();
  }
}

function focusCivic(accessId, options = {}) {
  state.selectedCivicAccessId = asString(accessId);
  const civic = currentTaskCivics().find((row) => asString(row.access_id) === asString(accessId));
  renderActiveTab();
  refreshMap();
  if (options.zoom === false || !civic || !state.map) return;
  const latlng = civicLatLng(civic);
  if (latlng) state.map.setView(latlng, Math.max(state.map.getZoom(), 18));
}

function refreshMap() {
  if (state.mapMode === "leaflet") {
    drawLeafletBaseLayers();
    renderSelectedLeaflet();
    el.mapStatus.textContent = el.toggles.osm.checked ? "OSM \u00e8 solo sfondo visivo." : "OSM hidden; local geometries remain visible.";
    window.setTimeout(() => { el.mapStatus.textContent = ""; }, 1600);
    return;
  }
  renderFallbackMap();
}

function featureCoordinates(geometry) {
  if (!geometry) return [];
  if (geometry.type === "Point") return [geometry.coordinates];
  if (geometry.type === "MultiPoint" || geometry.type === "LineString") return geometry.coordinates;
  if (geometry.type === "MultiLineString" || geometry.type === "Polygon") return geometry.coordinates.flat(1);
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flat(2);
  return [];
}

function bboxForFeature(feature) {
  const coords = featureCoordinates(feature.geometry);
  if (!coords.length) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of coords) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  if (!Number.isFinite(minX)) return null;
  return { minX, minY, maxX, maxY };
}

function mergeBBox(a, b) {
  if (!a) return b;
  if (!b) return a;
  return {
    minX: Math.min(a.minX, b.minX),
    minY: Math.min(a.minY, b.minY),
    maxX: Math.max(a.maxX, b.maxX),
    maxY: Math.max(a.maxY, b.maxY),
  };
}

function calculateFallbackBBox() {
  let bbox = null;
  for (const collection of [state.data.sectionsV3, state.data.reviewCells, state.data.reviewPoints, state.data.coordinateSuspectPoints]) {
    for (const feature of collection.features || []) bbox = mergeBBox(bbox, bboxForFeature(feature));
  }
  if (!bbox) return null;
  const padX = (bbox.maxX - bbox.minX) * 0.04 || 0.01;
  const padY = (bbox.maxY - bbox.minY) * 0.04 || 0.01;
  return { minX: bbox.minX - padX, minY: bbox.minY - padY, maxX: bbox.maxX + padX, maxY: bbox.maxY + padY };
}

function projectFactory(bbox, width, height) {
  const dx = bbox.maxX - bbox.minX || 1;
  const dy = bbox.maxY - bbox.minY || 1;
  const scale = Math.min(width / dx, height / dy);
  const drawnWidth = dx * scale;
  const drawnHeight = dy * scale;
  const offsetX = (width - drawnWidth) / 2;
  const offsetY = (height - drawnHeight) / 2;
  return ([x, y]) => [offsetX + (x - bbox.minX) * scale, offsetY + (bbox.maxY - y) * scale];
}

function ringPath(ring, project) {
  return ring.map((coord, index) => {
    const [x, y] = project(coord);
    return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ") + " Z";
}

function geometryPath(geometry, project) {
  if (!geometry) return "";
  if (geometry.type === "Polygon") return geometry.coordinates.map((ring) => ringPath(ring, project)).join(" ");
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flatMap((poly) => poly.map((ring) => ringPath(ring, project))).join(" ");
  return "";
}

function renderFallbackMap() {
  const width = 1000;
  const height = 760;
  state.fallbackBBox = state.fallbackBBox || calculateFallbackBBox();
  if (!state.fallbackBBox) {
    el.mapStatus.textContent = "No local map data loaded.";
    return;
  }
  const task = selectedTask();
  const bbox = task?.map_focus_bbox?.length
    ? { minX: task.map_focus_bbox[0], minY: task.map_focus_bbox[1], maxX: task.map_focus_bbox[2], maxY: task.map_focus_bbox[3] }
    : state.fallbackBBox;
  const project = projectFactory(bbox, width, height);
  const paths = [];
  if (el.toggles.v3.checked) {
    for (const feature of state.data.sectionsV3.features || []) {
      const path = geometryPath(feature.geometry, project);
      if (path) paths.push(`<path class="fallback-section" d="${path}"><title>V3 section ${escapeHtml(feature.properties?.section_number || "")}</title></path>`);
    }
  }
  if (el.toggles.cells.checked) {
    for (const feature of state.data.reviewCells.features || []) {
      const selected = splitList(feature.properties?.review_task_ids).includes(state.selectedTaskId);
      const path = geometryPath(feature.geometry, project);
      if (path) paths.push(`<path class="fallback-cell${selected ? " selected" : ""}" d="${path}"></path>`);
    }
  }
  for (const feature of state.data.reviewPoints.features || []) {
    if (!feature.geometry || feature.geometry.type !== "Point") continue;
    if (feature.properties?.task_id !== state.selectedTaskId && !el.toggles.reviewPoints.checked) continue;
    const [x, y] = project(feature.geometry.coordinates);
    const focused = asString(feature.properties?.access_id) === asString(state.selectedCivicAccessId);
    const selected = focused || feature.properties?.task_id === state.selectedTaskId;
    paths.push(`<circle class="fallback-point${selected ? " selected" : ""}${focused ? " focused" : ""}" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${focused ? 7 : selected ? 5 : 2.8}"></circle>`);
  }
  if (el.toggles.coordinateSuspects.checked) {
    for (const feature of state.data.coordinateSuspectPoints.features || []) {
      if (!feature.geometry || feature.geometry.type !== "Point") continue;
      const [x, y] = project(feature.geometry.coordinates);
      const focused = asString(feature.properties?.access_id) === asString(state.selectedCivicAccessId);
      paths.push(`<circle class="fallback-point coordinate-suspect${focused ? " focused" : ""}" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${focused ? 7 : 4.8}"></circle>`);
    }
  }
  const relocationCivic = task ? selectedCoordinateCivic(task) : null;
  const relocationDraft = relocationCivic ? relocationDraftFor(task, relocationCivic) : null;
  if (relocationCivic && relocationDraft && Number.isFinite(relocationDraft.lon) && Number.isFinite(relocationDraft.lat)) {
    const originalLatLng = civicLatLng(relocationCivic);
    const [px, py] = project([relocationDraft.lon, relocationDraft.lat]);
    if (originalLatLng) {
      const [ox, oy] = project([originalLatLng[1], originalLatLng[0]]);
      paths.push(`<line class="fallback-relocation-line" x1="${ox.toFixed(2)}" y1="${oy.toFixed(2)}" x2="${px.toFixed(2)}" y2="${py.toFixed(2)}"></line>`);
    }
    paths.push(`<circle class="fallback-relocation-proposed" cx="${px.toFixed(2)}" cy="${py.toFixed(2)}" r="8"></circle>`);
  }
  el.fallbackMap.setAttribute("viewBox", `0 0 ${width} ${height}`);
  el.fallbackMap.innerHTML = paths.join("");
  el.mapStatus.textContent = "Local geometry fallback. OSM basemap is not active.";
}

function wireEvents() {
  el.taskList.addEventListener("click", (event) => {
    const card = event.target.closest("[data-task-id]");
    if (card) selectTask(card.dataset.taskId);
  });
  for (const filter of Object.values(el.filters)) {
    const eventName = filter.type === "checkbox" || filter.tagName === "SELECT" ? "change" : "input";
    filter.addEventListener(eventName, () => applyFilters({ keepSelection: true }));
  }
  for (const toggle of Object.values(el.toggles)) {
    toggle.addEventListener("change", () => {
      state.showLabelIntegrity = Boolean(el.toggles.labelIntegrity?.checked);
      renderActiveTab();
      refreshMap();
    });
  }
  document.querySelectorAll(".tabs [data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTab = button.dataset.tab;
      document.querySelectorAll(".tabs [data-tab]").forEach((item) => item.classList.toggle("active", item === button));
      renderActiveTab();
    });
  });
  el.zoomSelectedButton.addEventListener("click", zoomToSelectedTask);
  el.showNearbyButton.addEventListener("click", () => {
    state.showNearby = !state.showNearby;
    refreshMap();
  });
  el.showCompetingButton.addEventListener("click", () => {
    state.showCompeting = !state.showCompeting;
    refreshMap();
  });
  el.importDecisionButton.addEventListener("click", importDecisions);
  el.exportJsonButton.addEventListener("click", exportJson);
  el.exportCsvButton.addEventListener("click", exportCsv);
  window.addEventListener("beforeunload", (event) => {
    if (!state.dirtySinceExport) return;
    event.preventDefault();
    event.returnValue = "";
  });
}

async function boot() {
  loadDecisions();
  wireEvents();
  const [
    summary,
    tasks,
    reviewCells,
    sectionsV3,
    sectionsV2,
    reviewPoints,
    resolvedPoints,
    deterministicPoints,
    coordinateSuspectPoints,
    coordinateSuspectRecords,
    civicsByTask,
    streetEvidenceByTask,
    candidateSectionsByTask,
    nearbyByTask,
    coordinateGeocodeCandidatesByAccess,
    coordinateLocalAnchorCandidatesByAccess,
    coordinateReviewBatchByAccess,
  ] = await Promise.all([
    fetchJson("review_summary.json"),
    fetchJson("civic_review_tasks.json"),
    fetchJson("review_cells.geojson"),
    fetchJson("candidate_sections_v3.geojson"),
    fetchJson("candidate_sections_v2.geojson"),
    fetchJson("review_points.geojson"),
    fetchJson("spatially_resolved_points.geojson"),
    fetchJson("deterministic_points_sample.geojson"),
    fetchJson("coordinate_suspect_points.geojson"),
    fetchJson("coordinate_suspect_points.json"),
    fetchJson("civics_by_task.json"),
    fetchJson("street_register_evidence_by_task.json"),
    fetchJson("candidate_sections_by_task.json"),
    fetchJson("nearby_deterministic_by_task.json"),
    fetchJson("coordinate_geocode_candidates_by_access.json"),
    fetchJson("coordinate_local_anchor_candidates_by_access.json"),
    fetchJson("coordinate_review_batch_by_access.json"),
  ]);
  state.data = {
    summary,
    reviewCells,
    sectionsV3,
    sectionsV2,
    reviewPoints,
    resolvedPoints,
    deterministicPoints,
    coordinateSuspectPoints,
    coordinateSuspectRecords,
    civicsByTask,
    streetEvidenceByTask,
    candidateSectionsByTask,
    nearbyByTask,
    coordinateGeocodeCandidatesByAccess,
    coordinateLocalAnchorCandidatesByAccess,
    coordinateReviewBatchByAccess,
    geoFeatureByAccessId: indexGeoJsonByAccessId(reviewPoints, resolvedPoints, deterministicPoints, coordinateSuspectPoints),
    taskIdByAccessId: indexTaskIdsByAccessId(civicsByTask),
  };
  state.tasks = tasks;
  state.filteredTasks = tasks;
  state.selectedTaskId = tasks[0]?.task_id || "";
  populateFilters();
  renderSummaryStrip();
  renderTaskList();
  renderSelectedTask();
  initMap();
}

boot().catch((error) => {
  console.error(error);
  el.summaryStrip.innerHTML = `<span>Dataset load failed</span>`;
  el.mapStatus.textContent = error.message;
});
