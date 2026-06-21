const DATA_DIR = "./public/data";
const STORAGE_KEY = "electoral-review-workbench-decisions-v1";
const MAX_QUEUE_ROWS = 500;
const MAX_CONTEXT_ROWS = 300;
const EXPORT_FIELDS = [
  "review_id",
  "census_cell_id",
  "case_type",
  "current_assignment_method",
  "current_assigned_section",
  "suggested_section_number",
  "proposed_section_number",
  "decision_type",
  "decision_confidence",
  "reason",
  "qgis_observation",
  "reviewed_by",
  "review_date",
  "requires_follow_up",
  "notes",
];

const state = {
  data: {},
  cases: [],
  filteredCases: [],
  filteredIds: new Set(),
  decisions: {},
  selectedCaseId: "",
  activeContextTab: "civics",
  mapBBox: null,
  selectedBBox: null,
};

const el = {
  summaryStrip: document.getElementById("summaryStrip"),
  mapSvg: document.getElementById("mapSvg"),
  mapEmpty: document.getElementById("mapEmpty"),
  caseTitle: document.getElementById("caseTitle"),
  caseFacts: document.getElementById("caseFacts"),
  decisionForm: document.getElementById("decisionForm"),
  clearDecisionButton: document.getElementById("clearDecisionButton"),
  contextTable: document.getElementById("contextTable"),
  queueBody: document.getElementById("queueBody"),
  queueMeta: document.getElementById("queueMeta"),
  caseTypeFilter: document.getElementById("caseTypeFilter"),
  priorityFilter: document.getElementById("priorityFilter"),
  sectionFilter: document.getElementById("sectionFilter"),
  methodFilter: document.getElementById("methodFilter"),
  confidenceFilter: document.getElementById("confidenceFilter"),
  needsReviewFilter: document.getElementById("needsReviewFilter"),
  focusFilter: document.getElementById("focusFilter"),
  decisionFilter: document.getElementById("decisionFilter"),
  involvedSectionFilter: document.getElementById("involvedSectionFilter"),
  searchFilter: document.getElementById("searchFilter"),
  importDecisionFile: document.getElementById("importDecisionFile"),
  importDecisionButton: document.getElementById("importDecisionButton"),
  exportJsonButton: document.getElementById("exportJsonButton"),
  exportCsvButton: document.getElementById("exportCsvButton"),
  tabCivics: document.getElementById("tabCivics"),
  tabRules: document.getElementById("tabRules"),
  toggleV3: document.getElementById("toggleV3"),
  toggleV2: document.getElementById("toggleV2"),
  toggleCells: document.getElementById("toggleCells"),
  toggleReviewPoints: document.getElementById("toggleReviewPoints"),
  toggleResolvedPoints: document.getElementById("toggleResolvedPoints"),
  toggleDeterministicPoints: document.getElementById("toggleDeterministicPoints"),
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

function numberLabel(value, digits = 0) {
  if (value === null || value === undefined || value === "") return "";
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

function loadDecisions() {
  try {
    state.decisions = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    state.decisions = {};
  }
}

function persistDecisions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.decisions));
}

function caseDecision(reviewId) {
  return state.decisions[reviewId] || null;
}

function decisionStatus(reviewId) {
  const decision = caseDecision(reviewId);
  if (!decision) return "undecided";
  if (decision.requires_follow_up === true || decision.requires_follow_up === "true") {
    return "follow_up";
  }
  return "decided";
}

function getCaseLabel(item) {
  if (!item) return "";
  const type = titleCase(item.case_type);
  if (item.case_type === "boundary_uncertainty_point" || item.case_type === "remaining_review_point") {
    return `${type}: ${item.street_name_normalised || item.odonimo_raw || item.review_id}`;
  }
  if (item.case_type === "low_confidence_section") {
    return `${type}: section ${item.section_number || item.suggested_section_number}`;
  }
  return `${type}: ${item.census_cell_id || item.review_id}`;
}

function populateSelect(select, values) {
  for (const value of values) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = titleCase(value);
    select.appendChild(option);
  }
}

function populateFilters() {
  const types = [...new Set(state.cases.map((item) => item.case_type).filter(Boolean))].sort();
  const priorities = [...new Set(state.cases.map((item) => item.priority).filter(Boolean))].sort();
  const methods = [...new Set(state.cases.map((item) => item.current_assignment_method || item.assignment_method).filter(Boolean))].sort();
  const confidences = [...new Set(state.cases.map((item) => item.geometry_confidence || item.assignment_confidence).filter(Boolean))].sort();
  const sections = [...new Set(state.cases.map((item) => asString(item.suggested_section_number || item.section_number)).filter(Boolean))]
    .sort((a, b) => Number(a) - Number(b));
  populateSelect(el.caseTypeFilter, types);
  populateSelect(el.priorityFilter, priorities);
  populateSelect(el.methodFilter, methods);
  populateSelect(el.confidenceFilter, confidences);
  for (const section of sections) {
    const option = document.createElement("option");
    option.value = section;
    option.textContent = section;
    el.sectionFilter.appendChild(option);
  }
}

function selectedFilters() {
  return {
    caseType: el.caseTypeFilter.value,
    priority: el.priorityFilter.value,
    section: el.sectionFilter.value,
    method: el.methodFilter.value,
    confidence: el.confidenceFilter.value,
    needsReview: el.needsReviewFilter.value,
    focus: el.focusFilter.value,
    status: el.decisionFilter.value,
    involvedSection: el.involvedSectionFilter.value.trim(),
    search: el.searchFilter.value.trim().toLowerCase(),
  };
}

function caseMatchesFilters(item, filters) {
  if (filters.caseType && item.case_type !== filters.caseType) return false;
  if (filters.priority && item.priority !== filters.priority) return false;
  const section = asString(item.suggested_section_number || item.section_number);
  if (filters.section && section !== filters.section) return false;
  const method = asString(item.current_assignment_method || item.assignment_method);
  if (filters.method && method !== filters.method) return false;
  const confidence = asString(item.geometry_confidence || item.assignment_confidence);
  if (filters.confidence && confidence !== filters.confidence) return false;
  if (filters.needsReview) {
    const needsReview = item.needs_manual_review === true || item.needs_manual_review === "true";
    if (String(needsReview) !== filters.needsReview) return false;
  }
  if (filters.focus === "conflicts" && item.case_type !== "census_cell_conflict") return false;
  if (filters.focus === "no_assigned" && item.case_type !== "no_assigned_civics") return false;
  if (filters.focus === "boundary" && item.case_type !== "boundary_uncertainty_point") return false;
  const status = decisionStatus(item.review_id);
  if (filters.status && status !== filters.status) return false;
  if (filters.involvedSection) {
    const involved = [
      item.current_assigned_section,
      item.suggested_section_number,
      item.section_number,
      item.competing_sections,
    ]
      .map(asString)
      .join(";")
      .split(/[;,\s]+/)
      .map((value) => value.split(":", 1)[0].trim())
      .filter(Boolean);
    if (!involved.includes(filters.involvedSection)) return false;
  }
  if (!filters.search) return true;
  const searchable = [
    item.review_id,
    item.case_type,
    item.census_cell_id,
    item.street_name_normalised,
    item.odonimo_raw,
    item.problem_type,
    item.competing_sections,
    item.suggested_section_number,
    item.section_number,
    item.notes,
  ]
    .map(asString)
    .join(" ")
    .toLowerCase();
  return searchable.includes(filters.search);
}

function applyFilters() {
  const filters = selectedFilters();
  state.filteredCases = state.cases.filter((item) => caseMatchesFilters(item, filters));
  state.filteredIds = new Set(state.filteredCases.map((item) => item.review_id));
  renderQueue();
  renderSummary();
  renderMap();
}

function reviewStats() {
  const caseIds = new Set(state.cases.map((item) => item.review_id));
  const decisions = Object.values(state.decisions).filter((decision) => caseIds.has(decision.review_id));
  const decidedIds = new Set(decisions.map((decision) => decision.review_id));
  const highPriorityUndecided = state.cases.filter((item) => item.priority === "high" && !decidedIds.has(item.review_id)).length;
  const byType = {};
  const bySection = {};
  for (const decision of decisions) {
    const type = decision.decision_type || "missing";
    byType[type] = (byType[type] || 0) + 1;
    const section = decision.proposed_section_number || decision.suggested_section_number || "none";
    bySection[section] = (bySection[section] || 0) + 1;
  }
  return {
    total: state.cases.length,
    decided: decisions.length,
    undecided: Math.max(state.cases.length - decisions.length, 0),
    highPriorityUndecided,
    followUp: decisions.filter((item) => item.requires_follow_up === true || item.requires_follow_up === "true").length,
    byType,
    bySection,
  };
}

function compactCounts(counts) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "it"))
    .slice(0, 4)
    .map(([key, value]) => `${titleCase(key)}:${numberLabel(value)}`)
    .join(" ");
}

function renderSummary() {
  const summary = state.data.summary || {};
  const stats = reviewStats();
  const visible = state.filteredCases.length;
  el.summaryStrip.innerHTML = [
    `<span>${numberLabel(stats.total)} cases</span>`,
    `<span>${numberLabel(visible)} visible</span>`,
    `<span>${numberLabel(stats.decided)} decided</span>`,
    `<span>${numberLabel(stats.undecided)} undecided</span>`,
    `<span>${numberLabel(stats.highPriorityUndecided)} high priority open</span>`,
    `<span>${numberLabel(stats.followUp)} follow-up</span>`,
    `<span>${numberLabel(summary.census_cell_conflict)} conflict cells</span>`,
    `<span>${numberLabel(summary.no_assigned_civics)} no-civic cells</span>`,
    `<span>${numberLabel(summary.manual_review_sections)} review sections</span>`,
    `<span>${numberLabel(summary.boundary_uncertainty_points)} boundary points</span>`,
    compactCounts(stats.byType) ? `<span>Types ${escapeHtml(compactCounts(stats.byType))}</span>` : "",
    compactCounts(stats.bySection) ? `<span>Sections ${escapeHtml(compactCounts(stats.bySection))}</span>` : "",
  ].join("");
}

function statusBadge(status) {
  if (status === "follow_up") return `<span class="badge follow">Follow-up</span>`;
  if (status === "decided") return `<span class="badge decided">Decided</span>`;
  return `<span class="badge undecided">Undecided</span>`;
}

function priorityBadge(priority) {
  const label = priority || "none";
  return `<span class="badge ${escapeHtml(label)}">${escapeHtml(label)}</span>`;
}

function renderQueue() {
  const visible = state.filteredCases.slice(0, MAX_QUEUE_ROWS);
  el.queueBody.innerHTML = visible
    .map((item) => {
      const status = decisionStatus(item.review_id);
      const selected = item.review_id === state.selectedCaseId ? " selected" : "";
      return `
        <tr class="${selected}" data-review-id="${escapeHtml(item.review_id)}">
          <td>${escapeHtml(item.review_id)}</td>
          <td>${escapeHtml(titleCase(item.case_type))}</td>
          <td>${priorityBadge(item.priority)}</td>
          <td>${escapeHtml(item.suggested_section_number || item.section_number || "")}</td>
          <td>${escapeHtml(item.current_assigned_section || item.section_number || "")}</td>
          <td>${statusBadge(status)}</td>
        </tr>
      `;
    })
    .join("");
  const hidden = Math.max(state.filteredCases.length - visible.length, 0);
  const stats = reviewStats();
  const detail = `Decided ${numberLabel(stats.decided)} / undecided ${numberLabel(stats.undecided)} / high priority open ${numberLabel(stats.highPriorityUndecided)}.`;
  el.queueMeta.textContent = hidden
    ? `${numberLabel(state.filteredCases.length)} matching cases; showing first ${numberLabel(visible.length)}. ${detail}`
    : `${numberLabel(state.filteredCases.length)} matching cases. ${detail}`;
}

function factRows(item) {
  if (!item) return [];
  const hasDominantShare = item.dominant_section_share !== "" && item.dominant_section_share !== undefined && item.dominant_section_share !== null;
  const dominantShare = hasDominantShare ? `${numberLabel(Number(item.dominant_section_share) * 100, 1)}%` : "";
  return [
    ["Review id", item.review_id],
    ["Type", titleCase(item.case_type)],
    ["Priority", item.priority],
    ["Suggested section", item.suggested_section_number || item.section_number],
    ["Current section", item.current_assigned_section || item.section_number],
    ["Method", item.current_assignment_method || item.assignment_method],
    ["Confidence", item.geometry_confidence || item.assignment_confidence],
    ["Needs review", item.needs_manual_review === true ? "yes" : "no"],
    ["Census cell", item.census_cell_id],
    ["Access id", item.access_id],
    ["Street", item.street_name_normalised || item.odonimo_raw],
    ["Civic", [item.civico, item.esponente].filter(Boolean).join("/")],
    ["Competing sections", item.competing_sections],
    ["Dominant share", dominantShare],
    ["Problem", item.problem_summary || item.problem_type],
    ["Notes", item.notes],
  ].filter(([, value]) => value !== "" && value !== undefined && value !== null);
}

function renderCaseDetails() {
  const item = selectedCase();
  if (!item) {
    el.caseTitle.textContent = "No case selected";
    el.caseFacts.innerHTML = "";
    el.contextTable.innerHTML = `<p class="muted">Select a case from the queue or map.</p>`;
    fillDecisionForm(null);
    return;
  }
  el.caseTitle.textContent = getCaseLabel(item);
  el.caseFacts.innerHTML = factRows(item)
    .map(([key, value]) => `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd></div>`)
    .join("");
  fillDecisionForm(caseDecision(item.review_id));
  renderContextTable();
}

function selectedCase() {
  return state.cases.find((item) => item.review_id === state.selectedCaseId) || null;
}

function fillDecisionForm(decision) {
  const form = el.decisionForm;
  form.reset();
  if (!selectedCase()) {
    [...form.elements].forEach((field) => {
      field.disabled = true;
    });
    return;
  }
  [...form.elements].forEach((field) => {
    field.disabled = false;
  });
  if (!decision) {
    form.elements.review_date.valueAsDate = new Date();
    return;
  }
  for (const [key, value] of Object.entries(decision)) {
    if (!form.elements[key]) continue;
    if (form.elements[key].type === "checkbox") {
      form.elements[key].checked = value === true || value === "true";
    } else {
      form.elements[key].value = value ?? "";
    }
  }
}

function saveDecision(event) {
  event.preventDefault();
  const item = selectedCase();
  if (!item) return;
  const data = new FormData(el.decisionForm);
  const decision = {
    review_id: item.review_id,
    census_cell_id: asString(item.census_cell_id),
    case_type: item.case_type,
    current_assignment_method: asString(item.current_assignment_method || item.assignment_method),
    current_assigned_section: asString(item.current_assigned_section || item.section_number),
    suggested_section_number: asString(item.suggested_section_number || item.section_number),
    proposed_section_number: asString(data.get("proposed_section_number")),
    decision_type: asString(data.get("decision_type")),
    decision_confidence: asString(data.get("decision_confidence")),
    reason: asString(data.get("reason")),
    qgis_observation: asString(data.get("qgis_observation")),
    reviewed_by: asString(data.get("reviewed_by")),
    review_date: asString(data.get("review_date")),
    requires_follow_up: el.decisionForm.elements.requires_follow_up.checked,
    notes: asString(data.get("notes")),
    saved_at: new Date().toISOString(),
  };
  state.decisions[item.review_id] = decision;
  persistDecisions();
  applyFilters();
  renderCaseDetails();
}

function clearDecision() {
  const item = selectedCase();
  if (!item) return;
  delete state.decisions[item.review_id];
  persistDecisions();
  fillDecisionForm(null);
  applyFilters();
}

function renderContextTable() {
  const item = selectedCase();
  if (!item) return;
  const rows = state.activeContextTab === "rules"
    ? state.data.rulesByCase[item.review_id] || []
    : state.data.civicsByCase[item.review_id] || [];
  if (!rows.length) {
    el.contextTable.innerHTML = document.getElementById("emptyTableTemplate").innerHTML;
    return;
  }
  const limitedRows = rows.slice(0, MAX_CONTEXT_ROWS);
  const fields = state.activeContextTab === "rules"
    ? ["rule_id", "section_number", "street_name_raw", "civic_rule_raw", "civic_from", "civic_to", "civic_parity", "source_page", "extraction_confidence"]
    : ["access_id", "odonimo_raw", "civico", "esponente", "section_number", "assignment_method", "assignment_confidence", "rule_id", "notes"];
  const head = fields.map((field) => `<th>${escapeHtml(titleCase(field))}</th>`).join("");
  const body = limitedRows
    .map((row) => `<tr>${fields.map((field) => `<td>${escapeHtml(row[field])}</td>`).join("")}</tr>`)
    .join("");
  const foot = rows.length > limitedRows.length
    ? `<p class="muted">Showing ${numberLabel(limitedRows.length)} of ${numberLabel(rows.length)} rows for responsiveness.</p>`
    : "";
  el.contextTable.innerHTML = `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>${foot}`;
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
  for (const coord of coords) {
    const [x, y] = coord;
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
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

function calculateMapBBox() {
  let bbox = null;
  for (const collection of [state.data.sectionsV3, state.data.reviewCells, state.data.reviewPoints]) {
    for (const feature of collection.features || []) {
      bbox = mergeBBox(bbox, bboxForFeature(feature));
    }
  }
  if (!bbox) return null;
  const padX = (bbox.maxX - bbox.minX) * 0.04 || 0.01;
  const padY = (bbox.maxY - bbox.minY) * 0.04 || 0.01;
  return {
    minX: bbox.minX - padX,
    minY: bbox.minY - padY,
    maxX: bbox.maxX + padX,
    maxY: bbox.maxY + padY,
  };
}

function projectFactory(bbox, width, height) {
  const dx = bbox.maxX - bbox.minX || 1;
  const dy = bbox.maxY - bbox.minY || 1;
  const scale = Math.min(width / dx, height / dy);
  const drawnWidth = dx * scale;
  const drawnHeight = dy * scale;
  const offsetX = (width - drawnWidth) / 2;
  const offsetY = (height - drawnHeight) / 2;
  return ([x, y]) => [
    offsetX + (x - bbox.minX) * scale,
    offsetY + (bbox.maxY - y) * scale,
  ];
}

function ringPath(ring, project) {
  return ring
    .map((coord, index) => {
      const [x, y] = project(coord);
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ") + " Z";
}

function geometryPath(geometry, project) {
  if (!geometry) return "";
  if (geometry.type === "Polygon") {
    return geometry.coordinates.map((ring) => ringPath(ring, project)).join(" ");
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.flatMap((poly) => poly.map((ring) => ringPath(ring, project))).join(" ");
  }
  return "";
}

function featureCenter(feature) {
  const bbox = bboxForFeature(feature);
  if (!bbox) return null;
  return [(bbox.minX + bbox.maxX) / 2, (bbox.minY + bbox.maxY) / 2];
}

function pointCaseVisible(feature) {
  const reviewId = feature.properties?.review_id;
  return state.filteredIds.has(reviewId);
}

function cellCaseVisible(feature) {
  const ids = asString(feature.properties?.review_case_ids).split(";").filter(Boolean);
  return ids.some((id) => state.filteredIds.has(id));
}

function sectionCaseVisible(feature) {
  const section = asString(feature.properties?.section_number);
  return state.filteredCases.some((item) => item.case_type === "low_confidence_section" && asString(item.section_number) === section);
}

function renderPathLayer(features, className, project, options = {}) {
  return features
    .map((feature) => {
      const path = geometryPath(feature.geometry, project);
      if (!path) return "";
      const properties = feature.properties || {};
      const reviewId = options.reviewId ? options.reviewId(properties) : "";
      const section = asString(properties.section_number);
      const selected = options.selected ? options.selected(feature) : false;
      const title = options.title ? options.title(properties) : reviewId || section;
      return `<path class="${className}${selected ? " selected" : ""}" d="${path}" data-review-id="${escapeHtml(reviewId)}" data-section="${escapeHtml(section)}"><title>${escapeHtml(title)}</title></path>`;
    })
    .join("");
}

function renderPointLayer(features, className, project, radius, options = {}) {
  return features
    .map((feature) => {
      if (!feature.geometry || feature.geometry.type !== "Point") return "";
      const [x, y] = project(feature.geometry.coordinates);
      const properties = feature.properties || {};
      const reviewId = asString(properties.review_id);
      const selected = reviewId && reviewId === state.selectedCaseId;
      const title = options.title ? options.title(properties) : reviewId;
      return `<circle class="${className}${selected ? " selected" : ""}" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${radius}" data-review-id="${escapeHtml(reviewId)}"><title>${escapeHtml(title)}</title></circle>`;
    })
    .join("");
}

function renderLabels(features, project) {
  return features
    .map((feature) => {
      const center = featureCenter(feature);
      if (!center) return "";
      const [x, y] = project(center);
      const section = asString(feature.properties?.section_number);
      if (!section) return "";
      return `<text class="map-label" x="${x.toFixed(2)}" y="${y.toFixed(2)}">${escapeHtml(section)}</text>`;
    })
    .join("");
}

function selectedFeatureBBox() {
  const item = selectedCase();
  if (!item) return null;
  if (item.case_type === "census_cell_conflict" || item.case_type === "no_assigned_civics") {
    const feature = (state.data.reviewCells.features || []).find((cell) => asString(cell.properties?.review_case_ids).includes(item.review_id));
    return feature ? bboxForFeature(feature) : null;
  }
  if (item.case_type === "low_confidence_section") {
    const feature = (state.data.sectionsV3.features || []).find((section) => asString(section.properties?.section_number) === asString(item.section_number));
    return feature ? bboxForFeature(feature) : null;
  }
  const feature = (state.data.reviewPoints.features || []).find((point) => point.properties?.review_id === item.review_id);
  return feature ? bboxForFeature(feature) : null;
}

function expandedBBox(bbox) {
  if (!bbox) return state.mapBBox;
  const dx = bbox.maxX - bbox.minX || 0.005;
  const dy = bbox.maxY - bbox.minY || 0.005;
  const padX = Math.max(dx * 4, 0.004);
  const padY = Math.max(dy * 4, 0.004);
  return {
    minX: bbox.minX - padX,
    minY: bbox.minY - padY,
    maxX: bbox.maxX + padX,
    maxY: bbox.maxY + padY,
  };
}

function renderMap() {
  const width = 1000;
  const height = 760;
  if (!state.mapBBox) {
    el.mapEmpty.textContent = "No map data loaded";
    el.mapEmpty.hidden = false;
    return;
  }
  const bbox = state.selectedBBox ? expandedBBox(state.selectedBBox) : state.mapBBox;
  const project = projectFactory(bbox, width, height);
  const cells = (state.data.reviewCells.features || []).filter(cellCaseVisible);
  const reviewPoints = (state.data.reviewPoints.features || []).filter(pointCaseVisible);
  const lowSections = (state.data.sectionsV3.features || []).filter(sectionCaseVisible);
  const layers = [];

  if (el.toggleV3.checked) {
    layers.push(renderPathLayer(state.data.sectionsV3.features || [], "map-section-v3", project, {
      selected: (feature) => selectedCase()?.case_type === "low_confidence_section" && asString(feature.properties?.section_number) === asString(selectedCase()?.section_number),
      title: (properties) => `V3 candidate section ${properties.section_number || ""}`,
    }));
    layers.push(renderLabels(state.data.sectionsV3.features || [], project));
  }
  if (el.toggleV2.checked) {
    layers.push(renderPathLayer(state.data.sectionsV2.features || [], "map-section-v2", project, {
      title: (properties) => `V2 reference section ${properties.section_number || ""}`,
    }));
  }
  if (el.toggleCells.checked) {
    layers.push(renderPathLayer(cells, "map-cell", project, {
      reviewId: (properties) => asString(properties.review_case_ids).split(";")[0] || "",
      selected: (feature) => asString(feature.properties?.review_case_ids).includes(state.selectedCaseId),
      title: (properties) => `Cell ${properties.census_cell_id || ""} ${properties.assignment_method || ""}`,
    }));
  }
  if (el.toggleResolvedPoints.checked) {
    layers.push(renderPointLayer(state.data.resolvedPoints.features || [], "map-point resolved", project, 2.6, {
      title: (properties) => `Spatially resolved ${properties.access_id || ""}`,
    }));
  }
  if (el.toggleDeterministicPoints.checked) {
    layers.push(renderPointLayer(state.data.deterministicPoints.features || [], "map-point deterministic", project, 2.2, {
      title: (properties) => `Deterministic civic ${properties.access_id || ""}`,
    }));
  }
  if (el.toggleReviewPoints.checked) {
    layers.push(renderPointLayer(reviewPoints, "map-point", project, 3.2, {
      title: (properties) => `${properties.review_id || ""} ${properties.ODONIMO || ""} ${properties.CIVICO || ""}`,
    }));
  }
  if (lowSections.length && el.toggleV3.checked) {
    layers.push(renderPathLayer(lowSections, "map-cell", project, {
      selected: () => true,
      title: (properties) => `Low confidence section ${properties.section_number || ""}`,
    }));
  }

  el.mapSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  el.mapSvg.innerHTML = layers.join("");
  el.mapEmpty.hidden = false;
  el.mapEmpty.textContent = `${numberLabel(cells.length)} cells and ${numberLabel(reviewPoints.length)} review points visible`;
  setTimeout(() => {
    el.mapEmpty.hidden = true;
  }, 1200);
}

function selectCase(reviewId, options = {}) {
  if (!reviewId || !state.cases.some((item) => item.review_id === reviewId)) return;
  state.selectedCaseId = reviewId;
  state.selectedBBox = options.zoom === false ? state.selectedBBox : selectedFeatureBBox();
  renderQueue();
  renderCaseDetails();
  renderMap();
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
    decision_count: decisions.length,
    decisions,
  };
  downloadFile("electoral_sections_v3_manual_review_decisions.json", "application/json", JSON.stringify(payload, null, 2));
}

function csvEscape(value) {
  const text = asString(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function exportCsv() {
  const rows = Object.values(state.decisions).map((decision) => {
    const exported = exportDecision(decision);
    return EXPORT_FIELDS.map((field) => csvEscape(exported[field])).join(",");
  });
  downloadFile("electoral_sections_v3_manual_review_decisions.csv", "text/csv", `${EXPORT_FIELDS.join(",")}\n${rows.join("\n")}\n`);
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
    if (!row.review_id) continue;
    state.decisions[row.review_id] = {
      ...row,
      requires_follow_up: row.requires_follow_up === true || asString(row.requires_follow_up).toLowerCase() === "true",
      imported_at: new Date().toISOString(),
    };
  }
  persistDecisions();
  applyFilters();
  renderCaseDetails();
}

function wireEvents() {
  for (const element of [
    el.caseTypeFilter,
    el.priorityFilter,
    el.sectionFilter,
    el.methodFilter,
    el.confidenceFilter,
    el.needsReviewFilter,
    el.focusFilter,
    el.decisionFilter,
  ]) {
    element.addEventListener("change", applyFilters);
  }
  el.involvedSectionFilter.addEventListener("input", applyFilters);
  el.searchFilter.addEventListener("input", applyFilters);
  for (const toggle of [el.toggleV3, el.toggleV2, el.toggleCells, el.toggleReviewPoints, el.toggleResolvedPoints, el.toggleDeterministicPoints]) {
    toggle.addEventListener("change", renderMap);
  }
  el.queueBody.addEventListener("click", (event) => {
    const row = event.target.closest("tr[data-review-id]");
    if (row) selectCase(row.dataset.reviewId);
  });
  el.mapSvg.addEventListener("click", (event) => {
    const target = event.target.closest("[data-review-id], [data-section]");
    if (!target) return;
    const reviewId = target.dataset.reviewId;
    if (reviewId) {
      selectCase(reviewId);
      return;
    }
    const section = target.dataset.section;
    const sectionCase = state.cases.find((item) => item.case_type === "low_confidence_section" && asString(item.section_number) === section);
    if (sectionCase) selectCase(sectionCase.review_id);
  });
  el.decisionForm.addEventListener("submit", saveDecision);
  el.clearDecisionButton.addEventListener("click", clearDecision);
  el.importDecisionButton.addEventListener("click", importDecisions);
  el.exportJsonButton.addEventListener("click", exportJson);
  el.exportCsvButton.addEventListener("click", exportCsv);
  el.tabCivics.addEventListener("click", () => {
    state.activeContextTab = "civics";
    el.tabCivics.classList.add("active");
    el.tabRules.classList.remove("active");
    renderContextTable();
  });
  el.tabRules.addEventListener("click", () => {
    state.activeContextTab = "rules";
    el.tabRules.classList.add("active");
    el.tabCivics.classList.remove("active");
    renderContextTable();
  });
}

async function boot() {
  loadDecisions();
  wireEvents();
  const [
    summary,
    cases,
    reviewCells,
    sectionsV3,
    sectionsV2,
    reviewPoints,
    resolvedPoints,
    deterministicPoints,
    civicsByCase,
    rulesByCase,
  ] = await Promise.all([
    fetchJson("review_summary.json"),
    fetchJson("review_cases.json"),
    fetchJson("review_cells.geojson"),
    fetchJson("candidate_sections_v3.geojson"),
    fetchJson("candidate_sections_v2.geojson"),
    fetchJson("review_points.geojson"),
    fetchJson("spatially_resolved_points.geojson"),
    fetchJson("deterministic_points_sample.geojson"),
    fetchJson("civics_by_case.json"),
    fetchJson("street_rules_by_case.json"),
  ]);
  state.data = {
    summary,
    reviewCells,
    sectionsV3,
    sectionsV2,
    reviewPoints,
    resolvedPoints,
    deterministicPoints,
    civicsByCase,
    rulesByCase,
  };
  state.cases = cases;
  state.filteredCases = cases;
  state.filteredIds = new Set(cases.map((item) => item.review_id));
  state.mapBBox = calculateMapBBox();
  populateFilters();
  renderSummary();
  renderQueue();
  renderMap();
  if (cases.length) selectCase(cases[0].review_id);
}

boot().catch((error) => {
  console.error(error);
  el.summaryStrip.innerHTML = `<span>Dataset load failed</span>`;
  el.mapEmpty.hidden = false;
  el.mapEmpty.textContent = error.message;
});
